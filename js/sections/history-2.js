/* History, part 2 (1989 → 2016): LeNet, Deep Blue, ImageNet, AlexNet, the DNNresearch auction,
   GAN, AlphaGo (two frames) and the 1교시 wrap-up with a break timer.
   Every demo starts complete, draws with theme tokens, and animates only through Kit.loop. */
(function () {
  'use strict';

  const fmt = (n) => Math.round(n).toLocaleString('ko-KR');

  /* ───────── y1989 helpers: a handwritten "3" rasterised from a pen stroke, and 3×3 convolution ───────── */
  function catmull(P, step) {
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
      for (let t = 0; t < 1; t += step) {
        const t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(P[P.length - 1]);
    return out;
  }
  function segDist(px, py, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / L));
    const x = a[0] + t * dx - px, y = a[1] + t * dy - py;
    return Math.sqrt(x * x + y * y);
  }
  function makeDigit3() {
    const P = [[8, 7.6], [11.6, 5.3], [16.4, 5.2], [19.4, 7.6], [18.9, 11], [15.6, 13.2], [12.2, 13.9],
      [15.9, 14.5], [19.3, 16.8], [20, 20.2], [17.4, 22.9], [12.6, 23.5], [8.1, 21.5]];
    const pts = catmull(P, 0.08);
    const img = new Float32Array(784);
    for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
      let d = 99;
      for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, segDist(x + 0.5, y + 0.5, pts[i], pts[i + 1]));
      img[y * 28 + x] = Kit.clamp(1 - (d - 1.15) / 1.05, 0, 1);
    }
    return img;
  }
  const FILTERS = {
    v: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
    h: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    e: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  };
  function conv(img, k) {
    const out = new Float32Array(676);
    for (let y = 0; y < 26; y++) for (let x = 0; x < 26; x++) {
      let s = 0;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += k[i * 3 + j] * img[(y + i) * 28 + x + j];
      out[y * 26 + x] = s;
    }
    return out;
  }

  /* ───────── y1997 helpers ───────── */
  function sig(v) { return v >= 10 ? Math.round(v) : Math.round(v * 10) / 10; }
  function humanTime(sec) {
    if (sec < 1) return '1초도 안 걸림';
    if (sec < 60) return sig(sec) + '초';
    if (sec < 3600) return sig(sec / 60) + '분';
    if (sec < 86400) return sig(sec / 3600) + '시간';
    const days = sec / 86400;
    if (days < 365) return fmt(sig(days)) + '일';
    const y = days / 365.25;
    if (y < 1e4) return fmt(sig(y)) + '년';
    if (y < 1e8) return sig(y / 1e4) + '만 년';
    if (y < 1e12) return sig(y / 1e8) + '억 년';
    return sig(y / 1e12).toLocaleString('ko-KR') + '조 년';
  }
  function sciHTML(big) {
    const s = big.toString();
    const e = s.length - 1;
    if (e < 6) return big.toLocaleString('en-US');
    const m = (parseInt(s.slice(0, 3), 10) / 100).toFixed(1);
    return `≈ ${m} × 10<sup>${e}</sup>`;
  }

  /* ───────── y2012 helper: a taped print zoomed onto the face, for sources that are wide shots.
     face = [imgW, imgH, faceX, faceY, headWidth] (fractions of the image; same data and math as
     players-1 tapedFace, kept local until that helper moves into kit.js) ───────── */
  function zoomedPhoto(id, caption, cls, w, face, head) {
    const [W, H, fx, fy, hw] = face;
    const iw = w - 24, ih = iw * 1.25; // .photo has 12px side padding; 4:5 print like Kit.photo
    const s = Math.max((head * iw) / (hw * W), iw / W, ih / H);
    const dw = W * s, dh = H * s;
    const x = Math.min(0, Math.max(iw - dw, iw / 2 - fx * dw));
    const y = Math.min(0, Math.max(ih - dh, ih * 0.4 - fy * dh));
    return `<figure class="photo zoomed ${cls || ''}" style="--w:${w}px"><span class="zf" style="height:${ih.toFixed(1)}px"><img src="${Kit.img(id)}" alt="${Kit.escape(caption)}" draggable="false" style="width:${dw.toFixed(1)}px;height:${dh.toFixed(1)}px;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px"></span><figcaption>${caption}</figcaption></figure>`;
  }

  /* ───────── y2014 helpers: the "real" picture (a house) and the generator's attempt at round r ───────── */
  const HOUSE = (function () {
    const a = new Float32Array(196);
    const set = (x, y) => { a[y * 14 + x] = 1; };
    for (let r = 1; r <= 5; r++) for (let x = 7 - r; x <= 6 + r; x++) set(x, r);
    for (let y = 6; y <= 12; y++) for (let x = 3; x <= 10; x++) set(x, y);
    for (let y = 7; y <= 8; y++) for (let x = 4; x <= 5; x++) a[y * 14 + x] = 0;
    for (let y = 9; y <= 12; y++) for (let x = 7; x <= 8; x++) a[y * 14 + x] = 0;
    for (let x = 0; x < 14; x++) set(x, 13);
    return a;
  })();
  const HOUSE_BLUR = (function () {
    const b = new Float32Array(196);
    for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
      let s = 0, n = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const X = x + dx, Y = y + dy;
        if (X >= 0 && X < 14 && Y >= 0 && Y < 14) { s += HOUSE[Y * 14 + X]; n++; }
      }
      b[y * 14 + x] = s / n;
    }
    return b;
  })();
  const ganQ = (r) => 1 - Math.exp(-r / 50);
  function fakeAt(r) {
    const rnd = Kit.rand(r * 7919 + 13);
    const q = ganQ(r);
    const out = new Float32Array(196);
    for (let i = 0; i < 196; i++) {
      const tgt = HOUSE_BLUR[i] * (1 - q) + HOUSE[i] * q;
      out[i] = Kit.clamp(Kit.lerp(rnd(), tgt, Math.min(1, q * 1.1)) + (rnd() - 0.5) * 0.3 * (1 - q), 0, 1);
    }
    return out;
  }
  function drawPixels(ctx, data, x0, y0, cell, C, frame) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(x0, y0, cell * 14, cell * 14);
    ctx.fillStyle = C.ink;
    for (let i = 0; i < 196; i++) {
      if (data[i] < 0.04) continue;
      ctx.globalAlpha = data[i];
      ctx.fillRect(x0 + (i % 14) * cell, y0 + ((i / 14) | 0) * cell, cell, cell);
    }
    ctx.globalAlpha = 1;
    if (frame !== false) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, cell * 14, cell * 14); }
  }
  function arrow(ctx, x1, y1, x2, y2, C, opt) {
    opt = opt || {};
    ctx.strokeStyle = opt.color || C.ink; ctx.fillStyle = opt.color || C.ink; ctx.lineWidth = opt.width || 3;
    Kit.sketchLine(ctx, x1, y1, x2, y2, { wobble: 1.2 });
    const a = Math.atan2(y2 - y1, x2 - x1), h = 14;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42));
    ctx.lineTo(x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42));
    ctx.closePath(); ctx.fill();
  }

  /* ───────── y2016 helpers: a 9×9 schematic board ───────── */
  const BOARD = {
    37: {
      stones: [[2, 2, 'w'], [6, 6, 'w'], [2, 6, 'b'], [6, 2, 'b'], [6, 4, 'w'], [7, 5, 'b'], [2, 4, 'b'], [5, 6, 'b'], [3, 2, 'w']],
      move: [5, 3, 'b', '37'],
      note: '사람이라면 안 둘 자리',
      at: [418, 24],
      arrow: 'M296,34 Q262,72 258,136',
    },
    78: {
      stones: [[3, 3, 'b'], [4, 3, 'b'], [5, 4, 'b'], [3, 5, 'b'], [5, 5, 'b'], [4, 6, 'b'], [2, 4, 'w'], [3, 4, 'w'], [6, 4, 'w'], [6, 5, 'w'], [2, 2, 'w'], [6, 6, 'b']],
      move: [4, 4, 'w', '78'],
      note: '가운데로 끼워 넣은 수',
      at: [418, 24],
      arrow: 'M300,34 Q262,120 241,184',
    },
  };
  function boardSVG(key) {
    const cfg = BOARD[key];
    const g0 = 35, sp = 45, end = g0 + sp * 8;
    let s = `<rect x="${g0}" y="${g0}" width="${sp * 8}" height="${sp * 8}" class="bd-edge"/>`;
    for (let i = 1; i < 8; i++) {
      s += `<line x1="${g0}" y1="${g0 + i * sp}" x2="${end}" y2="${g0 + i * sp}" class="bd-ln"/><line x1="${g0 + i * sp}" y1="${g0}" x2="${g0 + i * sp}" y2="${end}" class="bd-ln"/>`;
    }
    [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]].forEach(([x, y]) => { s += `<circle cx="${g0 + x * sp}" cy="${g0 + y * sp}" r="5" class="bd-star"/>`; });
    cfg.stones.forEach(([x, y, c]) => { s += `<circle cx="${g0 + x * sp}" cy="${g0 + y * sp}" r="19" class="st-${c}"/>`; });
    const [mx, my, mc, label] = cfg.move;
    const cx = g0 + mx * sp, cy = g0 + my * sp;
    s += `<circle cx="${cx}" cy="${cy}" r="31" class="bd-ring"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="19" class="st-${mc}"/>`;
    s += `<text x="${cx}" y="${cy + 6}" class="st-num st-num-${mc}">${label}</text>`;
    s += `<path d="${cfg.arrow}" class="bd-arrow"/>`;
    s += `<text x="${cfg.at[0]}" y="${cfg.at[1]}" class="bd-note" text-anchor="end">${cfg.note}</text>`;
    return s;
  }

  /* ───────── y2016b helpers: a tiny PUCT tree search (illustrative model, not AlphaGo's real numbers) ───────── */
  function mctsModel() {
    const kids = [
      { name: 'A', P: 0.34, V: 0.46 }, { name: 'B', P: 0.24, V: 0.62 }, { name: 'C', P: 0.19, V: 0.42 },
      { name: 'D', P: 0.14, V: 0.54 }, { name: 'E', P: 0.09, V: 0.33 },
    ];
    kids.forEach((k) => {
      k.N = 0; k.W = 0;
      k.kids = [0.5, 0.3, 0.2].map((p, j) => ({ P: p, V: Kit.clamp(k.V + [-0.05, 0.04, 0.08][j], 0, 1), N: 0, W: 0 }));
    });
    return { N: 0, kids };
  }
  function mctsStep(root, rnd) {
    const c = 1.5;
    const pick = (node, flip) => {
      let best = null, bs = -1e9;
      const sq = Math.sqrt(node.N + 1);
      node.kids.forEach((k) => {
        const q = k.N ? k.W / k.N : 0.5;
        const u = (flip ? 1 - q : q) + (c * k.P * sq) / (1 + k.N);
        if (u > bs) { bs = u; best = k; }
      });
      return best;
    };
    const a = pick(root, false);
    const path = [root.kids.indexOf(a)];
    let v;
    if (a.N === 0) v = Kit.clamp(a.V - 0.02 + Kit.gauss(rnd) * 0.06, 0, 1);
    else {
      const r = pick(a, true);
      path.push(a.kids.indexOf(r));
      v = Kit.clamp(r.V + Kit.gauss(rnd) * 0.05, 0, 1);
      r.N++; r.W += v;
    }
    a.N++; a.W += v; root.N++;
    return path;
  }

  Deck.part('history', 2, [
    /* ─────────────────────────── 1989–1998 · LeNet ─────────────────────────── */
    {
      id: 'y1989',
      year: '1989–1998',
      title: '수표를 읽은 신경망, LeNet',
      minutes: 1.4,
      notes: '1989년 벨 연구소의 얀 르쿤은 손글씨 숫자를 읽는 신경망(CNN)을 만들었고, 1996년부터 은행 수표 판독기에 들어가 2001년 무렵엔 하루 2,000만 장, 미국 수표의 약 10%를 읽었습니다.\n핵심 아이디어는 “작은 돋보기(3×3 필터)로 그림 전체를 훑으며 같은 무늬를 찾는다”입니다. 노란 창이 미끄러지며 오른쪽 특징 맵을 채웁니다.\n클릭: [세로선] → [가로선] → [윤곽선] 순서로 바꿔 보고, 숫자 3 위에 마우스를 올려 창을 직접 움직여 보세요. 참고로 LeNet-5(1998)의 파라미터는 약 6만 개입니다.\n질문: “세로선 필터로 보면 숫자 3의 어느 부분이 밝아질까요?”',
      html: `
        <style>
          #f-y1989 .cv-host canvas { cursor: crosshair; }
          #f-y1989 .stat b { font-size: 70px; }
          #f-y1989 .stat span { font-size: 24px; line-height: 1.35; }
        </style>
        <div class="kicker">1989–1998 · 벨 연구소 → 미국 은행</div>
        <h2 class="title">수표를 읽은 신경망, LeNet</h2>
        <div class="row" style="flex:1;gap:44px;align-items:flex-start">
          <div class="stack" style="width:322px;gap:34px;padding-top:16px">
            ${Kit.photo('lecun', '얀 르쿤', '', '--w:236px;margin-left:24px')}
            <div class="stat"><b>2,000만</b><span>하루에 읽은 수표 (2001년 무렵)<br><span class="mark">미국 수표의 약 10%</span></span></div>
          </div>
          <div class="demo grow">
            <div class="cv-host"></div>
            <div class="row center" style="gap:14px;margin-top:8px">
              <span class="mono muted" style="font-size:20px">필터</span>
              <button class="chip on" data-k="v">세로선 찾기</button>
              <button class="chip" data-k="h">가로선 찾기</button>
              <button class="chip" data-k="e">윤곽선 찾기</button>
              <span class="hand push" style="font-size:36px;margin-left:auto">숫자 위에 마우스를 올려 봐요</span>
            </div>
          </div>
        </div>
        <div class="src">출처: Wikipedia ‘LeNet’ (1989 벨 연구소 우편번호 인식, 1996년 6월 NCR 수표 판독기 배치, 2001년 무렵 하루 2,000만 장·미국 수표 약 10%, LeNet-5 파라미터 약 6만 개)</div>`,
      init(el, K) {
        const IMG = makeDigit3();
        const W = 1046, H = 462, CELL = 14, IX = 2, IY = 40;
        const FC = 52, FX = IX + 392 + 64, FY = IY + 108, OX = W - 2 - 26 * CELL, OY = IY + 14;
        const host = el.querySelector('.cv-host');
        const { cv, ctx } = K.canvas(host, W, H);
        const norm = (m) => { let M = 0; for (let i = 0; i < m.length; i++) M = Math.max(M, Math.abs(m[i])); return M * 0.8 || 1; };
        let key = 'v', cur = conv(IMG, FILTERS.v), curM = norm(cur), prev = cur, prevM = curM;
        let s = 676, hold = 0, hover = null, dirty = true;
        const peakOf = (m) => { let b = 0; for (let i = 1; i < m.length; i++) if (m[i] > m[b]) b = i; return { x: b % 26, y: (b / 26) | 0 }; };
        let peak = peakOf(cur);
        const pos = () => {
          if (hover) return hover;
          if (s >= 676) return peak;
          const i = Math.min(675, Math.floor(s));
          return { x: i % 26, y: (i / 26) | 0 };
        };
        function grid(x0, y0, n) {
          const C = K.colors();
          ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 1; i < n; i++) {
            ctx.moveTo(x0 + i * CELL, y0); ctx.lineTo(x0 + i * CELL, y0 + n * CELL);
            ctx.moveTo(x0, y0 + i * CELL); ctx.lineTo(x0 + n * CELL, y0 + i * CELL);
          }
          ctx.stroke();
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, n * CELL, n * CELL);
        }
        function draw() {
          const C = K.colors();
          const p = pos();
          ctx.clearRect(0, 0, W, H);
          ctx.textBaseline = 'alphabetic';
          ctx.font = `600 21px ${C.fontMono}`; ctx.fillStyle = C.ink2;
          ctx.textAlign = 'left'; ctx.fillText('① 입력 · 28×28 픽셀', IX, 24);
          ctx.fillText('③ 특징 맵 · 26×26', OX, 24);
          ctx.textAlign = 'center'; ctx.fillText('② 필터 3×3', FX + FC * 1.5, FY - 18);
          // input
          ctx.fillStyle = C.paper; ctx.fillRect(IX, IY, 28 * CELL, 28 * CELL);
          ctx.fillStyle = C.hl; ctx.globalAlpha = 0.6;
          ctx.fillRect(IX + p.x * CELL, IY + p.y * CELL, 3 * CELL, 3 * CELL);
          ctx.globalAlpha = 1;
          ctx.fillStyle = C.ink;
          for (let i = 0; i < 784; i++) {
            const v = IMG[i]; if (v < 0.03) continue;
            ctx.globalAlpha = v;
            ctx.fillRect(IX + (i % 28) * CELL, IY + ((i / 28) | 0) * CELL, CELL, CELL);
          }
          ctx.globalAlpha = 1;
          grid(IX, IY, 28);
          // the 3×3 window: paper halo + pen outline so it reads on ink and on paper
          ctx.strokeStyle = C.paper; ctx.lineWidth = 8;
          ctx.strokeRect(IX + p.x * CELL, IY + p.y * CELL, 3 * CELL, 3 * CELL);
          ctx.strokeStyle = C.pen; ctx.lineWidth = 4;
          ctx.strokeRect(IX + p.x * CELL, IY + p.y * CELL, 3 * CELL, 3 * CELL);
          // output
          ctx.fillStyle = C.paper2; ctx.fillRect(OX, OY, 26 * CELL, 26 * CELL);
          ctx.fillStyle = C.hl; ctx.globalAlpha = 0.7; ctx.fillRect(OX + p.x * CELL, OY + p.y * CELL, CELL, CELL); ctx.globalAlpha = 1;
          ctx.fillStyle = C.pen;
          for (let i = 0; i < 676; i++) {
            const a = i < s ? Math.abs(cur[i]) / curM : (Math.abs(prev[i]) / prevM) * 0.38;
            if (a < 0.03) continue;
            ctx.globalAlpha = Math.min(1, a);
            ctx.fillRect(OX + (i % 26) * CELL, OY + ((i / 26) | 0) * CELL, CELL, CELL);
          }
          ctx.globalAlpha = 1;
          grid(OX, OY, 26);
          ctx.strokeStyle = C.paper; ctx.lineWidth = 7;
          ctx.strokeRect(OX + p.x * CELL - 1, OY + p.y * CELL - 1, CELL + 2, CELL + 2);
          ctx.strokeStyle = C.pen; ctx.lineWidth = 3.5;
          ctx.strokeRect(OX + p.x * CELL - 1, OY + p.y * CELL - 1, CELL + 2, CELL + 2);
          // projection lines
          ctx.setLineDash([6, 6]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(IX + (p.x + 3) * CELL, IY + p.y * CELL); ctx.lineTo(FX, FY);
          ctx.moveTo(IX + (p.x + 3) * CELL, IY + (p.y + 3) * CELL); ctx.lineTo(FX, FY + 3 * FC);
          ctx.moveTo(FX + 3 * FC, FY + 1.5 * FC); ctx.lineTo(OX + (p.x + 0.5) * CELL, OY + (p.y + 0.5) * CELL);
          ctx.stroke(); ctx.setLineDash([]);
          // filter
          const k = FILTERS[key];
          ctx.fillStyle = C.paper; ctx.fillRect(FX, FY, 3 * FC, 3 * FC);
          for (let i = 0; i < 9; i++) {
            const x = FX + (i % 3) * FC, y = FY + ((i / 3) | 0) * FC, w = k[i];
            if (w) { ctx.fillStyle = w > 0 ? C.pen : C.bad; ctx.globalAlpha = 0.14; ctx.fillRect(x, y, FC, FC); ctx.globalAlpha = 1; }
            ctx.fillStyle = w > 0 ? C.pen : w < 0 ? C.bad : C.ink3;
            ctx.font = `600 25px ${C.fontMono}`; ctx.textAlign = 'center';
            ctx.fillText(w > 0 ? '+' + w : w < 0 ? '−' + Math.abs(w) : '0', x + FC / 2, y + FC / 2 + 9);
          }
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 1; i < 3; i++) { ctx.moveTo(FX + i * FC, FY); ctx.lineTo(FX + i * FC, FY + 3 * FC); ctx.moveTo(FX, FY + i * FC); ctx.lineTo(FX + 3 * FC, FY + i * FC); }
          ctx.stroke();
          ctx.lineWidth = 3; ctx.strokeRect(FX, FY, 3 * FC, 3 * FC);
          // the multiply-and-add score at the window
          const val = cur[p.y * 26 + p.x];
          ctx.textAlign = 'center';
          ctx.font = `500 21px ${C.fontBody}`; ctx.fillStyle = C.ink2;
          ctx.fillText('곱해서 다 더하면', FX + 1.5 * FC, FY + 3 * FC + 38);
          ctx.font = `600 38px ${C.fontMono}`; ctx.fillStyle = C.ink;
          ctx.fillText((val >= 0 ? '+' : '−') + Math.abs(val).toFixed(1), FX + 1.5 * FC, FY + 3 * FC + 84);
          ctx.textAlign = 'left';
          ctx.font = `500 21px ${C.fontBody}`; ctx.fillStyle = C.ink2;
          ctx.fillText('진할수록 그 무늬가 강하다', OX, OY + 26 * CELL + 32);
        }
        function setFilter(k) {
          if (k === key) { prev = cur; prevM = curM; s = 0; hold = 0; dirty = true; return; }
          key = k; prev = cur; prevM = curM; cur = conv(IMG, FILTERS[k]); curM = norm(cur); peak = peakOf(cur);
          s = hover ? 676 : 0; hold = 0; dirty = true;
          el.querySelectorAll('.chip[data-k]').forEach((c) => c.classList.toggle('on', c.dataset.k === k));
          draw();
        }
        el.querySelectorAll('.chip[data-k]').forEach((c) => c.addEventListener('click', () => setFilter(c.dataset.k)));
        cv.addEventListener('pointermove', (e) => {
          const pt = K.pt(e, cv);
          let cx = -1, cy = -1;
          if (pt.x >= IX && pt.x < IX + 28 * CELL && pt.y >= IY && pt.y < IY + 28 * CELL) {
            cx = K.clamp(Math.floor((pt.x - IX) / CELL) - 1, 0, 25); cy = K.clamp(Math.floor((pt.y - IY) / CELL) - 1, 0, 25);
          } else if (pt.x >= OX && pt.x < OX + 26 * CELL && pt.y >= OY && pt.y < OY + 26 * CELL) {
            cx = Math.floor((pt.x - OX) / CELL); cy = Math.floor((pt.y - OY) / CELL);
          }
          if (cx < 0) { if (hover) { hover = null; dirty = true; } return; }
          if (!hover || hover.x !== cx || hover.y !== cy) { hover = { x: cx, y: cy }; s = 676; dirty = true; draw(); }
        });
        cv.addEventListener('pointerleave', () => { hover = null; dirty = true; draw(); });
        K.loop(el, (t, dt) => {
          if (!hover) {
            if (s < 676) { s = Math.min(676, s + dt * 150); dirty = true; if (s >= 676) hold = 2.4; }
            else if (hold > 0) { hold -= dt; if (hold <= 0) { prev = cur; prevM = curM; s = 0; } }
          }
          if (dirty) { draw(); dirty = false; }
        });
        this._restart = () => { prev = cur; prevM = curM; s = 676; hold = 1.6; hover = null; dirty = true; };
        this._finish = () => { s = 676; hold = 0; hover = null; draw(); };
        K.onTheme(draw);
        draw();
      },
      enter() { this._restart && this._restart(); },
      leave() { this._finish && this._finish(); },
    },

    /* ─────────────────────────── 1997 · Deep Blue ─────────────────────────── */
    {
      id: 'y1997',
      year: '1997',
      title: '딥블루 vs 카스파로프: 초당 2억 수',
      minutes: 1.3,
      notes: '1997년 5월 재대결에서 IBM 딥블루가 세계 챔피언 카스파로프를 3½ 대 2½로 이겼습니다. 딥블루는 초당 2억 수를 계산하는, 말 그대로 “엄청 빨리 다 따져 보는” 기계였습니다(PowerPC 30개 + 체스 전용 칩 480개).\n재미있는 일화: 1국 44수에서 버그로 무작위 수가 나왔는데, 카스파로프는 이걸 “초월적 지능”으로 오해하고 흔들렸습니다.\n클릭: 슬라이더를 1 → 12로 천천히 밀면서 아래 숫자의 자릿수가 늘어나는 걸 보여 주세요. 체스는 8수 앞을 다 봐도 몇 시간이지만, 바둑은 수천 년이 걸립니다.\n질문: “그럼 바둑은 ‘빨리 다 계산하기’ 말고 어떤 방법으로 이겨야 할까요?” (→ 2016 알파고로 이어짐)',
      html: `
        <style>
          #f-y1997 .nums { display: grid; grid-template-columns: 470px 470px; gap: 30px; }
          #f-y1997 .lab { font-family: var(--font-mono); font-size: 22px; color: var(--ink-2); }
          #f-y1997 .lab b { color: var(--ink); font-weight: 600; }
          #f-y1997 .big { font-family: var(--font-mono); font-size: 21px; color: var(--ink-2); line-height: 1.3; word-break: break-all; margin-top: 6px; }
          #f-y1997 .pow { font-family: var(--font-mono); font-size: 34px; font-weight: 600; }
          #f-y1997 .pow sup { font-size: 0.62em; }
          #f-y1997 .tm { font-size: 26px; margin-top: 4px; }
          #f-y1997 .tm b { font-family: var(--font-mono); }
        </style>
        <div class="row" style="flex:1;gap:50px;align-items:stretch">
          <div style="width:380px;position:relative;flex:none">
            ${Kit.photo('deep-blue', '딥블루', '', '--w:228px;--ratio:2/3;--pos:50% 40%;position:absolute;left:0;top:6px')}
            ${Kit.photo('kasparov', '카스파로프', 'sm tilt-r', '--w:196px;position:absolute;left:176px;top:236px')}
            <div class="abs" style="left:0;bottom:6px">
              <div class="mono muted" style="font-size:20px">카스파로프와의 6판 · 최종</div>
              <div class="mono" style="font-size:66px;font-weight:600;line-height:1.1">3½ : 2½</div>
              <div style="font-size:26px"><span class="mark">딥블루 승</span></div>
            </div>
          </div>
          <div class="stack grow" style="gap:16px">
            <div class="kicker">1997년 5월 · IBM 딥블루 재대결</div>
            <h2 class="title">초당 2억 수를 본 기계</h2>
            <div class="demo stack" style="gap:10px">
              <div class="field"><label for="y1997-d"><span>몇 수 앞까지 다 따져 볼까?</span><output>8수</output></label><input id="y1997-d" type="range" min="1" max="12" step="1" value="8"></div>
              <div class="nums"><div class="lab"><b>체스</b> · 한 수에 약 35가지</div><div class="lab"><b>바둑</b> · 한 수에 약 250가지</div></div>
              <div class="tree-host"></div>
              <div class="nums">
                <div><div class="pow p-c"></div><div class="tm">딥블루 속도로 전부 보기: <b class="mark t-c"></b></div><div class="big n-c"></div></div>
                <div><div class="pow p-g"></div><div class="tm">딥블루 속도로 전부 보기: <b class="mark t-g"></b></div><div class="big n-g"></div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="src">출처: Wikipedia ‘Deep Blue (chess computer)’ (3½–2½, 초당 2억 수) · Wikipedia ‘Game complexity’ (평균 가지 수 체스 35, 바둑 250) · 시간 = 가짓수 ÷ 초당 2억 (계산)</div>`,
      init(el, K) {
        const W = 970, H = 290, PW = 470, GAP = 30, TOP = 12, BOT = 282, CAP = 240;
        const games = [{ b: 35, x0: 0 }, { b: 250, x0: PW + GAP }];
        const { ctx } = K.canvas(el.querySelector('.tree-host'), W, H);
        const input = el.querySelector('input[type=range]'), out = el.querySelector('output');
        let d = 8, reveal = 8;
        const L250 = Math.log10(250);
        function draw() {
          const C = K.colors();
          ctx.clearRect(0, 0, W, H);
          games.forEach((g, gi) => {
            const rnd = K.rand(31 + gi * 7 + d);
            const D = d;
            const yk = (k) => TOP + ((BOT - TOP) * k) / D;
            const wk = (k) => (k === 0 ? 0 : PW * (0.05 + (0.95 * k * Math.log10(g.b)) / (D * L250)));
            const xk = (k, f) => g.x0 + PW / 2 + (f - 0.5) * wk(k);
            for (let k = 1; k <= D; k++) {
              const vis = K.clamp(reveal - (k - 1), 0, 1);
              if (vis <= 0) break;
              const n = Math.pow(g.b, k), exact = n <= CAP, m = exact ? n : CAP;
              const pn = n / g.b;
              ctx.beginPath();
              for (let j = 0; j < m; j++) {
                let f, pf;
                if (exact) { f = (j + 0.5) / n; pf = (Math.floor(j / g.b) + 0.5) / pn; }
                else { f = (j + rnd()) / m; pf = K.clamp(f + (rnd() - 0.5) * Math.min(0.5, 2 / Math.min(pn, CAP)), 0, 1); }
                const x1 = xk(k - 1, pf), y1 = yk(k - 1), x2 = xk(k, f), y2 = yk(k);
                ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * vis, y1 + (y2 - y1) * vis);
              }
              ctx.strokeStyle = C.ink;
              ctx.globalAlpha = n <= 40 ? 0.95 : 0.6;
              ctx.lineWidth = n <= 40 ? 2 : 1;
              ctx.stroke();
              ctx.globalAlpha = 1;
              if (n <= 40 && vis >= 1) {
                ctx.fillStyle = C.ink;
                for (let j = 0; j < n; j++) { ctx.beginPath(); ctx.arc(xk(k, (j + 0.5) / n), yk(k), 2.6, 0, 7); ctx.fill(); }
              }
            }
            ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(g.x0 + PW / 2, TOP, 6, 0, Math.PI * 2); ctx.fill();
            ctx.font = `500 20px ${C.fontBody}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'left';
            ctx.fillText('지금 판', g.x0 + PW / 2 + 14, TOP + 8);
          });
        }
        function update() {
          d = +input.value;
          out.textContent = d + '수';
          const bc = BigInt(35) ** BigInt(d), bg = BigInt(250) ** BigInt(d);
          [['.n-c', bc], ['.n-g', bg]].forEach(([sel, v]) => {
            const n = el.querySelector(sel), str = v.toLocaleString('en-US');
            n.textContent = str;
            n.style.letterSpacing = str.length > 33 ? '-0.09em' : '';
          });
          el.querySelector('.p-c').innerHTML = sciHTML(bc) + '가지';
          el.querySelector('.p-g').innerHTML = sciHTML(bg) + '가지';
          el.querySelector('.t-c').textContent = humanTime(Math.pow(35, d) / 2e8);
          el.querySelector('.t-g').textContent = humanTime(Math.pow(250, d) / 2e8);
        }
        input.addEventListener('input', () => {
          const old = d; update();
          if (d < old) reveal = d; else reveal = Math.min(reveal, old);
          draw();
        });
        K.loop(el, (t, dt) => { if (reveal < d) { reveal = Math.min(d, reveal + dt * 7); draw(); } });
        this._finish = () => { if (reveal < d) { reveal = d; draw(); } };
        K.onTheme(draw);
        update(); draw();
      },
      leave() { this._finish && this._finish(); },
    },

    /* ─────────────────────────── 2006–2009 · Hinton & ImageNet ─────────────────────────── */
    {
      id: 'y2009',
      year: '2006–2009',
      title: '엔진은 있었다, 연료가 없었다: ImageNet',
      minutes: 1.2,
      notes: '2006년 힌턴은 층을 하나씩 쌓아 미리 학습시키면 “깊은” 신경망도 학습된다는 걸 보였고, 이때부터 ‘딥러닝’이라는 이름이 퍼졌습니다. 엔진은 생긴 셈이죠.\n그런데 연료, 즉 데이터가 없었습니다. 페이페이 리는 알고리즘보다 데이터가 먼저라고 보고 ImageNet을 만들었습니다. 167개국 4만 9천 명이 후보 사진 1억 6천만 장을 하나하나 보고 걸러, 1,400만 장 넘는 사진에 이름표를 붙였습니다.\n클릭: [다시 세기]를 누르면 회색 칸(후보) 사이로 검은 칸(남은 사진)이 채워집니다. 노란 덩어리는 대회용 128만 장으로, 다음 장의 AlexNet이 이걸로 학습했습니다.\n질문: “여러분이 고양이 사진 1만 장에 이름표를 붙인다면 며칠 걸릴까요?”',
      html: `
        <style>
          #f-y2009 .stat b { font-size: 54px; }
          #f-y2009 .stat span { font-size: 22px; }
          #f-y2009 .lgd { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); }
          #f-y2009 .lgd i { display: inline-block; width: 16px; height: 16px; }
        </style>
        <div class="kicker">2006 힌턴 · 2009 페이페이 리</div>
        <h2 class="title">엔진은 있었다, 연료가 없었다</h2>
        <div class="abs hand lg" style="right:96px;top:92px;transform:rotate(-4deg)">데이터 = 연료</div>
        <div class="row" style="flex:1;gap:40px;align-items:stretch">
          <div style="width:330px;position:relative;flex:none">
            ${Kit.photo('hinton', '힌턴 <small>2006</small>', 'sm', '--w:168px;position:absolute;left:0;top:10px')}
            <div class="abs hand" style="left:184px;top:40px;font-size:34px;white-space:nowrap;transform:rotate(2deg)">깊게 쌓아도<br>학습된다!<br>→ ‘딥러닝’</div>
            ${Kit.photo('feifei-li', '페이페이 리 <small>2009</small>', 'tilt-r', '--w:224px;position:absolute;left:84px;top:276px')}
          </div>
          <div class="demo stack grow" style="gap:12px">
            <div class="row center" style="gap:26px;flex-wrap:wrap">
              <span class="lgd"><i style="background:var(--ink-3);opacity:.4"></i>후보 1억 6천만 장</span>
              <span class="lgd"><i style="background:var(--ink)"></i>남은 사진 1,400만 장+</span>
              <span class="lgd"><i style="background:var(--hl);outline:2px solid var(--ink)"></i>대회용 128만 장</span>
              <span class="lgd push" style="margin-left:auto"><b style="color:var(--ink)">1칸 = 사진 4만 장</b></span>
            </div>
            <div class="grid-host"></div>
            <div class="row" style="gap:30px;align-items:flex-end">
              <div class="stat" style="min-width:250px"><b class="num c-img">1,400만+</b><span>최종 사진 수</span></div>
              <div class="stat" style="min-width:250px"><b class="num">21,841</b><span>범주(이름표 종류)</span></div>
              <div class="stat" style="min-width:250px"><b class="num">4만 9천</b><span>167개국 작업자 (Mechanical Turk)</span></div>
              <button class="btn sm ghost push again" style="margin-left:auto;align-self:center">다시 세기</button>
            </div>
          </div>
        </div>
        <div class="src">출처: Hinton·Osindero·Teh 2006 (Neural Computation) · Wikipedia ‘ImageNet’ (1,400만+ 장, 21,841 범주, 167개국 4만 9천 명이 후보 1.6억 장을 걸러냄, ILSVRC 1,000 범주·128만 장) · Deng et al. CVPR 2009</div>`,
      init(el, K) {
        const COLS = 100, ROWS = 40, CELL = 10.4, W = COLS * CELL, H = ROWS * CELL;
        const { ctx } = K.canvas(el.querySelector('.grid-host'), W, H);
        const counter = el.querySelector('.c-img');
        // 1 cell = 4만 장: 4,000 candidate cells (1.6억), 350 kept (1,400만), 8×4 = 32 for ILSVRC (128만)
        const BX = 88, BY = 33, BW = 8, BH = 4;
        const inBlock = (i) => { const x = i % COLS, y = (i / COLS) | 0; return x >= BX && x < BX + BW && y >= BY && y < BY + BH; };
        const rnd = K.rand(2009);
        const scattered = [];
        const taken = new Uint8Array(COLS * ROWS);
        while (scattered.length < 350 - 32) {
          const i = Math.floor(rnd() * COLS * ROWS);
          if (taken[i] || inBlock(i)) continue;
          taken[i] = 1; scattered.push(i);
        }
        const block = [];
        for (let y = BY; y < BY + BH; y++) for (let x = BX; x < BX + BW; x++) block.push(y * COLS + x);
        const order = scattered.concat(block); // 350 cells × 4만 장 = 1,400만 장
        let shown = order.length, anim = 0, playing = false;
        function draw() {
          const C = K.colors();
          ctx.clearRect(0, 0, W, H);
          ctx.fillStyle = C.ink3; ctx.globalAlpha = 0.34;
          ctx.beginPath();
          for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) ctx.rect(x * CELL + 1, y * CELL + 1, CELL - 2.4, CELL - 2.4);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = C.paper;
          ctx.fillRect(BX * CELL - 2, BY * CELL - 2, BW * CELL + 3, BH * CELL + 3);
          for (let k = 0; k < shown; k++) {
            const i = order[k], x = i % COLS, y = (i / COLS) | 0;
            ctx.fillStyle = k >= scattered.length ? C.hl : C.ink;
            ctx.fillRect(x * CELL + 0.4, y * CELL + 0.4, CELL - 1, CELL - 1);
          }
          if (shown > scattered.length) {
            ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
            ctx.strokeRect(BX * CELL - 3, BY * CELL - 3, BW * CELL + 5, BH * CELL + 5);
          }
        }
        function setCount(n) { counter.textContent = n >= order.length ? '1,400만+' : fmt(n * 4) + '만'; }
        function play() { anim = 0; playing = true; shown = 0; setCount(0); draw(); }
        el.querySelector('.again').addEventListener('click', play);
        K.loop(el, (t, dt) => {
          if (!playing) return;
          anim += Math.max(0, dt);
          const p = K.clamp(anim / 3.2, 0, 1);
          shown = Math.round(order.length * K.ease(p));
          setCount(shown);
          draw();
          if (p >= 1) playing = false;
        });
        this._play = play;
        this._finish = () => { playing = false; shown = order.length; setCount(shown); draw(); };
        K.onTheme(draw);
        draw();
      },
      enter() { this._play && this._play(); },
      leave() { this._finish && this._finish(); },
    },

    /* ─────────────────────────── 2012 · AlexNet ─────────────────────────── */
    {
      id: 'y2012',
      year: '2012',
      tag: '빅뱅',
      title: 'AlexNet: 오류율이 무너진 해',
      minutes: 1.6,
      notes: '2012년 ImageNet 대회에서 토론토대의 크리제브스키·수츠케버·힌턴 팀(AlexNet)이 top-5 오류율(AI가 고른 후보 5개에 정답이 없는 비율) 15.3%로, 2위(26.2%)를 10%p 넘게 따돌렸습니다. 이 그래프에서 2012년의 점선(2위)과 노란 막대(AlexNet)의 차이가 바로 그 충격입니다.\n비결은 게임용 그래픽카드 GTX 580 두 장. 크리제브스키는 부모님 집 자기 방에서 5~6일 동안 학습시켰습니다. 3년 뒤 2015년엔 사람(5.1%)보다 정확해졌습니다.\n클릭: 오른쪽 [다시 칠하기]로 CPU(한 칸씩 차례로)와 GPU(모든 칸을 한꺼번에)가 같은 격자를 칠하는 속도를 비교합니다. 신경망 계산은 이런 “똑같은 단순 계산 수백만 번”이라 GPU가 딱 맞습니다.\n질문: “게임하려고 산 그래픽카드가 AI 혁명을 일으켰다는 게 무슨 뜻일까요?”',
      html: `
        <style>
          #f-y2012 .chartbox { position: absolute; left: 92px; top: 218px; width: 900px; height: 590px; }
          #f-y2012 svg.chart .ghost { fill: none; stroke: var(--ink-2); stroke-width: 2.5; stroke-dasharray: 8 6; }
          #f-y2012 svg.chart .old { fill: var(--ink-3); }
          #f-y2012 svg.chart .human { stroke: var(--pen); stroke-width: 3.5; stroke-dasharray: 12 8; }
          #f-y2012 svg.chart .val { font-size: 23px; fill: var(--ink); font-weight: 600; }
          #f-y2012 svg.chart .yr { font-size: 21px; fill: var(--ink-2); }
          #f-y2012 svg.chart .yr.on { fill: var(--ink); font-weight: 600; }
          #f-y2012 svg.chart .pen-t { fill: var(--pen); font-size: 22px; font-weight: 600; }
          #f-y2012 svg.chart .hand { font-size: 34px; }
          #f-y2012 svg.chart .bracket { stroke: var(--pen); stroke-width: 3; fill: none; }
          #f-y2012 svg.chart .div { stroke: var(--ink-3); stroke-width: 2; stroke-dasharray: 3 7; }
          #f-y2012 .zoomed .zf { display: block; position: relative; overflow: hidden; }
          #f-y2012 .zoomed .zf img { position: absolute; max-width: none; aspect-ratio: auto; object-fit: fill; }
          #f-y2012 .right { position: absolute; left: 1046px; top: 58px; width: 462px; }
          #f-y2012 .ak { width: 118px; height: 118px; border: 3.5px solid var(--pen); border-radius: 50% 47% 52% 49%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 44px; color: var(--pen); transform: rotate(-4deg); }
        </style>
        <div class="kicker">2012 · 토론토 · ImageNet 대회 (ILSVRC)</div>
        <h2 class="title" style="font-size:70px;max-width:900px">AlexNet: 오류율이 무너졌다</h2>
        <div class="chartbox">
          <svg class="chart" viewBox="0 0 900 590" width="900" height="590"></svg>
          ${Kit.photo('gpu', 'GTX 580 × 2', 'wide tilt-r', '--w:300px;--ratio:2/1;--pos:50% 50%;position:absolute;left:560px;top:-6px')}
          <div class="abs hand" style="left:574px;top:214px;font-size:34px;transform:rotate(-2deg)">게임용 그래픽카드 2장,<br>자기 방에서 5~6일</div>
        </div>
        <div class="right">
          <div class="row" style="gap:16px;align-items:flex-start">
            ${zoomedPhoto('sutskever', '수츠케버', 'sm', 138, [192, 287, 0.47, 0.245, 0.13], 0.42)}
            ${Kit.photo('hinton', '힌턴', 'sm tilt-r', '--w:138px')}
            <div class="stack" style="gap:8px;align-items:center;padding-top:26px"><div class="ak">AK</div><div class="hand" style="font-size:30px">크리제브스키</div></div>
          </div>
          <div class="demo" style="margin-top:24px">
            <div class="row center" style="justify-content:space-between">
              <div class="subtitle" style="font-size:32px">왜 GPU였을까?</div>
              <button class="btn sm again">다시 칠하기</button>
            </div>
            <div class="cg-host" style="margin-top:10px"></div>
          </div>
          <div class="row center" style="gap:20px;margin-top:22px;border-top:2px dashed var(--ink-3);padding-top:18px">
            <b class="mono" style="font-size:48px;font-weight:600;letter-spacing:-0.03em;white-space:nowrap;line-height:1">6,000만</b>
            <span style="font-size:22px;color:var(--ink-2);line-height:1.35;white-space:nowrap">AlexNet의 가중치(파라미터) 수<br>LeNet-5(약 6만)의 <span class="mark" style="color:var(--ink)">1,000배</span></span>
          </div>
        </div>
        <div class="src">출처: Krizhevsky·Sutskever·Hinton, NIPS 2012 (15.3%, 2위 26.2%) · Wikipedia ‘AlexNet’ (GTX 580 2장, 집에서 5~6일, 파라미터 약 6,000만) · Wikipedia ‘ImageNet’ (2010 28.2%, 2011 약 25%) · VGG 논문 (2013 Clarifai 11.7%) · GoogLeNet·ResNet 논문 · SENet 논문 (2016 2.99%, 2017 2.25%) · Karpathy 2014 (사람 5.1%) · 오른쪽 그림은 비유</div>`,
      init(el, K) {
        /* chart, drawn to scale */
        const svg = el.querySelector('svg.chart');
        const X0 = 70, X1 = 890, YT = 40, YB = 530, VMAX = 30;
        const y = (v) => YB - ((YB - YT) * v) / VMAX;
        const slot = (X1 - X0) / 8, cx = (i) => X0 + slot * (i + 0.5), BW = 58;
        const data = [[2010, 28.2, '28.2', 'old'], [2011, 25, '약 25', 'old'], [2012, 15.3, '15.3', 'hl'], [2013, 11.7, '11.7', ''], [2014, 6.67, '6.7', ''], [2015, 3.57, '3.6', ''], [2016, 2.99, '3.0', ''], [2017, 2.25, '2.3', '']];
        let s = '';
        [0, 10, 20, 30].forEach((v) => {
          s += `<line class="gridl" x1="${X0}" x2="${X1}" y1="${y(v)}" y2="${y(v)}"/><text x="${X0 - 12}" y="${y(v) + 7}" text-anchor="end" class="yr">${v}%</text>`;
        });
        s += `<line class="div" x1="${X0 + slot * 2}" x2="${X0 + slot * 2}" y1="${YT - 10}" y2="${YB}"/>`;
        s += `<text x="${X0 + slot}" y="${YT - 12}" text-anchor="middle" class="yr">딥러닝 이전</text>`;
        s += `<text x="${X0 + slot * 2 + 12}" y="${YT - 12}" class="yr on">딥러닝 →</text>`;
        // human line (drawn first so bars sit on top of it)
        s += `<line class="human" x1="${X0}" x2="${X1}" y1="${y(5.1)}" y2="${y(5.1)}"/>`;
        // 2012 runner-up ghost
        s += `<rect class="ghost" x="${cx(2) - BW / 2}" y="${y(26.2)}" width="${BW}" height="${YB - y(26.2)}"/>`;
        s += `<text x="${cx(2) - BW / 2 + 4}" y="${y(26.2) - 12}" class="val" style="fill:var(--ink-2)">2위 26.2</text>`;
        data.forEach(([yr, v, lab, cls], i) => {
          if (v == null) { s += `<text x="${cx(i)}" y="${YB - 10}" text-anchor="middle" class="yr">·</text>`; }
          else {
            s += `<rect class="bar ${cls}" x="${cx(i) - BW / 2}" y="${y(v)}" width="${BW}" height="${YB - y(v)}"/>`;
            if (v < 5.1) s += `<text x="${cx(i)}" y="${y(v) + 28}" text-anchor="middle" class="val" style="fill:var(--paper)">${lab}</text>`;
            else s += `<text x="${cx(i)}" y="${y(v) - 10}" text-anchor="middle" class="val">${lab}</text>`;
          }
          s += `<text x="${cx(i)}" y="${YB + 30}" text-anchor="middle" class="yr${yr === 2012 ? ' on' : ''}">${yr}</text>`;
        });
        s += `<text transform="translate(${cx(2) + 8},${YB - 16}) rotate(-90)" class="val" style="fill:#1b2630;font-size:26px">AlexNet</text>`;
        // drop bracket
        const bx = cx(2) + BW / 2 + 14;
        s += `<path class="bracket" d="M${bx - 6},${y(26.2)} H${bx} V${y(15.3)} H${bx - 6}"/>`;
        s += `<text x="${bx + 10}" y="${(y(26.2) + y(15.3)) / 2 + 10}" class="hand">−10.9%p</text>`;
        s += `<text x="${X1}" y="${y(5.1) - 12}" text-anchor="end" class="pen-t">사람 5.1%</text>`;
        s += `<text x="${cx(5) - 4}" y="${y(5.1) - 44}" text-anchor="middle" class="hand">사람 추월</text>`;
        s += `<text x="${X0 - 12}" y="${YB + 58}" class="yr" text-anchor="start" style="font-size:20px">top-5 오류율 = AI가 고른 후보 5개에 정답이 없는 비율 (낮을수록 좋음)</text>`;
        svg.innerHTML = s;

        /* CPU vs GPU painting race */
        const W = 462, H = 236, CO = 16, RO = 11, CELL = 13, GX = [8, 246], GY = 44;
        const { ctx } = K.canvas(el.querySelector('.cg-host'), W, H);
        const N = CO * RO, CPU_DT = 0.034, rnd = K.rand(580);
        const gpuAt = Array.from({ length: N }, () => 0.1 + rnd() * 0.2);
        const GPU_END = Math.max(...gpuAt), CPU_END = N * CPU_DT;
        let t = 99, running = false;
        function draw() {
          const C = K.colors();
          ctx.clearRect(0, 0, W, H);
          ctx.textAlign = 'left'; ctx.font = `600 21px ${C.fontMono}`; ctx.fillStyle = C.ink;
          ctx.fillText('CPU · 한 칸씩 차례로', GX[0], 26);
          ctx.fillText('GPU · 모든 칸 한꺼번에', GX[1], 26);
          const cpuDone = Math.min(N, Math.floor(t / CPU_DT));
          for (let g = 0; g < 2; g++) {
            const x0 = GX[g];
            ctx.fillStyle = C.paper2; ctx.fillRect(x0, GY, CO * CELL, RO * CELL);
            for (let i = 0; i < N; i++) {
              const filled = g === 0 ? i < cpuDone : t >= gpuAt[i];
              const cx = x0 + (i % CO) * CELL, cy = GY + ((i / CO) | 0) * CELL;
              if (filled) { ctx.fillStyle = C.ink; ctx.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2); }
              else if (g === 1 && running) { ctx.fillStyle = C.pen; ctx.beginPath(); ctx.arc(cx + CELL / 2, cy + CELL / 2, 2.6, 0, 7); ctx.fill(); }
            }
            ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.strokeRect(x0, GY, CO * CELL, RO * CELL);
          }
          if (cpuDone < N && running) {
            const cx = GX[0] + (cpuDone % CO) * CELL + CELL / 2, cy = GY + ((cpuDone / CO) | 0) * CELL + CELL / 2;
            ctx.fillStyle = C.pen; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 7); ctx.fill();
          }
          ctx.font = `600 28px ${C.fontMono}`;
          ctx.fillStyle = C.ink;
          ctx.fillText(Math.min(t, CPU_END).toFixed(1) + '초', GX[0], GY + RO * CELL + 40);
          ctx.fillStyle = C.pen;
          ctx.fillText(Math.min(t, GPU_END).toFixed(1) + '초', GX[1], GY + RO * CELL + 40);
          ctx.font = `500 20px ${C.fontBody}`; ctx.fillStyle = C.ink2;
          ctx.fillText(t >= CPU_END ? '끝' : '칠하는 중…', GX[0] + 96, GY + RO * CELL + 38);
          ctx.fillText('끝', GX[1] + 96, GY + RO * CELL + 38);
        }
        function play() { t = 0; running = true; draw(); }
        el.querySelector('.again').addEventListener('click', play);
        K.loop(el, (tt, dt) => {
          if (!running) return;
          t += Math.max(0, dt);
          if (t >= CPU_END) { t = CPU_END; running = false; }
          draw();
        });
        this._play = play;
        this._stop = () => { running = false; t = 99; draw(); };
        K.onTheme(draw);
        draw();
      },
      enter() { this._play && this._play(); },
      leave() { this._stop && this._stop(); },
    },

    /* ─────────────────────────── 2012.12 · DNNresearch auction ─────────────────────────── */
    {
      id: 'y2012b',
      year: '2012',
      optional: true,
      title: '직원 3명짜리 회사 경매',
      minutes: 0.7,
      notes: 'AlexNet 직후인 2012년 12월, 힌턴과 제자 둘(수츠케버, 크리제브스키)이 만든 3인 회사 DNNresearch를 놓고 비밀 경매가 열렸습니다. 제품은 없고 사람만 있는 회사였습니다.\n학회 기간 레이크 타호의 Harrah’s 호텔 방에서 이메일로 입찰했고, Google·Microsoft·Baidu, 그리고 창업 2년 남짓 된 런던 스타트업 DeepMind가 붙었습니다. 4,400만 달러에서 힌턴이 경매를 멈추고 Google을 골랐습니다(2013년 3월 인수).\n클릭: [경매 다시 보기]. 숫자가 올라가는 장면은 연출이고, 최종 금액만 실제입니다. 이 이야기는 2교시 ‘사람과 회사, 그리고 긴장’에서 다시 나옵니다.\n질문: “제품도 없는 세 사람에게 왜 수백억 원을 냈을까요?”',
      html: `
        <style>
          #f-y2012b .board { position: absolute; left: 690px; top: 214px; width: 818px; padding: 30px 36px 28px; border-radius: 12px; border: 2px solid var(--ink-3); }
          #f-y2012b .price { font-size: 104px; font-weight: 600; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
          #f-y2012b .krw { font-size: 34px; margin-top: 10px; }
          #f-y2012b .bidders { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 30px; }
          #f-y2012b .bidder { border: 2px solid var(--term-dim); border-radius: 8px; padding: 12px 10px; text-align: center; font-family: var(--font-display); font-weight: 600; font-size: 28px; color: var(--term-fg); position: relative; transition: border-color .3s, opacity .3s; }
          #f-y2012b .bidder small { display: block; font-family: var(--font-mono); font-size: 20px; color: var(--term-dim); font-weight: 400; margin-top: 4px; }
          #f-y2012b .bidder.live { border-color: var(--term-hi); }
          #f-y2012b .bidder.win { border-color: var(--term-hi); border-width: 4px; }
          #f-y2012b .bidder.lose { opacity: 0.45; }
          #f-y2012b .stamp { position: absolute; right: 40px; top: 172px; font-family: var(--font-mono); font-weight: 600; font-size: 38px; color: var(--term-hi); border: 4px solid var(--term-hi); padding: 4px 16px; transform: rotate(-8deg); border-radius: 6px; transition: opacity .3s; }
          #f-y2012b .memo { position: absolute; left: 92px; top: 214px; width: 540px; }
          #f-y2012b .route { position: absolute; left: 92px; top: 498px; }
          #f-y2012b .route .ln { fill: none; stroke: var(--ink); stroke-width: 3; stroke-dasharray: 2 10; stroke-linecap: round; }
          #f-y2012b .route .city { fill: var(--ink); }
          #f-y2012b .route .cityl { font-family: var(--font-display); font-weight: 600; font-size: 30px; fill: var(--ink); }
          #f-y2012b .route .hd { font-family: var(--font-hand); font-size: 38px; fill: var(--pen); }
        </style>
        <div class="kicker">2012년 12월 · 레이크 타호 · Harrah’s 호텔</div>
        <h2 class="title">직원 3명, 제품 0개. 그런데 경매?</h2>
        <div class="memo box dashed">
          <div class="mono" style="font-size:22px;color:var(--ink-2)">회사 정보 · 2012년</div>
          <div class="display" style="font-size:44px;font-weight:800;margin:4px 0 10px">DNNresearch</div>
          <div style="font-size:28px">직원: 힌턴 · 수츠케버 · 크리제브스키</div>
          <div style="font-size:28px">제품: <span class="mark">없음</span> &nbsp;·&nbsp; 가진 것: <span class="mark">AlexNet</span></div>
        </div>
        <svg class="route" width="560" height="290" viewBox="0 0 560 290" aria-hidden="true">
          <path class="ln" d="M500,74 C430,40 370,130 290,118 C210,106 150,50 74,160"/>
          <circle class="city" cx="500" cy="74" r="11"/><circle class="city" cx="74" cy="160" r="11"/>
          <text class="cityl" x="540" y="40" text-anchor="end">토론토</text>
          <text class="cityl" x="0" y="210">레이크 타호</text>
          <text class="hd" x="410" y="140">버스</text><text class="hd" x="282" y="168">기차</text><text class="hd" x="150" y="78">택시</text>
          <text class="hd" x="230" y="268" style="font-size:38px">힌턴(당시 64세)의 길</text>
        </svg>
        <div class="board term demo">
          <div class="dim" style="font-size:22px">이메일 입찰 · 현재가</div>
          <div class="price hi"></div>
          <div class="krw"></div>
          <div class="stamp">경매 끝</div>
          <div class="bidders">
            <div class="bidder" data-b="g">Google<small>미국</small></div>
            <div class="bidder" data-b="m">Microsoft<small>미국</small></div>
            <div class="bidder" data-b="b">Baidu<small>중국</small></div>
            <div class="bidder" data-b="d">DeepMind<small>런던 스타트업</small></div>
          </div>
          <div class="row center" style="justify-content:space-between;margin-top:24px">
            <div class="dim status" style="font-size:22px"></div>
            <button class="btn sm again" style="background:var(--term-bg);color:var(--term-fg);border-color:var(--term-dim)">경매 다시 보기</button>
          </div>
          <div class="dim" style="font-size:20px;margin-top:10px">올라가는 숫자는 연출 · 최종 금액은 실제</div>
        </div>
        <div class="abs hand" style="left:780px;top:772px;font-size:42px;transform:rotate(-2deg)">→ 2교시 ‘사람과 회사’ 예고편!</div>
        <div class="src">출처: WIRED ‘The Secret Auction That Set Off the Race for AI Supremacy’ · Fortune 2023-05-01 · bioethics.com (힌턴의 이동) · Wikipedia ‘Geoffrey Hinton’ (2013년 3월 Google이 4,400만 달러에 인수)</div>`,
      init(el, K) {
        const price = el.querySelector('.price'), krw = el.querySelector('.krw'), status = el.querySelector('.status'), stamp = el.querySelector('.stamp');
        const bidders = el.querySelectorAll('.bidder');
        const FINAL = 44;
        let v = FINAL, running = false, acc = 0;
        function render() {
          price.textContent = '$' + (v * 1e6).toLocaleString('en-US');
          krw.textContent = v ? `${fmt(v * 100)}만 달러` : '입찰 시작';
          const done = !running && v >= FINAL;
          stamp.style.opacity = done ? 1 : 0;
          status.textContent = done ? '힌턴이 경매를 멈춤 → Google 선택' : '네 곳이 입찰 중…';
          bidders.forEach((b) => {
            b.classList.toggle('live', running);
            b.classList.toggle('win', done && b.dataset.b === 'g');
            b.classList.toggle('lose', done && b.dataset.b !== 'g');
          });
        }
        function play() { v = 0; acc = 0; running = true; render(); }
        el.querySelector('.again').addEventListener('click', play);
        K.loop(el, (t, dt) => {
          if (!running) return;
          acc += dt;
          const wait = 0.17 - 0.12 * (v / FINAL);
          if (acc >= wait) { acc -= wait; v++; if (v >= FINAL) { v = FINAL; running = false; } render(); }
        });
        this._play = play;
        this._stop = () => { running = false; v = FINAL; render(); };
        render();
      },
      enter() { this._play && this._play(); },
      leave() { this._stop && this._stop(); },
    },

    /* ─────────────────────────── 2014 · GAN ─────────────────────────── */
    {
      id: 'y2014',
      year: '2014',
      optional: false,
      title: 'GAN: 위조범과 경찰을 싸우게 하면?',
      minutes: 1.0,
      notes: '2014년 몬트리올대 박사과정 이언 굿펠로는 술집(Les 3 Brasseurs)에서 친구들과 토론하다 “신경망 두 개를 서로 싸우게 하면?”이라는 아이디어를 떠올렸고, 그날 밤 집에 와서 새벽까지 코딩했는데 첫 시도에 작동했습니다.\n생성자는 위조지폐범, 판별자는 경찰입니다. 경찰이 “가짜!”라고 잡아낼 때마다 위조범은 어디서 들켰는지 배우고 더 그럴듯하게 만듭니다. 결국 경찰도 50 대 50으로 헷갈리게 됩니다.\n클릭: [처음부터] → 자동으로 라운드가 진행됩니다. [+10판]으로 한 단계씩 보여 줄 수도 있습니다. 르쿤은 GAN을 “지난 20년간 딥러닝에서 가장 멋진 아이디어”라고 했습니다.\n→ 키: 오른쪽 위 포스트잇. 8년 뒤 2022년엔 문장 한 줄로 그림을 그립니다. 4월 DALL·E 2, 7월 Midjourney 공개 베타, 8월 Stable Diffusion은 가중치까지 누구나 내려받게 공개했습니다. 8월 29일엔 Midjourney로 만든 그림이 미국 콜로라도 주 박람회 미술전 디지털아트 부문(신인부)에서 1등(상금 300달러)을 해 논란이 됐습니다. 이때의 그림 AI는 GAN이 아니라 ‘확산 모델’이라는 다른 방식이지만, “가짜를 진짜처럼”이라는 꿈은 이어졌습니다. 게임 원화·배경을 그릴 여러분에게 가장 가까운 이야기입니다.\n질문: “이 기술이 좋은 데 쓰이면? 나쁜 데 쓰이면?” (딥페이크 이야기로 연결) · “AI로 만든 그림이 대회에서 1등을 해도 될까?”',
      html: `
        <style>
          #f-y2014 .tl { display: grid; grid-template-columns: 74px 1fr; row-gap: 12px; font-size: 28px; align-items: baseline; }
          #f-y2014 .tl b { font-family: var(--font-mono); font-weight: 600; font-size: 21px; color: var(--ink-2); }
          #f-y2014 .gen22 { left: 1196px; top: 34px; width: 376px; font-size: 30px; line-height: 1.08; padding: 14px 18px 16px; --tilt: 2deg; z-index: 2; word-break: keep-all; }
          #f-y2014 .gen22 ol { list-style: none; margin: 8px 0 0; padding: 0; display: grid; grid-template-columns: auto 1fr; column-gap: 10px; row-gap: 2px; font-family: var(--font-body); font-size: 20px; line-height: 1.22; }
          #f-y2014 .gen22 li { display: contents; }
          #f-y2014 .gen22 li b { font-family: var(--font-mono); font-weight: 600; }
        </style>
        <div class="kicker">2014 · 몬트리올 · 이언 굿펠로</div>
        <h2 class="title" style="font-size:70px">GAN: 위조범과 경찰을 싸우게 하면?</h2>
        <div class="abs sticky gen22" data-step="1">
          <div>8년 뒤 2022: 문장 한 줄 → 그림</div>
          <ol>
            <li><b>4월</b><span>DALL·E 2</span></li>
            <li><b>7월</b><span>Midjourney</span></li>
            <li><b>8월</b><span>Stable Diffusion 가중치 공개</span></li>
            <li><b>8.29</b><span>Midjourney 그림이 美 콜로라도 주 박람회 디지털아트 1등</span></li>
          </ol>
        </div>
        <div class="row" style="flex:1;gap:40px;align-items:flex-start">
          <div class="stack" style="width:340px;gap:30px;flex:none;padding-top:12px">
            ${Kit.photo('goodfellow', '이언 굿펠로', 'wide', '--w:330px;--pos:44% 35%')}
            <div class="tl">
              <b>저녁</b><span>술집에서 토론</span>
              <b>밤</b><span>집에 와서 코딩</span>
              <b>새벽</b><span><span class="mark">첫 시도에 작동!</span></span>
            </div>
          </div>
          <div class="demo stack grow" style="gap:10px">
            <div class="gan-host"></div>
            <div class="row center" style="gap:14px">
              <button class="btn sm auto">처음부터</button>
              <button class="btn sm ghost plus">+10판</button>
              <span class="hand push" style="margin-left:auto;font-size:36px">경찰이 헷갈리면(50%) 위조 성공</span>
            </div>
          </div>
        </div>
        <div class="src">출처: Goodfellow et al., arXiv 1406.2661 (2014-06-10) · MIT Technology Review 2018-02-21 ‘The GANfather’ (술집 일화, 첫 시도에 작동, 르쿤의 평가) · 그림은 원리를 보여 주는 단순 모형 · OpenAI DALL·E 2(2022.4.6) · Wikipedia ‘Midjourney’ · Stability AI(2022.8.22) · Wikipedia ‘Théâtre D’opéra Spatial’(2022.8.29)</div>`,
      init(el, K) {
        const W = 1036, H = 492;
        const { ctx } = K.canvas(el.querySelector('.gan-host'), W, H);
        const THUMBS = [1, 20, 60, 120, 300];
        const thumbData = THUMBS.map(fakeAt);
        let r = 300, fake = fakeAt(300), auto = false, acc = 0;
        const pReal = (rr) => Math.min(0.5, 0.02 + 0.48 * Math.pow(ganQ(rr), 2.2) + (K.rand(rr * 31)() - 0.5) * 0.04 * (1 - ganQ(rr)));
        function box(x, y, w, h, title, sub, C) {
          ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
          K.sketchRect(ctx, x, y, w, h, { wobble: 2 });
          ctx.textAlign = 'center'; ctx.fillStyle = C.ink;
          ctx.font = `800 34px ${C.fontDisplay}`; ctx.fillText(title, x + w / 2, y + 48);
          ctx.font = `400 34px ${C.fontHand}`; ctx.fillStyle = C.pen; ctx.fillText(sub, x + w / 2, y + 86);
        }
        function draw() {
          const C = K.colors();
          ctx.clearRect(0, 0, W, H);
          // generator
          box(8, 80, 220, 170, '생성자', '= 위조지폐범', C);
          ctx.font = `500 20px ${C.fontBody}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'center';
          ctx.fillText('무작위 잡음 → 그림', 118, 220);
          // fake picture
          ctx.font = `600 22px ${C.fontMono}`; ctx.fillStyle = C.ink;
          ctx.fillText(`가짜 그림 · ${r}판`, 388, 50);
          drawPixels(ctx, fake, 290, 62, 14, C);
          // discriminator
          box(564, 60, 232, 230, '판별자', '= 경찰', C);
          const p = pReal(r);
          ctx.font = `500 20px ${C.fontBody}`; ctx.fillStyle = C.ink2;
          ctx.fillText('진짜일 확률', 680, 186);
          ctx.fillStyle = C.paper3; ctx.fillRect(592, 200, 176, 22);
          ctx.fillStyle = p > 0.44 ? C.good : C.bad; ctx.fillRect(592, 200, 176 * p, 22);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(592, 200, 176, 22);
          ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(592 + 88, 196); ctx.lineTo(592 + 88, 226); ctx.stroke();
          ctx.font = `600 30px ${C.fontMono}`; ctx.fillStyle = C.ink;
          ctx.fillText(Math.round(p * 100) + '%', 680, 262);
          ctx.font = `400 34px ${C.fontHand}`; ctx.fillStyle = p > 0.44 ? C.good : C.bad;
          ctx.fillText(p > 0.44 ? '헷갈려…' : '가짜다!', 680, 30);
          // real picture
          ctx.font = `600 21px ${C.fontMono}`; ctx.fillStyle = C.ink2;
          ctx.fillText('진짜 그림', 945, 66);
          drawPixels(ctx, HOUSE, 882, 80, 9, C);
          // arrows
          arrow(ctx, 232, 165, 282, 165, C);
          arrow(ctx, 492, 165, 556, 165, C);
          arrow(ctx, 878, 145, 804, 145, C);
          // feedback loop
          ctx.strokeStyle = C.pen; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(680, 296); ctx.bezierCurveTo(680, 372, 118, 372, 118, 262); ctx.stroke();
          ctx.fillStyle = C.pen; ctx.beginPath(); ctx.moveTo(118, 254); ctx.lineTo(108, 272); ctx.lineTo(128, 272); ctx.closePath(); ctx.fill();
          ctx.font = `400 34px ${C.fontHand}`; ctx.fillStyle = C.pen; ctx.textAlign = 'center';
          ctx.fillText('어디서 들켰는지 알려 줌 → 더 그럴듯하게', 400, 392);
          // round strip
          ctx.textAlign = 'left'; ctx.font = `600 20px ${C.fontMono}`; ctx.fillStyle = C.ink2;
          ctx.fillText('판마다 가짜 그림', 8, 462);
          THUMBS.forEach((rr, i) => {
            const x = 220 + i * 160, on = r >= rr;
            ctx.globalAlpha = on ? 1 : 0.3;
            drawPixels(ctx, thumbData[i], x, 412, 5.6, C);
            ctx.globalAlpha = 1;
            ctx.font = `600 20px ${C.fontMono}`; ctx.fillStyle = on ? C.ink : C.ink3;
            ctx.fillText(rr + '판', x + 86, 462);
          });
        }
        function setRound(n) { r = K.clamp(n, 1, 300); fake = fakeAt(r); draw(); }
        el.querySelector('.auto').addEventListener('click', () => { auto = true; acc = 0; setRound(1); });
        el.querySelector('.plus').addEventListener('click', () => { auto = false; setRound(r >= 300 ? 1 : r + 10); });
        K.loop(el, (t, dt) => {
          if (!auto) return;
          acc += dt;
          if (acc >= 0.09) { acc = 0; const step = Math.max(1, Math.floor(r / 25)); setRound(r + step); if (r >= 300) auto = false; }
        });
        this._play = () => { auto = true; acc = 0; setRound(1); };
        this._stop = () => { auto = false; setRound(300); };
        K.onTheme(draw);
        draw();
      },
      enter() { this._play && this._play(); },
      leave() { this._stop && this._stop(); },
    },

    /* ─────────────────────────── 2016 · AlphaGo vs 이세돌 ─────────────────────────── */
    {
      id: 'y2016',
      year: '2016',
      title: '알파고 vs 이세돌: 37수와 78수',
      minutes: 1.5,
      notes: '2016년 3월 9일부터 15일까지 서울 포시즌스 호텔에서 알파고가 이세돌 9단을 4승 1패로 이겼습니다. 전 세계 2억 명 이상이 봤고, 대국 직후 정부는 5년간 1조 원 AI 투자를 발표했습니다.\n2국 37수: 사람이라면 둘 확률이 1만 분의 1인 수. 이세돌은 “확률 계산하는 기계라 생각했는데, 이 수를 보고 생각을 바꿨다. 알파고는 창의적이다”라고 했습니다. 4국 78수: 이세돌의 ‘신의 한 수’로 거둔 1승. 알파고를 상대로 사람이 거둔 유일한 공식 승리입니다.\n클릭: [2국 37수] / [4국 78수] 버튼으로 바꿔 가며 이야기합니다(바둑판은 실제 좌표가 아니라 상징적 그림입니다). 마지막으로 2019년 은퇴 발언을 읽어 줍니다.\n질문: “이세돌의 ‘이길 수 없는 존재’라는 말, 여러분은 어떻게 들리나요?”',
      html: `
        <style>
          #f-y2016 .bd-edge { fill: none; stroke: var(--ink); stroke-width: 3.5; }
          #f-y2016 .bd-ln { stroke: var(--ink-2); stroke-width: 1.6; }
          #f-y2016 .bd-star { fill: var(--ink-2); }
          #f-y2016 .st-b { fill: var(--term-bg); stroke: var(--ink-2); stroke-width: 2; }
          #f-y2016 .st-w { fill: var(--photo-bg); stroke: #1b2630; stroke-width: 2; }
          #f-y2016 .bd-ring { fill: var(--hl-soft); stroke: var(--pen); stroke-width: 4; }
          #f-y2016 .bd-note { font-family: var(--font-hand); font-size: 32px; fill: var(--pen); paint-order: stroke; stroke: var(--paper); stroke-width: 8px; }
          #f-y2016 .bd-arrow { fill: none; stroke: var(--pen); stroke-width: 2.5; }
          #f-y2016 .st-num { font-family: var(--font-mono); font-weight: 600; font-size: 20px; text-anchor: middle; }
          #f-y2016 .st-num-b { fill: var(--photo-bg); }
          #f-y2016 .st-num-w { fill: #1b2630; }
          #f-y2016 .games { display: flex; gap: 10px; }
          #f-y2016 .game { width: 84px; border: 2.5px solid var(--ink-3); border-radius: 8px 3px 8px 3px; text-align: center; padding: 6px 4px 8px; }
          #f-y2016 .game .g { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); }
          #f-y2016 .game .w { font-size: 22px; font-weight: 600; }
          #f-y2016 .game.lee .w { color: var(--pen); }
          #f-y2016 .game.on { border-color: var(--ink); background: var(--hl-soft); }
          #f-y2016 .story [data-m] { display: none; }
          #f-y2016 .story[data-cur="37"] [data-m="37"], #f-y2016 .story[data-cur="78"] [data-m="78"] { display: flex; }
          #f-y2016 .mv { font-family: var(--font-mono); font-weight: 600; font-size: 128px; line-height: 0.9; letter-spacing: -0.04em; }
          #f-y2016 .q { font-family: var(--font-display); font-weight: 500; font-size: 30px; line-height: 1.35; }
          #f-y2016 .q cite { display: block; font-style: normal; font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); margin-top: 6px; }
        </style>
        <div class="row" style="justify-content:space-between;align-items:flex-end">
          <div class="stack" style="gap:8px"><div class="kicker">2016년 3월 9–15일 · 서울 포시즌스 호텔</div><h2 class="title">알파고 vs 이세돌</h2></div>
          <div class="stack" style="gap:6px;align-items:flex-end">
            <div class="games">
              <div class="game" data-g="1"><div class="g">1국</div><div class="w">알파고</div></div>
              <div class="game on" data-g="2"><div class="g">2국</div><div class="w">알파고</div></div>
              <div class="game" data-g="3"><div class="g">3국</div><div class="w">알파고</div></div>
              <div class="game lee" data-g="4"><div class="g">4국</div><div class="w">이세돌</div></div>
              <div class="game" data-g="5"><div class="g">5국</div><div class="w">알파고</div></div>
            </div>
            <div class="mono muted" style="font-size:20px">4 : 1 · 전 세계 2억 명 이상 시청</div>
          </div>
        </div>
        <div class="row" style="flex:1;gap:36px;align-items:flex-start;min-height:0">
          <div style="width:270px;height:470px;position:relative;flex:none">
            ${Kit.photo('lee-sedol', '이세돌', '', '--w:236px;--pos:50% 25%;position:absolute;left:0;top:10px')}
            ${Kit.photo('hassabis', '허사비스', 'sm tilt-r', '--w:150px;position:absolute;left:118px;top:262px')}
          </div>
          <div class="demo stack" style="gap:10px;width:430px;flex:none">
            <div class="btns"><button class="btn sm on" data-pick="37">2국 37수</button><button class="btn sm" data-pick="78">4국 78수</button></div>
            <svg class="board" viewBox="0 0 430 430" width="430" height="430"></svg>
          </div>
          <div class="story stack grow" data-cur="37" style="gap:0">
            <div data-m="37" class="stack" style="gap:16px">
              <div class="row" style="gap:20px;align-items:flex-end"><div class="mv">37</div><div class="subtitle" style="font-size:32px;padding-bottom:8px">2국 · 알파고의 수</div></div>
              <div class="row center" style="gap:20px">
                <div class="gauge"></div>
                <div style="font-size:28px;line-height:1.35">사람이 여기 둘 확률<br><span class="mark mono" style="font-weight:600">1만 분의 1</span><div class="mono" style="font-size:20px;color:var(--ink-2);margin-top:6px">← 점 10,000개 중 동그라미 1개</div></div>
              </div>
              <div class="q">“확률 계산하는 기계라 생각했는데 …<br>알파고는 창의적이다”<cite>이세돌, 37수를 두고</cite></div>
            </div>
            <div data-m="78" class="stack" style="gap:16px">
              <div class="row" style="gap:20px;align-items:flex-end"><div class="mv pen">78</div><div class="subtitle" style="font-size:32px;padding-bottom:8px">4국 · 이세돌의 수</div></div>
              <div style="font-size:28px;line-height:1.4">중국의 구리 9단은 이 수를<br><span class="mark">‘신의 한 수’</span>라고 불렀다.<br>알파고를 상대로 사람이 거둔<br>유일한 공식 승리.</div>
              <div class="q">“그 무엇과도 바꿀 수 없는 값진 1승”<cite>이세돌, 4국 뒤</cite></div>
            </div>
          </div>
        </div>
        <div class="row center" style="gap:24px;margin:-10px 0 30px">
          <span class="mono" style="font-size:22px;color:var(--ink-2);flex:none">2019 은퇴</span>
          <span class="display" style="font-size:34px;font-weight:600">“내가 1위가 되더라도 이길 수 없는 존재가 있다”</span>
        </div>
        <div class="src">출처: Google DeepMind ‘AlphaGo’ (4–1, 2억 명 시청, 37수 1만 분의 1, 이세돌 발언) · Wikipedia ‘AlphaGo versus Lee Sedol’ (78수 ‘신의 한 수’, 4국 뒤 발언) · CNN 2019-11-27 (은퇴 발언) · 바둑판은 실제 기보가 아닌 상징적 도식</div>`,
      init(el, K) {
        const svg = el.querySelector('svg.board'), story = el.querySelector('.story');
        const GS = 204, GP = 2;
        const gauge = K.canvas(el.querySelector('.gauge'), GS, GS);
        function drawGauge() {
          const C = K.colors(), g = gauge.ctx;
          g.clearRect(0, 0, GS, GS);
          g.fillStyle = C.ink2; g.globalAlpha = 0.62;
          g.beginPath();
          for (let y = 0; y < 100; y++) for (let x = 0; x < 100; x++) g.rect(GP + x * 2, GP + y * 2, 1.35, 1.35);
          g.fill(); g.globalAlpha = 1;
          const px = GP + 71 * 2 + 0.7, py = GP + 38 * 2 + 0.7;
          g.fillStyle = C.hl; g.beginPath(); g.arc(px, py, 4.5, 0, 7); g.fill();
          g.strokeStyle = C.ink; g.lineWidth = 1.5; g.stroke();
          g.strokeStyle = C.pen; g.lineWidth = 3.5; g.beginPath(); g.arc(px, py, 15, 0, 7); g.stroke();
        }
        function pick(k) {
          svg.innerHTML = boardSVG(k);
          story.dataset.cur = k;
          el.querySelectorAll('[data-pick]').forEach((b) => b.classList.toggle('on', b.dataset.pick === k));
          el.querySelectorAll('.game').forEach((g) => g.classList.toggle('on', g.dataset.g === (k === '37' ? '2' : '4')));
        }
        el.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => pick(b.dataset.pick)));
        this._reset = () => pick('37');
        K.onTheme(drawGauge);
        drawGauge();
        pick('37');
      },
      leave() { this._reset && this._reset(); },
    },

    /* ─────────────────────────── 2016 · how AlphaGo plays ─────────────────────────── */
    {
      id: 'y2016b',
      year: '2016',
      optional: true,
      title: '알파고는 어떻게 두었나',
      minutes: 1,
      notes: '알파고는 세 가지를 합쳤습니다. 정책망은 “어디에 둘 만한가” 후보를 좁히고, 가치망은 “지금 누가 이기고 있나”를 점수로 매기고, 몬테카를로 트리 탐색은 유망한 후보를 수없이 미리 둬 보며 확인합니다.\n오른쪽 그림에서 퍼센트는 정책망이 준 첫인상, 굵기는 탐색이 그 가지를 몇 번 가 봤는지입니다. 처음엔 A가 가장 그럴듯해 보이지만, 탐색을 반복하면 실제로 더 좋은 B가 굵어집니다(설명용 모형).\n클릭: [처음부터] → [탐색 100번]을 두세 번 눌러 굵기가 바뀌는 걸 보여 주세요. 이듬해(2017년 10월) 발표된 AlphaGo Zero는 사람 기보 없이 자기 자신과의 대국만으로 3일 만에 이세돌을 이긴 버전을 100 대 0으로 이겼습니다.\n질문: “사람의 기보를 버렸더니 더 강해졌다. 왜 그럴까요?”',
      html: `
        <style>
          #f-y2016b .flow { display: flex; flex-direction: column; gap: 0; }
          #f-y2016b .stepbox { border: 3px solid var(--ink); border-radius: 16px 5px 14px 6px / 6px 14px 5px 16px; padding: 14px 20px 16px; background: var(--paper); }
          #f-y2016b .stepbox .n { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); }
          #f-y2016b .stepbox .h { font-family: var(--font-display); font-weight: 800; font-size: 32px; line-height: 1.2; margin: 2px 0 4px; }
          #f-y2016b .stepbox .d { font-size: 24px; line-height: 1.35; color: var(--ink-2); }
          #f-y2016b .stepbox.zero { border-color: var(--pen); border-width: 3.5px; }
          #f-y2016b .down { height: 38px; position: relative; }
          #f-y2016b .down::before { content: ""; position: absolute; left: 40px; top: 4px; bottom: 6px; width: 3px; background: var(--ink); }
          #f-y2016b .down::after { content: ""; position: absolute; left: 33px; bottom: 0; border: 8px solid transparent; border-top: 12px solid var(--ink); border-bottom: 0; }
          #f-y2016b .lg { font-size: 22px; color: var(--ink-2); }
          #f-y2016b .lg b { color: var(--ink); }
        </style>
        <div class="kicker">2016 → 2017 · 정책망 + 가치망 + 트리 탐색</div>
        <h2 class="title">알파고는 어떻게 두었나</h2>
        <div class="row" style="flex:1;gap:40px;align-items:flex-start">
          <div class="flow" style="width:470px;flex:none">
            <div class="stepbox"><div class="n">① 2016 · 사람 따라 하기</div><div class="h">기보로 공부</div><div class="d">프로의 수를 흉내 → <b>정책망</b> “어디에 둘까?”</div></div>
            <div class="down"></div>
            <div class="stepbox"><div class="n">② 2016 · 강화학습</div><div class="h">자기 자신과 대국</div><div class="d">이긴 판에서 배움 → <b>가치망</b> “누가 이기나?”</div></div>
            <div class="down"></div>
            <div class="stepbox zero"><div class="n">③ 2017 · AlphaGo Zero</div><div class="h">기보 0장, <span class="mark">3일 만에 100 : 0</span></div><div class="d">이세돌을 이긴 버전을 상대로. TPU는 단 4개</div></div>
            <div class="mono" style="font-size:20px;color:var(--ink-2);margin-top:16px">2016 대국 때: CPU 1,920개 + GPU 280개</div>
          </div>
          <div class="demo stack grow" style="gap:8px">
            <div class="mc-host"></div>
            <div class="row center" style="gap:14px">
              <button class="btn more">탐색 100번</button>
              <button class="btn ghost sm reset">처음부터</button>
              <span class="mono count push" style="margin-left:auto;font-size:24px"></span>
            </div>
            <div class="lg"><b>%</b> = 정책망의 첫인상 · <b>승률</b> = 가치망 점수의 평균 · <b>굵기</b> = 탐색에서 가 본 횟수</div>
          </div>
        </div>
        <div class="src">출처: Google DeepMind ‘AlphaGo Zero: Starting from scratch’ (2017-10-18; 3일, 100–0, TPU 4개) · Wikipedia ‘AlphaGo versus Lee Sedol’ (CPU 1,920 · GPU 280) · 오른쪽 트리는 원리를 보여 주는 설명용 모형</div>`,
      init(el, K) {
        const W = 906, H = 470;
        const { ctx } = K.canvas(el.querySelector('.mc-host'), W, H);
        const count = el.querySelector('.count');
        const ROOT = { x: 453, y: 56 }, L1Y = 214, L2Y = 400;
        const l1x = (i) => 96 + i * 170;
        let root, rnd, sims = 0, target = 0, acc = 0;
        const flashes = [];
        function reset(n) {
          root = mctsModel(); rnd = K.rand(2016); sims = 0; target = 0; flashes.length = 0;
          for (let i = 0; i < n; i++) { mctsStep(root, rnd); sims++; }
          target = sims;
        }
        function best() { let b = 0; root.kids.forEach((k, i) => { if (k.N > root.kids[b].N) b = i; }); return b; }
        function draw(now) {
          const C = K.colors();
          ctx.clearRect(0, 0, W, H);
          const NR = Math.max(1, root.N), bi = sims ? best() : -1;
          // edges L1 → L2
          root.kids.forEach((k, i) => {
            const x = l1x(i);
            k.kids.forEach((c, j) => {
              const cx = x + (j - 1) * 50;
              ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2 + (16 * c.N) / NR; ctx.globalAlpha = c.N ? 0.85 : 0.3;
              ctx.beginPath(); ctx.moveTo(x, L1Y + 30); ctx.lineTo(cx, L2Y - 15); ctx.stroke(); ctx.globalAlpha = 1;
            });
          });
          // edges root → L1
          root.kids.forEach((k, i) => {
            const w = 1.6 + (26 * k.N) / NR;
            if (i === bi) { ctx.strokeStyle = C.hl; ctx.lineWidth = w + 12; ctx.beginPath(); ctx.moveTo(ROOT.x, ROOT.y + 30); ctx.lineTo(l1x(i), L1Y - 30); ctx.stroke(); }
            ctx.strokeStyle = C.ink; ctx.lineWidth = w; ctx.globalAlpha = k.N ? 1 : 0.35;
            ctx.beginPath(); ctx.moveTo(ROOT.x, ROOT.y + 30); ctx.lineTo(l1x(i), L1Y - 30); ctx.stroke(); ctx.globalAlpha = 1;
          });
          // flashes of the latest simulations
          const tnow = now || performance.now() / 1000;
          ctx.strokeStyle = C.pen; ctx.lineCap = 'round';
          flashes.forEach((f) => {
            const a = 1 - (tnow - f.t) / 0.35; if (a <= 0) return;
            ctx.globalAlpha = a; ctx.lineWidth = 5;
            const x = l1x(f.p[0]);
            ctx.beginPath(); ctx.moveTo(ROOT.x, ROOT.y + 30); ctx.lineTo(x, L1Y - 30);
            if (f.p.length > 1) { ctx.moveTo(x, L1Y + 30); ctx.lineTo(x + (f.p[1] - 1) * 50, L2Y - 15); }
            ctx.stroke();
          });
          ctx.globalAlpha = 1; ctx.lineCap = 'butt';
          // root: a tiny board
          ctx.fillStyle = C.paper; ctx.fillRect(ROOT.x - 30, ROOT.y - 30, 60, 60);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) { ctx.moveTo(ROOT.x - 24 + i * 12, ROOT.y - 24); ctx.lineTo(ROOT.x - 24 + i * 12, ROOT.y + 24); ctx.moveTo(ROOT.x - 24, ROOT.y - 24 + i * 12); ctx.lineTo(ROOT.x + 24, ROOT.y - 24 + i * 12); }
          ctx.stroke();
          ctx.lineWidth = 3; ctx.strokeRect(ROOT.x - 30, ROOT.y - 30, 60, 60);
          [[-12, -12, 'b'], [12, 0, 'w'], [0, 12, 'b']].forEach(([dx, dy, c]) => {
            ctx.beginPath(); ctx.arc(ROOT.x + dx, ROOT.y + dy, 5, 0, 7);
            ctx.fillStyle = c === 'b' ? C.ink : C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
          });
          ctx.font = `500 21px ${C.fontBody}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'left';
          ctx.fillText('지금 판', ROOT.x + 44, ROOT.y + 8);
          // L2 nodes
          root.kids.forEach((k, i) => {
            k.kids.forEach((c, j) => {
              const cx = l1x(i) + (j - 1) * 50;
              ctx.beginPath(); ctx.arc(cx, L2Y, 14, 0, 7);
              ctx.fillStyle = C.paper; ctx.fill();
              if (c.N) { ctx.fillStyle = C.pen; ctx.globalAlpha = Math.min(0.85, 0.15 + c.N / 25); ctx.fill(); ctx.globalAlpha = 1; }
              ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
            });
          });
          ctx.font = `500 20px ${C.fontBody}`; ctx.fillStyle = C.ink2; ctx.textAlign = 'right';
          ctx.fillText('↑ 상대의 응수', W - 4, L2Y + 50);
          // L1 nodes + labels
          root.kids.forEach((k, i) => {
            const x = l1x(i);
            ctx.beginPath(); ctx.arc(x, L1Y, 30, 0, 7);
            ctx.fillStyle = i === bi ? C.hl : C.paper; ctx.fill();
            ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
            ctx.textAlign = 'center'; ctx.fillStyle = i === bi ? '#1b2630' : C.ink; ctx.font = `800 28px ${C.fontDisplay}`;
            ctx.fillText(k.name, x, L1Y + 10);
            ctx.textAlign = 'left';
            ctx.font = `600 21px ${C.fontMono}`; ctx.fillStyle = C.pen;
            ctx.fillText(Math.round(k.P * 100) + '%', x + 44, L1Y - 8);
            ctx.font = `500 20px ${C.fontMono}`; ctx.fillStyle = C.ink;
            ctx.fillText(k.N ? '승률 ' + Math.round((k.W / k.N) * 100) : '승률 ?', x + 44, L1Y + 18);
            ctx.fillStyle = C.ink2;
            ctx.fillText('방문 ' + k.N, x + 44, L1Y + 42);
          });
          if (bi >= 0) {
            ctx.strokeStyle = C.pen; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(l1x(bi), L1Y, 37, 0, 7); ctx.stroke();
            ctx.font = `400 36px ${C.fontHand}`; ctx.fillStyle = C.pen; ctx.textAlign = 'center';
            ctx.fillText(`↑ ${root.kids[bi].name}를 둔다!`, l1x(bi), L2Y + 54);
          }
          count.textContent = `지금까지 ${fmt(sims)}번`;
        }
        el.querySelector('.more').addEventListener('click', () => { target += 100; });
        el.querySelector('.reset').addEventListener('click', () => { reset(0); draw(); });
        K.loop(el, (t, dt) => {
          let changed = flashes.length > 0;
          if (sims < target) {
            acc += dt * 70;
            while (acc >= 1 && sims < target) { acc -= 1; flashes.push({ p: mctsStep(root, rnd), t }); sims++; }
            changed = true;
          } else acc = 0;
          while (flashes.length && t - flashes[0].t > 0.35) flashes.shift();
          if (changed) draw(t);
        });
        this._finish = () => { while (sims < target) { mctsStep(root, rnd); sims++; } flashes.length = 0; draw(); };
        reset(100);
        K.onTheme(() => draw());
        draw();
      },
      leave() { this._finish && this._finish(); },
    },

    /* ─────────────────────────── 1교시 wrap-up + break timer ─────────────────────────── */
    {
      id: 'break',
      tag: '1교시 끝',
      title: '1교시 정리 · 쉬는 시간',
      minutes: 0.8,
      notes: '1교시를 세 장의 메모로 정리합니다(→ 키를 누를 때마다 한 장씩). ① AI는 규칙을 사람이 다 써 주는 게 아니라 데이터에서 배우는 기계. ② 신경망이 외면받던 겨울에도 포기하지 않은 사람들(힌턴, 르쿤)이 있었고, 데이터의 중요성을 먼저 본 사람(페이페이 리)이 있었다. ③ 2012년, 데이터(ImageNet) + GPU + 알고리즘(딥러닝)이 한자리에서 만났다.\n클릭: 오른쪽 [시작]을 누르면 10분 타이머가 돕니다. [정지]로 멈추고 [10분]으로 되돌립니다.\n2교시 예고: “ChatGPT는 어떻게 말할까?” 힌트는 오늘 첫 화면의 ‘다음 단어 맞히기’.\n질문: “세 가지 중 하나라도 빠졌다면 2012년의 빅뱅은 일어났을까요?”',
      html: `
        <style>
          #f-break .sticky { position: absolute; font-size: 64px; width: 440px; min-height: 236px; }
          #f-break .sticky .n { font-family: var(--font-mono); font-size: 26px; display: block; margin-bottom: 6px; }
          #f-break .clock { position: absolute; left: 1050px; top: 70px; width: 458px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
          #f-break .ring { position: relative; width: 380px; height: 380px; }
          #f-break .ring svg { position: absolute; inset: 0; }
          #f-break .ring .trk { fill: none; stroke: var(--paper-3); stroke-width: 16; }
          #f-break .ring .arc { fill: none; stroke: var(--ink); stroke-width: 16; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 190px 190px; }
          #f-break .ring .tick { stroke: var(--ink-3); stroke-width: 3; }
          #f-break .digits { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          #f-break .digits b { font-family: var(--font-mono); font-weight: 600; font-size: 84px; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; line-height: 1; }
          #f-break .digits span { font-family: var(--font-hand); font-size: 36px; color: var(--pen); margin-top: 8px; }
          #f-break .digits.done b { background: var(--hl-soft); padding: 0 10px; }
          #f-break .next { position: absolute; left: 1060px; top: 640px; width: 448px; }
        </style>
        <div class="kicker">1교시 끝 · 쉬는 시간 10분</div>
        <h2 class="title">기억할 3가지</h2>
        <div class="sticky" data-step="1" style="left:92px;top:262px;--tilt:-2.5deg"><span class="n">①</span>AI = 데이터에서<br>규칙을 배우는 기계</div>
        <div class="sticky" data-step="2" style="left:560px;top:300px;--tilt:2deg"><span class="n">②</span>겨울을 버틴<br>사람들이 있었다</div>
        <div class="sticky" data-step="3" style="left:250px;top:574px;width:560px;--tilt:-1deg"><span class="n">③</span>2012년, 데이터 + GPU<br>+ 알고리즘이 만났다</div>
        <div class="clock demo">
          <div class="ring">
            <svg viewBox="0 0 380 380" width="380" height="380" aria-hidden="true">
              <circle class="trk" cx="190" cy="190" r="168"/>
              <circle class="arc" cx="190" cy="190" r="168"/>
            </svg>
            <div class="digits"><b class="num">10:00</b><span class="lab">쉬는 시간</span></div>
          </div>
          <div class="btns"><button class="btn go">시작</button><button class="btn pause">정지</button><button class="btn ghost rst">10분</button></div>
        </div>
        <div class="next">
          <div class="mono" style="font-size:20px;color:var(--ink-2)">2교시 예고</div>
          <div class="display" style="font-size:44px;font-weight:800;line-height:1.15">ChatGPT는<br>어떻게 말할까?</div>
          <div class="hand" style="font-size:34px;margin-top:4px">힌트: 첫 화면의 ‘다음 단어 맞히기’</div>
        </div>`,
      init(el, K) {
        const TOTAL = 600;
        const arc = el.querySelector('.ring .arc'), digits = el.querySelector('.digits'), num = digits.querySelector('b'), lab = digits.querySelector('.lab');
        const svg = el.querySelector('.ring svg');
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          K.svg('line', { class: 'tick', x1: 190 + Math.cos(a) * 146, y1: 190 + Math.sin(a) * 146, x2: 190 + Math.cos(a) * 134, y2: 190 + Math.sin(a) * 134 }, svg);
        }
        const CIRC = 2 * Math.PI * 168;
        arc.style.strokeDasharray = `${CIRC} ${CIRC}`;
        let left = TOTAL, endAt = 0, running = false;
        function render() {
          const s = Math.max(0, Math.ceil(left));
          num.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
          arc.style.strokeDashoffset = String(CIRC * (1 - left / TOTAL));
          digits.classList.toggle('done', left <= 0);
          lab.textContent = left <= 0 ? '2교시 시작!' : running ? '쉬는 중…' : left < TOTAL ? '멈춤' : '쉬는 시간';
          el.querySelector('.go').classList.toggle('on', running);
        }
        el.querySelector('.go').addEventListener('click', () => { if (left <= 0) left = TOTAL; endAt = Date.now() + left * 1000; running = true; render(); });
        el.querySelector('.pause').addEventListener('click', () => { if (running) { left = Math.max(0, (endAt - Date.now()) / 1000); running = false; render(); } });
        el.querySelector('.rst').addEventListener('click', () => { running = false; left = TOTAL; render(); });
        K.loop(el, () => {
          if (!running) return;
          left = Math.max(0, (endAt - Date.now()) / 1000);
          if (left <= 0) running = false;
          render();
        });
        this._sync = () => { if (running) { left = Math.max(0, (endAt - Date.now()) / 1000); if (left <= 0) running = false; } render(); };
        render();
      },
      enter() { this._sync && this._sync(); },
    },
  ]);
})();
