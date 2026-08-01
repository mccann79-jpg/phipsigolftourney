import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Scorecard', icon: '⛳', match: (path) => path === '/' || path.startsWith('/team') },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆', match: (path) => path.startsWith('/leaderboard') },
  { to: '/info', label: 'Info', icon: 'ℹ️', match: (path) => path.startsWith('/info') },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <Link key={tab.to} to={tab.to} className={`bottom-nav-tab ${tab.match(pathname) ? 'active' : ''}`}>
          <span className="bottom-nav-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="bottom-nav-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
