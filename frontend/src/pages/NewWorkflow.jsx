import React, { useState } from 'react'
import { createWorkflow } from '../services/workflows'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function NewWorkflow(){
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleCreate(e){
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required')
    try{
      setLoading(true)
      const res = await createWorkflow({ name })
      toast.success('Workflow created')
      navigate(`/workflows/${res._id}/builder`)
    }catch(err){
      console.error(err)
      toast.error('Create failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Workflow</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Give your workflow a name and start building</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Workflow name</label>
            <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500 transition" value={name} onChange={e=>setName(e.target.value)} placeholder="My awesome automation" />
          </div>
          <div>
            <button className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50" disabled={loading}>{loading ? 'Creating...' : 'Create and Open Builder →'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
