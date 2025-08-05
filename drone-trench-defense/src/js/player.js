export default class Player {
    constructor() {
        this.x = 100;
        this.y = 300;
        this.width = 40;
        this.height = 20;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    draw(ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}