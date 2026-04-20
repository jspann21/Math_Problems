class AnimationSystem {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.celebrationEffects = [
            this.launchStars.bind(this),
            this.launchConfetti.bind(this),
            this.launchHearts.bind(this),
            this.launchSparkles.bind(this),
            this.launchBalloons.bind(this),
            this.launchFireworks.bind(this),
        ];
        this.confettiColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    }

    getStarsContainer() {
        return document.getElementById('stars-container');
    }

    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    pickRandom(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    viewportWidth() {
        return Math.max(window.innerWidth || 0, 320);
    }

    viewportHeight() {
        return Math.max(window.innerHeight || 0, 320);
    }

    createParticle(className, text = '') {
        const particle = document.createElement('div');
        particle.className = className;
        if (text) {
            particle.textContent = text;
        }
        return particle;
    }

    createStar() {
        const star = this.createParticle('star', '⭐');
        star.style.left = `${Math.random() * this.viewportWidth()}px`;
        star.style.fontSize = `${this.randomBetween(20, 40)}px`;
        star.style.animationDuration = `${this.randomBetween(0.7, 1.8)}s`;
        return star;
    }

    createConfetti() {
        const confetti = this.createParticle('confetti');
        confetti.style.left = `${Math.random() * this.viewportWidth()}px`;
        confetti.style.top = '-20px';
        confetti.style.backgroundColor = this.pickRandom(this.confettiColors);
        confetti.style.width = `${this.randomBetween(8, 14)}px`;
        confetti.style.height = `${this.randomBetween(14, 24)}px`;
        confetti.style.animationDuration = `${this.randomBetween(2.2, 3.5)}s`;
        return confetti;
    }

    createHeart() {
        const heart = this.createParticle('heart', this.pickRandom(['💙', '💚', '💛', '💖']));
        heart.style.left = `${Math.random() * this.viewportWidth()}px`;
        heart.style.top = `${this.randomBetween(this.viewportHeight() * 0.65, this.viewportHeight() * 0.9)}px`;
        heart.style.animationDuration = `${this.randomBetween(1.8, 2.4)}s`;
        return heart;
    }

    createSparkle() {
        const sparkle = this.createParticle('sparkle', this.pickRandom(['✨', '✦', '✧']));
        sparkle.style.left = `${Math.random() * this.viewportWidth()}px`;
        sparkle.style.top = `${this.randomBetween(this.viewportHeight() * 0.2, this.viewportHeight() * 0.75)}px`;
        sparkle.style.animationDuration = `${this.randomBetween(1.0, 1.8)}s`;
        return sparkle;
    }

    createBalloon() {
        const balloon = this.createParticle('balloon', this.pickRandom(['🎈', '🎈', '🎈', '🎉']));
        balloon.style.left = `${Math.random() * this.viewportWidth()}px`;
        balloon.style.top = `${this.viewportHeight() + this.randomBetween(10, 120)}px`;
        balloon.style.animationDuration = `${this.randomBetween(3.5, 4.8)}s`;
        return balloon;
    }

    createFireworkSpark(originX, originY, angle, distance) {
        const spark = this.createParticle('firework-spark');
        spark.style.left = `${originX}px`;
        spark.style.top = `${originY}px`;
        spark.style.backgroundColor = this.pickRandom(this.confettiColors);
        spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        spark.style.animationDuration = `${this.randomBetween(0.75, 1.1)}s`;
        return spark;
    }

    appendAndCleanup(container, particle, removeAfterMs) {
        container.appendChild(particle);
        setTimeout(() => particle.remove(), removeAfterMs);
    }

    launchStars(container) {
        for (let index = 0; index < 10; index += 1) {
            this.appendAndCleanup(container, this.createStar(), 2200);
        }
    }

    launchConfetti(container) {
        for (let index = 0; index < 24; index += 1) {
            this.appendAndCleanup(container, this.createConfetti(), 3800);
        }
    }

    launchHearts(container) {
        for (let index = 0; index < 12; index += 1) {
            this.appendAndCleanup(container, this.createHeart(), 2600);
        }
    }

    launchSparkles(container) {
        for (let index = 0; index < 16; index += 1) {
            this.appendAndCleanup(container, this.createSparkle(), 2200);
        }
    }

    launchBalloons(container) {
        for (let index = 0; index < 8; index += 1) {
            this.appendAndCleanup(container, this.createBalloon(), 5200);
        }
    }

    launchFireworks(container) {
        const burstCount = 3;
        const sparksPerBurst = 10;

        for (let burstIndex = 0; burstIndex < burstCount; burstIndex += 1) {
            const delay = burstIndex * 120;
            setTimeout(() => {
                const originX = this.randomBetween(this.viewportWidth() * 0.15, this.viewportWidth() * 0.85);
                const originY = this.randomBetween(this.viewportHeight() * 0.2, this.viewportHeight() * 0.55);

                for (let sparkIndex = 0; sparkIndex < sparksPerBurst; sparkIndex += 1) {
                    const baseAngle = (Math.PI * 2 * sparkIndex) / sparksPerBurst;
                    const angle = baseAngle + this.randomBetween(-0.18, 0.18);
                    const distance = this.randomBetween(45, 110);
                    this.appendAndCleanup(
                        container,
                        this.createFireworkSpark(originX, originY, angle, distance),
                        1300
                    );
                }
            }, delay);
        }
    }

    handleCorrectAnswer(selectedOption, allOptions, callback) {
        Array.from(allOptions || []).forEach((option) => {
            option.classList.remove('correct', 'wrong');
            option.disabled = true;
            option.onclick = null;
        });

        selectedOption.classList.add('correct');

        if (!this.prefersReducedMotion) {
            const starsContainer = this.getStarsContainer();
            if (starsContainer && this.celebrationEffects.length) {
                const effect = this.pickRandom(this.celebrationEffects);
                effect(starsContainer);
            }
        }

        setTimeout(() => {
            Array.from(allOptions || []).forEach((option) => {
                option.classList.remove('correct', 'wrong');
            });
            callback();
        }, this.prefersReducedMotion ? 250 : 1000);
    }

    handleWrongAnswer(option) {
        option.classList.remove('correct');
        option.classList.add('wrong');
        setTimeout(() => option.classList.remove('wrong'), 500);
    }
}

export const animationSystem = new AnimationSystem();
