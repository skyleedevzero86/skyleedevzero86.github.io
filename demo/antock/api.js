const AntockApi = (() => {
  const KEY = 'demo-antock-db-v1';
  const CHUNK_SIZE = 100;
  const REGIONS = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '마포구', '서초구', '송파구', '영등포구', '종로구'],
    '부산광역시': ['해운대구', '부산진구', '동래구', '남구', '사하구', '수영구'],
    '대구광역시': ['수성구', '달서구', '북구', '중구'],
    '인천광역시': ['남동구', '부평구', '연수구', '서구'],
    '광주광역시': ['동구', '서구', '남구', '북구', '광산구'],
    '대전광역시': ['유성구', '서구', '중구', '대덕구'],
    '울산광역시': ['남구', '중구', '울주군'],
    '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '화성시'],
    '전라남도': ['여수시', '순천시', '목포시', '나주시', '광양시'],
    '제주특별자치도': ['제주시', '서귀포시']
  };
  const BIZ_WORDS = ['한빛', '새솔', '다온', '누리', '바른', '하늘', '푸른', '온담', '가람', '미르', '도담', '라온', '해솔', '든솔', '세움'];
  const BIZ_TAIL = ['상사', '커머스', '마켓', '유통', '리빙', '푸드', '테크', '몰', '스토어', '트레이딩'];
  const LAST = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오'];
  const FIRST = ['민준', '서연', '도윤', '하은', '지호', '수아', '예준', '지우', '현우', '서윤', '건우', '채원'];
  const ROADS = ['중앙로', '시청로', '문화로', '해안로', '번영로', '대학로', '역전로', '공원로'];
  const STATUSES = ['계속사업자', '계속사업자', '계속사업자', '계속사업자', '휴업자', '폐업자'];
  const COMPONENTS = ['database', 'redis', 'cache', 'member-service', 'rate-limit'];

  let seed = 20261120;
  const srand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const sint = (a, b) => Math.floor(srand() * (b - a + 1)) + a;
  const spick = (arr) => arr[Math.floor(srand() * arr.length)];

  const now = () => Date.now();
  const day = 86400000;

  function makeBizNo() { return `${sint(100, 899)}-${sint(10, 99)}-${sint(10000, 99999)}`; }
  function makeCorpRegNo() { return `${sint(110111, 284711)}-${sint(1000000, 9999999)}`; }
  function makeSellerId(city, i) { return `${new Date().getFullYear()}-${city.slice(0, 2)}-${String(i).padStart(5, '0')}`; }

  function makeCorp(id, city, district, username, opts) {
    const o = opts || {};
    const hasReg = o.hasReg !== undefined ? o.hasReg : srand() > 0.12;
    const hasRegion = o.hasRegion !== undefined ? o.hasRegion : srand() > 0.08;
    const created = now() - sint(1, 400) * day;
    return {
      id,
      sellerId: makeSellerId(city, id),
      bizNm: `(주)${spick(BIZ_WORDS)}${spick(BIZ_TAIL)}`,
      bizNo: makeBizNo(),
      corpRegNo: hasReg ? makeCorpRegNo() : '',
      regionCd: hasRegion ? String(sint(1100000000, 5099999999)) : '',
      siNm: city,
      sggNm: district,
      username: username || 'system',
      description: '공정거래위원회 통신판매사업자 공개 데이터 기반 수집',
      repNm: spick(LAST) + spick(FIRST),
      estbDt: fmtYmd(now() - sint(300, 7000) * day),
      roadNmAddr: `${city} ${district} ${spick(ROADS)} ${sint(1, 300)}`,
      jibunAddr: `${city} ${district} ${sint(1, 999)}-${sint(1, 40)}`,
      corpStatus: spick(STATUSES),
      createdAt: created,
      updatedAt: created,
      histories: [{ action: 'CREATE', username: username || 'system', at: created, detail: '최초 수집' }]
    };
  }

  function fmtYmd(t) { const d = new Date(t); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; }

  function seedDb() {
    seed = 20261120;
    const corps = [];
    let id = 1;
    Object.entries(REGIONS).forEach(([city, ds]) => {
      ds.forEach((d) => {
        const n = sint(4, 14);
        for (let i = 0; i < n; i++) corps.push(makeCorp(id++, city, d, 'system'));
      });
    });
    const members = [];
    const mk = (username, nickname, role, status, ageDays, extra) => {
      const created = now() - ageDays * day;
      members.push(Object.assign({
        id: members.length + 1, username, password: 'Pass1234!', nickname, email: `${username}@antock.dev`,
        apiKey: 'ak_' + Math.random().toString(36).slice(2, 18), status, role,
        lastLoginAt: status === 'APPROVED' ? now() - sint(0, 20) * day : null,
        loginFailCount: 0, accountLockedAt: null, approvedBy: status === 'APPROVED' ? 1 : null,
        approvedAt: status === 'APPROVED' ? created + day : null,
        passwordChangedAt: created, passwordChangeCount: 0, lastPasswordChangeDate: null, todayChangeCount: 0,
        createdAt: created
      }, extra || {}));
    };
    mk('admin', '시스템관리자', 'ADMIN', 'APPROVED', 200);
    mk('manager01', '운영담당', 'MANAGER', 'APPROVED', 120);
    mk('kim_data', '데이터분석', 'USER', 'APPROVED', 95, { passwordChangedAt: now() - 95 * day });
    mk('lee_view', '조회전용', 'USER', 'APPROVED', 70, { passwordChangedAt: now() - 70 * day });
    mk('park_new', '신규신청', 'USER', 'PENDING', 1);
    mk('choi_req', '협력사', 'USER', 'PENDING', 2);
    mk('jung_out', '퇴사자', 'USER', 'SUSPENDED', 300);
    mk('kang_rej', '외부요청', 'USER', 'REJECTED', 40);
    mk('yoon_lock', '잠긴계정', 'USER', 'APPROVED', 60, { loginFailCount: 5, accountLockedAt: now() - 3600000 });
    const healthHistory = [];
    for (let i = 0; i < 40; i++) {
      const t = now() - i * 3 * 3600000;
      COMPONENTS.forEach((c) => {
        const ok = Math.random() > (c === 'redis' ? 0.12 : 0.03);
        healthHistory.push({ id: uid(), component: c, status: ok ? 'UP' : 'DOWN', message: ok ? '정상 응답' : (c === 'redis' ? 'Redis 연결 시간 초과' : '응답 지연'), responseTime: ok ? sint(2, 60) : sint(900, 3000), checkType: i % 4 === 0 ? 'manual' : 'scheduled', checkedAt: t });
      });
    }
    return {
      corps, nextCorpId: id, members, nextMemberId: members.length + 1,
      files: [], nextFileId: 1,
      manualHistories: [], failedChunks: [],
      cache: { redisUp: true, hits: 1840, misses: 312, fallbackHits: 0, evictions: 0, entries: {} },
      rateLimit: { perMinute: 60, counters: {}, blocked: {}, whitelist: ['127.0.0.1'], log: [], total: 0, rejected: 0 },
      config: { defaultPageSize: 10, cacheTtlSeconds: 300, storageType: 'minio', chunkSize: CHUNK_SIZE, rateLimitPerMinute: 60, healthCacheSeconds: 300, failRatePercent: 15 },
      healthHistory,
      resetTokens: {}
    };
  }

  let db = Demo.store.get(KEY, null) || seedDb();
  const save = () => Demo.store.set(KEY, db);
  save();

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  const ok = async (data, ms) => { await Demo.delay(ms === undefined ? Demo.rand(80, 220) : ms); return { success: true, data }; };
  const fail = async (code, message, status) => { await Demo.delay(Demo.rand(60, 160)); const e = new Error(message); e.code = code; e.status = status || 400; throw e; };

  function cacheGet(key, loader) {
    const c = db.cache;
    if (c.entries[key] && c.entries[key].exp > now()) {
      if (c.redisUp) c.hits++; else c.fallbackHits++;
      return c.entries[key].value;
    }
    c.misses++;
    const value = loader();
    c.entries[key] = { value, exp: now() + db.config.cacheTtlSeconds * 1000, store: c.redisUp ? 'redis' : 'memory' };
    return value;
  }
  function cacheEvict(prefix) {
    let n = 0;
    Object.keys(db.cache.entries).forEach((k) => { if (!prefix || k.startsWith(prefix)) { delete db.cache.entries[k]; n++; } });
    db.cache.evictions += n;
    return n;
  }

  function rateCheck(identifier, action) {
    const rl = db.rateLimit;
    const k = identifier + ':' + action;
    rl.total++;
    const entry = { at: now(), identifier, action, result: 'ALLOWED' };
    if (rl.whitelist.includes(identifier)) { entry.result = 'WHITELIST'; rl.log.unshift(entry); rl.log = rl.log.slice(0, 200); return { allowed: true, reason: 'WHITELIST' }; }
    const b = rl.blocked[identifier];
    if (b && (!b.until || b.until > now())) { entry.result = 'BLOCKED'; rl.rejected++; rl.log.unshift(entry); rl.log = rl.log.slice(0, 200); return { allowed: false, status: 403, reason: 'BLOCKED' }; }
    if (b && b.until && b.until <= now()) delete rl.blocked[identifier];
    const c = rl.counters[k];
    if (!c || c.windowStart + 60000 <= now()) rl.counters[k] = { count: 0, windowStart: now() };
    if (rl.counters[k].count >= rl.perMinute) { entry.result = 'RATE_LIMITED'; rl.rejected++; rl.log.unshift(entry); rl.log = rl.log.slice(0, 200); return { allowed: false, status: 429, reason: 'RATE_LIMIT_EXCEEDED' }; }
    rl.counters[k].count++;
    rl.log.unshift(entry); rl.log = rl.log.slice(0, 200);
    return { allowed: true, remaining: rl.perMinute - rl.counters[k].count };
  }

  const corpMatch = (c, q) => {
    if (q.bizNm && !c.bizNm.includes(q.bizNm)) return false;
    if (q.bizNo && !c.bizNo.replace(/-/g, '').includes(q.bizNo.replace(/-/g, ''))) return false;
    if (q.sellerId && !c.sellerId.includes(q.sellerId)) return false;
    if (q.corpRegNo && !c.corpRegNo.replace(/-/g, '').includes(q.corpRegNo.replace(/-/g, ''))) return false;
    if (q.city && c.siNm !== q.city) return false;
    if (q.district && c.sggNm !== q.district) return false;
    if (q.corpStatus && c.corpStatus !== q.corpStatus) return false;
    return true;
  };
  const sortBy = (list, sort) => {
    const [f, dir] = (sort || 'id,desc').split(',');
    return list.slice().sort((a, b) => {
      const x = a[f], y = b[f];
      const r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'ko');
      return dir === 'asc' ? r : -r;
    });
  };
  const view = (c) => Object.assign({}, c, { histories: undefined });

  function validateCorp(f, selfId) {
    if (!f.bizNm || f.bizNm.trim().length < 2) return '법인명은 2자 이상 입력해야 합니다.';
    if (!/^\d{3}-\d{2}-\d{5}$/.test(f.bizNo || '')) return '사업자번호 형식은 000-00-00000 입니다.';
    if (f.corpRegNo && !/^\d{6}-\d{7}$/.test(f.corpRegNo)) return '법인등록번호 형식은 000000-0000000 입니다.';
    if (!f.siNm || !f.sggNm) return '시/도와 구/군을 선택해야 합니다.';
    if (db.corps.some((c) => c.bizNo === f.bizNo && c.id !== selfId)) return '이미 등록된 사업자번호입니다.';
    if (f.corpRegNo && db.corps.some((c) => c.corpRegNo === f.corpRegNo && c.id !== selfId)) return '이미 등록된 법인등록번호입니다.';
    return null;
  }

  const corp = {
    async search(q) {
      const r = rateCheck(q.clientIp || '10.0.0.15', 'search');
      if (!r.allowed) return fail(r.reason, r.status === 403 ? '차단된 IP입니다.' : '요청 한도를 초과했습니다. (분당 ' + db.rateLimit.perMinute + '회)', r.status);
      const list = sortBy(db.corps.filter((c) => corpMatch(c, q)), q.sort);
      save();
      return ok(Demo.paginate(list.map(view), q.page || 1, q.size || db.config.defaultPageSize));
    },
    async getById(id) {
      const c = db.corps.find((x) => x.id === Number(id));
      if (!c) return fail('C005', '요청한 데이터를 찾을 수 없습니다.', 404);
      return ok(JSON.parse(JSON.stringify(c)));
    },
    async getByBizNo(bizNo) {
      const v = cacheGet('corp:bizno:' + bizNo, () => { const c = db.corps.find((x) => x.bizNo === bizNo); return c ? view(c) : null; });
      save();
      if (!v) return fail('C005', '해당 사업자번호의 법인이 없습니다.', 404);
      return ok(v);
    },
    async getByCorpRegNo(no) {
      const v = cacheGet('corp:regno:' + no, () => { const c = db.corps.find((x) => x.corpRegNo === no); return c ? view(c) : null; });
      save();
      if (!v) return fail('C005', '해당 법인등록번호의 법인이 없습니다.', 404);
      return ok(v);
    },
    async create(f, username) {
      const err = validateCorp(f);
      if (err) return fail('C001', err);
      const c = Object.assign(makeCorp(db.nextCorpId++, f.siNm, f.sggNm, username), {
        bizNm: f.bizNm.trim(), bizNo: f.bizNo, corpRegNo: f.corpRegNo || '', repNm: f.repNm || '', estbDt: (f.estbDt || '').replace(/-/g, ''),
        roadNmAddr: f.roadNmAddr || '', jibunAddr: f.jibunAddr || '', corpStatus: f.corpStatus || '계속사업자', description: f.description || '수동 등록',
        regionCd: f.regionCd || '', createdAt: now(), updatedAt: now()
      });
      c.histories = [{ action: 'CREATE', username, at: now(), detail: '수동 등록' }];
      db.corps.push(c);
      cacheEvict('corp:'); cacheEvict('stats:');
      save();
      return ok(view(c));
    },
    async update(id, f, username) {
      const c = db.corps.find((x) => x.id === Number(id));
      if (!c) return fail('C005', '요청한 데이터를 찾을 수 없습니다.', 404);
      const err = validateCorp(f, c.id);
      if (err) return fail('C001', err);
      const fields = ['bizNm', 'bizNo', 'corpRegNo', 'repNm', 'estbDt', 'roadNmAddr', 'jibunAddr', 'corpStatus', 'description', 'siNm', 'sggNm', 'regionCd'];
      const changes = [];
      fields.forEach((k) => {
        const nv = k === 'estbDt' ? (f[k] || '').replace(/-/g, '') : (f[k] === undefined ? c[k] : f[k]);
        if (String(nv) !== String(c[k])) { changes.push(`${k}: ${c[k] || '(없음)'} → ${nv || '(없음)'}`); c[k] = nv; }
      });
      if (!changes.length) return fail('C001', '변경된 항목이 없습니다.');
      c.updatedAt = now();
      c.histories.unshift({ action: 'UPDATE', username, at: now(), detail: changes.join(', ') });
      cacheEvict('corp:'); cacheEvict('stats:');
      save();
      return ok(view(c));
    },
    async remove(id, username) {
      const i = db.corps.findIndex((x) => x.id === Number(id));
      if (i < 0) return fail('C005', '요청한 데이터를 찾을 수 없습니다.', 404);
      const [c] = db.corps.splice(i, 1);
      db.manualHistories.unshift({ id: uid(), username, city: c.siNm, district: c.sggNm, fileName: '-', savedCount: -1, error: null, action: `삭제: ${c.bizNm}`, at: now() });
      cacheEvict('corp:'); cacheEvict('stats:');
      save();
      return ok(true);
    },
    async cities() { return ok(Object.keys(REGIONS)); },
    async districts(city) { return ok(REGIONS[city] || []); },
    async statistics(q) {
      const list = db.corps.filter((c) => corpMatch(c, q || {}));
      const byStatus = {};
      list.forEach((c) => { byStatus[c.corpStatus] = (byStatus[c.corpStatus] || 0) + 1; });
      return ok({ total: list.length, withCorpRegNo: list.filter((c) => c.corpRegNo).length, withRegionCd: list.filter((c) => c.regionCd).length, byStatus });
    },
    async exportCsv(q) {
      const list = sortBy(db.corps.filter((c) => corpMatch(c, q)), q.sort);
      if (!list.length) return fail('C005', '내보낼 데이터가 없습니다.', 404);
      if (list.length > 10000) return fail('C001', '최대 10,000건까지 내보낼 수 있습니다.');
      Demo.downloadCsv(`법인정보_${fmtYmd(now())}.csv`, ['ID', '판매자ID', '법인명', '사업자번호', '법인등록번호', '지역코드', '시/도', '구/군', '대표자', '설립일', '도로명주소', '상태', '등록자'],
        list.map((c) => [c.id, c.sellerId, c.bizNm, c.bizNo, c.corpRegNo, c.regionCd, c.siNm, c.sggNm, c.repNm, c.estbDt, c.roadNmAddr, c.corpStatus, c.username]));
      return ok(list.length);
    }
  };

  function regionStats() {
    return cacheGet('stats:region', () => {
      const map = {};
      db.corps.forEach((c) => {
        const k = c.siNm + '|' + c.sggNm;
        if (!map[k]) map[k] = { city: c.siNm, district: c.sggNm, totalCount: 0, validCorpRegNoCount: 0, validRegionCdCount: 0 };
        map[k].totalCount++;
        if (c.corpRegNo) map[k].validCorpRegNoCount++;
        if (c.regionCd) map[k].validRegionCdCount++;
      });
      return Object.values(map).map((r) => Object.assign(r, {
        formattedCount: r.totalCount.toLocaleString('ko-KR'),
        completionRate: r.totalCount ? Math.round(((r.validCorpRegNoCount + r.validRegionCdCount) / (r.totalCount * 2)) * 1000) / 10 : 0
      })).sort((a, b) => b.totalCount - a.totalCount);
    });
  }

  const region = {
    async all() { const v = regionStats(); save(); return ok(v); },
    async top() { const v = regionStats(); save(); return ok(v[0] || null); },
    async paged(q) {
      let v = regionStats();
      if (q.city) v = v.filter((r) => r.city === q.city);
      if (q.district) v = v.filter((r) => r.district === q.district);
      if (q.sort === 'rate') v = v.slice().sort((a, b) => b.completionRate - a.completionRate);
      save();
      return ok(Demo.paginate(v, q.page || 1, q.size || 10));
    },
    async details(city, district, page) {
      return ok(Demo.paginate(db.corps.filter((c) => c.siNm === city && (!district || c.sggNm === district)).map(view), page || 1, 10));
    },
    async addMissingColumns() {
      let fixed = 0;
      db.corps.forEach((c) => { if (!c.regionCd) { c.regionCd = String(Demo.rand(1100000000, 5099999999)); fixed++; } });
      cacheEvict('stats:');
      save();
      return ok({ updated: fixed, message: `지역코드가 비어 있던 ${fixed}건을 보정했습니다.` });
    },
    async addSampleData() {
      const cities = Object.keys(REGIONS);
      let added = 0;
      for (let i = 0; i < 20; i++) {
        const city = cities[Demo.rand(0, cities.length - 1)];
        const d = REGIONS[city][Demo.rand(0, REGIONS[city].length - 1)];
        db.corps.push(makeCorp(db.nextCorpId++, city, d, 'sample'));
        added++;
      }
      cacheEvict('stats:'); cacheEvict('corp:');
      save();
      return ok({ added, message: `샘플 데이터 ${added}건을 추가했습니다.` });
    },
    async exportCsv() {
      const v = regionStats();
      Demo.downloadCsv(`지역별현황_${fmtYmd(now())}.csv`, ['시/도', '구/군', '전체', '법인등록번호 보유', '지역코드 보유', '완성도(%)'], v.map((r) => [r.city, r.district, r.totalCount, r.validCorpRegNoCount, r.validRegionCdCount, r.completionRate]));
      return ok(v.length);
    }
  };

  const coseller = {
    async save(city, district, username, onProgress, opts) {
      if (!city || !district) return fail('C001', '시/도와 구/군을 선택해야 합니다.');
      if (!(REGIONS[city] || []).includes(district)) return fail('C001', '지원하지 않는 지역입니다.');
      const r = rateCheck('10.0.0.15', 'collect');
      if (!r.allowed) return fail(r.reason, '요청 한도를 초과했습니다.', r.status);
      const fileName = `${city}_${district}.csv`;
      const total = Demo.rand(180, 520);
      const failRate = (db.config.failRatePercent || 0) / 100;
      const chunks = Math.ceil(total / CHUNK_SIZE);
      let saved = 0, skipped = 0;
      const failed = [];
      onProgress({ type: 'start', fileName, total, chunks });
      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const size = Math.min(CHUNK_SIZE, total - start);
        await Demo.delay(Demo.rand(250, 550));
        if (Math.random() < failRate) {
          const reason = Demo.pick(['공공데이터포털 API 응답 시간 초과', '법인등록번호 조회 API 5xx 응답', '행정구역 코드 API 호출 한도 초과']);
          const fc = { id: uid(), fileName, startIndex: start, size, city, district, reason, at: now(), retried: 0 };
          db.failedChunks.unshift(fc);
          failed.push(fc);
          onProgress({ type: 'chunk', index: i, start, size, ok: false, reason, saved, done: start + size });
          continue;
        }
        let chunkSaved = 0;
        for (let k = 0; k < size; k++) {
          const c = makeCorp(db.nextCorpId++, city, district, username, {});
          if (Math.random() < 0.04) { skipped++; db.nextCorpId--; continue; }
          db.corps.push(c);
          chunkSaved++;
        }
        saved += chunkSaved;
        onProgress({ type: 'chunk', index: i, start, size, ok: true, chunkSaved, saved, done: start + size });
      }
      cacheEvict('stats:'); cacheEvict('corp:');
      const hist = { id: uid(), username, city, district, fileName, savedCount: saved, error: failed.length ? `실패 청크 ${failed.length}개` : null, action: opts && opts.simple ? '간편 저장' : '수동 수집', at: now() };
      db.manualHistories.unshift(hist);
      db.manualHistories = db.manualHistories.slice(0, 100);
      save();
      onProgress({ type: 'end', saved, skipped, failed: failed.length });
      return ok({ saved, skipped, failedChunks: failed.length, total });
    },
    async retryChunk(id, username) {
      const fc = db.failedChunks.find((x) => x.id === id);
      if (!fc) return fail('C005', '실패 청크를 찾을 수 없습니다.', 404);
      await Demo.delay(500);
      fc.retried++;
      if (Math.random() < 0.25) { fc.reason = '재처리 실패: API 응답 시간 초과'; save(); return fail('E001', '재처리에 실패했습니다. 잠시 후 다시 시도하세요.'); }
      for (let k = 0; k < fc.size; k++) db.corps.push(makeCorp(db.nextCorpId++, fc.city, fc.district, username));
      db.failedChunks = db.failedChunks.filter((x) => x.id !== id);
      db.manualHistories.unshift({ id: uid(), username, city: fc.city, district: fc.district, fileName: fc.fileName, savedCount: fc.size, error: null, action: `실패 청크 재처리 (시작 ${fc.startIndex})`, at: now() });
      cacheEvict('stats:'); cacheEvict('corp:');
      save();
      return ok({ saved: fc.size });
    },
    async failedChunks() { return ok(db.failedChunks.slice()); },
    async histories() { return ok(db.manualHistories.slice(0, 30)); }
  };

  const nplus1 = {
    async report(limit) {
      const n = Math.max(1, Math.min(5000, Number(limit) || 2000));
      await Demo.delay(600);
      const batch = 100;
      return ok({ limit: n, withoutBatch: { queries: n + 1, ms: Math.round(n * 1.9 + Demo.rand(30, 90)) }, withBatchSize: { batchSize: batch, queries: Math.ceil(n / batch) + 1, ms: Math.round(Math.ceil(n / batch) * 6.5 + Demo.rand(20, 50)) } });
    }
  };

  const fileApi = {
    async upload(file, description, username) {
      if (!file) return fail('C001', '파일을 선택해야 합니다.');
      if (file.size > 1024 * 1024) return fail('F001', '데모에서는 1MB 이하 파일만 업로드할 수 있습니다.');
      if (/\.(exe|bat|sh|jsp|php|js)$/i.test(file.name)) return fail('F002', '허용되지 않은 확장자입니다.');
      const data = await readFile(file);
      const strategy = db.config.storageType;
      const storedName = uid() + '_' + file.name;
      const f = { id: db.nextFileId++, originalFileName: file.name, storedFileName: storedName, contentType: file.type || 'application/octet-stream', size: file.size, description: description || '', storage: strategy, path: strategy === 'minio' ? `minio://antock-files/${storedName}` : `/app/uploaded-files/${storedName}`, uploader: username, uploadedAt: now(), updatedAt: now(), downloads: 0, data };
      db.files.unshift(f);
      try { save(); } catch (e) { db.files.shift(); return fail('F003', '브라우저 저장 공간이 부족합니다.'); }
      return ok(meta(f));
    },
    async info(id) { const f = db.files.find((x) => x.id === Number(id)); if (!f) return fail('C005', '파일을 찾을 수 없습니다.', 404); return ok(meta(f)); },
    async list(page, size, keyword) {
      let l = db.files;
      if (keyword) l = l.filter((f) => f.originalFileName.toLowerCase().includes(keyword.toLowerCase()) || (f.description || '').includes(keyword));
      return ok(Demo.paginate(l.map(meta), page || 1, size || 10));
    },
    async update(id, description, file, username) {
      const f = db.files.find((x) => x.id === Number(id));
      if (!f) return fail('C005', '파일을 찾을 수 없습니다.', 404);
      if (f.uploader !== username && username !== 'admin') return fail('A003', '업로드한 사용자만 수정할 수 있습니다.', 403);
      f.description = description;
      if (file) {
        if (file.size > 1024 * 1024) return fail('F001', '데모에서는 1MB 이하 파일만 업로드할 수 있습니다.');
        f.data = await readFile(file); f.originalFileName = file.name; f.size = file.size; f.contentType = file.type || f.contentType;
      }
      f.updatedAt = now();
      save();
      return ok(meta(f));
    },
    async remove(id, username) {
      const f = db.files.find((x) => x.id === Number(id));
      if (!f) return fail('C005', '파일을 찾을 수 없습니다.', 404);
      if (f.uploader !== username && username !== 'admin') return fail('A003', '업로드한 사용자만 삭제할 수 있습니다.', 403);
      db.files = db.files.filter((x) => x.id !== f.id);
      save();
      return ok(true);
    },
    async download(id) {
      const f = db.files.find((x) => x.id === Number(id));
      if (!f) return fail('C005', '파일을 찾을 수 없습니다.', 404);
      f.downloads++;
      save();
      const a = document.createElement('a');
      a.href = f.data; a.download = f.originalFileName; document.body.appendChild(a); a.click(); a.remove();
      return ok(true);
    },
    async setStrategy(type) { db.config.storageType = type; save(); return ok(type); }
  };
  function meta(f) { const m = Object.assign({}, f); delete m.data; return m; }
  function readFile(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); }

  const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
  const JOIN_PW_RE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;
  const CHANGE_PW_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+=\-\[\]\\;'`~]).{8,}$/;
  const mview = (m) => { const v = Object.assign({}, m); delete v.password; v.locked = m.loginFailCount >= 5 || m.status === 'SUSPENDED'; v.passwordChangeRequired = now() - m.passwordChangedAt > 90 * day; v.passwordChangeRecommended = now() - m.passwordChangedAt > 60 * day; return v; };
  const findM = (id) => db.members.find((m) => m.id === Number(id));

  const member = {
    ensure(username) {
      let m = db.members.find((x) => x.username === username);
      if (!m) {
        m = { id: db.nextMemberId++, username, password: 'Demo1234!', nickname: username, email: `${username}@demo.dev`, apiKey: 'ak_' + Math.random().toString(36).slice(2, 18), status: 'APPROVED', role: 'ADMIN', lastLoginAt: now(), loginFailCount: 0, accountLockedAt: null, approvedBy: 1, approvedAt: now(), passwordChangedAt: now(), passwordChangeCount: 0, lastPasswordChangeDate: null, todayChangeCount: 0, createdAt: now() };
        db.members.push(m);
      } else {
        m.lastLoginAt = now();
        if (m.status !== 'APPROVED' || m.role !== 'ADMIN') { m.status = 'APPROVED'; m.role = 'ADMIN'; m.loginFailCount = 0; }
      }
      save();
      return mview(m);
    },
    async join(f) {
      if (!f.username || f.username.length < 3 || f.username.length > 20) return fail('C001', '사용자명은 3~20자여야 합니다.');
      if (!USERNAME_RE.test(f.username)) return fail('C001', '사용자명은 영문, 숫자, 언더스코어만 가능합니다.');
      if (!f.password || f.password.length < 8) return fail('C001', '비밀번호는 8자 이상이어야 합니다.');
      if (!JOIN_PW_RE.test(f.password)) return fail('C001', '비밀번호는 영문과 숫자를 포함해야 합니다.');
      if (!f.nickname || f.nickname.length < 2) return fail('C001', '닉네임은 2자 이상이어야 합니다.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email || '')) return fail('C001', '올바른 이메일 형식이 아닙니다.');
      if (db.members.some((m) => m.username === f.username)) return fail('M001', '이미 사용 중인 사용자명입니다.', 409);
      if (db.members.some((m) => m.email === f.email)) return fail('M002', '이미 사용 중인 이메일입니다.', 409);
      const m = { id: db.nextMemberId++, username: f.username, password: f.password, nickname: f.nickname, email: f.email, apiKey: 'ak_' + Math.random().toString(36).slice(2, 18), status: 'PENDING', role: 'USER', lastLoginAt: null, loginFailCount: 0, accountLockedAt: null, approvedBy: null, approvedAt: null, passwordChangedAt: now(), passwordChangeCount: 0, lastPasswordChangeDate: null, todayChangeCount: 0, createdAt: now() };
      db.members.push(m);
      save();
      return ok(mview(m));
    },
    async login(username, password, ip) {
      const r = rateCheck(ip || '10.0.0.15', 'login');
      if (!r.allowed) { save(); return fail(r.reason, r.status === 403 ? '차단된 IP입니다.' : '로그인 시도가 너무 많습니다. 1분 후 다시 시도하세요.', r.status); }
      const m = db.members.find((x) => x.username === username);
      if (!m) { save(); return fail('M003', '아이디 또는 비밀번호가 올바르지 않습니다.', 401); }
      if (m.loginFailCount >= 5) { save(); return fail('M004', '로그인 5회 실패로 잠긴 계정입니다. 관리자에게 잠금 해제를 요청하세요.', 423); }
      if (m.status === 'PENDING') { save(); return fail('M005', '관리자 승인 대기 중인 계정입니다.', 403); }
      if (m.status === 'REJECTED') { save(); return fail('M006', '가입이 거부된 계정입니다.', 403); }
      if (m.status === 'SUSPENDED') { save(); return fail('M007', '정지된 계정입니다.', 403); }
      if (m.status === 'WITHDRAWN') { save(); return fail('M008', '탈퇴한 계정입니다.', 403); }
      if (m.password !== password) {
        m.loginFailCount++;
        if (m.loginFailCount >= 5) m.accountLockedAt = now();
        save();
        return fail('M003', `비밀번호가 올바르지 않습니다. (실패 ${m.loginFailCount}/5)`, 401);
      }
      m.loginFailCount = 0; m.lastLoginAt = now();
      save();
      return ok({ token: 'eyJhbGciOiJIUzI1NiJ9.' + btoa(unescape(encodeURIComponent(JSON.stringify({ sub: m.username, role: m.role, iat: now() })))).replace(/=+$/, '') + '.sig', member: mview(m) });
    },
    async profile(username) { const m = db.members.find((x) => x.username === username); if (!m) return fail('C005', '회원 정보가 없습니다.', 404); return ok(mview(m)); },
    async updateProfile(username, f) {
      const m = db.members.find((x) => x.username === username);
      if (!m) return fail('C005', '회원 정보가 없습니다.', 404);
      if (!f.nickname || f.nickname.length < 2) return fail('C001', '닉네임은 2자 이상이어야 합니다.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email || '')) return fail('C001', '올바른 이메일 형식이 아닙니다.');
      if (db.members.some((x) => x.email === f.email && x.id !== m.id)) return fail('M002', '이미 사용 중인 이메일입니다.', 409);
      m.nickname = f.nickname; m.email = f.email;
      cacheEvict('member:' + m.id);
      save();
      return ok(mview(m));
    },
    async changePassword(username, cur, next, confirm) {
      const m = db.members.find((x) => x.username === username);
      if (!m) return fail('C005', '회원 정보가 없습니다.', 404);
      if (m.password !== cur) return fail('M009', '현재 비밀번호가 일치하지 않습니다.');
      if (next !== confirm) return fail('C001', '새 비밀번호 확인이 일치하지 않습니다.');
      if (next === cur) return fail('M010', '현재 비밀번호와 다른 비밀번호를 사용해야 합니다.');
      if (!CHANGE_PW_RE.test(next)) return fail('C001', '비밀번호는 8자 이상, 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다.');
      const today = fmtYmd(now());
      if (m.lastPasswordChangeDate !== today) { m.lastPasswordChangeDate = today; m.todayChangeCount = 0; }
      if (m.todayChangeCount >= 3) return fail('M011', '비밀번호는 하루에 3번까지만 변경할 수 있습니다.', 429);
      m.password = next; m.passwordChangedAt = now(); m.passwordChangeCount++; m.todayChangeCount++;
      save();
      return ok(mview(m));
    },
    async passwordStatus(username) {
      const m = db.members.find((x) => x.username === username);
      if (!m) return fail('C005', '회원 정보가 없습니다.', 404);
      const v = mview(m);
      const today = fmtYmd(now());
      return ok({ passwordChangedAt: m.passwordChangedAt, daysSinceChange: Math.floor((now() - m.passwordChangedAt) / day), changeRequired: v.passwordChangeRequired, changeRecommended: v.passwordChangeRecommended, todayChangeCount: m.lastPasswordChangeDate === today ? m.todayChangeCount : 0, maxDailyChanges: 3 });
    },
    async adminList(q) {
      let l = db.members.slice();
      if (q.status) l = l.filter((m) => m.status === q.status);
      if (q.role) l = l.filter((m) => m.role === q.role);
      if (q.keyword) l = l.filter((m) => m.username.includes(q.keyword) || m.nickname.includes(q.keyword) || m.email.includes(q.keyword));
      l.sort((a, b) => b.createdAt - a.createdAt);
      return ok(Demo.paginate(l.map(mview), q.page || 1, q.size || 10));
    },
    async pending(page) { return member.adminList({ status: 'PENDING', page }); },
    async approve(id, adminName) {
      const m = findM(id); if (!m) return fail('C005', '회원을 찾을 수 없습니다.', 404);
      if (m.status !== 'PENDING') return fail('M012', '승인 대기 상태인 회원만 승인할 수 있습니다.');
      const admin = db.members.find((x) => x.username === adminName) || db.members[0];
      m.status = 'APPROVED'; m.approvedBy = admin.id; m.approvedAt = now();
      cacheEvict('member:'); save(); return ok(mview(m));
    },
    async reject(id) {
      const m = findM(id); if (!m) return fail('C005', '회원을 찾을 수 없습니다.', 404);
      if (m.status !== 'PENDING') return fail('M012', '승인 대기 상태인 회원만 거부할 수 있습니다.');
      m.status = 'REJECTED'; cacheEvict('member:'); save(); return ok(mview(m));
    },
    async resetToPending(id) {
      const m = findM(id); if (!m) return fail('C005', '회원을 찾을 수 없습니다.', 404);
      if (m.role === 'ADMIN') return fail('M013', '시스템 관리자는 상태를 바꿀 수 없습니다.');
      m.status = 'PENDING'; m.approvedAt = null; m.approvedBy = null; cacheEvict('member:'); save(); return ok(mview(m));
    },
    async suspend(id) {
      const m = findM(id); if (!m) return fail('C005', '회원을 찾을 수 없습니다.', 404);
      if (m.role === 'ADMIN') return fail('M013', '시스템 관리자는 정지할 수 없습니다.');
      if (m.status === 'SUSPENDED') return fail('M014', '이미 정지된 회원입니다.');
      m.status = 'SUSPENDED'; cacheEvict('member:'); save(); return ok(mview(m));
    },
    async unlock(id) {
      const m = findM(id); if (!m) return fail('C005', '회원을 찾을 수 없습니다.', 404);
      if (m.loginFailCount < 5 && m.status !== 'SUSPENDED') return fail('M015', '잠긴 계정이 아닙니다.');
      m.loginFailCount = 0; m.accountLockedAt = null;
      if (m.status === 'SUSPENDED') m.status = 'APPROVED';
      cacheEvict('member:'); save(); return ok(mview(m));
    },
    async remove(id) {
      const m = findM(id); if (!m) return fail('C005', '회원을 찾을 수 없습니다.', 404);
      if (m.role === 'ADMIN') return fail('M013', '시스템 관리자는 삭제할 수 없습니다.');
      db.members = db.members.filter((x) => x.id !== m.id); cacheEvict('member:'); save(); return ok(true);
    },
    async changeRole(id, role) {
      const m = findM(id); if (!m) return fail('C005', '회원을 찾을 수 없습니다.', 404);
      if (!['USER', 'MANAGER', 'ADMIN'].includes(role)) return fail('C001', '잘못된 역할입니다.');
      if (m.status !== 'APPROVED') return fail('M016', '승인된 회원만 역할을 바꿀 수 있습니다.');
      if (m.role === 'ADMIN' && role !== 'ADMIN' && db.members.filter((x) => x.role === 'ADMIN' && x.status === 'APPROVED').length <= 1) return fail('M017', '마지막 시스템 관리자의 역할은 바꿀 수 없습니다.');
      m.role = role; cacheEvict('member:'); save(); return ok(mview(m));
    },
    async withdraw(username, password) {
      const m = db.members.find((x) => x.username === username); if (!m) return fail('C005', '회원 정보가 없습니다.', 404);
      if (m.password !== password) return fail('M009', '비밀번호가 일치하지 않습니다.');
      if (m.role === 'ADMIN') return fail('M013', '시스템 관리자는 탈퇴할 수 없습니다.');
      m.status = 'WITHDRAWN'; save(); return ok(true);
    },
    async findPassword(username, email) {
      const m = db.members.find((x) => x.username === username && x.email === email);
      if (!m) return fail('M018', '입력한 정보와 일치하는 회원이 없습니다.', 404);
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      db.resetTokens[token] = { memberId: m.id, exp: now() + 30 * 60000, used: false };
      save();
      return ok({ token, expiresInMinutes: 30, maskedEmail: email.replace(/^(.{2}).*(@.*)$/, '$1***$2') });
    },
    async validateResetToken(token) { const t = db.resetTokens[token]; return ok(!!(t && !t.used && t.exp > now())); },
    async resetPassword(token, next, confirm) {
      const t = db.resetTokens[token];
      if (!t || t.used || t.exp <= now()) return fail('M019', '유효하지 않거나 만료된 토큰입니다.');
      if (next !== confirm) return fail('C001', '새 비밀번호 확인이 일치하지 않습니다.');
      if (!CHANGE_PW_RE.test(next)) return fail('C001', '비밀번호는 8자 이상, 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다.');
      const m = findM(t.memberId); if (!m) return fail('C005', '회원 정보가 없습니다.', 404);
      m.password = next; m.passwordChangedAt = now(); m.loginFailCount = 0; m.accountLockedAt = null; t.used = true;
      save();
      return ok('비밀번호가 재설정되었습니다.');
    }
  };

  const admin = {
    async cacheStats() {
      const c = db.cache;
      const total = c.hits + c.misses + c.fallbackHits;
      const entries = Object.entries(c.entries).filter(([, v]) => v.exp > now());
      return ok({ redisStatus: c.redisUp ? 'UP' : 'DOWN', activeStore: c.redisUp ? 'Redis' : 'Memory(Fallback)', hits: c.hits, misses: c.misses, fallbackHits: c.fallbackHits, evictions: c.evictions, hitRate: total ? Math.round(((c.hits + c.fallbackHits) / total) * 1000) / 10 : 0, size: entries.length, keys: entries.map(([k, v]) => ({ key: k, store: v.store, ttl: Math.round((v.exp - now()) / 1000) })) });
    },
    async evictMembers() { const n = cacheEvict('member:'); save(); return ok({ evicted: n }); },
    async evictMember(id) { const n = cacheEvict('member:' + id); save(); return ok({ evicted: n }); },
    async evictAll() { const n = cacheEvict(''); save(); return ok({ evicted: n }); },
    async setRedis(up) {
      db.cache.redisUp = up;
      Object.values(db.cache.entries).forEach((e) => { e.store = up ? 'redis' : 'memory'; });
      db.healthHistory.unshift({ id: uid(), component: 'redis', status: up ? 'UP' : 'DOWN', message: up ? 'Redis 복구, 기본 저장소로 복귀' : 'Redis 연결 실패, 메모리 캐시로 전환', responseTime: up ? Demo.rand(2, 9) : 3000, checkType: 'manual', checkedAt: now() });
      save();
      return ok(db.cache.redisUp);
    },
    async warmUp() {
      db.corps.slice(0, 30).forEach((c) => cacheGet('corp:bizno:' + c.bizNo, () => view(c)));
      db.members.forEach((m) => cacheGet('member:' + m.id, () => mview(m)));
      regionStats();
      save();
      return ok(Object.keys(db.cache.entries).length);
    },
    async readCached(key) {
      if (key.startsWith('member:')) { const id = Number(key.split(':')[1]); const v = cacheGet(key, () => { const m = findM(id); return m ? mview(m) : null; }); save(); return ok(v); }
      const v = cacheGet(key, () => ({ generatedAt: now() }));
      save();
      return ok(v);
    },
    async rateStatus() {
      const rl = db.rateLimit;
      const counters = Object.entries(rl.counters).filter(([, c]) => c.windowStart + 60000 > now()).map(([k, c]) => { const [identifier, action] = k.split(':'); return { identifier, action, count: c.count, remaining: Math.max(0, rl.perMinute - c.count), resetIn: Math.max(0, Math.round((c.windowStart + 60000 - now()) / 1000)) }; });
      return ok({ perMinute: rl.perMinute, counters, blocked: Object.entries(rl.blocked).map(([k, v]) => ({ identifier: k, reason: v.reason, until: v.until, at: v.at })), whitelist: rl.whitelist.slice(), total: rl.total, rejected: rl.rejected, log: rl.log.slice(0, 50), strategy: db.cache.redisUp ? 'Redis(Lua 스크립트)' : 'InMemory(Fallback)' });
    },
    async rateCurrent(identifier, action) { const c = db.rateLimit.counters[identifier + ':' + action]; const valid = c && c.windowStart + 60000 > now(); return ok({ identifier, action, count: valid ? c.count : 0, remaining: db.rateLimit.perMinute - (valid ? c.count : 0) }); },
    async rateReset(identifier, action) { delete db.rateLimit.counters[identifier + ':' + action]; save(); return ok(true); },
    async rateSecurity(identifier) { const rl = db.rateLimit; const logs = rl.log.filter((l) => l.identifier === identifier); return ok({ identifier, blocked: !!rl.blocked[identifier], whitelisted: rl.whitelist.includes(identifier), totalRequests: logs.length, rejected: logs.filter((l) => l.result === 'RATE_LIMITED' || l.result === 'BLOCKED').length, lastSeen: logs[0] ? logs[0].at : null }); },
    async block(identifier, minutes, reason) {
      if (!identifier) return fail('C001', '식별자를 입력하세요.');
      if (db.rateLimit.whitelist.includes(identifier)) return fail('R001', '화이트리스트에 있는 식별자는 차단할 수 없습니다.');
      db.rateLimit.blocked[identifier] = { reason: reason || '관리자 수동 차단', until: minutes ? now() + minutes * 60000 : null, at: now() };
      save(); return ok(true);
    },
    async unblock(identifier) { if (!db.rateLimit.blocked[identifier]) return fail('R002', '차단 목록에 없습니다.'); delete db.rateLimit.blocked[identifier]; save(); return ok(true); },
    async whitelistAdd(identifier) { if (!identifier) return fail('C001', '식별자를 입력하세요.'); if (db.rateLimit.whitelist.includes(identifier)) return fail('R003', '이미 화이트리스트에 있습니다.'); db.rateLimit.whitelist.push(identifier); delete db.rateLimit.blocked[identifier]; save(); return ok(true); },
    async whitelistRemove(identifier) { db.rateLimit.whitelist = db.rateLimit.whitelist.filter((x) => x !== identifier); save(); return ok(true); },
    async simulate(identifier, action, count) {
      const res = { allowed: 0, limited: 0, blocked: 0, whitelisted: 0 };
      for (let i = 0; i < count; i++) {
        const r = rateCheck(identifier, action);
        if (r.allowed) { if (r.reason === 'WHITELIST') res.whitelisted++; else res.allowed++; } else if (r.status === 403) res.blocked++; else res.limited++;
      }
      if (res.limited >= 30 && !db.rateLimit.blocked[identifier] && !db.rateLimit.whitelist.includes(identifier)) {
        db.rateLimit.blocked[identifier] = { reason: '1분 한도 초과가 반복되어 자동 차단', until: now() + 10 * 60000, at: now() };
        res.autoBlocked = true;
      }
      save();
      await Demo.delay(200);
      return ok(res);
    },
    async memberStatistics() {
      const byStatus = {}, byRole = {};
      db.members.forEach((m) => { byStatus[m.status] = (byStatus[m.status] || 0) + 1; byRole[m.role] = (byRole[m.role] || 0) + 1; });
      return ok({ total: db.members.length, byStatus, byRole, locked: db.members.filter((m) => m.loginFailCount >= 5).length, joinedLast7Days: db.members.filter((m) => now() - m.createdAt < 7 * day).length });
    },
    async generateMembers(count, status) {
      const n = Math.max(1, Math.min(200, Number(count) || 10));
      for (let i = 0; i < n; i++) {
        const u = `dummy_${Date.now().toString(36).slice(-4)}${i}`;
        db.members.push({ id: db.nextMemberId++, username: u, password: 'Dummy1234!', nickname: `더미${i + 1}`, email: `${u}@dummy.dev`, apiKey: 'ak_' + Math.random().toString(36).slice(2, 18), status: status || Demo.pick(['PENDING', 'APPROVED', 'APPROVED']), role: 'USER', lastLoginAt: null, loginFailCount: 0, accountLockedAt: null, approvedBy: null, approvedAt: null, passwordChangedAt: now(), passwordChangeCount: 0, lastPasswordChangeDate: null, todayChangeCount: 0, createdAt: now() - Demo.rand(0, 30) * day });
      }
      save(); return ok({ generated: n });
    },
    async config() { return ok(Object.assign({}, db.config)); },
    async updateConfig(f) {
      const c = db.config;
      if (f.defaultPageSize < 5 || f.defaultPageSize > 100) return fail('C001', '페이지 크기는 5~100 사이여야 합니다.');
      if (f.cacheTtlSeconds < 10 || f.cacheTtlSeconds > 86400) return fail('C001', '캐시 TTL은 10초~86400초 사이여야 합니다.');
      if (f.rateLimitPerMinute < 1 || f.rateLimitPerMinute > 1000) return fail('C001', '분당 요청 한도는 1~1000 사이여야 합니다.');
      if (f.failRatePercent < 0 || f.failRatePercent > 90) return fail('C001', '수집 실패율은 0~90 사이여야 합니다.');
      Object.assign(c, { defaultPageSize: f.defaultPageSize, cacheTtlSeconds: f.cacheTtlSeconds, rateLimitPerMinute: f.rateLimitPerMinute, failRatePercent: f.failRatePercent, storageType: f.storageType, healthCacheSeconds: f.healthCacheSeconds });
      db.rateLimit.perMinute = f.rateLimitPerMinute;
      save(); return ok(Object.assign({}, c));
    },
    async summary() {
      const cs = (await admin.cacheStats()).data;
      return ok({ members: db.members.length, approved: db.members.filter((m) => m.status === 'APPROVED').length, pending: db.members.filter((m) => m.status === 'PENDING').length, corps: db.corps.length, files: db.files.length, fileBytes: db.files.reduce((s, f) => s + f.size, 0), cacheHitRate: cs.hitRate, redisStatus: cs.redisStatus, rateRejected: db.rateLimit.rejected, rateTotal: db.rateLimit.total, blocked: Object.keys(db.rateLimit.blocked).length, failedChunks: db.failedChunks.length, jvm: { heapUsedMb: Demo.rand(180, 420), heapMaxMb: 1024, threads: Demo.rand(38, 64), uptimeMin: Math.round((now() - (Demo.session.get('antock-boot') || now())) / 60000) } });
    },
    async securityOverview() {
      const rl = db.rateLimit;
      const byAction = {};
      rl.log.forEach((l) => { byAction[l.action] = byAction[l.action] || { total: 0, rejected: 0 }; byAction[l.action].total++; if (l.result === 'RATE_LIMITED' || l.result === 'BLOCKED') byAction[l.action].rejected++; });
      return ok({ lockedAccounts: db.members.filter((m) => m.loginFailCount >= 5).map(mview), suspended: db.members.filter((m) => m.status === 'SUSPENDED').length, blockedIdentifiers: Object.keys(rl.blocked).length, whitelist: rl.whitelist.length, byAction, passwordChangeRequired: db.members.filter((m) => now() - m.passwordChangedAt > 90 * day && m.status === 'APPROVED').length });
    },
    async resetAll() { db = seedDb(); save(); return ok(true); }
  };

  function componentCheck(c) {
    const base = { component: c, checkedAt: now() };
    if (c === 'redis' && !db.cache.redisUp) return Object.assign(base, { status: 'DOWN', message: 'Redis 연결 실패 (메모리 캐시로 운영 중)', responseTime: 3000 });
    if (c === 'cache') return Object.assign(base, { status: 'UP', message: db.cache.redisUp ? 'Redis 캐시 정상' : '메모리 캐시로 대체 운영', responseTime: Demo.rand(1, 12) });
    if (c === 'rate-limit') return Object.assign(base, { status: 'UP', message: db.cache.redisUp ? 'Redis 기반 Rate Limit 정상' : 'InMemory Rate Limit으로 대체', responseTime: Demo.rand(1, 8) });
    if (c === 'database') { const slow = Math.random() < 0.05; return Object.assign(base, { status: slow ? 'DOWN' : 'UP', message: slow ? '커넥션 획득 시간 초과' : `PostgreSQL 응답 정상 (법인 ${db.corps.length}건)`, responseTime: slow ? 2500 : Demo.rand(3, 40) }); }
    if (c === 'member-service') return Object.assign(base, { status: 'UP', message: `회원 ${db.members.length}명 조회 정상`, responseTime: Demo.rand(4, 30) });
    return Object.assign(base, { status: 'UNKNOWN', message: '알 수 없는 컴포넌트', responseTime: 0 });
  }

  const health = {
    components: COMPONENTS,
    async check(components, checkType) {
      const list = components && components.length ? components : COMPONENTS;
      await Demo.delay(Demo.rand(300, 700));
      const results = list.map((c) => Object.assign({ id: uid(), checkType: checkType || 'manual' }, componentCheck(c)));
      db.healthHistory = results.concat(db.healthHistory).slice(0, 2000);
      save();
      const overall = results.every((r) => r.status === 'UP') ? 'UP' : (results.some((r) => r.status === 'DOWN') ? 'DOWN' : 'UNKNOWN');
      return ok({ overallStatus: overall, checkedAt: now(), components: results });
    },
    async system() { const latest = {}; db.healthHistory.forEach((h) => { if (!latest[h.component]) latest[h.component] = h; }); const comps = COMPONENTS.map((c) => latest[c] || { component: c, status: 'UNKNOWN', message: '기록 없음' }); return ok({ overallStatus: comps.every((x) => x.status === 'UP') ? 'UP' : 'DOWN', components: comps }); },
    async component(name) { const l = db.healthHistory.filter((h) => h.component === name); return ok({ component: name, latest: l[0] || null, recent: l.slice(0, 20) }); },
    async history(q) { let l = db.healthHistory; if (q.component) l = l.filter((h) => h.component === q.component); if (q.status) l = l.filter((h) => h.status === q.status); return ok(Demo.paginate(l, q.page || 1, q.size || 15)); },
    async cleanup(days) { const before = db.healthHistory.length; const lim = now() - (days || 3) * day; db.healthHistory = db.healthHistory.filter((h) => h.checkedAt >= lim); save(); return ok({ deleted: before - db.healthHistory.length }); },
    async metrics(days) {
      const lim = now() - (days || 7) * day;
      const res = {};
      COMPONENTS.forEach((c) => {
        const l = db.healthHistory.filter((h) => h.component === c && h.checkedAt >= lim);
        const up = l.filter((h) => h.status === 'UP');
        res[c] = { checks: l.length, uptime: l.length ? Math.round((up.length / l.length) * 1000) / 10 : 0, avgResponse: up.length ? Math.round(up.reduce((s, h) => s + h.responseTime, 0) / up.length) : 0, failures: l.length - up.length };
      });
      return ok(res);
    },
    async realtime() {
      await Demo.delay(60);
      return ok({ at: now(), cpu: Demo.rand(8, 62), memory: Demo.rand(35, 78), dbConnectionsActive: Demo.rand(1, 14), dbConnectionsMax: 20, requestsPerSec: Demo.rand(4, 40), redis: db.cache.redisUp ? 'UP' : 'DOWN' });
    }
  };

  async function mainStats() {
    const s = (await region.all()).data;
    return ok({ totalCorps: db.corps.length, regions: s.length, cities: new Set(s.map((r) => r.city)).size, avgCompletion: s.length ? Math.round(s.reduce((a, r) => a + r.completionRate, 0) / s.length * 10) / 10 : 0, top: s.slice(0, 10), recent: db.manualHistories.slice(0, 6), members: db.members.length, pending: db.members.filter((m) => m.status === 'PENDING').length });
  }

  return { REGIONS, corp, region, coseller, nplus1, file: fileApi, member, admin, health, mainStats };
})();
