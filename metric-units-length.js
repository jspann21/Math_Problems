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

const problems = [
    {
        question: "Which is a better estimate for the length of a fork?",
        options: ["15 millimeters", "15 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a person?",
        options: ["170 centimeters", "170 meters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the length of a farm?",
        options: ["5 kilometers", "5 meters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the length of a bus?",
        options: ["10 meters", "10 centimeters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the length of a pencil?",
        options: ["15 centimeters", "15 meters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the height of a tree?",
        options: ["20 millimeters", "20 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a paperclip?",
        options: ["3 kilometers", "3 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the width of a smartphone?",
        options: ["7 centimeters", "7 meters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the length of a football field?",
        options: ["100 meters", "100 centimeters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the height of a door?",
        options: ["2 kilometers", "2 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of an ant?",
        options: ["5 millimeters", "5 meters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the distance between two cities?",
        options: ["50 meters", "50 kilometers"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a key?",
        options: ["7 kilometers", "7 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a lamp post?",
        options: ["5 meters", "5 millimeters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the width of a credit card?",
        options: ["85 meters", "85 millimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a swimming pool?",
        options: ["25 meters", "25 millimeters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the thickness of a coin?",
        options: ["2 meters", "2 millimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a refrigerator?",
        options: ["170 centimeters", "170 kilometers"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the length of a hiking trail?",
        options: ["5 centimeters", "5 kilometers"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the width of a television screen?",
        options: ["120 kilometers", "120 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a staple?",
        options: ["10 millimeters", "10 meters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the height of a skyscraper?",
        options: ["300 centimeters", "300 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the width of a finger?",
        options: ["2 centimeters", "2 kilometers"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the length of a car?",
        options: ["4 millimeters", "4 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the width of a road?",
        options: ["10 millimeters", "10 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a paper clip?",
        options: ["3 meters", "3 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a coffee cup?",
        options: ["12 kilometers", "12 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a marathon?",
        options: ["42 kilometers", "42 meters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the width of a postage stamp?",
        options: ["2 meters", "2 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a fence?",
        options: ["2 millimeters", "2 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a tennis court?",
        options: ["24 meters", "24 millimeters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the width of a book page?",
        options: ["15 kilometers", "15 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a kitchen counter?",
        options: ["90 meters", "90 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a bicycle?",
        options: ["180 centimeters", "180 kilometers"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the width of a sidewalk?",
        options: ["2 millimeters", "2 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a stop sign?",
        options: ["2 kilometers", "2 meters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the length of a phone charger cable?",
        options: ["1 kilometer", "1 meter"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the width of a laptop screen?",
        options: ["35 meters", "35 centimeters"],
        correct: 1
    },
    {
        question: "Which is a better estimate for the height of a dining table?",
        options: ["75 centimeters", "75 kilometers"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the length of an airplane?",
        options: ["40 meters", "40 millimeters"],
        correct: 0
    },
    {
        question: "Which is a better estimate for the width of a door?",
        options: ["80 kilometers", "80 centimeters"],
        correct: 1
    }
];

let currentProblem = 0;

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
    const problem = problems[currentProblem];
    
    if (index === problem.correct) {
        animationSystem.handleCorrectAnswer(option, optionsContainer.getElementsByClassName('option'), () => {
            if (currentProblem < problems.length - 1) {
                currentProblem++;
                displayProblem();
            }
        });
    } else {
        animationSystem.handleWrongAnswer(option);
    }
}

function displayProblem() {
    const problem = problems[currentProblem];
    problemText.textContent = problem.question;
    
    const options = optionsContainer.getElementsByClassName('option');
    Array.from(options).forEach((option, index) => {
        option.textContent = problem.options[index];
        option.className = 'option';
        option.disabled = false;
        option.onclick = () => handleOptionClick(option, index);
    });

    // Update navigation buttons
    prevButton.disabled = currentProblem === 0;
    nextButton.disabled = currentProblem === problems.length - 1;
}

// Navigation handlers
prevButton.onclick = () => {
    if (currentProblem > 0) {
        currentProblem--;
        displayProblem();
    }
};

nextButton.onclick = () => {
    if (currentProblem < problems.length - 1) {
        currentProblem++;
        displayProblem();
    }
};

// Initialize
shuffleArray(problems);
displayProblem(); 