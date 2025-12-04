import React, { useEffect, useState } from 'react'

export default function NodeInspector({ node, onSave, onDelete, onClose }){
  const [local, setLocal] = useState(node ? { ...node } : null)

  useEffect(()=> setLocal(node ? { ...node } : null), [node])

  // Use whichever is available (local state during edits, or the node prop)
  const current = local ?? node
  if(!current) return <div className="p-4 text-sm text-muted">Select a node to edit</div>

  function handleChange(key, value){
    setLocal(prev => ({ ...(prev || {}), config: { ...((prev && prev.config) || (node && node.config) || {}), [key]: value } }))
  }

  function save(){
    onSave && onSave(current)
  }

  return (
    <div className="p-4 bg-transparent">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Inspector</h4>
        <button type="button" onClick={onClose} className="text-xs text-muted">Close</button>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-muted">Type: {current.type}</div>

        {current.type === 'text' && (
          <div>
            <label className="text-xs block mb-1">Message</label>
            <textarea className="w-full bg-surface/40 p-2 rounded-md" value={current.config?.message||''} onChange={e=>handleChange('message', e.target.value)} />
          </div>
        )}

        {current.type === 'delay' && (
          <div>
            <label className="text-xs block mb-1">Milliseconds</label>
            <input type="number" className="w-full bg-surface/40 p-2 rounded-md" value={current.config?.ms||1000} onChange={e=>handleChange('ms', Number(e.target.value))} />
          </div>
        )}

        {current.type === 'http' && (
          <div className="space-y-2">
            <label className="text-xs block">URL</label>
            <input className="w-full bg-surface/40 p-2 rounded-md" value={current.config?.url||''} onChange={e=>handleChange('url', e.target.value)} />
            <label className="text-xs block">Method</label>
            <input className="w-full bg-surface/40 p-2 rounded-md" value={current.config?.method||'GET'} onChange={e=>handleChange('method', e.target.value)} />
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button type="button" onClick={save} className="btn-primary px-3 py-2">Save</button>
          <button type="button" onClick={()=> onDelete(current.id)} className="btn-danger px-3 py-2">Delete</button>
        </div>
      </div>
    </div>
  )
}
