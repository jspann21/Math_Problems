class AnimationSystem {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    getStarsContainer() {
        return document.getElementById('stars-container');
    }

    createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = '⭐';
        star.style.left = `${Math.random() * window.innerWidth}px`;
        star.style.fontSize = `${Math.random() * 20 + 20}px`;
        star.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`;
        return star;
    }

    handleCorrectAnswer(selectedOption, allOptions, callback) {
        Array.from(allOptions).forEach((option) => {
            option.disabled = true;
            option.onclick = null;
        });

        selectedOption.classList.add('correct');

        if (!this.prefersReducedMotion) {
            const starsContainer = this.getStarsContainer();
            if (starsContainer) {
                for (let index = 0; index < 10; index += 1) {
                    const star = this.createStar();
                    starsContainer.appendChild(star);
                    setTimeout(() => star.remove(), 2000);
                }
            }
        }

        setTimeout(callback, this.prefersReducedMotion ? 250 : 1000);
    }

    handleWrongAnswer(option) {
        option.classList.add('wrong');
        setTimeout(() => option.classList.remove('wrong'), 500);
    }
}

export const animationSystem = new AnimationSystem();
