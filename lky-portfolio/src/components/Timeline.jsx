import { useEffect, useRef } from 'react'

export default function Timeline({ items, className, animate = false }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!animate || !ref.current) return undefined
    const nodes = ref.current.querySelectorAll('.timeline-item')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.style.opacity = '1'
          entry.target.style.transform = 'translateY(0)'
        })
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' },
    )

    nodes.forEach((node) => {
      node.style.opacity = '0'
      node.style.transform = 'translateY(30px)'
      node.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      observer.observe(node)
    })

    return () => observer.disconnect()
  }, [animate, items])

  return (
    <div className={className} ref={ref}>
      {items.map((item) => (
        <div className="timeline-item" key={`${item.date}-${item.title}`}>
          <div className="timeline-date">{item.date}</div>
          <div className="timeline-content">
            <h3>{item.title}</h3>
            <h4>{item.role}</h4>
            <p>
              {item.points.map((point, index) => (
                <span key={point}>
                  {index > 0 && <br />}
                  • {point}
                </span>
              ))}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
