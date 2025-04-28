import { animationSystem } from './animations.js';

// Scratchpad functionality
class Scratchpad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.paths = [];
        this.redoPaths = [];
        this.currentPath = [];
        
        this.startDrawing = this.startDrawing.bind(this);
        this.draw = this.draw.bind(this);
        this.stopDrawing = this.stopDrawing.bind(this);
        this.setCanvasSize = this.setCanvasSize.bind(this);
        
        this.setupEventListeners();
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

// Removed DOM element getters, initialization, problem generation loop, handlers from global scope

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Moved initialization code inside DOMContentLoaded

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

    // Generate all problems at start
    for (let i = 0; i < totalProblems; i++) {
        problems.push(generateProblem());
    }

    // Initialize scratchpad
    const scratchpad = new Scratchpad(scratchpadCanvas);
    scratchpad.initialize(); // Initialize scratchpad dimensions and context

    // Scratchpad control handlers
    toggleScratchpadBtn.onclick = () => {
        scratchpadArea.classList.toggle('open');
        toggleScratchpadBtn.textContent = scratchpadArea.classList.contains('open') ? '❌ Close Scratchpad' : '📝 Open Scratchpad';
        if (scratchpadArea.classList.contains('open')) {
             scratchpad.setCanvasSize(); // Ensure canvas size is correct when opened
        }
    };

    closeScratchpadBtn.onclick = () => {
        scratchpadArea.classList.remove('open');
        toggleScratchpadBtn.textContent = '📝 Open Scratchpad';
    };

    undoBtn.onclick = () => scratchpad.undo();
    redoBtn.onclick = () => scratchpad.redo();
    clearBtn.onclick = () => scratchpad.clear();

    // Event handlers
    function handleOptionClick(option, index) {
        const selectedAnswer = parseInt(option.textContent);
        
        // Prevent clicking after answer
        if(option.disabled) return;

        if (selectedAnswer === currentProblem.answer) {
            animationSystem.handleCorrectAnswer(option, optionsContainer.getElementsByClassName('option'), () => {
                 // Don't auto-advance, let user click next
                // if (currentProblemIndex < totalProblems - 1) {
                //     currentProblemIndex++;
                //     displayProblem();
                // }
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