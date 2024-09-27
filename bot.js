const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Replace '7599824620:AAGcAoOAVvCBa6rM6f0w0fDcWd8hAL5HBDk' with your actual Telegram bot token
const token = '7599824620:AAGcAoOAVvCBa6rM6f0w0fDcWd8hAL5HBDk';
const bot = new TelegramBot(token, { polling: true });

// Object to hold user balances
let userBalances = {};

// Define mining levels and rewards
const miningLevels = {
    1: { reward: 5 },
    2: { reward: 10 },
    3: { reward: 15 }
};

// Load balances from JSON file
function loadBalances() {
    if (fs.existsSync('balances.json')) {
        const data = fs.readFileSync('balances.json');
        userBalances = JSON.parse(data);
    }
}

// Save balances to JSON file
function saveBalances() {
    fs.writeFileSync('balances.json', JSON.stringify(userBalances));
}

// Call this function on startup
loadBalances();

// Welcome message
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome to the Crypto Mining Bot! Use /mine <duration> to start mining.");
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
    Available Commands:
    /start - Start the bot and receive a welcome message
    /mine <duration> - Mine for a specified duration in seconds
    /balance - Check your current balance
    /leaderboard - View the top miners
    /help - Display this help message
    `;
    bot.sendMessage(chatId, helpMessage);
});

// Start mining command
bot.onText(/\/mine (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const duration = parseInt(match[1]); // Get duration from command
    if (isNaN(duration) || duration <= 0) {
        bot.sendMessage(chatId, "Please provide a valid duration in seconds.");
        return;
    }

    // Check if user already has a balance, if not initialize it
    if (!userBalances[chatId]) {
        userBalances[chatId] = 0; // Initial balance
    }

    // Determine user's mining level based on balance
    let userLevel = Math.floor(userBalances[chatId] / 100); // Every 100 coins increases the level
    const miningReward = miningLevels[userLevel + 1]?.reward || 5; // Default reward

    // Simulate mining process over the specified duration
    setTimeout(() => {
        userBalances[chatId] += miningReward;
        saveBalances(); // Save balances after updating
        bot.sendMessage(chatId, `Mining completed! Your new balance is: ${userBalances[chatId]} coins.`);
    }, duration * 1000); // Convert seconds to milliseconds

    bot.sendMessage(chatId, `Mining for ${duration} seconds...`);
});

// Check balance command
bot.onText(/\/balance/, (msg) => {
    const chatId = msg.chat.id;
    const balance = userBalances[chatId] || 0;
    bot.sendMessage(chatId, `Your current balance is: ${balance} coins.`);
});

// Leaderboard command
bot.onText(/\/leaderboard/, (msg) => {
    const chatId = msg.chat.id;
    // Create an array from userBalances object and sort it
    const leaderboard = Object.entries(userBalances)
        .sort(([, a], [, b]) => b - a) // Sort in descending order
        .map(([userId, balance], index) => `${index + 1}. User ${userId}: ${balance} coins`)
        .join('\n');

    if (leaderboard) {
        bot.sendMessage(chatId, `🏆 Leaderboard:\n${leaderboard}`);
    } else {
        bot.sendMessage(chatId, "No users found.");
    }
});

// Load balances on startup
loadBalances();
