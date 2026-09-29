import { useState, useEffect, useRef, useCallback } from 'react'
import { API_BASE, DEFAULT_ALARMS } from '../constants'

const STORAGE_KEY = 'ff_alarms'
const NOTIFIED_CACHE_KEY = 'ff_notified_alarms'

export function useAlarms(isLoggedIn = true) {
  const [alarms, setAlarms] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to parse stored alarms', e)
    }
    return DEFAULT_ALARMS
  })

  const [triggered, setTriggered] = useState([])
  const [dismissedIds, setDismissedIds] = useState(new Set())
  const [lastEvaluated, setLastEvaluated] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission === 'granted'
      : false
  )

  // Track triggered alarm IDs that have already sent push/email in the current session
  const notifiedSetRef = useRef(new Set())

  // Persist alarms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
    } catch (e) {
      console.error('Failed to save alarms to localStorage', e)
    }
  }, [alarms])

  // Request browser push notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await window.Notification.requestPermission()
        setPermissionGranted(perm === 'granted')
        return perm === 'granted'
      } catch (err) {
        console.warn('Could not request notification permission:', err)
        return false
      }
    }
    return false
  }, [])

  // Evaluate rules against backend
  const checkAlarms = useCallback(async () => {
    if (!isLoggedIn) return
    const activeRules = alarms.filter((r) => r.enabled)
    if (activeRules.length === 0) {
      setTriggered([])
      return
    }

    setEvaluating(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/alarms/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: activeRules }),
      })

      if (!res.ok) {
        throw new Error(`Evaluation failed with status ${res.status}`)
      }

      const data = await res.json()
      const triggers = data.triggered || []
      setTriggered(triggers)
      setLastEvaluated(data.evaluated_at || new Date().toISOString())

      // Process browser push & email for newly triggered rules
      for (const t of triggers) {
        const cacheKey = `${t.rule_id}_${t.current_value}`
        if (!notifiedSetRef.current.has(cacheKey)) {
          notifiedSetRef.current.add(cacheKey)

          // Native Browser Push
          const matchingRule = alarms.find((r) => r.id === t.rule_id)
          const pushWanted = matchingRule ? matchingRule.notify_push !== false : true
          if (
            pushWanted &&
            typeof window !== 'undefined' &&
            'Notification' in window &&
            window.Notification.permission === 'granted'
          ) {
            try {
              new window.Notification(`🚨 Freight Alert: ${t.rule_name}`, {
                body: t.message,
                icon: '/vite.svg',
                tag: t.rule_id,
              })
            } catch (notifErr) {
              console.warn('Failed to display native push notification:', notifErr)
            }
          }

          // Optional Email Dispatch
          const emailTarget = matchingRule?.notify_email || matchingRule?.email
          if (emailTarget && emailTarget.trim().length > 0) {
            try {
              fetch(`${API_BASE}/api/v1/alarms/notify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to_email: emailTarget.trim(),
                  subject: `[ALERT] ${t.rule_name} Triggered (${t.severity.toUpperCase()})`,
                  triggers: [t],
                }),
              }).catch((e) => console.warn('Email dispatch warning:', e))
            } catch (err) {
              console.warn('Could not post email notification:', err)
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to evaluate alarms against backend:', err)
    } finally {
      setEvaluating(false)
    }
  }, [alarms, isLoggedIn])

  // Initial check & 60-second polling
  useEffect(() => {
    if (isLoggedIn) {
      checkAlarms()
      const interval = setInterval(checkAlarms, 60000)
      return () => clearInterval(interval)
    }
  }, [checkAlarms, isLoggedIn])

  // CRUD Operations
  const addAlarm = useCallback((newRule) => {
    const ruleWithId = {
      ...newRule,
      id: newRule.id || `alarm-${Date.now()}`,
      enabled: newRule.enabled !== undefined ? newRule.enabled : true,
      notify_push: newRule.notify_push !== undefined ? newRule.notify_push : true,
    }
    setAlarms((prev) => [ruleWithId, ...prev])
    return ruleWithId
  }, [])

  const updateAlarm = useCallback((id, updatedFields) => {
    setAlarms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    )
  }, [])

  const deleteAlarm = useCallback((id) => {
    setAlarms((prev) => prev.filter((r) => r.id !== id))
    setTriggered((prev) => prev.filter((t) => t.rule_id !== id))
  }, [])

  const toggleAlarm = useCallback((id) => {
    setAlarms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }, [])

  const dismissTrigger = useCallback((ruleId) => {
    setDismissedIds((prev) => {
      const next = new Set(prev)
      next.add(ruleId)
      return next
    })
  }, [])

  const dismissAllTriggers = useCallback(() => {
    setDismissedIds(new Set(triggered.map((t) => t.rule_id)))
  }, [triggered])

  // Active triggers excluding user-dismissed ones
  const activeTriggers = triggered.filter((t) => !dismissedIds.has(t.rule_id))

  return {
    alarms,
    triggered: activeTriggers,
    rawTriggeredCount: triggered.length,
    lastEvaluated,
    evaluating,
    permissionGranted,
    requestNotificationPermission,
    checkAlarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissTrigger,
    dismissAllTriggers,
  }
}
