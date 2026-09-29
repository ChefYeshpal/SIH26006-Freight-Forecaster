import { useEffect } from 'react'
import { XIcon, AlertTriangleIcon } from './Icons'
import { ALARM_SEVERITIES } from '../constants'
import './alarm-toast.css'

export default function AlarmToast({
  triggered = [],
  onOpenModal,
  onDismiss,
}) {
  // Show at most top 3 active alerts to prevent clutter
  const visibleToasts = triggered.slice(0, 3)

  // Auto-dismiss the earliest toast after 10s if user doesn't touch it
  useEffect(() => {
    if (visibleToasts.length === 0) return

    const timer = setTimeout(() => {
      onDismiss(visibleToasts[0].rule_id)
    }, 10000)

    return () => clearTimeout(timer)
  }, [visibleToasts, onDismiss])

  if (visibleToasts.length === 0) return null

  return (
    <div className="alarm-toast-container" aria-live="polite">
      {visibleToasts.map((item) => {
        const sev = ALARM_SEVERITIES[item.severity] || ALARM_SEVERITIES.warning

        return (
          <div
            key={item.rule_id}
            className={`alarm-toast-card ${item.severity}`}
            role="alert"
          >
            <div className="alarm-toast-top">
              <div className="alarm-toast-title-row">
                <span>{sev.icon}</span>
                <span className="alarm-toast-title">{item.rule_name}</span>
              </div>
              <button
                className="alarm-toast-close"
                onClick={() => onDismiss(item.rule_id)}
                aria-label="Dismiss alert"
              >
                <XIcon size={14} />
              </button>
            </div>

            <p className="alarm-toast-msg">{item.message}</p>

            <div className="alarm-toast-bottom">
              <span className="alarm-toast-time">{item.triggered_at}</span>
              <button
                className="alarm-toast-action-btn"
                onClick={onOpenModal}
              >
                View Details →
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
