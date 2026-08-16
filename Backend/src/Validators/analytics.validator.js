const { query, validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Parámetros de consulta inválidos',
      details: errors.array()
    });
  }
  next();
};

const monthValidation = [
  query('month')
    .optional()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('El formato de mes debe ser YYYY-MM (ejemplo: 2026-08)'),
  validateResult
];

module.exports = {
  monthValidation
};