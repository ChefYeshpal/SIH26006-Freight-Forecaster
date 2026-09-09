import { useState } from 'react'
import {
  CompassIcon,
  ShipIcon,
  CpuIcon,
  BarChart3Icon,
  SettingsIcon,
  LogoutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ActivityIcon,
} from './Icons'
import { NAV_ITEMS, DEFAULT_USER_PROFILE } from '../constants'

const ICON_MAP = {
  compass: CompassIcon,
  ship: ShipIcon,
  cpu: CpuIcon,
  barchart: BarChart3Icon,
  settings: SettingsIcon,
}

export default function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggle,
  onLogout,
  backendStatus,
}) {
  const user = JSON.parse(
    localStorage.getItem('ff_user') || JSON.stringify(DEFAULT_USER_PROFILE)
  )
  const isHealthy = backendStatus && backendStatus.includes('Online')

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Profile Section */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <span className="sidebar-avatar-text">{user.avatarInitials}</span>
          <span className="sidebar-online-dot" />
        </div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">
          {!collapsed && <span>NAVIGATION</span>}
        </div>
        {NAV_ITEMS.map((item) => {
          const IconComp = ICON_MAP[item.icon] || CompassIcon
          return (
            <button
              key={item.id}
              className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <div className="sidebar-link-icon">
                <IconComp size={20} />
              </div>
              {!collapsed && <span className="sidebar-link-text">{item.label}</span>}
              {currentPage === item.id && <div className="sidebar-active-bar" />}
            </button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {/* API Status */}
        <div className="sidebar-status" title={backendStatus}>
          <div className={`sidebar-status-dot ${isHealthy ? 'healthy' : 'offline'}`} />
          {!collapsed && (
            <span className="sidebar-status-text">
              {isHealthy ? 'API Online' : 'API Offline'}
            </span>
          )}
        </div>

        {/* Collapse Toggle */}
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
        </button>

        {/* Logout */}
        <button className="sidebar-logout" onClick={onLogout} title="Sign out">
          <LogoutIcon size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
