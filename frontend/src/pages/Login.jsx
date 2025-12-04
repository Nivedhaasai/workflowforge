import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Logo from '../assets/logo.svg'

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
      // Prefer backend-provided error message when available (axios error.response.data.error)
      const backendMessage = err?.response?.data?.error
      setError(backendMessage || err?.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full mt-6 p-6 bg-surface rounded-md shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <img src={Logo} alt="WorkflowForge" className="w-14 h-14" />
          <div>
            <div className="text-lg font-bold">WorkflowForge</div>
            <div className="text-sm text-muted">Visual workflow automation</div>
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div>
          <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        </div>
      </form>
      </div>
    </div>
  )
}
