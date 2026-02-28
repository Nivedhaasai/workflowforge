import React, { useEffect, useState, useCallback } from 'react'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import StatusPill from './StatusPill'
import { getRun, approveRun } from '../services/workflows'
import toast from 'react-hot-toast'

export default function RunDetails({ runId, open, onClose }){
  const [loading, setLoading] = useState(false)
  const [run, setRun] = useState(null)

  const load = useCallback(async ()=>{
    if(!runId) return
    try{
      setLoading(true)
      const data = await getRun(runId)
      setRun(data)
    }catch(err){
      console.error('Failed to load run', err)
      toast.error('Failed to load run')
    }finally{ setLoading(false) }
  },[runId])

  useEffect(()=>{ if(open) load() },[open, load])

  // Poll run details while run is running
  useEffect(()=>{
    if(!open || !runId) return
    let timer = null
    let mounted = true
    async function poll(){
      try{
        const data = await getRun(runId)
        if(!mounted) return
        setRun(data)
        if(data.status !== 'running'){
          if(timer) clearInterval(timer)
        }
      }catch(e){
        console.error('Poll run failed', e)
      }
    }
    poll()
    timer = setInterval(poll, 1500)
    return ()=>{ mounted = false; if(timer) clearInterval(timer) }
  },[open, runId])

  function renderResult(r){
    if(r === null || r === undefined) return <span className="text-slate-400 dark:text-slate-500">—</span>
    if(typeof r === 'object') return <pre className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs overflow-auto border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200">{JSON.stringify(r,null,2)}</pre>
    return <div className="text-sm text-slate-700 dark:text-slate-300">{String(r)}</div>
  }

  async function copyText(text){
    try{
      await navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text,null,2))
      toast.success('Copied')
    }catch(e){ toast.error('Copy failed') }
  }

  async function handleApprovalDecision(decision){
    try{
      await approveRun(runId, decision, '')
      toast.success(`Workflow ${decision}!`)
      load()
    }catch(e){
      toast.error('Failed to submit decision')
    }
  }

  const NODE_ICONS = {
    trigger: '🚀', text: '📝', delay: '⏱️', http: '🌐',
    condition: '🔀', approval: '✅', transform: '🔧'
  }

  return (
    <Modal open={open} title={run ? `Run ${String(run.id || '').slice(-8)}` : 'Run details'} onClose={onClose} primary={null} secondary={null}>
      {loading ? (
        <div className="p-4"><LoadingSpinner /></div>
      ) : (!run) ? (
        <div className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">No run data available.</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusPill status={run.status} />
              <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(run.createdAt).toLocaleString()}</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{run.durationMs != null ? `${(run.durationMs / 1000).toFixed(1)}s` : '—'}</div>
          </div>

          {/* Approval action banner */}
          {run.status === 'waiting_approval' && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">⏳ Waiting for Approval</div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">This workflow is paused and waiting for a human decision.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprovalDecision('approved')}
                  className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleApprovalDecision('rejected')}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition">
                  ✗ Reject
                </button>
              </div>
            </div>
          )}

          {/* Steps timeline */}
          <div className="space-y-3">
            {(run.results || run.steps || []).map((s, i) => {
              const step = s || {}
              const nodeId = step.nodeId || step.node || 'unknown'
              const nodeType = step.nodeType || step.type || ''
              const status = step.status
              const output = step.result ?? step.output ?? null
              const error = step.error ?? null
              const icon = NODE_ICONS[nodeType] || '▦'

              return (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm">
                        {icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {step.label || nodeType || nodeId}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          <StatusPill status={status} />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(output ?? error)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="mt-3">
                    {error ? (
                      <div>
                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Error</div>
                        <pre className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs overflow-auto border border-red-100 dark:border-red-800">{String(error)}</pre>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Output</div>
                        {renderResult(output)}
                      </div>
                    )}
                  </div>

                  {/* Approval buttons for individual pending approval step */}
                  {nodeType === 'approval' && status === 'pending' && run.status === 'waiting_approval' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleApprovalDecision('approved')}
                        className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleApprovalDecision('rejected')}
                        className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition">
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}
