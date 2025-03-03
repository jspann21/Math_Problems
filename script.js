// Problem generator functions
function generateProblem() {
    const num1 = Math.floor(Math.random() * 90) + 10; // Two-digit number
    const num2 = Math.floor(Math.random() * 9) + 1;   // Single-digit number
    const num3 = Math.floor(Math.random() * 9) + 1;   // Single-digit number
    
    const problemTypes = [
        {
            text: `There are three trees in the garden. The smallest tree is ${num1} feet tall. The middle tree is ${num2} feet taller. If the tallest tree is ${num3} feet taller than the middle tree, how tall is the tallest tree?`,
            answer: num1 + num2 + num3
        },
        {
            text: `A red ribbon is ${num1} inches long. A blue ribbon is ${num2} inches longer than the red ribbon. If a yellow ribbon is ${num3} inches longer than the blue ribbon, how long is the yellow ribbon?`,
            answer: num1 + num2 + num3
        },
        {
            text: `Sam has ${num1} marbles. Tom has ${num2} more marbles than Sam. If Jim has ${num3} more marbles than Tom, how many marbles does Jim have?`,
            answer: num1 + num2 + num3
        }
    ];

    const selectedProblem = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    const answer = selectedProblem.answer;
    
    // Generate wrong answers that are close to the correct answer
    const wrongAnswers = [
        answer + Math.floor(Math.random() * 5) + 1,
        answer - Math.floor(Math.random() * 5) - 1,
        answer + Math.floor(Math.random() * 7) + 3
    ];

    return {
        text: selectedProblem.text,
        answer: answer,
        options: shuffleArray([answer, ...wrongAnswers])
    };
}

// Utility functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    star.style.left = Math.random() * window.innerWidth + 'px';
    return star;
}

// Game state
let currentProblem = null;
let currentProblemIndex = 0;
const problems = [];
const totalProblems = 50;

// Generate all problems at start
for (let i = 0; i < totalProblems; i++) {
    problems.push(generateProblem());
}

// DOM elements
const problemText = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const starsContainer = document.getElementById('stars-container');

// Event handlers
function handleOptionClick(option, index) {
    const selectedAnswer = parseInt(option.textContent);
    
    if (selectedAnswer === currentProblem.answer) {
        option.classList.add('correct');
        
        // Create and animate stars
        for (let i = 0; i < 5; i++) {
            const star = createStar();
            starsContainer.appendChild(star);
            setTimeout(() => star.remove(), 1000);
        }

        // Disable all options temporarily
        const options = optionsContainer.getElementsByClassName('option');
        Array.from(options).forEach(opt => opt.disabled = true);

        // Move to next problem after a delay
        setTimeout(() => {
            if (currentProblemIndex < totalProblems - 1) {
                currentProblemIndex++;
                displayProblem();
            }
        }, 1500);
    } else {
        option.classList.add('wrong');
        setTimeout(() => option.classList.remove('wrong'), 500);
    }
}

function displayProblem() {
    currentProblem = problems[currentProblemIndex];
    problemText.textContent = currentProblem.text;
    
    const options = optionsContainer.getElementsByClassName('option');
    Array.from(options).forEach((option, index) => {
        option.textContent = currentProblem.options[index];
        option.className = 'option';
        option.disabled = false;
        option.onclick = () => handleOptionClick(option, index);
    });

    // Update navigation buttons
    prevButton.disabled = currentProblemIndex === 0;
    nextButton.disabled = currentProblemIndex === totalProblems - 1;
}

// Navigation handlers
prevButton.onclick = () => {
    if (currentProblemIndex > 0) {
        currentProblemIndex--;
        displayProblem();
    }
};

nextButton.onclick = () => {
    if (currentProblemIndex < totalProblems - 1) {
        currentProblemIndex++;
        displayProblem();
    }
};

// Initialize the first problem
displayProblem(); 