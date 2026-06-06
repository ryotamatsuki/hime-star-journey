export type DialogueSpeakerId =
  | "hime"
  | "shiro"
  | "dogo_guide"
  | "yumori_grandma"
  | "system";

export type DialogueLine = {
  speakerId: DialogueSpeakerId;
  speakerName: string;
  portraitAssetId?: string;
  text: string;
};

export type DialogueTriggerType = "auto" | "npc" | "interactable" | "debug";

export type DialogueEventData = {
  id: string;
  triggerType: DialogueTriggerType;
  lines: DialogueLine[];
  requiredFlags?: Record<string, boolean>;
  setFlagsOnComplete?: Record<string, boolean>;
  once?: boolean;
};
