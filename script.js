const prompts = [
  'Любит импровизацию',
  'Рано встает',
  'Знает 2+ языка',
  'Уже играл(а) в театре',
  'Из другого города',
  'Любит джаз',
  'Может читать стих наизусть',
  'Умеет танцевать вальс',
  'Снимался(ась) в кино',
  'Занимается спортом',
  'Обожает комедии',
  'Читает современную драму',
  'Играет на инструменте',
  'Боится сцены, но идет в нее',
  'Умеет работать со светом',
  'Любит документалки',
  'Пишет тексты',
  'Смотрел(а) 5+ спектаклей за год',
  'Хочет режиссировать',
  'Делает классные фото',
  'Умеет монтировать видео',
  'Всегда помогает другим',
  'Имеет необычное хобби',
  'Мечтает о большой сцене'
];

const board = document.getElementById('board');
const filledCount = document.getElementById('filled-count');
const leftCount = document.getElementById('left-count');
const linesCount = document.getElementById('lines-count');
const winBanner = document.getElementById('win-banner');

const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resetBtn = document.getElementById('reset-btn');

const dialog = document.getElementById('name-dialog');
const form = document.getElementById('name-form');
const promptTitle = document.getElementById('prompt-title');
const nameInput = document.getElementById('name-input');
const clearBtn = document.getElementById('clear-btn');
const cancelBtn = document.getElementById('cancel-btn');

let cells = prompts.map((task) => ({ task, name: '' }));
let activeIndex = null;

function showNameDialog() {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
    return;
  }
  dialog.setAttribute('open', '');
}

function closeNameDialog() {
  if (typeof dialog.close === 'function') {
    dialog.close();
    return;
  }
  dialog.removeAttribute('open');
}

function render() {
  board.innerHTML = '';
  cells.forEach((cell, idx) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    btn.innerHTML = `<div class="task">${cell.task}</div><div class="name">${cell.name || '—'}</div>`;
    btn.addEventListener('click', () => openEditor(idx));
    board.appendChild(btn);
  });

  const filled = cells.filter((c) => c.name.trim()).length;
  filledCount.textContent = String(filled);
  leftCount.textContent = String(cells.length - filled);

  const lines = calculateLines();
  linesCount.textContent = String(lines);
  winBanner.hidden = lines < 1;
}

function calculateLines() {
  const boardColumns = 5;
  const boardRows = Math.ceil(cells.length / boardColumns);
  const hasName = cells.map((c) => Boolean(c.name.trim()));
  let lines = 0;

  for (let r = 0; r < boardRows; r++) {
    const row = hasName.slice(r * boardColumns, r * boardColumns + boardColumns);
    if (row.length === boardColumns && row.every(Boolean)) lines++;
  }

  for (let c = 0; c < boardColumns; c++) {
    const col = [];
    for (let r = 0; r < boardRows; r++) {
      const index = r * boardColumns + c;
      if (index < hasName.length) {
        col.push(hasName[index]);
      }
    }
    if (col.length === boardRows && col.every(Boolean)) lines++;
  }

  const diagTopLeft = [];
  const diagTopRight = [];
  for (let r = 0; r < boardRows; r++) {
    const leftIndex = r * boardColumns + r;
    const rightIndex = r * boardColumns + (boardColumns - 1 - r);
    if (leftIndex < hasName.length) {
      diagTopLeft.push(hasName[leftIndex]);
    }
    if (rightIndex < hasName.length) {
      diagTopRight.push(hasName[rightIndex]);
    }
  }
  if (diagTopLeft.length === boardRows && diagTopLeft.every(Boolean)) lines++;
  if (diagTopRight.length === boardRows && diagTopRight.every(Boolean)) lines++;

  return lines;
}

function openEditor(index) {
  activeIndex = index;
  const cell = cells[index];
  promptTitle.textContent = cell.task;
  nameInput.value = cell.name;
  showNameDialog();
  setTimeout(() => nameInput.focus(), 0);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.submitter === cancelBtn) {
    closeNameDialog();
    return;
  }
  if (activeIndex === null) return;
  cells[activeIndex].name = nameInput.value.trim();
  activeIndex = null;
  closeNameDialog();
  render();
});

cancelBtn.addEventListener('click', () => {
  activeIndex = null;
  closeNameDialog();
});

clearBtn.addEventListener('click', () => {
  if (activeIndex === null) return;
  cells[activeIndex].name = '';
  activeIndex = null;
  closeNameDialog();
  render();
});

dialog.addEventListener('close', () => {
  activeIndex = null;
});

startBtn.addEventListener('click', () => {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
});

resetBtn.addEventListener('click', () => {
  cells = prompts.map((task) => ({ task, name: '' }));
  render();
});

render();
closeNameDialog();
