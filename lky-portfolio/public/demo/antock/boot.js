window.__antockFuzzyRows = function(rows, term, textOf) { var k = String(term || '').toLowerCase().replace(/\s+/g, ''); if (!k) return 0; var grams = []; for (var i = 0; i < k.length - 1; i++) grams.push(k.slice(i, i + 2)); var chars = k.split(''); var best = []; Array.prototype.forEach.call(rows, function (row) { var t = String(textOf(row) || '').toLowerCase().replace(/\s+/g, ''); var sc = 0; grams.forEach(function (g) { if (t.indexOf(g) >= 0) sc += 3; }); chars.forEach(function (ch) { if (t.indexOf(ch) >= 0) sc += 1; }); best.push([row, sc]); }); var any = best.some(function (b) { return b[1] > 0; }); best.forEach(function (b) { b[0].style.display = (!any || b[1] > 0) ? '' : 'none'; }); return best.filter(function (b) { return b[0].style.display === ''; }).length; };
(function () {
  const RT = window.AntockRuntime
  const SV = window.AntockServer
  const VIEWS = window.ANTOCK_VIEWS
  const { R, routeUrl, parseRoute, isAppPath, appPathFromUrl, ENTRY } = RT
  const FLASH = 'antock-flash'
  const PENDING = 'antock-pending'
  const DOWNLOAD_RE = /^\/(web\/files\/download\/|api\/v1\/files\/template|corp\/export)/
  const EXTRA_SCRIPTS = { 'main/index': ['main-collect.js'], 'member/profile': ['member-page.js'], 'member/password-change': ['member-page.js'] }
  const nativeFetch = window.fetch.bind(window)
  const nativeSubmit = HTMLFormElement.prototype.submit

  const route = parseRoute(location.href)
  const currentPath = route.path
  const currentQuery = route.params.toString()
  const keyOf = (path, q) => path + (q ? '?' + q : '')

  function ssGet(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null') } catch (e) { return null } }
  function ssSet(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)) } catch (e) { } }

  function resolveApp(raw) {
    if (raw === null || raw === undefined) return null
    raw = String(raw).trim()
    if (raw === '') return currentPath
    if (raw.startsWith('#') || raw.startsWith('javascript:') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('blob:') || raw.startsWith('data:')) return null
    if (raw.startsWith('?')) return currentPath + raw
    if (isAppPath(raw)) return raw
    if (/^[a-z]+:/i.test(raw) || raw.startsWith('//')) {
      const u = new URL(raw, location.href)
      const ap = appPathFromUrl(u)
      if (ap) return ap
      if (u.origin === location.origin && u.pathname === ENTRY) { const r = parseRoute(u.href); return keyOf(r.path, r.params.toString()) }
      return null
    }
    if (raw.startsWith('./') || raw.startsWith('static/') || /\.(css|js|png|jpg|svg|ico)(\?|$)/.test(raw)) return null
    const base = currentPath.replace(/[^/]*$/, '')
    return new URL(raw, 'http://x' + base).pathname + new URL(raw, 'http://x' + base).search
  }
  window.__antockUrl = function (u) {
    if (typeof u !== 'string') u = String(u)
    const ap = resolveApp(u)
    return ap ? routeUrl(ap) : u
  }

  function whitelabel(status, error, path) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Error</title></head><body><h1>Whitelabel Error Page</h1><p>This application has no explicit mapping for /error, so you are seeing this as a fallback.</p><div id="created">${new Date().toString()}</div><div>There was an unexpected error (type=${error}, status=${status}).</div><div>${path ? R.esc(path) : ''}</div></body></html>`
  }
  function render(viewName, model, flash) {
    const fn = VIEWS[viewName]
    if (!fn) return whitelabel(500, 'Internal Server Error', 'View not found: ' + viewName)
    const S = Object.assign({}, SV.globals(keyOf(currentPath, currentQuery), route.params), flash || {}, model || {})
    let html
    try { html = fn(S, R) } catch (e) {
      console.error(e)
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>HTTP Status 500 – Internal Server Error</title><style>body{font-family:Tahoma,Arial,sans-serif}h1{background:#525D76;color:#fff;padding:6px 10px;font-size:22px}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><p><b>Type</b> Exception Report</p><p><b>Message</b> An exception occurred processing [/WEB-INF/views/${R.esc(viewName)}.jsp]</p><p><b>Description</b> ${R.esc(e.message)}</p></body></html>`
    }
    html = html.replace(/(["'(=])\/static\//g, '$1./static/')
    if (viewName === 'member/login') {
      html = html.replace(/(<input[^>]*id="username"[^>]*value=")(")/, '$1admin$2').replace(/(<input[^>]*type="password"[^>]*id="password")/, '$1 value="admin1234"')
    }
    if (viewName === 'main/index') html = addNotice(html)
    const extra = EXTRA_SCRIPTS[viewName]
    if (extra) {
      const tags = extra.map((s) => `<script src="./static/js/${s}"></script>`).join('')
      const i = html.lastIndexOf('</body>')
      html = i >= 0 ? html.slice(0, i) + tags + html.slice(i) : html + tags
    }
    const fmt = '<script src="./demo-format.js"></script><script src="./demo-mobile.js"></script>'
    const j = html.lastIndexOf('</body>')
    html = j >= 0 ? html.slice(0, j) + fmt + html.slice(j) : html + fmt
    return html
  }

  function triggerDownload(d) {
    let blob
    if (d.encoding === 'base64') {
      const bin = atob(d.data)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      blob = new Blob([bytes], { type: d.type || 'application/octet-stream' })
    } else blob = new Blob([d.data], { type: d.type || 'application/octet-stream' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = d.name
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1500)
  }

  function go(appPath, replace) {
    const u = routeUrl(appPath)
    if (replace) location.replace(u); else location.assign(u)
  }

  async function runDownload(appPath) {
    const r = parseRoute(routeUrl(appPath))
    const res = await SV.handle('GET', r.path, r.params, null)
    if (res && res.download) triggerDownload(res.download)
    else if (res && res.redirect) { ssSet(FLASH, res.flash); go(res.redirect) }
  }

  async function submitApp(method, appPath, body) {
    const r = parseRoute(routeUrl(appPath))
    let res
    try { res = await SV.handle(method, r.path, r.params, body) } catch (e) { console.error(e); res = { status: 500, error: 'Internal Server Error' } }
    const back = keyOf(r.path, r.params.toString())
    if (res && res.redirect) { ssSet(FLASH, res.flash); go(res.redirect); return }
    if (res && res.download) { triggerDownload(res.download); return }
    ssSet(PENDING, { key: back, res, ts: Date.now() })
    go(back)
  }

  function submitForm(form, submitter) {
    const method = ((submitter && submitter.getAttribute('formmethod')) || form.getAttribute('method') || 'get').toUpperCase()
    const rawAction = (submitter && submitter.getAttribute('formaction')) || form.getAttribute('action')
    const appPath = resolveApp(rawAction === null ? '' : rawAction)
    if (!appPath) { nativeSubmit.call(form); return }
    let fd
    try { fd = submitter ? new FormData(form, submitter) : new FormData(form) } catch (e) { fd = new FormData(form); if (submitter && submitter.name) fd.append(submitter.name, submitter.value) }
    if (method === 'GET') {
      const q = new URLSearchParams()
      fd.forEach((v, k) => { if (typeof v === 'string') q.append(k, v) })
      const path = appPath.split('?')[0]
      const qs = q.toString()
      go(path + (qs ? '?' + qs : ''))
      return
    }
    submitApp('POST', appPath, fd)
  }

  HTMLFormElement.prototype.submit = function () { submitForm(this, null) }

  window.addEventListener('submit', function (e) {
    if (e.defaultPrevented) return
    const form = e.target
    if (!(form instanceof HTMLFormElement)) return
    e.preventDefault()
    submitForm(form, e.submitter || null)
  })

  document.addEventListener('click', function (e) {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null
    if (!a) return
    const raw = a.getAttribute('href')
    const ap = resolveApp(raw)
    if (!ap) return
    if (DOWNLOAD_RE.test(ap)) { e.preventDefault(); runDownload(ap); return }
    a.setAttribute('href', routeUrl(ap))
  }, true)

  if (window.navigation && typeof window.navigation.addEventListener === 'function') {
    window.navigation.addEventListener('navigate', function (e) {
      if (e.navigationType === 'traverse' || e.navigationType === 'reload' || e.hashChange || e.downloadRequest) return
      let dest
      try { dest = new URL(e.destination.url) } catch (x) { return }
      if (dest.origin !== location.origin) return
      const ap = appPathFromUrl(dest)
      if (ap) {
        if (!e.cancelable) return
        e.preventDefault()
        if (e.formData) { submitApp('POST', ap, e.formData); return }
        if (DOWNLOAD_RE.test(ap)) { runDownload(ap); return }
        go(ap)
        return
      }
      if (dest.pathname === ENTRY && e.formData && e.cancelable) {
        e.preventDefault()
        const r = parseRoute(dest.href)
        submitApp('POST', keyOf(r.path, r.params.toString()), e.formData)
      }
    })
  }

  window.fetch = async function (input, init) {
    const raw = typeof input === 'string' ? input : (input && input.url) || String(input)
    const ap = resolveApp(raw)
    if (!ap || raw.startsWith('./') || raw.startsWith('blob:')) return nativeFetch(input, init)
    init = init || {}
    const method = (init.method || (input && input.method) || 'GET').toUpperCase()
    let body = init.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch (e) { const fd = new FormData(); new URLSearchParams(body).forEach((v, k) => fd.append(k, v)); body = fd } }
    else if (body instanceof URLSearchParams) { const fd = new FormData(); body.forEach((v, k) => fd.append(k, v)); body = fd }
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 220))
    const r = parseRoute(routeUrl(ap))
    let res
    try { res = await SV.handle(method, r.path, r.params, body || null) } catch (e) { console.error(e); res = { status: 500, json: { status: 500, error: 'Internal Server Error', message: e.message } } }
    if (!res) res = { status: 500, json: { status: 500, error: 'Internal Server Error' } }
    if (res.json !== undefined) return new Response(JSON.stringify(res.json), { status: res.status || 200, headers: { 'Content-Type': 'application/json' } })
    if (res.redirect) return new Response(JSON.stringify({ status: 401, error: 'Unauthorized', message: '인증이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    if (res.download) return new Response(res.download.encoding === 'base64' ? Uint8Array.from(atob(res.download.data), (c) => c.charCodeAt(0)) : res.download.data, { status: 200, headers: { 'Content-Type': res.download.type } })
    if (res.view) return new Response(render(res.view, res.model, null), { status: res.status || 200, headers: { 'Content-Type': 'text/html;charset=UTF-8' } })
    return new Response(JSON.stringify({ timestamp: new Date().toISOString(), status: res.status || 404, error: res.error || 'Not Found', path: r.path }), { status: res.status || 404, headers: { 'Content-Type': 'application/json' } })
  }

  function htmlFor(res) {
    if (res.view) return render(res.view, res.model, ssTake())
    if (res.json !== undefined) return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><pre style="word-wrap:break-word;white-space:pre-wrap">${R.esc(JSON.stringify(res.json))}</pre></body></html>`
    return whitelabel(res.status || 404, res.status === 403 ? 'Forbidden' : res.status === 405 ? 'Method Not Allowed' : res.status === 500 ? 'Internal Server Error' : 'Not Found', currentPath)
  }
  function ssTake() { const f = ssGet(FLASH); ssSet(FLASH, null); return f }

  function seedChart(config) {
    try {
      if (!config || config.type !== 'line' || !config.data) return
      const d = config.data
      if ((d.labels && d.labels.length) || !d.datasets || !d.datasets.length || d.datasets.some((x) => x.data && x.data.length)) return
      const ser = SV.recentSeries(12)
      d.labels = ser.map((x) => x.label)
      d.datasets.forEach((ds) => {
        const l = String(ds.label || '')
        ds.data = ser.map((x) => /CPU/i.test(l) ? x.cpu : /메모리|memory/i.test(l) ? x.mem : /성공|가용|%|률/.test(l) ? x.rate : x.rt)
      })
    } catch (e) { }
  }
  function wrapChart(C) {
    if (!C || C.__antockWrapped) return C
    const W = function (item, config) {
      let el = typeof item === 'string' ? document.getElementById(item) : item
      if (el && el.canvas) el = el.canvas
      try { if (el && C.getChart && C.getChart(el)) item = document.createElement('canvas') } catch (e) { }
      seedChart(config)
      return new C(item, config)
    }
    Object.setPrototypeOf(W, C)
    W.prototype = C.prototype
    W.__antockWrapped = true
    return W
  }
  let chartRef
  try { Object.defineProperty(window, 'Chart', { configurable: true, get() { return chartRef }, set(v) { chartRef = wrapChart(v) } }) } catch (e) { }

  const NOTICE_KEY = 'antock-demo-notice'
  const NOTICE_HTML = `<div id="demoNoticeBackdrop" style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:20000;display:flex;align-items:center;justify-content:center;padding:16px;overscroll-behavior:contain;touch-action:none"><div style="position:relative;background:#fff;border-radius:12px;max-width:min(380px,calc(100vw - 32px));width:100%;max-height:calc(100dvh - 32px);overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.25);padding:22px 22px 18px;font-family:inherit;touch-action:auto"><button type="button" id="demoNoticeX" aria-label="닫기" style="position:absolute;top:8px;right:8px;width:36px;height:36px;border:0;border-radius:50%;background:#f1f3f5;color:#333;font-size:20px;line-height:36px;cursor:pointer">&times;</button><div style="font-weight:700;font-size:17px;margin-bottom:10px;color:#0d6efd">데모 안내</div><div style="font-size:14px;line-height:1.6;color:#333">이 화면은 실제 서버(Spring) 없이 <b>더미 데이터</b>로만 동작하는 데모입니다.<br>로그인·등록·수정·삭제 등은 화면에서만 동작하며 실제 시스템에는 반영되지 않습니다.<br><span style="color:#888;font-size:12px">입력한 내용은 이 브라우저에만 임시 저장됩니다.</span></div><div style="text-align:right;margin-top:16px"><button type="button" id="demoNoticeOk" style="background:#0d6efd;color:#fff;border:0;border-radius:6px;padding:7px 18px;font-size:14px;cursor:pointer">확인</button></div></div></div><script>(function(){var b=document.getElementById('demoNoticeBackdrop');var H=document.documentElement,B=document.body,ph=H.style.overflow,pb=B.style.overflow;H.style.overflow='hidden';B.style.overflow='hidden';function c(){try{sessionStorage.setItem('${NOTICE_KEY}','1')}catch(e){}H.style.overflow=ph;B.style.overflow=pb;b&&b.remove()}document.getElementById('demoNoticeOk').addEventListener('click',c);document.getElementById('demoNoticeX').addEventListener('click',c);b.addEventListener('click',function(e){if(e.target===b)c()})})()</script>`
  function addNotice(html) {
    try { if (sessionStorage.getItem(NOTICE_KEY)) return html } catch (e) { }
    const i = html.lastIndexOf('</body>')
    return i >= 0 ? html.slice(0, i) + NOTICE_HTML + html.slice(i) : html + NOTICE_HTML
  }

  function boot() {
    if (route.params.get('_reset') === '1') { SV.reset(); ssSet(FLASH, null); ssSet(PENDING, null); go('/', true); return }
    const canonical = routeUrl(keyOf(currentPath, currentQuery))
    if (location.pathname + location.search !== canonical.split('#')[0] && history.replaceState) {
      try { history.replaceState(history.state, '', canonical + location.hash) } catch (e) { }
    }
    const pending = ssGet(PENDING)
    let res
    if (pending && pending.key === keyOf(currentPath, currentQuery) && Date.now() - pending.ts < 15000) {
      ssSet(PENDING, null)
      res = pending.res
    } else {
      res = SV.handle('GET', currentPath, route.params, null)
    }
    if (res && typeof res.then === 'function') {
      res.then((r) => { document.open(); document.write(htmlFor(r)); document.close() })
      return
    }
    if (res && res.redirect) { ssSet(FLASH, res.flash); go(res.redirect, true); return }
    if (res && res.download) {
      document.write(whitelabel(200, 'OK', ''))
      setTimeout(() => triggerDownload(res.download), 50)
      return
    }
    document.write(htmlFor(res || { status: 404 }))
  }
  boot()
})()
