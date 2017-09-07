require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 4000;
const token = process.env.TELEGRAM_TOKEN;

// require bot logic
const bot = require('./../bot/bot.js');

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// route to receive updates
app.post(`/bot${token}`, (req, res) => {
    console.log('Received update: ', req.body);
    bot.processUpdate(req.body);
    // remove update from the updates queue by sending a 200 OK
    res.sendStatus(200);
});

// start express server
app.listen(port, () => {
    console.log(`Telegram/Express app listening on port ${port}.`);
});
