

export class SceneManager {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.currentScene = 'Home';
        this.scenes = {
            'Home': this.showHomeScene.bind(this),
            'AddQuestions': this.showAddQuestionsScene.bind(this),
            'AddPlayers': this.showAddPlayersScene.bind(this),
            'EnterQuestionsByPlayer': this.showEnterQuestionsByPlayerScene.bind(this),
            'GameScreen': this.showGameScreenScene.bind(this),
            'Scoreboard': this.showScoreboardScene.bind(this)
        };
    }
    
    goToScene(sceneName) {
        const fromScene = this.currentScene;
        if (this.scenes[sceneName]) {
            this.currentScene = sceneName;
            this.scenes[sceneName](fromScene); // Pass the previous scene
        } else {
            console.error(`Scene "${sceneName}" not found.`);
        }
    }
    
    showHomeScene(fromScene) {
        // This handles returning to the home screen from other scenes
        if (fromScene === 'AddQuestions') {
            const addQuestionsElement = document.getElementById('addQuestionsScene');
            addQuestionsElement.style.opacity = '0';
            
            setTimeout(() => {
                addQuestionsElement.style.display = 'none';
                document.getElementById('ui-overlay').style.display = 'block';
            }, 500);
        } else if (fromScene === 'AddPlayers') {
            const addPlayersElement = document.getElementById('addPlayersScene');
            addPlayersElement.style.opacity = '0';
            
            setTimeout(() => {
                addPlayersElement.style.display = 'none';
                document.getElementById('ui-overlay').style.display = 'block';
            }, 500);
        }
    }
    
    showAddQuestionsScene(fromScene) {
        const addQuestionsElement = document.getElementById('addQuestionsScene');
        // Hide the current scene (AddPlayers)
        if (fromScene === 'AddPlayers') {
            const addPlayersElement = document.getElementById('addPlayersScene');
            addPlayersElement.style.opacity = '0';
            setTimeout(() => {
                addPlayersElement.style.display = 'none';
                // Show the new scene
                addQuestionsElement.style.display = 'flex';
                setTimeout(() => {
                    addQuestionsElement.style.opacity = '1';
                }, 10);
            }, 500);
        } else {
             // Fallback for other transitions if needed
            addQuestionsElement.style.display = 'flex';
            setTimeout(() => {
                addQuestionsElement.style.opacity = '1';
            }, 10);
        }
    }
    
    showAddPlayersScene(fromScene) {
        const addPlayersElement = document.getElementById('addPlayersScene');
        addPlayersElement.style.display = 'flex';
        // Fade in the scene
        setTimeout(() => {
            addPlayersElement.style.opacity = '1';
        }, 10);
        // If coming back from Questions scene, hide it
        if (fromScene === 'AddQuestions') {
            const addQuestionsElement = document.getElementById('addQuestionsScene');
            addQuestionsElement.style.opacity = '0';
            setTimeout(() => {
                addQuestionsElement.style.display = 'none';
            }, 500);
        }
    }
    showEnterQuestionsByPlayerScene(fromScene) {
        const fromElement = document.getElementById('addPlayersScene');
        const toElement = document.getElementById('enterQuestionsByPlayerScene');
        fromElement.style.opacity = '0';
        setTimeout(() => {
            fromElement.style.display = 'none';
            toElement.style.display = 'flex';
            setTimeout(() => {
                toElement.style.opacity = '1';
            }, 10);
        }, 500);
    }
    showGameScreenScene(fromScene) {
        const fromElement = document.getElementById(fromScene === 'EnterQuestionsByPlayer' ? 'enterQuestionsByPlayerScene' : 'addQuestionsScene');
        if (fromElement) {
            fromElement.style.opacity = '0';
            setTimeout(() => {
                fromElement.style.display = 'none';
                const gameScreenElement = document.getElementById('gameScreenScene');
                this.gameScene.show();
                gameScreenElement.style.display = 'flex';
                setTimeout(() => {
                    gameScreenElement.style.opacity = '1';
                }, 10);
            }, 500);
        }
    }
    showScoreboardScene() {
        // This scene is purely for state management; UI is handled by a modal.
        // No visual changes needed here, just updating the state.
        console.log("Transitioning to Scoreboard state");
    }
}

