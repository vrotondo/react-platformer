// src/game/utils/tilemap.js

/**
 * Render the level tiles on the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} levelData - Level data with layers and tileset
 */
export function renderTiles(ctx, levelData) {
    if (!levelData || !levelData.layers || !levelData.layers.length) return;

    const tileSize = levelData.tileSize;

    // Draw each layer
    levelData.layers.forEach(layer => {
        if (!layer.data || !layer.tileset) return;

        // Calculate grid dimensions based on data length (assuming square grid)
        const gridWidth = Math.sqrt(layer.data.length);

        // Loop through each tile in the grid
        for (let i = 0; i < layer.data.length; i++) {
            const tileValue = layer.data[i];

            // Skip empty tiles
            if (tileValue === 0) continue;

            // Get tile type and properties
            const tileConfig = layer.tileset[tileValue];

            if (!tileConfig) continue;

            // Calculate position
            const x = (i % gridWidth) * tileSize;
            const y = Math.floor(i / gridWidth) * tileSize;

            // Render tile based on type
            switch (tileConfig.type) {
                case 'ground':
                    ctx.fillStyle = tileConfig.color || '#7a6c5d';
                    ctx.fillRect(x, y, tileSize, tileSize);

                    // Add a simple shading effect to the bottom and right edges
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.fillRect(x + tileSize - 5, y, 5, tileSize);
                    ctx.fillRect(x, y + tileSize - 5, tileSize, 5);
                    break;

                case 'hazard':
                    // Draw hazard (spikes or similar)
                    ctx.fillStyle = '#ff0000';

                    // Draw spikes
                    ctx.beginPath();
                    for (let s = 0; s < 4; s++) {
                        const spikeWidth = tileSize / 4;
                        const startX = x + s * spikeWidth;
                        ctx.moveTo(startX, y + tileSize);
                        ctx.lineTo(startX + spikeWidth / 2, y);
                        ctx.lineTo(startX + spikeWidth, y + tileSize);
                    }
                    ctx.fill();
                    break;

                default:
                    // Unknown tile type, draw as debug rectangle
                    ctx.fillStyle = 'purple';
                    ctx.fillRect(x, y, tileSize, tileSize);
                    break;
            }

            // Draw tile border (optional)
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.strokeRect(x, y, tileSize, tileSize);
        }
    });
}

/**
 * Get tile at specific world coordinates
 * 
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {Object} levelData - Level data with layers and tileset
 * @returns {Object|null} Tile config or null if no tile
 */
export function getTileAtPosition(x, y, levelData) {
    if (!levelData || !levelData.layers || !levelData.layers.length) return null;

    const tileSize = levelData.tileSize;
    const gridX = Math.floor(x / tileSize);
    const gridY = Math.floor(y / tileSize);

    // Check each layer (start from top layer)
    for (let l = levelData.layers.length - 1; l >= 0; l--) {
        const layer = levelData.layers[l];
        const gridWidth = Math.sqrt(layer.data.length);

        // Calculate index in the data array
        const index = gridY * gridWidth + gridX;

        // Check if the index is valid
        if (index < 0 || index >= layer.data.length) continue;

        const tileValue = layer.data[index];

        // Skip empty tiles
        if (tileValue === 0) continue;

        // Return tile configuration
        return {
            ...layer.tileset[tileValue],
            value: tileValue,
            layer: l,
            gridX,
            gridY
        };
    }

    // No tile found
    return null;
}