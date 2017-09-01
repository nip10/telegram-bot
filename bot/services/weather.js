require('dotenv').config();

const Promise = require('bluebird');
const rp = require('request-promise');

const weatherApiKey = process.env.WEATHER_API_KEY;
const googlegeolocationApiKey = process.env.GEOLOCATION_API_KEY;

const getCurrentWeather = (lat, lng) => {
    const options = {
        uri: `https://api.darksky.net/forecast/${weatherApiKey}/${lat},${lng}`,
        json: true,
    };
    return rp(options).then(res => res).catch(err => console.log(err));
};

const getLocationFromCoords = (lat, lng) => {
    const options = {
        uri: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=${googlegeolocationApiKey}`,
        json: true,
    };
    return rp(options).then(res => res.results[0].address_components[0].long_name).catch(err => console.log(err));
};

const processWeatherCommand = (lat, lng) => {
    const promises = [getCurrentWeather(lat, lng), getLocationFromCoords(lat, lng)];
    return Promise.all(promises.map(promise => promise.reflect()))
        .then(([currentWeather, location]) => {
            const errors = {};
            (!currentWeather.isFulfilled()) ? errors.currentWeather = true : currentWeather = currentWeather.value();
            (!location.isFulfilled()) ? errors.location = true : location = location.value();
            if (!currentWeather) throw new Error();
            return `It's currently *${((Number.parseFloat(currentWeather.currently.temperature) - 32) / 1.8).toFixed(1)} ºC* in *${(location) || 'your location'}*.`;
        });
};

module.exports = { processWeatherCommand };
