require('dotenv').config();

const Promise = require('bluebird');
const rp = require('request-promise');
const knex = require('../../server/db/connection');

const weatherApiKey = process.env.WEATHER_API_KEY;
const googlegeolocationApiKey = process.env.GEOLOCATION_API_KEY;

const getCurrentWeather = (lat, lng) => {
    const options = {
        uri: `https://api.darksky.net/forecast/${weatherApiKey}/${lat},${lng}`,
        json: true,
        qs: {
            exclude: 'minutely,daily,alerts,flags',
            units: 'ca',
        },
    };
    return rp(options).then(res => res.currently).catch(err => console.log(err));
};

const getDailyWeather = (lat, lng) => {
    const options = {
        uri: `https://api.darksky.net/forecast/${weatherApiKey}/${lat},${lng}`,
        json: true,
        qs: {
            exclude: 'minutely,hourly,daily,alerts,flags',
            units: 'ca',
        },
    };
    return rp(options).then(res => res.daily.data[0]).catch(err => console.log(err));
};

const getLocationFromCoords = (lat, lng) => {
    const options = {
        uri: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=${googlegeolocationApiKey}`,
        json: true,
    };
    return rp(options).then(res => res.results[0].address_components[0].long_name).catch(err => console.log(err));
};

const getCoordsFromLocation = (city, country) => {
    const options = {
        uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${city},${country}&key=${googlegeolocationApiKey}`,
        json: true,
    };
    return rp(options).then(res => res.results[0].geometry.location).catch(err => console.log(err));
};

const getAliasCoords = (userId, alias) => knex('weather').select('lat', 'lng').where('user_id', '=', userId).andWhere('alias', '=', alias);

const saveAliasCoords = (userId, alias, lat, lng) => knex('weather').insert({ alias, lat, lng }).where('user_id', '=', userId);

const processWeatherCommand = (lat, lng) => {
    const promises = [getCurrentWeather(lat, lng), getLocationFromCoords(lat, lng)];
    return Promise.all(promises.map(promise => promise.reflect()))
        .then(([currentWeather, location]) => {
            if (currentWeather.isFulfilled()) {
                const weather = currentWeather.value();
                if (location.isFulfilled()) {
                    const loc = location.value();
                    return `It's currently *${(Number.parseFloat(weather.temperature).toFixed(1))} ºC* in *${(loc)}*. Condition: *${weather.summary}*.`;
                }
                return `It's currently *${(Number.parseFloat(weather.temperature).toFixed(1))} ºC* in your location. Condition: *${weather.summary}*.`;
            }
            throw new Error();
        });
};

module.exports = { processWeatherCommand, getAliasCoords, saveAliasCoords, getCoordsFromLocation };
