import { animationSystem } from './animations.js';

let currentProblemData = null;
let problemHistory = []; // Array to store displayed problems
let currentHistoryIndex = -1; // Index of the currently viewed problem in history

// DOM Elements (get them once)
const problemTextElement = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-problem');
const nextButton = document.getElementById('next-problem');
const toggleScratchpadButton = document.getElementById('toggle-scratchpad');
const closeScratchpadButton = document.getElementById('close-scratchpad');
const clearScratchpadButton = document.getElementById('clear-btn');
const undoButton = document.getElementById('undo-btn');
const redoButton = document.getElementById('redo-btn');
const scratchpadContainer = document.getElementById('scratchpad-area');
const canvas = document.getElementById('scratchpad');
let scratchpad = null; // Initialize lazily

// --- New Scratchpad Class (Copied from customary-units-up-to-100.js) ---
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
        this.canvas.height = 500; // Set a fixed height or make it dynamic

        // Initial canvas setup
        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setCanvasSize() {
        // Preserve drawing content across resize
        let imageData = null;
        if (this.canvas.width > 0 && this.canvas.height > 0) {
             try {
                imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
             } catch(e) {
                 console.error("Could not get image data for resize:", e);
                 imageData = null;
             }
        }

        const rect = this.canvas.parentElement.getBoundingClientRect(); // Get parent bounds
        this.canvas.width = rect.width;
        // Keep the height consistent, e.g., 500px or adjust based on parent
        this.canvas.height = 500; // Match initialization or use dynamic value

        // Reset context properties after resize
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Restore the drawing if possible
        if (imageData) {
            try {
                this.ctx.putImageData(imageData, 0, 0);
            } catch(e) {
                 console.error("Could not put image data after resize:", e);
                 // If restoring fails, redraw from paths
                 this.redraw();
            }
        } else {
            this.redraw(); // Redraw if no image data was saved
        }
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing);
        this.canvas.addEventListener('mousemove', this.draw);
        this.canvas.addEventListener('mouseup', this.stopDrawing);
        this.canvas.addEventListener('mouseleave', this.stopDrawing);

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling/default touch actions
            const touch = e.touches[0];
            this.startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }, { passive: false }); // passive: false needed for preventDefault

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling/default touch actions
            const touch = e.touches[0];
            this.draw({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }, { passive: false }); // passive: false needed for preventDefault

        this.canvas.addEventListener('touchend', this.stopDrawing);
    }

    getPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        // Handle touch events
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const point = this.getPoint(e);
        this.currentPath = [point];
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.redoPaths = []; // Clear redo history on new path
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
            // No need to call redraw here, path is already drawn
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
// --- End Scratchpad Class ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

function generateProblem() {
    const isAddition = Math.random() < 0.5;
    let num1, num2, correctAnswer, questionText;
    const maxVal = 20;

    if (isAddition) {
        correctAnswer = Math.floor(Math.random() * (maxVal + 1)); // Result between 0 and 20
        num1 = Math.floor(Math.random() * (correctAnswer + 1)); // First number <= result
        num2 = correctAnswer - num1; // Second number ensures sum is correctAnswer
        questionText = `${num1} + ${num2} = ?`;
    } else { // Subtraction
        num1 = Math.floor(Math.random() * (maxVal + 1)); // First number between 0 and 20
        num2 = Math.floor(Math.random() * (num1 + 1)); // Second number <= first number (ensures non-negative result)
        correctAnswer = num1 - num2;
        questionText = `${num1} - ${num2} = ?`;
    }

    // Generate distractors
    const options = new Set([correctAnswer]);
    const maxAttemptsPerDistractor = 50; // Safety break for inner loop
    let primaryAttempts = 0;
    const maxPrimaryAttemptsTotal = 200; // Overall safety break for the whole loop

    while (options.size < 4 && primaryAttempts < maxPrimaryAttemptsTotal) {
        let distractor;
        let attempts = 0;
        do {
            const offset = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
            distractor = correctAnswer + offset;
            attempts++;
            primaryAttempts++;
        } while ((options.has(distractor) || distractor < 0 || distractor > maxVal || distractor === correctAnswer) && attempts < maxAttemptsPerDistractor && primaryAttempts < maxPrimaryAttemptsTotal);

        if (attempts < maxAttemptsPerDistractor) {
             options.add(distractor);
        } else {
            // Primary method failed, try more deterministic fallback offsets
            console.warn(`Primary distractor generation failed for answer ${correctAnswer}. Trying fallback offsets.`);
            const fallbackOffsets = [3, -3, 4, -4, 5, -5]; // Try these specific offsets
            let fallbackFound = false;
            for (const fbOffset of fallbackOffsets) {
                const fallbackDistractor = correctAnswer + fbOffset;
                if (fallbackDistractor >= 0 && fallbackDistractor <= maxVal && !options.has(fallbackDistractor)) {
                    options.add(fallbackDistractor);
                    fallbackFound = true;
                    console.log(`Added fallback distractor: ${fallbackDistractor}`);
                    break; // Found one, exit inner loop
                }
            }

            if (!fallbackFound) {
                 console.error(`Could not generate enough unique distractors for answer ${correctAnswer} even with fallback.`);
                 // If still stuck, fill with random valid numbers if possible
                 while(options.size < 4 && primaryAttempts < maxPrimaryAttemptsTotal) {
                    let randomFallback = Math.floor(Math.random() * (maxVal + 1));
                    primaryAttempts++;
                    if (!options.has(randomFallback)) {
                        options.add(randomFallback);
                        console.log(`Added random fallback fill: ${randomFallback}`);
                    } else if (primaryAttempts >= maxPrimaryAttemptsTotal) {
                        break; // Final safety break
                    }
                 }
                 break; // Exit the main while loop if fallbacks fail
            }
        }
    }

    if (primaryAttempts >= maxPrimaryAttemptsTotal) {
         console.error("Exceeded total attempts for generating distractors. Problem may be incomplete.");
    }

    return {
        questionText: questionText,
        options: shuffleArray(Array.from(options)),
        correctAnswer: correctAnswer
    };
}

// Function to display a problem from the history or a new one
function displayProblem(problemData) {
    currentProblemData = problemData;

    problemTextElement.textContent = currentProblemData.questionText;

    // Explicitly clear styles/classes from old options before removing them
    const oldOptions = optionsContainer.querySelectorAll('.option');
    oldOptions.forEach(option => {
        option.classList.remove('correct', 'wrong');
        option.style.transform = 'none'; // Remove inline transform if any
        option.disabled = false; // Re-enable just in case
    });

    optionsContainer.innerHTML = ''; // Clear previous options

    currentProblemData.options.forEach((optionValue) => {
        const button = document.createElement('button');
        button.textContent = optionValue;
        button.classList.add('option');
        // Pass the value directly to the handler
        button.addEventListener('click', () => handleOptionClick(button, optionValue));
        optionsContainer.appendChild(button);
    });

    // Update navigation button states
    prevButton.disabled = currentHistoryIndex <= 0;
    // Next button is always enabled (goes forward or generates new)
    nextButton.disabled = false;
}

// Function to load a specific problem from history
function loadProblemFromHistory(index) {
    if (index >= 0 && index < problemHistory.length) {
        currentHistoryIndex = index;
        displayProblem(problemHistory[currentHistoryIndex]);
    }
}

// Function to generate a new problem, add it to history, and display it
function generateAndShowNewProblem() {
    console.log("Generating new problem...");
    const newProblem = generateProblem();
    problemHistory.push(newProblem);
    currentHistoryIndex = problemHistory.length - 1;
    displayProblem(newProblem);
}

function handleOptionClick(optionElement, selectedValue) {
    const allOptions = optionsContainer.querySelectorAll('.option');
    // Disable all options immediately to prevent multiple clicks during animation
    allOptions.forEach(opt => opt.disabled = true);

    const isCorrect = selectedValue === currentProblemData.correctAnswer;

    if (isCorrect) {
        animationSystem.handleCorrectAnswer(optionElement, allOptions, () => {
            // Load next problem after correct animation
            generateAndShowNewProblem();
        });
    } else {
        animationSystem.handleWrongAnswer(optionElement);
        // Re-enable options after wrong answer animation (optional, or keep disabled until next/prev)
         setTimeout(() => {
             allOptions.forEach(opt => opt.disabled = false);
         }, 600); // Slightly longer than animation
    }
}

// Initialize Scratchpad instance lazily
function getScratchpadInstance() {
    if (!scratchpad && canvas) { // Ensure canvas exists
        scratchpad = new Scratchpad(canvas);
    }
    return scratchpad;
}

// Event Listeners Setup
function setupEventListeners() {
    // Options click handler
    optionsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            handleOptionClick(event.target, event.target.textContent);
        }
    });

    // Navigation buttons
    prevButton.addEventListener('click', () => {
        if (currentHistoryIndex > 0) {
            loadProblemFromHistory(currentHistoryIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        // If viewing history, clicking next moves forward in history
        if (currentHistoryIndex < problemHistory.length - 1) {
            loadProblemFromHistory(currentHistoryIndex + 1);
        } else {
            // If at the end of history or not viewing history, generate a new problem
            generateAndShowNewProblem();
        }
    });

    // Scratchpad Controls - Updated to match customary-units-up-to-100.js pattern
    toggleScratchpadButton.addEventListener('click', () => {
        scratchpadContainer.classList.add('open');
        toggleScratchpadButton.style.display = 'none'; // Hide toggle button
        // Initialize or show the scratchpad only when opened
        const sp = getScratchpadInstance();
        if (sp) {
            // Use requestAnimationFrame to ensure layout is calculated
             requestAnimationFrame(() => {
                 sp.initialize(); // Re-initialize or just set size/redraw
             });
        }
    });

    closeScratchpadButton.addEventListener('click', () => {
        scratchpadContainer.classList.remove('open');
        toggleScratchpadButton.style.display = 'block'; // Show toggle button
    });

    undoButton.addEventListener('click', () => {
        const sp = getScratchpadInstance();
        if (sp) sp.undo();
    });

    redoButton.addEventListener('click', () => {
        const sp = getScratchpadInstance();
        if (sp) sp.redo();
    });

    clearScratchpadButton.addEventListener('click', () => {
        const sp = getScratchpadInstance();
        if (sp) sp.clear();
    });
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    generateAndShowNewProblem(); // Load the first problem
    setupEventListeners(); // Set up all event listeners
    // Scratchpad is initialized lazily when opened
}); 