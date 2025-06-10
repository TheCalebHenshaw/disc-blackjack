const BlackjackGame = require('./BlackjackGame');

class GameManager {
    constructor() {
        this.activeGames = new Map(); // userId -> game
    }

    createGame(user) {
        if (this.activeGames.has(user.id)) {
            return { success: false, message: 'You already have an active game!' };
        }

        const game = new BlackjackGame(user);
        this.activeGames.set(user.id, game);
        game.start();

        return { success: true, game };
    }

    getGame(userId) {
        return this.activeGames.get(userId);
    }

    endGame(userId) {
        return this.activeGames.delete(userId);
    }

    hasActiveGame(userId) {
        return this.activeGames.has(userId);
    }
}

// Export a singleton instance
module.exports = new GameManager();