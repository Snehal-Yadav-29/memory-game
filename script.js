// Game State Variables
let currentMode = null;
let currentSequence = [];
let userSelectedSequence = [];
let currentRound = 1;
let sequenceLength = 3;
let isGameActive = false;
let isSequenceShowing = false;

// Memory Analysis Variables
let memoryMetrics = {
    totalRounds: 0,
    longestSequence: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
    responseTimes: [],
    currentGameMode: null,
    roundStartTime: null,
    gameStartTime: null,
    memoryScore: 0,
    memoryLevel: '',
    tips: [],
    lastCorrectSequence: null
};

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const gameSection = document.getElementById('gameSection');
const modeButtons = document.querySelectorAll('.mode-btn');
const backBtn = document.getElementById('backBtn');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const userInput = document.getElementById('userInput');
const sequenceDisplay = document.getElementById('sequenceDisplay');
const sequenceContent = document.getElementById('sequenceContent');
const messageArea = document.getElementById('messageArea');
const currentRoundSpan = document.getElementById('currentRound');
const currentModeSpan = document.getElementById('currentMode');
const gameOverSection = document.getElementById('gameOverSection');
const finalScore = document.getElementById('finalScore');
const correctSequenceSpan = document.getElementById('correctSequence');
const inputSection = document.querySelector('.input-section');
const optionsSection = document.querySelector('.options-section');
const optionsContainer = document.getElementById('optionsContainer');
const userSequenceDisplay = document.getElementById('userSequenceDisplay');
const clearSequenceBtn = document.getElementById('clearSequenceBtn');

// Memory Report DOM Elements
const memoryReportSection = document.getElementById('memoryReportSection');
const reportMode = document.getElementById('reportMode');
const reportRounds = document.getElementById('reportRounds');
const reportLongest = document.getElementById('reportLongest');
const reportAttempts = document.getElementById('reportAttempts');
const reportAvgTime = document.getElementById('reportAvgTime');
const reportScore = document.getElementById('reportScore');
const reportLevel = document.getElementById('reportLevel');
const reportCorrectSequence = document.getElementById('reportCorrectSequence');
const tipsContainer = document.getElementById('tipsContainer');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const historyModal = document.getElementById('historyModal');
const historyContent = document.getElementById('historyContent');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');

// Audio Elements
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');

// Game Data
const gameData = {
    numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    alphabets: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'],
    shapes: ['circle', 'square', 'triangle', 'pentagon', 'cylinder']
};

// Initialize Event Listeners
function initializeEventListeners() {
    // Mode selection buttons
    modeButtons.forEach(button => {
        button.addEventListener('click', () => selectMode(button.dataset.mode));
    });

    // Back button
    backBtn.addEventListener('click', backToHome);

    // Game control buttons
    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    restartBtn.addEventListener('click', resetGame);
    clearSequenceBtn.addEventListener('click', clearUserSequence);

    // Options container event delegation for option buttons
    optionsContainer.addEventListener('click', handleOptionClick);

    // Memory Report buttons
    viewHistoryBtn.addEventListener('click', showHistory);
    playAgainBtn.addEventListener('click', playAgain);
    backToHomeBtn.addEventListener('click', backToHomeFromReport);
    closeHistoryBtn.addEventListener('click', closeHistory);

    // Enter key for submission
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !userInput.disabled) {
            checkAnswer();
        }
    });
}

// Select Game Mode
function selectMode(mode) {
    currentMode = mode;
    
    // Initialize memory metrics for new game
    initializeMemoryMetrics(mode);
    
    // Update UI
    modeButtons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.mode === mode) {
            btn.classList.add('selected');
        }
    });

    // Show game section, hide home screen
    homeScreen.classList.add('hidden');
    gameSection.classList.remove('hidden');
    currentModeSpan.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    
    // Reset game state
    resetGameState();
}

// Initialize Memory Metrics
function initializeMemoryMetrics(mode) {
    memoryMetrics = {
        totalRounds: 0,
        longestSequence: 0,
        correctAttempts: 0,
        wrongAttempts: 0,
        responseTimes: [],
        currentGameMode: mode,
        roundStartTime: null,
        gameStartTime: Date.now(),
        memoryScore: 0,
        memoryLevel: '',
        tips: []
    };
}

// Back to Home Screen
function backToHome() {
    // Stop current game
    isGameActive = false;
    isSequenceShowing = false;
    
    // Reset game state
    resetGameState();
    
    // Clear displays and inputs
    sequenceContent.innerHTML = '';
    userInput.value = '';
    clearMessage();
    gameOverSection.classList.add('hidden');
    
    // Hide game screen, show home screen
    gameSection.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    
    // Remove selection from mode buttons
    modeButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Reset current mode
    currentMode = null;
}

// Generate Random Sequence
function generateSequence(mode, length) {
    const data = gameData[mode];
    const sequence = [];
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * data.length);
        sequence.push(data[randomIndex]);
    }
    
    return sequence;
}

// Display Sequence
function showSequence() {
    if (!currentSequence.length) return;
    
    isSequenceShowing = true;
    sequenceContent.innerHTML = '';
    
    // Create sequence elements based on mode
    currentSequence.forEach((item, index) => {
        setTimeout(() => {
            const element = createSequenceElement(item, currentMode);
            sequenceContent.appendChild(element);
        }, index * 200);
    });
    
    // Hide sequence after 3 seconds
    setTimeout(() => {
        hideSequence();
    }, 3000);
}

// Create Sequence Element Based on Mode
function createSequenceElement(item, mode) {
    const element = document.createElement('div');
    
    switch(mode) {
        case 'numbers':
        case 'alphabets':
            element.className = 'sequence-item';
            element.textContent = item;
            break;
            
        case 'colors':
            element.className = `color-box color-${item}`;
            break;
            
        case 'shapes':
            element.className = `shape shape-${item}`;
            break;
    }
    
    return element;
}

// Hide Sequence and Enable Input/Options
function hideSequence() {
    sequenceContent.innerHTML = '<p style="color: #718096; font-size: 1.2rem;">Your turn! Enter the sequence:</p>';
    isSequenceShowing = false;
    
    // Start timing for response time measurement
    memoryMetrics.roundStartTime = Date.now();
    
    // Clear previous user sequence
    userSelectedSequence = [];
    updateUserSequenceDisplay();
    
    // Show appropriate input method based on mode
    if (currentMode === 'colors' || currentMode === 'shapes') {
        // Show multiple choice options
        inputSection.classList.add('hidden');
        optionsSection.classList.remove('hidden');
        generateOptions();
        
        // Enable clear button for multiple choice
        clearSequenceBtn.disabled = false;
    } else {
        // Show text input
        inputSection.classList.remove('hidden');
        optionsSection.classList.add('hidden');
        userInput.disabled = false;
        userInput.focus();
        submitBtn.disabled = false;
    }
}

// Generate Multiple Choice Options
function generateOptions() {
    optionsContainer.innerHTML = '';
    const allOptions = gameData[currentMode];
    
    // Shuffle options to randomize button positions
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.dataset.value = option;
        button.disabled = false;
        
        // Add visual representation based on mode
        if (currentMode === 'colors') {
            const colorBox = document.createElement('div');
            colorBox.className = `color-box color-${option}`;
            button.appendChild(colorBox);
        } else if (currentMode === 'shapes') {
            const shapeBox = document.createElement('div');
            shapeBox.className = `shape shape-${option}`;
            button.appendChild(shapeBox);
        }
        
        optionsContainer.appendChild(button);
    });
}

// Handle Option Button Click
function handleOptionClick(e) {
    // Find the closest option-btn parent (handles clicks on child elements like color-box or shape)
    const button = e.target.closest('.option-btn');
    if (!button || button.disabled) return;
    
    const selectedValue = button.dataset.value;
    userSelectedSequence.push(selectedValue);
    updateUserSequenceDisplay();
    
    // Check if sequence is complete
    if (userSelectedSequence.length === currentSequence.length) {
        checkSequenceAnswer();
    }
}

// Update User Sequence Display
function updateUserSequenceDisplay() {
    const displayText = userSelectedSequence.map(item => 
        item.charAt(0).toUpperCase() + item.slice(1)
    ).join(' → ');
    userSequenceDisplay.textContent = displayText || 'None';
}

// Clear User Sequence
function clearUserSequence() {
    userSelectedSequence = [];
    updateUserSequenceDisplay();
}

// Check Sequence Answer for Multiple Choice
function checkSequenceAnswer() {
    if (!isGameActive || isSequenceShowing) return;
    
    const isCorrect = userSelectedSequence.length === currentSequence.length && 
                     userSelectedSequence.every((item, index) => item === currentSequence[index]);
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(currentSequence.join(' → '));
    }
}

// Start Game
function startGame() {
    if (!currentMode) {
        showMessage('Please select a mode first!', 'error');
        return;
    }
    
    isGameActive = true;
    startBtn.disabled = true;
    inputSection.classList.add('hidden');
    optionsSection.classList.add('hidden');
    gameOverSection.classList.add('hidden');
    clearMessage();
    
    // Generate and show sequence
    currentSequence = generateSequence(currentMode, sequenceLength);
    showSequence();
}

// Check User Answer
function checkAnswer() {
    if (!isGameActive || isSequenceShowing) return;
    
    const userAnswer = userInput.value.trim().toUpperCase();
    let correctAnswer = '';
    
    // Format correct answer based on mode
    switch(currentMode) {
        case 'numbers':
        case 'alphabets':
            correctAnswer = currentSequence.join('');
            break;
            
        case 'colors':
        case 'shapes':
            correctAnswer = currentSequence.join(' ').toUpperCase();
            break;
    }
    
    // Check if answer is correct
    if (userAnswer === correctAnswer) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(correctAnswer);
    }
}

// Handle Correct Answer
function handleCorrectAnswer() {
    showMessage('Correct! Well done! 🎉', 'success');
    playSound('correct');
    
    // Update memory metrics
    const responseTime = (Date.now() - memoryMetrics.roundStartTime) / 1000;
    memoryMetrics.responseTimes.push(responseTime);
    memoryMetrics.correctAttempts++;
    memoryMetrics.totalRounds++;
    
    // Update longest sequence if current is longer
    if (sequenceLength > memoryMetrics.longestSequence) {
        memoryMetrics.longestSequence = sequenceLength;
    }
    
    // Disable input temporarily
    userInput.disabled = true;
    submitBtn.disabled = true;
    
    // Move to next round
    setTimeout(() => {
        currentRound++;
        sequenceLength++;
        currentRoundSpan.textContent = currentRound;
        
        // Clear input and continue
        userInput.value = '';
        userSelectedSequence = [];
        clearMessage();
        startGame();
    }, 1500);
}

// Handle Wrong Answer
function handleWrongAnswer(correctAnswer) {
    isGameActive = false;
    showMessage('Wrong! Game Over! 😔', 'error');
    playSound('wrong');
    
    // Store the correct sequence for display
    memoryMetrics.lastCorrectSequence = correctAnswer;
    
    // Update memory metrics
    if (memoryMetrics.roundStartTime) {
        const responseTime = (Date.now() - memoryMetrics.roundStartTime) / 1000;
        memoryMetrics.responseTimes.push(responseTime);
    }
    memoryMetrics.wrongAttempts++;
    memoryMetrics.totalRounds++;
    
    // Show memory report after a short delay
    setTimeout(() => {
        generateMemoryReport();
        showMemoryReport();
    }, 1000);
}

// Generate Memory Report
function generateMemoryReport() {
    // Calculate memory score
    const avgResponseTime = memoryMetrics.responseTimes.length > 0 
        ? memoryMetrics.responseTimes.reduce((a, b) => a + b, 0) / memoryMetrics.responseTimes.length 
        : 0;
    
    memoryMetrics.memoryScore = (memoryMetrics.longestSequence * 5) + 
                               (memoryMetrics.correctAttempts * 2) - 
                               (memoryMetrics.wrongAttempts * 1) - 
                               Math.floor(avgResponseTime);
    
    // Determine memory level
    if (memoryMetrics.memoryScore > 40) {
        memoryMetrics.memoryLevel = 'Excellent Memory';
    } else if (memoryMetrics.memoryScore >= 25) {
        memoryMetrics.memoryLevel = 'Good Memory';
    } else if (memoryMetrics.memoryScore >= 15) {
        memoryMetrics.memoryLevel = 'Average Memory';
    } else {
        memoryMetrics.memoryLevel = 'Needs Improvement';
    }
    
    // Generate personalized tips
    generatePersonalizedTips(avgResponseTime);
    
    // Save to localStorage
    saveToHistory();
}

// Generate Personalized Cognitive Improvement Tips
function generatePersonalizedTips(avgResponseTime) {
    const tips = [];
    const accuracy = memoryMetrics.totalRounds > 0 
        ? (memoryMetrics.correctAttempts / memoryMetrics.totalRounds) * 100 
        : 0;
    
    // Performance-based tip generation - focus on areas needing improvement
    
    // Response time improvement tips
    if (avgResponseTime > 4) {
        tips.push({
            text: "Practice 5–10 minutes of daily meditation to improve focus.",
            type: "improvement",
            category: "response-time"
        });
        tips.push({
            text: "Reduce multitasking while studying or working.",
            type: "improvement",
            category: "response-time"
        });
    } else if (avgResponseTime < 2) {
        tips.push({
            text: "Excellent response time! Your processing speed is impressive.",
            type: "acknowledgement",
            category: "response-time"
        });
    }
    
    // Accuracy improvement tips
    if (accuracy < 70) {
        tips.push({
            text: "Use chunking technique: break information into small parts.",
            type: "improvement",
            category: "accuracy"
        });
        tips.push({
            text: "Repeat information aloud to strengthen memory encoding.",
            type: "improvement",
            category: "accuracy"
        });
    } else if (accuracy >= 90) {
        tips.push({
            text: "Outstanding accuracy! Your memory retention is excellent.",
            type: "acknowledgement",
            category: "accuracy"
        });
    }
    
    // Sequence length improvement tips
    if (memoryMetrics.longestSequence < 5) {
        tips.push({
            text: "Train your short-term memory by remembering phone numbers or shopping lists.",
            type: "improvement",
            category: "sequence-length"
        });
        tips.push({
            text: "Play memory-based activities regularly to improve retention.",
            type: "improvement",
            category: "sequence-length"
        });
    } else if (memoryMetrics.longestSequence >= 8) {
        tips.push({
            text: "Amazing sequence memory! You can handle complex information easily.",
            type: "acknowledgement",
            category: "sequence-length"
        });
    }
    
    // Overall score-based tips
    if (memoryMetrics.memoryScore > 30) {
        tips.push({
            text: "Challenge your brain with puzzles, reading, or learning a new skill.",
            type: "improvement",
            category: "challenge"
        });
        tips.push({
            text: "Teach others what you learn to strengthen long-term memory.",
            type: "improvement",
            category: "challenge"
        });
    } else if (memoryMetrics.memoryScore < 10) {
        tips.push({
            text: "Focus on building foundational memory skills with simple exercises.",
            type: "improvement",
            category: "foundation"
        });
    }
    
    // Mode-specific acknowledgements (no improvements needed for mode preference)
    if (memoryMetrics.currentGameMode === 'colors' || memoryMetrics.currentGameMode === 'shapes') {
        if (memoryMetrics.memoryScore > 20) {
            tips.push({
                text: "You have strong visual memory! Use diagrams, charts, and mind maps while studying.",
                type: "acknowledgement",
                category: "visual-strength"
            });
        } else {
            tips.push({
                text: "Visual memory can be strengthened with image association techniques.",
                type: "improvement",
                category: "visual-strength"
            });
        }
    } else {
        if (memoryMetrics.memoryScore > 20) {
            tips.push({
                text: "You have strong symbolic memory! Use notes, keywords, and acronyms to learn faster.",
                type: "acknowledgement",
                category: "symbolic-strength"
            });
        } else {
            tips.push({
                text: "Symbolic memory improves with pattern recognition exercises.",
                type: "improvement",
                category: "symbolic-strength"
            });
        }
    }
    
    // Overall performance acknowledgement
    if (avgResponseTime < 3 && accuracy > 80 && memoryMetrics.memoryScore > 25) {
        tips.push({
            text: "Your working memory and concentration are excellent. Maintain this performance with proper sleep and hydration.",
            type: "acknowledgement",
            category: "overall-performance"
        });
    }
    
    // Separate and balance tips: prioritize improvements, limit to maximum 3 total
    const improvementTips = tips.filter(tip => tip.type === 'improvement');
    const acknowledgementTips = tips.filter(tip => tip.type === 'acknowledgement');
    
    // Excellent memory players get ONLY acknowledgements
    if (memoryMetrics.memoryScore > 40) {
        memoryMetrics.tips = acknowledgementTips.slice(0, 3);
    }
    // If user needs significant improvement, focus on improvements only (max 3)
    else if (memoryMetrics.memoryScore < 15 || accuracy < 60) {
        memoryMetrics.tips = improvementTips.slice(0, 3);
    } 
    // If user is performing well, mix improvements and acknowledgements (max 3 total)
    else {
        const finalTips = [];
        const maxImprovements = Math.min(2, improvementTips.length);
        const maxAcknowledgements = Math.min(1, acknowledgementTips.length);
        
        // Add improvements first
        for (let i = 0; i < maxImprovements; i++) {
            finalTips.push(improvementTips[i]);
        }
        
        // Add acknowledgements
        for (let i = 0; i < maxAcknowledgements; i++) {
            finalTips.push(acknowledgementTips[i]);
        }
        
        memoryMetrics.tips = finalTips.slice(0, 3);
    }
}

// Show Memory Report
function showMemoryReport() {
    // Hide game over section and show memory report
    gameOverSection.classList.add('hidden');
    memoryReportSection.classList.remove('hidden');
    
    // Update report display
    const avgResponseTime = memoryMetrics.responseTimes.length > 0 
        ? (memoryMetrics.responseTimes.reduce((a, b) => a + b, 0) / memoryMetrics.responseTimes.length).toFixed(1)
        : '0.0';
    
    reportMode.textContent = memoryMetrics.currentGameMode.charAt(0).toUpperCase() + memoryMetrics.currentGameMode.slice(1);
    reportRounds.textContent = memoryMetrics.totalRounds;
    reportLongest.textContent = memoryMetrics.longestSequence;
    reportAttempts.textContent = `${memoryMetrics.correctAttempts} / ${memoryMetrics.wrongAttempts}`;
    reportAvgTime.textContent = `${avgResponseTime}s`;
    reportScore.textContent = memoryMetrics.memoryScore;
    
    // Update memory level with appropriate styling
    reportLevel.textContent = memoryMetrics.memoryLevel;
    reportLevel.className = 'metric-value level-badge';
    if (memoryMetrics.memoryScore > 40) {
        reportLevel.classList.add('level-excellent');
    } else if (memoryMetrics.memoryScore >= 25) {
        reportLevel.classList.add('level-good');
    } else if (memoryMetrics.memoryScore >= 15) {
        reportLevel.classList.add('level-average');
    } else {
        reportLevel.classList.add('level-poor');
    }
    
    // Display correct sequence
    displayCorrectSequence();
    
    // Display tips
    displayTips();
}

// Display Correct Sequence
function displayCorrectSequence() {
    if (!memoryMetrics.lastCorrectSequence) {
        reportCorrectSequence.innerHTML = '<p style="color: #718096;">No sequence available</p>';
        return;
    }
    
    const sequence = memoryMetrics.lastCorrectSequence;
    let displayHTML = '';
    
    switch(memoryMetrics.currentGameMode) {
        case 'numbers':
        case 'alphabets':
            // Display as individual items with arrows
            const items = sequence.split('');
            items.forEach((item, index) => {
                displayHTML += `<span class="sequence-item">${item}</span>`;
                if (index < items.length - 1) {
                    displayHTML += '<span class="sequence-arrow">→</span>';
                }
            });
            break;
            
        case 'colors':
            // Display as color boxes with arrows
            const colors = sequence.split(' ');
            colors.forEach((color, index) => {
                displayHTML += `<div class="color-box color-${color}" title="${color}"></div>`;
                if (index < colors.length - 1) {
                    displayHTML += '<span class="sequence-arrow">→</span>';
                }
            });
            break;
            
        case 'shapes':
            // Display as shapes with arrows
            const shapes = sequence.split(' ');
            shapes.forEach((shape, index) => {
                displayHTML += `<div class="shape shape-${shape}" title="${shape}"></div>`;
                if (index < shapes.length - 1) {
                    displayHTML += '<span class="sequence-arrow">→</span>';
                }
            });
            break;
            
        default:
            displayHTML = `<span class="sequence-item">${sequence}</span>`;
    }
    
    reportCorrectSequence.innerHTML = displayHTML;
}

// Display Tips
function displayTips() {
    tipsContainer.innerHTML = '';
    
    memoryMetrics.tips.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        
        const icon = tip.type === 'acknowledgement' ? '🌟' : '💡';
        const badge = tip.type === 'acknowledgement' 
            ? '<span class="tip-badge acknowledgement">Great Job!</span>'
            : '<span class="tip-badge improvement">Improve</span>';
        
        tipElement.innerHTML = `
            <div class="tip-header">
                ${badge}
            </div>
            <p class="tip-text">${icon} ${tip.text}</p>
        `;
        tipsContainer.appendChild(tipElement);
    });
}

// Save to History (API)
async function saveToHistory() {
    try {
        const avgResponseTime = memoryMetrics.responseTimes.length > 0 
            ? (memoryMetrics.responseTimes.reduce((a, b) => a + b, 0) / memoryMetrics.responseTimes.length).toFixed(1)
            : '0.0';
        
        const gameData = {
            player_id: 'default_player',
            game_mode: memoryMetrics.currentGameMode,
            total_rounds: memoryMetrics.totalRounds,
            longest_sequence: memoryMetrics.longestSequence,
            correct_attempts: memoryMetrics.correctAttempts,
            wrong_attempts: memoryMetrics.wrongAttempts,
            avg_response_time: parseFloat(avgResponseTime),
            memory_score: memoryMetrics.memoryScore,
            memory_level: memoryMetrics.memoryLevel,
            tips: memoryMetrics.tips
        };
        
        const response = await fetch('/api/game-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameData)
        });
        
        const result = await response.json();
        
        if (!result.success) {
            console.error('Failed to save game history:', result.error);
            // Fallback to localStorage if API fails
            saveToLocalStorage();
        }
    } catch (error) {
        console.error('Error saving to history:', error);
        // Fallback to localStorage if API fails
        saveToLocalStorage();
    }
}

// Fallback to localStorage
function saveToLocalStorage() {
    const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
    
    const gameRecord = {
        id: Date.now(), // Temporary ID for localStorage
        date: new Date().toISOString(),
        mode: memoryMetrics.currentGameMode,
        total_rounds: memoryMetrics.totalRounds,
        longest_sequence: memoryMetrics.longestSequence,
        correct_attempts: memoryMetrics.correctAttempts,
        wrong_attempts: memoryMetrics.wrongAttempts,
        avg_response_time: memoryMetrics.responseTimes.length > 0 
            ? (memoryMetrics.responseTimes.reduce((a, b) => a + b, 0) / memoryMetrics.responseTimes.length).toFixed(1)
            : '0.0',
        memory_score: memoryMetrics.memoryScore,
        memory_level: memoryMetrics.memoryLevel,
        tips: memoryMetrics.tips
    };
    
    history.unshift(gameRecord);
    
    // Keep only last 10 records
    if (history.length > 10) {
        history.splice(10);
    }
    
    localStorage.setItem('memoryGameHistory', JSON.stringify(history));
}

// Show History (API)
async function showHistory() {
    try {
        const response = await fetch('/api/game-history?player_id=default_player&limit=10');
        const result = await response.json();
        
        if (result.success) {
            displayHistory(result.data);
        } else {
            console.error('Failed to fetch history:', result.error);
            // Fallback to localStorage if API fails
            showLocalStorageHistory();
        }
    } catch (error) {
        console.error('Error fetching history:', error);
        // Fallback to localStorage if API fails
        showLocalStorageHistory();
    }
}

// Display history in modal
function displayHistory(history) {
    historyContent.innerHTML = '';
    
    if (history.length === 0) {
        historyContent.innerHTML = '<p style="text-align: center; color: #718096;">No game history available.</p>';
    } else {
        history.forEach((record) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(record.created_at);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-date">${formattedDate}</span>
                    <span class="history-mode">${record.game_mode}</span>
                </div>
                <div class="history-metrics">
                    <div class="history-metric">
                        <div class="history-metric-value">${record.total_rounds}</div>
                        <div class="history-metric-label">Rounds</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.longest_sequence}</div>
                        <div class="history-metric-label">Longest</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.correct_attempts}/${record.wrong_attempts}</div>
                        <div class="history-metric-label">C/W</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.avg_response_time}s</div>
                        <div class="history-metric-label">Avg Time</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.memory_score}</div>
                        <div class="history-metric-label">Score</div>
                    </div>
                </div>
            `;
            
            historyContent.appendChild(historyItem);
        });
    }
    
    historyModal.classList.remove('hidden');
}

// Fallback to localStorage history
function showLocalStorageHistory() {
    const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
    
    historyContent.innerHTML = '';
    
    if (history.length === 0) {
        historyContent.innerHTML = '<p style="text-align: center; color: #718096;">No game history available.</p>';
    } else {
        history.forEach((record) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-date">${formattedDate}</span>
                    <span class="history-mode">${record.mode}</span>
                </div>
                <div class="history-metrics">
                    <div class="history-metric">
                        <div class="history-metric-value">${record.total_rounds}</div>
                        <div class="history-metric-label">Rounds</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.longest_sequence}</div>
                        <div class="history-metric-label">Longest</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.correct_attempts}/${record.wrong_attempts}</div>
                        <div class="history-metric-label">C/W</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.avg_response_time}s</div>
                        <div class="history-metric-label">Avg Time</div>
                    </div>
                    <div class="history-metric">
                        <div class="history-metric-value">${record.memory_score}</div>
                        <div class="history-metric-label">Score</div>
                    </div>
                </div>
            `;
            
            historyContent.appendChild(historyItem);
        });
    }
    
    historyModal.classList.remove('hidden');
}

// Close History
function closeHistory() {
    historyModal.classList.add('hidden');
}

// Play Again
function playAgain() {
    memoryReportSection.classList.add('hidden');
    resetGameState();
    startGame();
}

// Back to Home from Report
function backToHomeFromReport() {
    memoryReportSection.classList.add('hidden');
    backToHome();
}

// Reset Game
function resetGame() {
    resetGameState();
    // Don't go back to home - just reset the current game
    gameOverSection.classList.add('hidden');
}

// Reset Game State
function resetGameState() {
    currentRound = 1;
    sequenceLength = 3;
    currentSequence = [];
    userSelectedSequence = [];
    isGameActive = false;
    isSequenceShowing = false;
    
    // Reset UI
    currentRoundSpan.textContent = currentRound;
    userInput.value = '';
    userInput.disabled = true;
    submitBtn.disabled = true;
    startBtn.disabled = false;
    clearSequenceBtn.disabled = true;
    inputSection.classList.add('hidden');
    optionsSection.classList.add('hidden');
    sequenceContent.innerHTML = '';
    clearMessage();
}

// Show Message
function showMessage(message, type) {
    messageArea.innerHTML = `<div class="message ${type}">${message}</div>`;
}

// Clear Message
function clearMessage() {
    messageArea.innerHTML = '';
}

// Play Sound
function playSound(type) {
    try {
        if (type === 'correct') {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log('Audio play failed:', e));
        } else if (type === 'wrong') {
            wrongSound.currentTime = 0;
            wrongSound.play().catch(e => console.log('Audio play failed:', e));
        }
    } catch (error) {
        console.log('Sound playback error:', error);
    }
}

// Create Audio Files (Base64 encoded simple sounds)
function createAudioFiles() {
    // Create simple beep sounds using Web Audio API as fallback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create correct sound (ascending tone)
    function playCorrectBeep() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    // Create wrong sound (descending tone)
    function playWrongBeep() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    // Override playSound function with fallback
    window.playCorrectBeep = playCorrectBeep;
    window.playWrongBeep = playWrongBeep;
}

// Initialize Game on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    createAudioFiles();
    
    // Fallback for audio files if they don't exist
    correctSound.addEventListener('error', () => {
        console.log('Correct sound file not found, using fallback');
        correctSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    });
    
    wrongSound.addEventListener('error', () => {
        console.log('Wrong sound file not found, using fallback');
        wrongSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    });
});

// Handle window focus/blur for better user experience
window.addEventListener('blur', () => {
    if (isGameActive && !isSequenceShowing) {
        userInput.blur();
    }
});

window.addEventListener('focus', () => {
    if (isGameActive && !isSequenceShowing && !userInput.disabled) {
        userInput.focus();
    }
});
