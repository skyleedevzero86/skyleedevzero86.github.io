(() => {
  const { $, $$, esc, num, fmt, fmtDate, toast, modal, confirmBox, bytes, formData } = Demo;
  const A = AntockApi;
  let ME = null;
  const STATUS_KO = { PENDING: '승인 대기', APPROVED: '승인됨', REJECTED: '거부됨', SUSPENDED: '정지됨', WITHDRAWN: '탈퇴됨' };
  const ROLE_KO = { USER: '일반 사용자', MANAGER: '관리자', ADMIN: '시스템 관리자' };
  const statusBadge = (s) => `<span class="badge ${s === 'APPROVED' ? 'b-ok' : s === 'PENDING' ? 'b-warn' : s === 'SUSPENDED' || s === 'REJECTED' ? 'b-bad' : 'b-mute'}">${STATUS_KO[s] || s}</span>`;
  const corpBadge = (s) => `<span class="badge ${s === '계속사업자' ? 'b-ok' : s === '휴업자' ? 'b-warn' : 'b-bad'}">${esc(s)}</span>`;
  const hBadge = (s) => `<span class="badge ${s === 'UP' ? 'b-ok' : s === 'DOWN' ? 'b-bad' : 'b-mute'}">${s}</span>`;
  const rateBadge = (r) => `<span class="badge ${r >= 90 ? 'b-ok' : r >= 75 ? 'b-warn' : 'b-bad'}">${r}%</span>`;
  const call = async (fn, okMsg) => {
    try { const r = await fn(); if (okMsg) toast(okMsg, 'ok'); return r.data; }
    catch (e) { toast(`[${e.status || 400}] ${e.message}`, 'bad'); return undefined; }
  };
  const kpi = (label, value, delta) => `<div class="card kpi"><div class="label">${label}</div><div class="value">${value}</div>${delta ? `<div class="delta">${delta}</div>` : ''}</div>`;
  const fillCities = async (sel, all) => {
    const cities = (await A.corp.cities()).data;
    sel.innerHTML = (all ? `<option value="">${all}</option>` : '') + cities.map((c) => `<option>${esc(c)}</option>`).join('');
  };
  const fillDistricts = async (sel, city, all) => {
    const ds = city ? (await A.corp.districts(city)).data : [];
    sel.innerHTML = (all ? `<option value="">${all}</option>` : '') + ds.map((d) => `<option>${esc(d)}</option>`).join('');
  };

  const loaders = {};
  let rtTimer = null;

  function init() {
    Demo.nav((name) => {
      if (name !== 'health' && rtTimer) { clearInterval(rtTimer); rtTimer = null; }
      if (loaders[name]) loaders[name]();
    });
  }

  loaders.dashboard = async () => {
    const s = await call(() => A.mainStats());
    if (!s) return;
    const sum = await call(() => A.admin.summary());
    $('#dashKpis').innerHTML = kpi('전체 법인', num(s.totalCorps), `${s.cities}개 시/도 · ${s.regions}개 구/군`) + kpi('평균 완성도', s.avgCompletion + '%', '법인등록번호·지역코드 보유율') + kpi('회원', num(s.members), `승인 대기 ${s.pending}명`) + kpi('캐시 적중률', sum.cacheHitRate + '%', `Redis ${sum.redisStatus}`) + kpi('실패 청크', num(sum.failedChunks), '재처리 대기');
    Demo.barChart($('#dashChart'), s.top.map((r) => r.district), s.top.map((r) => r.totalCount));
    $('#dashRecent').innerHTML = s.recent.length ? s.recent.map((h) => `<tr><td>${fmt(h.at)}</td><td>${esc(h.city)} ${esc(h.district)}</td><td>${esc(h.action)}</td><td>${h.savedCount >= 0 ? num(h.savedCount) + '건' : '-'}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">아직 이력이 없습니다. 데이터 수집 메뉴에서 수집을 실행해 보세요.</td></tr>';
    $('#dashTop').innerHTML = s.top.map((r) => `<tr><td>${esc(r.city)}</td><td>${esc(r.district)}</td><td>${r.formattedCount}</td><td>${num(r.validCorpRegNoCount)}</td><td>${num(r.validRegionCdCount)}</td><td>${rateBadge(r.completionRate)}</td></tr>`).join('');
  };
  $('#dashRefresh').addEventListener('click', loaders.dashboard);

  let corpPage = 1;
  const corpQuery = () => ({ bizNm: $('#qBizNm').value.trim(), bizNo: $('#qBizNo').value.trim(), sellerId: $('#qSellerId').value.trim(), corpRegNo: $('#qCorpRegNo').value.trim(), city: $('#qCity').value, district: $('#qDistrict').value, corpStatus: $('#qStatus').value, sort: $('#qSort').value, page: corpPage });
  let corpInit = false;
  loaders.corp = async () => {
    if (!corpInit) {
      corpInit = true;
      await fillCities($('#qCity'), '시/도 전체');
      $('#qCity').addEventListener('change', () => fillDistricts($('#qDistrict'), $('#qCity').value, '구/군 전체'));
    }
    const q = corpQuery();
    const r = await call(() => A.corp.search(q));
    if (!r) return;
    const st = await call(() => A.corp.statistics(q));
    $('#corpStats').innerHTML = `<span class="badge b-info">검색 결과 ${num(st.total)}건</span><span class="badge b-mute">법인등록번호 보유 ${num(st.withCorpRegNo)}</span><span class="badge b-mute">지역코드 보유 ${num(st.withRegionCd)}</span>` + Object.entries(st.byStatus).map(([k, v]) => `<span class="badge b-mute">${esc(k)} ${num(v)}</span>`).join('');
    $('#corpRows').innerHTML = r.content.length ? r.content.map((c) => `<tr class="click" data-id="${c.id}"><td>${c.id}</td><td class="mono">${esc(c.sellerId)}</td><td>${esc(c.bizNm)}</td><td class="mono">${esc(c.bizNo)}</td><td class="mono">${esc(c.corpRegNo) || '<span class="muted">없음</span>'}</td><td>${esc(c.siNm)} ${esc(c.sggNm)}</td><td>${esc(c.repNm)}</td><td>${corpBadge(c.corpStatus)}</td><td>${esc(c.username)}</td><td><button class="btn btn-sm" data-edit="${c.id}">수정</button> <button class="btn btn-sm btn-danger" data-del="${c.id}">삭제</button></td></tr>`).join('') : '<tr><td colspan="10" class="muted">조건에 맞는 법인이 없습니다.</td></tr>';
    Demo.pager($('#corpPager'), r, (p) => { corpPage = p; loaders.corp(); });
    $$('#corpRows tr.click').forEach((tr) => tr.addEventListener('click', (e) => { if (e.target.closest('button')) return; corpDetail(tr.dataset.id); }));
    $$('#corpRows [data-edit]').forEach((b) => b.addEventListener('click', () => corpForm(Number(b.dataset.edit))));
    $$('#corpRows [data-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!(await confirmBox('이 법인 정보를 삭제할까요?'))) return;
      if (await call(() => A.corp.remove(b.dataset.del, ME.username), '삭제했습니다.')) loaders.corp();
    }));
  };
  $('#qSearch').addEventListener('click', () => { corpPage = 1; loaders.corp(); });
  $$('#page-corp .toolbar input').forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { corpPage = 1; loaders.corp(); } }));
  $('#qReset').addEventListener('click', () => { ['#qBizNm', '#qBizNo', '#qSellerId', '#qCorpRegNo'].forEach((s) => { $(s).value = ''; }); $('#qCity').value = ''; $('#qDistrict').innerHTML = '<option value="">구/군 전체</option>'; $('#qStatus').value = ''; $('#qSort').value = 'id,desc'; corpPage = 1; loaders.corp(); });
  $('#corpExport').addEventListener('click', async () => { const q = corpQuery(); const n = await call(() => A.corp.exportCsv(q)); if (n) toast(`${num(n)}건을 CSV로 내보냈습니다.`, 'ok'); });
  $('#corpNew').addEventListener('click', () => corpForm(null));
  $('#corpLookup').addEventListener('click', () => {
    modal('번호로 법인 조회', `<div class="form"><label>조회 기준<select id="lkType"><option value="biz">사업자번호 (/bizno/{bizNo})</option><option value="reg">법인등록번호 (/regno/{corpRegNo})</option><option value="id">ID (/{id})</option></select></label><label>번호<input id="lkVal" placeholder="000-00-00000" /></label></div><div id="lkRes" class="note"></div>`, [
      { label: '닫기' },
      { label: '조회', primary: true, onClick: async () => {
        const t = $('#lkType').value; const v = $('#lkVal').value.trim();
        const fn = t === 'biz' ? () => A.corp.getByBizNo(v) : t === 'reg' ? () => A.corp.getByCorpRegNo(v) : () => A.corp.getById(v);
        const c = await call(fn);
        $('#lkRes').innerHTML = c ? `<b>${esc(c.bizNm)}</b> · ${esc(c.bizNo)} · ${esc(c.siNm)} ${esc(c.sggNm)} · ${esc(c.repNm)} · ${esc(c.corpStatus)}<br><span class="muted">같은 번호로 다시 조회하면 캐시에서 응답합니다 (캐시 모니터링에서 확인).</span>` : '조회 결과가 없습니다.';
        return false;
      } }
    ]);
  });

  async function corpDetail(id) {
    const c = await call(() => A.corp.getById(id));
    if (!c) return;
    const row = (k, v) => `<tr><th style="width:130px">${k}</th><td style="white-space:normal">${v}</td></tr>`;
    modal(`법인 상세 #${c.id}`, `<table>${row('법인명', esc(c.bizNm))}${row('판매자ID', esc(c.sellerId))}${row('사업자번호', esc(c.bizNo))}${row('법인등록번호', esc(c.corpRegNo) || '-')}${row('지역코드', esc(c.regionCd) || '-')}${row('지역', esc(c.siNm + ' ' + c.sggNm))}${row('대표자', esc(c.repNm))}${row('설립일', esc(c.estbDt))}${row('도로명주소', esc(c.roadNmAddr))}${row('지번주소', esc(c.jibunAddr))}${row('상태', corpBadge(c.corpStatus))}${row('설명', esc(c.description))}${row('등록/수정', fmt(c.createdAt) + ' / ' + fmt(c.updatedAt))}</table>
      <h3 style="margin-top:16px">변경 이력</h3><table><thead><tr><th>시각</th><th>작업</th><th>사용자</th><th>내용</th></tr></thead><tbody>${c.histories.map((h) => `<tr><td>${fmt(h.at)}</td><td><span class="badge ${h.action === 'CREATE' ? 'b-ok' : 'b-info'}">${h.action}</span></td><td>${esc(h.username)}</td><td style="white-space:normal">${esc(h.detail)}</td></tr>`).join('')}</tbody></table>`,
      [{ label: '닫기' }, { label: '수정', primary: true, onClick: () => { setTimeout(() => corpForm(c.id), 50); } }]);
  }

  async function corpForm(id) {
    const c = id ? await call(() => A.corp.getById(id)) : { siNm: '', sggNm: '', corpStatus: '계속사업자' };
    if (!c) return;
    const cities = (await A.corp.cities()).data;
    const d8 = (s) => s && s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : '';
    const bg = modal(id ? `법인 수정 #${id}` : '법인 등록', `<div class="form" id="cf">
      <label>법인명 *<input name="bizNm" value="${esc(c.bizNm || '')}" /></label>
      <div class="row"><label style="flex:1">사업자번호 *<input name="bizNo" value="${esc(c.bizNo || '')}" placeholder="000-00-00000" /></label><label style="flex:1">법인등록번호<input name="corpRegNo" value="${esc(c.corpRegNo || '')}" placeholder="000000-0000000" /></label></div>
      <div class="row"><label style="flex:1">시/도 *<select name="siNm" id="cfCity"><option value="">선택</option>${cities.map((x) => `<option ${x === c.siNm ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label><label style="flex:1">구/군 *<select name="sggNm" id="cfDist"></select></label></div>
      <div class="row"><label style="flex:1">대표자<input name="repNm" value="${esc(c.repNm || '')}" /></label><label style="flex:1">설립일<input name="estbDt" type="date" value="${d8(c.estbDt)}" /></label></div>
      <label>도로명주소<input name="roadNmAddr" value="${esc(c.roadNmAddr || '')}" /></label>
      <label>지번주소<input name="jibunAddr" value="${esc(c.jibunAddr || '')}" /></label>
      <div class="row"><label style="flex:1">지역코드<input name="regionCd" value="${esc(c.regionCd || '')}" /></label><label style="flex:1">상태<select name="corpStatus">${['계속사업자', '휴업자', '폐업자'].map((s) => `<option ${s === c.corpStatus ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>
      <label>설명<textarea name="description" rows="2">${esc(c.description || '')}</textarea></label></div>`, [
      { label: '취소' },
      { label: id ? '수정 저장' : '등록', primary: true, onClick: async () => {
        const f = formData($('#cf'));
        const r = await call(() => id ? A.corp.update(id, f, ME.username) : A.corp.create(f, ME.username), id ? '수정했습니다. 변경 이력이 남았습니다.' : '등록했습니다.');
        if (!r) return false;
        loaders.corp();
      } }
    ]);
    const setD = async () => { await fillDistricts($('#cfDist', bg), $('#cfCity', bg).value, '선택'); if (c.sggNm) $('#cfDist', bg).value = c.sggNm; };
    $('#cfCity', bg).addEventListener('change', () => { c.sggNm = ''; setD(); });
    setD();
  }

  let collectInit = false;
  let collecting = false;
  const clog = (msg, cls) => { const l = $('#cLog'); l.innerHTML += `<span class="${cls || ''}">[${fmt(Date.now()).slice(11)}] ${esc(msg)}</span>\n`; l.scrollTop = l.scrollHeight; };
  loaders.collect = async () => {
    if (!collectInit) {
      collectInit = true;
      await fillCities($('#cCity'));
      $('#cCity').value = '전라남도';
      await fillDistricts($('#cDistrict'), '전라남도');
      $('#cDistrict').value = '여수시';
      $('#cCity').addEventListener('change', () => fillDistricts($('#cDistrict'), $('#cCity').value));
    }
    const failed = (await A.coseller.failedChunks()).data;
    $('#cFailed').innerHTML = failed.length ? failed.map((f) => `<tr><td>${fmt(f.at)}</td><td>${esc(f.fileName)}</td><td>${f.startIndex}</td><td>${f.size}</td><td style="white-space:normal">${esc(f.reason)}</td><td>${f.retried}</td><td><button class="btn btn-sm" data-retry="${f.id}">재처리</button></td></tr>`).join('') : '<tr><td colspan="7" class="muted">실패한 청크가 없습니다.</td></tr>';
    $$('[data-retry]').forEach((b) => b.addEventListener('click', async () => {
      b.disabled = true;
      const r = await call(() => A.coseller.retryChunk(b.dataset.retry, ME.username));
      if (r) { toast(`재처리 성공: ${r.saved}건 저장`, 'ok'); clog(`실패 청크 재처리 성공 (${r.saved}건)`, 'ok'); } else clog('실패 청크 재처리 실패', 'bad');
      loaders.collect();
    }));
    const hist = (await A.coseller.histories()).data;
    $('#cHistory').innerHTML = hist.length ? hist.map((h) => `<tr><td>${fmt(h.at)}</td><td>${esc(h.username)}</td><td>${esc(h.city)} ${esc(h.district)}</td><td>${esc(h.fileName)}</td><td>${esc(h.action)}</td><td>${h.savedCount >= 0 ? num(h.savedCount) : '-'}</td><td>${h.error ? `<span class="badge b-warn">${esc(h.error)}</span>` : '<span class="badge b-ok">없음</span>'}</td></tr>`).join('') : '<tr><td colspan="7" class="muted">이력이 없습니다.</td></tr>';
  };
  const runCollect = async (simple) => {
    if (collecting) return toast('이미 수집이 진행 중입니다.', 'bad');
    collecting = true;
    $('#cStart').disabled = true; $('#cSimple').disabled = true;
    $('#cBar').style.width = '0%';
    let total = 0;
    const res = await call(() => A.coseller.save($('#cCity').value, $('#cDistrict').value, ME.username, (p) => {
      if (p.type === 'start') { total = p.total; $('#cStatus').textContent = `${p.fileName} 처리 중`; clog(`CSV 읽기 시작: ${p.fileName} (${p.total}행, ${p.chunks}개 청크)`, 'warn'); }
      if (p.type === 'chunk') {
        $('#cBar').style.width = Math.round(p.done / total * 100) + '%';
        $('#cCount').textContent = `${p.done}/${total}행 · 저장 ${p.saved}건`;
        if (p.ok) clog(`청크 #${p.index + 1} (${p.start}~${p.start + p.size - 1}행) 저장 ${p.chunkSaved}건`, 'ok');
        else clog(`청크 #${p.index + 1} (${p.start}~${p.start + p.size - 1}행) 실패: ${p.reason} → 실패 청크로 기록, 다음 청크 계속`, 'bad');
      }
      if (p.type === 'end') clog(`완료: 저장 ${p.saved}건, 중복·검증 제외 ${p.skipped}건, 실패 청크 ${p.failed}개`, p.failed ? 'warn' : 'ok');
    }, { simple }));
    collecting = false;
    $('#cStart').disabled = false; $('#cSimple').disabled = false;
    $('#cStatus').textContent = res ? '완료' : '실패';
    if (res) toast(`${num(res.saved)}건 저장${res.failedChunks ? `, 실패 청크 ${res.failedChunks}개` : ''}`, res.failedChunks ? '' : 'ok');
    loaders.collect();
  };
  $('#cStart').addEventListener('click', () => runCollect(false));
  $('#cSimple').addEventListener('click', () => runCollect(true));
  $('#cRetryAll').addEventListener('click', async () => {
    const failed = (await A.coseller.failedChunks()).data;
    if (!failed.length) return toast('재처리할 청크가 없습니다.');
    let okN = 0;
    for (const f of failed) { try { const r = await A.coseller.retryChunk(f.id, ME.username); okN++; clog(`재처리 성공: ${f.fileName} 시작 ${f.startIndex} (${r.data.saved}건)`, 'ok'); } catch (e) { clog(`재처리 실패: ${f.fileName} 시작 ${f.startIndex} (${e.message})`, 'bad'); } }
    toast(`${failed.length}개 중 ${okN}개 재처리 성공`, okN === failed.length ? 'ok' : '');
    loaders.collect();
  });

  let regionPage = 1, regionInit = false;
  loaders.region = async () => {
    if (!regionInit) {
      regionInit = true;
      await fillCities($('#rCity'), '시/도 전체');
      $('#rCity').addEventListener('change', () => fillDistricts($('#rDistrict'), $('#rCity').value, '구/군 전체'));
    }
    const top = await call(() => A.region.top());
    $('#rTop').innerHTML = top ? `<span class="badge b-info">최다 지역: ${esc(top.city)} ${esc(top.district)} ${top.formattedCount}건 (완성도 ${top.completionRate}%)</span>` : '';
    const r = await call(() => A.region.paged({ city: $('#rCity').value, district: $('#rDistrict').value, sort: $('#rSort').value, page: regionPage }));
    if (!r) return;
    $('#rRows').innerHTML = r.content.map((x) => `<tr><td>${esc(x.city)}</td><td>${esc(x.district)}</td><td>${x.formattedCount}</td><td>${num(x.validCorpRegNoCount)}</td><td>${num(x.validRegionCdCount)}</td><td>${rateBadge(x.completionRate)}</td><td><button class="btn btn-sm" data-c="${esc(x.city)}" data-d="${esc(x.district)}">상세</button></td></tr>`).join('') || '<tr><td colspan="7" class="muted">데이터가 없습니다.</td></tr>';
    Demo.pager($('#rPager'), r, (p) => { regionPage = p; loaders.region(); });
    $$('#rRows [data-c]').forEach((b) => b.addEventListener('click', () => regionDetail(b.dataset.c, b.dataset.d, 1)));
  };
  async function regionDetail(city, district, page) {
    const r = await call(() => A.region.details(city, district, page));
    if (!r) return;
    const bg = modal(`${city} ${district} 법인 목록`, `<div class="table-wrap"><table><thead><tr><th>ID</th><th>법인명</th><th>사업자번호</th><th>법인등록번호</th><th>지역코드</th><th>상태</th></tr></thead><tbody>${r.content.map((c) => `<tr><td>${c.id}</td><td>${esc(c.bizNm)}</td><td class="mono">${esc(c.bizNo)}</td><td class="mono">${esc(c.corpRegNo) || '<span class="badge b-warn">없음</span>'}</td><td class="mono">${esc(c.regionCd) || '<span class="badge b-warn">없음</span>'}</td><td>${corpBadge(c.corpStatus)}</td></tr>`).join('')}</tbody></table></div><div class="pager" id="rdPager"></div>`);
    Demo.pager($('#rdPager', bg), r, (p) => regionDetail(city, district, p));
  }
  $('#rSearch').addEventListener('click', () => { regionPage = 1; loaders.region(); });
  $('#rFix').addEventListener('click', async () => { const r = await call(() => A.region.addMissingColumns()); if (r) { toast(r.message, 'ok'); loaders.region(); } });
  $('#rSample').addEventListener('click', async () => { const r = await call(() => A.region.addSampleData()); if (r) { toast(r.message, 'ok'); loaders.region(); } });
  $('#rExport').addEventListener('click', async () => { const n = await call(() => A.region.exportCsv()); if (n) toast(`${n}개 지역 현황을 내보냈습니다.`, 'ok'); });

  let filePage = 1;
  loaders.files = async () => {
    const cfg = (await A.admin.config()).data;
    $('#fStrategy').value = cfg.storageType;
    const r = await call(() => A.file.list(filePage, 8, $('#fSearch').value.trim()));
    if (!r) return;
    $('#fRows').innerHTML = r.content.length ? r.content.map((f) => `<tr><td>${f.id}</td><td>${esc(f.originalFileName)}</td><td>${bytes(f.size)}</td><td><span class="badge ${f.storage === 'minio' ? 'b-info' : 'b-mute'}">${f.storage === 'minio' ? 'MinIO' : 'Local'}</span></td><td>${esc(f.uploader)}</td><td>${f.downloads}</td><td><button class="btn btn-sm" data-fd="${f.id}">상세</button> <button class="btn btn-sm" data-fdl="${f.id}">받기</button> <button class="btn btn-sm" data-fe="${f.id}">수정</button> <button class="btn btn-sm btn-danger" data-fx="${f.id}">삭제</button></td></tr>`).join('') : '<tr><td colspan="7" class="muted">업로드한 파일이 없습니다.</td></tr>';
    Demo.pager($('#fPager'), r, (p) => { filePage = p; loaders.files(); });
    $$('[data-fd]').forEach((b) => b.addEventListener('click', async () => { const f = await call(() => A.file.info(b.dataset.fd)); if (f) modal(`파일 상세 #${f.id}`, `<table>${[['원본 파일명', f.originalFileName], ['저장 파일명', f.storedFileName], ['저장 경로', f.path], ['콘텐츠 타입', f.contentType], ['크기', bytes(f.size)], ['설명', f.description || '-'], ['업로더', f.uploader], ['업로드', fmt(f.uploadedAt)], ['수정', fmt(f.updatedAt)], ['다운로드 수', f.downloads]].map(([k, v]) => `<tr><th style="width:120px">${k}</th><td class="mono" style="white-space:normal">${esc(v)}</td></tr>`).join('')}</table>`); }));
    $$('[data-fdl]').forEach((b) => b.addEventListener('click', async () => { if (await call(() => A.file.download(b.dataset.fdl))) loaders.files(); }));
    $$('[data-fx]').forEach((b) => b.addEventListener('click', async () => { if (!(await confirmBox('파일을 삭제할까요?'))) return; if (await call(() => A.file.remove(b.dataset.fx, ME.username), '삭제했습니다.')) loaders.files(); }));
    $$('[data-fe]').forEach((b) => b.addEventListener('click', async () => {
      const f = await call(() => A.file.info(b.dataset.fe));
      if (!f) return;
      modal(`파일 수정 #${f.id}`, `<div class="form"><label>설명<input id="feDesc" value="${esc(f.description)}" /></label><label>파일 교체 (선택)<input type="file" id="feFile" /></label></div>`, [{ label: '취소' }, { label: '저장', primary: true, onClick: async () => { const r = await call(() => A.file.update(f.id, $('#feDesc').value, $('#feFile').files[0], ME.username), '수정했습니다.'); if (!r) return false; loaders.files(); } }]);
    }));
  };
  $('#fStrategy').addEventListener('change', async () => { await call(() => A.file.setStrategy($('#fStrategy').value), `저장소를 ${$('#fStrategy').value === 'minio' ? 'MinIO' : 'Local'}로 바꿨습니다. 이후 업로드부터 적용됩니다.`); });
  $('#fUpload').addEventListener('click', async () => {
    const r = await call(() => A.file.upload($('#fFile').files[0], $('#fDesc').value, ME.username), '업로드했습니다.');
    if (r) { $('#fFile').value = ''; $('#fDesc').value = ''; filePage = 1; loaders.files(); }
  });
  $('#fSearch').addEventListener('input', () => { filePage = 1; loaders.files(); });

  let memPage = 1;
  const memQuery = () => ({ status: $('#mStatus').value, role: $('#mRole').value, keyword: $('#mKeyword').value.trim(), page: memPage });
  loaders.members = async () => {
    const st = (await A.admin.memberStatistics()).data;
    $('#mKpis').innerHTML = kpi('전체 회원', num(st.total), `최근 7일 가입 ${st.joinedLast7Days}명`) + kpi('승인 대기', num(st.byStatus.PENDING || 0)) + kpi('승인됨', num(st.byStatus.APPROVED || 0)) + kpi('정지·거부', num((st.byStatus.SUSPENDED || 0) + (st.byStatus.REJECTED || 0))) + kpi('잠긴 계정', num(st.locked), '로그인 5회 실패');
    const r = await call(() => A.member.adminList(memQuery()));
    if (!r) return;
    $('#mRows').innerHTML = r.content.map((m) => {
      const acts = [];
      if (m.status === 'PENDING') acts.push(`<button class="btn btn-sm" data-ma="approve" data-id="${m.id}">승인</button>`, `<button class="btn btn-sm" data-ma="reject" data-id="${m.id}">거부</button>`);
      if (m.status === 'APPROVED' && m.role !== 'ADMIN') acts.push(`<button class="btn btn-sm" data-ma="suspend" data-id="${m.id}">정지</button>`);
      if (m.locked) acts.push(`<button class="btn btn-sm" data-ma="unlock" data-id="${m.id}">잠금 해제</button>`);
      if (['APPROVED', 'REJECTED', 'SUSPENDED'].includes(m.status) && m.role !== 'ADMIN') acts.push(`<button class="btn btn-sm" data-ma="pending" data-id="${m.id}">대기로</button>`);
      if (m.status === 'APPROVED') acts.push(`<select data-role="${m.id}" style="padding:3px 6px;border:1px solid var(--line);border-radius:6px">${['USER', 'MANAGER', 'ADMIN'].map((x) => `<option value="${x}" ${x === m.role ? 'selected' : ''}>${ROLE_KO[x]}</option>`).join('')}</select>`);
      if (m.role !== 'ADMIN') acts.push(`<button class="btn btn-sm btn-danger" data-ma="delete" data-id="${m.id}">삭제</button>`);
      return `<tr><td>${m.id}</td><td>${esc(m.username)}</td><td>${esc(m.nickname)}</td><td>${esc(m.email)}</td><td>${statusBadge(m.status)}${m.locked && m.status !== 'SUSPENDED' ? ' <span class="badge b-bad">잠김</span>' : ''}</td><td>${ROLE_KO[m.role]}</td><td>${m.loginFailCount}/5</td><td>${fmtDate(m.createdAt)}</td><td>${m.lastLoginAt ? fmt(m.lastLoginAt) : '-'}</td><td style="white-space:normal">${acts.join(' ')}</td></tr>`;
    }).join('') || '<tr><td colspan="10" class="muted">회원이 없습니다.</td></tr>';
    Demo.pager($('#mPager'), r, (p) => { memPage = p; loaders.members(); });
    $$('[data-ma]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.id, a = b.dataset.ma;
      if (a === 'delete' && !(await confirmBox('회원을 삭제할까요?'))) return;
      const fns = { approve: () => A.member.approve(id, ME.username), reject: () => A.member.reject(id), suspend: () => A.member.suspend(id), unlock: () => A.member.unlock(id), pending: () => A.member.resetToPending(id), delete: () => A.member.remove(id) };
      const msgs = { approve: '승인했습니다.', reject: '거부했습니다.', suspend: '정지했습니다.', unlock: '잠금을 해제했습니다.', pending: '승인 대기로 되돌렸습니다.', delete: '삭제했습니다.' };
      if (await call(fns[a], msgs[a])) loaders.members();
    }));
    $$('[data-role]').forEach((s) => s.addEventListener('change', async () => { await call(() => A.member.changeRole(s.dataset.role, s.value), '역할을 변경했습니다.'); loaders.members(); }));
  };
  $('#mSearch').addEventListener('click', () => { memPage = 1; loaders.members(); });
  $('#mPending').addEventListener('click', () => { $('#mStatus').value = 'PENDING'; memPage = 1; loaders.members(); });
  $('#mGenerate').addEventListener('click', () => modal('더미 회원 생성', `<div class="form"><label>생성 수 (1~200)<input id="gCount" type="number" value="10" /></label><label>상태<select id="gStatus"><option value="">무작위</option><option value="PENDING">승인 대기</option><option value="APPROVED">승인됨</option></select></label></div>`, [{ label: '취소' }, { label: '생성', primary: true, onClick: async () => { const r = await call(() => A.admin.generateMembers($('#gCount').value, $('#gStatus').value)); if (!r) return false; toast(`${r.generated}명 생성했습니다.`, 'ok'); loaders.members(); } }]));
  $('#mJoin').addEventListener('click', () => modal('회원가입 (/api/v1/members/join)', `<div class="form" id="jf"><label>아이디 (영문·숫자·_ 3~20자)<input name="username" /></label><label>비밀번호 (8자 이상, 영문+숫자)<input name="password" type="password" /></label><label>닉네임<input name="nickname" /></label><label>이메일<input name="email" /></label></div><p class="note">가입하면 승인 대기 상태로 등록되고, 관리자가 승인해야 로그인할 수 있습니다.</p>`, [{ label: '취소' }, { label: '가입', primary: true, onClick: async () => { const r = await call(() => A.member.join(formData($('#jf'))), '가입 신청이 접수되었습니다. (승인 대기)'); if (!r) return false; loaders.members(); } }]));
  $('#mLogin').addEventListener('click', () => modal('로그인 테스트 (/api/v1/members/login)', `<div class="form"><label>아이디<input id="ltId" value="kim_data" /></label><label>비밀번호<input id="ltPw" type="password" value="Pass1234!" /></label><label>접속 IP<input id="ltIp" value="10.0.0.15" /></label></div><div id="ltRes" class="note">시드 회원 비밀번호는 Pass1234! 입니다. 틀린 비밀번호를 5번 넣으면 계정이 잠기고, 같은 IP로 1분에 한도 이상 시도하면 429가 납니다.</div>`, [{ label: '닫기' }, { label: '로그인 시도', primary: true, onClick: async () => {
    try { const r = await A.member.login($('#ltId').value.trim(), $('#ltPw').value, $('#ltIp').value.trim()); $('#ltRes').innerHTML = `<span class="badge b-ok">200 OK</span> ${esc(r.data.member.nickname)} (${ROLE_KO[r.data.member.role]})<br><span class="mono" style="word-break:break-all">${esc(r.data.token)}</span>`; }
    catch (e) { $('#ltRes').innerHTML = `<span class="badge b-bad">${e.status}</span> ${esc(e.message)}`; }
    loaders.members(); return false;
  } }]));
  $('#mFind').addEventListener('click', () => modal('비밀번호 찾기·재설정', `<div class="form"><label>아이디<input id="pfId" value="lee_view" /></label><label>이메일<input id="pfEmail" value="lee_view@antock.dev" /></label><button class="btn" id="pfReq">재설정 토큰 요청</button><label>재설정 토큰<input id="pfToken" class="mono" /></label><label>새 비밀번호<input id="pfNew" type="password" /></label><label>새 비밀번호 확인<input id="pfNew2" type="password" /></label></div><div id="pfRes" class="note">실제 서비스에서는 토큰이 메일로 발송됩니다. 데모에서는 화면에 바로 채워 줍니다. 토큰은 30분간 유효하고 한 번만 쓸 수 있습니다.</div>`, [{ label: '닫기' }, { label: '토큰 검증', onClick: async () => { const v = await call(() => A.member.validateResetToken($('#pfToken').value.trim())); $('#pfRes').innerHTML = v ? '<span class="badge b-ok">유효한 토큰</span>' : '<span class="badge b-bad">유효하지 않거나 만료된 토큰</span>'; return false; } }, { label: '비밀번호 재설정', primary: true, onClick: async () => { const r = await call(() => A.member.resetPassword($('#pfToken').value.trim(), $('#pfNew').value, $('#pfNew2').value), '비밀번호를 재설정했습니다.'); if (!r) return false; loaders.members(); } }]));
  document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'pfReq') {
      const r = await call(() => A.member.findPassword($('#pfId').value.trim(), $('#pfEmail').value.trim()));
      if (r) { $('#pfToken').value = r.token; $('#pfRes').innerHTML = `<span class="badge b-ok">발송됨</span> ${esc(r.maskedEmail)} 으로 재설정 링크를 보냈습니다. (유효 ${r.expiresInMinutes}분)`; }
    }
  });

  loaders.profile = async () => {
    const p = await call(() => A.member.profile(ME.username));
    if (!p) return;
    $$('#pForm [name]').forEach((i) => { i.value = p[i.name] || ''; });
    $('#pMeta').innerHTML = `상태 ${statusBadge(p.status)} · 역할 ${ROLE_KO[p.role]} · 가입 ${fmtDate(p.createdAt)} · 최근 로그인 ${fmt(p.lastLoginAt)}`;
    const s = await call(() => A.member.passwordStatus(ME.username));
    $('#pwStatus').innerHTML = `<span class="badge ${s.changeRequired ? 'b-bad' : s.changeRecommended ? 'b-warn' : 'b-ok'}">${s.changeRequired ? '변경 필요 (90일 경과)' : s.changeRecommended ? '변경 권장 (60일 경과)' : '양호'}</span> <span class="muted">마지막 변경 ${fmtDate(s.passwordChangedAt)} (${s.daysSinceChange}일 전) · 오늘 변경 ${s.todayChangeCount}/${s.maxDailyChanges}회</span>`;
  };
  $('#pSave').addEventListener('click', async () => { const f = formData($('#pForm')); if (await call(() => A.member.updateProfile(ME.username, f), '프로필을 저장했습니다.')) loaders.profile(); });
  $('#pwSave').addEventListener('click', async () => { const f = formData($('#pwForm')); if (await call(() => A.member.changePassword(ME.username, f.cur, f.next, f.confirm), '비밀번호를 변경했습니다.')) { $$('#pwForm input').forEach((i) => { i.value = ''; }); loaders.profile(); } });
  $('#wdBtn').addEventListener('click', async () => { if (!(await confirmBox('정말 탈퇴할까요?'))) return; if (await call(() => A.member.withdraw(ME.username, $('#wdPw').value), '탈퇴 처리되었습니다.')) setTimeout(() => $('[data-logout]').click(), 800); });

  loaders.cache = async () => {
    const s = await call(() => A.admin.cacheStats());
    if (!s) return;
    $('#kKpis').innerHTML = kpi('Redis 상태', `<span class="badge ${s.redisStatus === 'UP' ? 'b-ok' : 'b-bad'}" style="font-size:16px">${s.redisStatus}</span>`, `현재 저장소: ${s.activeStore}`) + kpi('적중률', s.hitRate + '%', `hit ${num(s.hits)} · fallback ${num(s.fallbackHits)} · miss ${num(s.misses)}`) + kpi('캐시 항목', num(s.size)) + kpi('삭제(evict)', num(s.evictions));
    $('#kKeys').innerHTML = s.keys.length ? s.keys.map((k) => `<tr><td class="mono">${esc(k.key)}</td><td><span class="badge ${k.store === 'redis' ? 'b-info' : 'b-warn'}">${k.store}</span></td><td>${k.ttl}s</td></tr>`).join('') : '<tr><td colspan="3" class="muted">캐시가 비어 있습니다. 워밍업을 눌러 보세요.</td></tr>';
  };
  $('#kRedisDown').addEventListener('click', async () => { if (await call(() => A.admin.setRedis(false), 'Redis 장애를 발생시켰습니다. 메모리 캐시로 전환됩니다.') !== undefined) loaders.cache(); });
  $('#kRedisUp').addEventListener('click', async () => { if (await call(() => A.admin.setRedis(true), 'Redis를 복구했습니다.') !== undefined) loaders.cache(); });
  $('#kWarm').addEventListener('click', async () => { const n = await call(() => A.admin.warmUp()); if (n !== undefined) { toast(`캐시 항목 ${n}개`, 'ok'); loaders.cache(); } });
  $('#kRead').addEventListener('click', async () => { const k = $('#kKey').value.trim(); if (!k) return toast('키를 입력하세요.', 'bad'); const v = await call(() => A.admin.readCached(k)); modal('캐시 조회 결과', `<pre class="log" style="height:auto;max-height:300px">${esc(JSON.stringify(v, null, 2))}</pre>`); loaders.cache(); });
  $('#kEvictMembers').addEventListener('click', async () => { const r = await call(() => A.admin.evictMembers()); if (r) { toast(`회원 캐시 ${r.evicted}개 삭제`, 'ok'); loaders.cache(); } });
  $('#kEvictMember').addEventListener('click', async () => { const id = $('#kMemberId').value; if (!id) return toast('회원 ID를 입력하세요.', 'bad'); const r = await call(() => A.admin.evictMember(id)); if (r) { toast(`회원 #${id} 캐시 ${r.evicted}개 삭제`, 'ok'); loaders.cache(); } });
  $('#kEvictAll').addEventListener('click', async () => { if (!(await confirmBox('모든 캐시를 삭제할까요?'))) return; const r = await call(() => A.admin.evictAll()); if (r) { toast(`${r.evicted}개 삭제`, 'ok'); loaders.cache(); } });

  loaders.ratelimit = async () => {
    const s = await call(() => A.admin.rateStatus());
    if (!s) return;
    $('#rlKpis').innerHTML = kpi('분당 한도', num(s.perMinute), '식별자·액션별') + kpi('전체 요청', num(s.total)) + kpi('거부', num(s.rejected), '429 + 403') + kpi('차단 식별자', num(s.blocked.length)) + kpi('저장 전략', `<span style="font-size:15px">${esc(s.strategy)}</span>`);
    $('#rlLists').innerHTML = s.blocked.map((b) => `<tr><td><span class="badge b-bad">차단</span></td><td class="mono">${esc(b.identifier)}</td><td style="white-space:normal">${esc(b.reason)}<br><span class="muted">${b.until ? '만료 ' + fmt(b.until) : '영구'}</span></td><td><button class="btn btn-sm" data-unblock="${esc(b.identifier)}">해제</button></td></tr>`).join('') + s.whitelist.map((w) => `<tr><td><span class="badge b-ok">허용</span></td><td class="mono">${esc(w)}</td><td>-</td><td><button class="btn btn-sm" data-wlrm="${esc(w)}">제거</button></td></tr>`).join('');
    $('#rlCounters').innerHTML = s.counters.length ? s.counters.map((c) => `<tr><td class="mono">${esc(c.identifier)}</td><td>${esc(c.action)}</td><td>${c.count}</td><td>${c.remaining}</td><td>${c.resetIn}s</td></tr>`).join('') : '<tr><td colspan="5" class="muted">현재 1분 창에 요청이 없습니다.</td></tr>';
    $('#rlLog').innerHTML = s.log.map((l) => `<tr><td>${fmt(l.at).slice(11)}</td><td class="mono">${esc(l.identifier)}</td><td>${esc(l.action)}</td><td><span class="badge ${l.result === 'ALLOWED' || l.result === 'WHITELIST' ? 'b-ok' : 'b-bad'}">${l.result}</span></td></tr>`).join('');
    $$('[data-unblock]').forEach((b) => b.addEventListener('click', async () => { if (await call(() => A.admin.unblock(b.dataset.unblock), '차단을 해제했습니다.')) loaders.ratelimit(); }));
    $$('[data-wlrm]').forEach((b) => b.addEventListener('click', async () => { if (await call(() => A.admin.whitelistRemove(b.dataset.wlrm), '화이트리스트에서 제거했습니다.')) loaders.ratelimit(); }));
  };
  $('#rlSend').addEventListener('click', async () => {
    const r = await call(() => A.admin.simulate($('#rlId').value.trim(), $('#rlAction').value, Math.min(500, Number($('#rlCount').value) || 1)));
    if (r) $('#rlResult').innerHTML = `허용 <b>${r.allowed}</b> · 화이트리스트 <b>${r.whitelisted}</b> · 429 한도 초과 <b>${r.limited}</b> · 403 차단 <b>${r.blocked}</b>${r.autoBlocked ? ' · <span class="badge b-bad">한도 초과 반복으로 10분 자동 차단</span>' : ''}`;
    loaders.ratelimit();
  });
  $('#rlCurrent').addEventListener('click', async () => { const r = await call(() => A.admin.rateCurrent($('#rlId').value.trim(), $('#rlAction').value)); if (r) $('#rlResult').textContent = `${r.identifier} / ${r.action}: 현재 ${r.count}회, 남은 ${r.remaining}회`; });
  $('#rlReset').addEventListener('click', async () => { if (await call(() => A.admin.rateReset($('#rlId').value.trim(), $('#rlAction').value), '카운트를 초기화했습니다.')) loaders.ratelimit(); });
  $('#rlInfo').addEventListener('click', async () => { const r = await call(() => A.admin.rateSecurity($('#rlId').value.trim())); if (r) $('#rlResult').innerHTML = `${esc(r.identifier)} · 차단 ${r.blocked ? '예' : '아니오'} · 화이트리스트 ${r.whitelisted ? '예' : '아니오'} · 최근 로그 요청 ${r.totalRequests} · 거부 ${r.rejected} · 마지막 ${fmt(r.lastSeen)}`; });
  $('#rlBlock').addEventListener('click', async () => { if (await call(() => A.admin.block($('#rlBlockId').value.trim(), Number($('#rlBlockMin').value)), '차단했습니다.')) { $('#rlBlockId').value = ''; loaders.ratelimit(); } });
  $('#rlWlAdd').addEventListener('click', async () => { if (await call(() => A.admin.whitelistAdd($('#rlWlId').value.trim()), '화이트리스트에 추가했습니다.')) { $('#rlWlId').value = ''; loaders.ratelimit(); } });

  let healthPage = 1, healthInit = false, rtPaused = false;
  const rt = { labels: [], cpu: [], mem: [], rps: [] };
  const tickRt = async () => {
    if (rtPaused) return;
    const m = (await A.health.realtime()).data;
    rt.labels.push(fmt(m.at).slice(14)); rt.cpu.push(m.cpu); rt.mem.push(m.memory); rt.rps.push(m.requestsPerSec);
    ['labels', 'cpu', 'mem', 'rps'].forEach((k) => { if (rt[k].length > 30) rt[k].shift(); });
    if ($('#page-health').classList.contains('on')) Demo.lineChart($('#hRtChart'), rt.labels, [{ label: 'CPU %', color: '#2f6fed', data: rt.cpu }, { label: '메모리 %', color: '#1f9d55', data: rt.mem }, { label: '요청/초', color: '#c27c0e', data: rt.rps }]);
  };
  loaders.health = async () => {
    if (!healthInit) {
      healthInit = true;
      $('#hComps').innerHTML = A.health.components.map((c) => `<label class="row" style="gap:4px"><input type="checkbox" value="${c}" checked /> ${c}</label>`).join('');
      $('#hFilterComp').innerHTML = '<option value="">전체 컴포넌트</option>' + A.health.components.map((c) => `<option>${c}</option>`).join('');
      $('#hFilterComp').addEventListener('change', () => { healthPage = 1; loadHealthHistory(); });
      $('#hFilterStatus').addEventListener('change', () => { healthPage = 1; loadHealthHistory(); });
      $('#hDays').addEventListener('change', loadHealthMetrics);
    }
    const sys = (await A.health.system()).data;
    $('#hOverall').innerHTML = `전체 상태 ${hBadge(sys.overallStatus)}`;
    $('#hCards').innerHTML = sys.components.map((c) => `<div class="card kpi" style="cursor:pointer" data-hc="${c.component}"><div class="label">${c.component}</div><div class="value">${hBadge(c.status)}</div><div class="delta">${esc(c.message || '')}${c.responseTime ? ` · ${c.responseTime}ms` : ''}</div></div>`).join('');
    $$('[data-hc]').forEach((d) => d.addEventListener('click', async () => {
      const r = (await A.health.component(d.dataset.hc)).data;
      modal(`컴포넌트: ${r.component}`, `<table><thead><tr><th>시각</th><th>상태</th><th>응답</th><th>메시지</th></tr></thead><tbody>${r.recent.map((h) => `<tr><td>${fmt(h.checkedAt)}</td><td>${hBadge(h.status)}</td><td>${h.responseTime}ms</td><td style="white-space:normal">${esc(h.message)}</td></tr>`).join('')}</tbody></table>`);
    }));
    loadHealthMetrics();
    loadHealthHistory();
    if (!rtTimer) { tickRt(); rtTimer = setInterval(tickRt, 3000); }
  };
  async function loadHealthMetrics() {
    const m = (await A.health.metrics(Number($('#hDays').value))).data;
    $('#hMetrics').innerHTML = Object.entries(m).map(([c, v]) => `<tr><td>${c}</td><td>${v.checks}</td><td>${rateBadge(v.uptime)}</td><td>${v.avgResponse}ms</td><td>${v.failures}</td></tr>`).join('');
  }
  async function loadHealthHistory() {
    const r = (await A.health.history({ component: $('#hFilterComp').value, status: $('#hFilterStatus').value, page: healthPage })).data;
    $('#hRows').innerHTML = r.content.map((h) => `<tr><td>${fmt(h.checkedAt)}</td><td>${h.component}</td><td>${hBadge(h.status)}</td><td>${h.responseTime}</td><td>${h.checkType}</td><td style="white-space:normal">${esc(h.message)}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">이력이 없습니다.</td></tr>';
    Demo.pager($('#hPager'), r, (p) => { healthPage = p; loadHealthHistory(); });
  }
  $('#hRun').addEventListener('click', async () => {
    const comps = $$('#hComps input:checked').map((i) => i.value);
    if (!comps.length) return toast('점검할 컴포넌트를 선택하세요.', 'bad');
    $('#hRun').disabled = true;
    const r = await call(() => A.health.check(comps, 'manual'));
    $('#hRun').disabled = false;
    if (r) { toast(`점검 완료: 전체 ${r.overallStatus}`, r.overallStatus === 'UP' ? 'ok' : 'bad'); healthPage = 1; loaders.health(); }
  });
  $('#hCleanup').addEventListener('click', async () => { const r = await call(() => A.health.cleanup(3)); if (r) { toast(`${r.deleted}건 정리했습니다.`, 'ok'); loaders.health(); } });
  $('#hRtToggle').addEventListener('click', () => { rtPaused = !rtPaused; $('#hRtToggle').textContent = rtPaused ? '재개' : '일시정지'; });

  loaders.system = async () => {
    const s = await call(() => A.admin.summary());
    if (!s) return;
    $('#sKpis').innerHTML = kpi('법인 데이터', num(s.corps)) + kpi('파일', num(s.files), bytes(s.fileBytes)) + kpi('캐시 적중률', s.cacheHitRate + '%', `Redis ${s.redisStatus}`) + kpi('Rate Limit 거부', num(s.rateRejected), `전체 ${num(s.rateTotal)}건`) + kpi('JVM Heap', `${s.jvm.heapUsedMb}MB`, `최대 ${s.jvm.heapMaxMb}MB · 스레드 ${s.jvm.threads}`);
    const sec = (await A.admin.securityOverview()).data;
    $('#secOverview').innerHTML = `<div class="row" style="margin-bottom:10px"><span class="badge b-bad">잠긴 계정 ${sec.lockedAccounts.length}</span><span class="badge b-warn">정지 ${sec.suspended}</span><span class="badge b-bad">차단 식별자 ${sec.blockedIdentifiers}</span><span class="badge b-ok">화이트리스트 ${sec.whitelist}</span><span class="badge b-warn">비밀번호 변경 필요 ${sec.passwordChangeRequired}</span></div><table><thead><tr><th>액션</th><th>요청</th><th>거부</th></tr></thead><tbody>${Object.entries(sec.byAction).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.total}</td><td>${v.rejected}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">요청 기록이 없습니다.</td></tr>'}</tbody></table>`;
    const cfg = (await A.admin.config()).data;
    $$('#cfgForm [name]').forEach((i) => { i.value = cfg[i.name]; });
    const ms = (await A.admin.memberStatistics()).data;
    $('#memberStats').innerHTML = `<table><tbody>${Object.entries(ms.byStatus).map(([k, v]) => `<tr><td>${STATUS_KO[k] || k}</td><td>${v}명</td></tr>`).join('')}${Object.entries(ms.byRole).map(([k, v]) => `<tr><td>${ROLE_KO[k]}</td><td>${v}명</td></tr>`).join('')}</tbody></table>`;
  };
  $('#nRun').addEventListener('click', async () => {
    $('#nResult').innerHTML = '<span class="muted">측정 중...</span>';
    const r = await call(() => A.nplus1.report($('#nLimit').value));
    if (!r) return;
    $('#nResult').innerHTML = `<table><thead><tr><th>방식</th><th>쿼리 수</th><th>소요(ms)</th></tr></thead><tbody><tr><td>지연 로딩 그대로 (N+1)</td><td><b style="color:var(--bad)">${num(r.withoutBatch.queries)}</b></td><td>${num(r.withoutBatch.ms)}</td></tr><tr><td>@BatchSize(${r.withBatchSize.batchSize})</td><td><b style="color:var(--ok)">${num(r.withBatchSize.queries)}</b></td><td>${num(r.withBatchSize.ms)}</td></tr></tbody></table><p class="note">법인 ${num(r.limit)}건과 이력 연관관계를 조회할 때 StatementInspector로 실행 쿼리 수를 셉니다. 실제 프로젝트 테스트에서는 2,000건 기준 2,001회 → 21회로 고정해 두었습니다.</p>`;
  });
  $('#cfgSave').addEventListener('click', async () => { if (await call(() => A.admin.updateConfig(formData($('#cfgForm'))), '설정을 저장했습니다.')) loaders.system(); });
  $('#resetAll').addEventListener('click', async () => { if (!(await confirmBox('데모 데이터를 처음 상태로 되돌릴까요?'))) return; await call(() => A.admin.resetAll(), '초기화했습니다.'); ME = A.member.ensure(ME.username); loaders.system(); });

  window.addEventListener('resize', () => { const on = $('.page.on'); if (on && (on.id === 'page-dashboard')) loaders.dashboard(); });

  Demo.auth('antock', (user) => {
    ME = A.member.ensure(user.name);
    if (!Demo.session.get('antock-boot')) Demo.session.set('antock-boot', Date.now());
    init();
  });
})();
