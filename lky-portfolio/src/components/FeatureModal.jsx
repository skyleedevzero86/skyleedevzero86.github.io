import { useEffect } from 'react'

export default function FeatureModal({ project, mode, onClose }) {
  const open = Boolean(project)

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

  if (!project) return null

  const title =
    mode === 'features' ? `${project.modalTitle} - 주요 기능` : project.modalTitle

  return (
    <div className="modal open" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title" id="feature-modal-title">
            {title}
          </h2>
          <button type="button" className="close" onClick={onClose} aria-label="닫기">
            &times;
          </button>
        </div>
        <div className="modal-description">{project.description}</div>
        <div className="modal-features">
          <h4>주요 기능</h4>
          <ul className="modal-feature-list">
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="modal-tech">
          <h4>사용 기술</h4>
          <div>
            {project.tech.map((item) => (
              <span className="modal-tech-tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
