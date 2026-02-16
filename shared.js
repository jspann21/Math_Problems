export function getFirstById(...ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) {
      return element;
    }
  }
  return null;
}

export function shuffleArray(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

export function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export class Scratchpad {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.isDrawing = false;
    this.paths = [];
    this.redoPaths = [];
    this.currentPath = [];
    this.initialized = false;

    this.startDrawing = this.startDrawing.bind(this);
    this.draw = this.draw.bind(this);
    this.stopDrawing = this.stopDrawing.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);

    this.attachInputEvents();
    window.addEventListener('resize', this.resizeCanvas);
  }

  initialize() {
    this.resizeCanvas();
    this.initialized = true;
  }

  configureContext() {
    this.context.strokeStyle = '#111827';
    this.context.lineWidth = 3;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
  }

  resizeCanvas() {
    const previousWidth = this.canvas.width;
    const previousHeight = this.canvas.height;
    const parentRect = this.canvas.parentElement.getBoundingClientRect();

    const nextWidth = Math.max(1, Math.floor(parentRect.width));
    const nextHeight = 500;

    if (previousWidth === nextWidth && previousHeight === nextHeight) {
      return;
    }

    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;
    this.configureContext();
    this.redraw();
  }

  attachInputEvents() {
    this.canvas.addEventListener('mousedown', this.startDrawing);
    this.canvas.addEventListener('mousemove', this.draw);
    this.canvas.addEventListener('mouseup', this.stopDrawing);
    this.canvas.addEventListener('mouseleave', this.stopDrawing);

    this.canvas.addEventListener(
      'touchstart',
      (event) => {
        event.preventDefault();
        const [touch] = event.touches;
        this.startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchmove',
      (event) => {
        event.preventDefault();
        const [touch] = event.touches;
        this.draw({ clientX: touch.clientX, clientY: touch.clientY });
      },
      { passive: false }
    );

    this.canvas.addEventListener('touchend', this.stopDrawing);
  }

  getPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  startDrawing(event) {
    if (!this.initialized) {
      return;
    }

    this.isDrawing = true;
    const point = this.getPoint(event);
    this.currentPath = [point];
    this.context.beginPath();
    this.context.moveTo(point.x, point.y);
  }

  draw(event) {
    if (!this.isDrawing) {
      return;
    }

    const point = this.getPoint(event);
    this.currentPath.push(point);
    this.context.lineTo(point.x, point.y);
    this.context.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) {
      return;
    }

    this.isDrawing = false;
    if (this.currentPath.length > 1) {
      this.paths.push([...this.currentPath]);
      this.redoPaths = [];
    }
    this.currentPath = [];
  }

  redraw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.configureContext();

    for (const path of this.paths) {
      if (path.length < 2) {
        continue;
      }

      this.context.beginPath();
      this.context.moveTo(path[0].x, path[0].y);
      for (let index = 1; index < path.length; index += 1) {
        this.context.lineTo(path[index].x, path[index].y);
      }
      this.context.stroke();
    }
  }

  undo() {
    if (!this.paths.length) {
      return;
    }

    this.redoPaths.push(this.paths.pop());
    this.redraw();
  }

  redo() {
    if (!this.redoPaths.length) {
      return;
    }

    this.paths.push(this.redoPaths.pop());
    this.redraw();
  }

  clear() {
    this.paths = [];
    this.redoPaths = [];
    this.currentPath = [];
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export function setupScratchpad(options = {}) {
  const {
    canvasId = 'scratchpad',
    areaId = 'scratchpad-area',
    toggleButtonId = 'toggle-scratchpad',
    closeButtonId = 'close-scratchpad',
    undoButtonId = 'undo-btn',
    redoButtonId = 'redo-btn',
    clearButtonId = 'clear-btn',
    openLabel = '📝 Open Scratchpad',
    closeLabel = '❌ Close Scratchpad',
    hideToggleWhenOpen = false,
  } = options;

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return null;
  }

  const scratchpadArea = document.getElementById(areaId);
  const toggleButton = document.getElementById(toggleButtonId);
  const closeButton = document.getElementById(closeButtonId);
  const undoButton = document.getElementById(undoButtonId);
  const redoButton = document.getElementById(redoButtonId);
  const clearButton = document.getElementById(clearButtonId);

  const scratchpad = new Scratchpad(canvas);

  const setOpen = (isOpen) => {
    if (scratchpadArea) {
      scratchpadArea.classList.toggle('open', isOpen);
    }

    if (toggleButton) {
      toggleButton.textContent = isOpen ? closeLabel : openLabel;
      toggleButton.style.display = hideToggleWhenOpen && isOpen ? 'none' : 'inline-flex';
    }

    if (isOpen) {
      scratchpad.initialize();
    }
  };

  const defaultOpen = scratchpadArea?.classList.contains('open') ?? false;
  setOpen(defaultOpen);

  toggleButton?.addEventListener('click', () => {
    const isOpen = scratchpadArea?.classList.contains('open') ?? false;
    setOpen(!isOpen);
  });

  closeButton?.addEventListener('click', () => {
    setOpen(false);
  });

  undoButton?.addEventListener('click', () => scratchpad.undo());
  redoButton?.addEventListener('click', () => scratchpad.redo());
  clearButton?.addEventListener('click', () => scratchpad.clear());

  return scratchpad;
}
