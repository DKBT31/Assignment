// Quick Fix - Simplified Image Loading
// Add this script to temporarily disable image loading and get game working

// Override the GameEngine constructor to skip image loading
const originalGameEngine = window.GameEngine;

if (originalGameEngine) {
    window.GameEngine = class extends originalGameEngine {
        constructor(canvasId) {
            super(canvasId);
        }

        async loadImages() {
            // Skip image loading for now - just set empty images object
            this.images = {
                background: null,
                aircraft: null,
                gunBarrel: null,
                gunBody: null
            };
            this.imagesLoaded = true;
            console.log('Image loading skipped - using fallback graphics');
        }
    };
}
