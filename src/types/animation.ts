export type AnimationFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  durationMs: number;
  frameImageAssetId?: string;
};

export type AnimationClip = {
  id: string;
  loop: boolean;
  frames: AnimationFrame[];
  nextClipId?: string;
};

export type SpriteAnimationSet = {
  imageAssetId: string;
  defaultClipId?: string;
  clips: Record<string, AnimationClip>;
};

export type AnimationState =
  | "idle"
  | "walk_down"
  | "walk_up"
  | "walk_left"
  | "walk_right"
  | "attack"
  | "hurt"
  | "victory"
  | "vanish"
  | "charge"
  | "special_attack"
  | "seal_break";
