import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { demos } from '../data/demos.js'

export default function DemoPage() {
  const { name } = useParams()
  const demo = demos[name]

  useEffect(() => {
    if (!demo) return
    document.title = `${demo.title} - 궁금하면500원`
  }, [demo])

  if (!demo) return <Navigate to="/" replace />

  return (
    <div className="demo-page">
      <iframe
        className="demo-frame"
        title={demo.title}
        src={demo.src}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write; web-share"
        allowFullScreen
        style={{ top: 0, '--demo-top': '0px' }}
      />
    </div>
  )
}
