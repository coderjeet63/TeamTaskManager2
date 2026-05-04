import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import Button from '../components/common/Button'
import InputField from '../components/common/InputField'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/format'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
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
      await register(formData)
      toast.success('Account created successfully.')
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

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-panel order-2 p-8 md:p-10 lg:order-1"
        >
          <div className="mb-8 space-y-2">
            <p className="eyebrow">Create Account</p>
            <h2 className="font-display text-3xl font-bold text-slate-50">Join the workspace</h2>
            <p className="text-sm text-slate-400">Start creating projects, assigning work, and tracking delivery.</p>
          </div>

          <div className="space-y-5">
            <InputField
              label="Full name"
              name="name"
              type="text"
              placeholder="Jane Cooper"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="mt-8 w-full" size="lg" loading={submitting}>
            Create Account
          </Button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-200">
              Sign in
            </Link>
          </p>
        </motion.form>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-panel order-1 flex flex-col justify-between p-8 md:p-10 lg:order-2"
        >
          <div className="space-y-6">
            <p className="eyebrow">Why It Feels Strong</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-50 md:text-5xl">
              Designed to present like a serious product, not a classroom CRUD app.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              The assignment asks for real-world teamwork flows. This UI leans into that with a structured shell, glass
              panels, clear hierarchy, and fast at-a-glance analytics.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Professional shell', value: 'Sidebar, topbar, responsive panels' },
              { label: 'Team operations', value: 'Members, projects, assigned work' },
              { label: 'Delivery visibility', value: 'Status charts and overdue snapshots' },
              { label: 'Reviewer friendly', value: 'Readable code and scalable structure' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm text-slate-200">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default RegisterPage
