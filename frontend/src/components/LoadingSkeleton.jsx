import React from 'react'

/**
 * LoadingSkeleton — animated shimmer placeholder.
 * Variants: 'text', 'card', 'stat', 'chart', 'circle', 'inline'
 */
export default function LoadingSkeleton({ variant = 'text', count = 1, className = '' }) {
  const items = Array.from({ length: count })

  if (variant === 'card') {
    return (
      <div className={`skeleton-grid ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-shimmer skeleton-card-header" />
            <div className="skeleton-shimmer skeleton-card-body" />
            <div className="skeleton-shimmer skeleton-card-line" />
            <div className="skeleton-shimmer skeleton-card-line short" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'stat') {
    return (
      <div className={`skeleton-stats-row ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="skeleton-stat">
            <div className="skeleton-shimmer skeleton-stat-badge" />
            <div className="skeleton-shimmer skeleton-stat-number" />
            <div className="skeleton-shimmer skeleton-stat-label" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={`skeleton-chart ${className}`}>
        <div className="skeleton-shimmer skeleton-chart-area" />
      </div>
    )
  }

  if (variant === 'circle') {
    return (
      <div className={`skeleton-circle-wrap ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="skeleton-shimmer skeleton-circle" />
        ))}
      </div>
    )
  }

  // Default: text lines
  return (
    <div className={`skeleton-text-block ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer skeleton-text-line"
          style={{ width: `${90 - i * 12}%` }}
        />
      ))}
    </div>
  )
}
