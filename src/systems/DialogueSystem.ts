import { dialogueEvents, getDialogueEvent } from "../data/dialogues";
import type { DialogueEventData, DialogueLine } from "../types/dialogue";
import type { SaveData } from "../types/save";

export class DialogueSystem {
  private activeEvent?: DialogueEventData;
  private lineIndex = 0;
  private finished = false;

  constructor(private readonly events: DialogueEventData[] = dialogueEvents) {}

  start(dialogueId: string, saveData: SaveData): boolean {
    if (!this.canStart(dialogueId, saveData)) {
      return false;
    }

    const event = this.findEvent(dialogueId);
    if (!event) {
      return false;
    }

    this.activeEvent = event;
    this.lineIndex = 0;
    this.finished = false;
    return true;
  }

  next(saveData: SaveData): void {
    if (!this.activeEvent) {
      return;
    }

    if (this.lineIndex < this.activeEvent.lines.length - 1) {
      this.lineIndex += 1;
      return;
    }

    this.close(saveData);
  }

  getCurrentLine(): DialogueLine | undefined {
    return this.activeEvent?.lines[this.lineIndex];
  }

  isActive(): boolean {
    return this.activeEvent !== undefined;
  }

  isFinished(): boolean {
    return this.finished;
  }

  isCurrentLineLast(): boolean {
    if (!this.activeEvent) {
      return true;
    }

    return this.lineIndex >= this.activeEvent.lines.length - 1;
  }

  close(saveData: SaveData): void {
    if (!this.activeEvent) {
      return;
    }

    if (this.activeEvent.setFlagsOnComplete) {
      saveData.flags = {
        ...saveData.flags,
        ...this.activeEvent.setFlagsOnComplete
      };
    }

    this.activeEvent = undefined;
    this.lineIndex = 0;
    this.finished = true;
  }

  canStart(dialogueId: string, saveData: SaveData): boolean {
    const event = this.findEvent(dialogueId);
    if (!event) {
      return false;
    }

    if (event.requiredFlags) {
      for (const [flagId, expectedValue] of Object.entries(event.requiredFlags)) {
        if (saveData.flags[flagId] !== expectedValue) {
          return false;
        }
      }
    }

    if (event.once && this.hasCompletedOnceEvent(event, saveData)) {
      return false;
    }

    return true;
  }

  private findEvent(dialogueId: string): DialogueEventData | undefined {
    return this.events.find((event) => event.id === dialogueId) ?? getDialogueEvent(dialogueId);
  }

  private hasCompletedOnceEvent(event: DialogueEventData, saveData: SaveData): boolean {
    if (saveData.flags[event.id] === true) {
      return true;
    }

    if (!event.setFlagsOnComplete) {
      return false;
    }

    return Object.entries(event.setFlagsOnComplete).every(
      ([flagId, expectedValue]) => saveData.flags[flagId] === expectedValue
    );
  }
}
