export type Point2D = {
  x: number;
  y: number;
};

export type Particle = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  ageMs: number;
  lifetimeMs: number;
  color: string;
  opacity: number;
};

export type ParticleBurstOptions = {
  count?: number;
  speed?: number;
  lifetimeMs?: number;
  radius?: number;
  colors?: string[];
};

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function fade(progress: number, from = 0, to = 1): number {
  return from + (to - from) * clamp01(progress);
}

export function blink(timeMs: number, intervalMs = 120, minOpacity = 0.25, maxOpacity = 1): number {
  return Math.floor(timeMs / intervalMs) % 2 === 0 ? maxOpacity : minOpacity;
}

export function knockback(progress: number, distance: number, angleRadians: number): Point2D {
  const amount = distance * (1 - clamp01(progress));
  return {
    x: Math.cos(angleRadians) * amount,
    y: Math.sin(angleRadians) * amount
  };
}

export function floatingMotion(timeMs: number, amplitude = 6, periodMs = 1200): Point2D {
  const phase = (timeMs / periodMs) * Math.PI * 2;
  return {
    x: Math.cos(phase * 0.5) * amplitude * 0.25,
    y: Math.sin(phase) * amplitude
  };
}

export function drawEllipseShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity = 0.28
): void {
  ctx.save();
  ctx.globalAlpha *= opacity;
  ctx.fillStyle = "#2f251d";
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function createParticleBurst(
  x: number,
  y: number,
  options: ParticleBurstOptions = {}
): Particle[] {
  const count = options.count ?? 16;
  const speed = options.speed ?? 120;
  const lifetimeMs = options.lifetimeMs ?? 520;
  const radius = options.radius ?? 4;
  const colors = options.colors ?? ["#ffd65a", "#fff4bd", "#f29c3d"];

  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const speedJitter = speed * (0.65 + ((index * 37) % 23) / 50);

    return {
      x,
      y,
      velocityX: Math.cos(angle) * speedJitter,
      velocityY: Math.sin(angle) * speedJitter,
      radius: radius * (0.75 + ((index * 17) % 19) / 40),
      ageMs: 0,
      lifetimeMs,
      color: colors[index % colors.length] ?? "#ffd65a",
      opacity: 1
    };
  });
}

export function simpleParticleBurst(
  x: number,
  y: number,
  options: ParticleBurstOptions = {}
): Particle[] {
  return createParticleBurst(x, y, options);
}

export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  const deltaMs = deltaTime * 1000;

  return particles
    .map((particle) => {
      const ageMs = particle.ageMs + deltaMs;
      const progress = clamp01(ageMs / particle.lifetimeMs);

      return {
        ...particle,
        x: particle.x + particle.velocityX * deltaTime,
        y: particle.y + particle.velocityY * deltaTime,
        velocityY: particle.velocityY + 90 * deltaTime,
        ageMs,
        opacity: 1 - progress
      };
    })
    .filter((particle) => particle.ageMs < particle.lifetimeMs);
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  ctx.save();
  for (const particle of particles) {
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawStarHitEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  radius = 54
): void {
  const t = clamp01(progress);
  const alpha = 1 - t;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = "#ffd05b";
  ctx.fillStyle = "#fff1a7";
  ctx.lineWidth = 3;

  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const start = radius * 0.16;
    const end = radius * (0.35 + t);
    const x0 = x + Math.cos(angle) * start;
    const y0 = y + Math.sin(angle) * start;
    const x1 = x + Math.cos(angle) * end;
    const y1 = y + Math.sin(angle) * end;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    drawStarPath(ctx, x1, y1, 8, 3);
    ctx.fill();
  }

  ctx.restore();
}

export function drawHealMistEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  radius = 70
): void {
  const t = clamp01(progress);

  ctx.save();
  ctx.globalAlpha *= 1 - t * 0.75;
  ctx.fillStyle = "rgba(245, 255, 255, 0.55)";

  for (let i = 0; i < 5; i += 1) {
    const offset = i * 18 - 36;
    ctx.beginPath();
    ctx.ellipse(
      x + offset * Math.cos(t * Math.PI),
      y - t * 46 - i * 8,
      radius * (0.24 + i * 0.03),
      radius * 0.12,
      -0.35,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}

export function drawShirasagiLightEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  radius = 76
): void {
  const t = clamp01(progress);

  ctx.save();
  ctx.globalAlpha *= 1 - t * 0.55;
  ctx.strokeStyle = "#fff9dd";
  ctx.fillStyle = "rgba(255, 255, 246, 0.5)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * (0.4 + t), radius * 0.16, -0.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.55, y + 8);
  ctx.quadraticCurveTo(x, y - radius * (0.35 + t * 0.5), x + radius * 0.7, y - 16);
  ctx.stroke();
  ctx.restore();
}

export function drawSealLightEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  radius = 82
): void {
  const t = clamp01(progress);

  ctx.save();
  ctx.globalAlpha *= 1 - t * 0.35;
  ctx.strokeStyle = "#ffe47a";
  ctx.fillStyle = "rgba(255, 247, 204, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius * (0.35 + t * 0.65), 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2 + t * Math.PI;
    drawStarPath(
      ctx,
      x + Math.cos(angle) * radius * (0.35 + t * 0.6),
      y + Math.sin(angle) * radius * (0.35 + t * 0.6),
      9,
      4
    );
    ctx.fill();
  }

  ctx.restore();
}

function drawStarPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number
): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
}
