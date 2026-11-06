/* STAY WIDE — shared page interactions. No inventory, credentials or personal data is stored. */
'use strict';

(() => {
  document.querySelector('#year').textContent = new Date().getFullYear();
  const productId = document.body.dataset.product;
  const product = window.stayWideCatalog.products.find(item => item.id === productId);

  function initCardPreviews() {
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    const cards = [...document.querySelectorAll('.product-card')].filter(card => card.querySelector('[data-card-secondary]'));
    const requests = new WeakMap();
    function prepare(card) {
      if (requests.has(card)) return requests.get(card);
      const template = card.querySelector('[data-card-secondary]');
      const layer = template.content.firstElementChild.cloneNode(true);
      const image = layer.querySelector('img');
      image.loading = 'eager';
      image.fetchPriority = 'low';
      template.before(layer);
      const request = image.decode().then(() => { layer.dataset.ready = ''; }).catch(() => {
        // Keep the fully visible primary on error; a later intent may retry.
        layer.remove(); requests.delete(card);
      });
      requests.set(card, request);
      return request;
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && pointer.matches) { prepare(entry.target); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '160px' }) : null;
    function observe() {
      observer?.disconnect();
      if (pointer.matches) cards.forEach(card => observer?.observe(card));
    }
    cards.forEach(card => {
      card.querySelector('.product-image').addEventListener('pointerenter', event => {
        if (pointer.matches && event.pointerType !== 'touch') prepare(card);
      });
      card.addEventListener('focus', () => { if (card.matches(':focus-visible')) prepare(card); });
    });
    pointer.addEventListener('change', observe);
    observe();
  }

  function initProductGallery() {
    document.querySelector('a[href="#size-guide"]')?.addEventListener('click', () => {
      document.querySelector('#size-guide').open = true;
    });
    const frame = document.querySelector('[data-gallery]');
    if (!frame) return; // Single photographs have no navigation or swipe affordance.
    const panels = [...frame.querySelectorAll('.gallery-panel')];
    const previous = frame.querySelector('[data-gallery-previous]');
    const next = frame.querySelector('[data-gallery-next]');
    const counter = document.querySelector('[data-gallery-current]');
    const view = document.querySelector('#gallery-view');
    const error = document.querySelector('[data-gallery-error]');
    let active = 0, requested = 0, generation = 0, start;
    previous.disabled = next.disabled = false;
    function updateControls() {
      // aria-disabled retains focus when a button reaches a gallery boundary.
      previous.setAttribute('aria-disabled', String(active === 0));
      next.setAttribute('aria-disabled', String(active === panels.length - 1));
    }
    async function show(index) {
      requested = Math.max(0, Math.min(panels.length - 1, index));
      const target = requested, request = ++generation;
      error.textContent = '';
      if (target === active) { frame.removeAttribute('aria-busy'); return; }
      frame.setAttribute('aria-busy', 'true');
      let image = panels[target].querySelector('img');
      if (image.dataset.failed) {
        const retry = image.cloneNode();
        delete retry.dataset.failed;
        retry.dataset.retries = Number(image.dataset.retries || 0) + 1;
        const retryURL = source => {
          const url = new URL(source, document.baseURI);
          url.searchParams.set('image-retry', retry.dataset.retries);
          return url.href;
        };
        // A failed response may remain in the browser cache. Retry the same
        // derivative with a fresh URL; never switch to an oversized original.
        if (image.srcset) retry.srcset = image.srcset.split(',').map(candidate => {
          const [source, descriptor] = candidate.trim().split(/\s+/);
          return `${retryURL(source)} ${descriptor}`;
        }).join(', ');
        retry.src = retryURL(image.src);
        image.replaceWith(retry);
        image = retry;
      }
      image.loading = 'eager';
      try {
        await image.decode();
        if (request !== generation) return;
        panels.forEach((panel, i) => {
          panel.hidden = i !== target;
          panel.classList.toggle('is-entering', i === target);
        });
        active = target;
        counter.textContent = active + 1;
        view.textContent = product.images[active].view;
        updateControls();
      } catch {
        if (request === generation) {
          image.dataset.failed = '';
          requested = active;
          error.textContent = 'That image could not load. Please try again.';
        }
      } finally {
        if (request === generation) frame.removeAttribute('aria-busy');
      }
    }
    previous.addEventListener('click', () => { if (previous.getAttribute('aria-disabled') !== 'true') show(requested - 1); });
    next.addEventListener('click', () => { if (next.getAttribute('aria-disabled') !== 'true') show(requested + 1); });
    frame.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      show(requested + (event.key === 'ArrowRight' ? 1 : -1));
    });
    frame.addEventListener('touchstart', event => {
      start = event.touches.length === 1 && !event.target.closest('button') ? { x:event.touches[0].clientX, y:event.touches[0].clientY } : null;
    }, { passive:true });
    frame.addEventListener('touchmove', event => {
      if (!start) return;
      if (event.touches.length !== 1 || Math.abs(event.touches[0].clientY - start.y) > Math.max(15, Math.abs(event.touches[0].clientX - start.x))) start = null;
    }, { passive:true });
    frame.addEventListener('touchcancel', () => { start = null; }, { passive:true });
    frame.addEventListener('touchend', event => {
      if (!start) return;
      const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
      start = null;
      if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(requested + (dx < 0 ? 1 : -1));
    }, { passive:true });
    updateControls();
  }

  initCardPreviews();
  initProductGallery();
})();
