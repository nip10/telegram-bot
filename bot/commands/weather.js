const { processWeatherCommand, getAliasCoords, saveAliasCoords, getCoordsFromLocation } = require('../services/weather');
const errors = require('../errors/index');

const weather = (bot, msg) => {
    // Split arguments (and remove the command)
    const args = msg.text.split(' ').filter(str => str !== '' && str !== '/weather');
    const userId = msg.from.id;
    if (!args || args.length === 0) {
        // Get location from user's gps
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
        return bot.sendMessage(userId, 'Please share your location', options)
            .then(() => {
                // get weather
                bot.once('location', msgLocation => processWeatherCommand(msgLocation.location.latitude, msgLocation.location.longitude)
                                        .then(res => bot.sendMessage(userId, res, { parse_mode: 'Markdown' }))
                                        .catch(() => bot.sendMessage(userId, errors.weather.server)));
            })
            .catch(() => bot.sendMessage(userId, errors.weather.server));
    } else if (args.length === 2 && args.every(val => !isNaN(val))) {
        // Get weather from coordinates (args[0, 1] = [lat, lng])
        // two numeric arguments (args = [lat, lng])
        return processWeatherCommand(...args)
            .then(res => bot.sendMessage(userId, res, { parse_mode: 'Markdown' }))
            .catch(() => bot.sendMessage(userId, errors.weather.server));
    } else if (args.length === 4 && args[0] === 'alias') {
        // Save new alias (args[1] = aliasName, args[2, 3] = [lat, lng] || [city, country])
        if (!isNaN(args[2]) && !isNaN(args[3])) {
            // two numeric arguments (args = [lat, lng])
            return saveAliasCoords(userId, args[1], args[2], args[3])
                .then(() => bot.sendMessage(userId, `Alias ${args[1]} saved successfully`))
                .catch(() => bot.sendMessage(userId, errors.weather.server));
        }
        // two non-numeric arguments (args = [city, country])
        return getCoordsFromLocation(args[2], args[2])
            .then(res => saveAliasCoords(userId, args[1], res.lat, res.lng))
            .then(() => bot.sendMessage(userId, `Alias ${args[1]} saved successfully`))
            .catch(() => bot.sendMessage(userId, errors.weather.server));
    } else if (args.length === 1 && isNaN(args[0])) {
        // Get weather from alias (args[0] = aliasName)
        // single non-numeric argument (args[0] = alias)
        getAliasCoords.then(res => console.log(res)).catch(e => console.log(e));
    }
    // else if (args.length === 1) {
    //     // single argument (args = alias)
    //     // const userId = msg.from.id;
    //     // return getCurrentWeather(userId, null, args)
    //     //     .then(res => bot.sendMessage(userId, res), { parse_mode: 'Markdown' })
    //     //     .catch(() => bot.sendMessage(userId, errors.weather.server));
    //     // TODO: error needs to specify if the problem is: 1. server error; 2. user does not exist; 3. alias is not defined on the db
    // }
    // Error in command arguments
    // Send error message to user
    return bot.sendMessage(userId, errors.weather.args);
};

module.exports = weather;
