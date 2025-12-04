import React, { useEffect, useState, useCallback } from 'react'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import { getRun } from '../services/workflows'
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
        if(data.status === 'running'){
          // keep polling
        } else {
          // stop polling
          if(timer) clearInterval(timer)
        }
      }catch(e){
        console.error('Poll run failed', e)
      }
    }

    // initial load
    poll()
    timer = setInterval(poll, 1500)

    return ()=>{ mounted = false; if(timer) clearInterval(timer) }
  },[open, runId, getRun])

  function renderResult(r){
    if(r === null || r === undefined) return <span className="text-muted">—</span>
    if(typeof r === 'object') return <pre className="bg-surface/20 p-2 rounded text-xs overflow-auto">{JSON.stringify(r,null,2)}</pre>
    return <div className="text-sm">{String(r)}</div>
  }

  async function copyText(text){
    try{
      await navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text,null,2))
      toast.success('Copied')
    }catch(e){ toast.error('Copy failed') }
  }

  return (
    <Modal open={open} title={run ? `Run ${run.id || ''}` : 'Run details'} onClose={onClose} primary={null} secondary={null}>
      {loading ? (
        <div className="p-4"><LoadingSpinner /></div>
      ) : (!run) ? (
        <div className="p-4 text-center text-sm text-muted">No run data available.</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Status: <span className="ml-2">{run.status}</span></div>
              <div className="text-xs text-muted">{new Date(run.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-sm text-muted">{run.durationMs != null ? `${run.durationMs} ms` : '-'}</div>
          </div>

          <div className="space-y-3">
            {(run.results || run.steps || []).map((s, i) => {
              // support different shapes: older runs may use `results` or `steps`
              const step = s || {}
              const nodeId = step.nodeId || step.node || 'unknown'
              const status = step.status
              const startedAt = step.startedAt
              const endedAt = step.endedAt
              const output = step.result ?? step.output ?? null
              const error = step.error ?? null

              return (
                <div key={i} className="p-3 border rounded bg-surface/30">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-medium">Node: <span className="text-sm">{nodeId}</span></div>
                      <div className="text-xs text-muted">{status} • {startedAt ? new Date(startedAt).toLocaleString() : '-'} → {endedAt ? new Date(endedAt).toLocaleString() : '-'}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {error ? <div className="text-sm text-red-400">Error</div> : <div className="text-sm text-green-300">{status}</div>}
                      <div className="flex gap-2">
                        <button type="button" onClick={()=>copyText(output ?? error)} className="btn-secondary text-xs">Copy</button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {error ? (
                      <div>
                        <div className="text-xs font-medium mb-1">Error</div>
                        <pre className="bg-surface/10 p-2 rounded text-xs overflow-auto">{String(error)}</pre>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-medium mb-1">Result</div>
                        {renderResult(output)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}
