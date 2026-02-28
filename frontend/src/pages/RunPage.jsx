import React from 'react'
import { useParams, Link } from 'react-router-dom'
import RunDetails from '../components/RunDetails'

export default function RunPage(){
  const { id } = useParams()
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Run Details</h1>
        <p className="text-sm text-slate-500 mt-1">Run ID: <strong className="text-slate-700">{id?.slice(-8)}</strong></p>
      </div>
      <RunDetails runId={id} open={true} onClose={()=>{}} />
    </div>
  )
}
