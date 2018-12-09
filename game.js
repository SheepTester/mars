const stats = {
  initians: 0,
  submittedInitians: 0
}, state = {
  submitInitiansBtn: false,
  submittedDisplay: false
}, elem = {};

function init() {
  elem.initianDisplay = document.getElementById('initian-count');
  elem.initianBtns = document.getElementById('initian-btns');
  elem.submitInitians = document.getElementById('submit-initians')
  elem.submittedWrapper = document.getElementById('submitted-count-wrapper');
  elem.submittedDisplay = document.getElementById('submitted-count');

  elem.submitInitians.addEventListener('click', e => {
    stats.submittedInitians += stats.initians;
    elem.submittedDisplay.textContent = stats.submittedInitians;
    elem.initianDisplay.textContent = stats.initians = 0;
    if (!state.submittedDisplay) {
      state.submittedDisplay = true;
      elem.submittedWrapper.classList.remove('hidden');
    }
  });

  setInterval(() => {
    elem.initianDisplay.textContent = ++stats.initians;
    if (!state.submitInitiansBtn) {
      state.submitInitiansBtn = true;
      elem.initianBtns.appendChild(elem.submitInitians);
      elem.initianBtns.classList.remove('hidden');
    }
  }, 1000);
}
document.addEventListener('DOMContentLoaded', init, {once: true});
