import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWorkflow, addNode, updateNode, deleteNode, reorderNodes, runWorkflowApi, getWorkflowRuns } from '../services/workflows'
import RunDetails from '../components/RunDetails'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import NodeList from '../components/NodeList'
import Modal from '../components/Modal'
import NodeInspector from '../components/NodeInspector'
import StatusPill from '../components/StatusPill'

const NODE_CATEGORIES = [
  {
    label: '📦 Trigger',
    items: [
      { key: 'trigger', label: 'Manual Trigger', desc: 'Start the workflow', color: 'border-l-purple-500' },
    ],
  },
  {
    label: '⚙️ Actions',
    items: [
      { key: 'http', label: 'HTTP Request', desc: 'Fetch data from an API', color: 'border-l-blue-500' },
      { key: 'transform', label: 'Transform Data', desc: 'Map & format data', color: 'border-l-cyan-500' },
      { key: 'text', label: 'Send Text', desc: 'Output a text message', color: 'border-l-slate-500' },
    ],
  },
  {
    label: '⏳ Flow Control',
    items: [
      { key: 'condition', label: 'Condition / Branch', desc: 'Route based on data', color: 'border-l-orange-500' },
      { key: 'delay', label: 'Delay', desc: 'Wait before continuing', color: 'border-l-yellow-500' },
    ],
  },
  {
    label: '👤 Human Tasks',
    items: [
      { key: 'approval', label: 'Approval Step', desc: 'Request human approval', color: 'border-l-emerald-500' },
    ],
  },
]

function NodePalette({ onAdd }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Node Palette</h3>
      <div className="space-y-4">
        {NODE_CATEGORIES.map((cat, ci) => (
          <div key={ci}>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{cat.label}</div>
            <div className="space-y-1.5">
              {cat.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onAdd(item.key)}
                  className={`w-full text-left px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-l-4 ${item.color} rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-sm transition-all group`}
                >
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{item.label}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Builder() {
  const { id } = useParams()
  const { token } = useAuth()
  const [workflow, setWorkflow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [runsOpen, setRunsOpen] = useState(false)
  const [runs, setRuns] = useState([])
  const [runsLoading, setRunsLoading] = useState(false)
  const [activeRunId, setActiveRunId] = useState(null)
  const [runDetailsOpen, setRunDetailsOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const pollRef = useRef(null)

  async function load() {
    try {
      setLoading(true)
      const w = await getWorkflow(id)
      setWorkflow(w)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [id, token])

  async function handleAdd(type) {
    const defaultConfigs = {
      trigger: {},
      text: { message: 'Hello from WorkflowForge!' },
      delay: { seconds: 5, ms: 5000 },
      http: { url: 'https://httpbin.org/get', method: 'GET' },
      condition: { field: 'status', operator: '==', value: 'active' },
      approval: { assignedTo: '', instructions: 'Please review and approve.' },
      transform: { template: 'Result: {{message}}' }
    }
    try {
      await addNode(id, { type, config: defaultConfigs[type] || {} })
      toast.success('Node added')
      await load()
    } catch (err) {
      toast.error('Add failed')
    }
  }

  async function handleSave(node) {
    try {
      await updateNode(id, node.id, { type: node.type, config: node.config })
      toast.success('Workflow saved! ✓')
      setLastSaved(new Date())
      await load()
    } catch (err) {
      toast.error('Save failed')
    }
  }

  async function handleDelete(nodeId) {
    try {
      await deleteNode(id, nodeId)
      toast.success('Node deleted')
      setSelected(null)
      await load()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  async function handleRun() {
    try {
      const res = await runWorkflowApi(id)
      toast('Workflow is running...', { icon: '⚡' })
      openRuns()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to start run')
    }
  }

  async function openRuns() {
    setRunsOpen(true)
    setRunsLoading(true)
    try {
      const list = await getWorkflowRuns(id, 50)
      setRuns(list)
      const hasRunning = list.some(r => r.status === 'running')
      if (hasRunning) startPolling()
    } catch (err) {
      toast.error('Failed to load runs')
    } finally {
      setRunsLoading(false)
    }
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const list = await getWorkflowRuns(id, 50)
        setRuns(list)
        if (!list.some(r => r.status === 'running')) {
          clearInterval(pollRef.current)
          pollRef.current = null
          toast.success('Run completed successfully ✓')
        }
      } catch (e) { /* ignore */ }
    }, 1500)
  }

  function openRunDetails(runId) {
    setActiveRunId(runId)
    setRunDetailsOpen(true)
  }

  const savedAgo = lastSaved
    ? `Last saved: ${Math.round((Date.now() - lastSaved.getTime()) / 60000)} min ago`
    : null

  // Skeleton loader for builder
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 animate-pulse">
          <div><div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" /><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" /></div>
          <div className="flex gap-3"><div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-24" /><div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-24" /></div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3"><div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" /></div>
          <div className="col-span-6"><div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" /></div>
          <div className="col-span-3"><div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" /></div>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">Workflow not found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">This workflow may have been deleted.</p>
          <Link to="/workflows" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300">← Back to Workflows</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Builder</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Editing: {workflow.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAgo && <span className="text-xs text-slate-400 dark:text-slate-500">{savedAgo}</span>}
          <button onClick={handleRun} className="bg-emerald-500 dark:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors">
            ▶ Run
          </button>
          <button onClick={openRuns} className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-semibold hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            History
          </button>
        </div>
      </div>

      {/* Builder Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Palette */}
        <div className="col-span-3">
          <div className="sticky top-6">
            <NodePalette onAdd={handleAdd} />
          </div>
        </div>

        {/* Canvas */}
        <div className="col-span-6">
          {(!workflow.nodes || workflow.nodes.length === 0) ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">No nodes yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Drag a node from the left panel to get started</p>
              <button onClick={() => handleAdd('trigger')} className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                + Add Trigger Node
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 min-h-[400px]">
              <NodeList
                nodes={workflow.nodes}
                onSelect={setSelected}
                onEdit={setSelected}
                onDelete={(node) => setSelected(node)}
                onReorder={async (newIds) => {
                  setWorkflow(prev => {
                    if (!prev) return prev
                    const reordered = newIds.map(i => prev.nodes.find(n => n.id === i))
                    return { ...prev, nodes: reordered }
                  })
                  try {
                    await reorderNodes(id, newIds)
                    toast.success('Order updated')
                  } catch (err) {
                    toast.error('Failed to update order')
                    await load()
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Inspector */}
        <div className="col-span-3">
          <div className="sticky top-6">
            <NodeInspector node={selected} onSave={handleSave} onDelete={handleDelete} onClose={() => setSelected(null)} />
          </div>
        </div>
      </div>

      {/* Run History Modal */}
      <Modal open={runsOpen} title="Run History" onClose={() => setRunsOpen(false)} primary={null} secondary={null}>
        {runsLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (!runs || runs.length === 0) ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2">🏃</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No runs yet. Click "Run" to start one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map(r => (
              <div key={r.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div>
                  <StatusPill status={r.status} />
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500 dark:text-slate-400">{r.durationMs != null ? `${(r.durationMs / 1000).toFixed(1)}s` : '—'}</div>
                  <button onClick={() => openRunDetails(r.id)} className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:text-indigo-700 dark:hover:text-indigo-300">
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <RunDetails runId={activeRunId} open={runDetailsOpen} onClose={() => setRunDetailsOpen(false)} />
    </div>
  )
}
