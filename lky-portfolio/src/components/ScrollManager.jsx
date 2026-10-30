import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }

    const id = decodeURIComponent(hash.slice(1))
    const scroll = () => {
      const target = document.getElementById(id)
      if (!target) return false
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return true
    }

    if (scroll()) return undefined
    const timer = window.setTimeout(scroll, 50)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}
