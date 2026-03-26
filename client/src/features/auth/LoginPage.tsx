// REVERIE — Login Page
// Magic link auth: POST /api/auth/magic → email sent → GET /api/auth/verify/{token}
// Emotional register: RECOGNIZED — they arrive here welcomed, not interrogated

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-vault flex flex-col items-center justify-center px-8 animate-fade-in">
        <p className="font-display-light-italic text-gold text-5xl mb-2">REVERIE</p>
        <p className="text-dusk font-ui font-ui-light text-sm tracking-widest uppercase mb-12">
          Dreams2Memories Travel
        </p>
        <p className="text-vellum font-display-light text-2xl text-center mb-4">
          Check your inbox.
        </p>
        <p className="text-dusk font-ui font-ui-light text-sm text-center max-w-xs leading-relaxed">
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
        <p className="text-dusk font-ui font-ui-light text-sm tracking-widest uppercase text-center mb-16">
          Dreams2Memories Travel
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase mb-3">
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
                text-vellum font-ui font-ui-light text-base
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
              font-ui font-ui-light text-sm tracking-widest uppercase
              hover:bg-gold hover:text-vault
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-300
            "
          >
            {loading ? 'Sending…' : 'Open my voyage'}
          </button>
        </form>

        <p className="text-ember font-ui font-ui-xlight text-xs text-center mt-12 leading-relaxed">
          Your link is private and expires in 7 days.
          <br />No password. No account to manage.
        </p>
      </div>
    </div>
  )
}
