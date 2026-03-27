import { useState, useRef, useEffect } from 'react'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

interface Message {
  role: 'user' | 'dani'
  text: string
}

export default function OracleScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'dani',
      text: "Good morning, John. Your Silver Nova voyage is shaping up beautifully -- 32 days from Colorado Springs to Tokyo, across the Pacific, through Alaska, and home to Seattle. All 11 bookings are confirmed, the JAL Business Sky Suite is locked in, and your dining reservations aboard are set. What would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post<{ role: string; text: string }>('/api/chat', { message: userMsg })
      setMessages(prev => [...prev, { role: 'dani', text: res.text }])
    } catch {
      setMessages(prev => [...prev, { role: 'dani', text: "I'm having trouble connecting right now. Please try again in a moment." }])
    } finally {
      setLoading(false)
    }
  }

  // Quick suggestion chips
  const suggestions = [
    'Show me my flights',
    'What about dining?',
    'Tell me about Alaska',
    'How much is the total?',
    'Confirmation numbers',
  ]

  const handleSuggestion = (text: string) => {
    setInput(text)
  }

  return (
    <div className="min-h-dvh bg-vault flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-between shrink-0">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M 12 2 Q 6 8 6 14 Q 6 20 12 22 Q 18 20 18 14 Q 18 8 12 2 Z" />
          </svg>
        </div>
        <h1 className="font-display text-gold text-2xl text-center tracking-widest font-light">
          THE ORACLE
        </h1>
        <p className="text-ember font-ui font-ui-xlight text-xs text-center mt-1">Dani Moreau, your concierge</p>
      </div>

      {/* Chat Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
        style={{ paddingBottom: '140px' }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-xl p-4 max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-hover border border-between'
                  : 'bg-layer border border-between'
              }`}
            >
              {msg.role === 'dani' && (
                <p className="text-gold font-ui font-ui-xlight text-[10px] tracking-wider uppercase mb-2">Dani</p>
              )}
              <p className="text-vellum font-ui font-ui-light text-sm leading-relaxed whitespace-pre-line">
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-layer border border-between rounded-xl p-4">
              <p className="text-gold font-ui font-ui-xlight text-[10px] tracking-wider uppercase mb-2">Dani</p>
              <p className="text-dusk font-ui font-ui-light text-sm animate-pulse">Checking your voyage details...</p>
            </div>
          </div>
        )}

        {/* Suggestion Chips — show only when few messages */}
        {messages.length <= 2 && !loading && (
          <div className="pt-2">
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mb-2">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="bg-hover border border-between rounded-full px-4 py-2 text-dusk font-ui font-ui-xlight text-xs hover:border-gold hover:text-vellum transition-colors duration-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Row */}
      <div className="fixed bottom-16 left-0 right-0 px-5 py-3 bg-vault border-t border-between">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Dani anything..."
            className="
              flex-1 bg-layer rounded-full px-5 py-3
              text-vellum font-ui font-ui-light text-sm
              placeholder:text-ember
              border border-between focus:border-gold focus:outline-none
              transition-colors duration-300
            "
          />
          <button
            type="submit"
            className="
              w-11 h-11 rounded-full bg-gold text-vault
              flex items-center justify-center shrink-0
              hover:shadow-gold transition-all duration-300
              disabled:opacity-30 disabled:cursor-not-allowed
            "
            disabled={!input.trim() || loading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M 5 12 L 19 12 M 13 6 L 19 12 L 13 18" />
            </svg>
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
