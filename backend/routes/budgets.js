const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/budgets?month=&year=
router.get('/', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year });

    // Calculate spent for each budget
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const spent = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const spentMap = {};
    spent.forEach((s) => (spentMap[s._id] = s.total));

    const result = budgets.map((b) => ({
      ...b.toObject(),
      spent: spentMap[b.category] || 0,
      percentage: Math.round(((spentMap[b.category] || 0) / b.limit) * 100),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/budgets — create or update
router.post('/', async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month, year },
      { limit },
      { upsert: true, new: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
