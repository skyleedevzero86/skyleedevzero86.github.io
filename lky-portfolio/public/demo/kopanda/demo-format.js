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
