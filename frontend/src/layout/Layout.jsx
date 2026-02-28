import React from 'react'
import Sidebar from '../components/Sidebar'

export default function Layout({ children }){
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
