import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import TeamView from './pages/TeamView'
import Leaderboard from './pages/Leaderboard'
import Info from './pages/Info'
import SetupNeeded from './pages/SetupNeeded'
import { isFirebaseConfigured } from './firebase'
import { MyTeamProvider } from './context/MyTeamContext'
import './App.css'

function App() {
  if (!isFirebaseConfigured) {
    return (
      <HashRouter>
        <Header />
        <SetupNeeded />
      </HashRouter>
    )
  }

  return (
    <HashRouter>
      <MyTeamProvider>
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teams" element={<Home browse />} />
            <Route path="/team/:teamId" element={<TeamView />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/info" element={<Info />} />
          </Routes>
        </div>
        <BottomNav />
      </MyTeamProvider>
    </HashRouter>
  )
}

export default App
