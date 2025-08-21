// Các hàm quản lý âm thanh game

// Phát một âm thanh
function playSound(soundId) {
    if (window.gameAudio && window.gameAudio[soundId]) {
        const sound = window.gameAudio[soundId];
        
        // Dừng âm thanh nếu đang phát
        if (!sound.paused) {
            sound.pause();
        }
        
        // Reset về đầu và phát lại
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Cannot play audio:', e));
    }
}

// Phát âm thanh một lần và đảm bảo dừng
function playSoundOnce(elementId) {
    const sound = document.getElementById(elementId);
    if (sound) {
        // Dừng âm thanh nếu đang phát
        if (!sound.paused) {
            sound.pause();
        }
        sound.currentTime = 0;
        
        // Thêm sự kiện để dừng sau khi phát xong
        sound.onended = () => {
            sound.pause();
            sound.currentTime = 0;
        };
        
        sound.play().catch(e => console.log('Cannot play audio:', e));
    }
}

// Phát âm thanh bom rơi
function playBombfall() {
    playSound('bombfall');
}

// Phát âm thanh đạn trúng mục tiêu
function playBulletHit() {
    playSound('bullethit');
}

// Phát âm thanh địch bắn
function playEnemyFire() {
    playSound('enemyfire');
}

// Phát âm thanh súng cố định bắn
function playStaticShot() {
    playSound('staticshot');
}

// Phát âm thanh xe tăng bắn
function playTankFire() {
    playSound('tankfire');
}

// Dừng một âm thanh
function stopSound(soundId) {
    if (window.gameAudio && window.gameAudio[soundId]) {
        window.gameAudio[soundId].pause();
        window.gameAudio[soundId].currentTime = 0;
    }
}

// Dừng tất cả âm thanh
function stopAllSounds() {
    if (window.gameAudio) {
        Object.values(window.gameAudio).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }
}
