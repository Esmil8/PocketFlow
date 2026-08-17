const mongoose = require('mongoose');

const CATEGORIES = [
    'FOOD',
    'TRANSPORT',
    'ENTERTAINMENT',
    'UTILITIES',
    'HEALTH',
    'EDUCATION',
    'CLOTHING',
    'HOME',
    'TECHNOLOGY',
    'TRAVEL',
    'GIFTS',
    'OTHER'
];

const budgetSchema = new mongoose.Schema({
    categoria: {
        type: String,
        required: [true, 'La categoría es requerida'],
        trim: true,
        uppercase: true,
        enum: {
            values: CATEGORIES,
            message: 'Categoría no válida'
        }
    },
    limite: {
        type: Number,
        required: [true, 'El límite del presupuesto es requerido'],
        min: [0.01, 'El límite debe ser mayor a 0']
    },
    mes: {
        type: Number,
        required: [true, 'El mes es requerido'],
        min: [1, 'El mes debe estar entre 1 y 12'],
        max: [12, 'El mes debe estar entre 1 y 12'],
        default: () => new Date().getMonth() + 1
    },
    anio: {
        type: Number,
        required: [true, 'El año es requerido'],
        min: [2000, 'Año no válido'],
        max: [2100, 'Año no válido'],
        default: () => new Date().getFullYear()
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [200, 'La descripción no puede pasar de 200 caracteres'],
        default: ''
    }
}, {
    timestamps: true
});

budgetSchema.index({ categoria: 1, mes: 1, anio: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
module.exports.CATEGORIES = CATEGORIES;
