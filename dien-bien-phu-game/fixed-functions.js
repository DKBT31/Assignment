// Fixed Game Engine - Clean Drawing Functions
// Use this to replace the corrupted sections in game-engine.js

// Fixed render function
render() {
    this.clearScreen();
    this.drawBackground();
    this.drawHouses();
    this.drawPlayer();
    this.drawEnemies();
    this.drawBullets();
    this.drawBombs();
    this.drawParticles();
    this.drawExplosions();
    this.drawUI();
    this.drawCrosshair();
}

clearScreen() {
    this.ctx.clearRect(0, 0, this.width, this.height);
}

drawBackground() {
    // Use custom background image if available, otherwise fallback to gradient
    if (this.images.background) {
        // Draw custom background image, scaled to fit canvas
        this.ctx.drawImage(this.images.background, 0, 0, this.width, this.height);
    } else {
        // Fallback: original gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');    // Sky blue
        gradient.addColorStop(0.3, '#98D8E8');  // Light blue
        gradient.addColorStop(0.6, '#F0E68C');  // Khaki (horizon)
        gradient.addColorStop(0.75, '#90EE90'); // Light green
        gradient.addColorStop(1, '#228B22');    // Forest green

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Thêm texture cho đất
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.1)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.width;
            const y = this.height * 0.7 + Math.random() * this.height * 0.3;
            this.ctx.fillRect(x, y, 2, 2);
        }
    }

    // Draw mountains ở xa (only if using fallback background)
    if (!this.images.background) {
        this.ctx.fillStyle = 'rgba(105, 105, 105, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height * 0.4);
        for (let i = 0; i <= this.width; i += 50) {
            this.ctx.lineTo(i, this.height * 0.4 + Math.sin(i * 0.01) * 30);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.fill();
    }

    // Draw clouds với shadow (keep clouds for atmosphere)
    this.ctx.save();
    for (let i = 0; i < 6; i++) {
        const x = (i * 150 + (this.levelTimer * 0.01) % 900) % (this.width + 100) - 50;
        const y = 60 + i * 25 + Math.sin(this.levelTimer * 0.001 + i) * 10;

        // Cloud shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.drawCloud(x + 3, y + 3);

        // Main cloud
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.7 - i * 0.1})`;
        this.drawCloud(x, y);
    }
    this.ctx.restore();

    // Thêm birds bay xa xa
    if (Math.random() < 0.1) {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const birdX = Math.random() * this.width;
            const birdY = 100 + Math.random() * 100;
            this.ctx.beginPath();
            this.ctx.arc(birdX - 5, birdY, 2, 0, Math.PI);
            this.ctx.arc(birdX + 5, birdY, 2, 0, Math.PI);
            this.ctx.stroke();
        }
    }
}

drawCloud(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
    this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    this.ctx.fill();
}

// Instructions:
// Replace the corrupted functions in game-engine.js with these clean versions
// The syntax errors should be fixed after replacing the render section
