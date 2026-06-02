import { GameApp } from "./core/GameApp";
import "./styles.css";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");

if (!canvas || !uiRoot) {
  throw new Error("CanvasまたはUIルートが見つかりません。");
}

const app = new GameApp({ canvas, uiRoot });

app.start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  uiRoot.innerHTML = "";
  const errorView = document.createElement("div");
  errorView.className = "app-error";
  errorView.textContent = `起動に失敗しました: ${message}`;
  document.body.append(errorView);
  console.error(error);
});
