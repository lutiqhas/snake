const STORAGE_KEY = 'snake_highscores';

function getHighScores() {
    const scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return scores;
}

function saveHighScore(score) {
    let scores = getHighScores();
    scores.push(score);
    scores = Array.from(new Set(scores)); // Remove duplicados
    scores.sort((a, b) => b - a); // Ordena decrescente
    scores = scores.slice(0, 20); // Mantém só os 20 maiores
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export { getHighScores, saveHighScore };