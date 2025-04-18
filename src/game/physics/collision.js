// src/game/physics/collision.js

/**
 * Check collision between two rectangles and return collision details
 * 
 * @param {number} x1 - First rectangle x position
 * @param {number} y1 - First rectangle y position
 * @param {number} w1 - First rectangle width
 * @param {number} h1 - First rectangle height
 * @param {number} x2 - Second rectangle x position
 * @param {number} y2 - Second rectangle y position
 * @param {number} w2 - Second rectangle width
 * @param {number} h2 - Second rectangle height
 * @returns {Object} Collision data with collided flag and direction
 */
export function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Calculate the sides of the rectangles
    const left1 = x1;
    const right1 = x1 + w1;
    const top1 = y1;
    const bottom1 = y1 + h1;

    const left2 = x2;
    const right2 = x2 + w2;
    const top2 = y2;
    const bottom2 = y2 + h2;

    // Check if the rectangles overlap
    if (right1 <= left2 || left1 >= right2 || bottom1 <= top2 || top1 >= bottom2) {
        return {
            collided: false,
            direction: null
        };
    }

    // Calculate the overlap on each axis
    const overlapX1 = right1 - left2;
    const overlapX2 = right2 - left1;
    const overlapY1 = bottom1 - top2;
    const overlapY2 = bottom2 - top1;

    // Find the minimum overlap
    const overlapX = Math.min(overlapX1, overlapX2);
    const overlapY = Math.min(overlapY1, overlapY2);

    // Determine the collision direction based on the minimum overlap
    let direction;

    if (overlapX < overlapY) {
        // Collision is happening on the X axis
        direction = overlapX1 < overlapX2 ? 'right' : 'left';
    } else {
        // Collision is happening on the Y axis
        direction = overlapY1 < overlapY2 ? 'bottom' : 'top';
    }

    return {
        collided: true,
        direction
    };
}

/**
 * Check if a point is inside a rectangle
 * 
 * @param {number} x - Point x position
 * @param {number} y - Point y position
 * @param {number} rx - Rectangle x position
 * @param {number} ry - Rectangle y position
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean} True if point is inside rectangle
 */
export function pointInRect(x, y, rx, ry, rw, rh) {
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}