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

  if(loading) return <div className="p-8"><div className="h-24 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-2xl" /></div>

  if(!workflow) return (
    <div className="p-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Workflow not found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">This workflow may have been deleted or is inaccessible.</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Workflow</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your workflow details</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
            <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500 transition" value={name} onChange={e=>setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500 transition" value={description} onChange={e=>setDescription(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            <button type="button" onClick={()=>navigate('/workflows')} className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
