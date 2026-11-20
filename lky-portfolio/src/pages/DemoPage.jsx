import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { demos } from '../data/demos.js'

export default function DemoPage() {
  const { name } = useParams()
  const demo = demos[name]
  const frameRef = useRef(null)
  const barRef = useRef(null)
  const [frameKey, setFrameKey] = useState(0)
  const [offset, setOffset] = useState(130)
  const [headerH, setHeaderH] = useState(70)

  useEffect(() => {
    if (!demo) return undefined
    document.title = `${demo.title} 데모 - 궁금하면500원`
    const measure = () => {
      const header = document.querySelector('.header')
      const bar = barRef.current
      const h = header ? header.offsetHeight : 70
      setHeaderH(h)
      setOffset(h + (bar ? bar.offsetHeight : 56))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [demo])

  if (!demo) return <Navigate to="/" replace />

  const reload = () => setFrameKey((k) => k + 1)
  const reset = () => {
    if (!window.confirm('데모 데이터를 처음 상태로 되돌릴까요?')) return
    try {
      demo.storageKeys.forEach((k) => window.localStorage.removeItem(k))
      window.sessionStorage.clear()
    } catch (e) {
      void e
    }
    reload()
  }

  return (
    <div className="demo-page">
      <Header page="projects" />
      <div className="demo-toolbar" ref={barRef} style={{ top: headerH }}>
        <div className="demo-toolbar-inner">
          <Link to="/#projects" className="demo-back">
            <i className="fas fa-arrow-left" /> 프로젝트로
          </Link>
          <div className="demo-title">
            <strong>{demo.title}</strong>
            <span>{demo.subtitle}</span>
          </div>
          <div className="demo-actions">
            <span className="demo-badge">더미 데이터 데모</span>
            <button type="button" onClick={reload}>
              <i className="fas fa-redo" /> 새로고침
            </button>
            <button type="button" onClick={reset}>
              <i className="fas fa-undo" /> 데이터 초기화
            </button>
            <a href={demo.src} target="_blank" rel="noreferrer">
              <i className="fas fa-external-link-alt" /> 새 탭
            </a>
            <a href={demo.code} target="_blank" rel="noreferrer">
              <i className="fab fa-github" /> 코드
            </a>
          </div>
        </div>
      </div>
      <iframe
        key={frameKey}
        ref={frameRef}
        className="demo-frame"
        title={`${demo.title} 데모`}
        src={demo.src}
        style={{ top: offset, height: `calc(100vh - ${offset}px)` }}
      />
    </div>
  )
}
