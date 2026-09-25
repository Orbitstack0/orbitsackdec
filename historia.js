// historia.js - Interações e Animações Cinematográficas com Scroll

document.addEventListener('DOMContentLoaded', () => {
  // 1. Barra de progresso de leitura no topo
  const progressBar = document.querySelector('.story-progress-bar');
  
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // 2. IntersectionObserver para Reveal de elementos com fade & slide up
  const revealItems = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Elemento revelado não precisa ser observado novamente
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
      // Fallback seguro: se o item já estiver dentro da viewport inicial (ex: Cena 01 - Hero), revela imediatamente
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        item.classList.add('is-revealed');
      }
    });

    // 3. Observer específico para o Mapa do Brasil (Cena 07)
    const mapScene = document.getElementById('mapa-brasil');
    if (mapScene) {
      let mapAnimated = false;

      const triggerMapSequence = () => {
        if (mapAnimated) return;
        mapAnimated = true;
        mapScene.classList.add('is-in-view');

        // Sequência cronológica solicitada:
        // Primeiro: Porto Alegre acende (imediato via is-in-view)
        // Depois: Sul -> Sudeste -> Centro-Oeste -> Nordeste -> Norte
        const sequence = [
          { line: '.conn-sul', node: '.node-sul', delay: 400 },
          { line: '.conn-sudeste', node: '.node-sudeste', delay: 1100 },
          { line: '.conn-centro-oeste', node: '.node-centro-oeste', delay: 1800 },
          { line: '.conn-nordeste', node: '.node-nordeste', delay: 2500 },
          { line: '.conn-norte', node: '.node-norte', delay: 3200 }
        ];

        sequence.forEach(({ line, node, delay }) => {
          setTimeout(() => {
            const lineEl = mapScene.querySelector(line);
            const nodeEl = mapScene.querySelector(node);
            if (lineEl) lineEl.classList.add('is-active');
            if (nodeEl) nodeEl.classList.add('is-active');
          }, delay);
        });

        // Conclusão elegante após todas as regiões conectadas
        setTimeout(() => {
          const finalMsg = document.getElementById('map-final-message');
          if (finalMsg) {
            finalMsg.classList.add('is-active');
          }
        }, 4100);
      };

      const mapObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerMapSequence();
            }
          });
        },
        {
          threshold: 0.2
        }
      );
      mapObserver.observe(mapScene);
    }

  } else {
    // Fallback caso navegador não suporte IntersectionObserver
    revealItems.forEach((item) => item.classList.add('is-revealed'));
    const mapScene = document.getElementById('mapa-brasil');
    if (mapScene) {
      mapScene.classList.add('is-in-view');
      mapScene.querySelectorAll('.connection-line, .regional-node, .map-final-message').forEach((el) => {
        el.classList.add('is-active');
      });
    }
  }
});

