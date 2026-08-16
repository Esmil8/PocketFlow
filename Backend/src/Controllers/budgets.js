const budgetsService = require('../Services/budgets');

const createBudget = async (req, res, next) => {
    try {
        const presupuesto = await budgetsService.createBudget(req.body);
        res.status(201).json({
            success: true,
            message: 'Presupuesto creado exitosamente',
            data: presupuesto
        });
    } catch (error) {
        next(error);
    }
};

const getBudgets = async (req, res, next) => {
    try {
        const presupuestos = await budgetsService.getBudgets(req.query);
        res.status(200).json({
            success: true,
            count: presupuestos.length,
            data: presupuestos
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBudget,
    getBudgets
};
