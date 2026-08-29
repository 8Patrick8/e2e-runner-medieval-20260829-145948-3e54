import {
  BASE_SPEED,
  MAX_SPEED,
  SPEED_RAMP,
  SCORE_PER_METER,
} from './constants.js';

const HIGH_SCORE_KEY = 'highscore';

let recordChecked = false;

export function loadHighScore() {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    if (raw === null) return 0;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return 0;
    return value;
  } catch {
    return 0;
  }
}

export function saveHighScore(value) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch {
    // storage unavailable: the highscore simply won't persist
  }
}

export function initScoring(state) {
  state.highScore = loadHighScore();
  state.isNewRecord = false;
  recordChecked = false;
}

export function updateScoring(state, dt) {
  if (state.scene === 'running') {
    recordChecked = false;
    state.isNewRecord = false;
    state.speed = Math.min(BASE_SPEED + state.time * SPEED_RAMP, MAX_SPEED);
    state.distance += state.speed * dt;
    state.score = Math.floor(state.distance * SCORE_PER_METER);
    return;
  }

  if (state.scene === 'gameover' && !recordChecked) {
    recordChecked = true;
    state.isNewRecord = state.score > state.highScore;
    if (state.isNewRecord) {
      state.highScore = state.score;
      saveHighScore(state.highScore);
    }
  }
}
