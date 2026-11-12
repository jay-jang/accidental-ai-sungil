/* Concepts, part 1: AI ⊃ ML ⊃ DL ⊃ GenAI, the AI effect, rules vs learning,
   a spam-filter lab (rules vs naive Bayes), three ways machines learn, and a k-means playground. */
(function () {
  'use strict';

  /* ───────── shared helpers ───────── */

  /** hand-drawn ellipse as an SVG path (pen overshoots the start a little, like a real loop) */
  function ellipseD(cx, cy, rx, ry, seed, wob) {
    const rnd = Kit.rand(seed);
    const n = 30, pts = [], a0 = rnd() * Math.PI * 2;
    for (let i = 0; i <= n + 1; i++) {
      const a = a0 + (i / n) * Math.PI * 2;
      const j = 1 + (rnd() - 0.5) * wob;
      pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
    }
    return Kit.sketchPath(pts, { seed: seed + 1 });
  }
  /** one wobbly SVG line segment */
  function lineD(x1, y1, x2, y2, seed, wob) {
    const r = Kit.rand(seed);
    wob = wob == null ? 2.2 : wob;
    const j = () => (r() - 0.5) * wob;
    return `M${(x1 + j()).toFixed(1)},${(y1 + j()).toFixed(1)} Q${((x1 + x2) / 2 + j() * 2).toFixed(1)},${((y1 + y2) / 2 + j() * 2).toFixed(1)} ${(x2 + j()).toFixed(1)},${(y2 + j()).toFixed(1)}`;
  }
  /** hand-drawn box: four strokes that slightly overshoot the corners */
  function boxD(x, y, w, h, seed) {
    const o = 5;
    return [lineD(x - o, y, x + w + o * 0.6, y + 1, seed), lineD(x + w, y - o * 0.6, x + w - 1, y + h + o, seed + 1),
      lineD(x + w + o * 0.4, y + h, x - o, y + h - 1, seed + 2), lineD(x, y + h + o * 0.5, x + 1, y - o, seed + 3)].join(' ');
  }
  /** arrow (shaft + head) as an SVG path */
  function arrowD(x1, y1, x2, y2, seed) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = 16, s = 0.42;
    return lineD(x1, y1, x2, y2, seed, 1.6) +
      ` M${(x2 - L * Math.cos(a - s)).toFixed(1)},${(y2 - L * Math.sin(a - s)).toFixed(1)} L${x2},${y2} L${(x2 - L * Math.cos(a + s)).toFixed(1)},${(y2 - L * Math.sin(a + s)).toFixed(1)}`;
  }

  /** point marker; shape index doubles cluster colour so colour is never the only cue */
  function mark(ctx, shape, x, y, r) {
    ctx.beginPath();
    if (shape === 0) ctx.arc(x, y, r, 0, Math.PI * 2);
    else if (shape === 1) ctx.rect(x - r * 0.86, y - r * 0.86, r * 1.72, r * 1.72);
    else if (shape === 2) { ctx.moveTo(x, y - r * 1.2); ctx.lineTo(x + r * 1.1, y + r * 0.8); ctx.lineTo(x - r * 1.1, y + r * 0.8); ctx.closePath(); }
    else if (shape === 3) { ctx.moveTo(x, y - r * 1.25); ctx.lineTo(x + r * 1.1, y); ctx.lineTo(x, y + r * 1.25); ctx.lineTo(x - r * 1.1, y); ctx.closePath(); }
    else {
      const a = r * 0.4, b = r * 1.1;
      [[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]]
        .forEach(([dx, dy], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy)));
      ctx.closePath();
    }
  }
  const clusterColors = (C) => [C.c[1], C.c[3], C.c[2], C.c[4], C.c[0]];
  /** canvas label on a paper patch so lines underneath never cut through it */
  function tag(ctx, C, text, x, y, hand) {
    // shrink the handwriting a little if a wider fallback font would run it off the canvas
    const maxW = (parseFloat(ctx.canvas.style.width) || 1e9) - x - 12;
    let size = hand ? 32 : 20;
    const font = () => (ctx.font = hand ? `${size}px ${C.fontHand}` : `600 ${size}px ${C.fontMono}`);
    font();
    while (hand && size > 22 && ctx.measureText(text).width > maxW) { size -= 1; font(); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const w = ctx.measureText(text).width;
    ctx.save(); ctx.globalAlpha = 0.88; ctx.fillStyle = C.paper; ctx.fillRect(x - 6, y - (hand ? 27 : 20), w + 12, hand ? 34 : 28); ctx.restore();
    ctx.fillStyle = hand ? C.pen : C.ink2;
    ctx.fillText(text, x, y);
  }

  /** shrink the font of `els` together (each from its own CSS size) while `tooWide()` holds. Only a much wider
      fallback font (web fonts blocked, e.g. a Windows PC where handwriting falls back to Malgun Gothic) triggers it;
      inline sizes are cleared first, so calling it again after the web fonts arrive restores the designed size. */
  function shrinkToFit(els, tooWide, minScale) {
    els = Array.from(els);
    els.forEach((e) => (e.style.fontSize = ''));
    const base = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    for (let k = 0.97; k >= (minScale || 0.6) && tooWide(); k -= 0.03) els.forEach((e, i) => (e.style.fontSize = (base[i] * k).toFixed(1) + 'px'));
  }

  /** gaussian blobs of points inside w×h */
  function blobs(seed, centers, n, sd, w, h, pad) {
    const rnd = Kit.rand(seed), pts = [];
    centers.forEach(([cx, cy], t) => {
      for (let i = 0; i < n; i++) {
        pts.push({ x: Kit.clamp(cx + Kit.gauss(rnd) * sd, pad, w - pad), y: Kit.clamp(cy + Kit.gauss(rnd) * sd, pad, h - pad), c: -1, t });
      }
    });
    return pts;
  }
  /* k-means building blocks */
  function kmAssign(pts, cents) {
    for (const p of pts) {
      let b = 0, bd = Infinity;
      cents.forEach((c, i) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; b = i; } });
      p.c = b;
    }
  }
  function kmUpdate(pts, cents) {
    let moved = 0;
    cents.forEach((c, i) => {
      let sx = 0, sy = 0, n = 0;
      for (const p of pts) if (p.c === i) { sx += p.x; sy += p.y; n++; }
      if (n) { const nx = sx / n, ny = sy / n; moved = Math.max(moved, Math.hypot(nx - c.x, ny - c.y)); c.x = nx; c.y = ny; }
    });
    return moved;
  }
  function sketchFrame(ctx, w, h, C, seed) {
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.lineCap = 'round';
    Kit.sketchRect(ctx, 3, 3, w - 6, h - 6, { seed: seed || 5, wobble: 1.4 });
    ctx.restore();
  }

  /* ───────── 1 · nested rings ───────── */
  const RINGS = [
    {
      name: '인공지능', en: 'AI', cx: 470, cy: 350, rx: 455, ry: 338, ly: 78, seed: 11,
      def: '기계가 사람처럼 판단하는 듯 보이게 하는 <span class="mark">모든 기술</span>',
      ex: '체스 프로그램 · 내비게이션 길 찾기 · 규칙형 챗봇',
      year: '1956', t0: 1956, t1: 1956, when: '다트머스 워크숍과 함께<br>‘AI’라는 이름이 탄생',
      media: () => Kit.photo('dartmouth', '다트머스 대학', 'sm tilt-r', '--ratio:4/3;--pos:50% 45%'),
    },
    {
      name: '머신러닝', en: 'Machine Learning', cx: 518, cy: 389, rx: 368, ry: 259, ly: 194, seed: 23,
      def: '규칙을 사람이 짜지 않고 <span class="mark">데이터에서 찾게</span> 하는 방법',
      ex: '스팸 거르기 · 유튜브 추천 · 손글씨 숫자 읽기',
      year: '1980–90s', t0: 1980, t1: 1999, when: '데이터로 배우는 방법이<br>주류가 됨<br><small>(이름은 1959년 아서 새뮤얼)</small>',
      media: () => Kit.photo('lenet', '손글씨 숫자', 'sm', '--ratio:4/3;--pos:20% 50%'),
    },
    {
      name: '딥러닝', en: 'Deep Learning', cx: 568, cy: 429, rx: 278, ry: 179, ly: 310, seed: 37,
      def: '인공 신경망을 <span class="mark">여러 층 깊게</span> 쌓아 배우는 머신러닝',
      ex: '사진 속 고양이 찾기 · 음성 인식 · 얼굴 인식',
      year: '2012', t0: 2012, t1: 2012, when: 'AlexNet이 게임용 GPU<br>2장으로 이미지 인식<br>대회에서 압승',
      media: () => Kit.photo('gpu', '게임용 GPU', 'sm tilt-r', '--ratio:4/3;--pos:38% 50%'),
    },
    {
      name: '생성형 AI', en: 'LLM · 거대 언어 모델', cx: 618, cy: 470, rx: 190, ry: 102, ly: 468, seed: 41,
      def: '배운 것으로 <span class="mark">글·그림·코드를 새로 만드는</span> 딥러닝',
      ex: 'ChatGPT · Claude · Gemini · 그림 생성 AI',
      year: '2022', t0: 2022, t1: 2022, when: 'ChatGPT 공개,<br>두 달 만에 1억 명<br><small>(월 사용자, UBS 추정)</small>',
      media: () => '<div class="term nz-chat"><span class="dim">&gt; 홍보 문구 써 줘</span><br>“코드로 내일을 만드는 사람들, 여기 모여라!”</div>',
    },
  ];

  /* ───────── 2 · AI effect ───────── */
  const AE = [
    { y: 1989, y2: 1996, lab: '1990년대', name: '우편번호·수표 손글씨 읽기', just: '그냥 스캔 기능' },
    { y: 1997, lab: '1997', name: '체스 챔피언을 이긴 딥블루', just: '그냥 체스 앱' },
    { y: 2002, lab: '2000년대', name: '스팸 메일 걸러내기', just: '그냥 스팸함' },
    { y: 2011, lab: '2011', name: '말로 시키는 음성 비서', just: '그냥 알람 맞추기' },
    { y: 2016, lab: '2016', name: '신경망 번역', just: '그냥 번역기' },
    { y: 2017, lab: '2017', name: '얼굴로 폰 잠금 해제', just: '그냥 잠금 해제' },
    { y: 2022, lab: '2022', name: 'ChatGPT', just: '그냥 챗봇?' },
  ];
  const AE_Y0 = 1985, AE_Y1 = 2030, AE_W = 1416, AE_FRESH = 5;
  const aeX = (y) => 14 + ((y - AE_Y0) / (AE_Y1 - AE_Y0)) * (AE_W - 28);

  /* ───────── 3 · rules vs learning (static SVG) ───────── */
  function rvBox(x, y, w, h, seed, head, sub, cls) {
    return `<path class="rv-ink ${cls || ''}" d="${boxD(x, y, w, h, seed)}"/>` +
      `<text class="rv-t" x="${x + 20}" y="${y + 40}">${head}</text>` +
      (sub ? `<text class="rv-s" x="${x + 20}" y="${y + 74}">${sub}</text>` : '');
  }
  function rvProc(x, y, w, h, seed, label) {
    return `<rect class="rv-proc" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>` +
      `<path class="rv-ink thick" d="${boxD(x, y, w, h, seed)}"/>` +
      `<text class="rv-t" x="${x + w / 2}" y="${y + h / 2 + 11}" text-anchor="middle">${label}</text>`;
  }
  const RV_SVG = (function () {
    const r1 = 0, r2 = 300;
    return `
      <svg class="rv-svg" viewBox="0 0 1000 600" aria-label="전통적 프로그래밍과 머신러닝 비교 도식">
        <g>
          <text class="rv-row" x="0" y="${r1 + 28}">전통적 프로그래밍</text>
          <text class="rv-rs" x="300" y="${r1 + 28}">사람이 규칙을 짠다</text>
          ${rvBox(0, r1 + 56, 300, 92, 101, '규칙', '귀 뾰족 + 수염 → 고양이')}
          ${rvBox(0, r1 + 168, 300, 92, 105, '데이터', '사진 한 장')}
          <path class="rv-ink" d="${arrowD(306, r1 + 102, 384, r1 + 146, 111)}"/>
          <path class="rv-ink" d="${arrowD(306, r1 + 214, 384, r1 + 172, 113)}"/>
          ${rvProc(390, r1 + 112, 190, 92, 121, '프로그램')}
          <path class="rv-ink" d="${arrowD(586, r1 + 158, 664, r1 + 158, 115)}"/>
          ${rvBox(670, r1 + 112, 300, 92, 131, '답', '“고양이다!”')}
        </g>
        <path class="rv-sep" d="${lineD(0, 286, 980, 284, 141, 3)}"/>
        <g data-step="1">
          <text class="rv-row" x="0" y="${r2 + 34}">머신러닝</text>
          <text class="rv-rs" x="150" y="${r2 + 34}">컴퓨터가 규칙을 찾는다</text>
          ${rvBox(0, r2 + 62, 300, 92, 151, '데이터', '사진 10,000장')}
          ${rvBox(0, r2 + 174, 300, 92, 155, '답', '이름표: 고양이 · 개 · …', 'pen')}
          <path class="rv-ink" d="${arrowD(306, r2 + 108, 384, r2 + 152, 161)}"/>
          <path class="rv-ink" d="${arrowD(306, r2 + 220, 384, r2 + 178, 163)}"/>
        </g>
        <g data-step="2">
          ${rvProc(390, r2 + 118, 190, 92, 171, '학습')}
          <path class="rv-ink" d="${arrowD(586, r2 + 164, 664, r2 + 164, 175)}"/>
          <rect class="rv-hl" x="670" y="${r2 + 118}" width="300" height="92" rx="4"/>
          ${rvBox(670, r2 + 118, 300, 92, 181, '규칙 = 모델', '데이터에서 찾은 패턴')}
          <text class="rv-h" x="676" y="${r2 + 262}">답을 넣으면 규칙이 나온다!</text>
        </g>
      </svg>`;
  })();

  /* ───────── 4 · spam lab data ───────── */
  const SMS = [
    ['[광고] 무료 쿠폰 당첨! 지금 클릭', 1],
    ['엄마 나 학원 끝나고 갈게', 0],
    ['고객님 대출 한도 3천만원 승인', 1],
    ['ㅋㅋ 내일 PC방 갈래?', 0],
    ['경품 당첨을 축하드립니다', 1],
    ['오늘 동아리 회의 4시 컴퓨터실', 0],
    ['무료 체험 이벤트 신청 클릭', 1],
    ['쿠폰 있는데 떡볶이 먹으러 갈래?', 0],
    ['저금리 대출 무료 상담', 1],
    ['택배 왔어 문 앞에 둘게', 0],
    ['[광고] 오늘만 특가 50% 할인', 1],
    ['숙제 내일까지야? ㅋㅋ', 0],
    ['택배 주소 오류, 확인 링크 클릭', 1],
    ['이벤트 당첨됐대 ㅋㅋ 대박', 0],
    ['고객님 계좌 승인 확인 바랍니다', 1],
    ['선생님이 자료 무료로 준대', 0],
  ];
  const SMS_TEST = [
    ['[광고] 신규 가입 쿠폰 무료 지급', 1],
    ['학원 끝나고 PC방 갈 사람 ㅋㅋ', 0],
    ['고객님 한도 승인 완료, 지금 확인', 1],
    ['엄마 쿠폰 당첨됐어 ㅋㅋ 대박', 0],
  ];
  const KEYWORDS = ['무료', '당첨', '클릭', '대출', '광고', '할인', '택배', 'ㅋㅋ'];
  const RUN = /[가-힣ㄱ-ㅎㅏ-ㅣa-z0-9]+/g;
  const runsOf = (s) => String(s).toLowerCase().match(RUN) || [];
  /** two-letter pieces (character bigrams) inside each word; one-letter words stay whole */
  function grams(s) {
    const out = new Set();
    for (const r of runsOf(s)) {
      if (r.length === 1) out.add(r);
      else for (let i = 0; i < r.length - 1; i++) out.add(r.slice(i, i + 2));
    }
    return Array.from(out);
  }

  /* ───────── 5 · three ways: little gridworld ───────── */
  const GW = 8, GH = 5;
  const WALLS = new Set(['3,0', '1,1', '3,1', '5,1', '1,2', '5,2', '1,3', '2,3', '3,3', '5,3']);
  const GOAL = [7, 0], TRAP = [6, 2], START = [0, 4];
  const MOVES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  Deck.part('concepts', 1, [
    /* ═════════════ 1. nested ═════════════ */
    {
      id: 'nested',
      title: 'AI ⊃ 머신러닝 ⊃ 딥러닝 ⊃ 생성형 AI',
      minutes: 1.5,
      notes: 'AI는 가장 큰 우산이고, 그 안에 머신러닝, 그 안에 딥러닝, 가장 안쪽에 요즘 말하는 생성형 AI(LLM)가 있습니다. 그래서 ChatGPT는 AI이면서 머신러닝이고 딥러닝이기도 합니다.\n' +
        '클릭: 바깥 고리부터 안쪽으로 하나씩 눌러 정의·예시·연도를 보여 줍니다. 고리를 누르면 그 안쪽 고리까지 노란 형광펜이 함께 칠해진다는 것(= 포함 관계)을 짚어 주세요. 오른쪽 아래 작은 연표로 1956 → 2022까지 66년이 걸렸다는 것도.\n' +
        '질문: “유튜브 추천은 어느 고리까지 들어갈까요? 딥러닝일까요, 그냥 머신러닝일까요?”',
      html: `
        <style>
          #f-nested .nz-svg { position:absolute; left:64px; top:200px; width:906px; height:660px; overflow:visible; }
          #f-nested .nz-ring { cursor:pointer; outline:none; }
          #f-nested .nz-ring .hit { fill:transparent; transition:fill .35s ease; }
          #f-nested .nz-ring.sel .hit { fill:var(--hl-soft); fill-opacity:.7; }
          #f-nested .stage { word-break:keep-all; }
          #f-nested .nz-ring .ink { fill:none; stroke:var(--ink); stroke-width:3.2; stroke-linecap:round; pointer-events:none; transition:stroke .2s; }
          #f-nested .nz-ring .ink2 { fill:none; stroke:var(--ink-2); stroke-width:1.3; pointer-events:none; opacity:.7; }
          #f-nested .nz-ring:hover .ink, #f-nested .nz-ring:focus-visible .ink { stroke:var(--pen); }
          #f-nested .nz-ring text { pointer-events:none; }
          #f-nested .nz-lab { font-family:var(--font-display); font-weight:800; font-size:42px; fill:var(--ink); }
          #f-nested .nz-en { font-family:var(--font-mono); font-size:21px; fill:var(--ink-2); }
          #f-nested .nz-panel { position:absolute; left:1010px; top:196px; width:498px; display:flex; flex-direction:column; gap:10px; }
          #f-nested .nz-name { font-family:var(--font-display); font-weight:800; font-size:58px; line-height:1.05; }
          #f-nested .nz-def { font-size:29px; line-height:1.35; }
          #f-nested .nz-ex { font-size:23px; color:var(--ink-2); line-height:1.4; }
          #f-nested .nz-media { display:flex; gap:26px; align-items:center; margin-top:10px; min-height:206px; }
          #f-nested .nz-when .year { font-size:66px; }
          #f-nested .nz-when .year.long { font-size:46px; }
          #f-nested .nz-when .hand { font-size:32px; margin-top:6px; }
          #f-nested .nz-when .hand small { font-size:26px; color:var(--ink-2); }
          #f-nested .nz-chat { width:236px; font-size:20px; line-height:1.45; padding:16px 18px; transform:rotate(-1.5deg); }
          #f-nested .nz-tl { width:498px; height:84px; overflow:visible; margin-top:4px; }
          #f-nested .nz-tl text { font-family:var(--font-mono); font-size:20px; fill:var(--ink-2); }
          #f-nested .nz-tl .on text { fill:var(--ink); font-weight:600; }
          #f-nested .nz-tl g { cursor:pointer; }
          #f-nested .nz-hint { left:772px; top:214px; font-size:38px; transform:rotate(4deg); white-space:nowrap; }
        </style>
        <div class="kicker">개념 지도 · 큰 우산 안의 작은 우산</div>
        <h2 class="title md">AI ⊃ 머신러닝 ⊃ 딥러닝 ⊃ 생성형 AI</h2>
        <svg class="nz-svg demo" viewBox="0 0 960 700" role="group" aria-label="네 겹의 동심원"></svg>
        <div class="nz-panel demo" aria-live="polite"></div>
        <div class="abs hand nz-hint">↙ 고리를 눌러 보세요</div>
        <div class="src">출처: 다트머스 제안서(1955) · Samuel(1959) · Krizhevsky 외(2012) · Reuters/UBS(2023.2): ChatGPT 월 사용자 1억 명 추정</div>`,
      init(el, K) {
        const svg = el.querySelector('.nz-svg');
        const panel = el.querySelector('.nz-panel');
        let sel = 0;
        RINGS.forEach((r, i) => {
          const g = K.svg('g', { class: 'nz-ring', 'data-i': i, tabindex: 0, role: 'button', 'aria-label': r.name }, svg);
          K.svg('ellipse', { class: 'hit', cx: r.cx, cy: r.cy, rx: r.rx, ry: r.ry }, g);
          K.svg('path', { class: 'ink2', d: ellipseD(r.cx + 2, r.cy + 1, r.rx + 3, r.ry + 2, r.seed + 5, 0.014) }, g);
          K.svg('path', { class: 'ink', d: ellipseD(r.cx, r.cy, r.rx, r.ry, r.seed, 0.01) }, g);
          K.svg('text', { class: 'nz-lab', x: r.cx, y: r.ly, 'text-anchor': 'middle' }, g).textContent = r.name;
          K.svg('text', { class: 'nz-en', x: r.cx, y: r.ly + 32, 'text-anchor': 'middle' }, g).textContent = r.en;
        });
        // mini timeline drawn to scale: 1950 → 2030
        const tx = (y) => 18 + ((y - 1950) / 80) * 462;
        const tl = (i) => {
          let s = `<line x1="${tx(1950)}" y1="30" x2="${tx(2030)}" y2="30" stroke="var(--ink-3)" stroke-width="2"/>`;
          [1950, 1970, 1990, 2010, 2030].forEach((y) => { s += `<line x1="${tx(y)}" y1="24" x2="${tx(y)}" y2="36" stroke="var(--ink-3)" stroke-width="2"/>`; });
          RINGS.forEach((r, j) => {
            const on = j === i, x0 = tx(r.t0), x1 = tx(r.t1), lx = (x0 + x1) / 2;
            const lab = j === 1 ? "80–90s" : r.year;
            s += `<g data-j="${j}" class="${on ? 'on' : ''}">` +
              (x1 > x0 ? `<line x1="${x0}" y1="30" x2="${x1}" y2="30" stroke="${on ? 'var(--ink)' : 'var(--ink-2)'}" stroke-width="${on ? 10 : 6}" stroke-linecap="round"/>`
                : `<circle cx="${x0}" cy="30" r="${on ? 10 : 6}" fill="${on ? 'var(--hl)' : 'var(--paper)'}" stroke="var(--ink)" stroke-width="2.5"/>`) +
              `<text x="${lx}" y="${j % 2 ? 72 : 14}" text-anchor="middle">${lab}</text>` +
              `<rect x="${lx - 34}" y="-6" width="68" height="86" fill="transparent"/></g>`;
          });
          return `<svg class="nz-tl" viewBox="0 0 498 84">${s}</svg>`;
        };
        const show = (i) => {
          sel = i;
          svg.querySelectorAll('.nz-ring').forEach((g, j) => g.classList.toggle('sel', j === i));
          const r = RINGS[i];
          panel.innerHTML = `
            <div class="mono tiny faint">고리 ${i + 1} / 4${i === 0 ? ' · 가장 바깥' : i === 3 ? ' · 가장 안쪽' : ''}</div>
            <div><div class="nz-name">${r.name}</div><div class="mono tiny muted" style="margin-top:4px">${r.en === 'AI' ? 'Artificial Intelligence' : r.en}</div></div>
            <p class="nz-def">${r.def}</p>
            <p class="nz-ex"><span class="mono">예)</span> ${r.ex}</p>
            <div class="nz-media">${r.media()}<div class="nz-when"><div class="year${r.year.length > 4 ? ' long' : ''}">${r.year}</div><div class="hand">${r.when}</div></div></div>
            ${tl(i)}`;
        };
        svg.addEventListener('click', (e) => { const g = e.target.closest('.nz-ring'); if (g) show(+g.dataset.i); });
        svg.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const g = e.target.closest('.nz-ring'); if (g) show(+g.dataset.i); } });
        panel.addEventListener('click', (e) => { const g = e.target.closest('.nz-tl g[data-j]'); if (g) show(+g.dataset.j); });
        show(sel);
        // the hint must end before the panel (x = 1010)
        const hint = el.querySelector('.nz-hint');
        const fitHint = () => shrinkToFit([hint], () => hint.offsetWidth > 224, 0.55);
        fitHint(); K.onTheme(fitHint);
      },
    },

    /* ═════════════ 2. ai-effect ═════════════ */
    {
      id: 'ai-effect',
      title: '되고 나면 AI라고 안 부른다',
      minutes: 1.5,
      notes: '새 기술은 처음 나왔을 때만 “AI”라고 불리고, 익숙해지면 그냥 기능이 됩니다. 이걸 ‘AI 효과’라고 하고, 래리 테슬러의 말로 알려진 “AI란 아직 안 된 모든 것”이 이를 요약합니다(테슬러 본인은 “지능이란 기계가 아직 못 한 모든 것”이라고 말했다고 밝혔습니다).\n' +
        '클릭: 아래 슬라이더(‘지금’)를 1990년 근처로 당겼다가 천천히 2026년까지 밀어 보세요. 널리 쓰인 지 5년이 안 된 것은 노란색 “AI다!”, 그보다 오래되면 회색 “그냥 기능”으로 바뀝니다. 마지막에 2030년까지 밀어서 ChatGPT도 회색이 되는 걸 보여 줍니다.\n' +
        '질문: “여러분이 오늘 쓴 것 중에 10년 전엔 ‘AI’라고 불렀을 기능은 뭐가 있을까요?”',
      html: `
        <style>
          #f-ai-effect .ae-quote { position:absolute; left:92px; top:232px; width:900px; font-size:44px; }
          #f-ai-effect .ae-quote cite { font-size:20px; }
          #f-ai-effect .ae-tl { position:absolute; left:92px; top:400px; width:${AE_W}px; word-break:keep-all; }
          #f-ai-effect .ae-cards { display:grid; grid-template-columns:repeat(7, 1fr); gap:12px; height:184px; }
          #f-ai-effect .ae-card { border:2.5px solid var(--ink); border-radius:12px 4px 12px 4px / 4px 12px 4px 12px; padding:10px 12px 10px; display:flex; flex-direction:column; gap:4px; background:var(--paper); transition:background .35s, opacity .35s, border-color .35s, transform .35s; }
          #f-ai-effect .ae-y { font-family:var(--font-mono); font-size:20px; color:var(--ink-2); }
          #f-ai-effect .ae-n { font-size:24px; font-weight:600; line-height:1.25; }
          #f-ai-effect .ae-s { margin-top:auto; font-family:var(--font-hand); font-size:33px; line-height:1; white-space:nowrap; }
          #f-ai-effect .ae-s b { font-family:var(--font-display); font-weight:800; font-size:30px; }
          #f-ai-effect .ae-s s { text-decoration-color:var(--bad); text-decoration-thickness:3px; color:var(--ink-3); }
          #f-ai-effect .ae-card.fresh { background:var(--hl-soft); transform:translateY(-6px) rotate(-1deg); }
          #f-ai-effect .ae-card.old { border-color:var(--ink-3); background:var(--paper-2); }
          #f-ai-effect .ae-card.old .ae-n { color:var(--ink-2); font-weight:500; }
          #f-ai-effect .ae-card.old .ae-s { color:var(--ink-2); }
          #f-ai-effect .ae-card.future { border-style:dashed; border-color:var(--ink-3); opacity:.5; }
          #f-ai-effect .ae-card.future .ae-s { color:var(--ink-3); }
          #f-ai-effect .ae-axis { display:block; width:${AE_W}px; height:118px; overflow:visible; }
          #f-ai-effect .ae-axis text { font-family:var(--font-mono); font-size:20px; fill:var(--ink-2); }
          #f-ai-effect .ae-lead { fill:none; stroke-width:2; }
          #f-ai-effect .ae-lead.fresh { stroke:var(--ink); stroke-width:3; }
          #f-ai-effect .ae-lead.old { stroke:var(--ink-3); }
          #f-ai-effect .ae-lead.future { stroke:var(--ink-3); stroke-dasharray:5 6; }
          #f-ai-effect .ae-range { width:${AE_W}px; display:block; margin-top:-6px; }
          #f-ai-effect .ae-read { display:flex; justify-content:space-between; align-items:baseline; margin-top:6px; font-size:28px; }
          #f-ai-effect .ae-read b { font-family:var(--font-mono); }
        </style>
        <div class="kicker">AI 효과 · AI effect</div>
        <h2 class="title">되고 나면 <span class="mark">AI</span>라고 안 부른다</h2>
        <blockquote class="quote ae-quote">AI란, 아직 안 된 모든 것이다.<cite>‘테슬러의 정리’ — 래리 테슬러의 말로 알려짐 · 호프스태터 『괴델, 에셔, 바흐』(1979)</cite></blockquote>
        <div class="abs" style="left:1078px;top:34px">${Kit.photo('deep-blue', '딥블루 <small>1997</small>', 'sm', '--pos:50% 45%')}</div>
        <div class="abs" style="left:1284px;top:118px">${Kit.photo('lenet', '손글씨 숫자', 'tilt-r', '--w:224px;--ratio:16/10;--pos:0% 0%')}</div>
        <div class="ae-tl demo">
          <div class="ae-cards"></div>
          <svg class="ae-axis" viewBox="0 0 ${AE_W} 118"></svg>
          <input class="ae-range" type="range" min="${AE_Y0}" max="${AE_Y1}" step="1" value="2026" aria-label="지금이 몇 년인지">
          <div class="ae-read"><span>지금 <b class="ae-now">2026</b>년<span class="ae-fut"></span> → ‘AI’라고 부르는 것 <b class="ae-n1">1</b>개 · ‘그냥 기능’ <b class="ae-n2">6</b>개</span><span class="mono small faint ae-hint">← 슬라이더로 ‘지금’을 옮겨 보세요 →</span></div>
        </div>
        <div class="src">출처: LeCun 외(1989) · IBM Deep Blue(1997) · P. Graham, “A Plan for Spam”(2002) · Apple Siri(2011) · Google 신경망 번역(2016.11, 한국어 포함) · Apple Face ID(2017) · OpenAI ChatGPT(2022.11.30) · 테슬러 본인 표현: “Intelligence is whatever machines haven't done yet.”</div>`,
      init(el, K) {
        const cards = el.querySelector('.ae-cards');
        cards.innerHTML = AE.map((a, i) => `<div class="ae-card" data-i="${i}"><div class="ae-y">${a.lab}</div><div class="ae-n">${a.name}</div><div class="ae-s"></div></div>`).join('');
        const svg = el.querySelector('.ae-axis');
        const range = el.querySelector('.ae-range');
        const cw = (AE_W - 6 * 12) / 7, AXY = 66;
        // static axis
        K.svg('path', { d: lineD(aeX(AE_Y0) - 6, AXY, aeX(AE_Y1) + 6, AXY, 9, 1.2), stroke: 'var(--ink)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, svg);
        const past = K.svg('line', { x1: aeX(AE_Y0), y1: AXY, x2: aeX(2026), y2: AXY, stroke: 'var(--hl-soft)', 'stroke-width': 16, 'stroke-linecap': 'round' }, svg);
        svg.insertBefore(past, svg.firstChild);
        for (let y = 1990; y <= 2030; y += 10) {
          K.svg('line', { x1: aeX(y), y1: AXY - 8, x2: aeX(y), y2: AXY + 8, stroke: 'var(--ink)', 'stroke-width': 2 }, svg);
          K.svg('text', { x: aeX(y), y: AXY + 36, 'text-anchor': 'middle' }, svg).textContent = y;
        }
        const leads = [], dots = [];
        AE.forEach((a, i) => {
          const cx = i * (cw + 12) + cw / 2, x = aeX(a.y);
          leads.push(K.svg('path', { class: 'ae-lead', d: `M${cx},0 C${cx},${AXY * 0.55} ${x},${AXY * 0.45} ${x},${AXY - 7}` }, svg));
          if (a.y2) dots.push(K.svg('line', { x1: x, y1: AXY, x2: aeX(a.y2), y2: AXY, stroke: 'var(--ink)', 'stroke-width': 8, 'stroke-linecap': 'round' }, svg));
          else dots.push(K.svg('circle', { cx: x, cy: AXY, r: 7, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 3 }, svg));
        });
        const nowLine = K.svg('line', { x1: 0, y1: 0, x2: 0, y2: AXY + 14, stroke: 'var(--pen)', 'stroke-width': 3, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' }, svg);
        const update = () => {
          const now = +range.value;
          let n1 = 0, n2 = 0;
          AE.forEach((a, i) => {
            // a range (y → y2) counts from when it became common (y2)
            const st = now < a.y ? 'future' : now - (a.y2 || a.y) < AE_FRESH ? 'fresh' : 'old';
            const c = cards.children[i];
            c.className = 'ae-card ' + st;
            c.querySelector('.ae-s').innerHTML = st === 'future' ? '아직 못 함' : st === 'fresh' ? '<b>AI다!</b>' : `<s>AI</s> ${a.just}`;
            leads[i].setAttribute('class', 'ae-lead ' + st);
            if (dots[i].tagName === 'circle') dots[i].setAttribute('fill', st === 'fresh' ? 'var(--hl)' : st === 'old' ? 'var(--ink-3)' : 'var(--paper)');
            if (st === 'fresh') n1++; else if (st === 'old') n2++;
          });
          past.setAttribute('x2', aeX(now));
          nowLine.setAttribute('x1', aeX(now)); nowLine.setAttribute('x2', aeX(now));
          el.querySelector('.ae-now').textContent = now;
          el.querySelector('.ae-fut').textContent = now > 2026 ? '(미래)' : '';
          el.querySelector('.ae-n1').textContent = n1;
          el.querySelector('.ae-n2').textContent = n2;
          // the one-line verdicts must not push the seven cards past the timeline's width
          const last = cards.lastElementChild;
          shrinkToFit(cards.querySelectorAll('.ae-s'), () => last.offsetLeft + last.offsetWidth - cards.offsetLeft > cards.clientWidth + 1, 0.55);
        };
        range.addEventListener('input', update);
        update();
        K.onTheme(update);
      },
    },

    /* ═════════════ 3. rules-vs-learning ═════════════ */
    {
      id: 'rules-vs-learning',
      title: '규칙을 짜느냐, 규칙을 배우느냐',
      minutes: 0.7,
      notes: '지금까지의 프로그래밍은 사람이 규칙을 짜서 데이터를 넣으면 답이 나왔습니다. 머신러닝은 거꾸로, 데이터와 정답을 잔뜩 넣으면 컴퓨터가 규칙을 찾아 줍니다. 입력과 출력의 자리가 바뀐 것, 이게 핵심입니다.\n' +
        '→ 키: ① 머신러닝 줄의 입력(데이터+답) ② 학습 → 규칙(형광펜) ③ 오른쪽 ‘손으로 짠 고양이 판별기’ 예시. 코드 아래 손글씨 질문을 하나씩 읽어 주며 “예외가 끝이 없다”로 마무리합니다.\n' +
        '질문: “고양이를 처음 본 다섯 살 아이는 규칙을 배웠을까요, 예시를 봤을까요?”\n' +
        '실제 차이는 다음 장 스팸 필터에서 직접 확인합니다.',
      html: `
        <style>
          #f-rules-vs-learning .rv-svg { position:absolute; left:92px; top:244px; width:1000px; height:600px; overflow:visible; }
          #f-rules-vs-learning .rv-ink { fill:none; stroke:var(--ink); stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
          #f-rules-vs-learning .rv-ink.thick { stroke-width:4.5; }
          #f-rules-vs-learning .rv-ink.pen { stroke:var(--pen); stroke-width:3.5; }
          #f-rules-vs-learning .rv-proc { fill:var(--paper-2); }
          #f-rules-vs-learning .rv-hl { fill:var(--hl-soft); }
          #f-rules-vs-learning .rv-sep { fill:none; stroke:var(--ink-3); stroke-width:2; stroke-dasharray:8 10; }
          #f-rules-vs-learning .rv-t { font-family:var(--font-display); font-weight:800; font-size:31px; fill:var(--ink); }
          #f-rules-vs-learning .rv-s { font-family:var(--font-body); font-size:21px; fill:var(--ink-2); }
          #f-rules-vs-learning .rv-row { font-family:var(--font-display); font-weight:600; font-size:34px; fill:var(--ink); }
          #f-rules-vs-learning .rv-rs { font-family:var(--font-mono); font-size:20px; fill:var(--ink-2); }
          #f-rules-vs-learning .rv-h { font-family:var(--font-hand); font-size:40px; fill:var(--pen); }
          #f-rules-vs-learning .rv-cat { position:absolute; left:1132px; top:244px; width:378px; display:flex; flex-direction:column; gap:16px; }
          #f-rules-vs-learning .rv-code { position:relative; font-size:23px; line-height:1.5; padding:24px 24px 20px; transform:rotate(1.2deg); overflow:visible; }
          #f-rules-vs-learning .rv-code::before { content:""; position:absolute; top:-14px; left:50%; width:40%; height:30px; transform:translateX(-50%) rotate(-3deg); background:var(--tape); }
          #f-rules-vs-learning .rv-q { font-size:38px; line-height:1.18; }
        </style>
        <div class="kicker">프로그래밍의 방향이 뒤집힌다</div>
        <h2 class="title">규칙을 짜느냐, <span class="mark">규칙을 배우느냐</span></h2>
        ${RV_SVG}
        <div class="rv-cat" data-step="3">
          <div class="mono small muted">손으로 짠 고양이 판별기</div>
          <div class="term rv-code"><span class="dim"># 고양이 규칙 v1</span><br>if 귀 == "뾰족" and<br>&nbsp;&nbsp; 수염 and 눈 == 2:<br>&nbsp;&nbsp;&nbsp;&nbsp;답 = <span class="hi">"고양이"</span></div>
          <div class="hand rv-q">귀 접힌 고양이는?<br>뒤돌아 앉아 있으면?<br>어두운 사진은? 그림은?</div>
          <div style="font-size:30px;font-weight:600">→ 예외가 <span class="mark">끝이 없다</span></div>
        </div>
        <div class="src">도식: F. Chollet, 『Deep Learning with Python』(2017) 1장 “새로운 프로그래밍 패러다임”을 바탕으로 다시 그림</div>`,
    },

    /* ═════════════ 4. spam-lab ═════════════ */
    {
      id: 'spam-lab',
      title: '실습: 스팸 문자 필터 — 규칙 vs 학습',
      minutes: 3,
      notes: '왼쪽은 사람이 규칙을 짜는 방식입니다. 단어 칩을 켜고 끄면서 16개 문자 중 몇 개를 맞히는지 보세요. 아무리 바꿔도 14/16이 최고입니다. 정상 문자에도 “무료”, “당첨”이 들어가니까요. 그렇게 맞춘 규칙도 처음 보는 문자 4개 중 “고객님 한도 승인…”처럼 금지어를 피한 문자는 놓칩니다.\n' +
        '클릭: 학생에게 칩을 몇 개 켜고 끄게 한 뒤(“ㅋㅋ”를 켜면 친구 문자가 막힙니다), 오른쪽 [학습 시작]을 누릅니다. 왼쪽 문자에 파란 테두리가 하나씩 지나가며 같은 16개를 읽고, 글자 조각마다 점수(막대)를 스스로 계산합니다. 처음 보는 문자 4개에서 규칙과 학습의 성적을 비교하고, 입력칸에 학생이 부르는 문장을 직접 넣어 봅니다.\n' +
        '질문: “컴퓨터는 ‘고객님’, ‘승인’이 스팸 쪽이라고 스스로 찾아냈어요. 여러분이 규칙을 짤 때 이 단어들을 넣을 생각을 했을까요?”',
      html: `
        <style>
          #f-spam-lab .sl-cols { position:absolute; left:92px; right:92px; top:196px; bottom:58px; display:grid; grid-template-columns:820px 1fr; }
          #f-spam-lab .sl-left { padding-right:34px; display:flex; flex-direction:column; gap:12px; }
          #f-spam-lab .sl-right { padding-left:34px; border-left:3px dashed var(--ink-3); display:flex; flex-direction:column; gap:10px; min-width:0; }
          #f-spam-lab .sl-head { display:flex; align-items:baseline; justify-content:space-between; gap:16px; }
          #f-spam-lab .sl-h { font-family:var(--font-display); font-weight:800; font-size:34px; white-space:nowrap; }
          #f-spam-lab .sl-acc { font-family:var(--font-mono); font-size:22px; color:var(--ink-2); white-space:nowrap; }
          #f-spam-lab .sl-acc b { font-size:40px; color:var(--ink); }
          #f-spam-lab .sl-sub { font-size:22px; color:var(--ink-2); margin-top:-6px; }
          #f-spam-lab .sl-chips { display:flex; gap:10px; flex-wrap:wrap; }
          #f-spam-lab .sl-chips .chip { font-size:22px; padding:6px 16px; }
          #f-spam-lab .sl-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 14px; grid-auto-flow:column; grid-template-rows:repeat(9, auto); }
          #f-spam-lab .sl-colh { font-family:var(--font-mono); font-size:20px; color:var(--ink-2); display:flex; justify-content:space-between; padding:0 4px; }
          #f-spam-lab .sl-colh b { color:var(--ink); }
          #f-spam-lab .sl-msg { display:flex; align-items:center; gap:8px; height:40px; padding:0 10px 0 12px; border:2px solid var(--ink-3); border-radius:9px 3px 9px 3px / 3px 9px 3px 9px; font-size:20px; background:var(--paper); transition:background .25s; }
          #f-spam-lab .sl-msg .t { flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          #f-spam-lab .sl-msg .p { font-family:var(--font-mono); font-size:20px; font-weight:600; color:var(--ink-3); }
          #f-spam-lab .sl-msg.flag .p { color:var(--bad); }
          #f-spam-lab .sl-msg.wrong { background:var(--hl-soft); border-color:var(--ink); border-style:dashed; }
          #f-spam-lab .sl-msg.wrong:not(.flag) .p { color:var(--ink-2); }
          #f-spam-lab .sl-msg.reading { outline:4px solid var(--pen); outline-offset:2px; }
          #f-spam-lab .sl-bars { display:flex; flex-direction:column; gap:6px; }
          #f-spam-lab .sl-barh { display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:20px; color:var(--ink-2); }
          #f-spam-lab .sl-row { display:grid; grid-template-columns:1fr 84px 3px 84px 1fr; align-items:center; gap:8px; height:30px; }
          #f-spam-lab .sl-row .ax { height:34px; background:var(--ink); }
          #f-spam-lab .sl-row .w { font-family:var(--font-mono); font-size:22px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          #f-spam-lab .sl-row .hw { text-align:right; color:var(--good); }
          #f-spam-lab .sl-row .sw { color:var(--bad); }
          #f-spam-lab .sl-row .bar { display:flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:20px; color:var(--ink-2); }
          #f-spam-lab .sl-row .hb { justify-content:flex-end; }
          #f-spam-lab .sl-row .bar i { display:block; height:18px; transition:width .25s; }
          #f-spam-lab .sl-row .hb i { background:var(--good); }
          #f-spam-lab .sl-row .sb i { background:var(--bad); }
          #f-spam-lab .sl-tests { display:flex; flex-direction:column; gap:4px; }
          #f-spam-lab .sl-trow { display:grid; grid-template-columns:1fr 92px 150px; gap:10px; align-items:center; height:34px; font-size:20px; border-bottom:1.5px dashed var(--ink-3); }
          #f-spam-lab .sl-trow.h { font-family:var(--font-mono); color:var(--ink-2); height:30px; border:0; }
          #f-spam-lab .sl-trow .t { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          #f-spam-lab .sl-trow .v { font-family:var(--font-mono); font-weight:600; white-space:nowrap; }
          #f-spam-lab .ok { color:var(--good); } #f-spam-lab .no { color:var(--bad); }
          #f-spam-lab .ox { font-family:var(--font-body); font-weight:700; font-size:24px; } #f-spam-lab .no.ox { font-size:32px; line-height:0; }
          #f-spam-lab .sl-cols { word-break:keep-all; }
          #f-spam-lab .sl-in { width:100%; font-size:24px; padding:8px 14px; }
          #f-spam-lab .sl-out { font-size:22px; line-height:1.35; min-height:60px; }
          #f-spam-lab .sl-out .v { font-family:var(--font-mono); font-weight:600; }
        </style>
        <div class="kicker">실습 · 스팸 문자 필터 만들기</div>
        <h2 class="title md">규칙으로 막을까, <span class="mark">데이터로 배울까?</span></h2>
        <div class="sl-cols demo">
          <div class="sl-left">
            <div class="sl-head"><span class="sl-h">① 규칙 모드</span><span class="sl-acc">정확도 <b class="sl-acc-n">11/16</b> <span class="sl-acc-p"></span></span></div>
            <div class="sl-sub">켜진 단어가 하나라도 들어 있으면 <b class="bad">차단</b> · <span class="mark">노란 칸</span> = 틀림</div>
            <div class="sl-chips"></div>
            <div class="sl-grid"></div>
          </div>
          <div class="sl-right">
            <div class="sl-head"><span class="sl-h">② 학습 모드</span><button class="btn sl-train">학습 시작</button></div>
            <div class="sl-sub sl-status">같은 16개 문자에서 글자 조각마다 점수를 계산</div>
            <div class="sl-bars"></div>
            <div class="sl-tests"></div>
            <input class="sl-in" type="text" value="내일 학원 끝나고 무료 떡볶이 ㅋㅋ" aria-label="직접 문자 써 보기" placeholder="직접 문자를 써 보세요">
            <div class="sl-out"></div>
          </div>
        </div>
        <div class="src">문자 16+4개는 수업용으로 지어낸 예시 · 학습 방법: 나이브 베이즈(두 글자 조각, 라플라스 보정) — 이 화면 안에서 직접 계산</div>`,
      init(el, K) {
        const chipsEl = el.querySelector('.sl-chips');
        const grid = el.querySelector('.sl-grid');
        const on = new Set(['무료', '당첨', '클릭']);
        chipsEl.innerHTML = KEYWORDS.map((k) => `<button class="chip" data-k="${k}" aria-pressed="false">${k}</button>`).join('');
        // spam in the left column, normal messages in the right column
        const order = SMS.map((m, i) => i).sort((a, b) => SMS[b][1] - SMS[a][1] || a - b);
        grid.innerHTML = `<div class="sl-colh"><span>진짜 스팸 8개</span><span>차단 <b class="sl-c1">0</b></span></div>` +
          order.filter((i) => SMS[i][1]).map((i) => `<div class="sl-msg" data-i="${i}"><span class="t">${K.escape(SMS[i][0])}</span><span class="p"></span></div>`).join('') +
          `<div class="sl-colh"><span>진짜 정상 8개</span><span>통과 <b class="sl-c0">0</b></span></div>` +
          order.filter((i) => !SMS[i][1]).map((i) => `<div class="sl-msg" data-i="${i}"><span class="t">${K.escape(SMS[i][0])}</span><span class="p"></span></div>`).join('');
        const tiles = {};
        grid.querySelectorAll('.sl-msg').forEach((t) => (tiles[t.dataset.i] = t));
        const ruleSays = (s) => { for (const k of on) if (s.toLowerCase().includes(k)) return 1; return 0; };

        const renderRules = () => {
          let ok = 0, c1 = 0, c0 = 0;
          chipsEl.querySelectorAll('.chip').forEach((c) => { const v = on.has(c.dataset.k); c.classList.toggle('on', v); c.setAttribute('aria-pressed', v); });
          SMS.forEach(([s, y], i) => {
            const p = ruleSays(s), t = tiles[i];
            t.classList.toggle('flag', !!p);
            t.classList.toggle('wrong', p !== y);
            t.querySelector('.p').textContent = p ? '차단' : '통과';
            if (p === y) ok++;
            if (y && p) c1++;
            if (!y && !p) c0++;
          });
          el.querySelector('.sl-acc-n').textContent = `${ok}/16`;
          el.querySelector('.sl-acc-p').textContent = `(${Math.round((ok / 16) * 100)}%)`;
          el.querySelector('.sl-c1').textContent = c1;
          el.querySelector('.sl-c0').textContent = c0;
          renderTests();
          renderInput();
        };
        chipsEl.addEventListener('click', (e) => {
          const c = e.target.closest('.chip'); if (!c) return;
          const k = c.dataset.k;
          if (on.has(k)) on.delete(k); else on.add(k);
          renderRules();
        });

        /* ── naive Bayes over two-letter pieces ── */
        let df = [{}, {}], docs = [0, 0], mask = {}, seen = [];
        const resetModel = () => { df = [{}, {}]; docs = [0, 0]; mask = {}; seen = []; };
        const learn = (i) => {
          const [s, y] = SMS[i];
          docs[y]++;
          seen.push(i);
          for (const g of grams(s)) { df[y][g] = (df[y][g] || 0) + 1; mask[g] = (mask[g] || 0) | (1 << i); }
        };
        const weight = (g) => Math.log(((df[1][g] || 0) + 1) / (docs[1] + 2)) - Math.log(((df[0][g] || 0) + 1) / (docs[0] + 2));
        const score = (s) => {
          let z = Math.log((docs[1] + 1) / (docs[0] + 1));
          const why = [];
          for (const g of grams(s)) if (mask[g]) { const w = weight(g); z += w; why.push([g, w]); }
          return { p: K.sigmoid(z), why };
        };
        // join neighbouring pieces that always appear together, e.g. 고객 + 객님 → 고객님
        const labelOf = (g) => {
          const sig = mask[g];
          for (const i of seen) {
            if (!(sig & (1 << i))) continue;
            for (const r of runsOf(SMS[i][0])) {
              const p = r.indexOf(g); if (p < 0) continue;
              let a = p, b = p + 2;
              while (b < r.length && mask[r.slice(b - 1, b + 1)] === sig) b++;
              while (a > 0 && mask[r.slice(a - 1, a + 1)] === sig) a--;
              return r.slice(a, b);
            }
          }
          return g;
        };
        const firstSeen = (g) => { const m = mask[g] || 0; for (let k = 0; k < seen.length; k++) if (m & (1 << seen[k])) return k; return 99; };
        const topWords = (sign) => {
          const cand = Object.keys(mask).filter((g) => g.length > 1).map((g) => [g, weight(g)]).filter(([, w]) => w * sign > 0.05);
          cand.sort((a, b) => (b[1] - a[1]) * sign || firstSeen(a[0]) - firstSeen(b[0]));
          const out = [], used = new Set();
          for (const [g, w] of cand) {
            const lab = labelOf(g);
            if (used.has(lab)) continue;
            used.add(lab); out.push([lab, w]);
            if (out.length === 5) break;
          }
          return out;
        };
        const barsEl = el.querySelector('.sl-bars');
        const renderBars = () => {
          const S = topWords(1), H = topWords(-1), px = (w) => Math.round(Math.min(1.6, Math.abs(w)) * 78);
          let h = `<div class="sl-barh"><span>← 정상 쪽 조각</span><span>스팸 쪽 조각 →</span></div>`;
          for (let r = 0; r < 5; r++) {
            const hw = H[r], sw = S[r];
            h += `<div class="sl-row">
              <span class="bar hb">${hw ? `${hw[1].toFixed(1)}<i style="width:${px(hw[1])}px"></i>` : ''}</span>
              <span class="w hw">${hw ? K.escape(hw[0]) : ''}</span><span class="ax"></span>
              <span class="w sw">${sw ? K.escape(sw[0]) : ''}</span>
              <span class="bar sb">${sw ? `<i style="width:${px(sw[1])}px"></i>+${sw[1].toFixed(1)}` : ''}</span></div>`;
          }
          barsEl.innerHTML = h;
        };
        const testsEl = el.querySelector('.sl-tests');
        const verdict = (p) => (p >= 0.5 ? `<span class="bad">스팸</span>` : `<span class="good">정상</span>`);
        const pct = (p) => Kit.clamp(Math.round(p * 100), 1, 99);
        const ox = (good) => (good ? '<span class="ok ox">○</span>' : '<span class="no ox">×</span>');
        const renderTests = () => {
          let rOk = 0, lOk = 0;
          const rows = SMS_TEST.map(([s, y]) => {
            const r = ruleSays(s), { p } = score(s), l = p >= 0.5 ? 1 : 0;
            if (r === y) rOk++;
            if (l === y) lOk++;
            return `<div class="sl-trow"><span class="t">${K.escape(s)}</span><span class="v">${verdict(r)} ${ox(r === y)}</span><span class="v">${verdict(p)} ${pct(p)}% ${ox(l === y)}</span></div>`;
          }).join('');
          testsEl.innerHTML = `<div class="sl-trow h"><span>처음 보는 문자 4개</span><span>규칙 ${rOk}/4</span><span>학습 ${lOk}/4</span></div>` + rows;
        };
        const input = el.querySelector('.sl-in');
        const outEl = el.querySelector('.sl-out');
        const renderInput = () => {
          const s = input.value.trim();
          if (!s) { outEl.innerHTML = '<span class="muted">문장을 입력하면 바로 판정합니다</span>'; return; }
          const r = ruleSays(s), { p, why } = score(s);
          why.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
          const seenLab = new Set();
          const reasons = why.filter(([g, w]) => g.length > 1 && Math.abs(w) > 0.2)
            .map(([g, w]) => [labelOf(g), w]).filter(([l]) => !seenLab.has(l) && seenLab.add(l)).slice(0, 3)
            .map(([g, w]) => `<span class="${w > 0 ? 'bad' : 'good'}">${K.escape(g)} ${w > 0 ? '+' : ''}${w.toFixed(1)}</span>`).join(' · ');
          const lv = why.length ? `${verdict(p)} (스팸 확률 ${pct(p)}%)` : '<span class="muted">판단 보류</span>';
          outEl.innerHTML = `규칙: <span class="v">${r ? '<span class="bad">차단</span>' : '<span class="good">통과</span>'}</span> &nbsp;·&nbsp; 학습: <span class="v">${lv}</span><br>` +
            `<span class="muted small">${reasons ? '근거: ' + reasons : why.length ? '뚜렷한 근거 조각이 없음' : '배운 적 있는 글자 조각이 하나도 없음'}</span>`;
        };
        input.addEventListener('input', renderInput);

        /* training animation: read the 16 messages one by one */
        const btn = el.querySelector('.sl-train');
        const status = el.querySelector('.sl-status');
        let next = -1, acc = 0;
        const finish = () => {
          next = -1;
          Object.values(tiles).forEach((t) => t.classList.remove('reading'));
          btn.disabled = false; btn.textContent = '다시 학습';
          status.textContent = `학습 끝 · 글자 조각 ${Object.keys(mask).length}개에 점수를 매김`;
        };
        const stepTrain = () => {
          Object.values(tiles).forEach((t) => t.classList.remove('reading'));
          learn(next);
          tiles[next].classList.add('reading');
          status.textContent = `읽는 중… ${next + 1}/16`;
          renderBars(); renderTests(); renderInput();
          next++;
        };
        btn.addEventListener('click', () => {
          resetModel(); next = 0; acc = 0.3;
          btn.disabled = true; btn.textContent = '학습 중…';
          renderBars(); renderTests(); renderInput();
        });
        K.loop(el, (t, dt) => {
          if (next < 0) return;
          acc += dt;
          if (next >= SMS.length) { if (acc >= 0.5) finish(); }   // brief pause on the last message, then done
          else if (acc >= 0.3) { acc = 0; stepTrain(); }
        });
        this._finishNow = () => {
          if (next >= 0) { while (next >= 0 && next < SMS.length) { learn(next); next++; } finish(); renderBars(); renderTests(); renderInput(); }
        };

        // complete first state: model already trained on all 16
        resetModel();
        SMS.forEach((m, i) => learn(i));
        finish();
        btn.textContent = '학습 시작';
        renderBars();
        renderRules();
      },
      leave() { if (this._finishNow) this._finishNow(); },
    },

    /* ═════════════ 5. three-ways ═════════════ */
    {
      id: 'three-ways',
      title: '기계가 배우는 세 가지 방법',
      minutes: 1,
      notes: '머신러닝은 배우는 방식에 따라 크게 셋으로 나눕니다. 정답이 붙은 예시로 배우는 지도학습, 정답 없이 비슷한 것끼리 묶는 비지도학습, 해 보고 받은 점수(보상)로 배우는 강화학습입니다.\n' +
        '보여 주기: 세 그림은 지금 실제로 계산하며 움직입니다. ① 틀린 점(빨간 동그라미)이 줄어들도록 경계선이 조금씩 움직이고, ② 회색 점들이 스스로 세 묶음으로 나뉘고, ③ 파란 점(에이전트)이 처음엔 헤매다 함정(−1)에 빠지기도 하면서 점점 지름길(+1)을 찾습니다. 파란 칸은 “여기로 가면 좋다”를 배운 흔적입니다.\n' +
        '질문: “스팸 필터는 셋 중 어디일까요? 그럼 유튜브가 비슷한 시청자를 묶는 건?”',
      html: `
        <style>
          #f-three-ways .tw-cols { position:absolute; left:92px; top:244px; width:1416px; display:grid; grid-template-columns:repeat(3, 1fr); gap:40px; word-break:keep-all; }
          #f-three-ways .tw-col { display:flex; flex-direction:column; gap:10px; }
          #f-three-ways .tw-name { display:flex; align-items:baseline; gap:12px; }
          #f-three-ways .tw-name b { font-family:var(--font-display); font-weight:800; font-size:44px; }
          #f-three-ways .tw-name span { font-family:var(--font-mono); font-size:20px; color:var(--ink-2); }
          #f-three-ways .tw-name i { font-style:normal; font-family:var(--font-mono); font-size:24px; color:var(--pen); font-weight:600; }
          #f-three-ways .tw-def { font-size:28px; line-height:1.3; }
          #f-three-ways .tw-ex { font-family:var(--font-hand); font-size:36px; color:var(--pen); line-height:1; }
        </style>
        <div class="kicker">머신러닝의 세 갈래</div>
        <h2 class="title">기계가 배우는 <span class="mark">세 가지 방법</span></h2>
        <div class="abs" style="left:1300px;top:30px">${Kit.photo('alphago-match', '알파고 대국 <small>2016</small>', 'sm tilt-r', '--ratio:4/3;--pos:50% 45%')}</div>
        <div class="tw-cols">
          <div class="tw-col"><div class="tw-name"><i>①</i><b>지도학습</b><span>supervised</span></div>
            <div class="tw-cv" data-k="sup"></div>
            <p class="tw-def"><span class="mark">정답(라벨)</span>이 붙은 예시를 보고 배운다</p>
            <p class="tw-ex">예) 사진 분류 — 고양이야, 개야?</p></div>
          <div class="tw-col"><div class="tw-name"><i>②</i><b>비지도학습</b><span>unsupervised</span></div>
            <div class="tw-cv" data-k="uns"></div>
            <p class="tw-def">정답 없이 <span class="mark">비슷한 것끼리</span> 스스로 묶는다</p>
            <p class="tw-ex">예) 비슷한 손님끼리 묶기</p></div>
          <div class="tw-col"><div class="tw-name"><i>③</i><b>강화학습</b><span>reinforcement</span></div>
            <div class="tw-cv" data-k="rl"></div>
            <p class="tw-def">해 보고 받은 <span class="mark">점수(보상)</span>로 배운다</p>
            <p class="tw-ex">예) 게임 AI · 알파고의 자기 대국</p></div>
        </div>
        <div class="src">알파고: Silver 외, “Mastering the game of Go with deep neural networks and tree search”, Nature 529 (2016) — 사람 기보로 지도학습 후 자기 대국 강화학습</div>`,
      init(el, K) {
        const W = 445, H = 360;
        const self = this;
        // theme colours for the three draws: read once and refreshed on theme change, not three getComputedStyle calls a frame
        let pal = K.colors();
        // photo caption: keep '알파고 대국 2016' whole (no ellipsis) even in a wider fallback font
        const cap = el.querySelector('.photo figcaption');
        if (cap) { const fitCap = () => shrinkToFit([cap, ...cap.querySelectorAll('small')], () => cap.scrollWidth > cap.clientWidth + 1, 0.6); fitCap(); K.onTheme(fitCap); }

        /* ── (a) supervised: perceptron finds a boundary ── */
        const A = K.canvas(el.querySelector('[data-k="sup"]'), W, H);
        const supPts = (() => {
          const rnd = K.rand(17), pts = [];
          const cA = [135, 255], cB = [315, 140];
          const ux = (cA[0] - cB[0]), uy = (cA[1] - cB[1]), ul = Math.hypot(ux, uy), u = [ux / ul, uy / ul];
          const mid = [(cA[0] + cB[0]) / 2, (cA[1] + cB[1]) / 2];
          [[cA, 1], [cB, -1]].forEach(([c, y]) => {
            for (let i = 0; i < 13; i++) {
              let x = c[0] + K.gauss(rnd) * 42, yy = c[1] + K.gauss(rnd) * 36;
              const d = (x - mid[0]) * u[0] + (yy - mid[1]) * u[1];
              const need = 16 * y;
              if (d * y < 16) { x += (need - d) * u[0]; yy += (need - d) * u[1]; }
              pts.push({ x: K.clamp(x, 22, W - 22), y: K.clamp(yy, 56, H - 18), lab: y });
            }
          });
          return pts;
        })();
        const nx = (p) => [1, (p.x - W / 2) / 100, (p.y - H / 2) / 100];
        const f = (w, p) => { const v = nx(p); return w[0] * v[0] + w[1] * v[1] + w[2] * v[2]; };
        const sup = { w: [0, 0, 0], t: 0, hold: 0, seed: 3 };
        const supReset = () => {
          // start from a line that is clearly wrong, so there is always something to learn
          for (let k = 0; k < 30; k++) {
            const r = K.rand(sup.seed++ * 97 + 5);
            const a = r() * Math.PI * 2;
            sup.w = [(r() - 0.5) * 1.5, Math.cos(a) * 1.4, Math.sin(a) * 1.4];
            if (wrongOf(sup.w).length >= 6) break;
          }
          sup.t = 0; sup.hold = 0;
        };
        const wrongOf = (w) => supPts.filter((p) => f(w, p) * p.lab <= 0);
        /** one batch gradient-descent step of logistic regression (with a little L2) */
        const supGD = (lr) => {
          const g = [0, 0, 0];
          for (const p of supPts) { const v = nx(p), e = K.sigmoid(f(sup.w, p)) - (p.lab > 0 ? 1 : 0); for (let i = 0; i < 3; i++) g[i] += e * v[i]; }
          for (let i = 0; i < 3; i++) sup.w[i] -= lr * (g[i] / supPts.length + (i ? 0.01 * sup.w[i] : 0));
        };
        const clip = (poly, g) => {
          const out = [];
          for (let i = 0; i < poly.length; i++) {
            const a = poly[i], b = poly[(i + 1) % poly.length], fa = g(a), fb = g(b);
            if (fa >= 0) out.push(a);
            if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
          }
          return out;
        };
        const drawSup = () => {
          const C = pal, ctx = A.ctx;
          ctx.clearRect(0, 0, W, H);
          const rect = [[6, 6], [W - 6, 6], [W - 6, H - 6], [6, H - 6]];
          const g = (q) => f(sup.w, { x: q[0], y: q[1] });
          [[1, C.pen], [-1, C.c[3]]].forEach(([s, col]) => {
            const poly = clip(rect, (q) => s * g(q));
            if (poly.length < 3) return;
            ctx.save(); ctx.globalAlpha = 0.13; ctx.fillStyle = col;
            ctx.beginPath(); poly.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fill(); ctx.restore();
          });
          // boundary line: crossings of g = 0 on the rectangle edges
          const xs = [];
          for (let i = 0; i < 4; i++) {
            const a = rect[i], b = rect[(i + 1) % 4], fa = g(a), fb = g(b);
            if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); xs.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
          }
          if (xs.length >= 2) {
            ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
            K.sketchLine(ctx, xs[0][0], xs[0][1], xs[1][0], xs[1][1], { seed: 4, wobble: 1.2, passes: 2 }); ctx.restore();
          }
          sketchFrame(ctx, W, H, C, 21);
          const wrong = wrongOf(sup.w);
          for (const p of supPts) {
            ctx.fillStyle = p.lab > 0 ? C.pen : C.c[3]; ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5;
            mark(ctx, p.lab > 0 ? 0 : 1, p.x, p.y, 8); ctx.fill(); ctx.stroke();
            if (wrong.includes(p)) { ctx.strokeStyle = C.bad; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.stroke(); }
          }
          if (wrong.length) tag(ctx, C, `틀린 점 ${wrong.length}개 → 선을 옮기는 중`, 18, 34);
          else tag(ctx, C, '경계선 완성! 다 맞힘', 18, 38, true);
        };

        /* ── (b) unsupervised: grey points fall into groups ── */
        const B = K.canvas(el.querySelector('[data-k="uns"]'), W, H);
        const unsPts = blobs(29, [[110, 262], [330, 272], [225, 140]], 13, 34, W, H, 22);
        unsPts.forEach((p) => { p.y = Math.max(p.y, 58); });
        const uns = { cents: [], from: [], phase: 'grey', t: 0, it: 0, seed: 5, anim: 1 };
        const unsReset = () => {
          const r = K.rand(uns.seed++ * 131);
          let cs;
          for (let tries = 0; tries < 40; tries++) {
            cs = [0, 1, 2].map(() => { const p = unsPts[Math.floor(r() * unsPts.length)]; return { x: p.x, y: p.y }; });
            const ok = cs.every((a, i) => cs.every((b, j) => i === j || Math.hypot(a.x - b.x, a.y - b.y) > 80));
            if (ok) break;
          }
          uns.cents = cs; uns.from = cs.map((c) => ({ ...c }));
          unsPts.forEach((p) => (p.c = -1));
          uns.phase = 'grey'; uns.t = 0; uns.it = 0; uns.anim = 1;
        };
        const unsIter = () => {
          if (uns.it === 0) { kmAssign(unsPts, uns.cents); uns.it = 1; return 99; }
          uns.from = uns.cents.map((c) => ({ ...c }));
          const moved = kmUpdate(unsPts, uns.cents);
          kmAssign(unsPts, uns.cents);
          uns.it++; uns.anim = 0;
          return moved;
        };
        const drawUns = () => {
          const C = pal, ctx = B.ctx, CL = clusterColors(C);
          ctx.clearRect(0, 0, W, H);
          sketchFrame(ctx, W, H, C, 33);
          for (const p of unsPts) {
            const col = p.c < 0 ? C.ink3 : CL[p.c];
            ctx.fillStyle = col; ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5;
            mark(ctx, p.c < 0 ? 0 : p.c, p.x, p.y, 8); ctx.fill(); ctx.stroke();
          }
          if (uns.phase !== 'grey') {
            const e = K.easeOut(Math.min(1, uns.anim));
            uns.cents.forEach((c, i) => {
              const x = K.lerp(uns.from[i].x, c.x, e), y = K.lerp(uns.from[i].y, c.y, e);
              ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(x - 11, y - 11); ctx.lineTo(x + 11, y + 11); ctx.moveTo(x + 11, y - 11); ctx.lineTo(x - 11, y + 11); ctx.stroke();
              ctx.strokeStyle = CL[i]; ctx.lineWidth = 3.5;
              ctx.beginPath(); ctx.moveTo(x - 11, y - 11); ctx.lineTo(x + 11, y + 11); ctx.moveTo(x + 11, y - 11); ctx.lineTo(x - 11, y + 11); ctx.stroke();
            });
          }
          if (uns.phase === 'done') tag(ctx, C, '묶음 3개를 스스로 찾음!', 18, 38, true);
          else tag(ctx, C, uns.phase === 'grey' ? '정답 없이 점만 있음' : uns.it === 0 ? '중심 3개를 아무 데나 찍음' : `비슷한 것끼리 묶는 중… ${uns.it}단계`, 18, 34);
        };

        /* ── (c) reinforcement: Q-learning (+ a little replay of remembered moves, Dyna-Q) in a small maze ── */
        const Cn = K.canvas(el.querySelector('[data-k="rl"]'), W, H);
        const CS = 52, OX = (W - GW * CS) / 2, OY = (H - GH * CS) / 2 + 6;   // room for the tag above and the ‘출발’ label below
        const isEnd = (x, y) => (x === GOAL[0] && y === GOAL[1]) || (x === TRAP[0] && y === TRAP[1]);
        const key = (x, y) => x + ',' + y;
        const rl = { Q: null, M: null, mem: null, s: START.slice(), ep: 1, len: 0, trail: [], acc: 0, pause: 0, streak: 0, hold: 0, last: '', lastLen: 0 };
        const rlReset = () => {
          rl.Q = {}; rl.M = new Map(); rl.mem = []; rl.s = START.slice(); rl.ep = 1; rl.len = 0; rl.trail = [START.slice()]; rl.pause = 0; rl.streak = 0; rl.hold = 0; rl.last = '';
        };
        const q = (s) => rl.Q[key(s[0], s[1])] || (rl.Q[key(s[0], s[1])] = [0, 0, 0, 0]);
        const vOf = (x, y) => { const v = rl.Q[key(x, y)]; return v ? Math.max(...v) : 0; };
        const blocked = (x, y) => x < 0 || y < 0 || x >= GW || y >= GH || WALLS.has(key(x, y));
        const greedy = (s, rnd) => { const v = q(s), m = Math.max(...v); const b = [0, 1, 2, 3].filter((a) => v[a] >= m - 1e-9); return b[Math.floor(rnd() * b.length)]; };
        /** one step of Q-learning; returns 'goal' | 'trap' | 'timeout' | '' */
        const rlStep = (rnd, eps) => {
          const s = rl.s, a = rnd() < eps ? Math.floor(rnd() * 4) : greedy(s, rnd);
          let nx2 = s[0] + MOVES[a][0], ny2 = s[1] + MOVES[a][1];
          if (blocked(nx2, ny2)) { nx2 = s[0]; ny2 = s[1]; }
          let r = -0.04, end = '';
          if (nx2 === GOAL[0] && ny2 === GOAL[1]) { r = 1; end = 'goal'; }
          else if (nx2 === TRAP[0] && ny2 === TRAP[1]) { r = -1; end = 'trap'; }
          const learn1 = (ps, pa, pn, pr, pe) => { const tg = pe ? pr : pr + 0.95 * Math.max(...q(pn)); const pv = q(ps); pv[pa] += 0.5 * (tg - pv[pa]); };
          learn1(s, a, [nx2, ny2], r, end);
          // replay 20 remembered moves (Dyna-Q) so the lesson spreads faster
          // rl.mem holds the remembered moves in first-seen order, latest outcome kept (what Array.from(map.values())
          // gave), without copying the whole memory on every step; rl.M maps a move to its slot
          const mk = key(s[0], s[1]) + '|' + a, mv = [s.slice(), a, [nx2, ny2], r, end], slot = rl.M.get(mk);
          if (slot == null) { rl.M.set(mk, rl.mem.length); rl.mem.push(mv); } else rl.mem[slot] = mv;
          const mem = rl.mem;
          for (let k = 0; k < 20; k++) learn1(...mem[Math.floor(rnd() * mem.length)]);
          rl.s = [nx2, ny2]; rl.len++;
          if (!end && rl.len >= 150) end = 'timeout';
          return end;
        };
        const epsOf = (ep) => Math.max(0.02, 0.15 * Math.pow(0.85, ep - 1));
        const greedyPath = () => {
          const path = [START.slice()]; let s = START.slice();
          const r = K.rand(5);
          for (let i = 0; i < 30; i++) {
            const a = greedy(s, r); let x = s[0] + MOVES[a][0], y = s[1] + MOVES[a][1];
            if (blocked(x, y)) break;
            s = [x, y]; path.push(s);
            if ((x === GOAL[0] && y === GOAL[1]) || (x === TRAP[0] && y === TRAP[1])) break;
          }
          return path;
        };
        const cellC = (x, y) => [OX + x * CS + CS / 2, OY + y * CS + CS / 2];
        const drawRL = (final) => {
          const C = pal, ctx = Cn.ctx;
          ctx.clearRect(0, 0, W, H);
          sketchFrame(ctx, W, H, C, 45);
          for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
            const px = OX + x * CS, py = OY + y * CS;
            if (WALLS.has(key(x, y))) {
              ctx.fillStyle = C.ink2; ctx.globalAlpha = 0.85; ctx.fillRect(px + 1, py + 1, CS - 2, CS - 2); ctx.globalAlpha = 1;
              continue;
            }
            const v = vOf(x, y);
            if (v > 0.02) { ctx.globalAlpha = Math.min(0.5, v * 0.55); ctx.fillStyle = C.pen; ctx.fillRect(px, py, CS, CS); ctx.globalAlpha = 1; }
            else if (v < -0.25) { ctx.globalAlpha = Math.min(0.35, -v * 0.4); ctx.fillStyle = C.bad; ctx.fillRect(px, py, CS, CS); ctx.globalAlpha = 1; }
          }
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
          for (let x = 0; x <= GW; x++) { ctx.beginPath(); ctx.moveTo(OX + x * CS, OY); ctx.lineTo(OX + x * CS, OY + GH * CS); ctx.stroke(); }
          for (let y = 0; y <= GH; y++) { ctx.beginPath(); ctx.moveTo(OX, OY + y * CS); ctx.lineTo(OX + GW * CS, OY + y * CS); ctx.stroke(); }
          // goal and trap cells (their +1 / −1 labels are drawn last, so the agent never covers them)
          const [gx, gy] = [OX + GOAL[0] * CS, OY + GOAL[1] * CS], [tx, ty] = [OX + TRAP[0] * CS, OY + TRAP[1] * CS];
          ctx.fillStyle = C.hl; ctx.fillRect(gx + 4, gy + 4, CS - 8, CS - 8);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(gx + 4, gy + 4, CS - 8, CS - 8);
          ctx.strokeStyle = C.bad; ctx.lineWidth = 3; ctx.strokeRect(tx + 5, ty + 5, CS - 10, CS - 10);
          // start: labelled just below its cell, outside the maze, so the agent and its path never sit on the word
          ctx.fillStyle = C.ink2; ctx.font = `600 20px ${C.fontBody}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('↑ 출발', OX + START[0] * CS + CS / 2, OY + GH * CS + 17);
          // trail or learned path
          const RING = 18;
          const path = final ? greedyPath() : rl.trail;
          if (final) {
            const pts = path.map((s) => cellC(s[0], s[1]));
            const n = pts.length, last = path[n - 1];
            if (n > 1 && isEnd(last[0], last[1])) {   // stop at the ring, not on top of the +1
              const [px, py] = pts[n - 2], [qx, qy] = pts[n - 1], d = Math.hypot(qx - px, qy - py) || 1;
              pts[n - 1] = [qx - ((qx - px) / d) * (RING + 5), qy - ((qy - py) / d) * (RING + 5)];
            }
            ctx.strokeStyle = C.pen; ctx.lineWidth = 4; ctx.setLineDash([2, 9]); ctx.lineCap = 'round';
            ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
          } else {
            ctx.fillStyle = C.pen; ctx.globalAlpha = 0.45;
            for (const s of path) {
              if ((s[0] === START[0] && s[1] === START[1]) || isEnd(s[0], s[1])) continue;
              const [x, y] = cellC(s[0], s[1]); ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
          // agent: a dot while walking; a ring around the +1 / −1 once it lands there, so the number stays readable
          const [ax, ay] = final ? cellC(GOAL[0], GOAL[1]) : cellC(rl.s[0], rl.s[1]);
          if (final || isEnd(rl.s[0], rl.s[1])) {
            ctx.strokeStyle = C.pen; ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.arc(ax, ay, RING, 0, Math.PI * 2); ctx.stroke();
          } else {
            ctx.fillStyle = C.pen; ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(ax, ay, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          }
          ctx.font = `600 21px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = C.termBg; ctx.fillText('+1', gx + CS / 2, gy + CS / 2 + 1);
          ctx.fillStyle = C.bad; ctx.fillText('−1', tx + CS / 2, ty + CS / 2 + 1);
          if (final || rl.hold > 0) tag(ctx, C, final ? `${rl.ep}번 해 보고 찾은 길` : `지름길 발견! ${rl.lastLen}걸음`, 18, 38, true);
          else tag(ctx, C, rl.pause > 0 ? `시도 ${rl.ep}번째: ${rl.last} · ${rl.lastLen}걸음` : `시도 ${rl.ep}번째 · ${rl.len}걸음`, 18, 34);
        };
        const rlTrainOffline = (maxEp) => {
          rlReset();
          const rnd = K.rand(11);
          let streak = 0;
          for (let ep = 1; ep <= maxEp && streak < 3; ep++) {
            rl.s = START.slice(); rl.len = 0;
            let end = '';
            while (!end) end = rlStep(rnd, epsOf(ep));
            rl.ep = ep;
            streak = end === 'goal' && rl.len <= 12 ? streak + 1 : 0;
          }
        };

        /* static first state: every panel finished */
        const finalStates = () => {
          supReset(); for (let n = 0; n < 900; n++) supGD(0.25);
          unsReset(); let m = 99, k = 0; while (m > 0.3 && k++ < 30) m = unsIter(); uns.anim = 1; uns.phase = 'done';
          rlTrainOffline(40);
        };
        const drawAll = (finalRL) => { drawSup(); drawUns(); drawRL(finalRL); };
        finalStates();
        drawAll(true);
        K.onTheme(() => { pal = K.colors(); drawAll(self._live ? false : true); });

        self._start = () => {
          self._live = true;
          pal = K.colors();
          supReset();
          unsReset();
          rlReset();
          drawAll(false);
        };
        self._stop = () => { self._live = false; finalStates(); drawAll(true); };

        /* Each panel is redrawn only on frames where something it shows changed (holds, pauses and the grey /
           done phases are still images); an untouched canvas also costs nothing to hand to the compositor. */
        const rndRL = K.rand(99);
        K.loop(el, (t, dt) => {
          if (!self._live) return;
          /* (a) drawSup shows sup.w only */
          let dSup = false;
          if (sup.hold > 0) { sup.hold -= dt; if (sup.hold <= 0) { supReset(); dSup = true; } }
          else {
            sup.t += dt;
            if (sup.t > 0.6) { supGD(Math.min(0.12, 2.4 * dt)); dSup = true; }
            if ((sup.t > 3.5 && !wrongOf(sup.w).length) || sup.t > 8) sup.hold = 2.6;
          }
          if (dSup) drawSup();
          /* (b) drawUns shows the points' groups, phase, step and the centroids, which glide while uns.anim < 1 */
          let dUns = uns.anim < 1;
          uns.t += dt; uns.anim += dt / 0.45;
          if (uns.phase === 'grey' && uns.t > 1.3) { uns.phase = 'run'; uns.t = 0; dUns = true; }
          else if (uns.phase === 'run' && uns.t > 0.75) { uns.t = 0; const m = unsIter(); if (m < 0.3) uns.phase = 'done'; dUns = true; }
          else if (uns.phase === 'done' && uns.t > 2.8) { unsReset(); dUns = true; }
          if (dUns) drawUns();
          /* (c) drawRL shows the agent, trail, values and tag: they change only on a step, a pause's end or a reset */
          let dRL = false;
          if (rl.hold > 0) { rl.hold -= dt; if (rl.hold <= 0) { rlReset(); dRL = true; } }
          else if (rl.pause > 0) { rl.pause -= dt; if (rl.pause <= 0) { rl.s = START.slice(); rl.len = 0; rl.trail = [START.slice()]; rl.ep++; dRL = true; } }
          else {
            rl.acc += dt;
            const sps = rl.len > 22 ? 40 : 11; // fast-forward while wandering, slow down once it walks with purpose
            while (rl.acc > 1 / sps && rl.pause <= 0) {
              rl.acc -= 1 / sps;
              const end = rlStep(rndRL, epsOf(rl.ep));
              rl.trail.push(rl.s.slice());
              dRL = true;
              if (end) {
                rl.last = end === 'goal' ? '+1 도착' : end === 'trap' ? '함정! −1' : '시간 초과';
                rl.lastLen = rl.len;
                rl.pause = 0.45;
                rl.streak = end === 'goal' && rl.len <= 12 ? rl.streak + 1 : 0;
                if (rl.streak >= 3) { rl.hold = 3; rl.pause = 0; }
              }
            }
          }
          if (dRL) drawRL(false);
        });
      },
      enter() { if (this._start) this._start(); },
      leave() { if (this._stop) this._stop(); },
    },

    /* ═════════════ 6. kmeans (optional) ═════════════ */
    {
      id: 'kmeans',
      title: '실습: k-평균으로 저절로 묶기',
      minutes: 1,
      optional: true,
      notes: 'k-평균은 비지도학습의 대표 선수입니다. 할 일은 딱 두 가지를 반복하는 것: ① 점마다 가장 가까운 중심의 색을 칠하고 ② 중심을 자기 점들의 한가운데로 옮긴다. 더 이상 안 움직이면 끝.\n' +
        '클릭: [한 단계]를 몇 번 눌러 중심(×)이 움직인 궤적을 보여 주고, [자동]으로 끝까지 돌립니다. [다시 섞기]로 출발점을 바꾸면 결과가 달라질 수도 있다는 것, k 슬라이더로 묶음 수를 사람이 정해야 한다는 것을 보여 줍니다. 빈 곳을 클릭해 점을 추가할 수 있습니다.\n' +
        '질문: “k를 몇으로 할지는 누가 정할까요? 컴퓨터가 정하게 하려면 어떻게 해야 할까요?”',
      html: `
        <style>
          #f-kmeans .km-box { position:absolute; left:92px; top:200px; width:1000px; height:640px; cursor:crosshair; }
          #f-kmeans .km-side { position:absolute; left:1136px; top:200px; width:372px; display:flex; flex-direction:column; gap:22px; }
          #f-kmeans .km-side .btns .btn { flex:1 1 auto; }
          #f-kmeans .field label { font-size:22px; }
          #f-kmeans .field output { font-size:30px; }
          #f-kmeans .km-stat { font-size:24px; line-height:1.5; }
          #f-kmeans .km-stat b { font-family:var(--font-mono); font-size:34px; }
          #f-kmeans .km-state { font-family:var(--font-hand); font-size:38px; color:var(--pen); line-height:1.05; min-height:40px; }
          #f-kmeans ol.dash { font-size:25px; gap:10px; line-height:1.35; word-break:keep-all; }
        </style>
        <div class="kicker">실습 · 비지도학습</div>
        <h2 class="title md">k-평균: 비슷한 점끼리 <span class="mark">저절로 묶기</span></h2>
        <div class="km-box demo" aria-label="k-평균 캔버스. 클릭하면 점 추가"></div>
        <div class="km-side demo">
          <div class="field"><label>k = 묶음 개수 <output class="km-k">3</output></label><input class="km-range" type="range" min="2" max="5" step="1" value="3" aria-label="묶음 개수 k"></div>
          <div class="btns"><button class="btn km-step">한 단계</button><button class="btn km-auto">자동</button><button class="btn km-shuffle">다시 섞기</button></div>
          <div class="km-stat">단계 <b class="km-n">0</b> &nbsp;·&nbsp; 평균 거리 <b class="km-d">0</b><span class="mono small muted">px</span></div>
          <div class="km-state"></div>
          <ol class="dash">
            <li>가장 가까운 중심(×) 색 칠하기</li>
            <li>중심을 자기 점들의 <span class="mark">한가운데</span>로</li>
            <li>안 움직일 때까지 반복</li>
          </ol>
          <button class="btn sm ghost km-new" style="align-self:flex-start">점 새로 뿌리기</button>
        </div>
        <div class="src">k-means: Lloyd(1957 고안, 1982 발표) · ‘k-means’라는 이름은 MacQueen(1967)</div>`,
      init(el, K) {
        const W = 1000, H = 640;
        const host = el.querySelector('.km-box');
        const { cv, ctx } = K.canvas(host, W, H);
        const self = this;
        let pseed = 4, cseed = 2, k = 3, pts = [], cents = [], trails = [], steps = 0, done = false, auto = false, acc = 0;
        /** keep points out of the bottom-right corner where the point count is written */
        const clearLabel = (p) => { if (p.x > W - 150 && p.y > H - 52) p.y = H - 52; return p; };
        const genPts = () => {
          const r = K.rand(pseed * 31 + 1);
          const cs = [[0, 0], [0, 0], [0, 0]].map((_, i) => [230 + i * 270 + (r() - 0.5) * 120, i === 1 ? 170 + r() * 80 : 400 + r() * 110]);
          pts = blobs(pseed * 7 + 3, cs, 26, 64, W, H, 26).map(clearLabel);
        };
        const initCents = () => {
          const r = K.rand(cseed * 7919 + k * 13);
          cents = (cseed === 2 && k === 3)
            ? [{ x: 410, y: 300 }, { x: 500, y: 372 }, { x: 560, y: 286 }] // first look: all three bunched in the middle
            : Array.from({ length: k }, () => ({ x: W * (0.18 + r() * 0.64), y: H * (0.18 + r() * 0.64) }));
          trails = cents.map((c) => [{ x: c.x, y: c.y }]);
          steps = 0; done = false;
          kmAssign(pts, cents);
        };
        const meanDist = () => pts.reduce((s, p) => s + Math.hypot(p.x - cents[p.c].x, p.y - cents[p.c].y), 0) / Math.max(1, pts.length);
        const ui = () => {
          el.querySelector('.km-n').textContent = steps;
          el.querySelector('.km-d').textContent = Math.round(meanDist());
          el.querySelector('.km-state').textContent = done ? '수렴! 더 이상 안 움직여요' : steps === 0 ? '출발: 중심을 아무 데나 찍음' : '아직 움직이는 중…';
          el.querySelector('.km-auto').classList.toggle('on', auto);
          el.querySelector('.km-step').disabled = done;
        };
        const draw = () => {
          const C = K.colors(), CL = clusterColors(C);
          ctx.clearRect(0, 0, W, H);
          sketchFrame(ctx, W, H, C, 61);
          // assignment threads
          ctx.lineWidth = 1.2;
          for (const p of pts) { const c = cents[p.c]; ctx.strokeStyle = CL[p.c]; ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(c.x, c.y); ctx.stroke(); }
          ctx.globalAlpha = 1;
          for (const p of pts) { ctx.fillStyle = CL[p.c]; ctx.strokeStyle = C.paper; ctx.lineWidth = 1.6; mark(ctx, p.c, p.x, p.y, 8); ctx.fill(); ctx.stroke(); }
          // trails
          trails.forEach((tr, i) => {
            ctx.strokeStyle = CL[i]; ctx.lineWidth = 3; ctx.setLineDash([3, 7]); ctx.lineCap = 'round';
            ctx.beginPath(); tr.forEach((q, j) => (j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke(); ctx.setLineDash([]);
            tr.slice(0, -1).forEach((q) => { ctx.fillStyle = C.paper; ctx.strokeStyle = CL[i]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
          });
          // centroids
          cents.forEach((c, i) => {
            ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(c.x, c.y, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = CL[i]; ctx.lineWidth = 5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(c.x - 9, c.y - 9); ctx.lineTo(c.x + 9, c.y + 9); ctx.moveTo(c.x + 9, c.y - 9); ctx.lineTo(c.x - 9, c.y + 9); ctx.stroke();
          });
          // point count, on a paper patch so points, threads and trails never run through it
          const lab = `점 ${pts.length}개`;
          ctx.font = `600 20px ${C.fontMono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
          const lw = ctx.measureText(lab).width;
          ctx.save(); ctx.globalAlpha = 0.88; ctx.fillStyle = C.paper; ctx.fillRect(W - 24 - lw, H - 38, lw + 12, 28); ctx.restore();
          ctx.fillStyle = C.ink3; ctx.fillText(lab, W - 18, H - 18); ctx.textAlign = 'left';
          ui();
        };
        const step = () => {
          if (done) return;
          const moved = kmUpdate(pts, cents);
          cents.forEach((c, i) => trails[i].push({ x: c.x, y: c.y }));
          kmAssign(pts, cents);
          steps++;
          if (moved < 0.5) { done = true; auto = false; }
          draw();
        };
        el.querySelector('.km-step').addEventListener('click', step);
        el.querySelector('.km-auto').addEventListener('click', () => { if (done) { initCents(); } auto = !auto; acc = 0.6; draw(); });
        el.querySelector('.km-shuffle').addEventListener('click', () => { cseed++; auto = false; initCents(); draw(); });
        el.querySelector('.km-new').addEventListener('click', () => { pseed++; auto = false; genPts(); initCents(); draw(); });
        const range = el.querySelector('.km-range');
        range.addEventListener('input', () => { k = +range.value; el.querySelector('.km-k').textContent = k; auto = false; initCents(); draw(); });
        cv.addEventListener('click', (e) => {
          const p = K.pt(e, cv);
          if (p.x < 6 || p.y < 6 || p.x > W - 6 || p.y > H - 6) return;
          pts.push(clearLabel({ x: p.x, y: p.y, c: 0 }));
          kmAssign(pts, cents);
          done = false;
          draw();
        });
        K.loop(el, (t, dt) => {
          if (!auto) return;
          acc += dt;
          if (acc > 0.7) { acc = 0; step(); }
        });
        K.onTheme(draw);
        self._stopAuto = () => { auto = false; ui(); };
        genPts(); initCents(); draw();
      },
      leave() { if (this._stopAuto) this._stopAuto(); },
    },
  ]);
})();
