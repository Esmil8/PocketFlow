const { body, query } = require('express-validator');
const { CATEGORIES } = require('../Models/Budget');

const createBudgetValidation = [
    body('categoria').notEmpty().withMessage('La categoría es requerida').isString().withMessage('La categoría debe ser un texto').custom((val) => {
        if (!val) return true;

        const catUpper = val.toString().toUpperCase();

        if (!CATEGORIES.includes(catUpper)) {
            throw new Error('La categoría no es válida');
        }
        return true;
    }),

    body('limite').notEmpty().withMessage('El límite del presupuesto es requerido').isFloat({ min: 0.01 }).withMessage('El límite debe ser un número mayor a 0'),

    body('mes').optional().isInt({ min: 1, max: 12 }).withMessage('El mes debe estar entre 1 y 12'),

    body('anio').optional().isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un año valido'),

    body('descripcion').optional().isLength({ max: 200 }).withMessage('La descripción no puede tener más de 200 caracteres')
];

const getBudgetsValidation = [
    query('categoria').optional().isString().withMessage('La categoría debe ser un texto'),
    query('mes').optional().isInt({ min: 1, max: 12 }).withMessage('El mes debe estar entre 1 y 12'),
    query('anio').optional().isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un año valido')
];

module.exports = {
    createBudgetValidation,
    getBudgetsValidation
};
