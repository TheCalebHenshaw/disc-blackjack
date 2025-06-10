class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    getValue() {
        let value = 0;
        let aces = 0;

        // First, add up all non-ace cards and count aces
        for (const card of this.cards) {
            if (card.rank === 'A') {
                aces += 1;
                value += 11;
            } else {
                value += card.value;
            }
        }

        // Adjust for aces if we're over 21
        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }

        return value;
    }

    isBust() {
        return this.getValue() > 21;
    }

    isBlackjack() {
        return this.cards.length === 2 && this.getValue() === 21;
    }

    toString() {
        return this.cards.map(card => card.toString()).join(' ');
    }
}

module.exports = Hand;