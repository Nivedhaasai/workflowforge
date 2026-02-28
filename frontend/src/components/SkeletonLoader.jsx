import React from 'react'

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/5" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
    </div>
  )
}
