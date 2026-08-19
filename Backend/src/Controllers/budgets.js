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

const updateBudget = async (req, res, next) => {
    try {
        const presupuesto = await budgetsService.updateBudget(req.params.id, req.body);

        if (!presupuesto) {
            return res.status(404).json({
                success: false,
                error: 'Presupuesto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Presupuesto actualizado exitosamente',
            data: presupuesto
        });
    } catch (error) {
        next(error);
    }
};

const deleteBudget = async (req, res, next) => {
    try {
        const presupuesto = await budgetsService.deleteBudget(req.params.id);

        if (!presupuesto) {
            return res.status(404).json({
                success: false,
                error: 'Presupuesto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Presupuesto eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

const getAlerts = async (req, res, next) => {
    try {
        const alertas = await budgetsService.getAlerts(req.query);
        res.status(200).json({
            success: true,
            count: alertas.length,
            data: alertas
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
    getAlerts
};
