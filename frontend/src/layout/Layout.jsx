import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, PlusSquare, LogOut, Grid } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../assets/logo.svg'
import LogoSm from '../assets/logo-sm.svg'

export default function Layout({ children }){
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef()

  // close menu on outside click
  useEffect(()=>{
    function onDoc(e){ if(menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('click', onDoc)
    return ()=> document.removeEventListener('click', onDoc)
  },[])

  const initials = user?.name ? user.name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase() : 'WF'

  return (
    <div className="app-grid">
      <aside className={`sidebar glass transition-all ${collapsed ? 'w-16' : ''}`}>
        <div>
          <Link to="/dashboard" title="WorkflowForge">
            <img src={collapsed ? LogoSm : Logo} alt="WorkflowForge" className={collapsed ? 'w-10' : 'w-[140px]'} />
          </Link>
        </div>

        <div className="nav-top">
          <Link to="/dashboard" className="icon transition-fast" title="Workflows"><Grid size={20} /></Link>
          <Link to="/workflows" className="icon transition-fast" title="All Workflows"><Home size={20} /></Link>
          <Link to="/workflows/new" className="icon transition-fast" title="New Workflow"><PlusSquare size={20} /></Link>
        </div>

        <div className="nav-bottom">
          <button type="button" onClick={()=> setCollapsed(s=>!s)} className="icon transition-fast mb-4 self-center" title="Collapse sidebar">{collapsed ? '»' : '«'}</button>

          <div className="relative avatar-menu" ref={menuRef}>
            <button type="button" onClick={()=> setMenuOpen(v=>!v)} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-sm font-semibold">{initials}</button>
            {menuOpen && (
              <div className="absolute menu mb-2 mt-2 w-44 bg-surface border border-gray-700 rounded-md shadow-lg py-2">
                <div className="px-3 py-2 text-sm text-muted">{user?.name}</div>
                <div className="border-t border-gray-800" />
                <Link to="/dashboard" className="block px-3 py-2 text-sm hover:bg-surface/60">Account</Link>
                <button onClick={logout} className="w-full text-left px-3 py-2 text-sm hover:bg-surface/60">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-area container-centered">
        <div className="flex justify-between items-center mb-6">
          <div className="app-header flex items-center gap-3">
            <img src={LogoSm} alt="WorkflowForge" className="w-10 h-10 rounded-md" />
            <div>
              <div className="h1">WorkflowForge</div>
              <div className="small-muted">Build, run, and iterate automations</div>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-sm text-muted hidden sm:block">{user?.name}</div>
            <button className="btn-secondary hidden sm:block" onClick={logout}>Logout</button>
          </div>
        </div>
        <div>{children}</div>
      </main>
    </div>
  )
}
