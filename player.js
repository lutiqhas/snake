/**
 * Busca o melhor caminho até a comida usando BFS.
 * @param {Array} snake - Array de segmentos [{x, y}]
 * @param {Object} food - Posição da comida {x, y}
 * @param {number} width - Largura do canvas
 * @param {number} height - Altura do canvas
 * @returns {string} - Direção segura: 'up', 'down', 'left', 'right'
 */
function searchPath(snake, food, width, height) {
    const directions = [
        { dir: 'up', dx: 0, dy: -20 },
        { dir: 'down', dx: 0, dy: 20 },
        { dir: 'left', dx: -20, dy: 0 },
        { dir: 'right', dx: 20, dy: 0 }
    ];

    const queue = [];
    const visited = new Set();
    const head = snake[0];
    queue.push({ x: head.x, y: head.y, path: [] });

    // Marca posições ocupadas pelo corpo
    const bodySet = new Set(snake.map(seg => `${seg.x},${seg.y}`));

    while (queue.length > 0) {
        const { x, y, path } = queue.shift();
        if (x === food.x && y === food.y && path.length > 0) {
            return path[0]; // Retorna a primeira direção do caminho
        }

        for (const d of directions) {
            const nx = (x + d.dx + width) % width;
            const ny = (y + d.dy + height) % height;
            const key = `${nx},${ny}`;
            if (!visited.has(key) && !bodySet.has(key)) {
                visited.add(key);
                queue.push({ x: nx, y: ny, path: path.concat(d.dir) });
            }
        }
    }

    // Se não encontrar caminho, retorna direção segura qualquer
    for (const d of directions) {
        const nx = (head.x + d.dx + width) % width;
        const ny = (head.y + d.dy + height) % height;
        const key = `${nx},${ny}`;
        if (!bodySet.has(key)) {
            return d.dir;
        }
    }
    return 'right'; // fallback
}

export { searchPath };