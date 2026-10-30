import { useEffect } from 'react'

const EMPTY_NOTICES = [{ id: 'service', label: '서비스 중' }]

export default function DemoModal({ open, onClose, title = '프로젝트', notices = EMPTY_NOTICES, slides = [] }) {
  const showControls = slides.length >= 2

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
        className="notice-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="notice-popup-sidebar">
          <div className="notice-popup-sidebar-header">
            <h3 id="demo-modal-title">{title}</h3>
          </div>
          <ul className="notice-popup-items">
            {notices.map((item, index) => (
              <li key={item.id} className={index === 0 ? 'is-active' : undefined}>
                {item.label}
              </li>
            ))}
          </ul>
          <div className="notice-popup-sidebar-footer">
            <button type="button" className="notice-popup-close" onClick={onClose}>
              닫기
            </button>
          </div>
        </aside>
        <div className="notice-popup-stage">
          <div className="notice-popup-placeholder">곧 서비스할예정입니다</div>
          <div className={`notice-popup-controls${showControls ? '' : ' is-hidden'}`} hidden={!showControls}>
            <button type="button" aria-label="이전">
              <i className="fas fa-chevron-left" />
            </button>
            <button type="button" aria-label="일시정지">
              <i className="fas fa-pause" />
            </button>
            <button type="button" aria-label="다음">
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
