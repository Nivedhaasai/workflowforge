import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewWorkflow from './pages/NewWorkflow'
import EditWorkflow from './pages/EditWorkflow'
import Workflows from './pages/Workflows'
import Builder from './pages/Builder'
import RunPage from './pages/RunPage'
import Templates from './pages/Templates'
import Landing from './pages/Landing'
import Layout from './layout/Layout'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './layout/ProtectedRoute'

export default function App(){
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <Landing/> : <Navigate to="/dashboard" replace/>} />
      <Route path="/login" element={!user ? <LoginPage/> : <Navigate to="/dashboard" replace/>} />
      <Route path="/register" element={!user ? <RegisterPage/> : <Navigate to="/dashboard" replace/>} />

      {/* Protected routes with sidebar layout */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
      <Route path="/workflows/new" element={<ProtectedRoute><Layout><NewWorkflow/></Layout></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Layout><Workflows/></Layout></ProtectedRoute>} />
      <Route path="/workflows/:id/builder" element={<ProtectedRoute><Layout><Builder/></Layout></ProtectedRoute>} />
      <Route path="/workflows/:id/edit" element={<ProtectedRoute><Layout><EditWorkflow/></Layout></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Layout><Templates/></Layout></ProtectedRoute>} />
      <Route path="/runs/:id" element={<ProtectedRoute><Layout><RunPage/></Layout></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  )
}
