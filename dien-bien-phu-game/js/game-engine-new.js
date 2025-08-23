// Game Engine cho Điện Biên Phủ - Phiên bản hoàn chỉnh
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.lastTime = 0;

        // Game objects
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.bombs = [];
        this.particles = [];
        this.explosions = [];
        this.houses = [];

        // Timers và counters
        this.enemySpawnTimer = 0;
        this.levelTimer = 0;
        this.targetKills = 10;
        this.currentKills = 0;

        // Input handling
        this.mouse = { x: 0, y: 0 };

        // Audio
        this.audioEnabled = true;

        this.init();
    }

    init() {
        this.setupPlayer();
        this.setupHouses();
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
    }

    setupPlayer() {
        // Pháo cố định ở giữa màn hình dưới
        this.player = {
            x: this.width / 2 - 30,
            y: this.height - 100,
            width: 60,
            height: 40,
            angle: -Math.PI / 2, // Hướng lên trên
            health: 100,
            maxHealth: 100,
            lastShot: 0,
            fireRate: 300,
            barrelLength: 40
        };
    }

    setupHouses() {
        // Tạo nhà dân 2 bên pháo
        this.houses = [
            {
                x: 50,
                y: this.height - 120,
                width: 80,
                height: 60,
                health: 100,
                maxHealth: 100,
                name: "Nhà dân bên trái"
            },
            {
                x: 150,
                y: this.height - 130,
                width: 70,
                height: 70,
                health: 100,
                maxHealth: 100,
                name: "Kho lương thực"
            },
            {
                x: this.width - 130,
                y: this.height - 120,
                width: 80,
                height: 60,
                health: 100,
                maxHealth: 100,
                name: "Nhà dân bên phải"
            },
            {
                x: this.width - 220,
                y: this.height - 130,
                width: 70,
                height: 70,
                health: 100,
                maxHealth: 100,
                name: "Trạm y tế"
            }
        ];
    }

    setupEventListeners() {
        // Mouse events - để ngắm bắn
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;

            // Tính góc từ pháo đến chuột
            const dx = this.mouse.x - (this.player.x + this.player.width / 2);
            const dy = this.mouse.y - (this.player.y + this.player.height / 2);

            // Giới hạn góc ngắm (chỉ bắn lên trên)
            let angle = Math.atan2(dy, dx);
            if (angle > -Math.PI / 6) angle = -Math.PI / 6; // Không quá 30 độ phải
            if (angle < -Math.PI + Math.PI / 6) angle = -Math.PI + Math.PI / 6; // Không quá 30 độ trái

            this.player.angle = angle;
        });

        this.canvas.addEventListener('click', (e) => {
            if (!this.isPaused && this.isRunning) {
                this.shoot();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.isPaused && this.isRunning) {
                    this.shoot();
                }
            }
        });
    }

    loadLevel(levelId) {
        const levelData = historicalData.find(d => d.id === levelId);
        if (!levelData) return;

        this.currentLevel = levelId;
        this.targetKills = parseInt(levelData.gameObjective.match(/\d+/)[0]);
        this.currentKills = 0;
        this.levelTimer = 0;

        // Clear arrays
        this.enemies = [];
        this.bullets = [];
        this.bombs = [];
        this.particles = [];
        this.explosions = [];

        // Reset houses
        this.houses.forEach(house => {
            house.health = house.maxHealth;
        });

        // Update UI
        document.getElementById('levelTitle').textContent = `Ngày ${levelId}: ${levelData.title}`;
        document.getElementById('levelDate').textContent = levelData.date;
        document.getElementById('objective').textContent = levelData.gameObjective;

        // Update history panel
        const contextDiv = document.getElementById('historicalContext');
        const significanceDiv = document.getElementById('historicalSignificance');
        const quoteDiv = document.getElementById('historicalQuote');

        contextDiv.innerHTML = `
            <p><strong>Bối cảnh:</strong> ${levelData.description}</p>
            <p><strong>Nhân vật quan trọng:</strong> ${levelData.keyFigures.join(', ')}</p>
            <p><strong>Tầm quan trọng chiến lược:</strong> ${levelData.strategicImportance}</p>
        `;

        significanceDiv.innerHTML = `
            <p>${levelData.significance}</p>
            <div class="difficulty-indicator">
                <strong>Độ khó:</strong> ${'⭐'.repeat(Math.min(levelData.difficulty, 5))} (${levelData.difficulty}/12)
            </div>
        `;

        quoteDiv.textContent = levelData.historicalQuote;

        // Reset player
        this.setupPlayer();
        this.lives = 3;
        this.updateUI();
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!this.isPaused) {
            this.update(deltaTime);
        }

        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        this.levelTimer += deltaTime;

        // Spawn enemies
        this.updateEnemySpawning(deltaTime);

        // Update game objects
        this.updateBullets(deltaTime);
        this.updateBombs(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateParticles(deltaTime);
        this.updateExplosions(deltaTime);

        // Check collisions
        this.checkCollisions();

        // Check win/lose conditions
        this.checkGameState();
    }

    updateEnemySpawning(deltaTime) {
        this.enemySpawnTimer += deltaTime;

        const spawnRate = Math.max(1000, 2500 - (this.currentLevel * 150));

        if (this.enemySpawnTimer > spawnRate) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
    }

    spawnEnemy() {
        // Máy bay bay từ phải qua trái hoặc trái qua phải
        const fromLeft = Math.random() < 0.5;
        const startX = fromLeft ? -60 : this.width + 60;
        const startY = Math.random() * 150 + 50; // Bay ở độ cao khác nhau

        const enemy = {
            x: startX,
            y: startY,
            width: 80,
            height: 30,
            vx: fromLeft ? 2 + Math.random() * 2 : -(2 + Math.random() * 2),
            vy: Math.random() * 0.5 - 0.25, // Bay hơi lên xuống
            health: 1 + Math.floor(this.currentLevel / 3),
            maxHealth: 1 + Math.floor(this.currentLevel / 3),
            type: 'aircraft',
            lastBomb: 0,
            bombRate: 2000 + Math.random() * 3000
        };

        this.enemies.push(enemy);
    }

    updateBullets(deltaTime) {
        this.bullets.forEach((bullet, index) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Remove bullets that are off-screen
            if (bullet.x < 0 || bullet.x > this.width ||
                bullet.y < 0 || bullet.y > this.height) {
                this.bullets.splice(index, 1);
            }
        });
    }

    updateBombs(deltaTime) {
        this.bombs.forEach((bomb, index) => {
            bomb.x += bomb.vx;
            bomb.y += bomb.vy;
            bomb.vy += 0.2; // Gravity

            // Remove bombs that hit ground
            if (bomb.y > this.height) {
                this.createExplosion(bomb.x, bomb.y);
                this.playSound('explosion'); // Play bomb explosion sound
                this.bombs.splice(index, 1);
            }
        });
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;

            // Drop bombs randomly
            if (Date.now() - enemy.lastBomb > enemy.bombRate && Math.random() < 0.1) {
                this.dropBomb(enemy);
                enemy.lastBomb = Date.now();
            }

            // Remove enemies that are off-screen
            if ((enemy.vx > 0 && enemy.x > this.width + 100) ||
                (enemy.vx < 0 && enemy.x < -100)) {
                this.enemies.splice(index, 1);
            }
        });
    }

    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime;
            particle.vy += 0.1; // Gravity

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    updateExplosions(deltaTime) {
        this.explosions.forEach((explosion, index) => {
            explosion.life -= deltaTime;
            explosion.scale += 0.02;

            if (explosion.life <= 0) {
                this.explosions.splice(index, 1);
            }
        });
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.player.lastShot < this.player.fireRate) return;

        this.player.lastShot = currentTime;

        const startX = this.player.x + this.player.width / 2;
        const startY = this.player.y + this.player.height / 2;

        // Tính hướng bắn dựa trên góc nòng pháo
        const speed = 12;
        const vx = Math.cos(this.player.angle) * speed;
        const vy = Math.sin(this.player.angle) * speed;

        this.bullets.push({
            x: startX,
            y: startY,
            vx: vx,
            vy: vy,
            width: 4,
            height: 8,
            damage: 1,
            friendly: true
        });

        this.playSound('shoot');

        // Muzzle flash effect
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: startX,
                y: startY,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -3,
                life: 300,
                maxLife: 300,
                color: '#FFD700'
            });
        }
    }

    dropBomb(enemy) {
        this.bombs.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            vx: enemy.vx * 0.5,
            vy: 2,
            width: 6,
            height: 12,
            damage: 25
        });

        // Play bomb falling sound
        this.playSound('bombFall');
    }

    checkCollisions() {
        // Bullet vs Enemy collisions
        this.bullets.forEach((bullet, bulletIndex) => {
            if (!bullet.friendly) return;

            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    // Damage enemy
                    enemy.health -= bullet.damage;
                    this.bullets.splice(bulletIndex, 1);

                    // Play bullet hit sound
                    this.playSound('bulletHit');

                    // Create hit effect
                    this.createHitEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        this.score += 100;
                        this.currentKills++;
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        this.enemies.splice(enemyIndex, 1);
                        this.playSound('planeExplosion'); // Use plane explosion sound
                    }
                }
            });
        });

        // Bomb vs House collisions
        this.bombs.forEach((bomb, bombIndex) => {
            this.houses.forEach((house, houseIndex) => {
                if (this.checkCollision(bomb, house)) {
                    house.health -= bomb.damage;
                    this.createExplosion(bomb.x, bomb.y);
                    this.playSound('explosion'); // Play bomb explosion sound
                    this.bombs.splice(bombIndex, 1);

                    if (house.health <= 0) {
                        house.health = 0;
                        this.score -= 200; // Penalty for losing house
                    }
                }
            });
        });

        // Bomb vs Player collision
        this.bombs.forEach((bomb, bombIndex) => {
            if (this.checkCollision(bomb, this.player)) {
                this.player.health -= bomb.damage;
                this.createExplosion(bomb.x, bomb.y);
                this.playSound('explosion'); // Play bomb explosion sound
                this.bombs.splice(bombIndex, 1);

                if (this.player.health <= 0) {
                    this.playerHit();
                }
            }
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            scale: 0,
            life: 800,
            maxLife: 800
        });

        // Create explosion particles
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1000,
                maxLife: 1000,
                color: Math.random() > 0.5 ? '#FF4500' : '#FFD700'
            });
        }
    }

    createHitEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 300,
                maxLife: 300,
                color: '#FFFF00'
            });
        }
    }

    playerHit() {
        this.lives--;
        this.player.health = this.player.maxHealth;

        if (this.lives <= 0) {
            this.gameOver();
        }

        this.updateUI();
    }

    checkGameState() {
        // Check lose conditions
        const aliveHouses = this.houses.filter(h => h.health > 0).length;
        if (aliveHouses === 0) {
            this.gameOver("Tất cả nhà dân đã bị phá hủy!");
            return;
        }

        if (this.lives <= 0) {
            this.gameOver("Pháo phòng không đã bị tiêu diệt!");
            return;
        }

        // Check win condition
        if (this.currentKills >= this.targetKills) {
            this.levelComplete();
        }
    }

    gameOver(reason = "") {
        this.stop();
        this.showGameOver(reason);
    }

    levelComplete() {
        this.stop();

        // Update game state
        if (!gameState.completedLevels.includes(this.currentLevel)) {
            gameState.completedLevels.push(this.currentLevel);
        }

        if (this.currentLevel < 12 && !gameState.unlockedLevels.includes(this.currentLevel + 1)) {
            gameState.unlockedLevels.push(this.currentLevel + 1);
        }

        gameState.totalScore += this.score;
        saveGameState();

        this.playSound('victory');
        this.showLevelComplete();
    }

    showLevelComplete() {
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');

        const aliveHouses = this.houses.filter(h => h.health > 0).length;
        const totalHouses = this.houses.length;

        title.textContent = '🎉 Hoàn thành màn chơi!';
        message.innerHTML = `
            <div class="completion-content">
                <p class="completion-congrats">Chúc mừng! Bạn đã hoàn thành ngày ${this.currentLevel}</p>
                <div class="completion-stats">
                    <div class="stat-item">
                        <span class="stat-label">Điểm số:</span>
                        <span class="stat-value">${this.score}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Máy bay tiêu diệt:</span>
                        <span class="stat-value">${this.currentKills}/${this.targetKills}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Nhà dân bảo vệ:</span>
                        <span class="stat-value">${aliveHouses}/${totalHouses}</span>
                    </div>
                </div>
                <p class="completion-next">${this.currentLevel < 12 ? '🎯 Màn tiếp theo đã mở khóa!' : '🏆 Bạn đã hoàn thành tất cả 12 ngày!'}</p>
            </div>
        `;

        // Add detail button if not already present
        let detailBtn = document.getElementById('detailBtn');
        if (!detailBtn) {
            detailBtn = document.createElement('button');
            detailBtn.id = 'detailBtn';
            detailBtn.textContent = '📚 Xem chi tiết lịch sử';
            detailBtn.onclick = () => this.viewDayDetail();

            const buttonContainer = document.querySelector('.overlay-buttons');
            buttonContainer.insertBefore(detailBtn, buttonContainer.firstChild);
        }

        overlay.classList.remove('hidden');
    }

    viewDayDetail() {
        // Navigate to the detail page for the current day
        window.location.href = `dien-bien-phu-game/details/day${this.currentLevel}.html`;
    }

    showGameOver(reason) {
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');

        title.textContent = '💥 Nhiệm vụ thất bại';
        message.innerHTML = `
            <p><strong>${reason}</strong></p>
            <p>Điểm số: ${this.score}</p>
            <p>Máy bay tiêu diệt: ${this.currentKills}/${this.targetKills}</p>
            <p>"Bảo vệ Điện Biên Phủ là nhiệm vụ thiêng liêng!"</p>
        `;

        overlay.classList.remove('hidden');
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }

    playSound(soundName) {
        // Check both game engine audio state and global sound toggle
        if (!this.audioEnabled || !soundEnabled) return;

        const audio = document.getElementById(soundName + 'Sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Cannot play sound:', e));
        }
    }

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
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#90EE90');
        gradient.addColorStop(1, '#228B22');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawBackground() {
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 4; i++) {
            const x = (i * 200 + (this.levelTimer * 0.01) % 800) % this.width;
            this.drawCloud(x, 80 + i * 40);
        }
    }

    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHouses() {
        this.houses.forEach(house => {
            // Vẽ nhà dân
            if (house.health > 0) {
                this.ctx.fillStyle = house.health > house.maxHealth * 0.5 ? '#8B4513' : '#654321';
                this.ctx.fillRect(house.x, house.y, house.width, house.height);

                // Mái nhà
                this.ctx.fillStyle = '#DC143C';
                this.ctx.beginPath();
                this.ctx.moveTo(house.x - 10, house.y);
                this.ctx.lineTo(house.x + house.width / 2, house.y - 20);
                this.ctx.lineTo(house.x + house.width + 10, house.y);
                this.ctx.fill();

                // Cửa
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(house.x + house.width * 0.4, house.y + house.height * 0.4,
                    house.width * 0.2, house.height * 0.6);

                // Cửa sổ
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(house.x + house.width * 0.7, house.y + house.height * 0.3,
                    house.width * 0.15, house.height * 0.2);
            } else {
                // Nhà bị phá hủy
                this.ctx.fillStyle = '#333333';
                this.ctx.fillRect(house.x, house.y + house.height * 0.7, house.width, house.height * 0.3);
            }

            // Health bar
            if (house.health < house.maxHealth) {
                this.drawHealthBar(house.x, house.y - 10, house.width, house.health / house.maxHealth);
            }

            // Name
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(house.name, house.x, house.y - 15);
        });
    }

    drawPlayer() {
        const p = this.player;

        this.ctx.save();

        // Draw anti-aircraft gun base
        this.ctx.fillStyle = '#4A4A4A';
        this.ctx.fillRect(p.x + 10, p.y + 25, 40, 15); // Base

        // Draw barrel (rotating)
        this.ctx.fillStyle = '#2F4F2F';
        this.ctx.save();
        this.ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        this.ctx.rotate(p.angle);
        this.ctx.fillRect(0, -3, p.barrelLength, 6); // Barrel
        this.ctx.restore();

        // Platform
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(p.x, p.y + 35, 60, 10);

        this.ctx.restore();

        // Health bar
        if (p.health < p.maxHealth) {
            this.drawHealthBar(p.x, p.y - 10, p.width, p.health / p.maxHealth);
        }
    }

    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.save();

            // Draw aircraft
            this.ctx.fillStyle = '#4682B4';
            this.ctx.fillRect(enemy.x, enemy.y + 10, 60, 12); // Fuselage
            this.ctx.fillRect(enemy.x - 10, enemy.y + 13, 80, 6); // Wings
            this.ctx.fillRect(enemy.x + 50, enemy.y + 5, 10, 22); // Tail

            // Propeller
            this.ctx.strokeStyle = '#CCCCCC';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(enemy.vx > 0 ? enemy.x - 5 : enemy.x + 65, enemy.y + 16, 5, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.restore();

            // Health bar for tougher enemies
            if (enemy.maxHealth > 1) {
                this.drawHealthBar(enemy.x, enemy.y - 8, enemy.width, enemy.health / enemy.maxHealth);
            }
        });
    }

    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.friendly ? '#FFD700' : '#FF0000';
            this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2,
                bullet.width, bullet.height);
        });
    }

    drawBombs() {
        this.bombs.forEach(bomb => {
            this.ctx.fillStyle = '#8B0000';
            this.ctx.fillRect(bomb.x - bomb.width / 2, bomb.y - bomb.height / 2,
                bomb.width, bomb.height);

            // Bomb tail
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(bomb.x - 2, bomb.y - bomb.height, 4, bomb.height / 2);
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.restore();
        });
    }

    drawExplosions() {
        this.explosions.forEach(explosion => {
            this.ctx.save();
            this.ctx.globalAlpha = explosion.life / explosion.maxLife;
            this.ctx.translate(explosion.x, explosion.y);
            this.ctx.scale(explosion.scale, explosion.scale);

            // Draw explosion
            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawCrosshair() {
        const x = this.mouse.x;
        const y = this.mouse.y;

        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y);
        this.ctx.lineTo(x + 15, y);
        this.ctx.moveTo(x, y - 15);
        this.ctx.lineTo(x, y + 15);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawHealthBar(x, y, width, healthPercent) {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, width, 4);

        this.ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
        this.ctx.fillRect(x, y, width * healthPercent, 4);

        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, 4);
    }

    drawUI() {
        // Draw kill counter
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`${this.currentKills}/${this.targetKills}`, 10, 30);

        // Draw level timer
        const minutes = Math.floor(this.levelTimer / 60000);
        const seconds = Math.floor((this.levelTimer % 60000) / 1000);
        this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, this.width - 80, 30);

        // Draw houses status
        const aliveHouses = this.houses.filter(h => h.health > 0).length;
        this.ctx.fillStyle = aliveHouses > 2 ? '#00FF00' : aliveHouses > 1 ? '#FFFF00' : '#FF0000';
        this.ctx.fillText(`Nhà dân: ${aliveHouses}/${this.houses.length}`, 10, 60);
    }
}
