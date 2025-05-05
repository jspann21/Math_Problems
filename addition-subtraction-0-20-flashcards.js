// We can reuse the problem generation logic
// No need for animationSystem here unless we add feedback animations

let currentProblem = null;
let isVertical = false; // State for orientation

// DOM Elements
const problemTextElement = document.getElementById('problem-text');
const answerTextElement = document.getElementById('answer-text');
const flashcardElement = document.getElementById('flashcard');
const flashcardContainer = document.getElementById('flashcard-container'); // Need container for size change
const flipButton = document.getElementById('flip-btn');
const nextButton = document.getElementById('next-btn');
const orientationSwitch = document.getElementById('orientation-switch');
const horizontalLabel = document.querySelector('.toggle-label.horizontal');
const verticalLabel = document.querySelector('.toggle-label.vertical');
const sliderBg = document.querySelector('.slider-bg');

// --- Problem Generation (copied/adapted from addition-subtraction-0-20.js) ---
function generateProblem(vertical = false) { // Accept orientation flag
    const isAddition = Math.random() < 0.5;
    let num1, num2, correctAnswer, questionText;
    const maxVal = 20;

    let displayNum1, displayNum2; // Numbers specifically for display

    if (isAddition) {
        correctAnswer = Math.floor(Math.random() * (maxVal + 1)); // Result between 0 and 20
        num1 = Math.floor(Math.random() * (correctAnswer + 1)); // First number <= result
        num2 = correctAnswer - num1; // Second number ensures sum is correctAnswer

        // Ensure larger number is first for display
        if (num2 > num1) {
            displayNum1 = num2;
            displayNum2 = num1;
        } else {
            displayNum1 = num1;
            displayNum2 = num2;
        }

        if (vertical) {
            // Format for vertical display using HTML
            const num1Str = String(displayNum1).padStart(2, ' '); // Pad for alignment
            const num2Str = String(displayNum2).padStart(2, ' ');
            // Structure for better CSS control
            questionText = `<span class="num-line">&nbsp;&nbsp;${num1Str}</span>
                            <span class="num-line op">+ ${num2Str}</span>
                            <span class="op-line"></span>
                            <span class="num-line q-mark">&nbsp;&nbsp;?</span>`;
        } else {
            questionText = `${displayNum1} + ${displayNum2} = ?`;
        }
    } else { // Subtraction
        num1 = Math.floor(Math.random() * (maxVal + 1)); // First number between 0 and 20
        num2 = Math.floor(Math.random() * (num1 + 1)); // Second number <= first number (ensures non-negative result)
        correctAnswer = num1 - num2;

        // For subtraction, num1 is already >= num2, so use them directly
        displayNum1 = num1;
        displayNum2 = num2;

        if (vertical) {
             // Format for vertical display using HTML
            const num1Str = String(displayNum1).padStart(2, ' '); // Pad for alignment
            const num2Str = String(displayNum2).padStart(2, ' ');
            // Structure for better CSS control
            questionText = `<span class="num-line">&nbsp;&nbsp;${num1Str}</span>
                            <span class="num-line op">- ${num2Str}</span>
                            <span class="op-line"></span>
                            <span class="num-line q-mark">&nbsp;&nbsp;?</span>`;
        } else {
            questionText = `${displayNum1} - ${displayNum2} = ?`;
        }
    }

    return {
        questionText: questionText, // Can be HTML string now
        correctAnswer: correctAnswer // Use the original calculated answer
    };
}

// --- Flashcard Logic ---

// Loads new problem data and updates ONLY the front text
function loadNewProblemData() {
    currentProblem = generateProblem(isVertical); // Pass current orientation
    if (isVertical) {
        problemTextElement.innerHTML = currentProblem.questionText; // Use innerHTML for vertical format
        flashcardElement.classList.add('vertical');
        flashcardContainer.classList.add('vertical');
    } else {
        problemTextElement.textContent = currentProblem.questionText; // Use textContent for horizontal
        flashcardElement.classList.remove('vertical');
        flashcardContainer.classList.remove('vertical');
    }
    // Answer is updated in flipCard
}

// Handles flipping the card to show the answer
function flipCard() {
    // Update the answer text JUST BEFORE flipping
    if (currentProblem) {
        answerTextElement.textContent = currentProblem.correctAnswer;
        answerTextElement.style.visibility = 'visible'; // Ensure it's visible
    }
    flashcardElement.classList.add('is-flipped');
    flipButton.style.display = 'none';
    nextButton.style.display = 'inline-block';
}

// Handles going to the next card
function displayNextProblem() {
    // Hide the answer content immediately
    answerTextElement.style.visibility = 'hidden';

    // Start flip back animation
    flashcardElement.classList.remove('is-flipped');

    // Wait for the flip back animation to start visually before changing front content
    setTimeout(() => {
        loadNewProblemData(); // Load and display new problem data on the FRONT only

        // Reset button visibility
        flipButton.style.display = 'inline-block';
        nextButton.style.display = 'none';
    }, 100); // Shorter delay might be sufficient now
}

// Handle orientation toggle - UPDATED for new design
function handleOrientationChange() {
    isVertical = orientationSwitch.checked;
    
    // Update the visual state of the toggle
    if (isVertical) {
        horizontalLabel.classList.remove('active');
        verticalLabel.classList.add('active');
        sliderBg.classList.add('vertical');
    } else {
        horizontalLabel.classList.add('active');
        verticalLabel.classList.remove('active');
        sliderBg.classList.remove('vertical');
    }
    
    loadNewProblemData(); // Load a new problem in the new orientation

    // Reset card state regardless
    flashcardElement.classList.remove('is-flipped');
    answerTextElement.style.visibility = 'hidden';
    flipButton.style.display = 'inline-block';
    nextButton.style.display = 'none';
}

// --- Event Listeners ---
// Add click events on the labels for better UX
horizontalLabel.addEventListener('click', () => {
    if (orientationSwitch.checked) {
        orientationSwitch.checked = false;
        handleOrientationChange();
    }
});

verticalLabel.addEventListener('click', () => {
    if (!orientationSwitch.checked) {
        orientationSwitch.checked = true;
        handleOrientationChange();
    }
});

flipButton.addEventListener('click', flipCard);
nextButton.addEventListener('click', displayNextProblem);
orientationSwitch.addEventListener('change', handleOrientationChange);

// Add click listener to the flashcard itself
flashcardElement.addEventListener('click', () => {
    if (flashcardElement.classList.contains('is-flipped')) {
        // If card is flipped (showing answer), clicking goes to next
        displayNextProblem();
    } else {
        // If card is not flipped (showing question), clicking flips it
        flipCard();
    }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    isVertical = orientationSwitch.checked; // Check initial state
    // Update visual state to match initial checkbox state
    if (isVertical) {
        horizontalLabel.classList.remove('active');
        verticalLabel.classList.add('active');
        sliderBg.classList.add('vertical');
    }
    loadNewProblemData(); // Load the first problem's front data
    answerTextElement.style.visibility = 'hidden'; // Ensure answer starts hidden
    flipButton.style.display = 'inline-block';
    nextButton.style.display = 'none';
}); 