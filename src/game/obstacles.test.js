import { describe, it, expect } from 'vitest';
import { createGameState, SCENE } from './state.js';
import { updateObstacles, drawObstacles } from './obstacles.js';
import { CANVAS_W, GROUND_Y, KNIGHT_X, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP } from './constants.js';

function runningState() {
  const s = createGameState();
  s.scene = SCENE.RUNNING;
  return s;
}

// Spawn tests keep the knight airborne so ground obstacles pass beneath it
// without tripping the collision → gameover transition and halting spawning.
function spawningState() {
  const s = runningState();
  s.player.y = GROUND_Y - 400;
  return s;
}

function advance(state, frames, dt = 1 / 60) {
  for (let i = 0; i < frames; i += 1) {
    updateObstacles(state, dt);
  }
}

// Collects every spawn gap observed between consecutive live obstacles and
// the set of obstacle types seen. Live obstacles are always consecutive in
// the spawn order (removal only ever happens at the front), so the x-gap
// between neighbours is exactly the gap they were spawned with.
function collect(state, frames, dt = 1 / 60) {
  const gaps = [];
  const types = new Set();
  for (let i = 0; i < frames; i += 1) {
    updateObstacles(state, dt);
    const arr = state.obstacles;
    for (const o of arr) types.add(o.type);
    for (let j = 1; j < arr.length; j += 1) {
      gaps.push(arr[j].x - arr[j - 1].x);
    }
  }
  return { gaps, types };
}

describe('updateObstacles — spawning', () => {
  it('spawns obstacles procedurally over time', () => {
    const s = spawningState();
    let frames = 0;
    while (s.obstacles.length === 0 && frames < 2000) {
      updateObstacles(s, 1 / 60);
      frames += 1;
    }
    expect(s.obstacles.length).toBeGreaterThan(0);
  });

  it('only ever spawns barrels or fences, and varies between both', () => {
    const s = spawningState();
    const { types } = collect(s, 6000);
    for (const t of types) {
      expect(['barrel', 'fence']).toContain(t);
    }
    // Over hundreds of spawns the 50/50 pick covers both types; the sample is
    // large enough that missing one is effectively impossible.
    expect(types.size).toBeGreaterThanOrEqual(2);
  });

  it('keeps the gap between consecutive obstacles within MIN_GAP..MAX_GAP', () => {
    const s = spawningState();
    const { gaps } = collect(s, 6000);
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(OBSTACLE_MIN_GAP);
      expect(gap).toBeLessThanOrEqual(OBSTACLE_MAX_GAP);
    }
  });

  it('sizes each obstacle for its type and places it on the ground', () => {
    const s = spawningState();
    advance(s, 400);
    for (const o of s.obstacles) {
      if (o.type === 'barrel') {
        expect(o.w).toBe(36);
        expect(o.h).toBe(44);
      } else {
        expect(o.w).toBe(44);
        expect(o.h).toBe(40);
      }
      expect(o.y + o.h).toBe(GROUND_Y);
    }
  });

  it('moves obstacles left toward the knight at state.speed', () => {
    const s = runningState();
    s.obstacles.push({ x: 500, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    updateObstacles(s, 0.1);
    expect(s.obstacles[0].x).toBeCloseTo(500 - s.speed * 0.1, 2);
  });

  it('removes obstacles that scroll off the left edge', () => {
    const s = runningState();
    s.obstacles.push({ x: -100, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    s.obstacles.push({ x: 500, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    updateObstacles(s, 1 / 60);
    expect(s.obstacles.length).toBe(1);
    expect(s.obstacles[0].x).toBeCloseTo(500 - s.speed / 60, 2);
  });

  it('does nothing when the scene is not running', () => {
    const s = createGameState();
    s.scene = SCENE.GAMEOVER;
    updateObstacles(s, 1 / 60);
    expect(s.obstacles.length).toBe(0);
    expect(s.scene).toBe(SCENE.GAMEOVER);
  });
});

describe('updateObstacles — collision', () => {
  it('sets scene to gameover when the knight overlaps an obstacle', () => {
    const s = runningState();
    s.obstacles.push({ x: KNIGHT_X, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    updateObstacles(s, 0);
    expect(s.scene).toBe(SCENE.GAMEOVER);
  });

  it('sets scene to gameover when the knight overlaps a fence', () => {
    const s = runningState();
    s.obstacles.push({ x: KNIGHT_X, y: GROUND_Y - 40, w: 44, h: 40, type: 'fence' });
    updateObstacles(s, 0);
    expect(s.scene).toBe(SCENE.GAMEOVER);
  });

  it('keeps the run going when no obstacle touches the knight', () => {
    const s = runningState();
    s.obstacles.push({ x: CANVAS_W, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    updateObstacles(s, 0);
    expect(s.scene).toBe(SCENE.RUNNING);
  });

  it('does not collide when the knight is airborne above a ground obstacle', () => {
    const s = runningState();
    s.player.y = GROUND_Y - 100;
    s.obstacles.push({ x: KNIGHT_X, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    updateObstacles(s, 0);
    expect(s.scene).toBe(SCENE.RUNNING);
  });
});

describe('drawObstacles', () => {
  const ctx = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        return () => {};
      },
      set() {
        return true;
      },
    },
  );

  it('draws barrels and fences without throwing', () => {
    const s = runningState();
    s.obstacles.push({ x: 400, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    s.obstacles.push({ x: 600, y: GROUND_Y - 40, w: 44, h: 40, type: 'fence' });
    expect(() => drawObstacles(ctx, s)).not.toThrow();
  });

  it('skips drawing when the scene is not running', () => {
    const s = runningState();
    s.obstacles.push({ x: 400, y: GROUND_Y - 44, w: 36, h: 44, type: 'barrel' });
    s.scene = SCENE.GAMEOVER;
    expect(() => drawObstacles(ctx, s)).not.toThrow();
  });
});
