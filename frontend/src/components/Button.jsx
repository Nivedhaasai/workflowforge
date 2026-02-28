import React from 'react'
export default function Button({ children, variant='primary', ...props }){
  if (variant === 'primary') return <button className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50" {...props}>{children}</button>
  return <button className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50" {...props}>{children}</button>
}
