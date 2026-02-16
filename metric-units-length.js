import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

const problems = [
    { question: 'Which is a better estimate for the length of a fork?', options: ['15 millimeters', '15 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a person?', options: ['170 centimeters', '170 meters'], correct: 0 },
    { question: 'Which is a better estimate for the length of a farm?', options: ['5 kilometers', '5 meters'], correct: 0 },
    { question: 'Which is a better estimate for the length of a bus?', options: ['10 meters', '10 centimeters'], correct: 0 },
    { question: 'Which is a better estimate for the length of a pencil?', options: ['15 centimeters', '15 meters'], correct: 0 },
    { question: 'Which is a better estimate for the height of a tree?', options: ['20 millimeters', '20 meters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a paperclip?', options: ['3 kilometers', '3 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the width of a smartphone?', options: ['7 centimeters', '7 meters'], correct: 0 },
    { question: 'Which is a better estimate for the length of a football field?', options: ['100 meters', '100 centimeters'], correct: 0 },
    { question: 'Which is a better estimate for the height of a door?', options: ['2 kilometers', '2 meters'], correct: 1 },
    { question: 'Which is a better estimate for the length of an ant?', options: ['5 millimeters', '5 meters'], correct: 0 },
    { question: 'Which is a better estimate for the distance between two cities?', options: ['50 meters', '50 kilometers'], correct: 1 },
    { question: 'Which is a better estimate for the length of a key?', options: ['7 kilometers', '7 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a lamp post?', options: ['5 meters', '5 millimeters'], correct: 0 },
    { question: 'Which is a better estimate for the width of a credit card?', options: ['85 meters', '85 millimeters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a swimming pool?', options: ['25 meters', '25 millimeters'], correct: 0 },
    { question: 'Which is a better estimate for the thickness of a coin?', options: ['2 meters', '2 millimeters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a refrigerator?', options: ['170 centimeters', '170 kilometers'], correct: 0 },
    { question: 'Which is a better estimate for the length of a hiking trail?', options: ['5 centimeters', '5 kilometers'], correct: 1 },
    { question: 'Which is a better estimate for the width of a television screen?', options: ['120 kilometers', '120 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a staple?', options: ['10 millimeters', '10 meters'], correct: 0 },
    { question: 'Which is a better estimate for the height of a skyscraper?', options: ['300 centimeters', '300 meters'], correct: 1 },
    { question: 'Which is a better estimate for the width of a finger?', options: ['2 centimeters', '2 kilometers'], correct: 0 },
    { question: 'Which is a better estimate for the length of a car?', options: ['4 millimeters', '4 meters'], correct: 1 },
    { question: 'Which is a better estimate for the width of a road?', options: ['10 millimeters', '10 meters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a paper clip?', options: ['3 meters', '3 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a coffee cup?', options: ['12 kilometers', '12 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a marathon?', options: ['42 kilometers', '42 meters'], correct: 0 },
    { question: 'Which is a better estimate for the width of a postage stamp?', options: ['2 meters', '2 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a fence?', options: ['2 millimeters', '2 meters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a tennis court?', options: ['24 meters', '24 millimeters'], correct: 0 },
    { question: 'Which is a better estimate for the width of a book page?', options: ['15 kilometers', '15 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a kitchen counter?', options: ['90 meters', '90 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a bicycle?', options: ['180 centimeters', '180 kilometers'], correct: 0 },
    { question: 'Which is a better estimate for the width of a sidewalk?', options: ['2 millimeters', '2 meters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a stop sign?', options: ['2 kilometers', '2 meters'], correct: 1 },
    { question: 'Which is a better estimate for the length of a phone charger cable?', options: ['1 kilometer', '1 meter'], correct: 1 },
    { question: 'Which is a better estimate for the width of a laptop screen?', options: ['35 meters', '35 centimeters'], correct: 1 },
    { question: 'Which is a better estimate for the height of a dining table?', options: ['75 centimeters', '75 kilometers'], correct: 0 },
    { question: 'Which is a better estimate for the length of an airplane?', options: ['40 meters', '40 millimeters'], correct: 0 },
    { question: 'Which is a better estimate for the width of a door?', options: ['80 kilometers', '80 centimeters'], correct: 1 },
];

shuffleArray(problems);

let currentProblemIndex = 0;

const problemText = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

function setNavigationState() {
    prevButton.disabled = currentProblemIndex === 0;
    nextButton.disabled = currentProblemIndex === problems.length - 1;
}

function displayProblem() {
    const problem = problems[currentProblemIndex];
    problemText.textContent = problem.question;
    optionsContainer.innerHTML = '';

    problem.options.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = optionText;
        button.addEventListener('click', () => handleOptionClick(button, index));
        optionsContainer.appendChild(button);
    });

    setNavigationState();
}

function handleOptionClick(selectedOption, selectedIndex) {
    if (selectedOption.disabled) {
        return;
    }

    const problem = problems[currentProblemIndex];
    const allOptions = optionsContainer.querySelectorAll('.option');

    if (selectedIndex === problem.correct) {
        animationSystem.handleCorrectAnswer(selectedOption, allOptions, () => {
            if (currentProblemIndex < problems.length - 1) {
                currentProblemIndex += 1;
                displayProblem();
            }
        });
    } else {
        animationSystem.handleWrongAnswer(selectedOption);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupScratchpad();

    prevButton.addEventListener('click', () => {
        if (currentProblemIndex > 0) {
            currentProblemIndex -= 1;
            displayProblem();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentProblemIndex < problems.length - 1) {
            currentProblemIndex += 1;
            displayProblem();
        }
    });

    displayProblem();
});
