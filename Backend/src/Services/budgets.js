const Budget = require('../Models/Budget');

const createBudget = async (budgetData) => {
    const hoy = new Date();
    const mes = budgetData.mes ? Number(budgetData.mes) : hoy.getMonth() + 1;
    const anio = budgetData.anio ? Number(budgetData.anio) : hoy.getFullYear();
    const categoria = budgetData.categoria.toUpperCase();

    const presupuesto = await Budget.findOneAndUpdate(
        { categoria, mes, anio },
        {
            categoria,
            limite: budgetData.limite,
            mes,
            anio,
            descripcion: budgetData.descripcion || ''
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    return presupuesto;
};

const getBudgets = async (filters = {}) => {
    const query = {};

    if (filters.categoria) {
        query.categoria = filters.categoria.toUpperCase();
    }
    if (filters.mes) {
        query.mes = Number(filters.mes);
    }
    if (filters.anio) {
        query.anio = Number(filters.anio);
    }

    const presupuestos = await Budget.find(query).sort({ anio: -1, mes: -1 });
    return presupuestos;
};

module.exports = {
    createBudget,
    getBudgets
};
