import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { demos } from '../data/demos.js'

export default function DemoPage() {
  const { name } = useParams()
  const demo = demos[name]

  useEffect(() => {
    if (!demo) return
    document.title = `${demo.title} 데모 - 궁금하면500원`
  }, [demo])

  if (!demo) return <Navigate to="/" replace />

  return (
    <div className="demo-page">
      <iframe
        className="demo-frame"
        title={`${demo.title} 데모`}
        src={demo.src}
        style={{ top: 0, '--demo-top': '0px' }}
      />
    </div>
  )
}
