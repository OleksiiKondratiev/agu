export class Enemy {
    constructor(type, health, damage, speed) {
        this.type = type;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
    }

    attack(player) {
        player.takeDamage(this.damage);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        console.log(`${this.type} has been defeated!`);
        // Additional logic for enemy death (e.g., remove from game)
    }
}

const zombieTypes = [
    new Enemy('Walker', 50, 10, 1),
    new Enemy('Runner', 30, 15, 2),
    new Enemy('Brute', 100, 20, 0.5)
];

export function spawnEnemy(type) {
    const enemy = zombieTypes.find(z => z.type === type);
    if (enemy) {
        console.log(`Spawned a ${enemy.type} with ${enemy.health} health.`);
        return enemy;
    }
    console.error('Enemy type not found!');
    return null;
}