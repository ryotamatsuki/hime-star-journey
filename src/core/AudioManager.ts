import type { ScreenId } from "../types/game";

type BgmId = "title" | "dogo" | "castle" | "battle" | "stars" | "notebook";
type SeId = "confirm" | "cancel" | "openNotebook" | "save";

const BGM_PATTERNS: Record<BgmId, number[]> = {
  title: [261.63, 329.63, 392, 329.63],
  dogo: [293.66, 349.23, 440, 349.23],
  castle: [220, 293.66, 329.63, 293.66],
  battle: [196, 246.94, 196, 293.66],
  stars: [329.63, 392, 493.88, 587.33],
  notebook: [261.63, 293.66, 329.63, 293.66]
};

export class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentBgm: BgmId = "title";
  private patternIndex = 0;
  private timerId = 0;
  private unlocked = false;
  private muted = false;

  constructor() {
    window.addEventListener("pointerdown", this.unlock, { passive: true });
    window.addEventListener("keydown", this.unlock);
    document.addEventListener("click", this.handleClick, true);
  }

  destroy(): void {
    window.removeEventListener("pointerdown", this.unlock);
    window.removeEventListener("keydown", this.unlock);
    document.removeEventListener("click", this.handleClick, true);
    if (this.timerId) window.clearInterval(this.timerId);
    this.timerId = 0;
    void this.context?.close();
    this.context = null;
    this.masterGain = null;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : 0.12;
  }

  isMuted(): boolean {
    return this.muted;
  }

  syncForScreen(screenId: ScreenId | undefined, locationId?: string): void {
    const next = this.resolveBgm(screenId, locationId);
    if (next === this.currentBgm) return;
    this.currentBgm = next;
    this.patternIndex = 0;
    if (this.unlocked) this.playBgmStep();
  }

  playSe(id: SeId): void {
    if (!this.unlocked || !this.context || this.muted) return;
    const frequency = id === "cancel" ? 220 : id === "save" ? 659.25 : id === "openNotebook" ? 523.25 : 440;
    const duration = id === "save" ? 0.16 : 0.09;
    this.playTone(frequency, duration, 0.16, id === "cancel" ? "triangle" : "sine");
  }

  private readonly unlock = (): void => {
    if (!this.context) {
      const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;
      this.context = new AudioContextCtor();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.12;
      this.masterGain.connect(this.context.destination);
    }

    void this.context.resume();
    if (!this.unlocked) {
      this.unlocked = true;
      this.playBgmStep();
      this.timerId = window.setInterval(() => this.playBgmStep(), 900);
    }
  };

  private readonly handleClick = (event: Event): void => {
    const target = event.target;
    if (target instanceof HTMLButtonElement && !target.disabled) this.playSe("confirm");
  };

  private resolveBgm(screenId: ScreenId | undefined, locationId?: string): BgmId {
    if (screenId === "battle") return "battle";
    if (screenId === "starMap" || screenId === "ending") return "stars";
    if (screenId === "notebook") return "notebook";
    if (screenId === "explore") return locationId === "castle" ? "castle" : "dogo";
    return "title";
  }

  private playBgmStep(): void {
    if (!this.unlocked || !this.context || this.muted) return;
    const pattern = BGM_PATTERNS[this.currentBgm];
    const frequency = pattern[this.patternIndex % pattern.length] ?? pattern[0];
    this.patternIndex += 1;
    this.playTone(frequency, 0.55, 0.035, this.currentBgm === "battle" ? "square" : "sine");
    if (this.currentBgm !== "battle") this.playTone(frequency / 2, 0.7, 0.018, "triangle");
  }

  private playTone(
    frequency: number,
    durationSeconds: number,
    volume: number,
    type: OscillatorType
  ): void {
    if (!this.context || !this.masterGain || this.muted) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(now);
    oscillator.stop(now + durationSeconds + 0.03);
  }
}
