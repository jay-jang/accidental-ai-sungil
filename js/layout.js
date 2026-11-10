/* World layout: where every section and frame sits on the single canvas.
   The route is an ∞: the title sits at the crossing, 1교시 loops to the left,
   2교시 loops to the right, and the closing frames hide inside the title. */
(function () {
  'use strict';
  const Deck = (window.Deck = window.Deck || {});
  const DW = 1600, DH = 900;

  Deck.SECTIONS = [
    { id: 'opening', lecture: 1, title: '어쩌다 AI', hub: false, layout: { type: 'title', scale: 5 } },
    {
      id: 'speaker', lecture: 1, kicker: '1교시 · 첫 번째 정류장', title: '어쩌다 엔지니어', sub: '강사 소개 · 장정식',
      at: [-7600, -5200], rot: -3, layout: { type: 'grid', cols: 3 },
      notes: '강사 소개 구역입니다. 전체가 한눈에 보이는 상태에서 “오늘 저는 이런 길을 걸어온 사람”이라고 짧게 말하고 첫 장으로 들어갑니다.',
    },
    {
      id: 'concepts', lecture: 1, kicker: '1교시 · 두 번째 정류장', title: 'AI, 대체 뭐야?', sub: '개념을 손으로 만져 보기',
      at: [-15800, -600], rot: 0, layout: { type: 'grid', cols: 4 },
      notes: 'AI 개념 구역입니다. 여기 있는 실습들은 모두 브라우저에서 바로 돌아갑니다. 학생에게 직접 슬라이더를 움직여 보게 해도 좋습니다.',
    },
    {
      id: 'history', lecture: 1, kicker: '1교시 · 세 번째 정류장', title: '생각하는 기계를 꿈꾼 70년', sub: '1943 → 2016, 여름과 겨울',
      at: [-9000, 6800], rot: 0, layout: { type: 'road', cols: 6 },
      notes: '역사 구역입니다. 길을 따라 연도가 이어집니다. 사람의 얼굴과 사건 하나씩만 기억하게 하는 것이 목표입니다.',
    },
    {
      id: 'llm', lecture: 2, kicker: '2교시 · 첫 번째 정류장', title: 'ChatGPT는 어떻게 말할까', sub: '토큰, 확률, 어텐션',
      at: [7600, 5400], rot: 2, layout: { type: 'grid', cols: 4 },
      notes: '쉬는 시간 끝. 쉬는 시간 화면의 예고 ‘ChatGPT는 어떻게 말할까?’를 다시 읽고, 첫 화면의 ‘어쩌다 ___’ 다음 단어 맞히기를 기억하는지 묻습니다. 다음 장에서 1교시를 30초로 되짚고 2017년으로 넘어갑니다. 이 구역의 목표: 언어 모델이 실제로 하는 일은 “다음 토큰 맞히기”라는 것을 체험하게 합니다.',
    },
    {
      id: 'race', lecture: 2, kicker: '2교시 · 두 번째 정류장', title: '폭발', sub: '2017 → 2026, 규모의 경쟁',
      at: [16200, 6600], rot: 0, layout: { type: 'road', cols: 3 },
      notes: '원리는 봤습니다. 이 원리를 아주 크게 만들었더니 무슨 일이 생겼을까요? 2018년 GPT-1부터 지금까지, 숫자(파라미터, 사용자 수, 비용)가 얼마나 빨리 커졌는지 따라갑니다. 2교시 첫 장의 “재료 + 엔진 + ?”에서 물음표가 여기서 채워집니다.',
    },
    {
      id: 'players', lecture: 2, kicker: '2교시 · 세 번째 정류장', title: '사람과 회사, 그리고 긴장', sub: 'Google 재료를 다 가진 거인 · OpenAI 구글 견제로 탄생 · Anthropic ‘안전 먼저’로 갈라짐 · Tesla 도로에서 배우는 차',
      at: [18400, -1600], rot: -2, layout: { type: 'grid', cols: 4 },
      notes: '방금 판도 지도에 나온 회사들은 어떻게 생겼고, 누가 누구와 갈라섰을까요? 트랜스포머 장에서 던진 질문(왜 구글이 아니라 OpenAI가 먼저?)의 답도 여기 있습니다. 누가 누구의 제자였고, 돈이 어디서 왔는지를 한 지도에 겹쳐 봅니다.',
    },
    {
      id: 'money', lecture: 2, kicker: '2교시 · 네 번째 정류장', title: '돈은 어디로 흐르나', sub: '칩 · 전기 · 투자 · 그리고 한국',
      at: [11600, -7000], rot: 3, layout: { type: 'grid', cols: 3 },
      notes: '앞에서 MS·아마존·구글이 OpenAI와 Anthropic에 돈을 댄 걸 봤죠. 그 돈이 칩 → 클라우드 → 전기 → 한국으로 어떻게 흐르는지 따라갑니다. (곡괭이 비유는 한국 반도체 장에서 꺼냅니다.)',
    },
    {
      id: 'future', lecture: 2, kicker: '2교시 · 마지막 정류장', title: 'AI 시대의 일', sub: '그리고 소프트웨어 엔지니어의 내일',
      at: [2400, -7600], rot: 0, layout: { type: 'stairs', cols: 4 },
      notes: '거품이든 아니든 기술은 남습니다. 이제 처음의 Q3, ‘그럼 나는 뭘 준비해야 하지?’의 답을 찾으러 갑니다. 겁을 주기보다 “무엇이 바뀌고 무엇이 남는지”를 구체적인 데이터로 보여줍니다.',
    },
    { id: 'closing', lecture: 2, title: '마무리', hub: false, layout: { type: 'slots', start: 2 } },
  ];

  /* ───────── local layouts (hub-local coordinates, hub centre = 0,0) ───────── */
  const BAND = { x0: 70, x1: 1530, y0: 250, y1: 850 }; // children area inside a hub, in hub-design units

  function gridLayout(n, cols, gapX, gapY, opts) {
    opts = opts || {};
    const rows = Math.ceil(n / cols);
    const cellW = DW + gapX, cellH = DH + gapY;
    const lift = opts.lift || 0; // stairs: each column rises by `lift`
    const head = opts.head || 0; // road: room above the first row for its year labels, so they never sit on the hub's sub line
    const gridW = cols * DW + (cols - 1) * gapX;
    const gridH = rows * DH + (rows - 1) * gapY + lift * (cols - 1) + head;
    const S = Math.max(gridW / (BAND.x1 - BAND.x0), gridH / (BAND.y1 - BAND.y0));
    const areaCx = ((BAND.x0 + BAND.x1) / 2 - DW / 2) * S;
    const areaCy = ((BAND.y0 + BAND.y1) / 2 - DH / 2) * S;
    const pos = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols);
      let c = i % cols;
      const inRow = Math.min(cols, n - r * cols);
      if (opts.serpentine && r % 2 === 1) c = inRow - 1 - c;
      const rowShift = lift ? 0 : ((cols - inRow) * cellW) / 2;
      const x = areaCx - gridW / 2 + c * cellW + DW / 2 + (opts.serpentine && r % 2 === 1 ? (cols - inRow) * cellW - rowShift : rowShift);
      const y = areaCy - gridH / 2 + head + r * cellH + DH / 2 + lift * (cols - 1 - c);
      pos.push({ x, y, row: r, col: c });
    }
    return { S, pos, rows, gapX, gapY };
  }

  function rot(x, y, deg) {
    const a = (deg * Math.PI) / 180;
    return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  }

  /* ───────── compute positions ───────── */
  function compute(sections, frames) {
    const title = sections.find((s) => s.layout.type === 'title');
    const T = title.layout.scale;
    const titleFrame = title.frames.find((f) => !f.view);
    titleFrame.cx = 0; titleFrame.cy = 0; titleFrame.s = T; titleFrame.r = 0;
    // bottom slots inside the title frame
    const slotW = 216, slotGap = 26, slotY = 680, slotX0 = 92;
    const slot = (k) => {
      const x = slotX0 + k * (slotW + slotGap) + slotW / 2 - DW / 2;
      const y = slotY + (slotW * DH) / DW / 2 - DH / 2;
      return { cx: x * T, cy: y * T, s: (slotW / DW) * T };
    };
    let k = 0;
    title.frames.filter((f) => !f.view && f !== titleFrame).forEach((f) => Object.assign(f, slot(k++), { r: 0 }));
    const closing = sections.find((s) => s.layout.type === 'slots');
    if (closing) { let j = closing.layout.start || k; closing.frames.filter((f) => !f.view).forEach((f) => Object.assign(f, slot(j++), { r: 0 })); }

    // hub sections
    const hubs = sections.filter((s) => s.hub !== false);
    hubs.forEach((sec) => {
      const kids = sec.frames.filter((f) => !f.hub && !f.view);
      const L = sec.layout;
      let g;
      if (L.type === 'road') g = gridLayout(kids.length, L.cols, 300, 460, { serpentine: true, head: 260 });
      else if (L.type === 'stairs') g = gridLayout(kids.length, L.cols, 240, 280, { lift: 130 });
      else g = gridLayout(kids.length, L.cols, 220, 300);
      sec._g = g;
      sec._S = g.S;
      sec._w = DW * g.S; sec._h = DH * g.S;
      sec._cx = sec.at[0]; sec._cy = sec.at[1];
    });

    // push hubs apart so no two regions (or a region and the title) overlap
    const M = 1500;
    const boxes = [{ fixed: true, cx: 0, cy: 0, w: DW * T, h: DH * T }].concat(hubs.map((s) => ({ sec: s, cx: s._cx, cy: s._cy, w: s._w, h: s._h })));
    for (let it = 0; it < 300; it++) {
      let moved = false;
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const ox = (a.w + b.w) / 2 + M - Math.abs(a.cx - b.cx);
        const oy = (a.h + b.h) / 2 + M - Math.abs(a.cy - b.cy);
        if (ox > 0 && oy > 0) {
          moved = true;
          const useX = ox < oy;
          const d = (useX ? ox : oy) / (a.fixed || b.fixed ? 1 : 2) + 1;
          const sx = Math.sign(b.cx - a.cx) || 1, sy = Math.sign(b.cy - a.cy) || 1;
          if (!a.fixed) { if (useX) a.cx -= sx * d; else a.cy -= sy * d; }
          if (!b.fixed) { if (useX) b.cx += sx * d; else b.cy += sy * d; }
        }
      }
      if (!moved) break;
    }
    boxes.forEach((b) => { if (b.sec) { b.sec._cx = b.cx; b.sec._cy = b.cy; } });

    hubs.forEach((sec) => {
      const hub = sec.frames.find((f) => f.hub);
      const kids = sec.frames.filter((f) => !f.hub && !f.view);
      const R = sec.rot || 0;
      Object.assign(hub, { cx: sec._cx, cy: sec._cy, s: sec._S, r: R });
      kids.forEach((f, i) => {
        const p = sec._g.pos[i];
        const [dx, dy] = rot(p.x, p.y, R);
        Object.assign(f, { cx: sec._cx + dx, cy: sec._cy + dy, s: 1, r: R, _row: p.row, _col: p.col, _lx: p.x, _ly: p.y });
      });
    });

    // world bounds
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    frames.forEach((f) => {
      if (f.view) return;
      const hw = (DW * f.s) / 2, hh = (DH * f.s) / 2;
      x0 = Math.min(x0, f.cx - hw); x1 = Math.max(x1, f.cx + hw);
      y0 = Math.min(y0, f.cy - hh); y1 = Math.max(y1, f.cy + hh);
    });
    const pad = 900;
    return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
  }

  /* ───────── decorations: route, roads, year labels ───────── */
  function decor(sections, frames, box) {
    const svg = Kit.svg('svg', { id: 'decor', viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`, width: box.w, height: box.h, 'aria-hidden': 'true' });
    svg.style.left = box.x + 'px'; svg.style.top = box.y + 'px';
    const gRoute = Kit.svg('g', { class: 'loop-route' }, svg); // the ∞ route and its labels: meant for the overview map
    const gLocal = Kit.svg('g', {}, svg);

    // inside each hub: connectors between consecutive frames
    sections.filter((s) => s.hub !== false).forEach((sec, si) => {
      const kids = sec.frames.filter((f) => !f.hub && !f.view);
      const R = sec.rot || 0;
      const g = Kit.svg('g', { transform: `translate(${sec._cx},${sec._cy}) rotate(${R})` }, gLocal);
      const road = sec.layout.type === 'road';
      const gp = sec._g;
      const pts = [];
      for (let i = 0; i < kids.length - 1; i++) {
        const a = kids[i], b = kids[i + 1];
        const ax = a._lx, ay = a._ly, bx = b._lx, by = b._ly;
        if (a._row === b._row) {
          const dir = Math.sign(bx - ax);
          pts.push({ d: `M${ax + (dir * (DW + 40)) / 2},${ay} L${bx - (dir * (DW + 40)) / 2},${by}` });
        } else {
          // row change: go out to the side, down through the gap, and in
          const side = road ? Math.sign(ax) || 1 : 1;
          const ex = road ? ax + (side * DW) / 2 : ax + DW / 2;
          const turnX = road ? ex + side * 260 : ex + 120;
          const gapY = ay + DH / 2 + gp.gapY / 2;
          if (road) {
            pts.push({ d: `M${ex + side * 20},${ay} C${turnX + side * 200},${ay} ${turnX + side * 200},${by} ${bx + (side * (DW + 40)) / 2},${by}` });
          } else {
            // walk back along the gap under this row; with lifted (stairs) columns the gap
            // height differs per column, so step at the column gutters
            const row = kids.filter((k) => k._row === a._row).sort((p, q) => q._lx - p._lx);
            let d = `M${ex},${ay} H${turnX}`;
            row.forEach((k, j) => {
              const mid = k._ly + DH / 2 + gp.gapY / 2;
              d += ` V${mid}`;
              const next = row[j + 1];
              d += next ? ` H${(k._lx - DW / 2 + next._lx + DW / 2) / 2}` : ` H${k._lx - DW / 2 - 120}`;
            });
            d += ` V${by} H${bx - DW / 2}`;
            void gapY;
            pts.push({ d });
          }
        }
      }
      pts.forEach((p) => {
        if (road) {
          Kit.svg('path', { d: p.d, class: 'road', 'stroke-width': 150 }, g);
          Kit.svg('path', { d: p.d, class: 'route', 'stroke-width': 10, 'stroke-dasharray': '50 40' }, g);
        } else {
          Kit.svg('path', { d: p.d, class: 'route', 'stroke-width': 8, 'stroke-dasharray': '4 26', fill: 'none' }, g);
        }
      });
      // year + tag labels on road sections
      kids.forEach((f) => {
        if (!f.year && !f.tag) return;
        const x = f._lx - DW / 2 + 6, y = f._ly - DH / 2 - 54;
        if (f.year) { const t = Kit.svg('text', { x, y, class: 'lbl-year', 'font-size': 150 }, g); t.textContent = f.year; }
        if (f.tag) {
          const t = Kit.svg('text', { x: x + (f.year ? String(f.year).length * 92 + 60 : 0), y: y - 6, class: 'lbl-tag', 'font-size': 150 }, g);
          t.textContent = f.tag;
        }
      });
      void si;
    });

    // ∞ route between title and hubs
    const titleR = { cx: 0, cy: 0, w: DW * sections[0].layout.scale, h: DH * sections[0].layout.scale };
    const R = (sec) => {
      const a = Math.abs(((sec.rot || 0) * Math.PI) / 180), c = Math.cos(a), sn = Math.sin(a);
      return { cx: sec._cx, cy: sec._cy, w: sec._w * c + sec._h * sn, h: sec._w * sn + sec._h * c };
    };
    const byId = (id) => sections.find((s) => s.id === id);
    const loops = [
      { ids: ['speaker', 'concepts', 'history'], label: '1교시 · 50분', end: '쉬는 시간' },
      { ids: ['llm', 'race', 'players', 'money', 'future'], label: '2교시 · 50분', end: '' },
    ];
    function edgePoint(r, tx, ty) {
      const dx = tx - r.cx, dy = ty - r.cy;
      const sx = r.w / 2 / Math.abs(dx || 1e-6), sy = r.h / 2 / Math.abs(dy || 1e-6);
      const s = Math.min(sx, sy) * 1.0;
      return [r.cx + dx * s, r.cy + dy * s];
    }
    // keep-out boxes: the title and every hub region (route labels must not land inside them);
    // 700 of padding keeps a label out of a hub's own view even on a 16:10 projector
    const keepOut = [titleR].concat(sections.filter((x) => x.hub !== false).map(R)).map((r) => ({ x0: r.cx - r.w / 2 - 700, x1: r.cx + r.w / 2 + 700, y0: r.cy - r.h / 2 - 700, y1: r.cy + r.h / 2 + 700 }));
    const placed = [];
    // label width: Hangul is about 1em when the hand font falls back to a system font (Nanum Pen itself is narrower)
    const textW = (text, fs) => [...text].reduce((w, ch) => w + (/[ㄱ-힣]/.test(ch) ? 1 : 0.55), 0) * fs;
    function freeSpot(text, fs, cands) {
      const w = textW(text, fs), h = fs * 1.1;
      for (const [x, y] of cands) {
        const b = { x0: x - w / 2, x1: x + w / 2, y0: y - h * 0.85, y1: y + h * 0.25 };
        const hit = keepOut.concat(placed).some((k) => b.x0 < k.x1 && b.x1 > k.x0 && b.y0 < k.y1 && b.y1 > k.y0);
        if (!hit) { placed.push(b); return [x, y]; }
      }
      return null;
    }
    // nudge a point on a rect edge outward so arrows never touch the frames inside
    const outward = (p, r, d) => { const dx = p[0] - r.cx, dy = p[1] - r.cy, l = Math.hypot(dx, dy) || 1; return [p[0] + (dx / l) * d, p[1] + (dy / l) * d]; };
    loops.forEach((L, li) => {
      const rects = [titleR].concat(L.ids.map((id) => byId(id)).filter(Boolean).map(R)).concat([titleR]);
      const lc = rects.slice(0, -1).reduce((a, r) => [a[0] + r.cx / (rects.length - 1), a[1] + r.cy / (rects.length - 1)], [0, 0]);
      for (let i = 0; i < rects.length - 1; i++) {
        const A = rects[i], B = rects[i + 1];
        const pa = outward(edgePoint(A, B.cx, B.cy), A, 400), pb = outward(edgePoint(B, A.cx, A.cy), B, 400);
        const mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
        let nx = -(pb[1] - pa[1]), ny = pb[0] - pa[0];
        const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        if ((mx - lc[0]) * nx + (my - lc[1]) * ny < 0) { nx = -nx; ny = -ny; }
        const bulge = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) * 0.22;
        const c = [mx + nx * bulge, my + ny * bulge];
        const sa = pa, sb = pb;
        Kit.svg('path', { d: `M${sa[0]},${sa[1]} Q${c[0]},${c[1]} ${sb[0]},${sb[1]}`, class: 'route', 'stroke-width': 70, 'stroke-dasharray': '220 160' }, gRoute);
        // arrowhead
        const ang = Math.atan2(sb[1] - c[1], sb[0] - c[0]);
        const ah = 300, aw = 180;
        const p1 = [sb[0] - Math.cos(ang) * ah + Math.sin(ang) * aw, sb[1] - Math.sin(ang) * ah - Math.cos(ang) * aw];
        const p2 = [sb[0] - Math.cos(ang) * ah - Math.sin(ang) * aw, sb[1] - Math.sin(ang) * ah + Math.cos(ang) * aw];
        Kit.svg('path', { d: `M${p1[0]},${p1[1]} L${sb[0]},${sb[1]} L${p2[0]},${p2[1]}`, class: 'route', 'stroke-width': 70 }, gRoute);
        if (i === rects.length - 2 && L.end) {
          // e.g. "쉬는 시간": beside the last leg, wherever there is room
          const fs = 900, cands = [];
          const tx = pb[0] - pa[0], ty = pb[1] - pa[1];
          // (a short leg needs the far steps: back toward the hub it leaves, and into the lobe)
          for (const along of [0, -0.15, 0.15, -0.3, 0.3, -0.6, 0.6, -1, -1.5, -2]) for (const d of [600, -600, 1000, -1000, 1500, -1500, 2200, -2200, -3000]) {
            cands.push([c[0] + tx * along + nx * d, c[1] + ty * along + ny * d + fs * 0.35]);
          }
          let at = freeSpot(L.end, fs, cands), f2 = fs;
          if (!at) { f2 = 650; at = freeSpot(L.end, f2, cands); }
          if (at) { const t = Kit.svg('text', { x: at[0], y: at[1], class: 'lbl-hand', 'font-size': f2, 'text-anchor': 'middle' }, gRoute); t.textContent = L.end; }
        }
      }
      // the loop's own label goes inside the loop (each lobe of the ∞ is labelled once)
      {
        let at = null, fs = 1300;
        for (const f of [1300, 1050, 850]) {
          const cands = [];
          for (let rr = 0; rr <= 4000; rr += 250) for (let a = 0; a < 24; a++) {
            const ang = (a / 24) * Math.PI * 2;
            cands.push([lc[0] + Math.cos(ang) * rr, lc[1] + Math.sin(ang) * rr + f * 0.35]);
            if (rr === 0) break;
          }
          at = freeSpot(L.label, f, cands);
          if (at) { fs = f; break; }
        }
        if (at) { const t = Kit.svg('text', { x: at[0], y: at[1], class: 'lbl-hand', 'font-size': fs, 'text-anchor': 'middle' }, gRoute); t.textContent = L.label; }
      }
      void li;
    });
    return svg;
  }

  Deck.Layout = { compute, decor };
})();
