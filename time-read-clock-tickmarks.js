import { animationSystem } from './animations.js';

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
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 500;
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
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.redraw();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing);
        this.canvas.addEventListener('mousemove', this.draw);
        this.canvas.addEventListener('mouseup', this.stopDrawing);
        this.canvas.addEventListener('mouseleave', this.stopDrawing);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw({ clientX: touch.clientX, clientY: touch.clientY });
        });
        this.canvas.addEventListener('touchend', this.stopDrawing);
    }

    getPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

let currentProblemData = null;
let scratchpad = null;
let problemHistory = [];
let currentHistoryIndex = -1;

const problemTextElement = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const toggleScratchpadBtn = document.getElementById('toggle-scratchpad');
const scratchpadArea = document.getElementById('scratchpad-area');
const closeScratchpadBtn = document.getElementById('close-scratchpad');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const clearBtn = document.getElementById('clear-btn');
const scratchpadCanvas = document.getElementById('scratchpad');

function formatTime(hour, minute) {
    return `${hour}:${minute.toString().padStart(2, '0')}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    scratchpad = new Scratchpad(scratchpadCanvas);
    scratchpad.initialize();
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

    toggleScratchpadBtn.addEventListener('click', () => {
        scratchpadArea.classList.toggle('open');
        toggleScratchpadBtn.textContent = scratchpadArea.classList.contains('open') ? '❌ Close Scratchpad' : '📝 Open Scratchpad';
        if (scratchpadArea.classList.contains('open')) {
            scratchpad.setCanvasSize();
        }
    });

    closeScratchpadBtn.addEventListener('click', () => {
        scratchpadArea.classList.remove('open');
        toggleScratchpadBtn.textContent = '📝 Open Scratchpad';
    });

    undoBtn.addEventListener('click', () => scratchpad.undo());
    redoBtn.addEventListener('click', () => scratchpad.redo());
    clearBtn.addEventListener('click', () => scratchpad.clear());
});
