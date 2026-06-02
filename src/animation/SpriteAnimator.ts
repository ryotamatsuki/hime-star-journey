import type { AnimationClip, AnimationFrame, SpriteAnimationSet } from "../types/animation";

export type SpriteRenderOptions = {
  anchorX?: number;
  anchorY?: number;
  scale?: number;
  opacity?: number;
  flipX?: boolean;
  width?: number;
  height?: number;
};

export type SpritePlayOptions = {
  restart?: boolean;
  nextClipId?: string;
};

export class SpriteAnimator {
  private currentClipId: string;
  private frameIndex = 0;
  private frameElapsedMs = 0;
  private finished = false;
  private nextClipId: string | undefined;

  constructor(private readonly animationSet: SpriteAnimationSet, initialClipId?: string) {
    this.currentClipId = initialClipId ?? animationSet.defaultClipId ?? Object.keys(animationSet.clips)[0] ?? "";
  }

  play(clipId: string, options: SpritePlayOptions = {}): void {
    if (!this.animationSet.clips[clipId]) {
      return;
    }

    if (clipId === this.currentClipId && !options.restart) {
      this.nextClipId = options.nextClipId ?? this.nextClipId;
      return;
    }

    this.currentClipId = clipId;
    this.frameIndex = 0;
    this.frameElapsedMs = 0;
    this.finished = false;
    this.nextClipId = options.nextClipId;
  }

  update(deltaTime: number): void {
    const clip = this.getCurrentClip();
    if (!clip || clip.frames.length === 0 || this.finished) {
      return;
    }

    this.frameElapsedMs += deltaTime * 1000;

    while (this.frameElapsedMs >= this.getCurrentFrameDurationMs(clip)) {
      this.frameElapsedMs -= this.getCurrentFrameDurationMs(clip);

      if (this.frameIndex < clip.frames.length - 1) {
        this.frameIndex += 1;
        continue;
      }

      if (clip.loop) {
        this.frameIndex = 0;
        continue;
      }

      this.finishNonLoopClip(clip);
      break;
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    image: CanvasImageSource | undefined,
    x: number,
    y: number,
    options: SpriteRenderOptions = {}
  ): void {
    const frame = this.getCurrentFrame();
    if (!image || !frame) {
      return;
    }

    const scale = options.scale ?? 1;
    const width = options.width ?? frame.width * scale;
    const height = options.height ?? frame.height * scale;
    const anchorX = options.anchorX ?? 0.5;
    const anchorY = options.anchorY ?? 1;
    const drawX = x - width * anchorX;
    const drawY = y - height * anchorY;

    ctx.save();
    ctx.globalAlpha *= options.opacity ?? 1;

    if (options.flipX) {
      ctx.translate(drawX + width / 2, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height, -width / 2, 0, width, height);
    } else {
      ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height, drawX, drawY, width, height);
    }

    ctx.restore();
  }

  getCurrentClipId(): string {
    return this.currentClipId;
  }

  getCurrentClip(): AnimationClip | undefined {
    return this.animationSet.clips[this.currentClipId];
  }

  getCurrentFrame(): AnimationFrame | undefined {
    const clip = this.getCurrentClip();
    return clip?.frames[this.frameIndex] ?? clip?.frames[0];
  }

  isFinished(): boolean {
    return this.finished;
  }

  private finishNonLoopClip(clip: AnimationClip): void {
    const nextClipId = this.nextClipId ?? clip.nextClipId ?? this.animationSet.defaultClipId ?? "idle";

    if (nextClipId !== this.currentClipId && this.animationSet.clips[nextClipId]) {
      this.play(nextClipId, { restart: true });
      return;
    }

    this.frameIndex = Math.max(0, clip.frames.length - 1);
    this.finished = true;
  }

  private getCurrentFrameDurationMs(clip: AnimationClip): number {
    const frame = clip.frames[this.frameIndex] ?? clip.frames[0];
    return Math.max(frame?.durationMs ?? 1, 1);
  }
}
