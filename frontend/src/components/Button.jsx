import React from 'react'
export default function Button({ children, variant='primary', ...props }){
  if (variant === 'primary') return <button className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50" {...props}>{children}</button>
  return <button className="w-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50" {...props}>{children}</button>
}
