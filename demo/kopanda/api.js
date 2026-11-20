const KopandaApi = (() => {
  const KEY = 'demo-kopanda-db-v1';
  const MAX_PER_PARTITION = 400;
  const now = () => Date.now();
  const uid = (p) => (p || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

  const SAMPLE = {
    orders: () => { const id = rand(10000, 99999); return { key: 'order-' + id, value: JSON.stringify({ orderId: id, userId: rand(1, 900), amount: rand(5, 300) * 100, status: pick(['CREATED', 'PAID', 'CANCELLED']), at: new Date().toISOString() }) }; },
    payments: () => { const id = rand(10000, 99999); return { key: 'pay-' + id, value: JSON.stringify({ paymentId: id, orderId: rand(10000, 99999), method: pick(['CARD', 'TRANSFER', 'POINT']), result: pick(['APPROVED', 'APPROVED', 'APPROVED', 'DECLINED']) }) }; },
    'user-events': () => ({ key: 'user-' + rand(1, 900), value: JSON.stringify({ type: pick(['LOGIN', 'VIEW', 'CLICK', 'LOGOUT']), page: pick(['/home', '/product', '/cart', '/mypage']), ts: now() }) }),
    'inventory-updates': () => ({ key: 'sku-' + rand(100, 999), value: JSON.stringify({ sku: rand(100, 999), delta: rand(-5, 20), warehouse: pick(['YEOSU', 'GWANGJU', 'SEOUL']) }) }),
    notifications: () => ({ key: null, value: JSON.stringify({ channel: pick(['SMS', 'EMAIL', 'PUSH']), template: pick(['ORDER_DONE', 'SHIP_START', 'REFUND']), to: 'user-' + rand(1, 900) }) }),
    logs: () => ({ key: pick(['api', 'batch', 'web']), value: `${new Date().toISOString()} ${pick(['INFO', 'INFO', 'WARN', 'ERROR'])} ${pick(['request handled', 'slow query 1.2s', 'retry scheduled', 'cache miss'])}` })
  };

  function makeTopic(name, partitions, rf, brokers, opts) {
    const o = opts || {};
    const ids = brokers.map((b) => b.id);
    const parts = [];
    for (let i = 0; i < partitions; i++) {
      const replicas = [];
      for (let r = 0; r < Math.min(rf, ids.length); r++) replicas.push(ids[(i + r) % ids.length]);
      parts.push({ n: i, leader: replicas[0], replicas, isr: replicas.slice(), earliest: 0, latest: 0, messages: [] });
    }
    return { name, partitions: parts, replicationFactor: rf, internal: !!o.internal, config: Object.assign({ 'cleanup.policy': 'delete', 'retention.ms': '604800000', 'min.insync.replicas': String(Math.min(2, rf)), 'segment.bytes': '1073741824' }, o.config || {}), createdAt: o.createdAt || now(), updatedAt: now(), producerRate: o.producerRate || 0, rr: 0 };
  }

  function appendMessage(topic, key, value, partition, headers, ts) {
    const n = topic.partitions.length;
    let p = partition;
    if (p === null || p === undefined || p === '' || isNaN(p)) p = key ? hash(key) % n : (topic.rr++ % n);
    const part = topic.partitions[p];
    const msg = { offset: part.latest, key: key || null, value, timestamp: ts || now(), headers: headers || {} };
    part.messages.push(msg);
    part.latest++;
    if (part.messages.length > MAX_PER_PARTITION) { part.messages.shift(); part.earliest = part.messages[0].offset; }
    topic.updatedAt = now();
    return { partition: p, offset: msg.offset, size: (key || '').length + value.length };
  }

  function seedCluster(brokerCount, host) {
    const brokers = [];
    for (let i = 1; i <= brokerCount; i++) brokers.push({ id: i, host: `${host.split(':')[0] || 'kafka'}-${i}`, port: 9092, rack: 'rack-' + (((i - 1) % 2) + 1), up: true });
    return { brokers, controllerId: 1, topics: {}, groups: {}, clusterId: Math.random().toString(36).slice(2, 12).toUpperCase() };
  }

  function seedDb() {
    const t0 = now() - 3 * 86400000;
    const conns = [
      { id: 'conn-local', name: 'local-dev', host: 'localhost', port: 9092, sslEnabled: false, saslEnabled: false, username: null, password: null, createdAt: t0, updatedAt: t0, lastConnected: now(), status: 'CONNECTED' },
      { id: 'conn-stg', name: 'staging-cluster', host: 'kafka.stg.internal', port: 9093, sslEnabled: true, saslEnabled: true, username: 'kopanda', password: 'secret', createdAt: t0 + 3600000, updatedAt: t0 + 3600000, lastConnected: now(), status: 'CONNECTED' },
      { id: 'conn-old', name: 'legacy-down', host: 'kafka-old.down.internal', port: 9092, sslEnabled: false, saslEnabled: false, username: null, password: null, createdAt: t0 + 7200000, updatedAt: t0 + 7200000, lastConnected: now() - 86400000, status: 'DISCONNECTED' }
    ];
    const clusters = { 'conn-local': seedCluster(3, 'localhost'), 'conn-stg': seedCluster(3, 'kafka-stg'), 'conn-old': seedCluster(2, 'kafka-old') };
    const add = (cid, name, p, rf, rate, opts) => { const c = clusters[cid]; c.topics[name] = makeTopic(name, p, rf, c.brokers, Object.assign({ producerRate: rate, createdAt: t0 }, opts || {})); };
    add('conn-local', '__consumer_offsets', 6, 3, 0, { internal: true, config: { 'cleanup.policy': 'compact' } });
    add('conn-local', 'orders', 6, 3, 8);
    add('conn-local', 'payments', 3, 3, 4);
    add('conn-local', 'user-events', 6, 2, 15);
    add('conn-local', 'inventory-updates', 3, 2, 3);
    add('conn-local', 'notifications', 2, 2, 2);
    add('conn-local', 'archive-2025', 1, 1, 0);
    add('conn-stg', '__consumer_offsets', 6, 3, 0, { internal: true, config: { 'cleanup.policy': 'compact' } });
    add('conn-stg', 'orders', 12, 3, 20);
    add('conn-stg', 'logs', 6, 2, 30);
    add('conn-old', 'logs', 2, 1, 0);
    Object.entries(clusters).forEach(([cid, c]) => {
      Object.values(c.topics).forEach((t) => {
        if (t.internal || t.name === 'archive-2025') return;
        const gen = SAMPLE[t.name] || SAMPLE.logs;
        const count = cid === 'conn-old' ? 40 : rand(120, 260);
        for (let i = 0; i < count; i++) { const m = gen(); appendMessage(t, m.key, m.value, null, { source: 'seed' }, now() - (count - i) * 4000); }
      });
    });
    const group = (cid, groupId, topic, members, rate, lagRatio) => {
      const c = clusters[cid];
      const t = c.topics[topic];
      const committed = {};
      t.partitions.forEach((p) => { committed[p.n] = Math.max(p.earliest, Math.floor(p.latest * (1 - lagRatio))); });
      c.groups[groupId] = { groupId, topic, state: members ? 'Stable' : 'Empty', members: Array.from({ length: members }, (_, i) => ({ memberId: `${groupId}-${i + 1}-${uid().slice(-6)}`, clientId: `${groupId}-client-${i + 1}`, host: `/10.0.1.${10 + i}` })), committed, consumeRate: rate, running: members > 0 };
    };
    group('conn-local', 'order-service', 'orders', 3, 9, 0.02);
    group('conn-local', 'settlement-batch', 'payments', 1, 2, 0.35);
    group('conn-local', 'analytics-etl', 'user-events', 2, 10, 0.4);
    group('conn-local', 'stock-sync', 'inventory-updates', 0, 0, 0.6);
    group('conn-stg', 'order-service', 'orders', 4, 22, 0.05);
    group('conn-stg', 'log-shipper', 'logs', 2, 32, 0.1);
    group('conn-old', 'legacy-reader', 'logs', 0, 0, 1);
    return { connections: conns, clusters, alerts: [], activities: [{ id: uid(), type: 'CONNECTION_CREATED', title: '연결 생성', message: 'local-dev 연결이 등록되었습니다.', connectionId: 'conn-local', timestamp: t0, icon: 'plug' }], history: {}, metricsHistory: {} };
  }

  let db = Demo.store.get(KEY, null) || seedDb();
  let dirty = false;
  const save = () => { dirty = true; };
  setInterval(() => { if (dirty) { Demo.store.set(KEY, db); dirty = false; } }, 3000);
  Demo.store.set(KEY, db);

  const ok = async (data, ms) => { await Demo.delay(ms === undefined ? rand(60, 180) : ms); return { success: true, data }; };
  const fail = async (message, status) => { await Demo.delay(rand(60, 150)); const e = new Error(message); e.status = status || 400; throw e; };

  function activity(type, title, message, connectionId, topicName) {
    const icons = { CONNECTION_CREATED: 'plug', CONNECTION_UPDATED: 'pen', CONNECTION_DELETED: 'trash', CONNECTION_OFFLINE: 'plug-circle-xmark', TOPIC_CREATED: 'layer-group', TOPIC_DELETED: 'trash', MESSAGE_SENT: 'paper-plane', ERROR_OCCURRED: 'triangle-exclamation' };
    db.activities.unshift({ id: uid(), type, title, message, connectionId: connectionId || null, topicName: topicName || null, timestamp: now(), icon: icons[type] || 'circle' });
    db.activities = db.activities.slice(0, 300);
    save();
    WS.publish('/topic/global', { type: 'ACTIVITY', data: db.activities[0] });
  }

  const conn = (id) => db.connections.find((c) => c.id === id);
  const cluster = (id) => db.clusters[id];
  const requireConnected = (id) => {
    const c = conn(id);
    if (!c) return '연결을 찾을 수 없습니다.';
    if (c.status !== 'CONNECTED') return `연결 '${c.name}'이 ${c.status} 상태입니다. 먼저 연결 상태를 확인하세요.`;
    return null;
  };

  function testReach(req) {
    const host = String(req.host || '').trim();
    const port = Number(req.port);
    if (!host) return { ok: false, error: '호스트를 입력해야 합니다.' };
    if (!port || port < 1 || port > 65535) return { ok: false, error: '포트는 1~65535 사이여야 합니다.' };
    if (req.saslEnabled && (!req.username || !req.password)) return { ok: false, error: 'SASL 인증에는 사용자명과 비밀번호가 필요합니다.' };
    if (/fail|unknown|down|invalid/i.test(host)) return { ok: false, error: `브로커 ${host}:${port}에 연결할 수 없습니다. (Connection refused)` };
    if (req.saslEnabled && req.password === 'wrong') return { ok: false, error: 'SASL 인증 실패: 사용자명 또는 비밀번호가 올바르지 않습니다.' };
    return { ok: true, latency: rand(3, 45) };
  }

  function pushHistory(id, status, latency) {
    db.history[id] = db.history[id] || [];
    db.history[id].unshift({ timestamp: now(), status, latency: latency || null });
    db.history[id] = db.history[id].slice(0, 100);
  }

  const connDto = (c) => ({ id: c.id, name: c.name, host: c.host, port: c.port, sslEnabled: c.sslEnabled, saslEnabled: c.saslEnabled, username: c.username, createdAt: c.createdAt, updatedAt: c.updatedAt, lastConnected: c.lastConnected, status: c.status });

  function topicHealth(t, cl) {
    const upIds = cl.brokers.filter((b) => b.up).map((b) => b.id);
    let under = 0, offline = 0;
    t.partitions.forEach((p) => {
      if (!upIds.includes(p.leader)) offline++;
      if (p.isr.length < p.replicas.length) under++;
    });
    return { topicName: t.name, partitionCount: t.partitions.length, replicationFactor: t.replicationFactor, underReplicatedPartitions: under, offlinePartitions: offline, isHealthy: offline === 0, healthScore: Math.max(0, 100 - under * 10 - offline * 30) };
  }
  const msgCount = (t) => t.partitions.reduce((s, p) => s + (p.latest - p.earliest), 0);
  const topicDto = (t, cl) => ({ name: t.name, partitionCount: t.partitions.length, replicationFactor: t.replicationFactor, messageCount: msgCount(t), isInternal: t.internal, isHealthy: topicHealth(t, cl).isHealthy, createdAt: t.createdAt, updatedAt: t.updatedAt, producerRate: t.producerRate });
  const partDto = (p, cl) => { const upIds = cl.brokers.filter((b) => b.up).map((b) => b.id); return { partitionNumber: p.n, leader: p.leader, replicas: p.replicas.slice(), inSyncReplicas: p.isr.slice(), earliestOffset: p.earliest, latestOffset: p.latest, messageCount: p.latest - p.earliest, isHealthy: upIds.includes(p.leader), isUnderReplicated: p.isr.length < p.replicas.length }; };
  function groupDto(g, cl) {
    const t = cl.topics[g.topic];
    const parts = t ? t.partitions.map((p) => ({ partition: p.n, currentOffset: g.committed[p.n] || 0, logEndOffset: p.latest, lag: Math.max(0, p.latest - (g.committed[p.n] || 0)) })) : [];
    const offsets = {};
    parts.forEach((p) => { offsets[`${g.topic}-${p.partition}`] = p.currentOffset; });
    return { groupId: g.groupId, state: g.state, memberCount: g.members.length, topicCount: t ? 1 : 0, topic: g.topic, offsets, partitions: parts, totalLag: parts.reduce((s, p) => s + p.lag, 0), members: g.members.slice(), consumeRate: g.consumeRate, running: g.running };
  }

  const metricState = {};
  function computeMetrics(id) {
    const c = conn(id); const cl = cluster(id);
    const ms = metricState[id] || { msgs: 0, bytesIn: 0, bytesOut: 0 };
    return { brokerCount: cl.brokers.filter((b) => b.up).length, topicCount: Object.keys(cl.topics).length, totalPartitions: Object.values(cl.topics).reduce((s, t) => s + t.partitions.length, 0), messagesPerSecond: c.status === 'CONNECTED' ? Math.round(ms.msgs * 10) / 10 : 0, bytesInPerSec: c.status === 'CONNECTED' ? Math.round(ms.bytesIn) : 0, bytesOutPerSec: c.status === 'CONNECTED' ? Math.round(ms.bytesOut) : 0, activeConnections: db.connections.filter((x) => x.status === 'CONNECTED').length, timestamp: now() };
  }

  const WS = (() => {
    const subs = {};
    let connected = true;
    return {
      subscribe(dest, cb) { (subs[dest] = subs[dest] || []).push(cb); return () => { subs[dest] = (subs[dest] || []).filter((x) => x !== cb); }; },
      publish(dest, payload) { if (!connected) return; (subs[dest] || []).forEach((cb) => { try { cb({ type: payload.type || 'UPDATE', data: payload.data !== undefined ? payload.data : payload, timestamp: now() }); } catch (e) { } }); },
      setConnected(v) { connected = v; },
      get connected() { return connected; }
    };
  })();

  const TICK = 2000;
  setInterval(() => {
    db.connections.forEach((c) => {
      const cl = cluster(c.id);
      if (!cl) return;
      const st = { msgs: 0, bytesIn: 0, bytesOut: 0 };
      if (c.status === 'CONNECTED') {
        Object.values(cl.topics).forEach((t) => {
          if (!t.producerRate) return;
          const n = Math.max(0, Math.round(t.producerRate * TICK / 1000 * (0.6 + Math.random() * 0.8)));
          const gen = SAMPLE[t.name] || SAMPLE.logs;
          for (let i = 0; i < n; i++) { const m = gen(); const r = appendMessage(t, m.key, m.value, null, { producer: 'demo-producer' }); st.msgs++; st.bytesIn += r.size; }
        });
        Object.values(cl.groups).forEach((g) => {
          const t = cl.topics[g.topic];
          if (!t || !g.running || !g.members.length) return;
          let budget = Math.round(g.consumeRate * TICK / 1000 * (0.7 + Math.random() * 0.6));
          const per = Math.ceil(budget / t.partitions.length);
          t.partitions.forEach((p) => {
            const cur = Math.max(g.committed[p.n] || 0, p.earliest);
            const take = Math.min(per, p.latest - cur, budget);
            if (take > 0) { g.committed[p.n] = cur + take; budget -= take; st.bytesOut += take * 120; }
          });
        });
      }
      metricState[c.id] = { msgs: st.msgs / (TICK / 1000), bytesIn: st.bytesIn / (TICK / 1000), bytesOut: st.bytesOut / (TICK / 1000) };
      const m = computeMetrics(c.id);
      db.metricsHistory[c.id] = db.metricsHistory[c.id] || [];
      db.metricsHistory[c.id].push({ t: m.timestamp, mps: m.messagesPerSecond, bin: m.bytesInPerSec, bout: m.bytesOutPerSec, lag: Object.values(cl.groups).reduce((s, g) => s + groupDto(g, cl).totalLag, 0) });
      if (db.metricsHistory[c.id].length > 90) db.metricsHistory[c.id].shift();
      WS.publish('/topic/metrics/' + c.id, { type: 'METRICS', data: m });
      WS.publish('/topic/connection-status/' + c.id, { type: 'STATUS', data: { connectionId: c.id, status: c.status, lastChecked: now() } });
    });
    save();
  }, TICK);

  const connections = {
    async list() { return ok(db.connections.map(connDto)); },
    async get(id) { const c = conn(id); if (!c) return fail('연결을 찾을 수 없습니다.', 404); return ok(connDto(c)); },
    async create(req) {
      if (!req.name || !req.name.trim()) return fail('연결 이름을 입력해야 합니다.');
      if (db.connections.some((c) => c.name === req.name.trim())) return fail('같은 이름의 연결이 이미 있습니다.', 409);
      const t = testReach(req);
      const c = { id: uid('conn-'), name: req.name.trim(), host: req.host.trim(), port: Number(req.port), sslEnabled: !!req.sslEnabled, saslEnabled: !!req.saslEnabled, username: req.saslEnabled ? req.username : null, password: req.saslEnabled ? req.password : null, createdAt: now(), updatedAt: now(), lastConnected: t.ok ? now() : null, status: t.ok ? 'CONNECTED' : 'ERROR' };
      db.connections.push(c);
      db.clusters[c.id] = seedCluster(rand(1, 3), c.host);
      const cl = db.clusters[c.id];
      cl.topics.__consumer_offsets = makeTopic('__consumer_offsets', 3, Math.min(3, cl.brokers.length), cl.brokers, { internal: true, config: { 'cleanup.policy': 'compact' } });
      pushHistory(c.id, c.status, t.latency);
      activity('CONNECTION_CREATED', '연결 생성', `${c.name} (${c.host}:${c.port}) 연결이 등록되었습니다.${t.ok ? '' : ' 단, 연결 테스트는 실패했습니다: ' + t.error}`, c.id);
      WS.publish('/topic/connection-change', { type: 'CREATED', data: c.id });
      save();
      return ok(connDto(c));
    },
    async update(id, req) {
      const c = conn(id); if (!c) return fail('연결을 찾을 수 없습니다.', 404);
      if (req.name && db.connections.some((x) => x.name === req.name.trim() && x.id !== id)) return fail('같은 이름의 연결이 이미 있습니다.', 409);
      const merged = Object.assign({}, c, req, { port: Number(req.port || c.port) });
      if (merged.saslEnabled && !req.password) merged.password = c.password;
      const t = testReach(merged);
      Object.assign(c, { name: merged.name.trim(), host: merged.host.trim(), port: merged.port, sslEnabled: !!merged.sslEnabled, saslEnabled: !!merged.saslEnabled, username: merged.saslEnabled ? merged.username : null, password: merged.saslEnabled ? merged.password : null, updatedAt: now(), status: t.ok ? 'CONNECTED' : 'ERROR', lastConnected: t.ok ? now() : c.lastConnected });
      pushHistory(c.id, c.status, t.latency);
      activity('CONNECTION_UPDATED', '연결 수정', `${c.name} 연결 정보가 수정되었습니다. 상태: ${c.status}`, c.id);
      save();
      return ok(connDto(c));
    },
    async remove(id) {
      const c = conn(id); if (!c) return fail('연결을 찾을 수 없습니다.', 404);
      db.connections = db.connections.filter((x) => x.id !== id);
      delete db.clusters[id]; delete db.history[id]; delete db.metricsHistory[id];
      db.alerts = db.alerts.filter((a) => a.connectionId !== id);
      activity('CONNECTION_DELETED', '연결 삭제', `${c.name} 연결이 삭제되었습니다.`, null);
      save();
      return ok(true);
    },
    async test(req) { await Demo.delay(rand(300, 800)); const t = testReach(req); return { success: true, data: t.ok ? { success: true, latency: t.latency, brokerInfo: { brokerCount: rand(1, 3), version: '3.9.0' } } : { success: false, error: t.error } }; },
    async status(id) {
      const c = conn(id); if (!c) return fail('연결을 찾을 수 없습니다.', 404);
      const cl = cluster(id);
      return ok({ connectionId: id, status: c.status, lastChecked: now(), brokerCount: c.status === 'CONNECTED' ? cl.brokers.filter((b) => b.up).length : null, topicCount: c.status === 'CONNECTED' ? Object.keys(cl.topics).length : null, errorMessage: c.status === 'CONNECTED' ? null : '브로커에 연결할 수 없습니다.' });
    },
    async ping(id) {
      const c = conn(id); if (!c) return fail('연결을 찾을 수 없습니다.', 404);
      await Demo.delay(rand(200, 500));
      const t = testReach(c);
      const prev = c.status;
      c.status = t.ok ? 'CONNECTED' : 'DISCONNECTED';
      if (t.ok) c.lastConnected = now();
      pushHistory(id, c.status, t.latency);
      if (prev === 'CONNECTED' && !t.ok) activity('CONNECTION_OFFLINE', '연결 끊김', `${c.name} 브로커에 연결할 수 없습니다.`, id);
      save();
      return ok({ connectionId: id, isAlive: t.ok, responseTimeMs: t.ok ? t.latency : null, error: t.ok ? null : t.error });
    },
    async health(id) {
      const c = conn(id); if (!c) return fail('연결을 찾을 수 없습니다.', 404);
      const cl = cluster(id);
      const issues = [];
      if (c.status !== 'CONNECTED') issues.push({ type: 'CONNECTION_ERROR', severity: 'HIGH', message: '연결 끊김' });
      cl.brokers.filter((b) => !b.up).forEach((b) => issues.push({ type: 'LEADER_NOT_AVAILABLE', severity: 'HIGH', message: `브로커 ${b.id} 응답 없음` }));
      Object.values(cl.topics).forEach((t) => { const h = topicHealth(t, cl); if (h.underReplicatedPartitions) issues.push({ type: 'UNDER_REPLICATED', severity: 'MEDIUM', message: `${t.name} 복제 부족 파티션 ${h.underReplicatedPartitions}개` }); if (h.offlinePartitions) issues.push({ type: 'OFFLINE_PARTITION', severity: 'CRITICAL', message: `${t.name} 오프라인 파티션 ${h.offlinePartitions}개` }); });
      const score = Math.max(0, 100 - issues.reduce((s, i) => s + ({ LOW: 5, MEDIUM: 10, HIGH: 25, CRITICAL: 40 }[i.severity]), 0));
      return ok({ connectionId: id, connectionName: c.name, isHealthy: c.status === 'CONNECTED' && !issues.some((i) => i.severity === 'HIGH' || i.severity === 'CRITICAL'), healthScore: score, lastChecked: now(), issues });
    },
    async allHealth() { const res = []; for (const c of db.connections) res.push((await connections.health(c.id)).data); return ok(res); },
    async history(id) { return ok((db.history[id] || []).slice(0, 50)); },
    async refreshAll() {
      for (const c of db.connections) { const t = testReach(c); const prev = c.status; c.status = t.ok ? 'CONNECTED' : 'DISCONNECTED'; if (t.ok) c.lastConnected = now(); pushHistory(c.id, c.status, t.latency); if (prev === 'CONNECTED' && !t.ok) activity('CONNECTION_OFFLINE', '연결 끊김', `${c.name} 브로커에 연결할 수 없습니다.`, c.id); }
      WS.publish('/topic/all-connections', { type: 'REFRESH', data: db.connections.map(connDto) });
      save();
      return ok(db.connections.map(connDto), 500);
    }
  };

  const topics = {
    async list(cid, includeInternal) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid);
      return ok(Object.values(cl.topics).filter((t) => includeInternal || !t.internal).map((t) => topicDto(t, cl)).sort((a, b) => a.name.localeCompare(b.name)));
    },
    async detail(cid, name) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid); const t = cl.topics[name];
      if (!t) return fail(`토픽 '${name}'을 찾을 수 없습니다.`, 404);
      return ok(Object.assign(topicDto(t, cl), { config: Object.assign({}, t.config), partitions: t.partitions.map((p) => partDto(p, cl)) }));
    },
    async create(cid, req) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid);
      const name = String(req.name || '').trim();
      if (!/^[a-zA-Z0-9._-]{1,249}$/.test(name)) return fail('토픽 이름은 영문, 숫자, . _ - 만 사용할 수 있고 249자 이하여야 합니다.');
      if (name.startsWith('__')) return fail('__ 로 시작하는 이름은 내부 토픽용으로 예약되어 있습니다.');
      if (cl.topics[name]) return fail(`토픽 '${name}'이 이미 존재합니다.`, 409);
      const p = Number(req.partitions), rf = Number(req.replicationFactor);
      if (!p || p < 1 || p > 50) return fail('파티션 수는 1~50 사이여야 합니다.');
      const up = cl.brokers.filter((b) => b.up).length;
      if (!rf || rf < 1) return fail('복제 팩터는 1 이상이어야 합니다.');
      if (rf > up) return fail(`복제 팩터(${rf})는 사용 가능한 브로커 수(${up})보다 클 수 없습니다.`);
      const cfg = req.config || {};
      if (cfg['min.insync.replicas'] && Number(cfg['min.insync.replicas']) > rf) return fail('min.insync.replicas는 복제 팩터보다 클 수 없습니다.');
      cl.topics[name] = makeTopic(name, p, rf, cl.brokers.filter((b) => b.up), { config: cfg });
      activity('TOPIC_CREATED', '토픽 생성', `토픽 '${name}' (파티션 ${p}, 복제 ${rf})이 생성되었습니다.`, cid, name);
      save();
      return ok(topicDto(cl.topics[name], cl));
    },
    async remove(cid, name) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid); const t = cl.topics[name];
      if (!t) return fail(`토픽 '${name}'을 찾을 수 없습니다.`, 404);
      if (t.internal) return fail('내부 토픽은 삭제할 수 없습니다.', 403);
      const using = Object.values(cl.groups).filter((g) => g.topic === name && g.members.length);
      if (using.length) return fail(`활성 컨슈머 그룹(${using.map((g) => g.groupId).join(', ')})이 구독 중이라 삭제할 수 없습니다. 그룹을 먼저 중지하세요.`, 409);
      delete cl.topics[name];
      Object.keys(cl.groups).forEach((k) => { if (cl.groups[k].topic === name) delete cl.groups[k]; });
      activity('TOPIC_DELETED', '토픽 삭제', `토픽 '${name}'이 삭제되었습니다.`, cid, name);
      save();
      return ok(true);
    },
    async health(cid, name) { const e = requireConnected(cid); if (e) return fail(e, 503); const cl = cluster(cid); const t = cl.topics[name]; if (!t) return fail('토픽을 찾을 수 없습니다.', 404); return ok(topicHealth(t, cl)); },
    async allHealth(cid) { const e = requireConnected(cid); if (e) return fail(e, 503); const cl = cluster(cid); return ok(Object.values(cl.topics).map((t) => topicHealth(t, cl))); },
    async updateConfig(cid, name, config) {
      const cl = cluster(cid); const t = cl.topics[name]; if (!t) return fail('토픽을 찾을 수 없습니다.', 404);
      if (config['retention.ms'] && !/^-?\d+$/.test(config['retention.ms'])) return fail('retention.ms는 숫자여야 합니다.');
      if (config['cleanup.policy'] && !['delete', 'compact', 'compact,delete'].includes(config['cleanup.policy'])) return fail('cleanup.policy는 delete, compact, compact,delete 중 하나여야 합니다.');
      if (config['min.insync.replicas'] && Number(config['min.insync.replicas']) > t.replicationFactor) return fail('min.insync.replicas는 복제 팩터보다 클 수 없습니다.');
      Object.assign(t.config, config); t.updatedAt = now(); save(); return ok(Object.assign({}, t.config));
    },
    async addPartitions(cid, name, count) {
      const cl = cluster(cid); const t = cl.topics[name]; if (!t) return fail('토픽을 찾을 수 없습니다.', 404);
      const n = Number(count);
      if (!n || n <= t.partitions.length) return fail(`파티션은 늘리기만 할 수 있습니다. (현재 ${t.partitions.length})`);
      if (n > 50) return fail('파티션 수는 50 이하여야 합니다.');
      const tmp = makeTopic(name, n, t.replicationFactor, cl.brokers.filter((b) => b.up));
      for (let i = t.partitions.length; i < n; i++) t.partitions.push(tmp.partitions[i]);
      t.updatedAt = now(); save(); return ok(topicDto(t, cl));
    },
    async setProducerRate(cid, name, rate) { const t = cluster(cid).topics[name]; if (!t) return fail('토픽을 찾을 수 없습니다.', 404); t.producerRate = Math.max(0, Math.min(500, Number(rate) || 0)); save(); return ok(t.producerRate); },
    async createTestInternalTopics(cid) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid); const created = [];
      ['__consumer_offsets', '__transaction_state', '_schemas'].forEach((n) => { if (!cl.topics[n]) { cl.topics[n] = makeTopic(n, n === '_schemas' ? 1 : 3, Math.min(3, cl.brokers.length), cl.brokers, { internal: true, config: { 'cleanup.policy': 'compact' } }); created.push(n); } });
      save(); return ok(created);
    }
  };

  const messages = {
    async get(cid, q) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid); const t = cl.topics[q.topic];
      if (!t) return fail('토픽을 찾을 수 없습니다.', 404);
      let list = [];
      t.partitions.forEach((p) => { if (q.partition !== '' && q.partition !== null && q.partition !== undefined && Number(q.partition) !== p.n) return; p.messages.forEach((m) => list.push(Object.assign({ partition: p.n }, m))); });
      if (q.offset !== '' && q.offset !== null && q.offset !== undefined) list = list.filter((m) => m.offset >= Number(q.offset));
      if (q.search) { const s = q.search.toLowerCase(); list = list.filter((m) => (m.key || '').toLowerCase().includes(s) || m.value.toLowerCase().includes(s)); }
      const committedMax = {};
      Object.values(cl.groups).filter((g) => g.topic === t.name).forEach((g) => { Object.entries(g.committed).forEach(([p, o]) => { committedMax[p] = Math.max(committedMax[p] || 0, o); }); });
      list.sort((a, b) => q.order === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);
      const total = list.length;
      list = list.slice(0, Math.min(500, Number(q.limit) || 50));
      return ok({ total, messages: list.map((m) => ({ offset: m.offset, key: m.key, value: m.value, timestamp: m.timestamp, partition: m.partition, consumed: (committedMax[m.partition] || 0) > m.offset, headers: m.headers, formattedTime: new Date(m.timestamp).toLocaleString('ko-KR'), formattedOffset: m.offset.toLocaleString('ko-KR') })) });
    },
    async send(cid, topicName, req) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid); const t = cl.topics[topicName];
      if (!t) return fail('토픽을 찾을 수 없습니다.', 404);
      if (t.internal) return fail('내부 토픽에는 메시지를 보낼 수 없습니다.', 403);
      if (!req.value || !String(req.value).trim()) return fail('메시지 값(value)을 입력해야 합니다.');
      if (req.partition !== '' && req.partition !== null && req.partition !== undefined && (Number(req.partition) < 0 || Number(req.partition) >= t.partitions.length)) return fail(`파티션은 0~${t.partitions.length - 1} 사이여야 합니다.`);
      const upIds = cl.brokers.filter((b) => b.up).map((b) => b.id);
      const count = Math.max(1, Math.min(1000, Number(req.count) || 1));
      const results = [];
      for (let i = 0; i < count; i++) {
        const key = req.key ? (count > 1 ? `${req.key}-${i}` : req.key) : null;
        const n = t.partitions.length;
        const target = req.partition !== '' && req.partition !== null && req.partition !== undefined ? Number(req.partition) : (key ? hash(key) % n : t.rr % n);
        const part = t.partitions[target];
        if (!upIds.includes(part.leader)) return fail(`파티션 ${target}의 리더 브로커(${part.leader})가 응답하지 않습니다. (NOT_LEADER_OR_FOLLOWER)`, 503);
        if (part.isr.length < Number(t.config['min.insync.replicas'] || 1)) return fail(`파티션 ${target}의 ISR(${part.isr.length})이 min.insync.replicas(${t.config['min.insync.replicas']})보다 적어 acks=all 쓰기가 거부되었습니다. (NOT_ENOUGH_REPLICAS)`, 503);
        results.push(appendMessage(t, key, req.value, req.partition === '' ? null : req.partition, req.headers || {}));
      }
      activity('MESSAGE_SENT', '메시지 전송', `토픽 '${topicName}'에 메시지 ${count}건을 보냈습니다.`, cid, topicName);
      save();
      return ok({ sent: count, results });
    }
  };

  const groups = {
    async list(cid) { const e = requireConnected(cid); if (e) return fail(e, 503); const cl = cluster(cid); return ok(Object.values(cl.groups).map((g) => groupDto(g, cl))); },
    async metrics(cid, groupId) { const cl = cluster(cid); const g = cl.groups[groupId]; if (!g) return fail('컨슈머 그룹을 찾을 수 없습니다.', 404); return ok(groupDto(g, cl)); },
    async createTest(cid, req) {
      const e = requireConnected(cid); if (e) return fail(e, 503);
      const cl = cluster(cid);
      const groupId = String(req.groupId || '').trim();
      if (!/^[a-zA-Z0-9._-]+$/.test(groupId)) return fail('그룹 ID는 영문, 숫자, . _ - 만 사용할 수 있습니다.');
      if (cl.groups[groupId]) return fail('같은 그룹 ID가 이미 있습니다.', 409);
      const t = cl.topics[req.topic]; if (!t) return fail('구독할 토픽을 선택하세요.');
      const members = Math.max(0, Math.min(t.partitions.length, Number(req.members) || 1));
      const committed = {};
      t.partitions.forEach((p) => { committed[p.n] = req.from === 'earliest' ? p.earliest : p.latest; });
      cl.groups[groupId] = { groupId, topic: t.name, state: members ? 'Stable' : 'Empty', members: Array.from({ length: members }, (_, i) => ({ memberId: `${groupId}-${i + 1}-${uid().slice(-6)}`, clientId: `${groupId}-client-${i + 1}`, host: `/10.0.2.${10 + i}` })), committed, consumeRate: Math.max(0, Number(req.rate) || 5), running: members > 0 };
      save();
      return ok(groupDto(cl.groups[groupId], cl));
    },
    async setRunning(cid, groupId, running) {
      const cl = cluster(cid); const g = cl.groups[groupId]; if (!g) return fail('컨슈머 그룹을 찾을 수 없습니다.', 404);
      g.running = running;
      if (running && !g.consumeRate) g.consumeRate = g.baseRate || 5;
      if (!running) { g.members = []; g.state = 'Empty'; } else { if (!g.members.length) g.members = [{ memberId: `${groupId}-1-${uid().slice(-6)}`, clientId: `${groupId}-client-1`, host: '/10.0.3.10' }]; g.state = 'PreparingRebalance'; setTimeout(() => { g.state = 'Stable'; save(); }, 2500); }
      save(); return ok(groupDto(g, cl));
    },
    async scale(cid, groupId, members) {
      const cl = cluster(cid); const g = cl.groups[groupId]; if (!g) return fail('컨슈머 그룹을 찾을 수 없습니다.', 404);
      const t = cl.topics[g.topic];
      const pc = t ? t.partitions.length : 1;
      if (!g.baseRate) g.baseRate = Math.max(2, g.consumeRate / Math.max(1, Math.min(g.members.length, pc)));
      const n = Math.max(0, Math.min(10, Number(members)));
      g.members = Array.from({ length: n }, (_, i) => ({ memberId: `${groupId}-${i + 1}-${uid().slice(-6)}`, clientId: `${groupId}-client-${i + 1}`, host: `/10.0.4.${10 + i}` }));
      const effective = Math.min(n, pc);
      g.consumeRate = Math.round(g.baseRate * effective);
      g.running = n > 0;
      g.state = n ? 'PreparingRebalance' : 'Empty';
      if (n) setTimeout(() => { g.state = 'Stable'; save(); }, 2500);
      save();
      return ok(Object.assign(groupDto(g, cl), { idleMembers: Math.max(0, n - (t ? t.partitions.length : n)) }));
    },
    async remove(cid, groupId) {
      const cl = cluster(cid); const g = cl.groups[groupId]; if (!g) return fail('컨슈머 그룹을 찾을 수 없습니다.', 404);
      if (g.members.length) return fail('활성 멤버가 있는 그룹은 삭제할 수 없습니다. (NON_EMPTY_GROUP)', 409);
      delete cl.groups[groupId]; save(); return ok(true);
    }
  };

  const monitoring = {
    async dashboard(cid) {
      const c = conn(cid); if (!c) return fail('연결을 찾을 수 없습니다.', 404);
      const cl = cluster(cid);
      const health = (await connections.health(cid)).data;
      const ts = Object.values(cl.topics).filter((t) => !t.internal).map((t) => topicDto(t, cl)).sort((a, b) => b.messageCount - a.messageCount);
      return ok({ connection: connDto(c), metrics: computeMetrics(cid), health, topTopics: ts.slice(0, 5), groups: Object.values(cl.groups).map((g) => groupDto(g, cl)), recentActivities: db.activities.filter((a) => !a.connectionId || a.connectionId === cid).slice(0, 8), brokers: cl.brokers.slice(), controllerId: cl.controllerId, history: (db.metricsHistory[cid] || []).slice(-45) });
    },
    async detailedMetrics(cid) { const e = requireConnected(cid); if (e) return fail(e, 503); const cl = cluster(cid); return ok(Object.assign(computeMetrics(cid), { underReplicated: Object.values(cl.topics).reduce((s, t) => s + topicHealth(t, cl).underReplicatedPartitions, 0), offline: Object.values(cl.topics).reduce((s, t) => s + topicHealth(t, cl).offlinePartitions, 0), totalMessages: Object.values(cl.topics).reduce((s, t) => s + msgCount(t), 0) })); },
    async performance(cid) {
      const h = (db.metricsHistory[cid] || []).slice(-45);
      const avg = (k) => h.length ? Math.round(h.reduce((s, x) => s + x[k], 0) / h.length * 10) / 10 : 0;
      return ok({ series: h, avgMessagesPerSecond: avg('mps'), avgBytesIn: avg('bin'), avgBytesOut: avg('bout'), produceLatencyP99Ms: rand(4, 30), fetchLatencyP99Ms: rand(2, 20), requestQueueSize: rand(0, 6) });
    },
    async partition(cid, topicName, n) { const cl = cluster(cid); const t = cl.topics[topicName]; if (!t) return fail('토픽을 찾을 수 없습니다.', 404); const p = t.partitions[Number(n)]; if (!p) return fail('파티션을 찾을 수 없습니다.', 404); return ok(Object.assign(partDto(p, cl), { segmentCount: Math.max(1, Math.ceil(p.latest / 150)), sizeBytes: p.messages.reduce((s, m) => s + m.value.length + (m.key || '').length, 0) })); },
    async offsetInfo(cid, topicName, n, groupId) {
      const cl = cluster(cid); const t = cl.topics[topicName]; if (!t) return fail('토픽을 찾을 수 없습니다.', 404);
      const p = t.partitions[Number(n)]; if (!p) return fail('파티션을 찾을 수 없습니다.', 404);
      const g = groupId ? cl.groups[groupId] : null;
      const cur = g ? (g.committed[p.n] || 0) : null;
      return ok({ topic: topicName, partition: p.n, earliestOffset: p.earliest, latestOffset: p.latest, consumerOffset: cur, lag: cur === null ? null : Math.max(0, p.latest - cur) });
    },
    async setOffset(cid, topicName, n, groupId, type, value) {
      const cl = cluster(cid); const t = cl.topics[topicName]; if (!t) return fail('토픽을 찾을 수 없습니다.', 404);
      const g = cl.groups[groupId]; if (!g) return fail('컨슈머 그룹을 선택하세요.');
      if (g.topic !== topicName) return fail('이 그룹은 해당 토픽을 구독하지 않습니다.');
      if (g.members.length && g.running) return fail('오프셋 변경은 그룹이 비활성(Empty)일 때만 가능합니다. 컨슈머를 먼저 중지하세요.', 409);
      const targets = n === 'all' ? t.partitions : [t.partitions[Number(n)]];
      for (const p of targets) {
        if (!p) return fail('파티션을 찾을 수 없습니다.', 404);
        let off = type === 'EARLIEST' ? p.earliest : type === 'LATEST' ? p.latest : Number(value);
        if (type === 'SPECIFIC' && (isNaN(off) || off < p.earliest || off > p.latest)) return fail(`오프셋은 ${p.earliest}~${p.latest} 사이여야 합니다. (파티션 ${p.n})`);
        g.committed[p.n] = off;
      }
      save();
      return ok(groupDto(g, cl));
    },
    async clusterInfo(cid) { const e = requireConnected(cid); if (e) return fail(e, 503); const cl = cluster(cid); return ok({ clusterId: cl.clusterId, controllerId: cl.controllerId, brokers: cl.brokers.map((b) => Object.assign({}, b, { leaderPartitions: Object.values(cl.topics).reduce((s, t) => s + t.partitions.filter((p) => p.leader === b.id).length, 0), replicaPartitions: Object.values(cl.topics).reduce((s, t) => s + t.partitions.filter((p) => p.replicas.includes(b.id)).length, 0) })), kafkaVersion: '3.9.0' }); },
    async setBroker(cid, brokerId, up) {
      const cl = cluster(cid); const b = cl.brokers.find((x) => x.id === Number(brokerId)); if (!b) return fail('브로커를 찾을 수 없습니다.', 404);
      if (!up && cl.brokers.filter((x) => x.up).length === 1 && b.up) return fail('마지막 브로커는 중지할 수 없습니다. (데모 보호)');
      b.up = up;
      const upIds = cl.brokers.filter((x) => x.up).map((x) => x.id);
      Object.values(cl.topics).forEach((t) => t.partitions.forEach((p) => {
        if (!up) { p.isr = p.isr.filter((id) => id !== b.id); if (p.leader === b.id) { const next = p.isr.find((id) => upIds.includes(id)); if (next) p.leader = next; } }
        else { if (p.replicas.includes(b.id) && !p.isr.includes(b.id)) setTimeout(() => { if (b.up && !p.isr.includes(b.id)) { p.isr.push(b.id); p.isr.sort(); save(); } }, 4000); if (!upIds.includes(p.leader) && p.replicas.includes(b.id)) p.leader = b.id; }
      }));
      if (!up && cl.controllerId === b.id) cl.controllerId = upIds[0];
      activity(up ? 'CONNECTION_UPDATED' : 'ERROR_OCCURRED', up ? '브로커 복구' : '브로커 장애', up ? `브로커 ${b.id}가 다시 시작되었습니다. ISR 복귀를 기다립니다.` : `브로커 ${b.id}가 응답하지 않습니다. 리더 선출이 진행됩니다.`, cid);
      save();
      return ok(true);
    },
    async preferredLeaderElection(cid) {
      const cl = cluster(cid); const upIds = cl.brokers.filter((x) => x.up).map((x) => x.id); let moved = 0;
      Object.values(cl.topics).forEach((t) => t.partitions.forEach((p) => { if (p.leader !== p.replicas[0] && upIds.includes(p.replicas[0]) && p.isr.includes(p.replicas[0])) { p.leader = p.replicas[0]; moved++; } }));
      save(); return ok({ moved });
    }
  };

  const SEV_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  function createAlert(type, severity, title, message, connectionId, topicName, partitionNumber) {
    if (db.alerts.some((a) => a.type === type && a.connectionId === (connectionId || null) && (a.topicName || '') === (topicName || '') && a.title === title && !a.isAcknowledged)) return null;
    const a = { id: uid('alert-'), type, severity, title, message, connectionId: connectionId || null, topicName: topicName || null, partitionNumber: partitionNumber === undefined ? null : partitionNumber, timestamp: now(), isAcknowledged: false, acknowledgedAt: null, acknowledgedBy: null };
    db.alerts.unshift(a);
    WS.publish('/topic/global', { type: 'ALERT', data: a });
    return a;
  }
  const alerts = {
    async active() { return ok(db.alerts.filter((a) => !a.isAcknowledged).sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || b.timestamp - a.timestamp)); },
    async all() { return ok(db.alerts.slice()); },
    async bySeverity(sev) { return ok(db.alerts.filter((a) => a.severity === sev)); },
    async get(id) { const a = db.alerts.find((x) => x.id === id); if (!a) return fail('알림을 찾을 수 없습니다.', 404); return ok(a); },
    async acknowledge(id, by) { const a = db.alerts.find((x) => x.id === id); if (!a) return fail('알림을 찾을 수 없습니다.', 404); if (a.isAcknowledged) return fail('이미 확인한 알림입니다.'); a.isAcknowledged = true; a.acknowledgedAt = now(); a.acknowledgedBy = by; save(); return ok(a); },
    async clearAll() { const n = db.alerts.length; db.alerts = []; save(); return ok({ cleared: n }); },
    async check(cid, lagThreshold) {
      const c = conn(cid); if (!c) return fail('연결을 찾을 수 없습니다.', 404);
      const created = [];
      const push = (a) => { if (a) created.push(a); };
      if (c.status !== 'CONNECTED') {
        push(createAlert('CONNECTION_ERROR', 'HIGH', '연결 오류', `연결 '${c.name}'에 접속할 수 없습니다.`, cid));
      } else {
        const cl = cluster(cid);
        cl.brokers.filter((b) => !b.up).forEach((b) => push(createAlert('LEADER_NOT_AVAILABLE', 'CRITICAL', '브로커 응답 없음', `브로커 ${b.id} (${b.host})가 응답하지 않습니다.`, cid)));
        Object.values(cl.topics).forEach((t) => {
          if (t.internal) return;
          const h = topicHealth(t, cl);
          if (h.underReplicatedPartitions > 0) push(createAlert('UNDER_REPLICATED', 'MEDIUM', '복제 부족 파티션 감지', `토픽 '${t.name}'에 복제 부족 파티션이 ${h.underReplicatedPartitions}개 있습니다.`, cid, t.name));
          if (!h.isHealthy) push(createAlert('OFFLINE_PARTITION', 'HIGH', '비정상 토픽 감지', `토픽 '${t.name}'이 비정상 상태입니다. 즉시 확인이 필요합니다.`, cid, t.name));
          if (msgCount(t) === 0) push(createAlert('UNDER_REPLICATED', 'LOW', '비활성 토픽 감지', `토픽 '${t.name}'에 메시지가 없습니다. 토픽이 사용되지 않고 있을 수 있습니다.`, cid, t.name));
          if (t.replicationFactor < 2) push(createAlert('REPLICATION_FACTOR_MISMATCH', 'LOW', '복제 팩터 부족', `토픽 '${t.name}'의 복제 팩터가 ${t.replicationFactor}이라 브로커 장애 시 데이터 손실 위험이 있습니다.`, cid, t.name));
        });
        Object.values(cl.groups).forEach((g) => {
          const d = groupDto(g, cl);
          if (g.state !== 'Stable') push(createAlert('CONSUMER_LAG', 'MEDIUM', '컨슈머 그룹 문제 감지', `컨슈머 그룹 '${g.groupId}'이 안정적이지 않습니다. 상태: ${g.state}`, cid));
          if (!g.members.length) push(createAlert('CONSUMER_LAG', 'LOW', '비활성 컨슈머 그룹', `컨슈머 그룹 '${g.groupId}'에 활성 멤버가 없습니다.`, cid));
          if (d.totalLag > (lagThreshold || 500)) push(createAlert('CONSUMER_LAG', 'HIGH', '컨슈머 랙 임계치 초과', `컨슈머 그룹 '${g.groupId}'의 랙이 ${d.totalLag.toLocaleString()}건으로 임계치 ${(lagThreshold || 500).toLocaleString()}건을 넘었습니다.`, cid, g.topic));
        });
      }
      save();
      return ok({ created: created.length, alerts: created }, 400);
    },
    async createTest(cid, severity) { const a = createAlert('CONNECTION_ERROR', severity || 'MEDIUM', '테스트 알림', `알림 동작 확인용 테스트 알림입니다. (${new Date().toLocaleTimeString('ko-KR')})`, cid); save(); return ok(a); }
  };

  const activities = {
    async recent(limit) { return ok(db.activities.slice(0, Number(limit) || 50)); },
    async byConnection(cid) { return ok(db.activities.filter((a) => a.connectionId === cid)); }
  };

  async function resetAll() { db = seedDb(); Demo.store.set(KEY, db); return ok(true); }

  return { connections, topics, messages, groups, monitoring, alerts, activities, ws: WS, resetAll, SAMPLE };
})();
