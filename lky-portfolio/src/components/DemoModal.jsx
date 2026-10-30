import { useEffect } from 'react'

export default function DemoModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="demo-modal open" onClick={onClose} role="presentation">
      <div
        className="demo-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="demo-modal-header">
          <h3 id="demo-modal-title">서비스중</h3>
          <button type="button" className="demo-close" onClick={onClose} aria-label="닫기">
            &times;
          </button>
        </div>
        <div className="demo-modal-body">
          <div className="demo-icon">
            <i className="fas fa-check-circle" />
          </div>
          <p>서비스중입니다</p>
        </div>
        <div className="demo-modal-footer">
          <button type="button" className="demo-btn" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
