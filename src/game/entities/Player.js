// Player.js entity
class Player {
    constructor() {
        this.state = {
            position: { x: 100, y: 100 },
            velocity: { x: 0, y: 0 },
            isGrounded: false,
            facing: 'right'
        };
    }

    move(keys) {
        if (keys.ArrowLeft) this.velocity.x = -PHYSICS.MAX_DX;
        if (keys.ArrowRight) this.velocity.x = PHYSICS.MAX_DX;
        if (keys.Space && this.isGrounded) this.velocity.y = PHYSICS.JUMP_FORCE;
    }
}