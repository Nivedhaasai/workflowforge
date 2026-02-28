import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  {
    icon: '🔀',
    title: 'Visual Drag & Drop Builder',
    desc: 'Design workflows with an intuitive canvas. Add nodes, connect steps, and configure in seconds.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Execution',
    desc: 'Watch your workflows run live. Every node step tracked, logged, and visible.',
  },
  {
    icon: '✅',
    title: 'Approval Workflows',
    desc: 'Build human-in-the-loop processes. Route for approval, handle decisions, continue automatically.',
  },
]

const templateCards = [
  {
    id: 'leave-request',
    icon: '📋',
    color: 'bg-indigo-100 text-indigo-600',
    name: 'Leave Request Approval',
    desc: 'Employee leave request with manager approval routing.',
    nodeCount: 4,
  },
  {
    id: 'http-data-fetch',
    icon: '🌐',
    color: 'bg-emerald-100 text-emerald-600',
    name: 'HTTP Data Fetch & Transform',
    desc: 'Fetch data from APIs, transform and process results.',
    nodeCount: 3,
  },
  {
    id: 'delayed-notification',
    icon: '⏳',
    color: 'bg-amber-100 text-amber-600',
    name: 'Delayed Notification',
    desc: 'Start a process, wait, then send a timed notification.',
    nodeCount: 4,
  },
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">WorkflowForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium px-4 py-2.5 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            Build Powerful Workflows.<br />
            <span className="text-indigo-600 dark:text-indigo-400">Automate Anything.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            WorkflowForge lets you visually design, automate, and monitor business processes — no code required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900">
              Start Building Free →
            </Link>
            <a href="#templates" className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-3.5 rounded-xl font-semibold text-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              View Demo Workflows
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white text-center mb-12">
            Why WorkflowForge?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition-all p-8 border border-slate-100 dark:border-slate-700">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white text-center mb-4">
            Start from a Template
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Get started instantly with pre-built workflow templates. Customize them to fit your needs.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {templateCards.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border border-slate-100 dark:border-slate-800 flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${t.color}`}>
                  {t.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-1">{t.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                    {t.nodeCount} nodes
                  </span>
                  <Link to="/register" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    Use Template →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Bar */}
      <section className="py-10 bg-slate-50 dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Built with <span className="font-medium text-slate-700 dark:text-slate-300">React</span> + <span className="font-medium text-slate-700 dark:text-slate-300">Node.js</span> + <span className="font-medium text-slate-700 dark:text-slate-300">MongoDB</span> · JWT Secured · Docker Ready · CI/CD with GitHub Actions
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            WorkflowForge — A Kissflow-inspired workflow automation platform
          </p>
          <a href="https://github.com/Nivedhaasai/workflowforge" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-medium">
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  )
}
