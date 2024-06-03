document.getElementById('num-sentences').addEventListener('input', updateSentencesConfig);
document.getElementById('generate-puzzle').addEventListener('click', generatePuzzle);

const levels = {};
let currentLevel = 1;
let correctOrder = [];
let completedLevels = [];

function updateSentencesConfig() {
    const numSentences = document.getElementById('num-sentences').value;
    const sentencesConfig = document.getElementById('sentences-config');
    sentencesConfig.innerHTML = '';
    for (let i = 1; i <= numSentences; i++) {
        const inputDiv = document.createElement('div');
        inputDiv.classList.add('sentence-input');
        inputDiv.textContent = `Frase ${i}:`;
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = `sentence-${i}`;
        inputDiv.appendChild(inputField);
        sentencesConfig.appendChild(inputDiv);
    }
}

function generatePuzzle() {
    const numSentences = document.getElementById('num-sentences').value;
    for (let i = 1; i <= numSentences; i++) {
        const sentence = document.getElementById(`sentence-${i}`).value.split(' ');
        levels[i] = sentence;
    }
    correctOrder = levels[currentLevel];
    createPuzzle();
    document.getElementById('config').style.display = 'none';
    document.getElementById('puzzle').style.display = 'block';
    document.getElementById('link').style.display = 'block';

    const link = generateLink();
    document.getElementById('share-link').href = link;
    document.getElementById('share-link').textContent = link;
}

function generateLink() {
    const baseURL = window.location.href.split('?')[0];
    const params = new URLSearchParams();
    for (const level in levels) {
        params.append(`level${level}`, levels[level].join(' '));
    }
    return `${baseURL}?${params.toString()}`;
}

function createPuzzle() {
    const puzzleGrid = document.getElementById('puzzle-grid');
    const optionsGrid = document.getElementById('options-grid');
    puzzleGrid.innerHTML = '';
    optionsGrid.innerHTML = '';

    for (let i = 0; i < correctOrder.length; i++) {
        const placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
        placeholder.dataset.index = i;
        puzzleGrid.appendChild(placeholder);
        placeholder.addEventListener('dragover', dragOver);
        placeholder.addEventListener('drop', drop);
    }

    const shuffledPhrases = shuffle([...levels[currentLevel]]);
    shuffledPhrases.forEach((phrase, index) => {
        const piece = document.createElement('div');
        piece.classList.add('option-piece');
        piece.textContent = phrase;
        piece.draggable = true;
        piece.dataset.index = index;

        piece.addEventListener('dragstart', dragStart);
        piece.addEventListener('dragend', dragEnd);

        optionsGrid.appendChild(piece);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    setTimeout(() => {
        e.target.classList.add('dragging');
    }, 0);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.option-piece[data-index='${draggedIndex}']`);
    const targetElement = e.target;

    if (targetElement.classList.contains('placeholder')) {
        targetElement.textContent = draggedElement.textContent;
        targetElement.classList.remove('placeholder');
        targetElement.classList.add('puzzle-piece');
        draggedElement.remove();
    }
}

function checkPuzzle() {
    const puzzleGrid = document.getElementById('puzzle-grid');
    const pieces = Array.from(puzzleGrid.querySelectorAll('.puzzle-piece'));
    const currentOrder = pieces.map(piece => piece.textContent);
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
    if (isCorrect) {
        alert('¡Correcto!');
        document.getElementById(`level-${currentLevel}`).classList.add('locked');
        document.getElementById(`level-${currentLevel}`).disabled = true;
        completedLevels.push(currentLevel);
    } else {
        alert('Inténtalo de nuevo');
    }
}

function setLevel(level) {
    if (completedLevels.includes(level)) return;
    currentLevel = level;
    correctOrder = levels[currentLevel];
    createPuzzle();
}

document.getElementById('check-puzzle').addEventListener('click', checkPuzzle);

// Leer niveles de la URL si están presentes
const urlParams = new URLSearchParams(window.location.search);
urlParams.forEach((value, key) => {
    const level = key.replace('level', '');
    levels[level] = value.split(' ');
});
if (Object.keys(levels).length > 0) {
    currentLevel = 1;
    correctOrder =
