import { createGameState } from './game/state.js';
import { CANVAS_W, CANVAS_H } from './game/constants.js';
import { initInput } from './game/input.js';
import { updatePlayer, drawPlayer } from './game/player.js';
import { updateObstacles, drawObstacles } from './game/obstacles.js';
import { updateBackground, drawBackground } from './game/background.js';
import { initScoring, updateScoring } from './game/scoring.js';
import { initHud, updateHud } from './game/hud.js';
import { initScenes, updateScenes } from './game/scenes.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const state = createGameState();

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  canvas.width = Math.floor(vw * dpr);
  canvas.height = Math.floor(vh * dpr);
  canvas.style.width = `${vw}px`;
  canvas.style.height = `${vh}px`;

  const scale = Math.min(vw / CANVAS_W, vh / CANVAS_H);
  const ox = (vw - CANVAS_W * scale) / 2;
  const oy = (vh - CANVAS_H * scale) / 2;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
}

Object.defineProperty(window, '__TEST_API__', {
  configurable: false,
  writable: false,
  value: Object.freeze({
    get scene() {
      return state.scene;
    },
    get player() {
      return Object.freeze({ x: state.player.x, y: state.player.y });
    },
    get score() {
      return state.score;
    },
  }),
});

initInput(state);
initScoring(state);
initHud(state);
initScenes(state);

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let lastTime = 0;

function frame(now) {
  const dt = lastTime ? (now - lastTime) / 1000 : 0;
  lastTime = now;

  state.time += dt;

  updateBackground(state, dt);
  updatePlayer(state, dt);
  updateObstacles(state, dt);
  updateScoring(state, dt);
  updateScenes(state, dt);
  updateHud(state);

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx, state);
  drawObstacles(ctx, state);
  drawPlayer(ctx, state);

  state.input.action = false;

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
