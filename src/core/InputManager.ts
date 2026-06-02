export type InputAction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "confirm"
  | "cancel"
  | "notebook"
  | "map"
  | "card1"
  | "card2"
  | "card3"
  | "card4"
  | "card5"
  | "card6";

export type PointerState = {
  x: number;
  y: number;
  isDown: boolean;
  started: boolean;
  released: boolean;
};

const KEY_BINDINGS = new Map<string, InputAction>([
  ["ArrowUp", "up"],
  ["KeyW", "up"],
  ["ArrowDown", "down"],
  ["KeyS", "down"],
  ["ArrowLeft", "left"],
  ["KeyA", "left"],
  ["ArrowRight", "right"],
  ["KeyD", "right"],
  ["Enter", "confirm"],
  ["Space", "confirm"],
  ["Escape", "cancel"],
  ["KeyN", "notebook"],
  ["KeyM", "map"],
  ["Digit1", "card1"],
  ["Digit2", "card2"],
  ["Digit3", "card3"],
  ["Digit4", "card4"],
  ["Digit5", "card5"],
  ["Digit6", "card6"]
]);

export class InputManager {
  private readonly pressedKeys = new Set<string>();
  private readonly downActions = new Set<InputAction>();
  private readonly startedActions = new Set<InputAction>();

  private pointerState: PointerState = {
    x: 0,
    y: 0,
    isDown: false,
    started: false,
    released: false
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerCancel);
  }

  isActionDown(action: InputAction): boolean {
    return this.downActions.has(action);
  }

  isActionStarted(action: InputAction): boolean {
    return this.startedActions.has(action);
  }

  getPointer(): PointerState {
    return { ...this.pointerState };
  }

  endFrame(): void {
    this.startedActions.clear();
    this.pointerState = {
      ...this.pointerState,
      started: false,
      released: false
    };
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const action = KEY_BINDINGS.get(event.code);

    if (!action) {
      return;
    }

    event.preventDefault();

    if (!this.pressedKeys.has(event.code)) {
      this.startedActions.add(action);
    }

    this.pressedKeys.add(event.code);
    this.downActions.add(action);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const action = KEY_BINDINGS.get(event.code);

    if (!action) {
      return;
    }

    event.preventDefault();
    this.pressedKeys.delete(event.code);
    this.rebuildDownActions();
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.canvas.setPointerCapture(event.pointerId);
    this.pointerState = {
      ...this.toCanvasPoint(event),
      isDown: true,
      started: true,
      released: false
    };
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    this.pointerState = {
      ...this.pointerState,
      ...this.toCanvasPoint(event)
    };
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }

    this.pointerState = {
      ...this.toCanvasPoint(event),
      isDown: false,
      started: false,
      released: true
    };
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }

    this.pointerState = {
      ...this.pointerState,
      isDown: false,
      started: false,
      released: true
    };
  };

  private rebuildDownActions(): void {
    this.downActions.clear();

    for (const key of this.pressedKeys) {
      const action = KEY_BINDINGS.get(key);

      if (action) {
        this.downActions.add(action);
      }
    }
  }

  private toCanvasPoint(event: PointerEvent): Pick<PointerState, "x" | "y"> {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }
}
