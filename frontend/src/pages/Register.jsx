import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Register(){
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      await register({ name, email, password })
      navigate('/dashboard')
    }catch(err){
      setError(err?.message || 'Registration failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-surface rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <Input value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
        </div>
      </form>
    </div>
  )
}
