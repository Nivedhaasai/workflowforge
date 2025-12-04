import React, { useEffect, useState } from 'react'
import { getWorkflows } from '../services/workflows'
import { useAuth } from '../context/AuthContext'
import WorkflowCard from '../components/WorkflowCard'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Dashboard(){
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  async function load(){
    try{
      setLoading(true)
      const data = await getWorkflows()
      setWorkflows(data)
    }catch(err){
      console.error(err)
      toast.error('Failed to load workflows')
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [token])

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome{user ? `, ${user.name}` : ''}</h1>
          <p className="text-sm text-muted">Your automation pipelines</p>
        </div>
        <div>
          <button onClick={()=>navigate('/workflows/new')} className="btn-primary px-4 py-2 rounded-md">+ New Workflow</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({length:6}).map((_,i)=> <div key={i} className="h-44 bg-surface/40 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {workflows.map(w => (
            <div key={w._id}>
              <WorkflowCard workflow={w} onDelete={(id)=>{ /* fallback: no-op on dashboard */ }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
