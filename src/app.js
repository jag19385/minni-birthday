/*
 * FOR MINNI, FROM ANNAYYA — CINEMATIC SCENE ENGINE
 * Preserves every special memory in its own dedicated, unhurried, full-screen scene.
 * Single active scene at a time, zero scrolling, film-grade transitions.
 */

(() => {
  'use strict';

  const S = window.STORY;
  const stage = document.getElementById('stage');
  const body = document.body;
  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reduceMq.matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Helper DOM creator
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const setLines = (node, str) => {
    String(str).split('\n').forEach((line, i) => {
      if (i) node.appendChild(document.createElement('br'));
      node.appendChild(document.createTextNode(line));
    });
    return node;
  };

  const SCENE_KEYS = [
    'wish',         // 0: Prologue
    'invite',       // 1: Invitation
    'beginning',    // 2: Unexpected Beginning
    'unstoppable',  // 3: Unstoppable Duo
    'annayaaa',     // 4: "Annayaaa..."
    'shoulder',     // 5: The Shoulder
    'traditional',  // 6: Traditional Day
    'dark',         // 7: The Dark Days
    'reunion',      // 8: Reunion (The 2-Hour Call)
    'promise',      // 9: The Silent Promise
    'gallery',      // 10: The Grand Photo Gallery
    'finale',       // 11: Final Birthday Reveal
  ];

  const TOTAL_SCENES = SCENE_KEYS.length;
  let curScene = 0;
  let isNavigating = false;

  /* ------------------------------------------------------------- IMAGE PROBING */
  const imgCache = new Map();
  function resolveImage(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ src, w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
      img.onerror = () => resolve(null);
      img.src = src;
    });
    imgCache.set(src, p);
    return p;
  }

  /* ------------------------------------------------------------- TEXT AUTO-FIT */
  function fitText(node) {
    const panel = node.closest('.panel');
    node.style.fontSize = '';
    const max = parseFloat(getComputedStyle(node).fontSize);
    const isOverflowing = () => {
      if (node.scrollHeight > node.clientHeight + 1) return true;
      if (panel && (panel.scrollHeight > panel.clientHeight + 4 || panel.scrollWidth > panel.clientWidth + 4)) return true;
      return false;
    };
    let size = max;
    let guard = 0;
    const floor = 12;
    while (isOverflowing() && size > floor && guard++ < 60) {
      size -= 0.5;
      node.style.fontSize = size + 'px';
    }
    if (isOverflowing() && panel) {
      let ph = Math.round(window.innerHeight * 0.25);
      while (isOverflowing() && ph > 60 && guard++ < 120) {
        ph -= 8;
        panel.style.setProperty('--ph', ph + 'px');
      }
    }
  }

  const fitAll = () => {
    stage.querySelectorAll('[data-fit]').forEach(fitText);
  };

  /* ------------------------------------------------------------- FULL-FEATURED LIGHTBOX */
  let lightboxEl = null;
  let lbPhotos = [];
  let lbIndex = 0;
  let lbCategory = '';

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = el('div', 'lightbox');
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Photo gallery viewer');

    // Top Bar
    const topBar = el('div', 'lightbox-topbar');
    const info = el('div', 'lightbox-info');
    const catLabel = el('span', 'lightbox-category');
    const counter = el('span', 'lightbox-counter');
    info.append(catLabel, counter);

    const closeBtn = el('button', 'lightbox-close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close photo viewer');
    closeBtn.addEventListener('click', closeLightbox);
    topBar.append(info, closeBtn);

    // Stage with prev/next controls & frame
    const stageEl = el('div', 'lightbox-stage');

    const prevBtn = el('button', 'lightbox-nav prev', '‹');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous photo');
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxStep(-1);
    });

    const frame = el('div', 'lightbox-frame');
    const img = document.createElement('img');
    const captionBar = el('div', 'lightbox-caption-bar');
    const captionTitle = el('div', 'lightbox-caption-title');
    const captionSub = el('div', 'lightbox-caption-sub');
    captionBar.append(captionTitle, captionSub);
    frame.append(img, captionBar);

    const nextBtn = el('button', 'lightbox-nav next', '›');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next photo');
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxStep(1);
    });

    stageEl.append(prevBtn, frame, nextBtn);
    lightboxEl.append(topBar, stageEl);
    document.body.appendChild(lightboxEl);

    // Close when tapping outside the frame
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl || e.target === stageEl) {
        closeLightbox();
      }
    });

    return lightboxEl;
  }

  function renderLightboxCurrent() {
    if (!lightboxEl || !lbPhotos.length) return;
    const photo = lbPhotos[lbIndex];
    const img = lightboxEl.querySelector('.lightbox-frame img');
    const titleEl = lightboxEl.querySelector('.lightbox-caption-title');
    const subEl = lightboxEl.querySelector('.lightbox-caption-sub');
    const catEl = lightboxEl.querySelector('.lightbox-category');
    const counterEl = lightboxEl.querySelector('.lightbox-counter');
    const prevBtn = lightboxEl.querySelector('.lightbox-nav.prev');
    const nextBtn = lightboxEl.querySelector('.lightbox-nav.next');

    img.src = photo.src;
    img.alt = photo.title || photo.caption || 'Memory photo';
    titleEl.textContent = photo.title || photo.caption || '';
    subEl.textContent = photo.sub || '';
    subEl.style.display = photo.sub ? 'block' : 'none';

    catEl.textContent = lbCategory || 'Photographs';
    counterEl.textContent = `${lbIndex + 1} / ${lbPhotos.length}`;

    // Enable / disable nav buttons if only 1 photo
    if (lbPhotos.length <= 1) {
      prevBtn.style.visibility = 'hidden';
      nextBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
      nextBtn.style.visibility = 'visible';
    }
  }

  function openLightbox(photosArray, startIndex = 0, categoryLabel = '') {
    const lb = ensureLightbox();
    lbPhotos = photosArray && photosArray.length ? photosArray : [];
    lbIndex = Math.max(0, Math.min(startIndex, lbPhotos.length - 1));
    lbCategory = categoryLabel;

    renderLightboxCurrent();
    lb.classList.add('open');
  }

  function lightboxStep(delta) {
    if (!lbPhotos.length) return;
    lbIndex = (lbIndex + delta + lbPhotos.length) % lbPhotos.length;
    renderLightboxCurrent();
  }

  function closeLightbox() {
    if (lightboxEl) {
      lightboxEl.classList.remove('open');
    }
  }

  /* ------------------------------------------------------------- HEADER & PROGRESS */
  function renderHeader(crumbText, stepNum) {
    const header = el('header', 'scene-top');
    if (crumbText) {
      header.appendChild(el('div', 'crumb', crumbText));
    }
    const dots = el('div', 'scene-dots');
    dots.setAttribute('role', 'img');
    dots.setAttribute('aria-label', `Memory ${stepNum} of ${TOTAL_SCENES}`);
    for (let i = 1; i <= TOTAL_SCENES; i++) {
      const dot = el('i', i === stepNum ? 'active' : i < stepNum ? 'visited' : '');
      dots.appendChild(dot);
    }
    header.appendChild(dots);
    return header;
  }

  /* ------------------------------------------------------------- CONTROLS BUILDER */
  function renderControls({ primaryLabel, onPrimary, showBack = true, delayMs = 0 }) {
    const footer = el('footer', 'controls');
    if (showBack && curScene > 0) {
      const backBtn = el('button', 'btn ghost', S.ui.back);
      backBtn.type = 'button';
      backBtn.setAttribute('aria-label', 'Previous scene');
      backBtn.addEventListener('click', () => goToScene(curScene - 1));
      footer.appendChild(backBtn);
    }

    const primaryBtn = el('button', 'btn primary', primaryLabel);
    primaryBtn.type = 'button';
    primaryBtn.dataset.primary = '1';
    primaryBtn.addEventListener('click', onPrimary);

    if (delayMs > 0 && !reduced()) {
      primaryBtn.disabled = true;
      setTimeout(() => {
        primaryBtn.disabled = false;
        primaryBtn.classList.add('ready');
      }, delayMs);
    }

    footer.appendChild(primaryBtn);
    return footer;
  }

  /* ------------------------------------------------------------- SCENE 0: WISH */
  function buildWish() {
    const d = S.wish;
    const scene = el('section', 'scene scene-wish');
    scene.appendChild(renderHeader('', 1));

    const bodyEl = el('div', 'scene-body');
    const container = el('div', 'wish-container');

    const tag = el('div', 'wish-date', d.date);
    const h1 = el('h1', 'wish-title', d.heading);
    const sub = el('p', 'wish-sub', d.revealText);

    container.append(tag, h1, sub);
    bodyEl.appendChild(container);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: false,
      delayMs: d.pauseMs,
      onPrimary: () => goToScene(1),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 1: INVITE */
  function buildInvite() {
    const d = S.invite;
    const scene = el('section', 'scene scene-invite');
    scene.appendChild(renderHeader('An Invitation', 2));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel invite-panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const p1 = el('p', null, d.lines[0]);
    const p2 = el('p', 'q', d.lines[1]);

    copy.append(p1, p2);
    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      onPrimary: () => goToScene(2),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 2: BEGINNING */
  function buildBeginning() {
    const d = S.beginning;
    const scene = el('section', 'scene scene-beginning');
    scene.appendChild(renderHeader(d.eyebrow, 3));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const mediaRow = el('div', 'media-row');
    d.photos.forEach((photo, idx) => {
      const card = el('figure', 'media-card');
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = 'lazy';
      img.addEventListener('load', fitAll);

      const cap = el('div', 'card-caption', photo.caption);
      card.append(img, cap);
      card.addEventListener('click', () => openLightbox(d.photos, idx, d.chapter));
      mediaRow.appendChild(card);
    });
    panel.appendChild(mediaRow);

    const h2 = el('h2', 'chapter-title', d.chapter);
    copy.appendChild(h2);

    d.lines.forEach((l) => copy.appendChild(el('p', null, l)));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      onPrimary: () => goToScene(3),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 3: UNSTOPPABLE DUO */
  function buildUnstoppable() {
    const d = S.unstoppable;
    const scene = el('section', 'scene scene-unstoppable');
    scene.appendChild(renderHeader(d.eyebrow, 4));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const mediaRow = el('div', 'media-row');
    d.photos.forEach((photo, idx) => {
      const card = el('figure', 'media-card');
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = 'lazy';
      img.addEventListener('load', fitAll);

      const cap = el('div', 'card-caption', photo.caption);
      card.append(img, cap);
      card.addEventListener('click', () => openLightbox(d.photos, idx, d.chapter));
      mediaRow.appendChild(card);
    });

    if (d.video && d.video.src) {
      const vidCard = el('figure', 'media-card');
      const vid = document.createElement('video');
      vid.muted = true;
      vid.defaultMuted = true;
      vid.loop = !reduced();
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.poster = d.video.poster;

      const source = document.createElement('source');
      source.src = d.video.src;
      source.type = 'video/mp4';
      vid.appendChild(source);

      if (!reduced()) {
        const p = vid.play();
        if (p && p.catch) p.catch(() => {});
      }

      const cap = el('div', 'card-caption', d.video.label);
      vidCard.append(vid, cap);
      mediaRow.appendChild(vidCard);
    }

    panel.appendChild(mediaRow);

    const h2 = el('h2', 'chapter-title', d.chapter);
    copy.appendChild(h2);

    d.lines.forEach((l) => copy.appendChild(el('p', null, l)));
    if (d.quote) copy.appendChild(el('p', 'q', d.quote));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      onPrimary: () => goToScene(4),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 4: ANNAYAAA */
  function buildAnnayaaa() {
    const d = S.annayaaa;
    const scene = el('section', 'scene scene-annayaaa');
    scene.appendChild(renderHeader(d.eyebrow, 5));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const mediaRow = el('div', 'media-row');
    d.photos.forEach((photo, idx) => {
      const card = el('figure', 'media-card');
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = 'lazy';
      img.addEventListener('load', fitAll);

      const cap = el('div', 'card-caption', photo.caption);
      card.append(img, cap);
      card.addEventListener('click', () => openLightbox(d.photos, idx, d.chapter));
      mediaRow.appendChild(card);
    });
    panel.appendChild(mediaRow);

    const h2 = el('div', 'highlight-word', d.highlightWord);
    copy.appendChild(h2);

    d.lines.forEach((l) => copy.appendChild(el('p', null, l)));
    if (d.quote) copy.appendChild(el('p', 'q', d.quote));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      onPrimary: () => goToScene(5),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 5: THE SHOULDER */
  function buildShoulder() {
    const d = S.shoulder;
    const scene = el('section', 'scene scene-shoulder');
    scene.appendChild(renderHeader(d.eyebrow, 6));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const mediaRow = el('div', 'media-row');
    d.photos.forEach((photo, idx) => {
      const card = el('figure', 'media-card');
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = 'lazy';
      img.addEventListener('load', fitAll);

      const cap = el('div', 'card-caption', photo.caption);
      card.append(img, cap);
      card.addEventListener('click', () => openLightbox(d.photos, idx, d.chapter));
      mediaRow.appendChild(card);
    });
    panel.appendChild(mediaRow);

    const h2 = el('h2', 'chapter-title', d.chapter);
    copy.appendChild(h2);

    copy.appendChild(el('p', 'q', d.lead));
    d.lines.forEach((l) => copy.appendChild(el('p', null, l)));
    if (d.quote) copy.appendChild(el('p', 'q', d.quote));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      delayMs: d.pauseMs,
      onPrimary: () => goToScene(6),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 6: TRADITIONAL DAY */
  function buildTraditional() {
    const d = S.traditional;
    const scene = el('section', 'scene scene-traditional');
    scene.appendChild(renderHeader(d.eyebrow, 7));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const mediaRow = el('div', 'media-row');
    d.photos.forEach((photo, idx) => {
      const card = el('figure', 'media-card');
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = 'lazy';
      img.addEventListener('load', fitAll);

      const cap = el('div', 'card-caption', photo.caption);
      card.append(img, cap);
      card.addEventListener('click', () => openLightbox(d.photos, idx, d.chapter));
      mediaRow.appendChild(card);
    });
    panel.appendChild(mediaRow);

    const h2 = el('h2', 'chapter-title', d.chapter);
    copy.appendChild(h2);

    copy.appendChild(el('p', 'lead-text', d.lead));
    copy.appendChild(el('p', 'q', d.highlight));
    d.lines.forEach((l) => copy.appendChild(el('p', null, l)));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      onPrimary: () => goToScene(7),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 7: THE DARK DAYS */
  function buildDark() {
    const d = S.dark;
    const scene = el('section', 'scene scene-distance');
    scene.appendChild(renderHeader(d.eyebrow, 8));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel bare scene-distance-panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const h2 = el('h2', 'chapter-title', d.chapter);
    copy.appendChild(h2);

    d.lines.forEach((l) => copy.appendChild(el('p', null, l)));
    if (d.closing) copy.appendChild(el('p', 'q', d.closing));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      delayMs: d.pauseMs,
      onPrimary: () => goToScene(8),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 8: REUNION (2-HOUR CALL) */
  function buildReunion() {
    const d = S.reunion;
    const scene = el('section', 'scene scene-reunion');
    scene.appendChild(renderHeader(d.eyebrow, 9));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const mediaRow = el('div', 'media-row');
    d.photos.forEach((photo, idx) => {
      const card = el('figure', 'media-card');
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.caption;
      img.loading = 'lazy';
      img.addEventListener('load', fitAll);

      const cap = el('div', 'card-caption', photo.caption);
      card.append(img, cap);
      card.addEventListener('click', () => openLightbox(d.photos, idx, d.chapter));
      mediaRow.appendChild(card);
    });
    panel.appendChild(mediaRow);

    const h2 = el('h2', 'chapter-title', d.chapter);
    copy.appendChild(h2);

    copy.appendChild(el('p', 'lead-text', d.lead));
    copy.appendChild(el('p', 'q', d.pauseLine));
    d.lines.forEach((l) => copy.appendChild(el('p', null, l)));
    d.thought.forEach((t) => copy.appendChild(el('p', 'q', t)));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      delayMs: d.pauseMs,
      onPrimary: () => goToScene(9),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 9: THE SILENT PROMISE */
  function buildPromise() {
    const d = S.promise;
    const scene = el('section', 'scene scene-promise');
    scene.appendChild(renderHeader(d.eyebrow, 10));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel promise-panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const h2 = el('h2', 'chapter-title', d.chapter);
    copy.appendChild(h2);

    const leadP = el('p', 'lead', d.lead);
    copy.appendChild(leadP);

    const bodyP = setLines(el('p', 'promise-body'), d.body);
    copy.appendChild(bodyP);

    const closingP = el('p', 'promise-closing', d.closing);
    copy.appendChild(closingP);

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const controls = renderControls({
      primaryLabel: d.button,
      showBack: true,
      onPrimary: () => goToScene(10),
    });

    scene.append(bodyEl, controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 10: EDITORIAL GALLERY */
  /* ------------------------------------------------------------- SCENE 10: EDITORIAL GALLERY */
  function buildGallery() {
    const d = S.gallery;
    const scene = el('section', 'scene scene-gallery');

    // Region 1: Header with refined typography
    const topHeader = el('header', 'scene-top gallery-header');
    const titleRow = el('div', 'gallery-title-row');
    const heading = el('h2', 'gallery-heading', d.title);
    const sub = el('p', 'gallery-sub', d.subtitle);
    titleRow.append(heading, sub);
    topHeader.appendChild(titleRow);
    scene.appendChild(topHeader);

    // Region 2: Category Selector & Page Indicator Bar
    const controlsBar = el('div', 'gallery-controls-bar');
    const segControl = el('div', 'gallery-segmented-control');
    segControl.setAttribute('role', 'tablist');

    const pageIndicator = el('div', 'gallery-page-indicator');
    pageIndicator.hidden = true;
    const prevPageBtn = el('button', 'page-arrow prev', '‹');
    prevPageBtn.type = 'button';
    prevPageBtn.setAttribute('aria-label', 'Previous photo page');
    const pageText = el('span', 'page-text', '1 / 1');
    const nextPageBtn = el('button', 'page-arrow next', '›');
    nextPageBtn.type = 'button';
    nextPageBtn.setAttribute('aria-label', 'Next photo page');
    pageIndicator.append(prevPageBtn, pageText, nextPageBtn);

    controlsBar.append(segControl, pageIndicator);
    scene.appendChild(controlsBar);

    // Region 3: Gallery Stage & Cards Grid
    const bodyEl = el('div', 'scene-body gallery-stage');
    const bentoGrid = el('div', 'gallery-bento');
    bodyEl.appendChild(bentoGrid);
    scene.appendChild(bodyEl);

    let activeGroupId = d.groups[0].id;
    let activePageIndex = 0;

    function isMobileLayout() {
      return window.innerWidth <= 768 || window.innerHeight <= 580;
    }

    function getGroupPages(group) {
      if (isMobileLayout()) {
        const all = group.photos || [];
        const pages = [];
        const chunkSize = 4;
        for (let i = 0; i < all.length; i += chunkSize) {
          pages.push(all.slice(i, i + chunkSize));
        }
        return pages.length ? pages : [[]];
      }
      if (group.pages && group.pages.length) {
        return group.pages;
      }
      return [group.photos || []];
    }

    function getPagesForCurrentGroup() {
      const group = d.groups.find((g) => g.id === activeGroupId) || d.groups[0];
      return getGroupPages(group);
    }

    function getActivePhotoList() {
      const pages = getPagesForCurrentGroup();
      if (activePageIndex >= pages.length) activePageIndex = 0;
      return pages[activePageIndex] || [];
    }

    function getAllGroupPhotos() {
      const group = d.groups.find((g) => g.id === activeGroupId) || d.groups[0];
      return group.photos || [];
    }

    function renderGalleryCards() {
      bentoGrid.replaceChildren();
      const group = d.groups.find((g) => g.id === activeGroupId) || d.groups[0];
      const pagePhotos = getActivePhotoList();
      const allPhotos = getAllGroupPhotos();
      const pages = getPagesForCurrentGroup();

      // Configure grid classes
      bentoGrid.className = 'gallery-bento';
      if (isMobileLayout()) {
        if (pagePhotos.length <= 1) {
          bentoGrid.classList.add('bento-1');
        } else if (pagePhotos.length === 2) {
          bentoGrid.classList.add('bento-2');
        } else {
          bentoGrid.classList.add('bento-4');
        }
      } else {
        if (pagePhotos.length >= 6) {
          bentoGrid.classList.add('bento-6');
        } else if (pagePhotos.length === 5) {
          bentoGrid.classList.add('bento-5');
        } else {
          bentoGrid.classList.add('bento-4');
        }
      }

      // Update multi-page indicator
      if (pages.length > 1) {
        pageIndicator.hidden = false;
        pageText.textContent = `${activePageIndex + 1} / ${pages.length}`;
        prevPageBtn.disabled = activePageIndex <= 0;
        nextPageBtn.disabled = activePageIndex >= pages.length - 1;
      } else {
        pageIndicator.hidden = true;
      }

      // Build cards
      pagePhotos.forEach((photo) => {
        const card = el('div', 'bento-card');
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View ${photo.title}`);

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.title;
        img.loading = 'lazy';
        img.decoding = 'async';

        const overlay = el('div', 'bento-overlay');
        const t = el('div', 'bento-title', photo.title);
        const s = el('div', 'bento-sub', photo.sub);
        overlay.append(t, s);

        card.append(img, overlay);

        // Click opens full-screen interactive lightbox
        card.addEventListener('click', () => {
          const fullIdx = allPhotos.findIndex((p) => p.src === photo.src);
          openLightbox(allPhotos, fullIdx !== -1 ? fullIdx : 0, group.label);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const fullIdx = allPhotos.findIndex((p) => p.src === photo.src);
            openLightbox(allPhotos, fullIdx !== -1 ? fullIdx : 0, group.label);
          }
        });

        bentoGrid.appendChild(card);
      });

      fitAll();
    }

    // Category Tabs Setup
    d.groups.forEach((group) => {
      const tabBtn = el('button', `gallery-seg-tab${group.id === activeGroupId ? ' active' : ''}`, group.label);
      tabBtn.type = 'button';
      tabBtn.setAttribute('role', 'tab');
      tabBtn.setAttribute('aria-selected', group.id === activeGroupId ? 'true' : 'false');

      tabBtn.addEventListener('click', () => {
        if (activeGroupId === group.id) return;
        activeGroupId = group.id;
        activePageIndex = 0;

        segControl.querySelectorAll('.gallery-seg-tab').forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tabBtn.classList.add('active');
        tabBtn.setAttribute('aria-selected', 'true');
        tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        renderGalleryCards();
      });

      segControl.appendChild(tabBtn);
    });

    // Pagination Click Listeners
    prevPageBtn.addEventListener('click', () => {
      if (activePageIndex > 0) {
        activePageIndex--;
        renderGalleryCards();
      }
    });

    nextPageBtn.addEventListener('click', () => {
      const pages = getPagesForCurrentGroup();
      if (activePageIndex < pages.length - 1) {
        activePageIndex++;
        renderGalleryCards();
      }
    });

    // Touch Swipe Gesture for Touch-Friendly Pagination
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    bodyEl.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchEndX = touchStartX;
      touchEndY = touchStartY;
    }, { passive: true });

    bodyEl.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }, { passive: true });

    bodyEl.addEventListener('touchend', () => {
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        const pages = getPagesForCurrentGroup();
        if (dx < 0 && activePageIndex < pages.length - 1) {
          activePageIndex++;
          renderGalleryCards();
        } else if (dx > 0 && activePageIndex > 0) {
          activePageIndex--;
          renderGalleryCards();
        }
      }
    }, { passive: true });

    renderGalleryCards();

    // Region 4: Fixed Bottom Navigation Controls
    const controls = renderControls({
      primaryLabel: d.button || "Read the note →",
      showBack: true,
      onPrimary: () => goToScene(11),
    });

    scene.appendChild(controls);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE 11: FINALE */
  function buildFinale() {
    const d = S.finale;
    const scene = el('section', 'scene scene-finale');
    scene.appendChild(renderHeader('For Minni, With Love', 12));

    const bodyEl = el('div', 'scene-body');
    const panel = el('div', 'panel finale-panel');
    const copy = el('div', 'copy');
    copy.dataset.fit = '1';

    const h1 = el('h1', 'finale-heading', d.heading);
    copy.appendChild(h1);

    d.lines.forEach((l) => {
      copy.appendChild(setLines(el('p', 'finale-line'), l));
    });

    copy.appendChild(el('p', 'finale-tagline', d.tagline));
    copy.appendChild(el('p', 'finale-signature', d.signature));

    panel.appendChild(copy);
    bodyEl.appendChild(panel);

    const footer = el('footer', 'controls');

    const photosBtn = el('button', 'btn soft', d.photosButton);
    photosBtn.type = 'button';
    photosBtn.addEventListener('click', () => goToScene(10));

    const replayBtn = el('button', 'btn primary', d.replayButton);
    replayBtn.type = 'button';
    replayBtn.dataset.primary = '1';
    replayBtn.addEventListener('click', () => goToScene(0));

    footer.append(photosBtn, replayBtn);
    scene.append(bodyEl, footer);
    return scene;
  }

  /* ------------------------------------------------------------- SCENE MAP & TRANSITIONS */
  const SCENE_BUILDERS = [
    buildWish,        // 0
    buildInvite,      // 1
    buildBeginning,   // 2
    buildUnstoppable, // 3
    buildAnnayaaa,    // 4
    buildShoulder,    // 5
    buildTraditional, // 6
    buildDark,        // 7
    buildReunion,     // 8
    buildPromise,     // 9
    buildGallery,     // 10
    buildFinale,      // 11
  ];

  function applyAtmosphere(sceneIndex) {
    const key = SCENE_KEYS[sceneIndex];
    const cfg = S[key];
    body.dataset.theme = cfg.theme;
    body.dataset.bg = cfg.bg;

    // Sun warming in Phase 3
    if (sceneIndex >= 8 && sceneIndex <= 9) {
      body.style.setProperty('--sun', '1');
    } else {
      body.style.setProperty('--sun', '0');
    }

    fx.setMode(cfg.fx);

    // Update top progress bar
    const bar = document.querySelector('.progress i');
    if (bar) {
      const pct = (sceneIndex / (TOTAL_SCENES - 1)) * 100;
      bar.style.width = `${pct}%`;
    }
  }

  async function goToScene(index) {
    if (isNavigating || index < 0 || index >= TOTAL_SCENES) return;
    isNavigating = true;
    closeLightbox();

    curScene = index;
    applyAtmosphere(curScene);

    if (index > 0 && typeof musicManager !== 'undefined') {
      musicManager.onVisitorEntry();
    }

    const oldScene = stage.firstElementChild;
    if (oldScene) {
      oldScene.classList.add('out');
      await wait(reduced() ? 0 : 420);
    }

    const newScene = SCENE_BUILDERS[curScene]();
    stage.replaceChildren(newScene);
    newScene.classList.add('in');

    fitAll();

    if (curScene === 11) {
      fx.burst();
    }

    isNavigating = false;
  }

  /* ------------------------------------------------------------- PARTICLES ENGINE */
  const fx = (() => {
    const cv = document.getElementById('fx');
    const ctx = cv.getContext('2d');

    const MODES = {
      gold:  { n: 42, rgb: '216,180,106', kind: 'float' },
      dust:  { n: 32, rgb: '235,195,130', kind: 'float' },
      mist:  { n: 50, rgb: '145,168,198', kind: 'rain' },
      rise:  { n: 54, rgb: '255,225,165', kind: 'rise' },
      burst: { n: 48, rgb: '240,210,140', kind: 'float' }
    };

    let W = 0, H = 0, dpr = 1, list = [], mode = null, raf = 0, last = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);

    function spawn(m, instant) {
      const cfg = MODES[m] || MODES.gold;
      const out = [];
      for (let i = 0; i < cfg.n; i++) {
        const p = {
          x: rnd(0, W),
          y: rnd(0, H),
          life: instant ? 1 : 0,
          dying: false,
          tw: rnd(0, 6.28)
        };
        if (cfg.kind === 'rain') {
          p.len = rnd(12, 32);
          p.v = rnd(240, 380);
          p.a = rnd(0.08, 0.2);
        } else if (cfg.kind === 'rise') {
          p.r = rnd(0.8, 2.8);
          p.vy = -rnd(14, 38);
          p.vx = rnd(-6, 6);
          p.a = rnd(0.35, 0.85);
        } else {
          p.r = rnd(0.7, 2.4);
          p.vy = -rnd(4, 14);
          p.vx = rnd(-5, 5);
          p.a = rnd(0.3, 0.75);
        }
        out.push(p);
      }
      return out;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mode) {
        list = spawn(mode, true);
        if (reduced()) drawStatic();
      }
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      const cfg = MODES[mode] || MODES.gold;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        if (dt) {
          p.life = p.dying ? p.life - dt / 1.1 : Math.min(1, p.life + dt / 1.5);
          if (p.life <= 0 && p.dying) { list.splice(i, 1); continue; }
          p.tw += dt * 1.6;
          const k = p.kind || cfg.kind;
          if (p.spark) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 45 * dt;
            p.ttl -= dt;
            if (p.ttl <= 0) { list.splice(i, 1); continue; }
          } else if (k === 'rain') {
            p.y += p.v * dt;
            p.x -= p.v * dt * 0.1;
            if (p.y > H + 40) { p.y = -40; p.x = rnd(0, W + 80); }
          } else {
            p.x += p.vx * dt + Math.sin(p.tw * 0.6) * 0.16;
            p.y += p.vy * dt;
            if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
          }
        }

        const rgb = p.rgb || cfg.rgb;
        const alpha = p.a * p.life * (p.spark ? Math.max(0, p.ttl / p.maxTtl) : 1);
        if (p.len) {
          ctx.strokeStyle = `rgba(${rgb},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.len * 0.1, p.y - p.len);
          ctx.stroke();
        } else {
          const tw = 0.65 + 0.35 * Math.sin(p.tw);
          ctx.fillStyle = `rgba(${rgb},${alpha * 0.18 * tw})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.8, 0, 6.2832);
          ctx.fill();
          ctx.fillStyle = `rgba(${rgb},${alpha * tw})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    function drawStatic() { draw(0); }

    function loop(t) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      draw(dt);
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reduced() || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function setMode(m) {
      if (!MODES[m] || m === mode) return;
      mode = m;
      if (reduced()) {
        list = spawn(m, true).filter((p) => !p.len);
        drawStatic();
        return;
      }
      list.forEach((p) => { p.dying = true; });
      list = list.concat(spawn(m, false));
      start();
    }

    function burst() {
      if (reduced()) return;
      for (let i = 0; i < 52; i++) {
        const a = rnd(0, 6.2832);
        const s = rnd(70, 240);
        list.push({
          x: W / 2,
          y: H * 0.45,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 70,
          r: rnd(1.2, 3),
          a: rnd(0.5, 0.95),
          life: 1,
          tw: rnd(0, 6),
          spark: true,
          ttl: rnd(1.5, 2.8),
          rgb: '240,210,140',
          kind: 'float'
        });
        list[list.length - 1].maxTtl = list[list.length - 1].ttl;
      }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', start);
    resize();
    return { setMode, burst };
  })();

  /* ------------------------------------------------------------- BACKGROUND MUSIC MANAGER */
  const musicManager = (() => {
    const btn = document.getElementById('music');
    const toast = document.getElementById('toast');
    const audio = document.getElementById('bg-music') || new Audio();

    const MUSIC_SOURCES = [
      S.music || 'music/as_it_was_instrumental.mp3',
      'music/as_it_was_instrumental.mp3',
      'music/as-it-was-instrumental.mp3'
    ];

    let currentSourceIndex = 0;
    let toastTimer = 0;
    let hasExplicitlyPaused = false;
    let isPlaying = false;
    let fadeTimer = null;
    let hasLoadedAudio = false;

    const TARGET_VOLUME = 0.30; // 30% volume as requested

    const showToast = (msg, duration = 3200) => {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
    };

    const updateUI = (active) => {
      isPlaying = active;
      btn.setAttribute('aria-pressed', String(active));
      btn.setAttribute('aria-label', active ? "Pause 'As It Was' (Instrumental)" : "Play 'As It Was' (Instrumental)");
    };

    // Smooth volume fade helper
    function fadeTo(targetVol, durationMs, onComplete) {
      clearInterval(fadeTimer);
      const startVol = audio.volume;
      const startTime = performance.now();

      fadeTimer = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * progress));

        if (progress >= 1) {
          clearInterval(fadeTimer);
          if (onComplete) onComplete();
        }
      }, 30);
    }

    function initAudioSource() {
      if (hasLoadedAudio) return;
      audio.preload = 'none';
      audio.loop = true;
      audio.volume = 0;
      audio.src = MUSIC_SOURCES[currentSourceIndex];
      hasLoadedAudio = true;

      audio.addEventListener('error', () => {
        if (currentSourceIndex < MUSIC_SOURCES.length - 1) {
          currentSourceIndex++;
          audio.src = MUSIC_SOURCES[currentSourceIndex];
          if (isPlaying) {
            audio.play().catch(() => {});
          }
        } else {
          updateUI(false);
        }
      });
    }

    async function play(isManual = false) {
      initAudioSource();
      try {
        if (audio.paused) {
          audio.volume = 0;
          await audio.play();
        }
        updateUI(true);
        hasExplicitlyPaused = false;
        fadeTo(TARGET_VOLUME, 1400);

        if (isManual) {
          showToast('🎵 Playing: “As It Was” (Instrumental)');
        }
      } catch (err) {
        updateUI(false);
        if (isManual) {
          showToast("Add 'as-it-was-instrumental.mp3' to music/ to enable music.", 4200);
        }
      }
    }

    function pause(isManual = false) {
      if (isManual) {
        hasExplicitlyPaused = true;
      }
      fadeTo(0, 700, () => {
        audio.pause();
        updateUI(false);
      });
    }

    function toggle(isManual = true) {
      if (!audio.paused && !audio.ended && isPlaying) {
        pause(isManual);
      } else {
        play(isManual);
      }
    }

    // Triggered upon clicking existing entry buttons (complying with autoplay policy)
    function onVisitorEntry() {
      if (!hasExplicitlyPaused && audio.paused && !isPlaying) {
        play(false);
      }
    }

    btn.addEventListener('click', () => {
      toggle(true);
    });

    return { play, pause, toggle, onVisitorEntry };
  })();

  /* ------------------------------------------------------------- KEYBOARD & TOUCH NAV */
  document.addEventListener('keydown', (e) => {
    // If Lightbox is open, handle lightbox keyboard navigation!
    if (lightboxEl && lightboxEl.classList.contains('open')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        lightboxStep(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        lightboxStep(1);
      }
      return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      const p = stage.querySelector('[data-primary]');
      if (p && !p.disabled) {
        e.preventDefault();
        p.click();
      }
    } else if (e.key === 'ArrowLeft') {
      const b = stage.querySelector('.btn.ghost');
      if (b) {
        e.preventDefault();
        b.click();
      }
    }
  });

  // Touch swipe support (for scenes & lightbox)
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (lightboxEl && lightboxEl.classList.contains('open')) {
        // Swipe in Lightbox
        if (dx < 0) {
          lightboxStep(1);
        } else {
          lightboxStep(-1);
        }
        return;
      }

      // Swipe in Scene
      if (dx < 0) {
        const p = stage.querySelector('[data-primary]');
        if (p && !p.disabled) p.click();
      } else {
        if (curScene > 0) goToScene(curScene - 1);
      }
    }
  }, { passive: true });

  /* ------------------------------------------------------------- FLOATING ROMANTIC HEARTS */
  const FloatingHearts = (() => {
    const container = document.getElementById('floating-hearts');
    if (!container || reduced()) return;

    const HEARTS = ['💖', '💕', '💞', '💝', '❤️', '💗'];
    const rnd = (min, max) => min + Math.random() * (max - min);

    // Responsive count: ~18 on desktop, ~13 on mobile
    const count = window.innerWidth <= 640 ? 13 : 19;

    for (let i = 0; i < count; i++) {
      const heart = el('span', 'floating-heart', HEARTS[i % HEARTS.length]);

      // Subtle and medium sizes (16px to 27px)
      const size = rnd(16, 27);
      heart.style.fontSize = `${size.toFixed(1)}px`;

      // Random starting horizontal position (3% to 95%)
      const left = rnd(3, 95);
      heart.style.left = `${left.toFixed(1)}%`;

      // Slow, smooth, romantic animation duration (14s to 26s)
      const duration = rnd(14, 25);
      heart.style.animationDuration = `${duration.toFixed(1)}s`;

      // Negative delays distribute hearts across the entire screen immediately on load
      const delay = -rnd(0, duration);
      heart.style.animationDelay = `${delay.toFixed(1)}s`;

      // Natural sway and slight rotation parameters
      const maxOp = rnd(0.42, 0.72);
      const sway1 = rnd(8, 22);
      const sway2 = -rnd(10, 26);
      const sway3 = rnd(10, 24);
      const sway4 = -rnd(6, 18);
      const rot1 = rnd(4, 14);
      const rot2 = -rnd(4, 16);
      const rot3 = rnd(3, 12);
      const rot4 = -rnd(2, 10);
      const targetScale = rnd(0.92, 1.14);

      heart.style.setProperty('--max-op', maxOp.toFixed(2));
      heart.style.setProperty('--target-scale', targetScale.toFixed(2));
      heart.style.setProperty('--sway-1', `${sway1.toFixed(1)}px`);
      heart.style.setProperty('--sway-2', `${sway2.toFixed(1)}px`);
      heart.style.setProperty('--sway-3', `${sway3.toFixed(1)}px`);
      heart.style.setProperty('--sway-4', `${sway4.toFixed(1)}px`);
      heart.style.setProperty('--rot-1', `${rot1.toFixed(1)}deg`);
      heart.style.setProperty('--rot-2', `${rot2.toFixed(1)}deg`);
      heart.style.setProperty('--rot-3', `${rot3.toFixed(1)}deg`);
      heart.style.setProperty('--rot-4', `${rot4.toFixed(1)}deg`);

      container.appendChild(heart);
    }
  })();

  /* ------------------------------------------------------------- INIT & PRELOAD */
  let resizeTimer = 0;
  let lastWasMobile = window.innerWidth <= 768 || window.innerHeight <= 580;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      fitAll();
      const nowMobile = window.innerWidth <= 768 || window.innerHeight <= 580;
      if (curScene === 10 && nowMobile !== lastWasMobile) {
        lastWasMobile = nowMobile;
        const currentStage = stage.querySelector('.scene-gallery');
        if (currentStage) {
          const newGallery = SCENE_BUILDERS[10]();
          stage.replaceChildren(newGallery);
        }
      }
    }, 80);
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      fitAll();
      if (curScene === 10) {
        const newGallery = SCENE_BUILDERS[10]();
        stage.replaceChildren(newGallery);
      }
    }, 200);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitAll);
  }

  // Preload authentic memory photos
  [
    'photos/photo-13.jpg',
    'photos/photo-08.jpg',
    'photos/photo-04.jpg',
    'photos/photo-02.jpg',
    'photos/photo-07.jpg',
    'photos/photo-11.jpg',
    'photos/photo-09.jpg',
    'photos/photo-05.jpg',
    'photos/photo-06.jpg',
    'photos/photo-15.jpg',
    'photos/photo-14.jpg',
    'photos/photo-01.jpg',
    'photos/photo-10.jpg',
    'photos/photo-03.jpg',
    'photos/photo-12.jpg',
  ].forEach(resolveImage);

  document.title = S.meta.title;
  const hash = (window.location.hash || '').replace('#', '').toLowerCase();
  let startScene = 0;
  if (hash === 'gallery' || hash === '10') {
    startScene = 10;
  } else if (/^\d+$/.test(hash)) {
    const parsed = parseInt(hash, 10);
    if (parsed >= 0 && parsed < TOTAL_SCENES) startScene = parsed;
  }
  goToScene(startScene);
})();
