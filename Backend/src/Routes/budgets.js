const express = require('express');
const router = express.Router();

const { createBudgetValidation, getBudgetsValidation } = require('../Validators/budgets.validator');
const { validate } = require('../Middlewares/validators');
const { createBudget, getBudgets } = require('../Controllers/budgets');

router.post('/', createBudgetValidation, validate, createBudget);

router.get('/', getBudgetsValidation, validate, getBudgets);

module.exports = router;
