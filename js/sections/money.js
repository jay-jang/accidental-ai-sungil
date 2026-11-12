/* Money: why GPUs, the circle of deals, two cost curves, capex & power,
   Korea's memory boom, and the bubble debate. */
(function () {
  'use strict';
  const K = Kit;
  const PI = Math.PI;
  const r1 = (v) => Math.round(v * 10) / 10;

  /** 원 단위 보기 좋게 */
  function fmtWon(v) {
    if (v >= 1e8) return (v / 1e8).toFixed(v >= 1e9 ? 0 : 1) + '억 원';
    if (v >= 1e4) return Math.round(v / 1e4).toLocaleString('ko-KR') + '만 원';
    if (v >= 10) return Math.round(v).toLocaleString('ko-KR') + '원';
    if (v >= 1) return v.toFixed(1) + '원';
    return v.toFixed(2) + '원';
  }
  const log10 = Math.log10;

  /* Chromium paints SVG <text> with the font scale of its last layout. A chart laid out while the
     camera was far away (the overview at load, e.g. with fallback fonts on an offline PC) can paint
     tiny and bunched in a corner after the camera zooms in. Re-lay out the frame's SVG text on arrival. */
  function relayoutSvgText(el) {
    // hide them all, force one layout, then show them again: one forced layout per frame, not one per SVG
    const list = Array.from(el.querySelectorAll('.stage svg')).filter((s) => s.querySelector('text')).map((s) => [s, s.style.display]);
    if (!list.length) return;
    list.forEach(([s]) => { s.style.display = 'none'; });
    void list[0][0].getBoundingClientRect();
    list.forEach(([s, d]) => { s.style.display = d; });
  }

  /* An offline Windows PC has no Nanum Pen Script / IBM Plex: the hand font falls back to Comic Sans +
     Malgun Gothic, much wider. Shrink the one-line labels that would then be cut or run into a line. */
  function onFonts(fn) {
    try { if (document.fonts) { document.fonts.ready.then(fn); document.fonts.addEventListener('loadingdone', fn); } } catch (e) { /* ignore */ }
  }
  // photo captions are nowrap + ellipsis: shrink caption and its <small> together until they fit
  function fitCaps(el) {
    el.querySelectorAll('.photo figcaption').forEach((cap) => {
      const sm = cap.querySelector('small');
      cap.style.fontSize = ''; if (sm) sm.style.fontSize = '';
      const a = parseFloat(getComputedStyle(cap).fontSize), b = sm ? parseFloat(getComputedStyle(sm).fontSize) : 0;
      for (let s = 0.95; s > 0.5 && cap.scrollWidth > cap.clientWidth + 1; s -= 0.05) {
        cap.style.fontSize = (a * s).toFixed(1) + 'px';
        if (sm) sm.style.fontSize = Math.max(20, b * s).toFixed(1) + 'px';
      }
    });
  }
  // SVG <text data-fit="basePx,maxWidth">: shrink until its advance fits maxWidth (user units)
  function fitSvgText(el) {
    el.querySelectorAll('svg text[data-fit]').forEach((t) => {
      const [base, maxW] = t.dataset.fit.split(',').map(Number);
      let px = base;
      t.style.fontSize = px + 'px';
      try { while (px > 20 && t.getComputedTextLength() > maxW) { px -= 1; t.style.fontSize = px + 'px'; } } catch (e) { /* not laid out */ }
    });
  }
  // HTML one-liner (white-space:nowrap; max-width:100%): shrink until it fits its box
  function fitLine(n, minPx) {
    n.style.fontSize = '';
    let px = parseFloat(getComputedStyle(n).fontSize);
    while (px > minPx && n.scrollWidth > n.clientWidth + 1) { px -= 1; n.style.fontSize = px + 'px'; }
  }
  function fitFrame(el) { fitCaps(el); fitSvgText(el); }

  /* ════════════════ 1. gpu-why ════════════════ */
  const RACE = (function () {
    const N = 48, CELLS = N * N, CPU_W = 8, CPU_CELL = 0.028;
    const rnd = K.rand(2006);
    const dur = new Float32Array(CELLS);
    let gmax = 0;
    for (let i = 0; i < CELLS; i++) { dur[i] = 0.85 + rnd() * 0.6; gmax = Math.max(gmax, dur[i]); }
    const perW = CELLS / CPU_W;
    return { N, CELLS, CPU_W, CPU_CELL, dur, gpuDone: gmax, perW, cpuDone: perW * CPU_CELL };
  })();

  function drawLane(c, kind, T) {
    const C = K.colors(), ctx = c.ctx, w = c.w, h = c.h, N = RACE.N, s = w / N;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = C.hl;
    let done = 0;
    if (kind === 'cpu') {
      done = Math.min(RACE.perW, Math.floor(T / RACE.CPU_CELL));
      for (let wk = 0; wk < RACE.CPU_W; wk++) {
        const base = wk * RACE.perW;
        for (let j = 0; j < done; j++) { const i = base + j; ctx.fillRect((i % N) * s, Math.floor(i / N) * s, s, s); }
      }
    } else {
      for (let i = 0; i < RACE.CELLS; i++) {
        const p = T / RACE.dur[i];
        if (p <= 0) continue;
        ctx.globalAlpha = p >= 1 ? 1 : 0.15 + 0.55 * p;
        ctx.fillRect((i % N) * s, Math.floor(i / N) * s, s, s);
      }
      ctx.globalAlpha = 1;
    }
    // graph-paper cells
    ctx.strokeStyle = C.ink3; ctx.globalAlpha = 0.32; ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = 1; i < N; i++) { ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    K.sketchRect(ctx, 1.5, 1.5, w - 3, h - 3, { wobble: 1.4, seed: kind === 'cpu' ? 11 : 23 });
    // CPU workers: 8 ballpoint dots sweeping their rows
    if (kind === 'cpu' && done < RACE.perW) {
      for (let wk = 0; wk < RACE.CPU_W; wk++) {
        const i = wk * RACE.perW + done, x = (i % N) * s + s / 2, y = Math.floor(i / N) * s + s / 2;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, PI * 2); ctx.fillStyle = C.pen; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = C.paper; ctx.stroke();
      }
    }
  }

  function nvChart() {
    const W = 540, H = 330, L = 40, R = 14, T = 16, B = 34;
    const x = (yr) => L + ((yr - 2023) / 4) * (W - L - R);
    const y = (v) => T + ((6.2 - v) / 6.2) * (H - T - B);
    const P = [[2023.41, 1.0], [2024.15, 2.0], [2024.43, 3.0], [2025.52, 4.0], [2025.83, 5.03], [2026.36, 5.5], [2026.76, 5.8]];
    const D = [2026.85, 4.5];
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="NVIDIA 시가총액 이정표">`;
    for (let v = 1; v <= 6; v++) s += `<line class="gridl" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 10}" y="${y(v) + 6}" text-anchor="end">${v}</text>`;
    s += `<path class="ax" d="M${L},${T - 4} V${H - B} H${W - R}"/>`;
    [2023, 2024, 2025, 2026].forEach((yr) => { s += `<line class="ax" x1="${x(yr)}" x2="${x(yr)}" y1="${H - B}" y2="${H - B + 6}"/><text x="${x(yr) + 4}" y="${H - 8}">${yr}</text>`; });
    s += `<path class="ln" d="${K.sketchPath(P.map(([a, b]) => [x(a), y(b)]), { tension: 0.2 })}"/>`;
    s += `<path d="M${x(P[6][0])},${y(P[6][1])} L${x(D[0])},${y(D[1])}" style="fill:none;stroke:var(--bad);stroke-width:4;stroke-dasharray:7 6;stroke-linecap:round"/>`;
    P.forEach(([a, b], i) => { s += `<circle class="dot" cx="${x(a)}" cy="${y(b)}" r="${i === 4 ? 9 : 6}" ${i === 4 ? 'style="fill:var(--hl)"' : ''}/>`; });
    s += `<circle cx="${x(D[0])}" cy="${y(D[1])}" r="6" style="fill:var(--paper);stroke:var(--bad);stroke-width:3"/>`;
    // DeepSeek shock: a 5,890억 달러 drop drawn to scale on the milestone line
    const dx = x(2025.07), dy0 = y(3.59), dy1 = y(3.59 - 0.589);
    s += `<path d="M${dx},${dy0} V${dy1}" style="stroke:var(--bad);stroke-width:4;fill:none"/><path d="M${dx - 7},${dy1 - 9} L${dx},${dy1} L${dx + 7},${dy1 - 9}" style="stroke:var(--bad);stroke-width:3;fill:none"/>`;
    s += `<text x="${dx + 8}" y="${dy1 + 22}" style="fill:var(--bad)">DeepSeek 쇼크</text><text x="${dx + 8}" y="${dy1 + 46}" style="fill:var(--bad)">하루 −5,890억 달러</text>`;
    const lab = (i, ddx, ddy, anchor, t, big) => `<text x="${x(P[i][0]) + ddx}" y="${y(P[i][1]) + ddy}" text-anchor="${anchor}" class="${big ? 'big' : ''}">${t}</text>`;
    s += lab(0, 12, 26, 'start', '1조 · 2023.5');
    s += lab(1, 14, 28, 'start', '2조 · 2024.2');
    s += lab(2, -12, -8, 'end', '3조 · 2024.6');
    s += lab(3, -12, -8, 'end', '4조 · 2025.7');
    s += lab(4, -14, -6, 'end', '5조 · 2025.10.29', true);
    s += lab(6, -12, -6, 'end', '최고 5.8조 · 2026.10');
    s += `<text x="${W - R}" y="${y(D[1]) + 34}" text-anchor="end" style="fill:var(--bad)">약 4.5조</text><text x="${W - R}" y="${y(D[1]) + 56}" text-anchor="end" style="fill:var(--bad)">2026.11.6</text>`;
    return s + '</svg>';
  }

  /* ════════════════ 2. money-circle ════════════════ */
  const F8 = { cx: 560, cy: 318, a: 440, b: 620 };
  const f8 = (t) => { const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s; return [F8.cx + (F8.a * c) / d, F8.cy + (F8.b * s * c) / d]; };
  const TT = Math.asin(1 / Math.sqrt(3)); // top/bottom of each loop
  const arcPts = (t0, t1, n) => { const o = []; for (let i = 0; i <= n; i++) o.push(f8(t0 + ((t1 - t0) * i) / n)); return o; };
  const NOD = (function () {
    const oa = f8(PI - TT), or = f8(PI + TT), an = f8(-TT), cl = f8(TT);
    return {
      nv: { x: F8.cx, y: F8.cy, rx: 112, ry: 46, nm: 'NVIDIA', sb: '칩', hub: true },
      oa: { x: oa[0], y: oa[1], rx: 100, ry: 40, nm: 'OpenAI', sb: 'ChatGPT' },
      or: { x: or[0], y: or[1], rx: 100, ry: 40, nm: 'Oracle', sb: '클라우드' },
      ms: { x: oa[0], y: F8.cy, rx: 118, ry: 40, nm: 'Microsoft', sb: '투자 + 클라우드' },
      an: { x: an[0], y: an[1], rx: 112, ry: 40, nm: 'Anthropic', sb: 'Claude' },
      cl: { x: cl[0], y: cl[1], rx: 162, ry: 42, nm: 'Amazon · Google', sb: '투자 + 클라우드' },
    };
  })();
  const H2 = PI / 2;
  const EDGES = [
    {
      kind: 'inv', pts: arcPts(H2, PI - TT, 40), lab: [400, 92, 'start', ['300억 달러']],
      ft: 'NVIDIA → OpenAI', amt: '300억 달러', when: '2025.9 의향 → 2026.2 확정',
      li: ['2025.9 “최대 1,000억 달러 투자” 의향서 — 확정 약속은 아니었다', '2026.2 300억 달러 지분 투자로 바뀜 (3.31 마감)', '2026.8 OpenAI 계열 오하이오 데이터센터 임대료에 최대 1,050억 달러 보증'],
      src: 'CNBC 2025.9.22 · Fortune 2026.2.2 · NVIDIA 10-Q(2026.7.26 분기)',
    },
    {
      kind: 'buy', pts: arcPts(PI - TT, PI + TT, 48), lab: [62, 306, 'middle', ['3,000억', '달러']],
      ft: 'OpenAI → Oracle', amt: '3,000억 달러', when: '2025.9.10 · 5년 계약 (보도)',
      li: ['OpenAI가 5년 동안 오라클 클라우드 컴퓨팅을 산다 (2027년 시작)', '보도된 날 오라클 주가 하루 +36% (전날 발표한 실적 효과도 섞임)', '스타게이트: OpenAI·소프트뱅크·오라클, 4년간 최대 5,000억 달러 (2025.1)'],
      src: 'TechCrunch 2025.9.10 · OpenAI 2025.1.21',
    },
    {
      kind: 'buy', pts: arcPts(PI + TT, 3 * H2, 40), lab: [470, 492, 'start', ['칩 구매']],
      ft: 'Oracle → NVIDIA', amt: 'GPU 구매', when: 'NVIDIA 회계연도 2026 (~2026.1)',
      li: ['클라우드 회사는 계약금으로 GPU를 사서 데이터센터를 채운다', 'NVIDIA 데이터센터 매출 475억 → 1,937억 달러 (2년 만에 약 4배)', '100원어치 팔면 원가 25원 (매출총이익률 75%)'],
      src: 'NVIDIA 실적 발표 FY2024·FY2026·FY27 2분기',
    },
    {
      kind: 'inv', pts: [[NOD.oa.x - 18, NOD.ms.y - 40], [NOD.oa.x - 18, NOD.oa.y + 40]], lab: [NOD.oa.x - 34, 214, 'end', ['130억', '달러']],
      ft: 'Microsoft → OpenAI', amt: '누적 약 130억 달러', when: '2019 · 2021 · 2023',
      li: ['10억 (2019) + 20억 (2021) + 약 100억 달러 (2023)', '2025.10.28 OpenAI 지분 27% (약 1,350억 달러어치)', 'MS는 2025.11 경쟁사 Anthropic에도 최대 50억 달러'],
      src: 'Microsoft 블로그 2023.1·2025.10.28 · Anthropic 2025.11.18',
    },
    {
      kind: 'buy', pts: [[NOD.oa.x + 18, NOD.oa.y + 40], [NOD.oa.x + 18, NOD.ms.y - 40]], lab: [NOD.oa.x + 34, 214, 'start', ['2,500억', '달러']],
      ft: 'OpenAI → Microsoft', amt: '2,500억 달러', when: '2025.10.28 · Azure 구매 약정',
      li: ['OpenAI가 MS 클라우드(Azure)를 더 사기로 약속', '2026.4 재계약: Azure 독점은 끝 — 다른 클라우드도 쓴다', '아마존 AWS와도 380억 달러 계약 (2025.11)'],
      src: 'Microsoft 블로그 2025.10.28 · the-decoder 2026.4 · Wikipedia OpenAI',
    },
    {
      kind: 'inv', pts: arcPts(-H2, -TT, 40), lab: [706, 92, 'end', ['100억 달러']],
      ft: 'NVIDIA → Anthropic', amt: '최대 100억 달러', when: '2025.11.18',
      li: ['NVIDIA 최대 100억 + MS 최대 50억 달러 투자', '같은 날 Anthropic은 MS 클라우드 300억 달러어치 구매 약속', '투자한 회사가 곧 손님이 된다'],
      src: 'Anthropic 2025.11.18',
    },
    {
      kind: 'buy', pts: arcPts(-TT, TT, 48), lab: [982, 306, 'end', ['1,000억', '달러+']],
      ft: 'Anthropic → AWS · 구글 클라우드', amt: '1,000억 달러+', when: '2025.10 · 2026.4',
      li: ['2025.10 구글 TPU(구글이 만든 AI 칩) 최대 100만 개, “수백억 달러”', '2026.4 아마존 AWS에 10년간 1,000억 달러 이상, 최대 5GW'],
      src: 'Anthropic 2025.10.23 · Engadget 2026.4.20',
    },
    {
      kind: 'inv', pts: [[NOD.cl.x, NOD.cl.y - 40], [NOD.cl.x, NOD.an.y + 40]], lab: [NOD.cl.x - 22, 236, 'end', ['260억+']],
      ft: 'Amazon · Google → Anthropic', amt: '260억 달러+', when: '2023 → 2026.4 · 확정분 합계',
      li: ['아마존 80억 달러 (2023~2024) + 2026.4 즉시 50억 (조건부로 최대 200억 더)', '구글 20억 약정 (2023.10) + 10억 (2025.1) + 2026.4 즉시 100억 (조건부로 최대 300억 더)', '아마존은 2026년 OpenAI에도 최대 500억 달러 — 양쪽에 건다'],
      src: 'Wikipedia Anthropic · Engadget 2026.4.20 · Bloomberg·Reuters 2026.4.24 · The Next Web 2026.3',
    },
    {
      kind: 'buy', pts: arcPts(TT, H2, 40), lab: [650, 492, 'end', ['칩 구매']],
      ft: '클라우드 → NVIDIA', amt: 'GPU 구매', when: '2025 설비투자',
      li: ['빅테크 4사 설비투자 2025년 약 4,160억 달러 — 칩과 데이터센터', '구글은 자체 칩 TPU도 쓴다: 모든 돈이 NVIDIA로 가지는 않는다', 'OpenAI도 브로드컴 맞춤 칩(2025.10)·세레브러스(100억 달러+, 2026.1)와 계약'],
      src: 'Platformonomics 2025 · Google Cloud · Wikipedia OpenAI · CNBC 2026.1.16',
    },
  ];
  EDGES.forEach((e) => {
    const cum = [0];
    for (let i = 1; i < e.pts.length; i++) cum.push(cum[i - 1] + Math.hypot(e.pts[i][0] - e.pts[i - 1][0], e.pts[i][1] - e.pts[i - 1][1]));
    e.cum = cum; e.len = cum[cum.length - 1];
    e.d = 'M' + e.pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L');
  });
  function edgeAt(e, u) {
    const L = u * e.len, c = e.cum;
    let i = 1;
    while (i < c.length - 1 && c[i] < L) i++;
    const a = e.pts[i - 1], b = e.pts[i], t = (L - c[i - 1]) / (c[i] - c[i - 1] || 1);
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  function arrowHead(e, u) {
    const p = edgeAt(e, u), c = Math.cos(p.ang), s = Math.sin(p.ang);
    const tip = [p.x + c * 12, p.y + s * 12], l = [p.x - c * 8 - s * 9, p.y - s * 8 + c * 9], r = [p.x - c * 8 + s * 9, p.y - s * 8 - c * 9];
    return `<path class="ah" d="M${tip[0].toFixed(1)},${tip[1].toFixed(1)} L${l[0].toFixed(1)},${l[1].toFixed(1)} L${r[0].toFixed(1)},${r[1].toFixed(1)} Z"/>`;
  }

  /* ════════════════ 3. cost-curves ════════════════ */
  function trainChart() {
    const W = 660, H = 300, L = 96, R = 24, T = 18, B = 36;
    const x = (yr) => L + ((yr - 2016.5) / 10) * (W - L - R);
    const lo = 2, hi = log10(3e9);
    const y = (v) => H - B - ((log10(v) - lo) / (hi - lo)) * (H - B - T);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="최첨단 모델 학습 비용">`;
    [[1e3, '1천 달러'], [1e5, '10만'], [1e7, '1,000만'], [1e9, '10억 달러']].forEach(([v, t]) => { s += `<line class="gridl" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 10}" y="${y(v) + 6}" text-anchor="end">${t}</text>`; });
    s += `<path class="ax" d="M${L},${T - 4} V${H - B} H${W - R}"/>`;
    [2017, 2020, 2023, 2026].forEach((yr) => { s += `<text x="${x(yr)}" y="${H - 8}" text-anchor="middle">${yr}</text>`; });
    // Epoch trend: ×2.4 per year, anchored on GPT-4
    const tr = (yr) => 7.8e7 * Math.pow(2.4, yr - 2023.2);
    s += `<path d="M${x(2019)},${y(tr(2019))} L${x(2026.4)},${y(tr(2026.4))}" style="fill:none;stroke:var(--pen);stroke-width:3;stroke-dasharray:9 7"/>`;
    s += `<text class="hand" x="${L + 50}" y="82">매년 2.4배씩 ↗</text>`;
    const pts = [[2017.45, 930], [2023.2, 7.8e7], [2023.95, 1.91e8], [2025.55, 4.9e8]];
    s += `<path class="ln" d="M${pts.map(([a, b]) => x(a) + ',' + y(b)).join(' L')}" style="stroke-width:2.5;stroke:var(--ink-3)"/>`;
    pts.forEach(([a, b]) => { s += `<circle class="dot" cx="${x(a)}" cy="${y(b)}" r="7"/>`; });
    s += `<circle cx="${x(2024.95)}" cy="${y(5.6e6)}" r="8" style="fill:var(--paper);stroke:var(--ink);stroke-width:3;stroke-dasharray:4 3"/>`;
    s += `<text x="${x(2017.45) + 16}" y="${y(930) + 12}">트랜스포머 · 930달러</text>`;
    s += `<text class="big" x="${x(2023.2) + 14}" y="${y(7.8e7) + 24}">GPT-4 · 7,800만</text>`;
    s += `<text x="${x(2023.95) - 14}" y="${y(1.91e8) - 14}" text-anchor="end">Gemini Ultra · 1.9억</text>`;
    s += `<text x="${x(2025.55) + 14}" y="${y(4.9e8) + 18}">Grok 4 · 4.9억</text>`;
    s += `<text x="${x(2024.95)}" y="${y(5.6e6) + 34}" text-anchor="middle">DeepSeek-V3 · 560만*</text>`;
    return s + '</svg>';
  }
  function priceChart() {
    const W = 660, H = 300, L = 96, R = 24, T = 18, B = 36;
    const x = (yr) => L + ((yr - 2022) / 4.8) * (W - L - R);
    const lo = log10(0.03), hi = 2;
    const y = (v) => H - B - ((log10(v) - lo) / (hi - lo)) * (H - B - T);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="100만 토큰당 사용료">`;
    [[100, '100달러'], [10, '10달러'], [1, '1달러'], [0.1, '0.1달러']].forEach(([v, t]) => { s += `<line class="gridl" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 10}" y="${y(v) + 6}" text-anchor="end">${t}</text>`; });
    s += `<path class="ax" d="M${L},${T - 4} V${H - B} H${W - R}"/>`;
    [2023, 2024, 2025, 2026].forEach((yr) => { s += `<text x="${x(yr)}" y="${H - 8}" text-anchor="middle">${yr}</text>`; });
    // A: same skill (GPT-3.5 level) · Bp: the best model of its day (GPT-4 → GPT-5 → GPT-6 Astra)
    const A = [[2022.87, 20], [2024.79, 0.07]], Bp = [[2023.2, 30], [2025.6, 1.25], [2026.67, 10]];
    s += `<path class="ln pen" d="M${Bp.map(([a, b]) => x(a) + ',' + y(b)).join(' L')}" style="stroke-width:3;stroke-dasharray:10 6"/>`;
    s += `<path class="ln" d="M${x(A[0][0])},${y(A[0][1])} L${x(A[1][0])},${y(A[1][1])}"/>`;
    A.forEach(([a, b]) => { s += `<circle class="dot" cx="${x(a)}" cy="${y(b)}" r="7"/>`; });
    Bp.forEach(([a, b]) => { s += `<circle class="dot" cx="${x(a)}" cy="${y(b)}" r="6" style="stroke:var(--pen)"/>`; });
    s += `<text class="big" x="${x(A[0][0]) - 14}" y="${y(A[0][1]) - 8}" text-anchor="end">20달러</text>`;
    s += `<text class="big" x="${x(A[1][0]) + 12}" y="${y(A[1][1]) - 12}">0.07달러</text>`;
    s += `<text x="${x(Bp[0][0]) + 12}" y="${y(Bp[0][1]) - 8}" style="fill:var(--pen)">GPT-4 · 30달러</text>`;
    s += `<text x="${x(Bp[1][0])}" y="${y(Bp[1][1]) + 32}" text-anchor="middle" style="fill:var(--pen)">GPT-5 · 1.25달러</text>`;
    s += `<text x="${x(Bp[2][0]) - 14}" y="${y(Bp[2][1]) - 4}" text-anchor="end" style="fill:var(--pen)">GPT-6 Astra · 10달러</text>`;
    s += `<text class="hand" data-fit="38,196" x="${L + 34}" y="${y(0.17)}" style="font-size:38px">2년 새 280분의 1</text>`;
    // legend
    const LX = 424;
    s += `<line x1="${LX}" x2="${LX + 28}" y1="${T + 6}" y2="${T + 6}" style="stroke:var(--ink);stroke-width:4"/><text x="${LX + 36}" y="${T + 12}">GPT-3.5급 실력</text>`;
    s += `<line x1="${LX}" x2="${LX + 28}" y1="${T + 32}" y2="${T + 32}" style="stroke:var(--pen);stroke-width:3;stroke-dasharray:10 6"/><text x="${LX + 36}" y="${T + 38}" style="fill:var(--pen)">그때 최고 모델</text>`;
    return s + '</svg>';
  }
  const TOK_PAGE = 670; // 1쪽 ≈ 500 영어 단어 ÷ 0.75
  const USD = 1400;
  const MODELS = [
    { nm: 'GPT-4', when: '2023.3 · 당시 최고', inp: 30, out: 60 },
    { nm: 'GPT-5', when: '2025.8 · 당시 최고', inp: 1.25, out: 10 },
    { nm: 'GPT-6 Astra', when: '2026.9 · 지금 최고', inp: 10, out: 50 },
    { nm: 'GPT-4o mini', when: '2024.7 · 작고 싼 모델', inp: 0.15, out: 0.6 },
  ];

  /* ════════════════ 4. capex-energy ════════════════ */
  function capexChart() {
    const W = 640, H = 396, L = 86, R = 10, T = 40, B = 58;
    const y = (v) => H - B - (v / 8000) * (H - B - T);
    const bw = 78, step = 104;
    const bx = (i) => L + 22 + i * step + (i === 4 ? 26 : 0);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="빅테크 4사 설비투자">`;
    [0, 2000, 4000, 6000, 8000].forEach((v) => { s += `<line class="gridl" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 10}" y="${y(v) + 6}" text-anchor="end">${v ? v.toLocaleString('ko-KR') + '억' : '0'}</text>`; });
    s += `<path class="ax" d="M${L},${T - 10} V${H - B} H${W - R}"/>`;
    const bars = [['2023', 1510, '약 1,500*'], ['2024', 2510, '2,510억'], ['2025', 4160, '4,160억'], ['2026 계획', 7250, '7,250~7,450억']];
    bars.forEach(([lb, v, t], i) => {
      const X = bx(i);
      if (i === 0) s += `<rect x="${X}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}" style="fill:none;stroke:var(--ink-2);stroke-width:2.5;stroke-dasharray:7 5"/>`;
      else if (i === 3) s += `<rect class="bar hl" x="${X}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}"/><rect x="${X}" y="${y(7450)}" width="${bw}" height="${y(7250) - y(7450)}" style="fill:var(--hl-soft);stroke:var(--ink);stroke-width:2;stroke-dasharray:4 3"/>`;
      else s += `<rect class="bar" x="${X}" y="${y(v)}" width="${bw}" height="${y(0) - y(v)}"/>`;
      s += `<text class="${i ? 'big' : ''}" x="${X + bw / 2 + (i === 3 ? 18 : 0)}" y="${y(i === 3 ? 7450 : v) - 12}" text-anchor="middle">${t}</text>`;
      s += `<text x="${X + bw / 2}" y="${H - 30}" text-anchor="middle" style="fill:var(--ink)">${lb}</text>`;
    });
    // comparison: 21 large US non-tech companies combined, 2026
    const X5 = bx(4);
    s += `<line x1="${X5 - 22}" x2="${X5 - 22}" y1="${y(0) + 4}" y2="${y(5200)}" style="stroke:var(--ink-3);stroke-width:1.5;stroke-dasharray:3 5"/>`;
    s += `<rect x="${X5}" y="${y(1800)}" width="${bw}" height="${y(0) - y(1800)}" style="fill:var(--pen-soft);stroke:var(--pen);stroke-width:3"/>`;
    s += `<text class="big" x="${X5 + bw / 2}" y="${y(1800) - 12}" text-anchor="middle" style="fill:var(--pen)">1,800억</text>`;
    s += `<text x="${X5 + bw / 2}" y="${H - 30}" text-anchor="middle" style="fill:var(--pen)">IT 외 대기업</text><text x="${X5 + bw / 2}" y="${H - 8}" text-anchor="middle" style="fill:var(--pen)">21곳 · 2026</text>`;
    s += `<text class="hand" data-fit="32,200" x="${bx(1) - 4}" y="${y(6300)}">2년 만에 약 3배</text>`;
    return s + '</svg>';
  }
  /* IEA Energy and AI (2025): 415 TWh (2024, ≈1.5% of world), 945 TWh (2030, "slightly more than
     Japan's total electricity consumption today", just under 3%), ≈1,200 TWh (2035; cases 700–1,700). */
  const POWER = [
    { k: '2024 실제', yr: '2024', v: 415, say: '전 세계 데이터센터를 다 합쳐 세계 전기의 <b>약 1.5%</b> · 미국 45% · 중국 25% · 유럽 15%' },
    { k: '2030 전망', yr: '2030', v: 945, say: '지금 <b class="mark">일본 한 나라 전체</b>가 쓰는 전기보다 조금 많다 · 세계의 3%에 조금 못 미침' },
    { k: '2035 전망', yr: '2035', v: 1200, lo: 700, hi: 1700, say: '약 1,200TWh. 하지만 전망 범위가 <b>700~1,700</b> — 아무도 정확히 모른다' },
  ];

  /* ════════════════ 5. korea-chips ════════════════ */
  function drawHBM(c, n) {
    const C = K.colors(), ctx = c.ctx, w = c.w, h = c.h;
    ctx.clearRect(0, 0, w, h);
    ctx.lineJoin = 'round';
    const ipY = h - 92;
    const sub = { x: 30, y: ipY + 32, w: 640, h: 24 }, ip = { x: 70, y: ipY, w: 560, h: 32 };
    const gpu = { x: 450, y: ipY - 118, w: 170, h: 118 }, st = { x: 230, w: 170 };
    const baseH = 18, dieH = 13, gap = 3, y0 = ip.y - baseH;
    const box = (x, y, ww, hh, fill, lw, seed) => { ctx.fillStyle = fill; ctx.fillRect(x, y, ww, hh); ctx.strokeStyle = C.ink; ctx.lineWidth = lw; K.sketchRect(ctx, x, y, ww, hh, { wobble: 1, seed }); };
    // substrate + solder balls
    ctx.fillStyle = C.ink3;
    for (let x = sub.x + 16; x < sub.x + sub.w - 8; x += 24) { ctx.beginPath(); ctx.arc(x, sub.y + sub.h + 6, 5, 0, PI * 2); ctx.fill(); }
    box(sub.x, sub.y, sub.w, sub.h, C.paper3, 2.5, 3);
    box(ip.x, ip.y, ip.w, ip.h, C.paper2, 2.5, 5);
    // short, wide wires through the interposer
    ctx.strokeStyle = C.pen; ctx.lineWidth = 2.2;
    for (let k = 0; k < 4; k++) { const yy = ip.y + 7 + k * 6; ctx.beginPath(); ctx.moveTo(st.x + st.w - 30, yy); ctx.lineTo(gpu.x + 30, yy); ctx.stroke(); }
    // GPU die
    box(gpu.x, gpu.y, gpu.w, gpu.h, C.ink, 2.5, 7);
    ctx.fillStyle = C.paper; ctx.font = `600 34px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('GPU', gpu.x + gpu.w / 2, gpu.y + gpu.h / 2);
    // HBM: base die + n DRAM dies
    box(st.x, y0, st.w, baseH, C.paper3, 2, 9);
    const full = Math.floor(n + 1e-6), frac = n - full;
    const dieY = (i) => y0 - (i + 1) * (dieH + gap);
    for (let i = 0; i < full; i++) box(st.x, dieY(i), st.w, dieH, i % 2 ? C.paper2 : C.paper, 1.6, 20 + i);
    if (frac > 0.02) { ctx.globalAlpha = frac; box(st.x, dieY(full) - (1 - frac) * 70, st.w, dieH, full % 2 ? C.paper2 : C.paper, 1.6, 50); ctx.globalAlpha = 1; }
    const top = dieY(Math.max(0, full - 1));
    // TSVs
    ctx.strokeStyle = C.pen; ctx.lineWidth = 2.4;
    for (let k = 0; k < 5; k++) { const xx = st.x + 26 + k * 30; ctx.beginPath(); ctx.moveTo(xx, y0 + baseH - 3); ctx.lineTo(xx, top + 3); ctx.stroke(); }
    // labels with leader lines (left side). A short stack (4–6 layers) is lower than the three
    // labels need, so the labels keep a minimum spacing and their leader lines slant to the stack.
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const RX = 160;
    const lead = (ly, px, py) => { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.6; K.sketchLine(ctx, RX + 10, ly, px, py, { wobble: 1 }); };
    const put = (t, y, col, wt, size) => {
      let sz = size; ctx.font = `${wt} ${sz}px ${C.fontBody}`;
      while (sz > 20 && ctx.measureText(t).width > RX - 4) { sz--; ctx.font = `${wt} ${sz}px ${C.fontBody}`; }
      ctx.fillStyle = col; ctx.fillText(t, RX, y);
    };
    const tY = top + 8, baseY = y0 + 4;
    const tsvY = Math.min(y0 - 20, top + (y0 - top) * 0.62);
    const tsv2 = Math.min(tsvY + 14, baseY - 30), tsv1 = tsv2 - 27, dY = Math.min(tY, tsv1 - 32);
    lead(dY, st.x - 6, tY); put(`D램 칩 × ${full}층`, dY, C.ink, 600, 24);
    lead((tsv1 + tsv2) / 2, st.x + 26, tsvY); put('TSV: 층을 꿰뚫는', tsv1, C.pen, 500, 22); put('수직 통로', tsv2, C.pen, 500, 22);
    lead(y0 + 6, st.x - 4, y0 + 6); put('바닥 제어 칩', baseY, C.ink2, 500, 22);
    // bottom label for interposer
    ctx.textAlign = 'center'; ctx.fillStyle = C.ink2; ctx.font = `500 21px ${C.fontBody}`;
    ctx.fillText('인터포저: GPU와 메모리를 잇는 짧고 넓은 길', w / 2, h - 10);
    // height bracket
    const bx = st.x + st.w + 14;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx, top); ctx.lineTo(bx + 8, top); ctx.moveTo(bx + 4, top); ctx.lineTo(bx + 4, y0); ctx.moveTo(bx, y0); ctx.lineTo(bx + 8, y0); ctx.stroke();
  }

  /* ════════════════ 6. bubble ════════════════ */
  const REASONS = {
    yes: ['올트먼도 “투자자들이 과열됐냐고? 내 생각엔 그렇다” (2025.8)', 'AI 회사에 들어간 투자의 55%가 다른 AI 회사 돈 (순환 거래)', '메타·알파벳: 투자에 쓴 돈이 벌어들인 현금보다 많아졌다 (2026년 3분기)'],
    no: ['클라우드 매출이 실제로 급증: Azure +48%, AWS +39% (2026년 3분기)', 'NVIDIA 한 분기 순이익 597억 달러 — 이익은 진짜', 'D램·HBM은 2029년까지 사실상 완판 (SK하이닉스)'],
  };
  function ciscoChart() {
    const W = 748, H = 262, L = 252, BW = 420;
    const row = (y, nm, sub, v, max, t, cls) => {
      const w = Math.max(6, (v / max) * BW);
      return `<text x="${L - 14}" y="${y + 20}" text-anchor="end" style="fill:var(--ink);font-size:21px">${nm}</text><text x="${L - 14}" y="${y + 42}" text-anchor="end" style="font-size:20px">${sub}</text>` +
        `<rect x="${L}" y="${y + 4}" width="${w}" height="34" style="${cls}"/><text x="${L + w + 10}" y="${y + 28}" style="fill:var(--ink);font-size:21px;font-weight:600">${t}</text>`;
    };
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="시스코와 NVIDIA 비교">`;
    s += `<text x="0" y="22" style="fill:var(--ink-2);font-size:20px">꼭대기 시가총액 (같은 눈금)</text>`;
    s += row(34, '시스코', '2000.3.27 · 세계 1위', 0.55, 5.8, '5,000억 달러+', 'fill:var(--ink-3)');
    s += row(80, 'NVIDIA', '2026.10.5 · 사상 최고', 5.8, 5.8, '', 'fill:var(--ink)');
    s += `<text x="${L + BW - 10}" y="${80 + 28}" text-anchor="end" style="fill:var(--paper);font-size:21px;font-weight:600">약 5.8조 달러</text>`;
    s += `<text x="0" y="${152}" style="fill:var(--ink-2);font-size:20px">꼭대기에서 떨어진 폭 (주가 · 100% = 전부)</text>`;
    s += row(164, '시스코', '→ 2002.10', 90, 100, '약 −90%', 'fill:var(--bad);opacity:.85');
    s += row(210, 'NVIDIA', '→ 2026.11.6', 22.4, 100, '약 −22% · 아직 모른다', 'fill:var(--bad);opacity:.85');
    s += `<line x1="${L}" x2="${L}" y1="32" y2="122" style="stroke:var(--ink-3);stroke-width:2"/><line x1="${L}" x2="${L}" y1="162" y2="${H - 4}" style="stroke:var(--ink-3);stroke-width:2"/>`;
    return s + '</svg>';
  }

  /* ════════════════ frames ════════════════ */
  Deck.part('money', 1, [
    /* ───── 1 ───── */
    {
      id: 'gpu-why',
      title: '왜 GPU인가',
      minutes: 0.8,
      notes: 'AI가 하는 계산의 대부분은 행렬(숫자를 가로·세로로 늘어놓은 표) 곱셈입니다. 답 행렬의 칸 하나하나는 서로를 기다릴 필요가 없어서 한꺼번에 계산할 수 있어요.\n1교시 AlexNet 장의 ‘칠하기 경주’ 기억나죠? 같은 이유입니다. 왼쪽 격자는 이미 끝난 결과를 보여 주니 경주는 생략하거나 한 번만 돌리세요(CPU 일꾼 8명 vs GPU 일꾼 2,304명은 비유, 실제 GTX 580의 코어는 512개). 이번 장의 요점은 오른쪽, 그 GPU를 파는 회사가 어떻게 세계 1위가 됐나입니다.\n오른쪽: NVIDIA 시가총액은 2023년 5월 1조 달러 → 2025년 10월 세계 최초 5조 달러. 2006년에 발표한 CUDA 덕분에 개발자들이 20년 동안 NVIDIA 위에서 코드를 쌓았고, 이것이 경쟁사가 쉽게 못 건너는 “해자”입니다. 단, 11월 초 급락으로 지금은 약 4.5조 달러입니다.\n질문: “더 좋은 칩만 만들면 NVIDIA를 따라잡을 수 있을까요? 20년 쌓인 CUDA가 왜 쉽게 못 건너는 ‘해자’일까요?”',
      html: `
        <style>
          #f-gpu-why .stage{word-break:keep-all}
          #f-gpu-why .lede{font-size:30px;max-width:840px;color:var(--ink)}
          #f-gpu-why .race{position:absolute;left:92px;top:330px;width:830px}
          #f-gpu-why .race-top{display:flex;align-items:center;gap:24px;height:52px}
          #f-gpu-why .lanes{display:grid;grid-template-columns:336px 336px;column-gap:110px;margin-top:10px;position:relative}
          #f-gpu-why .lane-h{display:flex;align-items:baseline;gap:12px;height:44px}
          #f-gpu-why .lane-h b{font-family:var(--font-mono);font-size:34px;font-weight:600}
          #f-gpu-why .lane-h span{font-size:23px;color:var(--ink-2)}
          #f-gpu-why .lane-s{font-family:var(--font-mono);font-size:23px;margin-top:8px;font-variant-numeric:tabular-nums;color:var(--ink-2)}
          #f-gpu-why .lane-s.done{color:var(--good);font-weight:600}
          #f-gpu-why .vs{position:absolute;left:336px;width:110px;top:190px;text-align:center;font-family:var(--font-hand);font-size:54px;color:var(--ink-3)}
          #f-gpu-why .nv{left:968px;top:330px;width:540px}
          #f-gpu-why .nv-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
          #f-gpu-why .cuda{left:968px;top:712px;width:540px;font-size:23px;line-height:1.42;color:var(--ink-2)}
          #f-gpu-why .cuda b{color:var(--ink)}
          #f-gpu-why svg.chart text{font-size:20px}
          #f-gpu-why svg.chart text.big{font-size:26px}
        </style>
        <div class="kicker">돈의 출발점 · 칩</div>
        <h2 class="title">왜 GPU인가</h2>
        <p class="lede">AI 계산의 대부분은 <span class="mark">행렬 곱셈</span>(행렬 = 숫자를 가로·세로로 늘어놓은 표). 답의 칸 하나하나는 서로 기다리지 않고 <b>동시에</b> 계산할 수 있다.</p>
        <div class="abs demo race">
          <div class="race-top">
            <button class="btn r-go">경주 시작</button>
            <span class="hand" style="font-size:36px">한 명씩은 CPU 일꾼이 약 40배 빠른데…</span>
          </div>
          <div class="lanes">
            <div><div class="lane-h"><b>CPU</b><span>똑똑한 일꾼 8명</span></div><div class="lane-c"></div><div class="lane-s s-cpu"></div></div>
            <div><div class="lane-h"><b>GPU</b><span>단순한 일꾼 수천 명</span></div><div class="lane-c"></div><div class="lane-s s-gpu"></div></div>
            <div class="vs">vs</div>
          </div>
        </div>
        <div class="abs" style="left:968px;top:62px">${K.photo('gpu', 'GTX 580 <small>AlexNet, 2012</small>', '', '--w:300px;--ratio:900/426;--pos:50% 50%;--tilt:-3deg')}</div>
        <div class="abs" style="right:96px;top:44px">${K.photo('jensen-huang', '젠슨 황 <small>NVIDIA</small>', 'sm tilt-r')}</div>
        <div class="abs nv">
          <div class="nv-h"><span class="subtitle" style="font-size:30px">NVIDIA 시가총액</span><span class="mono tiny faint">조 달러 · 이정표를 이은 선</span></div>
          ${nvChart()}
        </div>
        <div class="abs cuda"><b class="mono">CUDA</b> (2006) — 그래픽카드에 게임 화면 말고 다른 계산도 시킬 수 있게 해 준 도구. 20년 동안 쌓인 코드와 개발자가 남이 못 건너는 <span class="mark" style="color:var(--ink)">해자</span>(성 둘레 물길)가 됐다.</div>
        <div class="src">출처: NVIDIA 블로그(CPU vs GPU) · 시가총액: Yahoo Finance, Fortune, Wikipedia, Forbes, Motley Fool(2026.10.6), CNBC(2026.11.5) · DeepSeek: Bloomberg 2025.1.27 · Wikipedia CUDA·AlexNet · 경주 속도는 설명용 비유</div>`,
      init(el) {
        const hosts = el.querySelectorAll('.lane-c');
        const cpu = K.canvas(hosts[0], 336, 336), gpu = K.canvas(hosts[1], 336, 336);
        const sCpu = el.querySelector('.s-cpu'), sGpu = el.querySelector('.s-gpu'), btn = el.querySelector('.r-go');
        let T = RACE.gpuDone, running = false;
        // a text write repaints even when the string is the same; these change only ~10 times a second
        const setText = (n, s) => { if (n.textContent !== s) n.textContent = s; };
        const status = () => {
          const tc = Math.min(T, RACE.cpuDone), tg = Math.min(T, RACE.gpuDone);
          const pc = Math.round((Math.min(RACE.perW, Math.floor(tc / RACE.CPU_CELL)) / RACE.perW) * 100);
          let gDone = 0; for (let i = 0; i < RACE.CELLS; i++) if (tg >= RACE.dur[i]) gDone++;
          const pg = Math.round((gDone / RACE.CELLS) * 100);
          setText(sCpu, `${tc.toFixed(1)}초 · ${pc === 100 ? '끝!' : pc + '%'}`);
          setText(sGpu, `${tg.toFixed(1)}초 · ${pg === 100 ? '끝!' : pg + '%'}`);
          sCpu.classList.toggle('done', pc === 100); sGpu.classList.toggle('done', pg === 100);
        };
        // During the race, redraw a lane only when its picture can change: the CPU lane shows just the number
        // of finished cells per worker (a new one every 28 ms), and the GPU lane is all solid from gpuDone on.
        let cpuShown = -1, gpuShownT = -1;
        const draw = (force) => {
          const done = Math.min(RACE.perW, Math.floor(T / RACE.CPU_CELL));
          if (force || done !== cpuShown) { drawLane(cpu, 'cpu', T); cpuShown = done; }
          if (force || gpuShownT < RACE.gpuDone || T < RACE.gpuDone) { drawLane(gpu, 'gpu', T); gpuShownT = T; }
          status();
        };
        btn.addEventListener('click', () => { T = 0; running = true; btn.textContent = '다시 경주'; draw(true); });
        K.loop(el, (t, dt) => {
          if (!running) return;
          T += dt;
          if (T >= RACE.cpuDone) { T = RACE.cpuDone; running = false; }
          draw();
        });
        K.onTheme(() => draw(true));
        draw(true);
        fitFrame(el); onFonts(() => fitFrame(el));
      },
      enter(el) { relayoutSvgText(el); fitFrame(el); },
    },

    /* ───── 2 ───── */
    {
      id: 'money-circle',
      title: '돈이 도는 원',
      minutes: 1.0,
      notes: 'AI 회사들 사이의 돈은 한 방향으로 흐르지 않고 원을 그립니다. NVIDIA가 OpenAI에 투자하고, OpenAI는 오라클·MS 클라우드를 사고, 클라우드 회사는 그 돈으로 NVIDIA 칩을 삽니다. 오른쪽 고리도 같습니다: 아마존·구글이 Anthropic에 투자하고, Anthropic은 다시 AWS·구글 클라우드를 씁니다.\n화살표(또는 금액)를 클릭하면 오른쪽에 날짜·금액·출처가 나옵니다. NVIDIA → OpenAI의 “1,000억 달러”는 의향서였고 실제로는 300억 달러 지분 투자로 바뀌었다는 점을 꼭 짚어 주세요.\n아래 한 줄은 공정하게: 순환 거래는 수요를 부풀려 보이게 할 수 있지만, 클라우드 매출처럼 바깥 고객의 진짜 수요도 큽니다.\n질문: “친구에게 돈을 빌려주고 그 돈으로 내 물건을 사게 하면, 그건 진짜 매출일까요?”',
      html: `
        <style>
          #f-money-circle .stage{word-break:keep-all}
          #f-money-circle svg.mc{position:absolute;left:56px;top:160px;width:1100px;height:620px;overflow:visible}
          #f-money-circle .edge{cursor:pointer}
          #f-money-circle .edge .vis{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;transition:stroke-width .2s}
          #f-money-circle .edge.inv .vis{stroke:var(--rel-money)}
          #f-money-circle .edge.buy .vis{stroke:var(--ink-2)}
          #f-money-circle .edge.inv .ah{fill:var(--rel-money)}
          #f-money-circle .edge.buy .ah{fill:var(--ink-2)}
          #f-money-circle .edge .under{fill:none;stroke:transparent;stroke-width:26;stroke-linecap:round}
          #f-money-circle .edge.on .under{stroke:var(--hl-soft)}
          #f-money-circle .edge:hover .vis,#f-money-circle .edge.on .vis{stroke-width:7}
          #f-money-circle .edge .hit{fill:none;stroke:transparent;stroke-width:34;pointer-events:stroke}
          #f-money-circle .lab{font-family:var(--font-mono);font-size:22px;font-weight:600;fill:var(--ink);paint-order:stroke;stroke:var(--paper);stroke-width:8px;stroke-linejoin:round}
          #f-money-circle .edge.on .lab{fill:var(--pen)}
          #f-money-circle .node .bg{fill:var(--paper)}
          #f-money-circle .node .ol{fill:none;stroke:var(--ink);stroke-width:3}
          #f-money-circle .node .ol2{fill:none;stroke:var(--ink);stroke-width:1.4;opacity:.5}
          #f-money-circle .node.hub .bg2{fill:var(--hl-soft)}
          #f-money-circle .node .nm{font-family:var(--font-display);font-weight:800;font-size:30px;fill:var(--ink)}
          #f-money-circle .node .sb{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
          #f-money-circle .coin{fill:var(--hl);stroke:var(--ink);stroke-width:2;pointer-events:none}
          #f-money-circle .node{pointer-events:none}
          #f-money-circle .legend{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
          #f-money-circle .info{left:1170px;top:120px;width:340px;display:flex;flex-direction:column;gap:10px}
          #f-money-circle .i-ft{font-family:var(--font-display);font-weight:800;font-size:32px;line-height:1.15}
          #f-money-circle .i-amt{font-family:var(--font-mono);font-weight:600;font-size:40px;line-height:1.1;letter-spacing:-0.02em}
          #f-money-circle .i-when{font-family:var(--font-mono);font-size:20px;color:var(--ink-2)}
          #f-money-circle .i-list{font-size:22px;line-height:1.38;gap:10px}
          #f-money-circle .i-src{font-family:var(--font-mono);font-size:15px;color:var(--ink-3);border-top:1.5px dashed var(--ink-3);padding-top:8px}
          #f-money-circle .fair{left:92px;top:758px;width:1416px;font-size:24px;line-height:1.4;color:var(--ink-2)}
          #f-money-circle .fair b{color:var(--ink)}
        </style>
        <div class="kicker">투자 · 계약 · 칩 구매</div>
        <h2 class="title">돈이 도는 원</h2>
        <div class="abs hand" style="left:560px;top:96px;transform:rotate(-3deg)">화살표를 눌러 보세요</div>
        <svg class="mc demo" viewBox="0 0 1100 620" aria-label="AI 회사 사이의 돈 흐름"></svg>
        <div class="abs info">
          <div class="kicker i-kind">선택한 화살표</div>
          <div class="i-ft"></div>
          <div class="i-amt"></div>
          <div class="i-when"></div>
          <ul class="dash i-list"></ul>
          <div class="i-src"></div>
        </div>
        <svg class="abs" width="340" height="40" viewBox="0 0 340 40" style="left:1170px;top:700px;overflow:visible" aria-label="범례"><line x1="0" x2="34" y1="13" y2="13" style="stroke:var(--rel-money);stroke-width:5"/><text x="42" y="20" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">투자</text><line x1="104" x2="138" y1="13" y2="13" style="stroke:var(--ink-2);stroke-width:5"/><text x="146" y="20" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">구매·계약</text><circle cx="264" cy="13" r="8" style="fill:var(--hl);stroke:var(--ink);stroke-width:2"/><text x="278" y="20" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">= 돈</text></svg>
        <div class="abs fair"><b><span class="mark">‘순환 거래’ 우려</span></b> 투자한 돈이 칩·클라우드 매출로 되돌아오면 수요가 실제보다 커 보일 수 있다. <b>반론</b> 바깥 손님의 수요도 진짜다: Azure +48%, AWS +39% (2026년 3분기).</div>
        <div class="src">출처: CNBC 2025.9.22 · Fortune 2026.2.2 · NVIDIA 10-Q · TechCrunch 2025.9.10 · Microsoft 2025.10.28 · Anthropic 2025.10.23·11.18 · Engadget 2026.4.20 · Bloomberg 2026.4.24 · Wikipedia(OpenAI·Anthropic) · phys.org(The Conversation) 2026.10 · Microsoft·Amazon 2026년 3분기 실적</div>`,
      init(el) {
        const svg = el.querySelector('svg.mc');
        let s = '';
        EDGES.forEach((e, i) => {
          const [lx, ly, anc, lines] = e.lab;
          const lab = `<text class="lab" x="${lx}" y="${ly}" text-anchor="${anc}">${lines.map((t, j) => `<tspan x="${lx}" dy="${j ? 26 : 0}">${t}</tspan>`).join('')}</text>`;
          s += `<g class="edge ${e.kind}" data-e="${i}"><path class="under" d="${e.d}"/><path class="vis" d="${e.d}"/>${arrowHead(e, e.len > 300 ? 0.62 : 0.55)}<path class="hit" d="${e.d}"/>${lab}</g>`;
        });
        s += '<g class="coins">';
        EDGES.forEach((e, i) => { const n = Math.max(2, Math.round(e.len / 120)); for (let j = 0; j < n; j++) s += `<circle class="coin" r="7" data-c="${i}" data-k="${j / n}"/>`; });
        s += '</g>';
        Object.keys(NOD).forEach((k) => {
          const n = NOD[k];
          s += `<g class="node${n.hub ? ' hub' : ''}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)})">
            <ellipse class="bg" rx="${n.rx}" ry="${n.ry}"/>${n.hub ? `<ellipse class="bg2" rx="${n.rx}" ry="${n.ry}"/>` : ''}
            <ellipse class="ol" rx="${n.rx}" ry="${n.ry}" transform="rotate(-2)"/><ellipse class="ol2" rx="${n.rx + 3}" ry="${n.ry - 2}" transform="rotate(2.5)"/>
            <text class="nm" text-anchor="middle" y="${n.hub ? 2 : -1}">${n.nm}</text><text class="sb" text-anchor="middle" y="${n.hub ? 28 : 24}">${n.sb}</text></g>`;
        });
        svg.innerHTML = s;
        // per-frame loop: read each coin's edge and offset once, not from dataset strings 60 times a second
        const coins = Array.from(svg.querySelectorAll('.coin[data-c]')).map((n) => ({ n, e: EDGES[+n.dataset.c], k: +n.dataset.k, x: '', y: '' }));
        let phase = 0;
        const place = () => {
          coins.forEach((c) => {
            const e = c.e;
            const u = (c.k + (phase * 80) / e.len) % 1;
            const p = edgeAt(e, u), x = p.x.toFixed(1), y = p.y.toFixed(1);
            if (x !== c.x) c.n.setAttribute('cx', (c.x = x));
            if (y !== c.y) c.n.setAttribute('cy', (c.y = y));
          });
        };
        const info = {
          ft: el.querySelector('.i-ft'), amt: el.querySelector('.i-amt'), when: el.querySelector('.i-when'),
          li: el.querySelector('.i-list'), src: el.querySelector('.i-src'), kind: el.querySelector('.i-kind'),
        };
        const groups = Array.from(svg.querySelectorAll('.edge'));
        const select = (i) => {
          const e = EDGES[i];
          groups.forEach((g, j) => g.classList.toggle('on', j === i));
          info.ft.textContent = e.ft;
          info.amt.textContent = e.amt;
          info.amt.style.color = e.kind === 'inv' ? 'var(--rel-money)' : 'var(--ink)';
          info.when.textContent = e.when;
          info.kind.textContent = '선택한 화살표 · ' + (e.kind === 'inv' ? '투자' : '구매·계약');
          info.li.innerHTML = e.li.map((t) => `<li>${K.escape(t)}</li>`).join('');
          info.src.textContent = '출처: ' + e.src;
        };
        svg.addEventListener('click', (ev) => { const g = ev.target.closest('.edge'); if (g) select(+g.dataset.e); });
        K.loop(el, (t, dt) => { phase += dt; place(); });
        place();
        select(0);
      },
      enter(el) { relayoutSvgText(el); },
    },

    /* ───── 3 ───── */
    {
      id: 'cost-curves',
      title: '두 개의 곡선',
      minutes: 1,
      notes: '두 곡선이 반대로 움직입니다. 최첨단 모델을 한 번 학습시키는 비용은 매년 약 2.4배씩 올라 GPT-4 약 7,800만 달러, Gemini Ultra 약 1.9억 달러, Grok 4는 약 4.9억 달러로 추정됩니다. 반면 같은 실력(GPT-3.5급)을 쓰는 값은 2년 만에 280분의 1이 됐습니다(로그 눈금이라 한 칸이 10배라는 점을 짚어 주세요). 단, 파란 점선(그때 최고 모델)은 GPT-5에서 바닥을 찍고 GPT-6 Astra(2026.9, 100만 토큰당 10달러)에서 8배로 다시 올랐습니다. 싸지는 건 ‘같은 실력’이고, 맨 앞 모델 값은 다시 오르기도 합니다.\n아래 계산기: 슬라이더로 쪽수를 바꾸고, “1번 / 1,000번 / 100만 번”을 눌러 보세요. 10쪽 요약이 2023년 GPT-4 출시가로는 약 340원, 지금 최고 모델 GPT-6 Astra로는 약 140원, 2024년 작은 모델로는 약 2원입니다(가격표 비교, 1달러=1,400원 가정).\n질문: “만드는 값은 비싸지고 쓰는 값은 싸진다면, 돈을 버는 건 누구일까요? 그리고 싸지면 우리는 덜 쓸까요, 더 쓸까요?”',
      html: `
        <style>
          #f-cost-curves .stage{word-break:keep-all}
          #f-cost-curves .ch{top:206px;width:660px}
          #f-cost-curves .ch-h{display:flex;align-items:baseline;gap:14px;margin-bottom:4px;font-size:24px}
          #f-cost-curves .ch-h b{font-family:var(--font-display);font-size:32px}
          #f-cost-curves .calc{position:absolute;left:92px;top:560px;width:1416px;height:268px;border-top:3px solid var(--ink);padding-top:14px;display:grid;grid-template-columns:540px 1fr;gap:40px}
          #f-cost-curves .q{font-family:var(--font-display);font-weight:600;font-size:31px;line-height:1.2;white-space:nowrap}
          #f-cost-curves .q output{font-family:var(--font-mono);background:var(--hl-soft);padding:0 8px}
          #f-cost-curves .tok{font-family:var(--font-mono);font-size:22px;color:var(--ink-2);margin-top:4px}
          #f-cost-curves .rows{display:flex;flex-direction:column;gap:5px;padding-top:2px}
          #f-cost-curves .rw{display:grid;grid-template-columns:250px 1fr 170px;align-items:center;gap:16px}
          #f-cost-curves .rw .nm{font-family:var(--font-mono);font-size:24px;font-weight:600;line-height:1.05}
          #f-cost-curves .rw .nm small{display:block;font-size:20px;font-weight:400;color:var(--ink-2);white-space:nowrap}
          #f-cost-curves .rw .tr{height:30px;position:relative;border-left:2.5px solid var(--ink)}
          #f-cost-curves .rw .tr i{position:absolute;left:0;top:0;bottom:0;background:var(--ink);min-width:3px;transition:width .5s ease}
          #f-cost-curves .rw:first-child .tr i{background:var(--ink-3)}
          #f-cost-curves .rw:last-child .tr i{background:var(--pen)}
          #f-cost-curves .rw .v{font-family:var(--font-mono);font-size:30px;font-weight:600;text-align:right;font-variant-numeric:tabular-nums}
          #f-cost-curves .foot{font-size:20px;color:var(--ink-3);margin-top:6px}
          #f-cost-curves svg.chart text{font-size:20px}
          #f-cost-curves svg.chart text.big{font-size:26px}
          #f-cost-curves svg.chart text.hand{font-size:32px}
        </style>
        <div class="kicker">만드는 값 vs 쓰는 값</div>
        <h2 class="title">두 개의 곡선</h2>
        <div class="abs hand lg" style="left:560px;top:96px;transform:rotate(-2deg)">만들기는 비싸지고, 같은 실력은 싸진다</div>
        <div class="abs ch" style="left:92px">
          <div class="ch-h"><b class="bad">↑ 만드는 값</b><span class="muted">최첨단 모델 학습 1회 · 로그 눈금</span></div>
          ${trainChart()}
        </div>
        <div class="abs ch" style="left:848px">
          <div class="ch-h"><b class="good">↓ 쓰는 값</b><span class="muted">100만 토큰당 사용료 · 로그 눈금</span></div>
          ${priceChart()}
        </div>
        <div class="abs demo calc">
          <div class="stack" style="gap:10px">
            <div class="q">보고서 <output class="c-p">10</output>쪽을 AI에게 요약시키면?</div>
            <input type="range" class="c-range" min="1" max="100" value="10" aria-label="쪽수">
            <div class="tok c-tok"></div>
            <div class="btns c-mult" style="gap:10px">
              <button class="chip on" data-m="1">1번</button><button class="chip" data-m="1000">1,000번</button><button class="chip" data-m="1000000">100만 번</button>
            </div>
          </div>
          <div>
            <div class="rows c-rows"></div>
            <div class="foot">가정: 1쪽 ≈ 영어 500단어 ≈ 670토큰 · 요약은 원문의 1/10 · 1달러 = 1,400원 · 각 모델 출시 때 가격표</div>
          </div>
        </div>
        <div class="src">출처: Stanford AI Index 2024(학습비, Epoch AI와 추정 · 인건비 제외)·2025(280배) · Epoch AI(연 2.4배, Grok 4 중앙값) · *DeepSeek-V3 논문: 마지막 학습 1회의 GPU 임대료 환산 · 가격: changemon·cloudprice·developersdigest(2차)·OpenAI 가격표(GPT-5·GPT-6 Astra) · 토큰 환산: OpenAI 도움말 경험칙</div>`,
      init(el) {
        const range = el.querySelector('.c-range'), out = el.querySelector('.c-p'), tok = el.querySelector('.c-tok');
        const rows = el.querySelector('.c-rows');
        rows.innerHTML = MODELS.map((m) => `<div class="rw"><div class="nm">${m.nm}<small>${m.when}</small></div><div class="tr"><i></i></div><div class="v"></div></div>`).join('');
        const bars = rows.querySelectorAll('.tr i'), vals = rows.querySelectorAll('.v');
        let mult = 1;
        const render = () => {
          const pages = +range.value, inp = pages * TOK_PAGE, outT = Math.round(inp / 10);
          out.textContent = pages;
          tok.textContent = `읽기 ${inp.toLocaleString('ko-KR')} 토큰 + 쓰기 ${outT.toLocaleString('ko-KR')} 토큰`;
          const won = MODELS.map((m) => ((inp * m.inp + outT * m.out) / 1e6) * USD * mult);
          const mx = Math.max.apply(null, won);
          won.forEach((v, i) => { bars[i].style.width = (v / mx) * 100 + '%'; vals[i].textContent = fmtWon(v); });
        };
        range.addEventListener('input', render);
        el.querySelector('.c-mult').addEventListener('click', (e) => {
          const b = e.target.closest('[data-m]'); if (!b) return;
          mult = +b.dataset.m;
          el.querySelectorAll('.c-mult .chip').forEach((c) => c.classList.toggle('on', c === b));
          render();
        });
        render();
        fitFrame(el); onFonts(() => fitFrame(el));
      },
      enter(el) { relayoutSvgText(el); fitFrame(el); },
    },

    /* ───── 4 ───── */
    {
      id: 'capex-energy',
      title: '데이터센터와 전기',
      minutes: 0.7,
      optional: true,
      notes: 'AI는 결국 건물과 전기로 만듭니다. 아마존·MS·구글·메타 4사의 설비투자는 2024년 약 2,510억 달러에서 2026년 계획 7,000억 달러대로 약 3배, 미국의 다른 대기업 21곳을 다 합친 것(1,800억)의 4배쯤 됩니다. 2023년 막대가 점선인 건 집계마다 숫자가 조금씩 달라서입니다.\n오른쪽 버튼(2024 / 2030 / 2035)이나 막대를 눌러 보세요. 전 세계 데이터센터 전기는 2024년 415TWh, 세계 전기의 1.5%입니다. IEA는 2030년 945TWh로, 지금 일본 한 나라 전체가 쓰는 전기보다 조금 많아진다고 봅니다. 2035년은 전망 폭이 700~1,700TWh로 매우 넓습니다.\n공정하게: 2030년까지 늘어나는 세계 전기 수요 중 데이터센터 몫은 약 1/10이고, 에어컨·전기차·공장 모터가 더 큽니다. 그래도 빅테크는 원전까지 찾아갑니다: MS는 멈췄던 스리마일섬 원전 1호기를 다시 돌려 20년간 전기를 사기로 했고(2024.9), 메타는 원자력 최대 6.6GW를 확보했습니다(2026.1).\n질문: “AI 한 번 물어볼 때 쓰는 전기, 누가 어디서 만들어야 할까요?”',
      html: `
        <style>
          #f-capex-energy .stage{word-break:keep-all}
          #f-capex-energy .lede{font-size:30px}
          #f-capex-energy .cx{left:92px;top:296px;width:640px}
          #f-capex-energy .pw{position:absolute;left:808px;top:384px;width:700px}
          #f-capex-energy .pw-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px}
          #f-capex-energy .p-svg{display:block;cursor:pointer}
          #f-capex-energy .p-svg .yl{font-family:var(--font-mono);font-size:24px;font-weight:600;fill:var(--ink)}
          #f-capex-energy .p-svg .vl{font-family:var(--font-mono);font-size:24px;font-weight:600;fill:var(--ink)}
          #f-capex-energy .p-svg .rl{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
          #f-capex-energy .p-svg .hn{font-family:var(--font-hand);font-size:32px;fill:var(--pen)}
          #f-capex-energy .say{font-size:25px;line-height:1.36;margin-top:14px;min-height:68px}
          #f-capex-energy svg.chart text{font-size:20px}
          #f-capex-energy svg.chart text.big{font-size:26px}
          #f-capex-energy svg.chart text.hand{font-size:32px}
        </style>
        <div class="kicker">보충 · 땅과 전기</div>
        <h2 class="title">데이터센터와 전기</h2>
        <p class="lede">AI는 결국 <span class="mark">건물과 전기</span>로 만든다.</p>
        <div class="abs cx">
          <div class="small" style="margin-bottom:2px"><b>빅테크 4사 AI 설비투자</b> <span class="muted">아마존·MS·구글·메타 · 달러</span></div>
          ${capexChart()}
        </div>
        <div class="abs" style="left:830px;top:56px">${K.photo('datacenter', '데이터센터 <small>CERN, 2009</small>', 'wide', '--w:380px;--ratio:3/2;--tilt:-2deg')}</div>
        <div class="abs sticky" style="left:1240px;top:92px;width:270px;font-size:36px;--tilt:3deg">스타게이트<br><span style="font-size:30px">4년간 5,000억 달러 · 10GW (2025.1 발표)</span><br><span class="mono" style="font-size:20px;line-height:1.25;display:block;margin-top:6px">2026.4 텍사스 애빌린 첫 단지, 실제 가동 약 0.3GW (Epoch 추정)</span></div>
        <div class="abs demo pw">
          <div class="pw-h"><span class="small"><b>데이터센터 전기</b> <span class="muted">TWh/년</span></span><span class="btns p-yr" style="gap:8px"></span></div>
          <svg class="p-svg" viewBox="0 0 700 282" width="700" height="282" aria-label="전 세계 데이터센터 전기 사용량: 2024년 415, 2030년 945, 2035년 약 1,200 TWh"></svg>
          <div class="say p-say"></div>
        </div>
        <div class="src">출처: Platformonomics·mlq.ai(4사 설비투자) · *2023: S&P Global·Omni Calculator(집계마다 다름) · Data Center Knowledge 2026.2(IT 외 대기업 21곳) · OpenAI 2025.1·Epoch AI(스타게이트) · IEA Energy and AI 2025(415·945·1,200TWh, 일본 비교, 지역 비중) · Utility Dive·NucNet(스리마일섬) · TechInformed(메타)</div>`,
      init(el) {
        const svg = el.querySelector('.p-svg'), say = el.querySelector('.p-say'), yrs = el.querySelector('.p-yr');
        const L = 84, BW = 440, MAX = 1750, sx = (v) => L + (v / MAX) * BW;
        const RY = (i) => 14 + i * 84, BH = 52, TY = BH / 2 + 9;
        yrs.innerHTML = POWER.map((y, i) => `<button class="chip${i ? '' : ' on'}" data-i="${i}">${y.k}</button>`).join('');
        let s = '';
        // light grid every 500 TWh
        [500, 1000, 1500].forEach((v) => { s += `<line x1="${sx(v)}" x2="${sx(v)}" y1="2" y2="${RY(2) + BH + 4}" style="stroke:var(--grid-line);stroke-width:2"/>`; });
        s += `<line x1="${L}" x2="${L}" y1="2" y2="${RY(2) + BH + 4}" style="stroke:var(--ink-3);stroke-width:2"/>`;
        POWER.forEach((p, i) => {
          const y = RY(i);
          s += `<g class="p-row" data-i="${i}"><rect x="0" y="${y - 10}" width="700" height="${BH + 20}" style="fill:transparent"/>`;
          s += `<text class="yl" x="0" y="${y + TY}">${p.yr}</text>`;
          if (p.lo) {
            s += `<rect x="${sx(p.lo)}" y="${y - 3}" width="${sx(p.hi) - sx(p.lo)}" height="${BH + 6}" style="fill:none;stroke:var(--ink-3);stroke-width:2;stroke-dasharray:6 5"/>`;
            s += `<text class="rl" x="${sx(p.hi)}" y="${y + BH + 26}" text-anchor="end">점선 = 전망 범위 700~1,700</text>`;
          }
          s += `<rect class="p-bar" x="${L}" y="${y}" height="${BH}" width="${sx(p.v) - L}" style="stroke-width:2.5"/>`;
          s += `<text class="vl" x="${(p.lo ? sx(p.hi) : sx(p.v)) + 12}" y="${y + TY}">${p.lo ? '약 ' : ''}${p.v.toLocaleString('ko-KR')}</text>`;
          if (i === 1) s += `<text class="hn" data-fit="32,${Math.floor(696 - sx(p.v) - 80)}" x="${sx(p.v) + 80}" y="${y + TY + 1}">= 일본 한 나라 전체 + 조금</text>`;
          s += '</g>';
        });
        svg.innerHTML = s;
        const rows = Array.from(svg.querySelectorAll('.p-row')), bars = rows.map((r) => r.querySelector('.p-bar'));
        let sel = 0, grow = 1;
        const draw = () => {
          bars.forEach((b, i) => {
            const on = i === sel, full = sx(POWER[i].v) - L, wd = (on ? full * K.easeOut(grow) : full).toFixed(1);
            if (b.getAttribute('width') !== wd) b.setAttribute('width', wd); // an unchanged rewrite still repaints the bar
            b.style.fill = on ? 'var(--hl)' : 'var(--paper-3)';
            b.style.stroke = on ? 'var(--ink)' : 'var(--ink-3)';
          });
        };
        const pick = (i) => {
          sel = i; grow = 0;
          say.innerHTML = POWER[i].say;
          yrs.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', +c.dataset.i === i));
          draw();
        };
        yrs.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) pick(+b.dataset.i); });
        svg.addEventListener('click', (e) => { const r = e.target.closest('.p-row'); if (r) pick(+r.dataset.i); });
        K.loop(el, (t, dt) => { if (grow >= 1) return; grow = Math.min(1, grow + dt / 0.7); draw(); });
        pick(0); grow = 1; draw();
        fitFrame(el); onFonts(() => fitFrame(el));
      },
      enter(el) { relayoutSvgText(el); fitFrame(el); },
    },

    /* ───── 5 ───── */
    {
      id: 'korea-chips',
      title: '금광에서 곡괭이를 판 나라',
      minutes: 1,
      notes: '골드러시 때 돈을 확실히 번 건 금을 캔 사람보다 곡괭이를 판 사람이었다는 말이 있습니다. AI 붐의 곡괭이 중 하나가 HBM, 한국이 제일 잘 만드는 메모리입니다.\n슬라이더로 층 수를 바꿔 보세요. HBM(고대역폭 메모리)은 D램 칩을 아파트처럼 쌓고 TSV라는 수직 통로로 꿰어 GPU 바로 옆에 붙인 것입니다. 맨 아래 층은 데이터를 주고받는 제어 칩(베이스 다이)입니다. 바닥 면적은 그대로인데 용량은 층 수만큼 늘고, GPU까지 가는 길은 짧고 넓어집니다.\nSK하이닉스의 점유율이 64%에서 50%로 내려오고 삼성이 33%로 따라온 것도 짚어 주세요.\n→ 키로 GPU 26만 장 소식과 진로 한 줄을 차례로 띄웁니다. 말로 덧붙일 것: 2026년 9월 반도체 수출은 603억 달러(1년 전의 약 3.6배)로, 반도체 하나가 한국 한 달 수출의 절반(49.9%)이었습니다. 정부의 ‘국가대표 AI 모델’은 5팀이 출발(2025.8)해 2차 평가에서 업스테이지·SK텔레콤·LG AI연구원 3팀이 통과했습니다(2026.8).\n질문: “반도체, 데이터센터·전력, AI 서비스 — 이 셋 중 여러분은 어디에 서 보고 싶나요?”',
      html: `
        <style>
          #f-korea-chips .stage{word-break:keep-all}
          #f-korea-chips .hb{position:absolute;left:92px;top:190px;width:700px}
          #f-korea-chips .hb .ph{position:absolute;right:-6px;top:4px}
          #f-korea-chips .hb-ctl{display:grid;grid-template-columns:300px 1fr;gap:26px;align-items:center;margin-top:8px}
          #f-korea-chips .hb-say{font-size:24px;line-height:1.35}
          #f-korea-chips .rc{left:870px;width:638px}
          #f-korea-chips .sh-h{display:flex;justify-content:space-between;align-items:baseline}
          #f-korea-chips .lg{display:flex;gap:16px;font-family:var(--font-mono);font-size:20px;color:var(--ink-2)}
          #f-korea-chips .lg i{display:inline-block;width:16px;height:16px;margin-right:6px;vertical-align:-2px}
          #f-korea-chips .sr{display:grid;grid-template-columns:116px 1fr;align-items:center;gap:12px;margin-top:12px}
          #f-korea-chips .sr span{font-family:var(--font-mono);font-size:21px;color:var(--ink-2)}
          #f-korea-chips .sb{display:flex;height:48px;font-family:var(--font-mono);font-size:24px;font-weight:600}
          #f-korea-chips .sb div{display:flex;align-items:center;padding-left:8px;overflow:hidden;white-space:nowrap}
          #f-korea-chips .s1{background:var(--ink);color:var(--paper)}
          #f-korea-chips .s2{background:var(--pen);color:var(--paper)}
          #f-korea-chips .s3{background:var(--paper-3);color:var(--ink)}
          #f-korea-chips .st b{font-family:var(--font-mono);font-weight:600;font-size:68px;line-height:1;letter-spacing:-0.03em;display:block}
          #f-korea-chips .st span{font-size:22px;color:var(--ink-2);line-height:1.3;display:block;margin-top:8px}
          #f-korea-chips .gp{display:flex;gap:14px;margin-top:14px}
          #f-korea-chips .gp > div{display:flex;flex-direction:column;align-items:center;gap:6px}
          #f-korea-chips .gp .sq{display:flex;gap:3px}
          #f-korea-chips .gp i{width:18px;height:18px;border:2px solid var(--ink);display:block}
          #f-korea-chips .gp span{font-size:20px;color:var(--ink-2);white-space:nowrap}
          #f-korea-chips .jobs{left:92px;top:748px;width:1416px;display:flex;align-items:center;gap:18px}
          #f-korea-chips .jobs .box{padding:6px 18px;font-size:24px;line-height:1.2}
          #f-korea-chips .jobs .box small{display:block;font-size:20px;color:var(--ink-2)}
        </style>
        <div class="kicker">한국 · 메모리 반도체 · HBM = D램을 층층이 쌓은 메모리</div>
        <h2 class="title md">금광에서 곡괭이를 판 나라</h2>
        <div class="abs demo hb">
          <div class="hb-c" style="height:400px"></div>
          <div class="ph">${K.photo('hbm', 'GPU + HBM 4개', 'sm', '--w:210px;--ratio:3/2;--tilt:3deg')}</div>
          <div class="hb-ctl">
            <div class="field"><label>D램 칩 쌓기 <output class="h-out">12층</output></label><input type="range" class="h-range" min="4" max="16" step="1" value="12" aria-label="층 수"></div>
            <div class="hb-say h-say"></div>
          </div>
        </div>
        <div class="abs rc" style="top:64px">
          <div class="sh-h"><span class="small"><b>HBM 시장 점유율</b> <span class="muted">매출</span></span><span class="lg"><span><i class="s1"></i>SK하이닉스</span><span><i class="s2"></i>삼성</span><span><i class="s3" style="border:1px solid var(--ink-3)"></i>마이크론</span></span></div>
          <div class="sr"><span>25년 2분기</span><div class="sb"><div class="s1" style="width:64%">64%</div><div class="s2" style="width:15%">15</div><div class="s3" style="width:21%">21</div></div></div>
          <div class="sr"><span>26년 1분기</span><div class="sb"><div class="s1" style="width:58%">58%</div><div class="s2" style="width:21%">21</div><div class="s3" style="width:21%">21</div></div></div>
          <div class="sr"><span>26년 2분기</span><div class="sb"><div class="s1" style="width:50%">50%</div><div class="s2" style="width:33%">33%</div><div class="s3" style="width:17%">18</div></div></div>
        </div>
        <div class="abs rc row" style="top:318px;gap:40px">
          <div class="st"><b>83.3<span style="display:inline;font-size:34px;color:var(--ink)">조 원</span></b><span>SK하이닉스 2026년 3분기<br>영업이익 · 이익률 약 80%</span></div>
          <div class="st"><b>107.4<span style="display:inline;font-size:34px;color:var(--ink)">조 원</span></b><span>삼성전자 2026년 3분기<br>영업이익 · 국내 첫 분기 100조</span></div>
        </div>
        <div class="abs rc" style="top:540px" data-step="1">
          <div style="font-size:26px;display:flex;justify-content:space-between;align-items:baseline"><span><b>NVIDIA GPU 26만 장</b> <span class="muted">한국에 공급 약속</span></span><span class="mono faint" style="font-size:20px">APEC 2025.10.31</span></div>
          <div class="gp k-gp"></div>
        </div>
        <div class="abs jobs" data-step="2">
          <span class="hand" style="font-size:44px">여러분의 자리는?</span>
          <div class="box">반도체<small>설계 · 공정 · 장비</small></div><span class="hand" style="font-size:40px">→</span>
          <div class="box">인프라<small>데이터센터 · 전력 · 네트워크</small></div><span class="hand" style="font-size:40px">→</span>
          <div class="box pen">AI 서비스<small>모델을 써서 앱 · 서비스 만들기</small></div>
        </div>
        <div class="src">출처: Counterpoint · Korea JoongAng Daily(HBM 점유율) · CNBC·TrendForce 2026.10.28(SK하이닉스) · 삼성전자 뉴스룸 2026.10.29(삼성 실적) · Korea Times·Analytics India(APEC GPU) · 뉴시스·파이낸셜뉴스·korea.kr(국가대표 AI) · MTN 2026.10.1(9월 수출, +262.8%)</div>`,
      init(el) {
        const c = K.canvas(el.querySelector('.hb-c'), 700, 400);
        const range = el.querySelector('.h-range'), out = el.querySelector('.h-out'), say = el.querySelector('.h-say');
        let shown = 12, target = 12;
        const text = () => { out.textContent = target + '층'; say.innerHTML = `면적은 그대로, 용량은 <b class="mark">${target}배</b><br>GPU 바로 옆: 길이 짧고 넓다`; };
        const draw = () => drawHBM(c, shown);
        range.addEventListener('input', () => { target = +range.value; text(); });
        K.loop(el, (t, dt) => {
          if (shown === target) return;
          const d = target - shown, step = dt * 7;
          shown = Math.abs(d) <= step ? target : shown + Math.sign(d) * step;
          draw();
        });
        // GPU unit chart: 26 squares, each 10,000 GPUs
        const gp = el.querySelector('.k-gp');
        const grp = [['정부', 5, 'var(--pen)'], ['삼성', 5, 'var(--ink)'], ['SK', 5, 'var(--ink-2)'], ['현대차', 5, 'var(--ink-3)'], ['네이버클라우드', 6, 'var(--hl)']];
        gp.innerHTML = grp.map(([nm, n, col]) => `<div><div class="sq">${('<i style="background:' + col + '"></i>').repeat(n)}</div><span>${nm} ${n}만</span></div>`).join('');
        K.onTheme(draw);
        text(); draw();
        fitFrame(el); onFonts(() => fitFrame(el));
      },
      enter(el) { fitFrame(el); },
    },

    /* ───── 6 ───── */
    {
      id: 'bubble',
      title: '거품일까?',
      minutes: 1,
      notes: '1교시 ‘AI의 여름과 겨울’ 곡선 기억나죠? 그때 질문이 “다음 겨울이 온다면 무엇 때문일까?”였는데, 오늘의 유력한 후보가 바로 이 거품 논쟁입니다.\n2000년 닷컴 버블 때 1등 회사는 시스코였습니다. 인터넷 장비를 팔던 회사로, 지금의 NVIDIA처럼 “곡괭이 장수”였죠. 시스코 주가는 2000년 3월 꼭대기에서 2002년 10월까지 약 90% 떨어졌고, 그 값을 다시 넘은 건 25년 뒤인 2025년 12월이었습니다. NVIDIA는 10월 최고점보다 약 22% 내려와 있지만(11.6 기준), 끝이 어딘지는 아무도 모릅니다.\n저울 양쪽 근거를 하나씩 읽고, 학생들에게 손을 들게 한 뒤 사람 수만큼 버튼을 누르세요. 저울이 투표 쪽으로 기웁니다. “초기화”로 다시 시작할 수 있습니다.\n→ 키로 마지막 문장을 띄웁니다: 닷컴 버블은 터졌지만 인터넷은 남았고, 그 위에서 지금의 회사들이 자랐습니다. AI 겨울에도 연구는 남았던 것처럼, 거품이 꺼져도 기술 자체는 남을 가능성이 큽니다.\n질문: “주가가 떨어지면 AI 기술도 사라질까요?”',
      html: `
        <style>
          #f-bubble .stage{word-break:keep-all}
          #f-bubble .lede{font-size:28px;max-width:640px;line-height:1.4}
          #f-bubble .cc{left:760px;top:60px;width:748px}
          #f-bubble .scl{position:absolute;left:92px;top:338px;width:1416px;height:420px}
          #f-bubble .scl svg{position:absolute;left:0;top:0;overflow:visible}
          #f-bubble .pan{position:absolute;width:430px;display:flex;flex-direction:column;gap:8px;will-change:transform}
          #f-bubble .pan h3{font-family:var(--font-display);font-weight:800;font-size:36px;line-height:1;text-align:center;margin:0 0 2px}
          #f-bubble .pan .cd{background:var(--paper);border:2.5px solid var(--ink);border-radius:12px 4px 10px 4px / 4px 10px 4px 12px;padding:6px 14px;font-size:22px;line-height:1.3}
          #f-bubble .vote{position:absolute;left:518px;top:100px;width:380px;display:flex;flex-direction:column;gap:12px;align-items:stretch}
          #f-bubble .vote .btn{font-size:27px;display:flex;justify-content:space-between;align-items:center;padding:10px 20px;background:var(--paper)}
          #f-bubble .vote .btn b{font-family:var(--font-mono);font-size:30px}
          #f-bubble .vote .btn:hover{background:linear-gradient(var(--hl-soft),var(--hl-soft)),var(--paper)}
          #f-bubble .vote .btn:active{background:var(--ink);color:var(--paper)}
          #f-bubble .v-msg{font-family:var(--font-hand);font-size:34px;color:var(--pen);text-align:center;min-height:38px;line-height:1.1;background:var(--paper);padding:2px 6px;align-self:center;white-space:nowrap;max-width:100%}
          #f-bubble .end{left:92px;right:92px;top:768px;text-align:center;font-size:54px}
        </style>
        <div class="kicker">2000년과 2026년</div>
        <h2 class="title">거품일까?</h2>
        <p class="lede">닷컴 버블의 1등 시스코는 꼭대기에서 약 90% 떨어졌고, 그 주가를 다시 넘는 데 <span class="mark" style="color:var(--ink)">25년</span> 걸렸다(2025.12).</p>
        <div class="abs cc">${ciscoChart()}</div>
        <div class="abs demo scl">
          <svg class="b-svg" width="1416" height="420" viewBox="0 0 1416 420"></svg>
          <div class="pan b-pl"><h3 class="bad">거품이다</h3>${REASONS.yes.map((t) => `<div class="cd">${t}</div>`).join('')}</div>
          <div class="pan b-pr"><h3 class="good">아니다</h3>${REASONS.no.map((t) => `<div class="cd">${t}</div>`).join('')}</div>
          <div class="vote">
            <div class="v-msg b-msg"></div>
            <button class="btn" data-v="0"><span>거품이다</span><b class="b-n0">0</b></button>
            <button class="btn" data-v="1"><span>아니다</span><b class="b-n1">0</b></button>
            <button class="btn" data-v="2"><span>모르겠음</span><b class="b-n2">0</b></button>
            <button class="btn sm ghost b-reset" style="align-self:center;justify-content:center">초기화</button>
          </div>
        </div>
        <div class="abs end hand lg" data-step="1">닷컴 버블은 터졌지만, <span class="mark" style="color:var(--pen)">인터넷은 남았다.</span></div>
        <div class="src">출처: 시스코 EBSCO·Reuters 2000.3 · Barron's·Barchart 2025.12(종가 80.06→8.12달러, 2025.12.10 회복) · NVIDIA Motley Fool 2026.10.6·CNBC 2026.11.5·FY27 2분기 실적 · Entrepreneur 2025.8 · phys.org/The Conversation 2026.10.18(55.2%) · CNBC·Meta IR 2026.10 · Microsoft·Amazon IR · TrendForce 2026.10.28</div>`,
      init(el) {
        const svg = el.querySelector('.b-svg'), pl = el.querySelector('.b-pl'), pr = el.querySelector('.b-pr'), msg = el.querySelector('.b-msg');
        const PX = 708, PY = 34, HALF = 474, DROP = 30;
        svg.innerHTML = `
          <path d="M${PX},${PY} V398" style="stroke:var(--ink);stroke-width:6;fill:none;stroke-linecap:round"/>
          <path d="M${PX - 120},404 Q${PX},384 ${PX + 120},404 Z" style="fill:var(--paper-2);stroke:var(--ink);stroke-width:4"/>
          <g class="b-beam"><path d="M${PX - HALF},${PY} L${PX + HALF},${PY}" style="stroke:var(--ink);stroke-width:7;stroke-linecap:round"/>
            <circle cx="${PX - HALF}" cy="${PY}" r="7" style="fill:var(--ink)"/><circle cx="${PX + HALF}" cy="${PY}" r="7" style="fill:var(--ink)"/></g>
          <circle cx="${PX}" cy="${PY}" r="12" style="fill:var(--hl);stroke:var(--ink);stroke-width:3"/>
          <g class="b-strL" style="stroke:var(--ink-2);stroke-width:2;fill:none"></g><g class="b-strR" style="stroke:var(--ink-2);stroke-width:2;fill:none"></g>`;
        const beam = svg.querySelector('.b-beam'), sL = svg.querySelector('.b-strL'), sR = svg.querySelector('.b-strR');
        let votes = K.store.get('money-bubble-vote', [0, 0, 0]);
        let ang = 0, target = 0;
        const W = 430;
        const layout = () => {
          // read the pan heights before this call's writes (transforms do not change them), so the read
          // does not force a style recalc on every frame of the swing
          const hL = pl.offsetHeight || 300, hR = pr.offsetHeight || 300;
          const a = (ang * PI) / 180, ex = Math.cos(a) * HALF, ey = Math.sin(a) * HALF;
          beam.setAttribute('transform', `rotate(${ang.toFixed(2)} ${PX} ${PY})`);
          const lx = PX - ex, ly = PY - ey, rx = PX + ex, ry = PY + ey;
          pl.style.transform = `translate(${(lx - W / 2).toFixed(1)}px,${(ly + DROP).toFixed(1)}px)`;
          pr.style.transform = `translate(${(rx - W / 2).toFixed(1)}px,${(ry + DROP).toFixed(1)}px)`;
          sL.innerHTML = `<path d="M${lx},${ly} L${lx - W / 2 + 16},${ly + DROP + 18} M${lx},${ly} L${lx + W / 2 - 16},${ly + DROP + 18}"/><path d="M${lx - W / 2 - 8},${ly + DROP + hL + 6} Q${lx},${ly + DROP + hL + 30} ${lx + W / 2 + 8},${ly + DROP + hL + 6}" style="stroke:var(--ink);stroke-width:4"/>`;
          sR.innerHTML = `<path d="M${rx},${ry} L${rx - W / 2 + 16},${ry + DROP + 18} M${rx},${ry} L${rx + W / 2 - 16},${ry + DROP + 18}"/><path d="M${rx - W / 2 - 8},${ry + DROP + hR + 6} Q${rx},${ry + DROP + hR + 30} ${rx + W / 2 + 8},${ry + DROP + hR + 6}" style="stroke:var(--ink);stroke-width:4"/>`;
        };
        const render = () => {
          for (let i = 0; i < 3; i++) el.querySelector('.b-n' + i).textContent = votes[i];
          const tot = votes[0] + votes[1] + votes[2];
          // the scale leans toward the heavier side: more "거품이다" votes pull the left pan down (negative angle)
          target = tot ? K.clamp(((votes[1] - votes[0]) / Math.max(4, tot)) * 7, -7, 7) : 0;
          msg.textContent = !tot ? '손 든 사람 수만큼 클릭!' : votes[0] > votes[1] ? `우리 반 ${tot}명: 거품 쪽으로 기울었다` : votes[1] > votes[0] ? `우리 반 ${tot}명: 아니다 쪽으로 기울었다` : `우리 반 ${tot}명: 팽팽하다`;
          fitLine(msg, 20); // one line, or the vote column grows into the closing line
          K.store.set('money-bubble-vote', votes);
        };
        el.querySelector('.vote').addEventListener('click', (e) => {
          const b = e.target.closest('button'); if (!b) return;
          if (b.classList.contains('b-reset')) votes = [0, 0, 0]; else votes[+b.dataset.v]++;
          render();
        });
        K.loop(el, (t, dt) => {
          if (Math.abs(target - ang) < 0.02) { if (ang !== target) { ang = target; layout(); } return; }
          ang += (target - ang) * Math.min(1, dt * 4);
          layout();
        });
        render(); ang = target; layout();
        el.__layoutScale = layout;
        K.onTheme(layout);
        onFonts(() => fitLine(msg, 20));
      },
      enter(el) { relayoutSvgText(el); el.__layoutScale && el.__layoutScale(); fitLine(el.querySelector('.b-msg'), 20); },
    },
  ]);
})();
