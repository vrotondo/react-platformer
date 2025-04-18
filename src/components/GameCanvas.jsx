// GameCanvas.jsx
useEffect(() => {
    let lastTime = 0;
    const gameLoop = (timestamp) => {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // Update game state
        updateEntities(deltaTime);
        checkCollisions();

        // Render frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderLevel();
        renderPlayer();

        requestAnimationFrame(gameLoop);
    };
    gameLoop();
}, []);