import type { AssetLoader } from "../core/AssetLoader";
import type { DialogueLine } from "../types/dialogue";

export type DialogueBoxOptions = {
  uiRoot: HTMLElement;
  assetLoader: AssetLoader;
  onAdvance: () => void;
};

export class DialogueBox {
  private readonly element: HTMLElement;
  private readonly portrait: HTMLImageElement;
  private readonly speaker: HTMLElement;
  private readonly text: HTMLElement;
  private readonly nextButton: HTMLButtonElement;

  constructor(private readonly options: DialogueBoxOptions) {
    this.element = document.createElement("section");
    this.element.className = "dialogue-box is-hidden";
    this.element.setAttribute("aria-live", "polite");
    this.element.addEventListener("click", () => this.options.onAdvance());

    this.portrait = document.createElement("img");
    this.portrait.className = "dialogue-portrait";
    this.portrait.alt = "";

    const body = document.createElement("div");
    body.className = "dialogue-body";

    this.speaker = document.createElement("p");
    this.speaker.className = "dialogue-speaker";

    this.text = document.createElement("p");
    this.text.className = "dialogue-text";

    this.nextButton = document.createElement("button");
    this.nextButton.className = "dialogue-next";
    this.nextButton.type = "button";
    this.nextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.options.onAdvance();
    });

    body.append(this.speaker, this.text, this.nextButton);
    this.element.append(this.portrait, body);
    this.options.uiRoot.append(this.element);
  }

  show(line: DialogueLine, isLastLine: boolean): void {
    this.speaker.textContent = line.speakerName;
    this.text.textContent = line.text;
    this.nextButton.textContent = isLastLine ? "閉じる" : "次へ";

    const imageAsset = line.portraitAssetId
      ? this.options.assetLoader.getImageAsset(line.portraitAssetId)
      : undefined;

    if (imageAsset?.status === "loaded") {
      this.portrait.src = imageAsset.src;
      this.portrait.style.display = "";
      this.element.classList.remove("dialogue-box-no-portrait");
    } else {
      this.portrait.removeAttribute("src");
      this.portrait.style.display = "none";
      this.element.classList.add("dialogue-box-no-portrait");
    }

    this.element.classList.remove("is-hidden");
  }

  hide(): void {
    this.element.classList.add("is-hidden");
  }

  destroy(): void {
    this.element.remove();
  }
}
