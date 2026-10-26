/* =========================================================
   Shehan Nadeesha — Portfolio interactions
   Vanilla JS, no dependencies.
   1. Loader
   2. Scroll-morph engine (--mp / --mp2 + SVG divider morph)
   3. Hero intro
   4. Scroll reveals + counters
   5. Typing headline
   6. Sticky nav + morph pill indicator
   7. Smooth anchors
   8. Magnetic buttons
   9. Contact form
   10. Small things
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;

  /* ---------------------------------------------------------
     1. Loader — progress bar then a morph-wipe reveal
     --------------------------------------------------------- */
  const loader = $('#loader');
  const loaderBar = $('#loaderBar');

  function finishLoader() {
    if (!loader || loader.classList.contains('is-done')) return;
    if (loaderBar) loaderBar.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('is-locked');
      document.dispatchEvent(new CustomEvent('site:ready'));
      startHeroIntro();
    }, 260);
  }

  document.body.classList.add('is-locked');

  let progress = 0;
  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18 + 8, 92);
    if (loaderBar) loaderBar.style.width = progress + '%';
  }, 130);

  window.addEventListener('load', () => {
    clearInterval(tick);
    setTimeout(finishLoader, reduceMotion ? 0 : 420);
  });
  setTimeout(() => { clearInterval(tick); finishLoader(); }, 3200);

  /* ---------------------------------------------------------
     2. Scroll-morph engine
     ---------------------------------------------------------
     --mp  : 0 → 1 across the whole page (drives radius / scale)
     --mp2 : 0 → 1 while a [data-morph="enter"] element crosses
             the viewport (its own corners round out, then ease back)
     The SVG dividers morph their path with a sine-wave morph so
     the divider literally reshapes as you scroll.
     --------------------------------------------------------- */
  const morphEls = $$('[data-morph="enter"]');
  const dividerFills = $$('[data-morph-fill]');
  const dividerLines = $$('[data-morph-line]');
  const scrollBar = $('#scrollBar');

  // original divider geometry, used as the morph base
  const baseLine = 'M0,44 C240,10 480,86 720,58 C960,34 1200,62 1440,56';
  const baseFill = 'M0,0 L1440,0 L1440,56 C1200,62 960,34 720,58 C480,86 240,10 0,44 Z';

  // returns {line, fill} — the wave changes shape with scroll
  function morphPaths(t, phase) {
    const a  = 44 + Math.sin((t + phase) * Math.PI * 2) * 24;   // y at x = 0
    const b  = 62 + Math.cos((t + phase) * Math.PI * 2) * 32;
    const c  = 54 + Math.sin((t + phase) * Math.PI * 3) * 28;   // y in the middle
    const d  = 34 + Math.cos((t + phase) * Math.PI * 2.4) * 20;
    const a1 = a - 34, b1 = b + 24, c1 = d + 14, e = a + 12;
    const n = (v) => v.toFixed(1);
    const line = `M0,${n(a)} C240,${n(a1)} 480,${n(b1)} 720,${n(c)} C960,${n(c1)} 1200,${n(b)} 1440,${n(e)}`;
    const fill = `M0,0 L1440,0 L1440,${n(e)} C1200,${n(b)} 960,${n(c1)} 720,${n(c)} ` +
                 `C480,${n(b1)} 240,${n(a1)} 0,${n(a)} Z`;
    return { line, fill };
  }

  let scrollTicking = false;
  let pageProgress = 0;

  function updateScrollMorph() {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    pageProgress = Math.min(1, Math.max(0, y / max));

    root.style.setProperty('--mp', pageProgress.toFixed(4));

    if (scrollBar) scrollBar.style.width = (pageProgress * 100).toFixed(2) + '%';

    // per-element morph progress (0 → 1 → 0 as the card crosses the viewport)
    const vh = window.innerHeight;
    morphEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      // 0 when it first enters from the bottom, 1 once it is above the middle
      const raw = 1 - (r.top + r.height * 0.5) / vh;
      const p = Math.min(1, Math.max(0, raw * 1.6));
      el.style.setProperty('--mp2', p.toFixed(3));
    });

    // dividers reshape with page progress
    if (!reduceMotion && (dividerFills.length || dividerLines.length)) {
      dividerFills.forEach((path, i) => {
        path.setAttribute('d', morphPaths(pageProgress * 0.7 + 0.18, i * 0.4).fill);
      });
      dividerLines.forEach((path, i) => {
        path.setAttribute('d', morphPaths(pageProgress * 0.7 + 0.18, i * 0.4).line);
      });
    } else {
      dividerFills.forEach((path) => path.setAttribute('d', baseFill));
      dividerLines.forEach((path) => path.setAttribute('d', baseLine));
    }

    scrollTicking = false;
  }

  function requestMorphUpdate() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollMorph);
    }
  }
  window.addEventListener('scroll', requestMorphUpdate, { passive: true });
  window.addEventListener('resize', requestMorphUpdate);
  updateScrollMorph();

  /* ---------------------------------------------------------
     3. Hero intro (staggered reveals once loader lifts)
     --------------------------------------------------------- */
  function startHeroIntro() {
    $$('.hero .reveal').forEach((el, i) => {
      el.style.setProperty('--d', `${80 + i * 90}ms`);
      requestAnimationFrame(() => el.classList.add('is-in'));
    });
  }

  /* ---------------------------------------------------------
     4. Scroll reveals + counters
     --------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    $$('.reveal').forEach((el, i) => {
      el.style.setProperty('--d', `${(i % 4) * 90}ms`);
      io.observe(el);
    });
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-in'));
  }

  const statGrid = $('.stats__grid');
  if (statGrid && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        $$('.stat', statGrid).forEach(countUp);
        so.disconnect();
      });
    }, { threshold: 0.05 });
    so.observe(statGrid);
  }

  function countUp(statEl) {
    const numEl = $('.stat__num', statEl);
    if (!numEl || numEl.dataset.done) return;
    numEl.dataset.done = '1';
    const target = Number(numEl.dataset.count || 0);
    if (reduceMotion) { numEl.textContent = target; return; }
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     5. Typing headline
     --------------------------------------------------------- */
  const typedEl = $('#typed');
  const WORDS = [
    'AI & Machine Learning',
    'Full-Stack Developer',
    'Building smart systems',
    'Content creator'
  ];

  // shrink-to-fit so the longest role never breaks awkwardly on small screens
  function fitTyped() {
    if (!typedEl) return;
    const max = typedEl.parentElement.clientWidth - 24;
    typedEl.style.fontSize = '';
    let size = parseFloat(getComputedStyle(typedEl).fontSize);
    let guard = 0;
    while (typedEl.scrollWidth > max && size > 13 && guard < 24) {
      size -= 1;
      typedEl.style.fontSize = size + 'px';
      guard += 1;
    }
  }
  window.addEventListener('resize', fitTyped);

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = WORDS[0];
      fitTyped();
    } else {
      let w = 0, c = 0, deleting = false;
      (function type() {
        const word = WORDS[w];
        typedEl.textContent = word.slice(0, c);
        let delay = deleting ? 38 : 74;

        if (!deleting && c === word.length) {
          deleting = true;
          delay = 2600;
          fitTyped();
        } else if (deleting && c === 0) {
          deleting = false;
          w = (w + 1) % WORDS.length;
          delay = 340;
        } else {
          c += deleting ? -1 : 1;
        }
        setTimeout(type, delay);
      })();
    }
  }

  /* ---------------------------------------------------------
     6. Sticky nav: shadow, hide-on-scroll, morph pill indicator
     --------------------------------------------------------- */
  const navWrap = $('#navWrap');
  const nav = $('#nav');
  const navLinks = $('#navLinks');
  const navToggle = $('#navToggle');
  const indicator = $('#navIndicator');
  const links = $$('[data-nav]');

  let lastY = window.scrollY;
  let navTicking = false;

  function onScroll() {
    const y = window.scrollY;
    navWrap.classList.toggle('is-stuck', y > 12);

    if (y > 420 && y > lastY + 6 && !navLinks.classList.contains('is-open')) {
      navWrap.classList.add('is-hidden');
    } else if (y < lastY - 4 || y < 260) {
      navWrap.classList.remove('is-hidden');
    }
    lastY = y;
    setActiveByScroll(y);
    navTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!navTicking) { navTicking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  function moveIndicator(link) {
    if (!indicator || !link || window.innerWidth <= 900) return;
    const navRect = nav.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    indicator.style.setProperty('--w', `${r.width}px`);
    indicator.style.setProperty('--x', `${r.left - navRect.left}px`);
    indicator.classList.add('is-ready');
  }

  function setActive(link) {
    links.forEach((a) => a.classList.toggle('is-active', a === link));
    moveIndicator(link);
  }

  links.forEach((a) => {
    a.addEventListener('mouseenter', () => moveIndicator(a));
    a.addEventListener('focus', () => moveIndicator(a));
    a.addEventListener('click', () => {
      closeMenu();
      setActive(a);
    });
  });

  navLinks.addEventListener('mouseleave', () => {
    const active = $('[data-nav].is-active');
    if (active) moveIndicator(active);
  });

  const sections = ['hero', 'work', 'about', 'skills', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveByScroll(y) {
    if (navLinks.classList.contains('is-open')) return;
    const probe = y + window.innerHeight * 0.32;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= probe) current = s; });
    const link = links.find((a) => a.getAttribute('href') === '#' + current.id);
    if (link && !link.classList.contains('is-active')) setActive(link);
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
  }

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); navWrap.classList.remove('is-hidden'); }
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
    const active = $('[data-nav].is-active');
    if (active) moveIndicator(active);
  });

  window.addEventListener('load', () => {
    const first = $('[data-nav].is-active') || links[0];
    setTimeout(() => moveIndicator(first), 400);
  });

  /* ---------------------------------------------------------
     7. Smooth anchor scroll with nav offset
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      const navH = navWrap.getBoundingClientRect().height;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------------------------------------------------------
     8. Magnetic hover on primary buttons (pointer devices only)
     --------------------------------------------------------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    $$('.morph-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${x * 6}px, ${y * 4 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     9. Contact form — validation + Web3Forms submit
     --------------------------------------------------------- */
  const form = $('#contactForm');
  const note = $('#formNote');
  const submitBtn = $('#submitBtn');
  const toast = $('#toast');
  const toastText = $('#toastText');

  function showToast(msg) {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add('is-show');
    setTimeout(() => toast.classList.remove('is-show'), 4200);
  }

  function setError(field, message) {
    const wrap = field.closest('.field');
    const err = wrap ? $('.field__err', wrap) : null;
    if (!wrap) return;
    wrap.classList.toggle('has-error', Boolean(message));
    if (err) err.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate() {
    let ok = true;
    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;

    if (name.value.trim().length < 2) {
      setError(name, 'Please enter your name.'); ok = false;
    } else setError(name, '');

    const emailOk = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim());
    if (!emailOk) { setError(email, 'Please enter a valid email address.'); ok = false; }
    else setError(email, '');

    if (message.value.trim().length < 10) {
      setError(message, 'Tell me a little more (10+ characters).'); ok = false;
    } else setError(message, '');

    return ok;
  }

  if (form) {
    ['name', 'email', 'message'].forEach((n) => {
      const field = form.elements[n];
      if (field) field.addEventListener('input', () => {
        if (field.closest('.field').classList.contains('has-error')) setError(field, '');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) {
        note.className = 'form__note is-err';
        note.textContent = 'Please fix the highlighted fields.';
        const firstErr = $('.has-error input, .has-error textarea', form);
        if (firstErr) firstErr.focus();
        return;
      }

      submitBtn.classList.add('is-busy');
      submitBtn.querySelector('span').textContent = 'Sending';
      note.className = 'form__note';
      note.textContent = 'Sending your message…';

      try {
        const payload = Object.fromEntries(new FormData(form));
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          note.className = 'form__note is-ok';
          note.textContent = 'Message sent — thanks! I’ll get back to you within a day.';
          showToast('Message sent successfully');
          form.reset();
        } else {
          throw new Error(data.message || 'Something went wrong.');
        }
      } catch (err) {
        note.className = 'form__note is-err';
        note.textContent = 'Could not send right now. Email me directly at hello@shehannadeesha.dev.';
        showToast('Message failed — try email');
      } finally {
        submitBtn.classList.remove('is-busy');
        submitBtn.querySelector('span').textContent = 'Send message';
      }
    });
  }

  /* ---------------------------------------------------------
     10. Small things
     --------------------------------------------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Lazy + polite video: only download/play when it is on screen
  //
  // The loop has to look like it never stopped mid-shot: whenever the clip
  // starts — on load, on scroll-in, on focus or on a visibility change — it
  // rewinds to 0s first, and when it laps the end it rewinds instead of
  // letting the browser guess. Without this the card could open on frame 96
  // of a 12s clip and look frozen.
  const videos = $$('video.lazy-video');
  videos.forEach((vid) => {
    let seekOnPlay = true;
    let loaded = false;

    const load = () => {
      if (!vid.src && vid.dataset.src) {
        vid.src = vid.dataset.src;
        vid.load();
      }
    };

    const restart = () => {
      try {
        vid.currentTime = 0;
      } catch (e) {
        // metadata may not be there yet — the loadedmetadata handler catches it
        loaded = false;
      }
    };

    const play = () => {
      load();
      if (seekOnPlay) {
        seekOnPlay = false;
        restart();
      }
      vid.play().catch(() => {});
    };

    const pause = () => {
      vid.pause();
      seekOnPlay = true;   // next time it comes back, start from frame 0 again
    };

    // first paint of the first frame, not whatever the browser cached
    vid.addEventListener('loadedmetadata', () => {
      loaded = true;
      try { vid.currentTime = 0; } catch (e) {}
    }, { once: true });

    // the markup keeps a native `loop`; this is the belt-and-braces path for
    // browsers that fire `ended` when loop is stripped (save-data mode)
    vid.addEventListener('ended', () => { restart(); vid.play().catch(() => {}); });

    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) play();
          else pause();
        });
      }, { threshold: 0.2 });
      vio.observe(vid);
    } else {
      play();
    }

    // background tab: don't let the clip drift forward while nobody watches
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else if (vid.getBoundingClientRect().top < window.innerHeight) play();
    });

    // a paused browser (reduced data, autoplay block) still gets frame 0
    vid.addEventListener('pause', () => {
      if (!vid.ended && document.visibilityState === 'visible') seekOnPlay = true;
    });

    if (navigator.connection && navigator.connection.saveData) {
      vid.removeAttribute('autoplay');
      vid.controls = true;
    }
  });
})();

/* =========================================================
   ADVANCED INTERACTION LAYER
   A. Cursor follower + magnetic pull
   B. Spotlight cards
   C. 3D tilt
   D. Torch reveal
   E. Scroll-scrubbed statement
   F. Command palette (⌘K)
   G. Terminal easter egg
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- A. cursor ----------
     The custom follower/dot overlay was retired: the document keeps the
     native OS pointer everywhere (see .has-cursor in style.css). ---------- */
  document.documentElement.classList.remove('has-cursor');

  /* ---------- magnetic pull ---------- */
  if (finePointer && !reduceMotion) {
    $$('.morph-btn, .nav__logo, .footer__top, .nav__hint').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * 7}px, ${y * 5}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- B. spotlight cards ---------- */
  if (finePointer) {
    $$('.spotlight').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- C. 3D tilt ---------- */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach((el) => {
      const max = 6;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- D. torch reveal ---------- */
  const torch = $('#torchPhoto');
  if (torch && finePointer) {
    torch.addEventListener('mousemove', (e) => {
      const r = torch.getBoundingClientRect();
      torch.style.setProperty('--tx', `${e.clientX - r.left}px`);
      torch.style.setProperty('--ty', `${e.clientY - r.top}px`);
    });
  }

  /* ---------- E. scroll-scrubbed statement ---------- */
  const scrub = $('#scrubText');
  if (scrub) {
    const words = scrub.textContent.trim().split(/\s+/);
    scrub.innerHTML = words
      .map((w, i) => `<span class="w" data-i="${i}">${w}</span>`)
      .join(' ');
    const spans = $$('.w', scrub);

    const paintScrub = () => {
      const r = scrub.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the block enters the lower third, 1 when it reaches the upper third
      const raw = (vh * 0.86 - r.top) / (vh * 0.5);
      const p = Math.min(1, Math.max(0, raw));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => {
        s.classList.toggle('on', i < lit);
        s.classList.toggle('hot', i === lit - 1 && p < 1);
      });
    };
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { paintScrub(); ticking = false; }); }
    }, { passive: true });
    window.addEventListener('resize', paintScrub);
    paintScrub();
  }

  /* ---------- F. command palette ---------- */
  const cmdk = $('#cmdk');
  const cmdkInput = $('#cmdkInput');
  const cmdkList = $('#cmdkList');
  const cmdkOpenBtn = $('#cmdkOpen');

  const COMMANDS = [
    { group: 'Navigate', label: 'Home', hint: 'top', icon: 'i-grid', run: () => go('#hero') },
    { group: 'Navigate', label: 'Work — projects', hint: 'section', icon: 'i-layers', run: () => go('#work') },
    { group: 'Navigate', label: 'About me', hint: 'section', icon: 'i-user', run: () => go('#about') },
    { group: 'Navigate', label: 'Skills & education', hint: 'section', icon: 'i-cpu', run: () => go('#skills') },
    { group: 'Navigate', label: '3D portrait stage', hint: 'section', icon: 'i-user', run: () => go('#portrait') },
    { group: 'Navigate', label: 'Achievement showcase', hint: 'section', icon: 'i-award', run: () => go('#awards') },
    { group: 'Navigate', label: 'Contact', hint: 'section', icon: 'i-mail', run: () => go('#contact') },
    { group: 'Links', label: 'Download CV (PDF)', hint: 'file', icon: 'i-download', run: () => { window.location.href = 'assets/Shehan-Nadeesha-CV.pdf'; } },
    { group: 'Links', label: 'GitHub profile', hint: 'external', icon: 'i-github', run: () => open_('https://github.com/shehan-dev09') },
    { group: 'Links', label: 'LinkedIn profile', hint: 'external', icon: 'i-linkedin', run: () => open_('https://www.linkedin.com/in/shehan-nadeesha') },
    { group: 'Links', label: 'TikTok — content', hint: 'external', icon: 'i-tiktok', run: () => open_('https://www.tiktok.com/@contentbyshehan') },
    { group: 'Links', label: 'Email me', hint: 'mailto', icon: 'i-mail', run: () => open_('mailto:hello@shehannadeesha.dev') },
    { group: 'Commands', label: 'Play 30s morph recap', hint: 'P', icon: 'i-film', run: () => { if (window.__sig) window.__sig.player(); } },
    { group: 'Commands', label: 'Toggle trace overlay', hint: '⇧T', icon: 'i-layers', run: () => { if (window.__sig) window.__sig.trace(); } },
    { group: 'Commands', label: 'Open live workbench', hint: '⇧W', icon: 'i-terminal-box', run: () => { if (window.__sig) window.__sig.workbench(); } },
    { group: 'Commands', label: 'Open terminal', hint: 'T', icon: 'i-terminal-box', run: () => openTerm() },
    { group: 'Commands', label: 'Copy email address', hint: 'clipboard', icon: 'i-chat', run: copyEmail },
    { group: 'Commands', label: 'Keyboard shortcuts', hint: '?', icon: 'i-keyboard', run: () => { const k = document.getElementById('keys'); if (k) { k.hidden = false; requestAnimationFrame(() => k.classList.add('is-open')); } } },
    { group: 'Commands', label: 'Go to top', hint: '↑', icon: 'i-up', run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }
  ];

  function go(sel) {
    const target = document.querySelector(sel);
    if (!target) return;
    const navH = ($('#navWrap') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 8, behavior: 'smooth' });
  }
  function open_(url) { window.open(url, '_blank', 'noopener'); }
  function copyEmail() {
    const email = 'hello@shehannadeesha.dev';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        const t = $('#toast'), tx = $('#toastText');
        if (t && tx) { tx.textContent = email + ' copied'; t.classList.add('is-show'); setTimeout(() => t.classList.remove('is-show'), 2600); }
      }).catch(() => {});
    }
  }

  let filtered = COMMANDS.slice();
  let activeIndex = 0;

  function renderCmds() {
    if (!cmdkList) return;
    const q = (cmdkInput.value || '').toLowerCase().trim();
    filtered = COMMANDS.filter((c) => (c.label + ' ' + c.group).toLowerCase().includes(q));
    if (activeIndex >= filtered.length) activeIndex = 0;

    if (!filtered.length) {
      cmdkList.innerHTML = '<div class="cmdk__empty">No matches. Try “work”, “cv”, “github”…</div>';
      return;
    }

    let html = '';
    let group = '';
    filtered.forEach((c, i) => {
      if (c.group !== group) { group = c.group; html += `<div class="cmdk__group">${group}</div>`; }
      html += `<button class="cmdk__item" role="option" data-i="${i}"
                    aria-selected="${i === activeIndex}">
                 <svg class="ico" aria-hidden="true"><use href="#${c.icon}"/></svg>
                 <span>${c.label}</span>
                 ${c.hint ? `<small>${c.hint}</small>` : ''}
               </button>`;
    });
    cmdkList.innerHTML = html;
    cmdkList.querySelectorAll('.cmdk__item').forEach((btn) => {
      btn.addEventListener('click', () => runCmd(Number(btn.dataset.i)));
      btn.addEventListener('mousemove', () => { activeIndex = Number(btn.dataset.i); paintActive(); });
    });
  }

  function paintActive() {
    cmdkList.querySelectorAll('.cmdk__item').forEach((btn) => {
      btn.setAttribute('aria-selected', String(Number(btn.dataset.i) === activeIndex));
    });
    const cur = cmdkList.querySelector('.cmdk__item[aria-selected="true"]');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }

  function runCmd(i) {
    const cmd = filtered[i];
    if (!cmd) return;
    closeCmdk();
    setTimeout(() => { try { cmd.run(); } catch (e) {} }, 60);
  }

  let lastFocused = null;

  function openCmdk() {
    if (!cmdk) return;
    lastFocused = document.activeElement;
    cmdk.hidden = false;
    requestAnimationFrame(() => cmdk.classList.add('is-open'));
    cmdkInput.value = '';
    activeIndex = 0;
    renderCmds();
    setTimeout(() => cmdkInput.focus(), 60);
    document.body.style.overflow = 'hidden';
  }

  function closeCmdk() {
    if (!cmdk) return;
    cmdk.classList.remove('is-open');
    document.body.style.overflow = '';
    // hand focus back so keyboard shortcuts keep working afterwards
    if (cmdkInput) cmdkInput.blur();
    if (lastFocused && lastFocused.focus) { try { lastFocused.focus({ preventScroll: true }); } catch (e) {} }
    setTimeout(() => { cmdk.hidden = true; }, 280);
  }

  if (cmdk) {
    if (cmdkOpenBtn) cmdkOpenBtn.addEventListener('click', openCmdk);
    cmdk.addEventListener('click', (e) => { if (e.target === cmdk) closeCmdk(); });
    cmdkInput.addEventListener('input', () => { activeIndex = 0; renderCmds(); });

    cmdkInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); paintActive(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); paintActive(); }
      if (e.key === 'Enter') { e.preventDefault(); runCmd(activeIndex); }
    });
  }

  /* ---------- G. terminal ---------- */
  const term = $('#term');
  const termBody = $('#termBody');
  const termForm = $('#termForm');
  const termInput = $('#termInput');
  const termClose = $('#termClose');
  let termHistory = [];
  let histIndex = -1;

  const FILES = { 'cv.pdf': '1 page', 'kasala.md': 'case study', 'readme.txt': 'the usual' };

  function line(text, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = text;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function openTerm() {
    if (!term) return;
    term.hidden = false;
    requestAnimationFrame(() => term.classList.add('is-open'));
    setTimeout(() => termInput.focus(), 80);
  }
  function closeTerm() {
    if (!term) return;
    term.classList.remove('is-open');
    setTimeout(() => { term.hidden = true; }, 280);
  }

  const CMDS = {
    help: () => {
      line('Available commands:', 'term__line--key');
      line('  whoami      — short bio');
      line('  skills      — stack I work with');
      line('  projects    — list projects');
      line('  kasala      — open the Kasala.Lk case study');
      line('  contact     — how to reach me');
      line('  cv          — download the CV');
      line('  ls          — list files');
      line('  clear       — clear the screen');
      line('  exit        — close terminal');
    },
    whoami: () => line('shehan-nadeesha :: IT undergraduate @ SLIIT (AI specialisation) :: full-stack developer :: Sri Lanka', 'term__line--ok'),
    skills: () => line('python · scikit-learn · pandas · next.js · react · fastapi · node · mysql · postgres · supabase · git'),
    projects: () => {
      line('1. Kasala.Lk   — ML demand prediction for waste collection (shipped)');
      line('2. + 3 more    — in build, unnamed until they run');
    },
    kasala: () => { line('opening case study…', 'term__line--ok'); window.open('https://github.com/shehan-dev09/My-Portfolio/blob/main/Projects/KasalaLK/KasalaLK.html', '_blank', 'noopener'); },
    contact: () => line('email    hello@shehannadeesha.dev<br>github   github.com/shehan-dev09<br>linkedin in/shehan-nadeesha', 'term__line--ok'),
    cv: () => { line('downloading CV…', 'term__line--ok'); window.location.href = 'assets/Shehan-Nadeesha-CV.pdf'; },
    ls: () => line(Object.keys(FILES).join('   ')),
    cat: (arg) => FILES[arg] ? line(`${arg} — ${FILES[arg]}`) : line(`cat: ${arg || ''}: no such file`, 'term__line--dim'),
    clear: () => { termBody.innerHTML = ''; },
    exit: () => { closeTerm(); },
    sudo: () => line('Nice try. You are not root here 😄', 'term__line--dim'),
    'rm': () => line('rm: permission denied — I like these files.', 'term__line--dim')
  };

  if (termForm) {
    termForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = termInput.value.trim();
      if (!raw) return;
      line(`<span class="term__line--key">➜ ~</span> ${raw.replace(/</g, '&lt;')}`);
      termHistory.push(raw); histIndex = termHistory.length;
      const [cmd, ...rest] = raw.split(/\s+/);
      const fn = CMDS[cmd.toLowerCase()];
      if (fn) fn(rest[0]);
      else line(`command not found: ${cmd.replace(/</g, '&lt;')} — try <span class="term__line--key">help</span>`, 'term__line--dim');
      termInput.value = '';
    });

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (histIndex > 0) termInput.value = termHistory[--histIndex] || ''; }
      if (e.key === 'ArrowDown') { e.preventDefault(); if (histIndex < termHistory.length - 1) termInput.value = termHistory[++histIndex] || ''; else { histIndex = termHistory.length; termInput.value = ''; } }
    });

    termClose.addEventListener('click', closeTerm);
    termBody.addEventListener('click', () => termInput.focus());
  }

  /* ---------- global shortcuts ---------- */
  document.addEventListener('keydown', (e) => {
    const ae = document.activeElement || {};
    const inField = /^(INPUT|TEXTAREA)$/.test(ae.tagName || '') &&
                    !(ae.closest && ae.closest('[hidden]'));

    // ⌘K / Ctrl+K → palette
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdk && cmdk.classList.contains('is-open') ? closeCmdk() : openCmdk();
      return;
    }
    if (e.key === 'Escape') {
      if (cmdk && cmdk.classList.contains('is-open')) closeCmdk();
      if (term && term.classList.contains('is-open')) closeTerm();
      return;
    }
    if (e.repeat) return;
    // "t" opens the terminal when not typing and no modifier
    // (Shift+T is reserved for the trace overlay, so plain t only)
    if (!inField && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 't') {
      if (term && !term.classList.contains('is-open')) { e.preventDefault(); openTerm(); }
    }
    // "/" focuses the palette search
    if (!inField && e.key === '/') { e.preventDefault(); openCmdk(); }
  });

  // close terminal with the ✕ when it is open and user clicks outside
  document.addEventListener('mousedown', (e) => {
    if (term && term.classList.contains('is-open') && !term.contains(e.target)) closeTerm();
  });
})();
