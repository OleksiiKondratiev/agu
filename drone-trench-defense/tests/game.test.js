// game.test.js

describe('Game Functionality', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    test('should initialize with default values', () => {
        expect(game.score).toBe(0);
        expect(game.level).toBe(1);
        expect(game.isGameOver).toBe(false);
    });

    test('should increase score when an enemy is defeated', () => {
        game.defeatEnemy();
        expect(game.score).toBe(10);
    });

    test('should end the game when player health reaches zero', () => {
        game.player.health = 0;
        game.checkGameOver();
        expect(game.isGameOver).toBe(true);
    });

    test('should level up after defeating a certain number of enemies', () => {
        for (let i = 0; i < 10; i++) {
            game.defeatEnemy();
        }
        expect(game.level).toBe(2);
    });
});