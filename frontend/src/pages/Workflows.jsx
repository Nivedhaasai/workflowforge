import React, { useEffect, useState, useRef } from 'react'
import { getWorkflows, deleteWorkflow } from '../services/workflows'
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
      const data = await getWorkflows()
      setWorkflows(data || [])
    }catch(err){
      console.error('Failed to load workflows', err)
      toast.error(err?.response?.data?.error || 'Failed to load workflows')
    }finally{ setLoading(false) }
  }

  useEffect(()=>{
    fetchWorkflows()
    if(polling.current) clearInterval(polling.current)
    polling.current = setInterval(()=>{ fetchWorkflows() }, 6000)
    return ()=> { if(polling.current) clearInterval(polling.current) }
  }, [token])

  const [confirmState, setConfirmState] = useState({ open:false, id:null })
  async function handleDelete(id){
    if (!id) return setConfirmState({ open:false, id:null })
    const removed = workflows.find(w => w._id === id)
    setWorkflows(prev => prev.filter(w => w._id !== id))
    setConfirmState({ open:false, id:null })
    toast.success('Workflow deleted')

    try{
      await deleteWorkflow(id)
    }catch(err){
      console.error('Delete failed', err)
      if (removed) setWorkflows(prev => [removed, ...prev])
      toast.error(err?.response?.data?.error || 'Delete failed')
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workflows</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your automation pipelines</p>
        </div>
        <button onClick={()=>navigate('/workflows/new')}
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition">
          + New Workflow
        </button>
      </div>

      <AnimatePresence>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({length:8}).map((_,i)=> (
              <motion.div key={i} initial={{opacity:0.6}} animate={{opacity:1}} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {workflows.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center">
                <div className="text-5xl mb-4">🔀</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No workflows yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create your first automation pipeline.</p>
                <button onClick={()=>navigate('/workflows/new')}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition">
                  + New Workflow
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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

      <Modal open={confirmState.open} title="Delete workflow" onClose={()=>setConfirmState({ open:false, id:null })}
        primary={{ label:'Delete', onClick: ()=> handleDelete(confirmState.id) }}
        secondary={{ label:'Cancel', onClick: ()=> setConfirmState({ open:false, id:null }) }}>
        <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to delete this workflow? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
