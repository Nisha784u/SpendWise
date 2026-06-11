const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/expenses — with optional month/year/category filters
router.get('/', async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (category) filter.category = category;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now(),
      note,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    Object.assign(expense, req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/summary — category totals for current month
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const summary = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
