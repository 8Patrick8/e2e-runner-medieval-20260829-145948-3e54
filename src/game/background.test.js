import { describe, it, expect } from 'vitest';
import { updateBackground, drawBackground } from './background.js';
import { createGameState } from './state.js';

describe('updateBackground', () => {
  it('advances every layer offset by speed * factor * dt', () => {
    const state = createGameState();
    const dt = 0.01;
    updateBackground(state, dt);

    // speed = BASE_SPEED (300); factors: far .25, mid .5, near .7, ground 1.0
    expect(state.background.far).toBeCloseTo(300 * 0.25 * dt, 6);
    expect(state.background.mid).toBeCloseTo(300 * 0.5 * dt, 6);
    expect(state.background.near).toBeCloseTo(300 * 0.7 * dt, 6);
    expect(state.background.ground).toBeCloseTo(300 * 1.0 * dt, 6);
  });

  it('scrolls layers at increasing speed (parallax depth order)', () => {
    const state = createGameState();
    updateBackground(state, 0.05);

    // Slower layers stay closer to zero: far < mid < near < ground.
    expect(state.background.far).toBeLessThan(state.background.mid);
    expect(state.background.mid).toBeLessThan(state.background.near);
    expect(state.background.near).toBeLessThan(state.background.ground);
  });

  it('keeps every offset inside [0, period) after long runs (seamless wrap)', () => {
    const state = createGameState();
    for (let i = 0; i < 10000; i++) {
      updateBackground(state, 0.016);
    }
    const bg = state.background;
    expect(bg.far).toBeGreaterThanOrEqual(0);
    expect(bg.far).toBeLessThan(640);
    expect(bg.mid).toBeGreaterThanOrEqual(0);
    expect(bg.mid).toBeLessThan(480);
    expect(bg.near).toBeGreaterThanOrEqual(0);
    expect(bg.near).toBeLessThan(360);
    expect(bg.ground).toBeGreaterThanOrEqual(0);
    expect(bg.ground).toBeLessThan(48);
  });

  it('keeps scrolling while scene is start or gameover', () => {
    const startState = createGameState();
    startState.scene = 'start';
    const gameoverState = createGameState();
    gameoverState.scene = 'gameover';

    updateBackground(startState, 0.02);
    updateBackground(gameoverState, 0.02);

    expect(startState.background.ground).toBeGreaterThan(0);
    expect(gameoverState.background.ground).toBeGreaterThan(0);
  });
});

describe('drawBackground', () => {
  it('draws without throwing using a stubbed canvas context', () => {
    const ctx = {
      fillRect: () => {},
      fill: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      closePath: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
    };

    const state = createGameState();
    updateBackground(state, 0.016);

    expect(() => drawBackground(ctx, state)).not.toThrow();
  });
});
