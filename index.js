const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

const isProduction = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION';
const BASE_URL = isProduction 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

const cashfreeHeaders = {
    'x-client-id': process.env.CASHFREE_APP_ID,
    'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

app.post('/api/create-order', async (req, res) => {
    try {
        const { order_id, order_amount, customer_details, order_meta } = req.body;
        const response = await axios.post(`${BASE_URL}/orders`, {
            order_id, order_amount, order_currency: "INR", customer_details, order_meta
        }, { headers: cashfreeHeaders });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Failed", error: error.response ? error.response.data : error.message });
    }
});

app.get('/api/verify-payment/:order_id', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/${req.params.order_id}`, { headers: cashfreeHeaders });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed", error: error.response ? error.response.data : error.message });
    }
});

app.get('/', (req, res) => {
    res.send("Mangalore Movies Payment Backend is running securely!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
