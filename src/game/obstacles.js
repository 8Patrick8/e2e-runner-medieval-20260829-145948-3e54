import { SCENE } from './state.js';
import { CANVAS_W, GROUND_Y, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP } from './constants.js';

const OUTLINE = '#2b1f16';
const WOOD = '#8b5a2b';
const WOOD_DARK = '#6b4320';
const WOOD_LIGHT = '#a8723d';
const METAL = '#3e2f23';
const FENCE_WOOD = '#7a5c3a';
const FENCE_DARK = '#5d4529';

const BARREL_W = 36;
const BARREL_H = 44;
const FENCE_W = 44;
const FENCE_H = 40;

// The knight sprite is 48×64 (left edge at player.x, feet at player.y).
// Its collision hitbox is the DESIGN-spec 34×56 box inset inside the sprite.
const KNIGHT_SPRITE_W = 48;
const KNIGHT_HITBOX_W = 34;
const KNIGHT_HITBOX_H = 56;

// Spawn bookkeeping lives per-state so a fresh test/game never leaks into
// another. `traveled` is the distance since the last spawn, `gap` the
// randomly chosen distance until the next one.
const spawnState = new WeakMap();

function randomGap() {
  return OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
}

function getSpawn(state) {
  let spawn = spawnState.get(state);
  if (!spawn) {
    spawn = { traveled: 0, gap: randomGap() };
    spawnState.set(state, spawn);
  }
  return spawn;
}

function makeObstacle(type) {
  const t = type ?? (Math.random() < 0.5 ? 'barrel' : 'fence');
  if (t === 'fence') {
    return { x: CANVAS_W, y: GROUND_Y - FENCE_H, w: FENCE_W, h: FENCE_H, type: 'fence' };
  }
  return { x: CANVAS_W, y: GROUND_Y - BARREL_H, w: BARREL_W, h: BARREL_H, type: 'barrel' };
}

function playerHitbox(state) {
  const p = state.player;
  return {
    x: p.x + (KNIGHT_SPRITE_W - KNIGHT_HITBOX_W) / 2,
    y: p.y - KNIGHT_HITBOX_H,
    w: KNIGHT_HITBOX_W,
    h: KNIGHT_HITBOX_H,
  };
}

function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function updateObstacles(state, dt) {
  if (state.scene !== SCENE.RUNNING) return;

  const spawn = getSpawn(state);

  for (const o of state.obstacles) {
    o.x -= state.speed * dt;
  }

  let keep = 0;
  while (keep < state.obstacles.length && state.obstacles[keep].x + state.obstacles[keep].w < 0) {
    keep += 1;
  }
  if (keep > 0) state.obstacles.splice(0, keep);

  spawn.traveled += state.speed * dt;
  while (spawn.traveled >= spawn.gap) {
    spawn.traveled -= spawn.gap;
    state.obstacles.push(makeObstacle());
    spawn.gap = randomGap();
  }

  const player = playerHitbox(state);
  for (const o of state.obstacles) {
    if (aabbOverlap(player, o)) {
      state.scene = SCENE.GAMEOVER;
      return;
    }
  }
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function rollFrame(x) {
  const f = Math.floor(x / 6) % 2;
  return f < 0 ? f + 2 : f;
}

function drawBarrel(ctx, x, y, frame) {
  const w = BARREL_W;
  const h = BARREL_H;
  ctx.save();
  ctx.translate(x, y);

  roundRectPath(ctx, 0, 0, w, h, 6);
  ctx.fillStyle = WOOD;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 1;
  for (const sx of [9, 18, 27]) {
    ctx.beginPath();
    ctx.moveTo(sx, 2);
    ctx.lineTo(sx, h - 2);
    ctx.stroke();
  }

  ctx.fillStyle = WOOD_LIGHT;
  ctx.fillRect(3, 7, 4, h - 14);

  const shift = frame ? 3 : -3;
  ctx.fillStyle = METAL;
  for (const band of [13, 26]) {
    ctx.fillRect(0, band + shift, w, 5);
  }

  ctx.restore();
}

function drawFence(ctx, x, y) {
  const w = FENCE_W;
  const h = FENCE_H;
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = FENCE_DARK;
  ctx.fillRect(2, 11, w - 4, 6);
  ctx.fillRect(2, 25, w - 4, 6);

  const slatW = 12;
  const slatGap = (w - 3 * slatW) / 2;
  for (let i = 0; i < 3; i += 1) {
    const sx = i * (slatW + slatGap);
    ctx.beginPath();
    ctx.moveTo(sx, 8);
    ctx.lineTo(sx + slatW / 2, 0);
    ctx.lineTo(sx + slatW, 8);
    ctx.lineTo(sx + slatW, h);
    ctx.lineTo(sx, h);
    ctx.closePath();
    ctx.fillStyle = FENCE_WOOD;
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = WOOD_LIGHT;
    ctx.fillRect(sx + 2, 10, 3, h - 14);
  }

  ctx.restore();
}

export function drawObstacles(ctx, state) {
  if (state.scene !== SCENE.RUNNING) return;
  for (const o of state.obstacles) {
    if (o.type === 'fence') {
      drawFence(ctx, o.x, o.y);
    } else {
      drawBarrel(ctx, o.x, o.y, rollFrame(o.x));
    }
  }
}
