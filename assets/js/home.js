/* Página inicial – monta as seções a partir dos arquivos em /content */
document.addEventListener('DOMContentLoaded', () => {
  const G = window.GOTT;
  const { esc, url, md, pad, arrow, ext } = G;
  const $ = (id) => document.getElementById(id);
  const fail = (id, what) => () => { const el = $(id); if (el) el.innerHTML = G.errorBox(`Não foi possível carregar ${what}.`); };

  G.initGrid($('grid-bg'));

  /* ---------------------------------------------------- textos gerais */
  G.load('site').then((s) => {
    const h = s.hero || {};
    if (h.etiqueta) $('hero-tag').textContent = h.etiqueta;
    if (h.titulo) $('hero-t1').textContent = h.titulo;
    if (h.titulo_destaque) $('hero-t2').textContent = h.titulo_destaque;
    if (h.texto) $('hero-text').textContent = h.texto;
    if (h.imagem && url(h.imagem)) $('hero-img').src = url(h.imagem);

    const i = s.institucional || {};
    $('inst-text').innerHTML = md(i.texto) + md(i.texto_final);
    const q = $('inst-quote');
    if (i.citacao) q.innerHTML = `<span class="display text-6xl leading-none block -mb-4" aria-hidden="true">“</span>${esc(i.citacao)}`;
    else q.remove();

    G.popup(s.aviso);
  }).catch(fail('inst-text', 'o texto institucional'));

  /* ----------------------------------------------- linhas de pesquisa */
  G.items('linhas').then((linhas) => {
    $('linhas').innerHTML = linhas.map((l, i) => `
      <article class="p-6 lg:p-7 flex flex-col min-h-[260px] group">
        <div class="flex justify-between items-start mb-8">
          <span class="num">${pad(i + 1)}</span>
          <i data-lucide="${esc(l.icone || 'map')}" class="w-6 h-6 text-white/40 group-hover:text-orange transition"></i>
        </div>
        <h3 class="display text-[1.6rem] leading-[1] mb-4">${esc(l.titulo)}</h3>
        <p class="mono text-[0.72rem] leading-relaxed text-white/70 uppercase">${esc(l.texto)}</p>
      </article>`).join('');
    G.icons();
  }).catch(fail('linhas', 'as linhas de pesquisa'));

  /* ---------------------------------------------------------- membros */
  const TABS = [
    ['ativos', 'Todos'], ['Coordenação', 'Coordenação'], ['Pesquisador(a)', 'Pesquisadores'],
    ['Pós-graduação', 'Pós-graduação'], ['Graduação', 'Graduação'], ['Egresso(a)', 'Egressos'],
  ];
  let membros = [], tab = 'ativos', termo = '';
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function memberCard(m, i) {
    const links = [
      m.lattes && url(m.lattes) ? `<a href="${esc(url(m.lattes))}" target="_blank" rel="noopener noreferrer" class="link-arrow !text-[0.68rem]" aria-label="Currículo Lattes de ${esc(m.nome)}">Lattes ${arrow('w-3 h-3')}</a>` : '',
      m.orcid && url(m.orcid) ? `<a href="${esc(url(m.orcid))}" target="_blank" rel="noopener noreferrer" class="link-arrow !text-[0.68rem]" aria-label="ORCID de ${esc(m.nome)}">ORCID ${arrow('w-3 h-3')}</a>` : '',
    ].join('');
    return `
      <article class="member p-5 sm:p-6 flex flex-col gap-4 reveal" style="animation-delay:${Math.min(i, 12) * 30}ms">
        <div class="flex items-start gap-4">
          ${G.avatar(m, 'w-16 h-16 shrink-0')}
          <div class="min-w-0">
            <p class="num text-[0.7rem]">${esc(m.titulacao || '')}</p>
            <h3 class="font-body font-bold text-[0.98rem] leading-snug">${esc(m.nome)}</h3>
          </div>
        </div>
        <p class="mono text-[0.7rem] leading-relaxed text-ink line-clamp-3 uppercase">${esc(m.formacao || 'Pesquisador(a)')}</p>
        <div class="mt-auto pt-3 border-t border-ink-line flex items-center justify-between gap-3 flex-wrap">
          <span class="label text-ink-soft">${m.ano_entrada ? `Desde ${esc(m.ano_entrada)}` : esc(m.categoria)}${m.pais && m.pais !== 'Brasil' ? ` · ${esc(m.pais)}` : ''}</span>
          <span class="flex gap-4">${links}</span>
        </div>
      </article>`;
  }

  function leaderCard(m) {
    return `
      <article class="member grid sm:grid-cols-[180px_1fr] reveal">
        <div class="aspect-square sm:aspect-auto bg-ink overflow-hidden">${G.avatar(m, 'w-full h-full text-6xl')}</div>
        <div class="p-6 sm:p-8 flex flex-col">
          <p class="label text-orange-deep mb-3">Coordenação · ${esc(m.titulacao || '')}</p>
          <h3 class="display text-4xl sm:text-5xl mb-4">${esc(m.nome)}</h3>
          <p class="mono text-xs leading-relaxed uppercase text-ink">${esc(m.formacao || '')}</p>
          <div class="mt-auto pt-6 flex gap-6 flex-wrap">
            ${m.lattes && url(m.lattes) ? `<a href="${esc(url(m.lattes))}" target="_blank" rel="noopener noreferrer" class="link-arrow">Currículo Lattes ${arrow('w-3.5 h-3.5')}</a>` : ''}
            ${m.orcid && url(m.orcid) ? `<a href="${esc(url(m.orcid))}" target="_blank" rel="noopener noreferrer" class="link-arrow">ORCID ${arrow('w-3.5 h-3.5')}</a>` : ''}
          </div>
        </div>
      </article>`;
  }

  function renderMembros() {
    const ativos = membros.filter((m) => m.categoria !== 'Egresso(a)');
    const count = (k) => (k === 'ativos' ? ativos.length : membros.filter((m) => m.categoria === k).length);
    $('membros-tabs').innerHTML = TABS.filter(([k]) => count(k) > 0).map(([k, label]) =>
      `<button role="tab" class="chip" data-tab="${esc(k)}" aria-selected="${k === tab}">${label}<span class="count">${count(k)}</span></button>`).join('');

    let lista = tab === 'ativos' ? ativos : membros.filter((m) => m.categoria === tab);
    if (termo) lista = lista.filter((m) => norm(`${m.nome} ${m.formacao} ${m.pais}`).includes(termo));

    const lideres = !termo && (tab === 'ativos' || tab === 'Coordenação') ? lista.filter((m) => m.categoria === 'Coordenação') : [];
    const demais = lista.filter((m) => !lideres.includes(m));

    let html = '';
    if (lideres.length) html += `<div class="grid-lines grid lg:grid-cols-2 border-b-2 border-ink-text">${lideres.map(leaderCard).join('')}</div>`;
    if (demais.length) {
      const fill = (4 - (demais.length % 4)) % 4; // completa a última linha da grade
      html += `<div class="grid-lines grid sm:grid-cols-2 lg:grid-cols-4">${demais.map(memberCard).join('')}${'<div class="hidden lg:block"></div>'.repeat(fill)}</div>`;
    }
    if (!lideres.length && !demais.length) html = `<p class="p-10 mono text-sm">Nenhum membro encontrado para “${esc(termo)}”.</p>`;
    $('membros-lista').innerHTML = html;
    G.icons();
  }

  $('membros-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) { tab = b.dataset.tab; renderMembros(); }
  });
  $('busca-membros').addEventListener('input', (e) => { termo = norm(e.target.value.trim()); renderMembros(); });

  G.items('membros').then((lista) => {
    membros = lista.filter((m) => m && m.nome).sort((a, b) =>
      (a.ano_entrada || 9999) - (b.ano_entrada || 9999) || a.nome.localeCompare(b.nome, 'pt-BR'));
    renderMembros();
    renderStats();
  }).catch(fail('membros-lista', 'a lista de membros'));

  /* ---------------------------------------------------- números rápidos */
  function renderStats() {
    Promise.all([G.items('linhas').catch(() => []), G.items('noticias').catch(() => [])]).then(([linhas]) => {
      const ativos = membros.filter((m) => m.categoria !== 'Egresso(a)');
      const anos = membros.map((m) => m.ano_entrada).filter(Boolean);
      const paises = new Set(membros.map((m) => m.pais).filter(Boolean));
      const stats = [
        [ativos.length, 'membros ativos'],
        [membros.length - ativos.length, 'egressos'],
        [paises.size, paises.size === 1 ? 'país' : 'países'],
        [anos.length ? Math.min(...anos) : '—', 'ano de início'],
      ];
      $('stats').innerHTML = stats.map(([n, l]) => `
        <div class="p-5 sm:p-6"><p class="display text-5xl text-ink-text">${esc(n)}</p><p class="label text-ink-soft mt-2">${esc(l)}</p></div>`).join('');
      void linhas;
    });
  }

  /* --------------------------------------------------------- notícias */
  G.items('noticias').then((lista) => {
    const pub = lista.filter((n) => n.publicado !== false)
      .sort((a, b) => (b.destaque === true) - (a.destaque === true) || String(b.data).localeCompare(String(a.data)))
      .slice(0, 3);
    const estilos = ['tile-white', 'tile-orange', 'tile-ink'];
    $('news-tiles').innerHTML = pub.length ? pub.map((n, i) => `
      <a href="noticia.html?n=${encodeURIComponent(G.newsSlug(n))}" class="tile ${estilos[i % 3]} p-6 sm:p-8 group">
        ${n.imagem && url(n.imagem) ? `<img class="tile-img" src="${esc(url(n.imagem))}" alt="" loading="lazy" onerror="this.remove()">` : ''}
        <p class="num mb-6">${pad(i + 1)} /</p>
        <h3 class="display text-[2.1rem] leading-[0.95] line-clamp-4">${esc(n.titulo)}</h3>
        <p class="label mt-4 opacity-80">${esc(n.categoria || 'Geral')} · ${G.shortDate(n.data)}</p>
        <span class="mt-auto pt-10">${arrow('w-6 h-6')}</span>
      </a>`).join('') : '<p class="p-10 mono text-sm col-span-full">Nenhuma notícia publicada ainda.</p>';
    G.icons();
  }).catch(fail('news-tiles', 'as notícias'));

  /* ----------------------------------------------------------- acervo */
  const vazio = (txt) => `<p class="mono text-xs uppercase text-ink-soft border-2 border-dashed border-ink-line p-5">${txt}</p>`;
  const row = (inner, href) => href
    ? `<a href="${esc(href)}"${ext(href)} class="block py-4 border-t border-ink-line hover:bg-paper -mx-2 px-2 group">${inner}</a>`
    : `<div class="py-4 border-t border-ink-line">${inner}</div>`;

  G.items('projetos').then((p) => {
    $('lista-projetos').innerHTML = p.length ? p.map((x) => row(`
      <p class="label ${x.situacao === 'Concluído' ? 'text-ink-soft' : 'text-orange-deep'}">${esc(x.situacao || '')}${x.ano_inicio ? ` · ${esc(x.ano_inicio)}${x.ano_fim ? `–${esc(x.ano_fim)}` : ''}` : ''}</p>
      <h4 class="font-bold leading-snug mt-1">${esc(x.titulo)}</h4>
      ${x.parceiros ? `<p class="mono text-[0.7rem] text-ink mt-1 uppercase">${esc(x.parceiros)}</p>` : ''}`, url(x.link))).join('')
      : vazio('Projetos em mapeamento. Em breve.');
  }).catch(fail('lista-projetos', 'os projetos'));

  G.items('publicacoes').then((p) => {
    const lista = p.slice().sort((a, b) => (b.ano || 0) - (a.ano || 0)).slice(0, 6);
    $('lista-publicacoes').innerHTML = lista.length ? lista.map((x) => row(`
      <p class="label text-orange-deep">${esc(x.ano || '')} · ${esc(x.tipo || '')}</p>
      <h4 class="font-bold leading-snug mt-1">${esc(x.titulo)}</h4>
      <p class="mono text-[0.7rem] text-ink mt-1 uppercase">${esc(x.autores || '')}${x.veiculo ? ` — ${esc(x.veiculo)}` : ''}</p>`,
      url(/^10\.\d+\//.test(x.link || '') ? `https://doi.org/${x.link}` : x.link))).join('')
      : vazio('Base de publicações em atualização.');
  }).catch(fail('lista-publicacoes', 'as publicações'));

  G.items('eventos').then((e) => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const prox = e.filter((x) => (G.parseDate(x.data_fim || x.data_inicio) || 0) >= hoje).sort((a, b) => String(a.data_inicio).localeCompare(String(b.data_inicio)));
    const pass = e.filter((x) => !prox.includes(x)).sort((a, b) => String(b.data_inicio).localeCompare(String(a.data_inicio)));
    const lista = prox.concat(pass).slice(0, 5);
    $('lista-eventos').innerHTML = lista.length ? lista.map((x) => row(`
      <p class="label ${prox.includes(x) ? 'text-orange-deep' : 'text-ink-soft'}">${prox.includes(x) ? 'Próximo · ' : ''}${G.shortDate(x.data_inicio)}${x.data_fim ? ` – ${G.shortDate(x.data_fim)}` : ''}</p>
      <h4 class="font-bold leading-snug mt-1">${esc(x.titulo)}</h4>
      ${x.local ? `<p class="mono text-[0.7rem] text-ink mt-1 uppercase">${esc(x.local)}</p>` : ''}`, url(x.link))).join('')
      : vazio('Nenhum evento agendado.');
  }).catch(fail('lista-eventos', 'a agenda'));

  /* -------------------------------------------------------- parceiros */
  G.items('parceiros').then((p) => {
    const one = p.map((x) => {
      const logo = `<img src="${esc(url(x.logo))}" alt="${esc(x.nome)}" class="h-14 w-auto max-w-[160px] object-contain" loading="lazy">`;
      const href = url(x.link);
      return `<div class="partner px-10 shrink-0">${href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(x.nome)}">${logo}</a>` : logo}</div>`;
    }).join('');
    // Duplica a sequência para o carrossel contínuo (cópia escondida de leitores de tela)
    const reps = Math.max(2, Math.ceil(8 / Math.max(p.length, 1)) * 2);
    $('parceiros-lista').innerHTML = Array.from({ length: reps }, (_, i) =>
      `<div class="flex items-center"${i ? ' aria-hidden="true"' : ''}>${one}</div>`).join('');
  }).catch(() => {});

  /* ------------------------------------------------------- links úteis */
  G.items('links').then((l) => {
    $('links-lista').innerHTML = l.map((x, i) => `
      <a href="${esc(url(x.link))}"${ext(url(x.link))} class="p-6 sm:p-8 lg:p-10 flex flex-col gap-6 hover:!bg-orange transition-colors group">
        <div class="flex justify-between"><span class="num group-hover:text-ink-text">${pad(i + 1)} /</span><i data-lucide="${esc(x.icone || 'link')}" class="w-6 h-6"></i></div>
        <div><h3 class="display text-3xl">${esc(x.titulo)}</h3><p class="mono text-xs uppercase mt-2 text-ink group-hover:text-ink-text">${esc(x.descricao || '')}</p></div>
        ${arrow('w-5 h-5')}
      </a>`).join('');
    G.icons();
  }).catch(() => {});
});
