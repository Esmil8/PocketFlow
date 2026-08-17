const express = require('express');
const router = express.Router();

const {
    createBudgetValidation,
    updateBudgetValidation,
    getBudgetsValidation,
    getAlertsValidation
} = require('../Validators/budgets.validator');
const { validate } = require('../Middlewares/validators');
const {
    createBudget,
    getBudgets,
    updateBudget,
    getAlerts
} = require('../Controllers/budgets');

router.post('/', createBudgetValidation, validate, createBudget);
router.get('/', getBudgetsValidation, validate, getBudgets);
router.get('/alerts', getAlertsValidation, validate, getAlerts);
router.put('/:id', updateBudgetValidation, validate, updateBudget);

module.exports = router;
