import { describe, it, expect } from 'vitest';
import { createGameState, SCENE } from './state.js';
import { updatePlayer, drawPlayer } from './player.js';
import { BASE_SPEED, GROUND_Y, JUMP_VELOCITY } from './constants.js';

const DT = 1 / 60;

function makeRunningState() {
  const state = createGameState();
  state.scene = SCENE.RUNNING;
  return state;
}

function mockCtx() {
  const calls = [];
  const ctx = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === '__calls') return calls;
        return () => calls.push(String(prop));
      },
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
    },
  );
  return ctx;
}

describe('updatePlayer — jump physics', () => {
  it('lifts off with a negative velocity when action fires on the ground', () => {
    const state = makeRunningState();
    state.input.action = true;
    const y0 = state.player.y;

    updatePlayer(state, DT);

    expect(state.player.onGround).toBe(false);
    expect(state.player.vy).toBeLessThan(0);
    expect(state.player.vy).toBeGreaterThan(JUMP_VELOCITY);
    expect(state.player.y).toBeLessThan(y0);
  });

  it('follows a full arc: ascent, apex, descent and landing', () => {
    const state = makeRunningState();
    state.input.action = true;
    updatePlayer(state, DT);

    let minY = state.player.y;
    let crossedApex = false;

    for (let i = 0; i < 600; i++) {
      updatePlayer(state, DT);
      minY = Math.min(minY, state.player.y);
      if (!crossedApex && state.player.vy >= 0) {
        crossedApex = true;
        expect(state.player.y).toBeLessThan(GROUND_Y);
      }
      if (state.player.onGround) break;
    }

    expect(crossedApex).toBe(true);
    expect(minY).toBeLessThan(GROUND_Y - 40);
    expect(state.player.onGround).toBe(true);
    expect(state.player.y).toBe(GROUND_Y);
    expect(state.player.vy).toBe(0);
  });

  it('does not start a new jump while airborne', () => {
    const state = makeRunningState();
    state.input.action = true;
    updatePlayer(state, DT);
    const vyAfterTakeoff = state.player.vy;

    state.input.action = true;
    updatePlayer(state, DT);

    expect(state.player.vy).toBeGreaterThan(vyAfterTakeoff);
    expect(state.player.vy).toBeGreaterThan(JUMP_VELOCITY);
  });

  it('keeps the player grounded with y clamped and vy 0 without input', () => {
    const state = makeRunningState();
    for (let i = 0; i < 10; i++) {
      updatePlayer(state, DT);
    }
    expect(state.player.onGround).toBe(true);
    expect(state.player.y).toBe(GROUND_Y);
    expect(state.player.vy).toBe(0);
  });
});

describe('updatePlayer — onGround transitions', () => {
  it('toggles onGround from true to false on takeoff and back to true on landing', () => {
    const state = makeRunningState();
    expect(state.player.onGround).toBe(true);

    state.input.action = true;
    updatePlayer(state, DT);
    expect(state.player.onGround).toBe(false);

    for (let i = 0; i < 200 && !state.player.onGround; i++) {
      updatePlayer(state, DT);
    }

    expect(state.player.onGround).toBe(true);
    expect(state.player.vy).toBe(0);
    expect(state.player.y).toBe(GROUND_Y);
  });
});

describe('updatePlayer — scene gating', () => {
  it('does not move the player outside the running scene', () => {
    for (const scene of [SCENE.START, SCENE.GAMEOVER]) {
      const state = makeRunningState();
      state.scene = scene;
      state.input.action = true;
      const y = state.player.y;
      const vy = state.player.vy;

      updatePlayer(state, DT);

      expect(state.player.y).toBe(y);
      expect(state.player.vy).toBe(vy);
      expect(state.player.onGround).toBe(true);
    }
  });
});

describe('updatePlayer — run phase', () => {
  it('advances runPhase with dt and scales with speed', () => {
    const state = makeRunningState();

    const phase0 = state.player.runPhase;
    updatePlayer(state, 0.1);
    expect(state.player.runPhase).toBeCloseTo(phase0 + 0.1, 5);

    state.speed = BASE_SPEED * 2;
    const phase1 = state.player.runPhase;
    updatePlayer(state, 0.1);
    expect(state.player.runPhase).toBeCloseTo(phase1 + 0.2, 5);
  });
});

describe('drawPlayer — scene gating', () => {
  it('draws nothing outside the running scene and draws inside it', () => {
    const state = makeRunningState();
    state.scene = SCENE.START;
    const idleCtx = mockCtx();
    drawPlayer(idleCtx, state);
    expect(idleCtx.__calls.length).toBe(0);

    state.scene = SCENE.RUNNING;
    const ctx = mockCtx();
    drawPlayer(ctx, state);
    expect(ctx.__calls.length).toBeGreaterThan(0);
  });
});
