const { processWeatherCommand } = require('../services/weather');
const errors = require('../errors/index');

const weather = (bot, msg, match) => {
    const userId = msg.from.id;
    // Remove white-spaces
    const params = match[1].split(' ').filter(str => str !== '');
    // console.log(params);
    if (!params || params.length === 0) {
        // config for location request
        const options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                one_time_keyboard: true,
                keyboard: [
                    [{ text: 'Share my location', request_location: true }],
                    ['Cancel'],
                ],
            }),
        };
        // ask user for location
        return bot.sendMessage(msg.chat.id, 'Please share your location', options)
            .then(() => {
                // get weather
                bot.once('location', msgLocation => processWeatherCommand(msgLocation.location.latitude, msgLocation.location.longitude)
                                        .then(res => bot.sendMessage(msgLocation.chat.id, res, { parse_mode: 'Markdown' }))
                                        .catch(() => bot.sendMessage(msgLocation.chat.id, errors.weather.server)));
            })
            .catch(() => bot.sendMessage(msg.chat.id, errors.weather.server));
    } else if (params.length === 2 && params.every(val => !isNaN(val))) {
        // two numeric arguments (params = [lat, lng])
        return processWeatherCommand(params[0], params[1])
            .then(res => bot.sendMessage(msg.chat.id, res, { parse_mode: 'Markdown' }))
            .catch(() => bot.sendMessage(msg.chat.id, errors.weather.server));
    }
    // else if (params.length === 1) {
    //     // single argument (params = alias)
    //     // return getCurrentWeather(userId, null, params)
    //     //     .then(res => bot.sendMessage(msg.chat.id, res), { parse_mode: 'Markdown' })
    //     //     .catch(() => bot.sendMessage(msg.chat.id, errors.weather.server));
    //     // TODO: error needs to specify if the problem is: 1. server error; 2. user does not exist; 3. alias is not defined on the db
    // }
    // Error in command arguments
    // Send error message to user
    return bot.sendMessage(msg.chat.id, errors.weather.params);
};

module.exports = weather;
