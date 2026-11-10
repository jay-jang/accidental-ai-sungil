/* Kit — small helpers shared by every section's demos.
   Everything here is theme-aware and safe to call before the frame is visible. */
(function () {
  'use strict';

  const Kit = (window.Kit = {});

  /* ── math ── */
  Kit.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  Kit.lerp = (a, b, t) => a + (b - a) * t;
  Kit.ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  Kit.easeOut = (t) => 1 - Math.pow(1 - t, 3);
  Kit.sigmoid = (x) => 1 / (1 + Math.exp(-x));
  /** seeded PRNG (mulberry32) → () => [0,1) */
  Kit.rand = function (seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  /** gaussian from a PRNG */
  Kit.gauss = function (rnd) {
    let u = 0, v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* ── DOM ── */
  Kit.$ = (sel, root) => (root || document).querySelector(sel);
  Kit.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  Kit.el = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  const SVGNS = 'http://www.w3.org/2000/svg';
  Kit.svg = function (tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  Kit.escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** pointer position in an element's own CSS pixels (correct while the frame is on screen) */
  Kit.pt = function (evt, el) {
    const r = el.getBoundingClientRect();
    const w = el.offsetWidth || r.width, h = el.offsetHeight || r.height;
    const p = evt.touches ? evt.touches[0] : evt;
    return { x: ((p.clientX - r.left) / r.width) * w, y: ((p.clientY - r.top) / r.height) * h };
  };

  /** read the live colour tokens (use inside draw functions so theme switches apply) */
  Kit.colors = function () {
    const cs = getComputedStyle(document.documentElement);
    const g = (n) => cs.getPropertyValue('--' + n).trim();
    return {
      paper: g('paper'), paper2: g('paper-2'), paper3: g('paper-3'), ink: g('ink'), ink2: g('ink-2'), ink3: g('ink-3'),
      pen: g('pen'), penSoft: g('pen-soft'), hl: g('hl'), hlSoft: g('hl-soft'), good: g('good'), bad: g('bad'),
      grid: g('grid-line'), termBg: g('term-bg'), termFg: g('term-fg'), termDim: g('term-dim'), termHi: g('term-hi'),
      tension: g('rel-tension'), tech: g('rel-tech'), money: g('rel-money'),
      c: [g('c1'), g('c2'), g('c3'), g('c4'), g('c5')],
      fontBody: g('font-body'), fontMono: g('font-mono'), fontHand: g('font-hand'), fontDisplay: g('font-display'),
    };
  };
  const themeFns = new Set();
  /** call fn() whenever the theme changes (light/dark). Returns unsubscribe. */
  Kit.onTheme = function (fn) { themeFns.add(fn); return () => themeFns.delete(fn); };
  Kit._themeChanged = function () { themeFns.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); };

  /**
   * Create a crisp canvas of w×h CSS px inside `host` (element or selector within root).
   * Returns { cv, ctx, w, h } — ctx is already scaled so you draw in CSS px.
   */
  Kit.canvas = function (host, w, h) {
    const cv = document.createElement('canvas');
    const scale = Math.min(3, Math.max(2, (window.devicePixelRatio || 1) * 1.5));
    cv.width = Math.round(w * scale);
    cv.height = Math.round(h * scale);
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    host.appendChild(cv);
    return { cv, ctx, w, h, scale };
  };

  /** hand-drawn line on a 2D canvas (deterministic wobble) */
  Kit.sketchLine = function (ctx, x1, y1, x2, y2, opt) {
    opt = opt || {};
    const rnd = Kit.rand(opt.seed || Math.round(x1 * 7 + y1 * 13 + x2 * 17 + y2 * 3));
    const wob = opt.wobble == null ? 1.6 : opt.wobble;
    const passes = opt.passes || 1;
    for (let p = 0; p < passes; p++) {
      const mx = (x1 + x2) / 2 + (rnd() - 0.5) * wob * 3;
      const my = (y1 + y2) / 2 + (rnd() - 0.5) * wob * 3;
      ctx.beginPath();
      ctx.moveTo(x1 + (rnd() - 0.5) * wob, y1 + (rnd() - 0.5) * wob);
      ctx.quadraticCurveTo(mx, my, x2 + (rnd() - 0.5) * wob, y2 + (rnd() - 0.5) * wob);
      ctx.stroke();
    }
  };
  Kit.sketchRect = function (ctx, x, y, w, h, opt) {
    Kit.sketchLine(ctx, x, y, x + w, y, opt);
    Kit.sketchLine(ctx, x + w, y, x + w, y + h, opt);
    Kit.sketchLine(ctx, x + w, y + h, x, y + h, opt);
    Kit.sketchLine(ctx, x, y + h, x, y, opt);
  };
  /** SVG path "d" for a slightly wobbly line through points (Catmull-Rom → cubic) */
  Kit.sketchPath = function (pts, opt) {
    opt = opt || {};
    const rnd = Kit.rand(opt.seed || 7);
    const wob = opt.wobble || 0;
    const P = pts.map(([x, y]) => [x + (rnd() - 0.5) * wob, y + (rnd() - 0.5) * wob]);
    if (P.length < 2) return '';
    let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      const t = opt.tension == null ? 0.5 : opt.tension;
      const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * t * 2, p1[1] + ((p2[1] - p0[1]) / 6) * t * 2];
      const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * t * 2, p2[1] - ((p3[1] - p1[1]) / 6) * t * 2];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  };

  /**
   * Run fn(t, dt) every animation frame, but only while `frameEl` is the current slide.
   * (The engine starts/stops loops on enter/leave.) Returns a stop() function.
   */
  Kit.loop = function (frameEl, fn) {
    const f = frameEl.closest ? frameEl.closest('.frame') || frameEl : frameEl;
    (f.__loops || (f.__loops = [])).push(fn);
    return () => { f.__loops = (f.__loops || []).filter((x) => x !== fn); };
  };

  /** animate a number inside el from its current value to `to` */
  Kit.countTo = function (el, to, ms, fmt) {
    fmt = fmt || ((v) => Math.round(v).toLocaleString('ko-KR'));
    const from = parseFloat(el.dataset.v || '0');
    const t0 = performance.now();
    ms = ms || 900;
    function step(now) {
      const t = Kit.clamp((now - t0) / ms, 0, 1);
      const v = Kit.lerp(from, to, Kit.easeOut(t));
      el.textContent = fmt(v);
      if (t < 1) requestAnimationFrame(step); else el.dataset.v = String(to);
    }
    requestAnimationFrame(step);
  };

  /** type text into el character by character; returns a Promise */
  Kit.typewrite = function (el, text, cps) {
    cps = cps || 40;
    return new Promise((res) => {
      let i = 0;
      el.textContent = '';
      const iv = setInterval(() => {
        i++;
        el.textContent = text.slice(0, i);
        if (i >= text.length) { clearInterval(iv); res(); }
      }, 1000 / cps);
    });
  };
  Kit.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /** localStorage that never throws */
  Kit.store = {
    get(k, d) { try { const v = localStorage.getItem('aai:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('aai:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  /** image path helper: Kit.img('hinton') → 'assets/img/hinton.jpg' */
  Kit.img = (id) => 'assets/img/' + id + '.jpg';
  /** taped photo HTML: Kit.photo('hinton', '제프리 힌턴', 'tilt-r sm') */
  Kit.photo = function (id, caption, cls, extraStyle) {
    return `<figure class="photo ${cls || ''}" ${extraStyle ? `style="${extraStyle}"` : ''}><img src="${Kit.img(id)}" alt="${Kit.escape(caption || id)}" draggable="false"><figcaption>${caption || ''}</figcaption></figure>`;
  };
})();
