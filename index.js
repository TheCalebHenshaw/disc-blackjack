require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const gameManager = require('./src/game/GameManager');

// Create bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Command prefix
const PREFIX = '$$';

// When bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('Blackjack | !help', { type: 'PLAYING' });
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages and non-prefix messages
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // Parse command and arguments
    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // Command handling
    switch (command) {
        case 'help':
            await handleHelp(message);
            break;
        case 'blackjack':
        case 'bj':
            await handleBlackjack(message);
            break;
        case 'ping':
            await message.reply('Pong! 🏓');
            break;
    }
});

// Button interaction handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // Handle button clicks
    switch (interaction.customId) {
        case 'hit':
            await handleHitButton(interaction);
            break;
        case 'stand':
            await handleStandButton(interaction);
            break;
        case 'quit':
            await handleQuitButton(interaction);
            break;
        case 'new_game':
            await handleNewGameButton(interaction);
            break;
    }
});

// Command handlers
async function handleHelp(message) {
    const helpEmbed = {
        color: 0x0099ff,
        title: '🎰 Blackjack Bot Commands',
        description: 'Welcome to Discord Blackjack! Try to get 21 or beat the dealer!',
        fields: [
            {
                name: '🎮 Starting a Game',
                value: '`$$blackjack` or `$$bj` - Start a new game of blackjack'
            },
            {
                name: '🎯 How to Play',
                value: 'Once you start a game, use the **buttons** to:\n• **Hit** - Draw another card\n• **Stand** - Keep your current hand\n• **Quit** - End the game'
            },
            {
                name: '📋 Rules',
                value: '• Get as close to 21 as possible without going over\n• Face cards = 10, Aces = 1 or 11\n• Dealer must hit on 16 and stand on 17\n• Blackjack (21 with 2 cards) beats regular 21'
            }
        ],
        footer: {
            text: 'Good luck! 🍀'
        }
    };

    await message.channel.send({ embeds: [helpEmbed] });
}

async function handleBlackjack(message) {
    const result = gameManager.createGame(message.author);

    if (!result.success) {
        return message.reply(result.message);
    }

    const embed = result.game.createEmbed();
    const buttons = result.game.createButtons();
    
    await message.channel.send({ 
        embeds: [embed], 
        components: [buttons] 
    });
}

// Button handlers
async function handleHitButton(interaction) {
    const game = gameManager.getGame(interaction.user.id);

    if (!game) {
        return interaction.reply({ 
            content: 'This game is not yours or has expired!', 
            ephemeral: true 
        });
    }

    // Verify the user clicking is the game owner
    if (game.player.id !== interaction.user.id) {
        return interaction.reply({ 
            content: 'This is not your game! Start your own with `$$blackjack`', 
            ephemeral: true 
        });
    }

    game.hit();
    const embed = game.createEmbed();
    const buttons = game.createButtons();

    await interaction.update({ 
        embeds: [embed], 
        components: [buttons] 
    });

    // End game if finished
    if (game.gameState === 'finished') {
        setTimeout(() => {
            gameManager.endGame(interaction.user.id);
        }, 30000); // Clean up after 30 seconds
    }
}

async function handleStandButton(interaction) {
    const game = gameManager.getGame(interaction.user.id);

    if (!game) {
        return interaction.reply({ 
            content: 'This game is not yours or has expired!', 
            ephemeral: true 
        });
    }

    if (game.player.id !== interaction.user.id) {
        return interaction.reply({ 
            content: 'This is not your game! Start your own with `$$blackjack`', 
            ephemeral: true 
        });
    }

    game.stand();
    const embed = game.createEmbed();
    const buttons = game.createButtons();

    await interaction.update({ 
        embeds: [embed], 
        components: [buttons] 
    });

    // Clean up after 30 seconds
    setTimeout(() => {
        gameManager.endGame(interaction.user.id);
    }, 30000);
}

async function handleQuitButton(interaction) {
    const game = gameManager.getGame(interaction.user.id);

    if (!game || game.player.id !== interaction.user.id) {
        return interaction.reply({ 
            content: 'This is not your game!', 
            ephemeral: true 
        });
    }

    gameManager.endGame(interaction.user.id);
    
    await interaction.update({
        embeds: [{
            color: 0xff0000,
            title: '🚪 Game Ended',
            description: 'Thanks for playing! Use `$$blackjack` to start a new game.'
        }],
        components: []
    });
}

async function handleNewGameButton(interaction) {
    // End any existing game
    gameManager.endGame(interaction.user.id);
    
    // Create new game
    const result = gameManager.createGame(interaction.user);

    if (!result.success) {
        return interaction.reply({ 
            content: result.message, 
            ephemeral: true 
        });
    }

    const embed = result.game.createEmbed();
    const buttons = result.game.createButtons();
    
    await interaction.update({ 
        embeds: [embed], 
        components: [buttons] 
    });
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);