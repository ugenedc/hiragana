class FeatureBlossom {
    constructor(image, startX, startY, direction, angle) {
        this.image = image;
        this.x = startX;
        this.y = startY;
        this.direction = direction;
        
        // Use angle for more natural radial movement
        const baseSpeed = 1 + (Math.random() * 0.5);
        const spreadAngle = angle + (Math.random() * 0.5 - 0.25);
        this.speedX = Math.cos(spreadAngle) * baseSpeed * direction;
        this.speedY = Math.sin(spreadAngle) * baseSpeed;
        
        // Add slight wobble
        this.wobbleSpeed = 0.05 + Math.random() * 0.03;
        this.wobblePos = Math.random() * Math.PI * 2;
        this.wobbleAmount = 0.7 + Math.random() * 0.5;
        
        // Very gentle gravity
        this.gravity = 0.001;
        
        // Rotation
        this.rotation = Math.random() * 360;
        this.rotationSpeed = 0.5 * (Math.random() > 0.5 ? 1 : -1);
        
        // Much larger size and scale
        this.size = 30 + Math.random() * 20; // Increased from 20+15 to 30+20
        this.scale = 0.6 + Math.random() * 0.4; // Increased from 0.4+0.3 to 0.6+0.4
        
        // Higher opacity
        this.opacity = 0;
        this.fadeInSpeed = 0.1; // Faster fade in
        this.fadeOutSpeed = 0.02; // Slower fade out
        this.lifetime = 0;
        this.maxLifetime = 150 + Math.random() * 50; // Longer lifetime
    }

    update() {
        // Smooth fade in
        if (this.lifetime < 25) {
            this.opacity = Math.min(1.0, this.opacity + this.fadeInSpeed); // Increased max opacity from 0.8 to 1.0
        }
        
        // Start fading out near end of life
        if (this.lifetime > this.maxLifetime - 50) {
            this.opacity = Math.max(0, this.opacity - this.fadeOutSpeed);
        }

        // Add wobble to movement
        this.wobblePos += this.wobbleSpeed;
        const wobbleX = Math.sin(this.wobblePos) * this.wobbleAmount;
        
        // Update position with wobble
        this.x += this.speedX + wobbleX;
        this.speedY += this.gravity;
        this.y += this.speedY;
        
        // Gentle rotation
        this.rotation += this.rotationSpeed;
        this.lifetime++;

        return this.opacity > 0;
    }

    draw(ctx) {
        if (!this.image?.complete || this.image?.naturalWidth === 0) {
            console.warn('Image not ready:', this.image);
            return;
        }
        
        // Debug position and size
        console.log('Drawing petal at:', this.x, this.y, 'size:', this.size * this.scale, 'opacity:', this.opacity);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        
        const scaledSize = this.size * this.scale;
        ctx.drawImage(this.image, -scaledSize/2, -scaledSize/2, scaledSize, scaledSize);
        ctx.restore();
    }
}

class FeatureBlossomBurst {
    constructor() {
        this.features = [];
        this.images = [];
        this.blossoms = [];
        this.setupCanvas();
        this.loadImages();
        
        // Debug flag
        this.debug = false;
    }

    setupCanvas() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';  // Changed to absolute
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';  // Behind content
        
        // Add canvas to features section
        const featuresSection = document.querySelector('.features');
        if (featuresSection) {
            featuresSection.style.position = 'relative';
            featuresSection.insertBefore(this.canvas, featuresSection.firstChild);
        }
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const featuresSection = document.querySelector('.features');
        if (!featuresSection) return;
        
        const rect = featuresSection.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        this.ctx.scale(dpr, dpr);
    }

    loadImages() {
        const petalCount = 30;
        const imagePromises = Array.from({ length: petalCount }, (_, i) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`Successfully loaded petal ${i + 1}`);
                    this.images.push(img);
                    resolve();
                };
                img.onerror = (e) => {
                    console.error(`Failed to load petal ${i + 1}:`, e);
                    resolve();
                };
                // Use correct relative path to petals
                img.src = `images/petals/petal${i + 1}.svg`;
            });
        });
        
        Promise.all(imagePromises).then(() => {
            console.log('Loaded petals:', this.images.length);
            if (this.images.length === 0) {
                console.error('No petals were loaded successfully. Check image paths.');
            }
            this.setupFeatures();
            this.startObserving();
            this.animate();
        });
    }

    setupFeatures() {
        const features = document.querySelectorAll('.feature-item');
        console.log('Found features:', features.length);
        
        features.forEach((element, index) => {
            const imageElement = element.querySelector('.phone-screenshot');
            if (!imageElement) {
                console.warn(`Feature ${index} has no phone-screenshot element`);
                return;
            }
            
            this.features.push({
                element,
                imageElement,
                isReverse: element.classList.contains('reverse'),
                lastTriggerTime: 0,
                isEmitting: false,
                burstCount: 0,
                maxBursts: 5
            });
        });
        
        console.log('Setup features:', this.features.length);
        // Disable debug mode now that we're loading petals correctly
        this.debug = false;
    }

    startObserving() {
        const options = {
            threshold: [0.1, 0.2, 0.3, 0.4, 0.5] // Lower thresholds for earlier triggering
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const feature = this.features.find(f => f.element === entry.target);
                if (!feature) return;

                if (entry.isIntersecting && !feature.isEmitting && feature.burstCount < feature.maxBursts) {
                    console.log('Triggering burst for feature');
                    feature.isEmitting = true;
                    this.createBurst(feature);
                } else if (!entry.isIntersecting) {
                    feature.isEmitting = false;
                    // Reset burst count when element leaves view completely
                    if (entry.intersectionRatio === 0) {
                        feature.burstCount = 0;
                    }
                }
            });
        }, options);

        this.features.forEach(feature => {
            this.observer.observe(feature.element);
        });
    }

    createBurst(feature) {
        if (!feature.imageElement) return;
        
        const imageRect = feature.imageElement.getBoundingClientRect();
        const featuresRect = document.querySelector('.features').getBoundingClientRect();
        const isReverse = feature.isReverse;
        
        // Calculate center point of the phone image
        const centerX = (imageRect.left + imageRect.right) / 2 - featuresRect.left;
        const centerY = (imageRect.top + imageRect.bottom) / 2 - featuresRect.top;
        
        // Create more petals per burst
        const petalCount = 15 + Math.floor(Math.random() * 8); // More petals
        
        // Create all blossoms in a radial pattern
        for (let i = 0; i < petalCount; i++) {
            if (!feature.isEmitting) return;
            
            // Calculate angle for radial distribution
            const angle = (i / petalCount) * Math.PI * 2 + Math.random() * 0.5;
            const distance = 30 + Math.random() * 20; // Initial distance from center
            
            // Calculate start position
            const startX = centerX + Math.cos(angle) * distance * (isReverse ? -1 : 1);
            const startY = centerY + Math.sin(angle) * distance;
            
            if (this.images.length > 0) {
                const randomImage = this.images[Math.floor(Math.random() * this.images.length)];
                setTimeout(() => {
                    if (!feature.isEmitting) return;
                    
                    const blossom = new FeatureBlossom(
                        randomImage,
                        startX,
                        startY,
                        isReverse ? -1 : 1,
                        angle // Pass angle for consistent movement
                    );
                    this.blossoms.push(blossom);
                }, i * 20); // Faster stagger
            }
        }
        
        feature.burstCount++;
        
        if (feature.isEmitting && feature.burstCount < feature.maxBursts) {
            setTimeout(() => {
                if (feature.isEmitting) {
                    this.createBurst(feature);
                }
            }, 800);
        } else {
            feature.isEmitting = false;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.blossoms = this.blossoms.filter(blossom => {
            const isAlive = blossom.update();
            if (isAlive) {
                blossom.draw(this.ctx);
            }
            return isAlive;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
window.addEventListener('load', () => {
    console.log('Initializing FeatureBlossomBurst');
    new FeatureBlossomBurst();
}); 