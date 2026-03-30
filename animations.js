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
        this.confettiColors = ['#22c55e', '#14b8a6', '#3b82f6', '#f59e0b', '#f97316', '#ec4899'];
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

    getOriginMetrics(element) {
        if (!element?.getBoundingClientRect) {
            return {
                x: this.viewportWidth() / 2,
                y: this.viewportHeight() * 0.45,
                width: 120,
                height: 56,
            };
        }

        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
        };
    }

    setParticleOrigin(particle, origin, spreadX = 0.28, spreadY = 0.2) {
        particle.style.left = `${origin.x + this.randomBetween(-origin.width * spreadX, origin.width * spreadX)}px`;
        particle.style.top = `${origin.y + this.randomBetween(-origin.height * spreadY, origin.height * spreadY)}px`;
    }

    createStar(origin) {
        const star = this.createParticle('star', '⭐');
        this.setParticleOrigin(star, origin);
        star.style.fontSize = `${this.randomBetween(18, 28)}px`;
        star.style.setProperty('--dx', `${this.randomBetween(-90, 90)}px`);
        star.style.setProperty('--dy', `${this.randomBetween(-120, -48)}px`);
        star.style.setProperty('--twirl', `${this.randomBetween(-180, 180)}deg`);
        star.style.animationDuration = `${this.randomBetween(0.65, 0.95)}s`;
        return star;
    }

    createConfetti(origin) {
        const confetti = this.createParticle('confetti');
        const color = this.pickRandom(this.confettiColors);
        this.setParticleOrigin(confetti, origin, 0.2, 0.15);
        confetti.style.background = `linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, ${color} 28%, ${color} 100%)`;
        confetti.style.width = `${this.randomBetween(7, 12)}px`;
        confetti.style.height = `${this.randomBetween(12, 18)}px`;
        confetti.style.borderRadius = `${this.randomBetween(3, 6)}px`;
        confetti.style.setProperty('--dx', `${this.randomBetween(-140, 140)}px`);
        confetti.style.setProperty('--dy', `${this.randomBetween(-90, -24)}px`);
        confetti.style.setProperty('--fall', `${this.randomBetween(70, 150)}px`);
        confetti.style.setProperty('--twirl', `${this.randomBetween(-320, 320)}deg`);
        confetti.style.animationDuration = `${this.randomBetween(0.75, 1.05)}s`;
        return confetti;
    }

    createHeart(origin) {
        const heart = this.createParticle('heart', this.pickRandom(['💙', '💚', '💛', '💖']));
        this.setParticleOrigin(heart, origin, 0.15, 0.12);
        heart.style.setProperty('--dx', `${this.randomBetween(-60, 60)}px`);
        heart.style.setProperty('--dy', `${this.randomBetween(-165, -95)}px`);
        heart.style.animationDuration = `${this.randomBetween(0.9, 1.15)}s`;
        return heart;
    }

    createSparkle(origin) {
        const sparkle = this.createParticle('sparkle', this.pickRandom(['✨', '✦', '✧']));
        this.setParticleOrigin(sparkle, origin, 0.22, 0.18);
        sparkle.style.setProperty('--dx', `${this.randomBetween(-80, 80)}px`);
        sparkle.style.setProperty('--dy', `${this.randomBetween(-95, -35)}px`);
        sparkle.style.setProperty('--twirl', `${this.randomBetween(-120, 120)}deg`);
        sparkle.style.animationDuration = `${this.randomBetween(0.55, 0.85)}s`;
        return sparkle;
    }

    createBalloon(origin) {
        const balloon = this.createParticle('balloon', this.pickRandom(['🎈', '🎈', '🎈', '🎉']));
        this.setParticleOrigin(balloon, origin, 0.18, 0.12);
        balloon.style.setProperty('--dx', `${this.randomBetween(-40, 40)}px`);
        balloon.style.setProperty('--dy', `${this.randomBetween(-190, -120)}px`);
        balloon.style.animationDuration = `${this.randomBetween(0.95, 1.2)}s`;
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

    launchStars(container, origin) {
        for (let index = 0; index < 8; index += 1) {
            this.appendAndCleanup(container, this.createStar(origin), 1200);
        }
    }

    launchConfetti(container, origin) {
        for (let index = 0; index < 18; index += 1) {
            this.appendAndCleanup(container, this.createConfetti(origin), 1400);
        }
    }

    launchHearts(container, origin) {
        for (let index = 0; index < 8; index += 1) {
            this.appendAndCleanup(container, this.createHeart(origin), 1400);
        }
    }

    launchSparkles(container, origin) {
        for (let index = 0; index < 12; index += 1) {
            this.appendAndCleanup(container, this.createSparkle(origin), 1000);
        }
    }

    launchBalloons(container, origin) {
        for (let index = 0; index < 5; index += 1) {
            this.appendAndCleanup(container, this.createBalloon(origin), 1500);
        }
    }

    launchFireworks(container, origin) {
        const burstCount = 2;
        const sparksPerBurst = 9;

        for (let burstIndex = 0; burstIndex < burstCount; burstIndex += 1) {
            const delay = burstIndex * 90;
            setTimeout(() => {
                const originX = origin.x + this.randomBetween(-origin.width * 0.15, origin.width * 0.15);
                const originY = origin.y + this.randomBetween(-origin.height * 0.2, origin.height * 0.1);

                for (let sparkIndex = 0; sparkIndex < sparksPerBurst; sparkIndex += 1) {
                    const baseAngle = (Math.PI * 2 * sparkIndex) / sparksPerBurst;
                    const angle = baseAngle + this.randomBetween(-0.18, 0.18);
                    const distance = this.randomBetween(38, 88);
                    this.appendAndCleanup(
                        container,
                        this.createFireworkSpark(originX, originY, angle, distance),
                        1000
                    );
                }
            }, delay);
        }
    }

    handleCorrectAnswer(selectedOption, allOptions, callback) {
        Array.from(allOptions || []).forEach((option) => {
            option.disabled = true;
            option.onclick = null;
        });

        selectedOption.classList.add('correct');

        if (!this.prefersReducedMotion) {
            const starsContainer = this.getStarsContainer();
            if (starsContainer && this.celebrationEffects.length) {
                const origin = this.getOriginMetrics(selectedOption);
                const effect = this.pickRandom(this.celebrationEffects);
                effect(starsContainer, origin);
            }
        }

        setTimeout(() => callback?.(), this.prefersReducedMotion ? 250 : 1000);
    }

    handleWrongAnswer(option) {
        option.classList.add('wrong');
        setTimeout(() => option.classList.remove('wrong'), 500);
    }
}

export const animationSystem = new AnimationSystem();
