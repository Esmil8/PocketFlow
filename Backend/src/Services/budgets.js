const Budget = require('../Models/Budget');
const Expense = require('../Models/Expense');

const createBudget = async (budgetData) => {
    let mes = budgetData.mes ? Number(budgetData.mes) : null;
    let anio = budgetData.anio ? Number(budgetData.anio) : null;

    if (!mes || !anio) {
        const hoy = new Date();
        if (!mes) mes = hoy.getMonth() + 1;
        if (!anio) anio = hoy.getFullYear();
    }

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

const updateBudget = async (id, data) => {
    if (data.categoria) {
        data.categoria = data.categoria.toUpperCase();
    }

    const presupuesto = await Budget.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );

    return presupuesto;
};

const deleteBudget = async (id) => {
    const presupuesto = await Budget.findByIdAndDelete(id);
    return presupuesto;
};

const getAlerts = async (filters = {}) => {
    let mes = filters.mes ? Number(filters.mes) : null;
    let anio = filters.anio ? Number(filters.anio) : null;

    if (!mes || !anio) {
        const hoy = new Date();
        if (!mes) mes = hoy.getMonth() + 1;
        if (!anio) anio = hoy.getFullYear();
    }

    const presupuestos = await Budget.find({ mes, anio });

    if (presupuestos.length === 0) {
        return [];
    }

    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 0, 23, 59, 59, 999);

    const gastosPorCategoria = await Expense.aggregate([
        {
            $match: {
                fecha: { $gte: inicio, $lte: fin }
            }
        },
        {
            $group: {
                _id: '$categoria',
                totalGastado: { $sum: '$monto' }
            }
        }
    ]);

    const gastosMap = {};
    gastosPorCategoria.forEach(g => {
        gastosMap[g._id] = g.totalGastado;
    });

    const alertas = [];

    presupuestos.forEach(presupuesto => {
        const gastado = gastosMap[presupuesto.categoria] || 0;
        const porcentaje = (gastado / presupuesto.limite) * 100;

        let nivel = 'normal';
        let mensaje = `Has usado el ${porcentaje.toFixed(1)}% de tu presupuesto de ${presupuesto.categoria}`;

        if (porcentaje >= 100) {
            nivel = 'critico';
            mensaje = `Has usado el ${porcentaje.toFixed(1)}% de tu presupuesto de ${presupuesto.categoria}`;
        } else if (porcentaje >= 80) {
            nivel = 'advertencia';
            mensaje = `Has usado el ${porcentaje.toFixed(1)}% de tu presupuesto de ${presupuesto.categoria}`;
        }

        alertas.push({
            categoria: presupuesto.categoria,
            limite: presupuesto.limite,
            gastado: parseFloat(gastado.toFixed(2)),
            porcentaje: parseFloat(porcentaje.toFixed(1)),
            nivel,
            mensaje
        });
    });

    return alertas;
};

module.exports = {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
    getAlerts
};
