import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllRuns } from '../services/workflows'
import StatusPill from '../components/StatusPill'
import toast from 'react-hot-toast'

export default function RunsPage() {
  const navigate = useNavigate()
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const polling = useRef(null)

  async function load() {
    try {
      const data = await getAllRuns(100)
      setRuns(data || [])
    } catch (err) {
      console.error('Failed to load runs', err)
      toast.error('Failed to load runs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    polling.current = setInterval(load, 5000)
    return () => { if (polling.current) clearInterval(polling.current) }
  }, [])

  const filtered = filter === 'all' ? runs : runs.filter(r => r.status === filter)

  const statusCounts = runs.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'running', label: 'Running' },
    { key: 'failed', label: 'Failed' },
    { key: 'waiting_approval', label: 'Pending' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Run History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {runs.length} total run{runs.length !== 1 ? 's' : ''} across all workflows
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => {
          const count = f.key === 'all' ? runs.length : (statusCounts[f.key] || 0)
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🏃</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {filter === 'all' ? 'No runs yet' : `No ${filter.replace('_', ' ')} runs`}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {filter === 'all'
              ? 'Execute a workflow to see run history here.'
              : 'Try a different filter or run more workflows.'}
          </p>
          {filter === 'all' && (
            <button onClick={() => navigate('/workflows')}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition">
              View Workflows
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Workflow</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Started</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Steps</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((r) => (
                  <tr key={r.id || r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {r.workflow?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4"><StatusPill status={r.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {r.stepCount || r.steps?.length || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/runs/${r.id || r._id}`)}
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
        </div>
      )}
    </div>
  )
}
