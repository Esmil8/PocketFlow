const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            error: `Duplicate value for field: ${field}`,
            field: field
        });
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
            field: err.path
        });
    }

    if (err.name === 'ValidationError' && err.errors) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: err.errors
        });
    }

    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};

module.exports = errorHandler;