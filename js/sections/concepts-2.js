/* Concepts · part 2 — how a machine actually learns.
   neuron → xor-net → gradient → pixels → overfit (보충) → concepts-recap
   Every demo is plain JS on a <canvas>/<svg>, coloured only from theme tokens. */
(function () {
  'use strict';

  /* ───────── shared helpers ───────── */
  function rgb(s) {
    s = String(s || '').trim();
    if (s[0] === '#') {
      let h = s.slice(1);
      if (h.length === 3) h = h.replace(/./g, (c) => c + c);
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2]]; }
    return [128, 128, 128];
  }
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const rgba = (c, a) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a == null ? 1 : a})`;
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const MINUS = '−';
  const sgn = (v, d) => (v < -0.5 * Math.pow(10, -d) ? MINUS : '') + Math.abs(v).toFixed(d);
  const onFonts = (fn) => { try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(fn); } catch (e) { /* ignore */ } };
  // Same job as onFonts for a demo whose redraw is also its Kit.onTheme handler (the engine re-runs those once the
  // startup fonts are in). A canvas draw that needs a font face still loading flips document.fonts.status to
  // 'loading' synchronously, so when nothing is loading right after the init draw that draw is already final (a redraw
  // would be identical, and reading document.fonts.ready would force a style + layout pass). `isFinal()` skips the
  // redraw when the theme handler already redrew with no font load in flight.
  const fontsIdle = () => { try { return document.fonts.status !== 'loading'; } catch (e) { return false; } };
  const afterFonts = (fn, isFinal) => {
    try {
      if (!document.fonts || fontsIdle()) return; // status first: touching .ready is what forces the layout
      const r = document.fonts.ready;
      if (r) r.then(() => { if (!isFinal()) fn(); });
    } catch (e) { /* ignore */ }
  };
  // Chrome replaces the text node even when the new text is identical (style recalc + layout), so skip such writes.
  const setText = (n, s) => { s = String(s); if (n.textContent !== s) n.textContent = s; };
  function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function arrow(ctx, x1, y1, x2, y2, head) {
    head = head || 12;
    line(ctx, x1, y1, x2, y2);
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(a - 0.42), y2 - head * Math.sin(a - 0.42));
    ctx.lineTo(x2 - head * Math.cos(a + 0.42), y2 - head * Math.sin(a + 0.42));
    ctx.closePath();
    ctx.fill();
  }
  function dot(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }

  /* ═════════════ 1 · neuron ═════════════ */
  // 24 imaginary students: study hours vs sleep hours → pass (1) / fail (0). Seed chosen so a diagonal line is needed.
  const STUDY = (function () {
    const r = Kit.rand(137), P = [];
    for (let i = 0; i < 24; i++) {
      const s = Math.round((0.5 + r() * 7.2) * 10) / 10;
      const sl = Math.round((3.6 + r() * 5.8) * 10) / 10;
      const z = s + 0.5 * sl - 7.6 + Kit.gauss(r) * 0.55;
      P.push({ x: s, y: sl, t: z > 0 ? 1 : 0 });
    }
    return P;
  })();
  const gate = (rows) => rows.map(([x, y, t]) => ({ x, y, t }));
  const GATES = { and: gate([[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]]), or: gate([[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]]) };
  const NR_PRESET = { study: { w1: 0.3, w2: 1.0, b: -6.0 }, and: { w1: 1, w2: 1, b: -1.5 }, or: { w1: 1, w2: 1, b: -0.5 } };

  /* ═════════════ 2 · xor-net ═════════════ */
  function makeData(kind) {
    const r = Kit.rand(7), P = [];
    if (kind === 'xor') {
      for (let i = 0; i < 160; i++) {
        const cx = r() < 0.5 ? -1 : 1, cy = r() < 0.5 ? -1 : 1;
        P.push([cx * 0.5 + Kit.gauss(r) * 0.17, cy * 0.5 + Kit.gauss(r) * 0.17, cx * cy < 0 ? 1 : 0]);
      }
    } else if (kind === 'circle') {
      for (let i = 0; i < 200; i++) {
        const inner = i % 2 === 0, rad = inner ? r() * 0.38 : 0.6 + r() * 0.3, a = r() * Math.PI * 2;
        P.push([rad * Math.cos(a) + Kit.gauss(r) * 0.03, rad * Math.sin(a) + Kit.gauss(r) * 0.03, inner ? 1 : 0]);
      }
    } else {
      for (let i = 0; i < 200; i++) {
        const c = i % 2, t = Math.floor(i / 2) / 100, rad = 0.08 + t * 0.82, a = t * 3.2 * Math.PI + c * Math.PI;
        P.push([rad * Math.cos(a) + Kit.gauss(r) * 0.025, rad * Math.sin(a) + Kit.gauss(r) * 0.025, c]);
      }
    }
    return P;
  }
  /** 2-H-1 network: tanh hidden layer, sigmoid output, cross-entropy loss, backprop + Adam */
  function Net(H, seed) {
    const r = Kit.rand(seed);
    this.H = H;
    this.W1 = []; this.b1 = []; this.W2 = [];
    for (let j = 0; j < H; j++) { this.W1.push([Kit.gauss(r), Kit.gauss(r)]); this.b1.push(Kit.gauss(r) * 0.1); this.W2.push(Kit.gauss(r) * Math.sqrt(1 / H)); }
    this.b2 = 0;
    this.m = new Float64Array(4 * H + 1); this.v = new Float64Array(4 * H + 1);
    this.t = 0; this.epoch = 0;
  }
  Net.prototype.fwd = function (x, y, h) {
    let s = this.b2;
    for (let j = 0; j < this.H; j++) {
      const a = Math.tanh(this.W1[j][0] * x + this.W1[j][1] * y + this.b1[j]);
      if (h) h[j] = a;
      s += this.W2[j] * a;
    }
    return 1 / (1 + Math.exp(-s));
  };
  Net.prototype.step = function (P, lr) {
    const H = this.H, g = new Float64Array(4 * H + 1), h = new Float64Array(H);
    let L = 0;
    for (let n = 0; n < P.length; n++) {
      const x = P[n][0], y = P[n][1], t = P[n][2];
      const o = this.fwd(x, y, h);
      L -= t * Math.log(o + 1e-9) + (1 - t) * Math.log(1 - o + 1e-9);
      const d = o - t; // dLoss/dz at the output (sigmoid + cross-entropy)
      g[4 * H] += d;
      for (let j = 0; j < H; j++) {
        g[3 * H + j] += d * h[j];
        const dh = d * this.W2[j] * (1 - h[j] * h[j]); // back through tanh
        g[2 * j] += dh * x; g[2 * j + 1] += dh * y; g[2 * H + j] += dh;
      }
    }
    const N = P.length, b1 = 0.9, b2 = 0.999;
    this.t++;
    const c1 = 1 - Math.pow(b1, this.t), c2 = 1 - Math.pow(b2, this.t);
    const upd = (i, val) => {
      const gi = g[i] / N;
      this.m[i] = b1 * this.m[i] + (1 - b1) * gi;
      this.v[i] = b2 * this.v[i] + (1 - b2) * gi * gi;
      return val - (lr * (this.m[i] / c1)) / (Math.sqrt(this.v[i] / c2) + 1e-8);
    };
    for (let j = 0; j < H; j++) {
      this.W1[j][0] = upd(2 * j, this.W1[j][0]);
      this.W1[j][1] = upd(2 * j + 1, this.W1[j][1]);
      this.b1[j] = upd(2 * H + j, this.b1[j]);
      this.W2[j] = upd(3 * H + j, this.W2[j]);
    }
    this.b2 = upd(4 * H, this.b2);
    this.epoch++;
    return L / N;
  };
  Net.prototype.acc = function (P) {
    let c = 0;
    for (const p of P) if ((this.fwd(p[0], p[1]) >= 0.5 ? 1 : 0) === p[2]) c++;
    return c / P.length;
  };

  /* ═════════════ 3 · gradient ═════════════ */
  // a double valley: deep one on the left, a small puddle (local minimum) on the right
  const GDF = (u) => 0.35 * (u * u - 1) * (u * u - 1) + 0.2 * u + 0.3;
  const GDD = (u) => 1.4 * u * (u * u - 1) + 0.2;
  const LR = (v) => 0.01 * Math.pow(150, v / 100); // slider 0..100 → 0.01..1.5 (log scale)

  /* ═════════════ 5 · overfit ═════════════ */
  const OF_TRUE = (x) => 0.55 * Math.sin(2.6 * x + 0.3) + 0.25 * x;
  const OF = (function () {
    const r = Kit.rand(96), tr = [], te = [];
    for (let i = 0; i < 13; i++) { const x = -0.92 + (1.84 * (i + 0.5 + (r() - 0.5) * 0.7)) / 13; tr.push([x, OF_TRUE(x) + Kit.gauss(r) * 0.15]); }
    for (let i = 0; i < 14; i++) { const x = -0.92 + (1.84 * (i + 0.5 + (r() - 0.5) * 0.9)) / 14; te.push([x, OF_TRUE(x) + Kit.gauss(r) * 0.15]); }
    return { tr, te };
  })();
  // Legendre basis on x∈[-1,1] keeps the normal equations well-conditioned up to degree 15
  function legendre(x, d) {
    const p = [1, x];
    for (let k = 1; k < d; k++) p.push(((2 * k + 1) * x * p[k] - k * p[k - 1]) / (k + 1));
    return p.slice(0, d + 1);
  }
  function polyFit(P, d, lam) {
    const n = d + 1, A = [];
    for (let i = 0; i < n; i++) A.push(new Float64Array(n + 1));
    for (const [x, y] of P) {
      const b = legendre(x, d);
      for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += b[i] * b[j]; A[i][n] += b[i] * y; }
    }
    for (let i = 0; i < n; i++) A[i][i] += lam;
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      const tmp = A[c]; A[c] = A[piv]; A[piv] = tmp;
      for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    const w = new Float64Array(n);
    for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let k = i + 1; k < n; k++) s -= A[i][k] * w[k]; w[i] = s / A[i][i]; }
    return w;
  }
  const polyEval = (w, x) => { const b = legendre(x, w.length - 1); let s = 0; for (let i = 0; i < w.length; i++) s += w[i] * b[i]; return s; };
  const rmse = (w, P) => Math.sqrt(P.reduce((s, [x, y]) => s + (polyEval(w, x) - y) ** 2, 0) / P.length);

  Deck.part('concepts', 2, [
    /* ───────────────────────── 1. neuron ───────────────────────── */
    {
      id: 'neuron',
      title: '인공 뉴런: 곱하고, 더하고, 정하기',
      minutes: 1.5,
      notes: '인공 뉴런은 생각보다 단순합니다. 입력마다 가중치를 곱하고, 모두 더한 뒤 편향 b를 더해서, 0보다 크면 1, 아니면 0. 1957년 로젠블랫의 퍼셉트론이 바로 이 구조입니다.\n[실습] 지금 선은 ‘수면’을 너무 중요하게 봐서 정확도가 75%입니다. w₁(공부)을 올리고 w₂(수면)를 내려 보세요. 정답 예: w₁ 0.90, w₂ 0.50, b −6.9이면 24명 모두 맞힘(100%). 손으로 맞추기 꽤 어렵죠? 그래서 컴퓨터가 스스로 맞추는 방법(뒤에 나올 경사하강법)이 필요합니다. 오른쪽 점을 클릭하면 그 학생의 계산이 왼쪽 그림에 그대로 나옵니다. (AND·OR 프리셋은 여기서 건너뜁니다. 논리 회로 시연은 역사 정류장 1943에서.)\n질문: “가중치가 음수면 무슨 뜻일까? 예를 들어 입력이 ‘게임 시간’이라면?”',
      html: `
<style>
#f-neuron .nr{display:grid;grid-template-columns:820px 1fr;gap:56px;height:100%}
#f-neuron .nr-l{display:flex;flex-direction:column;gap:20px;min-width:0}
#f-neuron .nr-r{display:flex;flex-direction:column;gap:6px;min-width:0}
#f-neuron .nr-dia{display:block;overflow:visible;margin:10px 0 4px}
#f-neuron .nr-dia .nd{fill:var(--paper);stroke:var(--ink);stroke-width:3}
#f-neuron .nr-dia .nd.on{fill:var(--hl-soft)}
#f-neuron .nr-dia .ed{fill:none;stroke:var(--ink);stroke-linecap:round}
#f-neuron .nr-dia .ah{fill:var(--ink)}
#f-neuron .nr-dia .ax{stroke:var(--ink-3);stroke-width:2;fill:none}
#f-neuron .nr-dia .stp{fill:none;stroke:var(--pen);stroke-width:4.5;stroke-linejoin:round;stroke-linecap:round}
#f-neuron .nr-dia text{fill:var(--ink);font-family:var(--font-mono);text-anchor:middle}
#f-neuron .nr-dia .lb{font-family:var(--font-body);font-size:21px;fill:var(--ink-2)}
#f-neuron .nr-dia .v{font-size:30px;font-weight:600}
#f-neuron .nr-dia .w{font-size:25px;font-weight:600;fill:var(--pen);paint-order:stroke;stroke:var(--paper);stroke-width:9px;stroke-linejoin:round}
#f-neuron .nr-dia .sig{font-family:var(--font-display);font-size:50px;font-weight:800}
#f-neuron .nr-dia .z{font-size:24px;font-weight:600}
#f-neuron .nr-dia .o{font-size:50px;font-weight:600}
#f-neuron .nr-dia .ol{font-family:var(--font-body);font-size:26px;font-weight:700}
#f-neuron .nr-dia .ol.good{fill:var(--good)} #f-neuron .nr-dia .ol.bad{fill:var(--bad)}
#f-neuron .nr-dia .hd{font-family:var(--font-hand);font-size:38px;fill:var(--pen)}
#f-neuron .nr-f{padding:4px 0 6px 16px;border-left:4px solid var(--hl);display:flex;flex-direction:column;gap:2px}
#f-neuron .nr-f1{font-size:22px;color:var(--ink-2);display:flex;gap:10px;white-space:nowrap}
#f-neuron .nr-f1 .who{color:var(--ink);font-weight:600}
#f-neuron .nr-f1 .ok{font-weight:700}
#f-neuron .nr-f2{font-family:var(--font-mono);font-size:26px;line-height:1.3;white-space:nowrap}
#f-neuron .nr-sl{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
#f-neuron .nr-pre{align-items:center}
#f-neuron .nr-acc{display:flex;align-items:baseline;gap:16px}
#f-neuron .nr-acc b{font-family:var(--font-mono);font-size:76px;font-weight:600;line-height:1;letter-spacing:-0.03em}
#f-neuron .nr-plot canvas{cursor:crosshair;touch-action:none;user-select:none}
#f-neuron .nr-leg{display:flex;gap:20px;align-items:center;font-size:21px;color:var(--ink-2);white-space:nowrap}
#f-neuron .nr-leg i{display:inline-block;width:18px;height:18px;border-radius:50%;border:3px solid var(--ink);vertical-align:-2px;margin-right:6px}
#f-neuron .nr-leg i.f{background:var(--ink)} #f-neuron .nr-leg i.x{border:3px dashed var(--bad);width:22px;height:22px;vertical-align:-4px}
</style>
<div class="nr">
  <div class="nr-l">
    <div class="kicker">퍼셉트론 · 1957–58 · 프랭크 로젠블랫</div>
    <h2 class="title">인공 뉴런 하나</h2>
    <svg class="nr-dia" viewBox="0 0 820 300" width="820" height="300" aria-label="퍼셉트론 도식">
      <defs><marker id="nr-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker></defs>
      <path class="ed nr-e1" d="M122,80 L350,137" marker-end="url(#nr-ah)"/>
      <path class="ed nr-e2" d="M122,226 L350,171" marker-end="url(#nr-ah)"/>
      <path class="ed" stroke-width="3" d="M420,10 L420,80" marker-end="url(#nr-ah)"/>
      <path class="ed" stroke-width="3" d="M486,154 L534,154" marker-end="url(#nr-ah)"/>
      <path class="ed" stroke-width="3" d="M660,154 L696,154" marker-end="url(#nr-ah)"/>
      <circle class="nd" cx="66" cy="72" r="56"/>
      <text class="lb nr-l1" x="66" y="56">공부</text>
      <text class="v nr-x1" x="66" y="98">0</text>
      <circle class="nd" cx="66" cy="234" r="56"/>
      <text class="lb nr-l2" x="66" y="218">수면</text>
      <text class="v nr-x2" x="66" y="260">0</text>
      <text class="w nr-tw1" x="236" y="92">× 0</text>
      <text class="w nr-tw2" x="236" y="238">× 0</text>
      <text class="hd" x="232" y="166">① 곱하고</text>
      <text class="w nr-tb" x="440" y="40" style="text-anchor:start">+ b 0</text>
      <circle class="nd" cx="420" cy="154" r="66"/>
      <text class="sig" x="420" y="150">Σ</text>
      <text class="z nr-z" x="420" y="190">0</text>
      <rect class="nd" x="540" y="104" width="120" height="100" rx="6"/>
      <path class="ax" d="M552,178 H648 M600,114 V194"/>
      <path class="stp" d="M554,178 H600 V124 H646"/>
      <text class="lb" x="600" y="232">0보다 크면 1</text>
      <circle class="nd nr-on" cx="752" cy="154" r="50"/>
      <text class="o nr-o" x="752" y="172">0</text>
      <text class="ol nr-ol" x="752" y="236">합격</text>
      <text class="hd" x="420" y="286">② 더하고</text>
      <text class="hd" x="600" y="286">③ 정한다</text>
    </svg>
    <div class="nr-f"></div>
    <div class="demo nr-sl">
      <div class="field"><label><span class="nr-lw1">w₁ · 공부</span><output class="nr-ow1"></output></label><input type="range" class="nr-w1" min="-2" max="2" step="0.05" aria-label="w1"></div>
      <div class="field"><label><span class="nr-lw2">w₂ · 수면</span><output class="nr-ow2"></output></label><input type="range" class="nr-w2" min="-2" max="2" step="0.05" aria-label="w2"></div>
      <div class="field"><label><span>b · 편향</span><output class="nr-ob"></output></label><input type="range" class="nr-b" min="-12" max="4" step="0.1" aria-label="b"></div>
    </div>
    <div class="demo btns nr-pre"><span class="mono tiny muted" style="margin-right:4px">프리셋</span><button class="btn on" data-m="study">합격 예측</button><button class="btn" data-m="and">AND</button><button class="btn" data-m="or">OR</button></div>
  </div>
  <div class="nr-r demo">
    <div class="nr-acc"><span class="small muted">정확도</span><b class="nr-pct">0%</b><span class="mono small muted nr-cnt"></span></div>
    <div class="nr-plot"></div>
    <div class="nr-leg"><span><i class="f"></i><span class="nr-g1">합격</span></span><span><i></i><span class="nr-g0">불합격</span></span><span><i class="x"></i>틀린 예측</span><span class="hand" style="font-size:34px;margin-left:auto">점을 클릭!</span></div>
  </div>
</div>
<div class="src">출처: F. Rosenblatt, “The Perceptron” (코넬 항공연구소 보고서, 1957; Psychological Review, 1958) · 학생 점 24개는 설명용 가상 데이터</div>`,
      init(el, K) {
        const $ = (s) => el.querySelector(s);
        const S = { mode: 'study', w1: 0.3, w2: 1.0, b: -6.0, sel: 0, hov: -1 };
        const PW = 540, PH = 584, M = { l: 66, r: 12, t: 12, b: 64 };
        const cv = K.canvas($('.nr-plot'), PW, PH);
        const sl = { w1: $('.nr-w1'), w2: $('.nr-w2'), b: $('.nr-b') };
        const pts = () => (S.mode === 'study' ? STUDY : GATES[S.mode]);
        const range = () => (S.mode === 'study' ? { x0: 0, x1: 8, y0: 3, y1: 10 } : { x0: -0.35, x1: 1.35, y0: -0.35, y1: 1.35 });
        const zOf = (p) => S.w1 * p.x + S.w2 * p.y + S.b;
        const pred = (p) => (zOf(p) > 0 ? 1 : 0); // "0보다 크면 1"
        const g = (q) => S.w1 * q[0] + S.w2 * q[1] + S.b;
        function geom() {
          const R = range();
          return {
            R,
            X: (v) => M.l + ((v - R.x0) / (R.x1 - R.x0)) * (PW - M.l - M.r),
            Y: (v) => PH - M.b - ((v - R.y0) / (R.y1 - R.y0)) * (PH - M.t - M.b),
          };
        }
        // keep the part of the plot rectangle where the neuron says 1; also return the boundary segment
        function cut(R) {
          const poly = [[R.x0, R.y0], [R.x1, R.y0], [R.x1, R.y1], [R.x0, R.y1]], out = [], seg = [];
          for (let i = 0; i < 4; i++) {
            const a = poly[i], b = poly[(i + 1) % 4], ga = g(a), gb = g(b);
            if (ga >= 0) out.push(a);
            if ((ga >= 0) !== (gb >= 0)) {
              const t = ga / (ga - gb), q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
              out.push(q); seg.push(q);
            }
          }
          return { out, seg };
        }
        function draw() {
          const C = Kit.colors(), ctx = cv.ctx, { R, X, Y } = geom();
          ctx.clearRect(0, 0, PW, PH);
          const study = S.mode === 'study';
          const tx = study ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 1], ty = study ? [3, 4, 5, 6, 7, 8, 9, 10] : [0, 1];
          ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5;
          tx.forEach((v) => line(ctx, X(v), Y(R.y0), X(v), Y(R.y1)));
          ty.forEach((v) => line(ctx, X(R.x0), Y(v), X(R.x1), Y(v)));
          const { out, seg } = cut(R);
          if (out.length > 2) {
            ctx.fillStyle = C.penSoft;
            ctx.beginPath();
            out.forEach((q, i) => (i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1]))));
            ctx.closePath(); ctx.fill();
          }
          // axes + ticks
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
          line(ctx, X(R.x0), Y(R.y0), X(R.x1), Y(R.y0));
          line(ctx, X(R.x0), Y(R.y0), X(R.x0), Y(R.y1));
          ctx.fillStyle = C.ink2; ctx.font = `20px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          tx.forEach((v) => { if (!study || v % 2 === 0) ctx.fillText(String(v), X(v), Y(R.y0) + 8); });
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ty.forEach((v) => { if (!study || v % 2 === 0) ctx.fillText(String(v), X(R.x0) - 10, Y(v)); });
          ctx.font = `21px ${C.fontBody}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(study ? '공부 시간 (시간)' : 'x₁', (X(R.x0) + X(R.x1)) / 2, PH - 6);
          ctx.save(); ctx.translate(18, (Y(R.y0) + Y(R.y1)) / 2); ctx.rotate(-Math.PI / 2);
          ctx.textBaseline = 'middle'; ctx.fillText(study ? '수면 시간 (시간)' : 'x₂', 0, 0); ctx.restore();
          const P = pts(), rr = study ? 10 : 17, foc = S.hov >= 0 ? S.hov : S.sel;
          // decision line + arrow toward the "1" side; the label goes where it covers no point
          if (seg.length === 2) {
            const ax = X(seg[0][0]), ay = Y(seg[0][1]), bx = X(seg[1][0]), by = Y(seg[1][1]);
            ctx.strokeStyle = C.ink; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
            Kit.sketchLine(ctx, ax, ay, bx, by, { wobble: 1.4, seed: 5 });
            const sx = (PW - M.l - M.r) / (R.x1 - R.x0), sy = (PH - M.t - M.b) / (R.y1 - R.y0);
            // unit normal of the line on screen, pointing to the "1" side
            let nx = S.w1 / sx, ny = -S.w2 / sy; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
            ctx.font = `34px ${C.fontHand}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const LBL = '출력 1 쪽', lw = ctx.measureText(LBL).width + 8, lh = 36;
            const boxGap = (px, py, hw, hh, cx, cy) => Math.hypot(Math.max(0, Math.abs(px - cx) - hw), Math.max(0, Math.abs(py - cy) - hh));
            const ext = Math.abs(nx) * lw / 2 + Math.abs(ny) * lh / 2; // label half-size along the arrow
            // the whole label box must sit on side s of the line, ≥ 6px away from it
            const offLine = (cx, cy, s) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].every(([u, v]) => s * ((cx + u * lw / 2 - ax) * nx + (cy + v * lh / 2 - ay) * ny) > 6);
            const inPlot = (x, y) => x > M.l + 2 && x < PW - M.r - 2 && y > M.t + 2 && y < PH - M.b - 2;
            // preferred: label on the "1" side, arrow from the line toward it.
            // when that side is too small to hold it: label on the "0" side, arrow crossing the line into the "1" side.
            let best = null;
            // (m slides the label sideways, parallel to the line: it never moves closer to the line or onto the arrow)
            for (const s of [1, -1]) for (const t of [0.5, 0.38, 0.62, 0.26, 0.74, 0.14, 0.86]) for (const d of [58, 80, 104, 130, 156, 184, 214]) for (const m of [0, 30, -30, 60, -60, 95, -95]) {
              if (d - ext - 6 < (s > 0 ? 30 : 24)) continue;
              const ox = ax + (bx - ax) * t, oy = ay + (by - ay) * t, cx = ox + s * nx * d - ny * m, cy = oy + s * ny * d + nx * m;
              if (cx - lw / 2 < M.l + 4 || cx + lw / 2 > PW - M.r - 4 || cy - lh / 2 < M.t + 2 || cy + lh / 2 > PH - M.b - 4) continue;
              if (!offLine(cx, cy, s) || (s < 0 && !inPlot(ox + nx * 18, oy + ny * 18))) continue;
              let clear = 60;
              P.forEach((p) => {
                const px = X(p.x), py = Y(p.y);
                clear = Math.min(clear, boxGap(px, py, lw / 2, lh / 2, cx, cy) - rr - 11); // clear of the dashed "wrong" ring and the yellow focus ring
                if (!study) clear = Math.min(clear, boxGap(px, py + rr + 24, lw / 2 + 42, lh / 2 + 12, cx, cy));
              });
              const score = (clear > 0 ? 100 : 0) + Math.min(clear, 24) - Math.abs(t - 0.5) * 16 - (d - 58) * 0.06 - Math.abs(m) * 0.1 - (s < 0 ? 30 : 0);
              if (!best || score > best.score) best = { score, s, ox, oy, cx, cy, d };
            }
            if (best) {
              ctx.strokeStyle = C.pen; ctx.fillStyle = C.pen; ctx.lineWidth = 3;
              if (best.s > 0) { const al = Kit.clamp(best.d - ext - 6, 26, 46); arrow(ctx, best.ox, best.oy, best.ox + nx * al, best.oy + ny * al, 12); }
              else { const back = Math.min(best.d - ext - 6, 46); arrow(ctx, best.ox - nx * back, best.oy - ny * back, best.ox + nx * 18, best.oy + ny * 18, 12); }
              ctx.fillText(LBL, best.cx, best.cy);
            }
          }
          // points
          P.forEach((p, i) => {
            const x = X(p.x), y = Y(p.y);
            if (i === foc) { ctx.fillStyle = C.hl; dot(ctx, x, y, rr + 10); ctx.fill(); }
          });
          P.forEach((p) => {
            const x = X(p.x), y = Y(p.y);
            dot(ctx, x, y, rr);
            if (p.t) { ctx.fillStyle = C.ink; ctx.fill(); } else { ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); }
            if (pred(p) !== p.t) {
              ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.bad; ctx.lineWidth = 3;
              dot(ctx, x, y, rr + 7); ctx.stroke(); ctx.restore();
            }
            if (!study) {
              // paper halo so the decision line never cuts through a coordinate label
              ctx.font = `600 21px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
              ctx.strokeStyle = C.paper; ctx.lineWidth = 6; ctx.lineJoin = 'round';
              ctx.strokeText(`(${p.x},${p.y})`, x, y + rr + 12);
              ctx.fillStyle = C.ink2; ctx.fillText(`(${p.x},${p.y})`, x, y + rr + 12);
            }
          });
        }
        let fHtml = null; // last markup written to .nr-f (only sync() writes it)
        const setAttr = (n, k, v) => { if (n.getAttribute(k) !== v) n.setAttribute(k, v); };
        function sync() {
          const study = S.mode === 'study', P = pts();
          setText($('.nr-ow1'), sgn(S.w1, 2));
          setText($('.nr-ow2'), sgn(S.w2, 2));
          setText($('.nr-ob'), sgn(S.b, 1));
          let c = 0; P.forEach((p) => { if (pred(p) === p.t) c++; });
          setText($('.nr-pct'), Math.round((100 * c) / P.length) + '%');
          setText($('.nr-cnt'), `${c} / ${P.length} 맞음`);
          const i = S.hov >= 0 ? S.hov : S.sel, p = P[i] || P[0], z = zOf(p), o = pred(p);
          const fx = (v) => (study ? v.toFixed(1) : String(v));
          setText($('.nr-l1'), study ? '공부' : 'x₁');
          setText($('.nr-l2'), study ? '수면' : 'x₂');
          setText($('.nr-x1'), fx(p.x));
          setText($('.nr-x2'), fx(p.y));
          setText($('.nr-tw1'), '× ' + sgn(S.w1, 2));
          setText($('.nr-tw2'), '× ' + sgn(S.w2, 2));
          setText($('.nr-tb'), (S.b < 0 ? '+ b (' + sgn(S.b, 1) + ')' : '+ b (' + S.b.toFixed(1) + ')'));
          // the sum must fit inside the Σ circle: "= −46.20" is wider than the chord at 24px, so shrink it (never below 20px)
          const zt = $('.nr-z'), zs = '= ' + sgn(z, 2);
          zt.textContent = zs; zt.style.fontSize = ''; // always a fresh text node: the width below is measured anew
          let zw = 0;
          try { zw = zt.getComputedTextLength(); } catch (e) { /* not laid out yet */ }
          if (!(zw > 0)) zw = zs.length * 0.6 * 24;
          if (zw > 100) zt.style.fontSize = Math.max(20, Math.floor((2400 / zw) * 10) / 10) + 'px';
          setText($('.nr-o'), String(o));
          $('.nr-on').classList.toggle('on', o === 1);
          const ol = $('.nr-ol');
          setText(ol, study ? (o ? '합격' : '불합격') : S.mode.toUpperCase());
          setAttr(ol, 'class', 'ol nr-ol ' + (o === p.t ? 'good' : 'bad'));
          [['.nr-e1', S.w1], ['.nr-e2', S.w2]].forEach(([s, w]) => {
            const e = $(s);
            setAttr(e, 'stroke-width', (2 + 2.6 * Math.abs(w)).toFixed(1));
            setAttr(e, 'stroke-dasharray', w < 0 ? '10 7' : 'none');
          });
          const who = study ? `학생 ${i + 1}` : `(${p.x}, ${p.y})`;
          const lab = study ? (o ? '합격' : '불합격') : String(o);
          const truth = study ? (p.t ? '합격' : '불합격') : String(p.t);
          const w2s = S.w2 < -0.005 ? `(${sgn(S.w2, 2)})` : sgn(S.w2, 2);
          const fh = `<div class="nr-f1"><span class="who">${who}</span><span>·</span><span>정답 ${truth}</span><span>·</span>` +
            `<span class="ok ${o === p.t ? 'good' : 'bad'}">${o === p.t ? '예측 맞음' : '예측 틀림'}</span></div>` +
            `<div class="nr-f2">${sgn(S.w1, 2)}×${fx(p.x)} + ${w2s}×${fx(p.y)} ${S.b < 0 ? MINUS : '+'} ${Math.abs(S.b).toFixed(1)} = <b>${sgn(z, 2)}</b> → <b>${lab}</b></div>`;
          if (fh !== fHtml) { $('.nr-f').innerHTML = fh; fHtml = fh; }
          setText($('.nr-lw1'), study ? 'w₁ · 공부' : 'w₁');
          setText($('.nr-lw2'), study ? 'w₂ · 수면' : 'w₂');
          setText($('.nr-g1'), study ? '합격' : '정답 1');
          setText($('.nr-g0'), study ? '불합격' : '정답 0');
          draw();
        }
        function setMode(m) {
          S.mode = m;
          Object.assign(S, NR_PRESET[m]);
          sl.w1.value = S.w1; sl.w2.value = S.w2; sl.b.value = S.b;
          const P = pts();
          S.hov = -1;
          S.sel = m === 'study' ? Math.max(0, P.findIndex((p) => pred(p) !== p.t)) : 3;
          el.querySelectorAll('.nr-pre .btn').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
          sync();
        }
        ['w1', 'w2', 'b'].forEach((k) => sl[k].addEventListener('input', () => { S[k] = +sl[k].value; sync(); }));
        el.querySelector('.nr-pre').addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (b) setMode(b.dataset.m); });
        function hit(e) {
          const q = Kit.pt(e, cv.cv), { X, Y } = geom();
          let best = -1, bd = 26;
          pts().forEach((p, i) => { const d = Math.hypot(X(p.x) - q.x, Y(p.y) - q.y); if (d < bd) { bd = d; best = i; } });
          return best;
        }
        cv.cv.addEventListener('pointermove', (e) => {
          const i = hit(e);
          cv.cv.style.cursor = i >= 0 ? 'pointer' : 'crosshair';
          if (i !== S.hov) { S.hov = i; sync(); }
        });
        cv.cv.addEventListener('pointerleave', () => { if (S.hov !== -1) { S.hov = -1; sync(); } });
        cv.cv.addEventListener('pointerdown', (e) => { const i = hit(e); if (i >= 0) { S.sel = i; sync(); } });
        setMode('study');
        K.onTheme(draw);
        onFonts(sync);
      },
    },

    /* ───────────────────────── 2. xor-net ───────────────────────── */
    {
      id: 'xor-net',
      title: '뉴런을 겹치면 휘어진 경계도 배운다',
      minutes: 1.5,
      notes: '직선 하나로는 못 나누는 모양(XOR·동심원·나선)도, 뉴런을 한 층 더 넣고(은닉층 = 숨은 층) 틀린 만큼 거꾸로 거슬러 가며 가중치를 고치면(역전파) 휘어진 경계로 풀립니다. 이 벽 때문에 신경망 연구가 한동안 얼어붙은 이야기는 뒤의 역사 정류장(1969·1986)에서 합니다.\n[실습] 지금 그림은 이미 300번 학습한 상태입니다. [초기화] → [학습 시작]을 누르면 경계가 휘면서 자리 잡습니다. ‘나선’을 고르고 은닉 뉴런을 2개 → 16개로 바꿔 비교해 보세요. 오른쪽 그림의 작은 네모는 뉴런 하나하나가 보는 그림이고, 선이 굵을수록 가중치가 큽니다.\n질문: “뉴런이 2개일 때는 왜 나선을 못 풀까? 직선 몇 개가 필요해 보여?”',
      html: `
<style>
#f-xor-net .xn{display:grid;grid-template-columns:540px 1fr;gap:48px;flex:1;min-height:0}
#f-xor-net .xn-heat canvas{border:3px solid var(--ink);display:block}
#f-xor-net .xn-hcap{display:flex;gap:18px;align-items:center;margin-top:10px;font-size:21px;color:var(--ink-2);white-space:nowrap}
#f-xor-net .xn-hcap i{display:inline-block;width:16px;height:16px;border-radius:50%;vertical-align:-1px;margin-right:6px;border:2.5px solid var(--ink);background:var(--paper)}
#f-xor-net .xn-hcap i.p{background:var(--pen);border-color:var(--pen)}
#f-xor-net .xn-hcap s{text-decoration:none;display:inline-block;width:30px;height:18px;vertical-align:-3px;margin-right:6px;background:var(--pen-soft);border:2px solid var(--ink-3)}
#f-xor-net .xn-r{display:flex;flex-direction:column;gap:16px;min-width:0}
#f-xor-net .xn-bar{display:flex;align-items:center;gap:14px}
#f-xor-net .xn-bar .chip{font-size:24px;padding:8px 18px}
#f-xor-net .xn-mid{display:grid;grid-template-columns:578px 1fr;gap:22px}
#f-xor-net .xn-st{display:flex;flex-direction:column;gap:14px}
#f-xor-net .xn-st .stat b{font-size:46px}
#f-xor-net .xn-st .stat span{font-size:20px}
#f-xor-net .xn-leg{display:flex;align-items:center;gap:22px;font-size:21px;color:var(--ink-2)}
#f-xor-net .xn-leg i{display:inline-block;width:34px;height:0;border-top:6px solid var(--pen);vertical-align:middle;margin-right:8px}
#f-xor-net .xn-leg i.n{border-top-color:var(--bad);border-top-width:3px}
</style>
<div class="kicker">1969 → 1986 · 은닉층(숨은 층)과 역전파</div>
<h2 class="title">뉴런을 겹치면, 휘어진 경계도 배운다</h2>
<div class="xn demo">
  <div><div class="xn-heat"></div>
    <div class="xn-hcap"><span><i class="p"></i>정답 1</span><span><i></i>정답 0</span><span><s></s>신경망이 ‘1’이라고 답하는 곳</span></div></div>
  <div class="xn-r">
    <div class="xn-bar"><span class="mono tiny muted">데이터</span><button class="chip on" data-k="xor">XOR</button><button class="chip" data-k="circle">동심원</button><button class="chip" data-k="spiral">나선</button>
      <span style="flex:1"></span><button class="btn xn-run">학습 시작</button><button class="btn ghost xn-reset">초기화</button></div>
    <div class="xn-bar"><div class="field" style="width:420px"><label>은닉(숨은) 뉴런 수 <output class="xn-ho">6</output></label><input type="range" class="xn-h" min="2" max="16" step="1" value="6" aria-label="은닉(숨은) 뉴런 수"></div>
      <div class="hand" style="font-size:38px;margin-left:18px;word-break:keep-all">직선 하나로는 못 나누는 모양</div></div>
    <div class="xn-mid">
      <div class="xn-net"></div>
      <div class="xn-st">
        <div class="stat"><span>에폭 (전체 복습 횟수)</span><b class="num xn-ep">0</b></div>
        <div class="stat"><span>손실 (틀린 정도)</span><b class="num xn-loss">0</b></div>
        <div class="xn-spark"></div>
        <div class="stat"><span>정확도</span><b class="num xn-acc">0%</b></div>
      </div>
    </div>
    <div class="xn-leg"><span><i></i>+ 가중치</span><span><i class="n"></i>− 가중치</span><span>선 굵기 = 가중치 크기</span></div>
  </div>
</div>
<div class="src">출처: M. Minsky &amp; S. Papert, 『Perceptrons』 (1969) · D. Rumelhart, G. Hinton &amp; R. Williams, Nature 323 (1986) · 데모: 2-H-1 신경망, 역전파, 순수 JS</div>`,
      init(el, K) {
        const $ = (s) => el.querySelector(s);
        const HS = 540, D = 1.15, G = 90, NW = 578, NH = 384, SPW = 230, SPH = 70, LRATE = 0.03;
        const heat = K.canvas($('.xn-heat'), HS - 6, HS - 6);
        const netc = K.canvas($('.xn-net'), NW, NH);
        const spark = K.canvas($('.xn-spark'), SPW, SPH);
        const HW = HS - 6;
        const off = document.createElement('canvas'); off.width = off.height = G + 1;
        const octx = off.getContext('2d');
        const TN = 22, toff = document.createElement('canvas'); toff.width = toff.height = TN;
        const tctx = toff.getContext('2d');
        const S = { kind: 'xor', H: 6, seed: 11, run: false, hist: [] };
        let P = makeData('xor'), N = new Net(S.H, S.seed), V = new Float32Array((G + 1) * (G + 1));
        for (let i = 0; i < 300; i++) S.hist.push(N.step(P, LRATE));

        const px = (x) => ((x + D) / (2 * D)) * HW, py = (y) => ((D - y) / (2 * D)) * HW;
        // training redraws every frame: pixel buffers and the contour scratch are allocated once, and the theme
        // colours are read once per redraw in all() (every pixel and channel is rewritten each time)
        const himg = octx.createImageData(G + 1, G + 1), timg = tctx.createImageData(TN, TN);
        const cs = HW / G, Q = new Float64Array(8);
        let qn = 0;
        const edge = (v1, v2, x1, y1, x2, y2) => { if ((v1 >= 0.5) !== (v2 >= 0.5)) { const t = (0.5 - v1) / (v2 - v1); Q[qn++] = (x1 + (x2 - x1) * t) * cs; Q[qn++] = (y1 + (y2 - y1) * t) * cs; } };
        function drawHeat(C, paper, pen, ink) {
          const ctx = heat.ctx, d = himg.data;
          for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) {
            const x = -D + (2 * D * i) / G, y = D - (2 * D * j) / G, p = N.fwd(x, y), k = j * (G + 1) + i;
            V[k] = p;
            let q, t; // same arithmetic as mix(paper, q, t)
            if (p >= 0.5) { q = pen; t = (p - 0.5) * 2 * 0.45; } else { q = ink; t = (0.5 - p) * 2 * 0.2; }
            d[4 * k] = paper[0] + (q[0] - paper[0]) * t; d[4 * k + 1] = paper[1] + (q[1] - paper[1]) * t; d[4 * k + 2] = paper[2] + (q[2] - paper[2]) * t; d[4 * k + 3] = 255;
          }
          octx.putImageData(himg, 0, 0);
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(off, 0, 0, HW, HW);
          // 0.5 contour (marching squares): crossings in the order top, right, bottom, left, joined in pairs
          ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
          ctx.beginPath();
          for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
            const a = V[j * (G + 1) + i], b = V[j * (G + 1) + i + 1], c = V[(j + 1) * (G + 1) + i + 1], e = V[(j + 1) * (G + 1) + i];
            qn = 0;
            edge(a, b, i, j, i + 1, j); edge(b, c, i + 1, j, i + 1, j + 1); edge(e, c, i, j + 1, i + 1, j + 1); edge(a, e, i, j, i, j + 1);
            for (let k = 0; k + 3 < qn; k += 4) { ctx.moveTo(Q[k], Q[k + 1]); ctx.lineTo(Q[k + 2], Q[k + 3]); }
          }
          ctx.stroke();
          for (const p of P) {
            dot(ctx, px(p[0]), py(p[1]), 6.5);
            if (p[2]) { ctx.fillStyle = C.pen; ctx.fill(); ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.stroke(); } else { ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke(); }
          }
        }
        function thumb(j, paper, pen, ink) {
          const d = timg.data, w = N.W1[j], b = N.b1[j];
          for (let y = 0; y < TN; y++) for (let x = 0; x < TN; x++) {
            const a = Math.tanh(w[0] * (-D + (2 * D * (x + 0.5)) / TN) + w[1] * (D - (2 * D * (y + 0.5)) / TN) + b);
            const c = a > 0 ? mix(paper, pen, a * 0.75) : mix(paper, ink, -a * 0.45), k = 4 * (y * TN + x);
            d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
          }
          tctx.putImageData(timg, 0, 0);
        }
        function drawNet(C, paper, pen, ink) {
          const ctx = netc.ctx, H = N.H;
          ctx.clearRect(0, 0, NW, NH);
          // more than 8 hidden neurons: two staggered columns so each thumbnail stays readable
          const top = 44, bot = NH - 6, zig = H > 8, gap = (bot - top) / (zig ? H + 1 : H);
          const s = zig ? Math.min(46, 2 * gap - 8) : Math.max(14, Math.min(46, gap - 7));
          const xi = 46, xh = 300, xo = 516, so = 80, yo = (top + bot) / 2, yi = [top + (bot - top) * 0.3, top + (bot - top) * 0.7];
          const hy = (j) => top + gap * (zig ? j + 1 : j + 0.5), hx = (j) => (zig ? xh + (j % 2 ? 1 : -1) * (s / 2 + 4) : xh);
          // line width ∝ |weight| (relative to the largest weight right now), faint when small
          let wmax = 1e-6;
          for (let j = 0; j < H; j++) wmax = Math.max(wmax, Math.abs(N.W1[j][0]), Math.abs(N.W1[j][1]), Math.abs(N.W2[j]));
          const edge = (x1, y1, x2, y2, w) => {
            const r = Math.abs(w) / wmax;
            ctx.strokeStyle = w >= 0 ? C.pen : C.bad;
            ctx.lineWidth = 0.8 + 7.2 * r;
            ctx.globalAlpha = 0.3 + 0.6 * r;
            line(ctx, x1, y1, x2, y2);
          };
          ctx.lineCap = 'round';
          for (let j = 0; j < H; j++) {
            edge(xi + 26, yi[0], hx(j) - s / 2, hy(j), N.W1[j][0]);
            edge(xi + 26, yi[1], hx(j) - s / 2, hy(j), N.W1[j][1]);
            edge(hx(j) + s / 2, hy(j), xo - so / 2, yo, N.W2[j]);
          }
          ctx.globalAlpha = 1;
          ctx.imageSmoothingEnabled = true;
          for (let j = 0; j < H; j++) {
            thumb(j, paper, pen, ink);
            ctx.drawImage(toff, hx(j) - s / 2, hy(j) - s / 2, s, s);
            ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(hx(j) - s / 2, hy(j) - s / 2, s, s);
          }
          ctx.drawImage(off, xo - so / 2, yo - so / 2, so, so);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(xo - so / 2, yo - so / 2, so, so);
          ctx.font = `600 24px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ['x', 'y'].forEach((t, k) => {
            dot(ctx, xi, yi[k], 26); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = C.ink; ctx.fillText(t, xi, yi[k] + 1);
          });
          ctx.font = `21px ${C.fontBody}`; ctx.fillStyle = C.ink2; ctx.textBaseline = 'alphabetic';
          ctx.fillText('입력', xi, 24); ctx.fillText(`은닉층 · 뉴런 ${H}개`, xh, 24); ctx.fillText('출력', xo, 24);
        }
        function drawSpark(C) {
          const ctx = spark.ctx, h = S.hist;
          ctx.clearRect(0, 0, SPW, SPH);
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
          line(ctx, 1, SPH - 2, SPW, SPH - 2); line(ctx, 1, 2, 1, SPH - 2);
          if (h.length < 2) return;
          const n = Math.max(h.length, 300), top = Math.max(0.75, h[0]);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
          ctx.beginPath();
          const stepI = Math.max(1, Math.floor(h.length / 240));
          for (let i = 0; i < h.length; i += stepI) {
            const x = 2 + (i / (n - 1)) * (SPW - 4), y = SPH - 3 - Math.min(1, h[i] / top) * (SPH - 8);
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.stroke();
        }
        const epEl = $('.xn-ep'), lossEl = $('.xn-loss'), accEl = $('.xn-acc');
        function stats() {
          setText(epEl, N.epoch.toLocaleString('ko-KR'));
          setText(lossEl, (S.hist[S.hist.length - 1] || 0).toFixed(3));
          setText(accEl, Math.round(N.acc(P) * 100) + '%');
        }
        function all() {
          const C = Kit.colors(), paper = rgb(C.paper), pen = rgb(C.pen), ink = rgb(C.ink);
          drawHeat(C, paper, pen, ink); drawNet(C, paper, pen, ink); drawSpark(C); stats();
        }
        const runBtn = $('.xn-run');
        function setRun(on) { S.run = on; runBtn.textContent = on ? '정지' : '학습 시작'; runBtn.classList.toggle('on', on); }
        function reset(autoRun) { N = new Net(S.H, S.seed); S.hist = []; setRun(autoRun); all(); }
        el.querySelectorAll('.xn-bar .chip').forEach((c) => c.addEventListener('click', () => {
          S.kind = c.dataset.k; P = makeData(S.kind);
          el.querySelectorAll('.xn-bar .chip').forEach((x) => x.classList.toggle('on', x === c));
          reset(true);
        }));
        const hs = $('.xn-h');
        hs.addEventListener('input', () => { $('.xn-ho').textContent = hs.value; });
        hs.addEventListener('change', () => { S.H = +hs.value; reset(true); });
        runBtn.addEventListener('click', () => setRun(!S.run));
        $('.xn-reset').addEventListener('click', () => { S.seed++; reset(false); });
        K.loop(el, () => {
          if (!S.run) return;
          const k = S.kind === 'spiral' ? 6 : 3;
          let L = 0;
          for (let i = 0; i < k; i++) { L = N.step(P, LRATE); S.hist.push(L); }
          if (S.hist.length > 9000) S.hist.splice(0, S.hist.length - 9000);
          if (N.epoch >= 8000 || L < 0.004) setRun(false);
          all();
        });
        all();
        let fontsFinal = false;
        K.onTheme(() => { all(); fontsFinal = fontsIdle(); });
        afterFonts(all, () => fontsFinal);
      },
    },

    /* ───────────────────────── 3. gradient ───────────────────────── */
    {
      id: 'gradient',
      title: '경사하강법: 눈 감고 산 내려오기',
      minutes: 1.5,
      notes: '학습이란 결국 ‘손실(틀린 정도)이 가장 낮은 곳’을 찾는 일입니다. 그런데 컴퓨터는 산 전체를 내려다볼 수 없어서, 눈을 감고 발밑의 기울기만 느끼며 내리막 쪽으로 한 걸음씩 갑니다. 그 걸음의 크기를 정하는 숫자가 학습률입니다.\n[실습] 지금은 학습률 0.07로 13걸음 만에 내려온 모습입니다. 슬라이더를 맨 왼쪽(0.01)으로 → [자동]: 115걸음, 한참 걸립니다. 0.3 근처 → 6걸음 만에 도착. 0.7–0.8 → 반대편 웅덩이로 튕겨 가고, 맨 오른쪽(1.0 이상) → 곡선 밖으로 튕겨 나갑니다. 곡선 아무 곳이나 클릭하면 공을 그 자리에 놓습니다. 오른쪽 작은 웅덩이에 놓고 작은 학습률로 내려가면 거기 갇힙니다(지역 최소).\n질문: “여러분이 학습률을 정한다면, 처음엔 크게 할까 작게 할까?”',
      html: `
<style>
#f-gradient .gd-top{display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
#f-gradient .gd-eq{font-family:var(--font-mono);font-size:24px;padding:10px 0 10px 16px;border-left:4px solid var(--hl);white-space:nowrap}
#f-gradient .gd-plot canvas{cursor:crosshair;touch-action:none;user-select:none}
#f-gradient .gd-ctl{display:grid;grid-template-columns:920px auto;gap:56px;align-items:start}
#f-gradient .gd-out{position:absolute;left:630px;top:2px;padding:2px 12px 6px;background:var(--paper);pointer-events:none}
#f-gradient .gd-zone{display:grid;grid-template-columns:32fr 50fr 18fr;margin-top:4px;font-family:var(--font-hand);font-size:28px;line-height:1.05;color:var(--ink-3)}
#f-gradient .gd-zone span{border-top:3px solid var(--ink-3);padding:6px 6px 0;white-space:nowrap}
#f-gradient .gd-zone span+span{border-left:2px dashed var(--ink-3)}
#f-gradient .gd-zone em{font-style:normal;padding:0 2px}
#f-gradient .gd-zone span.on{color:var(--pen);border-top:5px solid var(--pen);margin-top:-2px}
#f-gradient .gd-zone span.on em{background:linear-gradient(176deg,transparent 50%,var(--hl-soft) 50%,var(--hl-soft) 92%,transparent 92%)}
#f-gradient .gd-msg{font-family:var(--font-hand);font-size:48px;color:var(--pen);line-height:1.05;white-space:nowrap}
#f-gradient .gd-read{font-family:var(--font-mono);font-size:22px;color:var(--ink-2);margin-top:6px;white-space:nowrap}
</style>
<div class="gd-top">
  <div class="stack" style="gap:8px"><div class="kicker">경사하강법 (gradient descent)</div><h2 class="title">눈 감고 산 내려오기</h2></div>
  <div class="stack" style="gap:6px;align-items:flex-start"><div class="hand" style="font-size:40px">발밑 기울기만 느끼고, 내리막으로 한 걸음</div>
    <div class="gd-eq">다음 위치 = 지금 위치 − <b>학습률</b> × 기울기</div></div>
</div>
<div class="demo gd-plot"><div class="gd-out"><div class="gd-msg"></div><div class="gd-read"></div></div></div>
<div class="demo gd-ctl">
  <div><div class="field"><label>학습률 (한 걸음의 크기) <output class="gd-lro">0.07</output></label><input type="range" class="gd-lr" min="0" max="100" step="1" value="40" aria-label="학습률"></div>
    <div class="gd-zone"><span><em>너무 작으면 → 느림</em></span><span><em>적당하면 → 도착</em></span><span><em>너무 크면 → 튕김</em></span></div></div>
  <div class="btns" style="flex-wrap:nowrap"><button class="btn gd-one">한 걸음</button><button class="btn gd-auto">자동</button><button class="btn ghost gd-again">다시</button></div>
</div>
<div class="src">출처: 경사하강법은 보통 A. Cauchy의 1847년 제안을 시초로 봄 · 곡선은 설명용 예시 함수 (실제 AI의 손실 곡면은 가중치 수만큼의 차원)</div>`,
      init(el, K, f) {
        const $ = (s) => el.querySelector(s);
        const W = 1416, H = 400, U0 = -1.62, U1 = 1.62;
        const cv = K.canvas($('.gd-plot'), W, H);
        const X = (u) => 60 + ((u - U0) / (U1 - U0)) * (W - 120);
        const IX = (x) => U0 + ((x - 60) / (W - 120)) * (U1 - U0);
        const Y = (L) => H - 22 - ((L + 0.3) / 1.92) * (H - 44);
        const S = { u0: -1.58, u: -1.58, lr: LR(40), trail: [-1.58], done: null, auto: false, hop: null, wait: 0 };
        const slow = () => S.lr < 0.05;
        function judge(prev, nu) {
          if (Math.abs(nu) > 1.62) return 'out';
          if (Math.abs(nu - prev) < 0.002 && Math.abs(GDD(nu)) < 0.02) return nu < 0 ? 'arrived' : S.u0 < 0 ? 'jumped' : 'stuck';
          if (S.trail.length > 60 && S.lr > 0.5) return 'bounce';
          if (S.trail.length > 400) return 'tired';
          return null;
        }
        function step(animate) {
          if (S.done) return;
          const a = S.u, nu = a - S.lr * GDD(a);
          S.u = nu; S.trail.push(nu);
          S.done = judge(a, nu);
          if (animate) S.hop = { a, b: nu, t: 0, dur: slow() ? 0.035 : 0.3 };
        }
        function reset() { S.u = S.u0; S.trail = [S.u0]; S.done = null; S.hop = null; S.auto = false; }
        // a ball that flew off the curve is pinned to the top edge so it stays visible
        // (in the top-left corner it drops below the '높이 = 손실' label instead of covering it)
        const AXL = '높이 = 손실 (틀린 정도)';
        let axR = 260; // right end of that label, re-measured in draw()
        const OUTX = (u) => Kit.clamp(X(u), 22, W - 22), OUTY = (x) => (x < axR + 20 ? 56 : 20);
        function hopPath(a, b) {
          const out = Math.abs(b) > 1.62;
          const ax = X(a), ay = Y(GDF(a)) - 15, bx = out ? OUTX(b) : X(b), by = out ? OUTY(bx) : Y(GDF(b)) - 15;
          const lift = 26 + Math.abs(bx - ax) * 0.28;
          return { ax, ay, bx, by, cx: (ax + bx) / 2, cy: Math.min(ay, by) - lift };
        }
        // The mountain, its hatching, the valley labels and the axes never change, but while a hop or auto-play runs
        // the canvas is redrawn every frame. During those frames they come from a cache canvas of the same backing
        // size, copied in 1:1, and only the trail, labels and ball are drawn on top. Every other draw (rest states,
        // theme/font changes, the end of a run, leaving the frame mid-hop) draws everything directly, exactly as
        // before, so the canvas at rest holds the same pixels on every rasteriser (on a GPU canvas the cached frames
        // can differ by a pixel of edge anti-aliasing).
        // The cache sits in the document (display:none) because canvas text takes lang and font smoothing from its
        // element; it is drawn into directly, never read back from the visible canvas.
        const bg = document.createElement('canvas'); bg.width = cv.cv.width; bg.height = cv.cv.height;
        bg.style.display = 'none'; cv.cv.after(bg);
        const bgx = bg.getContext('2d');
        let bgOk = false;
        function drawStatic(ctx, C) {
          ctx.clearRect(0, 0, W, H);
          // round caps reach the hatch line ends: that is the state every earlier frame left on the visible context
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          // mountain: hatched ground under the curve
          const pts = [];
          for (let i = 0; i <= 240; i++) { const u = U0 + ((U1 - U0) * i) / 240; pts.push([X(u), Y(GDF(u))]); }
          ctx.save();
          ctx.beginPath(); ctx.moveTo(pts[0][0], H); pts.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.lineTo(pts[pts.length - 1][0], H); ctx.closePath();
          ctx.fillStyle = C.paper2; ctx.fill(); ctx.clip();
          ctx.strokeStyle = C.ink3; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.2;
          for (let x = -H; x < W; x += 16) line(ctx, x, H, x + H, 0);
          ctx.restore();
          ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
          ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
          // valley labels
          ctx.font = `30px ${C.fontHand}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('가장 낮은 골짜기 (목표)', X(-1.065), Y(GDF(-1.065)) + 14);
          ctx.fillText('작은 웅덩이 (지역 최소)', X(0.919), Y(GDF(0.919)) + 14);
          ctx.strokeStyle = C.ink3; ctx.fillStyle = C.ink3; ctx.lineWidth = 2;
          arrow(ctx, 24, H - 4, 24, 12, 10);
          arrow(ctx, 24, H - 4, W - 6, H - 4, 10);
          ctx.fillStyle = C.ink2; ctx.font = `21px ${C.fontBody}`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
          ctx.fillText('가로 = 가중치 값 →', W - 16, H - 12);
          axR = 38 + ctx.measureText(AXL).width;
        }
        function draw(fast = !!(S.hop || S.auto)) {
          const C = Kit.colors(), ctx = cv.ctx;
          if (!fast) drawStatic(ctx, C);
          else {
            if (!bgOk) { bgx.setTransform(cv.scale, 0, 0, cv.scale, 0, 0); drawStatic(bgx, C); bgOk = true; }
            ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, bg.width, bg.height); ctx.drawImage(bg, 0, 0);
            ctx.restore();
            ctx.lineJoin = 'round'; ctx.lineCap = 'round'; // as the mountain curve leaves them when drawn here
          }
          // hop arcs + footprints
          const T = S.trail, nShow = S.hop ? T.length - 1 : T.length;
          ctx.save(); ctx.setLineDash([7, 6]); ctx.strokeStyle = C.pen; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.75;
          for (let i = 1; i < nShow; i++) {
            const h = hopPath(T[i - 1], T[i]);
            ctx.beginPath(); ctx.moveTo(h.ax, h.ay); ctx.quadraticCurveTo(h.cx, h.cy, h.bx, h.by); ctx.stroke();
          }
          ctx.restore();
          ctx.fillStyle = C.ink2;
          for (let i = 0; i < nShow - 1; i++) {
            const u = T[i]; if (Math.abs(u) > 1.62) continue;
            const x = X(u), y = Y(GDF(u)), ang = Math.atan(-((Y(GDF(u + 0.01)) - y) / (X(u + 0.01) - x))) * -1;
            ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
            ctx.beginPath(); ctx.ellipse(-5, -6, 3.2, 5.5, 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(5, -9, 3.2, 5.5, 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
          // y-axis label after the hop arcs, on a paper patch so a dashed arc never runs through it
          ctx.font = `21px ${C.fontBody}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillStyle = C.paper; ctx.fillRect(34, 2, axR - 30, 32);
          ctx.fillStyle = C.ink2; ctx.fillText(AXL, 38, 6);
          // ball
          let bx, by;
          if (S.hop) {
            const h = hopPath(S.hop.a, S.hop.b), t = Kit.clamp(S.hop.t, 0, 1), it = 1 - t;
            bx = it * it * h.ax + 2 * it * t * h.cx + t * t * h.bx; by = it * it * h.ay + 2 * it * t * h.cy + t * t * h.by;
          } else if (Math.abs(S.u) > 1.62) { bx = OUTX(S.u); by = OUTY(bx); } else { bx = X(S.u); by = Y(GDF(S.u)) - 15; }
          // next-step arrow (learning rate × slope)
          if (!S.hop && !S.done && Math.abs(S.u) <= 1.62) {
            const nu = S.u - S.lr * GDD(S.u), tx = Kit.clamp(X(nu), 8, W - 8);
            // 44px above the ball; for a ball near the top edge keep 20px of room, and if a long arrow
            // would then run through the '높이 = 손실' label, drop it below that label
            let ay = Math.max(by - 44, 20);
            if (ay < 40 && Math.min(bx, tx) < axR + 8) ay = 44;
            if (Math.abs(tx - bx) > 6) {
              ctx.strokeStyle = C.pen; ctx.fillStyle = C.pen; ctx.lineWidth = 3;
              arrow(ctx, bx, ay, tx, ay, 13);
              ctx.font = `28px ${C.fontHand}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              // label above the arrow, below it, or past its tip; never under the message box, the axis label
              // or the ball, and always in the air above the curve (a steep wall would otherwise run through it)
              const LB = '학습률 × 기울기', lw = ctx.measureText(LB).width, lh = 32, o = $('.gd-out');
              const blocks = [[o.offsetLeft - 6, o.offsetTop - 4, o.offsetLeft + o.offsetWidth + 6, o.offsetTop + o.offsetHeight + 4], [0, 0, axR + 8, 34], [bx - 20, by - 20, bx + 20, by + 20]];
              const lo = Math.min(bx, tx), hi = Math.max(bx, tx);
              const inAir = (r) => { for (let x = Math.max(r[0], 60); x <= Math.min(r[2], W - 60); x += 4) if (Y(GDF(IX(x))) < r[3] + 4) return false; return true; };
              const cands = [];
              for (const dy of [-(8 + lh / 2), 8 + lh / 2]) for (const f of [0.5, 0.35, 0.65, 0.2, 0.8, 0.05, 0.95]) cands.push([Kit.clamp(lo + (hi - lo) * f, lw / 2 + 4, W - lw / 2 - 4), ay + dy]);
              cands.push([tx < bx ? tx - 10 - lw / 2 : tx + 10 + lw / 2, ay]);
              const pos = cands.find(([cx, cy]) => {
                const r = [cx - lw / 2, cy - lh / 2, cx + lw / 2, cy + lh / 2];
                return r[0] >= 2 && r[2] <= W - 2 && r[1] >= 2 && r[3] <= H - 2 && inAir(r) && !blocks.some((b) => r[0] < b[2] && r[2] > b[0] && r[1] < b[3] && r[3] > b[1]);
              });
              if (pos) {
                // paper halo: an earlier dashed hop arc may pass behind the label
                ctx.save(); ctx.strokeStyle = C.paper; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeText(LB, pos[0], pos[1]); ctx.restore();
                ctx.fillText(LB, pos[0], pos[1]);
              }
            }
          }
          dot(ctx, bx, by, 15); ctx.fillStyle = C.hl; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
        }
        function ui() {
          setText($('.gd-lro'), S.lr.toFixed(2));
          const v = +$('.gd-lr').value, z = v < 32 ? 0 : v <= 80 ? 1 : 2;
          el.querySelectorAll('.gd-zone span').forEach((s, i) => s.classList.toggle('on', i === z));
          const n = S.trail.length - 1;
          const M = {
            arrived: `도착! ${n}걸음 만에 가장 낮은 곳`,
            stuck: `작은 웅덩이에 갇힘 · ${n}걸음`,
            jumped: `튕겨서 엉뚱한 웅덩이로 · ${n}걸음`,
            out: '튕겨 나감! 걸음이 너무 커요',
            bounce: '계속 튕기기만 해요',
            tired: `${n}걸음째… 너무 느려요`,
          };
          setText($('.gd-msg'), S.done ? M[S.done] : n === 0 ? '준비: 한 걸음 또는 자동' : `${n}걸음째 내려가는 중`);
          const u = Kit.clamp(S.u, -1.62, 1.62);
          setText($('.gd-read'), `걸음 ${n} · 손실 ${Math.abs(S.u) > 1.62 ? '—' : GDF(u).toFixed(3)} · 기울기 ${Math.abs(S.u) > 1.62 ? '—' : sgn(GDD(u), 2)}`);
          const ab = $('.gd-auto');
          setText(ab, S.auto ? '멈춤' : '자동');
          ab.classList.toggle('on', S.auto);
        }
        function render() { ui(); draw(); } // ui first: draw() reads the message box size
        // initial picture: a finished walk at lr ≈ 0.07 (13 steps)
        while (!S.done) step(false);
        $('.gd-lr').addEventListener('input', (e) => { S.lr = LR(+e.target.value); reset(); render(); });
        $('.gd-one').addEventListener('click', () => { if (S.done) reset(); S.auto = false; if (S.hop) { S.hop = null; } step(true); render(); });
        $('.gd-auto').addEventListener('click', () => { if (S.done) reset(); S.auto = !S.auto; S.wait = 0; render(); });
        $('.gd-again').addEventListener('click', () => { reset(); render(); });
        cv.cv.addEventListener('pointerdown', (e) => {
          const q = Kit.pt(e, cv.cv);
          S.u0 = Kit.clamp(IX(q.x), -1.58, 1.58);
          reset(); render();
        });
        K.loop(el, (t, dt) => {
          if (S.hop) {
            S.hop.t += dt / S.hop.dur;
            if (S.hop.t >= 1) S.hop = null;
            render();
            return;
          }
          if (S.auto && !S.done) {
            S.wait -= dt;
            if (S.wait <= 0) { step(!slow()); S.wait = slow() ? 0.04 : 0.2; render(); }
          } else if (S.auto && S.done) { S.auto = false; ui(); draw(false); } // the finished walk, drawn in full
        });
        render();
        let fontsFinal = false;
        const redraw = () => { bgOk = false; draw(false); };
        f.leave = () => { if (S.hop || S.auto) draw(false); }; // a walk frozen mid-hop stays drawn in full
        K.onTheme(() => { redraw(); fontsFinal = fontsIdle(); });
        afterFonts(redraw, () => fontsFinal);
      },
    },

    /* ───────────────────────── 4. pixels ───────────────────────── */
    {
      id: 'pixels',
      title: '컴퓨터가 보는 그림',
      minutes: 1.5,
      notes: '컴퓨터에게 그림은 숫자 표입니다. 칸마다 0(빈칸)부터 255(가장 진함)까지의 숫자 하나(MNIST와 같은 방식이고, 보통 사진 파일은 반대로 0이 검정). 앞에서 본 뉴런의 입력 x₁, x₂ 자리에 바로 이 숫자들이 들어갑니다.\n[실습] 왼쪽 칸에 마우스로 숫자를 그려 보세요. 오른쪽 숫자가 동시에 바뀝니다. 칸 위에 마우스를 올리면 양쪽에서 같은 칸이 표시됩니다. [지우기]로 비우고, [예시 ‘7’]로 처음 그림을 다시 불러옵니다.\n이 그림은 16×16 = 256개. 손글씨 숫자 데이터셋 MNIST는 28×28 = 784개. 휴대폰 사진은 1,200만 칸 × 3(빨강·초록·파랑) = 3,600만 개.\n질문: “사진을 좌우로 뒤집으면 숫자 표는 어떻게 바뀔까? 그래도 AI에게 같은 숫자 ‘7’일까?”',
      html: `
<style>
#f-pixels .px-top{display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
#f-pixels .px-top > .stack{flex:none}
#f-pixels .px-top .hand{text-align:right;word-break:keep-all}
#f-pixels .px-main{display:grid;grid-template-columns:448px 64px 800px;gap:0 22px;align-items:start}
#f-pixels .px-cap{font-family:var(--font-mono);font-size:21px;color:var(--ink-2);margin-bottom:8px;white-space:nowrap}
#f-pixels .px-eq{font-family:var(--font-display);font-weight:800;font-size:96px;line-height:1;align-self:center;text-align:center;margin-top:30px}
#f-pixels .px-grid canvas{cursor:crosshair;touch-action:none;user-select:none}
#f-pixels .px-bot{display:flex;gap:40px;align-items:center}
#f-pixels .px-strip{display:flex;align-items:baseline;gap:13px;white-space:nowrap;padding-left:28px;border-left:3px solid var(--ink-3)}
#f-pixels .px-strip b{font-family:var(--font-mono);font-weight:600;font-size:32px;letter-spacing:-0.02em}
#f-pixels .px-strip span{font-size:22px;color:var(--ink-2)}
#f-pixels .px-strip i{font-style:normal;font-family:var(--font-mono);font-size:30px;color:var(--ink-3)}
</style>
<div class="px-top">
  <div class="stack" style="gap:8px"><div class="kicker">이미지 = 숫자 표</div><h2 class="title">컴퓨터가 보는 그림</h2></div>
  <div class="hand">왼쪽에 그리면, 오른쪽 숫자가 바로 바뀐다</div>
</div>
<div class="px-main demo">
  <div><div class="px-cap">16 × 16 칸 · <span class="if-mouse">마우스로</span><span class="if-touch">손가락으로</span> 그리기</div><div class="px-grid"></div></div>
  <div class="px-eq">=</div>
  <div><div class="px-cap">컴퓨터가 받는 것: 숫자 256개 (0 = 빈칸, 255 = 가장 진함)</div><div class="px-num"></div></div>
</div>
<div class="px-bot">
  <div class="btns demo"><button class="btn px-clear">지우기</button><button class="btn px-seven">예시 ‘7’</button></div>
  <div class="px-strip"><span>휴대폰 사진 한 장</span><b>4000×3000</b><span>= 1,200만 칸</span><i>→</i><span>컬러면</span><b class="mark">×3</b><span>(R·G·B) = 숫자</span><b>3,600만</b><span>개</span></div>
</div>
<div class="src">참고: 손글씨 숫자 데이터셋 MNIST는 28×28 회색조 (LeCun 외, 1998) · 1,200만 화소 = 4000×3000 (흔한 휴대폰 카메라 해상도) · 컬러 사진은 칸마다 빨강·초록·파랑 3개의 숫자</div>`,
      init(el, K) {
        const $ = (s) => el.querySelector(s);
        const NC = 16, CS = 28, GW = NC * CS, MW = 800, MCW = MW / NC;
        const gcv = K.canvas($('.px-grid'), GW, GW);
        const ncv = K.canvas($('.px-num'), MW, GW);
        const Gd = new Uint8Array(NC * NC);
        let hov = -1, last = null, painting = false, inked = false; // inked: dab() changed a cell since the last check
        function dab(gx, gy) {
          for (let j = Math.floor(gy - 2); j <= Math.ceil(gy + 2); j++) for (let i = Math.floor(gx - 2); i <= Math.ceil(gx + 2); i++) {
            if (i < 0 || j < 0 || i >= NC || j >= NC) continue;
            const d = Math.hypot(i + 0.5 - gx, j + 0.5 - gy);
            const v = Math.round(255 * Kit.clamp((1.55 - d) / 0.85, 0, 1));
            if (v > Gd[j * NC + i]) { Gd[j * NC + i] = v; inked = true; }
          }
        }
        function stroke(a, b) {
          const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.2));
          for (let k = 0; k <= n; k++) dab(a.x + ((b.x - a.x) * k) / n, a.y + ((b.y - a.y) * k) / n);
        }
        function seven() {
          Gd.fill(0);
          stroke({ x: 3.3, y: 3.4 }, { x: 12.5, y: 3.4 });
          stroke({ x: 12.5, y: 3.4 }, { x: 6.8, y: 13.3 });
          stroke({ x: 6.6, y: 8.4 }, { x: 11.0, y: 8.4 });
        }
        function draw() {
          const C = Kit.colors(), paper = rgb(C.paper), ink = rgb(C.ink), hl = rgb(C.hl);
          const dark = lum(ink) < lum(paper) ? ink : paper, light = dark === ink ? paper : ink;
          let ctx = gcv.ctx;
          ctx.clearRect(0, 0, GW, GW);
          for (let j = 0; j < NC; j++) for (let i = 0; i < NC; i++) {
            ctx.fillStyle = rgba(mix(paper, ink, Gd[j * NC + i] / 255));
            ctx.fillRect(i * CS, j * CS, CS, CS);
          }
          ctx.strokeStyle = C.ink3; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
          for (let k = 1; k < NC; k++) { line(ctx, k * CS, 0, k * CS, GW); line(ctx, 0, k * CS, GW, k * CS); }
          ctx.globalAlpha = 1; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, GW - 3, GW - 3);
          if (hov >= 0) { ctx.strokeStyle = C.pen; ctx.lineWidth = 3.5; ctx.strokeRect((hov % NC) * CS + 1.5, Math.floor(hov / NC) * CS + 1.5, CS - 3, CS - 3); }
          ctx = ncv.ctx;
          ctx.clearRect(0, 0, MW, GW);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          for (let j = 0; j < NC; j++) for (let i = 0; i < NC; i++) {
            const v = Gd[j * NC + i], x = i * MCW, y = j * CS;
            if (v > 0) {
              const a = 0.14 + 0.8 * (v / 255);
              ctx.fillStyle = rgba(hl, a); ctx.fillRect(x + 1, y + 1, MCW - 2, CS - 2);
              const bg = mix(paper, hl, a);
              ctx.fillStyle = rgba(lum(bg) > 150 ? dark : light);
              ctx.font = `600 20px ${C.fontMono}`;
              ctx.fillText(String(v), x + MCW / 2, y + CS / 2 + 1);
            } else {
              ctx.fillStyle = C.ink3; ctx.font = `20px ${C.fontMono}`;
              ctx.fillText('0', x + MCW / 2, y + CS / 2 + 1);
            }
          }
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, MW - 3, GW - 3);
          if (hov >= 0) { ctx.strokeStyle = C.pen; ctx.lineWidth = 3.5; ctx.strokeRect((hov % NC) * MCW + 1.5, Math.floor(hov / NC) * CS + 1.5, MCW - 3, CS - 3); }
        }
        const cell = (q, cw) => { const i = Math.floor(q.x / cw), j = Math.floor(q.y / CS); return i >= 0 && j >= 0 && i < NC && j < NC ? j * NC + i : -1; };
        const g = gcv.cv;
        g.addEventListener('pointerdown', (e) => {
          painting = true;
          try { g.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          const q = Kit.pt(e, g); last = { x: q.x / CS, y: q.y / CS };
          dab(last.x, last.y); hov = cell(q, CS); draw();
        });
        // draw() depends only on Gd and hov (and theme/fonts, which redraw on their own): moves that change neither
        // would repaint and re-upload both canvases for nothing. This also fires while the pointer pans across the
        // frame when it is not the current one.
        g.addEventListener('pointermove', (e) => {
          const q = Kit.pt(e, g), p = { x: q.x / CS, y: q.y / CS }, h = cell(q, CS);
          let ch = h !== hov;
          hov = h;
          if (painting && last) { inked = false; stroke(last, p); last = p; if (inked) ch = true; }
          if (ch) draw();
        });
        const stop = () => { painting = false; last = null; };
        g.addEventListener('pointerup', stop);
        g.addEventListener('pointercancel', stop);
        g.addEventListener('pointerleave', () => { if (!painting && hov !== -1) { hov = -1; draw(); } });
        ncv.cv.addEventListener('pointermove', (e) => { const h = cell(Kit.pt(e, ncv.cv), MCW); if (h !== hov) { hov = h; draw(); } });
        ncv.cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; if (hov !== -1) { hov = -1; draw(); } });
        $('.px-clear').addEventListener('click', () => { Gd.fill(0); draw(); });
        $('.px-seven').addEventListener('click', () => { seven(); draw(); });
        seven();
        draw();
        let fontsFinal = false;
        K.onTheme(() => { draw(); fontsFinal = fontsIdle(); });
        afterFonts(draw, () => fontsFinal);
      },
    },

    /* ───────────────────────── 5. overfit (보충) ───────────────────────── */
    {
      id: 'overfit',
      title: '과적합: 외우기 vs 이해하기',
      minutes: 1,
      optional: true,
      notes: '(보충) 같은 점들에 곡선을 맞추는데, 차수를 올릴수록 곡선이 더 구불구불해질 수 있습니다. 차수 1은 너무 단순해서 덜 배운 상태, 3–5 정도면 패턴을 이해한 상태, 15쯤 되면 연습 문제(검정 점)를 몽땅 외워서 훈련 오차는 거의 0인데 처음 보는 문제(빈 점)는 크게 틀립니다. 이게 과적합입니다.\n[실습] 슬라이더를 1 → 4 → 15로 천천히. 오른쪽 아래 그래프에서 훈련 오차는 계속 내려가는데 시험 오차는 다시 올라가는 걸 보여 주세요.\n질문: “시험 전날 기출문제 답만 통째로 외운 친구 vs 원리를 이해한 친구, 처음 보는 문제에서는 누가 이길까?”',
      html: `
<style>
#f-overfit .of{display:grid;grid-template-columns:860px 1fr;gap:52px;flex:1;min-height:0}
#f-overfit .of-plot canvas{display:block}
#f-overfit .of-r{display:flex;flex-direction:column;gap:16px;min-width:0}
#f-overfit .of-deg{display:flex;align-items:baseline;gap:16px}
#f-overfit .of-deg b{font-family:var(--font-mono);font-size:80px;font-weight:600;line-height:1}
#f-overfit .of-bar{display:grid;grid-template-columns:120px 1fr 74px;gap:12px;align-items:center;font-size:22px}
#f-overfit .of-bar .tr{height:26px;background:var(--paper-3);position:relative}
#f-overfit .of-bar .tr i{position:absolute;left:0;top:0;bottom:0;background:var(--ink)}
#f-overfit .of-bar.te .tr i{background:var(--pen)}
#f-overfit .of-bar .tr em{position:absolute;right:8px;top:-3px;font-style:normal;font-family:var(--font-hand);font-size:30px;line-height:1;color:var(--paper)}
#f-overfit .of-bar output{font-family:var(--font-mono);font-weight:600;text-align:right}
#f-overfit .of-note{font-family:var(--font-hand);font-size:46px;color:var(--pen);line-height:1.08;min-height:100px}
</style>
<div class="kicker">과적합 (overfitting) · 보충</div>
<h2 class="title">외우기 vs 이해하기</h2>
<div class="of">
  <div class="of-plot"></div>
  <div class="of-r demo">
    <div class="of-deg"><span class="small muted">다항식 차수</span><b class="of-d">3</b><span class="small muted">= 곡선이 휠 수 있는 정도</span></div>
    <input type="range" class="of-s" min="1" max="15" step="1" value="3" aria-label="다항식 차수">
    <div class="of-bar"><span>훈련 오차</span><div class="tr"><i class="of-btr"></i></div><output class="of-otr"></output></div>
    <div class="of-bar te"><span>시험 오차</span><div class="tr"><i class="of-bte"></i><em class="of-over"></em></div><output class="of-ote"></output></div>
    <div class="of-mini"></div>
    <div class="of-note"></div>
  </div>
</div>
<div class="src">데이터: 설명용 가상 값 (참 곡선 + 잡음, 훈련 13점 · 시험 14점) · 최소제곱 다항 회귀 (x를 [−1, 1]로 정규화, 르장드르 기저) · 오차 = 평균 제곱근 오차(RMSE)</div>`,
      init(el, K) {
        const $ = (s) => el.querySelector(s);
        const PW = 860, PH = 566, MW = 500, MH = 214, BAR_MAX = 0.8;
        const plot = K.canvas($('.of-plot'), PW, PH);
        const mini = K.canvas($('.of-mini'), MW, MH);
        const FITS = [null], ETR = [null], ETE = [null];
        for (let d = 1; d <= 15; d++) { const w = polyFit(OF.tr, d, 1e-6); FITS.push(w); ETR.push(rmse(w, OF.tr)); ETE.push(rmse(w, OF.te)); }
        let deg = 3;
        const YT = 1.2, PT = 48, PB = PH - 6;
        const X = (x) => 40 + ((x + 1) / 2) * (PW - 60), Y = (y) => PT + ((YT - y) / (2 * YT)) * (PB - PT);
        function drawPlot() {
          const C = Kit.colors(), ctx = plot.ctx, w = FITS[deg];
          ctx.clearRect(0, 0, PW, PH);
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
          line(ctx, X(-1), Y(-YT), X(1), Y(-YT)); line(ctx, X(-1), Y(-YT), X(-1), Y(YT));
          ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5; line(ctx, X(-1), Y(0), X(1), Y(0));
          // legend
          ctx.font = `22px ${C.fontBody}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
          dot(ctx, X(-1) + 26, 18, 8); ctx.fillStyle = C.ink; ctx.fill();
          ctx.fillStyle = C.ink2; ctx.fillText('훈련 점 = 연습 문제', X(-1) + 42, 18);
          dot(ctx, X(-1) + 296, 18, 8); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
          ctx.fillStyle = C.ink2; ctx.fillText('시험 점 = 처음 보는 문제', X(-1) + 312, 18);
          ctx.save();
          ctx.beginPath(); ctx.rect(X(-1), Y(YT), X(1) - X(-1), Y(-YT) - Y(YT)); ctx.clip();
          // residuals of test points
          ctx.setLineDash([5, 5]); ctx.strokeStyle = C.bad; ctx.lineWidth = 2.2;
          OF.te.forEach(([x, y]) => line(ctx, X(x), Y(y), X(x), Y(Kit.clamp(polyEval(w, x), -3, 3))));
          ctx.setLineDash([]);
          // fitted curve
          ctx.strokeStyle = C.pen; ctx.lineWidth = 4.5; ctx.lineJoin = 'round'; ctx.beginPath();
          for (let i = 0; i <= 500; i++) { const x = -1 + (2 * i) / 500, y = Kit.clamp(polyEval(w, x), -3, 3); i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
          ctx.stroke();
          ctx.restore();
          OF.tr.forEach(([x, y]) => { dot(ctx, X(x), Y(y), 8); ctx.fillStyle = C.ink; ctx.fill(); });
          OF.te.forEach(([x, y]) => { dot(ctx, X(x), Y(y), 8); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); });
        }
        function drawMini() {
          const C = Kit.colors(), ctx = mini.ctx, L = 46, B = 58, T = 10, R = 14, top = 1.0;
          const mx = (d) => L + ((d - 1) / 14) * (MW - L - R), my = (v) => MH - B - (Math.min(v, top) / top) * (MH - B - T);
          ctx.clearRect(0, 0, MW, MH);
          ctx.fillStyle = C.hlSoft; ctx.fillRect(mx(deg) - 9, T, 18, MH - B - T);
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
          line(ctx, L, MH - B, MW - R, MH - B); line(ctx, L, T, L, MH - B);
          ctx.fillStyle = C.ink2; ctx.font = `20px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          [1, 5, 10, 15].forEach((d) => ctx.fillText(String(d), mx(d), MH - B + 6));
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          [0, 0.5, 1].forEach((v) => ctx.fillText(v.toFixed(1), L - 8, my(v)));
          const series = (arr, col) => {
            ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.beginPath();
            for (let d = 1; d <= 15; d++) (d > 1 ? ctx.lineTo(mx(d), my(arr[d])) : ctx.moveTo(mx(d), my(arr[d])));
            ctx.stroke();
          };
          series(ETR, C.ink); series(ETE, C.pen);
          ctx.font = `28px ${C.fontHand}`; ctx.textAlign = 'center';
          ctx.fillStyle = C.pen; ctx.textBaseline = 'bottom'; ctx.fillText('시험 오차', mx(5.5), my(ETE[5]) - 8);
          ctx.fillStyle = C.ink; ctx.fillText('훈련 오차', mx(11.5), my(ETR[11]) - 6);
          ctx.fillStyle = C.ink2; ctx.font = `20px ${C.fontBody}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
          ctx.fillText('다항식 차수 →', (L + MW - R) / 2, MH - 2);
        }
        function sync() {
          $('.of-d').textContent = deg;
          const tr = ETR[deg], te = ETE[deg];
          $('.of-btr').style.width = Math.min(100, (tr / BAR_MAX) * 100) + '%';
          $('.of-bte').style.width = Math.min(100, (te / BAR_MAX) * 100) + '%';
          $('.of-over').textContent = te > BAR_MAX ? '넘침!' : '';
          $('.of-otr').textContent = tr.toFixed(2);
          $('.of-ote').textContent = te.toFixed(2);
          $('.of-note').textContent = deg <= 2 ? '너무 단순: 덜 배웠다' : deg <= 6 ? '이해하기: 처음 보는 문제도 맞힌다' : deg <= 10 ? '슬슬 외우기 시작…' : '외우기: 연습 문제는 만점, 시험은 망침';
          drawPlot(); drawMini();
        }
        const s = $('.of-s');
        s.addEventListener('input', () => { deg = +s.value; sync(); });
        sync();
        let fontsFinal = false;
        K.onTheme(() => { drawPlot(); drawMini(); fontsFinal = fontsIdle(); });
        afterFonts(() => { drawPlot(); drawMini(); }, () => fontsFinal);
      },
    },

    /* ───────────────────────── 6. concepts-recap ───────────────────────── */
    {
      id: 'concepts-recap',
      title: '기계가 배우는 법, 한 장으로',
      minutes: 1,
      notes: '오늘 만진 것을 한 장으로 묶습니다. 데이터를 모델에 넣으면 예측이 나오고, 정답과 비교한 오차만큼 가중치를 아주 조금 고칩니다. 이 바퀴를 수없이 돌리는 것이 ‘학습’, 다 배운 가중치로 답만 내는 것이 ‘사용(추론)’입니다. ChatGPT에 질문할 때 일어나는 일은 사용 쪽이고, 그때 가중치는 바뀌지 않습니다.\n→ 키를 한 번 누르면 아래 두 칸(학습 vs 사용)과 가중치 개수 비교, 한 번 더 누르면 기억할 단어 3개가 나타납니다. 가중치 막대는 로그 눈금이라 한 칸이 10배입니다. 아까 XOR 신경망(은닉 뉴런 6개)은 가중치·편향을 다 세도 25개(2×6 + 6 + 6 + 1)입니다. 가중치를 공개한 모델 중 가장 큰 것은 2026년 7월 Kimi K3(2.8조 개)입니다. ChatGPT 같은 최신 모델은 크기를 공개하지 않아서 ‘추정’이라고 적었습니다.\n질문: “기억할 단어 세 개, 데이터 · 가중치 · 오차. 이 중에 돈이 제일 많이 드는 건 뭘까?”',
      html: `
<style>
#f-concepts-recap .rc-top{display:flex;justify-content:space-between;align-items:flex-end;gap:30px}
#f-concepts-recap .rc{position:relative;width:1416px;height:370px;flex:none}
#f-concepts-recap .rc svg{position:absolute;left:0;top:0;overflow:visible}
#f-concepts-recap .rc .ar{fill:none;stroke:var(--ink);stroke-width:3.5;stroke-linecap:round}
#f-concepts-recap .rc .ah{fill:var(--ink)}
#f-concepts-recap .rc .card{fill:var(--paper);stroke:var(--ink);stroke-width:2.5}
#f-concepts-recap .rc .px{fill:var(--ink)}
#f-concepts-recap .rc .tl{stroke:var(--ink-3);stroke-width:4;stroke-linecap:round}
#f-concepts-recap .rc .run{fill:var(--hl);stroke:var(--ink);stroke-width:3}
#f-concepts-recap .rc-n{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;background:var(--paper);border:3px solid var(--ink);border-radius:18px 6px 16px 5px / 6px 16px 5px 18px;transition:box-shadow .25s,border-color .25s}
#f-concepts-recap .rc-n b{font-family:var(--font-display);font-weight:800;font-size:36px;line-height:1.1}
#f-concepts-recap .rc-n > span{font-size:21px;color:var(--ink-2);line-height:1.3}
#f-concepts-recap .rc-n em{font-style:normal;color:var(--ink)}
#f-concepts-recap .rc-n.on{box-shadow:inset 0 0 0 200px var(--pen-soft);border-color:var(--pen)} /* tint over the opaque paper: the loop ball passing behind the box must not show through the text */
#f-concepts-recap .rc-lab{position:absolute;font-size:21px;color:var(--ink-2);line-height:1.3}
#f-concepts-recap .rc-mid{position:absolute;left:690px;top:100px;width:300px;text-align:center}
#f-concepts-recap .rc-bot{display:grid;grid-template-columns:1fr 1fr 1.08fr;gap:34px;flex:1;min-height:0}
#f-concepts-recap .rc-bot .box{padding:16px 24px;display:flex;flex-direction:column;gap:8px;align-self:start}
#f-concepts-recap .rc-bot .box div{font-size:25px;line-height:1.35}
#f-concepts-recap .rc-bot .box div.sm{font-size:21px}
#f-concepts-recap .rc-lad{display:flex;flex-direction:column;gap:9px;padding-top:4px}
#f-concepts-recap .rc-lad .r{display:grid;grid-template-columns:118px 150px 1fr;gap:12px;align-items:center;font-size:20px;color:var(--ink-2);white-space:nowrap}
#f-concepts-recap .rc-lad .r b{font-family:var(--font-mono);font-size:24px;color:var(--ink);text-align:right}
#f-concepts-recap .rc-lad .r > span:nth-child(2){display:block;height:22px;background:repeating-linear-gradient(90deg,var(--ink-3) 0 1.5px,transparent 1.5px 12px);box-shadow:inset 0 -2px 0 var(--ink-3)}
#f-concepts-recap .rc-lad .r i{display:block;height:22px;background:var(--ink)}
#f-concepts-recap .rc-lad .r.y i{background:var(--pen)}
</style>
<div class="rc-top">
  <div class="stack" style="gap:8px"><div class="kicker">정리 · 기계가 배우는 법</div><h2 class="title">학습의 바퀴</h2></div>
  <div class="hand" data-step="2" style="font-size:46px;white-space:nowrap">기억할 단어 3개: <span class="mark">데이터</span> · <span class="mark">가중치</span> · <span class="mark">오차</span></div>
</div>
<div class="rc">
  <svg class="rc-svg" width="1416" height="370" viewBox="0 0 1416 370" aria-hidden="true">
    <defs><marker id="rc-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker></defs>
    <rect class="card" x="58" y="93" width="176" height="132" transform="rotate(4 146 159)"/>
    <rect class="card" x="44" y="103" width="176" height="132" transform="rotate(-3 132 169)"/>
    <rect class="card" x="30" y="117" width="176" height="132"/>
    <g class="rc-pix"></g>
    <line class="tl" x1="128" y1="145" x2="186" y2="145"/><line class="tl" x1="128" y1="169" x2="176" y2="169"/><line class="tl" x1="128" y1="193" x2="190" y2="193"/><line class="tl" x1="128" y1="217" x2="166" y2="217"/>
    <path class="ar" d="M240,185 C300,181 360,183 412,185" marker-end="url(#rc-ah)"/>
    <path class="ar" d="M1288,185 L1254,185" marker-end="url(#rc-ah)"/>
    <g class="rc-arcs"></g>
    <circle class="run" r="12" cx="540" cy="185"/>
  </svg>
  <div class="rc-lab" style="left:30px;top:34px"><span class="display mark" style="font-weight:800;font-size:38px;color:var(--ink)">데이터</span></div>
  <div class="rc-lab" style="left:30px;top:264px">사진 · 글 · 숫자<br><span class="pen">+ 정답</span></div>
  <div class="rc-n" data-a="3.1416" style="left:422px;top:133px;width:236px;height:104px"><b>모델</b><span>속은 <em class="mark">가중치</em> 숫자 덩어리</span></div>
  <div class="rc-n" data-a="4.7124" style="left:735px;top:3px;width:210px;height:84px"><b>예측</b><span>“합격일 것 같다”</span></div>
  <div class="rc-n" data-a="0" style="left:1035px;top:137px;width:210px;height:96px"><b><em class="mark">오차</em></b><span>예측과 정답의 차이</span></div>
  <div class="rc-n" data-a="1.5708" style="left:695px;top:283px;width:290px;height:84px"><b style="font-size:31px">가중치 조금 수정</b><span>오차가 줄어드는 쪽으로</span></div>
  <div class="rc-lab" style="left:1296px;top:150px"><span class="hand" style="font-size:46px">정답</span></div>
  <div class="rc-mid"><div class="hand" style="font-size:66px;line-height:1">반복</div><div class="mono small rc-cnt" style="margin-top:8px;color:var(--ink)">1바퀴째</div><div class="mono tiny muted rc-err">오차 0.90</div></div>
</div>
<div class="rc-bot" data-step="1">
  <div class="box"><div class="subtitle">학습 <span class="mono tiny muted">training</span></div><div>바퀴를 수없이 돌려 <b>가중치를 고친다</b></div><div class="muted sm">큰 모델: GPU 수천~수만 대로 몇 주~몇 달</div></div>
  <div class="box dashed"><div class="subtitle">사용 <span class="mono tiny muted">inference</span></div><div>가중치는 그대로, <b>답만 계산</b></div><div class="muted sm">ChatGPT에 질문할 때가 바로 이것</div></div>
  <div class="rc-lad"><div class="mono tiny muted">가중치 개수 · 눈금 한 칸 = 10배</div>
    <div class="r"><b>25</b><span><i style="width:${(Math.log10(25) / 12.5 * 100).toFixed(1)}%"></i></span><span>아까 XOR 신경망</span></div>
    <div class="r y"><b>1,750억</b><span><i style="width:${(Math.log10(1.75e11) / 12.5 * 100).toFixed(1)}%"></i></span><span>GPT-3 (2020)</span></div>
    <div class="r y"><b>2.8조</b><span><i style="width:${(Math.log10(2.8e12) / 12.5 * 100).toFixed(1)}%"></i></span><span>가장 큰 공개 모델</span></div>
    <div class="hand" style="font-size:32px">ChatGPT급: 수천억 ~ 조 개 (추정)</div>
  </div>
</div>
<div class="src">출처: GPT-3 1,750억 개 (Brown 외, 2020) · Kimi K3 2.8조 개 (2026, Epoch AI) · OpenAI는 GPT-4부터 크기 비공개 · Llama 3.1 405B 학습: H100 1만 6천여 대 (Meta, 2024)</div>`,
      init(el, K) {
        const svg = el.querySelector('.rc-svg');
        // a tiny 4×4 "photo" on the front data card
        const pix = el.querySelector('.rc-pix'), on = [1, 2, 5, 6, 7, 9, 10, 13];
        for (let k = 0; k < 16; k++) if (on.includes(k)) K.svg('rect', { class: 'px', x: 44 + (k % 4) * 17, y: 135 + Math.floor(k / 4) * 17, width: 15, height: 15 }, pix);
        for (let k = 0; k < 16; k++) if (!on.includes(k)) K.svg('rect', { x: 44 + (k % 4) * 17, y: 135 + Math.floor(k / 4) * 17, width: 15, height: 15, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 1.5 }, pix);
        // loop arcs on an ellipse, clipped to the node boxes
        const cx = 840, cy = 185, rx = 300, ry = 140;
        const P = (t) => [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
        const nodes = Array.from(el.querySelectorAll('.rc-n'));
        const boxes = nodes.map((n) => ({ a: +n.dataset.a, l: parseFloat(n.style.left), t: parseFloat(n.style.top), w: parseFloat(n.style.width), h: parseFloat(n.style.height) }));
        const inside = (p, b, m) => p[0] > b.l - m && p[0] < b.l + b.w + m && p[1] > b.t - m && p[1] < b.t + b.h + m;
        const order = [boxes[0], boxes[1], boxes[2], boxes[3]]; // 모델(π) → 예측(3π/2) → 오차(2π) → 수정(5π/2)
        const ta = [Math.PI, 1.5 * Math.PI, 2 * Math.PI, 2.5 * Math.PI, 3 * Math.PI];
        const arcs = el.querySelector('.rc-arcs');
        for (let k = 0; k < 4; k++) {
          const A = order[k], B = order[(k + 1) % 4];
          let t0 = ta[k], t1 = ta[k + 1];
          while (inside(P(t0), A, 10) && t0 < t1) t0 += 0.01;
          while (inside(P(t1), B, 16) && t1 > t0) t1 -= 0.01;
          const pts = [];
          for (let i = 0; i <= 24; i++) pts.push(P(t0 + ((t1 - t0) * i) / 24));
          K.svg('path', { class: 'ar', d: K.sketchPath(pts, { wobble: 1.5, seed: 3 + k }), 'marker-end': 'url(#rc-ah)' }, arcs);
        }
        const run = svg.querySelector('.run'), cnt = el.querySelector('.rc-cnt'), err = el.querySelector('.rc-err');
        let t = Math.PI, laps = 1, shownLaps = 0;
        const place = () => {
          const p = P(t);
          run.setAttribute('cx', p[0].toFixed(1)); run.setAttribute('cy', p[1].toFixed(1));
          const tm = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          nodes.forEach((n) => {
            let d = Math.abs(tm - (+n.dataset.a % (2 * Math.PI)));
            d = Math.min(d, 2 * Math.PI - d);
            n.classList.toggle('on', d < 0.32);
          });
          // the texts change once per lap; rewriting them every frame would relayout the label each frame
          if (laps !== shownLaps) {
            shownLaps = laps;
            cnt.textContent = `${laps.toLocaleString('ko-KR')}바퀴째`;
            err.textContent = `오차 ${(0.88 * Math.exp(-(laps - 1) / 5) + 0.02).toFixed(2)}`;
          }
        };
        K.loop(el, (now, dt) => {
          const before = Math.floor((t - Math.PI) / (2 * Math.PI));
          t += dt * ((2 * Math.PI) / 4.2);
          if (Math.floor((t - Math.PI) / (2 * Math.PI)) > before) laps++;
          place();
        });
        place();
      },
      leave(el) { el.querySelectorAll('.rc-n.on').forEach((n) => n.classList.remove('on')); },
    },
  ]);
})();
