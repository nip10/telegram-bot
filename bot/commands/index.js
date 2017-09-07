const bot = require('./../bot.js');
console.log(bot);

const commands = {};

commands.weather = require('./weather');

commands.handleText = (bot, msg) => {
    const text = msg.text;
    if (/^\/weather(.*)/.test(text)) {
        const match = text.match(/^\/weather(.*)/);
        return commands.weather(bot, msg, match);
    }
    return bot.sendMessage(msg.chat.id, 'Command not found');
};



module.exports = { commands };