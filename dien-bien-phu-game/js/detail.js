// Detail page JavaScript functions

// Go back to previous page
function goBack() {
    if (document.referrer && document.referrer.includes('index.html')) {
        window.history.back();
    } else {
        window.location.href = '../../index.html';
    }
}

// Go to home page
function goHome() {
    window.location.href = '../../index.html';
}

// Play a specific day (redirect to game) - with access control
function playDay(dayId) {
    // Check if this day is unlocked
    if (!gameState.unlockedLevels.includes(dayId)) {
        alert(`Ngày ${dayId} chưa được mở khóa! Hãy hoàn thành các ngày trước đó.`);
        return;
    }
    window.location.href = `../game.html?level=${dayId}`;
}

// View a specific day detail - with access control
function viewDay(dayId) {
    // Only allow access to days that are unlocked
    // For the next day: only if the current day is completed (not just unlocked)
    const isUnlocked = gameState.unlockedLevels.includes(dayId);

    if (!isUnlocked) {
        alert(`Chi tiết ngày ${dayId} chưa có sẵn! Hãy hoàn thành các ngày trước đó để mở khóa.`);
        return;
    }

    window.location.href = `day${dayId}.html`;
}

// View all days (go back to timeline)
function viewAllDays() {
    window.location.href = '../../index.html#timeline';
}

// Check and update navigation buttons based on game progress
function updateNavigationButtons() {
    // Get current day from URL
    const currentDay = parseInt(window.location.pathname.match(/day(\d+)\.html/)?.[1] || 1);

    // Find next day button
    const nextDayBtn = document.querySelector('.next-btn');
    const playBtn = document.querySelector('.play-btn');

    if (nextDayBtn) {
        const nextDay = currentDay + 1;
        if (nextDay <= 12) { // Max 12 days
            const isNextDayUnlocked = gameState.unlockedLevels.includes(nextDay);
            const isCurrentDayCompleted = gameState.completedLevels.includes(currentDay);

            // Only allow access to next day if current day is completed (not just unlocked)
            if (!isNextDayUnlocked || !isCurrentDayCompleted) {
                nextDayBtn.disabled = true;
                nextDayBtn.style.opacity = '0.5';
                nextDayBtn.style.cursor = 'not-allowed';

                if (!isCurrentDayCompleted) {
                    nextDayBtn.title = `Hãy hoàn thành ngày ${currentDay} trước`;
                    nextDayBtn.innerHTML = `➡️ Ngày ${nextDay} (Chưa hoàn thành ngày ${currentDay})`;
                } else {
                    nextDayBtn.title = `Ngày ${nextDay} chưa mở khóa`;
                    nextDayBtn.innerHTML = `➡️ Ngày ${nextDay} (Khóa)`;
                }
            } else {
                nextDayBtn.innerHTML = `➡️ Ngày tiếp theo`;
            }
        } else {
            nextDayBtn.style.display = 'none'; // Hide if no next day
        }
    }

    // Update play button
    if (playBtn) {
        if (!gameState.unlockedLevels.includes(currentDay)) {
            playBtn.disabled = true;
            playBtn.style.opacity = '0.5';
            playBtn.style.cursor = 'not-allowed';
            playBtn.title = `Ngày ${currentDay} chưa mở khóa`;
            playBtn.innerHTML = `🔒 Chưa mở khóa`;
        }
    }
}

// Add smooth scrolling and fade-in animations
document.addEventListener('DOMContentLoaded', function () {
    // Update navigation buttons based on game progress
    updateNavigationButtons();

    // Add fade-in animation to content sections
    const sections = document.querySelectorAll('.content-section');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'h': // Ctrl+H for home
                    e.preventDefault();
                    goHome();
                    break;
                case 'ArrowLeft': // Ctrl+Left for back
                    e.preventDefault();
                    goBack();
                    break;
            }
        }
    });
});
