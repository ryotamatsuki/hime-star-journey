import { MapEditorApp } from "./MapEditorApp";
import "./editor.css";

const root = document.querySelector<HTMLElement>("#map-editor-root");

if (!root) {
  throw new Error("マップエディタのルート要素が見つかりません。");
}

const app = new MapEditorApp(root);
app.mount().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = `<div class="editor-fatal">起動に失敗しました: ${message}</div>`;
  console.error(error);
});
