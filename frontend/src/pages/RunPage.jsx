import React from 'react'
import { useParams } from 'react-router-dom'
import RunDetails from '../components/RunDetails'

export default function RunPage(){
  const { id } = useParams()
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Run Details</h1>
        <p className="text-sm text-muted">Run ID: <strong>{id}</strong></p>
      </div>
      <RunDetails runId={id} open={true} onClose={()=>{}} />
    </div>
  )
}
