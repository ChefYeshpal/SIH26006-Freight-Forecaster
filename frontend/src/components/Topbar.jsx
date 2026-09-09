import { useState, useRef, useEffect } from 'react'
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  ShipIcon,
} from './Icons'
import { NOTIFICATIONS, DEFAULT_USER_PROFILE, NAV_ITEMS } from '../constants'

export default function Topbar({ currentPage, onToggleSidebar, onLogout, onNavigate }) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const user = JSON.parse(
    localStorage.getItem('ff_user') || JSON.stringify(DEFAULT_USER_PROFILE)
  )

  const unreadCount = notifications.filter((n) => !n.read).length
  const currentLabel = NAV_ITEMS.find((n) => n.id === currentPage)?.label || 'Dashboard'

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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
        <div className={`topbar-search ${searchFocused ? 'focused' : ''}`}>
          <SearchIcon size={16} />
          <input
            type="text"
            placeholder="Search routes, ports, commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="topbar-search-kbd">⌘K</kbd>
        </div>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
          >
            <BellIcon size={19} />
            {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="topbar-dropdown topbar-notif-dropdown">
              <div className="topbar-dropdown-header">
                <span>Notifications</span>
                <button className="topbar-dropdown-action" onClick={markAllRead}>
                  Mark all read
                </button>
              </div>
              <div className="topbar-dropdown-list">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`topbar-notif-item ${n.read ? '' : 'unread'}`}
                  >
                    <div className={`topbar-notif-dot ${n.type}`} />
                    <div className="topbar-notif-content">
                      <span className="topbar-notif-title">{n.title}</span>
                      <span className="topbar-notif-msg">{n.message}</span>
                      <span className="topbar-notif-time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
