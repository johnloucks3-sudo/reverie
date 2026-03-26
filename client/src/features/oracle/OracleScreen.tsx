import { useState, useRef, useEffect } from 'react'
import BottomNav from '@/shared/ui/BottomNav'

interface Message {
  role: 'user' | 'dani'
  text: string
}

export default function OracleScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'dani',
      text: "Good morning, John. Your Silver Nova voyage is shaping up beautifully -- 32 days from Colorado Springs to Tokyo, across the Pacific, through Alaska, and home to Seattle. The JAL Business Class Sky Suite is confirmed, the Kyoto food tour is booked, and your dining reservations aboard are set. What would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text: input }])
    setInput('')
  }

  return (
    <div className="min-h-dvh bg-vault flex flex-col pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-between">
        <div className="flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M 12 2 Q 6 8 6 14 Q 6 20 12 22 Q 18 20 18 14 Q 18 8 12 2 Z" />
          </svg>
        </div>
        <h1 className="font-display-light text-gold text-2xl text-center tracking-widest">
          THE ORACLE
        </h1>
      </div>

      {/* Chat Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 flex flex-col"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-4 max-w-xs ${
                msg.role === 'user'
                  ? 'bg-hover text-right'
                  : 'bg-layer text-left'
              }`}
            >
              <p className="text-vellum font-ui font-ui-light text-sm leading-relaxed">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Row */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 bg-vault border-t border-between safe-area-inset-bottom">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Dani anything..."
            className="
              flex-1 bg-layer rounded-full px-6 py-3
              text-vellum font-ui font-ui-light text-sm
              placeholder:text-ember
              border border-between focus:border-gold focus:outline-none
              transition-colors duration-300
            "
          />
          <button
            type="submit"
            className="
              w-12 h-12 rounded-full bg-gold text-vault
              flex items-center justify-center
              hover:shadow-gold transition-all duration-300
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            disabled={!input.trim()}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M 5 12 L 19 12 M 12 5 L 19 12 L 12 19" />
            </svg>
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
