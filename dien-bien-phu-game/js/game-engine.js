// Game Engine cho Điện Biên Phủ - Phiên bản hoàn chỉnh
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Base dimensions for scaling calculations
        this.baseWidth = 1400;
        this.baseHeight = 800;

        // Set initial canvas size
        this.setupResponsiveCanvas();

        // Current dimensions (may be scaled)
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.lastTime = 0;

        // Game objects
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.bombs = [];
        this.particles = [];
        this.explosions = [];
        this.powerUps = [];

        // Power-up effects
        this.activePowerUps = {
            rapidFire: false,
            shield: false,
            multiShot: false,
            spreadShot: false
        };
        this.powerUpTimers = {};

        // Hệ thống phòng thủ chung
        this.defenseHealth = 1000;
        this.maxDefenseHealth = 1000;

        // Timers và counters
        this.enemySpawnTimer = 0;
        this.levelTimer = 0;
        this.targetKills = 10;
        this.currentKills = 0;

        // C-47 spawn tracking (rare spawns)
        this.c47SpawnedThisLevel = 0;
        this.maxC47PerLevel = 2; // Maximum 2 C-47s per level

        // Input handling
        this.mouse = { x: 0, y: 0 };

        // Audio
        this.audioEnabled = true;

        // Image assets
        this.images = {};
        this.imagesLoaded = false;

        this.init();
    }

    setupResponsiveCanvas() {
        // Get the container dimensions
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();

        // Calculate available space (accounting for header and padding)
        const availableWidth = window.innerWidth;
        const availableHeight = window.innerHeight - 80; // Account for header

        // Calculate aspect ratio
        const gameAspectRatio = this.baseWidth / this.baseHeight;
        const screenAspectRatio = availableWidth / availableHeight;

        let canvasWidth, canvasHeight;

        if (screenAspectRatio > gameAspectRatio) {
            // Screen is wider than game - fit to height
            canvasHeight = Math.min(availableHeight * 0.9, this.baseHeight);
            canvasWidth = canvasHeight * gameAspectRatio;
        } else {
            // Screen is taller than game - fit to width
            canvasWidth = Math.min(availableWidth * 0.95, this.baseWidth);
            canvasHeight = canvasWidth / gameAspectRatio;
        }

        // Ensure minimum sizes
        canvasWidth = Math.max(320, canvasWidth);
        canvasHeight = Math.max(180, canvasHeight);

        // Set canvas dimensions
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;

        // Set CSS dimensions for scaling
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';

        // Calculate scaling factors for mouse input
        this.scaleX = this.baseWidth / canvasWidth;
        this.scaleY = this.baseHeight / canvasHeight;

        // Update dimensions
        this.width = this.baseWidth;
        this.height = this.baseHeight;
    }

    handleResize() {
        this.setupResponsiveCanvas();
        // Re-setup player position if needed
        if (this.player) {
            this.setupPlayer();
        }
    }

    async init() {
        // Initialize game first, then load images in background
        this.setupPlayer();
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);

        // Load images asynchronously without blocking game start
        this.loadImages();
    }

    async loadImages() {
        const imageList = [
            { name: 'background', src: 'assets/images/background.png' },
            { name: 'aircraft', src: 'assets/images/aircraft.png' },
            { name: 'f4c', src: 'assets/images/F-4C.png' },
            { name: 'c47', src: 'assets/images/C-47.png' },
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
            x: this.width / 2 - 45,
            y: this.height - 120,
            width: 90,
            height: 60,
            angle: -Math.PI / 2, // Hướng lên trên
            health: 100,
            maxHealth: 100,
            lastShot: 0,
            fireRate: 300,
            barrelLength: 60
        };
    }

    setupEventListeners() {
        // Mouse events - để ngắm bắn
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            // Account for scaling when calculating mouse position
            const rawX = e.clientX - rect.left;
            const rawY = e.clientY - rect.top;

            // Scale mouse coordinates to match game coordinates
            this.mouse.x = rawX * (this.scaleX || 1);
            this.mouse.y = rawY * (this.scaleY || 1);

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

        // Touch events for mobile devices
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.isPaused && this.isRunning) {
                this.shoot();
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];

            // Account for scaling when calculating touch position
            const rawX = touch.clientX - rect.left;
            const rawY = touch.clientY - rect.top;

            // Scale touch coordinates to match game coordinates
            this.mouse.x = rawX * (this.scaleX || 1);
            this.mouse.y = rawY * (this.scaleY || 1);

            // Tính góc từ pháo đến touch
            const dx = this.mouse.x - (this.player.x + this.player.width / 2);
            const dy = this.mouse.y - (this.player.y + this.player.height / 2);

            // Giới hạn góc ngắm (chỉ bắn lên trên)
            let angle = Math.atan2(dy, dx);
            if (angle > -Math.PI / 6) angle = -Math.PI / 6; // Không quá 30 độ phải
            if (angle < -Math.PI + Math.PI / 6) angle = -Math.PI + Math.PI / 6; // Không quá 30 độ trái

            this.player.angle = angle;
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

        // Window resize event for responsive canvas
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Orientation change for mobile devices
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }

    reset() {
        // Reset game state for new level
        this.currentKills = 0;
        this.levelTimer = 0;
        this.enemySpawnTimer = 0;
        this.c47SpawnedThisLevel = 0;

        // Reset defense health
        this.defenseHealth = this.maxDefenseHealth;

        // Clear all game objects
        this.enemies = [];
        this.bullets = [];
        this.bombs = [];
        this.particles = [];
        this.explosions = [];
        this.powerUps = [];

        // Reset power-ups
        this.activePowerUps = {
            rapidFire: false,
            shield: false,
            multiShot: false,
            spreadShot: false
        };
        this.powerUpTimers = {};

        // Reset player
        if (this.player) {
            this.player.x = this.width / 2;
            this.player.y = this.height - 100;
            this.player.health = this.player.maxHealth;
        }

        console.log('Game reset for level', this.currentLevel);
    }

    loadLevel(levelId) {
        const levelData = historicalData.find(d => d.id === levelId);
        if (!levelData) return;

        this.currentLevel = levelId;

        // Parse target kills from gameObjective with fallback
        const killsMatch = levelData.gameObjective.match(/\d+/);
        if (killsMatch) {
            this.targetKills = parseInt(killsMatch[0]);
        } else {
            // Fallback for levels without explicit numbers
            console.warn(`No kill target found in gameObjective for level ${levelId}, using default`);
            this.targetKills = 10; // Default target
        }

        console.log(`Level ${levelId} loaded, target kills: ${this.targetKills}`);

        this.currentKills = 0;
        this.levelTimer = 0;

        // Reset C-47 spawn counter for new level
        this.c47SpawnedThisLevel = 0;

        // Clear arrays
        this.enemies = [];
        this.bullets = [];
        this.bombs = [];
        this.particles = [];
        this.explosions = [];
        this.powerUps = []; // Clear any remaining power-ups

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

    restart() {
        // Stop current game
        this.stop();

        // Reset all game state
        this.currentKills = 0;
        this.levelTimer = 0;
        this.enemySpawnTimer = 0;

        // Reset C-47 spawn counter
        this.c47SpawnedThisLevel = 0;

        // Reset defense health
        this.defenseHealth = this.maxDefenseHealth;

        // Clear all arrays
        this.enemies = [];
        this.bullets = [];
        this.bombs = [];
        this.particles = [];
        this.explosions = [];
        this.powerUps = [];

        // Reset power-ups
        this.activePowerUps = {
            rapidFire: false,
            shield: false,
            multiShot: false,
            spreadShot: false
        };
        this.powerUpTimers = {};
        this.messages = [];

        // Reset player
        this.setupPlayer();

        // Update UI
        this.updateUI();

        // Restart the game
        this.start();
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
        this.updatePowerUps(deltaTime);

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
        const startX = fromLeft ? -90 : this.width + 90;
        const startY = Math.random() * 200 + 50; // Bay ở độ cao khác nhau

        // Choose random aircraft type from gameConfig.enemies with C-47 rarity control
        let enemyTypes = gameConfig.enemies;
        let randomType;

        // If C-47 limit reached, exclude it from spawn options
        if (this.c47SpawnedThisLevel >= this.maxC47PerLevel) {
            enemyTypes = gameConfig.enemies.filter(enemy => enemy.type !== 'C47_transport');
        }

        // Special logic for C-47 spawning (10% chance, but only if under limit)
        if (this.c47SpawnedThisLevel < this.maxC47PerLevel && Math.random() < 0.1) {
            randomType = gameConfig.enemies.find(enemy => enemy.type === 'C47_transport');
            this.c47SpawnedThisLevel++;
        } else {
            // Normal spawn from available types (excluding C-47 if over limit)
            const nonC47Types = enemyTypes.filter(enemy => enemy.type !== 'C47_transport');
            randomType = nonC47Types[Math.floor(Math.random() * nonC47Types.length)];
        }

        // Different aircraft have different characteristics
        let bombRate, bombDamage, speed, width, height, burstCount, burstDelay;
        if (randomType.type === 'F4C_phantom') {
            bombRate = 400 + Math.random() * 600; // F-4C: Higher drop rate (faster bombing)
            bombDamage = 15; // F-4C: Lower damage
            speed = randomType.speed * 1.2; // F-4C: Higher speed
            width = 80; // F-4C: Smaller than normal (120)
            height = 30; // F-4C: Smaller than normal (45)
            burstCount = 1; // F-4C: Single bombs
            burstDelay = 0; // F-4C: No burst delay
        } else if (randomType.type === 'B52_bomber') {
            // B-52: Carpet bombing with burst of 5 small bombs
            bombRate = 4000 + Math.random() * 2000; // B-52: Longer delay between bursts
            bombDamage = 5; // B-52: Lower damage per bomb
            speed = randomType.speed; // B-52: Normal speed
            width = 120; // B-52: Normal size
            height = 45; // B-52: Normal size
            burstCount = 5; // B-52: 5 bombs per burst
            burstDelay = 200; // B-52: 200ms between bombs in burst
        } else if (randomType.type === 'C47_transport') {
            // C-47: Transport aircraft with light bombing capability
            bombRate = 3000 + Math.random() * 1000; // C-47: Moderate bombing rate
            bombDamage = 5; // C-47: Low damage
            speed = randomType.speed; // C-47: Slow speed
            width = 80; // C-47: Medium size
            height = 30; // C-47: Medium size
            burstCount = 1; // C-47: Single bombs
            burstDelay = 0; // C-47: No burst delay
        } else {
            // Default aircraft use normal characteristics
            bombRate = 2000 + Math.random() * 3000; // Normal bomb rate
            bombDamage = 25; // Normal damage
            speed = randomType.speed; // Normal speed
            width = 120; // Normal size
            height = 45; // Normal size
            burstCount = 1; // Single bombs
            burstDelay = 0; // No burst delay
        }

        const enemy = {
            x: startX,
            y: startY,
            width: width,
            height: height,
            vx: fromLeft ? speed : -speed,
            vy: Math.random() * 0.3 - 0.15, // Bay hơi lên xuống nhẹ hơn
            health: randomType.health,
            maxHealth: randomType.health,
            type: randomType.type,
            name: randomType.name,
            points: randomType.points,
            color: randomType.color,
            lastBomb: 0,
            bombRate: bombRate,
            bombDamage: bombDamage,
            burstCount: burstCount,
            burstDelay: burstDelay,
            currentBurstCount: 0,
            inBurst: false
        };

        this.enemies.push(enemy);
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // Update bullet position
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Check if bullet is expired or off-screen
            const currentTime = Date.now();
            const isExpired = (currentTime - bullet.created) > bullet.life;
            const isOffScreen = bullet.x < -75 || bullet.x > this.width + 75 ||
                bullet.y < -75 || bullet.y > this.height + 75;

            if (isExpired || isOffScreen) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Add trail effect for friendly bullets
            if (bullet.friendly && Math.random() < 0.3) {
                this.particles.push({
                    x: bullet.x - bullet.vx * 0.5,
                    y: bullet.y - bullet.vy * 0.5,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 100,
                    maxLife: 100,
                    color: '#FFB84D',
                    size: 1
                });
            }
        }
    }

    updateBombs(deltaTime) {
        this.bombs.forEach((bomb, index) => {
            bomb.x += bomb.vx;
            bomb.y += bomb.vy;
            bomb.vy += bomb.gravity || 0.2; // Use bomb's gravity or default

            // Check if bomb hits ground
            if (bomb.y >= this.height - 12) {
                // Damage defense when bomb hits ground
                this.defenseHealth -= bomb.damage || 25;
                this.createExplosion(bomb.x, this.height - 12);
                this.playSound('explosion'); // Play bomb explosion sound
                this.bombs.splice(index, 1);

                // Check if defense is destroyed
                if (this.defenseHealth <= 0) {
                    this.defenseHealth = 0;
                }
            }
        });
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;

            // Drop bombs with burst logic for B-52, normal for others
            if (enemy.type === 'B52_bomber') {
                // B-52 burst bombing logic
                if (!enemy.inBurst) {
                    // Check if it's time to start a new burst
                    if (Date.now() - enemy.lastBomb > enemy.bombRate && Math.random() < 0.1) {
                        enemy.inBurst = true;
                        enemy.currentBurstCount = 0;
                        enemy.lastBomb = Date.now();
                    }
                } else {
                    // Currently in a burst - drop bombs rapidly
                    if (Date.now() - enemy.lastBomb > enemy.burstDelay) {
                        this.dropBomb(enemy);
                        enemy.currentBurstCount++;
                        enemy.lastBomb = Date.now();

                        // Check if burst is complete
                        if (enemy.currentBurstCount >= enemy.burstCount) {
                            enemy.inBurst = false;
                            enemy.currentBurstCount = 0;
                        }
                    }
                }
            } else {
                // Normal bombing logic for other aircraft
                if (Date.now() - enemy.lastBomb > enemy.bombRate && Math.random() < 0.1) {
                    this.dropBomb(enemy);
                    enemy.lastBomb = Date.now();
                }
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

        // Apply rapid fire power-up
        const fireRate = this.activePowerUps.rapidFire ? this.player.fireRate / 2 : this.player.fireRate;
        if (currentTime - this.player.lastShot < fireRate) return;

        this.player.lastShot = currentTime;

        // Calculate bullet starting position at the end of the barrel
        const barrelEndX = this.player.x + this.player.width / 2 + Math.cos(this.player.angle) * this.player.barrelLength;
        const barrelEndY = this.player.y + this.player.height / 2 + Math.sin(this.player.angle) * this.player.barrelLength;

        // Calculate velocity components
        const speed = 15;
        const velocityX = Math.cos(this.player.angle) * speed;
        const velocityY = Math.sin(this.player.angle) * speed;

        if (this.activePowerUps.spreadShot) {
            // Spread shot - 5 bullets in fan pattern
            for (let i = -2; i <= 2; i++) {
                const spreadAngle = this.player.angle + (i * Math.PI / 12); // 15 degrees spread
                const spreadVX = Math.cos(spreadAngle) * speed;
                const spreadVY = Math.sin(spreadAngle) * speed;

                this.bullets.push({
                    x: barrelEndX,
                    y: barrelEndY,
                    vx: spreadVX,
                    vy: spreadVY,
                    angle: spreadAngle,
                    speed: speed,
                    width: 18,
                    height: 6,
                    length: 18,
                    visualWidth: 6,
                    damage: 1,
                    friendly: true,
                    life: 1000,
                    created: currentTime
                });
            }
        } else if (this.activePowerUps.multiShot) {
            // Multi shot - 3 bullets straight
            for (let i = -1; i <= 1; i++) {
                this.bullets.push({
                    x: barrelEndX + i * 8,
                    y: barrelEndY + i * 3,
                    vx: velocityX,
                    vy: velocityY,
                    angle: this.player.angle,
                    speed: speed,
                    width: 18,
                    height: 6,
                    length: 18,
                    visualWidth: 6,
                    damage: 1,
                    friendly: true,
                    life: 1000,
                    created: currentTime
                });
            }
        } else {
            // Normal single bullet
            this.bullets.push({
                x: barrelEndX,
                y: barrelEndY,
                vx: velocityX,
                vy: velocityY,
                angle: this.player.angle,
                speed: speed,
                width: 18,
                height: 6,
                length: 18,
                visualWidth: 6,
                damage: 1,
                friendly: true,
                life: 1000,
                created: currentTime
            });
        }

        this.playSound('shoot');
        // Enhanced muzzle flash effect
        this.createMuzzleFlash(barrelEndX, barrelEndY);
    }

    createMuzzleFlash(x, y) {
        // Create muzzle flash particles
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9,
                life: 150,
                maxLife: 150,
                color: i < 4 ? '#FFD700' : '#FF4500',
                size: Math.random() * 5 + 2
            });
        }
    }

    dropBomb(enemy) {
        let bombVx, bombVy;

        if (enemy.type === 'B52_bomber') {
            // B-52 bombs drop at an angle with more forward momentum
            bombVx = enemy.vx * 0.8; // More forward momentum (80% of aircraft speed)
            bombVy = 1.5; // Slower initial downward velocity
        } else {
            // Other aircraft use normal bomb trajectory
            bombVx = enemy.vx * 0.5; // Normal forward momentum (50% of aircraft speed)
            bombVy = 2; // Normal downward velocity
        }

        this.bombs.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            vx: bombVx,
            vy: bombVy,
            width: 9,
            height: 18,
            damage: enemy.bombDamage || 25,
            gravity: 0.15 // Gravity acceleration for realistic physics
        });

        // Play bomb falling sound
        this.playSound('bombFall');
    }

    dropPowerUp(x, y) {
        // Random power-up from available types
        const powerUpTypes = gameConfig.powerUps;
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        this.powerUps.push({
            x: x,
            y: y,
            width: 24,
            height: 24,
            vx: (Math.random() - 0.5) * 2, // Random horizontal drift
            vy: 1 + Math.random() * 2, // Slow fall
            type: randomPowerUp.type,
            color: randomPowerUp.color,
            name: randomPowerUp.name,
            effect: randomPowerUp.effect,
            icon: randomPowerUp.icon,
            duration: randomPowerUp.duration,
            amount: randomPowerUp.amount,
            pulseTimer: 0
        });
    }

    collectPowerUp(powerUp) {
        if (powerUp.type === 'heal') {
            // Instant healing
            this.defenseHealth = Math.min(this.maxDefenseHealth, this.defenseHealth + powerUp.amount);
            this.showMessage(`+${powerUp.amount} HP`, '#00FF00');
        } else {
            // Timed power-ups
            this.activePowerUps[powerUp.type] = true;
            this.powerUpTimers[powerUp.type] = Date.now() + powerUp.duration;
            this.showMessage(powerUp.name + ' Kích Hoạt!', powerUp.color);
        }
        this.playSound('powerUp');
    }

    activateRandomPowerUp() {
        // Random power-up from available types
        const powerUpTypes = gameConfig.powerUps;
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        if (randomPowerUp.type === 'heal') {
            // Instant healing
            this.defenseHealth = Math.min(this.maxDefenseHealth, this.defenseHealth + randomPowerUp.amount);
            this.showPowerUpNotification(randomPowerUp, `+${randomPowerUp.amount} HP!`);
        } else {
            // Timed power-ups
            this.activePowerUps[randomPowerUp.type] = true;
            this.powerUpTimers[randomPowerUp.type] = Date.now() + randomPowerUp.duration;
            this.showPowerUpNotification(randomPowerUp, randomPowerUp.name + ' Kích Hoạt!');
        }
        this.playSound('powerUp');
    }

    updatePowerUps(deltaTime) {
        // Update power-up positions
        this.powerUps.forEach((powerUp, index) => {
            powerUp.x += powerUp.vx;
            powerUp.y += powerUp.vy;
            powerUp.pulseTimer += deltaTime;

            // Remove if off screen
            if (powerUp.y > this.height + 50) {
                this.powerUps.splice(index, 1);
            }
        });

        // Check power-up collection
        this.powerUps.forEach((powerUp, index) => {
            if (this.checkCollision(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });

        // Update active power-up timers
        const currentTime = Date.now();
        Object.keys(this.powerUpTimers).forEach(type => {
            if (this.powerUpTimers[type] < currentTime) {
                this.activePowerUps[type] = false;
                delete this.powerUpTimers[type];
            }
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

                    // Play bullet hit sound
                    this.playSound('bulletHit');

                    // Create hit effect
                    this.createHitEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        this.currentKills++;
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

                        // C-47 activates power-ups immediately when destroyed
                        if (enemy.type === 'C47_transport') {
                            this.activateRandomPowerUp();
                        }

                        this.enemies.splice(enemyIndex, 1);
                        this.playSound('planeExplosion'); // Use plane explosion sound
                    }
                }
            });
        });

        // Bomb vs Player collision - also damage unified defense
        this.bombs.forEach((bomb, bombIndex) => {
            if (this.checkCollision(bomb, this.player)) {
                // Apply shield power-up to reduce damage
                const damage = this.activePowerUps.shield ? (bomb.damage || 25) * 0.5 : (bomb.damage || 25);
                this.defenseHealth -= damage;
                this.createExplosion(bomb.x, bomb.y);
                this.playSound('explosion'); // Play bomb explosion sound
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
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
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

        saveGameState();

        this.playSound('victory');
        this.showLevelComplete();
    }

    showLevelComplete() {
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');
        const restartBtn = document.getElementById('restartBtn');

        // Get historical data for this level
        const levelData = historicalData.find(data => data.id === this.currentLevel);

        if (!levelData) {
            // Fallback if no historical data found
            title.textContent = '🎉 Hoàn thành màn chơi!';
            message.innerHTML = `<p>Chúc mừng! Bạn đã hoàn thành ngày ${this.currentLevel}</p>`;
        } else {
            // Display historical content
            title.innerHTML = `
                <div style="background: #d32f2f; color: white; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 24px; font-weight: bold;">
                    ${this.currentLevel}
                </div>
            `;

            message.innerHTML = `
                <div class="historical-completion">
                    <h2 style="color: #fff; margin-bottom: 8px; font-size: 28px; font-weight: 600;">${levelData.title}</h2>
                    <p style="color: #ccc; margin-bottom: 12px; font-size: 20px; text-align: center;">${levelData.date}</p>
                    
                    <div class="content-grid">
                        <div style="background: rgba(139, 69, 19, 0.8); padding: 16px; border-radius: 8px;">
                            <h4 style="color: #ffab40; margin-bottom: 8px; font-size: 20px; font-weight: 600;">🎯 Tổn thất Mỹ</h4>
                            <p style="color: #ffab40; font-weight: bold; font-size: 28px; margin: 0;">
                                ${this.currentKills} máy bay bị bắn rơi
                            </p>
                            <p style="color: #ffcc80; font-size: 18px; margin-top: 4px;">
                                Mục tiêu: ${this.targetKills} máy bay
                            </p>
                        </div>
                        
                        <div style="background: rgba(27, 94, 32, 0.8); padding: 16px; border-radius: 8px;">
                            <h4 style="color: #81c784; margin-bottom: 8px; font-size: 20px; font-weight: 600;">🏆 Ý nghĩa lịch sử</h4>
                            <p style="color: #a5d6a7; font-size: 18px; line-height: 1.4; margin: 0;">
                                ${levelData.significance}
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(69, 90, 100, 0.6); padding: 16px; border-radius: 8px; margin-bottom: 12px;" class="full-width">
                        <h4 style="color: #90caf9; margin-bottom: 8px; font-size: 20px; font-weight: 600;">📖 Diễn biến chi tiết</h4>
                        <p style="color: #b0bec5; font-size: 18px; line-height: 1.5; margin: 0;">
                            ${levelData.description}
                        </p>
                    </div>
                    
                    <blockquote style="border-left: 4px solid #d32f2f; padding-left: 12px; margin: 8px 0; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px;" class="full-width">
                        <p style="color: #fff; font-style: italic; margin: 0; font-size: 19px; text-align: center; font-weight: 500; line-height: 1.4;">
                            "${levelData.historicalQuote}"
                        </p>
                        </p>
                    </blockquote>
                    
                    <div class="full-width" style="text-align: center; margin-top: 12px;">
                        ${this.currentLevel < 12 ?
                    '<p style="color: #4caf50; font-weight: bold; font-size: 22px; margin: 0; padding: 10px;">✅ Ngày tiếp theo đã mở khóa!</p>' :
                    '<p style="color: #ffd700; font-weight: bold; font-size: 22px; margin: 0; padding: 10px;">🏆 Hoàn thành chiến dịch "Điện Biên Phủ trên không"!</p>'
                }
                    </div>
                </div>
            `;
        }

        // Setup navigation buttons in order: CHI TIẾT | CHƠI LẠI | VỀ TRANG CHỦ | TIẾP THEO
        const continueBtn = document.getElementById('continueBtn');
        const homeBtn = document.getElementById('homeBtn');

        // Add detail button if not already present
        let detailBtn = document.getElementById('detailBtn');
        if (!detailBtn) {
            detailBtn = document.createElement('button');
            detailBtn.id = 'detailBtn';
            detailBtn.textContent = '📚 XEM CHI TIẾT';
            detailBtn.onclick = () => this.viewDayDetail();

            const buttonContainer = document.querySelector('.overlay-buttons');
            buttonContainer.insertBefore(detailBtn, buttonContainer.firstChild);
        }

        // Left button - CHƠI LẠI (restart)
        restartBtn.style.display = 'inline-block';
        restartBtn.textContent = 'CHƠI LẠI';

        // Middle button - VỀ TRANG CHỦ (home)
        homeBtn.style.display = 'inline-block';
        homeBtn.textContent = 'VỀ TRANG CHỦ';

        // Right button - TIẾP THEO (next level) or hide if last level
        if (this.currentLevel < 12) {
            continueBtn.textContent = 'TIẾP THEO';
            continueBtn.onclick = () => nextLevel();
            continueBtn.style.display = 'inline-block';
        } else {
            // Hide the continue button on the last level since we already have home button
            continueBtn.style.display = 'none';
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
        const continueBtn = document.getElementById('continueBtn');
        const restartBtn = document.getElementById('restartBtn');

        title.textContent = '💥 Nhiệm vụ thất bại';
        message.innerHTML = `
            <p><strong>${reason}</strong></p>
            <p>Máy bay tiêu diệt: ${this.currentKills}/${this.targetKills}</p>
            <p>"Bảo vệ Điện Biên Phủ là nhiệm vụ thiêng liêng!"</p>
        `;

        // Set up continue button for game over (failure) case
        continueBtn.textContent = 'Thử lại';
        continueBtn.onclick = () => {
            overlay.classList.add('hidden');
            this.restart(); // Restart the current level
        };

        // Hide the restart button since continue button now handles restart
        restartBtn.style.display = 'none';

        overlay.classList.remove('hidden');
    }

    updateUI() {
        // UI update method - keeping for compatibility but removing score/lives updates
    }

    playSound(soundName) {
        // Check both game engine audio state and global sound toggle
        if (!this.audioEnabled || !soundEnabled) return;

        const audio = document.getElementById(soundName + 'Sound');
        if (audio) {
            audio.currentTime = 0;

            // Use volume from gameAudioVolumes configuration
            if (typeof gameAudioVolumes !== 'undefined' && gameAudioVolumes[soundName]) {
                audio.volume = gameAudioVolumes[soundName];
            } else {
                // Fallback volume settings
                if (soundName === 'shoot') {
                    audio.volume = 0.3; // Gunshot volume
                } else if (soundName === 'explosion') {
                    audio.volume = 0.5; // Explosion volume
                } else {
                    audio.volume = 0.4; // Default volume
                }
            }

            audio.play().catch(e => console.log('Cannot play sound:', e));
        }
    }

    showMessage(text, color = '#FFFFFF') {
        // Create a temporary message display system
        if (!this.messages) this.messages = [];

        this.messages.push({
            text: text,
            color: color,
            x: this.width / 2,
            y: 200,
            life: 2000, // 2 seconds
            maxLife: 2000,
            created: Date.now()
        });

        // Remove old messages
        this.messages = this.messages.filter(msg =>
            Date.now() - msg.created < msg.life
        );
    }

    showPowerUpNotification(powerUp, text) {
        // Create a special enhanced notification for power-ups
        if (!this.messages) this.messages = [];

        this.messages.push({
            text: `${powerUp.icon} ${text}`,
            color: powerUp.color,
            x: this.width / 2,
            y: 180,
            life: 3000, // 3 seconds for power-up notifications
            maxLife: 3000,
            created: Date.now(),
            isPowerUp: true,
            effect: powerUp.effect || ''
        });

        // Show effect description as well
        if (powerUp.effect) {
            this.messages.push({
                text: powerUp.effect,
                color: '#FFFFFF',
                x: this.width / 2,
                y: 210,
                life: 2500,
                maxLife: 2500,
                created: Date.now(),
                isPowerUp: true
            });
        }

        // Remove old messages
        this.messages = this.messages.filter(msg =>
            Date.now() - msg.created < msg.life
        );
    }

    render() {
        this.clearScreen();
        this.drawBackground();
        this.drawPlayer();
        this.drawEnemies();
        this.drawBullets();
        this.drawBombs();
        this.drawParticles();
        this.drawExplosions();
        this.drawPowerUps();
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

    drawPlayer() {
        const p = this.player;

        this.ctx.save();

        // Use custom gun body image if available
        if (this.images.gunBody) {
            // Draw gun body image
            this.ctx.drawImage(this.images.gunBody, p.x + 15, p.y + 15, 60, 60);
        } else {
            // Fallback: Platform với hiệu ứng 3D
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(p.x, p.y + 52, 90, 15);
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(p.x + 3, p.y + 55, 84, 9);

            // Base của pháo với gradient
            const baseGradient = this.ctx.createRadialGradient(p.x + 45, p.y + 45, 8, p.x + 45, p.y + 45, 38);
            baseGradient.addColorStop(0, '#696969');
            baseGradient.addColorStop(0.7, '#4A4A4A');
            baseGradient.addColorStop(1, '#2F2F2F');
            this.ctx.fillStyle = baseGradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x + 45, p.y + 48, 30, 0, Math.PI * 2);
            this.ctx.fill();

            // Chi tiết base
            this.ctx.strokeStyle = '#1A1A1A';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(p.x + 45, p.y + 48, 30, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Gun barrel - with rotation
        this.ctx.save();
        this.ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        this.ctx.rotate(p.angle);

        if (this.images.gunBarrel) {
            // Draw custom gun barrel image
            this.ctx.drawImage(this.images.gunBarrel, 0, -9, p.barrelLength, 18);
        } else {
            // Fallback: Nòng pháo với gradient và chi tiết
            const barrelGradient = this.ctx.createLinearGradient(0, -6, 0, 6);
            barrelGradient.addColorStop(0, '#556B2F');
            barrelGradient.addColorStop(1, '#1C3A1C');
            this.ctx.fillStyle = barrelGradient;
            this.ctx.fillRect(0, -6, p.barrelLength, 12);

            // Barrel details
            this.ctx.fillStyle = '#1A1A1A';
            this.ctx.fillRect(0, -1.5, p.barrelLength, 3);
            this.ctx.fillRect(p.barrelLength - 8, -8, 8, 16);
        }

        // Muzzle flash effect (nếu vừa bắn)
        if (Date.now() - p.lastShot < 100) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(p.barrelLength + 15, 0, 12, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.arc(p.barrelLength, 0, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();

        // Khiên bảo vệ (only for fallback design)
        if (!this.images.gunBody) {
            this.ctx.fillStyle = '#8B7355';
            this.ctx.beginPath();
            this.ctx.arc(p.x + 45, p.y + 30, 22, Math.PI * 0.2, Math.PI * 0.8);
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

            // Choose appropriate image based on enemy type
            let aircraftImage = this.images.aircraft; // Default to aircraft.png for B-52
            if (enemy.type === 'F4C_phantom' && this.images.f4c) {
                aircraftImage = this.images.f4c; // Use F-4C specific image
            } else if (enemy.type === 'C47_transport' && this.images.c47) {
                aircraftImage = this.images.c47; // Use C-47 specific image
            }

            // Use custom aircraft image if available
            if (aircraftImage && aircraftImage instanceof HTMLImageElement) {
                // Determine flight direction
                const flyingLeft = enemy.vx < 0;

                // Adjust proportions based on aircraft type
                let widthMultiplier = 2; // Default for B-52
                let heightMultiplier = 5; // Default for B-52

                if (enemy.type === 'F4C_phantom') {
                    // F-4C uses different proportions - more compact
                    widthMultiplier = 2.2;
                    heightMultiplier = 4;
                } else if (enemy.type === 'C47_transport') {
                    // C-47 uses medium proportions - transport aircraft
                    widthMultiplier = 2;
                    heightMultiplier = 3.5;
                }

                const aircraftWidth = enemy.width * widthMultiplier;
                const aircraftHeight = enemy.height * heightMultiplier;
                const offsetX = (aircraftWidth - enemy.width) / 2; // Center the larger image
                const offsetY = (aircraftHeight - enemy.height) / 2;

                // Flip image for direction
                if (flyingLeft) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(aircraftImage,
                        -enemy.x - aircraftWidth + offsetX,
                        enemy.y - offsetY,
                        aircraftWidth,
                        aircraftHeight);
                } else {
                    this.ctx.drawImage(aircraftImage,
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

            // Move to bullet position
            this.ctx.translate(bullet.x, bullet.y);

            // Rotate to bullet's angle
            this.ctx.rotate(bullet.angle);

            if (bullet.friendly) {
                // Draw friendly bullet - bigger and more visible
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 6;

                // Main bullet body - bright and visible
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(-bullet.length / 2, -bullet.visualWidth / 2, bullet.length, bullet.visualWidth);

                // Bright center core
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.fillRect(-bullet.length / 2 + 1, -bullet.visualWidth / 2 + 1, bullet.length - 2, bullet.visualWidth - 2);

                // Add a bright outline for visibility
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(-bullet.length / 2, -bullet.visualWidth / 2, bullet.length, bullet.visualWidth);

            } else {
                // Draw enemy bullet
                this.ctx.shadowColor = '#FF0000';
                this.ctx.shadowBlur = 4;

                // Enemy bullet body
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(-bullet.length / 2, -bullet.visualWidth / 2, bullet.length, bullet.visualWidth);

                // Enemy bullet center
                this.ctx.fillStyle = '#FF4444';
                this.ctx.fillRect(-bullet.length / 2 + 1, -bullet.visualWidth / 2 + 1, bullet.length - 2, bullet.visualWidth - 2);
            }

            this.ctx.restore();
        });
    }

    drawBombs() {
        this.bombs.forEach(bomb => {
            this.ctx.save();

            // Calculate rotation angle based on bomb velocity (missile points in direction of travel)
            let angle = Math.atan2(bomb.vy, bomb.vx);

            // Translate to bomb center and rotate to point in direction of travel
            this.ctx.translate(bomb.x, bomb.y);
            this.ctx.rotate(angle);

            // Missile body - elongated and streamlined
            const missileLength = bomb.height * 1.5;
            const missileWidth = bomb.width * 0.7;

            // Main body gradient
            const bodyGradient = this.ctx.createLinearGradient(0, -missileWidth / 2, 0, missileWidth / 2);
            bodyGradient.addColorStop(0, '#2F2F2F');
            bodyGradient.addColorStop(0.3, '#8B0000');
            bodyGradient.addColorStop(0.7, '#654321');
            bodyGradient.addColorStop(1, '#2F2F2F');
            this.ctx.fillStyle = bodyGradient;

            // Draw missile body (pointing right in local coordinates)
            this.ctx.fillRect(-missileLength / 2, -missileWidth / 2, missileLength, missileWidth);

            // Nose cone (pointed tip)
            this.ctx.fillStyle = '#4A4A4A';
            this.ctx.beginPath();
            this.ctx.moveTo(missileLength / 2, 0);
            this.ctx.lineTo(missileLength / 2 - 8, -missileWidth / 2);
            this.ctx.lineTo(missileLength / 2 - 8, missileWidth / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Tail fins - 4 fins in cross pattern
            this.ctx.fillStyle = '#696969';
            const finLength = 6;
            const finWidth = 2;
            const tailPos = -missileLength / 2;

            // Top fin
            this.ctx.fillRect(tailPos, -missileWidth / 2 - finLength, finWidth, finLength);
            // Bottom fin  
            this.ctx.fillRect(tailPos, missileWidth / 2, finWidth, finLength);
            // Left fin
            this.ctx.fillRect(tailPos - finLength, -finWidth / 2, finLength, finWidth);
            // Right fin
            this.ctx.fillRect(tailPos, -finWidth / 2, finLength, finWidth);

            // Central stripe for detail
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(-missileLength / 2 + 5, -1, missileLength - 15, 2);

            // Exhaust trail/smoke (behind the missile)
            this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(tailPos - 5, 0);
            this.ctx.lineTo(tailPos - 15, 0);
            this.ctx.stroke();

            // Additional exhaust wisps
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(tailPos - 3, -2);
            this.ctx.lineTo(tailPos - 12, -3);
            this.ctx.moveTo(tailPos - 3, 2);
            this.ctx.lineTo(tailPos - 12, 3);
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

    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.save();

            if (bullet.friendly) {
                // Viên đạn của ta - tracer bullet
                this.ctx.fillStyle = '#FFD700';
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2,
                    bullet.width, bullet.height + 10);

                // Trail effect
                this.ctx.fillStyle = '#FF8C00';
                this.ctx.fillRect(bullet.x - bullet.width / 2 - 2, bullet.y - bullet.height / 2 + 1,
                    bullet.width - 2, bullet.height - 2);
                this.ctx.translate(bullet.x, bullet.y);
            } else {
                // Viên đạn địch
                this.ctx.fillStyle = '#FF0000';
                this.ctx.shadowColor = '#FF0000';
                this.ctx.shadowBlur = 5;
                this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2,
                    bullet.width, bullet.height);
                this.ctx.translate(bullet.x, bullet.y);
            }

            this.ctx.restore();
        });
    }

    drawBombs() {
        this.bombs.forEach(bomb => {
            this.ctx.save();

            // Calculate rotation angle based on bomb velocity (missile points in direction of travel)
            let angle = Math.atan2(bomb.vy, bomb.vx);

            // Translate to bomb center and rotate to point in direction of travel
            this.ctx.translate(bomb.x, bomb.y);
            this.ctx.rotate(angle);

            // Missile body - elongated and streamlined
            const missileLength = bomb.height * 1.5;
            const missileWidth = bomb.width * 0.7;

            // Main body gradient
            const bodyGradient = this.ctx.createLinearGradient(0, -missileWidth / 2, 0, missileWidth / 2);
            bodyGradient.addColorStop(0, '#2F2F2F');
            bodyGradient.addColorStop(0.3, '#8B0000');
            bodyGradient.addColorStop(0.7, '#654321');
            bodyGradient.addColorStop(1, '#2F2F2F');
            this.ctx.fillStyle = bodyGradient;

            // Draw missile body (pointing right in local coordinates)
            this.ctx.fillRect(-missileLength / 2, -missileWidth / 2, missileLength, missileWidth);

            // Nose cone (pointed tip)
            this.ctx.fillStyle = '#4A4A4A';
            this.ctx.beginPath();
            this.ctx.moveTo(missileLength / 2, 0);
            this.ctx.lineTo(missileLength / 2 - 8, -missileWidth / 2);
            this.ctx.lineTo(missileLength / 2 - 8, missileWidth / 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Tail fins - 4 fins in cross pattern
            this.ctx.fillStyle = '#696969';
            const finLength = 6;
            const finWidth = 2;
            const tailPos = -missileLength / 2;

            // Top fin
            this.ctx.fillRect(tailPos, -missileWidth / 2 - finLength, finWidth, finLength);
            // Bottom fin  
            this.ctx.fillRect(tailPos, missileWidth / 2, finWidth, finLength);
            // Left fin
            this.ctx.fillRect(tailPos - finLength, -finWidth / 2, finLength, finWidth);
            // Right fin
            this.ctx.fillRect(tailPos, -finWidth / 2, finLength, finWidth);

            // Central stripe for detail
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(-missileLength / 2 + 5, -1, missileLength - 15, 2);

            // Exhaust trail/smoke (behind the missile)
            this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(tailPos - 5, 0);
            this.ctx.lineTo(tailPos - 15, 0);
            this.ctx.stroke();

            // Additional exhaust wisps
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(tailPos - 3, -2);
            this.ctx.lineTo(tailPos - 12, -3);
            this.ctx.moveTo(tailPos - 3, 2);
            this.ctx.lineTo(tailPos - 12, 3);
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
            this.ctx.shadowBlur = 30;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 45, 0, Math.PI * 2);
            this.ctx.fill();

            // Lớp giữa - màu vàng
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 22;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 33, 0, Math.PI * 2);
            this.ctx.fill();

            // Lớp trong - màu trắng
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.shadowColor = '#FFFFFF';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 22, 0, Math.PI * 2);
            this.ctx.fill();

            // Tia nổ
            this.ctx.strokeStyle = '#FF8C00';
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 8;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                this.ctx.beginPath();
                this.ctx.moveTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
                this.ctx.lineTo(Math.cos(angle) * 52, Math.sin(angle) * 52);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    }

    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();

            // Pulsing effect
            const pulse = 0.8 + 0.2 * Math.sin(powerUp.pulseTimer * 0.005);
            this.ctx.translate(powerUp.x, powerUp.y);
            this.ctx.scale(pulse, pulse);

            // Glowing border
            this.ctx.shadowColor = powerUp.color;
            this.ctx.shadowBlur = 15;

            // Power-up background
            this.ctx.fillStyle = powerUp.color;
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);

            // Inner glow
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillRect(-powerUp.width / 2 + 2, -powerUp.height / 2 + 2, powerUp.width - 4, powerUp.height - 4);

            // Icon/symbol
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(powerUp.icon || '?', 0, 0);

            // Floating sparkles
            for (let i = 0; i < 3; i++) {
                const sparkleAngle = (powerUp.pulseTimer * 0.002 + i * Math.PI * 2 / 3);
                const sparkleX = Math.cos(sparkleAngle) * 20;
                const sparkleY = Math.sin(sparkleAngle) * 20;

                this.ctx.fillStyle = powerUp.color;
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
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
            this.ctx.font = '15px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${Math.round(healthPercent * 100)}%`, x + width / 2, y - 3);
            this.ctx.textAlign = 'left'; // Reset về mặc định
        }

        this.ctx.restore();
    }

    drawUI() {
        // Draw kill counter
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.fillText(`${this.currentKills}/${this.targetKills}`, 15, 45);

        // Draw level timer
        const totalSeconds = Math.max(0, Math.floor(this.levelTimer / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, this.width - 120, 45);

        // Draw unified defense health bar
        const healthRatio = this.defenseHealth / this.maxDefenseHealth;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(15, 80, 300, 30);

        // Health bar background
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(18, 83, 294, 24);

        // Health bar fill
        const healthColor = healthRatio > 0.7 ? '#00FF00' :
            healthRatio > 0.3 ? '#FFFF00' : '#FF0000';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(18, 83, 294 * healthRatio, 24);

        // Health bar border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(18, 83, 294, 24);

        // Defense strength label
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Sức Mạnh Mặt Trận', 18, 77);

        // Health value text
        this.ctx.fillText(`${Math.ceil(this.defenseHealth)}/${this.maxDefenseHealth}`, 330, 100);

        // Draw active power-ups
        this.drawActivePowerUps();

        // Draw messages
        this.drawMessages();
    }

    drawActivePowerUps() {
        let yOffset = 130;
        const currentTime = Date.now();

        Object.keys(this.activePowerUps).forEach(type => {
            if (this.activePowerUps[type] && this.powerUpTimers[type]) {
                const timeLeft = Math.max(0, this.powerUpTimers[type] - currentTime);
                const seconds = Math.ceil(timeLeft / 1000);

                const powerUpData = gameConfig.powerUps.find(p => p.type === type);
                if (powerUpData) {
                    // Power-up background
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(this.width - 200, yOffset, 180, 25);

                    // Power-up icon and name
                    this.ctx.fillStyle = powerUpData.color;
                    this.ctx.font = '16px Arial';
                    this.ctx.fillText(`${powerUpData.icon} ${powerUpData.name}: ${seconds}s`, this.width - 195, yOffset + 17);

                    yOffset += 30;
                }
            }
        });
    }

    drawMessages() {
        if (!this.messages) return;

        this.messages.forEach(message => {
            const age = Date.now() - message.created;
            const alpha = Math.max(0, 1 - age / message.life);

            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = message.color;

            // Enhanced styling for power-up notifications
            if (message.isPowerUp) {
                this.ctx.font = 'bold 28px Arial';
                // Glowing effect for power-up messages
                this.ctx.shadowColor = message.color;
                this.ctx.shadowBlur = 10;
            } else {
                this.ctx.font = 'bold 24px Arial';
                // Normal shadow for regular messages
                this.ctx.shadowColor = '#000000';
                this.ctx.shadowBlur = 3;
            }

            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            this.ctx.fillText(message.text, message.x, message.y + age * 0.05); // Slight upward drift
            this.ctx.restore();
        });
    }
}
