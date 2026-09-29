import { useState, useRef, useEffect } from 'react'
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  ShipIcon,
  MoonIcon,
  SunIcon,
} from './Icons'
import { DEFAULT_USER_PROFILE, NAV_ITEMS } from '../constants'

export default function Topbar({
  currentPage,
  onToggleSidebar,
  onLogout,
  onNavigate,
  onOpenCommandPalette,
  alarmCount = 0,
  onOpenAlarms,
}) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ff_theme') !== 'light')

  const profileRef = useRef(null)

  const user = JSON.parse(
    localStorage.getItem('ff_user') || JSON.stringify(DEFAULT_USER_PROFILE)
  )

  const currentLabel = NAV_ITEMS.find((n) => n.id === currentPage)?.label || 'Dashboard'

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    localStorage.setItem('ff_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchKeyDown(e) {
    if (e.key !== 'Enter') return
    const query = searchQuery.trim().toLowerCase()
    if (!query) return

    const match = NAV_ITEMS.find((item) =>
      `${item.label} ${item.id}`.toLowerCase().includes(query)
    )
    if (match) {
      onNavigate(match.id)
      setSearchQuery('')
      e.currentTarget.blur()
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          <MenuIcon size={20} />
        </button>

        <div className="topbar-breadcrumb">
          <ShipIcon size={16} />
          <span className="topbar-breadcrumb-sep">/</span>
          <span className="topbar-breadcrumb-page">{currentLabel}</span>
        </div>
      </div>

      <div className="topbar-center">
        <div
          className={`topbar-search ${searchFocused ? 'focused' : ''}`}
          onClick={onOpenCommandPalette}
        >
          <SearchIcon size={16} />
          <input
            type="text"
            placeholder="Jump to workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Jump to workspace"
          />
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="topbar-icon-btn topbar-theme-btn"
          onClick={() => setDarkMode((current) => !current)}
          title={darkMode ? 'Use light theme' : 'Use dark theme'}
          aria-label={darkMode ? 'Use light theme' : 'Use dark theme'}
        >
          {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        {/* Alarm System Trigger */}
        <button
          className="topbar-icon-btn topbar-alarm-btn"
          onClick={onOpenAlarms}
          title={alarmCount > 0 ? `${alarmCount} Active Alarms Triggered` : 'Market Early Warning & Alarms'}
          aria-label="Open Alarms System"
        >
          <BellIcon size={19} />
          {alarmCount > 0 && <span className="topbar-badge topbar-badge-danger">{alarmCount}</span>}
        </button>

        {/* Profile */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            className="topbar-profile-btn"
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
          >
            <div className="topbar-avatar">
              <span>{user.avatarInitials}</span>
            </div>
            <ChevronDownIcon size={14} />
          </button>

          {showProfile && (
            <div className="topbar-dropdown topbar-profile-dropdown">
              <div className="topbar-profile-header">
                <div className="topbar-profile-avatar-lg">
                  <span>{user.avatarInitials}</span>
                </div>
                <div className="topbar-profile-info">
                  <span className="topbar-profile-name">{user.name}</span>
                  <span className="topbar-profile-email">{user.email}</span>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item" onClick={() => { onNavigate('settings'); setShowProfile(false) }}>
                <UserIcon size={16} /> My Profile
              </button>
              <a
                className="topbar-dropdown-item"
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
              >
                <ShipIcon size={16} /> API Documentation
              </a>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item danger" onClick={onLogout}>
                <LogoutIcon size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
