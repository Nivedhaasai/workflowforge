import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats } from '../services/workflows'
import StatusPill from '../components/StatusPill'
import StatCard from '../components/StatCard'
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

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back{user ? `, ${user.name}` : ''}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your workflows.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)
          : (
            <>
              <StatCard icon="🔀" label="Total Workflows" value={stats?.totalWorkflows ?? 0} color="indigo" />
              <StatCard icon="▶️" label="Total Runs" value={stats?.totalRuns ?? 0} color="blue" />
              <StatCard icon="✅" label="Success Rate" value={`${stats?.successRate ?? 0}%`} color="emerald" />
              <StatCard icon="⏳" label="Pending Approvals" value={stats?.pendingApprovals ?? 0} color="amber" />
            </>
          )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-10">
        <button onClick={() => navigate('/workflows/new')}
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition text-sm">
          + New Workflow
        </button>
        <button onClick={() => navigate('/templates')}
          className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm">
          Browse Templates
        </button>
        <button onClick={() => navigate('/workflows')}
          className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm">
          View All Workflows
        </button>
      </div>

      {/* Recent Runs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Runs</h2>
        </div>
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : !stats?.recentRuns?.length ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🏃</div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">No runs yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Execute a workflow to see your run history here.</p>
            <button onClick={() => navigate('/workflows')} className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
              View Workflows
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Workflow</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Started</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{r.workflowName}</td>
                    <td className="px-6 py-4"><StatusPill status={r.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/runs/${r.id}`)}
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
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


    </div>
  )
}
