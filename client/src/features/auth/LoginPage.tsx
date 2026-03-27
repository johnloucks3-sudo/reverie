// REVERIE — Login Page
// Magic link auth: POST /api/auth/magic → email sent → GET /api/auth/verify/{token}
// Emotional register: RECOGNIZED — they arrive here welcomed, not interrogated

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [linkError, setLinkError] = useState(false)
  const navigate = useNavigate()

  // Handle magic link click — /login?token=xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) return

    setVerifying(true)
    api.get<{ access_token: string }>(`/api/auth/verify/${token}`)
      .then(({ access_token }) => {
        localStorage.setItem('reverie_token', access_token)
        navigate('/', { replace: true })
      })
      .catch(() => {
        setVerifying(false)
        setLinkError(true)
        // Clear the bad token from URL so form shows clean
        window.history.replaceState({}, '', '/login')
      })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/magic', { email })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-dvh bg-vault flex flex-col items-center justify-center px-8 animate-fade-in">
        <p className="font-display-light-italic text-gold text-5xl mb-8">REVERIE</p>
        <p className="text-dusk font-ui text-sm tracking-widest uppercase">Opening your voyage…</p>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-vault flex flex-col items-center justify-center px-8 animate-fade-in">
        <p className="font-display-light-italic text-gold text-5xl mb-2">REVERIE</p>
        <p className="text-dusk font-ui text-sm tracking-widest uppercase mb-12">
          Dreams2Memories Travel
        </p>
        <p className="text-vellum font-display-light text-2xl text-center mb-4">
          Check your inbox.
        </p>
        <p className="text-dusk font-ui text-sm text-center max-w-xs leading-relaxed">
          A private link is waiting for you at <span className="text-gold">{email}</span>.
          It opens your voyage directly.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-vault flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-sm animate-rise">
        <p className="font-display-light-italic text-gold text-5xl text-center mb-2">REVERIE</p>
        <p className="text-dusk font-ui text-sm tracking-widest uppercase text-center mb-16">
          Dreams2Memories Travel
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-dusk font-ui text-xs tracking-widest uppercase mb-3">
              Your email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="
                w-full bg-transparent border-b border-between
                text-vellum font-ui text-base
                py-3 px-0 outline-none
                focus:border-gold transition-colors duration-300
                placeholder:text-ember
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="
              w-full py-4 mt-4
              border border-gold text-gold
              font-ui text-sm tracking-widest uppercase
              hover:bg-gold hover:text-vault
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-300
            "
          >
            {loading ? 'Sending…' : 'Open my voyage'}
          </button>
        </form>

        {linkError && (
          <div className="mt-6 p-4 border border-red-900/50 rounded-lg bg-red-950/20 text-center">
            <p className="text-red-400 font-ui text-xs leading-relaxed">
              That link has expired or was already used.
              <br />Enter your email to receive a fresh one.
            </p>
          </div>
        )}

        <p className="text-ember font-ui text-xs text-center mt-12 leading-relaxed">
          Your link is private and expires in 24 hours.
          <br />No password. No account to manage.
        </p>
      </div>
    </div>
  )
}
