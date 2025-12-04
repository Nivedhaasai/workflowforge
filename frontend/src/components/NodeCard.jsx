import React from 'react'
import { motion } from 'framer-motion'

function TypeIcon({ type }){
  // minimal icons — keep visuals simple and dependency-free
  if(type === 'text') return <span className="text-lg">📝</span>
  if(type === 'delay') return <span className="text-lg">⏱️</span>
  if(type === 'http') return <span className="text-lg">🌐</span>
  return <span className="text-lg">▦</span>
}

export default function NodeCard({ node, onClick, onEdit, onDelete, dragHandleProps }){
  const title = node.config?.title || node.type
  const summary = (() => {
    if(node.type === 'text') return node.config?.message || 'Text node'
    if(node.type === 'delay') return `${node.config?.ms || 1000} ms`
    if(node.type === 'http') return node.config?.url || 'HTTP request'
    return ''
  })()

  return (
    <motion.div layout className="group bg-surface/60 border border-gray-700 rounded-lg p-3 w-full flex items-start gap-3 card glass">
      <div {...(dragHandleProps||{})} className="drag-handle cursor-grab p-2 rounded-md text-muted opacity-80 hover:opacity-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted"><path d="M10 6h.01M6 6h.01M14 6h.01M10 12h.01M6 12h.01M14 12h.01M10 18h.01M6 18h.01M14 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>

      <div className="flex-1 min-w-0" onClick={()=> onClick && onClick(node)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-transparent text-accent rounded-md">
            <TypeIcon type={node.type} />
          </div>
          <div className="truncate">
            <div className="text-sm font-medium truncate">{title}</div>
            <div className="text-xs text-muted truncate">{summary}</div>
          </div>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button type="button" onClick={(e)=>{ e.stopPropagation(); onEdit && onEdit(node)}} className="btn-secondary text-xs px-2 py-1">Edit</button>
        <button type="button" onClick={(e)=>{ e.stopPropagation(); onDelete && onDelete(node)}} className="btn-danger text-xs px-2 py-1">Delete</button>
      </div>
    </motion.div>
  )
}
