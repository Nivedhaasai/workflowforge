import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTemplates, cloneTemplate } from '../services/workflows'
import { SkeletonCard } from '../components/SkeletonLoader'
import toast from 'react-hot-toast'

const nodeTypeLabels = {
  text: 'Text',
  delay: 'Delay',
  http: 'HTTP',
  condition: 'Condition',
  approval: 'Approval',
  transform: 'Transform',
  trigger: 'Trigger',
}

const iconColors = {
  'leave-request': 'bg-indigo-100 text-indigo-600',
  'http-data-fetch': 'bg-emerald-100 text-emerald-600',
  'delayed-notification': 'bg-amber-100 text-amber-600',
}

export default function Templates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [cloning, setCloning] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getTemplates()
        setTemplates(data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load templates')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleClone(templateId) {
    setCloning(templateId)
    try {
      const workflow = await cloneTemplate(templateId)
      toast.success('Template cloned! Opening builder...')
      navigate(`/workflows/${workflow._id}/builder`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to clone template')
    } finally {
      setCloning(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workflow Templates</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Start with a pre-built workflow and customize it to your needs.</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">No templates available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Templates will appear here when configured.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border border-slate-100 dark:border-slate-800 flex flex-col">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${iconColors[t.id] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {t.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-1">{t.description}</p>

              {/* Node sequence preview */}
              <div className="flex flex-wrap items-center gap-1 mb-4">
                {t.nodeTypes.map((type, i) => (
                  <React.Fragment key={i}>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                      {nodeTypeLabels[type] || type}
                    </span>
                    {i < t.nodeTypes.length - 1 && <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                  {t.nodeCount} nodes
                </span>
                <button
                  onClick={() => handleClone(t.id)}
                  disabled={cloning === t.id}
                  className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                >
                  {cloning === t.id ? 'Cloning...' : 'Use this Template →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
