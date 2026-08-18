// HTTP layer for the Expenses module. Delegates all logic to the service and
// forwards errors to the global errorHandler middleware via next(error).
const expensesService = require('../Services/expenses');

const createExpense = async (req, res, next) => {
    try {
        const { monto, categoria, fecha, descripcion } = req.body;
        const expense = await expensesService.createExpense({ monto, categoria, fecha, descripcion });
        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};

const getAllExpenses = async (req, res, next) => {
    try {
        const { categoria, desde, hasta } = req.query;
        const expenses = await expensesService.getAllExpenses({ categoria, desde, hasta });
        res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (error) {
        next(error);
    }
};

const getExpenseById = async (req, res, next) => {
    try {
        const expense = await expensesService.getExpenseById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, error: 'Expense not found' });
        }
        res.status(200).json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};

const updateExpense = async (req, res, next) => {
    try {
        const { monto, categoria, fecha, descripcion } = req.body;
        const expense = await expensesService.updateExpense(req.params.id, { monto, categoria, fecha, descripcion });
        if (!expense) {
            return res.status(404).json({ success: false, error: 'Expense not found' });
        }
        res.status(200).json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};

const deleteExpense = async (req, res, next) => {
    try {
        const expense = await expensesService.deleteExpense(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, error: 'Expense not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
};
