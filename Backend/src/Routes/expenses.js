// Routes for the Expenses module (RF-01, RF-02.1).
const express = require('express');
const router = express.Router();

const {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
} = require('../Controllers/expenses');

const {
    createExpenseValidator,
    updateExpenseValidator,
    idParamValidator,
    listQueryValidator
} = require('../Validators/expenses.validator');

const { validate } = require('../Middlewares/validators');

router.get('/', listQueryValidator, validate, getAllExpenses);
router.get('/:id', idParamValidator, validate, getExpenseById);
router.post('/', createExpenseValidator, validate, createExpense);
router.put('/:id', updateExpenseValidator, validate, updateExpense);
router.delete('/:id', idParamValidator, validate, deleteExpense);

module.exports = router;
