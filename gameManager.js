

export class GameManager {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.gamePlayers = [];
        this.availableQuestions = [];
        this.currentPlayerIndex = -1;
    }
    startGame() {
        console.log("Game Manager: Starting game...");
        const players = this.gameState.getPlayers();
        const allQuestions = this.gameState.getAllQuestions();
        if (players.length === 0 || allQuestions.length === 0) {
            console.error("Game cannot start without players and questions.");
            if (players.length === 0) {
                alert('الرجاء إضافة لاعب واحد على الأقل!');
            }
            if (allQuestions.length === 0) {
                // This will catch both the old flow (questions.length === 0) and the new one.
                alert('الرجاء إضافة سؤال واحد على الأقل!');
            }
            return;
        }
        
        // Process questions from the new flow
        this.availableQuestions = this.processPlayerQuestions(allQuestions, players);
        // Also set the main questions array for consistency, though it's not strictly used in the new flow
        this.gameState.setQuestions(this.availableQuestions.map(q => q.text));
        
        // This validation is now primarily handled in uiManager before calling startGame,
        // but we keep it here as a final safeguard.
        if (this.availableQuestions.length % players.length !== 0) {
            console.error("Game started with an invalid number of questions. This should have been caught earlier.");
            // We don't alert here to avoid double alerts.
            return;
        }
        
        // Final validation after processing randoms. Let's ensure questions can be distributed.
        const questionAssignments = {};
        this.availableQuestions.forEach(q => {
            if (!questionAssignments[q.assignedTo]) {
                questionAssignments[q.assignedTo] = 0;
            }
            questionAssignments[q.assignedTo]++;
        });
        // Ensure every player has at least one question.
        for (const player of players) {
            if (!questionAssignments[player.name] || questionAssignments[player.name] === 0) {
                alert(`خطأ: اللاعب ${player.name} ليس لديه أي أسئلة موجهة إليه. لا يمكن بدء اللعبة.`);
                // This is a critical flow error, might need to guide user back.
                return;
            }
        }
        
        // Setup the game with shuffled players and questions
        this.gamePlayers = this.shuffleArray([...players]);
        this.currentPlayerIndex = -1; // Reset index
        this.nextTurn();
    }
    nextTurn() {
        // Check if there are any questions left. If not, end the game.
        if (this.availableQuestions.length === 0) {
            console.log("All questions have been answered. Ending game.");
            this.uiManager.showGameOver();
            return;
        }
        // Move to the next player, looping back to the start if necessary.
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.gamePlayers.length;
        const currentPlayer = this.gamePlayers[this.currentPlayerIndex];
        
        // Find an index for a question assigned to the current player.
        const questionIndex = this.availableQuestions.findIndex(q => q.assignedTo === currentPlayer.name);
        
        if (questionIndex === -1) {
             // This case should be prevented by the validation in startGame, but as a safeguard:
            console.log(`No more questions for ${currentPlayer.name}. Trying next player.`);
            // Instead of ending, let's see if another player has a turn.
            // This is a temporary fix for uneven distribution. The ideal is to ensure even distribution.
            this.nextTurn(); 
            return;
        }
        
        // Get the question data and remove it using its index.
        const questionData = this.availableQuestions.splice(questionIndex, 1)[0];
        
        // Remove the used question from the available pool
        this.currentPlayer = currentPlayer; // Store current player for recordAnswer
        
        // Update the UI with the new turn information.
        this.uiManager.displayTurn(currentPlayer, questionData.text);
    }
    recordAnswer(isCorrect) {
        if (!this.currentPlayer) return;
        if (isCorrect) {
            this.currentPlayer.score++;
            console.log(`${this.currentPlayer.name} answered correctly! Score: ${this.currentPlayer.score}`);
        } else {
            this.currentPlayer.score--;
            console.log(`${this.currentPlayer.name} answered incorrectly. Score: ${this.currentPlayer.score}`);
        }
        
        // Play the character's reaction animation
        this.uiManager.gameScene.playReactionAnimation(isCorrect);
        
        // Re-add the player to the master list to update their score
        const originalPlayer = this.gameState.getPlayers().find(p => p.name === this.currentPlayer.name);
        if(originalPlayer) {
            originalPlayer.score = this.currentPlayer.score;
        }
    }

    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    processPlayerQuestions(allQuestions, players) {
        const finalQuestions = [];
        const playerNames = players.map(p => p.name);
        for (const q of allQuestions) {
            if (q.assignedTo === 'random') {
                // Get a list of players who are NOT the creator of the question
                const possibleTargets = playerNames.filter(name => name !== q.createdBy);
                if (possibleTargets.length > 0) {
                    // Assign randomly to one of them
                    const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                    finalQuestions.push({ ...q, assignedTo: randomTarget });
                } else {
                    // If only one player, assign to themselves (edge case)
                    finalQuestions.push({ ...q, assignedTo: q.createdBy });
                }
            } else {
                finalQuestions.push(q);
            }
        }
        return this.shuffleArray(finalQuestions);
    }
}

