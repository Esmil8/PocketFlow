require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/Config/db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.send('PocketFlow API running');
});

app.listen(PORT, () => {
    console.log(`PocketFlow running on http://localhost:${PORT}`);
});