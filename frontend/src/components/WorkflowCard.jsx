import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function WorkflowCard({ workflow, onDelete }){
  const navigate = useNavigate()

  return (
    <motion.div layout whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="workflow-card cursor-pointer">
      <div onClick={()=>navigate(`/workflows/${workflow._id}/builder`)} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00e6a8 0%, #009e65 100%)', color:'#041014', fontWeight:700 }}>Wf</div>
        <div className="flex-1 min-w-0">
          <div className="text-md font-semibold truncate">{workflow.name || 'Untitled workflow'}</div>
          <div className="text-xs text-muted mt-1">Updated: {new Date(workflow.updatedAt || workflow.createdAt).toLocaleString()}</div>
        </div>
        <div className="text-xs text-muted text-right ml-4">{workflow.nodes ? workflow.nodes.length : 0} nodes</div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <div className="flex gap-3">
          <button type="button" onClick={(e)=>{ e.stopPropagation(); navigate(`/workflows/${workflow._id}/edit`) }} aria-label={`Edit ${workflow.name || 'workflow'}`} className="btn-secondary h-10 flex items-center px-4">Edit</button>
          <button type="button" onClick={(e)=>{ e.stopPropagation(); onDelete && onDelete(workflow._id) }} aria-label={`Delete ${workflow.name || 'workflow'}`} className="btn-danger h-10 flex items-center px-4">Delete</button>
        </div>
      </div>
    </motion.div>
  )
}
