import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const menus = {
  home: [
    {
      label: '기술블로그',
      href: 'https://velog.io/@sleekydevzero86/posts',
      external: true,
    },
    { label: '소개', href: '#about', section: 'about' },
    { label: '프로젝트', href: '#projects', section: 'projects' },
    { label: '기술스택', href: '#skills', section: 'skills' },
    { label: '경력', href: '#experience', section: 'experience' },
    { label: '연락처', href: '#contact', section: 'contact' },
  ],
  skills: [
    {
      label: '기술블로그',
      href: 'https://velog.io/@sleekydevzero86/posts',
      external: true,
    },
    { label: '소개', to: '/#about' },
    { label: '프로젝트', to: '/projects' },
    { label: '기술스택', to: '/skills', route: 'skills' },
    { label: '경력', to: '/skills#experience-timeline', section: 'experience-timeline' },
    { label: '연락처', to: '/#contact' },
  ],
  projects: [
    {
      label: '기술블로그',
      href: 'https://velog.io/@sleekydevzero86/posts',
      external: true,
    },
    { label: '소개', to: '/#about' },
    { label: '프로젝트', to: '/projects', route: 'projects' },
    { label: '기술스택', to: '/#skills' },
    { label: '경력', to: '/#experience' },
    { label: '연락처', to: '/#contact' },
  ],
}

export default function Header({ page }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [current, setCurrent] = useState('')
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100)
      const ids =
        page === 'home'
          ? ['home', 'about', 'projects', 'skills', 'experience', 'contact']
          : page === 'skills'
            ? ['experience-timeline']
            : []
      let next = ''
      ids.forEach((id) => {
        const element = document.getElementById(id)
        if (element && window.scrollY >= element.offsetTop - 200) next = id
      })
      setCurrent(next)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [page, location.pathname])

  const close = () => setOpen(false)

  const goHome = (event) => {
    close()
    const onHome = location.pathname === '/' || location.pathname === '/index.html'
    if (onHome && !location.hash) {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isActive = (item) => {
    if (item.section === 'experience-timeline') return current === 'experience-timeline'
    if (item.section) return current === item.section
    if (item.route === 'skills') return page === 'skills' && current !== 'experience-timeline'
    if (item.route) return page === item.route
    return false
  }

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <a href="/" className="nav-home" onClick={goHome}>
              <h2>궁금하면500원</h2>
            </a>
          </div>
          <ul className={`nav-menu${open ? ' active' : ''}`}>
            {menus[page].map((item) => {
              const className = `nav-link${isActive(item) ? ' active' : ''}`
              return (
                <li className="nav-item" key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      className={className}
                      target="_blank"
                      rel="noreferrer"
                      onClick={close}
                    >
                      {item.label}
                    </a>
                  ) : item.href ? (
                    <a href={item.href} className={className} onClick={close}>
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.to} className={className} onClick={close}>
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            className={`hamburger${open ? ' active' : ''}`}
            aria-label="메뉴"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>
      </nav>
    </header>
  )
}
