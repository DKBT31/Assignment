// Global Music Controller - Nhạc nền toàn cục cho website
class GlobalMusicController {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.volume = 0.3;
        this.hasUserInteracted = false;
        this.isInitialized = false;
        
        // Xác định đường dẫn nhạc dựa trên vị trí trang hiện tại
        this.musicUrl = this.determineMusicPath();
        
        // Storage keys
        this.STORAGE_KEYS = {
            isPlaying: 'globalMusic_isPlaying',
            currentTime: 'globalMusic_currentTime',
            volume: 'globalMusic_volume',
            hasUserInteracted: 'globalMusic_hasUserInteracted',
            hasEverStarted: 'globalMusic_hasEverStarted'
        };
        
        this.init();
    }
    
    determineMusicPath() {
        const currentPath = window.location.pathname;
        const fileName = window.location.href.split('/').pop();
        
        // Kiểm tra các trường hợp cụ thể
        if (currentPath.includes('/details/') || fileName.startsWith('day')) {
            return '../assets/audio/dien-bien-phu-theme.mp3';
        } else if (fileName === 'boi-canh-lich-su.html' || currentPath.includes('boi-canh-lich-su')) {
            return 'dien-bien-phu-game/assets/audio/dien-bien-phu-theme.mp3';
        } else if (fileName === 'game.html' || currentPath.includes('/dien-bien-phu-game/')) {
            return 'assets/audio/dien-bien-phu-theme.mp3';
        } else {
            // Trang chủ và các trang khác
            return 'dien-bien-phu-game/assets/audio/dien-bien-phu-theme.mp3';
        }
    }
    
    init() {
        // Khôi phục trạng thái từ localStorage
        this.loadState();
        
        // Tạo audio element
        this.createAudioElement();
        
        // Cập nhật UI ngay lập tức
        this.updateUI();
        
        // Thêm event listener cho user interaction để enable autoplay
        this.setupUserInteractionDetection();
        
        // Lưu trạng thái định kỳ
        this.startPeriodicSave();
        
        // Xử lý khi trang sắp đóng
        this.handlePageUnload();
        
        // Thử khôi phục nhạc sau khi load xong
        this.attemptRestore();
    }
    
    setupUserInteractionDetection() {
        // Nếu đã có user interaction từ session trước, bỏ qua
        if (this.hasUserInteracted) {
            return;
        }
        
        const events = ['click', 'keydown', 'touchstart', 'mousemove'];
        const enableAudio = () => {
            this.hasUserInteracted = true;
            localStorage.setItem(this.STORAGE_KEYS.hasUserInteracted, 'true');
            
            console.log('User interaction detected, enabling audio...');
            
            // Thử phát nhạc ngay lập tức nếu đang trong trạng thái phát
            if (this.isPlaying && this.audio) {
                this.resumeFromStoredTime();
            }
            
            // Remove listeners sau khi đã có interaction
            events.forEach(event => {
                document.removeEventListener(event, enableAudio);
            });
        };
        
        events.forEach(event => {
            document.addEventListener(event, enableAudio, { once: true, passive: true });
        });
    }
    
    resumeFromStoredTime() {
        if (!this.audio) return;
        
        // Đặt thời gian phát từ vị trí đã lưu
        if (this.currentTime > 0 && this.audio.duration > this.currentTime) {
            this.audio.currentTime = this.currentTime;
        }
        
        // Phát nhạc
        this.audio.play().then(() => {
            console.log(`Music resumed from ${this.currentTime}s`);
        }).catch(e => {
            console.log('Resume failed:', e);
        });
    }
    
    createAudioElement() {
        // Tìm audio element có sẵn hoặc tạo mới
        this.audio = document.getElementById('backgroundMusic');
        
        if (!this.audio) {
            this.audio = document.createElement('audio');
            this.audio.id = 'backgroundMusic';
            this.audio.loop = true;
            this.audio.preload = 'auto';
            this.audio.volume = this.volume;
            
            // Thêm source
            const source = document.createElement('source');
            source.src = this.musicUrl;
            source.type = 'audio/mpeg';
            this.audio.appendChild(source);
            
            document.body.appendChild(this.audio);
        } else {
            // Cập nhật volume cho audio element có sẵn
            this.audio.volume = this.volume;
            this.audio.loop = true;
        }
        
        // Event listeners
        this.audio.addEventListener('loadedmetadata', () => {
            console.log(`Audio loaded, duration: ${this.audio.duration}s`);
            this.onAudioReady();
        });
        
        this.audio.addEventListener('canplaythrough', () => {
            this.onAudioReady();
        });
        
        this.audio.addEventListener('timeupdate', () => {
            if (this.isPlaying) {
                this.currentTime = this.audio.currentTime;
                // Lưu định kỳ để tránh mất sync
                if (Math.floor(this.currentTime) % 5 === 0) {
                    this.saveState();
                }
            }
        });
        
        this.audio.addEventListener('ended', () => {
            // Nếu nhạc kết thúc, restart từ đầu
            this.currentTime = 0;
            if (this.isPlaying) {
                this.audio.currentTime = 0;
                this.audio.play();
            }
        });
        
        this.audio.addEventListener('pause', () => {
            console.log('Audio paused');
        });
        
        this.audio.addEventListener('play', () => {
            console.log('Audio playing');
            this.isInitialized = true;
        });
    }
    
    onAudioReady() {
        if (this.isInitialized) return;
        
        console.log('Audio ready, current state:', {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            hasUserInteracted: this.hasUserInteracted
        });
        
        // Đặt thời gian phát nếu có
        if (this.currentTime > 0 && this.audio.duration >= this.currentTime) {
            this.audio.currentTime = this.currentTime;
            console.log(`Set audio time to ${this.currentTime}s`);
        }
        
        // Nếu nhạc đang bật và đã có user interaction, phát ngay
        if (this.isPlaying && this.hasUserInteracted) {
            this.audio.play().then(() => {
                console.log('Auto-resumed music successfully');
            }).catch(e => {
                console.log('Auto-resume failed, waiting for interaction:', e);
            });
        }
        
        this.isInitialized = true;
    }
    
    attemptRestore() {
        // Thử khôi phục nhạc sau một khoảng thời gian ngắn
        setTimeout(() => {
            if (this.isPlaying && this.hasUserInteracted) {
                this.play();
            }
        }, 500);
    }
    
    loadState() {
        // Khôi phục trạng thái từ localStorage
        this.isPlaying = localStorage.getItem(this.STORAGE_KEYS.isPlaying) === 'true';
        this.currentTime = parseFloat(localStorage.getItem(this.STORAGE_KEYS.currentTime)) || 0;
        this.volume = parseFloat(localStorage.getItem(this.STORAGE_KEYS.volume)) || 0.3;
        this.hasUserInteracted = localStorage.getItem(this.STORAGE_KEYS.hasUserInteracted) === 'true';
        
        // Nếu chưa từng bắt đầu nhạc, tự động bật
        const hasEverStarted = localStorage.getItem(this.STORAGE_KEYS.hasEverStarted);
        if (!hasEverStarted) {
            this.isPlaying = true;
            localStorage.setItem(this.STORAGE_KEYS.hasEverStarted, 'true');
        }
    }
    
    saveState() {
        // Lưu trạng thái vào localStorage
        localStorage.setItem(this.STORAGE_KEYS.isPlaying, this.isPlaying.toString());
        localStorage.setItem(this.STORAGE_KEYS.currentTime, this.currentTime.toString());
        localStorage.setItem(this.STORAGE_KEYS.volume, this.volume.toString());
        localStorage.setItem(this.STORAGE_KEYS.hasUserInteracted, this.hasUserInteracted.toString());
    }
    
    async play() {
        try {
            if (!this.audio) {
                console.log('No audio element');
                return;
            }
            
            // Đảm bảo audio đã load
            if (this.audio.readyState < 2) {
                console.log('Audio not ready, waiting...');
                setTimeout(() => this.play(), 200);
                return;
            }
            
            // Set current time trước khi play nếu có
            if (this.currentTime > 0 && this.audio.duration >= this.currentTime) {
                this.audio.currentTime = this.currentTime;
                console.log(`Playing from ${this.currentTime}s`);
            }
            
            await this.audio.play();
            this.isPlaying = true;
            this.hasUserInteracted = true;
            this.updateUI();
            this.saveState();
            console.log('Music started playing successfully');
            
        } catch (error) {
            console.log('Play failed:', error.message);
            
            // Vẫn cập nhật UI để hiện trạng thái "đang phát"
            this.isPlaying = true;
            this.updateUI();
            this.saveState();
            
            // Nếu chưa có user interaction, chờ interaction
            if (!this.hasUserInteracted) {
                console.log('Waiting for user interaction to enable audio...');
            }
        }
    }
    
    pause() {
        if (this.audio && !this.audio.paused) {
            // Lưu vị trí hiện tại trước khi pause
            this.currentTime = this.audio.currentTime;
            this.audio.pause();
            console.log(`Music paused at ${this.currentTime}s`);
        }
        this.isPlaying = false;
        this.updateUI();
        this.saveState();
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    setVolume(vol) {
        this.volume = vol;
        if (this.audio) {
            this.audio.volume = vol;
        }
        this.saveState();
    }
    
    updateUI() {
        // Cập nhật tất cả nút nhạc trên trang
        const musicButtons = document.querySelectorAll('.music-btn, #musicToggle');
        musicButtons.forEach(button => {
            if (this.isPlaying) {
                button.textContent = '🔊';
                button.classList.remove('muted');
            } else {
                button.textContent = '🔇';
                button.classList.add('muted');
            }
        });
    }
    
    startPeriodicSave() {
        // Lưu trạng thái mỗi 3 giây
        setInterval(() => {
            if (this.isPlaying && this.audio && !this.audio.paused) {
                this.currentTime = this.audio.currentTime;
                this.saveState();
            }
        }, 3000);
    }
    
    handlePageUnload() {
        // Lưu trạng thái khi trang sắp đóng
        window.addEventListener('beforeunload', () => {
            if (this.audio && this.isPlaying) {
                this.currentTime = this.audio.currentTime;
                this.saveState();
            }
        });
        
        // Lưu trạng thái khi page ẩn (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.audio && this.isPlaying) {
                this.currentTime = this.audio.currentTime;
                this.saveState();
            }
        });
    }
}

// Tạo instance toàn cục
let globalMusic;

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Đợi một chút để đảm bảo tất cả resources đã load
    setTimeout(() => {
        globalMusic = new GlobalMusicController();
        window.globalMusic = globalMusic;
        
        // Bind toggle function cho tất cả nút nhạc
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('music-btn') || e.target.id === 'musicToggle') {
                e.preventDefault();
                globalMusic.toggle();
            }
        });
        
        // Hiện thông báo hướng dẫn nếu cần
        if (globalMusic.isPlaying && !globalMusic.hasUserInteracted) {
            showMusicNotification();
        }
        
    }, 200);
});

function showMusicNotification() {
    // Tạo thông báo hướng dẫn
    const notification = document.createElement('div');
    notification.id = 'musicNotification';
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: linear-gradient(135deg, rgba(26, 71, 42, 0.95), rgba(45, 90, 61, 0.95));
        color: white;
        padding: 12px 18px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1001;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 215, 0, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 250px;
        animation: slideInFade 0.5s ease-out;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🎵</span>
            <span>Nhạc sẽ phát khi bạn tương tác với trang</span>
        </div>
    `;
    
    // Thêm CSS animation
    if (!document.getElementById('musicNotificationStyle')) {
        const style = document.createElement('style');
        style.id = 'musicNotificationStyle';
        style.textContent = `
            @keyframes slideInFade {
                0% { 
                    opacity: 0; 
                    transform: translateX(100px) translateY(-10px); 
                }
                100% { 
                    opacity: 1; 
                    transform: translateX(0) translateY(0); 
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInFade 0.5s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }
    }, 5000);
}

// Export để có thể sử dụng từ scripts khác
window.globalMusic = globalMusic;

// Các function helper để tương thích với code cũ
function toggleMusic() {
    if (window.globalMusic) {
        window.globalMusic.toggle();
    }
}

// Force enable audio với user interaction
function forceEnableAudio() {
    if (window.globalMusic && !window.globalMusic.hasUserInteracted) {
        window.globalMusic.hasUserInteracted = true;
        localStorage.setItem('globalMusic_hasUserInteracted', 'true');
        
        if (window.globalMusic.isPlaying) {
            window.globalMusic.resumeFromStoredTime();
        }
        
        // Ẩn notification nếu có
        const notification = document.getElementById('musicNotification');
        if (notification) {
            notification.remove();
        }
    }
}

// Auto-enable sau bất kỳ click nào
document.addEventListener('click', forceEnableAudio, { once: true });
document.addEventListener('keydown', forceEnableAudio, { once: true });
