const express = require('express');
const dotenv = require('dotenv');
const twilio = require('twilio');
const cron = require('node-cron');
const mongoose = require('mongoose');
dotenv.config();

const app = express();
app.use(express.json());

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});

app.post('/api/inventory', async (req, res) => {
    try {
        const {productName, openingStock, outgoing, closingStock, expenses} = req.body;
        const inventory = new Inventory({productName, openingStock, outgoing, closingStock, expenses, date: new Date()});
        await inventory.save();
        res.status(201).json({message: 'Inventory saved successfully', inventory});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post('/api/send-whatsapp', async (req, res) => {
    try {
        const {phoneNumber, message} = req.body;
        const result = await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${phoneNumber}`
        });
        res.status(200).json({message: 'WhatsApp message sent', result});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

cron.schedule('0 8 * * *', async () => {
    console.log('Running daily WhatsApp notification...');
    try {
        const latestInventory = await Inventory.findOne().sort({date: -1});
        const message = `📊 Daily Inventory Report\nProduct: ${latestInventory.productName}\nOpening Stock: ${latestInventory.openingStock} kg\nOutgoing: ${latestInventory.outgoing} kg\nClosing Stock: ${latestInventory.closingStock} kg\nExpenses: ${latestInventory.expenses}\nDate: ${latestInventory.date.toLocaleDateString()}`;
        const recipients = process.env.WHATSAPP_RECIPIENTS.split(',');
        for (const phoneNumber of recipients) {
            await twilioClient.messages.create({
                body: message,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${phoneNumber}`
            });
        }
        console.log('Daily messages sent successfully');
    } catch (error) {
        console.error('Error sending daily messages:', error);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
