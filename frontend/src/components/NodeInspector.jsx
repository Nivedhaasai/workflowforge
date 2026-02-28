import React, { useEffect, useState } from 'react'

const nodeTypeNames = {
  trigger: 'Manual Trigger',
  text: 'Send Text',
  delay: 'Delay',
  http: 'HTTP Request',
  condition: 'Condition / Branch',
  approval: 'Approval Step',
  transform: 'Transform Data',
}

export default function NodeInspector({ node, onSave, onDelete, onClose }) {
  const [local, setLocal] = useState(node ? { ...node, config: { ...node.config } } : null)

  useEffect(() => {
    setLocal(node ? { ...node, config: { ...node.config } } : null)
  }, [node])

  const current = local
  if (!current) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 text-center">
        <div className="text-3xl mb-2">🔧</div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Select a node to configure it</p>
      </div>
    )
  }

  function handleChange(key, value) {
    setLocal(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }))
  }

  function save() {
    onSave && onSave(local)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Node Inspector</h4>
        <button onClick={onClose} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">✕ Close</button>
      </div>

      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
        {nodeTypeNames[current.type] || current.type}
      </div>

      <div className="space-y-3">
        {current.type === 'trigger' && (
          <p className="text-xs text-slate-500 dark:text-slate-400">This node starts the workflow. No configuration needed.</p>
        )}

        {current.type === 'text' && (
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Message</label>
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
              rows={3}
              value={current.config?.message || ''}
              onChange={e => handleChange('message', e.target.value)}
              placeholder="Enter your message text..."
            />
          </div>
        )}

        {current.type === 'delay' && (
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Duration (seconds)</label>
            <input
              type="number"
              min={1}
              max={60}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
              value={current.config?.ms ? Math.round(current.config.ms / 1000) : current.config?.seconds || 1}
              onChange={e => {
                const sec = Number(e.target.value)
                handleChange('ms', sec * 1000)
                handleChange('seconds', sec)
              }}
            />
          </div>
        )}

        {current.type === 'http' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">URL</label>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={current.config?.url || ''}
                onChange={e => handleChange('url', e.target.value)}
                placeholder="https://api.example.com/data"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Method</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={current.config?.method || 'GET'}
                onChange={e => handleChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            {current.config?.method === 'POST' && (
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Body (JSON)</label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 font-mono resize-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                  rows={3}
                  value={current.config?.body || ''}
                  onChange={e => handleChange('body', e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}
          </div>
        )}

        {current.type === 'condition' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Field</label>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={current.config?.field || ''}
                onChange={e => handleChange('field', e.target.value)}
                placeholder="e.g., decision, status, name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Operator</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={current.config?.operator || '=='}
                onChange={e => handleChange('operator', e.target.value)}
              >
                <option value="==">Equals</option>
                <option value="!=">Not Equals</option>
                <option value="contains">Contains</option>
                <option value=">">Greater Than</option>
                <option value="<">Less Than</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Value</label>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={current.config?.value || ''}
                onChange={e => handleChange('value', e.target.value)}
                placeholder="Value to compare against"
              />
            </div>
          </div>
        )}

        {current.type === 'approval' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Assigned To (email)</label>
              <input
                type="email"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={current.config?.assignedTo || ''}
                onChange={e => handleChange('assignedTo', e.target.value)}
                placeholder="manager@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Message</label>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                rows={3}
                value={current.config?.message || ''}
                onChange={e => handleChange('message', e.target.value)}
                placeholder="Please approve this request..."
              />
            </div>
          </div>
        )}

        {current.type === 'transform' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Output Key</label>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={current.config?.outputKey || ''}
                onChange={e => handleChange('outputKey', e.target.value)}
                placeholder="result"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Template</label>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500 focus:border-indigo-400 dark:focus:border-indigo-500"
                rows={3}
                value={current.config?.template || ''}
                onChange={e => handleChange('template', e.target.value)}
                placeholder='Use {{fieldName}} to reference previous output'
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Use {'{{fieldName}}'} to reference previous node output</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={save} className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
            Save
          </button>
          <button onClick={() => onDelete(current.id)} className="px-4 py-2.5 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
