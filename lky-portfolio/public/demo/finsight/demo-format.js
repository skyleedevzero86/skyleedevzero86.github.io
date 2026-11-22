(function () {
  if (window.__demoFormatInstalled) return
  window.__demoFormatInstalled = true
  var DEC = /(?<![\d.\w,])(\d{1,3}(?:,\d{3})+|\d+)\.(\d{2,})(?![\d.])/g
  var ISO = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?(?![\d:])/g
  var MS = /(\b\d{1,2}:\d{2}:\d{2})\.\d+/g
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 }
  function fixText(s) {
    if (!s || s.length > 20000) return s
    var out = s
    if (out.indexOf('T') >= 0) out = out.replace(ISO, function (m, d, h, mi, se) { return d + ' ' + h + ':' + mi + ':' + (se || '00') })
    if (out.indexOf(':') >= 0) out = out.replace(MS, '$1')
    if (out.indexOf('.') >= 0) {
      out = out.replace(DEC, function (m, ip, fp) {
        var n = Number(ip.replace(/,/g, '') + '.' + fp)
        if (!isFinite(n)) return m
        var r = (Math.round(n * 10) / 10).toFixed(1).split('.')
        var head = ip.indexOf(',') >= 0 ? Number(r[0]).toLocaleString('en-US') : r[0]
        return head + '.' + r[1]
      })
    }
    return out
  }
  function skipped(node) {
    for (var el = node.parentNode; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP[el.nodeName] || el.isContentEditable) return true
    }
    return false
  }
  function fixNode(t) {
    if (!t || t.nodeType !== 3 || skipped(t)) return
    var v = t.nodeValue
    var f = fixText(v)
    if (f !== v) t.nodeValue = f
  }
  function walk(root) {
    if (!root) return
    if (root.nodeType === 3) return fixNode(root)
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return
    if (root.nodeType === 1 && SKIP[root.nodeName]) return
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
    var n
    while ((n = w.nextNode())) fixNode(n)
  }
  function roundData(v) {
    if (typeof v === 'number' && isFinite(v) && !Number.isInteger(v)) return Math.round(v * 10) / 10
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      ;['x', 'y', 'r', 'v'].forEach(function (k) { if (typeof v[k] === 'number') v[k] = roundData(v[k]) })
      return v
    }
    return v
  }
  window.__demoChartRound = {
    id: 'demoRound1',
    beforeUpdate: function (chart) {
      var d = chart.config && chart.config.data
      if (d && d.datasets) d.datasets.forEach(function (ds) { if (Array.isArray(ds.data)) ds.data = ds.data.map(roundData) })
      var sc = chart.config && chart.config.options && chart.config.options.scales
      if (sc) Object.keys(sc).forEach(function (k) {
        var s = sc[k]
        if (!s || s.type === 'time' || s.type === 'timeseries' || s.type === 'category') return
        s.ticks = s.ticks || {}
        if (s.ticks.precision == null) s.ticks.precision = 1
      })
    },
  }
  function hookChart() {
    var C = window.Chart
    if (C && C.register && !C.__demoRound) {
      try {
        C.register(window.__demoChartRound)
        C.__demoRound = true
        var inst = C.instances || {}
        Object.keys(inst).forEach(function (k) { try { inst[k].update() } catch (e) {} })
      } catch (e) {}
    }
  }
  hookChart()
  window.__demoFormatText = fixText
  function start() {
    hookChart()
    walk(document.body)
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i]
        if (m.type === 'characterData') fixNode(m.target)
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j])
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true })
    var tries = 0
    var iv = setInterval(function () { hookChart(); if (++tries > 20) clearInterval(iv) }, 250)
  }
  var delay = window.__demoFormatDelay || 0
  var started = false
  function go() { if (started) return; started = true; setTimeout(start, delay) }
  if (document.readyState !== 'loading') go()
  else document.addEventListener('DOMContentLoaded', go)
})()

;(function () {
  if (window.__demoVodPlayerInstalled) return
  window.__demoVodPlayerInstalled = true
  var ID = /\/live-vod\/watch\/([A-Za-z0-9_-]{11})/
  var overlay = null
  var prevOverflow = ''

  function close() {
    if (!overlay) return
    overlay.remove()
    overlay = null
    document.body.style.overflow = prevOverflow
    document.removeEventListener('keydown', onKey)
  }
  function onKey(e) { if (e.key === 'Escape') close() }

  function open(videoId, title, href) {
    close()
    var params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0', modestbranding: '1' })
    overlay = document.createElement('div')
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute('aria-label', title || '영상 재생')
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box'

    var box = document.createElement('div')
    box.style.cssText = 'position:relative;width:100%;max-width:960px'

    var bar = document.createElement('div')
    bar.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:8px;color:#fff;font-size:14px'
    var name = document.createElement('div')
    name.textContent = title || ''
    name.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600'
    var more = document.createElement('a')
    more.href = href
    more.textContent = '상세 보기'
    more.style.cssText = 'color:#fff;text-decoration:underline;white-space:nowrap'
    more.addEventListener('click', function () { close() })
    var x = document.createElement('button')
    x.type = 'button'
    x.setAttribute('aria-label', '닫기')
    x.textContent = '×'
    x.style.cssText = 'width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:26px;line-height:1;cursor:pointer;flex:none'
    x.addEventListener('click', close)
    bar.appendChild(name)
    bar.appendChild(more)
    bar.appendChild(x)

    var frameWrap = document.createElement('div')
    frameWrap.style.cssText = 'position:relative;width:100%;padding-top:56.25%;background:#000;border-radius:8px;overflow:hidden'
    var iframe = document.createElement('iframe')
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + params.toString()
    iframe.title = title || 'YouTube 영상'
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen')
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0'
    frameWrap.appendChild(iframe)

    var watch = document.createElement('a')
    watch.href = 'https://www.youtube.com/watch?v=' + videoId
    watch.target = '_blank'
    watch.rel = 'noopener'
    watch.textContent = '재생이 안 되면 YouTube에서 보기'
    watch.style.cssText = 'display:inline-block;margin-top:10px;color:#ddd;font-size:13px;text-decoration:underline'

    box.appendChild(bar)
    box.appendChild(frameWrap)
    box.appendChild(watch)
    overlay.appendChild(box)
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close() })
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.appendChild(overlay)
    document.addEventListener('keydown', onKey)
    x.focus()
  }

  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    var t = e.target
    if (!t || !t.closest) return
    var a = t.closest('a[href]')
    if (!a) return
    var m = (a.getAttribute('href') || '').match(ID)
    if (!m) return
    var img = a.querySelector('img')
    var thumb = img && img.parentElement
    if (!thumb || !thumb.contains(t)) return
    e.preventDefault()
    e.stopPropagation()
    var title = (img.getAttribute('alt') || '').trim()
    open(m[1], title, a.href)
  }, true)
})()
