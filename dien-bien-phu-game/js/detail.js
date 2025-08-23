// Detail page JavaScript functions

// Go back to previous page
function goBack() {
    if (document.referrer && document.referrer.includes('index.html')) {
        window.history.back();
    } else {
        window.location.href = '../index.html';
    }
}

// Go to home page
function goHome() {
    window.location.href = '../index.html';
}

// Play a specific day (redirect to game)
function playDay(dayId) {
    window.location.href = `../game.html?level=${dayId}`;
}

// View a specific day detail
function viewDay(dayId) {
    window.location.href = `day${dayId}.html`;
}

// View all days (go back to timeline)
function viewAllDays() {
    window.location.href = '../index.html#timeline';
}

// Add smooth scrolling and fade-in animations
document.addEventListener('DOMContentLoaded', function () {
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
