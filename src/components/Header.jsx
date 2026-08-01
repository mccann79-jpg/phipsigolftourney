import { Link } from 'react-router-dom'
import logo from '../assets/kak-logo-96.png'

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-title">
          <img src={logo} alt="" className="app-logo" width="32" height="32" />
          <span className="app-title-text">
            <strong>KAK Invitational</strong>
          </span>
        </Link>
      </div>
    </header>
  )
}
