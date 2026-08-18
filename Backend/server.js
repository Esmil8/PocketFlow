require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/Config/db');
const budgetRoutes = require('./src/Routes/budgets');
const errorHandler = require('./src/Middlewares/errorHandler');
const expensesRoutes = require('./src/Routes/expenses');

const analyticsRoutes = require('./src/Routes/analytics');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.send('PocketFlow API running');
});

app.use('/api/expenses', expensesRoutes);
app.use('/api/budgets', budgetRoutes);


app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`PocketFlow running on http://localhost:${PORT}`);
});