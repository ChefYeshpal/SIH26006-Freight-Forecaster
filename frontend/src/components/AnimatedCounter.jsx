import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * AnimatedCounter — counts from 0 to `end` with easing when scrolled into view.
 *
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms (default 2000)
 * @param {string} prefix - Text before the number (e.g. "$")
 * @param {string} suffix - Text after the number (e.g. "%", "M+")
 * @param {number} decimals - Decimal places (default 0)
 * @param {string} className - CSS class for the number element
 */
export default function AnimatedCounter({
  end = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)
  const frameRef = useRef(null)

  // Easing function: easeOutExpo
  const easeOutExpo = useCallback((t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const startTime = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      const currentValue = easedProgress * end

      setCount(currentValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [hasStarted, end, duration, easeOutExpo])

  const formattedCount = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString()

  return (
    <span ref={ref} className={`animated-counter ${className}`}>
      {prefix}{formattedCount}{suffix}
    </span>
  )
}
