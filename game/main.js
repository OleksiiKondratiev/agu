// Modular structure, descriptive comments for maintainability

// Asset folders (images, sounds) will be created as needed


// Game constants
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let lastTimestamp = 0;
let gameState = 'loading'; // loading, playing, gameover, etc.

// Input state
const keys = {};
let mouseX = CANVAS_WIDTH / 2;
let mouseY = CANVAS_HEIGHT / 2;

// Drone class
class Drone {
  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.width = 48;
    this.height = 24;
    this.speed = 300;
    this.bombs = [];
    this.cooldown = 0;
  }
  update(delta) {
    // Keyboard movement
    let dx = 0, dy = 0;
    if (keys['ArrowLeft'] || keys['a']) dx -= 1;
    if (keys['ArrowRight'] || keys['d']) dx += 1;
    if (keys['ArrowUp'] || keys['w']) dy -= 1;
    if (keys['ArrowDown'] || keys['s']) dy += 1;
    // Mouse movement (optional: move toward mouse)
    // Uncomment for mouse-following drone:
    // const mx = mouseX - this.x, my = mouseY - this.y;
    // if (Math.abs(mx) > 5) dx += Math.sign(mx);
    // if (Math.abs(my) > 5) dy += Math.sign(my);
    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx*dx + dy*dy);
      this.x += (dx/len) * this.speed * delta;
      this.y += (dy/len) * this.speed * delta;
    }
    // Clamp to canvas
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.height, this.y));
    // Bomb cooldown
    if (this.cooldown > 0) this.cooldown -= delta;
    // Update bombs
    this.bombs = this.bombs.filter(bomb => !bomb.done);
    for (const bomb of this.bombs) bomb.update(delta);
  }
  dropBomb() {
    if (this.cooldown <= 0) {
      this.bombs.push(new Bomb(this.x + this.width/2, this.y + this.height));
      this.cooldown = 0.5; // 0.5s cooldown
    }
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = '#0ff';
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.width, this.height);
    ctx.restore();
    for (const bomb of this.bombs) bomb.render(ctx);
  }
}

// Bomb class
class Bomb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.exploded = false;
    this.done = false;
    this.timer = 0;
  }
  update(delta) {
    if (!this.exploded) {
      this.y += 400 * delta;
      if (this.y > CANVAS_HEIGHT - 32) { // hit ground
        this.exploded = true;
        this.timer = 0.3; // explosion lasts 0.3s
      }
    } else {
      this.timer -= delta;
      if (this.timer <= 0) this.done = true;
    }
  }
  render(ctx) {
    if (!this.exploded) {
      ctx.save();
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(255,128,0,0.6)';
      ctx.beginPath();
      ctx.arc(Math.round(this.x), Math.round(this.y), this.radius*3, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }
}


// Base class
class Base {
  constructor() {
    this.x = 0;
    this.y = CANVAS_HEIGHT / 2 - 80;
    this.width = 32;
    this.height = 160;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }
  render(ctx) {
    // Draw base (placeholder: gray rectangle)
    ctx.save();
    ctx.fillStyle = '#888';
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.width, this.height);
    // Draw health bar
    ctx.fillStyle = '#f00';
    const barHeight = (this.health / this.maxHealth) * this.height;
    ctx.fillRect(Math.round(this.x), Math.round(this.y + this.height - barHeight), 8, Math.round(barHeight));
    ctx.restore();
  }
}

// Zombie types
const ZOMBIE_TYPES = [
  { type: 'walker', speed: 60, color: '#0f0', width: 32, height: 48, health: 10, damage: 5 },
  { type: 'biker', speed: 120, color: '#ff0', width: 36, height: 40, health: 8, damage: 7 },
  { type: 'armored', speed: 40, color: '#0ff', width: 40, height: 56, health: 20, damage: 10 },
  { type: 'tank', speed: 25, color: '#f0f', width: 56, height: 64, health: 40, damage: 20 }
];

class Zombie {
  constructor(typeObj) {
    this.type = typeObj.type;
    this.speed = typeObj.speed;
    this.color = typeObj.color;
    this.width = typeObj.width;
    this.height = typeObj.height;
    this.maxHealth = typeObj.health;
    this.health = this.maxHealth;
    this.damage = typeObj.damage;
    this.x = CANVAS_WIDTH + Math.random() * 100;
    this.y = 40 + Math.random() * (CANVAS_HEIGHT - 80 - this.height);
    this.alive = true;
  }
  update(delta) {
    this.x -= this.speed * delta;
    if (this.x < 32 && this.alive) {
      this.x = 32;
      this.alive = false;
      base.takeDamage(this.damage);
    }
  }
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) this.alive = false;
  }
  render(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.width, this.height);
    // Health bar
    ctx.fillStyle = '#f00';
    ctx.fillRect(Math.round(this.x), Math.round(this.y - 6), Math.round((this.health / this.maxHealth) * this.width), 4);
    ctx.restore();
  }
}

// Level system and backgrounds
const LEVELS = [
  { name: 'Fields', bg: '#2a3', scenery: 'fields' },
  { name: 'Mountains', bg: '#345', scenery: 'mountains' },
  { name: 'Forest', bg: '#273', scenery: 'forest' },
  { name: 'City', bg: '#444', scenery: 'city' }
];
let currentLevel = 0;
let score = 0;

// Enemy spawner
let narrativeEvent = null;

class EnemySpawner {
  constructor() {
    this.zombies = [];
    this.spawnTimer = 0;
    this.wave = 1;
    this.zombiesPerWave = 8;
    this.spawned = 0;
    this.waveActive = true;
    this.waveDelay = 2.5;
    this.waveTimer = 0;
  }
  update(delta) {
    // Spawn zombies if wave is active
    if (this.waveActive && this.spawned < this.zombiesPerWave) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        let typeIdx = Math.min(ZOMBIE_TYPES.length - 1, Math.floor(Math.random() * (1 + this.wave/2)));
        const zombie = new Zombie(ZOMBIE_TYPES[typeIdx]);
        this.zombies.push(zombie);
        this.spawned++;
        this.spawnTimer = 0.8 + Math.random() * 0.7;
      }
    }
    for (const z of this.zombies) z.update(delta);
    this.zombies = this.zombies.filter(z => z.alive || z.x > 0);
    if (this.spawned >= this.zombiesPerWave && this.zombies.every(z => !z.alive)) {
      if (this.waveActive) {
        this.waveActive = false;
        this.waveTimer = this.waveDelay;
        // Trigger narrative event placeholder
        narrativeEvent = `Wave ${this.wave} complete! Prepare for the next wave...`;
      }
    }
    if (!this.waveActive && this.waveTimer > 0) {
      this.waveTimer -= delta;
      if (this.waveTimer <= 0) {
        this.wave++;
        this.zombiesPerWave = 8 + this.wave * 2;
        this.spawned = 0;
        this.waveActive = true;
      }
    }
  }
  render(ctx) {
    for (const z of this.zombies) z.render(ctx);
  }
}

// Instantiate game objects
const drone = new Drone();
const base = new Base();
const enemySpawner = new EnemySpawner();

// Input handling
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if ((e.key === ' ' || e.code === 'Space') && gameState === 'playing') {
    drone.dropBomb();
  }
});
window.addEventListener('keyup', e => {
  keys[e.key] = false;
});
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
  mouseY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
});

// Asset loading (placeholder)
function loadAssets(callback) {
  // TODO: Implement asset preloading for images and sounds
  // Example: loadImage('assets/images/drone.png'), loadSound('assets/sounds/explosion.wav')
  callback();
}

// Sound effect hooks (placeholder)
function playSound(name) {
  // TODO: Implement sound playback
  // Example: playSound('explosion')
}

// Main game loop
function gameLoop(timestamp) {
  const delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  update(delta);
  render();

  requestAnimationFrame(gameLoop);
}


function update(delta) {
  if (gameState === 'playing') {
    drone.update(delta);
    enemySpawner.update(delta);
    // Bomb-zombie collision
    for (const bomb of drone.bombs) {
      if (bomb.exploded && !bomb.done) {
        for (const z of enemySpawner.zombies) {
          if (z.alive && circleRectCollide(bomb.x, bomb.y, bomb.radius*3, z.x, z.y, z.width, z.height)) {
            z.takeDamage(15);
            if (!z.alive) score += 10;
          }
        }
      }
    }
    // Level transition
    if (enemySpawner.wave > LEVELS.length && currentLevel < LEVELS.length - 1) {
      currentLevel++;
      // TODO: Load new background/scenery assets
    }
    // Game over
    if (base.health <= 0) {
      gameState = 'gameover';
    }
    // Level complete
    if (enemySpawner.wave > LEVELS.length && currentLevel === LEVELS.length - 1) {
      gameState = 'levelcomplete';
    }
  }
}

function render() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (gameState === 'playing' || gameState === 'gameover' || gameState === 'levelcomplete') {
    // Draw background (level-based color)
    ctx.fillStyle = LEVELS[currentLevel].bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // TODO: Draw scenery image for LEVELS[currentLevel].scenery
    // Draw base
    base.render(ctx);
    // Draw zombies
    enemySpawner.render(ctx);
    // Draw drone and bombs
    drone.render(ctx);
    // Draw HUD
    drawHUD();
    // Narrative event overlay
    if (narrativeEvent) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, CANVAS_HEIGHT/2 - 40, CANVAS_WIDTH, 60);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(narrativeEvent, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
      ctx.restore();
      // Hide after a short time
      setTimeout(() => { narrativeEvent = null; }, 1800);
    }
    // Game over overlay
    if (gameState === 'gameover') {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
      ctx.font = '24px monospace';
      ctx.fillText('Score: ' + score, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 30);
      ctx.restore();
    }
    // Level complete overlay
    if (gameState === 'levelcomplete') {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LEVEL COMPLETE!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
      ctx.font = '24px monospace';
      ctx.fillText('Final Score: ' + score, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 30);
      ctx.restore();
    }
  }
}

function drawHUD() {
  ctx.save();
  ctx.font = '16px monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  // Base health
  ctx.fillText('Base: ' + base.health + '/' + base.maxHealth, 16, 28);
  // Wave
  ctx.fillText('Wave: ' + enemySpawner.wave, 16, 52);
  // Level
  ctx.fillText('Level: ' + LEVELS[currentLevel].name, 16, 76);
  // Score
  ctx.textAlign = 'right';
  ctx.fillText('Score: ' + score, CANVAS_WIDTH - 16, 28);
  ctx.restore();
}

// Helper: circle-rectangle collision
function circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
  // Find closest point to circle within rectangle
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (cr * cr);
}

// Start game after assets are loaded
loadAssets(() => {
  gameState = 'playing';
  lastTimestamp = performance.now();
  requestAnimationFrame(gameLoop);
});
