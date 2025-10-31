document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const links = Array.from(document.querySelectorAll('nav a[data-page]'));

  // Carregar um script somente se ele ainda não estiver presente na página
  function loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.body.appendChild(s);
    });
  }

  async function loadPage(page) {
    if (!content) return;
    try {
      const res = await fetch(`pages/${page}.html`);
      if (!res.ok) throw new Error('Página não encontrada');
      const html = await res.text();
      content.innerHTML = html;
    } catch (err) {
      content.innerHTML = `<p>Erro ao carregar a página: ${err.message}</p>`;
    }
  }

  // Anexe manipuladores de cliques somente se houver links e um contêiner de conteúdo
  if (links.length && content) {
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (!page) return;
        loadPage(page);

        // destacar link ativo
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        
18 / 5.000
// atualizar hash da URL
        history.pushState({ page }, '', `#${page}`);
      });
    });

    // Carregar página inicial a partir de um hash ou página padrão
    const initialPage = location.hash ? location.hash.substring(1) : 'inicio';
    const activeLink = links.find(l => l.dataset.page === initialPage);
    if (activeLink) activeLink.classList.add('active');
    loadPage(initialPage);

    // Manipular para trás/para frente
    window.addEventListener('popstate', (e) => {
      const page = (e.state && e.state.page) || (location.hash ? location.hash.substring(1) : 'inicio');
      loadPage(page);
      links.forEach(l => l.classList.remove('active'));
      const link = links.find(l => l.dataset.page === page);
      if (link) link.classList.add('active');
    });
  }

 // Tenta carregar scripts opcionais usados ​​em todo o site (sem efeito se já estiverem carregados)
// Estes são adicionados dinamicamente para que o main.js funcione tanto como módulo quanto como script normal
  loadScript('js/spa.js');
  loadScript('js/formvalidation.js');

  // Atualiza o ano automaticamente no rodapé
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
