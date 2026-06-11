import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const { user } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [summary, setSummary] = useState([])
  const [recentExpenses, setRecentExpenses] = useState([])
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month, year])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryRes, expensesRes] = await Promise.all([
        api.get(`/expenses/summary?month=${month}&year=${year}`),
        api.get(`/expenses?month=${month}&year=${year}`),
      ])
      setSummary(summaryRes.data)
      setRecentExpenses(expensesRes.data.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getAiSummary = async () => {
    setAiLoading(true)
    setAiSummary('')
    try {
      const res = await api.post('/ai/summary', { month, year })
      setAiSummary(res.data.summary)
    } catch {
      setAiSummary('Could not generate AI summary. Please check your API key.')
    } finally {
      setAiLoading(false)
    }
  }

  const total = summary.reduce((sum, s) => sum + s.total, 0)
  const pieData = summary.map(s => ({ name: s._id, value: s.total }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your spending overview</p>
        </div>
        <select
          className="select w-36"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m} {year}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{MONTHS[month - 1]} {year}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{recentExpenses.length}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Top Category</p>
          <p className="text-2xl font-bold text-gray-900">{summary[0]?._id || '—'}</p>
          <p className="text-xs text-gray-400 mt-1">
            {summary[0] ? `₹${summary[0].total.toLocaleString()}` : 'No data'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Spending by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data for this month</div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Category Breakdown</h2>
          {summary.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summary.map(s => ({ name: s._id, amount: s.total }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data for this month</div>
          )}
        </div>
      </div>

      {/* AI Summary */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <h2 className="font-semibold text-gray-800">AI Spending Insight</h2>
          </div>
          <button onClick={getAiSummary} className="btn-primary text-sm" disabled={aiLoading}>
            {aiLoading ? 'Analysing...' : 'Generate Insight'}
          </button>
        </div>
        {aiSummary ? (
          <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 rounded-xl p-4">{aiSummary}</p>
        ) : (
          <p className="text-gray-400 text-sm">Click "Generate Insight" to get an AI-powered analysis of your spending habits.</p>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        {recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {recentExpenses.map(exp => (
              <div key={exp._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{exp.title}</p>
                  <p className="text-xs text-gray-400">{exp.category} · {new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-red-500">−₹{exp.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No expenses this month. Add your first one!</p>
        )}
      </div>
    </div>
  )
}
