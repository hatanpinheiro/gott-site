/**
 * GOTT – Grupo de Observação e Transformação do Território | UFSC
 * Funções compartilhadas: leitura do conteúdo (pasta /content, editada pelo painel /admin),
 * renderização segura, cabeçalho, rodapé, aviso e animação da malha cadastral.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ dados */
  const cache = {};
  function load(name) {
    if (!cache[name]) {
      cache[name] = fetch(`content/${name}.json`, { cache: 'no-cache' })
        .then((r) => { if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`); return r.json(); });
    }
    return cache[name];
  }
  const items = (name) => load(name).then((d) => (Array.isArray(d) ? d : d.itens || []));

  /* ------------------------------------------------------------ utilitários */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  // Aceita apenas http(s), mailto e caminhos relativos (bloqueia "javascript:" etc.)
  function url(v) {
    const s = String(v ?? '').trim();
    if (!s) return '';
    if (/^(https?:|mailto:)/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//')) return '';
    return s.replace(/^\/+/, '');
  }

  function md(text) {
    if (!text) return '';
    const html = window.marked ? window.marked.parse(String(text), { breaks: true }) : esc(text).replace(/\n/g, '<br>');
    return window.DOMPurify ? window.DOMPurify.sanitize(html) : esc(text);
  }

  function parseDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? new Date(+m[1], m[2] - 1, +m[3]) : null;
  }
  function fmtDate(iso, opts) {
    const d = parseDate(iso);
    return d ? d.toLocaleDateString('pt-BR', opts || { day: '2-digit', month: 'long', year: 'numeric' }) : esc(iso || '');
  }
  const shortDate = (iso) => fmtDate(iso, { day: '2-digit', month: '2-digit', year: 'numeric' });

  function slugify(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  const newsSlug = (n) => n.slug || slugify(n.titulo);
  const pad = (i) => String(i).padStart(2, '0');

  function initials(name) {
    const p = String(name || '').trim().split(/\s+/).filter((w) => w.length > 2);
    return (((p[0] || '')[0] || '') + ((p.length > 1 ? p[p.length - 1] : '')[0] || '')).toUpperCase();
  }

  function avatar(person, sizeClass) {
    const fallback = `<div class="avatar-fallback ${sizeClass}" aria-hidden="true">${esc(initials(person.nome))}</div>`;
    const src = url(person.foto);
    if (!src) return fallback;
    return `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"
      class="${sizeClass} object-cover bg-gray-100" onerror="this.outerHTML=this.dataset.fb" data-fb="${esc(fallback)}">`;
  }

  const icons = () => window.lucide && window.lucide.createIcons();
  const ext = (href) => (/^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '');
  const arrow = (cls = 'w-4 h-4') => `<i data-lucide="arrow-up-right" class="arrow ${cls}"></i>`;

  /* ---------------------------------------------------------------- logo */
  // Símbolo original do GOTT (o olho laranja) + nome em Anton
  const SYMBOL = '<img src="assets/img/logo-simbolo.svg" alt="" width="166" height="117" class="logo-symbol">';

  function logo(dark) {
    return `<span class="logo${dark ? ' logo-dark' : ''}">
      ${SYMBOL}
      <span class="logo-word display">GOTT<span class="logo-dot">.</span></span>
      <span class="logo-tag label">UFSC<br>Observação e<br>Transformação<br>do Território</span>
    </span>`;
  }

  /* ------------------------------------------------- cabeçalho e rodapé */
  const NAV = [
    ['institucional', 'Sobre'], ['linhas-pesquisa', 'Pesquisa'], ['membros', 'Membros'],
    ['noticias', 'Notícias'], ['acervo', 'Acervo'],
  ];

  function renderHeader() {
    const el = document.getElementById('site-header');
    if (!el) return;
    const page = document.body.dataset.page;
    const home = page === 'home';
    const href = (id) => (id === 'noticias' && !home ? 'noticias.html' : `${home ? '' : 'index.html'}#${id}`);
    const isActive = (id) => id === 'noticias' && (page === 'noticias' || page === 'noticia');
    const link = (cls) => ([id, label]) =>
      `<a href="${href(id)}" class="${cls}${isActive(id) ? ' active' : ''}"${isActive(id) ? ' aria-current="page"' : ''}>${label}</a>`;

    el.className = 'site-header sticky top-0 z-50';
    el.innerHTML = `
      <nav class="wrap flex items-stretch justify-between h-[72px]" aria-label="Principal">
        <a href="index.html" class="flex items-center px-4 sm:px-6" aria-label="GOTT – página inicial">
          ${logo()}
        </a>
        <div class="hidden lg:flex items-center gap-10 px-6">${NAV.map(link('nav-link')).join('')}</div>
        <div class="flex items-stretch">
          <a href="${home ? '' : 'index.html'}#contato" class="nav-cta hidden sm:flex">Fale com o grupo ${arrow()}</a>
          <button id="menu-btn" class="lg:hidden px-5 border-l-2 border-ink-text text-ink-text" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-menu">
            <i data-lucide="menu" class="w-6 h-6"></i></button>
        </div>
      </nav>
      <div id="mobile-menu" class="hidden lg:hidden absolute w-full bg-white border-b-2 border-ink-text">
        <div class="flex flex-col">${NAV.concat([['contato', 'Contato']]).map(link('display text-4xl px-5 py-3 border-t border-ink-line hover:bg-orange')).join('')}</div>
      </div>`;

    const btn = el.querySelector('#menu-btn');
    const menu = el.querySelector('#mobile-menu');
    const setOpen = (open) => {
      menu.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      btn.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}" class="w-6 h-6"></i>`;
      icons();
    };
    btn.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.classList.contains('hidden')) setOpen(false); });

    if (home && 'IntersectionObserver' in window) {
      const map = new Map([...el.querySelectorAll('.nav-link')].map((a) => [a.getAttribute('href').slice(1), a]));
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) map.forEach((a, id) => a.classList.toggle('active', id === en.target.id));
      }), { rootMargin: '-40% 0px -55% 0px' });
      map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  function renderFooter(site) {
    const el = document.getElementById('contato');
    if (!el) return;
    const c = site.contato || {};
    el.className = 'bg-ink text-white on-dark';
    el.innerHTML = `
      <div class="wrap px-4 sm:px-6 pt-16 pb-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/20">
          <div class="lg:col-span-5">
            <div class="mb-10">${logo(true)}</div>
            <p class="label text-orange mb-4">Contato</p>
            <h2 class="display section-title">Vamos<br>conversar<span class="text-orange">.</span></h2>
            ${c.email ? `<a href="mailto:${esc(c.email)}" class="btn btn-orange mt-8 w-full sm:w-auto">${esc(c.email)} ${arrow()}</a>` : ''}
          </div>
          <div class="lg:col-span-4 mono text-sm space-y-6">
            <div><p class="label text-white/50 mb-2">Endereço</p><p class="leading-relaxed">${esc(c.endereco).replace(/\n/g, '<br>')}</p></div>
            ${c.departamento ? `<div><p class="label text-white/50 mb-2">Vinculação</p><p>${esc(c.departamento)}<br>Universidade Federal de Santa Catarina</p></div>` : ''}
          </div>
          <div class="lg:col-span-3 mono text-sm space-y-3">
            <p class="label text-white/50 mb-2">Links</p>
            ${c.instagram ? `<a href="${esc(url(c.instagram))}" target="_blank" rel="noopener noreferrer" class="link-arrow">Instagram ${arrow('w-3.5 h-3.5')}</a><br>` : ''}
            ${c.dgp_cnpq ? `<a href="${esc(url(c.dgp_cnpq))}" target="_blank" rel="noopener noreferrer" class="link-arrow">Diretório CNPq ${arrow('w-3.5 h-3.5')}</a><br>` : ''}
            <a href="https://ufsc.br" target="_blank" rel="noopener noreferrer" class="link-arrow">UFSC ${arrow('w-3.5 h-3.5')}</a>
          </div>
        </div>
        <p class="display leading-none select-none pt-8" style="font-size:clamp(5rem,22vw,20rem);color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.35)" aria-hidden="true">GOTT<span style="color:#f97316;-webkit-text-stroke:0">.</span></p>
        <div class="flex flex-col sm:flex-row justify-between gap-3 label text-white/60 pt-6 border-t border-white/20">
          <p>© ${new Date().getFullYear()} ${esc(site.nome_completo)}</p>
          <a href="admin/" class="hover:text-orange inline-flex items-center gap-2"><i data-lucide="lock" class="w-3 h-3"></i> Área de edição</a>
        </div>
      </div>`;
    icons();
  }

  /* --------------------------------------------- malha cadastral animada */
  function initGrid(canvas) {
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, gap = 60, cols = 0, rows = 0, grid = [], raf = 0, visible = true;
    const mouse = { x: null, y: null, r: 180 };

    function build() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W > 768 ? 56 : 40;
      cols = Math.ceil(W / gap) + 1; rows = Math.ceil(H / gap) + 1;
      grid = [];
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        grid.push(Math.random() > 0.3 ? { bx: i * gap + (Math.random() * 10 - 5), by: j * gap + (Math.random() * 10 - 5),
          a: Math.random() * Math.PI * 2, s: 0.1 + Math.random() * 0.2, size: Math.random() > 0.8 ? 3 : 1.5, x: 0, y: 0, hot: 0 } : null);
      }
    }
    function step() {
      for (const n of grid) {
        if (!n) continue;
        if (!reduce) n.a += n.s * 0.05;
        n.x = n.bx + Math.cos(n.a) * 5; n.y = n.by + Math.sin(n.a) * 5; n.hot = 0;
        if (mouse.x !== null) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
          if (d < mouse.r && d > 0) { const f = (mouse.r - d) / mouse.r; n.x -= (dx / d) * f * 15; n.y -= (dy / d) * f * 15; n.hot = f; }
        }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 0.6;
      const max = gap * 1.5;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const a = grid[i * rows + j];
        if (!a) continue;
        for (const [di, dj] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
          const ii = i + di, jj = j + dj;
          if (ii >= cols || jj < 0 || jj >= rows) continue;
          const b = grid[ii * rows + jj];
          if (!b) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d >= max) continue;
          const o = 1 - d / max;
          ctx.strokeStyle = a.hot || b.hot ? `rgba(249,115,22,${o * 0.8})` : `rgba(255,255,255,${o * 0.14})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (const n of grid) {
        if (!n) continue;
        ctx.fillStyle = n.hot ? `rgba(249,115,22,${0.5 + n.hot * 0.5})` : 'rgba(255,255,255,0.28)';
        ctx.fillRect(n.x - n.size / 2, n.y - n.size / 2, n.size, n.size);
      }
    }
    function loop() { step(); draw(); raf = visible && !reduce ? requestAnimationFrame(loop) : 0; }

    const host = canvas.parentElement;
    host.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (reduce) { step(); draw(); }
    });
    host.addEventListener('pointerleave', () => { mouse.x = mouse.y = null; if (reduce) { step(); draw(); } });
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { build(); step(); draw(); }, 150); });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf && !reduce) loop(); }).observe(canvas);
    build(); loop();
  }

  /* --------------------------------------------------------------- aviso */
  function popup(aviso) {
    if (!aviso || !aviso.ativo || !aviso.titulo) return;
    const exp = parseDate(aviso.expira_em);
    if (exp && exp.setHours(23, 59, 59) < Date.now()) return;
    const key = 'gottAviso:' + aviso.titulo;
    try { if (sessionStorage.getItem(key)) return; } catch (e) { /* sem storage */ }

    const link = url(aviso.link);
    const wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 bg-ink/80 flex items-center justify-center z-[100] p-4 transition-opacity duration-300 opacity-0';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'aviso-titulo');
    wrap.innerHTML = `
      <div class="relative bg-orange text-ink-text w-full max-w-xl p-8 sm:p-12 border-2 border-ink-text" style="box-shadow:12px 12px 0 #2e2e2e">
        <button class="absolute top-0 right-0 bg-ink-text text-white p-3 hover:bg-white hover:text-ink-text" aria-label="Fechar aviso" data-close>
          <i data-lucide="x" class="w-5 h-5"></i></button>
        <p class="label mb-6">Aviso</p>
        <h2 id="aviso-titulo" class="display text-5xl sm:text-6xl mb-6">${esc(aviso.titulo)}</h2>
        ${aviso.texto ? `<p class="mono text-sm">${esc(aviso.texto)}</p>` : ''}
        ${link ? `<a href="${esc(link)}"${ext(link)} class="btn btn-ink mt-8">${esc(aviso.link_texto || 'Saiba mais')} ${arrow()}</a>` : ''}
      </div>`;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    function close() { wrap.classList.add('opacity-0'); setTimeout(() => wrap.remove(), 300); document.removeEventListener('keydown', onKey); }
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });

    setTimeout(() => {
      document.body.appendChild(wrap); icons();
      requestAnimationFrame(() => wrap.classList.remove('opacity-0'));
      wrap.querySelector('[data-close]').focus();
      document.addEventListener('keydown', onKey);
      try { sessionStorage.setItem(key, '1'); } catch (e) { /* ignora */ }
    }, 1500);
  }

  const errorBox = (msg) => `<div class="col-span-full p-10 mono text-sm border-2 border-orange text-ink-text">${esc(msg)}</div>`;

  /* --------------------------------------------------------- inicialização */
  window.GOTT = { load, items, esc, url, md, fmtDate, shortDate, parseDate, slugify, newsSlug, pad, avatar, icons, ext, arrow, initGrid, popup, errorBox };

  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    icons();
    load('site').then(renderFooter).catch(() => {});
  });
})();
