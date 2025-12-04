import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProtectedRoute({ children }){
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-[60vh]"><LoadingSpinner/></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
