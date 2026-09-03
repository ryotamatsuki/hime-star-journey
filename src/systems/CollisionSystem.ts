export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type WalkablePolygon = Point[] | {
  points: Point[];
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

export function isRectWithinWalkableAreas(
  rect: Rect,
  walkableRects: Rect[],
  walkablePolygons: WalkablePolygon[]
): boolean {
  const samplePoints = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x, y: rect.y + rect.height },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  ];

  return samplePoints.every((point) =>
    walkableRects.some((walkableRect) => pointInRect(point, walkableRect))
    || walkablePolygons.some((polygon) => pointInPolygon(point, polygon))
  );
}

export function moveRectWithinWalkableAreas(
  rect: Rect,
  deltaX: number,
  deltaY: number,
  walkableRects: Rect[],
  walkablePolygons: WalkablePolygon[],
  bounds: Rect,
  collisionRects: Rect[] = []
): MovementResult {
  let nextRect = { ...rect };
  let collidedX = false;
  let collidedY = false;

  const xRect = clampToBounds({ ...nextRect, x: nextRect.x + deltaX }, bounds);
  if (isRectWithinWalkableAreas(xRect, walkableRects, walkablePolygons) && !wouldCollide(xRect, collisionRects)) {
    nextRect = xRect;
  } else {
    collidedX = true;
  }

  const yRect = clampToBounds({ ...nextRect, y: nextRect.y + deltaY }, bounds);
  if (isRectWithinWalkableAreas(yRect, walkableRects, walkablePolygons) && !wouldCollide(yRect, collisionRects)) {
    nextRect = yRect;
  } else {
    collidedY = true;
  }

  return {
    rect: nextRect,
    collidedX,
    collidedY
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

function pointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height;
}

function pointInPolygon(point: Point, polygon: WalkablePolygon): boolean {
  let inside = false;
  const points = Array.isArray(polygon) ? polygon : polygon.points;

  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const a = points[i];
    const b = points[j];
    if (!a || !b) continue;
    if (pointOnSegment(point, a, b)) return true;

    const crosses = ((a.y > point.y) !== (b.y > point.y))
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }

  return inside;
}

function pointOnSegment(point: Point, start: Point, end: Point): boolean {
  const cross = (point.y - start.y) * (end.x - start.x)
    - (point.x - start.x) * (end.y - start.y);
  if (Math.abs(cross) > 0.001) return false;

  return point.x >= Math.min(start.x, end.x) - 0.001
    && point.x <= Math.max(start.x, end.x) + 0.001
    && point.y >= Math.min(start.y, end.y) - 0.001
    && point.y <= Math.max(start.y, end.y) + 0.001;
}
