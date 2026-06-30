import { resolvePublicAssetPath } from "../core/AssetPath";
import { assetManifest } from "../data/assets";
import type { MapLayoutData, MapPoint, MapRect, PositionedMapObject } from "../types/mapLayout";
import type { EditorLayer, EditorState, Selection } from "./EditorState";

type DragMode = "pan" | "move" | "resize" | "point" | null;

type CanvasCallbacks = {
  onChange: (commitHistory: boolean) => void;
  onSelect: (selection: Selection | null) => void;
  onPointerInfo: (point: MapPoint) => void;
};

const colors: Record<EditorLayer, string> = {
  cameraBounds: "#b36bff",
  walkableRects: "#58c878",
  walkablePolygons: "#48c878",
  collisionRects: "#ff543f",
  playerStart: "#39e6e6",
  enemySpawns: "#ff8b1f",
  npcPositions: "#ffe269",
  interactablePositions: "#ff6fb4",
  eventPositions: "#d942db",
  guidePaths: "#3c78ff",
  markers: "#ffffff"
};

const objectLayers = ["enemySpawns", "npcPositions", "interactablePositions", "eventPositions", "markers"] as const;
type ObjectLayer = typeof objectLayers[number];

export class EditorCanvas {
  private readonly ctx: CanvasRenderingContext2D;
  private backgroundImage: HTMLImageElement | null = null;
  private foregroundImage: HTMLImageElement | null = null;
  private overlayImage: HTMLImageElement | null = null;
  private dragMode: DragMode = null;
  private dragStart: MapPoint | null = null;
  private originalRect: MapRect | null = null;
  private originalPoint: MapPoint | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly getState: () => EditorState,
    private readonly callbacks: CanvasCallbacks
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D contextを取得できません。");
    this.ctx = ctx;
    this.bindEvents();
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  async loadImages(layout: MapLayoutData): Promise<void> {
    this.backgroundImage = await this.loadAsset(layout.backgroundAssetId);
    this.foregroundImage = layout.foregroundAssetId ? await this.loadAsset(layout.foregroundAssetId) : null;
    this.overlayImage = layout.overlayAssetId ? await this.loadAsset(layout.overlayAssetId) : null;
    this.render();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(960, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(620, Math.floor(rect.height * ratio));
    this.render();
  }

  render(): void {
    const state = this.getState();
    const ratio = window.devicePixelRatio || 1;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#10161a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.setTransform(
      state.zoom * ratio,
      0,
      0,
      state.zoom * ratio,
      state.pan.x * ratio,
      state.pan.y * ratio
    );
    this.drawWorldBackground(state.layout);
    if (state.showGrid) this.drawGrid(state);
    this.drawLayers(state);
    this.ctx.restore();
    this.drawRulers(state);
  }

  focusSelection(): void {
    const state = this.getState();
    const point = this.getSelectionPoint(state);
    if (!point) return;
    state.pan = {
      x: this.canvas.width / (window.devicePixelRatio || 1) / 2 - point.x * state.zoom,
      y: this.canvas.height / (window.devicePixelRatio || 1) / 2 - point.y * state.zoom
    };
    this.render();
  }

  private bindEvents(): void {
    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    this.canvas.addEventListener("pointerup", () => this.onPointerUp());
    this.canvas.addEventListener("pointercancel", () => this.onPointerUp());
    this.canvas.addEventListener("dblclick", (event) => this.onDoubleClick(event));
    this.canvas.addEventListener("wheel", (event) => this.onWheel(event), { passive: false });
  }

  private async loadAsset(assetId: string): Promise<HTMLImageElement | null> {
    const asset = assetManifest.images.find((image) => image.id === assetId);
    if (!asset) return null;
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = resolvePublicAssetPath(asset.src);
    });
  }

  private toWorld(event: PointerEvent | MouseEvent): MapPoint {
    const rect = this.canvas.getBoundingClientRect();
    const state = this.getState();
    return {
      x: (event.clientX - rect.left - state.pan.x) / state.zoom,
      y: (event.clientY - rect.top - state.pan.y) / state.zoom
    };
  }

  private snap(point: MapPoint): MapPoint {
    const state = this.getState();
    if (!state.snap) return point;
    const grid = state.gridSize;
    return { x: Math.round(point.x / grid) * grid, y: Math.round(point.y / grid) * grid };
  }

  private drawWorldBackground(layout: MapLayoutData): void {
    if (this.backgroundImage) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, layout.worldWidth, layout.worldHeight);
    } else {
      const gradient = this.ctx.createLinearGradient(0, 0, layout.worldWidth, layout.worldHeight);
      gradient.addColorStop(0, "#29313a");
      gradient.addColorStop(1, "#59412c");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, layout.worldWidth, layout.worldHeight);
    }
    if (this.overlayImage) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.28;
      this.ctx.drawImage(this.overlayImage, 0, 0, layout.worldWidth, layout.worldHeight);
      this.ctx.restore();
    }
  }

  private drawGrid(state: EditorState): void {
    this.ctx.save();
    this.ctx.lineWidth = 1 / state.zoom;
    this.ctx.strokeStyle = "rgba(255,255,255,.13)";
    for (let x = 0; x <= state.layout.worldWidth; x += state.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, state.layout.worldHeight);
      this.ctx.stroke();
    }
    for (let y = 0; y <= state.layout.worldHeight; y += state.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(state.layout.worldWidth, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawLayers(state: EditorState): void {
    if (state.layers.cameraBounds.visible) {
      this.drawRect(state.layout.cameraBounds, "cameraBounds", state);
    }
    if (state.layers.walkableRects.visible) {
      for (const rect of state.layout.walkableRects) this.drawRect(rect, "walkableRects", state);
    }
    if (state.layers.walkablePolygons.visible) {
      for (const polygon of state.layout.walkablePolygons) {
        this.drawPolygon(polygon.points, "walkablePolygons", state, polygon.id);
      }
    }
    if (state.layers.collisionRects.visible) {
      for (const rect of state.layout.collisionRects) this.drawRect(rect, "collisionRects", state, true);
    }
    if (state.layers.guidePaths.visible) {
      for (const path of state.layout.guidePaths) this.drawPath(path.points, path.id, state);
    }
    if (state.layers.playerStart.visible) {
      this.drawPoint(state.layout.playerStart, "playerStart", "START", state, "▶");
    }
    this.drawObjects(state, "enemySpawns", "👹");
    this.drawObjects(state, "npcPositions", "●");
    this.drawObjects(state, "interactablePositions", "◆");
    this.drawObjects(state, "eventPositions", "★");
    this.drawObjects(state, "markers", "□");
    if (this.foregroundImage) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.22;
      this.ctx.drawImage(this.foregroundImage, 0, 0, state.layout.worldWidth, state.layout.worldHeight);
      this.ctx.restore();
    }
  }

  private drawObjects(state: EditorState, layer: ObjectLayer, icon: string): void {
    if (!state.layers[layer].visible) return;
    for (const object of state.layout[layer]) this.drawPoint(object, layer, object.id, state, icon);
  }

  private drawRect(rect: MapRect, layer: EditorLayer, state: EditorState, hatch = false): void {
    const selected = state.selection?.layer === layer && state.selection.id === rect.id;
    this.ctx.save();
    this.ctx.fillStyle = hexToRgba(colors[layer], hatch ? 0.18 : 0.28);
    this.ctx.strokeStyle = colors[layer];
    this.ctx.lineWidth = (selected ? 4 : 2) / state.zoom;
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    if (hatch) {
      this.ctx.strokeStyle = hexToRgba(colors[layer], 0.48);
      for (let x = rect.x - rect.height; x < rect.x + rect.width; x += 18) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, rect.y + rect.height);
        this.ctx.lineTo(x + rect.height, rect.y);
        this.ctx.stroke();
      }
    }
    this.drawLabel(rect.label ?? rect.id, rect.x + 8, rect.y + 20, state);
    if (selected) this.drawResizeHandle(rect, state);
    this.ctx.restore();
  }

  private drawPolygon(points: MapPoint[], layer: EditorLayer, state: EditorState, id: string): void {
    if (points.length < 2) return;
    const selected = state.selection?.layer === layer && state.selection.id === id;
    this.ctx.save();
    this.ctx.beginPath();
    points.forEach((point, index) => (index === 0 ? this.ctx.moveTo(point.x, point.y) : this.ctx.lineTo(point.x, point.y)));
    if (points.length >= 3) this.ctx.closePath();
    this.ctx.fillStyle = hexToRgba(colors[layer], 0.22);
    this.ctx.strokeStyle = colors[layer];
    this.ctx.lineWidth = (selected ? 4 : 2) / state.zoom;
    this.ctx.fill();
    this.ctx.stroke();
    points.forEach((point, index) => this.drawVertex(point, selected && state.selection?.pointIndex === index, state));
    const first = points[0];
    if (first) this.drawLabel(id, first.x + 8, first.y + 20, state);
    this.ctx.restore();
  }

  private drawPath(points: MapPoint[], id: string, state: EditorState): void {
    if (points.length === 0) return;
    const selected = state.selection?.layer === "guidePaths" && state.selection.id === id;
    this.ctx.save();
    this.ctx.strokeStyle = colors.guidePaths;
    this.ctx.lineWidth = (selected ? 4 : 2) / state.zoom;
    this.ctx.beginPath();
    points.forEach((point, index) => (index === 0 ? this.ctx.moveTo(point.x, point.y) : this.ctx.lineTo(point.x, point.y)));
    this.ctx.stroke();
    points.forEach((point, index) => this.drawVertex(point, selected && state.selection?.pointIndex === index, state));
    const first = points[0];
    if (first) this.drawLabel(id, first.x + 8, first.y + 20, state);
    this.ctx.restore();
  }

  private drawPoint(point: MapPoint, layer: EditorLayer, id: string, state: EditorState, icon: string): void {
    const selected = state.selection?.layer === layer && state.selection.id === id;
    const radius = selected ? 18 : 14;
    this.ctx.save();
    this.ctx.fillStyle = colors[layer];
    this.ctx.strokeStyle = selected ? "#ffffff" : "#1b1f24";
    this.ctx.lineWidth = 3 / state.zoom;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.fillStyle = "#111";
    this.ctx.font = `${Math.max(13, 18 / state.zoom)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(icon, point.x, point.y + 1);
    this.drawLabel(id, point.x + 20, point.y + 8, state);
    this.ctx.restore();
  }

  private drawVertex(point: MapPoint, selected: boolean, state: EditorState): void {
    this.ctx.save();
    this.ctx.fillStyle = selected ? "#fff" : "#5f9dff";
    this.ctx.strokeStyle = "#1d396f";
    this.ctx.lineWidth = 2 / state.zoom;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, selected ? 7 : 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawResizeHandle(rect: MapRect, state: EditorState): void {
    const size = 12 / state.zoom;
    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "#1d396f";
    this.ctx.fillRect(rect.x + rect.width - size / 2, rect.y + rect.height - size / 2, size, size);
    this.ctx.strokeRect(rect.x + rect.width - size / 2, rect.y + rect.height - size / 2, size, size);
  }

  private drawLabel(text: string, x: number, y: number, state: EditorState): void {
    this.ctx.save();
    this.ctx.font = `${Math.max(12, 15 / state.zoom)}px sans-serif`;
    const width = this.ctx.measureText(text).width + 12;
    this.ctx.fillStyle = "rgba(10,12,14,.78)";
    this.ctx.fillRect(x, y - 16 / state.zoom, width, 24 / state.zoom);
    this.ctx.fillStyle = "#f8f4e8";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, x + 6, y - 4 / state.zoom);
    this.ctx.restore();
  }

  private drawRulers(state: EditorState): void {
    const ratio = window.devicePixelRatio || 1;
    const width = this.canvas.width / ratio;
    const height = this.canvas.height / ratio;
    this.ctx.save();
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.ctx.fillStyle = "rgba(16,20,24,.88)";
    this.ctx.fillRect(0, 0, width, 24);
    this.ctx.fillRect(0, 0, 28, height);
    this.ctx.fillStyle = "#cbd1d6";
    this.ctx.font = "11px sans-serif";
    this.ctx.strokeStyle = "rgba(255,255,255,.22)";
    for (let x = 0; x <= state.layout.worldWidth; x += 256) {
      const screenX = x * state.zoom + state.pan.x;
      this.ctx.fillText(String(x), screenX + 4, 16);
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, 0);
      this.ctx.lineTo(screenX, height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= state.layout.worldHeight; y += 256) {
      const screenY = y * state.zoom + state.pan.y;
      this.ctx.fillText(String(y), 4, screenY + 14);
      this.ctx.beginPath();
      this.ctx.moveTo(0, screenY);
      this.ctx.lineTo(width, screenY);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private onPointerDown(event: PointerEvent): void {
    this.canvas.setPointerCapture(event.pointerId);
    const state = this.getState();
    const world = this.snap(this.toWorld(event));
    this.callbacks.onPointerInfo(world);
    if (event.button === 1 || event.button === 2 || event.altKey) {
      this.dragMode = "pan";
      this.dragStart = { x: event.clientX, y: event.clientY };
      return;
    }
    if (state.tool === "rect") return this.addRect(world);
    if (state.tool === "polygon") return this.addPolygonPoint(world);
    if (state.tool === "path") return this.addPathPoint(world);

    const hit = this.hitTest(world, state);
    this.callbacks.onSelect(hit?.selection ?? null);
    if (hit && !state.layers[hit.selection.layer].locked) {
      this.dragMode = hit.mode;
      this.dragStart = world;
      this.originalRect = hit.rect ? { ...hit.rect } : null;
      this.originalPoint = hit.point ? { ...hit.point } : null;
    }
    this.render();
  }

  private onPointerMove(event: PointerEvent): void {
    const state = this.getState();
    const world = this.snap(this.toWorld(event));
    this.callbacks.onPointerInfo(world);
    if (this.dragMode === "pan") {
      state.pan.x += event.movementX;
      state.pan.y += event.movementY;
      this.render();
      return;
    }
    if (!this.dragMode || !state.selection || !this.dragStart) return;
    this.applyDrag(state, world.x - this.dragStart.x, world.y - this.dragStart.y, world);
    this.callbacks.onChange(false);
    this.render();
  }

  private onPointerUp(): void {
    if (this.dragMode && this.dragMode !== "pan") this.callbacks.onChange(true);
    this.dragMode = null;
    this.dragStart = null;
    this.originalRect = null;
    this.originalPoint = null;
  }

  private onDoubleClick(event: MouseEvent): void {
    const state = this.getState();
    const world = this.snap(this.toWorld(event));
    if (state.selection?.layer === "guidePaths") this.addPathPoint(world);
    if (state.selection?.layer === "walkablePolygons") this.addPolygonPoint(world);
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    const state = this.getState();
    const before = this.toWorld(event);
    state.zoom = Math.min(4, Math.max(0.25, state.zoom * (event.deltaY < 0 ? 1.1 : 0.9)));
    const after = this.toWorld(event);
    state.pan.x += (after.x - before.x) * state.zoom;
    state.pan.y += (after.y - before.y) * state.zoom;
    this.render();
    this.callbacks.onChange(false);
  }

  private addRect(world: MapPoint): void {
    const state = this.getState();
    if (!["walkableRects", "collisionRects"].includes(state.activeLayer)) return;
    const list = state.layout[state.activeLayer as "walkableRects" | "collisionRects"];
    const id = `${state.activeLayer}_${list.length + 1}`;
    list.push({ id, x: world.x, y: world.y, width: 96, height: 72 });
    this.callbacks.onSelect({ layer: state.activeLayer, id });
    this.callbacks.onChange(true);
    this.render();
  }

  private addPolygonPoint(world: MapPoint): void {
    const state = this.getState();
    let polygon = state.layout.walkablePolygons.find((item) => item.id === state.selection?.id);
    if (!polygon) {
      polygon = { id: `walk_poly_${state.layout.walkablePolygons.length + 1}`, points: [] };
      state.layout.walkablePolygons.push(polygon);
    }
    polygon.points.push(world);
    this.callbacks.onSelect({ layer: "walkablePolygons", id: polygon.id, pointIndex: polygon.points.length - 1 });
    this.callbacks.onChange(true);
    this.render();
  }

  private addPathPoint(world: MapPoint): void {
    const state = this.getState();
    let path = state.layout.guidePaths.find((item) => item.id === state.selection?.id);
    if (!path) {
      path = { id: `guide_${state.layout.guidePaths.length + 1}`, label: "新しい道しるべ", points: [] };
      state.layout.guidePaths.push(path);
    }
    path.points.push(world);
    this.callbacks.onSelect({ layer: "guidePaths", id: path.id, pointIndex: path.points.length - 1 });
    this.callbacks.onChange(true);
    this.render();
  }

  private applyDrag(state: EditorState, dx: number, dy: number, world: MapPoint): void {
    const selection = state.selection;
    if (!selection) return;
    if (selection.layer === "playerStart") {
      state.layout.playerStart = { x: world.x, y: world.y };
      return;
    }
    if (selection.layer === "cameraBounds") {
      if (!this.originalRect) return;
      if (this.dragMode === "resize") {
        state.layout.cameraBounds.width = Math.max(8, this.originalRect.width + dx);
        state.layout.cameraBounds.height = Math.max(8, this.originalRect.height + dy);
      } else {
        state.layout.cameraBounds.x = this.originalRect.x + dx;
        state.layout.cameraBounds.y = this.originalRect.y + dy;
      }
      return;
    }
    if (selection.layer === "walkableRects" || selection.layer === "collisionRects") {
      const rect = state.layout[selection.layer].find((item) => item.id === selection.id);
      if (!rect || !this.originalRect) return;
      if (this.dragMode === "resize") {
        rect.width = Math.max(8, this.originalRect.width + dx);
        rect.height = Math.max(8, this.originalRect.height + dy);
      } else {
        rect.x = this.originalRect.x + dx;
        rect.y = this.originalRect.y + dy;
      }
      return;
    }
    if (selection.layer === "walkablePolygons") {
      const polygon = state.layout.walkablePolygons.find((item) => item.id === selection.id);
      const point = selection.pointIndex !== undefined ? polygon?.points[selection.pointIndex] : undefined;
      if (point && this.originalPoint) {
        point.x = this.originalPoint.x + dx;
        point.y = this.originalPoint.y + dy;
      }
      return;
    }
    if (selection.layer === "guidePaths") {
      const path = state.layout.guidePaths.find((item) => item.id === selection.id);
      const point = selection.pointIndex !== undefined ? path?.points[selection.pointIndex] : undefined;
      if (point && this.originalPoint) {
        point.x = this.originalPoint.x + dx;
        point.y = this.originalPoint.y + dy;
      }
      return;
    }
    if (isObjectLayer(selection.layer)) {
      const object = state.layout[selection.layer].find((item) => item.id === selection.id);
      if (object && this.originalPoint) {
        object.x = this.originalPoint.x + dx;
        object.y = this.originalPoint.y + dy;
      }
    }
  }

  private hitTest(world: MapPoint, state: EditorState): { selection: Selection; mode: DragMode; rect?: MapRect; point?: MapPoint } | null {
    if (state.layers.playerStart.visible && distance(world, state.layout.playerStart) < 28) {
      return { selection: { layer: "playerStart", id: "playerStart" }, mode: "move", point: state.layout.playerStart };
    }
    for (const layer of objectLayers) {
      if (!state.layers[layer].visible) continue;
      for (const object of state.layout[layer]) {
        if (distance(world, object) < 28) return { selection: { layer, id: object.id }, mode: "move", point: object };
      }
    }
    if (state.layers.guidePaths.visible) {
      for (const path of state.layout.guidePaths) {
        for (let index = 0; index < path.points.length; index += 1) {
          const point = path.points[index];
          if (point && distance(world, point) < 18) return { selection: { layer: "guidePaths", id: path.id, pointIndex: index }, mode: "point", point };
        }
      }
    }
    if (state.layers.walkablePolygons.visible) {
      for (const polygon of state.layout.walkablePolygons) {
        for (let index = 0; index < polygon.points.length; index += 1) {
          const point = polygon.points[index];
          if (point && distance(world, point) < 18) return { selection: { layer: "walkablePolygons", id: polygon.id, pointIndex: index }, mode: "point", point };
        }
      }
    }
    for (const layer of ["collisionRects", "walkableRects"] as const) {
      if (!state.layers[layer].visible) continue;
      for (const rect of state.layout[layer]) {
        if (Math.abs(world.x - (rect.x + rect.width)) < 18 && Math.abs(world.y - (rect.y + rect.height)) < 18) {
          return { selection: { layer, id: rect.id }, mode: "resize", rect };
        }
        if (world.x >= rect.x && world.x <= rect.x + rect.width && world.y >= rect.y && world.y <= rect.y + rect.height) {
          return { selection: { layer, id: rect.id }, mode: "move", rect };
        }
      }
    }
    if (state.layers.cameraBounds.visible) {
      const rect = state.layout.cameraBounds;
      const edgeThreshold = 18;
      if (Math.abs(world.x - (rect.x + rect.width)) < edgeThreshold && Math.abs(world.y - (rect.y + rect.height)) < edgeThreshold) {
        return { selection: { layer: "cameraBounds", id: rect.id }, mode: "resize", rect };
      }
      const nearEdge = Math.abs(world.x - rect.x) < edgeThreshold
        || Math.abs(world.x - (rect.x + rect.width)) < edgeThreshold
        || Math.abs(world.y - rect.y) < edgeThreshold
        || Math.abs(world.y - (rect.y + rect.height)) < edgeThreshold;
      if (
        nearEdge
        && world.x >= rect.x
        && world.x <= rect.x + rect.width
        && world.y >= rect.y
        && world.y <= rect.y + rect.height
      ) {
        return { selection: { layer: "cameraBounds", id: rect.id }, mode: "move", rect };
      }
    }
    return null;
  }

  private getSelectionPoint(state: EditorState): MapPoint | null {
    const selection = state.selection;
    if (!selection) return null;
    if (selection.layer === "playerStart") return state.layout.playerStart;
    if (selection.layer === "cameraBounds") {
      const rect = state.layout.cameraBounds;
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }
    if (selection.layer === "walkableRects" || selection.layer === "collisionRects") {
      const rect = state.layout[selection.layer].find((item) => item.id === selection.id);
      return rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : null;
    }
    if (selection.layer === "walkablePolygons") {
      const polygon = state.layout.walkablePolygons.find((item) => item.id === selection.id);
      return polygon?.points[selection.pointIndex ?? 0] ?? null;
    }
    if (selection.layer === "guidePaths") {
      const path = state.layout.guidePaths.find((item) => item.id === selection.id);
      return path?.points[selection.pointIndex ?? 0] ?? null;
    }
    if (isObjectLayer(selection.layer)) {
      return state.layout[selection.layer].find((item) => item.id === selection.id) ?? null;
    }
    return null;
  }
}

function isObjectLayer(layer: EditorLayer): layer is ObjectLayer {
  return objectLayers.includes(layer as ObjectLayer);
}

function distance(a: MapPoint, b: MapPoint | PositionedMapObject): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},${alpha})`;
}
