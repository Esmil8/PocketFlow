// Validation rules for the Expenses module (RNF-04: input validation on every request).
const { body, param, query } = require('express-validator');
const { CATEGORIES } = require('../Models/Expense');

const VALID_CATEGORIES = CATEGORIES.map((c) => c.toUpperCase());

const categoriaField = (chain) =>
    chain
        .isString().withMessage('Category must be text')
        .trim()
        .customSanitizer((value) => value.toUpperCase())
        .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`);

const createExpenseValidator = [
    body('monto')
        .exists({ checkFalsy: true }).withMessage('Amount is required')
        .bail()
        .isFloat({ min: 0.01, max: 999999.99 }).withMessage('Amount must be between 0.01 and 999,999.99'),

    categoriaField(body('categoria').exists().withMessage('Category is required')),

    body('fecha')
        .optional()
        .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)')
        .toDate()
        .custom((value) => value <= new Date()).withMessage('Date cannot be in the future'),

    body('descripcion')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Description must be text')
        .trim()
        .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
];

const updateExpenseValidator = [
    param('id').isMongoId().withMessage('Invalid expense ID'),

    body('monto')
        .optional()
        .isFloat({ min: 0.01, max: 999999.99 }).withMessage('Amount must be between 0.01 and 999,999.99'),

    categoriaField(body('categoria').optional()),

    body('fecha')
        .optional()
        .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)')
        .toDate()
        .custom((value) => value <= new Date()).withMessage('Date cannot be in the future'),

    body('descripcion')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Description must be text')
        .trim()
        .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
];

const idParamValidator = [
    param('id').isMongoId().withMessage('Invalid expense ID')
];

const listQueryValidator = [
    categoriaField(query('categoria').optional()),

    query('desde')
        .optional()
        .isISO8601().withMessage('desde must be a valid date (YYYY-MM-DD)')
        .toDate(),

    query('hasta')
        .optional()
        .isISO8601().withMessage('hasta must be a valid date (YYYY-MM-DD)')
        .toDate()
];

module.exports = {
    createExpenseValidator,
    updateExpenseValidator,
    idParamValidator,
    listQueryValidator
};
