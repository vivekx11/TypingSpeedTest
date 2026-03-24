// ===== Configuration ====
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

    updateStats(wpm, cpm, accuracy, correctWords, consistency = 0, peakWpm = 0) {
        this.elements.wpm.textContent = wpm;
        this.elements.cpm.textContent = cpm;
        this.elements.accuracy.textContent = accuracy;
        this.elements.correctWords.textContent = correctWords;
        
        const consistencyEl = document.getElementById('consistency');
        const peakWpmEl = document.getElementById('peakWpm');
        if (consistencyEl) consistencyEl.textContent = consistency;
        if (peakWpmEl) peakWpmEl.textContent = peakWpm;
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

    showResults(results, newAchievements = [], keyboardHeatmap = null) {
        this.elements.finalWpm.textContent = results.wpm;
        this.elements.finalCpm.textContent = results.cpm;
        this.elements.finalAccuracy.textContent = results.accuracy + '%';
        this.elements.finalCorrectWords.textContent = results.correctWords;
        this.elements.finalWrongWords.textContent = results.wrongWords;
        
        const skillLevelText = results.skillLevelText;
        this.elements.skillLevel.textContent = skillLevelText;
        this.elements.skillLevel.className = `skill-badge ${results.skillLevel}`;
        
        this.elements.resultComparison.querySelector('.comparison-text').textContent = results.comparisonText;
        
        // Update detailed analytics
        const consistencyBar = document.getElementById('consistencyBar');
        const consistencyScore = document.getElementById('consistencyScore');
        const errorBar = document.getElementById('errorBar');
        const errorRate = document.getElementById('errorRate');
        
        if (consistencyBar && consistencyScore) {
            consistencyBar.style.width = results.consistency + '%';
            consistencyScore.textContent = results.consistency + '%';
        }
        
        if (errorBar && errorRate) {
            const errorPct = 100 - results.accuracy;
            errorBar.style.width = errorPct + '%';
            errorRate.textContent = errorPct.toFixed(1) + '%';
        }
        
        // Render keyboard heatmap
        if (keyboardHeatmap) {
            keyboardHeatmap.render('keyboardHeatmap');
        }
        
        // Show slowest words
        const slowestWordsList = document.getElementById('slowestWordsList');
        if (slowestWordsList && results.slowestWords) {
            slowestWordsList.innerHTML = results.slowestWords.map(word => 
                `<span class="practice-word">${word}</span>`
            ).join('');
        }
        
        // Show achievements
        const achievementsSection = document.getElementById('achievementsSection');
        if (newAchievements.length > 0 && achievementsSection) {
            achievementsSection.style.display = 'block';
            const achievementsList = document.getElementById('achievementsList');
            if (achievementsList) {
                achievementsList.innerHTML = newAchievements.map(achievement => `
                    <div class="achievement-badge">
                        <span class="achievement-icon">${achievement.icon}</span>
                        <div class="achievement-info">
                            <strong>${achievement.name}</strong>
                            <p>${achievement.description}</p>
                        </div>
                    </div>
                `).join('');
            }
        } else if (achievementsSection) {
            achievementsSection.style.display = 'none';
        }
        
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
        this.wpmChart = new WPMChart('wpmChart');
        this.keyboardHeatmap = new KeyboardHeatmap();
        this.achievementSystem = new AchievementSystem();
        this.analytics = new AdvancedAnalytics();
        this.quoteProvider = new QuoteProvider();
        this.codeProvider = new CodeProvider();
        this.pdfExporter = new PDFExporter();
        
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
        this.currentMode = 'words';
        this.wordStartTime = null;
        this.analytics.reset();
        this.keyboardHeatmap.reset();
        this.wpmChart.reset();
    }

    initializeTest() {
        // Generate content based on mode
        if (this.currentMode === 'quotes') {
            const quote = this.quoteProvider.getRandomQuote();
            this.words = quote.split(' ');
        } else if (this.currentMode === 'code') {
            const code = this.codeProvider.getRandomCode();
            this.words = code.split(' ');
        } else if (this.currentMode === 'custom') {
            const customText = localStorage.getItem('customText');
            if (customText) {
                this.words = customText.split(' ').filter(w => w.length > 0);
            } else {
                this.words = this.wordProvider.generateWordSequence();
            }
        } else {
            this.words = this.wordProvider.generateWordSequence();
        }
        
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
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }
        
        // Control events
        this.uiController.elements.restartBtn.addEventListener('click', () => this.resetTest());
        
        // Mode events
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.changeMode(btn.dataset.mode));
        });
        
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
        
        // Live WPM toggle
        const liveWpmToggle = document.getElementById('liveWpmToggle');
        if (liveWpmToggle) {
            liveWpmToggle.addEventListener('change', (e) => {
                this.wpmChart.toggle();
            });
        }
        
        // Custom text save
        const saveCustomText = document.getElementById('saveCustomText');
        if (saveCustomText) {
            saveCustomText.addEventListener('click', () => {
                const customText = document.getElementById('customTextInput').value;
                if (customText.trim()) {
                    localStorage.setItem('customText', customText.trim());
                    alert('Custom text saved!');
                }
            });
        }
        
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

    changeMode(mode) {
        if (this.testActive) {
            if (!confirm('Changing mode will restart the test. Continue?')) {
                return;
            }
        }
        
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        this.resetTest();
    }

    exportResults() {
        const results = {
            wpm: this.uiController.elements.finalWpm.textContent,
            cpm: this.uiController.elements.finalCpm.textContent,
            accuracy: this.uiController.elements.finalAccuracy.textContent,
            skillLevelText: this.uiController.elements.skillLevel.textContent,
            correctWords: this.uiController.elements.finalCorrectWords.textContent,
            wrongWords: this.uiController.elements.finalWrongWords.textContent,
            consistency: document.getElementById('consistencyScore')?.textContent || '0%',
            peakWpm: this.analytics.getPeakWPM()
        };
        
        this.pdfExporter.exportResults(results);
    }

    handleInput(event) {
        if (!this.testActive) return;
        
        const typedInput = event.target.value;
        const expectedWord = this.words[this.currentWordIndex];
        
        // Record key presses for heatmap
        if (event.data && event.data.length === 1) {
            this.keyboardHeatmap.recordKeyPress(event.data);
        }
        
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
        this.wordStartTime = Date.now();
    }

    submitWord() {
        const typedWord = this.uiController.elements.typingInput.value.trim();
        
        if (typedWord === '') return;
        
        const expectedWord = this.words[this.currentWordIndex];
        const isCorrect = typedWord === expectedWord;
        
        // Record word timing
        const timeTaken = this.wordStartTime ? Date.now() - this.wordStartTime : 0;
        this.analytics.recordWordTiming(expectedWord, timeTaken, isCorrect);
        this.wordStartTime = Date.now();
        
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
        
        // Record WPM for analytics
        this.analytics.recordWPM(wpm);
        
        // Update chart
        this.wpmChart.addDataPoint(wpm, elapsedSeconds);
        
        // Calculate advanced stats
        const consistency = this.analytics.calculateConsistency();
        const peakWpm = this.analytics.getPeakWPM();
        
        this.uiController.updateStats(wpm, cpm, accuracy, this.correctWords, consistency, peakWpm);
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
        const consistency = this.analytics.calculateConsistency();
        const peakWpm = this.analytics.getPeakWPM();
        const slowestWords = this.analytics.getSlowestWords();
        
        const results = {
            wpm,
            cpm,
            accuracy,
            skillLevel,
            skillLevelText,
            correctWords: this.correctWords,
            wrongWords: this.wrongWords,
            comparisonText,
            difficulty: this.currentDifficulty,
            consistency,
            peakWpm,
            slowestWords
        };
        
        // Save to storage
        this.storageManager.saveResult(results);
        
        // Check achievements
        const testCount = this.storageManager.getResults().length;
        const newAchievements = this.achievementSystem.checkAchievements(results, testCount);
        
        // Show results with analytics
        this.uiController.showResults(results, newAchievements, this.keyboardHeatmap);
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


// ===== WPM Chart Component =====
class WPMChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.dataPoints = [];
        this.maxDataPoints = 60;
        this.enabled = true;
    }

    addDataPoint(wpm, time) {
        if (!this.enabled) return;
        
        this.dataPoints.push({ wpm, time });
        if (this.dataPoints.length > this.maxDataPoints) {
            this.dataPoints.shift();
        }
        this.draw();
    }

    draw() {
        if (!this.ctx || !this.enabled) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        if (this.dataPoints.length < 2) return;
        
        // Find max WPM for scaling
        const maxWpm = Math.max(...this.dataPoints.map(p => p.wpm), 100);
        
        // Draw grid
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * i / 5;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();
            
            // Y-axis labels
            this.ctx.fillStyle = '#6b7280';
            this.ctx.font = '12px Inter';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(Math.round(maxWpm * (5 - i) / 5), padding - 10, y + 4);
        }
        
        // Draw line
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * index / (this.maxDataPoints - 1);
            const y = height - padding - (height - 2 * padding) * point.wpm / maxWpm;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();
        
        // Draw gradient fill
        const gradient = this.ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * index / (this.maxDataPoints - 1);
            const y = height - padding - (height - 2 * padding) * point.wpm / maxWpm;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw points
        this.dataPoints.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * index / (this.maxDataPoints - 1);
            const y = height - padding - (height - 2 * padding) * point.wpm / maxWpm;
            
            this.ctx.fillStyle = '#667eea';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    reset() {
        this.dataPoints = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        return this.enabled;
    }
}

// ===== Keyboard Heatmap Component =====
class KeyboardHeatmap {
    constructor() {
        this.keyPresses = {};
        this.keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];
    }

    recordKeyPress(key) {
        const upperKey = key.toUpperCase();
        this.keyPresses[upperKey] = (this.keyPresses[upperKey] || 0) + 1;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        const maxPresses = Math.max(...Object.values(this.keyPresses), 1);
        
        this.keyboardLayout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyDiv = document.createElement('div');
                keyDiv.className = 'keyboard-key';
                keyDiv.textContent = key;
                
                const presses = this.keyPresses[key] || 0;
                const intensity = presses / maxPresses;
                keyDiv.style.background = `rgba(102, 126, 234, ${intensity * 0.8})`;
                keyDiv.style.color = intensity > 0.5 ? 'white' : '#1f2937';
                keyDiv.title = `${key}: ${presses} presses`;
                
                rowDiv.appendChild(keyDiv);
            });
            
            container.appendChild(rowDiv);
        });
    }

    reset() {
        this.keyPresses = {};
    }
}

// ===== Achievement System =====
class AchievementSystem {
    constructor() {
        this.achievements = [
            { id: 'first_test', name: 'First Steps', description: 'Complete your first test', icon: '🎯', unlocked: false },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Reach 60 WPM', icon: '⚡', unlocked: false },
            { id: 'accuracy_master', name: 'Accuracy Master', description: 'Get 95% accuracy', icon: '🎯', unlocked: false },
            { id: 'century_club', name: 'Century Club', description: 'Reach 100 WPM', icon: '💯', unlocked: false },
            { id: 'perfectionist', name: 'Perfectionist', description: 'Get 100% accuracy', icon: '✨', unlocked: false },
            { id: 'consistent', name: 'Consistent Typer', description: 'Maintain 80%+ consistency', icon: '🔥', unlocked: false },
            { id: 'marathon', name: 'Marathon Runner', description: 'Complete 10 tests', icon: '🏃', unlocked: false },
            { id: 'expert', name: 'Expert Typist', description: 'Reach Expert level', icon: '👑', unlocked: false }
        ];
        this.loadProgress();
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('achievements');
            if (saved) {
                const unlocked = JSON.parse(saved);
                this.achievements.forEach(achievement => {
                    if (unlocked.includes(achievement.id)) {
                        achievement.unlocked = true;
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }

    saveProgress() {
        try {
            const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
            localStorage.setItem('achievements', JSON.stringify(unlocked));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }

    checkAchievements(results, testCount) {
        const newlyUnlocked = [];
        
        if (!this.achievements.find(a => a.id === 'first_test').unlocked) {
            this.unlock('first_test');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'first_test'));
        }
        
        if (results.wpm >= 60 && !this.achievements.find(a => a.id === 'speed_demon').unlocked) {
            this.unlock('speed_demon');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'speed_demon'));
        }
        
        if (results.accuracy >= 95 && !this.achievements.find(a => a.id === 'accuracy_master').unlocked) {
            this.unlock('accuracy_master');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'accuracy_master'));
        }
        
        if (results.wpm >= 100 && !this.achievements.find(a => a.id === 'century_club').unlocked) {
            this.unlock('century_club');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'century_club'));
        }
        
        if (results.accuracy === 100 && !this.achievements.find(a => a.id === 'perfectionist').unlocked) {
            this.unlock('perfectionist');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'perfectionist'));
        }
        
        if (results.consistency >= 80 && !this.achievements.find(a => a.id === 'consistent').unlocked) {
            this.unlock('consistent');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'consistent'));
        }
        
        if (testCount >= 10 && !this.achievements.find(a => a.id === 'marathon').unlocked) {
            this.unlock('marathon');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'marathon'));
        }
        
        if (results.skillLevel === 'expert' && !this.achievements.find(a => a.id === 'expert').unlocked) {
            this.unlock('expert');
            newlyUnlocked.push(this.achievements.find(a => a.id === 'expert'));
        }
        
        return newlyUnlocked;
    }

    unlock(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveProgress();
        }
    }

    renderUnlocked(containerId, newlyUnlocked) {
        const container = document.getElementById(containerId);
        if (!container || newlyUnlocked.length === 0) return;
        
        container.innerHTML = newlyUnlocked.map(achievement => `
            <div class="achievement-badge">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <strong>${achievement.name}</strong>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `).join('');
    }
}

// ===== Advanced Analytics =====
class AdvancedAnalytics {
    constructor() {
        this.wpmHistory = [];
        this.wordTimings = [];
    }

    recordWordTiming(word, timeTaken, isCorrect) {
        this.wordTimings.push({ word, timeTaken, isCorrect });
    }

    recordWPM(wpm) {
        this.wpmHistory.push(wpm);
    }

    calculateConsistency() {
        if (this.wpmHistory.length < 2) return 100;
        
        const mean = this.wpmHistory.reduce((a, b) => a + b, 0) / this.wpmHistory.length;
        const variance = this.wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / this.wpmHistory.length;
        const stdDev = Math.sqrt(variance);
        
        // Lower standard deviation = higher consistency
        const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
        return Math.round(consistency);
    }

    getPeakWPM() {
        return this.wpmHistory.length > 0 ? Math.max(...this.wpmHistory) : 0;
    }

    getSlowestWords(count = 5) {
        const correctWords = this.wordTimings.filter(w => w.isCorrect);
        return correctWords
            .sort((a, b) => b.timeTaken - a.timeTaken)
            .slice(0, count)
            .map(w => w.word);
    }

    reset() {
        this.wpmHistory = [];
        this.wordTimings = [];
    }
}

// ===== Quote Provider =====
class QuoteProvider {
    constructor() {
        this.quotes = [
            "The only way to do great work is to love what you do.",
            "Innovation distinguishes between a leader and a follower.",
            "Stay hungry, stay foolish.",
            "The future belongs to those who believe in the beauty of their dreams.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
        ];
    }

    getRandomQuote() {
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }
}

// ===== Code Provider =====
class CodeProvider {
    constructor() {
        this.codeSnippets = [
            "function hello() { return 'world'; }",
            "const arr = [1, 2, 3].map(x => x * 2);",
            "if (condition) { doSomething(); }",
            "for (let i = 0; i < 10; i++) { console.log(i); }",
            "const obj = { key: 'value', num: 42 };"
        ];
    }

    getRandomCode() {
        return this.codeSnippets[Math.floor(Math.random() * this.codeSnippets.length)];
    }
}

// ===== PDF Export =====
class PDFExporter {
    exportResults(results) {
        // Create a simple text-based report
        const report = `
TYPING SPEED TEST RESULTS
========================

WPM: ${results.wpm}
CPM: ${results.cpm}
Accuracy: ${results.accuracy}%
Skill Level: ${results.skillLevelText}

Correct Words: ${results.correctWords}
Wrong Words: ${results.wrongWords}
Consistency: ${results.consistency}%
Peak WPM: ${results.peakWpm}

Date: ${new Date().toLocaleString()}
        `.trim();
        
        // Create blob and download
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typing-test-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
