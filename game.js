const stats = {
  initians: 0,
  submittedInitians: 0
}, state = {
  submitInitiansBtn: false,
  submittedDisplay: false,
  jellyfishShop: false
}, elem = {};

function message(html) {
  const msg = createElement('div', {
    classes: 'message',
    listeners: {
      click(e) {
        clearTimeout(timeout);
        document.body.removeChild(msg);
      }
    },
    html: html
  });
  document.body.appendChild(msg);
  const timeout = setTimeout(() => document.body.removeChild(msg), 3000);
}

function init() {
  elem.initianDisplay = document.getElementById('initian-count');
  elem.initianBtns = document.getElementById('initian-btns');
  elem.submitInitians = document.getElementById('submit-initians')
  elem.submittedWrapper = document.getElementById('submitted-count-wrapper');
  elem.submittedDisplay = document.getElementById('submitted-count');
  elem.jellyfishShop = document.getElementById('jellyfish-shop');
  elem.buyVexilent = document.getElementById('buy-vexilent');
  elem.buyAnglonne = document.getElementById('buy-anglonne');

  elem.submitInitians.addEventListener('click', e => {
    stats.submittedInitians += stats.initians;
    elem.submittedDisplay.textContent = stats.submittedInitians;
    elem.initianDisplay.textContent = stats.initians = 0;
    if (!state.submittedDisplay) {
      state.submittedDisplay = true;
      elem.submittedWrapper.classList.remove('hidden');
      elem.submittedWrapper.classList.add('enter-anim');
    }
  });

  setInterval(() => {
    elem.initianDisplay.textContent = ++stats.initians;
    if (!state.submitInitiansBtn) {
      state.submitInitiansBtn = true;
      elem.initianBtns.classList.remove('hidden');
      elem.initianBtns.classList.add('enter-anim');
    }
    if (stats.initians >= 30 && !state.jellyfishShop) {
      state.jellyfishShop = true;
      elem.jellyfishShop.classList.remove('hidden');
      elem.jellyfishShop.classList.add('enter-anim');
    }
  }, 1000);
}
document.addEventListener('DOMContentLoaded', init, {once: true});
