import { useState, useEffect } from 'react'
import {
  BellIcon,
  XIcon,
  PlusIcon,
  TrashIcon,
  RefreshCwIcon,
  MailIcon,
  AlertTriangleIcon,
} from './Icons'
import { ALARM_METRICS, ALARM_CONDITIONS, ALARM_SEVERITIES } from '../constants'
import './alarm-modal.css'

export default function AlarmModal({
  isOpen,
  onClose,
  alarmState,
}) {
  const [activeTab, setActiveTab] = useState('alerts') // 'alerts' | 'rules'
  const [showAddForm, setShowAddForm] = useState(false)

  // Add rule form state
  const [formData, setFormData] = useState({
    name: '',
    metric: 'bci_index',
    condition: 'above',
    threshold: 2800,
    signal_value: 'CHARTER_NOW',
    notify_email: '',
    notify_push: true,
  })

  const {
    alarms,
    triggered,
    rawTriggeredCount,
    lastEvaluated,
    evaluating,
    permissionGranted,
    requestNotificationPermission,
    checkAlarms,
    addAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissTrigger,
    dismissAllTriggers,
  } = alarmState

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isSignalType =
    formData.metric === 'charter_signal' || formData.condition === 'signal_equals'

  const currentMetricConfig =
    ALARM_METRICS.find((m) => m.value === formData.metric) || ALARM_METRICS[0]

  function handleMetricChange(e) {
    const val = e.target.value
    const matched = ALARM_METRICS.find((m) => m.value === val)
    setFormData((prev) => ({
      ...prev,
      metric: val,
      threshold: matched ? matched.defaultThresh : 0,
      condition: val === 'charter_signal' ? 'signal_equals' : prev.condition,
    }))
  }

  function handleSaveRule(e) {
    e.preventDefault()
    if (!formData.name.trim()) return

    addAlarm({
      name: formData.name.trim(),
      metric: formData.metric,
      condition: formData.condition,
      threshold: isSignalType ? 0 : parseFloat(formData.threshold) || 0,
      signal_value: isSignalType ? formData.signal_value : null,
      notify_email: formData.notify_email.trim(),
      notify_push: formData.notify_push,
      enabled: true,
    })

    // Reset form
    setFormData({
      name: '',
      metric: 'bci_index',
      condition: 'above',
      threshold: 2800,
      signal_value: 'CHARTER_NOW',
      notify_email: '',
      notify_push: true,
    })
    setShowAddForm(false)
    setActiveTab('rules')
  }

  return (
    <div className="alarm-modal-backdrop" onClick={onClose}>
      <div className="alarm-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="alarm-modal-header">
          <div className="alarm-modal-title-wrap">
            <div className="alarm-modal-icon-badge">
              <BellIcon size={22} />
            </div>
            <div>
              <h3 className="alarm-modal-title">Market Early Warning & Alarms</h3>
              <p className="alarm-modal-subtitle">
                Automated risk surveillance & tender alerts for freight operations
              </p>
            </div>
          </div>
          <button
            className="alarm-modal-close-btn"
            onClick={onClose}
            aria-label="Close alarms modal"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="alarm-modal-tabs">
          <button
            className={`alarm-modal-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            🔔 Active Alerts
            {triggered.length > 0 && (
              <span className="alarm-tab-badge">{triggered.length}</span>
            )}
          </button>
          <button
            className={`alarm-modal-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            ⚙️ Manage Rules ({alarms.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="alarm-modal-body">
          {activeTab === 'alerts' ? (
            <div>
              <div className="alarm-tab-toolbar">
                <span>
                  {triggered.length === 0
                    ? 'No triggered alerts requiring intervention'
                    : `${triggered.length} alert${triggered.length > 1 ? 's' : ''} currently active`}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="alarm-btn-sm"
                    onClick={checkAlarms}
                    disabled={evaluating}
                    title="Poll API for rule evaluations"
                  >
                    <RefreshCwIcon size={14} className={evaluating ? 'spin' : ''} />
                    {evaluating ? 'Evaluating...' : 'Check Now'}
                  </button>
                  {triggered.length > 0 && (
                    <button className="alarm-btn-sm" onClick={dismissAllTriggers}>
                      Dismiss All
                    </button>
                  )}
                </div>
              </div>

              {triggered.length === 0 ? (
                <div className="alarm-empty-state">
                  <div className="alarm-empty-icon">✓</div>
                  <h4>Market Conditions Normal</h4>
                  <p>
                    All monitored freight indexes, bunker fuels, and port congestion
                    levels are within your predefined safety parameters.
                  </p>
                </div>
              ) : (
                <div className="alarm-trigger-list">
                  {triggered.map((t) => {
                    const sev = ALARM_SEVERITIES[t.severity] || ALARM_SEVERITIES.warning
                    return (
                      <div key={t.rule_id} className={`alarm-trigger-card ${t.severity}`}>
                        <div className="alarm-trigger-header">
                          <div className="alarm-trigger-title-wrap">
                            <span className="alarm-trigger-title">{t.rule_name}</span>
                            <span className={`alarm-severity-badge ${t.severity}`}>
                              {sev.icon} {sev.label}
                            </span>
                          </div>
                          <button
                            className="alarm-dismiss-btn"
                            onClick={() => dismissTrigger(t.rule_id)}
                            title="Dismiss this alert"
                          >
                            Dismiss
                          </button>
                        </div>
                        <div className="alarm-trigger-message">{t.message}</div>
                        <div className="alarm-trigger-meta">
                          <span>Metric: {t.metric_label}</span>
                          <span>Fired: {t.triggered_at}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="alarm-tab-toolbar">
                <span>Active surveillance rules ({alarms.filter((r) => r.enabled).length} of {alarms.length} enabled)</span>
                <button
                  className="alarm-btn-primary"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <PlusIcon size={16} />
                  {showAddForm ? 'Cancel' : 'New Alarm Rule'}
                </button>
              </div>

              {/* Inline Add Rule Form */}
              {showAddForm && (
                <form className="alarm-form-card" onSubmit={handleSaveRule}>
                  <h4 className="alarm-form-title">Configure New Alarm Rule</h4>

                  <div className="alarm-form-grid">
                    <div className="alarm-form-group full-width">
                      <label>Alarm Name</label>
                      <input
                        type="text"
                        className="alarm-form-input"
                        placeholder="e.g. Critical BCI Spike Above 3000"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="alarm-form-group">
                      <label>Market Metric</label>
                      <select
                        className="alarm-form-select"
                        value={formData.metric}
                        onChange={handleMetricChange}
                      >
                        {ALARM_METRICS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="alarm-form-group">
                      <label>Trigger Condition</label>
                      <select
                        className="alarm-form-select"
                        value={formData.condition}
                        onChange={(e) =>
                          setFormData({ ...formData, condition: e.target.value })
                        }
                      >
                        {isSignalType ? (
                          <option value="signal_equals">Signal Equals</option>
                        ) : (
                          ALARM_CONDITIONS.filter((c) => c.value !== 'signal_equals').map(
                            (c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            )
                          )
                        )}
                      </select>
                    </div>

                    {isSignalType ? (
                      <div className="alarm-form-group">
                        <label>Target Charter Recommendation</label>
                        <select
                          className="alarm-form-select"
                          value={formData.signal_value}
                          onChange={(e) =>
                            setFormData({ ...formData, signal_value: e.target.value })
                          }
                        >
                          <option value="CHARTER_NOW">CHARTER_NOW (Surge Warning)</option>
                          <option value="WAIT">WAIT (Market Softening)</option>
                          <option value="HOLD_NEUTRAL">HOLD_NEUTRAL</option>
                        </select>
                      </div>
                    ) : (
                      <div className="alarm-form-group">
                        <label>
                          Threshold Value ({currentMetricConfig.unit})
                        </label>
                        <input
                          type="number"
                          step="any"
                          className="alarm-form-input"
                          value={formData.threshold}
                          onChange={(e) =>
                            setFormData({ ...formData, threshold: e.target.value })
                          }
                          required
                        />
                      </div>
                    )}

                    <div className="alarm-form-group">
                      <label>Notification Email (Optional)</label>
                      <input
                        type="email"
                        className="alarm-form-input"
                        placeholder="officer@steel.gov.in"
                        value={formData.notify_email}
                        onChange={(e) =>
                          setFormData({ ...formData, notify_email: e.target.value })
                        }
                      />
                    </div>

                    <div className="alarm-form-group full-width">
                      <label className="alarm-form-checkbox-row">
                        <input
                          type="checkbox"
                          checked={formData.notify_push}
                          onChange={(e) =>
                            setFormData({ ...formData, notify_push: e.target.checked })
                          }
                        />
                        Send browser push alert when condition is met
                      </label>
                    </div>
                  </div>

                  <div className="alarm-form-actions">
                    <button
                      type="button"
                      className="alarm-btn-sm"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="alarm-btn-primary">
                      Save & Activate Rule
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Rules List */}
              <div className="alarm-rules-list">
                {alarms.map((r) => {
                  const metricObj = ALARM_METRICS.find((m) => m.value === r.metric)
                  const condObj = ALARM_CONDITIONS.find((c) => c.value === r.condition)

                  return (
                    <div
                      key={r.id}
                      className={`alarm-rule-item ${r.enabled ? '' : 'disabled'}`}
                    >
                      <div className="alarm-rule-info">
                        <div className="alarm-rule-name-row">
                          <span className="alarm-rule-name">{r.name}</span>
                          {!r.enabled && (
                            <span className="alarm-rule-tag">Inactive</span>
                          )}
                        </div>
                        <div className="alarm-rule-details">
                          <span>
                            {metricObj?.label || r.metric} •{' '}
                            {r.metric === 'charter_signal'
                              ? `Signal = ${r.signal_value}`
                              : `${condObj?.label || r.condition} ${r.threshold} ${metricObj?.unit || ''}`}
                          </span>
                          {(r.notify_email || r.email) && (
                            <span
                              className="alarm-rule-tag"
                              title={`Email to: ${r.notify_email || r.email}`}
                            >
                              ✉️ {r.notify_email || r.email}
                            </span>
                          )}
                          {r.notify_push && (
                            <span className="alarm-rule-tag" title="Browser push enabled">
                              🔔 Push
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="alarm-rule-actions">
                        <label
                          className="alarm-switch"
                          title={r.enabled ? 'Click to disable' : 'Click to enable'}
                        >
                          <input
                            type="checkbox"
                            checked={r.enabled}
                            onChange={() => toggleAlarm(r.id)}
                          />
                          <span className="alarm-slider" />
                        </label>
                        <button
                          className="alarm-delete-btn"
                          onClick={() => deleteAlarm(r.id)}
                          title="Delete rule"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="alarm-modal-footer">
          <div className="alarm-status-pill">
            <span className="alarm-status-dot active" />
            <span>
              Background Engine: Polling every 60s
              {lastEvaluated ? ` • Last check: ${lastEvaluated}` : ''}
            </span>
          </div>

          {!permissionGranted && (
            <button
              className="alarm-btn-sm"
              onClick={requestNotificationPermission}
              title="Request browser notification permission"
            >
              Enable Browser Push
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
