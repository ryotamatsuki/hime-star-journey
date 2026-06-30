import { listMapLayouts, mapLayoutRegistry } from "../data/mapLayoutRegistry";
import type { MapLayoutData, MapPoint, MapRect, PositionedMapObject } from "../types/mapLayout";
import { EditorCanvas } from "./EditorCanvas";
import { EditorHistory } from "./EditorHistory";
import {
  cloneLayout,
  createDefaultLayers,
  layerLabels,
  type EditorLayer,
  type EditorState,
  type EditorTool,
  type Selection
} from "./EditorState";
import { validateMapLayout, type ValidationIssue } from "./MapValidator";

const tools: { id: EditorTool; label: string; icon: string; layer?: EditorLayer }[] = [
  { id: "select", label: "選択", icon: "↖" },
  { id: "move", label: "移動", icon: "✣" },
  { id: "rect", label: "矩形追加", icon: "▣", layer: "walkableRects" },
  { id: "polygon", label: "ポリゴン追加", icon: "⬡", layer: "walkablePolygons" },
  { id: "path", label: "経路編集", icon: "⌁", layer: "guidePaths" }
];

const objectLayerNames = ["enemySpawns", "npcPositions", "interactablePositions", "eventPositions", "markers"] as const;
type ObjectLayerName = typeof objectLayerNames[number];

type ClipboardEntry = {
  layer: EditorLayer;
  data: unknown;
};

export class MapEditorApp {
  private state: EditorState;
  private canvas!: EditorCanvas;
  private history: EditorHistory<MapLayoutData>;
  private pointer: MapPoint = { x: 0, y: 0 };
  private validationIssues: ValidationIssue[] = [];
  private clipboard: ClipboardEntry | null = null;

  constructor(private readonly root: HTMLElement) {
    const firstMap = listMapLayouts()[0]?.id ?? "dogo-D0";
    const baseLayout = mapLayoutRegistry[firstMap] ?? mapLayoutRegistry["dogo-D0"];
    if (!baseLayout) throw new Error("マップレイアウトが見つかりません。");
    const layout = cloneLayout(baseLayout);
    this.state = {
      mapId: firstMap,
      layout,
      zoom: 1,
      pan: { x: 28, y: 24 },
      gridSize: 16,
      showGrid: true,
      snap: true,
      tool: "select",
      activeLayer: "walkableRects",
      selection: null,
      dirty: false,
      validationTargetIds: [],
      layers: createDefaultLayers()
    };
    this.history = new EditorHistory(cloneLayout, layout);
  }

  async mount(): Promise<void> {
    this.root.innerHTML = this.renderShell();
    const canvasEl = this.root.querySelector<HTMLCanvasElement>("#map-editor-canvas");
    if (!canvasEl) throw new Error("マップエディタのCanvasを初期化できません。");
    this.canvas = new EditorCanvas(canvasEl, () => this.state, {
      onChange: (commit) => this.onCanvasChange(commit),
      onSelect: (selection) => this.select(selection),
      onPointerInfo: (point) => {
        this.pointer = point;
        this.updateStatus();
      }
    });
    this.bindEvents();
    await this.loadMap(this.state.mapId);
  }

  private renderShell(): string {
    const maps = listMapLayouts()
      .map((map) => `<option value="${map.id}">${escapeHtml(map.label)}</option>`)
      .join("");
    return `
      <div class="editor-app">
        <header class="editor-titlebar">
          <div class="editor-title"><span class="title-star">🌟</span> マップエディタ - ひめの小さな星めぐり</div>
          <div id="dirty-indicator" class="dirty-indicator">● 保存済み</div>
        </header>
        <div class="editor-toolbar">
          <button data-action="undo" class="icon-button">↶</button>
          <button data-action="redo" class="icon-button">↷</button>
          <span class="toolbar-separator"></span>
          <span>ズーム</span>
          <button data-action="zoom-out" class="mini-button">−</button>
          <span id="zoom-label" class="pill">100%</span>
          <button data-action="zoom-in" class="mini-button">＋</button>
          <span class="toolbar-separator"></span>
          <label class="check-chip"><input id="grid-toggle" type="checkbox" checked> グリッド</label>
          <label class="check-chip"><input id="snap-toggle" type="checkbox" checked> スナップ</label>
          <select id="grid-size" class="toolbar-select">
            <option value="8">8px</option>
            <option value="16" selected>16px</option>
            <option value="24">24px</option>
            <option value="32">32px</option>
            <option value="48">48px</option>
          </select>
          <span class="toolbar-separator"></span>
          <button data-action="focus" class="tool-lite">表示切替</button>
          <button data-action="duplicate" class="tool-lite">複製</button>
          <button data-action="delete" class="tool-lite danger">削除</button>
        </div>
        <main class="editor-main">
          <section class="canvas-shell">
            <canvas id="map-editor-canvas"></canvas>
          </section>
          <aside class="editor-sidebar">
            <section class="panel">
              <h2>マップ選択</h2>
              <div class="map-row">
                <select id="map-select">${maps}</select>
                <button data-action="focus" class="square-button">🗺</button>
              </div>
            </section>
            <section class="panel">
              <h2>ツール</h2>
              <div id="tool-list" class="tool-grid">${this.renderToolButtons()}</div>
            </section>
            <section class="panel">
              <h2>レイヤー</h2>
              <div id="layer-list" class="layer-list">${this.renderLayers()}</div>
            </section>
            <section class="panel">
              <h2>選択中データ</h2>
              <div id="selection-panel" class="selection-panel empty">未選択です</div>
            </section>
            <section class="panel">
              <h2>検証結果</h2>
              <div id="validation-panel" class="validation-panel"></div>
            </section>
            <section class="action-panel">
              <button data-action="validate" class="primary-button">✓ 検証</button>
              <button data-action="save" class="save-button">▣ 保存</button>
              <button data-action="preview" class="preview-button">▶ ゲームで確認</button>
              <div class="secondary-row">
                <button data-action="undo">Undo</button>
                <button data-action="redo">Redo</button>
                <button data-action="export">{} JSON出力</button>
                <button data-action="copy-json">JSONコピー</button>
                <button data-action="import">JSON取込</button>
              </div>
            </section>
          </aside>
          <aside class="preview-pane" aria-label="ゲームプレビュー">
            <div class="preview-header">
              <strong>ゲームプレビュー</strong>
              <button data-action="close-preview">プレビューを終了</button>
            </div>
            <div class="preview-note">● 一時セーブを使用</div>
            <iframe id="game-preview-frame" title="保存後のゲーム確認"></iframe>
            <div class="preview-info" id="preview-info">未起動</div>
          </aside>
        </main>
        <footer class="statusbar">
          <span id="pointer-status">ワールド座標 X: 0.0 / Y: 0.0</span>
          <span id="zoom-status">ズーム 100%</span>
          <span id="selection-status">選択中: なし</span>
          <span id="grid-status">グリッド: 16px</span>
        </footer>
      </div>
    `;
  }

  private renderToolButtons(): string {
    return tools.map((tool) => `
      <button class="tool-button ${tool.id === this.state.tool ? "active" : ""}" data-tool="${tool.id}">
        <span>${tool.icon}</span><small>${tool.label}</small>
      </button>
    `).join("");
  }

  private renderLayers(): string {
    return (Object.keys(layerLabels) as EditorLayer[]).map((layer) => {
      const settings = this.state.layers[layer];
      return `
        <div class="layer-row" data-layer="${layer}">
          <input type="checkbox" data-layer-visible="${layer}" ${settings.visible ? "checked" : ""}>
          <span class="layer-swatch ${layer}"></span>
          <span class="layer-name">${layerLabels[layer]}</span>
          <button data-layer-eye="${layer}" title="表示">👁</button>
          <button data-layer-lock="${layer}" class="${settings.locked ? "locked" : ""}" title="ロック">🔒</button>
        </div>
      `;
    }).join("");
  }

  private bindEvents(): void {
    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const action = target.closest<HTMLElement>("[data-action]")?.dataset.action;
      const tool = target.closest<HTMLElement>("[data-tool]")?.dataset.tool as EditorTool | undefined;
      const eye = target.closest<HTMLElement>("[data-layer-eye]")?.dataset.layerEye as EditorLayer | undefined;
      const lock = target.closest<HTMLElement>("[data-layer-lock]")?.dataset.layerLock as EditorLayer | undefined;
      if (tool) this.setTool(tool);
      if (eye) this.toggleLayerVisible(eye);
      if (lock) this.toggleLayerLock(lock);
      if (action) void this.runAction(action);
    });
    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      if (target.id === "map-select") void this.loadMap(target.value);
      if (target.id === "grid-toggle") this.state.showGrid = (target as HTMLInputElement).checked;
      if (target.id === "snap-toggle") this.state.snap = (target as HTMLInputElement).checked;
      if (target.id === "grid-size") this.state.gridSize = Number(target.value);
      if (target.dataset.layerVisible) {
        const layer = target.dataset.layerVisible as EditorLayer;
        this.state.layers[layer].visible = (target as HTMLInputElement).checked;
      }
      this.refresh();
    });
    this.root.addEventListener("input", (event) => this.onInspectorInput(event));
    window.addEventListener("keydown", (event) => this.onKeyDown(event));
  }

  private async loadMap(mapId: string): Promise<void> {
    const baseLayout = mapLayoutRegistry[mapId];
    if (!baseLayout) throw new Error(`マップが見つかりません: ${mapId}`);
    let layout = cloneLayout(baseLayout);
    try {
      const response = await fetch(`/__map-editor/load?map=${encodeURIComponent(mapId)}`);
      if (response.ok) layout = await response.json() as MapLayoutData;
    } catch {
      // Static production build keeps import/export usable without the dev save API.
    }
    this.state.mapId = mapId;
    this.state.layout = layout;
    this.state.selection = null;
    this.state.dirty = false;
    this.history.reset(layout);
    await this.canvas.loadImages(layout);
    this.validationIssues = validateMapLayout(layout, this.state.gridSize);
    this.refresh();
  }

  private async save(): Promise<boolean> {
    this.validationIssues = validateMapLayout(this.state.layout, this.state.gridSize);
    if (this.validationIssues.some((issue) => issue.severity === "error")) {
      this.setBanner("● 検証エラーあり: 保存していません", true);
      this.renderValidation();
      return false;
    }
    try {
      const response = await fetch("/__map-editor/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mapId: this.state.mapId, layout: this.state.layout })
      });
      if (!response.ok) throw new Error(await response.text());
      this.state.dirty = false;
      this.setBanner("● 保存済み", false);
      this.refresh();
      return true;
    } catch {
      this.exportJson();
      this.setBanner("● 保存APIなし: JSONを出力しました", true);
    }
    this.refresh();
    return false;
  }

  private async runAction(action: string): Promise<void> {
    if (action === "undo") return this.undo();
    if (action === "redo") return this.redo();
    if (action === "zoom-in") return this.setZoom(this.state.zoom * 1.12);
    if (action === "zoom-out") return this.setZoom(this.state.zoom / 1.12);
    if (action === "focus") return this.canvas.focusSelection();
    if (action === "duplicate") return this.duplicateSelection();
    if (action === "delete") return this.deleteSelection();
    if (action === "validate") return this.validate();
    if (action === "save") {
      await this.save();
      return;
    }
    if (action === "preview") return this.preview();
    if (action === "close-preview") return this.closePreview();
    if (action === "export") return this.exportJson();
    if (action === "copy-json") return this.copyJson();
    if (action === "import") return this.importJson();
    if (action === "add-vertex") return this.addVertexNearSelection();
    if (action === "delete-vertex") return this.deleteSelectedVertex();
    if (action === "split-edge") return this.splitEdgeNearSelection();
    if (action === "reverse-polygon") return this.reverseSelectedPolygon();
  }

  private setTool(tool: EditorTool): void {
    this.state.tool = tool;
    const configured = tools.find((item) => item.id === tool);
    if (configured?.layer) this.state.activeLayer = configured.layer;
    this.refresh();
  }

  private setZoom(zoom: number): void {
    this.state.zoom = Math.min(4, Math.max(0.25, zoom));
    this.refresh();
  }

  private toggleLayerVisible(layer: EditorLayer): void {
    this.state.layers[layer].visible = !this.state.layers[layer].visible;
    this.refresh();
  }

  private toggleLayerLock(layer: EditorLayer): void {
    this.state.layers[layer].locked = !this.state.layers[layer].locked;
    this.refresh();
  }

  private select(selection: Selection | null): void {
    this.state.selection = selection;
    this.refresh();
  }

  private onCanvasChange(commitHistory: boolean): void {
    this.state.dirty = true;
    if (commitHistory) this.history.push(this.state.layout);
    this.refresh();
  }

  private undo(): void {
    const previous = this.history.undo(this.state.layout);
    if (!previous) return;
    this.state.layout = previous;
    this.state.dirty = true;
    void this.canvas.loadImages(previous);
    this.refresh();
  }

  private redo(): void {
    const next = this.history.redo(this.state.layout);
    if (!next) return;
    this.state.layout = next;
    this.state.dirty = true;
    void this.canvas.loadImages(next);
    this.refresh();
  }

  private validate(): void {
    this.validationIssues = validateMapLayout(this.state.layout, this.state.gridSize);
    this.renderValidation();
  }

  private async preview(): Promise<void> {
    const saved = await this.save();
    if (!saved) return;
    const base = import.meta.env.BASE_URL || "/";
    const frame = this.root.querySelector<HTMLIFrameElement>("#game-preview-frame");
    this.root.querySelector(".editor-app")?.classList.add("preview-open");
    if (frame) {
      frame.src = `${base}?himeDevMap=${encodeURIComponent(this.state.mapId)}&editorPreview=${Date.now()}`;
    }
    setText(this.root, "#preview-info", `現在地: ${this.state.mapId} / 一時セーブ: ${new Date().toLocaleString()}`);
  }

  private closePreview(): void {
    const frame = this.root.querySelector<HTMLIFrameElement>("#game-preview-frame");
    if (frame) frame.src = "about:blank";
    this.root.querySelector(".editor-app")?.classList.remove("preview-open");
    setText(this.root, "#preview-info", "未起動");
  }

  private exportJson(): void {
    const blob = new Blob([`${JSON.stringify(this.state.layout, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${this.state.mapId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async copyJson(): Promise<void> {
    const json = `${JSON.stringify(this.state.layout, null, 2)}\n`;
    try {
      await navigator.clipboard.writeText(json);
      this.setBanner("● JSONをクリップボードへコピーしました", false);
    } catch {
      this.exportJson();
      this.setBanner("● クリップボード不可: JSONを出力しました", true);
    }
  }

  private importJson(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const imported = JSON.parse(await file.text()) as MapLayoutData;
      this.state.layout = imported;
      this.state.dirty = true;
      this.history.push(imported);
      await this.canvas.loadImages(imported);
      this.refresh();
    });
    input.click();
  }

  private duplicateSelection(): void {
    const selection = this.state.selection;
    if (!selection) return;
    const clone = this.cloneSelected(selection);
    if (!clone) return;
    this.clipboard = clone;
    this.pasteClipboard();
  }

  private cloneSelected(selection: Selection): ClipboardEntry | null {
    if (selection.layer === "cameraBounds") {
      return { layer: selection.layer, data: { ...this.state.layout.cameraBounds } };
    }
    if (selection.layer === "walkableRects" || selection.layer === "collisionRects") {
      const item = this.state.layout[selection.layer].find((rect) => rect.id === selection.id);
      return item ? { layer: selection.layer, data: { ...item } } : null;
    }
    if (isObjectLayerName(selection.layer)) {
      const layer = selection.layer;
      const item = this.state.layout[layer].find((object) => object.id === selection.id);
      return item ? { layer, data: { ...item } } : null;
    }
    return null;
  }

  private pasteClipboard(): void {
    if (!this.clipboard) return;
    const id = `${this.clipboard.layer}_${Date.now().toString(36)}`;
    if (this.clipboard.layer === "cameraBounds") {
      const rect = this.clipboard.data as MapRect;
      this.state.layout.cameraBounds = { ...rect, id: "camera_bounds", x: rect.x + 32, y: rect.y + 32 };
      this.state.selection = { layer: "cameraBounds", id: this.state.layout.cameraBounds.id };
    } else if (this.clipboard.layer === "walkableRects" || this.clipboard.layer === "collisionRects") {
      const rect = this.clipboard.data as MapRect;
      this.state.layout[this.clipboard.layer].push({ ...rect, id, x: rect.x + 32, y: rect.y + 32 });
      this.state.selection = { layer: this.clipboard.layer, id };
    } else if (isObjectLayerName(this.clipboard.layer)) {
      const layer = this.clipboard.layer;
      const object = this.clipboard.data as PositionedMapObject;
      this.state.layout[layer].push({ ...object, id, x: object.x + 32, y: object.y + 32 });
      this.state.selection = { layer, id };
    }
    this.onCanvasChange(true);
  }

  private deleteSelection(): void {
    const selection = this.state.selection;
    if (!selection) return;
    if (selection.layer === "cameraBounds" || selection.layer === "playerStart") {
      this.state.selection = null;
      return;
    }
    if (selection.layer === "walkableRects" || selection.layer === "collisionRects") {
      this.state.layout[selection.layer] = this.state.layout[selection.layer].filter((item) => item.id !== selection.id);
    } else if (selection.layer === "walkablePolygons") {
      this.state.layout.walkablePolygons = this.state.layout.walkablePolygons.filter((item) => item.id !== selection.id);
    } else if (selection.layer === "guidePaths") {
      this.state.layout.guidePaths = this.state.layout.guidePaths.filter((item) => item.id !== selection.id);
    } else if (isObjectLayerName(selection.layer)) {
      const layer = selection.layer;
      this.state.layout[layer] = this.state.layout[layer].filter((item) => item.id !== selection.id);
    }
    this.state.selection = null;
    this.onCanvasChange(true);
  }

  private addVertexNearSelection(): void {
    const selection = this.state.selection;
    if (!selection) return;
    if (selection.layer === "walkablePolygons") {
      const polygon = this.state.layout.walkablePolygons.find((item) => item.id === selection.id);
      if (!polygon) return;
      const index = selection.pointIndex ?? polygon.points.length - 1;
      const base = polygon.points[index] ?? this.pointer;
      polygon.points.splice(index + 1, 0, { x: base.x + this.state.gridSize, y: base.y + this.state.gridSize });
      this.state.selection = { layer: "walkablePolygons", id: polygon.id, pointIndex: index + 1 };
    } else if (selection.layer === "guidePaths") {
      const path = this.state.layout.guidePaths.find((item) => item.id === selection.id);
      if (!path) return;
      const index = selection.pointIndex ?? path.points.length - 1;
      const base = path.points[index] ?? this.pointer;
      path.points.splice(index + 1, 0, { x: base.x + this.state.gridSize, y: base.y + this.state.gridSize });
      this.state.selection = { layer: "guidePaths", id: path.id, pointIndex: index + 1 };
    }
    this.onCanvasChange(true);
  }

  private deleteSelectedVertex(): void {
    const selection = this.state.selection;
    if (!selection || selection.pointIndex === undefined) return;
    if (selection.layer === "walkablePolygons") {
      const polygon = this.state.layout.walkablePolygons.find((item) => item.id === selection.id);
      if (!polygon || polygon.points.length <= 3) return;
      polygon.points.splice(selection.pointIndex, 1);
    } else if (selection.layer === "guidePaths") {
      const path = this.state.layout.guidePaths.find((item) => item.id === selection.id);
      if (!path || path.points.length <= 2) return;
      path.points.splice(selection.pointIndex, 1);
    }
    this.state.selection = null;
    this.onCanvasChange(true);
  }

  private splitEdgeNearSelection(): void {
    const selection = this.state.selection;
    if (!selection || selection.pointIndex === undefined) return;
    const points = selection.layer === "walkablePolygons"
      ? this.state.layout.walkablePolygons.find((item) => item.id === selection.id)?.points
      : selection.layer === "guidePaths"
        ? this.state.layout.guidePaths.find((item) => item.id === selection.id)?.points
        : undefined;
    if (!points || points.length < 2) return;
    const a = points[selection.pointIndex];
    const b = points[(selection.pointIndex + 1) % points.length];
    if (!a || !b) return;
    points.splice(selection.pointIndex + 1, 0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    this.state.selection = { ...selection, pointIndex: selection.pointIndex + 1 };
    this.onCanvasChange(true);
  }

  private reverseSelectedPolygon(): void {
    const selection = this.state.selection;
    if (!selection || selection.layer !== "walkablePolygons") return;
    const polygon = this.state.layout.walkablePolygons.find((item) => item.id === selection.id);
    if (!polygon) return;
    polygon.points.reverse();
    this.onCanvasChange(true);
  }

  private onInspectorInput(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    const field = input.dataset.field;
    if (!field) return;
    const target = this.getSelectedEditable();
    if (!target) return;
    const value = ["x", "y", "width", "height"].includes(field) ? Number(input.value) : input.value;
    (target as Record<string, unknown>)[field] = value;
    this.onCanvasChange(true);
  }

  private getSelectedEditable(): Record<string, unknown> | null {
    const selection = this.state.selection;
    if (!selection) return null;
    if (selection.layer === "playerStart") return this.state.layout.playerStart as unknown as Record<string, unknown>;
    if (selection.layer === "cameraBounds") return this.state.layout.cameraBounds as unknown as Record<string, unknown>;
    if (selection.layer === "walkableRects" || selection.layer === "collisionRects") {
      return this.state.layout[selection.layer].find((item) => item.id === selection.id) as unknown as Record<string, unknown> ?? null;
    }
    if (selection.layer === "walkablePolygons") {
      const polygon = this.state.layout.walkablePolygons.find((item) => item.id === selection.id);
      if (selection.pointIndex !== undefined) {
        return polygon?.points[selection.pointIndex] as unknown as Record<string, unknown> ?? null;
      }
      return polygon as unknown as Record<string, unknown> ?? null;
    }
    if (selection.layer === "guidePaths") {
      const path = this.state.layout.guidePaths.find((item) => item.id === selection.id);
      if (selection.pointIndex !== undefined) {
        return path?.points[selection.pointIndex] as unknown as Record<string, unknown> ?? null;
      }
      return path as unknown as Record<string, unknown> ?? null;
    }
    if (isObjectLayerName(selection.layer)) {
      return this.state.layout[selection.layer].find((item) => item.id === selection.id) as unknown as Record<string, unknown> ?? null;
    }
    return null;
  }

  private onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void this.save();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) this.redo();
      else this.undo();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      this.redo();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      const selected = this.state.selection;
      if (selected) this.clipboard = this.cloneSelected(selected);
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
      event.preventDefault();
      this.pasteClipboard();
    } else if (event.key === "Delete" || event.key === "Backspace") {
      this.deleteSelection();
    } else if (event.key === "Escape") {
      this.select(null);
    }
  }

  private refresh(): void {
    this.canvas?.render();
    this.root.querySelector("#tool-list")!.innerHTML = this.renderToolButtons();
    this.root.querySelector("#layer-list")!.innerHTML = this.renderLayers();
    this.renderSelection();
    this.renderValidation();
    this.updateStatus();
    this.setBanner(this.state.dirty ? "● 未保存の変更あり" : "● 保存済み", this.state.dirty);
  }

  private renderSelection(): void {
    const panel = this.root.querySelector<HTMLElement>("#selection-panel");
    if (!panel) return;
    const selection = this.state.selection;
    const target = this.getSelectedEditable();
    if (!selection || !target) {
      panel.className = "selection-panel empty";
      panel.innerHTML = "未選択です";
      return;
    }
    panel.className = "selection-panel";
    const x = Number(target.x ?? 0);
    const y = Number(target.y ?? 0);
    const width = target.width !== undefined ? Number(target.width) : undefined;
    const height = target.height !== undefined ? Number(target.height) : undefined;
    const area = this.getSelectionArea(selection);
    const warning = this.validationIssues.find((issue) => issue.targetId === selection.id);
    panel.innerHTML = `
      <div class="selected-kind">${escapeHtml(layerLabels[selection.layer])}${selection.pointIndex !== undefined ? ` / 頂点 ${selection.pointIndex + 1}` : ""}</div>
      <label>ID <input data-field="id" value="${escapeHtml(String(target.id ?? selection.id))}" ${selection.layer === "playerStart" || selection.pointIndex !== undefined ? "disabled" : ""}></label>
      <div class="field-row">
        <label>X <input data-field="x" type="number" value="${x}"></label>
        <label>Y <input data-field="y" type="number" value="${y}"></label>
      </div>
      <div class="field-row">
        <label>幅 <input data-field="width" type="number" value="${width ?? ""}" ${width === undefined ? "disabled" : ""}></label>
        <label>高さ <input data-field="height" type="number" value="${height ?? ""}" ${height === undefined ? "disabled" : ""}></label>
      </div>
      <div class="field-row">
        <label>回転 <input value="0" disabled></label>
        <label>面積 <input value="${area}" disabled></label>
      </div>
      <div class="field-row">
        <label>スナップ幅 <input value="${this.state.gridSize}px" disabled></label>
        <label>ロック <input value="${this.state.layers[selection.layer].locked ? "ON" : "OFF"}" disabled></label>
      </div>
      <label>メモ <input data-field="label" value="${escapeHtml(String(target.label ?? ""))}"></label>
      ${warning ? `<div class="selection-warning">⚠ ${escapeHtml(warning.message)}</div>` : ""}
      <div class="vertex-actions">
        <button data-action="add-vertex">＋ 頂点追加</button>
        <button data-action="delete-vertex">🗑 頂点削除</button>
        <button data-action="split-edge">⌁ 辺を分割</button>
        <button data-action="reverse-polygon">↺ 面を反転</button>
      </div>
    `;
  }

  private getSelectionArea(selection: Selection): string {
    if (selection.layer === "walkableRects" || selection.layer === "collisionRects") {
      const rect = this.state.layout[selection.layer].find((item) => item.id === selection.id);
      return rect ? `${Math.round(rect.width * rect.height).toLocaleString()} px²` : "---";
    }
    if (selection.layer === "walkablePolygons") {
      const polygon = this.state.layout.walkablePolygons.find((item) => item.id === selection.id);
      if (!polygon) return "---";
      return `${Math.round(Math.abs(polygonArea(polygon.points))).toLocaleString()} px²`;
    }
    return "---";
  }

  private renderValidation(): void {
    const panel = this.root.querySelector<HTMLElement>("#validation-panel");
    if (!panel) return;
    const issues = this.validationIssues.length > 0 ? this.validationIssues : validateMapLayout(this.state.layout, this.state.gridSize);
    const errors = issues.filter((issue) => issue.severity === "error").length;
    const warnings = issues.filter((issue) => issue.severity === "warning").length;
    panel.innerHTML = `
      <div class="validation-summary">
        <span class="${errors > 0 ? "error" : "ok"}">▲ ${errors} エラー</span>
        <span class="${warnings > 0 ? "warning" : "ok"}">▲ ${warnings} 警告</span>
      </div>
    ${issues.map((issue) => `
      <div class="validation-row ${issue.severity}">
        <span>${issue.severity === "error" ? "✕" : issue.severity === "warning" ? "⚠" : "✓"}</span>
        <span>${escapeHtml(issue.message)}</span>
      </div>
    `).join("")}`;
  }

  private updateStatus(): void {
    const zoomPercent = `${Math.round(this.state.zoom * 100)}%`;
    setText(this.root, "#pointer-status", `ワールド座標 X: ${this.pointer.x.toFixed(1)} / Y: ${this.pointer.y.toFixed(1)}`);
    setText(this.root, "#zoom-label", zoomPercent);
    setText(this.root, "#zoom-status", `ズーム ${zoomPercent}`);
    setText(this.root, "#selection-status", this.state.selection ? `選択中: ${layerLabels[this.state.selection.layer]} (${this.state.selection.id})` : "選択中: なし");
    setText(this.root, "#grid-status", `グリッド: ${this.state.gridSize}px`);
  }

  private setBanner(text: string, dirty: boolean): void {
    const indicator = this.root.querySelector<HTMLElement>("#dirty-indicator");
    if (!indicator) return;
    indicator.textContent = text;
    indicator.classList.toggle("dirty", dirty);
  }
}

function setText(root: HTMLElement, selector: string, text: string): void {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = text;
}

function isObjectLayerName(layer: EditorLayer): layer is ObjectLayerName {
  return objectLayerNames.includes(layer as ObjectLayerName);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char] ?? char);
}

function polygonArea(points: MapPoint[]): number {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    if (!current || !next) continue;
    area += current.x * next.y - next.x * current.y;
  }
  return area / 2;
}
