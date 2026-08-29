import { SCENE } from './state.js';
import { BASE_SPEED, GROUND_Y, KNIGHT_X } from './constants.js';

const START_SCREEN = 'start-screen';
const GAMEOVER_SCREEN = 'gameover-screen';
const GAMEOVER_SCORE = 'gameover-score';
const GAMEOVER_HIGHSCORE = 'gameover-highscore';
const RECORD_CLASS = 'hud-score--record';

function byId(id) {
  if (typeof document === 'undefined') return null;
  return document.getElementById(id);
}

function show(id) {
  const node = byId(id);
  if (node) node.hidden = false;
}

function hide(id) {
  const node = byId(id);
  if (node) node.hidden = true;
}

// Display values are written EXCLUSIVELY via textContent (never innerHTML).
function writeText(id, value) {
  const node = byId(id);
  if (node) node.textContent = String(value);
}

// The player module binds input only once the game is running, which would
// leave the start screen deaf to Space/click. Bind the shared one-shot signal
// here as well so start/gameover transitions react to input from the very
// first frame. Writing to the same state.input.action the player consumes
// keeps a single source of truth.
let inputStateRef = null;
let inputBound = false;

function bindInput(state) {
  inputStateRef = state;
  if (inputBound || typeof window === 'undefined') return;
  inputBound = true;
  const press = () => {
    if (inputStateRef) inputStateRef.input.action = true;
  };
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      press();
    }
  });
  window.addEventListener('pointerdown', press);
}

function resetRun(state) {
  state.score = 0;
  state.distance = 0;
  state.time = 0;
  state.speed = BASE_SPEED;
  state.isNewRecord = false;
  state.obstacles = [];
  const p = state.player;
  p.x = KNIGHT_X;
  p.y = GROUND_Y;
  p.vy = 0;
  p.onGround = true;
  p.runPhase = 0;
}

// Per-state transition bookkeeping. `restartArmed` gates the gameover restart
// on a fresh press so a Space that was still held at the moment of death does
// not skip straight past the game-over screen.
const sceneGate = new WeakMap();

function gate(state) {
  let g = sceneGate.get(state);
  if (!g) {
    g = { prevScene: null, restartArmed: false };
    sceneGate.set(state, g);
  }
  return g;
}

export function initScenes(state) {
  bindInput(state);
  state.scene = SCENE.START;
  show(START_SCREEN);
  hide(GAMEOVER_SCREEN);
  resetRun(state);
  const g = gate(state);
  g.prevScene = SCENE.START;
  g.restartArmed = false;
}

export function updateScenes(state, dt) {
  const g = gate(state);
  const scene = state.scene;
  const action = state.input.action === true;

  if (scene === SCENE.START) {
    if (action) {
      hide(START_SCREEN);
      resetRun(state);
      state.scene = SCENE.RUNNING;
    }
  } else if (scene === SCENE.GAMEOVER) {
    if (g.prevScene !== SCENE.GAMEOVER) {
      show(GAMEOVER_SCREEN);
      g.restartArmed = false;
    }

    writeText(GAMEOVER_SCORE, state.score);
    writeText(GAMEOVER_HIGHSCORE, state.highScore);
    const highNode = byId(GAMEOVER_HIGHSCORE);
    if (highNode) highNode.classList.toggle(RECORD_CLASS, state.isNewRecord === true);

    if (!action) {
      g.restartArmed = true;
    } else if (g.restartArmed) {
      hide(GAMEOVER_SCREEN);
      resetRun(state);
      state.scene = SCENE.RUNNING;
      g.restartArmed = false;
    }
  }

  g.prevScene = scene;
}
