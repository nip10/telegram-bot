const bot = require('./../bot.js');

const commands = {};

commands.weather = require('./weather');

commands.handleText = (msg) => {
    const text = msg.text;
    if (/^\/weather(.*)/.test(text)) {
        return commands.weather(bot, msg);
    }
    return bot.sendMessage(msg.chat.id, 'Command not found');
};

module.exports = commands;
