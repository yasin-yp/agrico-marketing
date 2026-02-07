'use strict';

const express = require('express');
const Twilio = require('twilio');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID'; // Your Twilio Account SID
const authToken = 'YOUR_TWILIO_AUTH_TOKEN'; // Your Twilio Auth Token
const client = new Twilio(accountSid, authToken);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Example cron job that runs every minute
cron.schedule('* * * * *', () => {
    console.log('Cron job running every minute');
    // Implement Twilio messaging logic here
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
