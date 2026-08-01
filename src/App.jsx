import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import TeamView from './pages/TeamView'
import Leaderboard from './pages/Leaderboard'
import CourseInfo from './pages/CourseInfo'
import Admin from './pages/Admin'
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team/:teamId" element={<TeamView />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/course" element={<CourseInfo />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </MyTeamProvider>
    </HashRouter>
  )
}

export default App
