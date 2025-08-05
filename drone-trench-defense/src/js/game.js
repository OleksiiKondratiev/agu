class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.score = 0;
        this.level = 1;
        this.isGameOver = false;
        this.lastTime = 0;
        
        // Game objects
        this.player = new Player('Drone-1', 100, 20);
        this.enemies = [];
        this.projectiles = [];
        
        // Game settings
        this.enemySpawnRate = 2000; // milliseconds
        this.lastSpawnTime = 0;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.player.position = { x, y };
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.shoot();
            }
        });
    }

    shoot() {
        const projectile = {
            x: this.player.position.x + 20,
            y: this.player.position.y + 10,
            width: 10,
            height: 4,
            speed: 10,
            damage: this.player.damage
        };
        this.projectiles.push(projectile);
    }

    spawnEnemy() {
        const types = ['Walker', 'Runner', 'Brute'];
        const type = types[Math.floor(Math.random() * types.length)];
        const enemy = spawnEnemy(type);
        if (enemy) {
            enemy.position = {
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 50)
            };
            this.enemies.push(enemy);
        }
    }

    update(deltaTime) {
        // Spawn enemies
        if (Date.now() - this.lastSpawnTime > this.enemySpawnRate) {
            this.spawnEnemy();
            this.lastSpawnTime = Date.now();
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.x += projectile.speed;
            return projectile.x < this.canvas.width;
        });

        // Update enemies and check collisions
        this.enemies = this.enemies.filter(enemy => {
            enemy.position.x -= enemy.speed;

            // Check projectile collisions
            this.projectiles.forEach((projectile, index) => {
                if (checkCollision(projectile, enemy)) {
                    enemy.takeDamage(projectile.damage);
                    this.projectiles.splice(index, 1);
                    if (enemy.health <= 0) {
                        this.score += 10;
                        return false;
                    }
                }
            });

            return enemy.position.x > 0 && enemy.health > 0;
        });
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(
            this.player.position.x,
            this.player.position.y,
            40,
            20
        );

        // Draw projectiles
        this.ctx.fillStyle = '#fff';
        this.projectiles.forEach(projectile => {
            this.ctx.fillRect(
                projectile.x,
                projectile.y,
                projectile.width,
                projectile.height
            );
        });

        // Draw enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.type === 'Brute' ? '#ff0000' : '#ff6666';
            this.ctx.fillRect(
                enemy.position.x,
                enemy.position.y,
                30,
                30
            );
        });

        // Draw HUD
        this.drawHUD();
    }

    drawHUD() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        this.ctx.fillText(`Level: ${this.level}`, 20, 60);
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        if (!this.isGameOver) {
            requestAnimationFrame(this.gameLoop);
        } else {
            this.showGameOver();
        }
    }

    showGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 50);
    }
}

// Start game when window loads
window.addEventListener('load', () => {
    new Game();
});