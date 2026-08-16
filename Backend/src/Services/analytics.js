const Expense = require('../Models/Expense');

 // Get total expenses grouped by category
const getTotalsByCategory = async (month) => {
  const match = {};

  if (month) {
    const [year, monthNumber] = month.split('-').map(Number);
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 1);

    match.fecha = {
      $gte: startDate,
      $lt: endDate
    };
  }

  return await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$categoria',
        total: { $sum: '$monto' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: { $round: ['$total', 2] },
        count: 1
      }
    },
    { $sort: { total: -1 } }
  ]);
};


 // Get total expenses grouped by month 
const getTotalsByMonth = async () => {
  return await Expense.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$fecha' },
          month: { $month: '$fecha' }
        },
        total: { $sum: '$monto' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]
            }
          ]
        },
        total: { $round: ['$total', 2] },
        count: 1
      }
    }
  ]);
};

 // Get daily expense average for a specific month 
const getDailyAverage = async (month) => {
  let year, monthNumber;

  if (month) {
    [year, monthNumber] = month.split('-').map(Number);
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthNumber = now.getMonth() + 1;
  }

  const startDate = new Date(year, monthNumber - 1, 1);
  const endDate = new Date(year, monthNumber, 1);
  const formattedMonth = `${year}-${String(monthNumber).padStart(2, '0')}`;
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  const result = await Expense.aggregate([
    {
      $match: {
        fecha: {
          $gte: startDate,
          $lt: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$monto' }
      }
    }
  ]);

  const total = result.length > 0 ? parseFloat(result[0].total.toFixed(2)) : 0;
  const dailyAverage = total > 0 ? parseFloat((total / daysInMonth).toFixed(2)) : 0;

  return {
    month: formattedMonth,
    total,
    days: daysInMonth,
    dailyAverage
  };
};

module.exports = {
  getTotalsByCategory,
  getTotalsByMonth,
  getDailyAverage
};