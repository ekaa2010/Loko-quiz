
import confetti from 'canvas-confetti';
export class UIManager {
    constructor(sceneManager, gameState, homeScene, gameScene) {
        this.sceneManager = sceneManager;
        this.gameState = gameState;
        this.homeScene = homeScene; // Reference to the 3D home scene
        this.gameScene = gameScene; // Reference to the 3D game scene
        this.gameManager = null; // Will be set later
        this.rulesModal = document.getElementById('rulesModal');
        this.exitModal = document.getElementById('exitConfirmationModal');
        this.audioElement = document.getElementById('backgroundMusic');
        this.muteButton = document.getElementById('muteButton');
        this.musicStarted = false;
        
        this.currentPlayerIndexForQuestions = 0;
        this.currentQuestionEntry = null; // Used for the player chooser modal
        
        this.init();
    }
    
    init() {
        this.setupButtons();
        this.setupModal();
        this.setupAddQuestionsScene();
        this.setupAddPlayersScene();
        this.setupGameScreenButtons();
        this.setupScoreboardScene();
        this.setupEnterQuestionsByPlayerScene(); // New scene setup
        this.setupAudioControls();
    }
    
    setGameManager(gameManager) {
        this.gameManager = gameManager;
    }
    
    setupButtons() {
        const startButton = document.getElementById('startButton');
        const rulesButton = document.getElementById('rulesButton');
        
        // Start button functionality
        startButton.addEventListener('click', () => {
            this.animateButtonPress(startButton);
            setTimeout(() => {
                this.handleMusic('stop');
                document.getElementById('ui-overlay').style.display = 'none';
                this.homeScene.hide();
                this.sceneManager.goToScene('AddPlayers');
            }, 300);
        });
        
        // Rules button functionality
        rulesButton.addEventListener('click', () => {
            this.animateButtonPress(rulesButton);
            this.handleMusic('play');
            setTimeout(() => {
                this.showRulesModal();
            }, 200);
        });
        // Add button sound effects (visual feedback)
        [startButton, rulesButton].forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.addButtonGlow(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeButtonGlow(button);
            });
        });
    }
    
    setupModal() {
        const closeBtn = this.rulesModal.querySelector('.close');
        
        // Close modal when clicking the X
        closeBtn.addEventListener('click', () => {
            this.hideRulesModal();
        });
        
        // Close modal when clicking outside
        this.rulesModal.addEventListener('click', (e) => {
            if (e.target === this.rulesModal) {
                this.hideRulesModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.rulesModal.style.display === 'block') {
                this.hideRulesModal();
            }
        });
        
        this.setupExitModal();
    }
    
    showModal(modal, modalContent) {
        modal.style.display = 'block';
        
        // Animate modal entrance
        modalContent.style.transform = 'translate(-50%, -50%) scale(0.8)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transition = 'all 0.3s ease';
            modalContent.style.transform = 'translate(-50%, -50%) scale(1)';
            modalContent.style.opacity = '1';
        }, 10);
    }
    hideModal(modal, modalContent) {
        modalContent.style.transition = 'all 0.2s ease';
        modalContent.style.transform = 'translate(-50%, -50%) scale(0.8)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
            modalContent.style.transition = '';
        }, 200);
    }
    showRulesModal() {
        this.showModal(this.rulesModal, this.rulesModal.querySelector('.modal-content'));
    }
    hideRulesModal() {
        this.hideModal(this.rulesModal, this.rulesModal.querySelector('.modal-content'));
    }
    showExitModal() {
        this.showModal(this.exitModal, this.exitModal.querySelector('.modal-content'));
    }
    hideExitModal() {
        this.hideModal(this.exitModal, this.exitModal.querySelector('.modal-content'));
    }
    setupExitModal() {
        const confirmBtn = this.exitModal.querySelector('#confirmExitBtn');
        const cancelBtn = this.exitModal.querySelector('#cancelExitBtn');
        const closeBtn = this.exitModal.querySelector('.close-exit');
        confirmBtn.addEventListener('click', () => {
            this.animateButtonPress(confirmBtn);
            // Reloading the page is a reliable way to 'exit' to the main menu
            setTimeout(() => window.location.reload(), 200);
        });
        cancelBtn.addEventListener('click', () => {
            this.animateButtonPress(cancelBtn);
            this.hideExitModal();
        });
        closeBtn.addEventListener('click', () => this.hideExitModal());
        
        this.exitModal.addEventListener('click', (e) => {
            if (e.target === this.exitModal) {
                this.hideExitModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.exitModal.style.display === 'block') {
                this.hideExitModal();
            }
        });
    }
    
    animateButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.transition = 'all 0.3s ease';
        }, 100);
    }
    
    addButtonGlow(button) {
        const isStartButton = button.id === 'startButton';
        const glowColor = isStartButton ? 'rgba(233,30,99,0.6)' : 'rgba(33,150,243,0.6)';
        
        button.style.boxShadow = `0 0 20px ${glowColor}, 0 8px 16px rgba(0,0,0,0.3)`;
    }
    
    removeButtonGlow(button) {
        button.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
    }
    
    setupAudioControls() {
        if (!this.muteButton || !this.audioElement) return;
        this.muteButton.addEventListener('click', () => {
            this.audioElement.muted = !this.audioElement.muted;
            this.updateMuteButtonState();
            this.animateButtonPress(this.muteButton);
        });
        
        // Ensure the button reflects the initial state
        this.updateMuteButtonState();
    }
    
    updateMuteButtonState() {
        if (this.audioElement.muted) {
            this.muteButton.textContent = '🔇';
            this.muteButton.classList.add('muted');
        } else {
            this.muteButton.textContent = '🔊';
            this.muteButton.classList.remove('muted');
        }
    }
    handleMusic(action) {
        if (!this.audioElement) return;
    
        if (action === 'play' && !this.musicStarted) {
            this.audioElement.volume = 0.3;
            this.audioElement.play().catch(e => console.error("Audio autoplay failed.", e));
            this.musicStarted = true;
        } else if (action === 'stop') {
            let currentVolume = this.audioElement.volume;
            if (currentVolume > 0 && !this.audioElement.paused) {
                const fadeOut = setInterval(() => {
                    currentVolume -= 0.05;
                    if (currentVolume <= 0) {
                        this.audioElement.volume = 0;
                        this.audioElement.pause();
                        clearInterval(fadeOut);
                    } else {
                        this.audioElement.volume = currentVolume;
                    }
                }, 100);
            }
        }
    }
    
    setupAddQuestionsScene() {
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        const removeQuestionBtn = document.getElementById('removeQuestionBtn');
        const questionsList = document.getElementById('questionsList');
        const backToPlayersBtn = document.getElementById('backToPlayersBtn');
        let questionCount = 1;
        addQuestionBtn.addEventListener('click', () => {
            this.animateButtonPress(addQuestionBtn);
            questionCount++;
            const newQuestionGroup = document.createElement('div');
            newQuestionGroup.className = 'question-input-group';
            newQuestionGroup.innerHTML = `
                <label for="q${questionCount}">السؤال ${questionCount}</label>
                <input type="text" id="q${questionCount}" name="q${questionCount}" placeholder="اكتب سؤالك...">
            `;
            
            questionsList.appendChild(newQuestionGroup);
            
            // Scroll to the new question
            newQuestionGroup.scrollIntoView({ behavior: 'smooth', block: 'end' });
            
            // Focus on the new input
            newQuestionGroup.querySelector('input').focus();
        });
        removeQuestionBtn.addEventListener('click', () => {
            this.animateButtonPress(removeQuestionBtn);
            if (questionCount > 1) {
                questionsList.removeChild(questionsList.lastElementChild);
                questionCount--;
            }
        });
        const startFromQuestionsBtn = document.getElementById('startFromQuestionsBtn');
        startFromQuestionsBtn.addEventListener('click', () => {
            this.animateButtonPress(startFromQuestionsBtn);
            const questionsList = document.getElementById('questionsList');
            const questionInputs = questionsList.querySelectorAll('input');
            const questions = [];
            questionInputs.forEach(input => {
                const questionText = input.value.trim();
                if (questionText) {
                    questions.push(questionText);
                }
            });
            if (questions.length > 0) {
                const players = this.gameState.getPlayers();
                if (questions.length % players.length !== 0) {
                    alert('عدد الاسئله غلط يا معلم ارجع تاني');
                    return;
                }
                // Store questions in the game state
                this.gameState.setQuestions(questions);
                this.sceneManager.goToScene('GameScreen', 'AddQuestions');
                this.gameManager.startGame();
            } else {
                // Optional: Show an alert or message if no questions were added
                alert('الرجاء إضافة سؤال واحد على الأقل!');
            }
        });
        backToPlayersBtn.addEventListener('click', () => {
            this.animateButtonPress(backToPlayersBtn);
            // Transition from AddQuestions back to AddPlayers
            this.sceneManager.goToScene('AddPlayers', 'AddQuestions');
        });
    }
    setupAddPlayersScene() {
        const addPlayerBtn = document.getElementById('addPlayerBtn');
        const removePlayerBtn = document.getElementById('removePlayerBtn');
        const playersList = document.getElementById('playersList');
        const nextFromPlayersBtn = document.getElementById('nextFromPlayersBtn');
        const backToHomeBtn = document.getElementById('backToHomeFromPlayersBtn');
        let playerCount = 1;
        addPlayerBtn.addEventListener('click', () => {
            this.animateButtonPress(addPlayerBtn);
            playerCount++;
            const newPlayerGroup = document.createElement('div');
            newPlayerGroup.className = 'player-input-group';
            newPlayerGroup.innerHTML = `
                <label for="p${playerCount}">اللاعب ${playerCount}</label>
                <input type="text" id="p${playerCount}" name="p${playerCount}" placeholder="اكتب اسم اللاعب...">
            `;
            playersList.appendChild(newPlayerGroup);
            newPlayerGroup.scrollIntoView({ behavior: 'smooth', block: 'end' });
            newPlayerGroup.querySelector('input').focus();
        });
        removePlayerBtn.addEventListener('click', () => {
            this.animateButtonPress(removePlayerBtn);
            if (playerCount > 1) {
                playersList.removeChild(playersList.lastElementChild);
                playerCount--;
            }
        });
        nextFromPlayersBtn.addEventListener('click', () => {
            this.animateButtonPress(nextFromPlayersBtn);
            const playerInputs = playersList.querySelectorAll('input');
            const playerNames = [];
            playerInputs.forEach(input => {
                const playerName = input.value.trim();
                if (playerName) {
                    playerNames.push(playerName);
                }
            });
            // Store players in the game state regardless of count, validation happens in GameManager
            this.gameState.setPlayers(playerNames);
            // Start the new question entry flow
            this.startQuestionEntry();
        });
        backToHomeBtn.addEventListener('click', () => {
            this.animateButtonPress(backToHomeBtn);
            this.homeScene.show();
            this.sceneManager.goToScene('Home', 'AddPlayers');
        });
    }
    displayTurn(player, question) {
        const playerNameEl = document.getElementById('playerName');
        const questionTextEl = document.getElementById('questionText');
        // 1. Reset state for new turn
        this.gameScene.resetBox();
        this.toggleActionButtons(true); // Show answer buttons
        playerNameEl.style.opacity = 0;
        questionTextEl.style.opacity = 0;
        questionTextEl.textContent = ''; // Clear old question
        // 2. Set player name immediately and prepare for animation
        playerNameEl.innerHTML = `🎯 اللاعب: ${player.name}`;
        playerNameEl.style.transition = 'opacity 0.5s ease';
        playerNameEl.style.opacity = 1;
        // Start the animation sequence after a delay
        setTimeout(() => {
            this.gameScene.playUnlockSequence(() => {
                // This callback runs after the box is open
                questionTextEl.innerHTML = `❓ سؤالك: ${question}`;
                questionTextEl.style.transition = 'opacity 0.5s ease';
                questionTextEl.style.opacity = 1;
            });
        }, 500); // Reduced delay for faster start
    }
    showGameOver() {
        // Hide the game screen
        const gameScreen = document.getElementById('gameScreenScene');
        gameScreen.style.opacity = '0';
        this.gameScene.hide();
        this.sceneManager.goToScene('Scoreboard');
        const scoreboardScene = document.getElementById('scoreboardScene');
        const scoreboardList = document.getElementById('scoreboardList');
        const winnerNameEl = document.getElementById('winnerName');
        
        // Clear previous scores
        scoreboardList.innerHTML = '';
        
        // Get final scores and sort them (highest first)
        const players = this.gameState.getPlayers();
        players.sort((a, b) => b.score - a.score);
        
        // Display the winner
        const winner = players[0];
        winnerNameEl.textContent = winner ? winner.name : 'لا يوجد فائز';
        // Animate the winner character
        if (winner) {
            this.gameScene.showWinner();
        }
        // Populate the scoreboard
        players.forEach(player => {
            const scoreEntry = document.createElement('div');
            scoreEntry.className = 'score-entry';
            scoreEntry.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-score">${player.score}</span>
            `;
            scoreboardList.appendChild(scoreEntry);
        });
        
        // Show the scoreboard modal after a delay
        setTimeout(() => {
            gameScreen.style.display = 'none';
            scoreboardScene.style.display = 'block';
            
            // Animate modal entrance
            const modalContent = scoreboardScene.querySelector('.modal-content');
            modalContent.style.transform = 'translate(-50%, -50%) scale(0.8)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.transform = 'translate(-50%, -50%) scale(1)';
                modalContent.style.opacity = '1';
            }, 10);
            
            // Trigger confetti
            this.triggerConfetti();
        }, 500); // Match scene transition duration
    }
    
    setupGameScreenButtons() {
        const correctBtn = document.getElementById('correctBtn');
        const incorrectBtn = document.getElementById('incorrectBtn');
        const nextTurnBtn = document.getElementById('nextTurnBtn');
        const gameExitBtn = document.getElementById('gameExitBtn');
        correctBtn.addEventListener('click', () => {
            this.gameManager.recordAnswer(true);
            this.toggleActionButtons(false);
        });
        incorrectBtn.addEventListener('click', () => {
            this.gameManager.recordAnswer(false);
            this.toggleActionButtons(false);
        });
        nextTurnBtn.addEventListener('click', () => {
            this.gameManager.nextTurn();
            this.toggleActionButtons(true);
        });
        gameExitBtn.addEventListener('click', () => {
            this.animateButtonPress(gameExitBtn);
            this.showExitModal();
        });
    }
    toggleActionButtons(showAnswerButtons) {
        const correctBtn = document.getElementById('correctBtn');
        const incorrectBtn = document.getElementById('incorrectBtn');
        const nextTurnBtn = document.getElementById('nextTurnBtn');
        if (showAnswerButtons) {
            correctBtn.style.display = 'block';
            incorrectBtn.style.display = 'block';
            nextTurnBtn.classList.remove('visible');
            
        } else {
            correctBtn.style.display = 'none';
            incorrectBtn.style.display = 'none';
            nextTurnBtn.classList.add('visible');
        }
    }
    setupScoreboardScene() {
        const playAgainBtn = document.getElementById('playAgainBtn');
        playAgainBtn.addEventListener('click', () => {
            this.animateButtonPress(playAgainBtn);
            // A simple page reload is the easiest way to reset the entire game state
            setTimeout(() => {
                window.location.reload();
            }, 200);
        });
    }
    // No longer need the old javascript-injected keyframes
    triggerConfetti() {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1001 };
        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }
        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
    startQuestionEntry() {
        this.gameState.clearAllQuestions();
        this.currentPlayerIndexForQuestions = 0;
        this.sceneManager.goToScene('EnterQuestionsByPlayer', 'AddPlayers');
        this.displayEnterQuestionsForPlayer(0);
    }
    setupEnterQuestionsByPlayerScene() {
        const addBtn = document.getElementById('addAnotherQuestionBtn');
        const removeBtn = document.getElementById('removeAnotherQuestionBtn');
        const nextBtn = document.getElementById('nextPlayerBtn');
        const modal = document.getElementById('playerChooserModal');
        const closePlayerChooser = modal.querySelector('.close-player-chooser');
        addBtn.addEventListener('click', () => {
            this.animateButtonPress(addBtn);
            this.addQuestionEntry();
        });
        removeBtn.addEventListener('click', () => {
            this.animateButtonPress(removeBtn);
            const list = document.getElementById('questionsByPlayerList');
            // Only remove if there's more than one question entry
            if (list.childElementCount > 1) {
                list.removeChild(list.lastElementChild);
                this.updateTotalQuestionCount();
            }
        });
        nextBtn.addEventListener('click', () => {
            this.animateButtonPress(nextBtn);
            this.handleNextPlayer();
        });
        closePlayerChooser.addEventListener('click', () => this.hideModal(modal, modal.querySelector('.modal-content')));
        modal.addEventListener('click', (e) => {
             if (e.target === modal) this.hideModal(modal, modal.querySelector('.modal-content'));
        });
    }
    displayEnterQuestionsForPlayer(playerIndex) {
        const players = this.gameState.getPlayers();
        if (playerIndex >= players.length) return; // Should not happen
        const player = players[playerIndex];
        const title = document.getElementById('currentPlayerName');
        const list = document.getElementById('questionsByPlayerList');
        const nextBtn = document.getElementById('nextPlayerBtn');
        
        title.textContent = `اللاعب: ${player.name}`;
        list.innerHTML = ''; // Clear previous player's questions
        
        this.addQuestionEntry(); // Add the first question entry for this player
        
        // Change button text for the last player
        if (playerIndex === players.length - 1) {
            nextBtn.innerHTML = '🚀 ابدأ اللعبة';
            nextBtn.style.background = 'linear-gradient(45deg, #4caf50, #8bc34a)';
        } else {
            nextBtn.innerHTML = 'التالي';
            nextBtn.style.background = 'linear-gradient(45deg, #2196f3, #3f51b5)';
        }
    }
    addQuestionEntry() {
        const list = document.getElementById('questionsByPlayerList');
        const entry = document.createElement('div');
        entry.className = 'question-entry';
        const questionId = `q_entry_${Date.now()}`;
        
        entry.innerHTML = `
            <input type="text" placeholder="اكتب سؤالك هنا..." class="question-text-input">
            <div class="assignment-options">
                <button class="assignment-btn choose-player-btn">🎯 اختيار لاعب</button>
                <button class="assignment-btn random-btn selected">🔄 عشوائي</button>
            </div>
            <div class="assigned-player-name"></div>
        `;
        list.appendChild(entry);
        this.updateTotalQuestionCount();
        entry.dataset.assignedTo = 'random'; // Default to random
        // Add event listeners for the new buttons
        const chooseBtn = entry.querySelector('.choose-player-btn');
        const randomBtn = entry.querySelector('.random-btn');
        chooseBtn.addEventListener('click', () => {
            // Deselect random, select this one
            randomBtn.classList.remove('selected');
            chooseBtn.classList.add('selected');
            this.currentQuestionEntry = entry; // Store context for the modal
            this.showPlayerChooser();
        });
        randomBtn.addEventListener('click', () => {
            // Deselect player, select this one
            chooseBtn.classList.remove('selected');
            randomBtn.classList.add('selected');
            entry.dataset.assignedTo = 'random';
            entry.querySelector('.assigned-player-name').textContent = '';
        });
        
        entry.scrollIntoView({ behavior: 'smooth', block: 'end' });
        entry.querySelector('input').focus();
        return entry;
    }
    
    showPlayerChooser() {
        const modal = document.getElementById('playerChooserModal');
        const list = document.getElementById('playerChoiceList');
        const players = this.gameState.getPlayers();
        const currentPlayer = players[this.currentPlayerIndexForQuestions];
        
        list.innerHTML = '';
        players.forEach(player => {
            if (player.name === currentPlayer.name) return; // Can't assign to self
            
            const btn = document.createElement('button');
            btn.className = 'player-choice-btn';
            btn.textContent = player.name;
            btn.addEventListener('click', () => {
                // Set assignment data on the original entry
                this.currentQuestionEntry.dataset.assignedTo = player.name;
                this.currentQuestionEntry.querySelector('.assigned-player-name').textContent = `موجه إلى: ${player.name}`;
                this.hideModal(modal, modal.querySelector('.modal-content'));
            });
            list.appendChild(btn);
        });
        
        this.showModal(modal, modal.querySelector('.modal-content'));
    }
    
    handleNextPlayer() {
        const players = this.gameState.getPlayers();
        const currentPlayer = players[this.currentPlayerIndexForQuestions];
        
        // Safeguard against errors if a player name is empty, which can cause `currentPlayer` to be undefined.
        if (!currentPlayer) {
            alert('حدث خطأ. الرجاء التأكد من إدخال أسماء لجميع اللاعبين.');
            return;
        }
        
        // Collect questions from the current player
        const questionsList = document.getElementById('questionsByPlayerList');
        const entries = questionsList.querySelectorAll('.question-entry');
        const playerQuestions = [];
        let allValid = true;
        entries.forEach(entry => {
            const text = entry.querySelector('input').value.trim();
            const assignedTo = entry.dataset.assignedTo;
            if (text) {
                playerQuestions.push({
                    text: text,
                    createdBy: currentPlayer.name,
                    assignedTo: assignedTo || 'random'
                });
            } else {
                allValid = false;
            }
        });
        if (!allValid || playerQuestions.length === 0) {
            alert('الرجاء تعبئة جميع حقول الأسئلة قبل المتابعة.');
            return;
        }
        this.gameState.addPlayerQuestions(playerQuestions);
        // Move to next player or start game
        this.currentPlayerIndexForQuestions++;
        if (this.currentPlayerIndexForQuestions < players.length) {
            this.displayEnterQuestionsForPlayer(this.currentPlayerIndexForQuestions);
        } else {
            // Last player finished, validate and start the game
            const allQuestions = this.gameState.getAllQuestions();
            if (allQuestions.length % players.length !== 0) {
                 alert('خطأ: العدد الإجمالي للأسئلة (' + allQuestions.length + ') يجب أن يكون قابلاً للقسمة على عدد اللاعبين ('+ players.length +') لضمان العدل.');
                 // Don't proceed to game start
                 return;
            }
            this.sceneManager.goToScene('GameScreen', 'EnterQuestionsByPlayer');
            this.gameManager.startGame();
        }
    }
    updateTotalQuestionCount() {
        const savedCount = this.gameState.getAllQuestions().length;
        const currentScreenCount = document.getElementById('questionsByPlayerList').childElementCount;
        const total = savedCount + currentScreenCount;
        const counterEl = document.getElementById('totalQuestionsCounter');
        counterEl.textContent = `الإجمالي: ${total}`;
    }
}