export function initInput(state) {
  const press = () => {
    state.input.action = true;
  };

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      press();
    }
  });

  window.addEventListener('pointerdown', press);
}
