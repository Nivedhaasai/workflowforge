import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function WorkflowCard({ workflow, onDelete }){
  const navigate = useNavigate()
  const nodeCount = workflow.nodes ? workflow.nodes.length : 0

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
    >
      <div onClick={() => navigate(`/workflows/${workflow._id}/builder`)}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            🔀
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{workflow.name || 'Untitled workflow'}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{nodeCount} node{nodeCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Updated {new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/workflows/${workflow._id}/builder`) }}
          className="flex-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
        >
          Open Builder
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/workflows/${workflow._id}/edit`) }}
          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(workflow._id) }}
          className="text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 py-1.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
        >
          Delete
        </button>
      </div>
    </motion.div>
  )
}
