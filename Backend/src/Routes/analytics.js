const express = require('express');
const router = express.Router();
const analyticsController = require('../Controllers/analytics');
const { monthValidation } = require('../Validators/analytics.validator');

router.get('/categories', monthValidation, analyticsController.getTotalsByCategory);
router.get('/months', analyticsController.getTotalsByMonth);
router.get('/daily-average', monthValidation, analyticsController.getDailyAverage);

module.exports = router;