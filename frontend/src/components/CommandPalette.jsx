import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRightIcon, SearchIcon, XIcon } from './Icons'
import { NAV_ITEMS } from '../constants'

export default function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const commands = useMemo(
    () => NAV_ITEMS.map((item) => ({
      ...item,
      description: `Open ${item.label.toLowerCase()} workspace`,
    })),
    [],
  )

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return commands
    return commands.filter((command) =>
      `${command.label} ${command.id} ${command.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [commands, query])

  useEffect(() => {
    if (!open) return undefined

    setQuery('')
    setSelectedIndex(0)
    requestAnimationFrame(() => inputRef.current?.focus())

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(filteredCommands.length - 1, 0)))
  }, [filteredCommands.length])

  if (!open) return null

  function execute(command) {
    onNavigate(command.id)
    onClose()
  }

  function handleInputKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((current) => Math.min(current + 1, filteredCommands.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((current) => Math.max(current - 1, 0))
    }
    if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
      event.preventDefault()
      execute(filteredCommands[selectedIndex])
    }
  }

  return (
    <div className="command-palette-backdrop" onMouseDown={onClose}>
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="command-palette-header">
          <div>
            <span className="command-palette-kicker">COMMAND DECK</span>
            <h2 id="command-palette-title">Jump to a workspace</h2>
          </div>
          <button className="command-palette-close" onClick={onClose} aria-label="Close command palette">
            <XIcon size={18} />
          </button>
        </div>

        <label className="command-palette-search">
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search dashboard, forecast, market..."
            aria-label="Search workspaces"
          />
          <kbd>ESC</kbd>
        </label>

        <div className="command-palette-list" role="listbox" aria-label="Available workspaces">
          {filteredCommands.length > 0 ? filteredCommands.map((command, index) => (
            <button
              key={command.id}
              className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => execute(command)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <span className="command-palette-item-icon"><ArrowRightIcon size={16} /></span>
              <span className="command-palette-item-copy">
                <strong>{command.label}</strong>
                <small>{command.description}</small>
              </span>
              <span className="command-palette-item-key">{String(index + 1).padStart(2, '0')}</span>
            </button>
          )) : (
            <div className="command-palette-empty">No matching workspace.</div>
          )}
        </div>

        <footer className="command-palette-footer">
          <span><kbd>UP</kbd><kbd>DOWN</kbd> Navigate</span>
          <span><kbd>ENTER</kbd> Open</span>
        </footer>
      </section>
    </div>
  )
}
