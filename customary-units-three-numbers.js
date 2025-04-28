import { animationSystem } from './animations.js';

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
        // Original problems with adjusted measurements
        {
            text: `There are three trees in the garden. The smallest tree is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} tall. The middle tree is ${smallNumber} ${getUnit(smallNumber, 'foot')} taller. If the tallest tree is ${smallNumber} ${getUnit(smallNumber, 'foot')} taller than the middle tree, how tall is the tallest tree?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `A garden path has three sections. The first section is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. The second section is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the first. The third section is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the second. How long is the third section?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `Three friends measured their heights. ${name1} is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} tall. ${name2} is ${smallNumber} ${getUnit(smallNumber, 'inch')} taller. Charlie is ${smallNumber} ${getUnit(smallNumber, 'inch')} taller than ${name2}. How tall is Charlie?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `A race track has three laps. The first lap is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. The second lap is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the first. The final lap is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the second. How long is the final lap?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `A red ribbon is ${smallNumber} ${getUnit(smallNumber, 'inch')} long. A blue ribbon is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the red ribbon. If a yellow ribbon is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the blue ribbon, how long is the yellow ribbon?`,
            answer: smallNumber + smallNumber + smallNumber
        },
        
        // New problems with realistic measurements
        // Classroom items (inches)
        {
            text: `${name1} is measuring three pencils. The first pencil is ${smallNumber} ${getUnit(smallNumber, 'inch')} long. The second pencil is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the first. The third pencil is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the second. How long is the third pencil?`,
            answer: smallNumber + smallNumber + smallNumber
        },
        {
            text: `Three rulers are lined up. The first ruler is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. The second ruler is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The third ruler is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the second. How long is the third ruler?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Sports equipment (inches)
        {
            text: `${name1} has three different baseball bats. The shortest bat is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. The medium bat is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The longest bat is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the medium bat. How long is the longest bat?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `Three tennis rackets are displayed at the store. The junior racket is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. The intermediate racket is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The adult racket is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the intermediate. How long is the adult racket?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Garden measurements (feet)
        {
            text: `${name1} is planting three rows of flowers. The first row is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The second row is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The third row is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the second. How long is the third row?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `Three garden hoses are connected. The first hose is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The second hose is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The third hose is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the second. What is the length of the third hose?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Playground equipment (feet)
        {
            text: `The playground has three slides. The small slide is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The medium slide is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The big slide is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the medium slide. How long is the big slide?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `Three balance beams are set up. The low beam is ${smallNumber} ${getUnit(smallNumber, 'foot')} high. The middle beam is ${smallNumber} ${getUnit(smallNumber, 'foot')} higher. The high beam is ${smallNumber} ${getUnit(smallNumber, 'foot')} higher than the middle beam. How high is the high beam?`,
            answer: smallNumber + smallNumber + smallNumber
        },
        
        // Building features (feet)
        {
            text: `A house has three different walls. The shortest wall is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The middle wall is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The longest wall is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the middle wall. How long is the longest wall?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `Three fences are being built. The first fence is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The second fence is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The third fence is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the second. How long is the third fence?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Sports fields (yards)
        {
            text: `Three football fields are marked. The practice field is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. The junior field is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer. The main field is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the junior field. How long is the main field?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `${name1} runs three different tracks. The indoor track is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. The outdoor track is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer. The competition track is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the outdoor track. How long is the competition track?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Craft materials (inches)
        {
            text: `${name1} needs three pieces of string. The first piece is ${smallNumber} ${getUnit(smallNumber, 'inch')} long. The second piece needs to be ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The third piece needs to be ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the second. How long should the third piece be?`,
            answer: smallNumber + smallNumber + smallNumber
        },
        {
            text: `Three pieces of paper are cut. The first is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} wide. The second is ${smallNumber} ${getUnit(smallNumber, 'inch')} wider. The third is ${smallNumber} ${getUnit(smallNumber, 'inch')} wider than the second. How wide is the third piece?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Vehicle measurements (feet)
        {
            text: `Three parking spaces are marked. The compact space is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The standard space is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The large vehicle space is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the standard space. How long is the large vehicle space?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `Three boats are docked. The small boat needs ${mediumNumber} ${getUnit(mediumNumber, 'foot')} of space. The medium boat needs ${smallNumber} ${getUnit(smallNumber, 'foot')} more space. The large boat needs ${smallNumber} ${getUnit(smallNumber, 'foot')} more space than the medium boat. How much space does the large boat need?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Home furnishings (inches)
        {
            text: `${name1} is comparing three tables. The coffee table is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} tall. The end table is ${smallNumber} ${getUnit(smallNumber, 'inch')} taller. The dining table is ${smallNumber} ${getUnit(smallNumber, 'inch')} taller than the end table. How tall is the dining table?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `Three curtains are hung. The kitchen curtain is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. The living room curtain is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The dining room curtain is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the living room curtain. How long is the dining room curtain?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Construction materials (feet)
        {
            text: `Three lumber boards are cut. The first board is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The second board is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The third board is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the second. How long is the third board?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `${name1} needs three pipes. The shortest pipe is ${mediumNumber} ${getUnit(mediumNumber, 'foot')} long. The medium pipe is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer. The longest pipe is ${smallNumber} ${getUnit(smallNumber, 'foot')} longer than the medium pipe. How long is the longest pipe?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Fabric and sewing (inches)
        {
            text: `Three ribbons are needed for a project. The short ribbon is ${smallNumber} ${getUnit(smallNumber, 'inch')} long. The medium ribbon is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The long ribbon is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the medium ribbon. How long is the long ribbon?`,
            answer: smallNumber + smallNumber + smallNumber
        },
        {
            text: `${name1} is cutting three strips of fabric. The first strip is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. The second strip is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The third strip is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the second. How long is the third strip?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Outdoor spaces (yards)
        {
            text: `Three hiking trails are marked. The beginner trail is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. The intermediate trail is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer. The advanced trail is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the intermediate trail. How long is the advanced trail?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `${name1}'s yard has three sections. The front yard is ${mediumNumber} ${getUnit(mediumNumber, 'yard')} long. The side yard is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer. The back yard is ${smallNumber} ${getUnit(smallNumber, 'yard')} longer than the side yard. How long is the back yard?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        
        // Pet equipment (inches)
        {
            text: `Three dog leashes are compared. The short leash is ${mediumNumber} ${getUnit(mediumNumber, 'inch')} long. The medium leash is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer. The long leash is ${smallNumber} ${getUnit(smallNumber, 'inch')} longer than the medium leash. How long is the long leash?`,
            answer: mediumNumber + smallNumber + smallNumber
        },
        {
            text: `${name1} has three pet beds. The cat bed is ${smallNumber} ${getUnit(smallNumber, 'inch')} wide. The small dog bed is ${smallNumber} ${getUnit(smallNumber, 'inch')} wider. The large dog bed is ${smallNumber} ${getUnit(smallNumber, 'inch')} wider than the small dog bed. How wide is the large dog bed?`,
            answer: smallNumber + smallNumber + smallNumber
        }
    ];

    const selectedProblem = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    const answer = selectedProblem.answer;
    
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
        text: selectedProblem.text,
        answer: answer,
        options: shuffleArray([answer, ...wrongAnswers])
    };
}

// Scratchpad functionality
class Scratchpad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.paths = [];
        this.redoPaths = [];
        this.currentPath = [];
        
        // Bind methods to this
        this.startDrawing = this.startDrawing.bind(this);
        this.draw = this.draw.bind(this);
        this.stopDrawing = this.stopDrawing.bind(this);
        this.setCanvasSize = this.setCanvasSize.bind(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', this.setCanvasSize);
    }

    initialize() {
        // Set canvas size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 500;
        
        // Initial canvas setup
        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 500;
        
        // Reset context properties after resize
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.redraw();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing);
        this.canvas.addEventListener('mousemove', this.draw);
        this.canvas.addEventListener('mouseup', this.stopDrawing);
        this.canvas.addEventListener('mouseleave', this.stopDrawing);

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });

        this.canvas.addEventListener('touchend', this.stopDrawing);
    }

    getPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const point = this.getPoint(e);
        this.currentPath = [point];
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const point = this.getPoint(e);
        this.currentPath.push(point);
        
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentPath.length > 1) {
            this.paths.push([...this.currentPath]);
            this.redoPaths = [];
        }
        this.currentPath = [];
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset context properties
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        const drawPath = (path) => {
            if (path.length < 2) return;
            
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            
            this.ctx.stroke();
        };

        // Draw all completed paths
        this.paths.forEach(drawPath);
    }

    undo() {
        if (this.paths.length > 0) {
            this.redoPaths.push(this.paths.pop());
            this.redraw();
        }
    }

    redo() {
        if (this.redoPaths.length > 0) {
            this.paths.push(this.redoPaths.pop());
            this.redraw();
        }
    }

    clear() {
        this.paths = [];
        this.redoPaths = [];
        this.currentPath = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Utility functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

// Scratchpad elements
const scratchpadArea = document.getElementById('scratchpad-area');
const scratchpadCanvas = document.getElementById('scratchpad');
const toggleScratchpadBtn = document.getElementById('toggle-scratchpad');
const closeScratchpadBtn = document.getElementById('close-scratchpad');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const clearBtn = document.getElementById('clear-btn');

// Initialize scratchpad
const scratchpad = new Scratchpad(scratchpadCanvas);

// Scratchpad control handlers
toggleScratchpadBtn.onclick = () => {
    scratchpadArea.classList.add('open');
    toggleScratchpadBtn.style.display = 'none';
    // Initialize the scratchpad after the element is visible
    requestAnimationFrame(() => {
        scratchpad.initialize();
    });
};

closeScratchpadBtn.onclick = () => {
    scratchpadArea.classList.remove('open');
    toggleScratchpadBtn.style.display = 'block';
};

undoBtn.onclick = () => scratchpad.undo();
redoBtn.onclick = () => scratchpad.redo();
clearBtn.onclick = () => scratchpad.clear();

// Event handlers
function handleOptionClick(option, index) {
    const selectedAnswer = parseInt(option.textContent);
    
    if (selectedAnswer === currentProblem.answer) {
        animationSystem.handleCorrectAnswer(option, optionsContainer.getElementsByClassName('option'), () => {
            if (currentProblemIndex < totalProblems - 1) {
                currentProblemIndex++;
                displayProblem();
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
displayProblem(); 