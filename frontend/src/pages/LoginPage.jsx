import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import Button from '../components/common/Button'
import InputField from '../components/common/InputField'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/format'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      await login(formData)
      toast.success('Welcome back.')
      navigate('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 app-grid opacity-30" />
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col justify-between p-8 md:p-10"
        >
          <div className="space-y-6">
            <p className="eyebrow">PulseBoard</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-50 md:text-5xl">
              Lead projects with a calmer, sharper operating rhythm.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              Built like a portfolio-level command center: role-aware task management, live analytics, team projects,
              and a polished UI reviewers can navigate without friction.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Secure sessions', value: 'JWT + HTTP-only cookies' },
              { label: 'Project roles', value: 'Admin and member controls' },
              { label: 'Insight layer', value: 'Overdue and completion analytics' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm text-slate-200">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={handleSubmit}
          className="glass-panel p-8 md:p-10"
        >
          <div className="mb-8 space-y-2">
            <p className="eyebrow">Welcome Back</p>
            <h2 className="font-display text-3xl font-bold text-slate-50">Sign in to your workspace</h2>
            <p className="text-sm text-slate-400">Use your team account to access projects, tasks, and analytics.</p>
          </div>

          <div className="space-y-5">
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="jane@team.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="mt-8 w-full" size="lg" loading={submitting}>
            Sign In
          </Button>

          <p className="mt-6 text-center text-sm text-slate-400">
            New here?{' '}
            <Link to="/register" className="font-semibold text-cyan-200">
              Create an account
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}

export default LoginPage
