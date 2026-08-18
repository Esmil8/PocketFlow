// Business logic for the Expenses module. Controllers stay thin; all Mongoose
// queries live here so they can be reused/tested independently (RNF-03: MVC).
const Expense = require('../Models/Expense');

const createExpense = async (data) => {
    const expense = new Expense(data);
    return expense.save();
};

const getAllExpenses = async ({ categoria, desde, hasta } = {}) => {
    const query = {};

    if (categoria) {
        query.categoria = categoria;
    }

    if (desde || hasta) {
        query.fecha = {};
        if (desde) query.fecha.$gte = desde;
        if (hasta) query.fecha.$lte = hasta;
    }

    return Expense.find(query).sort({ fecha: -1, createdAt: -1 });
};

const getExpenseById = async (id) => {
    return Expense.findById(id);
};

const updateExpense = async (id, data) => {
    return Expense.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        context: 'query'
    });
};

const deleteExpense = async (id) => {
    return Expense.findByIdAndDelete(id);
};

module.exports = {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
};
