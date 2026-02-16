import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

// Global state
let currentProblemData = null;
let problemHistory = []; // Array to store displayed problems
let currentHistoryIndex = -1; // Index of the currently viewed problem in history

// DOM Elements (get them once)
const problemTextElement = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

// --- Problem Generation --- 

// Data for True/False problems
const trueFalseProblems = [
    { statement: "35 minutes after 1:00 is 1:35.", answer: true },
    { statement: "The sun sets at 7:10 a.m. in the morning.", answer: false },
    { statement: "2 hours before 1 p.m. is 11 a.m.", answer: true }, // Corrected from checklist example (11pm was wrong)
    { statement: "15 minutes to 11:00 a.m. is 10:45 a.m.", answer: true },
    { statement: "30 minutes after midnight (12:00 a.m.) is 12:30 a.m.", answer: true }, // Clarified midnight
    { statement: "There are 60 seconds in a minute.", answer: true },
    { statement: "There are 50 minutes in an hour.", answer: false },
    { statement: "1 hour after 11:30 a.m. is 12:30 p.m.", answer: true },
    { statement: "Half past 2 is 2:15.", answer: false },
    { statement: "Quarter to 5 is 4:45.", answer: true },
    { statement: "A day has 25 hours.", answer: false },
    { statement: "Noon is 12:00 p.m.", answer: true },
    { statement: "Midnight is 12:00 p.m.", answer: false }, // Midnight is 12:00 a.m.
];

function generateTrueFalseProblem() {
    const problem = trueFalseProblems[Math.floor(Math.random() * trueFalseProblems.length)];
    return {
        type: 'trueFalse',
        questionText: problem.statement,
        options: ["True", "False"],
        correctAnswer: problem.answer // Storing the boolean directly
    };
}

// Data for AM/PM problems
const amPmProblems = [
    { question: "Owen goes for his morning jog at 6:00 ____.", answer: "a.m." },
    { question: "It began to rain heavily at 12:40 ____ in the afternoon.", answer: "p.m." },
    { question: "The school campfire will start at 7:45 ____.", answer: "p.m." }, // Assuming evening
    { question: "Arya's birthday party will start at 3:15 ____ in the afternoon.", answer: "p.m." },
    { question: "The restaurant closes at 10:30 ____ at night.", answer: "p.m." },
    { question: "The basketball match will start at 9:00 ____ in the morning.", answer: "a.m." },
    { question: "Mr. Hill took a nap at 3:20 ____ in the afternoon.", answer: "p.m." },
    { question: "Julie cycles to a park at 11:40 ____ before noon.", answer: "a.m." },
    { question: "School starts at 8:00 ____.", answer: "a.m." },
    { question: "We eat dinner at 6:30 ____.", answer: "p.m." },
    { question: "The movie ends at 11:00 ____ at night.", answer: "p.m." },
    { question: "Sunrise is around 5:45 ____.", answer: "a.m." }
];

function generateAmPmProblem() {
    const problem = amPmProblems[Math.floor(Math.random() * amPmProblems.length)];
    return {
        type: 'amPm',
        questionText: problem.question,
        options: ["a.m.", "p.m."],
        correctAnswer: problem.answer
    };
}

function generateClockDrawProblem() {
    const hour = Math.floor(Math.random() * 12) + 1; // 1-12
    const minute = Math.floor(Math.random() * 12) * 5; // 0, 5, 10... 55

    const targetTime = `${hour}:${minute.toString().padStart(2, '0')}`;
    const correctMinutePosition = minute === 0 ? 12 : minute / 5; // Map minutes (0-55) to clock number (1-12)

    return {
        type: 'clockDraw',
        questionText: `Draw the minute hand for ${targetTime}. Click the correct number for the minute hand.`, 
        hour: hour,
        minute: minute,
        correctAnswer: correctMinutePosition // The clock number (1-12) the minute hand should point to
    };
}

// TODO: Add other generator functions (generateAmPmProblem, etc.)

function generateTimeCalcProblem() {
    const startHour = Math.floor(Math.random() * 12) + 1; // 1-12
    const startMinute = Math.floor(Math.random() * 12) * 5; // 0, 5, ..., 55
    const startTimeStr = formatTime(startHour, startMinute);

    // Randomly choose operation type and duration
    const operationTypes = ["later", "before"];
    const operation = operationTypes[Math.floor(Math.random() * operationTypes.length)];
    
    let durationMinutes;
    let durationText;
    const durationChoice = Math.random();

    if (durationChoice < 0.6) { // More likely minute changes
        const commonMinutes = [10, 15, 20, 25, 30, 40, 45, 50];
        durationMinutes = commonMinutes[Math.floor(Math.random() * commonMinutes.length)];
        durationText = `${durationMinutes} minutes`;
    } else { // Hour changes
        const hours = [1, 2];
        const hourDuration = hours[Math.floor(Math.random() * hours.length)];
        durationMinutes = hourDuration * 60;
        durationText = `${hourDuration} hour${hourDuration > 1 ? 's' : ''}`;
    }

    // Adjust sign for 'before'
    const minutesToAdd = operation === "later" ? durationMinutes : -durationMinutes;

    // Calculate correct answer
    const { hour: correctHour, minute: correctMinute } = calculateNewTime(startHour, startMinute, minutesToAdd);
    const correctAnswerStr = formatTime(correctHour, correctMinute);

    // Generate options
    let options = generateTimeOptions(correctHour, correctMinute, 3); // Generate 3 wrong answers + 1 correct
    options = shuffleArray(options);

    const questionText = `What will the time be ${durationText} ${operation} ${startTimeStr}?`;

    return {
        type: 'timeCalc',
        questionText: questionText,
        startHour: startHour,
        startMinute: startMinute,
        options: options,
        correctAnswer: correctAnswerStr
    };
}

const problemGenerators = [
    generateClockDrawProblem,
    generateAmPmProblem,
    generateTimeCalcProblem, // Add the new generator
    generateTrueFalseProblem // Add the missing generator
];

function generateProblem() {
    // Randomly select a generator function
    const randomIndex = Math.floor(Math.random() * problemGenerators.length);
    const generator = problemGenerators[randomIndex];
    console.log(`Generating problem using: ${generator.name}`);
    return generator(); // Call the selected generator function
}

// --- Display Logic --- 

function displayClock(hour, minute) {
    optionsContainer.innerHTML = ''; // Clear previous options/clock
    optionsContainer.classList.remove('options'); // Remove grid layout if present
    optionsContainer.classList.add('clock-container'); // Add clock specific styling

    const clockDiv = document.createElement('div');
    clockDiv.className = 'analog-clock';

    const faceDiv = document.createElement('div');
    faceDiv.className = 'clock-face';

    const centerDiv = document.createElement('div');
    centerDiv.className = 'clock-center';
    faceDiv.appendChild(centerDiv);

    // Add hour hand
    const hourHand = document.createElement('div');
    hourHand.className = 'clock-hand hour-hand';
    const hourAngle = (hour % 12 + minute / 60) * 30; // 360/12 = 30 degrees per hour
    hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
    faceDiv.appendChild(hourHand);
    
    // Add numbers and attach listeners
    const clockNumbers = [];
    for (let i = 1; i <= 12; i++) {
        const angle = i * 30 * (Math.PI / 180); // Convert degrees to radians
        const numberDiv = document.createElement('div');
        numberDiv.className = 'clock-number';
        numberDiv.textContent = i;
        const radius = 105; // Slightly less than half the clock width (250/2 - padding/number size)
        const x = radius * Math.sin(angle);
        const y = -radius * Math.cos(angle);
        numberDiv.style.left = `calc(50% + ${x}px - 15px)`; // Center the number div (width 30px)
        numberDiv.style.top = `calc(50% + ${y}px - 15px)`; // Center the number div (height 30px)

        numberDiv.dataset.number = i; // Store the number value
        numberDiv.onclick = () => handleClockNumberClick(numberDiv, i);
        faceDiv.appendChild(numberDiv);
        clockNumbers.push(numberDiv);
    }
    
    currentProblemData.clockNumberElements = clockNumbers; // Store references for animation

    clockDiv.appendChild(faceDiv);
    optionsContainer.appendChild(clockDiv);
}

// Modified displayProblem to take problem data as input
function displayProblem(problemData) {
    currentProblemData = problemData; // Set the global reference for answer handlers
    console.log("Displaying problem from history:", currentProblemData);

    // Clear previous problem content
    problemTextElement.innerHTML = ''; 
    optionsContainer.innerHTML = ''; 
    optionsContainer.classList.remove('clock-container');
    optionsContainer.classList.add('options'); // Default to grid layout

    problemTextElement.textContent = currentProblemData.questionText;

    // Type-specific display logic
    if (currentProblemData.type === 'clockDraw') {
        displayClock(currentProblemData.hour, currentProblemData.minute);
    } else if (currentProblemData.type === 'amPm' || currentProblemData.type === 'timeCalc' || currentProblemData.type === 'trueFalse') {
        // Common logic for button-based options
        currentProblemData.options.forEach((optionText) => {
            const optionButton = document.createElement('button');
            optionButton.classList.add('option');
            optionButton.textContent = optionText;
            optionButton.onclick = () => handleSimpleOptionClick(optionButton);
            optionsContainer.appendChild(optionButton);
        });
    } else {
        // Fallback for unknown types (shouldn't happen)
        console.error("Unknown problem type:", currentProblemData.type);
    }

    // Update navigation button states
    prevBtn.disabled = currentHistoryIndex <= 0;
    nextBtn.disabled = false; // Next is always enabled (either goes forward in history or generates new)
}

// --- Answer Handling ---

function handleClockNumberClick(selectedNumberElement, clickedNumber) {
    console.log("Clock number clicked:", clickedNumber);

    // Prevent multiple clicks after an answer
    if (selectedNumberElement.classList.contains('correct') || selectedNumberElement.classList.contains('wrong')) {
        return;
    }

    const isCorrect = clickedNumber === currentProblemData.correctAnswer;
    
    if (isCorrect) {
        // Use the animationSystem, passing the clicked number and all number elements
        animationSystem.handleCorrectAnswer(selectedNumberElement, currentProblemData.clockNumberElements, () => {
             // Make the actual minute hand appear after correct answer
             const minuteHand = document.createElement('div');
             minuteHand.className = 'clock-hand minute-hand';
             const minuteAngle = currentProblemData.minute * 6; // 360/60 = 6 degrees per minute
             minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
             
             const clockFace = optionsContainer.querySelector('.clock-face');
             if(clockFace) clockFace.appendChild(minuteHand);
             
             // Automatically load the next problem
             generateAndShowNewProblem();
        });
    } else {
        // Use handleWrongAnswer, just passing the clicked number element
        animationSystem.handleWrongAnswer(selectedNumberElement);
        // We can just add the class directly too, as animationSystem does
        selectedNumberElement.classList.add('wrong');
        setTimeout(() => selectedNumberElement.classList.remove('wrong'), 500);
    }
}

// Generic handler for problems using standard option buttons
function handleSimpleOptionClick(selectedOption) {
     console.log("Simple option clicked:", selectedOption.textContent);

    // Prevent multiple clicks
    if (selectedOption.disabled) return;

    // Find the correct answer based on the current problem data
    const correctAnswer = currentProblemData.correctAnswer;
    let isCorrect;

    // Adjust check for True/False type where correctAnswer is boolean
    if (currentProblemData.type === 'trueFalse') {
        const selectedAnswer = selectedOption.textContent === "True";
        isCorrect = selectedAnswer === correctAnswer;
    } else {
        // Standard check for other types where correctAnswer is a string
        isCorrect = selectedOption.textContent === correctAnswer;
    }

    // Disable all buttons in the container
    // Ensure we select the right elements depending on the problem type
    const elementsToDisable = optionsContainer.querySelectorAll('.option, .clock-number'); 

    if (isCorrect) {
        animationSystem.handleCorrectAnswer(selectedOption, elementsToDisable, () => {
            // Automatically load the next problem
            generateAndShowNewProblem(); 
        });
    } else {
        animationSystem.handleWrongAnswer(selectedOption);
    }
}

// Remove or repurpose the generic handleOptionClick if not needed for other types yet
// function handleOptionClick(selectedOption, index) { ... }

// Function to load a specific problem from history
function loadProblemFromHistory(index) {
    if (index >= 0 && index < problemHistory.length) {
        currentHistoryIndex = index;
        displayProblem(problemHistory[currentHistoryIndex]);
    }
}

// Function to generate a new problem, add it to history, and display it
function generateAndShowNewProblem() {
    const newProblem = generateProblem();
    problemHistory.push(newProblem);
    currentHistoryIndex = problemHistory.length - 1;
    displayProblem(newProblem);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded for Time Problems");
    setupScratchpad();
    // displayProblem(); // Don't call the old displayProblem
    generateAndShowNewProblem(); // Load the first problem

    // Updated Next Button Logic
    nextBtn.addEventListener('click', () => {
        if (currentHistoryIndex < problemHistory.length - 1) {
            // If not at the end of history, move forward
            loadProblemFromHistory(currentHistoryIndex + 1);
        } else {
            // If at the end, generate a new problem
            generateAndShowNewProblem();
        }
    });

    // Updated Previous Button Logic
    prevBtn.addEventListener('click', () => {
        if (currentHistoryIndex > 0) {
            loadProblemFromHistory(currentHistoryIndex - 1);
        }
    });
}); 

// --- Helper Functions ---
// Formats hour (1-12) and minute (0-59) into HH:MM string
function formatTime(hour, minute) {
    // Basic formatting for now, might need AM/PM later
    return `${hour}:${minute.toString().padStart(2, '0')}`;
}

// Adds or subtracts minutes from a given time, handling rollovers
function calculateNewTime(hour, minute, minutesToAdd) {
    // Convert the initial 1-12 hour to 0-11 for easier calculation
    let hour24 = (hour === 12) ? 0 : hour; 

    let totalMinutes = hour24 * 60 + minute + minutesToAdd;
    
    // Keep total minutes within a 24-hour cycle (1440 minutes) but centered around a base day
    // This handles negative minutes correctly by ensuring the modulo result is positive
    totalMinutes = (totalMinutes % 1440 + 1440) % 1440; 

    let newHour24 = Math.floor(totalMinutes / 60);
    let newMinute = totalMinutes % 60;

    // Convert back to 1-12 hour format for display
    let displayHour = newHour24 % 12;
    if (displayHour === 0) { // Handle midnight/noon case (0 hour in 24-format is 12 in 12-format)
        displayHour = 12;
    }

    return { hour: displayHour, minute: newMinute };
}

// Generates plausible wrong time options around the correct answer
function generateTimeOptions(correctHour, correctMinute, count = 3) {
    const options = new Set();
    const correctTimeStr = formatTime(correctHour, correctMinute);
    options.add(correctTimeStr);

    const variations = [-30, -15, -10, -5, 5, 10, 15, 30]; // Possible minute variations

    while (options.size < count + 1) {
        const variation = variations[Math.floor(Math.random() * variations.length)];
        const { hour: wrongHour, minute: wrongMinute } = calculateNewTime(correctHour, correctMinute, variation);
        const wrongTimeStr = formatTime(wrongHour, wrongMinute);
        if (wrongTimeStr !== correctTimeStr) { // Ensure uniqueness
            options.add(wrongTimeStr);
        }
    }

    return Array.from(options);
}


