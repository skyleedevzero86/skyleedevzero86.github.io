const Demo = (() => {
  const mem = {};
  const store = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        if (mem[key]) return JSON.parse(mem[key]);
      }
      if (mem[key]) return JSON.parse(mem[key]);
      return fallback;
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      mem[key] = raw;
      try { window.localStorage.setItem(key, raw); } catch (e) { }
    },
    remove(key) {
      delete mem[key];
      try { window.localStorage.removeItem(key); } catch (e) { }
    }
  };

  const session = {
    get(key) {
      try { const v = window.sessionStorage.getItem(key); if (v) return JSON.parse(v); } catch (e) { }
      return mem['s:' + key] ? JSON.parse(mem['s:' + key]) : null;
    },
    set(key, value) {
      mem['s:' + key] = JSON.stringify(value);
      try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
    },
    remove(key) {
      delete mem['s:' + key];
      try { window.sessionStorage.removeItem(key); } catch (e) { }
    }
  };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const uid = (p) => (p || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (v) => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => Number(v || 0).toLocaleString('ko-KR');
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (t) => {
    if (!t) return '-';
    const d = new Date(t);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  const fmtDate = (t) => {
    if (!t) return '-';
    const d = new Date(t);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const bytes = (b) => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function toast(msg, type) {
    let box = $('.toast-box');
    if (!box) { box = document.createElement('div'); box.className = 'toast-box'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  function modal(title, bodyHtml, actions) {
    let bg = $('#demoModalBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'demoModalBg';
      bg.className = 'modal-bg';
      bg.innerHTML = '<div class="modal"><h3></h3><div class="modal-body"></div><div class="actions"></div></div>';
      document.body.appendChild(bg);
      bg.addEventListener('click', (e) => { if (e.target === bg) closeModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    }
    $('h3', bg).textContent = title;
    $('.modal-body', bg).innerHTML = bodyHtml;
    const act = $('.actions', bg);
    act.innerHTML = '';
    (actions || [{ label: '닫기' }]).forEach((a) => {
      const b = document.createElement('button');
      b.className = a.primary ? 'btn-primary' : (a.danger ? 'btn btn-danger' : 'btn');
      b.textContent = a.label;
      b.addEventListener('click', async () => {
        if (a.onClick) {
          const r = await a.onClick(bg);
          if (r === false) return;
        }
        closeModal();
      });
      act.appendChild(b);
    });
    bg.classList.add('on');
    return bg;
  }

  function closeModal() {
    const bg = $('#demoModalBg');
    if (bg) bg.classList.remove('on');
  }

  function confirmBox(msg) {
    return new Promise((resolve) => {
      modal('확인', `<p>${esc(msg)}</p>`, [
        { label: '취소', onClick: () => resolve(false) },
        { label: '확인', primary: true, onClick: () => resolve(true) }
      ]);
    });
  }

  function downloadText(filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function downloadCsv(filename, header, rows) {
    const q = (v) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    const text = '﻿' + [header.map(q).join(','), ...rows.map((r) => r.map(q).join(','))].join('\r\n');
    downloadText(filename, text, 'text/csv;charset=utf-8');
  }

  function paginate(list, page, size) {
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / size));
    const p = Math.min(Math.max(1, page), pages);
    return { content: list.slice((p - 1) * size, p * size), page: p, pages, total, size };
  }

  function pager(el, result, onPage) {
    el.innerHTML = `<span>총 ${num(result.total)}건 · ${result.page}/${result.pages}</span>
      <button class="btn btn-sm" data-p="1" ${result.page === 1 ? 'disabled' : ''}>처음</button>
      <button class="btn btn-sm" data-p="${result.page - 1}" ${result.page === 1 ? 'disabled' : ''}>이전</button>
      <button class="btn btn-sm" data-p="${result.page + 1}" ${result.page === result.pages ? 'disabled' : ''}>다음</button>
      <button class="btn btn-sm" data-p="${result.pages}" ${result.page === result.pages ? 'disabled' : ''}>끝</button>`;
    $$('button', el).forEach((b) => b.addEventListener('click', () => onPage(Number(b.dataset.p))));
  }

  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 220;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px -apple-system, "Malgun Gothic", sans-serif';
    return { ctx, w, h };
  }

  function lineChart(canvas, labels, series) {
    const { ctx, w, h } = setupCanvas(canvas);
    const L = 44, R = 12, T = 16, B = 26;
    const all = series.flatMap((s) => s.data);
    const max = Math.max(1, ...all) * 1.15;
    ctx.strokeStyle = '#e3e7ee';
    ctx.fillStyle = '#6b7684';
    for (let i = 0; i <= 4; i++) {
      const y = T + (h - T - B) * i / 4;
      ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(w - R, y); ctx.stroke();
      ctx.fillText(Math.round(max * (4 - i) / 4).toLocaleString(), 4, y + 4);
    }
    const n = Math.max(2, labels.length);
    const x = (i) => L + (w - L - R) * i / (n - 1);
    const step = Math.ceil(labels.length / 6);
    labels.forEach((lb, i) => { if (i % step === 0) ctx.fillText(lb, x(i) - 14, h - 8); });
    series.forEach((s) => {
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.beginPath();
      s.data.forEach((v, i) => {
        const y = T + (h - T - B) * (1 - v / max);
        if (i === 0) ctx.moveTo(x(i), y); else ctx.lineTo(x(i), y);
      });
      ctx.stroke(); ctx.lineWidth = 1;
    });
    let lx = L;
    series.forEach((s) => {
      ctx.fillStyle = s.color; ctx.fillRect(lx, 2, 10, 8);
      ctx.fillStyle = '#1f2a37'; ctx.fillText(s.label, lx + 14, 10);
      lx += ctx.measureText(s.label).width + 34;
    });
  }

  function barChart(canvas, labels, values, color) {
    const { ctx, w, h } = setupCanvas(canvas);
    const L = 44, R = 10, T = 12, B = 34;
    const max = Math.max(1, ...values) * 1.15;
    ctx.strokeStyle = '#e3e7ee'; ctx.fillStyle = '#6b7684';
    for (let i = 0; i <= 4; i++) {
      const y = T + (h - T - B) * i / 4;
      ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(w - R, y); ctx.stroke();
      ctx.fillText(Math.round(max * (4 - i) / 4).toLocaleString(), 4, y + 4);
    }
    const bw = (w - L - R) / Math.max(1, values.length);
    values.forEach((v, i) => {
      const bh = (h - T - B) * v / max;
      ctx.fillStyle = color || '#2f6fed';
      ctx.fillRect(L + i * bw + bw * 0.18, h - B - bh, bw * 0.64, bh);
      ctx.fillStyle = '#6b7684';
      const lb = labels[i].length > 5 ? labels[i].slice(0, 5) : labels[i];
      ctx.fillText(lb, L + i * bw + bw * 0.5 - ctx.measureText(lb).width / 2, h - 18);
      const vt = Number(v).toLocaleString();
      ctx.fillText(vt, L + i * bw + bw * 0.5 - ctx.measureText(vt).width / 2, h - B - bh - 4);
    });
  }

  function auth(appKey, onLogin) {
    const key = 'demo-auth-' + appKey;
    const loginEl = $('#login');
    const appEl = $('#app');
    const show = (user) => {
      loginEl.style.display = 'none';
      appEl.classList.add('on');
      $$('[data-user-name]').forEach((e) => { e.textContent = user.name; });
      $$('[data-user-provider]').forEach((e) => { e.textContent = user.provider; });
      $$('[data-user-avatar]').forEach((e) => { e.textContent = user.name.slice(0, 1).toUpperCase(); });
      onLogin(user);
    };
    const saved = session.get(key);
    if (saved) { show(saved); return; }
    $('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#loginId').value.trim() || 'guest';
      const user = { name: id, provider: '일반 로그인', loginAt: Date.now() };
      session.set(key, user);
      toast(`${id} 님, 자동 로그인되었습니다.`, 'ok');
      show(user);
    });
    $$('[data-sns]').forEach((b) => b.addEventListener('click', async () => {
      const p = b.dataset.sns;
      const names = { kakao: '카카오', naver: '네이버', google: 'Google', github: 'GitHub' };
      b.disabled = true;
      b.textContent = `${names[p]} 인증 중...`;
      await delay(700);
      const user = { name: `${p}_user${rand(100, 999)}`, provider: `${names[p]} 로그인`, loginAt: Date.now() };
      session.set(key, user);
      toast(`${names[p]} 계정으로 로그인되었습니다.`, 'ok');
      show(user);
    }));
    $$('[data-logout]').forEach((b) => b.addEventListener('click', () => {
      session.remove(key);
      window.location.reload();
    }));
  }

  function nav(onChange) {
    const go = (name) => {
      $$('.side nav button').forEach((b) => b.classList.toggle('active', b.dataset.page === name));
      $$('.page').forEach((p) => p.classList.toggle('on', p.id === 'page-' + name));
      const btn = $(`.side nav button[data-page="${name}"]`);
      if (btn) $('#pageTitle').textContent = btn.dataset.title || btn.textContent.trim();
      if (window.location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
      onChange(name);
    };
    $$('.side nav button').forEach((b) => b.addEventListener('click', () => go(b.dataset.page)));
    const first = (window.location.hash || '').replace('#', '');
    const exists = first && $(`.side nav button[data-page="${first}"]`);
    go(exists ? first : $('.side nav button').dataset.page);
    return go;
  }

  function formData(root) {
    const o = {};
    $$('[name]', root).forEach((el) => {
      if (el.type === 'checkbox') o[el.name] = el.checked;
      else if (el.type === 'number') o[el.name] = el.value === '' ? null : Number(el.value);
      else o[el.name] = el.value;
    });
    return o;
  }

  return { store, session, delay, rand, pick, uid, esc, num, fmt, fmtDate, bytes, $, $$, toast, modal, closeModal, confirmBox, downloadText, downloadCsv, paginate, pager, lineChart, barChart, auth, nav, formData };
})();
