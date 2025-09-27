/**
 * Professional Web Teleprompter
 * A feature-rich teleprompter application for web browsers
 */

class Teleprompter {
    constructor() {
        this.isPlaying = false;
        this.scrollSpeed = 1.5; // Better default for readable scrolling
        this.fontSize = 24;
        this.currentScrollPosition = 0;
        this.scrollInterval = null;
        this.allScrollIntervals = new Set(); // Track all intervals to prevent leaks
        this.mirrorMode = false;
        this.fullscreenMode = false;
        this.darkMode = true;
        this.countdownTime = 5; // Default 5 seconds
        this.countdownTimer = null;
        this.countdownActive = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.updateThemeButton();
        this.updateSpeedIndicator(); // Initialize speed indicator
        this.updateStatus('Ready - Click "Edit Text" to write your script or "Load File" to import one');
    }

    initializeElements() {
        // Control elements
        this.playBtn = document.getElementById('playBtn');
        this.rewindBtn = document.getElementById('rewindBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.testScrollBtn = document.getElementById('testScrollBtn');
        
        // File operations
        this.fileInput = document.getElementById('fileInput');
        this.loadFileBtn = document.getElementById('loadFileBtn');
        this.editTextBtn = document.getElementById('editTextBtn');
        this.clearTextBtn = document.getElementById('clearTextBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // Sliders
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.fontSlider = document.getElementById('fontSlider');
        this.fontValue = document.getElementById('fontValue');
        
        // Checkboxes and buttons
        this.mirrorModeCheck = document.getElementById('mirrorMode');
        this.fullscreenModeCheck = document.getElementById('fullscreenMode');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Reading indicator
        this.readingIndicator = document.getElementById('readingIndicator');
        this.readingIndicatorType = 'highlight';
        this.currentReadingElement = null;
        this.currentReadingKey = null;
        this.currentLineIndex = -1;
        
        // Control panel collapse
        this.controlPanel = document.getElementById('controlPanel');
        this.collapseBtn = document.getElementById('collapseBtn');
        this.showControlsBtn = document.getElementById('showControlsBtn');
        this.autoHideControls = document.getElementById('autoHideControls');
        this.controlsVisible = true;
        
        // Scroll-based control variables
        this.lastScrollTop = 0;
        this.scrollThreshold = 10; // Minimum scroll distance to trigger action
        this.isUserScrolling = false;
        
        // Countdown controls
        this.countdownSelect = document.getElementById('countdownSelect');
        this.customCountdown = document.getElementById('customCountdown');
        this.countdownOverlay = document.getElementById('countdownOverlay');
        this.countdownNumber = document.getElementById('countdownNumber');
        this.cancelCountdown = document.getElementById('cancelCountdown');
        
        // Text display
        this.textContainer = document.getElementById('textContainer');
        this.textDisplay = document.getElementById('textDisplay');
        this.textContent = document.getElementById('textContent');
        
        // Text editor modal
        this.textEditorModal = document.getElementById('textEditorModal');
        this.textEditor = document.getElementById('textEditor');
        this.applyTextChanges = document.getElementById('applyTextChanges');
        this.cancelTextChanges = document.getElementById('cancelTextChanges');
        this.closeTextEditor = document.getElementById('closeTextEditor');
        
        // UI elements
        this.status = document.getElementById('status');
        this.speedIndicator = document.getElementById('speedIndicator');
        this.currentSpeed = document.getElementById('currentSpeed');
        this.progressIndicator = document.getElementById('progressIndicator');
        this.currentProgress = document.getElementById('currentProgress');
        this.progressBar = document.getElementById('progressBar');
        this.helpModal = document.getElementById('helpModal');
        this.helpBtn = document.getElementById('helpBtn');
        this.appContainer = document.querySelector('.app-container');
    }

    setupEventListeners() {
        // Playback controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.rewindBtn.addEventListener('click', () => this.rewind());
        this.forwardBtn.addEventListener('click', () => this.fastForward());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.testScrollBtn.addEventListener('click', () => this.runScrollTests());
        
        // File operations
        this.loadFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.loadFile(e));
        this.editTextBtn.addEventListener('click', () => this.showTextEditor());
        this.clearTextBtn.addEventListener('click', () => this.clearText());
        this.downloadBtn.addEventListener('click', () => this.downloadText());
        
        // Text editor modal
        this.applyTextChanges.addEventListener('click', () => this.applyTextEditorChanges());
        this.cancelTextChanges.addEventListener('click', () => this.hideTextEditor());
        this.closeTextEditor.addEventListener('click', () => this.hideTextEditor());
        
        // Speed control
        this.speedSlider.addEventListener('input', (e) => this.updateSpeed(e.target.value));
        
        // Font size control
        this.fontSlider.addEventListener('input', (e) => this.updateFontSize(e.target.value));
        
        // Mode toggles
        this.mirrorModeCheck.addEventListener('change', (e) => this.toggleMirror(e.target.checked));
        this.fullscreenModeCheck.addEventListener('change', (e) => this.toggleFullscreen(e.target.checked));
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Reading indicator
        this.readingIndicator.addEventListener('change', (e) => this.updateReadingIndicator(e.target.value));
        
        // Control panel collapse
        this.collapseBtn.addEventListener('click', () => this.toggleControls());
        this.showControlsBtn.addEventListener('click', () => this.showControls());
        this.autoHideControls.addEventListener('change', (e) => this.saveSettings());
        
        // Countdown controls
        this.countdownSelect.addEventListener('change', (e) => this.handleCountdownChange(e));
        this.customCountdown.addEventListener('input', (e) => this.handleCustomCountdown(e));
        this.cancelCountdown.addEventListener('click', () => this.cancelCountdownTimer());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Text display scroll tracking
        this.textDisplay.addEventListener('scroll', () => {
            this.updateProgress();
            this.updateReadingPosition();
            this.handleScrollBasedControls();
        });
        
        // Add click handler for debugging scroll issues
        this.textDisplay.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.debugScrollInfo();
            }
        });
        
        // Modal controls
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.helpModal.querySelector('.close').addEventListener('click', () => this.hideHelp());
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) this.hideHelp();
        });
        
        // Text editor modal controls
        this.textEditorModal.addEventListener('click', (e) => {
            if (e.target === this.textEditorModal) this.hideTextEditor();
        });
        
        // Prevent form submission on spacebar
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target !== this.textEditor) {
                e.preventDefault();
            }
        });
        
        // Handle text content changes
        this.textContent.addEventListener('input', () => this.saveSettings());
        
        // Save text when content changes (for direct editing scenarios)
        const observer = new MutationObserver(() => {
            this.saveSettings();
        });
        observer.observe(this.textContent, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        
        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveSettings();
        });
        
        // Save data when page loses focus
        window.addEventListener('blur', () => {
            this.saveSettings();
        });
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('teleprompterSettings') || '{}');
            
            if (settings.scrollSpeed !== undefined) {
                this.scrollSpeed = settings.scrollSpeed;
                this.speedSlider.value = this.scrollSpeed;
                this.speedValue.textContent = this.scrollSpeed.toFixed(1) + 'x';
            } else {
                // Set default values if no settings
                this.speedSlider.value = this.scrollSpeed;
                this.speedValue.textContent = this.scrollSpeed.toFixed(1) + 'x';
            }
            
            if (settings.fontSize !== undefined) {
                this.fontSize = settings.fontSize;
                this.fontSlider.value = this.fontSize;
                this.fontValue.textContent = this.fontSize + 'px';
                this.updateFontSize(this.fontSize);
            }
            
            if (settings.darkMode !== undefined) {
                this.darkMode = settings.darkMode;
                this.updateThemeButton();
                this.toggleDarkMode(this.darkMode);
            }
            
            if (settings.textContent) {
                this.textContent.innerHTML = settings.textContent;
            }
            // Note: If no saved content, we keep the default HTML content that's already in the page
            
            if (settings.readingIndicatorType !== undefined) {
                this.readingIndicatorType = settings.readingIndicatorType;
                this.readingIndicator.value = this.readingIndicatorType;
            }
            
            if (settings.autoHideControls !== undefined) {
                this.autoHideControls.checked = settings.autoHideControls;
            }
            
            // Always start with controls visible on page load
            this.controlsVisible = true;
            this.controlPanel.classList.remove('collapsed');
            this.showControlsBtn.style.display = 'none';
            
            if (settings.countdownSelect !== undefined) {
                this.countdownSelect.value = settings.countdownSelect;
            }
            
            if (settings.customCountdown !== undefined) {
                this.customCountdown.value = settings.customCountdown;
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    }

    saveSettings() {
        const settings = {
            scrollSpeed: this.scrollSpeed,
            fontSize: this.fontSize,
            darkMode: this.darkMode,
            textContent: this.textContent.innerHTML,
            readingIndicatorType: this.readingIndicatorType,
            autoHideControls: this.autoHideControls.checked,
            countdownSelect: this.countdownSelect.value,
            customCountdown: this.customCountdown.value
        };
        
        try {
            localStorage.setItem('teleprompterSettings', JSON.stringify(settings));
            // Settings saved silently - no need to disturb user during playback
        } catch (e) {
            console.warn('Could not save settings:', e);
            this.updateStatus('⚠️ Could not save settings');
        }
    }

    togglePlay() {
        if (this.countdownActive) {
            this.cancelCountdownTimer();
            return;
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.startPlayWithCountdown();
        }
    }

    startPlayWithCountdown() {
        // Check if there's content to scroll
        if (!this.textContent.textContent.trim()) {
            this.updateStatus('No text content to scroll. Please add some text first.');
            return;
        }

        // Get countdown time
        const countdownSeconds = this.getCountdownTime();
        
        if (countdownSeconds > 0) {
            this.startCountdown(countdownSeconds);
        } else {
            this.startPlaying();
        }
    }

    getCountdownTime() {
        if (this.customCountdown.value && this.customCountdown.value.trim() !== '') {
            return parseInt(this.customCountdown.value) || 0;
        }
        return parseInt(this.countdownSelect.value) || 0;
    }

    startCountdown(seconds) {
        this.countdownActive = true;
        this.countdownOverlay.classList.add('show');
        this.countdownNumber.textContent = seconds;
        this.updateStatus(`Starting in ${seconds} seconds...`);
        
        let currentCount = seconds;
        
        this.countdownTimer = setInterval(() => {
            currentCount--;
            
            if (currentCount > 0) {
                this.countdownNumber.textContent = currentCount;
                this.updateStatus(`Starting in ${currentCount} seconds...`);
            } else {
                this.countdownNumber.textContent = 'GO!';
                this.updateStatus('Starting now!');
                
                setTimeout(() => {
                    this.finishCountdown();
                    this.startPlaying();
                }, 500);
            }
        }, 1000);
    }

    cancelCountdownTimer() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        this.finishCountdown();
        this.updateStatus('Countdown cancelled');
    }

    finishCountdown() {
        this.countdownActive = false;
        this.countdownOverlay.classList.remove('show');
    }

    startPlaying() {
        // Debug the initial state
        console.log('=== PLAY REQUESTED ===');
        console.log('Call stack:', new Error().stack);
        console.log('Previous state - isPlaying:', this.isPlaying, 'scrollInterval:', !!this.scrollInterval);
        
        // ABSOLUTELY ensure we're not already playing
        if (this.isPlaying) {
            console.log('Already playing, ignoring duplicate start request');
            return;
        }
        
        // Clear any existing intervals first
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
        
        if (this.allScrollIntervals) {
            this.allScrollIntervals.forEach(intervalId => clearInterval(intervalId));
            this.allScrollIntervals.clear();
        }
        
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        this.playBtn.classList.add('playing');
        this.updateStatus('Playing - Use SPACE to pause, arrows to navigate');
        
        // Show speed indicator when playing
        this.showSpeedIndicator();
        
        // Auto-hide controls if enabled
        if (this.autoHideControls.checked && this.controlsVisible) {
            this.hideControls();
        }
        
        // Create new interval with tracking
        this.scrollInterval = setInterval(() => {
            this.autoScroll();
        }, 50); // 20fps for smoother, more readable scrolling
        
        // Track this interval
        if (this.allScrollIntervals) {
            this.allScrollIntervals.add(this.scrollInterval);
        }
        
        console.log('Scrolling started successfully. Interval ID:', this.scrollInterval);
    }

    pause() {
        console.log('=== PAUSE REQUESTED ===');
        console.log('Call stack:', new Error().stack);
        console.log('Previous state - isPlaying:', this.isPlaying, 'scrollInterval:', !!this.scrollInterval);
        
        // FORCE stop all scrolling
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        this.playBtn.classList.remove('playing');
        this.updateStatus('Paused - Press SPACE or click Play to continue');
        
        // Hide speed indicator when paused
        this.hideSpeedIndicator();
        
        // Clear the main interval
        if (this.scrollInterval) {
            console.log('Clearing interval:', this.scrollInterval);
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
        
        // Clear ALL tracked intervals
        if (this.allScrollIntervals && this.allScrollIntervals.size > 0) {
            console.log('Clearing tracked intervals:', Array.from(this.allScrollIntervals));
            this.allScrollIntervals.forEach(intervalId => {
                clearInterval(intervalId);
            });
            this.allScrollIntervals.clear();
        }
        
        console.log('After pause - isPlaying:', this.isPlaying, 'scrollInterval:', !!this.scrollInterval);
    }

    autoScroll() {
        // Double check we should be scrolling
        if (!this.isPlaying || !this.scrollInterval) {
            console.log('autoScroll called but should not be running. isPlaying:', this.isPlaying, 'scrollInterval:', !!this.scrollInterval);
            return;
        }
        
        // Much smoother scrolling - smaller increments for readability
        const scrollAmount = this.scrollSpeed * 0.5; // Reduced from 2 to 0.5 for smooth reading
        const previousScrollTop = this.textDisplay.scrollTop;
        
        // Use smooth scrolling
        this.textDisplay.scrollTop += scrollAmount;
        
        const newScrollTop = this.textDisplay.scrollTop;
        
        // Less verbose logging
        if (Math.floor(newScrollTop / 50) !== Math.floor(previousScrollTop / 50)) {
            console.log(`Smooth scroll: ${Math.round(newScrollTop)}, Speed: ${this.scrollSpeed}x`);
        }
        
        // Check scroll dimensions
        const scrollHeight = this.textDisplay.scrollHeight;
        const clientHeight = this.textDisplay.clientHeight;
        
        // Update progress
        this.updateProgress();
        
        // Update reading indicator position
        this.updateReadingPosition();
        
        // Check if we've reached the end
        if (scrollHeight > clientHeight && newScrollTop >= scrollHeight - clientHeight - 10) {
            this.pause();
            this.updateStatus('Reached end of text');
            console.log('Reached end of text');
            return;
        }
        
        // Only warn about stuck scrolling occasionally
        if (scrollAmount > 0 && newScrollTop === previousScrollTop && previousScrollTop === 0) {
            // Check if content is actually scrollable
            if (scrollHeight <= clientHeight) {
                this.pause();
                this.updateStatus('Content too short to scroll - try increasing font size or adding more text');
                console.log('Content is not tall enough to scroll');
            }
        }
    }

    rewind() {
        // Calculate line height based on current font size
        const computedStyle = window.getComputedStyle(this.textContent);
        const lineHeight = parseFloat(computedStyle.lineHeight) || this.fontSize * 1.2;
        
        // Move back by one line
        const rewindAmount = lineHeight;
        this.textDisplay.scrollTop = Math.max(0, this.textDisplay.scrollTop - rewindAmount);
        this.updateStatus('Rewound one line');
        this.updateProgress();
        this.updateReadingPosition();
    }

    fastForward() {
        // Calculate line height based on current font size  
        const computedStyle = window.getComputedStyle(this.textContent);
        const lineHeight = parseFloat(computedStyle.lineHeight) || this.fontSize * 1.2;
        
        // Move forward by one line
        const forwardAmount = lineHeight;
        const maxScroll = this.textDisplay.scrollHeight - this.textDisplay.clientHeight;
        this.textDisplay.scrollTop = Math.min(maxScroll, this.textDisplay.scrollTop + forwardAmount);
        this.updateStatus('Advanced one line');
        this.updateProgress();
        this.updateReadingPosition();
    }

    reset() {
        this.pause();
        this.textDisplay.scrollTop = 0;
        this.clearReadingIndicator();
        this.updateStatus('Reset to beginning');
        this.updateProgress();
        this.updateReadingPosition();
    }

    updateSpeed(value) {
        this.scrollSpeed = parseFloat(value);
        this.speedValue.textContent = this.scrollSpeed.toFixed(1) + 'x';
        this.updateSpeedIndicator();
        this.saveSettings();
    }

    updateFontSize(value) {
        this.fontSize = parseInt(value);
        this.fontValue.textContent = this.fontSize + 'px';
        this.textContent.style.fontSize = this.fontSize + 'px';
        this.saveSettings();
    }

    toggleMirror(enabled) {
        this.mirrorMode = enabled;
        if (enabled) {
            this.textContainer.classList.add('mirror');
            this.updateStatus('Mirror mode enabled');
        } else {
            this.textContainer.classList.remove('mirror');
            this.updateStatus('Mirror mode disabled');
        }
    }

    toggleFullscreen(enabled) {
        this.fullscreenMode = enabled;
        if (enabled) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    toggleDarkMode(enabled) {
        this.darkMode = enabled;
        if (enabled) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        this.updateThemeButton();
        this.saveSettings();
    }

    toggleTheme() {
        this.toggleDarkMode(!this.darkMode);
    }

    updateThemeButton() {
        if (this.darkMode) {
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
        } else {
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
        }
    }

    updateReadingIndicator(type) {
        this.readingIndicatorType = type;
        this.clearReadingIndicator();
        this.saveSettings();
        this.updateStatus(`Reading indicator: ${type}`);
    }

    updateReadingPosition() {
        if (this.readingIndicatorType === 'none') return;

        // Calculate which line should be highlighted based on scroll position
        const scrollTop = this.textDisplay.scrollTop;
        const containerHeight = this.textDisplay.clientHeight;
        const readingLine = scrollTop + (containerHeight * 0.4); // 40% down from top

        // Get all text nodes and create virtual "lines" based on line height
        const textElements = this.textContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
        let targetElement = null;
        let targetLineIndex = -1;

        for (let element of textElements) {
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const computedStyle = window.getComputedStyle(element);
            const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
            
            // Calculate how many lines this element has
            const numberOfLines = Math.ceil(elementHeight / lineHeight);
            
            // Check if the reading line falls within this element
            if (readingLine >= elementTop && readingLine <= elementTop + elementHeight) {
                targetElement = element;
                // Calculate which line within this element
                const relativePosition = readingLine - elementTop;
                targetLineIndex = Math.floor(relativePosition / lineHeight);
                targetLineIndex = Math.max(0, Math.min(targetLineIndex, numberOfLines - 1));
                break;
            }
        }

        // Update the indicator
        if (targetElement) {
            const elementKey = `${targetElement.tagName}-${Array.from(targetElement.parentNode.children).indexOf(targetElement)}-${targetLineIndex}`;
            if (elementKey !== this.currentReadingKey) {
                this.clearReadingIndicator();
                this.currentReadingKey = elementKey;
                this.currentReadingElement = targetElement;
                this.currentLineIndex = targetLineIndex;
                this.applyLineBasedIndicator(targetElement, targetLineIndex);
            }
        }
    }

    applyLineBasedIndicator(element, lineIndex) {
        // Remove any existing line indicators
        const existingIndicators = element.querySelectorAll('.line-reading-indicator, .line-reading-highlight');
        existingIndicators.forEach(el => el.remove());

        // Calculate line positioning
        const computedStyle = window.getComputedStyle(element);
        const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
        const topOffset = lineIndex * lineHeight;

        // Create line-specific indicator elements
        if (this.readingIndicatorType === 'highlight' || this.readingIndicatorType === 'both') {
            const highlight = document.createElement('div');
            highlight.className = 'line-reading-highlight';
            highlight.style.position = 'absolute';
            highlight.style.left = '-1rem';
            highlight.style.right = '-1rem';
            highlight.style.top = topOffset + 'px';
            highlight.style.height = lineHeight + 'px';
            highlight.style.pointerEvents = 'none';
            highlight.style.zIndex = '1';
            
            // Make parent relative if it isn't already
            if (getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }
            
            element.appendChild(highlight);
        }

        if (this.readingIndicatorType === 'arrow' || this.readingIndicatorType === 'both') {
            const arrow = document.createElement('div');
            arrow.className = 'line-reading-indicator';
            arrow.innerHTML = '▶';
            arrow.style.position = 'absolute';
            arrow.style.left = '-2.5rem';
            arrow.style.top = topOffset + 'px';
            arrow.style.height = lineHeight + 'px';
            arrow.style.lineHeight = lineHeight + 'px';
            arrow.style.pointerEvents = 'none';
            arrow.style.zIndex = '10';
            
            // Make parent relative if it isn't already
            if (getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }
            
            element.appendChild(arrow);
        }
    }

    applyReadingIndicator(element) {
        if (this.readingIndicatorType === 'highlight' || this.readingIndicatorType === 'both') {
            element.classList.add('reading-highlight');
        }
        if (this.readingIndicatorType === 'arrow' || this.readingIndicatorType === 'both') {
            element.classList.add('reading-indicator');
        }
    }

    clearReadingIndicator() {
        // Remove CSS class indicators
        const elements = this.textContent.querySelectorAll('.reading-highlight, .reading-indicator');
        elements.forEach(el => {
            el.classList.remove('reading-highlight', 'reading-indicator');
            el.style.position = ''; // Reset position if we set it
        });
        
        // Remove line-specific indicator elements
        const lineIndicators = this.textContent.querySelectorAll('.line-reading-highlight, .line-reading-indicator');
        lineIndicators.forEach(el => el.remove());
        
        this.currentReadingElement = null;
        this.currentReadingKey = null;
        this.currentLineIndex = -1;
    }

    showSpeedIndicator() {
        this.speedIndicator.style.display = 'block';
        this.progressIndicator.style.display = 'block';
        this.updateSpeedIndicator();
        this.updateProgressIndicator();
    }

    hideSpeedIndicator() {
        this.speedIndicator.style.display = 'none';
        this.progressIndicator.style.display = 'none';
    }

    updateSpeedIndicator() {
        if (this.currentSpeed) {
            this.currentSpeed.textContent = this.scrollSpeed.toFixed(1) + 'x';
        }
    }

    updateProgressIndicator() {
        if (this.currentProgress) {
            const scrolled = this.textDisplay.scrollTop;
            const maxScroll = this.textDisplay.scrollHeight - this.textDisplay.clientHeight;
            const progress = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
            this.currentProgress.textContent = Math.round(progress) + '%';
        }
    }

    toggleControls() {
        if (this.controlsVisible) {
            this.hideControls();
        } else {
            this.showControls();
        }
    }

    hideControls() {
        this.controlPanel.classList.add('collapsed');
        this.showControlsBtn.style.display = 'block';
        this.controlsVisible = false;
        // this.updateStatus('Settings hidden - Click the Settings button to show again');
    }

    showControls() {
        this.controlPanel.classList.remove('collapsed');
        this.showControlsBtn.style.display = 'none';
        this.controlsVisible = true;
        this.updateStatus('Settings visible');
    }

    handleScrollBasedControls() {
        const currentScrollTop = this.textDisplay.scrollTop;
        
        // Detect scroll direction
        const scrollingDown = currentScrollTop > this.lastScrollTop;
        const scrollingUp = currentScrollTop < this.lastScrollTop;
        
        // Only act if scroll amount exceeds threshold
        const scrollDelta = Math.abs(currentScrollTop - this.lastScrollTop);
        if (scrollDelta < this.scrollThreshold) {
            this.lastScrollTop = currentScrollTop;
            return;
        }
        
        // Don't interfere with auto-scrolling
        if (this.isPlaying) {
            this.lastScrollTop = currentScrollTop;
            return;
        }
        
        // Show settings if scrolling up at the top of the page
        if (scrollingUp && currentScrollTop <= 50 && !this.controlsVisible) {
            this.showControls();
        }
        // Hide settings if scrolling down and not at the top
        else if (scrollingDown && currentScrollTop > 100 && this.controlsVisible) {
            this.hideControls();
        }
        
        this.lastScrollTop = currentScrollTop;
    }

    showTextEditor() {
        // Get current text content as plain text
        const currentText = this.textContent.innerText || this.textContent.textContent || '';
        this.textEditor.value = currentText;
        this.textEditorModal.classList.add('show');
        this.textEditor.focus();
        this.updateStatus('Editing text - Click Apply Changes when done');
    }

    hideTextEditor() {
        this.textEditorModal.classList.remove('show');
        this.updateStatus('Text editing cancelled');
    }

    applyTextEditorChanges() {
        const text = this.textEditor.value.trim();
        if (text) {
            // Convert plain text to HTML with proper formatting
            const htmlContent = this.textToHtml(text);
            this.textContent.innerHTML = htmlContent;
            this.reset();
            this.updateStatus('Text updated successfully');
            this.saveSettings();
        } else {
            this.updateStatus('No text entered');
        }
        this.hideTextEditor();
    }

    enterFullscreen() {
        this.appContainer.classList.add('fullscreen');
        this.fullscreenModeCheck.checked = true;
        this.updateStatus('Entered fullscreen mode - Press F or ESC to exit');
        
        // Try to enter browser fullscreen
        if (this.appContainer.requestFullscreen) {
            this.appContainer.requestFullscreen();
        } else if (this.appContainer.webkitRequestFullscreen) {
            this.appContainer.webkitRequestFullscreen();
        }
    }

    exitFullscreen() {
        this.appContainer.classList.remove('fullscreen');
        this.fullscreenModeCheck.checked = false;
        this.updateStatus('Exited fullscreen mode');
        
        // Exit browser fullscreen
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    handleFullscreenChange() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            this.fullscreenMode = false;
            this.appContainer.classList.remove('fullscreen');
            this.fullscreenModeCheck.checked = false;
        }
    }

    loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            // Convert plain text to HTML with proper formatting
            const htmlContent = this.textToHtml(content);
            this.textContent.innerHTML = htmlContent;
            this.reset();
            this.updateStatus(`Loaded: ${file.name}`);
            this.saveSettings();
        };
        reader.readAsText(file);
        
        // Clear the file input
        event.target.value = '';
    }

    textToHtml(text) {
        // Convert plain text to HTML with basic formatting
        return text
            .split('\n\n')
            .map(paragraph => {
                if (paragraph.trim()) {
                    return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
                }
                return '';
            })
            .join('');
    }

    clearText() {
        if (confirm('Are you sure you want to clear all text? This will restore the default welcome content.')) {
            // Store the original HTML content (what's in the HTML file)
            const originalContent = `
                <h2>Welcome to the Web Teleprompter!</h2>
                
                <p>This web-based teleprompter provides smooth auto-scrolling text perfect for video recording, presentations, or public speaking.</p>
                
                <h3>How to Use:</h3>
                <ol>
                    <li>Click "Edit Text" to write your own content, or "Load File" to import a text file</li>
                    <li>Adjust the font size and speed to your preference</li>
                    <li>Click Play or press SPACE to start scrolling</li>
                    <li>Use keyboard shortcuts for hands-free control</li>
                </ol>
                
                <h3>Keyboard Shortcuts:</h3>
                <ul>
                    <li><strong>SPACE:</strong> Play/Pause</li>
                    <li><strong>Arrow Keys:</strong> Navigate and adjust speed</li>
                    <li><strong>R:</strong> Reset to beginning</li>
                    <li><strong>F:</strong> Toggle fullscreen</li>
                    <li><strong>M:</strong> Toggle mirror mode</li>
                    <li><strong>+/-:</strong> Adjust font size</li>
                    <li><strong>H:</strong> Show help</li>
                </ul>
                
                <p>Click "Edit Text" above to replace this content with your own script!</p>
            `;
            
            this.textContent.innerHTML = originalContent;
            this.reset();
            this.updateStatus('Text cleared and default content restored');
            this.saveSettings(); // Save the restored default content
        }
    }

    downloadText() {
        const text = this.textContent.innerText || this.textContent.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teleprompter-script.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.updateStatus('Text downloaded');
    }

    updateProgress() {
        const scrolled = this.textDisplay.scrollTop;
        const maxScroll = this.textDisplay.scrollHeight - this.textDisplay.clientHeight;
        const progress = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
        this.progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
        
        // Update progress indicator if playing
        if (this.isPlaying) {
            this.updateProgressIndicator();
        }
    }

    updateStatus(message) {
        this.status.textContent = message;
        console.log('Status:', message); // Debug info
    }

    debugScrollInfo() {
        const scrollTop = this.textDisplay.scrollTop;
        const scrollHeight = this.textDisplay.scrollHeight;
        const clientHeight = this.textDisplay.clientHeight;
        const textDisplayStyle = window.getComputedStyle(this.textDisplay);
        
        console.log('=== SCROLL DEBUG INFO ===');
        console.log('- scrollTop:', scrollTop);
        console.log('- scrollHeight:', scrollHeight);
        console.log('- clientHeight:', clientHeight);
        console.log('- canScroll:', scrollHeight > clientHeight);
        console.log('- textContent length:', this.textContent.textContent.length);
        console.log('- fontSize:', this.fontSize);
        console.log('- scrollSpeed:', this.scrollSpeed);
        console.log('- textDisplay overflow-y:', textDisplayStyle.overflowY);
        console.log('- textDisplay height:', textDisplayStyle.height);
        console.log('- textDisplay position:', textDisplayStyle.position);
        console.log('- textContent offsetHeight:', this.textContent.offsetHeight);
        console.log('- textDisplay element:', this.textDisplay);
        console.log('=========================');
        
        return {
            scrollTop,
            scrollHeight, 
            clientHeight,
            canScroll: scrollHeight > clientHeight
        };
    }

    testScroll() {
        this.updateStatus('Testing scroll... (Press T to test manual scroll)');
        const info = this.debugScrollInfo();
        
        if (!info.canScroll) {
            this.updateStatus('Cannot scroll - content is not tall enough. Try increasing font size.');
            return;
        }
        
        // Manual scroll test
        let testScrollAmount = 50;
        let originalScrollTop = this.textDisplay.scrollTop;
        
        this.textDisplay.scrollTop += testScrollAmount;
        
        if (this.textDisplay.scrollTop > originalScrollTop) {
            this.updateStatus(`✅ Scroll test passed! Moved from ${originalScrollTop} to ${this.textDisplay.scrollTop}`);
        } else {
            this.updateStatus(`❌ Scroll test failed! Still at ${this.textDisplay.scrollTop}`);
        }
        
        // Reset scroll position after test
        setTimeout(() => {
            this.textDisplay.scrollTop = originalScrollTop;
        }, 2000);
    }

    testManualScroll() {
        console.log('=== MANUAL SCROLL TEST ===');
        const before = this.textDisplay.scrollTop;
        console.log('Before manual scroll:', before);
        
        // Try scrolling by 50 pixels
        this.textDisplay.scrollTop += 50;
        
        const after = this.textDisplay.scrollTop;
        console.log('After manual scroll:', after);
        
        if (after > before) {
            console.log('✅ Manual scroll works!');
        } else {
            console.log('❌ Manual scroll failed!');
            this.tryAlternativeScroll();
        }
    }

    tryAlternativeScroll() {
        console.log('Trying alternative scroll methods...');
        
        // Method 1: scrollBy
        console.log('Trying scrollBy...');
        const before1 = this.textDisplay.scrollTop;
        this.textDisplay.scrollBy(0, 10);
        const after1 = this.textDisplay.scrollTop;
        console.log(`scrollBy: ${before1} -> ${after1}`);
        
        // Method 2: scrollTo
        setTimeout(() => {
            console.log('Trying scrollTo...');
            const before2 = this.textDisplay.scrollTop;
            this.textDisplay.scrollTo(0, before2 + 10);
            const after2 = this.textDisplay.scrollTop;
            console.log(`scrollTo: ${before2} -> ${after2}`);
        }, 100);
        
        // Method 3: Element scroll
        setTimeout(() => {
            console.log('Trying element scroll...');
            const before3 = this.textDisplay.scrollTop;
            this.textContent.scrollIntoView({ behavior: 'auto', block: 'start' });
            const after3 = this.textDisplay.scrollTop;
            console.log(`scrollIntoView: ${before3} -> ${after3}`);
        }, 200);
    }

    runScrollTests() {
        console.log('=== RUNNING ALL SCROLL TESTS ===');
        this.updateStatus('Running scroll tests - check console for results');
        
        // Test 1: Debug info
        this.debugScrollInfo();
        
        // Test 2: Manual scroll
        setTimeout(() => this.testManualScroll(), 100);
        
        // Test 3: Alternative methods
        setTimeout(() => this.tryAlternativeScroll(), 500);
        
        // Test 4: Force scroll with different methods
        setTimeout(() => {
            console.log('=== FORCE SCROLL TEST ===');
            const initialScroll = this.textDisplay.scrollTop;
            
            // Try multiple approaches
            this.textDisplay.scrollTop = 100;
            console.log(`Force scrollTop to 100: ${this.textDisplay.scrollTop}`);
            
            this.textDisplay.scrollBy(0, 50);
            console.log(`scrollBy 50: ${this.textDisplay.scrollTop}`);
            
            // Reset
            this.textDisplay.scrollTop = initialScroll;
            console.log(`Reset to: ${this.textDisplay.scrollTop}`);
        }, 1000);
    }

    handleCountdownChange(event) {
        if (event.target.value !== '0') {
            this.customCountdown.value = ''; // Clear custom input when preset is selected
        }
        this.saveSettings();
    }

    handleCustomCountdown(event) {
        if (event.target.value) {
            this.countdownSelect.value = '0'; // Reset preset when custom value is entered
        }
        this.saveSettings();
    }

    showHelp() {
        this.helpModal.classList.add('show');
    }

    hideHelp() {
        this.helpModal.classList.remove('show');
    }

    handleKeyboard(event) {
        // Don't handle shortcuts if typing in text editor
        if (event.target === this.textEditor) {
            return;
        }

        // Don't handle shortcuts if typing in text display area (but allow some shortcuts)
        if (event.target === this.textDisplay || event.target.isContentEditable) {
            if (!['Space', 'KeyF', 'KeyH', 'Escape'].includes(event.code)) {
                return;
            }
        }

        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlay();
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                this.rewind();
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                this.fastForward();
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                const newSpeedUp = Math.min(5.0, this.scrollSpeed + 0.1);
                this.speedSlider.value = newSpeedUp;
                this.updateSpeed(newSpeedUp);
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                const newSpeedDown = Math.max(0.5, this.scrollSpeed - 0.1);
                this.speedSlider.value = newSpeedDown;
                this.updateSpeed(newSpeedDown);
                break;
                
            case 'KeyR':
                event.preventDefault();
                this.reset();
                break;
                
            case 'KeyF':
                event.preventDefault();
                this.toggleFullscreen(!this.fullscreenMode);
                break;
                
            case 'KeyM':
                event.preventDefault();
                this.mirrorModeCheck.checked = !this.mirrorMode;
                this.toggleMirror(!this.mirrorMode);
                break;
                
            case 'Equal':
            case 'NumpadAdd':
                event.preventDefault();
                const newSizeUp = Math.min(72, this.fontSize + 2);
                this.fontSlider.value = newSizeUp;
                this.updateFontSize(newSizeUp);
                break;
                
            case 'Minus':
            case 'NumpadSubtract':
                event.preventDefault();
                const newSizeDown = Math.max(16, this.fontSize - 2);
                this.fontSlider.value = newSizeDown;
                this.updateFontSize(newSizeDown);
                break;
                
            case 'KeyH':
                event.preventDefault();
                this.showHelp();
                break;
                
            case 'KeyT':
                event.preventDefault();
                // Manual scroll test
                this.testScroll();
                break;
                
            case 'Escape':
                event.preventDefault();
                if (this.helpModal.classList.contains('show')) {
                    this.hideHelp();
                } else if (this.fullscreenMode) {
                    this.toggleFullscreen(false);
                }
                break;
        }
    }
}

// Initialize the teleprompter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const teleprompter = new Teleprompter();
    
    // Make it available globally for debugging
    window.teleprompter = teleprompter;
});

// Service Worker registration for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, which is fine
        });
    });
}