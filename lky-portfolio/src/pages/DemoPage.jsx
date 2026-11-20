import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { demos } from '../data/demos.js'

export default function DemoPage() {
  const { name } = useParams()
  const demo = demos[name]
  const [offset, setOffset] = useState(70)

  useEffect(() => {
    if (!demo) return undefined
    document.title = `${demo.title} 데모 - 궁금하면500원`
    const measure = () => {
      const header = document.querySelector('.header')
      setOffset(header ? header.offsetHeight : 70)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [demo])

  if (!demo) return <Navigate to="/" replace />

  return (
    <div className="demo-page">
      <Header page="projects" />
      <iframe
        className="demo-frame"
        title={`${demo.title} 데모`}
        src={demo.src}
        style={{ top: offset, height: `calc(100vh - ${offset}px)` }}
      />
    </div>
  )
}
