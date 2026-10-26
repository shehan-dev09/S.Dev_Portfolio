/* =========================================================
   SIGNATURE LAYER 2
   1. Education "degree engraving" — CSS-only hover plate
   2. Morph player — 30-second morph recap of the whole build
   3. Trace overlay — Shift+T labels the DOM in front of you
   4. Live workbench — real syntax highlighting, search + preview
   5. Journey — scroll-drawn timeline (SVG path animation)
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* =========================================================
     1. EDUCATION — engraved plate
     ========================================================= */
  const eduPhoto = $('#eduPhoto');
  // the engraved caption plate is pure CSS; on touch the caption simply stays
  // visible, so there is nothing to wire up here.

  /* =========================================================
     1b. THE PORTRAIT — 1,824 ASCII tiles that assemble on scroll
     The photo was sampled into 38 × 48 luminance characters ahead of
     time; this re-projects them. Scroll walks every tile through three
     states (scattered in depth → locked grid → resolved photograph),
     and the same characters hold the picture when it resolves.
     ========================================================= */
  (function portraitTiles() {
    const scene = $('#porScene');
    const field = $('#porTiles');
    if (!scene || !field) return;

    /* the photo sampled at two densities: 40×61 for desks, 26×40 for phones,
       so the characters stay readable instead of turning into dust */
    const SETS = {
      fine:   { cols: 40, rows: 61, src: '                .:-::-:                               .------==--                            .----------=:                          .--:=-----:::-:                         :----:.:-:::--=.                        --::-+*###*+=--- .                      ::-+##%%%%%%*:-- .                      ::-####%%%%%*--:                        .-+###%%%%%%#=-                        ..=#***#%#***##-..                      . +#**+*##++*##: .                     . -+#****#%#**##*= .                    . +#######%%%#%#%+ .                    . +*######%%%%%##= .                    . -*####**##%%%##: .                      .*###*+**#%%%#* .                       .:+#*+*##**%#- .                        . -**##*#%##* .                          ..=*##*%%#*= .                          . ==++=*#*++ .                          . **-::--+%#...                      .   -##*+=+*%%%=  ..                 ..   :=-#%***#%%%%+=:   ..           .    .---==+@%####%@#+++=-.    .          :--=======%@@##%@@*++++++=-:         :-=======-===#@#**#@%++++++++++=-.      =++========+=*%:-=-%#++++++++++++= .   :+==+++++=+++++%#==#%*+++++++++++++.  . :===+++++==++++%@+=@%++++++++++++++: .. -===++++++=+++=#@+=%%++++++++++++++= .  ====++++++++++=#%-=##++++++++++++++= . .=====++++++=+++*#:=**+++++++++++++++   :==+=-++++++=+++++-=+++++++++++++++++.  :+=++==+++++=++++=-==+++++++++++==+++-  -===++-++++++=+++=-+=++++++++++==++++-  -===++==+++++=++++-+=++++++++++==++++-  ====++==++++++++++-==++++++++++-=++++= .====++=-=+=+++=+++==++++++++++=-=++++=..===++++======+=+++==++++++++++-=+++++=.:==++*+**-====+==++==+++++++++=-==+++++:-==++##*#=-====+=++==++=++++++=-==+++++--==++#####=-===+==+==++=+++===--==+++++-===++*####*---====+==+==++===-::==+++++===++++####%+:--=========+=====--===++++====++++++*#*--=====+++%%***###*-===++++=-====++++++++++=++++++@@%%%%#%#--==++++=-====++++++++++=++++++%@%%%%%#*===+++++=-====+++++++++++++++++@@%#%%*+=+=+==+++=:===+++=+==+=+++++++++@@#=++=+++=++-=++=:============+=+++++++@%+::-==+++=++-=+- --================+++*=-+=----==++++-+- ---================++=+=-++===-====++=: .-----=============++-=++=+++==-=+==+=   .:::--------==*+--===--====+++=--===-      .---:::::==%#::-====----------:--.      .----::::. #%+-==-==------:--:.         :-----::::.++====---:---:---=:          ----------:. .==-:---------==- .        ------------::------------===-         .-------------:--=======-======.        :-------------:=+=======-======.    ' },
      coarse: { cols: 26, rows: 40, src: '         .:----:                  .------=:                 :--::: :-:               .-:-+***=--               .:-##%%%#--.               :+##%%%%+:              . -#**##+##  .            ..=#**##*##+ .             .*####%%%%# .            . +#%#*#%%%* .            . -*#+*##%*-..             . =*##%##: .               ..+**##+..              .. -*=:-+#= ..         .    :+%*+*%%*:    .        .--==%%#%%%++=-:       :-======*@##@#+++++=-:   .=+++====*#-=#*++++++++.  :+=+++=+++%**%+++++++++:  -+=++++++=%*+%+++++++++-  ===+++++++#++*+++++++++=  =+==+++++++==++++++++++= .==+=+++++++-=+++++++=+++.:==+==++++++==+++++++=+++.:===+=++++++==++++++==+++:-=+++====+++==++++++==+++--+=*##=====+==+++++=-=+++==++*##*--=======+==--=+++==+++###+:=====++====-=+++===++++*+=+=++=%%####=-=++=-==+++++++++++%@%%%#===++=-==+++++++++++%@***=++==+=-========+++++%#-:-=+++===:-===========++==+=--=++=- :---========+====++=-=++:  .:--::--**:==----==----.   .---:: *#-==----:--:      :-----:::-=-::----=: .    --------:--------==- .    ----------=========-   ' }
    };
    const SMALL = window.matchMedia('(max-width: 640px)');
    let SET = SMALL.matches ? SETS.coarse : SETS.fine;
    let COLS = SET.cols;
    let ROWS = SET.rows;
    let SRC = SET.src;

    const rig = $('#porRig');
    const plate = $('#porPlate');
    const lock = $('#porLock');
    const scan = scene.querySelector('.por__scan');
    const toggle = $('#porToggle');
    const toggleText = $('#porToggleText');
    const roLock = $('#porRoLock');
    const roSrc = $('#porRoSrc');
    const factLock = $('#porFactLock');
    const factSrc = $('#porFactSrc');
    const countEl = $('#porCount');
    const resEl = $('#porRoRes');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let N = COLS * ROWS;
    if (countEl) countEl.textContent = N.toLocaleString('en-US');

    /* ---- build the tile field ---- */
    let tiles = [];
    const rand = (i, k) => {
      const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    function build() {
      const frag = document.createDocumentFragment();
      tiles = [];
      for (let i = 0; i < N; i += 1) {
        const el = document.createElement('span');
        el.className = 'por__tile';
        el.textContent = SRC[i] || ' ';
        frag.appendChild(el);
        tiles.push({
          el: el,
          dx: (rand(i, 1) - 0.5) * 150,     // scatter offset, %
          dy: (rand(i, 2) - 0.5) * 120,
          dz: -40 - rand(i, 3) * 260,       // starts deep behind the stage
          rot: (rand(i, 4) - 0.5) * 150,
          delay: rand(i, 5) * 0.3           // staggered landing
        });
      }
      field.textContent = '';
      field.appendChild(frag);
      field.style.setProperty('--por-cols', COLS);
      field.style.setProperty('--por-rows', ROWS);
      field.style.setProperty('--por-aspect', COLS + ' / ' + ROWS);
      if (countEl) countEl.textContent = N.toLocaleString('en-US');
      if (resEl) resEl.textContent = COLS + '\u00d7' + ROWS;
      schedule();
    }

    let progress = 0;    // 0 → 1 across the section
    let drag = 0;        // pointer yaw, springs back to 0
    let dragging = false;
    let photo = false;   // resolved to the photograph
    let raf = 0;

    function readProgress() {
      const r = scene.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    }

    /* tiles land between 8% and 58% of the traversal */
    function lockAmount() {
      const t = Math.min(1, Math.max(0, (progress - 0.08) / 0.5));
      return t * t * (3 - 2 * t);
    }

    function paint() {
      raf = 0;
      const p = progress;
      const z = Math.sin(p * Math.PI);
      const lockAmt = reduce ? 1 : lockAmount();

      if (rig) {
        rig.style.transform =
          'rotateX(' + ((1 - p) * 7).toFixed(2) + 'deg) rotateY(' +
          (-9 + p * 18 + drag).toFixed(2) + 'deg)';
      }
      if (plate) {
        plate.style.transform = 'translate(-50%,-50%) translate(' + (drag * -0.6).toFixed(1) +
          'px,' + ((0.5 - p) * 18).toFixed(1) + 'px) scale(' + (1 + z * 0.03).toFixed(3) + ')';
      }
      if (lock) {
        lock.style.opacity = String(Math.min(1, lockAmt));
        lock.style.transform = 'translate(-50%,-50%) translateZ(60px) rotate(' + (lockAmt * -12).toFixed(1) + 'deg)';
      }
      if (scan) {
        scan.style.opacity = String(0.1 + z * 0.6);
        scan.style.transform = 'translate(-50%,-50%) translateZ(70px) translateY(' + ((0.5 - p) * 260).toFixed(0) + 'px)';
      }

      for (let i = 0; i < N; i += 1) {
        const t = tiles[i];
        const l = Math.min(1, Math.max(0, (lockAmt - t.delay * 0.3) / 0.7));
        const e = l * l * (3 - 2 * l);
        const inv = 1 - e;
        const x = t.dx * inv;
        const y = t.dy * inv;
        const zz = t.dz * inv + e * 6;
        const rot = t.rot * inv;
        const scale = 0.55 + e * 0.45;
        t.el.style.transform =
          'translate3d(' + x.toFixed(2) + '%,' + y.toFixed(2) + '%,' + zz.toFixed(1) + 'px) rotate(' +
          rot.toFixed(1) + 'deg) scale(' + scale.toFixed(2) + ')';
        t.el.style.opacity = photo ? '0' : String(e);
      }

      const pct = Math.round(lockAmt * 100);
      if (roLock) roLock.textContent = pct + '%';
      if (factLock) factLock.textContent = pct + '%';
      if (roSrc) roSrc.textContent = photo ? 'PHOTO' : 'ASCII';
      if (factSrc) factSrc.textContent = photo ? 'PHOTO' : 'ASCII';
    }

    function schedule() { if (!raf) raf = requestAnimationFrame(paint); }
    function onScroll() { readProgress(); schedule(); }

    function tilt(clientX) {
      const r = scene.getBoundingClientRect();
      drag = ((clientX - r.left) / r.width - 0.5) * 34;
      schedule();
    }
    scene.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.por__toggle')) return;
      dragging = true;
      try { scene.setPointerCapture(e.pointerId); } catch (err) {}
      tilt(e.clientX);
    });
    scene.addEventListener('pointermove', function (e) { if (dragging) tilt(e.clientX); });
    scene.addEventListener('pointerup', function () { dragging = false; });
    scene.addEventListener('pointercancel', function () { dragging = false; });
    scene.addEventListener('pointerleave', function () { dragging = false; });
    scene.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      drag = Math.max(-34, Math.min(34, drag + (e.key === 'ArrowRight' ? 8 : -8)));
      schedule();
    });

    (function spring() {
      if (!dragging && Math.abs(drag) > 0.05) { drag += (0 - drag) * 0.06; schedule(); }
      else if (!dragging) { drag = 0; }
      requestAnimationFrame(spring);
    })();

    /* ---- resolve every tile into the real photograph ---- */
    function setPhoto(on) {
      photo = on;
      field.classList.toggle('is-photo', on);
      if (toggleText) toggleText.textContent = on ? 'Back to tiles' : 'Show the photo';
      if (toggle) toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      schedule();
    }
    if (toggle) toggle.addEventListener('click', function () { setPhoto(!photo); });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'f' && e.key !== 'F') return;
      const ae = document.activeElement || {};
      if (/^(INPUT|TEXTAREA)$/.test(ae.tagName || '')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      setPhoto(!photo);
    });

    function applySet() {
      const next = SMALL.matches ? SETS.coarse : SETS.fine;
      if (next === SET) return;
      SET = next; COLS = SET.cols; ROWS = SET.rows; SRC = SET.src;
      N = COLS * ROWS;
      build();
    }
    if (SMALL.addEventListener) SMALL.addEventListener('change', applySet);

    build();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    readProgress();
    paint();
  })();

  /* =========================================================
     7b. CREATOR MONITOR — a running timecode on the on-location frame
     ========================================================= */
  (function creatorMonitor() {
    const tc = $('#creatorTc');
    const frame = $('#creatorFrame');
    if (!tc) return;

    const start = Date.now();
    const pad = (n) => String(n).padStart(2, '0');

    function tick() {
      const ms = Date.now() - start;
      const totalSec = Math.floor(ms / 1000);
      const f = Math.floor((ms % 1000) / 1000 * 25);      // 25 fps
      tc.textContent = pad(Math.floor(totalSec / 3600)) + ':' +
        pad(Math.floor(totalSec / 60) % 60) + ':' +
        pad(totalSec % 60) + ':' + pad(f);
    }
    tick();
    setInterval(tick, 40);

    if (frame) {
      const setH = () => frame.style.setProperty('--scanH', frame.offsetHeight + 'px');
      setH();
      window.addEventListener('resize', setH, { passive: true });
    }
  })();

  /* =========================================================
     7c. ACHIEVEMENT CABINET — a wooden shelf you can turn
     Scroll drives the resting tilt, dragging re-angles the whole
     case, and pointer position adds a little parallax so the pieces
     read as objects sitting inside a box rather than a row of cards.
     ========================================================= */
  (function cabinet() {
    const rig = $('#cabRig');
    const cabinet = $('#cabinet');
    const shelf = $('#cabShelf');
    if (!rig || !cabinet || !shelf) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scrollTilt = 7;     // rotateX from scroll
    let drag = 0;           // rotateY from drag
    let dragging = false;
    let raf = 0;

    function readTilt() {
      const r = rig.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      scrollTilt = 11 - t * 9;   // 11deg → 2deg as it crosses the screen
    }

    let last = '';
    function paint() {
      raf = 0;
      const k = reduce ? 0 : 1;
      const t = 'rotateX(' + (scrollTilt * k).toFixed(2) + 'deg) rotateY(' + (drag * k).toFixed(2) + 'deg)';
      if (t !== last) { last = t; cabinet.style.transform = t; }
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(paint); }

    function turn(clientX) {
      const r = rig.getBoundingClientRect();
      drag = ((clientX - r.left) / r.width - 0.5) * 22;
      schedule();
    }

    /* a press only becomes a drag once the pointer has actually travelled,
       so a plain click on a piece is never read as a shelf turn */
    let startX = 0;
    let moved = false;
    let suppress = false;       /* a drag just ended — swallow the click */
    let suppressT = 0;
    let activeId = null;
    const THRESHOLD = 6;

    function endDrag() {
      dragging = false;
      shelf.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', endDrag, true);
      window.removeEventListener('pointercancel', endDrag, true);
      activeId = null;
      if (moved) {
        suppress = true;
        clearTimeout(suppressT);
        suppressT = setTimeout(function () { suppress = false; }, 400);
      }
      moved = false;
    }

    function onMove(e) {
      if (!dragging) return;
      if (!moved && Math.abs(e.clientX - startX) < THRESHOLD) return;
      if (!moved) { moved = true; shelf.classList.add('is-dragging'); }
      turn(e.clientX);
    }

    shelf.addEventListener('pointerdown', function (e) {
      startX = e.clientX;
      moved = false;
      suppress = false;
      activeId = e.pointerId;
      dragging = true;
      window.addEventListener('pointermove', onMove, true);
      window.addEventListener('pointerup', endDrag, true);
      window.addEventListener('pointercancel', endDrag, true);
    });
    /* a drag that ends on a piece must not also open the viewer */
    shelf.addEventListener('click', function (e) {
      if (suppress) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    shelf.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      drag = Math.max(-22, Math.min(22, drag + (e.key === 'ArrowRight' ? 5 : -5)));
      schedule();
    });

    // springs back to the scroll tilt — only runs while there is something
    // to settle, so it stops burning frames when the shelf is at rest
    (function spring() {
      const settled = !dragging && Math.abs(drag) <= 0.05;
      if (settled) { drag = 0; }
      else if (!dragging) { drag += (0 - drag) * 0.09; schedule(); }
      spring.t = setTimeout(spring, settled ? 220 : 16);
    })();

    window.addEventListener('scroll', function () { readTilt(); schedule(); }, { passive: true });
    window.addEventListener('resize', function () { readTilt(); schedule(); });
    readTilt();
    paint();
    window.__cab = { turn: turn, get drag() { return drag; } };
  })();

  /* =========================================================
     7d. AWARD VIEWER — click a plinth, get the piece in "3D"
     The render sits on a perspective card over a blurred copy of
     itself; pointer position turns it, dragging turns it further,
     and Esc returns focus to the piece that opened it.
     ========================================================= */
  (function awardViewer() {
    const dlg = $('#award');
    if (!dlg) return;

    const card = $('#awardCard');
    const stage = $('#awardStage');
    const img = $('#awardImg');
    const backdropImg = $('#awardBackdropImg');
    const title = $('#awardTitle');
    const sub = $('#awardSub');
    const closeBtn = $('#awardClose');
    const panel = $('#awardPanel');
    const hits = $$('.cab__hit');

    /* each piece has its own solid plate proportions and resting pose */
    const RATIO = {
      play: { yaw: -11, pitch: 5 },   /* portrait 3:4 plate */
      cert: { yaw: -12, pitch: 4 }    /* landscape 16:9 plate */
    };

    let lastFocus = null;
    let drag = false;
    let hover = false;          /* is the pointer actually over the stage */
    let yaw = -13;
    let pitch = 7;
    let lastX = 0;
    let lastY = 0;
    let glide = 0;              /* damped pointer target */
    let glideT = 0;
    let lastMove = 0;
    let idleRaf = 0;
    let idleOn = false;
    let t = 0;
    let restYaw = 0;            /* the pose the piece opened in */
    let restPitch = 0;

    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

    function paint() {
      card.style.transform =
        'rotateX(' + pitch.toFixed(2) + 'deg) rotateY(' + yaw.toFixed(2) + 'deg)';
    }

    function setAspect(kind) {
      card.dataset.kind = RATIO[kind] ? kind : 'cert';
    }

    /* one loop drives everything: eased pointer follow, drag, and the
       idle turn. Nothing is written to the DOM unless it changed. */
    let shown = '';
    function frame(now) {
      if (!idleOn) return;
      const dt = Math.min(48, now - (frame.last || now)) / 16.67;
      frame.last = now;

      if (drag) {
        /* handled in pointermove — nothing to ease */
      } else if (hover && performance.now() - lastMove < 900) {
        yaw += (glide - yaw) * Math.min(1, 0.12 * dt);
        pitch += (glideT - pitch) * Math.min(1, 0.12 * dt);
      } else {
        /* idle: a slow breathing turn that always settles on the rest pose */
        t += 0.012 * dt;
        const k = Math.min(1, 0.06 * dt);
        yaw += (restYaw + Math.sin(t) * 11 - yaw) * k;
        pitch += (restPitch - pitch) * k;
      }

      const css = 'rotateX(' + pitch.toFixed(2) + 'deg) rotateY(' + yaw.toFixed(2) + 'deg)';
      if (css !== shown) { shown = css; card.style.transform = css; }
      idleRaf = requestAnimationFrame(frame);
    }

    function startLoop() {
      if (idleOn) return;
      idleOn = true;
      frame.last = 0;
      idleRaf = requestAnimationFrame(frame);
    }
    function stopLoop() {
      idleOn = false;
      if (idleRaf) cancelAnimationFrame(idleRaf);
      idleRaf = 0;
    }

    function open(data, srcEl) {
      lastFocus = srcEl || document.activeElement;
      const kind = data.kind || 'cert';
      setAspect(kind);
      const r = RATIO[kind] || RATIO.cert;
      yaw = glide = r.yaw;
      pitch = glideT = r.pitch;
      restYaw = r.yaw;
      restPitch = r.pitch;
      t = 0;
      hover = false;
      drag = false;
      lastMove = 0;
      shown = '';
      paint();

      img.src = data.img;
      img.alt = data.title + ' — ' + data.sub;
      backdropImg.src = data.img;
      title.textContent = data.title;
      sub.textContent = data.sub;

      dlg.hidden = false;
      requestAnimationFrame(() => dlg.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      /* focus the panel, not the ✕ — a tapped ✕ should not carry a ring */
      /* the dialog is still visibility:hidden while it fades in, so focus
         lands after the transition or it would silently fail */
      setTimeout(() => {
        if (!dlg.classList.contains('is-open')) return;
        const target = panel || closeBtn;
        if (target && target.focus) target.focus({ preventScroll: true });
      }, 520);
      startLoop();
    }

    function close() {
      dlg.classList.remove('is-open');
      document.body.style.overflow = '';
      stopLoop();
      drag = false;
      hover = false;
      setTimeout(() => {
        dlg.hidden = true;
        img.removeAttribute('src');
        backdropImg.removeAttribute('src');
      }, 380);
      if (lastFocus && lastFocus.focus) {
        try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
      }
    }

    /* ---- opening ---- */
    const shelfEl = $('#cabShelf');
    if (shelfEl) {
      shelfEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.cab__hit');
        if (!btn) return;
        e.preventDefault();
        open({
          kind: btn.dataset.award,
          img: btn.dataset.img,
          title: btn.dataset.title,
          sub: btn.dataset.sub
        }, btn);
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.id === 'awardBackdrop') close();
    });

    /* ---- pointer: only reacts while the pointer is genuinely over the
       stage, eases toward the target, and never fires from clicks ---- */
    function local(e) {
      const r = stage.getBoundingClientRect();
      return {
        x: clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1),
        y: clamp((e.clientY - r.top) / Math.max(1, r.height), 0, 1)
      };
    }

    stage.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      hover = true;
    });
    stage.addEventListener('pointerleave', () => {
      hover = false;
      drag = false;
    });

    stage.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' && !drag) return;
      lastMove = performance.now();

      if (drag) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        yaw = clamp(yaw + dx * 0.32, -62, 62);
        pitch = clamp(pitch - dy * 0.2, -26, 26);
        glide = yaw;
        glideT = pitch;
        shown = '';
        paint();
        return;
      }

      const p = local(e);
      glide = restYaw + (p.x - 0.5) * 30;         /* ±15° from rest */
      glideT = restPitch - (p.y - 0.5) * 18;      /* ±9°  from rest */
    });

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      drag = true;
      hover = e.pointerType !== 'touch' ? true : hover;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMove = performance.now();
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });

    function endDrag(e) {
      if (!drag) return;
      drag = false;
      try { if (e && e.pointerId != null) stage.releasePointerCapture(e.pointerId); } catch (err) {}
      if (e && e.pointerType === 'touch') {
        /* no hovering on touch: settle back to the pose it opened in */
        glide = restYaw; glideT = restPitch;
      }
      lastMove = 0;
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* ---- keyboard ---- */
    document.addEventListener('keydown', (e) => {
      if (dlg.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        /* keep tabbing inside the viewer while it is open */
        const f = dlg.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || !dlg.contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !dlg.contains(document.activeElement))) {
          e.preventDefault(); first.focus();
        }
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.key === 'ArrowLeft') glide = clamp(glide - 8, -62, 62);
        if (e.key === 'ArrowRight') glide = clamp(glide + 8, -62, 62);
        if (e.key === 'ArrowUp') glideT = clamp(glideT + 6, -26, 26);
        if (e.key === 'ArrowDown') glideT = clamp(glideT - 6, -26, 26);
        yaw = glide; pitch = glideT;
        lastMove = 0;
      }
    });
  })();

  /* =========================================================
     2. MORPH PLAYER
     ========================================================= */
  const CHAPTERS = [
    {
      t: 0, year: '2024', label: 'Start',
      cap: 'Enrolled at SLIIT. Chose the AI specialisation. Wrote the first lines of Python.',
      mode: 'scatter'
    },
    {
      t: 6, year: '2024', label: 'Foundations',
      cap: 'Data structures, databases, machine learning. First models trained, first APIs wired.',
      mode: 'split'
    },
    {
      t: 12, year: '2025', label: 'Kasala.Lk',
      cap: 'Kasala.Lk — an ML model that forecasts garbage-collection demand for Sri Lankan cities. Model, API, dashboard.',
      mode: 'rise'
    },
    {
      t: 18, year: '2025', label: 'Full stack',
      cap: 'FastAPI services, Next.js interfaces, Supabase data. Learning to ship the whole thing, not just a notebook.',
      mode: 'wave'
    },
    {
      t: 24, year: '2026', label: 'This site',
      cap: 'A hand-written command palette, a terminal, a trace overlay, a morph player. No frameworks, no dependencies.',
      mode: 'web'
    },
    {
      t: 28, year: 'Now', label: 'Open',
      cap: 'Available for internships and junior roles. The next chapter is yours to write.',
      mode: 'name'
    }
  ];

  const TOTAL = 30;
  const player = $('#player');
  const grid = $('#playerGrid');
  const playBtn = $('#playerPlay');
  const playGlyph = $('#playerPlayGlyph');
  const track = $('#playerTrack');
  const fill = $('#playerFill');
  const yearEl = $('#playerYear');
  const timeEl = $('#playerTime');
  const capEl = $('#playerCaption');
  const chaptersEl = $('#playerChapters');

  let cells = [];
  let playing = false;
  let playT = 0;
  let rafPlayer = null;
  let lastFrame = 0;
  let lastFocusPlayer = null;

  function buildGrid() {
    if (!grid || cells.length) return;
    const cols = window.innerWidth < 640 ? 10 : window.innerWidth < 1100 ? 13 : 16;
    const rows = window.innerWidth < 640 ? 12 : window.innerWidth < 1100 ? 9 : 7;
    grid.style.setProperty('--cols', cols);

    const WORDS = ['PYTHON', 'FASTAPI', 'NEXT.JS', 'ML', 'OPENCV', 'SUPABASE', 'AI', 'SQL'];
    const total = cols * rows;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < total; i++) {
      const c = document.createElement('span');
      c.className = 'player__cell';
      const isWord = i % 11 === 3 && WORDS[(i / 11) | 0 % WORDS.length];
      if (isWord) {
        c.classList.add('is-word', 'on-red');
        c.textContent = WORDS[((i / 11) | 0) % WORDS.length];
      }
      // stable pseudo-random seed per cell
      c.dataset.seed = String(((i * 37) % 97) / 97);
      c.style.setProperty('--r', `${(((i * 53) % 60) - 30)}deg`);
      frag.appendChild(c);
    }
    grid.appendChild(frag);
    cells = $$('.player__cell', grid);

    // chapter chips
    chaptersEl.innerHTML = CHAPTERS
      .map((c, i) => `<li data-i="${i}">${c.label}</li>`)
      .join('');
    // timeline ticks
    $('#playerTicks').innerHTML = CHAPTERS.map(() => '<i></i>').join('');
  }

  function chapterAt(t) {
    let idx = 0;
    CHAPTERS.forEach((c, i) => { if (t >= c.t) idx = i; });
    return idx;
  }

  function renderPlayer(t) {
    if (!cells.length) return;
    const idx = chapterAt(t);
    const ch = CHAPTERS[idx];
    const spanStart = ch.t;
    const spanEnd = CHAPTERS[idx + 1] ? CHAPTERS[idx + 1].t : TOTAL;
    const local = Math.min(1, Math.max(0, (t - spanStart) / Math.max(1, spanEnd - spanStart)));

    yearEl.textContent = ch.year;
    timeEl.textContent = t.toFixed(1);
    capEl.textContent = ch.cap;
    fill.style.width = `${(t / TOTAL) * 100}%`;
    track.setAttribute('aria-valuenow', t.toFixed(0));
    $$('#playerChapters li').forEach((li, i) => li.classList.toggle('is-on', i === idx));

    const cols = parseInt(getComputedStyle(grid).getPropertyValue('--cols'), 10) || 16;

    cells.forEach((c, i) => {
      const seed = parseFloat(c.dataset.seed);
      const x = i % cols;
      const y = (i / cols) | 0;
      const nx = x / (cols - 1);
      const ny = y / Math.max(1, Math.round(cells.length / cols) - 1);
      let scale = 0.18, rot = seed * 40 - 20, op = 0.12, red = false, rad = 9;

      switch (ch.mode) {
        case 'scatter':
          scale = 0.16 + local * 0.34; op = 0.1 + local * 0.32;
          rot = (seed * 90 - 45) * (1 - local * 0.5);
          break;
        case 'split':
          // two solid wedges resolve out of the noise
          scale = 0.4 + Math.abs(nx - 0.5) * 1.1;
          op = 0.26 + local * 0.62;
          rot = (nx - 0.5) * 26 * (1 - local);
          red = nx < 0.5 && local > 0.35;
          rad = 10;
          break;
        case 'rise': {
          const threshold = ny;
          const reached = local > threshold * 0.85;
          scale = reached ? 0.9 : 0.24;
          op = reached ? 0.86 : 0.12;
          rot = reached ? 0 : seed * 16 - 8;
          red = reached && seed > 0.68;
          rad = reached ? 4 : 10;
          break;
        }
        case 'wave': {
          const w = Math.sin((nx * 3.1 + local * 2.2) * Math.PI) * 0.5 + 0.5;
          scale = 0.34 + w * 0.52;
          op = 0.24 + w * 0.62;
          rot = (w - 0.5) * 22;
          red = w > 0.78;
          rad = 8;
          break;
        }
        case 'web': {
          const d = Math.hypot(nx - 0.5, ny - 0.5);
          const ring = Math.sin(d * 7 - local * 5) * 0.5 + 0.5;
          scale = 0.26 + ring * 0.5;
          op = 0.2 + ring * 0.66;
          rot = 0;
          red = ring > 0.86;
          rad = 12;
          break;
        }
        case 'name': {
          // everything collapses toward a bright centre
          const d = Math.hypot(nx - 0.5, ny - 0.5);
          scale = 0.16 + (1 - d) * 0.78 * local;
          op = 0.12 + (1 - d) * 0.8 * local;
          rot = 0;
          red = d < 0.26 && local > 0.4;
          rad = 3;
          break;
        }
      }

      c.style.setProperty('--s', scale.toFixed(3));
      c.style.setProperty('--o', op.toFixed(3));
      c.style.transform = `scale(${scale.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;
      c.style.opacity = op.toFixed(3);
      c.style.borderRadius = `${rad}px`;
      c.classList.toggle('is-red', red);
      c.classList.toggle('is-ink', !red);
    });
  }

  function step(ts) {
    if (!playing) return;
    if (!lastFrame) lastFrame = ts;
    const dt = Math.min(0.05, (ts - lastFrame) / 1000);
    lastFrame = ts;
    playT += dt;
    if (playT >= TOTAL) { playT = TOTAL; renderPlayer(playT); stopPlayer(); return; }
    renderPlayer(playT);
    rafPlayer = requestAnimationFrame(step);
  }

  function startPlayer() {
    if (!player) return;
    buildGrid();
    if (playT >= TOTAL - 0.05) playT = 0;
    playing = true;
    lastFrame = 0;
    playGlyph.textContent = '❚❚';
    playBtn.setAttribute('aria-label', 'Pause');
    rafPlayer = requestAnimationFrame(step);
  }
  function stopPlayer() {
    playing = false;
    if (rafPlayer) cancelAnimationFrame(rafPlayer);
    rafPlayer = null;
    playGlyph.textContent = '▶';
    playBtn.setAttribute('aria-label', 'Play');
  }
  function openPlayer() {
    if (!player) return;
    lastFocusPlayer = document.activeElement;
    player.hidden = false;
    buildGrid();
    requestAnimationFrame(() => player.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    renderPlayer(playT);
    setTimeout(() => { if (reduceMotion) { renderPlayer(TOTAL * 0.5); } else { startPlayer(); } }, 340);
    setTimeout(() => playBtn.focus({ preventScroll: true }), 400);
  }
  function closePlayer() {
    if (!player) return;
    stopPlayer();
    player.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocusPlayer && lastFocusPlayer.focus) {
      try { lastFocusPlayer.focus({ preventScroll: true }); } catch (e) {}
    }
    setTimeout(() => { player.hidden = true; }, 420);
  }

  if (player) {
    $('#playerClose').addEventListener('click', closePlayer);
    playBtn.addEventListener('click', () => { playing ? stopPlayer() : startPlayer(); });

    const seek = (clientX) => {
      const r = track.getBoundingClientRect();
      playT = Math.min(TOTAL, Math.max(0, ((clientX - r.left) / r.width) * TOTAL));
      renderPlayer(playT);
    };
    track.addEventListener('click', (e) => seek(e.clientX));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); playT = Math.min(TOTAL, playT + 1); renderPlayer(playT); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); playT = Math.max(0, playT - 1); renderPlayer(playT); }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); playing ? stopPlayer() : startPlayer(); }
    });
    chaptersEl.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      playT = CHAPTERS[Number(li.dataset.i)].t;
      renderPlayer(playT);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && player.classList.contains('is-open')) closePlayer();
    });
  }

  /* =========================================================
     3. TRACE OVERLAY  (Shift + T)
     ========================================================= */
  const trace = $('#trace');
  const traceSvg = $('#traceSvg');
  let traceOn = false;
  let traceRaf = null;

  const TRACE_SELECTOR = '.nav, .hero, .hero__media, .hero__copy, .hero__badge, .stat, .pcard, .edu, .edu__photo, .skill, .form, .section__title, .marquee, .sky__wrap, .about__photo';
  const TRACE_NAMES = {
    '.nav': 'nav',
    '.hero': 'hero',
    '.hero__media': 'portrait',
    '.hero__badge': 'status',
    '.sky__wrap': 'constellation',
    '.hero__copy': 'hero copy',
    '.ccard': 'content card',
    '.stat': 'stat',
    '.pcard': 'project card',
    '.edu': 'education',
    '.edu__photo': 'graduation',
    '.skill': 'skill card',
    '.form': 'contact form',
    '.section__title': 'heading',
    '.marquee': 'marquee band',
    '.journey__stage': 'journey',
    '.about__photo': 'about photo'
  };

  function drawTrace() {
    if (!traceOn) return;
    const nodes = $$(TRACE_SELECTOR).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < window.innerHeight;
    });

    let shapes = '';
    let styled = 0;
    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = Math.round(r.left) + 0.5;
      const y = Math.round(r.top) + 0.5;
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      let name = '';
      for (const k in TRACE_NAMES) { if (el.matches(k)) { name = TRACE_NAMES[k]; break; } }
      const dim = `${w}×${h}`;

      shapes += `<rect class="trace__box" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>`;
      // label pill above the box
      const label = `${name} · ${dim}`;
      const lw = label.length * 5.6 + 14;
      const ly = y - 17 < 2 ? y + 4 : y - 17;
      shapes += `<rect class="trace__label" x="${x}" y="${ly}" width="${lw}" height="14" rx="4"/>`;
      shapes += `<text class="trace__tag" x="${x + 7}" y="${ly + 10.5}">${label}</text>`;
      styled++;
    });

    traceSvg.innerHTML = shapes;
    const pct = $('#tracePct');
    if (pct) pct.textContent = `${nodes.length}`;

    // honest audit while tracing: count any gradient backgrounds in the document
    if (!trace.checkedGradients) {
      let grads = 0;
      document.querySelectorAll('*').forEach((el) => {
        const bg = getComputedStyle(el).backgroundImage || '';
        if (bg.includes('gradient')) grads++;
      });
      trace.checkedGradients = true;
      const zero = $('#traceZero');
      if (zero) zero.textContent = `${grads} CSS gradient${grads === 1 ? '' : 's'}`;
    }
  }

  function toggleTrace() {
    if (!trace) return;
    traceOn = !traceOn;
    trace.classList.toggle('is-live', traceOn);
    document.documentElement.classList.toggle('is-tracing', traceOn);
    if (traceOn) {
      drawTrace();
      const loop = () => {
        drawTrace();
        if (!traceOn) return;          // paint once after switching off, then stop
        traceRaf = requestAnimationFrame(loop);
      };
      loop();
    } else {
      if (traceRaf) cancelAnimationFrame(traceRaf);
      traceRaf = null;
      traceSvg.innerHTML = '';
    }
  }

  /* =========================================================
     4. LIVE WORKBENCH
     ========================================================= */
  const wb = $('#wb');
  let wbLastFocus = null;
  let wbFile = 'index.html';
  let wbSource = {};

  const FILES = {
    'index.html': {
      lang: 'html',
      src:
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kasala.Lk — demand forecast</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- one card, one prediction, one tap -->
  <main class="app">
    <h1 class="app__title">Where is the waste today?</h1>
    <p class="app__sub">Forecast from the last 14 days of collection data.</p>

    <ul class="city">
      <li class="city__row" data-p="92%"><b>Colombo 03</b><span>high demand</span></li>
      <li class="city__row" data-p="64%"><b>Kandy Central</b><span>steady</span></li>
      <li class="city__row" data-p="31%"><b>Galle Fort</b><span>low</span></li>
    </ul>

    <button class="app__cta" id="plan">Plan today's routes</button>
    <p class="app__out" id="out"></p>
  </main>
  <script src="app.js"><\/script>
</body>
</html>`
    },
    'style.css': {
      lang: 'css',
      src:
`:root{
  --ink:#16161a;
  --red:#e11d2e;
  --paper:#ffffff;
}
.app{
  max-width:420px;
  margin:0 auto;
  padding:22px;
  font-family:system-ui, sans-serif;
  color:var(--ink);
}
.app__title{ font-size:1.6rem; letter-spacing:-.02em; }
.app__sub{ color:#6a6a75; font-size:.86rem; }
.city{ list-style:none; padding:0; margin:18px 0; }
.city__row{
  display:flex; justify-content:space-between;
  padding:11px 14px;
  border:1px solid rgba(22,22,26,.12);
  border-radius:10px;
  margin-bottom:8px;
  font-size:.9rem;
}
.app__cta{
  width:100%;
  padding:13px;
  border:0;
  border-radius:10px;
  background:var(--red);
  color:var(--paper);
  font-weight:600;
  cursor:pointer;
}`
    },
    'app.js': {
      lang: 'js',
      src:
`// Kasala.Lk — routes from a rolling forecast
const rows = document.querySelectorAll('.city__row');
const out = document.querySelector('#out');

function plan() {
  const high = [...rows].filter((r) => parseInt(r.dataset.p, 10) > 60);
  out.textContent = high.length + ' areas need a truck before noon.';
}

document.querySelector('#plan').addEventListener('click', plan);
rows.forEach((r) => {
  r.addEventListener('click', () => {
    r.style.borderColor = '#e11d2e';
  });
});`
    }
  };

  // tiny single-pass syntax highlighter — no library, no re-entrancy
  const RULES = {
    html: [
      [/<!--[\s\S]*?-->/, 'tok-com'],
      [/<\/?[a-zA-Z0-9-]+/, 'tok-tag'],
      [/"[^"]*"/, 'tok-str'],
      [/[a-zA-Z-]+(?==)/, 'tok-attr']
    ],
    css: [
      [/\/\*[\s\S]*?\*\//, 'tok-com'],
      [/--?[a-zA-Z-]+(?=\s*:)/, 'tok-prop'],
      [/#[0-9a-fA-F]{3,8}\b/, 'tok-num'],
      [/[.#]?[a-zA-Z][a-zA-Z0-9_-]*(?=\s*\{)/, 'tok-tag'],
      [/[a-zA-Z-]+(?=\s*:)/, 'tok-attr']
    ],
    js: [
      [/\/\/[^\n]*/, 'tok-com'],
      [/'[^'\n]*'|"[^"\n]*"/, 'tok-str'],
      [/\b(const|let|var|function|return|if|else|new|document|querySelector|querySelectorAll|addEventListener|forEach|filter|parseInt|of|true|false)\b/, 'tok-kw'],
      [/\b\d+\b/, 'tok-num']
    ]
  };

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightLine(line, lang) {
    const rules = RULES[lang] || RULES.js;
    const master = new RegExp(rules.map(([re]) => re.source).join('|'), 'g');
    let out = '';
    let last = 0;
    let m;
    while ((m = master.exec(line)) !== null) {
      out += escapeHtml(line.slice(last, m.index));
      let cls = 'tok-tag';
      for (const [re, c] of rules) {
        if (re.test(m[0])) { cls = c; break; }
      }
      out += `<span class="${cls}">${escapeHtml(m[0])}</span>`;
      last = m.index + m[0].length;
      if (m[0].length === 0) master.lastIndex++;   // guard against zero-length matches
    }
    out += escapeHtml(line.slice(last));
    return out;
  }

  function renderFile(name) {
    wbFile = name;
    const f = FILES[name];
    const codeEl = $('#wbCode');
    const lines = f.src.split('\n');
    codeEl.innerHTML = lines.map((line, i) => {
      const marked = highlightLine(line, f.lang);
      return `<span class="wb__line" data-l="${i + 1}">${marked || '&nbsp;'}</span>`;
    }).join('\n');

    $$('.wb__tab').forEach((t) => {
      const on = t.dataset.file === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });

    // preview: run the file directly, no build step.
    // Everything is inlined so the frame makes zero network requests.
    const frame = $('#wbFrame');
    const mode = $('#wbMode');
    const inlineDoc = () => FILES['index.html'].src
      .replace(/<link rel="stylesheet"[^>]*>/, `<style>${FILES['style.css'].src}</style>`)
      .replace(/<script src="app.js"><\/script>/, `<script>${FILES['app.js'].src}<\/script>`);

    if (name === 'index.html' || name === 'app.js') {
      frame.srcdoc = inlineDoc();
      mode.textContent = name === 'app.js' ? 'running' : 'live';
    } else if (name === 'style.css') {
      frame.srcdoc =
        `<style>${FILES['style.css'].src}</style>` +
        `<div class="app"><h1 class="app__title">Where is the waste today?</h1>` +
        `<p class="app__sub">styles applied</p><ul class="city">` +
        `<li class="city__row" data-p="92%"><b>Colombo 03</b><span>high demand</span></li>` +
        `<li class="city__row" data-p="64%"><b>Kandy Central</b><span>steady</span></li>` +
        `<li class="city__row" data-p="31%"><b>Galle Fort</b><span>low</span></li>` +
        `</ul><button class="app__cta">Plan today's routes</button></div>`;
      mode.textContent = 'css';
    }
    const foot = $('#wbFoot');
    if (foot) foot.textContent = `You are looking at the real source of Kasala.Lk's dashboard module.`;
  }

  function wbSearch(q) {
    const lines = $$('.wb__line');
    const term = q.trim().toLowerCase();
    let hits = 0;
    lines.forEach((l) => {
      const hit = term.length > 1 && l.textContent.toLowerCase().includes(term);
      l.classList.toggle('is-hit', hit);
      if (hit) hits++;
    });
    const meter = $('#wbMeterFill');
    if (meter) meter.style.width = `${term.length > 1 ? Math.min(100, (hits / Math.max(1, lines.length)) * 220) : 0}%`;
    const hint = $('#wbHint');
    if (hint) hint.textContent = term.length > 1 ? `${hits} hit${hits === 1 ? '' : 's'}` : 'search';
    if (hits) {
      const first = $('.wb__line.is-hit');
      if (first) first.scrollIntoView({ block: 'nearest' });
    }
  }

  function openWb() {
    if (!wb) return;
    wbLastFocus = document.activeElement;
    wb.hidden = false;
    requestAnimationFrame(() => wb.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    renderFile(wbFile);
    $('#wbStatus').textContent = 'ready';
    setTimeout(() => $('#wbInput').focus({ preventScroll: true }), 300);
  }
  function closeWb() {
    if (!wb) return;
    wb.classList.remove('is-open');
    document.body.style.overflow = '';
    if (wbLastFocus && wbLastFocus.focus) {
      try { wbLastFocus.focus({ preventScroll: true }); } catch (e) {}
    }
    setTimeout(() => { wb.hidden = true; }, 320);
  }

  if (wb) {
    $('#wbClose').addEventListener('click', closeWb);
    wb.addEventListener('click', (e) => { if (e.target === wb) closeWb(); });
    $$('.wb__tab').forEach((t) => t.addEventListener('click', () => renderFile(t.dataset.file)));
    $('#wbInput').addEventListener('input', (e) => wbSearch(e.target.value));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wb.classList.contains('is-open')) closeWb();
    });
  }

  /* =========================================================
     keyboard:  P = player,  Shift+T = trace,  Shift+W = workbench
     ========================================================= */
  document.addEventListener('keydown', (e) => {
    const ae = document.activeElement || {};
    const inField = /^(INPUT|TEXTAREA)$/.test(ae.tagName || '') && !(ae.closest && ae.closest('[hidden]'));
    if (inField || e.metaKey || e.ctrlKey || e.altKey) return;

    const anyDialog = ['#player', '#wb'].some((s) => {
      const el = $(s);
      return el && (el.classList.contains('is-open'));
    });
    if (anyDialog) return;

    if (e.shiftKey && (e.key === 'T' || e.key === 't')) { e.preventDefault(); toggleTrace(); return; }
    if (e.shiftKey && (e.key === 'W' || e.key === 'w')) { e.preventDefault(); openWb(); return; }
    if (!e.shiftKey && (e.key === 'p' || e.key === 'P')) {
      if (document.body.classList.contains('is-typing')) return;
      e.preventDefault(); openPlayer();
    }
  });

  /* =========================================================
     9. NAVIGATION KEYS — G+letter jumps and the ? shortcut sheet
     These used to live in the deck script; the deck is gone, the
     shortcuts are not.
     ========================================================= */
  (function navKeys() {
    const keysPanel = $('#keys');
    let gPressed = false;
    let gTimer = null;

    function scrollToId(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
    function openKeys() {
      if (!keysPanel) return;
      keysPanel.hidden = false;
      requestAnimationFrame(() => keysPanel.classList.add('is-open'));
    }
    function closeKeys() {
      if (!keysPanel) return;
      keysPanel.classList.remove('is-open');
      setTimeout(() => { keysPanel.hidden = true; }, 260);
    }

    const closeBtn = $('#keysClose');
    if (closeBtn) closeBtn.addEventListener('click', closeKeys);
    if (keysPanel) {
      keysPanel.addEventListener('click', (e) => { if (e.target === keysPanel) closeKeys(); });
    }

    document.addEventListener('keydown', function (e) {
      const ae = document.activeElement || {};
      const inField = /^(INPUT|TEXTAREA)$/.test(ae.tagName || '') && !(ae.closest && ae.closest('[hidden]'));
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Escape') {
        if (keysPanel && keysPanel.classList.contains('is-open')) closeKeys();
        return;
      }
      if (e.key === '?' && !e.shiftKey) { e.preventDefault(); openKeys(); return; }
      if (e.shiftKey && e.key === '?') { e.preventDefault(); openKeys(); return; }

      if (gPressed) {
        const map = { w: 'work', a: 'about', s: 'skills', c: 'contact', e: 'creator', h: 'hero', p: 'portrait', b: 'awards' };
        const target = map[e.key.toLowerCase()];
        if (target) { e.preventDefault(); scrollToId(target); }
        gPressed = false;
        clearTimeout(gTimer);
        return;
      }
      if (e.key.toLowerCase() === 'g') {
        gPressed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 1200);
      }
    });

    window.__nav = { openKeys: openKeys, closeKeys: closeKeys };
  })();

  /* command-palette API */
  window.__sig = {
    player: openPlayer,
    workbench: openWb,
    trace: toggleTrace
  };
})();
