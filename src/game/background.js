import { CANVAS_W, CANVAS_H, GROUND_Y } from './constants.js';

// Design tokens (DESIGN.md "Hintergrund-Parallax" + "Colors").
const SKY = '#8ec5d6';
const SKY_LIGHT = '#b8dce8';
const CLOUD = '#f4f1e8';
const CASTLE = '#6e5a4b';
const CASTLE_DARK = '#4a3b30';
const CASTLE_LIGHT = '#8f7a66';
const HILL_FAR = '#7a9e6d';
const HILL_MID = '#5d7f52';
const TREE_FOLIAGE = '#44633d'; // deep green, gently improvised from the hill_near hue (no tree token in DESIGN.md)
const TREE_TRUNK = '#4a3320';
const GROUND = '#6b4a2f';
const GROUND_DARK = '#4a3320';
const GROUND_LIGHT = '#8a6a45';

// Parallax factors per layer (relative to forward speed).
const FAR_FACTOR = 0.25; // ferne Burg + ferne Hügel
const MID_FACTOR = 0.5; // mittlere Hügel
const NEAR_FACTOR = 0.7; // nahe Bäume
const GROUND_FACTOR = 1.0; // Boden
const CLOUD_FACTOR = 0.1; // Wolken (langsamste Ebene)

// Pattern widths (px) used for seamless wrapping of each tiled layer.
const FAR_PERIOD = 640;
const MID_PERIOD = 480;
const NEAR_PERIOD = 360;
const GROUND_PERIOD = 48;
const CLOUD_PERIOD = 384;

function wrap(value, period) {
  return ((value % period) + period) % period;
}

// Draws `fn(x)` for every tile of `period` starting just left of 0 up to width,
// so the layer always covers the full canvas no matter the current offset.
function forEachTile(offset, period, width, fn) {
  const start = -wrap(offset, period);
  for (let x = start; x < width; x += period) {
    fn(x);
  }
}

// The background always runs — even during 'start' and 'gameover' — so this
// function is deliberately NOT gated on state.scene.
export function updateBackground(state, dt) {
  const bg = state.background;
  const d = state.speed * dt;
  bg.far = wrap(bg.far + d * FAR_FACTOR, FAR_PERIOD);
  bg.mid = wrap(bg.mid + d * MID_FACTOR, MID_PERIOD);
  bg.near = wrap(bg.near + d * NEAR_FACTOR, NEAR_PERIOD);
  bg.ground = wrap(bg.ground + d * GROUND_FACTOR, GROUND_PERIOD);
}

export function drawBackground(ctx, state) {
  const bg = state.background;
  drawSky(ctx, bg);
  drawFarLayer(ctx, bg.far);
  drawMidLayer(ctx, bg.mid);
  drawNearLayer(ctx, bg.near);
  drawGroundLayer(ctx, bg.ground);
}

function drawSky(ctx, bg) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, SKY_LIGHT);
  gradient.addColorStop(1, SKY);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);

  // Clouds drift at 0.1x, derived from the far offset so they keep moving
  // even when the scene is not 'running'.
  const cloudOffset = bg.far * (CLOUD_FACTOR / FAR_FACTOR);
  ctx.fillStyle = CLOUD;
  forEachTile(cloudOffset, CLOUD_PERIOD, CANVAS_W, (x) => {
    drawCloud(ctx, x + 30, 90, 1);
    drawCloud(ctx, x + 210, 150, 0.7);
  });
}

function drawCloud(ctx, x, y, scale) {
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * scale, 16 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 22 * scale, y + 6 * scale, 22 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 24 * scale, y + 5 * scale, 24 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x, y - 10 * scale, 24 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHill(ctx, x0, period, baseY, peakY, color) {
  const mid = x0 + period / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0, baseY);
  ctx.quadraticCurveTo(mid, peakY, x0 + period, baseY);
  ctx.lineTo(x0 + period, GROUND_Y);
  ctx.lineTo(x0, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawFarLayer(ctx, offset) {
  forEachTile(offset, FAR_PERIOD, CANVAS_W, (x) => {
    drawHill(ctx, x, FAR_PERIOD, 430, 360, HILL_FAR);
    drawCastle(ctx, x + 40, 400);
  });
}

function drawMidLayer(ctx, offset) {
  forEachTile(offset, MID_PERIOD, CANVAS_W, (x) => {
    drawHill(ctx, x, MID_PERIOD, 470, 400, HILL_MID);
  });
}

function drawNearLayer(ctx, offset) {
  forEachTile(offset, NEAR_PERIOD, CANVAS_W, (x) => {
    drawTree(ctx, x + 80, GROUND_Y, 1.15);
    drawTree(ctx, x + 250, GROUND_Y, 0.85);
  });
}

function drawGroundLayer(ctx, offset) {
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

  ctx.fillStyle = GROUND_LIGHT;
  forEachTile(offset, GROUND_PERIOD, CANVAS_W, (x) => {
    ctx.fillRect(x, GROUND_Y, 12, CANVAS_H - GROUND_Y);
  });

  ctx.fillStyle = GROUND_DARK;
  forEachTile(offset, GROUND_PERIOD, CANVAS_W, (x) => {
    ctx.fillRect(x + 24, GROUND_Y, 8, CANVAS_H - GROUND_Y);
  });

  // Dark top border separates the ground from the hills behind it.
  ctx.fillStyle = GROUND_DARK;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 3);
}

function drawCastle(ctx, x, baseY) {
  const wallW = 180;
  const wallH = 70;
  const wallTop = baseY - wallH;
  const towerW = 40;
  const towerH = 100;
  const towerTop = baseY - towerH;
  const merlonH = 12;

  ctx.fillStyle = CASTLE;
  // Main wall and two side towers.
  ctx.fillRect(x, wallTop, wallW, wallH);
  ctx.fillRect(x, towerTop, towerW, towerH);
  ctx.fillRect(x + wallW - towerW, towerTop, towerW, towerH);

  // Crenellations (merlons) on the wall and both towers.
  ctx.fillStyle = CASTLE_LIGHT;
  for (let mx = x; mx < x + wallW; mx += 22) {
    ctx.fillRect(mx, wallTop - merlonH, 14, merlonH);
  }
  for (let mx = x; mx < x + towerW; mx += 16) {
    ctx.fillRect(mx, towerTop - merlonH, 10, merlonH);
  }
  for (let mx = x + wallW - towerW; mx < x + wallW; mx += 16) {
    ctx.fillRect(mx, towerTop - merlonH, 10, merlonH);
  }

  // Arched gate in the middle of the wall.
  ctx.fillStyle = CASTLE_DARK;
  ctx.beginPath();
  ctx.moveTo(x + wallW / 2 - 16, baseY);
  ctx.lineTo(x + wallW / 2 - 16, wallTop + 28);
  ctx.arc(x + wallW / 2, wallTop + 28, 16, Math.PI, 0);
  ctx.lineTo(x + wallW / 2 + 16, baseY);
  ctx.closePath();
  ctx.fill();

  // 2px dark windows on the towers.
  ctx.fillStyle = CASTLE_DARK;
  const leftWinX = x + towerW / 2 - 1;
  const rightWinX = x + wallW - towerW + towerW / 2 - 1;
  ctx.fillRect(leftWinX, towerTop + 24, 2, 8);
  ctx.fillRect(rightWinX, towerTop + 24, 2, 8);
  ctx.fillRect(leftWinX, towerTop + 48, 2, 8);
  ctx.fillRect(rightWinX, towerTop + 48, 2, 8);
}

function drawTree(ctx, x, baseY, scale) {
  const trunkW = 10 * scale;
  const trunkH = 30 * scale;

  ctx.fillStyle = TREE_TRUNK;
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  ctx.fillStyle = TREE_FOLIAGE;
  // Two stacked triangles form a simple conifer silhouette.
  ctx.beginPath();
  ctx.moveTo(x, baseY - trunkH - 60 * scale);
  ctx.lineTo(x - 26 * scale, baseY - trunkH + 6 * scale);
  ctx.lineTo(x + 26 * scale, baseY - trunkH + 6 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, baseY - trunkH - 38 * scale);
  ctx.lineTo(x - 20 * scale, baseY - trunkH + 12 * scale);
  ctx.lineTo(x + 20 * scale, baseY - trunkH + 12 * scale);
  ctx.closePath();
  ctx.fill();
}
