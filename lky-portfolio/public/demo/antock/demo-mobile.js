(function () {
  if (window.__demoMobileInstalled) return
  window.__demoMobileInstalled = true
  var css = '@media (max-width: 767.98px){' +
    '.demo-table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}' +
    '.demo-table-scroll>table,.table-responsive>table{margin-bottom:0}' +
    '.demo-table-scroll>table th,.demo-table-scroll>table td,.table-responsive>table th,.table-responsive>table td{white-space:nowrap}' +
    '#demoNoticeBackdrop>div{max-width:calc(100vw - 32px)!important}' +
    'html,body{overflow-x:hidden}' +
    '}'
  function addStyle() {
    if (document.getElementById('demo-mobile-style')) return
    var st = document.createElement('style')
    st.id = 'demo-mobile-style'
    st.textContent = css
    ;(document.head || document.documentElement).appendChild(st)
  }
  function scrollable(el) {
    for (var p = el; p && p !== document.body; p = p.parentElement) {
      if (p.classList && (p.classList.contains('table-responsive') || p.classList.contains('demo-table-scroll'))) return true
      var ox = getComputedStyle(p).overflowX
      if (ox === 'auto' || ox === 'scroll') return true
    }
    return false
  }
  function wrapTables(root) {
    var list = (root || document).querySelectorAll ? (root || document).querySelectorAll('table') : []
    Array.prototype.forEach.call(list, function (t) {
      if (!t.parentElement || scrollable(t.parentElement)) return
      var w = document.createElement('div')
      w.className = 'demo-table-scroll'
      t.parentElement.insertBefore(w, t)
      w.appendChild(t)
    })
  }
  function start() {
    addStyle()
    wrapTables(document)
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        for (var j = 0; j < ms[i].addedNodes.length; j++) {
          var n = ms[i].addedNodes[j]
          if (n.nodeType !== 1) continue
          if (n.tagName === 'TABLE') wrapTables(n.parentElement)
          else if (n.querySelector && n.querySelector('table')) wrapTables(n)
        }
      }
    }).observe(document.body, { childList: true, subtree: true })
  }
  addStyle()
  if (document.readyState !== 'loading') start()
  else document.addEventListener('DOMContentLoaded', start)
})()
