require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const errors = require('./errors/index');

const token = process.env.TELEGRAM_TOKEN;
const url = process.env.WEBHOOK_URL;

const bot = new TelegramBot(token);

// inform the Telegram servers of the new webhook
bot.setWebHook(`${url}/bot${token}`);

const { commands } = require('./commands/index');

// bot.onText(/^\/loc/, (msg) => {
    // const options = {
    //     parse_mode: 'Markdown',
    //     reply_markup: JSON.stringify({
    //         one_time_keyboard: true,
    //         keyboard: [
    //             [{ text: 'My location', request_location: true }],
    //             ['Cancel'],
    //         ],
    //     }),
    // };
    // bot.sendMessage(msg.chat.id, 'Please share your location', options)
    //     .then(() => {
    //         bot.once('location', (msg) => {
    //             bot.sendMessage(msg.chat.id, `Your location is: ${[msg.location.longitude, msg.location.latitude].join(';')}`);
    //         });
    //         console.log(`Received location: ${msg.location.longitude + ' ' + msg.location.latitude}`);
    //     })
    //     .catch(err => console.log(`Error: ${err}`));
// });

// Usage:
// /weather (ask user for location)
// /weather lat lng (user inputs location coords manually)
// /weather alias (get location using alias from the db)
bot.onText(/^\/weather(.*)/, (msg, match) => {
    // console.log(match);
    const userId = msg.from.id;
    // Remove white-spaces
    const params = match[1].split(' ').filter(str => str !== '');
    // console.log(params);
    if (!params) {
        // ask user for location
        const options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                one_time_keyboard: true,
                keyboard: [
                    [{ text: 'My location', request_location: true }],
                    ['Cancel'],
                ],
            }),
        };
        // TODO: This down here !!!
        bot.sendMessage(msg.chat.id, 'Please share your location', options)
            .then(() => {
                bot.once('location', (msg) => {
                    bot.sendMessage(msg.chat.id, `Your location is: ${[msg.location.longitude, msg.location.latitude].join(';')}`);
                });
                console.log(`Received location: ${msg.location.longitude + ' ' + msg.location.latitude}`);
            })
            .catch(err => console.log(`Error: ${err}`));

        // get weather
    } else if (params.length === 2 && params.every(val => !isNaN(val))) {
        // Two numeric arguments (params = [lat, lng])
        return commands.weather(userId, params)
            .then(weather => bot.sendMessage(msg.chat.id, weather))
            .catch(() => bot.sendMessage(msg.chat.id, errors.weather.server));
    } else if (params.length === 1) {
        // Single argument (params = alias)
        return commands.weather(userId, null, params)
            .then(weather => bot.sendMessage(msg.chat.id, weather))
            .catch(() => bot.sendMessage(msg.chat.id, errors.weather.server));
        // TODO: error needs to specify if the problem is: 1. server error; 2. user does not exist; 3. alias is not defined on the db
    }
    // Error in command arguments
    // Send error message to user
    return bot.sendMessage(msg.chat.id, errors.weather.params);
});

module.exports = { bot, token };
