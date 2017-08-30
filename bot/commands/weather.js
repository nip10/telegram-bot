require('dotenv').config();

const knex = require('./../../server/db/connection');
const rp = require('request-promise');

const weatherApiKey = process.env.WEATHER_API_KEY;

const getCurrentWeather = (lat, lng) => {
    const options = {
        uri: `https://api.darksky.net/forecast/${weatherApiKey}/${lat},${lng}`,
        json: true,
    };
    return rp(options)
            .then(res => `It's currently ${((Number.parseFloat(res.currently.temperature) - 32) / 1.8).toFixed(2)} ºC.`)
            .catch(err => console.log(err));
};

const weather = (userId, coords = null, alias = null) => {
    if (coords) {
        // get weather using coordinates
        return getCurrentWeather(coords[0], coords[1]);
    } else if (alias) {
        // search for alias location in the database using userId + alias
        const coordsFromDb = knex('users').where('telegram_id', '=', userId).join('weather', 'weather.user_id');
        return getCurrentWeather(coordsFromDb[0], coordsFromDb[1]);
    }
    return 'Error';
};

module.exports = weather;
