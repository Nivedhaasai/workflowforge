import React from 'react'

const colors = {
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  completed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  failed: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  running: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 animate-pulse',
  waiting_approval: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  pending: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  skipped: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
}

const labels = {
  success: 'Success',
  completed: 'Completed',
  failed: 'Failed',
  running: 'Running',
  waiting_approval: 'Awaiting Approval',
  pending: 'Pending',
  skipped: 'Skipped',
}

export default function StatusPill({ status }) {
  const cls = colors[status] || colors.pending
  const label = labels[status] || status
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
