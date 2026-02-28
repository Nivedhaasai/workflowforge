import React from 'react'
import { motion } from 'framer-motion'

const TYPE_CONFIG = {
  trigger:   { icon: '🚀', color: 'border-l-purple-500', bg: 'bg-purple-50' },
  text:      { icon: '📝', color: 'border-l-slate-500',  bg: 'bg-slate-50'  },
  delay:     { icon: '⏱️', color: 'border-l-yellow-500', bg: 'bg-yellow-50' },
  http:      { icon: '🌐', color: 'border-l-blue-500',   bg: 'bg-blue-50'   },
  condition: { icon: '🔀', color: 'border-l-orange-500', bg: 'bg-orange-50' },
  approval:  { icon: '✅', color: 'border-l-emerald-500',bg: 'bg-emerald-50'},
  transform: { icon: '🔧', color: 'border-l-cyan-500',   bg: 'bg-cyan-50'   },
}

export default function NodeCard({ node, onClick, onEdit, onDelete, dragHandleProps }){
  const cfg = TYPE_CONFIG[node.type] || { icon: '▦', color: 'border-l-slate-400', bg: 'bg-slate-50' }

  const summary = (() => {
    if(node.type === 'text') return (node.config?.message || node.config?.text || 'Text node').slice(0, 40)
    if(node.type === 'delay') return `${node.config?.seconds || (node.config?.ms ? node.config.ms / 1000 : 1)}s delay`
    if(node.type === 'http') return node.config?.url ? `${node.config.method || 'GET'} ${node.config.url}`.slice(0, 40) : 'HTTP request'
    if(node.type === 'condition') return `${node.config?.field || '?'} ${node.config?.operator || '=='} ${node.config?.value || '?'}`
    if(node.type === 'approval') return node.config?.assignedTo || 'Approval step'
    if(node.type === 'transform') return node.config?.template ? node.config.template.slice(0, 40) : 'Transform data'
    if(node.type === 'trigger') return 'Manual trigger'
    return node.type
  })()

  return (
    <motion.div layout className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-l-4 ${cfg.color} rounded-xl p-3 w-full flex items-start gap-3 hover:shadow-sm transition-all`}>
      <div {...(dragHandleProps||{})} className="cursor-grab p-2 rounded-md text-slate-400 dark:text-slate-600 opacity-80 hover:opacity-100 hover:text-slate-600 dark:hover:text-slate-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 6h.01M6 6h.01M14 6h.01M10 12h.01M6 12h.01M14 12h.01M10 18h.01M6 18h.01M14 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onClick && onClick(node)}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 flex items-center justify-center ${cfg.bg} rounded-lg text-lg`}>
            {cfg.icon}
          </div>
          <div className="truncate">
            <div className="text-sm font-medium text-slate-800 dark:text-white truncate">{node.config?.label || node.type}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{summary}</div>
          </div>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(node) }}
          className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium">
          Edit
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(node) }}
          className="text-xs px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition font-medium">
          Delete
        </button>
      </div>
    </motion.div>
  )
}
