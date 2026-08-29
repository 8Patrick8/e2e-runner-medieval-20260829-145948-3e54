let scoreElement = null;

export function initHud(state) {
  scoreElement = document.getElementById('hud-score');
}

export function updateHud(state) {
  if (scoreElement) {
    scoreElement.textContent = String(state.score);
  }
}
