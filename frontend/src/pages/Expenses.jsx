import { useState, useEffect } from 'react'
import api from '../utils/api'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const emptyForm = { title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], note: '' }

export default function Expenses() {
  const now = new Date()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => { fetchExpenses() }, [month, year, filterCategory])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ month, year })
      if (filterCategory) params.append('category', filterCategory)
      const res = await api.get(`/expenses?${params}`)
      setExpenses(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.amount) return
    setSubmitting(true)
    try {
      if (editId) {
        await api.put(`/expenses/${editId}`, form)
      } else {
        await api.post('/expenses', form)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditId(null)
      fetchExpenses()
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (exp) => {
    setForm({ title: exp.title, amount: exp.amount, category: exp.category, date: exp.date.split('T')[0], note: exp.note || '' })
    setEditId(exp._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    //if (!confirm('Delete this expense?')) return
    await api.delete(`/expenses/${id}`)
    fetchExpenses()
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your transactions</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}>
          + Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select className="select w-36" value={month} onChange={e => setMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m} {year}</option>)}
        </select>
        <select className="select w-36" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="card flex-1 flex items-center justify-end py-2">
          <span className="text-sm text-gray-500">Total: </span>
          <span className="text-lg font-bold text-gray-900 ml-2">₹{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-6 border-blue-200 border">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Expense' : 'Add New Expense'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input className="input" placeholder="e.g. Lunch at Dominos" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input className="input" type="number" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <input className="input" placeholder="Any additional note..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update' : 'Add Expense'}
            </button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="card">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No expenses found. Add your first one!</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {expenses.map(exp => (
              <div key={exp._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {{'Food':'🍔','Transport':'🚗','Shopping':'🛍️','Bills':'📄','Health':'💊','Entertainment':'🎬','Education':'📚','Other':'📌'}[exp.category]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exp.title}</p>
                    <p className="text-xs text-gray-400">{exp.category} · {new Date(exp.date).toLocaleDateString('en-IN')}</p>
                    {exp.note && <p className="text-xs text-gray-400 italic">{exp.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-semibold text-red-500">−₹{exp.amount.toLocaleString()}</span>
                  <button onClick={() => handleEdit(exp)} className="text-xs text-blue-500 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(exp._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
