import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Login(){
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      await login({ email, password })
      navigate('/dashboard')
    }catch(err){
      const backendMessage = err?.response?.data?.error
      setError(backendMessage || err?.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">⚡</div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your WorkflowForge account</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
            </div>
          </form>
          <p className="text-sm text-slate-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Create one</Link>
          </p>
        </div>
        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
