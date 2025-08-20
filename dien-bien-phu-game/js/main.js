// Main JavaScript cho trang chủ
document.addEventListener('DOMContentLoaded', function () {
    initializeTimeline();
    updateProgress();
    setupAudio();
});

// Khởi tạo timeline 12 ngày
function initializeTimeline() {
    const timeline = document.getElementById('timeline');

    historicalData.forEach((day, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';

        const status = getTimelineStatus(day.id);

        timelineItem.innerHTML = `
            <div class="timeline-content" onclick="openDay(${day.id})">
                <div class="timeline-date">${day.date}</div>
                <div class="timeline-title">${day.title}</div>
                <div class="timeline-desc">${day.description.substring(0, 100)}...</div>
                <div class="timeline-status ${status.className}">${status.text}</div>
            </div>
        `;

        timeline.appendChild(timelineItem);
    });
}

// Xác định trạng thái của từng ngày
function getTimelineStatus(dayId) {
    if (gameState.completedLevels.includes(dayId)) {
        return { className: 'status-completed', text: '✓ Đã hoàn thành' };
    } else if (gameState.unlockedLevels.includes(dayId)) {
        return { className: 'status-available', text: '🎮 Có thể chơi' };
    } else {
        return { className: 'status-locked', text: '🔒 Chưa mở khóa' };
    }
}

// Cập nhật tiến độ
function updateProgress() {
    const progressElement = document.getElementById('progress');
    const progressFill = document.getElementById('progressFill');

    const completed = gameState.completedLevels.length;
    const percentage = (completed / 12) * 100;

    progressElement.textContent = `${completed}/12 ngày`;
    progressFill.style.width = `${percentage}%`;
}

// Mở trang chi tiết một ngày
function openDay(dayId) {
    const day = historicalData.find(d => d.id === dayId);

    if (!gameState.unlockedLevels.includes(dayId)) {
        showNotification('Bạn cần hoàn thành các ngày trước đó để mở khóa ngày này!', 'warning');
        return;
    }

    // Chuyển đến trang game với level tương ứng
    window.location.href = `game.html?level=${dayId}`;
}

// Bắt đầu hành trình
function startJourney() {
    const firstUnlocked = Math.min(...gameState.unlockedLevels);
    window.location.href = `game.html?level=${firstUnlocked}`;
}

// Setup âm thanh
function setupAudio() {
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Tự động phát nhạc nền (cần user interaction)
    document.addEventListener('click', function playMusic() {
        backgroundMusic.play().catch(e => console.log('Cannot play audio:', e));
        document.removeEventListener('click', playMusic);
    }, { once: true });

    // Volume control
    backgroundMusic.volume = 0.3;
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#ff9800' : '#4caf50'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: 10px;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification button:hover {
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
        startJourney();
    }
});

// Smooth scroll cho timeline
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function (e) {
    konamiCode.push(e.code);

    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }

    if (konamiCode.length === konamiSequence.length &&
        konamiCode.every((code, index) => code === konamiSequence[index])) {

        // Unlock all levels
        gameState.unlockedLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        saveGameState();

        showNotification('🎉 Chế độ nhà phát triển đã kích hoạt! Tất cả các màn đã được mở khóa.', 'info');

        // Refresh timeline
        document.getElementById('timeline').innerHTML = '';
        initializeTimeline();
        updateProgress();

        konamiCode = [];
    }
});

// Analytics và tracking (giả lập)
function trackUserAction(action, details) {
    console.log(`Action: ${action}`, details);
    // Có thể tích hợp với Google Analytics hoặc các service tracking khác
}

// Track page load
trackUserAction('page_load', { page: 'home' });

// Particle background effect
class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];

        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.3';

        document.body.appendChild(this.canvas);

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Khởi tạo particle background
// new ParticleBackground(); // Comment out nếu muốn tắt hiệu ứng
