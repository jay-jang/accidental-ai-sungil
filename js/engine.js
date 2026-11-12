/* Deck — a single-canvas, zooming presentation engine (Prezi-style).
   Sections register frames with Deck.part(sectionId, order, frames).
   Layout (js/layout.js) places every frame on one world plane; the camera flies
   between frames along a smooth zoom path (van Wijk & Nuij). */
(function () {
  'use strict';

  const DW = 1600, DH = 900;
  const Deck = (window.Deck = window.Deck || {});
  Deck.DW = DW; Deck.DH = DH;
  Deck.parts = Deck.parts || {};
  Deck.frames = [];
  Deck.byId = {};
  Deck.idx = -1;
  Deck.step = 0;
  Deck.free = false;
  Deck.overview = false;
  Deck.compact = Kit.store.get('compact', false);

  /** register frames for a section; `order` sorts multiple part files of one section */
  Deck.part = function (sectionId, order, frames) {
    (Deck.parts[sectionId] || (Deck.parts[sectionId] = [])).push({ order, frames });
  };

  let viewport, world, decor, gridEl;
  let vw = innerWidth, vh = innerHeight;
  let insetB = 0; // px reserved at the bottom for the touch bar
  const vhE = () => Math.max(120, vh - insetB);
  const cam = { x: 0, y: 0, w: DW, r: 0 };
  let flight = null;
  let worldBox = { x: -DW, y: -DH, w: DW * 2, h: DH * 2 };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // phones and tablets: no keyboard, so show the touch bar and accept gestures
  const TOUCH = matchMedia('(hover: none) and (pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 820);
  Deck.touch = TOUCH;
  function toast(msg, ms) {
    ms = ms || 4200;
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 700);
  }

  /* ───────── zoom path (after d3-interpolate's interpolateZoom) ───────── */
  function interpolateZoom(p0, p1) {
    const rho = 1.25, rho2 = rho * rho, rho4 = rho2 * rho2;
    const ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
    const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
    let i, S;
    if (d2 < 1e-6) {
      S = Math.log(w1 / w0) / rho;
      i = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
    } else {
      const d1 = Math.sqrt(d2);
      const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
      const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
      const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
      const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      const cosh = (x) => ((x = Math.exp(x)) + 1 / x) / 2;
      const sinh = (x) => ((x = Math.exp(x)) - 1 / x) / 2;
      const tanh = (x) => ((x = Math.exp(2 * x)) - 1) / (x + 1);
      i = (t) => {
        const s = t * S, coshr0 = cosh(r0);
        const u = (w0 / (rho2 * d1)) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [ux0 + u * dx, uy0 + u * dy, (w0 * coshr0) / cosh(rho * s + r0)];
      };
    }
    i.S = Math.abs(S);
    return i;
  }

  /* ───────── camera ───────── */
  function fitWidth(w, h, pad) {
    pad = pad || 1;
    const A = vw / vhE();
    return (w / h > A ? w : h * A) * pad;
  }
  function camForFrame(f) {
    if (!f) return { ...cam };
    if (f.view === 'world') return worldCam();
    if (typeof f.view === 'string' && Deck.byId[f.view]) return camForFrame(Deck.byId[f.view]);
    return { x: f.cx, y: f.cy, w: fitWidth(DW * f.s, DH * f.s, f.pad || 1.025), r: f.r || 0 };
  }
  function worldCam() {
    // leave a band at the top of the screen for the caption, so it never sits on the map
    const capH = worldBox.h * 0.16;
    const w = fitWidth(worldBox.w, worldBox.h + capH, 1.03);
    return { x: worldBox.x + worldBox.w / 2, y: worldBox.y + worldBox.h / 2 - capH / 2, w, r: 0 };
  }
  Deck.worldCam = worldCam;
  // the camera for the current state at the current screen size (free roaming keeps its own)
  function fitCam() {
    if (Deck.overview) Object.assign(cam, worldCam());
    else if (!Deck.free) Object.assign(cam, camForFrame(Deck.frames[Deck.idx]));
  }

  function applyCam() {
    const k = vw / cam.w;
    world.style.transform = `translate(${vw / 2}px,${vhE() / 2}px) rotate(${-cam.r}deg) scale(${k}) translate(${-cam.x}px,${-cam.y}px)`;
    drawGrid(k);
    // reveal what comes on screen now; hiding what left it waits for an idle moment, so frames never
    // flip on and off mid-motion. (During a flight, flyTo reveals frames just before they are due.)
    if (!flight) { cullFrames([viewCircle(cam, 1.15)], true); if (!handOn) hideLater(); }
    if (minimapOn()) drawMinimap();
    placeFocus();
  }

  /* Frames nowhere near the screen are not painted (.off = visibility:hidden; layout stays, so demos
     can still measure themselves). Without this, every commit pushes all ~25 demo canvases and a
     layer list for the whole world, even when only one frame is on screen. Circle tests, generous. */
  function viewCircle(c, margin) {
    return { x: c.x, y: c.y, r: ((Math.hypot(vw, vh) / 2 + insetB) * (c.w / vw)) * margin };
  }
  function inView(f, v) {
    const fr = f._cullR || (f._cullR = (Math.hypot(DW, DH) / 2) * f.s * 1.35);
    const dx = f.cx - v.x, dy = f.cy - v.y, lim = fr + v.r;
    return dx * dx + dy * dy <= lim * lim;
  }
  function setOff(f, off) { if (off !== !!f._off) { f._off = off; f.el.classList.toggle('off', off); } }
  function cullFrames(views, revealOnly) {
    for (const f of Deck.frames) {
      if (!f.el) continue;
      const off = !views.some((v) => inView(f, v));
      if (off && revealOnly) continue;
      setOff(f, off);
    }
  }
  let hideQueued = false;
  const whenIdle = window.requestIdleCallback ? (fn) => requestIdleCallback(fn, { timeout: 700 }) : (fn) => setTimeout(fn, 120);
  function hideLater() {
    if (hideQueued) return;
    hideQueued = true;
    whenIdle(() => { hideQueued = false; if (!flight && !handOn) cullFrames([viewCircle(cam, 1.15)], false); });
  }

  /* graph paper: 4 grid levels with spacing 8·5ⁿ world units, faded by on-screen spacing.
     Each level is two SVG paths of 1px-wide rects (vertical, horizontal). It used to be 4 full-screen
     layers of tiny tiled CSS gradients: with software raster — common on Windows PCs whose GPU Chrome
     blocklists — re-rasterizing those on every camera step cost ~5 s of CPU per flight. Plain rects
     are cheap to raster. Not a <canvas>: a canvas is always its own compositor layer, which pushes the
     whole world into a separate layer that Chrome rasterizes unrotated and then resamples, so text in
     the tilted sections went soft. SVG paints into the page like the old gradients did. */
  const SVGNS = 'http://www.w3.org/2000/svg';
  let gridG = null, gridPaths = [], gridRot = null;
  function buildGrid() {
    gridG = document.createElementNS(SVGNS, 'g');
    for (let i = 0; i < 8; i++) gridPaths.push({ el: gridG.appendChild(document.createElementNS(SVGNS, 'path')), d: '', o: '' });
    gridEl.appendChild(gridG);
  }
  const f2 = (v) => Math.round(v * 100) / 100;
  function drawGrid(k) {
    if (!gridG) return;
    // read live: moving the window to a screen with another scale factor changes it without a resize
    const d = window.devicePixelRatio || 1, cx = vw / 2, cy = vh / 2;
    const straight = Math.abs(cam.r % 360) < 1e-6;
    // turn about the world's own centre of rotation (it sits insetB/2 higher when the touch bar is shown)
    const rot = straight ? '' : `rotate(${f2(-cam.r)} ${cx} ${f2(cy - insetB / 2)})`;
    if (rot !== gridRot) {
      gridRot = rot;
      if (rot) gridG.setAttribute('transform', rot); else gridG.removeAttribute('transform');
      // axis-aligned, pixel-snapped rects need no antialiasing, which makes them several times cheaper
      // to raster in software; tilted lines keep it
      if (rot) gridG.removeAttribute('shape-rendering'); else gridG.setAttribute('shape-rendering', 'crispEdges');
    }
    // when rotated, cover the whole screen with lines spanning its diagonal
    const R = straight ? 0 : Math.hypot(vw, vh) / 2 - Math.min(vw, vh) / 2 + insetB + 2;
    const x0 = f2(-R), x1 = f2(vw + R), y0 = f2(-R), y1 = f2(vh + R);
    // pixel-snap only when axis-aligned (rotated lines are antialiased anyway)
    const snap = straight ? (v) => Math.round(v * d) / d : f2;
    // a whole number of device pixels (1 at 100–125 % scaling, 2 at 150–200 %): this matches the ink of the
    // old 1 CSS px gradient bands within a few % at every scale, in software and GPU raster alike
    // (a fixed 1 CSS px came out ~20 % heavier at 125 % on GPU; a single device pixel, half as dark at 150 %)
    const px = +(Math.max(1, Math.round(d)) / d).toFixed(4);
    const ox = cx - cam.x * k, oy = cy - insetB / 2 - cam.y * k;
    const nmin = Math.ceil(Math.log(1 / k) / Math.log(5));
    for (let j = 0; j < 4; j++) {
      const n = nmin + j, g = 8 * Math.pow(5, n), s = g * k;
      const a = smooth(6, 30, s) * (1 - smooth(500, 1600, s));
      let dv = '', dh = '', o = '';
      if (a >= 0.01) {
        o = (a * (0.55 + 0.45 * Math.min(1, j / 2))).toFixed(3);
        // lines sit where world x (or y) is a multiple of g, exactly as the world transform maps them
        for (let x = ox + Math.ceil((x0 - ox) / s) * s; x <= x1; x += s) { const X = snap(x); dv += `M${X} ${y0}h${px}V${y1}h-${px}z`; }
        for (let y = oy + Math.ceil((y0 - oy) / s) * s; y <= y1; y += s) { const Y = snap(y); dh += `M${x0} ${Y}v${px}H${x1}v-${px}z`; }
      }
      setGridPath(gridPaths[2 * j], dv, o);
      setGridPath(gridPaths[2 * j + 1], dh, o);
    }
  }
  function setGridPath(p, dd, o) {
    if (dd !== p.d) { p.d = dd; if (dd) p.el.setAttribute('d', dd); else p.el.removeAttribute('d'); }
    if (o !== p.o) { p.o = o; p.el.setAttribute('fill-opacity', o || '0'); }
  }

  /* While the camera moves (a flight, or wheel/drag/pinch by hand) the world is one composited layer
     (will-change) so each step is a cheap transform, not a re-raster of every photo and glyph; the hint
     is dropped when motion ends so Chrome re-rasterizes once, crisp, at the final zoom.
     Set as inline styles on purpose: a class on #world restyles thousands of descendants (8–30 ms per
     toggle), the inline value only #world. A shield, not pointer-events on the frames, keeps hover and
     clicks out of the frames while flying, for the same reason. */
  let handT = 0, handOn = false, composited = false, shield = null;
  function syncMotion() {
    // (not kept at rest on the map/overview either: at 100 % scaling the layer stays rasterized at a
    // flight scale there and the tiny text in the thumbnails goes soft)
    const on = !!flight || handOn;
    if (on !== composited) { composited = on; world.style.willChange = on ? 'transform' : ''; }
    if (shield) shield.hidden = !flight;
  }
  function handMotion() {
    if (!handOn) { handOn = true; syncMotion(); }
    clearTimeout(handT);
    handT = setTimeout(() => {
      handOn = false; syncMotion();
      if (!flight) hideLater();
    }, 260);
  }
  function stopFlight() {
    if (!flight) return;
    cancelAnimationFrame(flight.raf); flight = null; syncMotion();
  }
  // on phones the screen is rarely 16:9, so neighbours crowd the edges: veil everything outside the current frame
  let focusEl = null;
  function placeFocus() {
    if (!focusEl) return;
    const f = Deck.frames[Deck.idx];
    const show = TOUCH && f && !f.view && !Deck.free && !Deck.overview && !flight;
    focusEl.classList.toggle('on', !!show);
    if (!show) return;
    const k = vw / cam.w, w = DW * f.s * k, h = DH * f.s * k;
    focusEl.style.cssText = `left:${vw / 2 - w / 2}px;top:${vhE() / 2 - h / 2}px;width:${w}px;height:${h}px`;
  }
  function smooth(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  let flightSeq = 0;
  function flyTo(target, opts) {
    opts = opts || {};
    if (flight) cancelAnimationFrame(flight.raf);
    const from = { ...cam };
    if (opts.instant || reduced) {
      flight = null; Object.assign(cam, target); applyCam(); syncMotion();
      opts.done && opts.done(); return;
    }
    const zi = interpolateZoom([from.x, from.y, from.w], [target.x, target.y, target.w]);
    let dr = (target.r - from.r) % 360; if (dr > 180) dr -= 360; if (dr < -180) dr += 360;
    const dur = Math.max(650, Math.min(2100, 420 + zi.S * 520 + Math.abs(dr) * 12)) * (opts.speed || 1);
    const t0 = performance.now();
    // Hidden frames the camera will pass over are revealed shortly before they come on screen, not all at
    // once (a zoom-out to the map would otherwise paint all 92 frames in its first frame). Each gets the
    // path position where it first meets the (generous) view; nothing is hidden during the flight.
    const N = 48, due = [];
    for (let i = 0; i <= N; i++) {
      const p = zi(i / N), v = viewCircle({ x: p[0], y: p[1], w: p[2] }, 1.3);
      for (const f of Deck.frames) {
        if (!f.el || !f._off || f._dueAt === flightSeq + 1) continue;
        if (inView(f, v)) { f._dueAt = flightSeq + 1; f._due = Math.max(0, (i - 1) / N); due.push(f); }
      }
    }
    flightSeq++;
    due.sort((a, b) => a._due - b._due);
    let di = 0, last = t0;
    const reveal = (now) => {
      // look ahead in time (at least 150 ms, more when frames come slowly) along the eased path
      const ahead = Kit.ease(Math.min(1, (now - t0 + Math.max(150, 3 * (now - last))) / dur));
      last = now;
      while (di < due.length && due[di]._due <= ahead) setOff(due[di++], false);
    };
    reveal(t0);
    flight = { raf: 0 };
    syncMotion();
    const tick = (now) => {
      reveal(now);
      const t = Math.min(1, (now - t0) / dur), e = Kit.ease(t);
      const p = zi(e);
      cam.x = p[0]; cam.y = p[1]; cam.w = p[2]; cam.r = from.r + dr * e;
      applyCam();
      if (t < 1) flight.raf = requestAnimationFrame(tick);
      else {
        cam.r = target.r;
        const resized = flight.resized;
        flight = null;
        if (resized) fitCam();
        applyCam(); syncMotion(); opts.done && opts.done();
      }
    };
    flight.raf = requestAnimationFrame(tick);
  }

  function screenToWorld(sx, sy) {
    const k = vw / cam.w, a = (cam.r * Math.PI) / 180;
    const dx = (sx - vw / 2) / k, dy = (sy - vhE() / 2) / k;
    return { x: cam.x + dx * Math.cos(a) - dy * Math.sin(a), y: cam.y + dx * Math.sin(a) + dy * Math.cos(a) };
  }

  /* ───────── build ───────── */
  function buildFrames() {
    const S = Deck.SECTIONS;
    const all = [];
    S.forEach((sec, si) => {
      sec.index = si;
      sec.frames = [];
      if (sec.hub !== false) {
        sec.frames.push({
          id: sec.id, hub: true, title: sec.title, minutes: sec.hubMinutes || 0.4,
          notes: sec.notes || '', section: sec, lecture: sec.lecture,
          html: `<div class="hub-kicker">${sec.kicker || ''}</div><div class="hub-title">${sec.title}</div>${sec.sub ? `<div class="hub-sub">${sec.sub}</div>` : ''}`,
        });
      }
      const parts = (Deck.parts[sec.id] || []).slice().sort((a, b) => a.order - b.order);
      parts.forEach((p) => p.frames.forEach((f) => { f.section = sec; f.lecture = f.lecture || sec.lecture; sec.frames.push(f); }));
      sec.frames.forEach((f) => all.push(f));
    });
    all.forEach((f, i) => {
      f.idx = i;
      if (!f.id) f.id = 'frame-' + i;
      if (Deck.byId[f.id]) console.warn('duplicate frame id', f.id);
      Deck.byId[f.id] = f;
    });
    Deck.frames = all;
  }

  function cropSVG(f) {
    const L = 46, W = DW + 20, H = DH + 20;
    const d = `M2,${L} V2 H${L} M${W - L},2 H${W - 2} V${L} M${W - 2},${H - L} V${H - 2} H${W - L} M${L},${H - 2} H2 V${H - L}`;
    const n = String(f.idx + 1).padStart(2, '0');
    return `<svg class="crop" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}"/><text x="${L + 14}" y="-10">${n}${f.optional ? ' · 보충' : ''}</text></svg>`;
  }

  function buildDOM() {
    const frag = document.createDocumentFragment();
    // hubs first so child frames stack above them
    const ordered = Deck.frames.filter((f) => !f.view).sort((a, b) => (b.hub ? 1 : 0) - (a.hub ? 1 : 0) || (b.z || 0) - (a.z || 0));
    ordered.sort((a, b) => (a.hub === b.hub ? 0 : a.hub ? -1 : 1));
    for (const f of ordered) {
      const el = document.createElement('section');
      el.className = 'frame' + (f.hub ? ' hub' : '') + (f.cls ? ' ' + f.cls : '');
      el.id = 'f-' + f.id;
      el.dataset.idx = f.idx;
      el.setAttribute('aria-label', f.title || f.id);
      el.innerHTML = cropSVG(f) + `<div class="stage${f.bleed ? ' bleed' : ''}">${f.html || ''}</div>`;
      el.style.transform = `translate(${f.cx}px,${f.cy}px) rotate(${f.r || 0}deg) scale(${f.s}) translate(${-DW / 2}px,${-DH / 2}px)`;
      f.el = el;
      el.__frame = f;
      frag.appendChild(el);
    }
    world.appendChild(frag);
  }

  /* ───────── frame lifecycle ───────── */
  function ensureInit(f) {
    if (!f || f._inited || !f.el) return;
    f._inited = true;
    try { f.init && f.init(f.el, Kit, f); } catch (e) { console.error('init failed:', f.id, e); }
    if (f.steps == null) {
      let m = 0;
      f.el.querySelectorAll('[data-step]').forEach((n) => { m = Math.max(m, +n.dataset.step || 0); });
      f.steps = m;
    }
  }
  function initAllIdle() {
    const queue = Deck.frames.slice();
    const later = window.requestIdleCallback ? (fn) => requestIdleCallback(fn, { timeout: 200 }) : (fn) => setTimeout(fn, 16);
    const run = (deadline) => {
      // keep going while the camera moves (the opening flight, or someone pressing → right after load),
      // so demos are ready when they come on screen; mid-motion only use the idle time left in the frame
      const moving = flight || handOn;
      const left = deadline && deadline.timeRemaining ? deadline.timeRemaining() : 4;
      const budget = moving ? Math.min(8, left) : 12;
      const t0 = performance.now();
      do ensureInit(queue.shift()); while (queue.length && performance.now() - t0 < budget);
      if (queue.length) later(run);
    };
    later(run);
  }

  let loopRaf = 0, loopLast = 0;
  function startLoops(f) {
    stopLoops();
    if (!f || !f.el || !f.el.__loops || !f.el.__loops.length) return;
    loopLast = performance.now();
    const tick = (now) => {
      const dt = Math.max(0, Math.min(0.05, (now - loopLast) / 1000)); loopLast = Math.max(loopLast, now);
      (f.el.__loops || []).forEach((fn) => { try { fn(now / 1000, dt); } catch (e) { console.error(e); } });
      loopRaf = requestAnimationFrame(tick);
    };
    loopRaf = requestAnimationFrame(tick);
  }
  function stopLoops() { if (loopRaf) cancelAnimationFrame(loopRaf); loopRaf = 0; }

  function applySteps(f) {
    if (!f || !f.el) return;
    f.el.querySelectorAll('[data-step]').forEach((n) => n.classList.toggle('pending', +n.dataset.step > Deck.step));
    try { f.onStep && f.onStep(f.el, Deck.step, Kit, f); } catch (e) { console.error(e); }
  }
  function clearSteps(f) {
    if (!f || !f.el) return;
    f.el.querySelectorAll('[data-step].pending').forEach((n) => n.classList.remove('pending'));
  }

  let arrivedIdx = -1;
  function leave(f) {
    if (!f) return;
    stopLoops();
    if (f.el) { f.el.classList.remove('current', 'deck-arrived'); clearSteps(f); }
    if (arrivedIdx === f.idx) { try { f.leave && f.leave(f.el, Kit, f); } catch (e) { console.error(e); } }
    arrivedIdx = -1;
  }
  function arrive(f) {
    if (!f || Deck.frames[Deck.idx] !== f) return;
    arrivedIdx = f.idx;
    // build-step fades run from here on; while the camera flies in, pending steps are hidden instantly
    // (otherwise every step element animates, as its own layer, during the flight)
    if (f.el) f.el.classList.add('deck-arrived');
    try { f.enter && f.enter(f.el, Kit, f); } catch (e) { console.error(e); }
    startLoops(f);
  }

  /* ───────── navigation ───────── */
  function pathFrames() { return Deck.frames.filter((f) => !(Deck.compact && f.optional)); }
  Deck.path = pathFrames;

  Deck.go = function (i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(Deck.frames.length - 1, i | 0));
    const prev = Deck.frames[Deck.idx], f = Deck.frames[i];
    if (Deck.overview) { Deck.overview = false; }
    Deck.free = false;
    if (prev && prev !== f) leave(prev);
    if (prev === f) { stopLoops(); }
    Deck.idx = i;
    ensureInit(f);
    Deck.step = opts.step === 'end' ? f.steps || 0 : opts.step || 0;
    document.body.dataset.frame = f.id;
    if (f.el) { f.el.classList.remove('deck-arrived'); f.el.classList.add('current'); applySteps(f); }
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    flyTo(camForFrame(f), { instant: opts.instant, done: () => arrive(f) });
    touchTimer(f);
    updateHUD();
    try { history.replaceState(null, '', '#' + f.id); } catch (e) { /* sandboxed */ }
  };
  Deck.next = function () {
    const f = Deck.frames[Deck.idx];
    if (!Deck.free && !Deck.overview && f && Deck.step < (f.steps || 0)) {
      Deck.step++; applySteps(f); updateHUD(); syncPresenter(); return;
    }
    const P = pathFrames(), pi = P.indexOf(f);
    const nf = pi < 0 ? P.find((x) => x.idx > Deck.idx) : P[pi + 1];
    if (nf) Deck.go(nf.idx); else if (Deck.free || Deck.overview) Deck.go(Deck.idx);
  };
  Deck.prev = function () {
    const f = Deck.frames[Deck.idx];
    if (!Deck.free && !Deck.overview && f && Deck.step > 0) {
      Deck.step--; applySteps(f); updateHUD(); syncPresenter(); return;
    }
    const P = pathFrames(), pi = P.indexOf(f);
    const pf = pi < 0 ? P.slice().reverse().find((x) => x.idx < Deck.idx) : P[pi - 1];
    if (pf) Deck.go(pf.idx, { step: 'end' }); else if (Deck.free || Deck.overview) Deck.go(Deck.idx);
  };
  Deck.goId = function (id, opts) { const f = Deck.byId[id]; if (f) Deck.go(f.idx, opts); };
  Deck.toggleOverview = function () {
    if (Deck.overview) { Deck.go(Deck.idx); return; }
    const f = Deck.frames[Deck.idx];
    stopLoops();
    Deck.overview = true; Deck.free = false;
    flyTo(worldCam());
    updateHUD();
    void f;
  };

  /* ───────── timers (one per lecture) ───────── */
  const timers = { 1: { acc: 0, t0: 0, run: false }, 2: { acc: 0, t0: 0, run: false } };
  function tElapsed(t) { return t.acc + (t.run ? performance.now() - t.t0 : 0); }
  function touchTimer(f) {
    const L = f.lecture || 1;
    for (const k in timers) {
      const t = timers[k];
      if (+k !== L && t.run) { t.acc = tElapsed(t); t.run = false; }
    }
    const t = timers[L];
    if (t && !t.run && f.idx > 0 && !t.manualPause) { t.t0 = performance.now(); t.run = true; }
  }
  function plannedBefore(f) {
    let m = 0;
    for (const x of pathFrames()) { if (x === f) break; if (x.lecture === f.lecture) m += x.minutes || 1; }
    return m;
  }
  const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  /* ───────── HUD ───────── */
  let H = {};
  function buildHUD() {
    const bar = document.createElement('div');
    bar.id = 'hud-bar'; bar.className = 'hud';
    bar.innerHTML = `
      <div id="hud-where"><span id="hud-lec"></span><b id="hud-title"></b></div>
      <div id="hud-progress" title="클릭해서 이동"><div class="track"></div><div class="fill"></div><div class="tip"></div></div>
      <div id="hud-right">
        <button class="hud-btn" id="hud-prev" title="이전 (←)" aria-label="이전">‹</button>
        <span id="hud-count"></span>
        <button class="hud-btn" id="hud-next" title="다음 (→)" aria-label="다음">›</button>
        <span id="hud-timer" title="클릭: 시작/일시정지 · 더블클릭: 초기화"></span>
        <button class="hud-btn" id="hud-map" title="전체 지도 (O)">지도</button>
        <button class="hud-btn" id="hud-toc" title="목차 (G)">목차</button>
        <button class="hud-btn" id="hud-notes" title="발표자 노트 (N)">노트</button>
        <button class="hud-btn" id="hud-help" title="단축키 (H)">?</button>
      </div>`;
    document.body.appendChild(bar);
    const cap = document.createElement('div'); cap.id = 'hud-caption'; document.body.appendChild(cap);
    const notes = document.createElement('aside'); notes.id = 'notes'; notes.setAttribute('aria-label', '발표자 노트'); document.body.appendChild(notes);
    const mm = document.createElement('canvas'); mm.id = 'minimap'; mm.hidden = true; document.body.appendChild(mm);
    const hint = document.createElement('div'); hint.id = 'hint'; hint.className = 'hud';
    hint.textContent = TOUCH ? '옆으로 밀어 넘기기 · 두 손가락으로 확대 · 두 번 탭하면 크게' : '→ 다음 · ← 이전 · O 전체 지도 · G 목차 · N 노트 · H 도움말 · 마우스를 아래로 = 진행 막대';
    document.body.appendChild(hint);
    setTimeout(() => (hint.style.opacity = 0), 7000);

    // touch bar: the keyboard-free way through the deck (phones, tablets)
    const tb = document.createElement('nav');
    tb.id = 'touchbar'; tb.setAttribute('aria-label', '장 이동');
    tb.innerHTML = `<i class="tb-prog"></i>
      <button id="tb-prev" aria-label="이전 장">‹ 이전</button>
      <button id="tb-toc" aria-label="목차 열기">목차</button>
      <span id="tb-count" aria-live="polite"></span>
      <button id="tb-map" aria-label="전체 지도">지도</button>
      <button id="tb-next" aria-label="다음 장">다음 ›</button>`;
    document.body.appendChild(tb);
    tb.querySelector('#tb-prev').onclick = () => Deck.prev();
    tb.querySelector('#tb-next').onclick = () => Deck.next();
    tb.querySelector('#tb-map').onclick = () => Deck.toggleOverview();
    tb.querySelector('#tb-toc').onclick = () => toggleToc();

    // table of contents (all devices)
    const toc = document.createElement('aside');
    toc.id = 'toc'; toc.setAttribute('aria-label', '목차');
    let tocHTML = `<header><b>목차</b><span class="toc-meta">${Deck.frames.length}장</span>
      <button class="hud-btn" id="toc-theme" title="밝은/어두운 테마">테마</button>
      <button class="hud-btn" id="toc-compact" title="보충 장 건너뛰기">압축</button>
      <button class="hud-btn" id="toc-notes" title="발표자 노트">노트</button>
      <button class="hud-btn" id="toc-help" title="사용법">?</button>
      <button class="hud-btn" id="toc-close" aria-label="목차 닫기">닫기</button></header><div class="toc-list" data-scroll>`;
    Deck.SECTIONS.forEach((sec) => {
      if (!sec.frames.length) return;
      const head = sec.hub === false ? (sec.id === 'opening' ? '시작' : '마무리') : sec.title;
      tocHTML += `<div class="toc-sec">${sec.lecture}교시<b>${stripTags(head)}</b></div>`;
      sec.frames.forEach((f) => {
        tocHTML += `<button class="toc-row" data-idx="${f.idx}"><span class="n">${f.idx + 1}</span><span class="t">${stripTags(f.hub ? '— 구역 전체 보기' : f.title || f.id)}</span>${f.optional ? '<span class="o">보충</span>' : ''}</button>`;
      });
    });
    toc.innerHTML = tocHTML + '</div>';
    document.body.appendChild(toc);
    toc.addEventListener('click', (e) => {
      const r = e.target.closest('.toc-row');
      if (r) { toggleToc(false); Deck.go(+r.dataset.idx); }
    });
    toc.querySelector('#toc-close').onclick = () => toggleToc(false);
    toc.querySelector('#toc-theme').onclick = () => toggleTheme();
    toc.querySelector('#toc-compact').onclick = () => { Deck.compact = !Deck.compact; Kit.store.set('compact', Deck.compact); updateHUD(); };
    toc.querySelector('#toc-notes').onclick = () => { toggleToc(false); toggleNotes(); };

    focusEl = document.createElement('div'); focusEl.id = 'focus'; focusEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(focusEl);
    toc.querySelector('#toc-help').onclick = () => { toggleToc(false); toggleHelp(); };
    if (TOUCH) {
      toast('아래 버튼이나 옆으로 밀어서 넘겨요 · 두 손가락으로 확대');
      if (innerHeight > innerWidth) setTimeout(() => toast('휴대폰을 가로로 돌리면 더 크게 보여요'), 5200);
    }
    H = { bar, cap, notes, mm, hint, tb, toc, lec: bar.querySelector('#hud-lec'), title: bar.querySelector('#hud-title'), count: bar.querySelector('#hud-count'), timer: bar.querySelector('#hud-timer'), prog: bar.querySelector('#hud-progress') };

    // progress ticks at section starts
    const P = Deck.frames, n = P.length;
    Deck.SECTIONS.forEach((sec) => {
      const f0 = sec.frames[0]; if (!f0) return;
      const t = document.createElement('div');
      const prevSec = Deck.SECTIONS[sec.index - 1];
      t.className = 'tick' + (prevSec && prevSec.lecture !== sec.lecture ? ' lec' : '');
      t.style.left = (f0.idx / (n - 1)) * 100 + '%';
      H.prog.appendChild(t);
    });
    H.prog.addEventListener('mousemove', (e) => {
      const r = H.prog.getBoundingClientRect(), i = Math.round(((e.clientX - r.left) / r.width) * (n - 1));
      const f = P[Math.max(0, Math.min(n - 1, i))], tip = H.prog.querySelector('.tip');
      tip.textContent = `${f.idx + 1}. ${stripTags(f.title || f.id)}`; tip.style.left = (e.clientX - r.left) + 'px';
    });
    H.prog.addEventListener('click', (e) => {
      const r = H.prog.getBoundingClientRect();
      Deck.go(Math.round(((e.clientX - r.left) / r.width) * (n - 1)));
    });
    bar.querySelector('#hud-map').onclick = () => Deck.toggleOverview();
    bar.querySelector('#hud-prev').onclick = () => Deck.prev();
    bar.querySelector('#hud-next').onclick = () => Deck.next();
    bar.querySelector('#hud-toc').onclick = () => toggleToc();
    bar.querySelector('#hud-notes').onclick = () => toggleNotes();
    bar.querySelector('#hud-help').onclick = () => toggleHelp();
    H.timer.onclick = () => {
      const f = Deck.frames[Deck.idx], t = timers[(f && f.lecture) || 1];
      if (t.run) { t.acc = tElapsed(t); t.run = false; t.manualPause = true; } else { t.t0 = performance.now(); t.run = true; t.manualPause = false; }
      updateTimer();
    };
    H.timer.ondblclick = () => { const f = Deck.frames[Deck.idx], t = timers[(f && f.lecture) || 1]; t.acc = 0; t.t0 = performance.now(); updateTimer(); };
    setInterval(updateTimer, 1000);
    mm.addEventListener('click', (e) => {
      const p = Kit.pt(e, mm), s = mm._s;
      if (!s) return;
      const wx = worldBox.x + p.x / s, wy = worldBox.y + p.y / s;
      let best = null, bd = Infinity;
      for (const f of Deck.frames) { if (f.view || f.hub) continue; const d = Math.hypot(f.cx - wx, f.cy - wy); if (d < bd) { bd = d; best = f; } }
      if (best) Deck.go(best.idx);
    });

    // idle-hide
    let idleT = 0, leaving = false;
    const hideLater = (ms) => {
      clearTimeout(idleT);
      idleT = setTimeout(() => document.querySelectorAll('.hud').forEach((h) => { if (!h.matches(':hover')) h.classList.add('idle'); }), ms);
    };
    const wake = () => {
      leaving = false;
      document.querySelectorAll('.hud').forEach((h) => h.classList.remove('idle'));
      hideLater(2800);
    };
    // The bar sits over the frame's bottom edge (the 출처 line), so it only wakes when the
    // pointer comes down to it or for non-navigation keys — not while using a demo or paging.
    const nearBar = (e) => e.clientY > innerHeight - Math.max(110, innerHeight * 0.13) || !!(e.target && e.target.closest && e.target.closest('.hud'));
    const NAV_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageDown', 'PageUp', ' ', 'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta']);
    addEventListener('mousemove', (e) => {
      if (nearBar(e)) wake();
      else if (!leaving && !bar.classList.contains('idle')) { leaving = true; hideLater(900); }
    });
    addEventListener('keydown', (e) => { if (!NAV_KEYS.has(e.key)) wake(); });
    addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || nearBar(e)) wake(); });
    wake();
  }
  const stripTags = (s) => String(s).replace(/<[^>]+>/g, '');

  function updateTimer() {
    const f = Deck.frames[Deck.idx]; if (!f || !H.timer) return;
    const t = timers[f.lecture || 1], el = tElapsed(t), plan = plannedBefore(f) * 60000;
    const late = el - plan > 3 * 60000;
    const cls = t.run ? 'running' : '', html = `${f.lecture || 1}교시 <span class="${late ? 'late' : ''}">${mmss(el)}</span> / 계획 ${mmss(plan)}`;
    if (H.timer.className !== cls) H.timer.className = cls;
    if (H.timer._html !== html) { H.timer._html = html; H.timer.innerHTML = html; } // skip the DOM write when nothing changed
  }

  function updateHUD() {
    const f = Deck.frames[Deck.idx]; if (!f) return;
    const n = Deck.frames.length;
    H.lec.textContent = `${f.lecture || 1}교시 · ${stripTags(f.section.title || '')}`;
    H.title.textContent = Deck.overview ? '전체 지도' : stripTags(f.title || '');
    const sub = f.steps ? ` · ${Deck.step}/${f.steps}` : '';
    H.count.textContent = `${f.idx + 1} / ${n}${sub}${Deck.compact ? ' · 압축' : ''}`;
    H.prog.querySelector('.fill').style.width = (f.idx / (n - 1)) * 100 + '%';
    H.bar.querySelector('#hud-map').classList.toggle('on', Deck.overview);
    // caption for virtual frames and overview
    let cap = '';
    if (Deck.overview) cap = TOUCH ? `전체 지도<small>가고 싶은 곳을 탭하세요</small>` : `전체 지도<small>가고 싶은 곳을 클릭 · O 또는 Esc로 돌아가기</small>`;
    else if (f.view && f.caption) cap = f.caption;
    H.cap.innerHTML = cap;
    H.tb.querySelector('#tb-count').textContent = `${f.idx + 1}/${n}${sub}`;
    H.tb.querySelector('.tb-prog').style.width = (f.idx / (n - 1)) * 100 + '%';
    H.tb.querySelector('#tb-map').classList.toggle('on', Deck.overview);
    H.toc.querySelector('#toc-compact').classList.toggle('on', Deck.compact);
    H.toc.querySelectorAll('.toc-row').forEach((r) => r.classList.toggle('cur', +r.dataset.idx === f.idx));
    renderNotes();
    updateTimer();
    syncPresenter();
    placeFocus();
    H.mm.hidden = !minimapOn();
    if (minimapOn()) drawMinimap();
  }

  /* minimap */
  let minimapPinned = Kit.store.get('minimap', false), mmColors = null;
  Kit.onTheme(() => { mmColors = null; });
  function minimapOn() { return minimapPinned || (Deck.free && !Deck.overview); }
  function drawMinimap() {
    const c = H.mm; if (!c) return;
    const Wpx = 220, s = Wpx / worldBox.w, Hpx = Math.round(worldBox.h * s);
    const dpr = 2;
    if (c.width !== Wpx * dpr) { c.width = Wpx * dpr; c.height = Hpx * dpr; c.style.width = Wpx + 'px'; c.style.height = Hpx + 'px'; }
    c._s = s;
    const ctx = c.getContext('2d'), C = mmColors || (mmColors = Kit.colors()); // getComputedStyle once per theme, not per camera step
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, Wpx, Hpx);
    const cur = Deck.frames[Deck.idx];
    for (const f of Deck.frames) {
      if (f.view) continue;
      const w = DW * f.s * s, h = DH * f.s * s, x = (f.cx - worldBox.x) * s, y = (f.cy - worldBox.y) * s;
      ctx.save(); ctx.translate(x, y); ctx.rotate(((f.r || 0) * Math.PI) / 180);
      if (f === cur) { ctx.fillStyle = C.hl; ctx.fillRect(-w / 2, -h / 2, w, h); }
      ctx.strokeStyle = f.hub ? C.ink3 : C.ink2; ctx.lineWidth = f.hub ? 0.6 : 0.5;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }
    // view rectangle
    const k = vw / cam.w, vwW = vw / k, vhW = vhE() / k;
    ctx.save(); ctx.translate((cam.x - worldBox.x) * s, (cam.y - worldBox.y) * s); ctx.rotate((cam.r * Math.PI) / 180);
    ctx.strokeStyle = C.pen; ctx.lineWidth = 1.5; ctx.strokeRect((-vwW / 2) * s, (-vhW / 2) * s, vwW * s, vhW * s);
    ctx.restore();
  }

  /* notes */
  function renderNotes() {
    const f = Deck.frames[Deck.idx]; if (!f || !H.notes.classList.contains('open')) return;
    const P = pathFrames(), nf = P[P.indexOf(f) + 1];
    const body = String(f.notes || '노트 없음').split(/\n+/).map((p) => `<p>${p}</p>`).join('');
    H.notes.innerHTML = `<h4>${f.idx + 1}. ${stripTags(f.title || f.id)}</h4>
      <div class="meta">${f.lecture || 1}교시 · ${stripTags(f.section.title)} · 약 ${f.minutes || 1}분${f.optional ? ' · 보충(건너뛰기 가능)' : ''}${f.steps ? ` · 단계 ${Deck.step}/${f.steps}` : ''}</div>
      ${body}
      <div class="next">다음 → ${nf ? `${nf.idx + 1}. ${stripTags(nf.title || nf.id)}` : '끝'}</div>`;
  }
  function toggleToc(force) {
    const open = force == null ? !H.toc.classList.contains('open') : force;
    H.toc.classList.toggle('open', open);
    H.bar.querySelector('#hud-toc').classList.toggle('on', open);
    if (open) { const c = H.toc.querySelector('.toc-row.cur'); if (c) c.scrollIntoView({ block: 'center' }); }
  }
  Deck.toggleToc = toggleToc;
  function toggleNotes(force) {
    const open = force == null ? !H.notes.classList.contains('open') : force;
    H.notes.classList.toggle('open', open);
    H.bar.querySelector('#hud-notes').classList.toggle('on', open);
    renderNotes();
  }

  /* overlays */
  let overlay = null;
  function closeOverlay() { if (overlay) { overlay.remove(); overlay = null; return true; } return false; }
  function toggleHelp() {
    if (closeOverlay()) return;
    overlay = document.createElement('div'); overlay.id = 'overlay';
    const rows = [
      ['→  Space  PageDown', '다음 (단계가 있으면 한 단계씩)'], ['←  PageUp', '이전'], ['O  또는  Esc', '전체 지도 보기 / 돌아가기'],
      ['마우스 휠 · 드래그', '자유롭게 확대·이동 (→ 누르면 경로로 복귀)'], ['다른 프레임 클릭', '그 장으로 바로 이동'],
      ['숫자 + Enter', '해당 번호의 장으로 이동'], ['Home / End', '처음 / 마지막'], ['N', '발표자 노트'], ['P', '발표자 창 (듀얼 모니터)'],
      ['F', '전체 화면'], ['T', '밝은/어두운 테마'], ['B', '화면 가리기'], ['M', '미니맵 고정'], ['S', '압축 모드: 보충 장 건너뛰기'],
      ['마우스를 화면 아래로', '진행 막대 · ‹ › 버튼 · 타이머 · 지도/목차/노트 버튼'],
      ['타이머 클릭', '교시별 타이머 시작/정지 · 더블클릭 초기화'],
    ];
    const touchRows = [
      ['‹ 이전 · 다음 ›', '아래 막대의 버튼으로 한 장씩 (단계가 있으면 한 단계씩)'], ['옆으로 밀기', '왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전'],
      ['두 손가락 벌리기', '확대하고 한 손가락으로 끌어 보기'], ['두 번 탭', '그 자리를 크게 보기 · 다시 두 번 탭하면 원래대로'],
      ['목차', '원하는 장으로 바로 이동'], ['지도', '전체 지도에서 장을 탭해 이동'],
    ];
    const list = TOUCH ? touchRows : rows.concat([['G', '목차']]);
    overlay.innerHTML = `<div class="sheet" role="dialog" aria-label="${TOUCH ? '사용법' : '단축키'}"><h3>${TOUCH ? '터치로 보는 법' : '발표 단축키'}</h3><table>${list.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table></div>`;
    overlay.addEventListener('click', closeOverlay);
    document.body.appendChild(overlay);
  }
  let blackout = null;
  function toggleBlackout() {
    if (blackout) { blackout.remove(); blackout = null; return; }
    blackout = document.createElement('div'); blackout.id = 'blackout'; blackout.textContent = '잠깐, 여기를 보세요';
    blackout.addEventListener('click', toggleBlackout);
    document.body.appendChild(blackout);
  }

  /* theme */
  function setTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
    Kit.store.set('theme', t || null);
    Kit._themeChanged();
    if (minimapOn()) drawMinimap();
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(cur === 'dark' ? 'light' : 'dark');
  }

  /* presenter window */
  let pw = null;
  function openPresenter() {
    try { pw = window.open('', 'aai-presenter', 'width=1000,height=680'); } catch (e) { pw = null; }
    if (!pw) return;
    pw.document.open();
    pw.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>발표자 화면</title><style>
      body{margin:0;font:18px/1.6 "IBM Plex Sans KR","Apple SD Gothic Neo",sans-serif;background:#18221e;color:#e6eee8;display:grid;grid-template-columns:1.4fr 1fr;height:100vh}
      main{padding:28px 32px;overflow:auto} aside{padding:28px;border-left:1px solid #33443c;background:#121a17;display:flex;flex-direction:column;gap:16px}
      h1{font-size:28px;margin:0 0 4px} .meta{font:14px "IBM Plex Mono",monospace;color:#8ea198;margin-bottom:18px} .t{font:48px "IBM Plex Mono",monospace}
      .late{color:#ff7d6e} button{font:16px sans-serif;padding:10px 16px;margin-right:8px;background:#e6eee8;border:0;border-radius:6px;cursor:pointer}
      .next{color:#a7b7ae;border-top:1px dashed #33443c;padding-top:12px} p{margin:0 0 12px}</style></head>
      <body><main><h1 id="ti"></h1><div class="meta" id="me"></div><div id="no"></div></main>
      <aside><div class="t" id="tm"></div><div id="pl" class="meta"></div><div><button id="pv">← 이전</button><button id="nx">다음 →</button></div><div class="next" id="nf"></div></aside>
      <script>
        const D=()=>opener&&opener.Deck;
        document.getElementById('nx').onclick=()=>D()&&D().next();
        document.getElementById('pv').onclick=()=>D()&&D().prev();
        addEventListener('keydown',e=>{if(!D())return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();D().next();}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();D().prev();}});
        setInterval(()=>{if(D()&&D()._presenterTick)D()._presenterTick();},1000);
      <\/script></body></html>`);
    pw.document.close();
    syncPresenter();
  }
  function syncPresenter() {
    if (!pw || pw.closed) return;
    try {
      const f = Deck.frames[Deck.idx], d = pw.document, P = pathFrames(), nf = P[P.indexOf(f) + 1];
      d.getElementById('ti').textContent = `${f.idx + 1}. ${stripTags(f.title || f.id)}`;
      d.getElementById('me').textContent = `${f.lecture}교시 · ${stripTags(f.section.title)} · 약 ${f.minutes || 1}분${f.steps ? ` · 단계 ${Deck.step}/${f.steps}` : ''}`;
      d.getElementById('no').innerHTML = String(f.notes || '노트 없음').split(/\n+/).map((p) => `<p>${p}</p>`).join('');
      d.getElementById('nf').textContent = nf ? `다음 → ${nf.idx + 1}. ${stripTags(nf.title || nf.id)}` : '마지막 장';
      Deck._presenterTick();
    } catch (e) { /* closed */ }
  }
  Deck._presenterTick = function () {
    if (!pw || pw.closed) return;
    try {
      const f = Deck.frames[Deck.idx], t = timers[f.lecture || 1], el = tElapsed(t), plan = plannedBefore(f) * 60000;
      pw.document.getElementById('tm').innerHTML = `<span class="${el - plan > 180000 ? 'late' : ''}">${mmss(el)}</span>`;
      pw.document.getElementById('pl').textContent = `${f.lecture}교시 경과 · 이 장까지 계획 ${mmss(plan)}`;
    } catch (e) { /* closed */ }
  };

  /* ───────── input ───────── */
  const INTERACTIVE = 'input, textarea, select, button, a, label, [contenteditable], .demo, .chip, [role="button"], [data-nopan]';
  let gotoBuf = '', gotoT = 0, gotoEl = null;
  function showGoto() {
    if (!gotoEl) { gotoEl = document.createElement('div'); gotoEl.id = 'goto'; document.body.appendChild(gotoEl); }
    gotoEl.textContent = gotoBuf + '_';
    clearTimeout(gotoT);
    gotoT = setTimeout(() => { gotoBuf = ''; gotoEl && gotoEl.remove(); gotoEl = null; }, 1800);
  }

  function onKey(e) {
    const a = document.activeElement;
    const typing = a && (a.tagName === 'TEXTAREA' || a.isContentEditable || (a.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button'].includes(a.type)) || a.tagName === 'SELECT');
    if (e.key === 'Escape') {
      if (typing || (a && a !== document.body && a.closest && a.closest('.frame'))) { a.blur(); e.preventDefault(); return; }
      if (closeOverlay()) return;
      if (H.toc.classList.contains('open')) { toggleToc(false); return; }
      if (blackout) { toggleBlackout(); return; }
      if (H.notes.classList.contains('open')) { toggleNotes(false); return; }
      if (Deck.free) { Deck.go(Deck.idx); return; }
      Deck.toggleOverview(); return;
    }
    if (typing) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { gotoBuf += k; showGoto(); return; }
    if (k === 'Enter' && gotoBuf) { const n = parseInt(gotoBuf, 10); gotoBuf = ''; gotoEl && gotoEl.remove(); gotoEl = null; if (n > 0) Deck.go(n - 1); e.preventDefault(); return; }
    const isRange = a && a.type === 'range';
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': if (isRange) return; // fallthrough
      case 'PageDown': case ' ': e.preventDefault(); if (blackout) toggleBlackout(); Deck.next(); break;
      case 'ArrowLeft': case 'ArrowUp': if (isRange) return; // fallthrough
      case 'PageUp': e.preventDefault(); if (blackout) toggleBlackout(); Deck.prev(); break;
      case 'Home': Deck.go(0); break;
      case 'End': Deck.go(Deck.frames.length - 1); break;
      case 'o': case 'O': Deck.toggleOverview(); break;
      case 'f': case 'F': if (document.fullscreenElement) document.exitFullscreen(); else (document.documentElement.requestFullscreen || (() => Promise.reject()))().catch(() => {}); break;
      case 'n': case 'N': toggleNotes(); break;
      case 't': case 'T': toggleTheme(); break;
      case 'b': case 'B': case '.': toggleBlackout(); break;
      case 'h': case 'H': case '?': toggleHelp(); break;
      case 'g': case 'G': toggleToc(); break;
      case 'm': case 'M': minimapPinned = !minimapPinned; Kit.store.set('minimap', minimapPinned); updateHUD(); break;
      case 's': case 'S': Deck.compact = !Deck.compact; Kit.store.set('compact', Deck.compact); updateHUD(); break;
      case 'p': case 'P': openPresenter(); break;
      default: return;
    }
  }

  function frameAt(x, y) {
    if (flight) return null; // frames take no pointer input mid-flight (the shield covers them)
    const els = document.elementsFromPoint(x, y);
    for (const el of els) { const fr = el.closest && el.closest('.frame'); if (fr && fr.__frame) return fr.__frame; }
    return null;
  }

  function bindInput() {
    addEventListener('keydown', onKey);
    addEventListener('resize', () => {
      vw = innerWidth; vh = innerHeight;
      insetB = TOUCH && H.tb ? H.tb.offsetHeight : 0;
      if (flight) {
        // the flight's reveal plan and target were made for the old size (a phone turned mid-flight):
        // show every frame for the rest of it (idle-hide trims afterwards) and re-fit when it lands
        for (const f of Deck.frames) if (f.el) setOff(f, false);
        flight.resized = true;
        return;
      }
      fitCam();
      applyCam();
    });
    addEventListener('hashchange', () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const f = Deck.byId[id] || Deck.frames[parseInt(id, 10) - 1];
      if (f && f.idx !== Deck.idx) Deck.go(f.idx);
    });
    // blur sliders/buttons after use so arrow keys go back to navigation
    document.addEventListener('change', (e) => { if (e.target.type === 'range') e.target.blur(); });
    document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('.frame button'); if (b) setTimeout(() => b.blur(), 0); });

    viewport.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && e.target.closest && e.target.closest('.demo, textarea, [data-scroll]')) return;
      e.preventDefault();
      const before = screenToWorld(e.clientX, e.clientY);
      const dz = e.ctrlKey ? e.deltaY * 0.01 : e.deltaY * 0.0016;
      const W = worldCam().w;
      cam.w = Math.max(160, Math.min(W * 2.5, cam.w * Math.exp(dz)));
      const after = screenToWorld(e.clientX, e.clientY);
      cam.x += before.x - after.x; cam.y += before.y - after.y;
      stopFlight();
      if (!Deck.free) { Deck.free = true; stopLoops(); updateHUD(); }
      handMotion();
      applyCam();
    }, { passive: false });

    let drag = null, pinch = null, lastTap = null, lastType = 'mouse';
    const touches = new Map();
    const enterFree = () => {
      stopFlight();
      if (!Deck.free) { Deck.free = true; stopLoops(); updateHUD(); }
    };
    const maxW = () => worldCam().w * 2.5;
    const pinchState = () => { const [a, b] = [...touches.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };
    viewport.addEventListener('pointerdown', (e) => {
      lastType = e.pointerType;
      if (e.pointerType === 'touch') {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (touches.size === 2) { // two fingers anywhere = zoom, even over a demo
          const p = pinchState();
          pinch = { d0: p.d, w0: cam.w, wp: screenToWorld(p.mx, p.my) };
          drag = null; lastTap = null; enterFree(); return;
        }
        if (touches.size > 2) return;
      }
      if (e.button !== 0) return;
      if (e.target.closest && e.target.closest(INTERACTIVE)) return;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, pan: false, type: e.pointerType, cx: cam.x, cy: cam.y };
    });
    addEventListener('pointermove', (e) => {
      if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && touches.size === 2) {
        const p = pinchState();
        cam.w = Math.max(160, Math.min(maxW(), (pinch.w0 * pinch.d0) / p.d));
        const now = screenToWorld(p.mx, p.my);
        cam.x += pinch.wp.x - now.x; cam.y += pinch.wp.y - now.y;
        handMotion(); applyCam(); return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 6) {
        drag.moved = true;
        // the mouse always pans; a finger pans only once you have zoomed in (otherwise it is a swipe)
        drag.pan = drag.type !== 'touch' || Deck.free || Deck.overview;
        if (drag.pan) { viewport.classList.add('panning'); enterFree(); drag.cx = cam.x; drag.cy = cam.y; drag.x = e.clientX; drag.y = e.clientY; }
      }
      if (drag.moved && drag.pan) {
        const k = vw / cam.w, a = (cam.r * Math.PI) / 180;
        const wx = (e.clientX - drag.x) / k, wy = (e.clientY - drag.y) / k;
        cam.x = drag.cx - (wx * Math.cos(a) - wy * Math.sin(a));
        cam.y = drag.cy - (wx * Math.sin(a) + wy * Math.cos(a));
        handMotion(); applyCam();
      }
    });
    const release = (e, cancelled) => {
      touches.delete(e.pointerId);
      if (pinch) { if (touches.size < 2) { pinch = null; drag = null; } return; }
      if (!drag) return;
      const d = drag; drag = null; viewport.classList.remove('panning');
      if (cancelled) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y, dt = performance.now() - d.t;
      if (d.moved) {
        if (d.type === 'touch' && !d.pan && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2 && dt < 800) { dx < 0 ? Deck.next() : Deck.prev(); }
        return;
      }
      const f = frameAt(e.clientX, e.clientY), cur = Deck.frames[Deck.idx];
      if (d.type === 'touch') {
        const now = performance.now();
        if (lastTap && now - lastTap.t < 330 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) {
          lastTap = null;
          if (Deck.free) { Deck.go(Deck.idx); return; } // double tap again: back to the whole frame
          if (Deck.overview) return;
          const before = screenToWorld(e.clientX, e.clientY);
          const target = { ...cam, w: Math.max(160, cam.w / 2.4) };
          const k2 = vw / target.w, a = (cam.r * Math.PI) / 180;
          const ddx = (e.clientX - vw / 2) / k2, ddy = (e.clientY - vhE() / 2) / k2;
          target.x = before.x - (ddx * Math.cos(a) - ddy * Math.sin(a));
          target.y = before.y - (ddx * Math.sin(a) + ddy * Math.cos(a));
          enterFree(); flyTo(target, { speed: 0.6 });
          return;
        }
        lastTap = { t: now, x: e.clientX, y: e.clientY };
        // a single tap only travels to another frame (or out of the map); zoomed-in reading stays put
        if (f && (f !== cur || Deck.overview)) Deck.go(f.idx);
        return;
      }
      if (f && (f !== cur || Deck.free || Deck.overview)) Deck.go(f.idx);
    };
    addEventListener('pointerup', (e) => release(e, false));
    addEventListener('pointercancel', (e) => release(e, true));
    viewport.addEventListener('dblclick', (e) => {
      if (lastType === 'touch') return;
      if (e.target.closest && e.target.closest(INTERACTIVE)) return;
      const f = frameAt(e.clientX, e.clientY); if (f) Deck.go(f.idx);
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => Kit._themeChanged());
  }

  /* ───────── start ───────── */
  Deck.start = function () {
    const saved = Kit.store.get('theme', null);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    viewport = document.getElementById('viewport');
    world = document.getElementById('world');
    shield = document.createElement('div'); shield.id = 'shield'; shield.hidden = true; viewport.appendChild(shield);
    gridEl = document.getElementById('grid');
    buildGrid();
    buildFrames();
    worldBox = Deck.Layout.compute(Deck.SECTIONS, Deck.frames);
    decor = Deck.Layout.decor(Deck.SECTIONS, Deck.frames, worldBox);
    world.appendChild(decor);
    buildDOM();
    document.body.classList.toggle('touch', TOUCH);
    buildHUD();
    insetB = TOUCH ? H.tb.offsetHeight : 0;
    bindInput();
    const id = decodeURIComponent(location.hash.slice(1));
    const start = Deck.byId[id] || Deck.frames[parseInt(id, 10) - 1] || Deck.frames[0];
    ensureInit(start);
    Object.assign(cam, worldCam());
    applyCam();
    Deck.go(start.idx, { instant: start.idx !== 0 });
    initAllIdle();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => Kit._themeChanged());
    window.__deckReady = true;
  };
})();
