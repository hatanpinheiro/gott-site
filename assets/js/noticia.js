/* Página individual de notícia: noticia.html?n=<slug> */
document.addEventListener('DOMContentLoaded', () => {
  const G = window.GOTT;
  const { esc, url, md, pad, arrow, ext } = G;
  const $ = (id) => document.getElementById(id);
  const slug = new URLSearchParams(location.search).get('n') || '';

  function setMeta(n) {
    document.title = `${n.titulo} – GOTT | UFSC`;
    const desc = (n.subtitulo || n.resumo || '').slice(0, 200);
    const set = (sel, attr, val) => {
      let el = document.head.querySelector(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, sel.match(/"(.+)"/)[1]); document.head.appendChild(el); }
      el.setAttribute('content', val);
    };
    if (desc) set('meta[name="description"]', 'name', desc);
    set('meta[property="og:title"]', 'property', n.titulo);
    if (desc) set('meta[property="og:description"]', 'property', desc);
  }

  function notFound() {
    $('artigo').innerHTML = `
      <div class="wrap px-4 sm:px-6 lg:px-10 py-20">
        <p class="label text-orange-deep mb-4">Erro 404</p>
        <h1 class="display section-title mb-8">Notícia não encontrada.</h1>
        <a href="noticias.html" class="btn btn-ink">Ver todas as notícias ${arrow()}</a>
      </div>`;
    G.icons();
  }

  G.items('noticias').then((lista) => {
    const pub = lista.filter((n) => n.publicado !== false && n.titulo).sort((a, b) => String(b.data).localeCompare(String(a.data)));
    const n = pub.find((x) => G.newsSlug(x) === slug);
    $('artigo').removeAttribute('aria-busy');
    if (!n) return notFound();
    setMeta(n);
    const img = url(n.imagem);
    const link = url(n.link_externo);
    const shareUrl = encodeURIComponent(location.href);

    $('artigo').innerHTML = `
      <header class="border-b-2 border-ink-text">
        <div class="wrap px-4 sm:px-6 lg:px-10 pt-12 lg:pt-16 pb-10">
          <p class="label mb-6"><a href="noticias.html" class="hover:text-orange-deep">Notícias</a> / <a href="noticias.html?categoria=${encodeURIComponent(n.categoria || 'Geral')}" class="text-orange-deep hover:underline">${esc(n.categoria || 'Geral')}</a></p>
          <h1 class="display max-w-5xl" style="font-size:clamp(2.6rem,6.5vw,6rem)">${esc(n.titulo)}<span class="text-orange-deep">.</span></h1>
          ${n.subtitulo ? `<p class="mono text-sm uppercase mt-6 max-w-3xl">${esc(n.subtitulo)}</p>` : ''}
        </div>
        <div class="wrap grid grid-cols-2 sm:grid-cols-4 grid-lines border-t-2 border-ink-text">
          <div class="p-4 sm:p-5"><p class="label text-ink-soft">Data</p><p class="mono text-sm mt-1">${G.fmtDate(n.data)}</p></div>
          <div class="p-4 sm:p-5"><p class="label text-ink-soft">Autoria</p><p class="mono text-sm mt-1">${esc(n.autor || 'Equipe GOTT')}</p></div>
          <div class="p-4 sm:p-5"><p class="label text-ink-soft">Categoria</p><p class="mono text-sm mt-1">${esc(n.categoria || 'Geral')}</p></div>
          <div class="p-4 sm:p-5"><p class="label text-ink-soft">Compartilhar</p>
            <p class="mono text-sm mt-1 flex gap-3">
              <a class="hover:text-orange-deep underline" href="https://wa.me/?text=${shareUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a class="hover:text-orange-deep underline" href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </p></div>
        </div>
      </header>
      ${img ? `<figure class="border-b-2 border-ink-text bg-paper"><img src="${esc(img)}" alt="" class="wrap w-full max-h-[560px] object-contain" onerror="this.parentElement.remove()"></figure>` : ''}
      <div class="wrap grid lg:grid-cols-12">
        <aside class="lg:col-span-3 px-4 sm:px-6 lg:px-10 py-10 lg:border-r-2 border-ink-text">
          ${(n.tags || []).length ? `<p class="label text-ink-soft mb-3">Tags</p><div class="flex flex-wrap gap-2">${n.tags.map((t) => `<a href="noticias.html?q=${encodeURIComponent(t)}" class="chip !py-1.5 !px-2.5">${esc(t)}</a>`).join('')}</div>` : ''}
        </aside>
        <div class="lg:col-span-7 px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
          ${n.resumo ? `<div class="text-xl leading-relaxed font-medium mb-8 text-ink-text">${md(n.resumo)}</div>` : ''}
          <div class="prose max-w-none text-[1.05rem]">${md(n.corpo)}</div>
          ${link ? `<a href="${esc(link)}"${ext(link)} class="btn btn-orange mt-10">Acessar página externa ${arrow()}</a>` : ''}
        </div>
      </div>`;

    const outras = pub.filter((x) => x !== n).slice(0, 3);
    if (outras.length) {
      const estilos = ['tile-white', 'tile-orange', 'tile-ink'];
      $('mais-lista').innerHTML = outras.map((o, i) => `
        <a href="noticia.html?n=${encodeURIComponent(G.newsSlug(o))}" class="tile ${estilos[i]} p-6 sm:p-8 min-h-[260px]">
          <p class="num mb-6">${pad(i + 1)} /</p>
          <h3 class="display text-3xl leading-[0.95] line-clamp-3">${esc(o.titulo)}</h3>
          <p class="label mt-4 opacity-80">${G.shortDate(o.data)}</p>
          <span class="mt-auto pt-8">${arrow('w-6 h-6')}</span>
        </a>`).join('');
      $('mais').classList.remove('hidden');
    }
    G.icons();
  }).catch(() => { $('artigo').innerHTML = G.errorBox('Não foi possível carregar a notícia.'); });
});
