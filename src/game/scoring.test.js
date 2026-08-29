import { describe, it, expect, beforeEach } from 'vitest';
import {
  initScoring,
  updateScoring,
  loadHighScore,
  saveHighScore,
} from './scoring.js';
import { createGameState, SCENE } from './state.js';
import { BASE_SPEED, MAX_SPEED, SPEED_RAMP, SCORE_PER_METER } from './constants.js';

const HIGH_SCORE_KEY = 'highscore';

function installStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('loadHighScore', () => {
  beforeEach(() => installStorage());

  it('returns 0 when no highscore is stored', () => {
    expect(loadHighScore()).toBe(0);
  });

  it('returns 0 for a non-numeric value', () => {
    localStorage.setItem(HIGH_SCORE_KEY, 'abc');
    expect(loadHighScore()).toBe(0);
  });

  it('returns 0 for a negative value', () => {
    localStorage.setItem(HIGH_SCORE_KEY, '-5');
    expect(loadHighScore()).toBe(0);
  });

  it('returns 0 for a non-finite value', () => {
    localStorage.setItem(HIGH_SCORE_KEY, 'Infinity');
    expect(loadHighScore()).toBe(0);
  });

  it('returns the stored finite value', () => {
    localStorage.setItem(HIGH_SCORE_KEY, '1234');
    expect(loadHighScore()).toBe(1234);
  });
});

describe('initScoring', () => {
  beforeEach(() => installStorage());

  it('loads a stored highscore into state.highScore', () => {
    localStorage.setItem(HIGH_SCORE_KEY, '2000');
    const state = createGameState();
    initScoring(state);
    expect(state.highScore).toBe(2000);
    expect(state.isNewRecord).toBe(false);
  });

  it('falls back to 0 for an invalid stored value', () => {
    localStorage.setItem(HIGH_SCORE_KEY, 'oops');
    const state = createGameState();
    initScoring(state);
    expect(state.highScore).toBe(0);
  });
});

describe('updateScoring', () => {
  beforeEach(() => installStorage());

  it('advances distance by speed*dt and derives score from distance', () => {
    const state = createGameState();
    state.scene = SCENE.RUNNING;
    state.time = 0;
    const dt = 0.1;
    updateScoring(state, dt);
    expect(state.distance).toBeCloseTo(BASE_SPEED * dt, 5);
    expect(state.score).toBe(Math.floor(state.distance * SCORE_PER_METER));
  });

  it('ramps speed with elapsed time', () => {
    const state = createGameState();
    state.scene = SCENE.RUNNING;
    state.time = 10;
    updateScoring(state, 0.016);
    expect(state.speed).toBeCloseTo(BASE_SPEED + 10 * SPEED_RAMP, 5);
  });

  it('caps speed at MAX_SPEED', () => {
    const state = createGameState();
    state.scene = SCENE.RUNNING;
    state.time = 1_000_000;
    updateScoring(state, 0.016);
    expect(state.speed).toBe(MAX_SPEED);
  });

  it('does not change score or distance when not running', () => {
    const state = createGameState();
    initScoring(state);
    state.scene = SCENE.GAMEOVER;
    state.distance = 42;
    state.score = 42;
    updateScoring(state, 0.016);
    expect(state.distance).toBe(42);
    expect(state.score).toBe(42);
  });
});

describe('highscore record handling', () => {
  beforeEach(() => installStorage());

  it('flags and persists a new record at gameover', () => {
    localStorage.setItem(HIGH_SCORE_KEY, '100');
    const state = createGameState();
    initScoring(state);
    state.scene = SCENE.GAMEOVER;
    state.score = 500;
    updateScoring(state, 0);
    expect(state.isNewRecord).toBe(true);
    expect(state.highScore).toBe(500);
    expect(loadHighScore()).toBe(500);
  });

  it('does not flag a record when the score does not beat the highscore', () => {
    localStorage.setItem(HIGH_SCORE_KEY, '100');
    const state = createGameState();
    initScoring(state);
    state.scene = SCENE.GAMEOVER;
    state.score = 50;
    updateScoring(state, 0);
    expect(state.isNewRecord).toBe(false);
    expect(state.highScore).toBe(100);
    expect(loadHighScore()).toBe(100);
  });

  it('checks the record only once at gameover', () => {
    localStorage.setItem(HIGH_SCORE_KEY, '100');
    const state = createGameState();
    initScoring(state);
    state.scene = SCENE.GAMEOVER;
    state.score = 500;
    updateScoring(state, 0);
    state.score = 9999;
    updateScoring(state, 0);
    expect(state.highScore).toBe(500);
    expect(loadHighScore()).toBe(500);
  });

  it('re-checks the record after a restart', () => {
    localStorage.setItem(HIGH_SCORE_KEY, '100');
    const state = createGameState();
    initScoring(state);

    state.scene = SCENE.GAMEOVER;
    state.score = 500;
    updateScoring(state, 0);
    expect(state.isNewRecord).toBe(true);
    expect(state.highScore).toBe(500);

    state.scene = SCENE.RUNNING;
    state.distance = 0;
    state.score = 0;
    updateScoring(state, 0);
    expect(state.isNewRecord).toBe(false);

    state.scene = SCENE.GAMEOVER;
    state.score = 300;
    updateScoring(state, 0);
    expect(state.isNewRecord).toBe(false);
    expect(state.highScore).toBe(500);
  });
});
