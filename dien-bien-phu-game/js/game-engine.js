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

        // Hệ thống phòng thủ chung
        this.defenseHealth = 1000;
        this.maxDefenseHealth = 1000;

        // Timers và counters
        this.enemySpawnTimer = 0;
        this.levelTimer = 0;
        this.targetKills = 10;
        this.currentKills = 0;

        // Input handling
        this.mouse = { x: 0, y: 0 };

        // Audio
        this.audioEnabled = true;

        // Image assets
        this.images = {};
        this.imagesLoaded = false;

        this.init();
    }

    async init() {
        // Initialize game first, then load images in background
        this.setupPlayer();
        this.setupHouses();
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);

        // Load images asynchronously without blocking game start
        this.loadImages();
    }

    async loadImages() {
        const imageList = [
            { name: 'background', src: 'assets/images/background.png' },
            { name: 'aircraft', src: 'assets/images/aircraft.png' },
            { name: 'gunBarrel', src: 'assets/images/gun-barrel.png' },
            { name: 'gunBody', src: 'assets/images/gun-body.png' }
        ];

        const imagePromises = imageList.map(item => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.images[item.name] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Could not load image: ${item.src}, using fallback`);
                    this.images[item.name] = null;
                    resolve(); // Continue even if image fails to load
                };
                img.src = item.src;
            });
        });

        await Promise.all(imagePromises);
        this.imagesLoaded = true;
        console.log('Images loaded:', Object.keys(this.images));
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
        // Tạo nhà dân 2 bên pháo - chỉ giữ thông tin vị trí và kích thước
        this.houses = [
            {
                x: 50,
                y: this.height - 120,
                width: 80,
                height: 60
            },
            {
                x: 150,
                y: this.height - 130,
                width: 70,
                height: 70
            },
            {
                x: this.width - 130,
                y: this.height - 120,
                width: 80,
                height: 60
            },
            {
                x: this.width - 220,
                y: this.height - 130,
                width: 70,
                height: 70
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
        this.lastTime = performance.now(); // Reset timing
        this.gameLoop();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.lastTime = performance.now(); // Reset timing để tránh delta time lớn
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        if (!this.isPaused) {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            this.update(deltaTime);
        }

        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Giới hạn deltaTime để tránh jump lớn khi resume và đảm bảo không âm
        deltaTime = Math.max(0, Math.min(deltaTime, 100));

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
            vx: fromLeft ? 1 + Math.random() * 1 : -(1 + Math.random() * 1), // Giảm tốc độ
            vy: Math.random() * 0.3 - 0.15, // Bay hơi lên xuống nhẹ hơn
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

                    // Create hit effect
                    this.createHitEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        this.score += 100;
                        this.currentKills++;
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        this.enemies.splice(enemyIndex, 1);
                        this.playSound('explosion');
                    }
                }
            });
        });

        // Bomb vs House collisions - damage unified defense instead
        this.bombs.forEach((bomb, bombIndex) => {
            this.houses.forEach((house, houseIndex) => {
                if (this.checkCollision(bomb, house)) {
                    this.defenseHealth -= bomb.damage;
                    this.createExplosion(bomb.x, bomb.y);
                    this.bombs.splice(bombIndex, 1);

                    if (this.defenseHealth <= 0) {
                        this.defenseHealth = 0;
                        this.score -= 200; // Penalty for defense loss
                    }
                }
            });
        });

        // Bomb vs Player collision - also damage unified defense
        this.bombs.forEach((bomb, bombIndex) => {
            if (this.checkCollision(bomb, this.player)) {
                this.defenseHealth -= bomb.damage;
                this.createExplosion(bomb.x, bomb.y);
                this.bombs.splice(bombIndex, 1);

                if (this.defenseHealth <= 0) {
                    this.defenseHealth = 0;
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
        // When player/cannon is hit, damage unified defense
        this.defenseHealth -= 100;  // Significant damage to defense when cannon is hit

        if (this.defenseHealth <= 0) {
            this.defenseHealth = 0;
            this.gameOver("Mặt trận phòng thủ đã bị phá hủy!");
        }

        this.updateUI();
    }

    checkGameState() {
        // Check lose condition - unified defense health
        if (this.defenseHealth <= 0) {
            this.gameOver("Mặt trận phòng thủ đã bị phá hủy!");
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
            <p>Chúc mừng! Bạn đã hoàn thành ngày ${this.currentLevel}</p>
            <p>Điểm số: ${this.score}</p>
            <p>Máy bay tiêu diệt: ${this.currentKills}/${this.targetKills}</p>
            <p>Nhà dân bảo vệ: ${aliveHouses}/${totalHouses}</p>
            ${this.currentLevel < 12 ? '<p>Màn tiếp theo đã mở khóa!</p>' : '<p>🏆 Bạn đã hoàn thành tất cả 12 ngày!</p>'}
        `;

        // Thay đổi nút "Tiếp tục" thành "Màn tiếp theo" hoặc "Về trang chủ"
        const continueBtn = document.getElementById('continueBtn');
        if (this.currentLevel < 12) {
            continueBtn.textContent = 'Màn tiếp theo';
            continueBtn.onclick = () => nextLevel();
        } else {
            continueBtn.textContent = 'Về trang chủ';
            continueBtn.onclick = () => goHome();
        }

        overlay.classList.remove('hidden');
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
        if (!this.audioEnabled) return;

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
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawBackground() {
        // Use custom background image if available, otherwise fallback to gradient
        if (this.images.background && this.images.background instanceof HTMLImageElement) {
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

    drawHouses() {
        this.houses.forEach(house => {
            this.ctx.save();

            // Vẽ nhà dân với chi tiết - không có thanh máu cá nhân
            // Tường nhà với gradient
            const wallGradient = this.ctx.createLinearGradient(house.x, house.y, house.x + house.width, house.y);
            // Màu sắc dựa theo sức khỏe tổng thể của mặt trận
            const healthRatio = this.defenseHealth / this.maxDefenseHealth;
            if (healthRatio > 0.7) {
                wallGradient.addColorStop(0, '#D2691E');
                wallGradient.addColorStop(0.5, '#8B4513');
                wallGradient.addColorStop(1, '#654321');
            } else if (healthRatio > 0.3) {
                wallGradient.addColorStop(0, '#A0522D');
                wallGradient.addColorStop(0.5, '#654321');
                wallGradient.addColorStop(1, '#4A4A4A');
            } else {
                wallGradient.addColorStop(0, '#696969');
                wallGradient.addColorStop(0.5, '#4A4A4A');
                wallGradient.addColorStop(1, '#2F2F2F');
            }
            this.ctx.fillStyle = wallGradient;
            this.ctx.fillRect(house.x, house.y, house.width, house.height);

            // Viền tường
            this.ctx.strokeStyle = '#2F2F2F';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(house.x, house.y, house.width, house.height);

            // Mái nhà với gradient
            const roofGradient = this.ctx.createLinearGradient(house.x, house.y - 20, house.x, house.y);
            roofGradient.addColorStop(0, '#FF6347');
            roofGradient.addColorStop(0.5, '#DC143C');
            roofGradient.addColorStop(1, '#8B0000');
            this.ctx.fillStyle = roofGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(house.x - 10, house.y);
            this.ctx.lineTo(house.x + house.width / 2, house.y - 20);
            this.ctx.lineTo(house.x + house.width + 10, house.y);
            this.ctx.fill();

            // Viền mái
            this.ctx.strokeStyle = '#4A4A4A';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Cửa với chi tiết
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(house.x + house.width * 0.4, house.y + house.height * 0.4,
                house.width * 0.2, house.height * 0.6);
            this.ctx.strokeStyle = '#2F2F2F';
            this.ctx.strokeRect(house.x + house.width * 0.4, house.y + house.height * 0.4,
                house.width * 0.2, house.height * 0.6);

            // Tay nắm cửa
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(house.x + house.width * 0.55, house.y + house.height * 0.65, 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Cửa sổ với khung
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(house.x + house.width * 0.7, house.y + house.height * 0.3,
                house.width * 0.15, house.height * 0.2);
            this.ctx.strokeStyle = '#4A4A4A';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(house.x + house.width * 0.7, house.y + house.height * 0.3,
                house.width * 0.15, house.height * 0.2);

            // Khung cửa sổ
            this.ctx.strokeStyle = '#2F2F2F';
            this.ctx.beginPath();
            this.ctx.moveTo(house.x + house.width * 0.775, house.y + house.height * 0.3);
            this.ctx.lineTo(house.x + house.width * 0.775, house.y + house.height * 0.5);
            this.ctx.moveTo(house.x + house.width * 0.7, house.y + house.height * 0.4);
            this.ctx.lineTo(house.x + house.width * 0.85, house.y + house.height * 0.4);
            this.ctx.stroke();

            // Ống khói nếu mặt trận còn khỏe
            if (this.defenseHealth > this.maxDefenseHealth * 0.5) {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(house.x + house.width * 0.8, house.y - 30, 6, 15);

                // Khói
                this.ctx.fillStyle = 'rgba(128, 128, 128, 0.6)';
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(house.x + house.width * 0.8 + 3 + Math.sin(Date.now() * 0.01 + i) * 5,
                        house.y - 35 - i * 8, 3 + i, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        });
    }

    drawPlayer() {
        const p = this.player;

        this.ctx.save();

        // Define scaling factors for consistency
        const gunBodyScale = 2.0;  // Make gun body 2x bigger
        const gunBarrelScale = 1.5; // Make gun barrel 1.5x bigger

        // Use custom gun body image if available
        if (this.images.gunBody && this.images.gunBody instanceof HTMLImageElement) {
            // Calculate scaled dimensions relative to natural image size
            const scaledWidth = this.images.gunBody.width * gunBodyScale;
            const scaledHeight = this.images.gunBody.height * gunBodyScale;

            // Draw gun body centered around player center for consistent pivot
            this.ctx.drawImage(
                this.images.gunBody,
                p.x + p.width / 2 - scaledWidth / 2,  // Center horizontally
                p.y + p.height / 2 - scaledHeight / 2, // Center vertically  
                scaledWidth,
                scaledHeight
            );
        } else {
            // Fallback: Platform với hiệu ứng 3D
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(p.x, p.y + 35, 60, 10);
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(p.x + 2, p.y + 37, 56, 6);

            // Base của pháo với gradient
            const baseGradient = this.ctx.createRadialGradient(p.x + 30, p.y + 30, 5, p.x + 30, p.y + 30, 25);
            baseGradient.addColorStop(0, '#696969');
            baseGradient.addColorStop(0.7, '#4A4A4A');
            baseGradient.addColorStop(1, '#2F2F2F');
            this.ctx.fillStyle = baseGradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x + 30, p.y + 32, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // Chi tiết base
            this.ctx.strokeStyle = '#1A1A1A';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(p.x + 30, p.y + 32, 20, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Gun barrel - with rotation around proper pivot point
        this.ctx.save();
        this.ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        this.ctx.rotate(p.angle);

        if (this.images.gunBarrel && this.images.gunBarrel instanceof HTMLImageElement) {
            // Calculate scaled dimensions relative to natural image size
            const scaledBarrelWidth = this.images.gunBarrel.width * gunBarrelScale;
            const scaledBarrelHeight = this.images.gunBarrel.height * gunBarrelScale;

            // Draw barrel with proper anchor point at base (where it connects to body)
            this.ctx.drawImage(
                this.images.gunBarrel,
                -5, // Small offset from pivot for realistic attachment point
                -scaledBarrelHeight / 2, // Center vertically around rotation axis
                scaledBarrelWidth,
                scaledBarrelHeight
            );
        } else {
            // Fallback: Nòng pháo với gradient và chi tiết
            const barrelGradient = this.ctx.createLinearGradient(0, -4, 0, 4);
            barrelGradient.addColorStop(0, '#556B2F');
            barrelGradient.addColorStop(1, '#1C3A1C');
            this.ctx.fillStyle = barrelGradient;
            this.ctx.fillRect(0, -4, p.barrelLength, 8);

            // Barrel details
            this.ctx.fillStyle = '#1A1A1A';
            this.ctx.fillRect(0, -1, p.barrelLength, 2);
            this.ctx.fillRect(p.barrelLength - 5, -5, 5, 10);
        }

        // Muzzle flash effect (updated to work with scaled barrel)
        if (Date.now() - p.lastShot < 100) {
            // Calculate muzzle position based on actual barrel length
            const muzzleX = (this.images.gunBarrel && this.images.gunBarrel instanceof HTMLImageElement) ?
                (this.images.gunBarrel.width * gunBarrelScale - 5) : p.barrelLength;

            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(muzzleX, 0, 8, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.arc(muzzleX, 0, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();

        // Khiên bảo vệ (only for fallback design)
        if (!(this.images.gunBody && this.images.gunBody instanceof HTMLImageElement)) {
            this.ctx.fillStyle = '#8B7355';
            this.ctx.beginPath();
            this.ctx.arc(p.x + 30, p.y + 20, 15, Math.PI * 0.2, Math.PI * 0.8);
            this.ctx.fill();
        }

        this.ctx.restore();

        // Health bar
        if (p.health < p.maxHealth) {
            this.drawHealthBar(p.x, p.y - 10, p.width, p.health / p.maxHealth);
        }
    }

    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.save();

            // Use custom aircraft image if available
            if (this.images.aircraft && this.images.aircraft instanceof HTMLImageElement) {
                // Determine flight direction
                const flyingLeft = enemy.vx < 0;

                // Better proportions for aircraft - wider and taller
                const aircraftWidth = enemy.width * 2; // Make wider
                const aircraftHeight = enemy.height * 5; // Make taller
                const offsetX = (aircraftWidth - enemy.width) / 2; // Center the larger image
                const offsetY = (aircraftHeight - enemy.height) / 2;

                // Flip image for direction
                if (flyingLeft) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(this.images.aircraft,
                        -enemy.x - aircraftWidth + offsetX,
                        enemy.y - offsetY,
                        aircraftWidth,
                        aircraftHeight);
                } else {
                    this.ctx.drawImage(this.images.aircraft,
                        enemy.x - offsetX,
                        enemy.y - offsetY,
                        aircraftWidth,
                        aircraftHeight);
                }
            } else {
                // Fallback: original aircraft drawing code
                const flyingLeft = enemy.vx < 0;

                // Draw aircraft với hướng đúng và chi tiết hơn
                if (flyingLeft) {
                    // Bay từ phải qua trái - mũi hướng trái

                    // Thân máy bay với gradient
                    const gradient = this.ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + 22);
                    gradient.addColorStop(0, '#6495ED');
                    gradient.addColorStop(0.5, '#4682B4');
                    gradient.addColorStop(1, '#2F4F4F');
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(enemy.x, enemy.y + 10, 60, 12); // Fuselage

                    // Cánh máy bay với hiệu ứng 3D
                    this.ctx.fillStyle = '#5A5A5A';
                    this.ctx.fillRect(enemy.x - 10, enemy.y + 13, 80, 6); // Wings
                    this.ctx.fillStyle = '#4682B4';
                    this.ctx.fillRect(enemy.x - 8, enemy.y + 14, 76, 4); // Wing details

                    // Đuôi máy bay
                    this.ctx.fillStyle = '#2F4F4F';
                    this.ctx.fillRect(enemy.x + 50, enemy.y + 5, 10, 22); // Tail
                    this.ctx.fillStyle = '#FF0000';
                    this.ctx.fillRect(enemy.x + 52, enemy.y + 7, 6, 8); // Tail marking

                    // Cửa sổ buồng lái
                    this.ctx.fillStyle = '#87CEEB';
                    this.ctx.fillRect(enemy.x + 8, enemy.y + 12, 12, 8);
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(enemy.x + 8, enemy.y + 12, 12, 8);

                    // Propeller animation
                    this.ctx.strokeStyle = '#B0B0B0';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    const propTime = Date.now() * 0.05;
                    this.ctx.arc(enemy.x - 5, enemy.y + 16, 8, propTime, propTime + Math.PI);
                    this.ctx.arc(enemy.x - 5, enemy.y + 16, 8, propTime + Math.PI, propTime + 2 * Math.PI);
                    this.ctx.stroke();

                    // Propeller center
                    this.ctx.fillStyle = '#333333';
                    this.ctx.beginPath();
                    this.ctx.arc(enemy.x - 5, enemy.y + 16, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Bay từ trái qua phải - mũi hướng phải
                    // Thân máy bay với gradient
                    const gradient = this.ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + 22);
                    gradient.addColorStop(0, '#6495ED');
                    gradient.addColorStop(0.5, '#4682B4');
                    gradient.addColorStop(1, '#2F4F4F');
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(enemy.x + 20, enemy.y + 10, 60, 12); // Fuselage

                    // Cánh máy bay với hiệu ứng 3D
                    this.ctx.fillStyle = '#5A5A5A';
                    this.ctx.fillRect(enemy.x + 10, enemy.y + 13, 80, 6); // Wings
                    this.ctx.fillStyle = '#4682B4';
                    this.ctx.fillRect(enemy.x + 12, enemy.y + 14, 76, 4); // Wing details

                    // Đuôi máy bay
                    this.ctx.fillStyle = '#2F4F4F';
                    this.ctx.fillRect(enemy.x + 20, enemy.y + 5, 10, 22); // Tail
                    this.ctx.fillStyle = '#FF0000';
                    this.ctx.fillRect(enemy.x + 22, enemy.y + 7, 6, 8); // Tail marking

                    // Cửa sổ buồng lái
                    this.ctx.fillStyle = '#87CEEB';
                    this.ctx.fillRect(enemy.x + 60, enemy.y + 12, 12, 8);
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(enemy.x + 60, enemy.y + 12, 12, 8);

                    // Propeller animation
                    this.ctx.strokeStyle = '#B0B0B0';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    const propTime = Date.now() * 0.05;
                    this.ctx.arc(enemy.x + 85, enemy.y + 16, 8, propTime, propTime + Math.PI);
                    this.ctx.arc(enemy.x + 85, enemy.y + 16, 8, propTime + Math.PI, propTime + 2 * Math.PI);
                    this.ctx.stroke();

                    // Propeller center
                    this.ctx.fillStyle = '#333333';
                    this.ctx.beginPath();
                    this.ctx.arc(enemy.x + 85, enemy.y + 16, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();

            // Health bar for tougher enemies
            if (enemy.maxHealth > 1) {
                this.drawHealthBar(enemy.x, enemy.y - 8, enemy.width, enemy.health / enemy.maxHealth);
            }
        });
    }

    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.save();

            if (bullet.friendly) {
                // Viên đạn của ta - tracer bullet
                this.ctx.fillStyle = '#FFD700';
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2,
                    bullet.width, bullet.height);

                // Trail effect
                this.ctx.fillStyle = '#FF8C00';
                this.ctx.fillRect(bullet.x - bullet.width / 2 - 2, bullet.y - bullet.height / 2 + 1,
                    bullet.width - 2, bullet.height - 2);
            } else {
                // Viên đạn địch
                this.ctx.fillStyle = '#FF0000';
                this.ctx.shadowColor = '#FF0000';
                this.ctx.shadowBlur = 5;
                this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2,
                    bullet.width, bullet.height);
            }

            this.ctx.restore();
        });
    }

    drawBombs() {
        this.bombs.forEach(bomb => {
            this.ctx.save();

            // Bom với gradient
            const bombGradient = this.ctx.createRadialGradient(bomb.x, bomb.y, 0, bomb.x, bomb.y, bomb.width);
            bombGradient.addColorStop(0, '#8B0000');
            bombGradient.addColorStop(0.7, '#654321');
            bombGradient.addColorStop(1, '#2F2F2F');
            this.ctx.fillStyle = bombGradient;
            this.ctx.fillRect(bomb.x - bomb.width / 2, bomb.y - bomb.height / 2,
                bomb.width, bomb.height);

            // Fins (đuôi bom)
            this.ctx.fillStyle = '#696969';
            this.ctx.fillRect(bomb.x - 2, bomb.y - bomb.height, 4, bomb.height / 2);
            this.ctx.fillRect(bomb.x - 4, bomb.y - bomb.height + 2, 8, 2);

            // Whistling effect
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(bomb.x, bomb.y - bomb.height);
            this.ctx.lineTo(bomb.x, bomb.y - bomb.height - 10);
            this.ctx.stroke();

            this.ctx.restore();
        });
    } drawParticles() {
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

            // Vẽ vụ nổ nhiều lớp
            // Lớp ngoài - màu đỏ cam
            this.ctx.fillStyle = '#FF4500';
            this.ctx.shadowColor = '#FF4500';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
            this.ctx.fill();

            // Lớp giữa - màu vàng
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 22, 0, Math.PI * 2);
            this.ctx.fill();

            // Lớp trong - màu trắng
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.shadowColor = '#FFFFFF';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Tia nổ
            this.ctx.strokeStyle = '#FF8C00';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 5;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                this.ctx.beginPath();
                this.ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
                this.ctx.lineTo(Math.cos(angle) * 35, Math.sin(angle) * 35);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    }

    drawCrosshair() {
        const x = this.mouse.x;
        const y = this.mouse.y;

        this.ctx.save();

        // Crosshair với hiệu ứng phát sáng
        this.ctx.shadowColor = '#FF0000';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 20, y);
        this.ctx.lineTo(x - 8, y);
        this.ctx.moveTo(x + 8, y);
        this.ctx.lineTo(x + 20, y);
        this.ctx.moveTo(x, y - 20);
        this.ctx.lineTo(x, y - 8);
        this.ctx.moveTo(x, y + 8);
        this.ctx.lineTo(x, y + 20);
        this.ctx.stroke();

        // Crosshair trắng bên trong
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.shadowBlur = 5;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y);
        this.ctx.lineTo(x - 5, y);
        this.ctx.moveTo(x + 5, y);
        this.ctx.lineTo(x + 15, y);
        this.ctx.moveTo(x, y - 15);
        this.ctx.lineTo(x, y - 5);
        this.ctx.moveTo(x, y + 5);
        this.ctx.lineTo(x, y + 15);
        this.ctx.stroke();

        // Vòng tròn ngoài với animation
        this.ctx.shadowBlur = 8;
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        const radius = 25 + Math.sin(Date.now() * 0.01) * 3;
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Vòng tròn trong
        this.ctx.shadowBlur = 3;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.stroke();

        // Điểm giữa
        this.ctx.fillStyle = '#FF0000';
        this.ctx.shadowColor = '#FF0000';
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawHealthBar(x, y, width, healthPercent) {
        this.ctx.save();

        // Background thanh máu với shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 2;
        this.ctx.fillStyle = 'rgba(64, 64, 64, 0.9)';
        this.ctx.fillRect(x - 1, y - 1, width + 2, 6);

        // Background trong thanh máu
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
        this.ctx.fillRect(x, y, width, 4);

        // Thanh máu thực tế với gradient
        if (healthPercent > 0) {
            const healthWidth = width * healthPercent;

            // Tạo gradient cho thanh máu
            const gradient = this.ctx.createLinearGradient(x, y, x + healthWidth, y);
            if (healthPercent > 0.6) {
                gradient.addColorStop(0, '#00FF00');    // Xanh lá sáng
                gradient.addColorStop(1, '#32CD32');    // Xanh lá đậm
            } else if (healthPercent > 0.3) {
                gradient.addColorStop(0, '#FFD700');    // Vàng sáng
                gradient.addColorStop(1, '#FFA500');    // Cam
            } else {
                gradient.addColorStop(0, '#FF6347');    // Đỏ sáng
                gradient.addColorStop(1, '#DC143C');    // Đỏ đậm
            }

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, healthWidth, 4);

            // Hiệu ứng shine cho thanh máu
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(x, y, healthWidth, 1);
        }

        // Viền thanh máu
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, 4);

        // Text hiển thị phần trăm máu (nếu cần)
        if (healthPercent < 1) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${Math.round(healthPercent * 100)}%`, x + width / 2, y - 2);
            this.ctx.textAlign = 'left'; // Reset về mặc định
        }

        this.ctx.restore();
    }

    drawUI() {
        // Draw kill counter
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`${this.currentKills}/${this.targetKills}`, 10, 30);

        // Draw level timer
        const totalSeconds = Math.max(0, Math.floor(this.levelTimer / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, this.width - 80, 30);

        // Draw unified defense health bar
        const healthRatio = this.defenseHealth / this.maxDefenseHealth;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 55, 200, 20);

        // Health bar background
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(12, 57, 196, 16);

        // Health bar fill
        const healthColor = healthRatio > 0.7 ? '#00FF00' :
            healthRatio > 0.3 ? '#FFFF00' : '#FF0000';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(12, 57, 196 * healthRatio, 16);

        // Health bar border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(12, 57, 196, 16);

        // Defense strength label
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Sức Mạnh Mặt Trận', 12, 52);

        // Health value text
        this.ctx.fillText(`${Math.ceil(this.defenseHealth)}/${this.maxDefenseHealth}`, 220, 67);
    }
}
