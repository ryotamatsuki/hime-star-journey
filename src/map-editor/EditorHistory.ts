export class EditorHistory<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  constructor(private readonly clone: (value: T) => T, initial: T) {
    this.undoStack = [this.clone(initial)];
  }

  push(value: T): void {
    this.undoStack.push(this.clone(value));
    if (this.undoStack.length > 60) this.undoStack.shift();
    this.redoStack = [];
  }

  undo(current: T): T | null {
    if (this.undoStack.length <= 1) return null;
    const previous = this.undoStack.pop();
    if (previous) this.redoStack.push(this.clone(current));
    return this.clone(this.undoStack[this.undoStack.length - 1] as T);
  }

  redo(current: T): T | null {
    const next = this.redoStack.pop();
    if (!next) return null;
    this.undoStack.push(this.clone(next));
    void current;
    return this.clone(next);
  }

  reset(value: T): void {
    this.undoStack = [this.clone(value)];
    this.redoStack = [];
  }
}
