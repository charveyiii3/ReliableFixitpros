// GitHub Pages Image Fix - Automatic fallback system
// This script ensures images load correctly regardless of path issues

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Reliable Fix It Pros - Image Fix System Activated');
    
    // Define image fallback mapping
    const imageFallbacks = {
        'handyman-hero.png': [
            'handyman-hero.png',
            'Handyman.png',
            './images/handyman-hero.png',
            './images/Handyman.png',
            'placeholder-hero.svg',
            './images/placeholder-hero.svg'
        ],
        'logo.svg': [
            'logo.svg',
            './images/logo.svg',
            'images/logo.svg'
        ],
        'placeholder-team.svg': [
            'placeholder-team.svg',
            './images/placeholder-team.svg',
            'images/placeholder-team.svg'
        ]
    };
    
    // Function to try loading image with fallbacks
    function tryLoadImage(img, fallbackPaths, index = 0) {
        if (index >= fallbackPaths.length) {
            console.warn('❌ All fallback paths failed for image:', img.alt);
            return;
        }
        
        const testImg = new Image();
        testImg.onload = function() {
            console.log('✅ Image loaded successfully:', fallbackPaths[index]);
            img.src = fallbackPaths[index];
            img.style.opacity = '1';
        };
        
        testImg.onerror = function() {
            console.warn('⚠️ Failed to load:', fallbackPaths[index]);
            tryLoadImage(img, fallbackPaths, index + 1);
        };
        
        testImg.src = fallbackPaths[index];
    }
    
    // Fix all images on page load
    function fixImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading opacity effect
            img.style.transition = 'opacity 0.3s ease';
            
            // Check if image is already loaded
            if (img.complete && img.naturalWidth > 0) {
                console.log('✅ Image already loaded:', img.src);
                return;
            }
            
            // Set temporary opacity while loading
            img.style.opacity = '0.7';
            
            // Determine which fallback set to use
            let fallbackPaths = null;
            
            if (img.src.includes('handyman') || img.src.includes('Handyman')) {
                fallbackPaths = imageFallbacks['handyman-hero.png'];
            } else if (img.src.includes('logo')) {
                fallbackPaths = imageFallbacks['logo.svg'];
            } else if (img.src.includes('team')) {
                fallbackPaths = imageFallbacks['placeholder-team.svg'];
            }
            
            if (fallbackPaths) {
                // Add error handler to try fallbacks
                img.onerror = function() {
                    console.log('🔄 Trying fallbacks for:', this.alt);
                    tryLoadImage(this, fallbackPaths);
                };
                
                // If image fails to load within 3 seconds, try fallbacks
                setTimeout(() => {
                    if (!img.complete || img.naturalWidth === 0) {
                        console.log('⏰ Timeout - trying fallbacks for:', img.alt);
                        tryLoadImage(img, fallbackPaths);
                    }
                }, 3000);
            }
        });
    }
    
    // Run image fix
    fixImages();
    
    // Also run after a delay to catch any lazy-loaded images
    setTimeout(fixImages, 1000);
    
    // GitHub Pages specific fixes
    function addGitHubPagesFixes() {
        // Fix base URL if needed
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('github.io')) {
            console.log('🔧 GitHub Pages detected, applying specific fixes...');
            
            // Force refresh of failed images after page load
            setTimeout(() => {
                const failedImages = document.querySelectorAll('img[src*="handyman"]');
                failedImages.forEach(img => {
                    if (!img.complete || img.naturalWidth === 0) {
                        console.log('🔄 Retrying failed image:', img.alt);
                        const originalSrc = img.src;
                        img.src = '';
                        setTimeout(() => {
                            img.src = originalSrc;
                        }, 100);
                    }
                });
            }, 2000);
        }
    }
    
    addGitHubPagesFixes();
    
    // Add CSS for smooth image loading
    const style = document.createElement('style');
    style.textContent = `
        img {
            transition: opacity 0.3s ease;
        }
        
        img[src*="handyman"], img[src*="Handyman"] {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 12px;
        }
        
        .hero-image img, .ads-hero-image img {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border-radius: 12px;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Image fix system ready!');
});

// Export for testing
window.ReliableFixItProsImageFix = {
    version: '1.0.0',
    test: function() {
        console.log('🧪 Testing image loading...');
        const heroImg = document.querySelector('img[src*="handyman"]');
        if (heroImg) {
            console.log('Hero image found:', heroImg.src);
            console.log('Image loaded:', heroImg.complete && heroImg.naturalWidth > 0);
        } else {
            console.log('❌ Hero image not found');
        }
    }
};