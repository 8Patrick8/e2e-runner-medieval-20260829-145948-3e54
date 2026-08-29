import {
  BASE_SPEED,
  CANVAS_W,
  CANVAS_H,
  GROUND_Y,
  KNIGHT_X,
} from './constants.js';

export const SCENE = Object.freeze({
  START: 'start',
  RUNNING: 'running',
  GAMEOVER: 'gameover',
});

export function createGameState() {
  return {
    scene: SCENE.RUNNING,
    time: 0,
    distance: 0,
    speed: BASE_SPEED,
    score: 0,
    highScore: 0,
    isNewRecord: false,
    player: {
      x: KNIGHT_X,
      y: GROUND_Y,
      vy: 0,
      onGround: true,
      runPhase: 0,
    },
    input: { action: false },
    obstacles: [],
    background: { far: 0, mid: 0, near: 0, ground: 0 },
    canvas: { w: CANVAS_W, h: CANVAS_H },
  };
}
