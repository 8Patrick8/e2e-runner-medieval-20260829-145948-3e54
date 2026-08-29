import { describe, it, expect } from 'vitest';
import { createGameState, SCENE } from './state.js';
import { BASE_SPEED } from './constants.js';

describe('createGameState', () => {
  it('builds the full state shape with sensible defaults', () => {
    const s = createGameState();
    expect(['start', 'running', 'gameover']).toContain(s.scene);
    expect(typeof s.time).toBe('number');
    expect(s.distance).toBe(0);
    expect(s.speed).toBe(BASE_SPEED);
    expect(s.score).toBe(0);
    expect(s.highScore).toBe(0);
    expect(s.isNewRecord).toBe(false);
    expect(s.player).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      vy: 0,
      onGround: true,
      runPhase: 0,
    });
    expect(s.input.action).toBe(false);
    expect(Array.isArray(s.obstacles)).toBe(true);
    expect(s.background).toEqual({ far: 0, mid: 0, near: 0, ground: 0 });
    expect(s.canvas.w).toBeGreaterThan(0);
    expect(s.canvas.h).toBeGreaterThan(0);
  });

  it('exposes the SCENE constant as a frozen enum', () => {
    expect(SCENE).toEqual({ START: 'start', RUNNING: 'running', GAMEOVER: 'gameover' });
  });

  it('returns a fresh independent object each call', () => {
    const a = createGameState();
    const b = createGameState();
    a.score = 999;
    a.player.y = 0;
    expect(b.score).toBe(0);
    expect(b.player.y).toBeGreaterThan(0);
  });
});
