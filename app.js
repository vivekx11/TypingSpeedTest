// ===== Configuration =====
const CONFIG = {
    TEST_DURATION: 60,
    UPDATE_INTERVAL: 100,
    WORDS_TO_GENERATE: 200,
    DIFFICULTY_LEVELS: {
        easy: { minLength: 2, maxLength: 5 },
        medium: { minLength: 4, maxLength: 8 },
        hard: { minLength: 6, maxLength: 12 }
    },
    SKILL_THRESHOLDS: {
        beginner: 25,
        intermediate: 45,
        advanced: 70
    },
    STORAGE_KEY: 'typingTestData'
};

// ===== Word Provider Component =====
class WordProvider {
    constructor() {
        this.wordList = {
            easy: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when'],
            medium: ['make', 'can', 'like', 'time', 'just', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'over', 'think', 'also', 'back', 'after', 'use', 'work', 'first', 'well', 'even', 'want', 'because', 'these', 'give', 'most'],
            hard: ['through', 'where', 'before', 'right', 'means', 'picture', 'animal', 'mother', 'world', 'build', 'earth', 'father', 'answer', 'school', 'study', 'still', 'learn', 'plant', 'cover', 'between', 'state', 'never', 'thought', 'mountain', 'together', 'children', 'example', 'always', 'music', 'measure', 'product', 'family', 'direct']
        };
        this.currentDifficulty = 'easy';
    }

    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
    }

    generateWordSequence(count = CONFIG.WORDS_TO_GENERATE) {
        const words = this.wordList[this.currentDifficulty];
        const sequence = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            sequence.push(words[randomIndex]);
        }
        return sequence;
    }
}

// ===== Result Calculator Component =====
class ResultCalculator {
    calculateWPM(correctWords, elapsedSeconds) {
        if (elapsedSeconds === 0) return 0;
        return Math.round((correctWords / elapsedSeconds) * 60);
    }

    calculateCPM(correctChars, elapsedSeconds) {
        if (elapsedSeconds === 0) return 0;
        return Math.round((correctChars / elapsedSeconds) * 60);
    }

    calculateAccuracy(correctChars, totalChars) {
        if (totalChars === 0) return 100;
        return Math.round((correctChars / totalChars) * 100);
    }

    determineSkillLevel(wpm) {
        if (wpm < CONFIG.SKILL_THRESHOLDS.beginner) return 'beginner';
        if (wpm < CONFIG.SKILL_THRESHOLDS.intermediate) return 'intermediate';
        if (wpm <= CONFIG.SKILL_THRESHOLDS.advanced) return 'advanced';
        return 'expert';
    }

    getSkillLevelText(level) {
        return level.charAt(0).toUpperCase() + level.slice(1);
    }

    getComparisonText(wpm) {
        if (wpm < 20) return "Keep practicing! You're building your foundation.";
        if (wpm < 40) return "Good progress! You're faster than average beginners.";
        if (wpm < 60) return "Great job! You're typing faster than most people.";
        if (wpm < 80) return "Excellent! You're in the top tier of typists.";
        return "Outstanding! You're typing at professional speed!";
    }
}

// ===== Timer Component =====
class TimerComponent {
    constructor(onTick, onComplete) {
        this.timeRemaining = CONFIG.TEST_DURATION;
        this.intervalId = null;
        this.isRunning = false;
        this.startTime = null;
        this.onTick = onTick;
        this.onComplete = onComplete;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        
        this.intervalId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.timeRemaining = Math.max(0, CONFIG.TEST_DURATION - elapsed);
            
            this.onTick(this.timeRemaining);
            
            if (this.timeRemaining === 0) {
                this.stop();
                this.onComplete();
            }
        }, CONFIG.UPDATE_INTERVAL);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    reset() {
        this.stop();
        this.timeRemaining = CONFIG.TEST_DURATION;
        this.startTime = null;
    }

    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    getProgress() {
        return ((CONFIG.TEST_DURATION - this.timeRemaining) / CONFIG.TEST_DURATION) * 100;
    }
}


// ===== Sound Manager =====
class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playTone(frequency, duration) {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playCorrect() {
        this.playTone(800, 0.05);
    }

    playIncorrect() {
        this.playTone(200, 0.1);
    }

    playComplete() {
        this.playTone(600, 0.1);
        setTimeout(() => this.playTone(800, 0.15), 100);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ===== Storage Manager =====
class StorageManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY;
    }

    saveResult(result) {
        try {
            const results = this.getResults();
            results.push({
                ...result,
                timestamp: Date.now()
            });
            
            // Keep only last 10 results
            if (results.length > 10) {
                results.shift();
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(results));
        } catch (e) {
            console.error('Failed to save result:', e);
        }
    }

    getResults() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load results:', e);
            return [];
        }
    }

    getTopResults(count = 10) {
        const results = this.getResults();
        return results
            .sort((a, b) => b.wpm - a.wpm)
            .slice(0, count);
    }

    clearResults() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Failed to clear results:', e);
        }
    }
}

// ===== UI Controller Component =====
class UIController {
    constructor() {
        this.elements = {
            timerValue: document.getElementById('timerValue'),
            timerProgress: document.getElementById('timerProgress'),
            wpm: document.getElementById('wpm'),
            cpm: document.getElementById('cpm'),
            accuracy: document.getElementById('accuracy'),
            correctWords: document.getElementById('correctWords'),
            wordsDisplay: document.getElementById('wordsDisplay'),
            typingInput: document.getElementById('typingInput'),
            progressFill: document.getElementById('progressFill'),
            resultsModal: document.getElementById('resultsModal'),
            modalOverlay: document.getElementById('modalOverlay'),
            modalClose: document.getElementById('modalClose'),
            tryAgainBtn: document.getElementById('tryAgainBtn'),
            shareBtn: document.getElementById('shareBtn'),
            finalWpm: document.getElementById('finalWpm'),
            finalCpm: document.getElementById('finalCpm'),
            finalAccuracy: document.getElementById('finalAccuracy'),
            finalCorrectWords: document.getElementById('finalCorrectWords'),
            finalWrongWords: document.getElementById('finalWrongWords'),
            skillLevel: document.getElementById('skillLevel'),
            resultComparison: document.getElementById('resultComparison'),
            restartBtn: document.getElementById('restartBtn'),
            difficultyBtns: document.querySelectorAll('.difficulty-btn'),
            leaderboardBtn: document.getElementById('leaderboardBtn'),
            leaderboardModal: document.getElementById('leaderboardModal'),
            leaderboardClose: document.getElementById('leaderboardClose'),
            leaderboardContent: document.getElementById('leaderboardContent'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            settingsClose: document.getElementById('settingsClose'),
            soundToggle: document.getElementById('soundToggle'),
            themeToggle: document.getElementById('themeToggle'),
            showHintsToggle: document.getElementById('showHintsToggle'),
            inputHint: document.getElementById('inputHint'),
            loadingScreen: document.getElementById('loadingScreen')
        };
        
        this.circleCircumference = 2 * Math.PI * 54; // radius = 54
    }

    hideLoading() {
        setTimeout(() => {
            this.elements.loadingScreen.classList.add('hidden');
        }, 500);
    }

    renderWords(words, currentIndex) {
        this.elements.wordsDisplay.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        words.slice(0, 50).forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.textContent = word;
            wordSpan.dataset.index = index;
            
            if (index === currentIndex) {
                wordSpan.classList.add('current');
            } else if (index < currentIndex) {
                wordSpan.classList.add('completed');
            }
            
            fragment.appendChild(wordSpan);
        });
        
        this.elements.wordsDisplay.appendChild(fragment);
    }

    updateCharacterDisplay(currentWordIndex, typedInput, expectedWord) {
        const wordElements = this.elements.wordsDisplay.querySelectorAll('.word');
        const currentWordElement = wordElements[currentWordIndex];
        
        if (!currentWordElement) return;
        
        currentWordElement.innerHTML = '';
        
        for (let i = 0; i < Math.max(expectedWord.length, typedInput.length); i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            
            if (i < typedInput.length) {
                charSpan.textContent = typedInput[i];
                if (typedInput[i] === expectedWord[i]) {
                    charSpan.classList.add('correct');
                } else {
                    charSpan.classList.add('incorrect');
                }
            } else {
                charSpan.textContent = expectedWord[i];
            }
            
            currentWordElement.appendChild(charSpan);
        }
    }

    markWordComplete(wordIndex, isCorrect) {
        const wordElements = this.elements.wordsDisplay.querySelectorAll('.word');
        const wordElement = wordElements[wordIndex];
        
        if (wordElement) {
            wordElement.classList.add('completed');
            wordElement.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    }

    updateStats(wpm, cpm, accuracy, correctWords) {
        this.elements.wpm.textContent = wpm;
        this.elements.cpm.textContent = cpm;
        this.elements.accuracy.textContent = accuracy;
        this.elements.correctWords.textContent = correctWords;
    }

    updateTimer(seconds) {
        this.elements.timerValue.textContent = seconds;
        
        // Update circular progress
        const progress = (seconds / CONFIG.TEST_DURATION);
        const offset = this.circleCircumference * (1 - progress);
        this.elements.timerProgress.style.strokeDashoffset = offset;
    }

    updateProgress(percentage) {
        this.elements.progressFill.style.width = `${percentage}%`;
    }

    showResults(results) {
        this.elements.finalWpm.textContent = results.wpm;
        this.elements.finalCpm.textContent = results.cpm;
        this.elements.finalAccuracy.textContent = results.accuracy + '%';
        this.elements.finalCorrectWords.textContent = results.correctWords;
        this.elements.finalWrongWords.textContent = results.wrongWords;
        
        const skillLevelText = results.skillLevelText;
        this.elements.skillLevel.textContent = skillLevelText;
        this.elements.skillLevel.className = `skill-badge ${results.skillLevel}`;
        
        this.elements.resultComparison.querySelector('.comparison-text').textContent = results.comparisonText;
        
        this.elements.resultsModal.classList.add('active');
        this.elements.tryAgainBtn.focus();
    }

    hideResults() {
        this.elements.resultsModal.classList.remove('active');
    }

    showLeaderboard(results) {
        if (results.length === 0) {
            this.elements.leaderboardContent.innerHTML = '<p class="leaderboard-empty">Complete a test to see your score!</p>';
        } else {
            const listHTML = results.map((result, index) => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-details">
                        <div class="leaderboard-wpm">${result.wpm} WPM</div>
                        <div class="leaderboard-date">${new Date(result.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div class="skill-badge ${result.skillLevel}">${result.skillLevelText}</div>
                </div>
            `).join('');
            
            this.elements.leaderboardContent.innerHTML = `<div class="leaderboard-list">${listHTML}</div>`;
        }
        
        this.elements.leaderboardModal.classList.add('active');
    }

    hideLeaderboard() {
        this.elements.leaderboardModal.classList.remove('active');
    }

    showSettings() {
        this.elements.settingsModal.classList.add('active');
    }

    hideSettings() {
        this.elements.settingsModal.classList.remove('active');
    }

    disableInput() {
        this.elements.typingInput.disabled = true;
    }

    enableInput() {
        this.elements.typingInput.disabled = false;
        this.elements.typingInput.value = '';
        this.elements.typingInput.focus();
    }

    clearInput() {
        this.elements.typingInput.value = '';
    }

    setDifficulty(difficulty) {
        this.elements.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
        });
    }

    toggleHints(show) {
        this.elements.inputHint.style.display = show ? 'block' : 'none';
    }
}


// ===== Typing Test Engine =====
class TypingTestEngine {
    constructor() {
        this.wordProvider = new WordProvider();
        this.resultCalculator = new ResultCalculator();
        this.uiController = new UIController();
        this.soundManager = new SoundManager();
        this.storageManager = new StorageManager();
        
        this.timer = new TimerComponent(
            (time) => this.handleTimerTick(time),
            () => this.endTest()
        );
        
        this.initializeState();
        this.setupEventListeners();
        this.initializeTest();
        this.soundManager.init();
        
        // Hide loading screen
        this.uiController.hideLoading();
    }

    initializeState() {
        this.testActive = false;
        this.testStarted = false;
        this.currentWordIndex = 0;
        this.words = [];
        this.typedWords = [];
        this.currentInput = '';
        this.correctWords = 0;
        this.wrongWords = 0;
        this.totalCorrectChars = 0;
        this.totalTypedChars = 0;
        this.currentDifficulty = 'easy';
    }

    initializeTest() {
        this.words = this.wordProvider.generateWordSequence();
        this.uiController.renderWords(this.words, this.currentWordIndex);
        this.uiController.updateStats(0, 0, 100, 0);
        this.uiController.updateTimer(CONFIG.TEST_DURATION);
        this.uiController.updateProgress(0);
        this.uiController.enableInput();
        
        // Initialize timer circle
        const circle = this.uiController.elements.timerProgress;
        circle.style.strokeDasharray = this.uiController.circleCircumference;
        circle.style.strokeDashoffset = 0;
    }

    setupEventListeners() {
        // Input events
        this.uiController.elements.typingInput.addEventListener('input', (e) => this.handleInput(e));
        this.uiController.elements.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Modal events
        this.uiController.elements.tryAgainBtn.addEventListener('click', () => this.resetTest());
        this.uiController.elements.modalClose.addEventListener('click', () => this.uiController.hideResults());
        this.uiController.elements.modalOverlay.addEventListener('click', () => this.uiController.hideResults());
        this.uiController.elements.shareBtn.addEventListener('click', () => this.shareResults());
        
        // Control events
        this.uiController.elements.restartBtn.addEventListener('click', () => this.resetTest());
        
        // Difficulty events
        this.uiController.elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.changeDifficulty(btn.dataset.difficulty));
        });
        
        // Leaderboard events
        this.uiController.elements.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.uiController.elements.leaderboardClose.addEventListener('click', () => this.uiController.hideLeaderboard());
        
        // Settings events
        this.uiController.elements.settingsBtn.addEventListener('click', () => this.uiController.showSettings());
        this.uiController.elements.settingsClose.addEventListener('click', () => this.uiController.hideSettings());
        this.uiController.elements.soundToggle.addEventListener('change', (e) => {
            this.soundManager.toggle();
        });
        this.uiController.elements.themeToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('dark-mode', e.target.checked);
        });
        this.uiController.elements.showHintsToggle.addEventListener('change', (e) => {
            this.uiController.toggleHints(e.target.checked);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.resetTest();
            }
        });
        
        // Close modals on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.uiController.hideResults();
                this.uiController.hideLeaderboard();
                this.uiController.hideSettings();
            }
        });
    }

    handleInput(event) {
        if (!this.testActive) return;
        
        const typedInput = event.target.value;
        const expectedWord = this.words[this.currentWordIndex];
        
        this.uiController.updateCharacterDisplay(this.currentWordIndex, typedInput, expectedWord);
    }

    handleKeyDown(event) {
        // Start test on first alphanumeric key
        if (!this.testStarted && event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/)) {
            this.startTest();
        }

        if (!this.testActive) return;

        if (event.key === ' ') {
            event.preventDefault();
            this.submitWord();
        }
    }

    startTest() {
        this.testStarted = true;
        this.testActive = true;
        this.timer.start();
    }

    submitWord() {
        const typedWord = this.uiController.elements.typingInput.value.trim();
        
        if (typedWord === '') return;
        
        const expectedWord = this.words[this.currentWordIndex];
        const isCorrect = typedWord === expectedWord;
        
        if (isCorrect) {
            this.correctWords++;
            this.totalCorrectChars += expectedWord.length;
            this.soundManager.playCorrect();
        } else {
            this.wrongWords++;
            // Count matching characters at same positions
            let matchingChars = 0;
            for (let i = 0; i < Math.min(typedWord.length, expectedWord.length); i++) {
                if (typedWord[i] === expectedWord[i]) {
                    matchingChars++;
                }
            }
            this.totalCorrectChars += matchingChars;
            this.soundManager.playIncorrect();
        }
        
        this.totalTypedChars += typedWord.length;
        
        this.typedWords.push({
            expected: expectedWord,
            typed: typedWord,
            isCorrect: isCorrect
        });
        
        this.uiController.markWordComplete(this.currentWordIndex, isCorrect);
        this.currentWordIndex++;
        this.uiController.clearInput();
        this.uiController.renderWords(this.words, this.currentWordIndex);
        
        this.updateStats();
    }

    handleTimerTick(time) {
        this.uiController.updateTimer(time);
        this.uiController.updateProgress(this.timer.getProgress());
    }

    updateStats() {
        const elapsedSeconds = this.timer.getElapsedTime();
        if (elapsedSeconds === 0) return;
        
        const wpm = this.resultCalculator.calculateWPM(this.correctWords, elapsedSeconds);
        const cpm = this.resultCalculator.calculateCPM(this.totalCorrectChars, elapsedSeconds);
        const accuracy = this.resultCalculator.calculateAccuracy(this.totalCorrectChars, this.totalTypedChars);
        
        this.uiController.updateStats(wpm, cpm, accuracy, this.correctWords);
    }

    endTest() {
        this.testActive = false;
        this.uiController.disableInput();
        this.soundManager.playComplete();
        
        const elapsedSeconds = CONFIG.TEST_DURATION;
        const wpm = this.resultCalculator.calculateWPM(this.correctWords, elapsedSeconds);
        const cpm = this.resultCalculator.calculateCPM(this.totalCorrectChars, elapsedSeconds);
        const accuracy = this.resultCalculator.calculateAccuracy(this.totalCorrectChars, this.totalTypedChars);
        const skillLevel = this.resultCalculator.determineSkillLevel(wpm);
        const skillLevelText = this.resultCalculator.getSkillLevelText(skillLevel);
        const comparisonText = this.resultCalculator.getComparisonText(wpm);
        
        const results = {
            wpm,
            cpm,
            accuracy,
            skillLevel,
            skillLevelText,
            correctWords: this.correctWords,
            wrongWords: this.wrongWords,
            comparisonText,
            difficulty: this.currentDifficulty
        };
        
        // Save to storage
        this.storageManager.saveResult(results);
        
        // Show results
        this.uiController.showResults(results);
    }

    resetTest() {
        this.timer.reset();
        this.initializeState();
        this.uiController.hideResults();
        this.wordProvider.setDifficulty(this.currentDifficulty);
        this.initializeTest();
    }

    changeDifficulty(difficulty) {
        if (this.testActive) {
            if (!confirm('Changing difficulty will restart the test. Continue?')) {
                return;
            }
        }
        
        this.currentDifficulty = difficulty;
        this.wordProvider.setDifficulty(difficulty);
        this.uiController.setDifficulty(difficulty);
        this.resetTest();
    }

    showLeaderboard() {
        const topResults = this.storageManager.getTopResults();
        this.uiController.showLeaderboard(topResults);
    }

    shareResults() {
        const wpm = this.uiController.elements.finalWpm.textContent;
        const accuracy = this.uiController.elements.finalAccuracy.textContent;
        const skillLevel = this.uiController.elements.skillLevel.textContent;
        
        const text = `I just scored ${wpm} WPM with ${accuracy} accuracy on TypeSpeed! My skill level: ${skillLevel} 🚀`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Typing Speed Test Results',
                text: text,
                url: window.location.href
            }).catch(err => console.log('Share failed:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Results copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    // Add SVG gradient for timer
    const svg = document.querySelector('.timer-circle');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'timerGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#667eea');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#764ba2');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Initialize the app
    new TypingTestEngine();
});

// ===== Service Worker Registration (for PWA support) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed:', err);
        });
    });
}
