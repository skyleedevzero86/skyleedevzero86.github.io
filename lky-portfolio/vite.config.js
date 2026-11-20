import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function demoStaticPages() {
  const rewrite = (root) => (req, res, next) => {
    const raw = req.url || ''
    if (!raw.startsWith('/demo/')) return next()
    const [pathname, query = ''] = raw.split('?')
    let rel
    try {
      rel = decodeURIComponent(pathname)
    } catch {
      return next()
    }
    const abs = path.join(root, rel)
    if (!abs.startsWith(root)) return next()
    const suffix = query ? `?${query}` : ''
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return next()
    if (fs.existsSync(path.join(abs, 'index.html'))) {
      if (!pathname.endsWith('/')) {
        res.statusCode = 308
        res.setHeader('Location', `${pathname}/${suffix}`)
        return res.end()
      }
      req.url = `${pathname}index.html${suffix}`
      return next()
    }
    if (fs.existsSync(`${abs.replace(/\/$/, '')}.html`)) {
      req.url = `${pathname.replace(/\/$/, '')}.html${suffix}`
      return next()
    }
    const app = rel.split('/')[2]
    const notFound = path.join(root, 'demo', app || '', '404.html')
    if (app && fs.existsSync(notFound)) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.end(fs.readFileSync(notFound))
    }
    return next()
  }
  return {
    name: 'demo-static-pages',
    configureServer(server) {
      server.middlewares.use(rewrite(path.resolve(server.config.root, server.config.publicDir || 'public')))
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite(path.resolve(server.config.root, server.config.build.outDir || 'dist')))
    },
  }
}

export default defineConfig({
  plugins: [demoStaticPages(), react()],
})
