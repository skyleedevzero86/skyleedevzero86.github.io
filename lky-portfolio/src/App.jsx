import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ScrollManager from './components/ScrollManager.jsx'
import HomePage from './pages/HomePage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import SkillsPage from './pages/SkillsPage.jsx'

export default function App() {
  useEffect(() => {
    const touch = 'ontouchstart' in window
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
    if (touch) document.body.classList.add('touch-device')
    if (mobile) document.body.classList.add('mobile-device')

    const onResize = () => {
      document.body.classList.toggle('mobile-view', window.innerWidth <= 768)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects.html" element={<Navigate to="/projects" replace />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills.html" element={<Navigate to="/skills" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
