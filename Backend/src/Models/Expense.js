const mongoose = require('mongoose');

const CATEGORIES = [
    'Food',
    'Transport',
    'Entertainment',
    'Utilities',
    'Health',
    'Education',
    'Clothing',
    'Home',
    'Technology',
    'Travel',
    'Gifts',
    'Other'
];

const ExpenseSchema = new mongoose.Schema({
    monto: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0'],
        max: [999999.99, 'Amount cannot exceed 999,999.99'],
        validate: {
            validator: Number.isFinite,
            message: 'Amount must be a valid number'
        }
    },
    categoria: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: CATEGORIES,
            message: 'Invalid category'
        },
        trim: true,
        uppercase: true
    },
    fecha: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now,
        validate: {
            validator: function (value) {
                return value <= new Date();
            },
            message: 'Date cannot be in the future'
        }
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters'],
        default: '',
        set: function (value) {
            if (value && value.length > 0) {
                return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }
            return value;
        }
    }
}, {
    timestamps: true
});

ExpenseSchema.index({ categoria: 1, fecha: -1 });
ExpenseSchema.index({ fecha: -1 });
ExpenseSchema.index({ monto: -1 });

ExpenseSchema.methods.formatAsText = function () {
    return `${this.categoria}: $${this.monto.toFixed(2)} (${this.fecha.toLocaleDateString()})`;
};

ExpenseSchema.methods.isLargeExpense = function () {
    return this.monto > 100;
};

ExpenseSchema.statics.findByCategory = function (categoria) {
    return this.find({ categoria: categoria.toUpperCase() });
};

ExpenseSchema.statics.getTotalByCategory = function (categoria) {
    return this.aggregate([
        { $match: { categoria: categoria.toUpperCase() } },
        { $group: { _id: '$categoria', total: { $sum: '$monto' } } }
    ]);
};

ExpenseSchema.statics.getCurrentMonth = function () {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.find({
        fecha: { $gte: start, $lte: end }
    });
};

ExpenseSchema.pre('save', function (next) {
    if (this.categoria) {
        this.categoria = this.categoria.toUpperCase();
    }
    next();
});

ExpenseSchema.pre('save', function (next) {
    if (this.monto) {
        this.monto = parseFloat(this.monto.toFixed(2));
    }
    next();
});

ExpenseSchema.virtual('year').get(function () {
    return this.fecha.getFullYear();
});

ExpenseSchema.virtual('month').get(function () {
    return this.fecha.getMonth() + 1;
});

ExpenseSchema.virtual('day').get(function () {
    return this.fecha.getDate();
});

ExpenseSchema.virtual('formattedAmount').get(function () {
    return `$${this.monto.toFixed(2)}`;
});

module.exports = mongoose.model('Expense', ExpenseSchema);
module.exports.CATEGORIES = CATEGORIES;