import { SCENE } from './state.js';
import { GROUND_Y, GRAVITY, JUMP_VELOCITY } from './constants.js';

const OUTLINE = '#2b1f16';
const STEEL = '#9aa7b5';
const STEEL_DARK = '#4e5860';
const CRIMSON = '#b23a48';
const GOLD = '#d4a017';

const KNIGHT_H = 64;

let stateRef = null;
let inputBound = false;

function bindInput() {
  if (inputBound) return;
  inputBound = true;
  const press = () => {
    if (stateRef) stateRef.input.action = true;
  };
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      press();
    }
  });
  window.addEventListener('pointerdown', press);
}

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

function drawKnight(ctx, x, y, airborne) {
  ctx.save();
  ctx.translate(x, y);

  if (airborne) {
    roundRect(ctx, 15, 50, 7, 14, 2);
    fillStroke(ctx, STEEL_DARK);
    roundRect(ctx, 26, 52, 7, 12, 2);
    fillStroke(ctx, STEEL_DARK);
  } else {
    roundRect(ctx, 16, 46, 7, 18, 2);
    fillStroke(ctx, STEEL_DARK);
    roundRect(ctx, 27, 46, 7, 18, 2);
    fillStroke(ctx, STEEL_DARK);
  }

  roundRect(ctx, 14, 22, 21, 26, 4);
  fillStroke(ctx, STEEL);

  ctx.beginPath();
  ctx.rect(9, 26, 6, 12);
  fillStroke(ctx, CRIMSON);

  roundRect(ctx, 17, 8, 16, 16, 3);
  fillStroke(ctx, STEEL);

  roundRect(ctx, 21, 12, 8, 6, 1);
  ctx.fillStyle = STEEL_DARK;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(33, 8);
  ctx.quadraticCurveTo(41, 6, 39, -1);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.restore();
}

export function updatePlayer(state, dt) {
  if (state.scene !== SCENE.RUNNING) return;
  stateRef = state;
  bindInput();

  const p = state.player;
  if (state.input.action && p.onGround) {
    p.vy = JUMP_VELOCITY;
    p.onGround = false;
  }

  p.vy += GRAVITY * dt;
  p.y += p.vy * dt;
  if (p.y >= GROUND_Y) {
    p.y = GROUND_Y;
    p.vy = 0;
    p.onGround = true;
  }
  p.runPhase += dt;
}

export function drawPlayer(ctx, state) {
  if (state.scene !== SCENE.RUNNING) return;
  const p = state.player;
  drawKnight(ctx, p.x, p.y - KNIGHT_H, !p.onGround);
}
