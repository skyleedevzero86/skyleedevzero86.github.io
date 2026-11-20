(function () {
  const RT = window.AntockRuntime
  const KEY = 'antock-demo-db-v2'
  const SKEY = 'antock-demo-session-v1'
  const DAY = 86400000
  const now = () => Date.now()
  const pad = (n, l = 2) => String(n).padStart(l, '0')
  const ldt = (t) => { if (t === null || t === undefined) return null; const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` }
  const jdate = (t) => (t === null || t === undefined ? null : { __date: t })
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
  const pick = (a) => a[Math.floor(Math.random() * a.length)]
  let seedState = 20251120
  const srnd = () => { seedState = (seedState * 1103515245 + 12345) & 0x7fffffff; return seedState / 0x7fffffff }
  const sint = (a, b) => Math.floor(srnd() * (b - a + 1)) + a
  const spick = (a) => a[Math.floor(srnd() * a.length)]

  const STATUS = { PENDING: '승인 대기', APPROVED: '승인됨', REJECTED: '거부됨', SUSPENDED: '정지됨', WITHDRAWN: '탈퇴됨' }
  const ROLE = { USER: '일반 사용자', MANAGER: '관리자', ADMIN: '시스템 관리자' }
  const HS = { UP: '정상', DOWN: '장애', UNKNOWN: '알 수 없음' }
  const statusEnum = (s) => ({ __enum: s, description: STATUS[s] })
  const roleEnum = (s) => ({ __enum: s, description: ROLE[s] })
  const hsEnum = (s) => ({ __enum: s, code: s, description: HS[s] })
  const COMPONENTS = ['database', 'redis', 'cache', 'member-service', 'rate-limit']

  const CITIES = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도']
  const DISTRICTS = window.ANTOCK_DISTRICTS || []

  const REGION_CD = { '서울특별시': '11', '부산광역시': '26', '대구광역시': '27', '인천광역시': '28', '광주광역시': '29', '대전광역시': '30', '울산광역시': '31', '세종특별자치시': '36', '경기도': '41', '강원특별자치도': '51', '충청북도': '43', '충청남도': '44', '전라북도': '52', '전라남도': '46', '경상북도': '47', '경상남도': '48', '제주특별자치도': '50' }
  const NAME_A = ['한빛', '새솔', '다온', '가람', '누리', '미르', '해담', '온새미', '라온', '여울', '푸른', '청솔', '바른', '든솔', '해솔', '참빛', '하늘', '은빛', '별빛', '도담', '마루', '나래', '이음', '보람', '소담']
  const NAME_B = ['커머스', '유통', '상사', '트레이딩', '마켓', '리테일', '쇼핑', '네트웍스', '글로벌', '푸드', '패션', '테크', '라이프', '스토어', '코리아']
  const NAME_C = ['(주)', '주식회사 ', '', '유한회사 ']

  function freshDb() {
    seedState = 20251120
    const t = now()
    const db = { seq: { member: 0, corp: 0, file: 0, check: 0, hist: 0, coseller: 0, csv: 0 }, members: [], corps: [], corpHistory: [], csvHistory: [], files: [], checks: [], coseller: [], resetTokens: {}, lastScheduled: 0 }
    const addMember = (username, nickname, role, status, opts = {}) => {
      const id = ++db.seq.member
      const created = opts.created || t - sint(20, 200) * DAY - sint(0, 86400) * 1000
      db.members.push(Object.assign({
        id, username, password: 'Password1!', nickname, email: username + '@antock.kr', role, status,
        apiKey: true ? 'ak_' + Array.from({ length: 32 }, () => '0123456789abcdef'[sint(0, 15)]).join('') : null,
        createDate: created, lastLoginAt: status === 'APPROVED' ? t - sint(1, 72) * 3600000 : null,
        approvedAt: status === 'APPROVED' || status === 'SUSPENDED' ? created + sint(1, 48) * 3600000 : null,
        passwordChangedAt: created + sint(0, 10) * DAY, loginFailCount: 0, pwChanges: []
      }, opts.extra || {}))
    }
    addMember('admin', '시스템관리자', 'ADMIN', 'APPROVED', { created: t - 240 * DAY })
    addMember('manager01', '운영매니저', 'MANAGER', 'APPROVED', { created: t - 200 * DAY })
    addMember('manager02', '지역담당', 'MANAGER', 'APPROVED', { created: t - 150 * DAY })
    const users = [['kimseller', '김판매', 'APPROVED'], ['leetrade', '이유통', 'APPROVED'], ['parkshop', '박쇼핑', 'APPROVED'], ['choimarket', '최마켓', 'APPROVED'], ['jungcom', '정커머스', 'SUSPENDED'], ['kangstore', '강스토어', 'PENDING'], ['yoondeal', '윤딜', 'PENDING'], ['jangmall', '장몰', 'PENDING'], ['limretail', '임리테일', 'REJECTED'], ['hanbiz', '한비즈', 'APPROVED'], ['ohtrade', '오트레이드', 'WITHDRAWN'], ['seoshop', '서샵', 'APPROVED'], ['shinfood', '신푸드', 'PENDING'], ['kwonmart', '권마트', 'APPROVED']]
    users.forEach(([u, n, s], i) => addMember(u, n, 'USER', s, { extra: { loginFailCount: u === 'choimarket' ? 5 : u === 'parkshop' ? 2 : 0, lastLoginAt: t - sint(1, 400) * 3600000, approvedAt: t - sint(30, 90) * DAY } }))
    db.members.find((m) => m.username === 'admin').passwordChangedAt = t - 85 * DAY
    db.members.find((m) => m.username === 'manager02').passwordChangedAt = t - 20 * DAY

    const regions = [['서울특별시', '강남구', 34], ['서울특별시', '서초구', 22], ['서울특별시', '송파구', 19], ['서울특별시', '마포구', 15], ['서울특별시', '영등포구', 12], ['부산광역시', '해운대구', 14], ['부산광역시', '부산진구', 9], ['광주광역시', '서구', 18], ['광주광역시', '북구', 13], ['광주광역시', '광산구', 11], ['전라남도', '여수시', 16], ['전라남도', '순천시', 10], ['전라남도', '목포시', 7], ['경기도', '성남시', 17], ['경기도', '수원시', 13], ['경기도', '고양시', 9], ['대전광역시', '유성구', 8], ['대구광역시', '수성구', 8], ['인천광역시', '연수구', 7], ['제주특별자치도', '제주시', 6]]
    const owners = ['admin', 'manager01', 'manager02', 'kimseller', 'leetrade', 'parkshop', 'hanbiz', 'seoshop', 'kwonmart']
    regions.forEach(([city, district, n], ri) => {
      for (let i = 0; i < n; i++) {
        const id = ++db.seq.corp
        const created = t - sint(1, 180) * DAY - sint(0, 86400) * 1000
        const validReg = srnd() > 0.18
        const validRc = srnd() > 0.12
        db.corps.push({
          id, sellerId: `${REGION_CD[city]}${pad(ri, 2)}-${2020 + sint(0, 5)}-${pad(sint(1, 9999), 4)}`,
          bizNm: spick(NAME_C) + spick(NAME_A) + spick(NAME_B), bizNo: String(sint(100, 899)) + pad(sint(1, 99)) + pad(sint(1, 99999), 5),
          corpRegNo: validReg ? String(sint(110111, 285011)) + pad(sint(1, 9999999), 7) : String(sint(110111, 285011)) + '-' + pad(sint(1, 99999), 5),
          regionCd: validRc ? REGION_CD[city] + pad(sint(100, 890), 3) + '00000' : REGION_CD[city] + pad(sint(100, 890), 3),
          siNm: city, sggNm: district, username: spick(owners), description: `${district} 소재 ${spick(['온라인 쇼핑몰', '오픈마켓 입점', '식품 통신판매', '의류 통신판매', '생활용품 판매'])} 사업자`,
          createDate: created, modifyDate: created
        })
      }
    })
    db.corps.slice(-12).forEach((c, i) => { db.corpHistory.push({ id: ++db.seq.hist, action: i % 5 === 0 ? 'UPDATE' : 'INSERT', bizNo: c.bizNo, message: null, timestamp: t - (i + 1) * 47 * 60000 }) })
    db.csvHistory.push({ id: ++db.seq.csv, city: '전라남도', district: '여수시', status: 'SUCCESS', recordCount: 16, timestamp: t - 5 * 3600000 })
    db.csvHistory.push({ id: ++db.seq.csv, city: '광주광역시', district: '서구', status: 'SUCCESS', recordCount: 18, timestamp: t - 26 * 3600000 })
    db.csvHistory.push({ id: ++db.seq.csv, city: '울산광역시', district: '남구', status: 'FAILED', recordCount: 0, timestamp: t - 30 * 3600000 })
    ;[['admin', '전라남도', '여수시', true, '16건 저장'], ['manager01', '광주광역시', '서구', true, '18건 저장'], ['manager02', '울산광역시', '남구', false, 'CSV 파일 없음'], ['admin', '서울특별시', '강남구', true, '34건 저장']].forEach(([u, c, d, ok, r], i) => {
      db.coseller.push({ id: ++db.seq.coseller, username: u, city: c, district: d, registeredAt: t - (i * 9 + 5) * 3600000, success: ok, result: r })
    })

    const fileSeed = [
      ['서울특별시_강남구.csv', 'text/csv', '서울 강남구 통신판매사업자 원본 CSV', 'csv'],
      ['전라남도_여수시.csv', 'text/csv', '여수시 통신판매사업자 원본 CSV', 'csv'],
      ['광주광역시_서구.csv', 'text/csv', '광주 서구 통신판매사업자 원본 CSV', 'csv'],
      ['법인현황_2026Q3.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '3분기 법인 현황 보고', 'bin'],
      ['시스템구성도.png', 'image/png', '배포 아키텍처 다이어그램', 'png'],
      ['운영매뉴얼_v1.2.pdf', 'application/pdf', '관리자 운영 매뉴얼', 'pdf'],
      ['수집로그_20261118.txt', 'text/plain', '배치 수집 로그', 'txt']
    ]
    fileSeed.forEach(([name, type, desc, kind], i) => {
      const content = makeFileContent(kind, name, db)
      const id = ++db.seq.file
      const up = t - (fileSeed.length - i) * 2 * DAY - sint(0, 30000) * 1000
      db.files.push({ id, originalFileName: name, storedFileName: crypto.randomUUID ? crypto.randomUUID() + '_' + name : 'f' + id + '_' + name, fileSize: content.size, contentType: type, uploadTime: up, lastModifiedTime: up + (i % 3 === 0 ? DAY : 0), description: desc, content: content.data, encoding: content.enc, uploaderName: i % 2 ? 'manager01' : 'admin' })
    })

    for (let h = 7 * 24; h >= 1; h--) {
      const at = t - h * 3600000 + sint(0, 120) * 1000
      COMPONENTS.forEach((c) => db.checks.push(makeCheck(db, c, at, 'scheduled', h)))
    }
    db.lastScheduled = t - 3600000
    return db
  }

  function makeFileContent(kind, name, db) {
    if (kind === 'csv') {
      const [city, rest] = name.replace('.csv', '').split('_')
      const rows = db.corps.filter((c) => c.siNm === city && c.sggNm === rest).map((c) => [c.sellerId, c.bizNm, c.bizNo, c.corpRegNo, c.regionCd, c.siNm, c.sggNm].join(','))
      const data = '판매자ID,상호,사업자번호,법인등록번호,행정구역코드,시도,시군구\n' + rows.join('\n') + '\n'
      return { data, enc: 'text', size: new Blob([data]).size }
    }
    if (kind === 'txt') {
      const lines = []
      for (let i = 0; i < 40; i++) lines.push(`2026-11-18 0${Math.floor(i / 10)}:${pad(i % 60)}:12 INFO  CsvBatchJob - chunk ${i + 1} processed (100 rows)`)
      const data = lines.join('\n')
      return { data, enc: 'text', size: new Blob([data]).size }
    }
    if (kind === 'png') {
      const data = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAQUlEQVR42u3OMQ0AAAgDsM2/aDDBRxoFTUfOVXxHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgxwH3cQE/9a2PHQAAAABJRU5ErkJggg=='
      return { data, enc: 'base64', size: Math.floor(data.length * 3 / 4) }
    }
    if (kind === 'pdf') {
      const data = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 60>>stream\nBT /F1 24 Tf 72 760 Td (Antock Operation Manual v1.2) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'
      return { data, enc: 'text', size: data.length }
    }
    const data = 'UEsDBBQAAAAIAAAAIQAAAAAAAAAAAAAAAAAJAAAAZG9jUHJvcHMvUEsFBgAAAAABAAEANwAAACcAAAAAAA=='
    return { data, enc: 'base64', size: 48213 }
  }

  function makeCheck(db, component, at, checkType, salt) {
    let status = 'UP', message, rt
    const r = Math.random()
    switch (component) {
      case 'database': rt = rnd(4, 38); if (r < 0.02) { status = 'DOWN'; message = '데이터베이스 연결 실패: Connection is not available, request timed out after 30000ms.'; rt = 0 } else message = '데이터베이스 연결 정상'; break
      case 'redis': rt = rnd(1, 9); if (r < 0.05) { status = 'DOWN'; message = 'Redis 연결 실패: Unable to connect to localhost:6379'; rt = 0 } else if (r < 0.08) { status = 'UNKNOWN'; message = 'Redis 비활성화됨'; rt = 0 } else message = 'Redis 연결 정상'; break
      case 'cache': rt = rnd(0, 3); if (r < 0.02) { status = 'DOWN'; message = '캐시 서비스 응답 없음' } else message = '캐시 서비스 정상'; break
      case 'member-service': rt = rnd(2, 16); if (r < 0.02) { status = 'DOWN'; message = '회원 서비스 오류: 회원 수 조회 실패' } else message = '회원 서비스 정상'; break
      default: rt = rnd(0, 4); if (r < 0.015) { status = 'DOWN'; message = 'Rate Limit 서비스 응답 없음' } else message = 'Rate Limit 서비스 정상'
    }
    const details = component === 'database' ? { database: 'MySQL', validationQuery: 'SELECT 1', poolActive: rnd(1, 8), poolIdle: rnd(2, 10) }
      : component === 'redis' ? { host: 'localhost', port: 6379, ping: status === 'UP' ? 'PONG' : null }
        : component === 'cache' ? { cacheNames: ['members', 'regionStats', 'recentActivities'], hitRate: (80 + Math.random() * 19).toFixed(1) + '%' }
          : component === 'member-service' ? { totalMembers: db.members ? db.members.length : 0 }
            : { limit: '60/min', availableTokens: rnd(30, 60) }
    return { id: ++db.seq.check, component, status, message, responseTime: rt, checkType, details, checkedAt: at, expiresAt: at + 5 * 60000 }
  }

  let db
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { db = JSON.parse(raw); return } } catch (e) { }
    db = freshDb(); save()
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch (e) { db.checks = db.checks.slice(-1500); try { localStorage.setItem(KEY, JSON.stringify(db)) } catch (x) { } } }
  function session() { try { return JSON.parse(localStorage.getItem(SKEY) || 'null') } catch (e) { return null } }
  function setSession(s) { if (s) localStorage.setItem(SKEY, JSON.stringify(s)); else localStorage.removeItem(SKEY) }
  load()

  function runScheduler() {
    const t = now()
    if (t - db.lastScheduled >= 5 * 60000) {
      const missed = Math.min(12, Math.floor((t - db.lastScheduled) / (5 * 60000)))
      for (let i = missed - 1; i >= 0; i--) {
        const at = t - i * 5 * 60000
        COMPONENTS.forEach((c) => db.checks.push(makeCheck(db, c, at, 'scheduled')))
      }
      db.lastScheduled = t
      const cutoff = t - 8 * DAY
      db.checks = db.checks.filter((c) => c.checkedAt >= cutoff)
      save()
    }
  }
  runScheduler()

  function currentMember() {
    const s = session()
    if (!s) return null
    const m = db.members.find((x) => x.id === s.memberId)
    if (!m || m.status === 'WITHDRAWN') { setSession(null); return null }
    return m
  }
  const authOf = (m) => (m ? { username: m.username, role: m.role, id: m.id } : null)
  const isStaff = (m) => !!m && (m.role === 'ADMIN' || m.role === 'MANAGER')

  function page(list, pageNo, size) {
    const total = list.length
    size = Math.max(1, size)
    const totalPages = Math.ceil(total / size)
    const number = Math.max(0, pageNo)
    const content = list.slice(number * size, number * size + size)
    return { __page: true, content, totalElements: total, totalPages, number, size, numberOfElements: content.length, first: number === 0, last: number >= totalPages - 1, empty: content.length === 0, hasNext: number < totalPages - 1, hasPrevious: number > 0, hasContent: content.length > 0 }
  }
  const memberResp = (m) => ({ id: m.id, username: m.username, nickname: m.nickname, email: m.email, role: roleEnum(m.role), status: statusEnum(m.status), apiKey: m.apiKey, createDate: ldt(m.createDate), lastLoginAt: ldt(m.lastLoginAt), approvedAt: ldt(m.approvedAt), passwordChangedAt: ldt(m.passwordChangedAt), loginFailCount: m.loginFailCount, approvedBy: m.approvedBy || null })
  const memberView = (m) => ({ member: memberResp(m), createDateFormatted: jdate(m.createDate), lastLoginAtFormatted: jdate(m.lastLoginAt) })
  const corpResp = (c) => ({ id: c.id, sellerId: c.sellerId, bizNm: c.bizNm, bizNo: c.bizNo, corpRegNo: c.corpRegNo, regionCd: c.regionCd, siNm: c.siNm, sggNm: c.sggNm, username: c.username, description: c.description, createDate: ldt(c.createDate), modifyDate: ldt(c.modifyDate), formattedBizNo: c.bizNo && c.bizNo.length === 10 ? c.bizNo.slice(0, 3) + '-' + c.bizNo.slice(3, 5) + '-' + c.bizNo.slice(5) : c.bizNo, fullAddress: (c.siNm || '') + ' ' + (c.sggNm || '') })
  const validReg = (c) => /^\d{13}$/.test(c.corpRegNo || '')
  const validRc = (c) => /^\d{10}$/.test(c.regionCd || '')
  const maskLast = (v) => { if (!v) return ''; const a = v.split(''); for (let i = a.length - 1; i >= 0; i--) if (/[0-9]/.test(a[i])) { a[i] = '*'; return a.join('') } return v }
  const map = (o) => Object.assign({ __map: true }, o)

  function regionStats(city, district) {
    const groups = {}
    db.corps.forEach((c) => {
      if (city && c.siNm !== city) return
      if (district && c.sggNm !== district) return
      const k = c.siNm + '|' + c.sggNm
      if (!groups[k]) groups[k] = { city: c.siNm, district: c.sggNm, totalCount: 0, validCorpRegNoCount: 0, validRegionCdCount: 0 }
      const g = groups[k]
      g.totalCount++
      if (validReg(c)) g.validCorpRegNoCount++
      if (validRc(c)) g.validRegionCdCount++
    })
    return Object.values(groups).map((g) => {
      const rate = g.totalCount ? Math.round(((g.validCorpRegNoCount / g.totalCount * 100) + (g.validRegionCdCount / g.totalCount * 100)) / 2 * 100) / 100 : 0
      return Object.assign(g, { completionRate: rate, formattedCount: g.totalCount.toLocaleString('en-US') })
    }).sort((a, b) => b.totalCount - a.totalCount || a.city.localeCompare(b.city))
  }
  function dashboardStats() {
    const total = db.corps.length
    const v1 = db.corps.filter(validReg).length, v2 = db.corps.filter(validRc).length
    return { total, validCorpRegNo: v1, validRegionCd: v2, successRate: total ? (v1 + v2) / (2 * total) * 100 : 0 }
  }
  function timeAgo(t) {
    const m = Math.floor((now() - t) / 60000)
    if (m < 1) return '방금 전'
    if (m < 60) return m + '분 전'
    const h = Math.floor(m / 60)
    if (h < 24) return h + '시간 전'
    return Math.floor(h / 24) + '일 전'
  }
  function recentActivities(limit) {
    const items = []
    db.corpHistory.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 10).forEach((h) => {
      const msg = h.message || (h.action === 'INSERT' ? '새로운 법인 정보가 등록되었습니다: ' : h.action === 'UPDATE' ? '법인 정보가 수정되었습니다: ' : h.action === 'DELETE' ? '법인 정보가 삭제되었습니다: ' : '법인 정보 ' + h.action + ': ') + h.bizNo
      items.push({ t: h.timestamp, message: msg, timeAgo: timeAgo(h.timestamp), type: h.action === 'INSERT' ? 'success' : h.action === 'UPDATE' ? 'info' : h.action === 'DELETE' ? 'error' : 'warning', icon: '' })
    })
    db.csvHistory.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 10).forEach((h) => {
      const msg = h.status === 'SUCCESS' ? `CSV 배치 처리 완료: ${h.city} ${h.district} (${h.recordCount}건)` : h.status === 'FAILED' ? `CSV 배치 처리 실패: ${h.city} ${h.district}` : `CSV 배치 처리 중: ${h.city} ${h.district}`
      items.push({ t: h.timestamp, message: msg, timeAgo: timeAgo(h.timestamp), type: h.status === 'SUCCESS' ? 'success' : h.status === 'FAILED' ? 'error' : 'warning', icon: '' })
    })
    items.push({ t: now(), message: '시스템이 정상적으로 실행 중입니다', timeAgo: '방금 전', type: 'info', icon: '' })
    const dbCheck = latestChecks().find((c) => c.component === 'database')
    if (dbCheck && dbCheck.status === 'UP') items.push({ t: now() - 60000, message: '데이터베이스 연결 확인됨', timeAgo: '1분 전', type: 'success', icon: '' })
    else items.push({ t: now(), message: '데이터베이스 연결 오류', timeAgo: '방금 전', type: 'error', icon: '' })
    return items.sort((a, b) => b.t - a.t).slice(0, limit).map(({ t, ...r }) => r)
  }
  function corpHist(action, c) { db.corpHistory.push({ id: ++db.seq.hist, action, bizNo: c.bizNo, message: null, timestamp: now() }) }

  function checkResp(c) {
    const t = now()
    return { component: c.component, status: hsEnum(c.status), statusDescription: HS[c.status], message: c.message, responseTime: c.responseTime, checkType: c.checkType, details: map(c.details || {}), checkedAt: ldt(c.checkedAt), expiresAt: ldt(c.expiresAt), expired: c.expiresAt < t, healthy: c.status === 'UP', checkedAtAsDate: jdate(c.checkedAt), expiresAtAsDate: jdate(c.expiresAt) }
  }
  function latestChecks(components) {
    const res = []
    ;(components || COMPONENTS).forEach((comp) => {
      for (let i = db.checks.length - 1; i >= 0; i--) if (db.checks[i].component === comp) { res.push(db.checks[i]); break }
    })
    return res
  }
  function systemHealth(checks) {
    const total = checks.length
    const healthy = checks.filter((c) => c.status === 'UP').length
    const unknown = checks.filter((c) => c.status === 'UNKNOWN').length
    const unhealthy = total - healthy - unknown
    const overall = unhealthy > 0 ? 'DOWN' : (healthy === total && total > 0 ? 'UP' : (healthy > 0 ? 'UP' : 'UNKNOWN'))
    const at = checks.length ? Math.max(...checks.map((c) => c.checkedAt)) : now()
    return {
      overallStatus: hsEnum(overall), overallStatusDescription: HS[overall], totalComponents: total, healthyComponents: healthy, unhealthyComponents: unhealthy, unknownComponents: unknown,
      healthPercentage: total ? Math.round(healthy / total * 1000) / 10 : 0, details: map({ checkType: checks[0] ? checks[0].checkType : 'scheduled' }),
      components: checks.map(checkResp), checkedAt: ldt(at), expiresAt: ldt(at + 5 * 60000), expired: at + 5 * 60000 < now(), healthy: overall === 'UP',
      checkedAtAsDate: jdate(at), expiresAtAsDate: jdate(at + 5 * 60000)
    }
  }
  function performChecks(components, type) {
    const at = now()
    const list = (components && components.length ? components : COMPONENTS).filter((c) => COMPONENTS.includes(c))
    const made = list.map((c) => makeCheck(db, c, at, type))
    db.checks.push(...made)
    save()
    return made
  }
  function componentMetrics(comp, list) {
    const checks = list.filter((c) => c.component === comp)
    const ok = checks.filter((c) => c.status === 'UP')
    const rts = checks.map((c) => c.responseTime || 0)
    let consF = 0, consS = 0
    for (let i = checks.length - 1; i >= 0; i--) { if (checks[i].status === 'UP') { if (consF) break; consS++ } else { if (consS) break; consF++ } }
    const last = checks[checks.length - 1]
    return {
      component: comp, availability: checks.length ? Math.round(ok.length / checks.length * 10000) / 100 : 0,
      averageResponseTime: rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length * 100) / 100 : 0,
      maxResponseTime: rts.length ? Math.max(...rts) : 0, minResponseTime: rts.length ? Math.min(...rts) : 0,
      totalChecks: checks.length, successfulChecks: ok.length, failedChecks: checks.length - ok.length,
      successRate: checks.length ? Math.round(ok.length / checks.length * 10000) / 100 : 0,
      lastCheckTime: last ? ldt(last.checkedAt) : null, lastCheckTimeAsDate: last ? jdate(last.checkedAt) : null,
      lastStatus: last ? hsEnum(last.status) : hsEnum('UNKNOWN'), consecutiveFailures: consF, consecutiveSuccesses: consS
    }
  }
  function metrics(days, realtime) {
    const from = realtime ? now() - 3600000 : now() - days * DAY
    const list = db.checks.filter((c) => c.checkedAt >= from)
    const ok = list.filter((c) => c.status === 'UP')
    const rts = list.map((c) => c.responseTime || 0)
    const dist = { __map: true, __enumKeys: {} }
    ;['UP', 'DOWN', 'UNKNOWN'].forEach((s) => { const n = list.filter((c) => c.status === s).length; if (n) { dist[s] = n; dist.__enumKeys[s] = hsEnum(s) } })
    const slots = []
    const slotSize = realtime ? 10 * 60000 : (days <= 1 ? 3600000 : DAY)
    const startSlot = Math.floor(from / slotSize) * slotSize
    for (let s = startSlot; s <= now(); s += slotSize) {
      const inSlot = list.filter((c) => c.checkedAt >= s && c.checkedAt < s + slotSize)
      if (!inSlot.length) continue
      const so = inSlot.filter((c) => c.status === 'UP').length
      slots.push({ timeSlot: ldt(s), checkCount: inSlot.length, successCount: so, failureCount: inSlot.length - so, averageResponseTime: Math.round(inSlot.reduce((a, c) => a + (c.responseTime || 0), 0) / inSlot.length * 100) / 100, availability: Math.round(so / inSlot.length * 10000) / 100 })
    }
    const hourly = []
    for (let h = 0; h < 24; h++) {
      const inH = list.filter((c) => new Date(c.checkedAt).getHours() === h)
      if (!inH.length) continue
      const so = inH.filter((c) => c.status === 'UP').length
      hourly.push({ hour: h, checkCount: inH.length, successCount: so, failureCount: inH.length - so, averageResponseTime: Math.round(inH.reduce((a, c) => a + (c.responseTime || 0), 0) / inH.length * 100) / 100, availability: Math.round(so / inH.length * 10000) / 100 })
    }
    const fails = list.length - ok.length
    const avail = list.length ? Math.round(ok.length / list.length * 10000) / 100 : 0
    const tick = Math.floor(now() / 5000)
    const wave = (k, base, amp) => Math.round((base + amp * Math.sin(tick / k) + Math.random() * amp / 2) * 10) / 10
    return {
      overallAvailability: avail, averageResponseTime: rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length * 100) / 100 : 0,
      maxResponseTime: rts.length ? Math.max(...rts) : 0, minResponseTime: rts.length ? Math.min(...rts) : 0,
      totalChecks: list.length, successfulChecks: ok.length, failedChecks: fails, successRate: avail,
      componentMetrics: COMPONENTS.map((c) => componentMetrics(c, list)).filter((m) => m.totalChecks > 0),
      timeBasedMetrics: slots, statusDistribution: dist, hourlyTrends: hourly,
      averageUptime: avail, averageDowntime: Math.round((100 - avail) * 100) / 100,
      mtbf: fails ? Math.round((days * 24 * 60) / fails * 10) / 10 : days * 24 * 60, mttr: fails ? Math.round((5 + Math.random() * 3) * 10) / 10 : 0,
      calculatedAt: ldt(now()), periodStart: ldt(from), periodEnd: ldt(now()),
      calculatedAtAsDate: jdate(now()), periodStartAsDate: jdate(from), periodEndAsDate: jdate(now()),
      cpu: wave(3, 38, 14), memory: wave(7, 61, 9), disk: wave(40, 47, 2)
    }
  }
  function pagedSystemHealth(pageNo, size, groupBy) {
    const latest = latestChecks()
    const sh = systemHealth(latest)
    const p = page(latest, pageNo, size)
    const groups = { __map: true }
    if (groupBy === 'status') {
      ;['UP', 'DOWN', 'UNKNOWN'].forEach((s) => {
        const g = latest.filter((c) => c.status === s)
        if (!g.length) return
        groups[s] = { groupName: s, totalCount: g.length, healthyCount: s === 'UP' ? g.length : 0, unhealthyCount: s === 'UP' ? 0 : g.length, groupStatus: hsEnum(s), groupStatusDescription: HS[s] }
      })
    } else {
      latest.forEach((c) => {
        const recent = db.checks.filter((x) => x.component === c.component).slice(-20)
        const h = recent.filter((x) => x.status === 'UP').length
        const st = c.status
        groups[c.component] = { groupName: c.component, totalCount: recent.length, healthyCount: h, unhealthyCount: recent.length - h, groupStatus: hsEnum(st), groupStatusDescription: HS[st] }
      })
    }
    return Object.assign(sh, {
      components: p.content.map(checkResp),
      pagination: { pageNumber: p.number, pageSize: p.size, totalElements: p.totalElements, totalPages: p.totalPages, hasNext: p.hasNext, hasPrevious: p.hasPrevious, nextPage: p.hasNext ? p.number + 1 : null, previousPage: p.hasPrevious ? p.number - 1 : null, numberOfElements: p.numberOfElements },
      componentGroups: groups
    })
  }

  function toJson(v) {
    if (v === null || v === undefined) return v === undefined ? undefined : null
    if (Array.isArray(v)) return v.map(toJson)
    if (typeof v === 'object') {
      if (v.__enum !== undefined) return v.code !== undefined ? v.code : v.__enum
      if (v.__date !== undefined) return v.__date
      const o = {}
      Object.keys(v).forEach((k) => { if (k.startsWith('__')) return; const x = toJson(v[k]); if (x !== undefined) o[k] = x })
      if (v.__page) { o.pageable = { pageNumber: v.number, pageSize: v.size }; delete o.hasNext; delete o.hasPrevious; delete o.hasContent }
      return o
    }
    return v
  }
  const apiOk = (data, message) => ({ json: { success: true, message: message || '요청이 성공적으로 처리되었습니다.', data: toJson(data), timestamp: ldt(now()) } })
  const apiErr = (status, message) => ({ status, json: { success: false, message, data: null, timestamp: ldt(now()) } })

  function validate(rules, body) {
    const errors = {}
    const add = (f, m) => { (errors[f] = errors[f] || []).push(m) }
    Object.entries(rules).forEach(([f, rs]) => {
      const v = body[f] === undefined || body[f] === null ? '' : String(body[f])
      rs.forEach((r) => {
        if (r.notBlank && !v.trim()) add(f, r.notBlank)
        else if (v && r.size && (v.length < r.size[0] || v.length > r.size[1])) add(f, r.size[2])
        else if (v && r.pattern && !r.pattern.test(v)) add(f, r.pattern2)
        else if (v && r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) add(f, r.email)
      })
    })
    return errors
  }
  const bindingResult = (errors) => ({ __bindingResult: true, errors, global: [] })
  const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+=\-\[\]\\;'`~])[A-Za-z\d!@#$%^&*(),.?":{}|<>_+=\-\[\]\\;'`~]{8,}$/

  function profileModel(m) {
    return { member: memberResp(m), createDateFormatted: jdate(m.createDate), lastLoginAtFormatted: jdate(m.lastLoginAt), approvedAtFormatted: jdate(m.approvedAt), passwordChangedAtFormatted: jdate(m.passwordChangedAt) }
  }
  function passwordStatus(m) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const cnt = (m.pwChanges || []).filter((t) => t >= today.getTime()).length
    return { isPasswordChangeRequired: !m.passwordChangedAt || m.passwordChangedAt < now() - 30 * DAY, isPasswordChangeRecommended: !m.passwordChangedAt || m.passwordChangedAt < now() - 14 * DAY, todayChangeCount: cnt }
  }
  const view = (v, model) => ({ view: v, model: model || {} })
  const redirect = (to, flash) => ({ redirect: to, flash: flash || null })
  const forbidden = () => ({ status: 403, view: 'member/error', model: { pageTitle: '접근 거부', error: '접근 권한이 없습니다.', errorCode: 'ACCESS_DENIED' } })

  function corpFilter(list, f) {
    const has = (x) => x !== undefined && x !== null && String(x).trim() !== ''
    return list.filter((c) => {
      if (has(f.bizNm) && !c.bizNm.includes(f.bizNm.trim())) return false
      if (has(f.bizNo) && !c.bizNo.includes(f.bizNo.replace(/-/g, '').trim())) return false
      if (has(f.corpRegNo) && !(c.corpRegNo || '').includes(f.corpRegNo.replace(/-/g, '').trim())) return false
      if (has(f.sellerId) && !(c.sellerId || '').includes(f.sellerId.trim())) return false
      if (has(f.siNm) && !c.siNm.includes(f.siNm.trim())) return false
      if (has(f.sggNm) && !c.sggNm.includes(f.sggNm.trim())) return false
      return true
    })
  }
  function bodyGet(b, k) {
    if (!b) return undefined
    if (b instanceof FormData) { const v = b.get(k); return v === null ? undefined : v }
    return b[k]
  }
  function bodyObj(b) {
    if (!b) return {}
    if (b instanceof FormData) { const o = {}; b.forEach((v, k) => { if (!(k in o)) o[k] = v }); return o }
    return b
  }

  const routes = []
  const on = (method, pattern, fn, opts = {}) => {
    const keys = []
    const re = new RegExp('^' + pattern.replace(/\{(\w+)\}/g, (m, k) => { keys.push(k); return '([^/]+)' }) + '/?$')
    routes.push({ method, re, keys, fn, opts })
  }

  on('GET', '/', () => {
    const rs = regionStats()
    return view('main/index', { stats: dashboardStats(), recentActivities: recentActivities(12), topRegionStat: rs[0] || {}, regionStats: rs.slice(0, 5) })
  })
  on('GET', '/main', () => redirect('/'))
  on('GET', '/api/stats', () => apiOk(dashboardStats(), '통계 정보를 성공적으로 조회했습니다.'))

  on('GET', '/members/login', (req) => (req.me ? redirect('/') : view('member/login')))
  on('POST', '/members/login', (req) => {
    const username = String(bodyGet(req.body, 'username') || '').trim()
    const password = String(bodyGet(req.body, 'password') || '')
    if (!username || !password) return redirect('/members/login', { errorMessage: '아이디와 비밀번호를 입력해주세요.', error: '아이디와 비밀번호를 입력해주세요.' })
    let m = db.members.find((x) => x.username === username)
    if (!m) {
      const id = ++db.seq.member
      m = { id, username, password, nickname: username, email: username.includes('@') ? username : username + '@demo.antock.kr', role: 'ADMIN', status: 'APPROVED', apiKey: 'ak_' + Array.from({ length: 32 }, () => '0123456789abcdef'[rnd(0, 15)]).join(''), createDate: now(), lastLoginAt: null, approvedAt: now(), passwordChangedAt: now(), loginFailCount: 0, pwChanges: [] }
      db.members.push(m)
    } else if (m.status === 'WITHDRAWN' || m.status === 'REJECTED' || m.status === 'PENDING' || m.status === 'SUSPENDED') {
      m.status = 'APPROVED'
      if (!m.approvedAt) m.approvedAt = now()
    }
    m.loginFailCount = 0
    m.lastLoginAt = now()
    setSession({ memberId: m.id, loginPassword: password, at: now() })
    save()
    return redirect('/', { successMessage: '로그인 되었습니다.' })
  })
  on('GET', '/members/logout', (req) => {
    setSession(null)
    return redirect('/members/login', { successMessage: '로그아웃 되었습니다.', message: '로그아웃 되었습니다.' })
  }, { auth: true })

  on('GET', '/members/join', () => view('member/join', { memberJoinRequest: { username: '', password: '', nickname: '', email: '' } }))
  on('POST', '/members/join', (req) => {
    const b = bodyObj(req.body)
    const r = { username: b.username || '', password: b.password || '', nickname: b.nickname || '', email: b.email || '' }
    const errors = validate({
      username: [{ notBlank: '사용자명은 필수입니다.', size: [4, 20, '사용자명은 4~20자 사이여야 합니다.'], pattern: /^[a-zA-Z0-9_]+$/, pattern2: '사용자명은 영문, 숫자, 언더스코어만 가능합니다.' }],
      password: [{ notBlank: '비밀번호는 필수입니다.', size: [6, 50, '비밀번호는 6~50자 사이여야 합니다.'], pattern: /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, pattern2: '비밀번호는 영문과 숫자를 포함해야 합니다.' }],
      nickname: [{ notBlank: '닉네임은 필수입니다.', size: [2, 20, '닉네임은 2~20자 사이여야 합니다.'] }],
      email: [{ notBlank: '이메일은 필수입니다.', email: '올바른 이메일 형식이 아닙니다.' }]
    }, r)
    if (Object.keys(errors).length) return view('member/join', { memberJoinRequest: r, 'org.springframework.validation.BindingResult.memberJoinRequest': bindingResult(errors) })
    if (db.members.some((m) => m.username === r.username)) return view('member/join', { memberJoinRequest: r, errorMessage: '이미 사용중인 사용자명입니다.' })
    if (db.members.some((m) => m.email === r.email)) return view('member/join', { memberJoinRequest: r, errorMessage: '이미 사용중인 이메일입니다.' })
    db.members.push({ id: ++db.seq.member, username: r.username, password: r.password, nickname: r.nickname, email: r.email, role: 'USER', status: 'PENDING', apiKey: null, createDate: now(), lastLoginAt: null, approvedAt: null, passwordChangedAt: now(), loginFailCount: 0, pwChanges: [] })
    save()
    return redirect('/members/login', { successMessage: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.', message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.' })
  })
  on('GET', '/members/check-username', (req) => ({ json: { available: !db.members.some((m) => m.username === (req.params.get('username') || '')) } }))

  on('GET', '/members/profile', (req) => {
    const m = req.me
    return view('member/profile', Object.assign(profileModel(m), { memberUpdateRequest: { nickname: m.nickname, email: m.email } }))
  }, { auth: true })
  on('POST', '/members/profile', (req) => {
    const m = req.me
    const b = bodyObj(req.body)
    const r = { nickname: b.nickname || '', email: b.email || '' }
    const errors = validate({ nickname: [{ notBlank: '닉네임은 필수입니다.', size: [2, 20, '닉네임은 2~20자 사이여야 합니다.'] }], email: [{ notBlank: '이메일은 필수입니다.', email: '올바른 이메일 형식이 아닙니다.' }] }, r)
    if (Object.keys(errors).length) return view('member/profile', Object.assign(profileModel(m), { memberUpdateRequest: r, 'org.springframework.validation.BindingResult.memberUpdateRequest': bindingResult(errors) }))
    if (db.members.some((x) => x.email === r.email && x.id !== m.id)) return view('member/profile', Object.assign(profileModel(m), { memberUpdateRequest: r, errorMessage: '이미 사용중인 이메일입니다.' }))
    m.nickname = r.nickname; m.email = r.email
    save()
    return redirect('/members/profile', { successMessage: '프로필이 성공적으로 수정되었습니다.' })
  }, { auth: true })
  on('POST', '/members/withdraw', (req) => {
    const m = req.me
    if (m.role === 'ADMIN') return redirect('/members/profile', { errorMessage: '관리자는 본인 탈퇴를 할 수 없습니다. 다른 관리자에게 문의하세요.' })
    if (m.status === 'WITHDRAWN') return redirect('/members/profile', { errorMessage: '이미 탈퇴한 회원입니다.' })
    m.status = 'WITHDRAWN'
    save(); setSession(null)
    return redirect('/members/login', { successMessage: '회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.', message: '회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.' })
  }, { auth: true })

  on('GET', '/members/password/change', (req) => view('member/password-change', Object.assign({ passwordChangeRequest: { oldPassword: '', newPassword: '', newPasswordConfirm: '' } }, passwordStatus(req.me))), { auth: true })
  on('POST', '/members/password/change', (req) => {
    const m = req.me
    const b = bodyObj(req.body)
    const r = { oldPassword: b.oldPassword || '', newPassword: b.newPassword || '', newPasswordConfirm: b.newPasswordConfirm || '' }
    const ps = passwordStatus(m)
    const errors = validate({
      oldPassword: [{ notBlank: '공백일 수 없습니다' }],
      newPassword: [{ notBlank: '공백일 수 없습니다', size: [8, 20, '크기가 8에서 20 사이여야 합니다'], pattern: STRONG_PW, pattern2: '"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\\":{}|<>_+=\\-\\[\\]\\\\;\'`~])[A-Za-z\\d!@#$%^&*(),.?\\":{}|<>_+=\\-\\[\\]\\\\;\'`~]{8,}$"와 일치해야 합니다' }],
      newPasswordConfirm: [{ notBlank: '공백일 수 없습니다' }]
    }, r)
    const base = Object.assign({ passwordChangeRequest: r }, ps)
    if (Object.keys(errors).length) return view('member/password-change', Object.assign(base, { 'org.springframework.validation.BindingResult.passwordChangeRequest': bindingResult(errors) }))
    if (ps.todayChangeCount >= 3) return view('member/password-change', Object.assign(base, { errorMessage: '오늘은 더 이상 비밀번호를 변경할 수 없습니다. (일일 3회 제한)' }))
    const s = session()
    if (r.oldPassword !== m.password && r.oldPassword !== (s && s.loginPassword)) return view('member/password-change', Object.assign(base, { errorMessage: '현재 비밀번호가 일치하지 않습니다.' }))
    if (r.newPassword !== r.newPasswordConfirm) return view('member/password-change', Object.assign(base, { errorMessage: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.' }))
    if (r.newPassword === m.password || r.newPassword === r.oldPassword) return view('member/password-change', Object.assign(base, { errorMessage: '새 비밀번호는 현재 비밀번호와 다르게 설정해주세요.' }))
    m.password = r.newPassword
    m.passwordChangedAt = now()
    m.pwChanges = (m.pwChanges || []).concat([now()])
    setSession(Object.assign(s || {}, { memberId: m.id, loginPassword: r.newPassword }))
    save()
    return redirect('/members/profile', { successMessage: '비밀번호가 성공적으로 변경되었습니다.' })
  }, { auth: true })

  on('GET', '/members/password/find', () => view('member/password-find', { passwordFindRequest: { username: '', email: '' } }))
  on('POST', '/members/password/find', (req) => {
    const b = bodyObj(req.body)
    const r = { username: b.username || '', email: b.email || '' }
    const errors = validate({ username: [{ notBlank: '사용자명은 필수입니다.', size: [0, 50, '사용자명은 50자를 초과할 수 없습니다.'] }], email: [{ notBlank: '이메일은 필수입니다.', email: '올바른 이메일 형식이 아닙니다.', size: [0, 100, '이메일은 100자를 초과할 수 없습니다.'] }] }, r)
    if (Object.keys(errors).length) return view('member/password-find', { passwordFindRequest: r, 'org.springframework.validation.BindingResult.passwordFindRequest': bindingResult(errors) })
    const m = db.members.find((x) => x.username === r.username && x.email === r.email)
    if (!m) return redirect('/members/password/find', { errorMessage: '회원을 찾을 수 없습니다.' })
    if (m.status !== 'APPROVED') return redirect('/members/password/find', { errorMessage: '비활성화된 회원입니다.' })
    const token = (crypto.randomUUID ? crypto.randomUUID() : String(now())).replace(/-/g, '')
    db.resetTokens[token] = { memberId: m.id, expires: now() + 30 * 60000, used: false }
    save()
    return redirect('/members/password/reset?token=' + token, { successMessage: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' })
  })
  on('GET', '/members/password/find/success', () => view('member/password-find', { passwordFindRequest: { username: '', email: '' }, successMessage: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' }))
  const resetGet = (req, errKey) => {
    const token = req.params.get('token') || ''
    const t = db.resetTokens[token]
    if (!t || t.used || t.expires < now()) return view('member/password-reset-error', { [errKey]: '유효하지 않거나 만료된 링크입니다.', errorMessage: '유효하지 않거나 만료된 링크입니다.' })
    return view('member/password-reset', { token, passwordResetRequest: { token, newPassword: '', newPasswordConfirm: '' } })
  }
  on('GET', '/members/password/reset', (req) => resetGet(req, 'errorMessage'))
  on('GET', '/password/reset', (req) => resetGet(req, 'error'))
  const resetPost = (req) => {
    const b = bodyObj(req.body)
    const r = { token: b.token || '', newPassword: b.newPassword || '', newPasswordConfirm: b.newPasswordConfirm || b.confirmPassword || '' }
    const errors = validate({ token: [{ notBlank: '재설정 토큰은 필수입니다.' }], newPassword: [{ notBlank: '새 비밀번호는 필수입니다.', size: [8, 20, '비밀번호는 8~20자 사이여야 합니다.'], pattern: STRONG_PW, pattern2: '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.' }], newPasswordConfirm: [{ notBlank: '새 비밀번호 확인은 필수입니다.' }] }, r)
    if (Object.keys(errors).length) return view('member/password-reset', { token: r.token, passwordResetRequest: r, 'org.springframework.validation.BindingResult.passwordResetRequest': bindingResult(errors), error: Object.values(errors)[0][0] })
    const t = db.resetTokens[r.token]
    if (!t || t.used || t.expires < now()) return view('member/password-reset-error', { errorMessage: '비밀번호 재설정 토큰이 유효하지 않습니다.', error: '비밀번호 재설정 토큰이 유효하지 않습니다.' })
    if (r.newPassword !== r.newPasswordConfirm) return view('member/password-reset', { token: r.token, passwordResetRequest: r, error: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.' })
    const m = db.members.find((x) => x.id === t.memberId)
    m.password = r.newPassword; m.passwordChangedAt = now(); t.used = true
    save()
    return redirect('/members/login', { successMessage: '비밀번호가 성공적으로 재설정되었습니다.', message: '비밀번호가 성공적으로 재설정되었습니다.' })
  }
  on('POST', '/members/password/reset', resetPost)
  on('POST', '/password/reset', resetPost)

  on('GET', '/members/admin/list', (req) => {
    if (!isStaff(req.me)) return forbidden()
    const status = req.params.get('status') || null, role = req.params.get('role') || null
    const pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 20)
    const list = db.members.filter((m) => (!status || m.status === status) && (!role || m.role === role))
    const p = page(list, pageNo, size)
    const cnt = (s) => db.members.filter((m) => m.status === s).length
    const raw = p.content
    return view('member/admin/list', { memberViewList: raw.map(memberView), members: Object.assign(p, { content: raw.map(memberResp) }), pendingCount: cnt('PENDING'), approvedCount: cnt('APPROVED'), rejectedCount: cnt('REJECTED'), suspendedCount: cnt('SUSPENDED'), withdrawnCount: cnt('WITHDRAWN'), selectedStatus: status, selectedRole: role })
  }, { auth: true })
  on('GET', '/members/admin/pending', (req) => {
    if (!isStaff(req.me)) return view('member/error', { error: '접근 권한이 없습니다. 관리자 또는 매니저 권한이 필요합니다.', errorCode: 'ACCESS_DENIED' })
    const pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 20)
    const list = db.members.filter((m) => m.status === 'PENDING')
    const p = page(list, pageNo, size)
    return view('member/admin/pending', { pendingMemberViewList: p.content.map(memberView), pendingMembers: Object.assign(p, { content: p.content.map(memberResp) }), totalPendingCount: list.length })
  }, { auth: true })
  on('GET', '/members/admin/search', (req) => {
    const q = (req.params.get('q') || '').toLowerCase()
    return { json: db.members.filter((m) => m.username.toLowerCase().includes(q) || m.nickname.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)).map((m) => ({ id: m.id, name: m.nickname, username: m.username, email: m.email, status: m.status, role: m.role })) }
  }, { auth: true })
  const adminAction = (fn) => (req) => {
    if (!isStaff(req.me)) return forbidden()
    const target = db.members.find((m) => m.id === Number(req.vars.memberId))
    if (!target) return redirect('/members/admin/list', { errorMessage: '회원을 찾을 수 없습니다.' })
    const r = fn(target, req)
    save()
    return r
  }
  on('POST', '/members/admin/{memberId}/approve', adminAction((m, req) => {
    if (m.status === 'APPROVED') return redirect('/members/admin/list', { errorMessage: '유효하지 않은 회원 상태입니다.' })
    m.status = 'APPROVED'; m.approvedAt = now(); m.approvedBy = req.me.id
    if (!m.apiKey) m.apiKey = 'ak_' + Array.from({ length: 32 }, () => '0123456789abcdef'[rnd(0, 15)]).join('')
    return redirect('/members/admin/list', { successMessage: m.username + ' 회원이 승인되었습니다.' })
  }), { auth: true })
  on('POST', '/members/admin/{memberId}/reject', adminAction((m) => {
    if (m.status !== 'PENDING') return redirect('/members/admin/list', { errorMessage: '유효하지 않은 회원 상태입니다.' })
    m.status = 'REJECTED'
    return redirect('/members/admin/list', { successMessage: m.username + ' 회원이 거부되었습니다.' })
  }), { auth: true })
  on('POST', '/members/admin/{memberId}/reset-to-pending', adminAction((m) => {
    m.status = 'PENDING'; m.approvedAt = null
    return redirect('/members/admin/list', { successMessage: m.username + ' 회원이 승인 대기 상태로 변경되었습니다.' })
  }), { auth: true })
  on('POST', '/members/admin/{memberId}/suspend', adminAction((m, req) => {
    if (m.role === 'ADMIN') return redirect('/members/admin/list', { errorMessage: '관리자 계정은 정지할 수 없습니다.' })
    m.status = 'SUSPENDED'
    if (m.id === req.me.id) setSession(null)
    return redirect('/members/admin/list', { successMessage: m.username + ' 회원이 정지되었습니다.' })
  }), { auth: true })
  on('POST', '/members/admin/{memberId}/unlock', adminAction((m) => {
    m.loginFailCount = 0; m.status = 'APPROVED'
    return redirect('/members/admin/list', { successMessage: m.username + ' 회원의 계정 잠금이 해제되었습니다.' })
  }), { auth: true })
  on('POST', '/members/admin/{memberId}/delete', adminAction((m, req) => {
    if (m.id === req.me.id) return redirect('/members/admin/list', { errorMessage: '자기 자신의 계정은 삭제할 수 없습니다.' })
    if (m.role === 'ADMIN') return redirect('/members/admin/list', { errorMessage: '관리자 계정은 삭제할 수 없습니다.' })
    if (m.status === 'WITHDRAWN') return redirect('/members/admin/list', { errorMessage: '이미 탈퇴한 회원입니다.' })
    m.status = 'WITHDRAWN'
    return redirect('/members/admin/list', { successMessage: m.username + ' 회원이 탈퇴 처리되었습니다.' })
  }), { auth: true })
  on('POST', '/members/admin/{memberId}/role', adminAction((m, req) => {
    const role = req.params.get('role') || bodyGet(req.body, 'role')
    if (!ROLE[role]) return redirect('/members/admin/list', { errorMessage: '역할 변경에 실패했습니다: 역할은 null일 수 없습니다.' })
    if (m.role === 'ADMIN') return redirect('/members/admin/list', { errorMessage: '역할 변경에 실패했습니다: ADMIN 역할에서 다른 역할로 변경할 수 없습니다.' })
    m.role = role
    return redirect('/members/admin/list', { successMessage: '회원 역할이 변경되었습니다.' })
  }), { auth: true })
  on('POST', '/members/admin/approve/{memberId}', (req) => routeCall('POST', '/members/admin/' + req.vars.memberId + '/approve', req))
  on('POST', '/members/admin/reject/{memberId}', (req) => routeCall('POST', '/members/admin/' + req.vars.memberId + '/reject', req))

  function corpListModel(req, f, pageNo, size) {
    const list = corpFilter(db.corps, f).sort((a, b) => b.id - a.id)
    const p = page(list, pageNo, size)
    const staff = isStaff(req.me)
    const model = { corpList: Object.assign(p, { content: p.content.map(corpResp) }), form: f, isStaff: staff, currentUsername: req.me ? req.me.username : '', isAdmin: staff }
    if (staff) {
      const names = { __map: true }
      p.content.forEach((c) => { const m = db.members.find((x) => x.username === c.username); if (m) names[c.username] = m.nickname })
      model.registrantNames = names
    }
    return model
  }
  const formOf = (req) => ({ bizNm: req.params.get('bizNm') || '', bizNo: req.params.get('bizNo') || '', corpRegNo: req.params.get('corpRegNo') || '', siNm: req.params.get('siNm') || req.params.get('city') || '', sggNm: req.params.get('sggNm') || req.params.get('district') || '', sellerId: req.params.get('sellerId') || '' })
  on('GET', '/corp/list', (req) => view('corp/list', corpListModel(req, formOf(req), Number(req.params.get('page') || 0), Number(req.params.get('size') || 10))))
  on('GET', '/corp/search', (req) => {
    const f = formOf(req)
    const has = Object.values(f).some((v) => v && String(v).trim())
    const model = has ? corpListModel(req, f, Number(req.params.get('page') || 0), Number(req.params.get('size') || 10)) : { form: f, corpList: null, isAdmin: isStaff(req.me) }
    model.searchRequest = Object.assign({ city: f.siNm, district: f.sggNm }, f)
    model.cities = CITIES
    model.districts = f.siNm ? DISTRICTS.filter((d) => d.city === f.siNm).map((d) => d.value) : null
    if (has) {
      const l = corpFilter(db.corps, f)
      model.statistics = map({ totalCount: l.length, validCorpRegNoCount: l.filter(validReg).length, validRegionCdCount: l.filter(validRc).length })
    }
    return view('corp/search', model)
  })
  on('GET', '/corp/create', (req) => (isStaff(req.me) ? view('corp/form', { form: { id: null, sellerId: '', bizNm: '', bizNo: '', corpRegNo: '', regionCd: '', siNm: '', sggNm: '', description: '' } }) : (req.me ? forbidden() : redirect('/members/login'))))
  const corpFromBody = (b) => ({ sellerId: String(b.sellerId || '').trim(), bizNm: String(b.bizNm || '').trim(), bizNo: String(b.bizNo || '').replace(/-/g, '').trim(), corpRegNo: String(b.corpRegNo || '').replace(/-/g, '').trim(), regionCd: String(b.regionCd || '').trim(), siNm: String(b.siNm || '').trim(), sggNm: String(b.sggNm || '').trim(), description: String(b.description || '').trim() })
  on('POST', '/corp/create', (req) => {
    if (!isStaff(req.me)) return req.me ? forbidden() : redirect('/members/login')
    const c = corpFromBody(bodyObj(req.body))
    if (!c.bizNm || !c.bizNo || !c.siNm || !c.sggNm) return view('corp/form', { form: Object.assign({ id: null }, c) })
    if (db.corps.some((x) => x.bizNo === c.bizNo)) return redirect('/corp/list', { message: '이미 등록된 사업자번호입니다: ' + c.bizNo })
    const corp = Object.assign({ id: ++db.seq.corp, username: req.me.username, createDate: now(), modifyDate: now() }, c)
    db.corps.push(corp); corpHist('INSERT', corp); save()
    return redirect('/corp/list', { message: `'${corp.bizNm}' 법인이 등록되었습니다.` })
  })
  const canChange = (me, c) => !!me && (isStaff(me) || c.username === me.username)
  on('GET', '/corp/edit/{id}', (req) => {
    const c = db.corps.find((x) => x.id === Number(req.vars.id))
    if (!c) return redirect('/corp/list', { message: '법인 정보를 찾을 수 없습니다.' })
    if (!canChange(req.me, c)) return redirect('/corp/list', { message: '등록한 계정 또는 관리자만 수정할 수 있습니다.' })
    return view('corp/form', { form: { id: c.id, sellerId: c.sellerId, bizNm: c.bizNm, bizNo: c.bizNo, corpRegNo: c.corpRegNo, regionCd: c.regionCd, siNm: c.siNm, sggNm: c.sggNm, description: c.description } })
  })
  on('POST', '/corp/edit/{id}', (req) => {
    const c = db.corps.find((x) => x.id === Number(req.vars.id))
    if (!c) return redirect('/corp/list', { message: '법인 정보를 찾을 수 없습니다.' })
    if (!canChange(req.me, c)) return redirect('/corp/list', { message: '등록한 계정 또는 관리자만 수정할 수 있습니다.' })
    const n = corpFromBody(bodyObj(req.body))
    if (!n.bizNm || !n.bizNo || !n.siNm || !n.sggNm) return view('corp/form', { form: Object.assign({ id: c.id }, n) })
    Object.assign(c, n, { modifyDate: now() }); corpHist('UPDATE', c); save()
    return redirect('/corp/detail/' + c.id)
  })
  const recentDeleted = {}
  on('POST', '/corp/delete/{id}', (req) => {
    const c = db.corps.find((x) => x.id === Number(req.vars.id))
    const rd = recentDeleted[req.vars.id]
    if (!c && rd && now() - rd.at < 5000) return redirect('/corp/list', { message: `'${rd.name}' 법인이 삭제되었습니다.` })
    if (!c) return redirect('/corp/list', { message: '법인 정보를 찾을 수 없습니다.' })
    if (!canChange(req.me, c)) return redirect('/corp/list', { message: '등록한 계정 또는 관리자만 삭제할 수 있습니다.' })
    db.corps = db.corps.filter((x) => x !== c); corpHist('DELETE', c); save()
    recentDeleted[req.vars.id] = { at: now(), name: c.bizNm }
    return redirect('/corp/list', { message: `'${c.bizNm}' 법인이 삭제되었습니다.` })
  })
  on('GET', '/corp/modify/{id}', (req) => {
    const c = db.corps.find((x) => x.id === Number(req.vars.id))
    if (!c) return redirect('/corp/list', { message: '법인 정보를 찾을 수 없습니다.' })
    if (!canChange(req.me, c)) return redirect('/corp/list', { message: '등록한 계정 또는 관리자만 수정할 수 있습니다.' })
    return view('corp/modify', { corp: corpResp(c), isAdmin: isStaff(req.me) })
  })
  on('GET', '/corp/detail/{id}', (req) => {
    const c = db.corps.find((x) => x.id === Number(req.vars.id))
    if (!c) return redirect('/corp/search', { errorMessage: '법인 정보를 찾을 수 없습니다.' })
    const staff = isStaff(req.me)
    const r = corpResp(c)
    const model = { corp: r, isAdmin: staff, hasEditPermission: canChange(req.me, c), shownBizNo: staff ? r.formattedBizNo : maskLast(r.formattedBizNo), shownCorpRegNo: staff ? (c.corpRegNo || '') : maskLast(c.corpRegNo) }
    if (staff) { const m = db.members.find((x) => x.username === c.username); model.registrantName = m ? m.nickname : '' }
    return view('corp/detail', model)
  })
  on('GET', '/corp/districts/{city}', (req) => ({ json: DISTRICTS.filter((d) => d.city === decodeURIComponent(req.vars.city)).map((d) => d.value) }))
  on('POST', '/corp/search/reset', () => redirect('/corp/search', { message: '검색 조건이 초기화되었습니다.' }))
  on('GET', '/corp/export', (req) => {
    const list = corpFilter(db.corps, formOf(req))
    const csv = '﻿ID,법인명,사업자번호,법인등록번호,판매자ID,시/도,구/군,행정구역코드\n' + list.map((c) => [c.id, c.bizNm, c.bizNo, c.corpRegNo, c.sellerId, c.siNm, c.sggNm, c.regionCd].join(',')).join('\n')
    return { download: { name: '법인목록_' + ldt(now()).slice(0, 10) + '.csv', type: 'text/csv;charset=utf-8', data: csv } }
  })

  function saveCoseller(city, district, me) {
    if (!CITIES.includes(city)) return { error: 'Unknown city: ' + city }
    const dRec = DISTRICTS.find((d) => d.city === city && (d.value === district || d.name === district)) || DISTRICTS.find((d) => d.value === district || d.name === district)
    if (!dRec) return { error: 'Unknown district: ' + district }
    district = dRec.value
    if (dRec.city !== city) {
      db.csvHistory.push({ id: ++db.seq.csv, city, district, status: 'FAILED', recordCount: 0, timestamp: now() })
      db.coseller.push({ id: ++db.seq.coseller, username: me ? me.username : 'system', city, district, registeredAt: now(), success: false, result: 'CSV 파일 없음' })
      save()
      return { count: 0 }
    }
    const existing = db.corps.filter((c) => c.siNm === city && c.sggNm === district).length
    const n = existing > 0 ? rnd(1, 4) : rnd(6, 24)
    for (let i = 0; i < n; i++) {
      const c = { id: ++db.seq.corp, sellerId: `${REGION_CD[city]}${rnd(10, 99)}-${2020 + rnd(0, 6)}-${pad(rnd(1, 9999), 4)}`, bizNm: pick(NAME_C) + pick(NAME_A) + pick(NAME_B), bizNo: String(rnd(100, 899)) + pad(rnd(1, 99)) + pad(rnd(1, 99999), 5), corpRegNo: Math.random() > 0.15 ? String(rnd(110111, 285011)) + pad(rnd(1, 9999999), 7) : String(rnd(110111, 285011)) + '-' + pad(rnd(1, 99999), 5), regionCd: Math.random() > 0.1 ? REGION_CD[city] + pad(rnd(100, 890), 3) + '00000' : REGION_CD[city] + pad(rnd(100, 890), 3), siNm: city, sggNm: district, username: me ? me.username : 'system', description: `${district} CSV 수집 데이터`, createDate: now(), modifyDate: now() }
      db.corps.push(c); corpHist('INSERT', c)
    }
    db.csvHistory.push({ id: ++db.seq.csv, city, district, status: n > 0 ? 'SUCCESS' : 'FAILED', recordCount: n, timestamp: now() })
    db.coseller.push({ id: ++db.seq.coseller, username: me ? me.username : 'system', city, district, registeredAt: now(), success: n > 0, result: n > 0 ? n + '건 저장' : '신규 데이터 없음(중복)' })
    db.files.forEach((f) => { if (f.originalFileName === `${city}_${district}.csv`) { const ct = makeFileContent('csv', f.originalFileName, db); f.content = ct.data; f.fileSize = ct.size; f.lastModifiedTime = now() } })
    save()
    return { count: n }
  }
  const parseRegionBody = (req) => { const b = bodyObj(req.body); return { city: String(b.city || '').trim(), district: String(b.district || '').trim() } }
  on('POST', '/coseller/save', (req) => {
    if (!isStaff(req.me)) return apiErr(403, '접근 권한이 없습니다.')
    const { city, district } = parseRegionBody(req)
    const r = saveCoseller(city, district, req.me)
    if (r.error) return apiErr(400, '데이터 저장에 실패했습니다: ' + r.error)
    return apiOk(r.count, '데이터 저장이 완료되었습니다.')
  })
  on('POST', '/coseller/save-simple', (req) => {
    if (!isStaff(req.me)) return apiErr(403, '접근 권한이 없습니다.')
    const { city, district } = parseRegionBody(req)
    const r = saveCoseller(city, district, req.me)
    if (r.error) return apiErr(400, '데이터 저장에 실패했습니다: ' + r.error)
    return apiOk(r.count, r.count > 0 ? `데이터 수집이 완료되었습니다. ${r.count}건이 저장되었습니다.` : '해당 지역의 CSV 파일을 찾을 수 없거나 데이터가 없습니다.')
  })
  on('GET', '/coseller/manual', (req) => {
    const cities = CITIES.map((c) => ({ __enum: c, value: c }))
    const districts = DISTRICTS.map((d) => ({ __enum: d.name, value: d.value, city: d.city }))
    const histories = db.coseller.slice().sort((a, b) => b.registeredAt - a.registeredAt).slice(0, 20).map((h) => ({ username: h.username, city: h.city, district: h.district, registeredAt: ldt(h.registeredAt), success: h.success, result: h.result }))
    return view('coseller/manual', { cities, districts, histories })
  })

  on('GET', '/region/status', (req) => {
    const city = req.params.get('city') || req.params.get('siNm') || null, district = req.params.get('district') || req.params.get('sggNm') || null
    const pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 20)
    const all = regionStats(city, district)
    const p = page(all, pageNo, size)
    const totalCorps = all.reduce((a, r) => a + r.totalCount, 0)
    return view('region/status', { regionStats: p.content, currentPage: p.number, totalPages: p.totalPages, totalElements: p.totalElements, hasNext: p.hasNext, hasPrevious: p.hasPrevious, isFirst: p.first, isLast: p.last, size, city, district, cities: [...new Set(db.corps.map((c) => c.siNm))].sort(), districts: city ? [...new Set(db.corps.filter((c) => c.siNm === city).map((c) => c.sggNm))].sort() : [], totalRegions: all.length, totalCorps, averageCorpsPerRegion: all.length ? totalCorps / all.length : 0, topRegions: Math.ceil(all.length * 0.1) })
  })
  on('GET', '/region/detail', (req) => {
    let city = req.params.get('city') || req.params.get('siNm') || null, district = req.params.get('district') || req.params.get('sggNm') || null
    if (city !== null && !city.trim()) city = null
    if (district !== null && !district.trim()) district = null
    const pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 20)
    const all = regionStats(city, district)
    const p = page(all, pageNo, size)
    return view('region/DashStatus', { regionStats: p.content, currentPage: p.number, totalPages: p.totalPages, totalElements: p.totalElements, hasNext: p.hasNext, hasPrevious: p.hasPrevious, isFirst: p.first, isLast: p.last, size, city, district, cities: [...new Set(db.corps.map((c) => c.siNm))].sort(), districts: city ? [...new Set(db.corps.filter((c) => c.siNm === city).map((c) => c.sggNm))].sort() : [] })
  })
  on('GET', '/api/v1/region-stats', () => apiOk(regionStats()))

  const fileResp = (f) => ({ id: f.id, originalFileName: f.originalFileName, storedFileName: f.storedFileName, fileSize: f.fileSize, contentType: f.contentType, uploadTime: ldt(f.uploadTime), lastModifiedTime: ldt(f.lastModifiedTime), description: f.description, downloadUrl: null, fileSizeInMB: Math.round(f.fileSize / 1048576 * 100) / 100, uploadTimeAsDate: jdate(f.uploadTime), lastModifiedTimeAsDate: jdate(f.lastModifiedTime) })
  on('GET', '/web/files', (req) => {
    const kw = req.params.get('keyword')
    const list = db.files.slice().sort((a, b) => b.uploadTime - a.uploadTime).filter((f) => !kw || !kw.trim() || f.originalFileName.toLowerCase().includes(kw.trim().toLowerCase()) || (f.description || '').includes(kw.trim()))
    const model = { files: list.map(fileResp) }
    if (kw !== null) model.keyword = kw
    return view('file/fileList', model)
  })
  on('GET', '/web/files/upload', () => view('file/uploadForm'))
  on('POST', '/web/files/upload', async (req) => {
    if (!req.me) return redirect('/members/login', { error: '로그인 후 이용해 주세요.', errorMessage: '로그인 후 이용해 주세요.' })
    const file = bodyGet(req.body, 'file')
    const description = bodyGet(req.body, 'description') || ''
    if (!file || typeof file === 'string' || !file.name) return redirect('/web/files', { error: '파일 업로드 실패: 업로드할 파일이 비어있습니다.' })
    if (file.size > 3 * 1048576) return redirect('/web/files', { error: '파일 업로드 실패: 데모 환경에서는 3MB 이하 파일만 업로드할 수 있습니다.' })
    const buf = await file.arrayBuffer()
    let bin = ''
    const bytes = new Uint8Array(buf)
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
    const id = ++db.seq.file
    db.files.push({ id, originalFileName: file.name, storedFileName: (crypto.randomUUID ? crypto.randomUUID() : 'f' + id) + '_' + file.name, fileSize: file.size, contentType: file.type || 'application/octet-stream', uploadTime: now(), lastModifiedTime: now(), description, content: btoa(bin), encoding: 'base64', uploaderName: req.me.username })
    save()
    return redirect('/web/files', { message: '파일 업로드 성공!' })
  })
  on('GET', '/web/files/{id}', (req) => {
    const f = db.files.find((x) => x.id === Number(req.vars.id))
    return f ? view('file/fileDetails', { file: fileResp(f) }) : view('file/fileDetails', { error: '파일 상세 정보를 불러오는데 실패했습니다: 파일을 찾을 수 없습니다. ID: ' + req.vars.id })
  })
  on('GET', '/web/files/download/{id}', (req) => {
    const f = db.files.find((x) => x.id === Number(req.vars.id))
    if (!f) return { status: 500, text: '' }
    return { download: { name: f.originalFileName, type: f.contentType, data: f.content, encoding: f.encoding } }
  })
  on('GET', '/web/files/edit/{id}', (req) => {
    const f = db.files.find((x) => x.id === Number(req.vars.id))
    return f ? view('file/editFile', { file: fileResp(f) }) : redirect('/web/files')
  })
  on('POST', '/web/files/update/{id}', (req) => {
    const f = db.files.find((x) => x.id === Number(req.vars.id))
    if (!f) return redirect('/web/files', { error: '파일 정보 업데이트 실패: 파일을 찾을 수 없습니다.' })
    f.description = String(bodyGet(req.body, 'description') || '')
    f.lastModifiedTime = now()
    save()
    return redirect('/web/files', { message: '파일 정보 업데이트 성공!' })
  })
  on('POST', '/web/files/delete/{id}', (req) => {
    const f = db.files.find((x) => x.id === Number(req.vars.id))
    if (!f) return redirect('/web/files', { error: '파일 삭제 실패: 파일을 찾을 수 없습니다.' })
    db.files = db.files.filter((x) => x !== f); save()
    return redirect('/web/files', { message: '파일 삭제 성공!' })
  })
  on('POST', '/web/files/bulk-delete', (req) => {
    const ids = req.body instanceof FormData ? req.body.getAll('fileIds').map(Number) : []
    db.files = db.files.filter((f) => !ids.includes(f.id)); save()
    return redirect('/web/files', { message: ids.length + '개 파일 삭제 성공!' })
  })
  on('GET', '/api/v1/files/template', () => ({ download: { name: 'corp_template.csv', type: 'text/csv;charset=utf-8', data: '﻿판매자ID,상호,사업자번호,법인등록번호,행정구역코드,시도,시군구\n2026-전남여수-0001,(주)예시상사,1234567890,2001110012345,4613000000,전라남도,여수시\n' } }))
  on('GET', '/api/v1/files', () => apiOk(db.files.map(fileResp)))

  const healthComponentsParam = (req) => {
    const fromQ = req.params.getAll('components')
    const fromB = req.body instanceof FormData ? req.body.getAll('components') : []
    return [].concat(fromQ, fromB).flatMap((s) => String(s).split(',')).map((s) => s.trim()).filter(Boolean)
  }
  on('GET', '/health', (req) => {
    let pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 10)
    let groupBy = req.params.get('groupBy') || 'component'
    if (pageNo < 0) pageNo = 0
    if (size <= 0 || size > 100) size = 10
    if (groupBy !== 'component' && groupBy !== 'status') groupBy = 'component'
    const ps = pagedSystemHealth(pageNo, size, groupBy)
    const recent = db.checks.slice(-10).reverse().map(checkResp)
    return view('health/dashboard', { systemHealth: ps, pagination: ps.pagination, componentGroups: ps.componentGroups, currentPage: pageNo, currentSize: size, currentGroupBy: groupBy, recentChecks: recent })
  })
  on('GET', '/health/component', (req) => {
    const pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 20)
    const all = db.checks.slice().reverse()
    const p = page(all, pageNo, size)
    const model = { components: COMPONENTS, healthChecks: Object.assign(p, { content: p.content.map(checkResp) }), currentPage: p.number, totalPages: p.totalPages, totalElements: p.totalElements, size, component: 'all' }
    latestChecks().forEach((c) => { model[c.component + 'Status'] = checkResp(c) })
    return view('health/component', model)
  })
  on('GET', '/health/component/{component}', (req) => {
    const comp = decodeURIComponent(req.vars.component)
    const pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 20)
    if (!COMPONENTS.includes(comp)) return view('health/error', { error: '컴포넌트 헬스 상태를 조회할 수 없습니다: 지원하지 않는 컴포넌트입니다: ' + comp })
    const p = page(db.checks.filter((c) => c.component === comp).reverse(), pageNo, size)
    return view('health/component', { components: COMPONENTS, component: comp, healthChecks: Object.assign(p, { content: p.content.map(checkResp) }), currentPage: p.number, totalPages: p.totalPages, totalElements: p.totalElements, size })
  })
  on('GET', '/health/history', (req) => {
    const comp = req.params.get('component') || null, status = req.params.get('status') || null
    const fromS = req.params.get('fromDate'), toS = req.params.get('toDate')
    const from = fromS ? new Date(fromS).getTime() : now() - DAY, to = toS ? new Date(toS).getTime() : now()
    const pageNo = Number(req.params.get('page') || 0), size = Number(req.params.get('size') || 20)
    const list = db.checks.filter((c) => c.checkedAt >= from && c.checkedAt <= to && (!comp || c.component === comp) && (!status || c.status === status)).reverse()
    const p = page(list, pageNo, size)
    const ok = list.filter((c) => c.status === 'UP').length
    return view('health/history', { healthChecks: Object.assign(p, { content: p.content.map(checkResp) }), fromDate: fromS ? ldt(from) : null, toDate: toS ? ldt(to) : null, component: comp, status, currentPage: p.number, totalPages: p.totalPages, totalElements: p.totalElements, totalChecks: list.length, successfulChecks: ok, failedChecks: list.length - ok, successRate: list.length ? ok / list.length * 100 : 0, availableComponents: COMPONENTS })
  })
  const doCheck = (req) => {
    const made = performChecks(healthComponentsParam(req), 'manual')
    const sh = systemHealth(made)
    return view('health/result', resultModel(sh, made, '헬스 체크가 완료되었습니다.'))
  }
  function resultModel(sh, made, message) {
    const start = made.length ? made[0].checkedAt : now()
    return {
      systemHealth: sh, message,
      checkResults: made.map((c) => ({ component: c.component, status: c.status, healthy: c.status === 'UP', message: c.message, responseTime: c.responseTime, checkTime: ldt(c.checkedAt), details: JSON.stringify(c.details || {}) })),
      overallStatus: { healthy: sh.healthy, status: sh.overallStatus.code }, totalComponents: sh.totalComponents, healthyComponents: sh.healthyComponents, unhealthyComponents: sh.unhealthyComponents,
      checkStartTime: ldt(start), checkEndTime: ldt(start + made.reduce((a, c) => Math.max(a, c.responseTime || 0), 0)), totalDuration: made.reduce((a, c) => Math.max(a, c.responseTime || 0), 0)
    }
  }
  on('GET', '/health/check', doCheck)
  on('POST', '/health/check', doCheck)
  on('GET', '/health/public/check', () => {
    const latest = latestChecks()
    return view('health/result', resultModel(systemHealth(latest), latest, '헬스 체크 데이터를 조회했습니다.'))
  })
  on('GET', '/health/status', () => {
    const sh = systemHealth(latestChecks())
    const mt = metrics(1, true)
    mt.componentMetrics = mt.componentMetrics.slice(0, 5)
    return view('health/status', { systemHealth: sh, metrics: mt })
  })
  on('POST', '/health/cleanup', () => {
    const before = db.checks.length
    db.checks = db.checks.filter((c) => c.checkedAt >= now() - 3 * DAY)
    save()
    const latest = latestChecks()
    return view('health/result', Object.assign(resultModel(systemHealth(latest), latest, '만료된 헬스 체크 데이터가 정리되었습니다.'), { cleanedCount: before - db.checks.length }))
  })
  on('GET', '/health/metrics', (req) => { const d = Number(req.params.get('days') || 7); return view('health/metrics', { metrics: metrics(d), days: d }) })
  on('GET', '/health/metrics/component/{component}', (req) => {
    const d = Number(req.params.get('days') || 7)
    const comp = decodeURIComponent(req.vars.component)
    return view('health/component-metrics', { metrics: componentMetrics(comp, db.checks.filter((c) => c.checkedAt >= now() - d * DAY)), component: comp, days: d })
  })
  on('GET', '/health/component-metrics', (req) => {
    const d = Number(req.params.get('days') || 7)
    const comp = req.params.get('component') || 'database'
    return view('health/component-metrics', { metrics: componentMetrics(comp, db.checks.filter((c) => c.checkedAt >= now() - d * DAY)), component: comp, days: d })
  })
  on('GET', '/health/metrics/realtime', () => {
    const mt = metrics(1, true)
    return view('health/realtime-metrics', { metrics: mt, components: mt.componentMetrics, activeComponents: mt.componentMetrics.length })
  })
  on('GET', '/health/realtime-metrics', () => redirect('/health/metrics/realtime'))
  on('GET', '/health/error', (req) => view('health/error', { error: req.params.get('error') || '알 수 없는 오류가 발생했습니다.' }))
  on('GET', '/health/result', (req) => {
    const latest = latestChecks()
    return view('health/result', resultModel(systemHealth(latest), latest, req.params.get('message') || '헬스 체크가 완료되었습니다.'))
  })
  on('GET', '/health/api/metrics/realtime', () => ({ json: toJson(metrics(1, true)) }))
  on('GET', '/health/api/paged', (req) => ({ json: toJson(pagedSystemHealth(Number(req.params.get('page') || 0), Number(req.params.get('size') || 10), req.params.get('groupBy') || 'component')) }))

  on('GET', '/api/v1/health/system', () => apiOk(systemHealth(latestChecks()), '시스템 헬스 상태를 조회했습니다.'))
  on('POST', '/api/v1/health/check', (req) => { const made = performChecks(healthComponentsParam(req), 'manual'); return apiOk(systemHealth(made), '헬스 체크가 완료되었습니다.') })
  on('GET', '/api/v1/health/component/{component}', (req) => {
    const comp = decodeURIComponent(req.vars.component)
    const list = db.checks.filter((c) => c.component === comp).reverse()
    if (!list.length) return apiErr(404, '컴포넌트를 찾을 수 없습니다: ' + comp)
    const p = page(list, Number(req.params.get('page') || 0), Number(req.params.get('size') || 20))
    const data = Object.assign(p, { content: p.content.map(checkResp) })
    const latest = checkResp(list[0])
    return apiOk(Object.assign(data, { healthy: latest.healthy, responseTime: latest.responseTime, status: latest.status }), '컴포넌트 헬스 상태를 조회했습니다.')
  })
  on('GET', '/api/v1/health/history', (req) => {
    const comp = req.params.get('component'), status = req.params.get('status')
    const fromS = req.params.get('fromDate') || req.params.get('from'), toS = req.params.get('toDate') || req.params.get('to')
    const from = fromS ? new Date(fromS).getTime() : now() - DAY, to = toS ? new Date(toS).getTime() : now()
    const list = db.checks.filter((c) => c.checkedAt >= from && c.checkedAt <= to && (!comp || c.component === comp) && (!status || c.status === status)).reverse()
    const p = page(list, Number(req.params.get('page') || 0), Number(req.params.get('size') || 20))
    return apiOk(Object.assign(p, { content: p.content.map(checkResp) }), '헬스 체크 이력을 조회했습니다.')
  })
  on('GET', '/api/v1/health/status', () => { const sh = systemHealth(latestChecks()); return { json: { status: sh.overallStatus.code, healthy: sh.healthy, totalComponents: sh.totalComponents, healthyComponents: sh.healthyComponents, timestamp: ldt(now()) } } })
  on('POST', '/api/v1/health/cleanup', () => { const b = db.checks.length; db.checks = db.checks.filter((c) => c.checkedAt >= now() - 3 * DAY); save(); return apiOk(map({ deletedCount: b - db.checks.length }), '만료된 데이터가 정리되었습니다.') })
  on('GET', '/api/v1/health/metrics', (req) => apiOk(metrics(Number(req.params.get('days') || 7)), '헬스 메트릭을 조회했습니다.'))
  on('GET', '/api/v1/health/metrics/component/{component}', (req) => apiOk(componentMetrics(decodeURIComponent(req.vars.component), db.checks.filter((c) => c.checkedAt >= now() - Number(req.params.get('days') || 7) * DAY)), '컴포넌트 메트릭을 조회했습니다.'))
  on('GET', '/api/v1/health/metrics/realtime', () => apiOk(metrics(1, true), '실시간 메트릭을 조회했습니다.'))
  on('GET', '/api/v1/health/system/paged', (req) => apiOk(pagedSystemHealth(Number(req.params.get('page') || 0), Number(req.params.get('size') || 10), req.params.get('groupBy') || 'component'), '페이징된 시스템 헬스를 조회했습니다.'))

  const PUBLIC = [/^\/$/, /^\/members\/(login|join|check-username)/, /^\/members\/password\/(find|reset)/, /^\/password\/reset/, /^\/corp(\/|$)/, /^\/coseller(\/|$)/, /^\/region(\/|$)/, /^\/health(\/|$)/, /^\/web\/files(\/|$)/, /^\/api\/v1\//, /^\/api\/stats/, /^\/main(\/|$)/, /^\/file(\/|$)/, /^\/dashboard(\/|$)/]

  function match(method, path) {
    for (const r of routes) {
      if (r.method !== method) continue
      const m = path.match(r.re)
      if (m) { const vars = {}; r.keys.forEach((k, i) => { vars[k] = m[i + 1] }); return { r, vars } }
    }
    return null
  }
  function routeCall(method, path, req) {
    const found = match(method, path)
    if (!found) return { status: 404 }
    return found.r.fn(Object.assign({}, req, { vars: found.vars, path }))
  }
  function handle(method, path, params, body) {
    runScheduler()
    const me = currentMember()
    const found = match(method, path)
    if (!found) {
      if (method === 'POST' && match('GET', path)) return { status: 405, error: 'Method Not Allowed', path }
      return { status: 404, error: 'Not Found', path }
    }
    const isPublic = PUBLIC.some((re) => re.test(path))
    if ((found.r.opts.auth || !isPublic) && !me) {
      if (path.startsWith('/api/') || path.startsWith('/coseller/save') || path.startsWith('/members/admin/search')) return { status: 401, json: { success: false, message: '인증이 필요합니다.', data: null } }
      return redirect('/members/login')
    }
    return found.r.fn({ method, path, params, body, me, vars: found.vars })
  }
  function globals(pathWithQuery, params) {
    const me = currentMember()
    const paramMap = { __map: true }
    const paramValues = { __map: true }
    params.forEach((v, k) => { if (!(k in paramMap)) paramMap[k] = v; (paramValues[k] = paramValues[k] || []).push(v) })
    return {
      _csrf: { token: 'demo-csrf-' + (me ? me.id : 'anon'), parameterName: '_csrf', headerName: 'X-CSRF-TOKEN' },
      pageContext: { request: { contextPath: '', requestURI: pathWithQuery.split('?')[0], userPrincipal: me ? { name: me.username } : null, remoteUser: me ? me.username : null }, servletContext: { contextPath: '' } },
      param: paramMap, paramValues, Math, __nowDate: { __date: now() }, __auth: authOf(me), __requestPath: pathWithQuery.split('?')[0]
    }
  }
  function reset() { localStorage.removeItem(KEY); setSession(null); load() }

  function recentSeries(n) {
    const out = []
    const t = now()
    for (let i = n - 1; i >= 0; i--) {
      const from = t - (i + 1) * 5 * 60000, to = t - i * 5 * 60000
      const list = db.checks.filter((c) => c.checkedAt > from && c.checkedAt <= to)
      const src = list.length ? list : db.checks.slice(-5)
      const ok = src.filter((c) => c.status === 'UP').length
      out.push({ label: new Date(to).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), rt: Math.round(src.reduce((a, c) => a + (c.responseTime || 0), 0) / src.length * 10) / 10 || rnd(3, 20), rate: Math.round(ok / src.length * 1000) / 10, cpu: 30 + rnd(0, 30), mem: 55 + rnd(0, 20) })
    }
    return out
  }
  window.AntockServer = { handle, globals, reset, currentMember, recentSeries }
})()
