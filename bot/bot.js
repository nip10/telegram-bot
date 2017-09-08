require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const env = process.env.NODE_ENV;
const port = process.env.PORT;

const bot = new TelegramBot(token);

if (env === 'development') {
    const ngrok = require('ngrok');
    ngrok.connect(port, (err, url) => {
        if (err) {
            console.log('Unable to get ngrok url');
            // Cant get url for webhook, so we use the pooling method
            return bot.startPolling();
        }
        console.log(`Webhook is running on ${url}`);
        // inform the Telegram servers of the new webhook
        return bot.setWebHook(`${url}/bot${token}`);
    });
} else {
    const url = process.env.WEBHOOK_URL;
    console.log(`Webhook is running on ${url}`);
    bot.setWebHook(`${url}/bot${token}`);
}

// Export bot
module.exports = bot;

// import commands
const commands = require('./commands/index');

// send text message to the handler
bot.on('text', commands.handleText.bind(this));
