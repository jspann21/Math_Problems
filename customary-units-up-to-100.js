// Problem generator functions
function generateProblem() {
    // Names array to cycle through
    const names = ['Elizabeth', 'Matilda', 'Dylan', 'Joe', 'Andrew', 'James', 'Sarah', 'Austin', 
                  'Angela', 'Sydney', 'Ashley', 'Sadie', 'Adalyn', 'Michael', 'Emma', 'Noah', 
                  'Olivia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Micah', 
                  'Charlotte', 'Theodore', 'Amelia', 'Jack', 'Harper', 'Oliver'];

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
            text: `There are two trees in ${name1}'s backyard. One is ${mediumNumber} feet tall, and the pine tree is ${getValidSecondNumber(mediumNumber)} feet taller. How tall is the pine tree?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s rose bush is ${smallNumber} feet tall. ${name2}'s rose bush is ${getValidSecondNumber(smallNumber)} feet taller. How tall is ${name2}'s rose bush?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        
        // Indoor measurements (in feet)
        {
            text: `${name1} has a rug that is ${mediumNumber} feet long. ${name2}'s rug is ${getValidSecondNumber(mediumNumber)} feet longer. How long is ${name2}'s rug?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s hallway is ${largeNumber} feet long. ${name2}'s hallway is ${smallNumber} feet shorter. How long is ${name2}'s hallway?`,
            answer: largeNumber - smallNumber
        },
        
        // Playground measurements (in feet)
        {
            text: `${name1} drew a hopscotch court ${mediumNumber} feet long. ${name2} drew one ${smallNumber} feet shorter. How long is ${name2}'s hopscotch court?`,
            answer: mediumNumber - smallNumber
        },
        {
            text: `${name1}'s jump rope is ${largeNumber} feet long. ${name2}'s jump rope is ${smallNumber} feet shorter. How long is ${name2}'s jump rope?`,
            answer: largeNumber - smallNumber
        },
        
        // Toy measurements (in inches)
        {
            text: `At the toy store, ${name1} found a toy car ${mediumNumber} inches long. ${name2} found one that is ${getValidSecondNumber(mediumNumber)} inches longer. How long is ${name2}'s toy car?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s model airplane is ${largeNumber} inches long. ${name2}'s is ${smallNumber} inches shorter. How long is ${name2}'s model airplane?`,
            answer: largeNumber - smallNumber
        },
        
        // Yard measurements (in yards)
        {
            text: `${name1}'s garden is ${mediumNumber} yards long. ${name2}'s garden is ${getValidSecondNumber(mediumNumber)} yards longer. How long is ${name2}'s garden?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s driveway is ${largeNumber} yards long. ${name2}'s driveway is ${smallNumber} yards shorter. How long is ${name2}'s driveway?`,
            answer: largeNumber - smallNumber
        },
        
        // Sports field measurements (in yards)
        {
            text: `${name1} can throw a football ${mediumNumber} yards. ${name2} can throw it ${getValidSecondNumber(mediumNumber)} yards further. How far can ${name2} throw the football?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1} ran ${largeNumber} yards in practice. ${name2} ran ${smallNumber} yards less. How far did ${name2} run?`,
            answer: largeNumber - smallNumber
        },
        
        // Craft projects (in inches)
        {
            text: `${name1}'s paper chain is ${mediumNumber} inches long. ${name2}'s is ${getValidSecondNumber(mediumNumber)} inches longer. How long is ${name2}'s paper chain?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1} made a bookmark ${smallNumber} inches long. ${name2}'s bookmark is ${getValidSecondNumber(smallNumber)} inches longer. How long is ${name2}'s bookmark?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        
        // Building measurements (in feet)
        {
            text: `${name1}'s treehouse is ${mediumNumber} feet tall. ${name2}'s treehouse is ${getValidSecondNumber(mediumNumber)} feet taller. How tall is ${name2}'s treehouse?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s fence is ${largeNumber} feet long. ${name2}'s fence is ${smallNumber} feet shorter. How long is ${name2}'s fence?`,
            answer: largeNumber - smallNumber
        },
        
        // Ribbon and string measurements (in inches)
        {
            text: `${name1} needs ${mediumNumber} inches of ribbon. ${name2} needs ${getValidSecondNumber(mediumNumber)} inches more. How many inches of ribbon does ${name2} need?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1} has ${mediumNumber} inches of string. ${name2} has ${smallNumber} inches less. How many inches of string does ${name2} have?`,
            answer: mediumNumber - smallNumber
        },
        
        // Path and trail measurements (in yards)
        {
            text: `${name1}'s walking path is ${mediumNumber} yards long. ${name2}'s is ${getValidSecondNumber(mediumNumber)} yards longer. How long is ${name2}'s path?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s nature trail is ${largeNumber} yards long. ${name2}'s trail is ${smallNumber} yards shorter. How long is ${name2}'s trail?`,
            answer: largeNumber - smallNumber
        },
        
        // School supplies (in inches)
        {
            text: `${name1}'s ruler is ${smallNumber} inches long. ${name2}'s ruler is ${getValidSecondNumber(smallNumber)} inches longer. How long is ${name2}'s ruler?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        {
            text: `${name1}'s pencil box is ${mediumNumber} inches long. ${name2}'s is ${smallNumber} inches shorter. How long is ${name2}'s pencil box?`,
            answer: mediumNumber - smallNumber
        },
        
        // Garden features (in feet)
        {
            text: `${name1}'s garden bed is ${mediumNumber} feet long. ${name2}'s is ${getValidSecondNumber(mediumNumber)} feet longer. How long is ${name2}'s garden bed?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s row of flowers is ${mediumNumber} feet long. ${name2}'s row is ${smallNumber} feet shorter. How long is ${name2}'s row of flowers?`,
            answer: mediumNumber - smallNumber
        },
        
        // Playground equipment (in feet)
        {
            text: `${name1}'s slide is ${mediumNumber} feet long. ${name2}'s slide is ${getValidSecondNumber(mediumNumber)} feet longer. How long is ${name2}'s slide?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s monkey bars are ${largeNumber} feet long. ${name2}'s are ${smallNumber} feet shorter. How long are ${name2}'s monkey bars?`,
            answer: largeNumber - smallNumber
        },
        
        // Sports equipment (in inches)
        {
            text: `${name1}'s baseball bat is ${mediumNumber} inches long. ${name2}'s bat is ${getValidSecondNumber(mediumNumber)} inches longer. How long is ${name2}'s bat?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        {
            text: `${name1}'s hockey stick is ${largeNumber} inches long. ${name2}'s is ${smallNumber} inches shorter. How long is ${name2}'s hockey stick?`,
            answer: largeNumber - smallNumber
        },
        
        // Art supplies (in inches)
        {
            text: `${name1}'s paintbrush is ${smallNumber} inches long. ${name2}'s paintbrush is ${getValidSecondNumber(smallNumber)} inches longer. How long is ${name2}'s paintbrush?`,
            answer: smallNumber + getValidSecondNumber(smallNumber)
        },
        {
            text: `${name1}'s canvas is ${mediumNumber} inches wide. ${name2}'s canvas is ${getValidSecondNumber(mediumNumber)} inches wider. How wide is ${name2}'s canvas?`,
            answer: mediumNumber + getValidSecondNumber(mediumNumber)
        },
        
        // Building blocks (in inches)
        {
            text: `${name1}'s tower of blocks is ${mediumNumber} inches tall. ${name2}'s tower is ${getValidSecondNumber(mediumNumber)} inches taller. How tall is ${name2}'s tower?`,
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

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    star.style.left = Math.random() * window.innerWidth + 'px';
    star.style.fontSize = `${Math.random() * 20 + 20}px`; // Random size between 20-40px
    star.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`; // Random duration between 0.5-2s
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
        option.classList.add('correct');
        
        // Create and animate stars
        for (let i = 0; i < 15; i++) {
            const star = createStar();
            starsContainer.appendChild(star);
            setTimeout(() => star.remove(), 2000);
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