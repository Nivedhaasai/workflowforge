import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorkflow, updateWorkflow } from '../services/workflows'
import toast from 'react-hot-toast'

export default function EditWorkflow(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [workflow, setWorkflow] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        setLoading(true)
        const w = await getWorkflow(id)
        if(!mounted) return
        setWorkflow(w)
        setName(w?.name || '')
        setDescription(w?.description || '')
      }catch(err){
        console.error('Failed to load workflow', err)
        toast.error('Failed to load workflow')
      }finally{ if(mounted) setLoading(false) }
    }
    if(id) load()
    return ()=> { mounted = false }
  }, [id])

  async function handleSave(e){
    e.preventDefault()
    if(!name.trim()) return toast.error('Name required')
    try{
      setSaving(true)
      await updateWorkflow(id, { name, description })
      toast.success('Workflow updated')
      navigate('/workflows')
    }catch(err){
      console.error('Update failed', err)
      toast.error(err?.response?.data?.error || 'Update failed')
    }finally{ setSaving(false) }
  }

  if(loading) return <div className="p-6"><div className="h-24 animate-pulse bg-surface/30 rounded-lg" /></div>

  if(!workflow) return (
    <div className="p-6">
      <div className="bg-surface/40 border border-gray-700 rounded-xl p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Workflow not found</h3>
        <p className="text-sm text-muted">This workflow may have been deleted or is inaccessible.</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Edit Workflow</h1>
          <p className="text-sm text-muted">Editing workflow <strong>{id}</strong></p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="input w-full" value={name} onChange={e=>setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea className="input w-full h-28" value={description} onChange={e=>setDescription(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            <button type="button" className="btn-secondary" onClick={()=>navigate('/workflows')}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  )
}
