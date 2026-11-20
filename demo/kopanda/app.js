(() => {
  const { $, $$, esc, num, fmt, toast, modal, confirmBox, bytes, formData } = Demo;
  const K = KopandaApi;
  let USER = null;
  let CID = Demo.session.get('kopanda-cid') || 'conn-local';
  let currentPage = 'dashboard';
  let unsubMetrics = null;
  let selectedGroup = null;
  let selectedConnHist = null;
  let msgTimer = null;
  let alertTimer = null;
  const live = { labels: [], mps: [], bin: [], bout: [] };

  const call = async (fn, okMsg) => {
    try { const r = await fn(); if (okMsg) toast(okMsg, 'ok'); return r.data; }
    catch (e) { toast(`[${e.status || 400}] ${e.message}`, 'bad'); return undefined; }
  };
  const kpi = (label, value, delta) => `<div class="card kpi"><div class="label">${label}</div><div class="value">${value}</div>${delta ? `<div class="delta">${delta}</div>` : ''}</div>`;
  const stBadge = (s) => `<span class="badge ${s === 'CONNECTED' ? 'b-ok' : s === 'CONNECTING' ? 'b-warn' : 'b-bad'}">${s}</span>`;
  const gBadge = (s) => `<span class="badge ${s === 'Stable' ? 'b-ok' : s === 'Empty' ? 'b-mute' : 'b-warn'}">${s}</span>`;
  const sevBadge = (s) => `<span class="badge sev-${s}">${s}</span>`;
  const okBadge = (b, t, f) => `<span class="badge ${b ? 'b-ok' : 'b-bad'}">${b ? (t || '정상') : (f || '비정상')}</span>`;
  const shortTime = (t) => fmt(t).slice(11);

  async function loadConnSelect() {
    const list = (await K.connections.list()).data;
    if (!list.find((c) => c.id === CID) && list.length) CID = list[0].id;
    $('#connSelect').innerHTML = list.map((c) => `<option value="${c.id}" ${c.id === CID ? 'selected' : ''}>${esc(c.name)} ${c.status === 'CONNECTED' ? '●' : '○'}</option>`).join('');
    Demo.session.set('kopanda-cid', CID);
  }

  function subscribeMetrics() {
    if (unsubMetrics) unsubMetrics();
    live.labels = []; live.mps = []; live.bin = []; live.bout = [];
    unsubMetrics = K.ws.subscribe('/topic/metrics/' + CID, (msg) => {
      const m = msg.data;
      live.labels.push(shortTime(m.timestamp)); live.mps.push(m.messagesPerSecond || 0); live.bin.push(m.bytesInPerSec || 0); live.bout.push(m.bytesOutPerSec || 0);
      ['labels', 'mps', 'bin', 'bout'].forEach((k) => { if (live[k].length > 45) live[k].shift(); });
      if (currentPage === 'dashboard') {
        Demo.lineChart($('#dChart'), live.labels, [{ label: '초당 메시지', color: '#e8590c', data: live.mps }]);
        const el = $('#kMps'); if (el) el.textContent = num(m.messagesPerSecond);
      }
      if (currentPage === 'metrics') renderPerfLive();
      if (currentPage === 'groups') refreshGroupsLight();
    });
  }

  K.ws.subscribe('/topic/global', (msg) => {
    if (msg.type === 'ALERT') { updateAlertCount(); if (currentPage === 'alerts') loaders.alerts(); }
    if (msg.type === 'ACTIVITY' && currentPage === 'activities') loaders.activities();
  });

  async function updateAlertCount() {
    const a = (await K.alerts.active()).data;
    const el = $('#alertCount');
    el.style.display = a.length ? 'inline-block' : 'none';
    el.textContent = a.length;
  }

  const loaders = {};

  loaders.dashboard = async () => {
    const d = await call(() => K.monitoring.dashboard(CID));
    if (!d) return;
    const m = d.metrics;
    const totalLag = d.groups.reduce((s, g) => s + g.totalLag, 0);
    $('#dKpis').innerHTML = kpi('연결', stBadge(d.connection.status), `${esc(d.connection.host)}:${d.connection.port}`) + kpi('브로커', `${m.brokerCount}/${d.brokers.length}`, `컨트롤러 #${d.controllerId}`) + kpi('토픽 / 파티션', `${m.topicCount} / ${m.totalPartitions}`) + kpi('초당 메시지', `<span id="kMps">${num(m.messagesPerSecond)}</span>`, 'WebSocket 2초 갱신') + kpi('총 컨슈머 랙', num(totalLag), `${d.groups.length}개 그룹`);
    $('#dHealth').innerHTML = `${okBadge(d.health.isHealthy, '건강', '이상')} <span class="muted">점수 ${d.health.healthScore}</span>`;
    $('#dIssues').innerHTML = d.health.issues.length ? d.health.issues.map((i) => `<div style="margin-bottom:4px">${sevBadge(i.severity)} ${esc(i.message)}</div>`).join('') : '<span class="muted">감지된 이슈가 없습니다.</span>';
    $('#dBrokers').innerHTML = d.brokers.map((b) => `<span class="badge ${b.up ? 'b-ok' : 'b-bad'}" style="margin-right:6px">브로커 ${b.id} ${b.up ? 'UP' : 'DOWN'}${b.id === d.controllerId ? ' · 컨트롤러' : ''}</span>`).join('');
    $('#dTopics').innerHTML = d.topTopics.map((t) => `<tr><td>${esc(t.name)}</td><td>${t.partitionCount}</td><td>${t.replicationFactor}</td><td>${num(t.messageCount)}</td><td>${okBadge(t.isHealthy)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">토픽이 없습니다.</td></tr>';
    $('#dGroups').innerHTML = d.groups.map((g) => `<tr><td>${esc(g.groupId)}</td><td>${esc(g.topic)}</td><td>${gBadge(g.state)}</td><td>${g.memberCount}</td><td><b style="color:${g.totalLag > 500 ? 'var(--bad)' : 'inherit'}">${num(g.totalLag)}</b></td></tr>`).join('') || '<tr><td colspan="5" class="muted">컨슈머 그룹이 없습니다.</td></tr>';
    $('#dActs').innerHTML = d.recentActivities.map((a) => `<tr><td style="width:30px"><i class="fas fa-${a.icon}"></i></td><td>${fmt(a.timestamp)}</td><td><b>${esc(a.title)}</b></td><td style="white-space:normal">${esc(a.message)}</td></tr>`).join('') || '<tr><td class="muted">활동이 없습니다.</td></tr>';
    if (!live.labels.length && d.history.length) { d.history.forEach((h) => { live.labels.push(shortTime(h.t)); live.mps.push(h.mps); live.bin.push(h.bin); live.bout.push(h.bout); }); }
    Demo.lineChart($('#dChart'), live.labels, [{ label: '초당 메시지', color: '#e8590c', data: live.mps }]);
  };
  $('#wsToggle').addEventListener('click', () => {
    const on = !K.ws.connected;
    K.ws.setConnected(on);
    $('#wsToggle').textContent = on ? 'WebSocket 끊기' : 'WebSocket 다시 연결';
    $('#wsState').innerHTML = on ? '<span class="dot ok"></span> WebSocket 연결됨' : '<span class="dot bad"></span> WebSocket 끊김 (실시간 갱신 멈춤)';
    toast(on ? 'WebSocket을 다시 연결했습니다.' : 'WebSocket을 끊었습니다. 차트 갱신이 멈춥니다.');
  });

  loaders.connections = async () => {
    const list = await call(() => K.connections.list());
    if (!list) return;
    $('#cRows').innerHTML = list.map((c) => `<tr><td><b>${esc(c.name)}</b>${c.id === CID ? ' <span class="badge b-info">선택됨</span>' : ''}</td><td class="mono">${esc(c.host)}:${c.port}</td><td>${c.sslEnabled ? '<span class="badge b-info">SSL</span>' : ''} ${c.saslEnabled ? `<span class="badge b-info">SASL ${esc(c.username || '')}</span>` : ''}${!c.sslEnabled && !c.saslEnabled ? '<span class="muted">PLAINTEXT</span>' : ''}</td><td>${stBadge(c.status)}</td><td>${c.lastConnected ? fmt(c.lastConnected) : '-'}</td><td>${fmt(c.createdAt).slice(0, 10)}</td><td style="white-space:normal"><button class="btn btn-sm" data-use="${c.id}">사용</button> <button class="btn btn-sm" data-ping="${c.id}">Ping</button> <button class="btn btn-sm" data-status="${c.id}">상태</button> <button class="btn btn-sm" data-hist="${c.id}">이력</button> <button class="btn btn-sm" data-edit="${c.id}">수정</button> <button class="btn btn-sm btn-danger" data-del="${c.id}">삭제</button></td></tr>`).join('');
    $$('[data-use]').forEach((b) => b.addEventListener('click', async () => { CID = b.dataset.use; await loadConnSelect(); subscribeMetrics(); toast('사용할 연결을 바꿨습니다.', 'ok'); loaders.connections(); }));
    $$('[data-ping]').forEach((b) => b.addEventListener('click', async () => { const r = await call(() => K.connections.ping(b.dataset.ping)); if (r) toast(r.isAlive ? `응답 ${r.responseTimeMs}ms` : r.error, r.isAlive ? 'ok' : 'bad'); await loadConnSelect(); loaders.connections(); }));
    $$('[data-status]').forEach((b) => b.addEventListener('click', async () => { const s = await call(() => K.connections.status(b.dataset.status)); if (s) modal('연결 상태', `<table>${[['상태', stBadge(s.status)], ['브로커 수', s.brokerCount ?? '-'], ['토픽 수', s.topicCount ?? '-'], ['확인 시각', fmt(s.lastChecked)], ['오류', esc(s.errorMessage || '-')]].map(([k, v]) => `<tr><th style="width:120px">${k}</th><td>${v}</td></tr>`).join('')}</table>`); }));
    $$('[data-hist]').forEach((b) => b.addEventListener('click', () => { selectedConnHist = b.dataset.hist; loadConnHist(); }));
    $$('[data-edit]').forEach((b) => b.addEventListener('click', () => connForm(b.dataset.edit)));
    $$('[data-del]').forEach((b) => b.addEventListener('click', async () => { if (!(await confirmBox('연결을 삭제할까요? 이 연결의 토픽·그룹 정보도 화면에서 사라집니다.'))) return; if (await call(() => K.connections.remove(b.dataset.del), '삭제했습니다.')) { await loadConnSelect(); subscribeMetrics(); loaders.connections(); } }));
    const hs = (await K.connections.allHealth()).data;
    $('#cHealth').innerHTML = hs.map((h) => `<div class="broker ${h.isHealthy ? '' : 'down'}"><div><b>${esc(h.connectionName)}</b><div class="muted" style="font-size:12px">${h.issues.map((i) => esc(i.message)).join(' · ') || '이슈 없음'}</div></div><div>${okBadge(h.isHealthy, '건강', '이상')} <span class="muted">${h.healthScore}점</span></div></div>`).join('');
    if (!selectedConnHist) selectedConnHist = CID;
    loadConnHist();
  };
  async function loadConnHist() {
    const c = (await K.connections.list()).data.find((x) => x.id === selectedConnHist);
    $('#cHistName').textContent = c ? `(${c.name})` : '';
    const h = (await K.connections.history(selectedConnHist)).data;
    $('#cHist').innerHTML = h.map((x) => `<tr><td>${fmt(x.timestamp)}</td><td>${stBadge(x.status)}</td><td>${x.latency ? x.latency + 'ms' : '-'}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">이력이 없습니다. Ping을 눌러 보세요.</td></tr>';
  }
  async function connForm(id) {
    const c = id ? (await K.connections.get(id)).data : { name: '', host: 'localhost', port: 9092, sslEnabled: false, saslEnabled: false, username: '' };
    const bg = modal(id ? '연결 수정' : '연결 추가', `<div class="form" id="cf"><label>이름<input name="name" value="${esc(c.name)}" /></label><div class="row"><label style="flex:1">호스트<input name="host" value="${esc(c.host)}" /></label><label style="width:110px">포트<input name="port" type="number" value="${c.port}" /></label></div><div class="row"><label class="row" style="gap:4px"><input type="checkbox" name="sslEnabled" ${c.sslEnabled ? 'checked' : ''} /> SSL</label><label class="row" style="gap:4px"><input type="checkbox" name="saslEnabled" id="cfSasl" ${c.saslEnabled ? 'checked' : ''} /> SASL</label></div><div class="row" id="cfSaslBox" style="${c.saslEnabled ? '' : 'display:none'}"><label style="flex:1">사용자명<input name="username" value="${esc(c.username || '')}" /></label><label style="flex:1">비밀번호<input name="password" type="password" placeholder="${id ? '변경 시에만 입력' : ''}" /></label></div></div><div id="cfRes" class="note">보안 설정(SSL/SASL)은 연결 테스트에 사용됩니다. 비밀번호를 wrong으로 넣으면 인증 실패를 재현합니다.</div>`, [
      { label: '취소' },
      { label: '연결 테스트', onClick: async () => { const r = (await K.connections.test(formData($('#cf')))).data; $('#cfRes').innerHTML = r.success ? `<span class="badge b-ok">성공</span> ${r.latency}ms · 브로커 ${r.brokerInfo.brokerCount}대 · Kafka ${r.brokerInfo.version}` : `<span class="badge b-bad">실패</span> ${esc(r.error)}`; return false; } },
      { label: id ? '저장' : '추가', primary: true, onClick: async () => { const f = formData($('#cf')); const r = await call(() => id ? K.connections.update(id, f) : K.connections.create(f), id ? '수정했습니다.' : '연결을 추가했습니다.'); if (!r) return false; if (r.status !== 'CONNECTED') toast('저장은 됐지만 연결 테스트에 실패했습니다.', 'bad'); await loadConnSelect(); loaders.connections(); } }
    ]);
    $('#cfSasl', bg).addEventListener('change', (e) => { $('#cfSaslBox', bg).style.display = e.target.checked ? '' : 'none'; });
  }
  $('#cNew').addEventListener('click', () => connForm(null));
  $('#cRefresh').addEventListener('click', async () => { $('#cRefresh').disabled = true; await call(() => K.connections.refreshAll(), '모든 연결 상태를 새로고침했습니다.'); $('#cRefresh').disabled = false; await loadConnSelect(); loaders.connections(); });

  loaders.cluster = async () => {
    const ci = await call(() => K.monitoring.clusterInfo(CID));
    if (!ci) { $('#clBrokers').innerHTML = '<span class="muted">연결된 클러스터가 아닙니다.</span>'; return; }
    const dm = (await K.monitoring.detailedMetrics(CID)).data;
    $('#clKpis').innerHTML = kpi('클러스터 ID', `<span class="mono" style="font-size:15px">${ci.clusterId}</span>`, `Kafka ${ci.kafkaVersion}`) + kpi('컨트롤러', `#${ci.controllerId}`) + kpi('복제 부족 파티션', num(dm.underReplicated)) + kpi('오프라인 파티션', num(dm.offline)) + kpi('전체 메시지', num(dm.totalMessages));
    $('#clBrokers').innerHTML = ci.brokers.map((b) => `<div class="broker ${b.up ? '' : 'down'}"><div><b>브로커 #${b.id}</b> ${b.id === ci.controllerId ? '<span class="badge b-info">컨트롤러</span>' : ''}<div class="muted mono">${esc(b.host)}:${b.port} · ${b.rack} · 리더 ${b.leaderPartitions} · 레플리카 ${b.replicaPartitions}</div></div><div>${okBadge(b.up, 'UP', 'DOWN')} <button class="btn btn-sm ${b.up ? 'btn-danger' : ''}" data-broker="${b.id}" data-up="${b.up ? 0 : 1}">${b.up ? '중지' : '시작'}</button></div></div>`).join('');
    $$('[data-broker]').forEach((b) => b.addEventListener('click', async () => { if (await call(() => K.monitoring.setBroker(CID, b.dataset.broker, b.dataset.up === '1'), b.dataset.up === '1' ? '브로커를 시작했습니다.' : '브로커를 중지했습니다.')) { loaders.cluster(); setTimeout(() => { if (currentPage === 'cluster') loaders.cluster(); }, 4500); } }));
    Demo.barChart($('#clChart'), ci.brokers.map((b) => '#' + b.id + ' 리더'), ci.brokers.map((b) => b.leaderPartitions), '#e8590c');
  };
  $('#clPle').addEventListener('click', async () => { const r = await call(() => K.monitoring.preferredLeaderElection(CID)); if (r) { toast(`${r.moved}개 파티션의 리더를 원래 브로커로 되돌렸습니다.`, 'ok'); loaders.cluster(); } });

  loaders.topics = async () => {
    const list = await call(() => K.topics.list(CID, $('#tInternal').checked));
    if (!list) { $('#tRows').innerHTML = '<tr><td colspan="8" class="muted">연결 상태를 확인하세요.</td></tr>'; return; }
    const q = $('#tSearch').value.trim().toLowerCase();
    $('#tRows').innerHTML = list.filter((t) => !q || t.name.toLowerCase().includes(q)).map((t) => `<tr><td><a href="#" data-detail="${esc(t.name)}"><b>${esc(t.name)}</b></a>${t.isInternal ? ' <span class="badge b-mute">internal</span>' : ''}</td><td>${t.partitionCount}</td><td>${t.replicationFactor}</td><td>${num(t.messageCount)}</td><td>${t.isInternal ? '-' : `<input type="number" min="0" max="500" value="${t.producerRate}" data-rate="${esc(t.name)}" style="width:70px;padding:4px 6px;border:1px solid var(--line);border-radius:6px" />`}</td><td>${okBadge(t.isHealthy)}</td><td>${fmt(t.updatedAt)}</td><td>${t.isInternal ? '' : `<button class="btn btn-sm btn-danger" data-tdel="${esc(t.name)}">삭제</button>`}</td></tr>`).join('') || '<tr><td colspan="8" class="muted">토픽이 없습니다.</td></tr>';
    $$('[data-detail]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); topicDetail(a.dataset.detail); }));
    $$('[data-rate]').forEach((i) => i.addEventListener('change', async () => { if (await call(() => K.topics.setProducerRate(CID, i.dataset.rate, i.value)) !== undefined) toast(`${i.dataset.rate} 프로듀서 속도: 초당 ${i.value}건`, 'ok'); }));
    $$('[data-tdel]').forEach((b) => b.addEventListener('click', async () => { if (!(await confirmBox(`토픽 '${b.dataset.tdel}'을 삭제할까요? 메시지도 모두 사라집니다.`))) return; if (await call(() => K.topics.remove(CID, b.dataset.tdel), '토픽을 삭제했습니다.')) loaders.topics(); }));
  };
  async function topicDetail(name) {
    const t = await call(() => K.topics.detail(CID, name));
    if (!t) return;
    const bg = modal(`토픽: ${t.name}`, `<div class="row" style="margin-bottom:10px"><span class="badge b-info">파티션 ${t.partitionCount}</span><span class="badge b-info">복제 ${t.replicationFactor}</span><span class="badge b-mute">메시지 ${num(t.messageCount)}</span>${okBadge(t.isHealthy)}</div>
      <h3>파티션</h3><div class="table-wrap"><table><thead><tr><th>#</th><th>리더</th><th>레플리카</th><th>ISR</th><th>시작</th><th>끝</th><th>상태</th></tr></thead><tbody>${t.partitions.map((p) => `<tr><td>${p.partitionNumber}</td><td>${p.leader}</td><td>${p.replicas.join(',')}</td><td>${p.inSyncReplicas.join(',')}</td><td>${num(p.earliestOffset)}</td><td>${num(p.latestOffset)}</td><td>${p.isUnderReplicated ? '<span class="badge b-warn">복제 부족</span>' : okBadge(p.isHealthy)}</td></tr>`).join('')}</tbody></table></div>
      <h3 style="margin-top:14px">설정</h3><div class="form" id="tcf">${Object.entries(t.config).map(([k, v]) => `<label class="mono">${esc(k)}<input name="${esc(k)}" value="${esc(v)}" ${t.isInternal ? 'disabled' : ''} /></label>`).join('')}</div>
      ${t.isInternal ? '' : `<div class="row" style="margin-top:12px"><label class="row" style="gap:6px;font-size:13px">파티션 늘리기 <input id="tAddP" type="number" value="${t.partitionCount + 1}" style="width:80px;padding:6px;border:1px solid var(--line);border-radius:6px" /></label><button class="btn" id="tAddPBtn">적용</button></div>`}`, [
      { label: '닫기' },
      ...(t.isInternal ? [] : [{ label: '설정 저장', primary: true, onClick: async () => { const r = await call(() => K.topics.updateConfig(CID, name, formData($('#tcf'))), '설정을 저장했습니다.'); if (!r) return false; } }])
    ]);
    const add = $('#tAddPBtn', bg);
    if (add) add.addEventListener('click', async () => { if (await call(() => K.topics.addPartitions(CID, name, $('#tAddP', bg).value), '파티션을 늘렸습니다. 키 기반 파티셔닝 결과가 바뀔 수 있습니다.')) { Demo.closeModal(); loaders.topics(); } });
  }
  $('#tNew').addEventListener('click', () => modal('토픽 생성', `<div class="form" id="tf"><label>이름 (영문·숫자·. _ -)<input name="name" placeholder="예: order-events" /></label><div class="row"><label style="flex:1">파티션 수<input name="partitions" type="number" value="3" /></label><label style="flex:1">복제 팩터<input name="replicationFactor" type="number" value="2" /></label></div><label>cleanup.policy<select name="cleanup.policy"><option>delete</option><option>compact</option></select></label><label>retention.ms<input name="retention.ms" value="604800000" /></label><label>min.insync.replicas<input name="min.insync.replicas" value="1" /></label><label>초당 프로듀서 메시지 (데모용)<input name="producerRate" type="number" value="3" /></label></div>`, [{ label: '취소' }, { label: '생성', primary: true, onClick: async () => {
    const f = formData($('#tf'));
    const r = await call(() => K.topics.create(CID, { name: f.name, partitions: f.partitions, replicationFactor: f.replicationFactor, config: { 'cleanup.policy': f['cleanup.policy'], 'retention.ms': f['retention.ms'], 'min.insync.replicas': f['min.insync.replicas'] } }), '토픽을 만들었습니다.');
    if (!r) return false;
    if (f.producerRate) await K.topics.setProducerRate(CID, r.name, f.producerRate);
    loaders.topics();
  } }]));
  $('#tInternalCreate').addEventListener('click', async () => { const r = await call(() => K.topics.createTestInternalTopics(CID)); if (r) { toast(r.length ? `${r.join(', ')} 생성` : '이미 모두 있습니다.', 'ok'); $('#tInternal').checked = true; loaders.topics(); } });
  $('#tSearch').addEventListener('input', () => loaders.topics());
  $('#tInternal').addEventListener('change', () => loaders.topics());

  async function fillTopicSelect(sel, withInternal, keep) {
    const list = (await K.topics.list(CID, withInternal).catch(() => ({ data: [] }))).data;
    const prev = keep !== undefined ? keep : sel.value;
    sel.innerHTML = list.map((t) => `<option value="${esc(t.name)}">${esc(t.name)} (P${t.partitionCount})</option>`).join('');
    if (prev && list.find((t) => t.name === prev)) sel.value = prev;
    return list;
  }
  async function fillPartitionSelect(sel, topicName, allLabel) {
    const t = (await K.topics.detail(CID, topicName).catch(() => ({ data: null }))).data;
    const prev = sel.value;
    sel.innerHTML = (allLabel ? `<option value="">${allLabel}</option>` : '') + (t ? t.partitions.map((p) => `<option value="${p.partitionNumber}">파티션 ${p.partitionNumber}</option>`).join('') : '');
    if (prev !== '' && t && prev < t.partitionCount) sel.value = prev;
  }

  loaders.topicmon = async () => {
    const hs = await call(() => K.topics.allHealth(CID));
    if (!hs) return;
    $('#tmRows').innerHTML = hs.map((h) => `<tr><td>${esc(h.topicName)}</td><td>${h.partitionCount}</td><td>${h.replicationFactor}</td><td>${h.underReplicatedPartitions ? `<span class="badge b-warn">${h.underReplicatedPartitions}</span>` : 0}</td><td>${h.offlinePartitions ? `<span class="badge b-bad">${h.offlinePartitions}</span>` : 0}</td><td><span class="badge ${h.healthScore >= 90 ? 'b-ok' : h.healthScore >= 60 ? 'b-warn' : 'b-bad'}">${h.healthScore}</span></td></tr>`).join('');
    await fillTopicSelect($('#tmTopic'), true);
    await fillPartitionSelect($('#tmPartition'), $('#tmTopic').value);
    const gs = (await K.groups.list(CID).catch(() => ({ data: [] }))).data;
    const prev = $('#tmGroup').value;
    $('#tmGroup').innerHTML = '<option value="">컨슈머 그룹 선택(선택)</option>' + gs.filter((g) => g.topic === $('#tmTopic').value).map((g) => `<option>${esc(g.groupId)}</option>`).join('');
    if (prev) $('#tmGroup').value = prev;
    loadPartition();
  };
  async function loadPartition() {
    const topic = $('#tmTopic').value, n = $('#tmPartition').value;
    if (!topic || n === '') return;
    const p = await call(() => K.monitoring.partition(CID, topic, n));
    if (!p) return;
    $('#tmPart').innerHTML = `<table>${[['리더', p.leader], ['레플리카', p.replicas.join(', ')], ['ISR', p.inSyncReplicas.join(', ')], ['시작 오프셋', num(p.earliestOffset)], ['끝 오프셋', num(p.latestOffset)], ['메시지 수', num(p.messageCount)], ['세그먼트', p.segmentCount], ['크기', bytes(p.sizeBytes)], ['상태', p.isUnderReplicated ? '<span class="badge b-warn">복제 부족</span>' : okBadge(p.isHealthy)]].map(([k, v]) => `<tr><th style="width:110px">${k}</th><td>${v}</td></tr>`).join('')}</table>`;
    const g = $('#tmGroup').value;
    const o = await call(() => K.monitoring.offsetInfo(CID, topic, n, g));
    $('#tmOffset').innerHTML = `<table>${[['시작', num(o.earliestOffset)], ['끝', num(o.latestOffset)], ['그룹 커밋', o.consumerOffset === null ? '그룹 미선택' : num(o.consumerOffset)], ['랙', o.lag === null ? '-' : num(o.lag)]].map(([k, v]) => `<tr><th style="width:110px">${k}</th><td>${v}</td></tr>`).join('')}</table>${g ? `<div class="form" style="margin-top:10px"><label>오프셋 변경 (${esc(g)})<select id="tmType"><option value="EARLIEST">EARLIEST (처음부터 다시)</option><option value="LATEST">LATEST (밀린 것 건너뛰기)</option><option value="SPECIFIC">SPECIFIC (지정)</option></select></label><input id="tmVal" type="number" placeholder="지정 오프셋" style="padding:8px;border:1px solid var(--line);border-radius:8px" /><div class="row"><button class="btn" id="tmSet">이 파티션 적용</button><button class="btn" id="tmSetAll">모든 파티션 적용</button></div></div>` : '<p class="note">그룹을 선택하면 오프셋을 바꿀 수 있습니다.</p>'}`;
    const apply = async (target) => { if (await call(() => K.monitoring.setOffset(CID, topic, target, g, $('#tmType').value, $('#tmVal').value), '오프셋을 변경했습니다.')) loadPartition(); };
    if ($('#tmSet')) { $('#tmSet').addEventListener('click', () => apply(n)); $('#tmSetAll').addEventListener('click', () => apply('all')); }
  }
  $('#tmTopic').addEventListener('change', async () => { await fillPartitionSelect($('#tmPartition'), $('#tmTopic').value); $('#tmGroup').value = ''; loaders.topicmon(); });
  $('#tmLoad').addEventListener('click', loadPartition);
  $('#tmPartition').addEventListener('change', loadPartition);
  $('#tmGroup').addEventListener('change', loadPartition);

  let msgInit = false;
  loaders.messages = async () => {
    await fillTopicSelect($('#mTopic'), false);
    await fillTopicSelect($('#sTopic'), false);
    if (!msgInit) {
      msgInit = true;
      const busiest = Array.from($('#mTopic').options).map((o) => o.value).find((v) => v === 'orders') || ($('#mTopic').options[0] && $('#mTopic').options[0].value);
      if (busiest) { $('#mTopic').value = busiest; $('#sTopic').value = busiest; }
      await fillPartitionSelect($('#mPartition'), $('#mTopic').value, '전체 파티션');
      await fillPartitionSelect($('#sPartition'), $('#sTopic').value, '자동');
      fillSample();
    }
    loadMessages();
  };
  async function loadMessages() {
    const topic = $('#mTopic').value;
    if (!topic) { $('#mRows').innerHTML = '<tr><td colspan="6" class="muted">토픽이 없습니다.</td></tr>'; return; }
    const r = await call(() => K.messages.get(CID, { topic, partition: $('#mPartition').value, offset: $('#mOffset').value, search: $('#mSearch').value.trim(), limit: $('#mLimit').value, order: $('#mOrder').value }));
    if (!r) return;
    $('#mTotal').textContent = `조건에 맞는 메시지 ${num(r.total)}건 중 ${r.messages.length}건 표시 (파티션마다 최근 400건 보관, 나머지는 retention으로 삭제됨)`;
    $('#mRows').innerHTML = r.messages.map((m, i) => `<tr class="click" data-i="${i}"><td>${m.partition}</td><td class="mono">${m.formattedOffset}</td><td class="mono">${esc(m.key || '-')}</td><td class="mono msg-val">${esc(m.value)}</td><td>${shortTime(m.timestamp)}</td><td>${m.consumed ? '<span class="badge b-ok">소비됨</span>' : '<span class="badge b-warn">대기</span>'}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">메시지가 없습니다.</td></tr>';
    $$('#mRows tr.click').forEach((tr) => tr.addEventListener('click', () => {
      const m = r.messages[Number(tr.dataset.i)];
      let pretty = m.value;
      try { pretty = JSON.stringify(JSON.parse(m.value), null, 2); } catch (e) { }
      modal(`메시지 P${m.partition} @ ${m.formattedOffset}`, `<table>${[['토픽', esc(topic)], ['파티션', m.partition], ['오프셋', m.formattedOffset], ['키', esc(m.key || '(null)')], ['시각', esc(m.formattedTime)], ['소비 여부', m.consumed ? '소비됨' : '대기']].map(([k, v]) => `<tr><th style="width:90px">${k}</th><td>${v}</td></tr>`).join('')}</table><h3 style="margin-top:12px">헤더</h3><pre class="log" style="height:auto">${esc(JSON.stringify(m.headers, null, 2))}</pre><h3 style="margin-top:12px">값</h3><pre class="log" style="height:auto;max-height:260px">${esc(pretty)}</pre>`, [{ label: '닫기' }, { label: '이 메시지 다시 보내기', primary: true, onClick: () => { $('#sTopic').value = topic; $('[name=key]', $('#sendForm')).value = m.key || ''; $('#sValue').value = m.value; toast('보내기 폼에 채웠습니다.'); } }]);
    }));
  }
  function fillSample() {
    const gen = K.SAMPLE[$('#sTopic').value] || K.SAMPLE.logs;
    const m = gen();
    $('[name=key]', $('#sendForm')).value = m.key || '';
    let v = m.value; try { v = JSON.stringify(JSON.parse(m.value), null, 2); } catch (e) { }
    $('#sValue').value = v;
  }
  $('#mTopic').addEventListener('change', async () => { await fillPartitionSelect($('#mPartition'), $('#mTopic').value, '전체 파티션'); loadMessages(); });
  $('#sTopic').addEventListener('change', async () => { await fillPartitionSelect($('#sPartition'), $('#sTopic').value, '자동'); fillSample(); });
  $('#mLoad').addEventListener('click', loadMessages);
  $('#mSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') loadMessages(); });
  $('#mAuto').addEventListener('change', () => { if (msgTimer) clearInterval(msgTimer); msgTimer = $('#mAuto').checked ? setInterval(() => { if (currentPage === 'messages') loadMessages(); }, 5000) : null; });
  $('#sSample').addEventListener('click', fillSample);
  $('#sSend').addEventListener('click', async () => {
    const f = formData($('#sendForm'));
    let headers = {};
    if (f.headers && f.headers.trim()) { try { headers = JSON.parse(f.headers); } catch (e) { return toast('헤더는 올바른 JSON이어야 합니다.', 'bad'); } }
    let value = f.value;
    try { value = JSON.stringify(JSON.parse(f.value)); } catch (e) { }
    $('#sSend').disabled = true;
    const r = await call(() => K.messages.send(CID, f.topic, { key: f.key, value, partition: f.partition, headers, count: f.count }));
    $('#sSend').disabled = false;
    if (r) {
      const last = r.results[r.results.length - 1];
      $('#sResult').innerHTML = `<span class="badge b-ok">전송 완료</span> ${r.sent}건 · 마지막 메시지 파티션 ${last.partition}, 오프셋 ${num(last.offset)}`;
      toast(`${r.sent}건 전송`, 'ok');
      if ($('#mTopic').value === f.topic) loadMessages();
    }
  });

  loaders.groups = async () => {
    const gs = await call(() => K.groups.list(CID));
    if (!gs) { $('#gRows').innerHTML = '<tr><td colspan="7" class="muted">연결 상태를 확인하세요.</td></tr>'; return; }
    renderGroups(gs);
    if (!selectedGroup && gs.length) selectedGroup = gs[0].groupId;
    renderGroupDetail(gs.find((g) => g.groupId === selectedGroup));
    renderLagChart();
  };
  function renderGroups(gs) {
    const maxLag = Math.max(1, ...gs.map((g) => g.totalLag));
    $('#gRows').innerHTML = gs.map((g) => `<tr class="click" data-g="${esc(g.groupId)}"><td><b>${esc(g.groupId)}</b></td><td>${esc(g.topic)}</td><td>${gBadge(g.state)}</td><td><input type="number" min="0" max="10" value="${g.memberCount}" data-scale="${esc(g.groupId)}" style="width:60px;padding:4px 6px;border:1px solid var(--line);border-radius:6px" /></td><td>${g.running ? g.consumeRate : 0}</td><td><div class="row" style="flex-wrap:nowrap"><div class="lagbar"><div style="width:${Math.round(g.totalLag / maxLag * 100)}%"></div></div><b>${num(g.totalLag)}</b></div></td><td>${g.running ? `<button class="btn btn-sm" data-stop="${esc(g.groupId)}">중지</button>` : `<button class="btn btn-sm" data-start="${esc(g.groupId)}">시작</button>`} <button class="btn btn-sm btn-danger" data-gdel="${esc(g.groupId)}">삭제</button></td></tr>`).join('') || '<tr><td colspan="7" class="muted">컨슈머 그룹이 없습니다.</td></tr>';
    $$('#gRows tr.click').forEach((tr) => tr.addEventListener('click', async (e) => { if (e.target.closest('button,input')) return; selectedGroup = tr.dataset.g; const d = (await K.groups.metrics(CID, selectedGroup)).data; renderGroupDetail(d); }));
    $$('[data-stop]').forEach((b) => b.addEventListener('click', async () => { if (await call(() => K.groups.setRunning(CID, b.dataset.stop, false), '컨슈머를 중지했습니다. 랙이 쌓이기 시작합니다.')) loaders.groups(); }));
    $$('[data-start]').forEach((b) => b.addEventListener('click', async () => { if (await call(() => K.groups.setRunning(CID, b.dataset.start, true), '컨슈머를 시작했습니다. 리밸런싱 후 Stable이 됩니다.')) { loaders.groups(); setTimeout(() => { if (currentPage === 'groups') loaders.groups(); }, 2800); } }));
    $$('[data-gdel]').forEach((b) => b.addEventListener('click', async () => { if (!(await confirmBox('컨슈머 그룹을 삭제할까요?'))) return; if (await call(() => K.groups.remove(CID, b.dataset.gdel), '삭제했습니다.')) { selectedGroup = null; loaders.groups(); } }));
    $$('[data-scale]').forEach((i) => i.addEventListener('change', async () => { const r = await call(() => K.groups.scale(CID, i.dataset.scale, i.value)); if (r) { toast(r.idleMembers ? `멤버 ${r.memberCount}명 중 ${r.idleMembers}명은 파티션을 받지 못해 놀고 있습니다. (파티션 수가 병렬도 상한)` : `멤버 ${r.memberCount}명으로 조정, 리밸런싱 중`, r.idleMembers ? '' : 'ok'); loaders.groups(); setTimeout(() => { if (currentPage === 'groups') loaders.groups(); }, 2800); } }));
  }
  function renderGroupDetail(g) {
    if (!g) { $('#gParts').innerHTML = ''; $('#gSel').textContent = ''; $('#gMembers').textContent = ''; return; }
    $('#gSel').textContent = `(${g.groupId} → ${g.topic})`;
    $('#gParts').innerHTML = g.partitions.map((p) => `<tr><td>${p.partition}</td><td>${num(p.currentOffset)}</td><td>${num(p.logEndOffset)}</td><td><b style="color:${p.lag > 200 ? 'var(--bad)' : 'inherit'}">${num(p.lag)}</b></td><td><button class="btn btn-sm" data-jump="${p.partition}">오프셋</button></td></tr>`).join('');
    $('#gMembers').innerHTML = g.members.length ? '멤버: ' + g.members.map((m) => `<span class="mono">${esc(m.clientId)}${esc(m.host)}</span>`).join(', ') : '활성 멤버가 없습니다.';
    $$('[data-jump]').forEach((b) => b.addEventListener('click', async () => { goTo('topicmon'); setTimeout(async () => { $('#tmTopic').value = g.topic; await fillPartitionSelect($('#tmPartition'), g.topic); $('#tmPartition').value = b.dataset.jump; const gs = (await K.groups.list(CID)).data; $('#tmGroup').innerHTML = '<option value="">컨슈머 그룹 선택(선택)</option>' + gs.filter((x) => x.topic === g.topic).map((x) => `<option>${esc(x.groupId)}</option>`).join(''); $('#tmGroup').value = g.groupId; loadPartition(); }, 400); }));
  }
  async function refreshGroupsLight() {
    const gs = (await K.groups.list(CID).catch(() => ({ data: null }))).data;
    if (!gs || document.activeElement && document.activeElement.dataset && document.activeElement.dataset.scale) return;
    renderGroups(gs);
    renderGroupDetail(gs.find((g) => g.groupId === selectedGroup));
    renderLagChart();
  }
  async function renderLagChart() {
    const p = (await K.monitoring.performance(CID)).data;
    Demo.lineChart($('#gChart'), p.series.map((s) => shortTime(s.t)), [{ label: '전체 랙', color: '#d64545', data: p.series.map((s) => s.lag) }]);
  }
  $('#gNew').addEventListener('click', async () => {
    const ts = (await K.topics.list(CID, false).catch(() => ({ data: [] }))).data;
    modal('테스트 컨슈머 그룹 생성', `<div class="form" id="gf"><label>그룹 ID<input name="groupId" placeholder="예: test-consumer" /></label><label>구독 토픽<select name="topic">${ts.map((t) => `<option>${esc(t.name)}</option>`).join('')}</select></label><div class="row"><label style="flex:1">멤버 수<input name="members" type="number" value="1" /></label><label style="flex:1">멤버당 초당 처리<input name="rate" type="number" value="5" /></label></div><label>시작 위치 (auto.offset.reset)<select name="from"><option value="latest">latest</option><option value="earliest">earliest</option></select></label></div>`, [{ label: '취소' }, { label: '생성', primary: true, onClick: async () => { const r = await call(() => K.groups.createTest(CID, formData($('#gf'))), '컨슈머 그룹을 만들었습니다.'); if (!r) return false; selectedGroup = r.groupId; loaders.groups(); } }]);
  });

  async function renderPerfLive() {
    const p = (await K.monitoring.performance(CID)).data;
    const labels = p.series.map((s) => shortTime(s.t));
    Demo.lineChart($('#pMps'), labels, [{ label: '초당 메시지', color: '#e8590c', data: p.series.map((s) => s.mps) }]);
    Demo.lineChart($('#pBytes'), labels, [{ label: 'In', color: '#2f6fed', data: p.series.map((s) => s.bin) }, { label: 'Out', color: '#1f9d55', data: p.series.map((s) => s.bout) }]);
    $('#pKpis').innerHTML = kpi('평균 초당 메시지', num(p.avgMessagesPerSecond)) + kpi('평균 In', bytes(p.avgBytesIn) + '/s') + kpi('평균 Out', bytes(p.avgBytesOut) + '/s') + kpi('Produce p99', p.produceLatencyP99Ms + 'ms') + kpi('Fetch p99', p.fetchLatencyP99Ms + 'ms', `요청 큐 ${p.requestQueueSize}`);
  }
  loaders.metrics = async () => {
    await renderPerfLive();
    const hs = (await K.connections.allHealth()).data;
    $('#pAll').innerHTML = hs.map((h) => `<tr><td>${esc(h.connectionName)}</td><td>${okBadge(h.isHealthy, '건강', '이상')}</td><td>${h.healthScore}</td><td style="white-space:normal">${h.issues.map((i) => `${sevBadge(i.severity)} ${esc(i.message)}`).join('<br>') || '-'}</td></tr>`).join('');
  };

  loaders.alerts = async () => {
    const f = $('#aFilter').value;
    const list = f === 'active' ? (await K.alerts.active()).data : f === 'all' ? (await K.alerts.all()).data : (await K.alerts.bySeverity(f)).data;
    const conns = (await K.connections.list()).data;
    const cname = (id) => { const c = conns.find((x) => x.id === id); return c ? c.name : '-'; };
    $('#aRows').innerHTML = list.map((a) => `<tr><td>${sevBadge(a.severity)}</td><td class="mono">${a.type}</td><td><b>${esc(a.title)}</b></td><td style="white-space:normal">${esc(a.message)}</td><td>${esc(cname(a.connectionId))}${a.topicName ? ' / ' + esc(a.topicName) : ''}</td><td>${fmt(a.timestamp)}</td><td>${a.isAcknowledged ? `<span class="muted">${esc(a.acknowledgedBy)} ${shortTime(a.acknowledgedAt)}</span>` : `<button class="btn btn-sm" data-ack="${a.id}">확인</button>`}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">알림이 없습니다. "현재 연결 점검"을 눌러 보세요.</td></tr>';
    $$('[data-ack]').forEach((b) => b.addEventListener('click', async () => { if (await call(() => K.alerts.acknowledge(b.dataset.ack, USER.name), '확인 처리했습니다.')) { loaders.alerts(); updateAlertCount(); } }));
    updateAlertCount();
  };
  const runCheck = async (silent) => { const r = silent ? (await K.alerts.check(CID, Number($('#aLag').value)).catch(() => ({ data: null }))).data : await call(() => K.alerts.check(CID, Number($('#aLag').value))); if (r && !silent) toast(r.created ? `새 알림 ${r.created}건` : '새로 감지된 문제가 없습니다. (같은 미확인 알림은 중복 생성하지 않음)', r.created ? '' : 'ok'); if (currentPage === 'alerts') loaders.alerts(); updateAlertCount(); };
  $('#aCheck').addEventListener('click', () => runCheck(false));
  $('#aFilter').addEventListener('change', () => loaders.alerts());
  $('#aTest').addEventListener('click', async () => { if (await call(() => K.alerts.createTest(CID, $('#aTestSev').value))) { toast('테스트 알림을 만들었습니다.', 'ok'); loaders.alerts(); } });
  $('#aClear').addEventListener('click', async () => { if (!(await confirmBox('모든 알림을 삭제할까요?'))) return; const r = await call(() => K.alerts.clearAll()); if (r) { toast(`${r.cleared}건 삭제`, 'ok'); loaders.alerts(); } });
  const setAlertTimer = () => { if (alertTimer) clearInterval(alertTimer); alertTimer = $('#aAuto').checked ? setInterval(() => runCheck(true), 30000) : null; };
  $('#aAuto').addEventListener('change', setAlertTimer);

  loaders.activities = async () => {
    let list = $('#actScope').value === 'conn' ? (await K.activities.byConnection(CID)).data : (await K.activities.recent(200)).data;
    if ($('#actType').value) list = list.filter((a) => a.type === $('#actType').value);
    $('#actRows').innerHTML = list.map((a) => `<tr><td><i class="fas fa-${a.icon}"></i></td><td>${fmt(a.timestamp)}</td><td class="mono">${a.type}</td><td><b>${esc(a.title)}</b></td><td style="white-space:normal">${esc(a.message)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">활동이 없습니다.</td></tr>';
  };
  $('#actLoad').addEventListener('click', () => loaders.activities());
  $('#actScope').addEventListener('change', () => loaders.activities());
  $('#actType').addEventListener('change', () => loaders.activities());
  $('#resetAll').addEventListener('click', async () => { if (!(await confirmBox('연결·토픽·메시지·알림을 처음 상태로 되돌릴까요?'))) return; await K.resetAll(); toast('초기화했습니다.', 'ok'); setTimeout(() => window.location.reload(), 600); });

  $('#connSelect').addEventListener('change', async () => { CID = $('#connSelect').value; Demo.session.set('kopanda-cid', CID); msgInit = false; selectedGroup = null; subscribeMetrics(); if (loaders[currentPage]) loaders[currentPage](); });

  let goTo = () => {};
  Demo.auth('kopanda', async (user) => {
    USER = user;
    await loadConnSelect();
    subscribeMetrics();
    setAlertTimer();
    updateAlertCount();
    goTo = Demo.nav((name) => { currentPage = name; if (loaders[name]) loaders[name](); });
    setInterval(() => { if (currentPage === 'dashboard') loaders.dashboard(); }, 6000);
  });
})();
