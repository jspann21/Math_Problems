import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

let currentProblemData = null;
let problemHistory = [];
let currentHistoryIndex = -1;

const problemTextElement = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

function formatTime(hour, minute) {
    return `${hour}:${minute.toString().padStart(2, '0')}`;
}

function calculateShiftedTime(hour, minute, minuteShift) {
    const hour24 = hour === 12 ? 0 : hour;
    let totalMinutes = hour24 * 60 + minute + minuteShift;
    totalMinutes = (totalMinutes % 720 + 720) % 720;
    let shiftedHour = Math.floor(totalMinutes / 60) % 12;
    if (shiftedHour === 0) {
        shiftedHour = 12;
    }
    const shiftedMinute = totalMinutes % 60;
    return { hour: shiftedHour, minute: shiftedMinute };
}

function generateTimeOptions(correctHour, correctMinute) {
    const options = new Set([formatTime(correctHour, correctMinute)]);
    const minuteShifts = [-20, -15, -10, -5, 5, 10, 15, 20];

    while (options.size < 4) {
        const shift = minuteShifts[Math.floor(Math.random() * minuteShifts.length)];
        const shiftedTime = calculateShiftedTime(correctHour, correctMinute, shift);
        options.add(formatTime(shiftedTime.hour, shiftedTime.minute));
    }

    return shuffleArray(Array.from(options));
}

function generateClockReadProblem() {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = Math.floor(Math.random() * 60);
    const correctAnswer = formatTime(hour, minute);

    return {
        type: 'clockReadTickmarks',
        questionText: 'What time does this clock show?',
        hour,
        minute,
        options: generateTimeOptions(hour, minute),
        correctAnswer
    };
}

function displayClock(hour, minute) {
    const clockDiv = document.createElement('div');
    clockDiv.className = 'analog-clock';

    const faceDiv = document.createElement('div');
    faceDiv.className = 'clock-face';

    for (let i = 0; i < 60; i++) {
        const tick = document.createElement('div');
        tick.className = i % 5 === 0 ? 'clock-tick hour-tick' : 'clock-tick minute-tick';
        tick.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
        faceDiv.appendChild(tick);
    }

    for (let i = 1; i <= 12; i++) {
        const angle = i * 30 * (Math.PI / 180);
        const numberDiv = document.createElement('div');
        numberDiv.className = 'clock-number clock-number-static';
        numberDiv.textContent = i;
        const radius = 90;
        const x = radius * Math.sin(angle);
        const y = -radius * Math.cos(angle);
        numberDiv.style.left = `calc(50% + ${x}px - 15px)`;
        numberDiv.style.top = `calc(50% + ${y}px - 15px)`;
        faceDiv.appendChild(numberDiv);
    }

    const hourHand = document.createElement('div');
    hourHand.className = 'clock-hand hour-hand';
    const hourAngle = (hour % 12 + minute / 60) * 30;
    hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
    faceDiv.appendChild(hourHand);

    const minuteHand = document.createElement('div');
    minuteHand.className = 'clock-hand minute-hand';
    const minuteAngle = minute * 6;
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
    faceDiv.appendChild(minuteHand);

    const centerDiv = document.createElement('div');
    centerDiv.className = 'clock-center';
    faceDiv.appendChild(centerDiv);

    clockDiv.appendChild(faceDiv);
    return clockDiv;
}

function displayProblem(problemData) {
    currentProblemData = problemData;

    problemTextElement.textContent = currentProblemData.questionText;
    optionsContainer.innerHTML = '';
    optionsContainer.classList.remove('options');
    optionsContainer.classList.add('clock-read-layout');

    const clockContainer = document.createElement('div');
    clockContainer.className = 'clock-container';
    clockContainer.appendChild(displayClock(currentProblemData.hour, currentProblemData.minute));

    const buttonGrid = document.createElement('div');
    buttonGrid.className = 'options clock-read-options';

    currentProblemData.options.forEach((optionText) => {
        const optionButton = document.createElement('button');
        optionButton.className = 'option';
        optionButton.textContent = optionText;
        optionButton.onclick = () => handleOptionClick(optionButton);
        buttonGrid.appendChild(optionButton);
    });

    optionsContainer.appendChild(clockContainer);
    optionsContainer.appendChild(buttonGrid);

    prevBtn.disabled = currentHistoryIndex <= 0;
    nextBtn.disabled = false;
}

function handleOptionClick(selectedOption) {
    if (selectedOption.disabled) {
        return;
    }

    const isCorrect = selectedOption.textContent === currentProblemData.correctAnswer;
    const allOptions = optionsContainer.querySelectorAll('.option');

    if (isCorrect) {
        animationSystem.handleCorrectAnswer(selectedOption, allOptions, () => {
            generateAndShowNewProblem();
        });
    } else {
        animationSystem.handleWrongAnswer(selectedOption);
    }
}

function loadProblemFromHistory(index) {
    if (index >= 0 && index < problemHistory.length) {
        currentHistoryIndex = index;
        displayProblem(problemHistory[currentHistoryIndex]);
    }
}

function generateAndShowNewProblem() {
    const newProblem = generateClockReadProblem();
    problemHistory.push(newProblem);
    currentHistoryIndex = problemHistory.length - 1;
    displayProblem(newProblem);
}

document.addEventListener('DOMContentLoaded', () => {
    setupScratchpad();
    generateAndShowNewProblem();

    nextBtn.addEventListener('click', () => {
        if (currentHistoryIndex < problemHistory.length - 1) {
            loadProblemFromHistory(currentHistoryIndex + 1);
        } else {
            generateAndShowNewProblem();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentHistoryIndex > 0) {
            loadProblemFromHistory(currentHistoryIndex - 1);
        }
    });
});
