import { searchPath } from './player.js';
import { getHighScores, saveHighScore } from './storage.js';

const container = document.getElementById('game-container');
const modeButtonsContainer = document.getElementById('mode-buttons');
const actionButtonsContainer = document.getElementById('action-buttons');
const statsContainer = document.getElementById('stats-container');
const scoresListContainer = document.getElementById('scores-list');

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
container.appendChild(canvas);

const ctx = canvas.getContext('2d');

let snake = [{ x: 200, y: 200 }];
let direction = 'right';
let food = { x: 100, y: 100 };
let paused = false;
let speed = 100;
let score = 0;
let mode = 'player'; // 'player', 'auto', 'ia'

// Botões de modo
const playerBtn = document.createElement('button');
playerBtn.textContent = '🎮 Player';
playerBtn.className = 'mode-button active';
playerBtn.onclick = () => setMode('player', playerBtn);
modeButtonsContainer.appendChild(playerBtn);

const autoBtn = document.createElement('button');
autoBtn.textContent = '🤖 Auto';
autoBtn.className = 'mode-button';
autoBtn.onclick = () => setMode('auto', autoBtn);
modeButtonsContainer.appendChild(autoBtn);

const iaBtn = document.createElement('button');
iaBtn.textContent = '🧠 AI';
iaBtn.className = 'mode-button';
iaBtn.onclick = () => setMode('ia', iaBtn);
modeButtonsContainer.appendChild(iaBtn);

// Botão Pausar
const pauseBtn = document.createElement('button');
pauseBtn.textContent = '⏸️ Pause';
pauseBtn.className = 'action-button pause';
pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.textContent = paused ? '▶️ Resume' : '⏸️ Pause';
};
actionButtonsContainer.appendChild(pauseBtn);

// Botão Reiniciar
const startBtn = document.createElement('button');
startBtn.textContent = '🔄 Restart';
startBtn.className = 'action-button restart';
startBtn.onclick = () => {
    snake = [{ x: 200, y: 200 }];
    direction = 'right';
    food = randomPosition();
    paused = false;
    score = 0;
    updateStats();
    pauseBtn.textContent = '⏸️ Pause';
};
actionButtonsContainer.appendChild(startBtn);

// Stats container setup
function createStatsElements() {
    // Current Score
    const currentScoreDiv = document.createElement('div');
    currentScoreDiv.className = 'stat-item';
    currentScoreDiv.innerHTML = `
        <div class="stat-label">Current Score</div>
        <div class="stat-value" id="current-score">${score}</div>
    `;
    statsContainer.appendChild(currentScoreDiv);

    // High Score
    const highScoreDiv = document.createElement('div');
    highScoreDiv.className = 'stat-item';
    highScoreDiv.innerHTML = `
        <div class="stat-label">High Score</div>
        <div class="stat-value" id="high-score">${getHighScores()[0] || 0}</div>
    `;
    statsContainer.appendChild(highScoreDiv);

    // Current Mode
    const modeDiv = document.createElement('div');
    modeDiv.className = 'stat-item';
    modeDiv.innerHTML = `
        <div class="stat-label">Mode</div>
        <div class="stat-value" id="current-mode">Player</div>
    `;
    statsContainer.appendChild(modeDiv);

    // Snake Length
    const lengthDiv = document.createElement('div');
    lengthDiv.className = 'stat-item';
    lengthDiv.innerHTML = `
        <div class="stat-label">Length</div>
        <div class="stat-value" id="snake-length">${snake.length}</div>
    `;
    statsContainer.appendChild(lengthDiv);
}

createStatsElements();

function randomPosition() {
    return {
        x: Math.floor(Math.random() * 20) * 20,
        y: Math.floor(Math.random() * 20) * 20
    };
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'lime';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, 20, 20));

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 20, 20);
}

function moveSnake() {
    let head = { ...snake[0] };
    if (direction === 'right') head.x += 20;
    if (direction === 'left') head.x -= 20;
    if (direction === 'up') head.y -= 20;
    if (direction === 'down') head.y += 20;

    // Wrap around
    head.x = (head.x + canvas.width) % canvas.width;
    head.y = (head.y + canvas.height) % canvas.height;

    // Verifica colisão com o corpo
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        saveHighScore(score); // Salva o score só quando morrer
        updateHighScoreBtn();
        updateScoresList();
        restartGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = randomPosition();
        score++;
        updateStats();
        // Não salve o score aqui!
    } else {
        snake.pop();
    }
}

function autoPlayer() {
    let head = snake[0];
    const moves = [
        { dir: 'up',    x: head.x,     y: head.y - 20 },
        { dir: 'down',  x: head.x,     y: head.y + 20 },
        { dir: 'left',  x: head.x - 20, y: head.y     },
        { dir: 'right', x: head.x + 20, y: head.y     }
    ];

    const safeMoves = moves.filter(move => 
        !snake.some(segment => 
            segment.x === ((move.x + canvas.width) % canvas.width) &&
            segment.y === ((move.y + canvas.height) % canvas.height)
        )
    );

    if (safeMoves.length > 0) {
        safeMoves.sort((a, b) => {
            const distA = Math.abs(food.x - a.x) + Math.abs(food.y - a.y);
            const distB = Math.abs(food.x - b.x) + Math.abs(food.y - b.y);
            return distA - distB;
        });
        direction = safeMoves[0].dir;
    }
}

function gameLoop() {
    if (!paused) {
        if (mode === 'auto') autoPlayer();
        if (mode === 'ia') direction = searchPath(snake, food, canvas.width, canvas.height);
        moveSnake();
        draw();
    }
    setTimeout(gameLoop, speed);
}

// Controles do teclado só no modo jogador
document.addEventListener('keydown', e => {
    if (mode === 'player') {
        if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
        if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
        if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
        if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
    }
});

function updateStats() {
    document.getElementById('current-score').textContent = score;
    document.getElementById('high-score').textContent = getHighScores()[0] || 0;
    document.getElementById('snake-length').textContent = snake.length;
}

function setMode(newMode, clickedBtn) {
    mode = newMode;

    // Update button states
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Update mode display
    const modeNames = { player: 'Player', auto: 'Auto', ia: 'AI' };
    document.getElementById('current-mode').textContent = modeNames[newMode];
}

function updateScoresList() {
    const scores = getHighScores();
    scoresListContainer.innerHTML = '';
    scores.slice(0, 10).forEach((s, i) => {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score-item';
        scoreDiv.innerHTML = `
            <span class="score-rank">#${i + 1}</span>
            <span class="score-value">${s}</span>
        `;
        scoresListContainer.appendChild(scoreDiv);
    });

    // Show message if no scores
    if (scores.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.color = 'rgba(255, 255, 255, 0.5)';
        emptyDiv.style.padding = '20px';
        emptyDiv.textContent = 'No scores yet. Start playing!';
        scoresListContainer.appendChild(emptyDiv);
    }
}

function restartGame() {
    snake = [{ x: 200, y: 200 }];
    direction = 'right';
    food = randomPosition();
    score = 0;
    updateStats();
    updateScoresList();
    paused = false;
    pauseBtn.textContent = '⏸️ Pause';
}

// Initialize game
updateStats();
updateScoresList();
draw();
gameLoop();
