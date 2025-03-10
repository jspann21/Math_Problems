// Animation system for math problems
class AnimationSystem {
    constructor() {
        this.starsContainer = document.getElementById('stars-container');
    }

    // Create a star element with random properties
    createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = '⭐';
        star.style.left = Math.random() * window.innerWidth + 'px';
        star.style.fontSize = `${Math.random() * 20 + 20}px`; // Random size between 20-40px
        star.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`; // Random duration between 0.5-2s
        return star;
    }

    // Handle correct answer animation
    handleCorrectAnswer(selectedOption, allOptions, callback) {
        // Disable all options
        Array.from(allOptions).forEach(option => {
            option.disabled = true;
            option.onclick = null;
        });

        // Add correct class to the selected option
        selectedOption.classList.add('correct');

        // Create and animate stars
        const numStars = 10; // Consistent number of stars for all problems
        for (let i = 0; i < numStars; i++) {
            const star = this.createStar();
            this.starsContainer.appendChild(star);
            setTimeout(() => {
                star.remove();
            }, 2000);
        }

        // Wait for animation to complete before moving to next problem
        setTimeout(callback, 1000);
    }

    // Handle wrong answer animation
    handleWrongAnswer(option) {
        option.classList.add('wrong');
        setTimeout(() => option.classList.remove('wrong'), 500);
    }
}

// Export a single instance to be used across all problems
const animationSystem = new AnimationSystem(); 