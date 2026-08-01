import { NavLink } from 'react-router-dom'
import logo from '../assets/kak-logo-96.png'

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <NavLink to="/" className="app-title">
          <img src={logo} alt="" className="app-logo" width="36" height="36" />
          <span className="app-title-text">
            <strong>KAK Invitational</strong>
            <span>Live Scoring</span>
          </span>
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
