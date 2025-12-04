import React, { useEffect, useState, useRef } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import WorkflowCard from '../components/WorkflowCard'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import { motion, AnimatePresence } from 'framer-motion'

export default function Workflows(){
  const { token } = useAuth()
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const polling = useRef(null)

  async function fetchWorkflows(){
    try{
      setLoading(true)
      const res = await api.get('/api/workflows')
      setWorkflows(res.data || [])
    }catch(err){
      console.error('Failed to load workflows', err)
      toast.error(err?.response?.data?.error || 'Failed to load workflows')
    }finally{ setLoading(false) }
  }

  // initial load + polling every 6s for realtime feel
  useEffect(()=>{
    fetchWorkflows()
    if(polling.current) clearInterval(polling.current)
    polling.current = setInterval(()=>{ fetchWorkflows() }, 6000)
    return ()=> { if(polling.current) clearInterval(polling.current) }
  }, [token])

  const [confirmState, setConfirmState] = useState({ open:false, id:null })
  async function handleDelete(id){
    if (!id) return setConfirmState({ open:false, id:null })
    // optimistic removal: remove locally and close modal immediately
    const removed = workflows.find(w => w._id === id)
    setWorkflows(prev => prev.filter(w => w._id !== id))
    setConfirmState({ open:false, id:null })
    toast.success('Workflow deleted')

    try{
      await api.delete(`/api/workflows/${id}`)
      // nothing else needed — optimistic already removed
    }catch(err){
      console.error('Delete failed', err)
      // restore the removed item on failure
      if (removed) setWorkflows(prev => [removed, ...prev])
      toast.error(err?.response?.data?.error || 'Delete failed')
    }
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <p className="text-sm text-muted">Your automation pipelines</p>
        </div>
        <div>
          <button onClick={()=>navigate('/workflows/new')} className="btn-primary px-4 py-2 rounded-md">+ New Workflow</button>
        </div>
      </div>

      <AnimatePresence>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i)=> (
              <motion.div key={i} initial={{opacity:0.6}} animate={{opacity:1}} className="h-36 bg-surface/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {workflows.length === 0 ? (
              <div className="empty-state p-12 bg-surface/40 border border-gray-700 rounded-xl text-center">
                <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
                <p className="text-sm text-muted mb-4">Create your first automation pipeline.</p>
                <button onClick={()=>navigate('/workflows/new')} className="btn-primary px-4 py-2 rounded-md">+ New Workflow</button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {workflows.map(w => (
                  <motion.div layout key={w._id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                    <WorkflowCard workflow={w} onDelete={(id)=> setConfirmState({ open:true, id })} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
      <Modal open={confirmState.open} title="Delete workflow" onClose={()=>setConfirmState({ open:false, id:null })} primary={{ label:'Delete', onClick: ()=> handleDelete(confirmState.id) }} secondary={{ label:'Cancel', onClick: ()=> setConfirmState({ open:false, id:null }) }}>
        <p>Are you sure you want to delete this workflow? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
