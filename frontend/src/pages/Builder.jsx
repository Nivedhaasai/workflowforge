import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWorkflow, addNode, updateNode, deleteNode, reorderNodes, runWorkflowApi, getWorkflowRuns, getRun } from '../services/workflows'
import RunDetails from '../components/RunDetails'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import NodeList from '../components/NodeList'
import Modal from '../components/Modal'
import NodeInspector from '../components/NodeInspector'
import LoadingSpinner from '../components/LoadingSpinner'

function NodePalette({ onAdd }){
  const types = [
    { key: 'text', label: 'Text' },
    { key: 'delay', label: 'Delay' },
    { key: 'http', label: 'HTTP' }
  ]
  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-medium">Palette</h3>
      <div className="flex flex-col gap-2 mt-2">
        {types.map(t=> (
          <button key={t.key} onClick={()=>onAdd(t.key)} className="w-full text-left px-3 py-2 bg-surface/50 border border-gray-700 rounded-md hover:scale-[1.01] transition-transform">{t.label}</button>
        ))}
      </div>
    </div>
  )
}

function Canvas({ nodes, onSelect, onMoveUp, onMoveDown }){
  return (
    <div className="canvas p-6 min-h-[400px] bg-base-bg/40 border border-gray-800 rounded-xl">
      <div className="flex flex-wrap gap-4">
        {nodes.map((n, idx) => (
          <div key={n.id} className="node-card bg-surface/60 border border-gray-700 rounded-lg p-3 w-60 cursor-pointer hover:scale-[1.02] transition-transform" onClick={()=>onSelect(n)}>
            <div className="text-sm font-medium">{n.type}</div>
            <div className="text-xs text-muted mt-2 truncate">{JSON.stringify(n.config)}</div>
            <div className="flex gap-2 mt-3">
              <button onClick={(e)=>{ e.stopPropagation(); onMoveUp(idx) }} className="btn-secondary text-xs">↑</button>
              <button onClick={(e)=>{ e.stopPropagation(); onMoveDown(idx) }} className="btn-secondary text-xs">↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Inline inspector was replaced by `NodeInspector` component

export default function Builder(){
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

  async function load(){
    try{
      setLoading(true)
      const w = await getWorkflow(id)
      setWorkflow(w)
    }catch(err){
      console.error(err)
      toast.error('Failed to load workflow')
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ if (id) load() }, [id, token])

  const [confirmDelete, setConfirmDelete] = useState({ open:false, id:null })

  async function handleAdd(type){
    try{
      const node = { type, config: {} }
      await addNode(id, node)
      toast.success('Node added')
      await load()
    }catch(err){ toast.error('Add failed') }
  }

  async function handleSave(node){
    try{
      await updateNode(id, node.id, { type: node.type, config: node.config })
      toast.success('Node saved')
      await load()
    }catch(err){ toast.error('Save failed') }
  }

  async function handleDelete(nodeId){
    try{
      await deleteNode(id, nodeId)
      toast.success('Node deleted')
      setSelected(null)
      await load()
    }catch(err){ toast.error('Delete failed') }
  }

  async function handleRun(){
    try{
      const res = await runWorkflowApi(id)
      toast.success('Run started')
      // open history so user can watch progress
      openRuns()
      return res
    }catch(err){
      console.error('Run start failed', err)
      toast.error(err?.response?.data?.error || 'Failed to start run')
    }
  }

  async function openRuns(){
    setRunsOpen(true)
    setRunsLoading(true)
    try{
      const list = await getWorkflowRuns(id, 50)
      setRuns(list)
      // if any running, start polling
      const running = list.find(r => r.status === 'running')
      if(running){
        pollRuns(list)
      }
    }catch(err){
      console.error('Failed to load runs', err)
      toast.error('Failed to load runs')
    }finally{ setRunsLoading(false) }
  }

  // Polling: check running runs periodically and refresh list; stops when none running
  let pollTimer = null
  async function pollRuns(initialList){
    if(pollTimer) clearInterval(pollTimer)
    pollTimer = setInterval(async ()=>{
      try{
        const list = await getWorkflowRuns(id, 50)
        setRuns(list)
        const stillRunning = list.some(r => r.status === 'running')
        if(!stillRunning){ clearInterval(pollTimer); pollTimer = null }
      }catch(e){ console.error('Poll failed', e) }
    }, 1500)
  }

  // Open run detail modal
  function openRunDetails(runId){ setActiveRunId(runId); setRunDetailsOpen(true) }

  async function handleMove(idxFrom, idxTo){
    if (!workflow) return
    const ids = workflow.nodes.map(n=>n.id)
    const [moved] = ids.splice(idxFrom,1)
    ids.splice(idxTo,0,moved)
    try{
      await reorderNodes(id, ids)
      await load()
    }catch(err){ toast.error('Reorder failed') }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Builder</h1>
          <p className="text-sm text-muted">Edit workflow: {workflow?.name || (loading ? 'loading...' : 'untitled')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleRun} className="btn-primary px-4 py-2 rounded-md">Run Workflow</button>
          <button type="button" onClick={openRuns} className="btn-secondary px-4 py-2 rounded-md">Run History</button>
        </div>
      </div>

      {/* Ensure we never render a blank page: always show either spinner, not-found, or the builder UI */}
      {loading ? (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <div className="p-4 space-y-3">
              <div className="h-6 bg-surface/30 rounded w-3/4 animate-pulse" />
              <div className="h-10 bg-surface/30 rounded animate-pulse" />
              <div className="h-10 bg-surface/30 rounded animate-pulse" />
            </div>
          </div>

          <div className="col-span-6">
            <div className="canvas p-6 min-h-[360px] bg-base-bg/40 border border-gray-800 rounded-xl">
              <div className="flex flex-wrap gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-60 p-3 rounded-lg bg-surface/30 animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="p-4">
              <div className="h-10 bg-surface/30 rounded animate-pulse mb-3" />
              <div className="h-40 bg-surface/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ) : !workflow ? (
        <div className="bg-surface/40 border border-gray-700 rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Workflow not found</h3>
          <p className="text-sm text-muted mb-4">This workflow may have been deleted or is inaccessible.</p>
          <div className="flex justify-center">
            <Link to="/workflows" className="btn-secondary px-4 py-2 rounded-md">Back to Workflows</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 bg-transparent">
            <div className="sticky top-6 bg-transparent">
              <NodePalette onAdd={handleAdd} />
            </div>
          </div>

          <div className="col-span-6">
            <div className="p-2">
              {(!workflow.nodes || workflow.nodes.length === 0) ? (
                <div className="empty-state p-8 rounded-lg text-center">
                  <h3 className="text-lg font-medium mb-2">No nodes yet</h3>
                  <p className="text-sm text-muted mb-4">Add nodes from the palette to build your workflow.</p>
                  <div className="flex justify-center">
                    <button onClick={()=>handleAdd('text')} className="btn-primary px-4 py-2 rounded-md">Add a Text Node</button>
                  </div>
                </div>
              ) : (
                <NodeList
                  nodes={workflow.nodes}
                  onSelect={setSelected}
                  onEdit={(node)=> setSelected(node)}
                  onDelete={(node)=> setSelected(node)}
                  onReorder={async (newIds) => {
                    // update local state to reflect new order
                    setWorkflow(prev => {
                      if (!prev) return prev
                      const reordered = newIds.map(i => prev.nodes.find(n => n.id === i))
                      return { ...prev, nodes: reordered }
                    })
                    // call backend to persist order
                    try{
                      await reorderNodes(id, newIds)
                      toast.success('Order updated')
                      console.log('reorder ids:', newIds)
                    }catch(err){
                      console.error('reorder failed', err)
                      toast.error('Failed to update order')
                      await load()
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="col-span-3">
            <div className="sticky top-6">
              <NodeInspector node={selected} onSave={handleSave} onDelete={handleDelete} onClose={()=>setSelected(null)} />
            </div>
          </div>
        </div>
      )}
      
        <Modal open={runsOpen} title="Run History" onClose={()=>setRunsOpen(false)} primary={null} secondary={null}>
          {runsLoading ? (
            <div className="p-4"><LoadingSpinner /></div>
          ) : (!runs || runs.length === 0) ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted">No runs yet. Click "Run Workflow" to start one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map(r => (
                <div key={r.id} className="p-3 border rounded bg-surface/30 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{r.status}</div>
                    <div className="text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted">{r.durationMs != null ? `${r.durationMs} ms` : '-'}</div>
                    <button type="button" onClick={()=>openRunDetails(r.id)} className="btn-secondary text-xs">View details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
        <RunDetails runId={activeRunId} open={runDetailsOpen} onClose={()=>setRunDetailsOpen(false)} />
    </div>
  )
}
