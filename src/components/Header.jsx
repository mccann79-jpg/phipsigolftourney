import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <NavLink to="/" className="app-title">
          <strong>KAK Invitational</strong>
          <span>Live Scoring</span>
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/" end>
            Teams
          </NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/course">Course</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </div>
    </header>
  )
}
