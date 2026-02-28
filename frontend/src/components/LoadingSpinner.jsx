import React from 'react'

export default function LoadingSpinner(){
  return (
    <div className="w-full h-full flex items-center justify-center py-12">
      <div className="w-10 h-10 rounded-full border-2 border-t-2 border-t-indigo-600 border-slate-200 animate-spin" />
    </div>
  )
}
