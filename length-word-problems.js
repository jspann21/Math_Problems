import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

// Names for word problems
const names = [
    'Sarah', 'John', 'Mia', 'Leo', 'Anna', 'Tom', 'Lucy', 'Ben', 'Jane', 'Alex',
    'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'Lucas', 'Sophia', 'Mason', 'Isabella', 'William',
    'Ethan', 'Sofia', 'James', 'Charlotte', 'Daniel', 'Amelia', 'Henry', 'Harper', 'Joseph', 'Evelyn'
];

// Actions and objects for word problems
const actions = {
    use: ['uses', 'used', 'cut', 'cuts', 'needed'],
    have: ['has', 'had', 'has left', 'had left', 'remaining']
};

const objects = {
    inches: ['ribbon', 'rope', 'tape', 'string', 'cord'],
    feet: ['wire', 'yarn', 'fishing line', 'rope', 'cord'],
    centimeters: ['string', 'cable', 'fabric', 'ribbon', 'rope']
};

const purposes = {
    ribbon: ['a gift', 'decorations', 'wrapping', 'crafts', 'a wreath'],
    rope: ['climbing', 'camping', 'tying', 'securing', 'hanging'],
    tape: ['wrapping boxes', 'sealing packages', 'repairs', 'projects', 'decorating'],
    string: ['a bracelet', 'a necklace', 'crafts', 'decorations', 'tying'],
    cord: ['tying packages', 'hanging decorations', 'securing items', 'projects', 'bundling'],
    wire: ['a fence', 'repairs', 'projects', 'securing', 'construction'],
    yarn: ['knitting', 'crocheting', 'crafts', 'weaving', 'projects'],
    cable: ['speakers', 'lighting', 'electronics', 'connections', 'wiring'],
    fabric: ['a scarf', 'gloves', 'sewing', 'crafts', 'projects'],
    'fishing line': ['trout fishing', 'bass fishing', 'fishing gear', 'tackle', 'equipment']
};

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getUniqueRandomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateProblem() {
    const unit = getRandomElement(['inches', 'feet', 'centimeters']);
    const object = getRandomElement(objects[unit]);
    const [name1, name2] = getUniqueRandomElements(names, 2);
    
    // Generate random numbers
    const total = Math.floor(Math.random() * 301) + 100; // 100 to 400
    const used1 = Math.floor(Math.random() * (total - 50)) + 20; // 20 to (total-50)
    const remaining = Math.floor(Math.random() * (total - used1 - 10)) + 10; // 10 to (total-used1-10)
    const answer = total - used1 - remaining;

    // Ensure all numbers are positive and make sense
    if (total <= 0 || used1 <= 0 || remaining <= 0 || answer <= 0) {
        return generateProblem(); // Try again if the numbers don't work out
    }

    const purpose1 = getRandomElement(purposes[object]);
    const purpose2 = getRandomElement(purposes[object].filter(p => p !== purpose1));

    // Generate problem text
    const problemText = `${name1} ${getRandomElement(actions.have)} ${total} ${unit} of ${object}. ` +
        `${name1} ${getRandomElement(actions.use)} ${used1} ${unit} for ${purpose1} and some for ${purpose2}. ` +
        `${name1} ${getRandomElement(actions.have)} ${remaining} ${unit} left. ` +
        `How much ${object} did ${name1} use for ${purpose2}?`;

    // Generate wrong answers that are close to the correct answer but always positive
    function generateUniqueWrongAnswer(correctAnswer, existingAnswers) {
        let attempt = 0;
        let wrongAnswer;
        do {
            // Increase the range of wrong answers if we're having trouble finding unique ones
            const range = attempt < 5 ? 5 : 10;
            const offset = Math.random() < 0.5 ? 
                Math.floor(Math.random() * range) + 1 : // Always add at least 1
                -(Math.min(Math.floor(Math.random() * range), correctAnswer - 1)); // Never subtract more than would make it 0
            wrongAnswer = correctAnswer + offset;
            attempt++;
        } while ((existingAnswers.includes(wrongAnswer) || wrongAnswer <= 0) && attempt < 20);

        return wrongAnswer > 0 ? wrongAnswer : correctAnswer + 1; // Fallback to ensure positive
    }

    // Generate three unique wrong answers
    const wrongAnswers = [];
    for (let i = 0; i < 3; i++) {
        const wrongAnswer = generateUniqueWrongAnswer(answer, [...wrongAnswers, answer]);
        if (wrongAnswer > 0 && !wrongAnswers.includes(wrongAnswer) && wrongAnswer !== answer) {
            wrongAnswers.push(wrongAnswer);
        }
    }

    // If we couldn't generate enough unique wrong answers, fill in with more distant positive numbers
    while (wrongAnswers.length < 3) {
        const offset = wrongAnswers.length * 5 + 5;
        const wrongAnswer = answer + offset; // Always adding, ensuring positive
        if (!wrongAnswers.includes(wrongAnswer) && wrongAnswer !== answer) {
            wrongAnswers.push(wrongAnswer);
        }
    }

    return {
        text: problemText,
        answer: answer,
        options: shuffleArray([answer, ...wrongAnswers])
    };
}

// Game state
let currentProblem = null;
let currentProblemIndex = 0;
const problems = [];
const totalProblems = 50;

// Removed DOM element getters, initialization, problem generation loop, handlers from global scope

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Moved initialization code inside DOMContentLoaded

    // DOM elements
    const problemText = document.getElementById('problem-text');
    const optionsContainer = document.getElementById('options-container');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');

    // Generate all problems at start
    for (let i = 0; i < totalProblems; i++) {
        problems.push(generateProblem());
    }

    setupScratchpad();

    // Event handlers
    function handleOptionClick(option, index) {
        // Prevent clicking after answer
        if(option.disabled) return;

        const correctIndex = currentProblem.options.indexOf(currentProblem.answer);
        const isCorrect = index === correctIndex;
        
        const allOptions = optionsContainer.querySelectorAll('.option');
        if (isCorrect) {
            animationSystem.handleCorrectAnswer(option, allOptions, () => {
                // Auto-proceed to the next problem using modulo logic
                currentProblemIndex = (currentProblemIndex + 1) % totalProblems;
                displayProblem(); 
            });
        } else {
            animationSystem.handleWrongAnswer(option);
        }
    }

    function displayProblem() {
        currentProblem = problems[currentProblemIndex];
        problemText.textContent = currentProblem.text;
        
        const options = optionsContainer.getElementsByClassName('option');
        // Ensure options container is cleared if structure changes (though unlikely here)
        // optionsContainer.innerHTML = ''; 
        Array.from(options).forEach((option, index) => {
            // Check if currentProblem.options exists and has enough elements
            if (currentProblem.options && currentProblem.options.length > index) {
                option.textContent = currentProblem.options[index];
                option.className = 'option'; // Reset classes
                option.disabled = false;
                option.onclick = () => handleOptionClick(option, index);
            } else {
                // Handle cases where there might be fewer options than buttons
                option.style.display = 'none'; // Hide unused buttons
            }
        });
        
        // Ensure all buttons are visible initially if needed
        Array.from(options).forEach(opt => { if(opt.style.display === 'none') opt.style.display = ''; });

        // Update navigation buttons
        prevButton.disabled = currentProblemIndex === 0;
        // Allow next button even if it's the last generated problem (user might want to re-answer?)
        // nextButton.disabled = currentProblemIndex === totalProblems - 1; 
        nextButton.disabled = false; // Allow clicking next to generate potentially new (if logic changes) or cycle
    }

    // Navigation handlers
    prevButton.onclick = () => {
        if (currentProblemIndex > 0) {
            currentProblemIndex--;
            displayProblem();
        }
    };

    nextButton.onclick = () => {
        // Simple loop back for now, could regenerate problems
        currentProblemIndex = (currentProblemIndex + 1) % totalProblems;
        displayProblem();
        // if (currentProblemIndex < totalProblems - 1) {
        //     currentProblemIndex++;
        //     displayProblem();
        // }
    };

    // Initialize the first problem
    displayProblem();

    // Removed the redundant AnimationSystem check/definition block
}); 
