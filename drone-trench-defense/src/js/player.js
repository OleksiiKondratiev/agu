// player.js

class Player {
    constructor(name, health, damage) {
        this.name = name;
        this.health = health;
        this.damage = damage;
        this.position = { x: 0, y: 0 };
    }

    move(x, y) {
        this.position.x += x;
        this.position.y += y;
    }

    attack(target) {
        if (target.health > 0) {
            target.health -= this.damage;
            console.log(`${this.name} attacks ${target.name} for ${this.damage} damage!`);
        } else {
            console.log(`${target.name} is already defeated!`);
        }
    }

    isAlive() {
        return this.health > 0;
    }
}

export default Player;