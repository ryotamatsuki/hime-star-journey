export type Renderable = {
  id: string;
  depthY: number;
  render: (ctx: CanvasRenderingContext2D) => void;
};

export function sortByDepth(renderables: Renderable[]): Renderable[] {
  return renderables
    .map((renderable, index) => ({ renderable, index }))
    .sort((a, b) => {
      const depthDiff = a.renderable.depthY - b.renderable.depthY;
      return depthDiff !== 0 ? depthDiff : a.index - b.index;
    })
    .map(({ renderable }) => renderable);
}

export function renderDepthSorted(
  ctx: CanvasRenderingContext2D,
  renderables: Renderable[]
): void {
  for (const renderable of sortByDepth(renderables)) {
    renderable.render(ctx);
  }
}
