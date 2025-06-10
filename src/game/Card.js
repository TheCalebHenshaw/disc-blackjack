class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.value = this.calculateValue();
    }

    calculateValue() {
        if (['J', 'Q', 'K'].includes(this.rank)) return 10;
        if (this.rank === 'A') return 11; // We'll handle soft aces later
        return parseInt(this.rank);
    }

    toString() {
        const suitEmojis = {
            'hearts': '♥️',
            'diamonds': '♦️',
            'clubs': '♣️',
            'spades': '♠️'
        };
        
        // Use special formatting for face cards
        const displayRank = {
            'J': 'J',
            'Q': 'Q',
            'K': 'K',
            'A': 'A'
        }[this.rank] || this.rank;

        return `[${displayRank}${suitEmojis[this.suit]}]`;
    }
}

module.exports = Card;