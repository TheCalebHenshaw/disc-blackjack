const Deck = require('./Deck');
const Hand = require('./Hand');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class BlackjackGame {
    constructor(player) {
        this.player = player;
        this.deck = new Deck();
        this.playerHand = new Hand();
        this.dealerHand = new Hand();
        this.gameState = 'betting'; // betting, playing, dealerTurn, finished
        this.bet = 0;
    }

    start(betAmount = 0) {
        this.bet = betAmount;
        this.gameState = 'playing';

        // Deal initial cards
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());

        // Check for immediate blackjack
        if (this.playerHand.isBlackjack()) {
            this.gameState = 'finished';
            this.playDealerHand();
        }
    }

    hit() {
        if (this.gameState !== 'playing') return false;

        this.playerHand.addCard(this.deck.draw());

        if (this.playerHand.isBust()) {
            this.gameState = 'finished';
        }

        return true;
    }

    stand() {
        if (this.gameState !== 'playing') return false;

        this.gameState = 'dealerTurn';
        this.playDealerHand();
        return true;
    }

    playDealerHand() {
        while (this.dealerHand.getValue() < 17) {
            this.dealerHand.addCard(this.deck.draw());
        }
        this.gameState = 'finished';
    }

    getResult() {
        if (this.gameState !== 'finished') return null;

        const playerValue = this.playerHand.getValue();
        const dealerValue = this.dealerHand.getValue();
        const playerBJ = this.playerHand.isBlackjack();
        const dealerBJ = this.dealerHand.isBlackjack();

        if (this.playerHand.isBust()) {
            return { result: 'lose', message: '💥 BUST! You lose!' };
        } else if (this.dealerHand.isBust()) {
            return { result: 'win', message: '💥 Dealer BUST! You win! 🎉' };
        } else if (playerBJ && !dealerBJ) {
            return { result: 'blackjack', message: '🎰 BLACKJACK! You win! 🎉' };
        } else if (!playerBJ && dealerBJ) {
            return { result: 'lose', message: '😔 Dealer has blackjack! You lose!' };
        } else if (playerValue > dealerValue) {
            return { result: 'win', message: '🎉 You win!' };
        } else if (dealerValue > playerValue) {
            return { result: 'lose', message: '😔 Dealer wins!' };
        } else {
            return { result: 'tie', message: '🤝 Push! It\'s a tie!' };
        }
    }

    formatHand(hand, hideSecond = false) {
        if (hideSecond && hand.cards.length > 1) {
            // Show first card and hidden card
            return `${hand.cards[0].toString()} 🎴`;
        }
        return hand.toString();
    }

    createEmbed() {
        const embed = new EmbedBuilder()
            .setTitle('🎰 Blackjack 🎰')
            .setDescription(`**${this.player.username}** vs **Dealer**`)
            .setTimestamp();

        // Determine embed color based on state
        if (this.gameState === 'finished') {
            const result = this.getResult();
            if (result.result === 'win' || result.result === 'blackjack') {
                embed.setColor(0x00ff00); // Green
            } else if (result.result === 'lose') {
                embed.setColor(0xff0000); // Red
            } else {
                embed.setColor(0xffff00); // Yellow
            }
        } else {
            embed.setColor(0x0099ff); // Blue for ongoing game
        }

        // Player's hand
        const playerValue = this.playerHand.getValue();
        const playerTitle = this.playerHand.isBlackjack() ? '🎰 BLACKJACK! 🎰' : `Value: ${playerValue}`;
        embed.addFields({
            name: `Your Hand`,
            value: `\`\`\`${this.formatHand(this.playerHand)}\`\`\`${playerTitle}`,
            inline: true
        });

        // Dealer's hand
        if (this.gameState === 'playing') {
            // Show only first card value
            const firstCardValue = this.dealerHand.cards[0].value;
            embed.addFields({
                name: `Dealer's Hand`,
                value: `\`\`\`${this.formatHand(this.dealerHand, true)}\`\`\`Showing: ${firstCardValue}`,
                inline: true
            });
        } else {
            // Show full hand
            const dealerValue = this.dealerHand.getValue();
            const dealerTitle = this.dealerHand.isBlackjack() ? '🎰 BLACKJACK! 🎰' : `Value: ${dealerValue}`;
            embed.addFields({
                name: `Dealer's Hand`,
                value: `\`\`\`${this.formatHand(this.dealerHand)}\`\`\`${dealerTitle}`,
                inline: true
            });
        }

        // Add result if game is finished
        if (this.gameState === 'finished') {
            const result = this.getResult();
            embed.addFields({
                name: '\u200b',
                value: `**${result.message}**`,
                inline: false
            });
        }

        return embed;
    }

    createButtons() {
        if (this.gameState !== 'playing') {
            // Game is over, show new game button
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('new_game')
                        .setLabel('New Game')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎰')
                );
            return row;
        }

        // Game is active, show hit/stand buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👆'),
                new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId('quit')
                    .setLabel('Quit')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🚪')
            );
        return row;
    }
}

module.exports = BlackjackGame;