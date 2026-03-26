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

let cells = prompts.map((task) => ({ task, name: '' }));
let activeIndex = null;

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
  const hasName = cells.map((c) => Boolean(c.name.trim()));
  const isCompleteLine = (indexes) =>
    indexes.every((index) => index < hasName.length && hasName[index]);
  let lines = 0;

  for (let r = 0; r < 5; r++) {
    const rowIndexes = [0, 1, 2, 3, 4].map((offset) => r * 5 + offset);
    if (isCompleteLine(rowIndexes)) lines++;
  }

  for (let c = 0; c < 5; c++) {
    const colIndexes = [0, 1, 2, 3, 4].map((r) => r * 5 + c);
    if (isCompleteLine(colIndexes)) lines++;
  }

  const diag1 = [0, 6, 12, 18, 24];
  const diag2 = [4, 8, 12, 16, 20];
  if (isCompleteLine(diag1)) lines++;
  if (isCompleteLine(diag2)) lines++;

  return lines;
}

function openEditor(index) {
  activeIndex = index;
  const cell = cells[index];
  promptTitle.textContent = cell.task;
  nameInput.value = cell.name;
  dialog.showModal();
  setTimeout(() => nameInput.focus(), 0);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (activeIndex === null) return;
  cells[activeIndex].name = nameInput.value.trim();
  activeIndex = null;
  dialog.close();
  render();
});

clearBtn.addEventListener('click', () => {
  if (activeIndex === null) return;
  cells[activeIndex].name = '';
  activeIndex = null;
  dialog.close();
  render();
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
