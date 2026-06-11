const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// POST /api/ai/summary — generate AI spending summary using Gemini
router.post('/summary', async (req, res) => {
  try {
    const { month, year } = req.body;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: start, $lt: end },
    }).sort({ amount: -1 });

    if (expenses.length === 0) {
      return res.json({ summary: 'No expenses found for this month. Start tracking your spending!' });
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const expenseText = Object.entries(categoryTotals)
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`)
      .join(', ');

    const prompt = `You are a friendly personal finance assistant. A user spent ₹${total.toFixed(0)} this month. 
Breakdown: ${expenseText}. 
Give a short, friendly 2-3 sentence summary with one actionable tip to save money. 
Be encouraging and specific. Use ₹ for currency.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await geminiRes.json();
    const summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      `You spent ₹${total.toFixed(0)} this month. Your top category was ${
        Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
      }.`;

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
