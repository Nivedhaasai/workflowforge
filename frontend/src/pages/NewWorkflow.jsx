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
    <div className="p-6 max-w-xl">
      <h2 className="text-2xl font-semibold mb-4">Create Workflow</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Workflow name</label>
          <input className="input w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="My awesome automation" />
        </div>
        <div>
          <button className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create and Open Builder'}</button>
        </div>
      </form>
    </div>
  )
}
