const STORAGE_KEY = 'mhat_friends_bingo_v1';
const SEED_KEY = 'mhat_friends_seed_v1';
const GRID = 5;
const TOTAL_CELLS = GRID * GRID;
const FREE_INDEX = 12;

const BINGO_PROMPTS = [
  '🎭 Был на спектакле Школы-студии МХАТ за последний год',
  '👏 Ходит в театр не реже раза в месяц',
  '🎓 Знаком с выпускником Школы-студии МХАТ',
  '🎬 Работает в театре, кино, медиа или креативной индустрии',
  '☕ Пришёл на встречу с кофе или чаем',
  '🌍 Приехал из другого города',
  '🎶 Любит музыкальный театр',
  '📚 Может назвать любимую пьесу',
  '🗣️ Любит обсуждать спектакли после поклона',
  '🎟️ Уже был на событии клуба раньше',
  '📸 Снимает фото или видео как хобби',
  '🎨 Занимается творчеством в свободное время',
  '🤝 Сегодня здесь впервые',
  '🫶 Поддерживает культурные проекты',
  '🕯️ Может назвать любимого актёра или актрису',
  '🧠 Читал пьесу до просмотра постановки',
  '🏛️ Был на театральной экскурсии или за кулисами',
  '🎤 Не боится публичных выступлений',
  '👫 Привёл сегодня друга или коллегу',
  '🌱 Хочет быть полезным клубу',
  '💬 Легко знакомится первым',
  '📖 Ведёт читательский или зрительский список',
  '🧳 Был на театральном фестивале в другом городе',
  '🎼 Любит театральную музыку или саундтреки',
  '📝 Может порекомендовать современную пьесу',
  '⭐ Мечтает о совместном проекте со школой',
  '🔍 Любит открывать новые имена в театре',
  '🎞️ Смотрит не только спектакли, но и театральные записи',
  '🌆 Часто бывает на культурных событиях в городе',
  '✨ Верит, что театр меняет людей',
  '📅 Уже планирует следующий культурный выход',
  '🤗 Знает, зачем пришёл в Клуб Друзей',
  '📻 Слушает подкасты о культуре и театре',
  '🎫 Дарил билеты в театр близким',
  '🪄 Верит в силу живой сцены',
  '🧑‍🤝‍🧑 Любит собирать вокруг себя сообщество'
];

const board = document.getElementById('board');
const resetBtn = document.getElementById('reset-btn');
const filledCount = document.getElementById('filled-count');
const leftCount = document.getElementById('left-count');
const linesCount = document.getElementById('lines-count');
const winBanner = document.getElementById('win-banner');
const winText = document.getElementById('win-text');

const overlay = document.getElementById('sheet-overlay');
const sheetTask = document.getElementById('sheet-task');
const nameInput = document.getElementById('name-input');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');

let activeIndex = null;
let cells = [];

function getSeed() {
  const existing = localStorage.getItem(SEED_KEY);
  if (existing) return Number(existing);
  const generated = Date.now();
  localStorage.setItem(SEED_KEY, String(generated));
  return generated;
}

function seededRandom(seed) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let v = Math.imul(t ^ (t >>> 15), t | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

function pickPrompts() {
  const random = seededRandom(getSeed());
  const pool = [...BINGO_PROMPTS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 24);
}

function buildDefaultCells() {
  const prompts = pickPrompts();
  const output = [];
  let promptIndex = 0;
  for (let i = 0; i < TOTAL_CELLS; i += 1) {
    if (i === FREE_INDEX) {
      output.push({ text: 'FREE', emoji: '⭐', name: '', free: true });
    } else {
      output.push({ text: prompts[promptIndex], emoji: '', name: '', free: false });
      promptIndex += 1;
    }
  }
  return output;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cells.map(({ name }) => ({ name }))));
}

function restoreState() {
  const defaultCells = buildDefaultCells();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultCells;

  try {
    const parsed = JSON.parse(raw);
    return defaultCells.map((cell, index) => ({
      ...cell,
      name: cell.free ? '' : String(parsed[index]?.name || '').trim()
    }));
  } catch {
    return defaultCells;
  }
}

function getWinningIndexes() {
  const winners = new Set();
  const isMarked = cells.map((cell) => cell.free || Boolean(cell.name.trim()));

  for (let r = 0; r < GRID; r += 1) {
    const row = Array.from({ length: GRID }, (_, c) => r * GRID + c);
    if (row.every((i) => isMarked[i])) row.forEach((i) => winners.add(i));
  }
  for (let c = 0; c < GRID; c += 1) {
    const col = Array.from({ length: GRID }, (_, r) => r * GRID + c);
    if (col.every((i) => isMarked[i])) col.forEach((i) => winners.add(i));
  }

  const diag1 = [0, 6, 12, 18, 24];
  const diag2 = [4, 8, 12, 16, 20];
  if (diag1.every((i) => isMarked[i])) diag1.forEach((i) => winners.add(i));
  if (diag2.every((i) => isMarked[i])) diag2.forEach((i) => winners.add(i));

  return winners;
}

function countLines() {
  const isMarked = cells.map((cell) => cell.free || Boolean(cell.name.trim()));
  let lines = 0;

  for (let r = 0; r < GRID; r += 1) {
    if (Array.from({ length: GRID }, (_, c) => isMarked[r * GRID + c]).every(Boolean)) lines += 1;
  }
  for (let c = 0; c < GRID; c += 1) {
    if (Array.from({ length: GRID }, (_, r) => isMarked[r * GRID + c]).every(Boolean)) lines += 1;
  }
  if ([0, 6, 12, 18, 24].every((i) => isMarked[i])) lines += 1;
  if ([4, 8, 12, 16, 20].every((i) => isMarked[i])) lines += 1;
  return lines;
}

function render() {
  const winningIndexes = getWinningIndexes();
  const lines = countLines();
  board.innerHTML = '';

  cells.forEach((cell, index) => {
    const btn = document.createElement('button');
    const filled = cell.free || Boolean(cell.name.trim());
    btn.type = 'button';
    btn.className = `cell ${filled ? 'filled' : ''} ${cell.free ? 'free' : ''} ${winningIndexes.has(index) ? 'on-line' : ''}`.trim();
    btn.setAttribute('aria-label', `Клетка ${index + 1}`);

    if (cell.free) {
      btn.innerHTML = `<div class="cell-text">${cell.emoji}</div><strong>FREE</strong>`;
      btn.disabled = true;
    } else {
      btn.innerHTML = `
        <div class="cell-index">${String(index + 1).padStart(2, '0')}</div>
        <div class="cell-text">${cell.text}</div>
        ${cell.name ? `<div class="cell-name">${cell.name} <span class="cell-mark">✓</span></div>` : ''}
      `;
      btn.addEventListener('click', () => openSheet(index));
    }
    board.appendChild(btn);
  });

  const filled = cells.filter((cell) => !cell.free && cell.name.trim()).length;
  filledCount.textContent = String(filled);
  leftCount.textContent = String(24 - filled);
  linesCount.textContent = String(lines);

  if (lines > 0) {
    winBanner.hidden = false;
    winText.textContent = lines === 1
      ? 'Покажи карточку организаторам — ты в числе первых!'
      : 'У тебя уже несколько линий — отличный результат!';
  } else {
    winBanner.hidden = true;
  }
}

function openSheet(index) {
  activeIndex = index;
  sheetTask.textContent = cells[index].text;
  nameInput.value = cells[index].name;
  overlay.hidden = false;
  requestAnimationFrame(() => nameInput.focus());
}

function closeSheet() {
  overlay.hidden = true;
  activeIndex = null;
}

function saveCell() {
  if (activeIndex === null) return;
  const value = nameInput.value.trim();
  if (!value) return;
  cells[activeIndex].name = value;
  saveState();
  closeSheet();
  render();
}

function clearCell() {
  if (activeIndex === null) return;
  cells[activeIndex].name = '';
  saveState();
  closeSheet();
  render();
}

function resetGame() {
  const confirmed = window.confirm('Точно начать заново? Все имена в карточке будут очищены.');
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SEED_KEY);
  cells = restoreState();
  render();
}

overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeSheet();
});

document.addEventListener('keydown', (event) => {
  if (overlay.hidden) return;
  if (event.key === 'Escape') closeSheet();
  if (event.key === 'Enter') {
    event.preventDefault();
    saveCell();
  }
});

cancelBtn.addEventListener('click', closeSheet);
saveBtn.addEventListener('click', saveCell);
clearBtn.addEventListener('click', clearCell);
resetBtn.addEventListener('click', resetGame);

cells = restoreState();
render();
