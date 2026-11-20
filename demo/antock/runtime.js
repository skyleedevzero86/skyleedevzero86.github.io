(function () {
  const BASE = location.pathname.replace(/[^/]*$/, '')
  const ENTRY = BASE + 'index.html'
  const isDate = (v) => v && typeof v === 'object' && v.__date !== undefined
  const isEnum = (v) => v && typeof v === 'object' && v.__enum !== undefined
  const pad = (n, l = 2) => String(n).padStart(l, '0')

  function toStr(v) {
    if (v === null || v === undefined) return ''
    if (isEnum(v)) return v.__enum
    if (isDate(v)) return javaDateString(new Date(v.__date))
    if (Array.isArray(v)) return '[' + v.map(toStr).join(', ') + ']'
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(v)
    if (typeof v === 'object') {
      if (typeof v.toString === 'function' && v.toString !== Object.prototype.toString) return v.toString()
      return '{' + Object.entries(v).map(([k, x]) => k + '=' + toStr(x)).join(', ') + '}'
    }
    return String(v)
  }
  function javaDateString(d) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]} ${mons[d.getMonth()]} ${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} KST ${d.getFullYear()}`
  }
  function toNum(v) {
    if (v === null || v === undefined || v === '') return 0
    if (typeof v === 'number') return v
    if (typeof v === 'boolean') return v ? 1 : 0
    if (isDate(v)) return v.__date
    const n = Number(v)
    return isNaN(n) ? 0 : n
  }
  function toBool(v) {
    if (v === null || v === undefined) return false
    if (typeof v === 'boolean') return v
    if (typeof v === 'string') return v.toLowerCase() === 'true'
    return !!v
  }
  function isNumLike(v) { return typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)) && false) }
  function eq(a, b) {
    if (a === b) return true
    if (a === null || a === undefined || b === null || b === undefined) return (a === null || a === undefined) && (b === null || b === undefined)
    if (typeof a === 'number' || typeof b === 'number') {
      if (isEnum(a) || isEnum(b)) return toStr(a) === toStr(b)
      return toNum(a) === toNum(b)
    }
    if (typeof a === 'boolean' || typeof b === 'boolean') return toBool(a) === toBool(b)
    if (isEnum(a) || isEnum(b) || typeof a === 'string' || typeof b === 'string') return toStr(a) === toStr(b)
    if (isDate(a) && isDate(b)) return a.__date === b.__date
    return JSON.stringify(a) === JSON.stringify(b)
  }
  function cmp(a, b) {
    if ((typeof a === 'string' && typeof b === 'string') || (isEnum(a) && isEnum(b))) {
      const x = toStr(a), y = toStr(b)
      return x < y ? -1 : x > y ? 1 : 0
    }
    if (a === null || a === undefined || b === null || b === undefined) {
      const x = a === null || a === undefined ? 0 : toNum(a), y = b === null || b === undefined ? 0 : toNum(b)
      return x - y
    }
    return toNum(a) - toNum(b)
  }
  function empty(v) {
    if (v === null || v === undefined) return true
    if (typeof v === 'string') return v.length === 0
    if (Array.isArray(v)) return v.length === 0
    if (isEnum(v) || isDate(v)) return false
    if (typeof v === 'object') {
      if (v.__page) return false
      return Object.keys(v).length === 0
    }
    return false
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  function get(o, k) {
    if (o === null || o === undefined) return null
    if (k === null || k === undefined) return null
    if (Array.isArray(o)) {
      if (k === 'length' || k === 'size') return o.length
      const i = toNum(k)
      return i >= 0 && i < o.length ? o[i] : null
    }
    if (isDate(o)) {
      const d = new Date(o.__date)
      if (k === 'time') return o.__date
      if (k === 'year') return d.getFullYear() - 1900
      if (k === 'month') return d.getMonth()
      if (k === 'date') return d.getDate()
      if (k === 'hours') return d.getHours()
      if (k === 'minutes') return d.getMinutes()
      return null
    }
    if (typeof o === 'string') {
      if (k === 'empty') return o.length === 0
      if (k === 'bytes') return o.length
      return null
    }
    const key = typeof k === 'number' ? String(k) : toStr(k)
    if (isEnum(o) && key === 'name') return o.__enum
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      const v = o[key]
      return v === undefined ? null : v
    }
    if (o.__map) return null
    const g = o['get' + cap(key)], is = o['is' + cap(key)]
    if (typeof g === 'function') return g.call(o)
    if (typeof is === 'function') return is.call(o)
    if (o[key] !== undefined && typeof o[key] !== 'function') return o[key]
    return null
  }
  const STR_METHODS = {
    length: (s) => s.length, isEmpty: (s) => s.length === 0, isBlank: (s) => s.trim().length === 0,
    toUpperCase: (s) => s.toUpperCase(), toLowerCase: (s) => s.toLowerCase(), trim: (s) => s.trim(), strip: (s) => s.trim(),
    substring: (s, a, b) => s.substring(toNum(a), b === undefined ? undefined : toNum(b)),
    startsWith: (s, x) => s.startsWith(toStr(x)), endsWith: (s, x) => s.endsWith(toStr(x)),
    contains: (s, x) => s.includes(toStr(x)), indexOf: (s, x) => s.indexOf(toStr(x)), lastIndexOf: (s, x) => s.lastIndexOf(toStr(x)),
    equals: (s, x) => s === toStr(x), equalsIgnoreCase: (s, x) => s.toLowerCase() === toStr(x).toLowerCase(),
    replace: (s, a, b) => s.split(toStr(a)).join(toStr(b)), concat: (s, x) => s + toStr(x), charAt: (s, i) => s.charAt(toNum(i)),
    split: (s, r) => s.split(new RegExp(toStr(r))), toString: (s) => s, hashCode: (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h },
    matches: (s, r) => new RegExp('^(?:' + toStr(r) + ')$').test(s), repeat: (s, n) => s.repeat(toNum(n))
  }
  function call(o, m, args) {
    if (o === null || o === undefined) {
      throw new Error(`Cannot invoke method ${m}() on null`)
    }
    if (o && typeof o === 'object' && !Array.isArray(o) && Object.prototype.hasOwnProperty.call(o, m) && typeof o[m] === 'function') return o[m].apply(o, args)
    if (o === Math && typeof Math[m] === 'function') return Math[m].apply(Math, args.map(toNum))
    if (typeof o === 'string') {
      if (STR_METHODS[m]) return STR_METHODS[m](o, ...args)
      throw new Error('Unknown String method ' + m)
    }
    if (typeof o === 'number') {
      if (m === 'toString') return toStr(o)
      if (m === 'intValue' || m === 'longValue') return Math.trunc(o)
      if (m === 'doubleValue') return o
      if (m === 'equals') return eq(o, args[0])
      if (m === 'compareTo') return cmp(o, args[0])
    }
    if (typeof o === 'boolean') { if (m === 'toString') return String(o); if (m === 'booleanValue') return o }
    if (Array.isArray(o)) {
      switch (m) {
        case 'size': return o.length
        case 'isEmpty': return o.length === 0
        case 'get': return o[toNum(args[0])] ?? null
        case 'contains': return o.some((x) => eq(x, args[0]))
        case 'indexOf': return o.findIndex((x) => eq(x, args[0]))
        case 'subList': return o.slice(toNum(args[0]), toNum(args[1]))
        case 'toString': return toStr(o)
        case 'stream': return o
      }
    }
    if (isEnum(o)) {
      if (m === 'name' || m === 'toString') return o.__enum
      if (m === 'equals') return eq(o, args[0])
      if (m === 'ordinal') return o.__ordinal || 0
    }
    if (isDate(o)) {
      if (m === 'getTime') return o.__date
      if (m === 'toString') return toStr(o)
      if (m === 'before') return o.__date < toNum(args[0])
      if (m === 'after') return o.__date > toNum(args[0])
    }
    if (typeof o === 'object') {
      if (o.__map) {
        switch (m) {
          case 'get': return get(o, args[0])
          case 'containsKey': return Object.prototype.hasOwnProperty.call(o, toStr(args[0]))
          case 'size': return Object.keys(o).filter((k) => !k.startsWith('__')).length
          case 'isEmpty': return Object.keys(o).filter((k) => !k.startsWith('__')).length === 0
          case 'keySet': return Object.keys(o).filter((k) => !k.startsWith('__'))
          case 'values': return Object.keys(o).filter((k) => !k.startsWith('__')).map((k) => o[k])
          case 'getOrDefault': { const v = get(o, args[0]); return v === null ? args[1] : v }
        }
      }
      if (m === 'toString') return toStr(o)
      if (m === 'equals') return eq(o, args[0])
      if (m === 'hashCode') return 0
      if (Object.prototype.hasOwnProperty.call(o, m) && typeof o[m] !== 'function') return o[m]
      const mm = m.match(/^(get|is|has)([A-Z].*)$/)
      if (mm) {
        const prop = mm[2].charAt(0).toLowerCase() + mm[2].slice(1)
        if (Object.prototype.hasOwnProperty.call(o, prop)) return o[prop]
        if (mm[1] === 'has' && Object.prototype.hasOwnProperty.call(o, m)) return o[m]
        if (args.length === 0) return get(o, prop)
      }
      if (o.__page) {
        if (m === 'getContent') return o.content
        if (m === 'getNumber') return o.number
      }
      if (o.__bindingResult) {
        if (m === 'hasFieldErrors') return args.length ? (o.errors[toStr(args[0])] || []).length > 0 : Object.keys(o.errors).length > 0
        if (m === 'hasErrors') return Object.keys(o.errors).length > 0 || (o.global || []).length > 0
        if (m === 'getFieldError') { const e = (o.errors[toStr(args[0])] || [])[0]; return e ? { defaultMessage: e, field: toStr(args[0]) } : null }
        if (m === 'getFieldErrorCount') return args.length ? (o.errors[toStr(args[0])] || []).length : Object.values(o.errors).reduce((a, b) => a + b.length, 0)
      }
    }
    throw new Error(`Method not found: ${m}()`)
  }
  const fns = {
    'fn:length': (x) => x === null || x === undefined ? 0 : (typeof x === 'string' || Array.isArray(x)) ? x.length : Object.keys(x).length,
    'fn:contains': (s, x) => toStr(s).includes(toStr(x)),
    'fn:containsIgnoreCase': (s, x) => toStr(s).toLowerCase().includes(toStr(x).toLowerCase()),
    'fn:startsWith': (s, x) => toStr(s).startsWith(toStr(x)),
    'fn:endsWith': (s, x) => toStr(s).endsWith(toStr(x)),
    'fn:substring': (s, a, b) => { s = toStr(s); a = Math.max(0, toNum(a)); b = toNum(b); if (b < 0 || b > s.length) b = s.length; return a > b ? '' : s.substring(a, b) },
    'fn:substringAfter': (s, x) => { s = toStr(s); x = toStr(x); const i = s.indexOf(x); return i < 0 ? '' : s.slice(i + x.length) },
    'fn:substringBefore': (s, x) => { s = toStr(s); x = toStr(x); const i = s.indexOf(x); return i < 0 ? '' : s.slice(0, i) },
    'fn:toUpperCase': (s) => toStr(s).toUpperCase(),
    'fn:toLowerCase': (s) => toStr(s).toLowerCase(),
    'fn:trim': (s) => toStr(s).trim(),
    'fn:escapeXml': (s) => esc(toStr(s)),
    'fn:indexOf': (s, x) => toStr(s).indexOf(toStr(x)),
    'fn:replace': (s, a, b) => toStr(s).split(toStr(a)).join(toStr(b)),
    'fn:split': (s, d) => toStr(s).split(new RegExp('[' + toStr(d).replace(/[\]\\^-]/g, '\\$&') + ']')).filter((x) => x !== ''),
    'fn:join': (a, d) => (a || []).map(toStr).join(toStr(d))
  }
  function fn(name, args) {
    if (fns[name]) return fns[name](...args)
    throw new Error('Unknown EL function ' + name)
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#034;').replace(/'/g, '&#039;') }
  function ea(v) { return toStr(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

  function each(S, items, begin, end, step, varName, statusName, body) {
    let list
    if (items === undefined) {
      list = []
      const b = toNum(begin), e = toNum(end), st = toNum(step) || 1
      for (let i = b; i <= e; i += st) list.push(i)
      begin = null; end = null; step = 1
    } else if (items === null) list = []
    else if (Array.isArray(items)) list = items
    else if (typeof items === 'string') list = items.split(',')
    else if (typeof items === 'object') {
      if (items.__page) list = items.content
      else list = Object.keys(items).filter((k) => !k.startsWith('__')).map((k) => ({ key: items.__enumKeys ? items.__enumKeys[k] : k, value: items[k] }))
    } else list = [items]
    const b = begin === null || begin === undefined ? 0 : Math.max(0, toNum(begin))
    const e = end === null || end === undefined ? list.length - 1 : Math.min(list.length - 1, toNum(end))
    const st = toNum(step) || 1
    const prevV = S[varName], prevS = S[statusName]
    const idxs = []
    for (let i = b; i <= e; i += st) idxs.push(i)
    idxs.forEach((i, n) => {
      if (varName) S[varName] = list[i]
      if (statusName) S[statusName] = { index: items === undefined ? list[i] : i, count: n + 1, first: n === 0, last: n === idxs.length - 1, current: list[i], begin: b, end: e, step: st }
      body()
    })
    if (varName) S[varName] = prevV
    if (statusName) S[statusName] = prevS
  }

  function decimalFormat(n, pattern) {
    const pats = pattern.split(';')
    let pat = pats[0]
    const neg = n < 0
    n = Math.abs(n)
    let percent = false, permille = false
    let prefix = '', suffix = ''
    const m = pat.match(/^([^#0,.]*)([#0,.]+)(.*)$/)
    if (m) { prefix = m[1]; pat = m[2]; suffix = m[3] }
    if (suffix.includes('%')) { percent = true; n *= 100 }
    if (suffix.includes('‰')) { permille = true; n *= 1000 }
    prefix = prefix.replace(/'/g, ''); suffix = suffix.replace(/'/g, '')
    const [ip, fp = ''] = pat.split('.')
    const minFrac = (fp.match(/0/g) || []).length
    const maxFrac = fp.length
    const minInt = (ip.replace(/,/g, '').match(/0/g) || []).length
    const grouping = ip.includes(',') ? ip.length - ip.lastIndexOf(',') - 1 : 0
    let s = roundHalfEven(n, maxFrac)
    let [i, f = ''] = s.split('.')
    f = f.replace(/0+$/, '')
    while (f.length < minFrac) f += '0'
    if (i === '0' && minInt === 0 && (f.length > 0)) i = ''
    while (i.length < minInt) i = '0' + i
    if (grouping > 0) i = i.replace(new RegExp(`\\B(?=(\\d{${grouping}})+(?!\\d))`, 'g'), ',')
    let out = i + (f.length ? '.' + f : '')
    if (out === '') out = '0'
    return (neg && Number(s) !== 0 ? '-' : '') + prefix + out + suffix
  }
  function roundHalfEven(n, d) {
    const f = Math.pow(10, d)
    const x = n * f
    const r = Math.round(x)
    const diff = Math.abs(x % 1)
    let v = (diff === 0.5 && r % 2 !== 0) ? r - 1 : r
    if (Math.abs(x - Math.round(x)) < 1e-9) v = Math.round(x)
    return (v / f).toFixed(d)
  }
  function fmtNum(v, o) {
    if (v === null || v === undefined || v === '') return ''
    const n = toNum(v)
    if (o.pattern) return decimalFormat(n, toStr(o.pattern))
    const type = o.type ? toStr(o.type) : 'number'
    let max = o.max !== null ? toNum(o.max) : (type === 'percent' ? 0 : 3)
    let min = o.min !== null ? toNum(o.min) : 0
    if (min > max) max = min
    const grouping = o.grouping === null ? true : toBool(o.grouping)
    const val = type === 'percent' ? n * 100 : n
    let s = new Intl.NumberFormat('en-US', { minimumFractionDigits: min, maximumFractionDigits: max, useGrouping: grouping }).format(val)
    if (type === 'percent') s += '%'
    if (type === 'currency') s = '₩' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val)
    return s
  }
  function toDateObj(v) {
    if (v === null || v === undefined || v === '') return null
    if (isDate(v)) return new Date(v.__date)
    if (v instanceof Date) return v
    if (typeof v === 'number') return new Date(v)
    if (typeof v === 'string') { const d = new Date(v); if (!isNaN(d)) return d }
    throw new Error('Cannot format given Object as a Date')
  }
  function fmtDate(v, o) {
    const d = toDateObj(v)
    if (!d) return ''
    let pattern = o.pattern ? toStr(o.pattern) : null
    if (!pattern) {
      const type = o.type ? toStr(o.type) : 'date'
      pattern = type === 'both' ? 'yy. M. d. a h:mm' : type === 'time' ? 'a h:mm:ss' : 'yyyy. M. d.'
    }
    return formatPattern(d, pattern)
  }
  function formatPattern(d, pattern) {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return pattern.replace(/'([^']*)'|yyyy|yy|MMMM|MMM|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|a|EEEE|EEE|E/g, (t, lit) => {
      if (lit !== undefined) return lit
      switch (t) {
        case 'yyyy': return String(d.getFullYear())
        case 'yy': return String(d.getFullYear()).slice(-2)
        case 'MMMM': case 'MMM': return (d.getMonth() + 1) + '월'
        case 'MM': return pad(d.getMonth() + 1)
        case 'M': return String(d.getMonth() + 1)
        case 'dd': return pad(d.getDate())
        case 'd': return String(d.getDate())
        case 'HH': return pad(d.getHours())
        case 'H': return String(d.getHours())
        case 'hh': return pad(d.getHours() % 12 || 12)
        case 'h': return String(d.getHours() % 12 || 12)
        case 'mm': return pad(d.getMinutes())
        case 'm': return String(d.getMinutes())
        case 'ss': return pad(d.getSeconds())
        case 's': return String(d.getSeconds())
        case 'SSS': return pad(d.getMilliseconds(), 3)
        case 'a': return d.getHours() < 12 ? '오전' : '오후'
        case 'EEEE': return days[d.getDay()] + '요일'
        case 'EEE': case 'E': return days[d.getDay()]
      }
      return t
    })
  }
  function parseDate(v, pattern) {
    const d = new Date(toStr(v).replace(' ', 'T'))
    return isNaN(d) ? null : { __date: d.getTime() }
  }
  function url(u, params) {
    let s = toStr(u)
    const q = params.map(([k, v]) => encodeURIComponent(toStr(k)) + '=' + encodeURIComponent(toStr(v))).join('&')
    if (q) s += (s.includes('?') ? '&' : '?') + q
    return s
  }
  function secEval(S, expr) {
    const auth = S.__auth
    const roles = auth ? ['ROLE_' + auth.role] : []
    let js = expr
      .replace(/isAuthenticated\(\)/g, String(!!auth))
      .replace(/isFullyAuthenticated\(\)/g, String(!!auth))
      .replace(/isAnonymous\(\)/g, String(!auth))
      .replace(/permitAll/g, 'true').replace(/denyAll/g, 'false')
      .replace(/hasAnyRole\(([^)]*)\)/g, (m, a) => String(a.split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).some((r) => roles.includes(r.startsWith('ROLE_') ? r : 'ROLE_' + r))))
      .replace(/hasRole\(([^)]*)\)/g, (m, a) => { const r = a.trim().replace(/^['"]|['"]$/g, ''); return String(roles.includes(r.startsWith('ROLE_') ? r : 'ROLE_' + r)) })
      .replace(/hasAnyAuthority\(([^)]*)\)/g, (m, a) => String(a.split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).some((r) => roles.includes(r))))
      .replace(/hasAuthority\(([^)]*)\)/g, (m, a) => String(roles.includes(a.trim().replace(/^['"]|['"]$/g, ''))))
      .replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
    if (!/^[\s!&|()truefals]*$/.test(js)) throw new Error('Unsupported security expression: ' + expr)
    return Function('return (' + js + ')')()
  }
  function authProp(S, prop) {
    const a = S.__auth
    if (!a) return prop === 'name' || prop === 'principal' ? 'anonymousUser' : null
    const principal = { username: a.username, name: a.username, authorities: [{ authority: 'ROLE_' + a.role }], role: a.role }
    const root = { name: a.username, principal, authorities: principal.authorities }
    return prop.split('.').reduce((o, k) => get(o, k), root)
  }
  function errBag(S, path) {
    let bean = S.__form, field = path
    if (!bean || path.includes('.')) {
      const i = path.indexOf('.')
      if (i > 0 && S[path.slice(0, i)] !== undefined) { bean = path.slice(0, i); field = path.slice(i + 1) }
    }
    const br = S['org.springframework.validation.BindingResult.' + bean]
    return { bean, field, br }
  }
  function errs(S, path) {
    const { field, br } = errBag(S, path)
    if (!br) return []
    if (field === '*') return [].concat(br.global || [], ...Object.values(br.errors))
    return br.errors[field] || []
  }
  function hasErr(S, path) { return errs(S, path).length > 0 }
  function formVal(S, path) {
    const bean = S[S.__form]
    if (!bean) return ''
    return path.split('.').reduce((o, k) => get(o, k), bean)
  }
  function setProp(t, p, v) { if (t && typeof t === 'object') t[toStr(p)] = v }

  const R = {
    v: (S, n) => (S[n] === undefined ? null : S[n]),
    g: get, c: call, fn, s: toStr, b: toBool, eq, cmp, empty,
    add: (a, b) => toNum(a) + toNum(b), sub: (a, b) => toNum(a) - toNum(b), mul: (a, b) => toNum(a) * toNum(b),
    div: (a, b) => { const y = toNum(b); return y === 0 ? (toNum(a) === 0 ? NaN : (toNum(a) > 0 ? Infinity : -Infinity)) : toNum(a) / y },
    mod: (a, b) => toNum(a) % toNum(b), neg: (a) => -toNum(a), cat: (a, b) => toStr(a) + toStr(b),
    esc, ea, each, fmtNum, fmtDate, parseDate, url, sec: secEval, authProp, errs, hasErr, formVal, setProp
  }

  function parseRoute(href) {
    const u = new URL(href, location.href)
    const sp = new URLSearchParams(u.search)
    let p = sp.get('_p') || '/'
    sp.delete('_p')
    const qi = p.indexOf('?')
    if (qi >= 0) { new URLSearchParams(p.slice(qi + 1)).forEach((v, k) => sp.append(k, v)); p = p.slice(0, qi) }
    if (!p.startsWith('/')) p = '/' + p
    return { path: p, params: sp }
  }
  function routeUrl(path, extra) {
    let p = path || '/'
    let q = ''
    const qi = p.indexOf('?')
    if (qi >= 0) { q = p.slice(qi + 1); p = p.slice(0, qi) }
    const hi = (q || p).indexOf('#')
    let hash = ''
    if (q && hi >= 0) { hash = q.slice(hi); q = q.slice(0, hi) } else if (!q && p.indexOf('#') >= 0) { hash = p.slice(p.indexOf('#')); p = p.slice(0, p.indexOf('#')) }
    let s = ENTRY + '?_p=' + encodeURI(p).replace(/[?&#]/g, encodeURIComponent)
    if (q) s += '&' + q
    if (extra) s += '&' + extra
    return s + hash
  }
  function isAppPath(raw) {
    if (typeof raw !== 'string') return false
    if (!raw.startsWith('/') || raw.startsWith('//')) return false
    if (raw.startsWith(BASE)) return false
    return true
  }
  function appPathFromUrl(u) {
    if (u.origin !== location.origin) return null
    if (u.pathname === ENTRY || u.pathname === BASE) return null
    if (u.pathname.startsWith(BASE)) return null
    return u.pathname + u.search
  }

  window.AntockRuntime = { R, BASE, ENTRY, parseRoute, routeUrl, isAppPath, appPathFromUrl, toStr, formatPattern, toDateObj }
})()
