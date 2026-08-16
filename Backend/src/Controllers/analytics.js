const analyticsService = require('../Services/analytics');

const getTotalsByCategory = async (req, res, next) => {
  try {
    const { month } = req.query;
    const data = await analyticsService.getTotalsByCategory(month);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTotalsByMonth = async (req, res, next) => {
  try {
    const data = await analyticsService.getTotalsByMonth();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDailyAverage = async (req, res, next) => {
  try {
    const { month } = req.query;
    const data = await analyticsService.getDailyAverage(month);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTotalsByCategory,
  getTotalsByMonth,
  getDailyAverage
};