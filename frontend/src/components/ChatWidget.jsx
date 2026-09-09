import { useState, useEffect, useRef } from 'react'
import { BotIcon, SendIcon, XIcon } from './Icons'
import { API_BASE } from '../constants'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Maritime AI Copilot. Ask me about freight rates, chartering decisions, or maritime terminology.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  // Fetch suggestions on first open
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions()
    }
  }, [isOpen])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchSuggestions() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/suggestions`)
      if (res.ok) {
        const data = await res.json()
        const allPrompts = data.categories?.flatMap((c) => c.prompts) || []
        setSuggestions(allPrompts.slice(0, 6))
      }
    } catch {
      // Suggestions are optional
    }
  }

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...newMessages, { role: 'assistant', content: data.reply, data }])
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Cannot reach the API server. Please ensure it\'s running.' }])
    }

    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* FAB Button */}
      <button
        className={`chat-fab ${isOpen ? 'chat-fab-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="AI Copilot"
      >
        <BotIcon size={24} />
        <span className="chat-fab-pulse" />
      </button>

      {/* Chat Panel */}
      <div className={`chat-panel ${isOpen ? 'chat-panel-open' : ''}`}>
        {/* Header */}
        <div className="chat-panel-header">
          <div className="chat-panel-header-left">
            <div className="chat-panel-avatar">
              <BotIcon size={18} />
            </div>
            <div className="chat-panel-title-wrap">
              <span className="chat-panel-title">Maritime AI Copilot</span>
              <span className="chat-panel-status">
                <span className="chat-online-dot" />
                Online
              </span>
            </div>
          </div>
          <button className="chat-panel-close" onClick={() => setIsOpen(false)}>
            <XIcon size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-panel-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg chat-msg-${msg.role}`}>
              <div className="chat-msg-bubble">
                <p>{msg.content}</p>
                {/* Show action signal if available */}
                {msg.data?.action_signal && (
                  <div className="chat-msg-signal">
                    <span className={`chat-signal-badge ${msg.data.action_signal === 'CHARTER_NOW' ? 'green' : msg.data.action_signal === 'WAIT' ? 'amber' : 'gray'}`}>
                      {msg.data.action_signal}
                    </span>
                    {msg.data.estimated_savings_usd && (
                      <span className="chat-savings">
                        Est. savings: ${msg.data.estimated_savings_usd?.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
                {/* Follow-up suggestions */}
                {msg.data?.follow_up_suggestions?.length > 0 && (
                  <div className="chat-followups">
                    {msg.data.follow_up_suggestions.map((s, i) => (
                      <button key={i} className="chat-followup-chip" onClick={() => sendMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-msg chat-msg-assistant">
              <div className="chat-msg-bubble">
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (only show if few messages) */}
        {messages.length <= 2 && suggestions.length > 0 && (
          <div className="chat-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="chat-suggestion-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-panel-input">
          <input
            type="text"
            placeholder="Ask about freight, routes, chartering..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </>
  )
}
