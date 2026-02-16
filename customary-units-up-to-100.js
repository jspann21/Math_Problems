import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

// Problem generator functions
function generateProblem() {
    // Names array to cycle through
    const names = ['Elizabeth', 'Matilda', 'Dylan', 'Joe', 'Andrew', 'James', 'Sarah', 'Austin', 
                  'Angela', 'Sydney', 'Ashley', 'Sadie', 'Adalyn', 'Michael', 'Emma', 'Noah', 
                  'Olivia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Micah', 
                  'Charlotte', 'Theodore', 'Amelia', 'Jack', 'Harper', 'Oliver'];

    // Helper function for unit pluralization
    function getUnit(value, unit) {
        if (unit === 'foot') {
            return value === 1 ? 'foot' : 'feet';
        }
        return value === 1 ? unit : unit + 's';
    }

    // Get two different random names
    let name1Index = Math.floor(Math.random() * names.length);
    let name2Index;
    do {
        name2Index = Math.floor(Math.random() * names.length);
    } while (name2Index === name1Index);

    const name1 = names[name1Index];
    const name2 = names[name2Index];

    // Generate appropriate numbers based on the measurement context
    const smallNumber = Math.floor(Math.random() * 5) + 1; // 1-5
    const mediumNumber = Math.floor(Math.random() * 15) + 5; // 5-20
    const largeNumber = Math.floor(Math.random() * 25) + 15; // 15-40
    
    // Helper function to ensure sums don't exceed 100
    function getValidSecondNumber(firstNum, maxSum = 100) {
        const maxAllowed = maxSum - firstNum;
        return Math.min(smallNumber, maxAllowed);
    }

    const problemTypes = [
        // Tree and plant measurements (in feet)
        {
            text: `There are two trees in ${name1}'s backyard. One is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} tall, and the pine tree is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'foot')} taller. How tall is the pine tree?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s rose bush is ${smallNumber} ${getUnit(smallNumber, 'foot')} tall. ${name2}'s rose bush is ${getValidSecondNumber(smallNumber)} ${getUnit(getValidSecondNumber(smallNumber), 'foot')} taller. How tall is ${name2}'s rose bush?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        
        // Indoor measurements (in feet)
        {
            text: `${name1} has a rug that is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. ${name2}'s rug is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'foot')} longer. How long is ${name2}'s rug?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s hallway is ${largeNumber} ${getUnit(largeNumber, 'foot')} long. ${name2}'s hallway is ${smallNumber} ${getUnit(smallNumber, 'foot')} shorter. How long is ${name2}'s hallway?`,
            answer: largeNumber - smallNumber
        },
        
        // Playground measurements (in feet)
        {
            text: `${name1} drew a hopscotch court ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. ${name2} drew one ${smallNumber} ${getUnit(smallNumber, 'foot')} shorter. How long is ${name2}'s hopscotch court?`,
            answer: mediumNumber - smallNumber
        },
        {
            text: `${name1}'s jump rope is ${largeNumber} ${getUnit(largeNumber, 'foot')} long. ${name2}'s jump rope is ${smallNumber} ${getUnit(smallNumber, 'foot')} shorter. How long is ${name2}'s jump rope?`,
            answer: largeNumber - smallNumber
        },
        
        // Toy measurements (in inches)
        {
            text: `At the toy store, ${name1} found a toy car ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. ${name2} found one that is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'inch')} longer. How long is ${name2}'s toy car?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s model airplane is ${largeNumber} ${getUnit(largeNumber, 'inch')} long. ${name2}'s is ${smallNumber} ${getUnit(smallNumber, 'inch')} shorter. How long is ${name2}'s model airplane?`,
            answer: largeNumber - smallNumber
        },
        
        // Yard measurements (in yards)
        {
            text: `${name1}'s garden is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. ${name2}'s garden is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'yard')} longer. How long is ${name2}'s garden?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s driveway is ${largeNumber} ${getUnit(largeNumber, 'yard')} long. ${name2}'s driveway is ${smallNumber} ${getUnit(smallNumber, 'yard')} shorter. How long is ${name2}'s driveway?`,
            answer: largeNumber - smallNumber
        },
        
        // Sports field measurements (in yards)
        {
            text: `${name1} can throw a football ${mediumNumber} ${getUnit(mediumNumber, 'yard')}. ${name2} can throw it ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'yard')} further. How far can ${name2} throw the football?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1} ran ${largeNumber} ${getUnit(largeNumber, 'yard')} in practice. ${name2} ran ${smallNumber} ${getUnit(smallNumber, 'yard')} less. How far did ${name2} run?`,
            answer: largeNumber - smallNumber
        },
        
        // Craft projects (in inches)
        {
            text: `${name1}'s paper chain is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. ${name2}'s is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'inch')} longer. How long is ${name2}'s paper chain?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1} made a bookmark ${smallNumber} ${getUnit(smallNumber, 'inch')} long. ${name2}'s bookmark is ${getValidSecondNumber(smallNumber)} ${getUnit(getValidSecondNumber(smallNumber), 'inch')} longer. How long is ${name2}'s bookmark?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        
        // Building measurements (in feet)
        {
            text: `${name1}'s treehouse is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} tall. ${name2}'s treehouse is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'foot')} taller. How tall is ${name2}'s treehouse?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s fence is ${largeNumber} ${getUnit(largeNumber, 'foot')} long. ${name2}'s fence is ${smallNumber} ${getUnit(smallNumber, 'foot')} shorter. How long is ${name2}'s fence?`,
            answer: largeNumber - smallNumber
        },
        
        // Ribbon and string measurements (in inches)
        {
            text: `${name1} needs ${mediumNumber} ${getUnit(mediumNumber, 'inch')} of ribbon. ${name2} needs ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'inch')} more. How many inches of ribbon does ${name2} need?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1} has ${mediumNumber} ${getUnit(mediumNumber, 'inch')} of string. ${name2} has ${smallNumber} ${getUnit(smallNumber, 'inch')} less. How many inches of string does ${name2} have?`,
            answer: mediumNumber - smallNumber
        },
        
        // Path and trail measurements (in yards)
        {
            text: `${name1}'s walking path is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. ${name2}'s is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'yard')} longer. How long is ${name2}'s path?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s nature trail is ${largeNumber} ${getUnit(largeNumber, 'yard')} long. ${name2}'s trail is ${smallNumber} ${getUnit(smallNumber, 'yard')} shorter. How long is ${name2}'s trail?`,
            answer: largeNumber - smallNumber
        },
        
        // School supplies (in inches)
        {
            text: `${name1}'s ruler is ${smallNumber} ${getUnit(smallNumber, 'inch')} long. ${name2}'s ruler is ${getValidSecondNumber(smallNumber)} ${getUnit(getValidSecondNumber(smallNumber), 'inch')} longer. How long is ${name2}'s ruler?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        {
            text: `${name1}'s pencil box is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. ${name2}'s is ${smallNumber} ${getUnit(smallNumber, 'inch')} shorter. How long is ${name2}'s pencil box?`,
            answer: mediumNumber - smallNumber
        },
        
        // Garden features (in feet)
        {
            text: `${name1}'s garden bed is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. ${name2}'s is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'foot')} longer. How long is ${name2}'s garden bed?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s row of flowers is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. ${name2}'s row is ${smallNumber} ${getUnit(smallNumber, 'foot')} shorter. How long is ${name2}'s row of flowers?`,
            answer: mediumNumber - smallNumber
        },
        
        // Playground equipment (in feet)
        {
            text: `${name1}'s slide is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. ${name2}'s slide is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'foot')} longer. How long is ${name2}'s slide?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s monkey bars are ${largeNumber} ${getUnit(largeNumber, 'foot')} long. ${name2}'s are ${smallNumber} ${getUnit(smallNumber, 'foot')} shorter. How long are ${name2}'s monkey bars?`,
            answer: largeNumber - smallNumber
        },
        
        // Sports equipment (in inches)
        {
            text: `${name1}'s baseball bat is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. ${name2}'s bat is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'inch')} longer. How long is ${name2}'s bat?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s hockey stick is ${largeNumber} ${getUnit(largeNumber, 'inch')} long. ${name2}'s is ${smallNumber} ${getUnit(smallNumber, 'inch')} shorter. How long is ${name2}'s hockey stick?`,
            answer: largeNumber - smallNumber
        },
        
        // Art supplies (in inches)
        {
            text: `${name1}'s paintbrush is ${smallNumber} ${getUnit(smallNumber, 'inch')} long. ${name2}'s paintbrush is ${getValidSecondNumber(smallNumber)} ${getUnit(getValidSecondNumber(smallNumber), 'inch')} longer. How long is ${name2}'s paintbrush?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        {
            text: `${name1}'s canvas is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} wide. ${name2}'s canvas is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'inch')} wider. How wide is ${name2}'s canvas?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        
        // Building blocks (in inches)
        {
            text: `${name1}'s tower of blocks is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} tall. ${name2}'s tower is ${getValidSecondNumber(mediumNumber)} ${getUnit(getValidSecondNumber(mediumNumber), 'inch')} taller. How tall is ${name2}'s tower?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        }
    ];

    // Select a random problem type
    const selectedProblem = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    const answer = selectedProblem.answer;
    
    // Generate wrong answers that are close to the correct answer but still reasonable
    function generateUniqueWrongAnswer(correctAnswer, existingAnswers) {
        let attempt = 0;
        let wrongAnswer;
        do {
            // Increase the range of wrong answers if we're having trouble finding unique ones
            const range = attempt < 5 ? 5 : 10;
            const offset = Math.random() < 0.5 ? 
                Math.floor(Math.random() * range) + 1 : 
                -(Math.floor(Math.random() * range) + 1);
            wrongAnswer = correctAnswer + offset;
            attempt++;
        } while ((existingAnswers.includes(wrongAnswer) || wrongAnswer <= 0 || wrongAnswer > 100) && attempt < 20);

        return wrongAnswer;
    }

    // Generate three unique wrong answers
    const wrongAnswers = [];
    for (let i = 0; i < 3; i++) {
        const wrongAnswer = generateUniqueWrongAnswer(answer, [...wrongAnswers, answer]);
        if (wrongAnswer > 0 && wrongAnswer <= 100 && !wrongAnswers.includes(wrongAnswer) && wrongAnswer !== answer) {
            wrongAnswers.push(wrongAnswer);
        }
    }

    // If we couldn't generate enough unique wrong answers, fill in with more distant numbers
    while (wrongAnswers.length < 3) {
        const offset = wrongAnswers.length * 5 + 5;
        const wrongAnswer = answer + offset;
        if (wrongAnswer <= 100 && !wrongAnswers.includes(wrongAnswer) && wrongAnswer !== answer) {
            wrongAnswers.push(wrongAnswer);
        }
    }

    return {
        text: selectedProblem.text,
        answer: answer,
        options: shuffleArray([answer, ...wrongAnswers])
    };
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


// Event handlers
function handleOptionClick(option, index) {
    const selectedAnswer = currentProblem.options[index];
    const isCorrect = selectedAnswer === currentProblem.answer;

    const allOptions = optionsContainer.querySelectorAll('.option');
    if (isCorrect) {
        animationSystem.handleCorrectAnswer(option, allOptions, () => {
            // Auto-proceed to the next problem
            if (currentProblemIndex < totalProblems - 1) {
                currentProblemIndex++;
                displayProblem(); 
            } else {
                console.log("Reached end of problems.");
                // Optionally disable next button or handle end state
            }
        });
    } else {
        animationSystem.handleWrongAnswer(option);
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
setupScratchpad({ hideToggleWhenOpen: true });
displayProblem(); 
