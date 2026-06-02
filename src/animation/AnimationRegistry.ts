import type { AnimationClip, AnimationFrame, SpriteAnimationSet } from "../types/animation";

const singleFrame = (
  id: string,
  width: number,
  height: number,
  durationMs = 1000,
  loop = true
): AnimationClip => ({
  id,
  loop,
  frames: [{ x: 0, y: 0, width, height, durationMs }]
});

const horizontalFrames = (
  id: string,
  frameWidth: number,
  frameHeight: number,
  frameCount: number,
  durationMs = 160,
  loop = true
): AnimationClip => ({
  id,
  loop,
  frames: Array.from({ length: frameCount }, (_, index): AnimationFrame => ({
    x: index * frameWidth,
    y: 0,
    width: frameWidth,
    height: frameHeight,
    durationMs
  }))
});

export function createSingleFrameAnimationSet(
  imageAssetId: string,
  width = 256,
  height = 256,
  clipId = "idle"
): SpriteAnimationSet {
  return {
    imageAssetId,
    defaultClipId: clipId,
    clips: {
      [clipId]: singleFrame(clipId, width, height)
    }
  };
}

export const animationRegistry = {
  hime_idle: createSingleFrameAnimationSet("hime_idle", 1024, 1536),
  hime_walk: {
    imageAssetId: "hime_walk_sheet",
    defaultClipId: "walk_down",
    clips: {
      idle: singleFrame("idle", 256, 256),
      walk_down: horizontalFrames("walk_down", 256, 256, 4, 150),
      walk_up: horizontalFrames("walk_up", 256, 256, 4, 150),
      walk_left: horizontalFrames("walk_left", 256, 256, 4, 150),
      walk_right: horizontalFrames("walk_right", 256, 256, 4, 150)
    }
  },
  hime_battle: {
    imageAssetId: "hime_battle_sheet",
    defaultClipId: "idle",
    clips: {
      idle: singleFrame("idle", 256, 256),
      attack: { ...horizontalFrames("attack", 256, 256, 4, 110, false), nextClipId: "idle" },
      hurt: { ...horizontalFrames("hurt", 256, 256, 2, 120, false), nextClipId: "idle" },
      victory: horizontalFrames("victory", 256, 256, 4, 180)
    }
  },
  shiro_idle: createSingleFrameAnimationSet("shiro_idle", 1024, 1536),
  shiro_fly: {
    imageAssetId: "shiro_fly_sheet",
    defaultClipId: "idle",
    clips: {
      idle: singleFrame("idle", 256, 256),
      fly: horizontalFrames("fly", 256, 256, 4, 140),
      victory: horizontalFrames("victory", 256, 256, 4, 180)
    }
  },
  enemy_idle_generic: {
    imageAssetId: "placeholder_enemy",
    defaultClipId: "idle",
    clips: {
      idle: singleFrame("idle", 256, 256),
      hurt: { ...horizontalFrames("hurt", 256, 256, 2, 100, false), nextClipId: "idle" },
      vanish: { ...horizontalFrames("vanish", 256, 256, 4, 90, false), nextClipId: "idle" }
    }
  },
  boss_kagemasa: {
    imageAssetId: "boss_kagemasa",
    defaultClipId: "idle",
    clips: {
      idle: singleFrame("idle", 1024, 1536),
      charge: { ...horizontalFrames("charge", 256, 256, 4, 150, false), nextClipId: "idle" },
      special_attack: {
        ...horizontalFrames("special_attack", 256, 256, 4, 110, false),
        nextClipId: "idle"
      },
      seal_break: { ...horizontalFrames("seal_break", 256, 256, 4, 120, false), nextClipId: "idle" }
    }
  }
} satisfies Record<string, SpriteAnimationSet>;

export type AnimationRegistryId = keyof typeof animationRegistry;

export function getAnimationSet(id: AnimationRegistryId): SpriteAnimationSet {
  return animationRegistry[id];
}
