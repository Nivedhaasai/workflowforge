import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats } from '../services/workflows'
import StatusPill from '../components/StatusPill'
import { SkeletonStat, SkeletonRow } from '../components/SkeletonLoader'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = stats
    ? [
        { label: 'Total Workflows', value: stats.totalWorkflows, icon: '🔀', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Runs', value: stats.totalRuns, icon: '▶️', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Success Rate', value: `${stats.successRate}%`, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Approvals', value: stats.pendingApprovals, icon: '🕐', color: 'text-amber-600', bg: 'bg-amber-50' },
      ]
    : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{user ? `, ${user.name}` : ''}
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your workflows.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
          : statCards.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.bg}`}>
                    {s.icon}
                  </div>
                </div>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
      </div>

      {/* Recent Runs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Recent Runs</h2>
        </div>
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : !stats?.recentRuns?.length ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🏃</div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No runs yet</h3>
            <p className="text-sm text-slate-500 mb-4">Execute a workflow to see your run history here.</p>
            <button onClick={() => navigate('/workflows')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              View Workflows
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Workflow</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Started</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.workflowName}</td>
                    <td className="px-6 py-4"><StatusPill status={r.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/runs/${r.id}`)}
                        className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/workflows/new')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          + New Workflow
        </button>
        <button onClick={() => navigate('/templates')} className="border-2 border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-colors">
          Browse Templates
        </button>
        <button onClick={() => navigate('/runs')} className="border-2 border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-colors">
          View All Runs
        </button>
      </div>
    </div>
  )
}
