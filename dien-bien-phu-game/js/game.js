// Main game JavaScript
let game;
let currentLevel = 1;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Get level from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const levelParam = urlParams.get('level');

    if (levelParam) {
        currentLevel = parseInt(levelParam);
    }

    // Initialize game
    game = new GameEngine('gameCanvas');
    game.loadLevel(currentLevel);

    // Start game
    showLoadingScreen();
    setTimeout(() => {
        hideLoadingScreen();
        game.start();
    }, 2000);

    // Setup event listeners
    setupGameControls();
    setupAudio();
});

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.id = 'loadingScreen';

    const levelData = historicalData.find(d => d.id === currentLevel);

    loadingScreen.innerHTML = `
        <h2>Đang tải màn ${currentLevel}</h2>
        <p>"${levelData ? levelData.title : 'Loading...'}"</p>
        <div class="loading-bar">
            <div class="loading-fill" id="loadingFill"></div>
        </div>
        <p>Chuẩn bị chiến đấu...</p>
    `;

    document.body.appendChild(loadingScreen);

    // Animate loading bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        document.getElementById('loadingFill').style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 100);
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
}

// Setup game controls
function setupGameControls() {
    // Pause/Resume with spacebar
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            togglePause();
        }

        if (e.code === 'Escape') {
            if (!game.isPaused) {
                togglePause();
            }
        }
    });

    // Prevent context menu on canvas
    document.getElementById('gameCanvas').addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
}

// Setup audio
function setupAudio() {
    const gameMusic = document.getElementById('gameMusic');

    // Auto-play music when user interacts with the page
    document.addEventListener('click', function playMusic() {
        gameMusic.play().catch(e => console.log('Cannot play music:', e));
        document.removeEventListener('click', playMusic);
    }, { once: true });

    gameMusic.volume = 0.3;
}

// Toggle pause
function togglePause() {
    if (!game) return;

    if (game.isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// Pause game
function pauseGame() {
    if (!game) return;

    game.pause();
    showOverlay('Game Paused', 'Nhấn tiếp tục để chơi tiếp');
}

// Resume game
function resumeGame() {
    if (!game) return;

    game.resume();
    hideOverlay();
}

// Restart level
function restartLevel() {
    if (!game) return;

    // Use the same approach as playAgain() - reload the page with current level
    // This ensures a complete clean restart just like the working "chơi lại" after game completion
    window.location.href = `game.html?level=${currentLevel}`;
}

// Go to home page
function goHome() {
    window.location.href = 'index.html';
}

// Go to next level
function nextLevel() {
    console.log('nextLevel() called, current level:', currentLevel);

    if (!game) {
        console.error('Game object not found!');
        return;
    }

    if (currentLevel < 12) {
        currentLevel++;
        console.log('Moving to level:', currentLevel);

        // Update the URL to reflect the new level
        const newUrl = `game.html?level=${currentLevel}`;
        window.history.pushState({ level: currentLevel }, '', newUrl);

        // Load the new level
        game.loadLevel(currentLevel);
        game.reset(); // Reset game state
        game.start();
        hideOverlay();

        // Reset nút "Tiếp tục" về trạng thái bình thường
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.textContent = 'Tiếp tục';
            continueBtn.onclick = () => resumeGame();
        }

        // Update level display
        updateLevelDisplay();

    } else {
        // All levels completed
        console.log('All levels completed!');
        showCompletionMessage();
    }
}

// Show overlay
function showOverlay(title, message) {
    const overlay = document.getElementById('gameOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMessage = document.getElementById('overlayMessage');

    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    overlay.classList.remove('hidden');
}

// Hide overlay
function hideOverlay() {
    const overlay = document.getElementById('gameOverlay');
    overlay.classList.add('hidden');
}

// Toggle history panel
function toggleHistory() {
    const panel = document.getElementById('historyPanel');
    panel.classList.toggle('open');
}

// Update level display
function updateLevelDisplay() {
    const levelElement = document.getElementById('currentLevel');
    if (levelElement) {
        levelElement.textContent = currentLevel;
    }

    const titleElement = document.getElementById('levelTitle');
    if (titleElement && historicalData[currentLevel - 1]) {
        titleElement.textContent = historicalData[currentLevel - 1].title;
    }
}

// Navigation functions
function previousLevel() {
    if (currentLevel > 1) {
        currentLevel--;
        window.location.href = `game.html?level=${currentLevel}`;
    }
}

function showCompletionMessage() {
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');
    const buttons = document.querySelector('.overlay-buttons');

    title.textContent = '🏆 Chúc mừng!';
    message.innerHTML = `
        <h3>Bạn đã hoàn thành tất cả 12 ngày đêm lịch sử!</h3>
        <p>Chiến thắng "Điện Biên Phủ trên không" đã hoàn thành trong tay bạn.</p>
        <p>"Hà Nội - Điện Biên Phủ trên không" - 12 ngày đêm anh hùng!</p>
    `;

    buttons.innerHTML = `
        <button onclick="goHome()">Về trang chủ</button>
        <button onclick="playAgain()">Chơi lại từ đầu</button>
        <button onclick="shareAchievement()">Chia sẻ thành tích</button>
    `;

    overlay.classList.remove('hidden');

    // Play victory fanfare
    setTimeout(() => {
        const victorySound = document.getElementById('victorySound');
        if (victorySound) {
            victorySound.play().catch(e => { });
        }
    }, 500);
}

function playAgain() {
    // Reset game state
    gameState.currentLevel = 1;
    gameState.completedLevels = [];
    gameState.unlockedLevels = [1];
    saveGameState();

    window.location.href = 'game.html?level=1';
}

function shareAchievement() {
    const text = `Tôi vừa hoàn thành chiến dịch "Điện Biên Phủ trên không" - 12 ngày đêm lịch sử! 🏆 #DieBienPhu #LichSu #Vietnam1972`;

    if (navigator.share) {
        navigator.share({
            title: 'Chiến thắng Điện Biên Phủ',
            text: text,
            url: window.location.origin
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Đã sao chép thành tích vào clipboard!');
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `achievement`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Achievement system
function checkAchievements() {
    const achievements = [
        {
            id: 'first_kill',
            name: 'Chiến sĩ mới',
            description: 'Tiêu diệt máy bay đầu tiên',
            condition: () => game.currentKills >= 1
        },
        {
            id: 'ace_pilot',
            name: 'Xạ thủ bậc thầy',
            description: 'Tiêu diệt 5 máy bay liên tiếp',
            condition: () => game.currentKills >= 5
        },
        {
            id: 'level_complete',
            name: 'Hoàn thành ngày',
            description: 'Hoàn thành một ngày lịch sử',
            condition: () => game.currentKills >= game.targetKills
        }
    ];

    achievements.forEach(achievement => {
        if (!gameState.achievements.includes(achievement.id) && achievement.condition()) {
            gameState.achievements.push(achievement.id);
            showAchievement(achievement);
            saveGameState();
        }
    });
}

function showAchievement(achievement) {
    const achievementEl = document.createElement('div');
    achievementEl.className = 'achievement';
    achievementEl.innerHTML = `
        <strong>🏅 ${achievement.name}</strong><br>
        ${achievement.description}
    `;

    document.body.appendChild(achievementEl);

    setTimeout(() => {
        achievementEl.remove();
    }, 3000);
}

// Performance monitoring
function trackPerformance() {
    const fps = 1000 / (performance.now() - game.lastTime);

    if (fps < 30) {
        console.warn('Low FPS detected:', fps);
        // Could implement quality reduction here
    }
}

// Easter eggs and cheat codes
const cheatCodes = {
    'invincible': () => {
        game.player.health = 9999;
        game.player.shield = true;
        showNotification('Chế độ bất tử đã kích hoạt!');
    },
    'unlimited_ammo': () => {
        game.player.fireRate = 50;
        game.player.multiShot = true;
        showNotification('Đạn không giới hạn!');
    },
    'skip_level': () => {
        game.currentKills = game.targetKills;
        showNotification('Đã hoàn thành màn chơi!');
    }
};

// Cheat code input handler
let cheatInput = '';
document.addEventListener('keydown', function (e) {
    cheatInput += e.key.toLowerCase();

    // Keep only last 20 characters
    if (cheatInput.length > 20) {
        cheatInput = cheatInput.slice(-20);
    }

    // Check for cheat codes
    Object.keys(cheatCodes).forEach(code => {
        if (cheatInput.includes(code)) {
            cheatCodes[code]();
            cheatInput = '';
        }
    });
});

// Auto-save progress periodically
setInterval(() => {
    if (game && game.isRunning) {
        saveGameState();
    }
}, 30000); // Save every 30 seconds

// Handle page visibility change
document.addEventListener('visibilitychange', function () {
    if (document.hidden && game && game.isRunning && !game.isPaused) {
        pauseGame();
    }
});

// Handle window focus/blur
window.addEventListener('blur', function () {
    if (game && game.isRunning && !game.isPaused) {
        pauseGame();
    }
});

// Cleanup when leaving page
window.addEventListener('beforeunload', function () {
    if (game) {
        game.stop();
        saveGameState();
    }
});
