/**
 * Decolar Consórcios — blog.js
 * Central de dados e renderização do Blog Decolar:
 * - BLOG_ARTICLES alimenta destaque, grade de últimos artigos e mercado
 * - Capas editoriais são geradas em CSS/SVG (sem reaproveitar imagens da Home)
 * - Filtro por categoria + busca textual sobre os artigos publicados
 * - O blog precisa funcionar corretamente mesmo com zero artigos publicados
 */

// SOMENTE adicionar aqui artigos revisados e aprovados (published: true)
// NÃO publicar dados de mercado sem validação da fonte e período
const BLOG_ARTICLES = [
  // Exemplo de estrutura para novos artigos (mantenha published: false até aprovação):
  // {
  //   id: 'contemplacao-por-lance-como-funciona',
  //   title: 'Contemplação por lance: como funciona na prática',
  //   slug: 'contemplacao-por-lance-como-funciona.html',
  //   category: 'lances',
  //   summary: 'Entenda as regras do lance livre e do lance embutido e como eles aceleram a contemplação.',
  //   image: null,             // caminho para a foto real do artigo (assets/images/blog/...), se houver
  //   date: '2026-03-10',
  //   readingTime: 6,
  //   featured: false,
  //   section: 'entenda',
  //   published: false
  // },
  {
    id: 'creditos-consorcio-331-bilhoes-julho-2026',
    title: 'Créditos comercializados pelo consórcio superam R$ 331 bilhões até julho',
    slug: 'creditos-consorcio-331-bilhoes-julho-2026.html',
    category: 'mercado',
    summary: 'Dados da ABAC mostram alta de 22,9% nos créditos comercializados e de 14,9% no número de cotas vendidas entre janeiro e julho de 2026.',
    image: 'assets/images/blog/creditos-consorcio-331-bilhoes-julho-2026.png',
    date: '2026-09-17',
    readingTime: 3,
    featured: true,
    section: 'mercado',
    published: true,
  },
];

// Metadados visuais por categoria: usados para gerar capas editoriais sem imagens externas
const CATEGORY_META = {
  entenda:    { label: 'Entenda o Consórcio',        icon: 'doc' },
  lances:     { label: 'Lances e Contemplação',      icon: 'target' },
  imoveis:    { label: 'Imóveis',                    icon: 'key' },
  veiculos:   { label: 'Veículos',                   icon: 'car' },
  pesados:    { label: 'Pesados',                    icon: 'truck' },
  seguranca:  { label: 'Segurança e Planejamento',   icon: 'shield' },
  mercado:    { label: 'Mercado e Atualidade',       icon: 'chart' },
};

const COVER_ICONS = {
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5"></path><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line>',
  target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><circle cx="12" cy="12" r="0.6" fill="currentColor"></circle>',
  key: '<circle cx="8" cy="15" r="4"></circle><path d="M10.8 12.2 19 4"></path><path d="M15.5 7.5 18 10"></path><path d="M18.5 4.5 21 7"></path>',
  car: '<path d="M4 16V9.5a1 1 0 0 1 .9-1L7 6h10l2.1 2.5a1 1 0 0 1 .9 1V16"></path><path d="M4 16h16v2a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"></path><circle cx="7.5" cy="16" r="1.5"></circle><circle cx="16.5" cy="16" r="1.5"></circle>',
  truck: '<rect x="2" y="8" width="12" height="8"></rect><path d="M14 11h4l3 3v2h-7z"></path><circle cx="6.5" cy="18" r="1.5"></circle><circle cx="17.5" cy="18" r="1.5"></circle>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"></path><path d="M9 12l2 2 4-4"></path>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
  compass: '<circle cx="12" cy="12" r="9"></circle><polygon points="14.5 9.5 12.8 12.8 9.5 14.5 11.2 11.2 14.5 9.5"></polygon>',
};

function coverIconMarkup(iconKey) {
  return COVER_ICONS[iconKey] || COVER_ICONS.doc;
}

// Capa gerada em CSS/SVG (fallback usado quando o artigo não tem imagem própria em `image`)
function iconCoverMarkup(category, size) {
  const meta = CATEGORY_META[category] || { label: 'Decolar Consórcios', icon: 'compass' };
  const iconSize = size === 'lg' ? 64 : 44;
  return `
    <div class="blog-cover blog-cover--${category || 'geral'}" role="img" aria-label="Capa editorial — ${meta.label}">
      <svg class="blog-cover-icon" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${coverIconMarkup(meta.icon)}</svg>
    </div>
  `;
}

// Capa do card/destaque: usa a foto real do artigo (campo `image`) quando existir,
// ou cai na capa editorial gerada em CSS/SVG por categoria.
function coverMarkup(article, size) {
  if (article && article.image) {
    return `<img src="${article.image}" alt="${article.title || ''}" class="blog-cover-photo" loading="lazy">`;
  }
  const category = article && article.category;
  return iconCoverMarkup(category, size);
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function publishedArticles() {
  return BLOG_ARTICLES.filter(a => a.published === true);
}

/* --------------------------------------------------------------------------
   Renderização — Matéria em Destaque
   -------------------------------------------------------------------------- */
function renderFeatured() {
  const mount = document.getElementById('blog-featured-mount');
  if (!mount) return;

  const featured = publishedArticles().find(a => a.featured === true);

  if (!featured) {
    mount.innerHTML = `
      <article class="blog-featured-card blog-featured-card--preparing">
        <div class="blog-featured-media">
          ${coverMarkup(null, 'lg')}
          <span class="blog-featured-badge">Em Preparação</span>
        </div>
        <div class="blog-featured-content">
          <span class="blog-badge">Em Preparação</span>
          <h2 class="blog-featured-title">Nosso primeiro conteúdo está sendo preparado.</h2>
          <p class="blog-featured-summary">
            O Blog Decolar está sendo construído com conteúdos revisados individualmente para trazer informações claras e responsáveis sobre o mundo do consórcio.
          </p>
        </div>
      </article>
    `;
    return;
  }

  const meta = CATEGORY_META[featured.category] || { label: 'Decolar' };
  mount.innerHTML = `
    <article class="blog-featured-card" data-category="${featured.category}">
      <a href="${featured.slug}" class="blog-featured-media">
        ${coverMarkup(featured, 'lg')}
        <span class="blog-featured-badge">${meta.label}</span>
      </a>
      <div class="blog-featured-content">
        <span class="blog-badge">${meta.label}</span>
        <h2 class="blog-featured-title"><a href="${featured.slug}">${featured.title}</a></h2>
        <p class="blog-featured-summary">${featured.summary}</p>
        <div class="blog-meta">
          <span class="blog-meta-item">${formatDate(featured.date)}</span>
          <span class="blog-meta-item">${featured.readingTime} min de leitura</span>
        </div>
        <a href="${featured.slug}" class="blog-cta-link">Ler matéria completa
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>
    </article>
  `;
}

/* --------------------------------------------------------------------------
   Renderização — Grade de Últimos Artigos
   -------------------------------------------------------------------------- */
function renderRecentGrid() {
  const grid = document.getElementById('blog-posts-grid');
  if (!grid) return;

  const articles = publishedArticles();

  if (articles.length === 0) {
    grid.innerHTML = `
      <div class="blog-recent-empty" id="blog-initial-empty">
        <div class="blog-recent-empty-icon-wrap">
          <svg class="blog-recent-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <line x1="9" y1="7" x2="15" y2="7"></line>
            <line x1="9" y1="11" x2="15" y2="11"></line>
          </svg>
        </div>
        <h3 class="blog-recent-empty-title">Novos conteúdos estão a caminho.</h3>
        <p class="blog-recent-empty-text">Estamos preparando materiais sobre consórcio, planejamento, segurança e atualizações do mercado.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = articles.map(article => {
    const meta = CATEGORY_META[article.category] || { label: 'Decolar' };
    return `
      <article class="blog-card" data-category="${article.category}">
        <a href="${article.slug}" class="blog-card-media">
          ${coverMarkup(article)}
          <span class="blog-card-cat-badge">${meta.label}</span>
        </a>
        <div class="blog-card-body">
          <h3 class="blog-card-title"><a href="${article.slug}">${article.title}</a></h3>
          <p class="blog-card-summary">${article.summary}</p>
          <div class="blog-card-footer">
            <span>${formatDate(article.date)}</span>
            <span class="blog-card-status">${article.readingTime} min</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* --------------------------------------------------------------------------
   Renderização — Mercado em Movimento
   -------------------------------------------------------------------------- */
function renderMarket() {
  const mount = document.getElementById('blog-market-mount');
  if (!mount) return;

  const marketArticles = publishedArticles().filter(a => a.section === 'mercado');

  if (marketArticles.length === 0) {
    mount.innerHTML = `
      <div class="blog-market-empty">
        <div class="blog-market-empty-icon-wrap">
          <svg class="blog-market-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
        <p class="blog-market-empty-text">Em breve, análises e atualizações baseadas em fontes como ABAC e Banco Central do Brasil.</p>
      </div>
    `;
    return;
  }

  mount.innerHTML = `
    <div class="blog-market-grid">
      ${marketArticles.map(article => `
        <a href="${article.slug}" class="blog-market-card">
          <div class="blog-market-card-media">${coverMarkup(article)}</div>
          <div class="blog-market-card-body">
            <span class="blog-market-card-tag">${formatDate(article.date)}</span>
            <h3 class="blog-market-card-title">${article.title}</h3>
            <p class="blog-market-card-summary">${article.summary}</p>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Filtro por categoria + busca textual (sobre artigos publicados renderizados)
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  renderRecentGrid();
  renderMarket();

  const searchInput = document.getElementById('blog-search-input');
  const clearBtn = document.getElementById('blog-search-clear');
  const catButtons = document.querySelectorAll('.blog-cat-btn');
  const featuredSection = document.querySelector('.blog-featured-section');
  const marketSection = document.querySelector('.blog-market-section');
  const emptyState = document.getElementById('blog-empty-state');
  const resetBtn = document.getElementById('blog-empty-reset');

  let activeCategory = 'all';
  let searchQuery = '';

  function filterPosts() {
    const query = searchQuery.trim().toLowerCase();
    const blogCards = document.querySelectorAll('.blog-card');
    const initialEmpty = document.getElementById('blog-initial-empty');
    let visibleCount = 0;

    blogCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const title = (card.querySelector('.blog-card-title')?.textContent || '').toLowerCase();
      const summary = (card.querySelector('.blog-card-summary')?.textContent || '').toLowerCase();
      const badge = (card.querySelector('.blog-card-cat-badge')?.textContent || '').toLowerCase();

      const matchesCat = (activeCategory === 'all' || cardCategory === activeCategory);
      const matchesSearch = !query || title.includes(query) || summary.includes(query) || badge.includes(query);

      if (matchesCat && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const isFiltering = query.length > 0 || activeCategory !== 'all';

    if (featuredSection) {
      if (activeCategory !== 'all') {
        featuredSection.style.display = 'none';
      } else if (query.length > 0) {
        const featTitle = (featuredSection.querySelector('.blog-featured-title')?.textContent || '').toLowerCase();
        const featSummary = (featuredSection.querySelector('.blog-featured-summary')?.textContent || '').toLowerCase();
        featuredSection.style.display = (featTitle.includes(query) || featSummary.includes(query)) ? '' : 'none';
      } else {
        featuredSection.style.display = '';
      }
    }

    if (marketSection) {
      marketSection.style.display = isFiltering ? 'none' : '';
    }

    if (initialEmpty) {
      initialEmpty.style.display = (isFiltering || blogCards.length === 0) ? (isFiltering ? 'none' : '') : (visibleCount === 0 ? '' : 'none');
    }

    if (emptyState) {
      const featuredHidden = !featuredSection || featuredSection.style.display === 'none';
      if (isFiltering && visibleCount === 0 && featuredHidden && blogCards.length > 0) {
        emptyState.classList.add('is-visible');
      } else {
        emptyState.classList.remove('is-visible');
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearBtn) clearBtn.classList.toggle('is-visible', searchQuery.length > 0);
      filterPosts();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchInput.focus();
      }
      clearBtn.classList.remove('is-visible');
      filterPosts();
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCategory = btn.getAttribute('data-category') || 'all';
      filterPosts();

      const recentSection = document.querySelector('.blog-recent-section');
      if (recentSection && window.scrollY > recentSection.offsetTop) {
        recentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.classList.remove('is-visible');

      catButtons.forEach(b => {
        b.classList.toggle('is-active', b.getAttribute('data-category') === 'all');
      });

      filterPosts();
    });
  }

  filterPosts();
});
