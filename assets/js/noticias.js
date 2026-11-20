/* Listagem de notícias com busca e filtro por categoria */
document.addEventListener('DOMContentLoaded', () => {
  const G = window.GOTT;
  const { esc, url, pad, arrow } = G;
  const $ = (id) => document.getElementById(id);
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const params = new URLSearchParams(location.search);
  let todas = [], cat = params.get('categoria') || '', termo = norm(params.get('q') || '');
  if (termo) $('busca').value = params.get('q');

  const estilos = ['tile-white', 'tile-orange', 'tile-ink', 'tile-paper', 'tile-white', 'tile-ink'];

  function render() {
    const cats = [...new Set(todas.map((n) => n.categoria || 'Geral'))].sort();
    $('filtros').innerHTML = ['', ...cats].map((c) =>
      `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === cat}">${c ? esc(c) : 'Todas'}<span class="count">${c ? todas.filter((n) => (n.categoria || 'Geral') === c).length : todas.length}</span></button>`).join('');

    let lista = cat ? todas.filter((n) => (n.categoria || 'Geral') === cat) : todas;
    if (termo) lista = lista.filter((n) => norm([n.titulo, n.subtitulo, n.resumo, n.corpo, (n.tags || []).join(' ')].join(' ')).includes(termo));

    $('resultado').textContent = `${lista.length} ${lista.length === 1 ? 'notícia' : 'notícias'}${cat ? ` em ${cat}` : ''}${termo ? ` para “${$('busca').value.trim()}”` : ''}`;
    $('lista').innerHTML = lista.length ? lista.map((n, i) => `
      <a href="noticia.html?n=${encodeURIComponent(G.newsSlug(n))}" class="tile ${estilos[i % estilos.length]} p-6 sm:p-8 min-h-[340px] reveal" style="animation-delay:${Math.min(i, 9) * 40}ms">
        ${n.imagem && url(n.imagem) ? `<img class="tile-img" src="${esc(url(n.imagem))}" alt="" loading="lazy" onerror="this.remove()">` : ''}
        <div class="flex justify-between items-start mb-6"><span class="num">${pad(i + 1)} /</span><span class="label opacity-80">${G.shortDate(n.data)}</span></div>
        <p class="label mb-3 opacity-80">${esc(n.categoria || 'Geral')}</p>
        <h2 class="display text-[2.2rem] leading-[0.95] line-clamp-4">${esc(n.titulo)}</h2>
        ${n.resumo || n.subtitulo ? `<p class="mono text-[0.72rem] uppercase leading-relaxed mt-4 opacity-80 line-clamp-3">${esc(n.subtitulo || n.resumo)}</p>` : ''}
        <span class="mt-auto pt-8">${arrow('w-6 h-6')}</span>
      </a>`).join('') + '<div class="hidden lg:block"></div>'.repeat((3 - (lista.length % 3)) % 3)
      : `<p class="p-10 mono text-sm col-span-full">Nenhuma notícia encontrada.</p>`;
    G.icons();

    const q = new URLSearchParams();
    if (cat) q.set('categoria', cat);
    if (termo) q.set('q', $('busca').value.trim());
    history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
  }

  $('filtros').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (b) { cat = b.dataset.cat; render(); }
  });
  $('busca').addEventListener('input', (e) => { termo = norm(e.target.value.trim()); render(); });

  G.items('noticias').then((lista) => {
    todas = lista.filter((n) => n.publicado !== false && n.titulo).sort((a, b) => String(b.data).localeCompare(String(a.data)));
    render();
  }).catch(() => { $('lista').innerHTML = G.errorBox('Não foi possível carregar as notícias.'); });
});
