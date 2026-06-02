export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MovementResult = {
  rect: Rect;
  collidedX: boolean;
  collidedY: boolean;
};

export function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function clampToBounds(rect: Rect, bounds: Rect): Rect {
  return {
    ...rect,
    x: Math.min(Math.max(rect.x, bounds.x), bounds.x + bounds.width - rect.width),
    y: Math.min(Math.max(rect.y, bounds.y), bounds.y + bounds.height - rect.height)
  };
}

export function wouldCollide(rect: Rect, obstacles: Rect[]): boolean {
  return obstacles.some((obstacle) => intersects(rect, obstacle));
}

export function expandRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2
  };
}

export function moveRectWithCollisions(
  rect: Rect,
  deltaX: number,
  deltaY: number,
  obstacles: Rect[],
  bounds: Rect
): MovementResult {
  let nextRect = { ...rect };
  let collidedX = false;
  let collidedY = false;

  const xRect = clampToBounds({ ...nextRect, x: nextRect.x + deltaX }, bounds);
  if (wouldCollide(xRect, obstacles)) {
    collidedX = true;
  } else {
    nextRect = xRect;
  }

  const yRect = clampToBounds({ ...nextRect, y: nextRect.y + deltaY }, bounds);
  if (wouldCollide(yRect, obstacles)) {
    collidedY = true;
  } else {
    nextRect = yRect;
  }

  return {
    rect: nextRect,
    collidedX,
    collidedY
  };
}
