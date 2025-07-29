

export class GameState {
    constructor() {
        this.questions = []; // This will now store the final, processed questions
        this.players = [];
        this.allQuestions = []; // Raw questions from player input
    }
    clearAllQuestions() {
        this.allQuestions = [];
    }
    addPlayerQuestions(questions) {
        this.allQuestions.push(...questions);
    }
    setQuestions(questions) {
        this.questions = questions;
        console.log('Game State: Questions set', this.questions);
    }

    setPlayers(playerNames) {
        // Initialize players with a name and a score of 0
        this.players = playerNames.map(name => ({ name, score: 0 }));
        console.log('Game State: Players set', this.players);
    }

    getPlayers() {
        return this.players;
    }

    getQuestions() {
        return this.questions;
    }
    getAllQuestions() {
        return this.allQuestions;
    }
}

