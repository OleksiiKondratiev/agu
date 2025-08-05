import Player from './player.js';
import { Enemy, spawnEnemy } from './enemies.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas dimensions
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.score = 0;
        this.health = 100;
        
        // Initialize player position
        this.playerX = 100;
        this.playerY = this.canvas.height / 2;

        this.player = new Player('Drone-1', 100, 20);
        
        // Start game loop
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
        
        // Setup input handlers
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.playerX = e.clientX - rect.left;
            this.playerY = e.clientY - rect.top;
        });
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#4CAF50';  // Green color
        this.ctx.fillRect(this.playerX - 20, this.playerY - 10, 40, 20);
    }
    
    drawBackground() {
        // Draw sky
        this.ctx.fillStyle = '#2c2c2c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
    }
    
    updateHUD() {
        document.querySelector('#score span').textContent = this.score;
        document.querySelector('#health span').textContent = this.health;
    }
    
    gameLoop() {
        // Clear and draw background
        this.drawBackground();
        
        // Draw game objects
        this.drawPlayer();
        
        // Update HUD
        this.updateHUD();
        
        // Continue loop
        requestAnimationFrame(this.gameLoop);
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    new Game();
});