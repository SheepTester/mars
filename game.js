const stats = {
  initians: 0,
  submittedInitians: 0,
  vexilents: 0,
  weaponStage: 0,
  maxHealth: 100,
  weapon: 'none',
  weapons: ['none']
}, state = {
  submitInitiansBtn: false,
  submittedDisplay: false,
  jellyfishShop: false,
  vexilentDisplay: false,
  weaponSelect: false,
  forestQuest: false
}, elem = {};

const PRICES = {
  vexilent: 62,
  anglonne: 137,
  effigine: 468,
  impossiblus: 789234576
};
const JELLYFISH_WEAPONS = [
  ['anglonne', 'an anglonne'],
  ['effigine', 'an effigine'],
  ['impossiblus', 'an impossiblus']
];
const WEAPONS = {
  none: {name: 'none', damage: 0, speed: 0},
  anglonne: {name: 'anglonne', damage: 5, speed: 30},
  effigine: {name: 'effigine', damage: 10, speed: 30},
  impossiblus: {name: 'impossiblus', damage: 100000, speed: 1}
};

const battle = {
  SCALE: 8,
  PLAYER_WIDTH: 5,
  PLAYER_SPEED: 0.5,
  enemies: {
    tree: {
      health: 20, damage: 0, speed: 0, name: 'Tree', weapon: 'none',
      onDestroy(loot, log) {
        const initians = Math.floor(Math.random() * 10);
        if (initians) {
          loot.initians += initians;
          log(`The tree <em>rematerialized</em> into ${initians} initian(s).`);
        }
      }
    }
  }
};

function createIndicator(enemy) {
  let health;
  const elem = createElement('div', {
    classes: 'battle-info',
    children: [
      createElement('p', {
        classes: 'name',
        html: battle.enemies[enemy].name
      }),
      health = createElement('span', {
        classes: 'health',
        style: {
          '--health': '100%'
        }
      }),
      createElement('p', {
        html: 'Weapon: ' + battle.enemies[enemy].weapon
      })
    ]
  });
  return {elem: elem, health: health};
}
function startBattle(length, map) {
  return new Promise(res => {
    elem.battleground.style.width = length * battle.SCALE + 'px';
    const mapElems = map.map(([enemy, position]) => createElement('div', {
      classes: `battle-object battle-${enemy}`,
      styles: {
        transform: `translateX(${position * battle.SCALE}px)`
      }
    }));
    elem.battleground.appendChild(createFragment(mapElems));
    elem.battleWrapper.classList.remove('effectively-gone');
    elem.battleground.style.transform = 'translateX(0)';
    elem.player.style.transform = 'translateX(0)';
    elem.playerHealth.style.setProperty('--health', '100%');
    const weapon = WEAPONS[stats.weapon];
    elem.playerWeapon.textContent = weapon.name;
    const loot = {initians: 0};
    const {elem: firstEnemyIndicator, health: firstEnemyHealth} = createIndicator(map[0][0]);
    let health = stats.maxHealth, fighting = false, x = 0, frame = 0, nextEnemy = {
      index: 0,
      data: battle.enemies[map[0][0]],
      health: battle.enemies[map[0][0]].health,
      healthDisplay: firstEnemyHealth
    };
    function end(success) {
      elem.battleWrapper.classList.add('effectively-gone');
      setTimeout(() => {
        Array.from(elem.battleground.children).forEach(b => b !== elem.player && elem.battleground.removeChild(b));
        elem.log.innerHTML = '';
      }, 500);
      if (success) {
        stats.initians += loot.initians;
        elem.initianDisplay.textContent = stats.initians;
      }
      res(success);
    }
    function log(msg) {
      msg = createElement('p', {html: msg});
      if (elem.log.firstChild) elem.log.insertBefore(msg, elem.log.firstChild);
      else elem.log.appendChild(msg);
    }
    function nextFrame() {
      frame++;
      if (fighting) {
        if (frame % nextEnemy.data.speed === 0) {
          health -= nextEnemy.data.damage;
          if (health <= 0) {
            end(false);
            return;
          } else {
            elem.playerHealth.style.setProperty('--health', (health * 100 / stats.maxHealth) + '%');
          }
        }
        if (frame % weapon.speed === 0) {
          nextEnemy.health -= weapon.damage;
          if (nextEnemy.health <= 0) {
            mapElems[nextEnemy.index].classList.add('battle-dead');
            nextEnemy.healthDisplay.style.setProperty('--health', '0');
            nextEnemy.data.onDestroy(loot, log);
            const nextIndex = nextEnemy.index + 1;
            if (nextIndex < map.length) {
              const {elem: indicator, health: healthDisplay} = createIndicator(map[nextIndex][0]);
              mapElems[nextIndex].appendChild(indicator);
              nextEnemy = {
                index: nextIndex,
                data: battle.enemies[map[nextIndex][0]],
                health: battle.enemies[map[nextIndex][0]].health,
                healthDisplay: healthDisplay
              };
            } else {
              nextEnemy = null;
            }
            fighting = false;
          } else {
            nextEnemy.healthDisplay.style.setProperty('--health', (nextEnemy.health * 100 / nextEnemy.data.health) + '%');
          }
        }
      } else {
        x += battle.PLAYER_SPEED;
        elem.battleground.style.transform = `translateX(${-x * battle.SCALE}px)`;
        elem.player.style.transform = `translateX(${x * battle.SCALE}px)`;
        if (x + battle.PLAYER_WIDTH > length) {
          end(loot);
          return;
        } else if (nextEnemy && x + battle.PLAYER_WIDTH > map[nextEnemy.index][1]) fighting = true;
      }
      timeout = setTimeout(nextFrame, 1000 / 60); // not monitor dependent and it works while not on tab
    }
    let timeout = setTimeout(() => {
      mapElems[0].appendChild(firstEnemyIndicator);
      nextFrame();
    }, 500);
    battle.onflee = () => {
      clearTimeout(timeout);
      end(false);
    };
  });
}

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

function generateWeaponsList() {
  elem.weaponSelect.innerHTML = '';
  elem.weaponSelect.appendChild(createFragment(stats.weapons.map(w => createElement('option', {
    attributes: {
      value: w
    },
    html: WEAPONS[w].name
  }))));
  elem.weaponSelect.value = stats.weapon;
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
  elem.weaponPrice = document.getElementById('weapon-price');
  elem.battleground = document.getElementById('battleground');
  elem.player = document.getElementById('player');
  elem.playerWeapon = document.getElementById('player-weapon');
  elem.playerHealth = document.getElementById('player-health');
  elem.battleWrapper = document.getElementById('battle-wrapper');
  elem.log = document.getElementById('log');
  elem.vexilentDisplay = document.getElementById('vexilent-count');
  elem.vexilentWrapper = document.getElementById('vexilent-count-wrapper');
  elem.weaponSelect = document.getElementById('weapon');
  elem.weaponWrapper = document.getElementById('weapon-wrapper');
  elem.forestQuest = document.getElementById('forest-quest');
  elem.embarkForest = document.getElementById('embark-forest');
  elem.fleeBtn = document.getElementById('flee');

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
  elem.buyVexilent.addEventListener('click', e => {
    if (stats.initians < PRICES.vexilent) message('Insufficient initians.');
    else {
      stats.initians -= PRICES.vexilent;
      elem.initianDisplay.textContent = stats.initians;
      elem.vexilentDisplay.textContent = ++stats.vexilents;
      if (!state.vexilentDisplay) {
        state.vexilentWrapper = true;
        elem.vexilentWrapper.classList.remove('hidden');
        elem.vexilentWrapper.classList.add('enter-anim');
      }
    }
  });
  elem.buyAnglonne.addEventListener('click', e => {
    if (stats.initians < PRICES[JELLYFISH_WEAPONS[stats.weaponStage][0]]) message('Insufficient initians.');
    else {
      stats.initians -= PRICES[JELLYFISH_WEAPONS[stats.weaponStage][0]];
      elem.initianDisplay.textContent = stats.initians;
      stats.weapons.push(JELLYFISH_WEAPONS[stats.weaponStage][0]);
      generateWeaponsList();
      stats.weapon = elem.weaponSelect.value = JELLYFISH_WEAPONS[stats.weaponStage][0];
      stats.weaponStage++;
      elem.weaponPrice.textContent = `${JELLYFISH_WEAPONS[stats.weaponStage][1]} (${PRICES[JELLYFISH_WEAPONS[stats.weaponStage][0]]} init.)`;
      if (!state.weaponSelect) {
        state.weaponWrapper = true;
        elem.weaponWrapper.classList.remove('hidden');
        elem.weaponWrapper.classList.add('enter-anim');
      }
      if (!state.forestQuest) {
        state.forestQuest = true;
        elem.forestQuest.classList.remove('hidden');
        elem.forestQuest.classList.add('enter-anim');
      }
    }
  });
  elem.weaponSelect.addEventListener('change', e => {
    if (stats.weapons.includes(elem.weaponSelect.value))
      stats.weapon = elem.weaponSelect.value;
  });
  elem.embarkForest.addEventListener('click', e => {
    const trees = [];
    for (let x = Math.floor(Math.random() * 15 + 5); x < 180; x += Math.floor(Math.random() * 30 + 10)) {
      trees.push(['tree', x]);
    }
    startBattle(200, trees);
  });
  elem.fleeBtn.addEventListener('click', e => {
    if (battle.onflee) battle.onflee();
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

  generateWeaponsList();
}
document.addEventListener('DOMContentLoaded', init, {once: true});
