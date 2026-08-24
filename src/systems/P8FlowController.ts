import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import type { SaveData } from "../types/save";

const BOSS_SYMBOL_ID = "B-E01";
const BOSS_ENCOUNTER_ID = "enc_boss_kagemasa";
const STAR_SEAL_CARD_ID = "card_star_seal";
const CASTLE_STAR_ID = "castle";

export function isP8BossReady(save: SaveData): boolean {
  return (
    save.flags.p8_kagemasa_route_unlocked === true &&
    save.flags.kagemasa_sealed !== true &&
    !save.defeatedEnemyIds.includes(BOSS_SYMBOL_ID)
  );
}

export function prepareP8BossSave(save: SaveData): SaveData {
  return {
    ...save,
    currentChapterId: "kagemasa_battle",
    currentLocationId: "castle",
    currentAreaId: "C0",
    currentScreenId: "battle",
    hp: save.maxHp,
    mp: save.maxMp,
    unlockedCards: Array.from(new Set([...save.unlockedCards, STAR_SEAL_CARD_ID])),
    flags: {
      ...save.flags,
      p8_started: true,
      star_seal_unlocked: true,
      kagemasa_battle_started: true
    },
    lastSynopsis: "城山のまもりを手に、天守奥でカゲマサと向き合います。"
  };
}

export function isP8BossVictoryPending(save: SaveData): boolean {
  return (
    save.flags.kagemasa_battle_started === true &&
    save.defeatedEnemyIds.includes(BOSS_SYMBOL_ID) &&
    save.flags.kagemasa_sealed !== true
  );
}

export function completeP8Save(save: SaveData): SaveData {
  return {
    ...save,
    currentChapterId: "mvp_ending",
    currentLocationId: "castle",
    currentAreaId: "C0",
    currentScreenId: "ending",
    starLevel: Math.max(3, save.starLevel),
    hp: save.maxHp,
    mp: save.maxMp,
    defeatedEnemyIds: Array.from(new Set([...save.defeatedEnemyIds, BOSS_SYMBOL_ID])),
    collectedStars: Array.from(new Set([...save.collectedStars, CASTLE_STAR_ID])),
    unlockedCards: Array.from(new Set([...save.unlockedCards, STAR_SEAL_CARD_ID])),
    acquiredItems: {
      ...save.acquiredItems,
      mikan_star_core: Math.max(1, save.acquiredItems.mikan_star_core ?? 0)
    },
    flags: {
      ...save.flags,
      p8_started: true,
      star_seal_unlocked: true,
      kagemasa_battle_started: true,
      kagemasa_sealed: true,
      mikan_core_recovered: true,
      castle_star_obtained: true,
      star_castle_collected: true,
      pendant_light_restored: true,
      dogo_restored: true,
      castle_restored: true,
      p8_completed: true,
      gameCompleted: true
    },
    lastSynopsis: "カゲマサを星封じで再封印し、みかん星の核と城の星を取り戻しました。星地図には、まだ見ぬ空白の星が残っています。"
  };
}

type P8FlowControllerOptions = {
  uiRoot: HTMLElement;
  saveManager: SaveManager;
  screenManager: ScreenManager;
};

export class P8FlowController {
  private animationFrameId = 0;
  private disposed = false;

  constructor(private readonly options: P8FlowControllerOptions) {}

  start(): void {
    this.disposed = false;
    this.tick();
  }

  stop(): void {
    this.disposed = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.removeBossEntryButton();
  }

  private tick = (): void => {
    if (this.disposed) return;

    const save = this.options.saveManager.load();
    const screenId = this.options.screenManager.getCurrentScreenId();

    if (save && isP8BossVictoryPending(save) && screenId !== "battle" && screenId !== "ending") {
      const completed = this.options.saveManager.save(completeP8Save(save));
      this.removeBossEntryButton();
      this.options.screenManager.change("ending", { saveData: completed });
      this.animationFrameId = requestAnimationFrame(this.tick);
      return;
    }

    if (save && isP8BossReady(save) && (screenId === "explore" || screenId === "starMap")) {
      this.ensureBossEntryButton(save);
    } else {
      this.removeBossEntryButton();
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private ensureBossEntryButton(save: SaveData): void {
    if (this.options.uiRoot.querySelector<HTMLButtonElement>("[data-p8-boss-entry='true']")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.p8BossEntry = "true";
    button.textContent = "天守奥へ進む";
    button.setAttribute("aria-label", "天守奥へ進み、カゲマサと対決する");
    Object.assign(button.style, {
      position: "fixed",
      right: "28px",
      bottom: "28px",
      zIndex: "60",
      minWidth: "190px",
      padding: "14px 20px",
      borderRadius: "16px",
      border: "2px solid rgba(255, 230, 142, 0.95)",
      background: "linear-gradient(180deg, rgba(92, 57, 114, 0.96), rgba(48, 32, 72, 0.98))",
      color: "#fff8df",
      font: "700 17px sans-serif",
      boxShadow: "0 8px 24px rgba(20, 12, 30, 0.38)",
      cursor: "pointer"
    });

    button.addEventListener("click", () => {
      const latest = this.options.saveManager.load() ?? save;
      if (!isP8BossReady(latest)) return;

      const nextSave = this.options.saveManager.save(prepareP8BossSave(latest));
      this.removeBossEntryButton();
      this.options.screenManager.change("battle", {
        enemySymbolId: BOSS_SYMBOL_ID,
        encounterId: BOSS_ENCOUNTER_ID,
        returnLocationId: "castle",
        returnAreaId: "C0",
        isBoss: true,
        saveData: nextSave
      });
    });

    this.options.uiRoot.append(button);
  }

  private removeBossEntryButton(): void {
    this.options.uiRoot.querySelector<HTMLButtonElement>("[data-p8-boss-entry='true']")?.remove();
  }
}
