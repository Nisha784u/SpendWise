import { useState, useEffect } from 'react'
import api from '../utils/api'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Budgets() {
  const now = new Date()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [form, setForm] = useState({ category: 'Food', limit: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchBudgets() }, [month, year])

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/budgets?month=${month}&year=${year}`)
      setBudgets(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.limit) return
    setSubmitting(true)
    try {
      await api.post('/budgets', { ...form, month, year })
      setForm({ category: 'Food', limit: '' })
      fetchBudgets()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/budgets/${id}`)
    fetchBudgets()
  }

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-yellow-400'
    return 'bg-green-500'
  }

  const getStatusLabel = (pct) => {
    if (pct >= 100) return { text: 'Over budget!', color: 'text-red-500 bg-red-50' }
    if (pct >= 80) return { text: '⚠️ Near limit', color: 'text-yellow-700 bg-yellow-50' }
    return { text: 'On track', color: 'text-green-700 bg-green-50' }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <p className="text-gray-500 text-sm mt-1">Set spending limits and get alerts</p>
      </div>

      <div className="flex gap-3 mb-6">
        <select className="select w-36" value={month} onChange={e => setMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m} {year}</option>)}
        </select>
      </div>

      {/* Set budget form */}
      <div className="card mb-6 border-blue-100 border">
        <h3 className="font-semibold text-gray-800 mb-4">Set a Budget</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit (₹)</label>
            <input className="input" type="number" placeholder="e.g. 3000" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? 'Saving...' : 'Set Budget'}
          </button>
        </div>
      </div>

      {/* Budget cards */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : budgets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">No budgets set for this month.</p>
          <p className="text-gray-400 text-xs mt-1">Add a budget above to start tracking limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {budgets.map(b => {
            const status = getStatusLabel(b.percentage)
            return (
              <div key={b._id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {{'Food':'🍔','Transport':'🚗','Shopping':'🛍️','Bills':'📄','Health':'💊','Entertainment':'🎬','Education':'📚','Other':'📌'}[b.category]}
                    </span>
                    <span className="font-semibold text-gray-800">{b.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${status.color}`}>{status.text}</span>
                    <button onClick={() => handleDelete(b._id)} className="text-xs text-gray-400 hover:text-red-400">✕</button>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>₹{b.spent.toLocaleString()} spent</span>
                  <span>₹{b.limit.toLocaleString()} limit</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${getBarColor(b.percentage)}`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {b.percentage >= 100
                    ? `₹${(b.spent - b.limit).toLocaleString()} over budget`
                    : `₹${(b.limit - b.spent).toLocaleString()} remaining (${b.percentage}% used)`}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
