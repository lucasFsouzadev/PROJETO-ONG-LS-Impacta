// spa.js — Sistema simples de navegação sem recarregar a página

document.addEventListener("DOMContentLoaded", () => {
  const links = Array.from(document.querySelectorAll('a[data-page]'));
  // support different container ids used across pages
  const main = document.getElementById('content') || document.getElementById('main') || document.querySelector('main');

  if (!links.length || !main) {
    // Nada a fazer em páginas sem links SPA ou contêiner principal
    return;
  }

  // Anexar manipuladores e manter uma referência para o realce ativo
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = link.dataset.page;
      if (!page) return;
      // update active state
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      loadPage(page);
      history.pushState({ page }, '', `#${page}`);
    });
  });

  async function loadPage(page) {
    // Tente primeiro pages/<page>.html, caso contrário, use <page>.html
    const tryPaths = [`pages/${page}.html`, `${page}.html`];
    main.setAttribute('aria-busy', 'true');
    try {
      let res = null;
      let html = null;
      for (const path of tryPaths) {
        try {
          res = await fetch(path);
          if (res.ok) {
            html = await res.text();
            break;
          }
        } catch (e) {
          // continue to next path
        }
      }
      if (html === null) throw new Error('Conteúdo não encontrado');
      main.innerHTML = html;
      // Mover o foco para o texto principal para acessibilidade
      main.focus && main.focus();
    } catch (error) {
      main.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
      console.error('SPA loadPage error:', error);
    } finally {
      main.removeAttribute('aria-busy');
    }
  }

  // Ao voltar/avançar, use state.page ou location.hash
  window.addEventListener('popstate', (event) => {
    const page = event.state?.page || (location.hash ? location.hash.substring(1) : null);
    if (page) {
      // destacar o link correspondente, se presente
      links.forEach(l => l.classList.toggle('active', l.dataset.page === page));
      loadPage(page);
    }
  });
});