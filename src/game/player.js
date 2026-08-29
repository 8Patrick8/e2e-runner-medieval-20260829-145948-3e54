import { SCENE } from './state.js';
import { BASE_SPEED, GROUND_Y, GRAVITY, JUMP_VELOCITY } from './constants.js';

const OUTLINE = '#2b1f16';
const STEEL = '#9aa7b5';
const STEEL_DARK = '#4e5860';
const CRIMSON = '#b23a48';
const SKIN = '#e8c39e';
const GOLD = '#d4a017';

const KNIGHT_W = 48;
const KNIGHT_H = 64;
const RUN_FRAME_MS = 120;

function roundRect(ctx, x, y, w, h, r) {
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

function fillStroke(ctx, fill) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

function drawLegs(ctx, pose) {
  if (pose === 'jump') {
    roundRect(ctx, 15, 46, 7, 12, 2);
    fillStroke(ctx, STEEL_DARK);
    roundRect(ctx, 26, 48, 7, 10, 2);
    fillStroke(ctx, STEEL_DARK);
    return;
  }

  const leftLifted = pose === 'run1';
  if (leftLifted) {
    roundRect(ctx, 16, 44, 7, 14, 2);
    fillStroke(ctx, STEEL_DARK);
    roundRect(ctx, 26, 44, 7, 20, 2);
    fillStroke(ctx, STEEL_DARK);
  } else {
    roundRect(ctx, 16, 44, 7, 20, 2);
    fillStroke(ctx, STEEL_DARK);
    roundRect(ctx, 26, 44, 7, 14, 2);
    fillStroke(ctx, STEEL_DARK);
  }
}

function drawTorso(ctx) {
  roundRect(ctx, 14, 28, 21, 16, 3);
  fillStroke(ctx, CRIMSON);
  roundRect(ctx, 14, 22, 21, 14, 4);
  fillStroke(ctx, STEEL);
  roundRect(ctx, 33, 25, 5, 15, 2);
  fillStroke(ctx, STEEL_DARK);
  roundRect(ctx, 14, 41, 21, 4, 1);
  ctx.fillStyle = STEEL_DARK;
  ctx.fill();
}

function drawHelmet(ctx, pose) {
  roundRect(ctx, 17, 7, 16, 16, 3);
  fillStroke(ctx, STEEL);
  roundRect(ctx, 21, 13, 8, 5, 1);
  ctx.fillStyle = STEEL_DARK;
  ctx.fill();
  roundRect(ctx, 22, 18, 6, 4, 1);
  ctx.fillStyle = SKIN;
  ctx.fill();

  ctx.beginPath();
  if (pose === 'jump') {
    ctx.moveTo(30, 7);
    ctx.quadraticCurveTo(20, 5, 15, -1);
  } else {
    ctx.moveTo(30, 7);
    ctx.quadraticCurveTo(23, 3, 20, -4);
  }
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawKnight(ctx, x, y, pose) {
  ctx.save();
  ctx.translate(x, y);

  drawLegs(ctx, pose);
  drawTorso(ctx);
  drawHelmet(ctx, pose);

  ctx.restore();
}

export function updatePlayer(state, dt) {
  if (state.scene !== SCENE.RUNNING) return;

  const p = state.player;
  if (state.input.action && p.onGround) {
    p.vy = JUMP_VELOCITY;
    p.onGround = false;
  }

  p.vy += GRAVITY * dt;
  p.y += p.vy * dt;
  if (p.y >= GROUND_Y && p.vy >= 0) {
    p.y = GROUND_Y;
    p.vy = 0;
    p.onGround = true;
  }
  p.runPhase += dt * (state.speed / BASE_SPEED);
}

export function drawPlayer(ctx, state) {
  if (state.scene !== SCENE.RUNNING) return;
  const p = state.player;
  const pose = !p.onGround
    ? 'jump'
    : Math.floor((p.runPhase * 1000) / RUN_FRAME_MS) % 2 === 0
      ? 'run0'
      : 'run1';
  drawKnight(ctx, p.x, p.y - KNIGHT_H, pose);
}
