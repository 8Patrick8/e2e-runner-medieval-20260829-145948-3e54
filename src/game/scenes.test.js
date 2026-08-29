import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createGameState, SCENE } from './state.js';
import { initScenes, updateScenes } from './scenes.js';
import { BASE_SPEED, GROUND_Y, KNIGHT_X } from './constants.js';

let elements = {};

function makeElement() {
  const classes = new Set();
  const el = { hidden: true, textContent: '' };
  el.classList = {
    toggle(name, force) {
      if (force) classes.add(name);
      else classes.delete(name);
    },
    contains(name) {
      return classes.has(name);
    },
  };
  // Guard AC-11: any write through innerHTML would make the test explode.
  Object.defineProperty(el, 'innerHTML', {
    set() {
      throw new Error('display values must be written via textContent, not innerHTML');
    },
  });
  return el;
}

function installDom() {
  const els = {
    'start-screen': makeElement(),
    'gameover-screen': makeElement(),
    'gameover-score': makeElement(),
    'gameover-highscore': makeElement(),
  };
  globalThis.document = {
    getElementById(id) {
      return els[id] || null;
    },
  };
  return els;
}

function uninstallDom() {
  delete globalThis.document;
  delete globalThis.window;
}

beforeEach(() => {
  elements = installDom();
});

afterEach(() => {
  uninstallDom();
  elements = {};
});

describe('initScenes', () => {
  it('overwrites the skeleton initial scene with start and shows the start overlay', () => {
    const s = createGameState();
    expect(s.scene).toBe(SCENE.RUNNING); // skeleton default
    initScenes(s);
    expect(s.scene).toBe(SCENE.START);
    expect(elements['start-screen'].hidden).toBe(false);
    expect(elements['gameover-screen'].hidden).toBe(true);
  });
});

describe('start → running', () => {
  it('starts on action: hides the overlay, resets run state and switches to running', () => {
    const s = createGameState();
    initScenes(s);
    s.score = 999;
    s.distance = 500;
    s.speed = 700;
    s.obstacles = [{ x: 100, y: 400, w: 36, h: 44, type: 'barrel' }];
    s.player.y = GROUND_Y - 200;
    s.player.vy = -100;
    s.player.onGround = false;
    s.input.action = true;

    updateScenes(s, 0);

    expect(s.scene).toBe(SCENE.RUNNING);
    expect(elements['start-screen'].hidden).toBe(true);
    expect(s.score).toBe(0);
    expect(s.distance).toBe(0);
    expect(s.speed).toBe(BASE_SPEED);
    expect(s.obstacles).toEqual([]);
    expect(s.player.x).toBe(KNIGHT_X);
    expect(s.player.y).toBe(GROUND_Y);
    expect(s.player.vy).toBe(0);
    expect(s.player.onGround).toBe(true);
  });

  it('stays on the start screen without an action', () => {
    const s = createGameState();
    initScenes(s);
    updateScenes(s, 0);
    expect(s.scene).toBe(SCENE.START);
    expect(elements['start-screen'].hidden).toBe(false);
  });
});

describe('gameover screen', () => {
  it('shows the overlay and writes score and highscore via textContent', () => {
    const s = createGameState();
    initScenes(s);
    s.scene = SCENE.GAMEOVER;
    s.score = 1234;
    s.highScore = 5640;
    updateScenes(s, 0);

    expect(elements['gameover-screen'].hidden).toBe(false);
    expect(elements['gameover-score'].textContent).toBe('1234');
    expect(elements['gameover-highscore'].textContent).toBe('5640');
  });

  it('highlights the highscore only while it is a new record', () => {
    const s = createGameState();
    initScenes(s);
    s.scene = SCENE.GAMEOVER;

    s.isNewRecord = true;
    updateScenes(s, 0);
    expect(elements['gameover-highscore'].classList.contains('hud-score--record')).toBe(true);

    s.isNewRecord = false;
    updateScenes(s, 0);
    expect(elements['gameover-highscore'].classList.contains('hud-score--record')).toBe(false);
  });
});

describe('gameover → restart', () => {
  function prepareGameover(s) {
    s.scene = SCENE.GAMEOVER;
    s.score = 500;
    s.distance = 300;
    s.speed = 600;
    s.obstacles = [{ x: 100, y: 400, w: 36, h: 44, type: 'barrel' }];
    s.player.y = GROUND_Y - 120;
    s.player.vy = -50;
    s.player.onGround = false;
    s.input.action = false;
    updateScenes(s, 0);
  }

  it('resets score, distance, obstacles, speed and player on restart', () => {
    const s = createGameState();
    initScenes(s);
    prepareGameover(s);

    s.input.action = true;
    updateScenes(s, 0);

    expect(s.scene).toBe(SCENE.RUNNING);
    expect(elements['gameover-screen'].hidden).toBe(true);
    expect(s.score).toBe(0);
    expect(s.distance).toBe(0);
    expect(s.speed).toBe(BASE_SPEED);
    expect(s.obstacles).toEqual([]);
    expect(s.player.x).toBe(KNIGHT_X);
    expect(s.player.y).toBe(GROUND_Y);
    expect(s.player.vy).toBe(0);
    expect(s.player.onGround).toBe(true);
    expect(s.isNewRecord).toBe(false);
  });

  it('preserves the highscore across a restart', () => {
    const s = createGameState();
    initScenes(s);
    prepareGameover(s);
    s.highScore = 999;

    s.input.action = true;
    updateScenes(s, 0);

    expect(s.scene).toBe(SCENE.RUNNING);
    expect(s.highScore).toBe(999);
  });

  it('does not restart while the action is still held from entering gameover', () => {
    const s = createGameState();
    initScenes(s);
    s.scene = SCENE.GAMEOVER;
    s.input.action = true;
    updateScenes(s, 0);
    expect(s.scene).toBe(SCENE.GAMEOVER);

    updateScenes(s, 0);
    expect(s.scene).toBe(SCENE.GAMEOVER);

    s.input.action = false;
    updateScenes(s, 0);
    expect(s.scene).toBe(SCENE.GAMEOVER);

    s.input.action = true;
    updateScenes(s, 0);
    expect(s.scene).toBe(SCENE.RUNNING);
  });
});

describe('input binding', () => {
  it('sets input.action on Space and on pointerdown', () => {
    const listeners = {};
    globalThis.window = {
      addEventListener(type, fn) {
        listeners[type] = fn;
      },
    };

    const s = createGameState();
    initScenes(s);

    listeners.keydown({ code: 'Space', preventDefault() {} });
    expect(s.input.action).toBe(true);

    s.input.action = false;
    listeners.pointerdown();
    expect(s.input.action).toBe(true);
  });
});
