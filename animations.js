class AnimationSystem {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.celebrationScenes = [
            this.launchStarJubilee.bind(this),
            this.launchConfettiCannon.bind(this),
            this.launchHeartGlow.bind(this),
            this.launchSparkleOrbit.bind(this),
            this.launchBalloonParade.bind(this),
            this.launchFireworkFinale.bind(this),
            this.launchRibbonCascade.bind(this),
        ];
        this.confettiColors = [
            '#ef4444',
            '#f97316',
            '#f59e0b',
            '#facc15',
            '#22c55e',
            '#14b8a6',
            '#3b82f6',
            '#6366f1',
            '#a855f7',
            '#ec4899',
        ];
        this.starSymbols = ['★', '✦', '✧', '⭐'];
        this.sparkleSymbols = ['✨', '✦', '✧', '✺', '✹'];
    }

    getStarsContainer() {
        return document.getElementById('stars-container');
    }

    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomInt(min, max) {
        return Math.floor(this.randomBetween(min, max + 1));
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
        particle.setAttribute('aria-hidden', 'true');
        if (text) {
            particle.textContent = text;
        }
        return particle;
    }

    getOrigin(element) {
        if (!element || typeof element.getBoundingClientRect !== 'function') {
            return {
                x: this.viewportWidth() / 2,
                y: this.viewportHeight() * 0.45,
            };
        }

        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }

    createStar(origin = null) {
        const star = this.createParticle('star', this.pickRandom(this.starSymbols));
        star.style.fontSize = `${this.randomBetween(18, 42)}px`;
        star.style.animationDuration = `${this.randomBetween(0.85, 1.9)}s`;

        if (origin) {
            const angle = this.randomBetween(0, Math.PI * 2);
            const distance = this.randomBetween(42, 130);
            star.classList.add('star-burst');
            star.style.left = `${origin.x}px`;
            star.style.top = `${origin.y}px`;
            star.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
            star.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
            star.style.setProperty('--spin', `${this.randomInt(-220, 220)}deg`);
            return star;
        }

        star.classList.add('star-fall');
        star.style.left = `${Math.random() * this.viewportWidth()}px`;
        star.style.top = `${this.randomBetween(-80, -20)}px`;
        return star;
    }

    createConfetti(origin = null) {
        const shape = this.pickRandom(['shard', 'circle', 'ribbon', 'triangle']);
        const confetti = this.createParticle(`confetti confetti-${shape}`);
        const color = this.pickRandom(this.confettiColors);
        const width = this.randomBetween(7, 15);
        const height = this.randomBetween(12, 28);

        if (shape === 'triangle') {
            confetti.style.borderBottomColor = color;
        } else {
            confetti.style.backgroundColor = color;
            confetti.style.width = `${width}px`;
            confetti.style.height = `${height}px`;
        }

        confetti.style.setProperty('--spin', `${this.randomInt(220, 860)}deg`);

        if (origin) {
            const angle = this.randomBetween(-Math.PI, 0);
            const distance = this.randomBetween(60, 190);
            confetti.classList.add('confetti-burst');
            confetti.style.left = `${origin.x}px`;
            confetti.style.top = `${origin.y}px`;
            confetti.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
            confetti.style.setProperty('--dy', `${Math.sin(angle) * distance + this.randomBetween(-20, 70)}px`);
            confetti.style.animationDuration = `${this.randomBetween(0.95, 1.55)}s`;
            return confetti;
        }

        confetti.classList.add('confetti-fall');
        confetti.style.left = `${Math.random() * this.viewportWidth()}px`;
        confetti.style.top = `${this.randomBetween(-80, -16)}px`;
        const drift = this.randomBetween(-70, 70);
        confetti.style.setProperty('--drift', `${drift}px`);
        confetti.style.setProperty('--drift-a', `${drift * 0.45}px`);
        confetti.style.setProperty('--drift-b', `${drift * -0.28}px`);
        confetti.style.setProperty('--drift-c', `${drift * 0.75}px`);
        confetti.style.animationDuration = `${this.randomBetween(2.4, 4.2)}s`;
        return confetti;
    }

    createHeart() {
        const heart = this.createParticle('heart', this.pickRandom(['♥', '💙', '💚', '💛', '💖']));
        heart.style.left = `${Math.random() * this.viewportWidth()}px`;
        heart.style.top = `${this.randomBetween(this.viewportHeight() * 0.65, this.viewportHeight() * 0.9)}px`;
        heart.style.fontSize = `${this.randomBetween(22, 42)}px`;
        const drift = this.randomBetween(-90, 90);
        heart.style.setProperty('--drift', `${drift}px`);
        heart.style.setProperty('--drift-a', `${drift * 0.55}px`);
        heart.style.animationDuration = `${this.randomBetween(1.9, 2.9)}s`;
        return heart;
    }

    createSparkle(origin = null) {
        const sparkle = this.createParticle('sparkle', this.pickRandom(this.sparkleSymbols));
        sparkle.style.fontSize = `${this.randomBetween(17, 34)}px`;
        sparkle.style.animationDuration = `${this.randomBetween(1.0, 1.95)}s`;

        if (origin) {
            const angle = this.randomBetween(0, Math.PI * 2);
            const distance = this.randomBetween(36, 125);
            sparkle.classList.add('sparkle-burst');
            sparkle.style.left = `${origin.x}px`;
            sparkle.style.top = `${origin.y}px`;
            sparkle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
            sparkle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
            return sparkle;
        }

        sparkle.classList.add('sparkle-float');
        sparkle.style.left = `${Math.random() * this.viewportWidth()}px`;
        sparkle.style.top = `${this.randomBetween(this.viewportHeight() * 0.18, this.viewportHeight() * 0.75)}px`;
        return sparkle;
    }

    createBalloon() {
        const balloon = this.createParticle('balloon', this.pickRandom(['🎈', '🎈', '🎈', '🎉']));
        balloon.style.left = `${Math.random() * this.viewportWidth()}px`;
        balloon.style.top = `${this.viewportHeight() + this.randomBetween(10, 120)}px`;
        balloon.style.fontSize = `${this.randomBetween(32, 50)}px`;
        const drift = this.randomBetween(-90, 90);
        balloon.style.setProperty('--drift', `${drift}px`);
        balloon.style.setProperty('--drift-a', `${drift * 0.35}px`);
        balloon.style.setProperty('--drift-b', `${drift * -0.2}px`);
        balloon.style.setProperty('--drift-c', `${drift * 0.65}px`);
        balloon.style.animationDuration = `${this.randomBetween(3.5, 4.8)}s`;
        return balloon;
    }

    createStreamer() {
        const streamer = this.createParticle('streamer');
        const colorA = this.pickRandom(this.confettiColors);
        const colorB = this.pickRandom(this.confettiColors);
        streamer.style.left = `${Math.random() * this.viewportWidth()}px`;
        streamer.style.top = `${this.randomBetween(-110, -40)}px`;
        streamer.style.width = `${this.randomBetween(6, 10)}px`;
        streamer.style.height = `${this.randomBetween(28, 54)}px`;
        streamer.style.background = `linear-gradient(180deg, ${colorA}, ${colorB})`;
        const drift = this.randomBetween(-110, 110);
        const spin = this.randomInt(180, 620);
        streamer.style.setProperty('--drift', `${drift}px`);
        streamer.style.setProperty('--drift-a', `${drift * 0.55}px`);
        streamer.style.setProperty('--spin', `${spin}deg`);
        streamer.style.setProperty('--spin-a', `${spin * 0.55}deg`);
        streamer.style.animationDuration = `${this.randomBetween(2.0, 3.2)}s`;
        return streamer;
    }

    createAnswerRing(origin) {
        const ring = this.createParticle('answer-ring');
        ring.style.left = `${origin.x}px`;
        ring.style.top = `${origin.y}px`;
        ring.style.borderColor = this.pickRandom(this.confettiColors);
        ring.style.animationDuration = `${this.randomBetween(0.75, 1.05)}s`;
        return ring;
    }

    createBurstRay(origin, angle, distance) {
        const ray = this.createParticle('burst-ray');
        ray.style.left = `${origin.x}px`;
        ray.style.top = `${origin.y}px`;
        ray.style.backgroundColor = this.pickRandom(this.confettiColors);
        ray.style.setProperty('--angle', `${angle}rad`);
        ray.style.setProperty('--distance', `${distance}px`);
        ray.style.setProperty('--distance-y', `${distance * -1}px`);
        ray.style.animationDuration = `${this.randomBetween(0.55, 0.85)}s`;
        return ray;
    }

    createFireworkSpark(originX, originY, angle, distance) {
        const spark = this.createParticle('firework-spark');
        const color = this.pickRandom(this.confettiColors);
        spark.style.left = `${originX}px`;
        spark.style.top = `${originY}px`;
        spark.style.backgroundColor = color;
        spark.style.color = color;
        spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        spark.style.setProperty('--scale', `${this.randomBetween(0.16, 0.36)}`);
        spark.style.animationDuration = `${this.randomBetween(0.75, 1.1)}s`;
        return spark;
    }

    appendAndCleanup(container, particle, removeAfterMs) {
        container.appendChild(particle);
        setTimeout(() => particle.remove(), removeAfterMs);
    }

    launchAnswerBurst(container, origin) {
        this.appendAndCleanup(container, this.createAnswerRing(origin), 1200);

        const rayCount = this.randomInt(12, 18);
        for (let index = 0; index < rayCount; index += 1) {
            const angle = (Math.PI * 2 * index) / rayCount + this.randomBetween(-0.08, 0.08);
            this.appendAndCleanup(container, this.createBurstRay(origin, angle, this.randomBetween(48, 120)), 1000);
        }

        for (let index = 0; index < 12; index += 1) {
            this.appendAndCleanup(container, this.createSparkle(origin), 1900);
        }

        for (let index = 0; index < 10; index += 1) {
            this.appendAndCleanup(container, this.createConfetti(origin), 1800);
        }
    }

    launchStars(container) {
        for (let index = 0; index < 14; index += 1) {
            this.appendAndCleanup(container, this.createStar(), 2200);
        }
    }

    launchConfetti(container) {
        for (let index = 0; index < 34; index += 1) {
            this.appendAndCleanup(container, this.createConfetti(), 4300);
        }
    }

    launchHearts(container) {
        for (let index = 0; index < 13; index += 1) {
            this.appendAndCleanup(container, this.createHeart(), 3100);
        }
    }

    launchSparkles(container) {
        for (let index = 0; index < 22; index += 1) {
            this.appendAndCleanup(container, this.createSparkle(), 2200);
        }
    }

    launchBalloons(container) {
        for (let index = 0; index < 8; index += 1) {
            this.appendAndCleanup(container, this.createBalloon(), 5200);
        }
    }

    launchStreamers(container) {
        for (let index = 0; index < 8; index += 1) {
            this.appendAndCleanup(container, this.createStreamer(), 3600);
        }
    }

    launchFireworks(container) {
        const burstCount = 3;
        const sparksPerBurst = 14;

        for (let burstIndex = 0; burstIndex < burstCount; burstIndex += 1) {
            const delay = burstIndex * 120;
            setTimeout(() => {
                const originX = this.randomBetween(this.viewportWidth() * 0.15, this.viewportWidth() * 0.85);
                const originY = this.randomBetween(this.viewportHeight() * 0.2, this.viewportHeight() * 0.55);

                for (let sparkIndex = 0; sparkIndex < sparksPerBurst; sparkIndex += 1) {
                    const baseAngle = (Math.PI * 2 * sparkIndex) / sparksPerBurst;
                    const angle = baseAngle + this.randomBetween(-0.18, 0.18);
                    const distance = this.randomBetween(50, 130);
                    this.appendAndCleanup(
                        container,
                        this.createFireworkSpark(originX, originY, angle, distance),
                        1300
                    );
                }
            }, delay);
        }
    }

    launchStarJubilee(container, origin) {
        this.launchAnswerBurst(container, origin);
        this.launchStars(container);
        for (let index = 0; index < 6; index += 1) {
            this.appendAndCleanup(container, this.createStar(origin), 2200);
        }
    }

    launchConfettiCannon(container, origin) {
        this.launchAnswerBurst(container, origin);
        this.launchConfetti(container);
    }

    launchHeartGlow(container, origin) {
        this.launchAnswerBurst(container, origin);
        this.launchHearts(container);
    }

    launchSparkleOrbit(container, origin) {
        this.launchAnswerBurst(container, origin);
        for (let index = 0; index < 20; index += 1) {
            this.appendAndCleanup(container, this.createSparkle(origin), 2200);
        }
        this.launchSparkles(container);
    }

    launchBalloonParade(container, origin) {
        this.launchAnswerBurst(container, origin);
        this.launchBalloons(container);
    }

    launchFireworkFinale(container, origin) {
        this.launchAnswerBurst(container, origin);
        this.launchFireworks(container);
    }

    launchRibbonCascade(container, origin) {
        this.launchAnswerBurst(container, origin);
        this.launchStreamers(container);
    }

    handleCorrectAnswer(selectedOption, allOptions, callback) {
        Array.from(allOptions || []).forEach((option) => {
            option.classList.remove('correct', 'wrong');
            option.disabled = true;
            option.onclick = null;
        });

        selectedOption.classList.add('correct', 'correct-celebration');

        if (!this.prefersReducedMotion) {
            const starsContainer = this.getStarsContainer();
            if (starsContainer && this.celebrationScenes.length) {
                const scene = this.pickRandom(this.celebrationScenes);
                scene(starsContainer, this.getOrigin(selectedOption));
            }
        }

        setTimeout(() => {
            Array.from(allOptions || []).forEach((option) => {
                option.classList.remove('correct', 'wrong', 'correct-celebration');
            });
            selectedOption.classList.remove('correct', 'wrong', 'correct-celebration');
            callback();
        }, this.prefersReducedMotion ? 250 : 1150);
    }

    handleWrongAnswer(option) {
        option.classList.remove('correct');
        option.classList.add('wrong');
        setTimeout(() => option.classList.remove('wrong'), 500);
    }
}

export const animationSystem = new AnimationSystem();
