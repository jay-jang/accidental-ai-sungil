/* Closing: back to the three questions, the path that turns toward the students,
   the zoom-out to the map, Q&A, the goodbye on the title, and (optional) credits.
   The non-virtual frames live in the small slots at the bottom of the title frame;
   their slot order (answers, accidental-you, qna, credits) is unchanged. */
(function () {
  'use strict';

  /* ── accidental path: instructor's stops (1600×900 stage coordinates) ── */
  // winding route, left → right; every stop sits on a waypoint
  const PATH = [
    [130, 372], [176, 486], [262, 604], [340, 532], [312, 432], [356, 346],
    [424, 312], [474, 412], [535, 476], [515, 545], [455, 525], [460, 465], [530, 470], [572, 560],
    [604, 628], [664, 520], [706, 384], [770, 450], [836, 470], [852, 560], [890, 600], [946, 540],
    [960, 466], [918, 448], [904, 500], [962, 512], [1012, 420], [1028, 326],
    [1076, 430], [1130, 594], [1212, 548], [1270, 440],
  ];
  // [waypoint index, year, label, 'up' | 'down']
  const STOPS = [
    [0, '', '보안 SW', 'up'],
    [2, '2003', '넥슨 · 게임', 'down'],
    [6, '2007', '구글 · 검색', 'up'],
    [14, '2014', 'Android TV', 'down'],
    [16, '2021', 'TensorFlow', 'up'],
    [20, '', '광고 AI', 'down'],
    [27, '2022', '여행 AI', 'up'],
    [29, '2026', '다시 코딩', 'down'],
  ];
  const HANDOFF = PATH[PATH.length - 1];
  // the students' side: dashed pen branches fanning out from today
  const BRANCHES = [
    [HANDOFF, [1330, 372], [1410, 330], [1478, 318]],
    [HANDOFF, [1350, 470], [1420, 492], [1486, 476]],
    [HANDOFF, [1318, 548], [1390, 604], [1462, 616]],
  ];

  /* ── helpers ── */
  const fam = (lic) => {
    const s = String(lic || '');
    if (/BY-SA/i.test(s)) return 'bysa';
    if (/CC BY/i.test(s)) return 'by';
    if (/public domain|CC0|PD/i.test(s)) return 'pd';
    return 'other';
  };
  const FAM = {
    bysa: { name: 'CC BY-SA', short: 'BY-SA', tip: '출처 + 같은 조건 공유' },
    by: { name: 'CC BY', short: 'BY', tip: '출처만 밝히면 OK' },
    pd: { name: '퍼블릭 도메인·CC0', short: 'PD·CC0', tip: '자유' },
    other: { name: '기타', short: '기타', tip: '' },
  };
  // shrink an SVG <text> (never below 20px) so it fits maxW — keeps hand labels inside the clip/off the path
  // when the hand font is missing and a wider fallback font is used
  const fitSvgText = (t, maxW) => {
    t.style.fontSize = '';
    let w = 0;
    try { w = t.getComputedTextLength(); } catch (e) { w = 0; }
    if (w > maxW) t.style.fontSize = Math.max(20, Math.floor((parseFloat(getComputedStyle(t).fontSize) * maxW) / w)) + 'px';
  };
  // n+1 points spaced evenly by arc length along an "M x,y C … C …" path (the form sketchPath writes), read off a
  // fine polyline of its cubics. They sit within ~0.01px of what getPointAtLength returns, but cost ~1ms instead of
  // the ~100ms that n+1 getPointAtLength calls take (each call walks the whole path again).
  const arcSamples = (d, n) => {
    const v = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number), SUB = 128;
    const xs = [v[0]], ys = [v[1]], cum = [0];
    for (let i = 2; i + 5 < v.length; i += 6) {
      const x0 = xs[xs.length - 1], y0 = ys[ys.length - 1];
      for (let k = 1; k <= SUB; k++) {
        const t = k / SUB, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
        const x = a * x0 + b * v[i] + c * v[i + 2] + e * v[i + 4], y = a * y0 + b * v[i + 1] + c * v[i + 3] + e * v[i + 5];
        cum.push(cum[cum.length - 1] + Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1])); xs.push(x); ys.push(y);
      }
    }
    const L = cum[cum.length - 1], out = [];
    for (let s = 0, j = 1; s <= n; s++) {
      const at = (L * s) / n;
      while (j < cum.length - 1 && cum[j] < at) j++;
      const f = (at - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
      out.push([xs[j - 1] + (xs[j] - xs[j - 1]) * f, ys[j - 1] + (ys[j] - ys[j - 1]) * f, s / n]);
    }
    out.len = L;
    return out;
  };
  const shortSubject = (s) => {
    s = String(s || '').trim();
    // drop parentheticals first, so "first working (point-contact) transistor" keeps its noun
    const cut = s.replace(/\s*\([^()]*\)/g, '').split(/\s[-–—]\s|\s\(|,\s|;\s/)[0].trim();
    return cut.length > 4 ? cut : s;
  };

  const REFS = [
    ['추세', 'Stanford HAI', 'AI Index 2024', 'https://hai.stanford.edu/ai-index/2024-ai-index-report'],
    ['', 'Stanford HAI', 'AI Index 2026', 'https://hai.stanford.edu/ai-index/2026-ai-index-report'],
    ['', 'Epoch AI', '주요 AI 모델 데이터베이스', 'https://epoch.ai/data/notable-ai-models'],
    ['', 'Epoch AI', '학습 연산, 해마다 4–5배', 'https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year'],
    ['', 'IEA', 'Energy and AI (2025)', 'https://www.iea.org/reports/energy-and-ai/executive-summary'],
    ['', 'NVIDIA', '2027 회계연도 2분기 실적 발표', 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027'],
    ['기술', 'Vaswani 외', 'Attention Is All You Need (2017)', 'https://arxiv.org/abs/1706.03762'],
    ['', 'OpenAI', 'GPT-4 Technical Report (2023)', 'https://arxiv.org/abs/2303.08774'],
    ['', 'Google DeepMind', 'AlphaGo', 'https://deepmind.google/research/breakthroughs/alphago/'],
    ['', 'NobelPrize.org', '2024 물리학상 발표', 'https://www.nobelprize.org/prizes/physics/2024/press-release/'],
    ['일', 'WEF', 'Future of Jobs Report 2025', 'https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf'],
    ['', 'Stanford 디지털경제랩', '탄광 속 카나리아 (2025)', 'https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf'],
    ['', 'METR', 'AI가 해내는 과제의 길이 (2025)', 'https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/'],
    ['', 'Stack Overflow', '개발자 설문 2025 · AI', 'https://survey.stackoverflow.co/2025/ai'],
    ['', 'Anthropic', 'Economic Index (2026.6)', 'https://www.anthropic.com/research/economic-index-june-2026-report'],
  ];
  const REFS_ME = [
    ['AmCham 약력', 'https://amchamkorea.org/data/speaker_bio/C92D9A76E50843DEADB0D061E8207996.pdf'],
    ['구글코리아 블로그', 'https://korea.googleblog.com/2018/12/googlementoring.html'],
    ['AOSP 커밋', 'https://android.googlesource.com/platform/frameworks/base/+/0792d37385e60aa8d73f8df174d0a32f4f618bc4'],
  ];

  Deck.part('closing', 1, [
    /* ───────────── 1. answers ───────────── */
    {
      id: 'answers',
      title: '처음의 질문 3개, 짧은 답',
      minutes: 1,
      notes: '1교시 처음에 붙여 둔 메모 3장으로 돌아왔습니다. → 키를 누를 때마다 답이 하나씩 나옵니다.\nQ1: ‘생각’을 뭐라고 정의하느냐에 따라 답이 달라요. 튜링의 기준(흉내 게임)이라면 2025년에 이미 통과했습니다(GPT-4.5, 73%). 하지만 ELIZA 효과를 기억하세요. 사람 같다고 느끼는 것과 생각하는 것은 다릅니다. 지금 AI는 다음 토큰을 아주 잘 맞히는 거대한 함수이고(첫 화면의 “어쩌다 ___” 다음 단어 맞히기가 바로 그것), o1 같은 ‘생각하는 AI’도 답하기 전에 풀이 토큰을 길게 먼저 써 보는 것입니다. 그런데 그 단순한 일로 코드도 짜고 수학 올림피아드 금메달 수준까지 갑니다.\nQ2: 데이터, GPU, 트랜스포머, 돈. 네 가지가 한꺼번에 맞물려서 2022년 11월 ChatGPT로 터졌습니다.\nQ3: 쓰는 사람에서 만드는 사람으로. 빙산의 깊은 층(문제 정의·책임)으로 내려가고, 로드맵에서 이번 주에 할 것 하나를 고르고, 동의·출처·책임의 선을 지키는 사람. 화면의 기초·검증·질문하는 힘이 그 바탕입니다. (덧붙이면: AI 답을 ‘매우 신뢰’하는 개발자는 3.1%뿐, Stack Overflow 2025. 그래서 검증이 기초 바로 위에 있어요.)\n질문: “세 가지 중에서 지금 내가 가장 약한 건 뭘까요?”',
      html: `
        <style>
          #f-answers .a-rows { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; gap: 14px; margin-top: -6px; }
          #f-answers .a-row { display: grid; grid-template-columns: 360px 92px 1fr; align-items: center; }
          #f-answers .sticky { width: 360px; font-size: 44px; line-height: 1.08; padding: 16px 24px 20px; word-break: keep-all; overflow-wrap: break-word; }
          #f-answers .sticky .q { font-family: var(--font-mono); font-size: 22px; display: block; margin-bottom: 4px; }
          #f-answers .arr { width: 92px; height: 60px; overflow: visible; }
          #f-answers .arr path { fill: none; stroke: var(--pen); stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
          #f-answers .ans { display: grid; grid-template-columns: 1fr 450px; gap: 26px; align-items: center; }
          #f-answers .ans .hand { font-size: 50px; line-height: 1.05; word-break: keep-all; overflow-wrap: break-word; }
          #f-answers .ans .sub { font-size: 25px; line-height: 1.38; color: var(--ink-2); margin-top: 8px; }
          #f-answers .ans .sub b { color: var(--ink); font-weight: 600; }
          #f-answers svg.ink { width: 450px; height: 170px; overflow: visible; font-family: var(--font-body); }
          #f-answers svg.ink text { fill: var(--ink); font-size: 23px; }
          #f-answers svg.ink .m { font-family: var(--font-mono); }
          #f-answers svg.ink .dim { fill: var(--ink-2); font-size: 20px; }
          #f-answers svg.ink .hd { font-family: var(--font-hand); fill: var(--pen); font-size: 30px; }
          #f-answers svg.ink .stroke { fill: none; stroke: var(--ink); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
          #f-answers svg.ink .thin { fill: none; stroke: var(--ink-2); stroke-width: 2.4; stroke-linecap: round; }
          #f-answers svg.ink .penl { fill: none; stroke: var(--pen); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
          #f-answers svg.ink .hlbar { fill: var(--hl); stroke: var(--ink); stroke-width: 2; }
          #f-answers svg.ink .gbar { fill: var(--ink-3); }
          #f-answers svg.ink .knot { fill: var(--hl); stroke: var(--ink); stroke-width: 3; }
          #f-answers svg.ink .blk { fill: var(--paper); stroke: var(--ink); stroke-width: 3; stroke-linejoin: round; }
          #f-answers svg.ink .blk.top { fill: var(--hl-soft); }
          #f-answers svg.ink .big { font-family: var(--font-display); font-weight: 800; font-size: 54px; font-style: italic; }
        </style>
        <div class="kicker">마무리 · 처음의 질문으로</div>
        <h2 class="title md">질문 3개, 이제 짧게 답해 보면</h2>
        <div class="a-rows">
          <div class="a-row">
            <div class="sticky" style="--tilt:-2.5deg"><span class="q">Q1</span>AI는 정말<br>‘생각’을 할까?</div>
            <svg class="arr" data-step="1" viewBox="0 0 92 60"><path d="M10,34 C30,22 52,40 78,28"/><path d="M64,18 L80,28 L66,40"/></svg>
            <div class="ans" data-step="1">
              <div>
                <div class="hand">‘생각’의 뜻에 따라 달라요</div>
                <div class="sub">지금 AI는 <b>다음 토큰</b>을 아주 잘 맞히는<br><b>거대한 함수</b>. ‘생각하는 AI’도<br>풀이 토큰을 먼저 길게 쓰는 것.</div>
              </div>
              <svg class="ink" viewBox="0 0 450 170" aria-label="어쩌다 → f → 다음 단어 확률">
                <text class="m" x="0" y="94">어쩌다</text>
                <path class="thin" d="M84,86 C98,82 110,88 124,84 M116,77 L126,84 L116,92"/>
                <path class="stroke" d="M134,40 C164,37 196,41 222,38 C225,72 222,104 224,132 C194,135 162,131 134,134 C131,102 135,70 134,40 Z"/>
                <text class="big" x="179" y="104" text-anchor="middle">f</text>
                <text class="dim" x="179" y="164" text-anchor="middle">거대한 함수</text>
                <path class="thin" d="M232,86 C246,82 258,88 270,84 M262,77 L272,84 L262,92"/>
                <text class="dim m" x="284" y="22">다음 단어?</text>
                <rect class="hlbar" x="284" y="44" width="110" height="24"/><text class="m" x="402" y="64">AI</text>
                <rect class="gbar" x="284" y="84" width="40" height="24"/><text x="332" y="104">개발자</text>
                <rect class="gbar" x="284" y="124" width="16" height="24"/><text x="308" y="144">여기까지</text>
              </svg>
            </div>
          </div>
          <div class="a-row">
            <div class="sticky" style="--tilt:1.8deg"><span class="q">Q2</span>왜 하필 <span style="text-decoration:underline">지금</span><br>폭발했을까?</div>
            <svg class="arr" data-step="2" viewBox="0 0 92 60"><path d="M10,30 C30,40 52,22 78,32"/><path d="M64,20 L80,32 L65,42"/></svg>
            <div class="ans" data-step="2">
              <div>
                <div class="hand">네 가지가 한꺼번에 맞물렸어요</div>
                <div class="sub"><b>데이터</b> + <b>GPU</b> + <b>트랜스포머</b> + <b>돈</b>.<br>하나만으로는 이런 폭발이 안 나요.</div>
              </div>
              <svg class="ink" viewBox="0 0 450 170" aria-label="데이터, GPU, 트랜스포머, 돈이 2022년 ChatGPT로 모임">
                <text x="0" y="26">데이터</text>
                <text x="0" y="70">GPU <tspan class="dim m">2012</tspan></text>
                <text x="0" y="114">트랜스포머 <tspan class="dim m">2017</tspan></text>
                <text x="0" y="158">돈</text>
                <path class="stroke" d="M84,18 C170,16 220,70 300,86"/>
                <path class="stroke" d="M120,62 C190,60 230,80 300,86"/>
                <path class="stroke" d="M190,106 C240,104 262,92 300,86"/>
                <path class="stroke" d="M36,150 C150,152 228,108 300,86"/>
                <circle class="knot" cx="302" cy="86" r="13"/>
                <text class="m dim" x="326" y="72">2022.11</text>
                <text x="326" y="104" style="font-family:var(--font-display);font-weight:800;font-size:28px">ChatGPT</text>
              </svg>
            </div>
          </div>
          <div class="a-row">
            <div class="sticky" style="--tilt:-1deg"><span class="q">Q3</span>그럼 나는<br>뭘 준비해야 하지?</div>
            <svg class="arr" data-step="3" viewBox="0 0 92 60"><path d="M10,34 C30,24 52,38 78,30"/><path d="M64,19 L80,30 L66,41"/></svg>
            <div class="ans" data-step="3">
              <div>
                <div class="hand"><span class="mark">만드는 사람</span>이 되기</div>
                <div class="sub">원리를 알고, AI의 답을 확인하고,<br>무엇을 만들지 스스로 묻는 사람.</div>
              </div>
              <svg class="ink" viewBox="0 0 450 170" aria-label="기초 위에 검증, 그 위에 질문하는 힘">
                <path class="blk" d="M2,118 L262,116 L264,166 L0,168 Z"/>
                <text x="132" y="151" text-anchor="middle">기초</text>
                <path class="blk" d="M24,64 L240,62 L242,112 L22,114 Z"/>
                <text x="132" y="97" text-anchor="middle">검증</text>
                <path class="blk top" d="M46,10 L218,8 L220,58 L44,60 Z"/>
                <text x="132" y="43" text-anchor="middle">질문하는 힘</text>
                <path class="penl" d="M310,90 C290,92 270,90 250,88 M260,80 L248,88 L260,96"/>
                <text class="hd" x="318" y="62">AI 답을</text>
                <text class="hd" x="318" y="92">‘매우 신뢰’하는</text>
                <text class="dim" x="318" y="132">개발자</text>
                <text class="m" x="382" y="133" style="font-size:26px;font-weight:600">3.1%</text>
              </svg>
            </div>
          </div>
        </div>
        <div class="src">출처: Vaswani 외, Attention Is All You Need (2017) · AlexNet (2012, 게임용 GPU 2장) · ChatGPT 공개 2022-11-30 · Stack Overflow 설문 2025 · Q1 막대: 첫 화면 예시</div>`,
    },

    /* ───────────── 2. accidental-you ───────────── */
    {
      id: 'accidental-you',
      title: '어쩌다 AI는 여러분의 이야기',
      minutes: 0.8,
      notes: '처음에 보여드린 제 경로를 한 줄로 다시 그립니다(들어오면 자동으로 그려짐). 보안 → 게임 → 검색 → TV → TensorFlow → 광고 AI → 여행 AI, 그리고 2026년에 다시 코딩. 한 번도 직선이 아니었어요.\n→ 키: 선이 오늘, 이 교실에서 여러분 쪽으로 갈라져 이어지고 문장이 완성됩니다. “‘어쩌다 AI’는 제 이야기이자, 여러분의 이야기입니다.” 오른쪽 아래 ‘다시 그리기’로 애니메이션을 다시 볼 수 있습니다.\n질문: “10년 뒤 여러분의 선에는 어떤 정류장이 찍혀 있을까요? 계획에 없던 정류장이라도 괜찮아요.”',
      html: `
        <style>
          #f-accidental-you .ay-svg { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
          #f-accidental-you .ay-road { fill: none; stroke: var(--hl-soft); stroke-width: 22; stroke-linecap: round; stroke-linejoin: round; }
          #f-accidental-you .ay-path { fill: none; stroke: var(--ink); stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; }
          #f-accidental-you .ay-br { fill: none; stroke: var(--pen); stroke-width: 4.5; stroke-linecap: round; stroke-dasharray: 2 14; }
          #f-accidental-you .ay-end { fill: var(--paper); stroke: var(--pen); stroke-width: 3; stroke-dasharray: 5 6; }
          #f-accidental-you .ay-q { font-family: var(--font-hand); font-size: 40px; fill: var(--pen); }
          #f-accidental-you .ay-stop circle { fill: var(--paper); stroke: var(--ink); stroke-width: 4; }
          #f-accidental-you .ay-stop text { fill: var(--ink); font-family: var(--font-body); font-size: 25px; font-weight: 500; }
          #f-accidental-you .ay-stop .yr { font-family: var(--font-mono); font-weight: 600; font-size: 22px; fill: var(--ink-2); }
          #f-accidental-you .ay-stop { transition: opacity 0.35s ease; }
          #f-accidental-you .ay-today circle { fill: var(--hl); stroke: var(--ink); stroke-width: 4; }
          #f-accidental-you .ay-today text { font-family: var(--font-hand); font-size: 36px; fill: var(--pen); }
          #f-accidental-you .ay-hand { font-family: var(--font-hand); font-size: 36px; fill: var(--pen); }
          #f-accidental-you .ay-msg { font-family: var(--font-display); font-weight: 800; line-height: 1.04; letter-spacing: -0.02em; }
          #f-accidental-you .ay-note { transition: opacity 0.5s ease; }
          #f-accidental-you.current.ay-pre :is(.ay-road, .ay-path, .ay-stops, .ay-note) { visibility: hidden; }
          #f-accidental-you.ay-pre :is(.ay-stop, .ay-note) { transition: none; }
        </style>
        <div class="kicker">마무리 · 어쩌다 AI</div>
        <h2 class="ay-msg" style="font-size:70px;max-width:1100px">‘어쩌다 AI’는 제 이야기이자,</h2>
        <svg class="ay-svg" viewBox="0 0 1600 900" aria-hidden="true">
          <defs><clipPath id="ay-clip"><rect class="ay-cliprect" x="1240" y="200" width="360" height="520"/></clipPath></defs>
          <path class="ay-road"/>
          <path class="ay-path"/>
          <g class="ay-branches" data-step="1" clip-path="url(#ay-clip)"></g>
          <g class="ay-stops"></g>
          <text class="ay-hand ay-note" x="96" y="752" transform="rotate(-3 96 752)">한 번도 직선이 아니었어요</text>
        </svg>
        <div class="abs ay-msg" data-step="1" style="right:92px;bottom:70px;font-size:104px;text-align:right"><span class="mark">여러분</span>의 이야기입니다.</div>
        <div class="demo" style="position:absolute;right:92px;top:60px"><button class="btn sm ghost ay-replay">다시 그리기</button></div>
        <div class="src">출처: AmCham Korea 연사 약력 · 비즈워치 2024-01-22 · AOSP 커밋 기록(2014) · GitHub tensorflow/serving 커밋(2021) · GitHub jay-jang(2026)</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.ay-svg');
        const path = svg.querySelector('.ay-path'), road = svg.querySelector('.ay-road');
        const d = K.sketchPath(PATH, { tension: 0.55 });
        path.setAttribute('d', d); road.setAttribute('d', d);
        let L = 0;
        try { L = path.getTotalLength(); } catch (e) { L = 0; }
        // where along the path each stop sits (nearest of 401 evenly spaced samples)
        let samples = L ? arcSamples(d, 400) : [];
        // not plain cubics after all (the lengths disagree): sample it the slow, exact way
        if (samples.length && Math.abs(samples.len - L) > 1) {
          samples = [];
          for (let s = 0; s <= 400; s++) { const p = path.getPointAtLength((L * s) / 400); samples.push([p.x, p.y, s / 400]); }
        }
        const tAt = (x, y) => {
          if (!samples.length) return 1;
          const dist = samples.map((p) => Math.hypot(p[0] - x, p[1] - y)), m = Math.min.apply(null, dist);
          const near = []; dist.forEach((v, s) => { if (v <= m + 0.5) near.push(s); });
          if (near.length === 1) return samples[near[0]][2];
          // a near-tie: settle it with the browser's own points, as a full getPointAtLength scan would
          let best = 1, bd = Infinity;
          near.forEach((s) => { const p = path.getPointAtLength((L * s) / 400); const dd = (p.x - x) ** 2 + (p.y - y) ** 2; if (dd < bd) { bd = dd; best = samples[s][2]; } });
          return best;
        };
        const gS = svg.querySelector('.ay-stops');
        const stops = STOPS.map(([i, yr, lab, side]) => {
          const [x, y] = PATH[i];
          const g = K.svg('g', { class: 'ay-stop' }, gS);
          K.svg('circle', { cx: x, cy: y, r: 9 }, g);
          const t = K.svg('text', { x, y: side === 'up' ? y - 26 : y + 46, 'text-anchor': 'middle' }, g);
          t.innerHTML = (yr ? `<tspan class="yr">${yr}</tspan> ` : '') + K.escape(lab);
          return { g, t: tAt(x, y) };
        });
        // today = handoff
        const [hx, hy] = HANDOFF;
        const today = K.svg('g', { class: 'ay-stop ay-today' }, gS);
        K.svg('circle', { cx: hx, cy: hy, r: 15 }, today);
        const tt = K.svg('text', { x: hx - 8, y: hy - 32, 'text-anchor': 'end' }, today);
        tt.textContent = '오늘, 성일정보고';
        stops.push({ g: today, t: 0.995 });
        stops.push({ g: svg.querySelector('.ay-note'), t: 0.5 });
        // students' branches
        const gB = svg.querySelector('.ay-branches');
        BRANCHES.forEach((pts, i) => {
          K.svg('path', { class: 'ay-br', d: K.sketchPath(pts, { tension: 0.6 }) }, gB);
          const e = pts[pts.length - 1];
          K.svg('circle', { class: 'ay-end', cx: e[0] + 26, cy: e[1], r: 24 }, gB);
          const q = K.svg('text', { class: 'ay-q', x: e[0] + 26, y: e[1] + 13, 'text-anchor': 'middle' }, gB);
          q.textContent = '?';
          void i;
        });
        const lab = K.svg('text', { class: 'ay-hand', x: 1290, y: 268 }, gB);
        lab.textContent = '여기부터는 여러분이 그려요';
        const note = svg.querySelector('.ay-note');
        const msg = el.querySelector('.abs.ay-msg');
        const fit = () => {
          fitSvgText(tt, 168);   // right edge fixed at the handoff; keep its left end off the 2022 descent (x≈1080)
          // stay clear of the big bottom line, whose left edge moves left with a wider fallback display font
          const msgL = msg && msg.offsetParent ? msg.offsetLeft : 0;
          fitSvgText(note, msgL > 200 ? Math.min(340, msgL - 124) : 340);
          fitSvgText(lab, 344);  // must stay inside the branch clip (x 1240–1600)
          let w = 0;
          try { w = lab.getComputedTextLength(); } catch (e) { w = 0; }
          if (w) lab.setAttribute('x', String(Math.round(Math.max(1244, Math.min(1290, 1588 - w)))));
        };
        fit();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
        f._ayFit = fit;
        const clip = svg.querySelector('.ay-cliprect');
        const clipX = 1240, clipW = 360;

        const st = (f._ay = { p: 1, pT: 1, b: 1, bT: 1 });
        const render = () => {
          const e = K.easeOut(st.p);
          if (L) {
            // fully drawn: drop the draw-in dash (same pixels, but a dashed stroke costs extra on every raster)
            if (e >= 1) [path, road].forEach((n) => { n.style.strokeDasharray = ''; n.style.strokeDashoffset = ''; });
            else [path, road].forEach((n) => { n.style.strokeDasharray = `${L} ${L}`; n.style.strokeDashoffset = String(L * (1 - e)); });
          }
          stops.forEach((s) => (s.g.style.opacity = e >= s.t - 0.004 ? 1 : 0));
          // only touch the clip when it moves: rewriting an unchanged value still repaints everything it clips
          const cw = String(Math.max(0.01, clipW * K.easeOut(st.b)));
          if (clip.getAttribute('width') !== cw) clip.setAttribute('width', cw);
          if (clip.getAttribute('x') !== String(clipX)) clip.setAttribute('x', String(clipX));
        };
        f._ayRender = render;
        render();
        K.loop(el, (t, dt) => {
          let changed = false;
          if (st.p < st.pT) { st.p = Math.min(st.pT, st.p + dt / 3.4); changed = true; }
          else if (st.p >= 1 && st.b < st.bT) { st.b = Math.min(st.bT, st.b + dt / 1.3); changed = true; }
          if (changed) render();
        });
        el.querySelector('.ay-replay').addEventListener('click', () => {
          st.p = 0; st.pT = 1; st.b = 0;
          render();
        });
      },
      enter(el, K, f) {
        const st = f._ay; if (!st) return;
        f._ayHere = true;
        if (f._ayFit) f._ayFit();
        if ((window.Deck.step || 0) >= 1) { st.p = st.pT = 1; st.b = st.bT = 1; }
        else { st.p = 0; st.pT = 1; st.b = 0; st.bT = 0; }
        f._ayRender();
        void el.offsetWidth; // commit the blank state before un-hiding, so nothing fades out
        el.classList.remove('ay-pre');
      },
      onStep(el, step, K, f) {
        const st = f._ay; if (!st) return;
        // Deck.go() calls onStep before the camera lands: hide the (fully drawn) path during the
        // flight so it does not flash and then vanish when enter() restarts the drawing.
        if (!f._ayHere) { el.classList.toggle('ay-pre', step === 0); return; }
        if (step >= 1) st.bT = 1; else { st.bT = 0; st.b = 0; }
        f._ayRender();
      },
      leave(el, K, f) {
        const st = f._ay; if (!st) return;
        f._ayHere = false;
        el.classList.remove('ay-pre');
        st.p = st.pT = 1; st.b = st.bT = 1;
        f._ayRender();
      },
    },

    /* ───────────── 3. finale-map (virtual frame) ───────────── */
    {
      id: 'finale-map',
      title: '오늘 걸어온 길',
      view: 'world',
      minutes: 0.3,
      caption: '오늘 걸어온 길<small>왼쪽 고리 1교시, 오른쪽 고리 2교시</small>',
      notes: '전체 지도로 빠져나와 오늘 걸어온 길을 한눈에 보여 줍니다. “왼쪽 고리에서 AI가 무엇이고 어디서 왔는지, 오른쪽 고리에서 지금 무슨 일이 벌어지고 있고 여러분은 어디에 서 있는지 봤습니다.”\n→ 키를 누르면 질문 시간(Q&A)으로 갑니다. 지도를 클릭하지 마세요(그 장으로 날아갑니다).\n질문: “오늘 지도에서 한 곳만 기억한다면 어디인가요?” (손으로 가리키기만)',
    },

    /* ───────────── 4. qna ───────────── */
    {
      id: 'qna',
      title: 'Q&A',
      minutes: 2.5,
      notes: '질문을 받습니다(약 2–3분). 시간이 모자라면 오른쪽 메모 하나만 골라 답하고, LinkedIn 주소를 가리키며 마칩니다.\n오른쪽 메모들은 구글 청소년 멘토링 때 다른 지역 고등학생들이 실제로 했던 질문입니다(2016 제주·울산, 2019 남원). 손이 안 올라오면 이 중 하나를 골라 먼저 답하면서 분위기를 풀어 주세요. “사내 연애”는 웃음용, “언제 행복하신가요?”는 진지한 마무리용.\n강의가 끝난 뒤에도 LinkedIn으로 질문할 수 있다고 알려 줍니다. 2016년 제주 멘토링 후기에 이메일 주소를 받은 학생들에게 남긴 말: “어렵게 생각말고. Just Do It.” (1교시 ‘17살의 나에게’에서 붙였던 그 포스트잇입니다.)\n질문: “여러분이라면 이 메모들 옆에 어떤 질문을 붙이겠어요?”',
      html: `
        <style>
          #f-qna .qa-big { left: 78px; top: 96px; font-family: var(--font-display); font-weight: 800; font-size: 236px; line-height: 1; letter-spacing: -0.03em; white-space: nowrap; }
          #f-qna .qa-hl { left: 96px; top: 252px; width: 640px; height: 70px; background: var(--hl-soft); transform: rotate(-1.6deg); border-radius: 3px 10px 4px 12px; }
          #f-qna .qa-note { width: 296px; min-height: 150px; font-size: 38px; line-height: 1.1; padding: 16px 22px 22px; word-break: keep-all; overflow-wrap: break-word; }
          #f-qna .qa-note .tag { display: block; font-family: var(--font-mono); font-size: 20px; opacity: 0.72; margin-bottom: 6px; }
          #f-qna .qa-blank { width: 296px; height: 168px; border: 3px dashed var(--pen); border-radius: 4px; padding: 18px 22px; font-family: var(--font-hand); font-size: 40px; line-height: 1.1; color: var(--pen); transform: rotate(1.2deg); }
          #f-qna .qa-link { font-family: var(--font-mono); font-size: 32px; font-weight: 600; color: var(--ink); text-decoration: none; border-bottom: 4px solid var(--pen); padding-bottom: 2px; }
          #f-qna .quote { font-size: 40px; }
          #f-qna .quote cite { font-size: 20px; }
          /* offline fallback serifs (Batang, AppleMyungjo) draw “ full-width, on top of the first letter */
          #f-qna .quote::before { font-family: "Hahmlet", Georgia, "Times New Roman", serif; }
        </style>
        <div class="kicker">마무리 · 질문 시간</div>
        <div class="abs qa-hl"></div>
        <div class="abs qa-big">Q&amp;A</div>
        <div class="abs hand xl" style="left:330px;top:350px;transform:rotate(-4deg)">어떤 질문이든</div>
        <div class="demo" style="position:absolute;left:92px;top:532px;display:flex;flex-direction:column;align-items:flex-start;gap:12px">
          <span class="mono tiny muted">강의가 끝나도 질문은 여기로 · LinkedIn</span>
          <a class="qa-link" href="https://www.linkedin.com/in/jungshik-jang-2878106" target="_blank" rel="noopener">linkedin.com/in/jungshik-jang-2878106</a>
        </div>
        <blockquote class="quote" style="position:absolute;left:124px;top:676px;width:690px">어렵게 생각말고. Just Do It.<cite>2016년 제주 멘토링 후기 · 이메일 주소를 받은 학생들에게</cite></blockquote>
        <div class="abs hand" style="left:886px;top:62px;font-size:44px">다른 학교 고등학생들이 먼저 한 질문</div>
        <div class="abs sticky qa-note" style="left:880px;top:136px;--tilt:-3deg"><span class="tag">2016 · 제주</span>구글 어떻게<br>들어가나요?</div>
        <div class="abs sticky qa-note" style="left:1212px;top:128px;--tilt:2.2deg"><span class="tag">2016 · 제주</span>전공은 뭐로<br>해야 하나요?</div>
        <div class="abs sticky qa-note" style="left:892px;top:350px;--tilt:1.6deg"><span class="tag">2016 · 제주</span>사내 연애<br>있나요?</div>
        <div class="abs sticky qa-note" style="left:1206px;top:338px;--tilt:-1.8deg"><span class="tag">2016 · 울산</span>엔지니어가 되려면 무슨 과목을 잘 해야 하는가?</div>
        <div class="abs sticky qa-note" style="left:878px;top:580px;--tilt:-1deg"><span class="tag">2019 · 남원</span>일을 하면서 <span style="text-decoration:underline;text-decoration-thickness:3px">언제 행복</span>하신가요?</div>
        <div class="abs qa-blank" style="left:1214px;top:592px">오늘, 여러분의<br>질문은?</div>
        <div class="src">출처: 구글코리아 블로그 — 구글 청소년 멘토링 후기 2016-06 제주 · 2016-10 울산 · 2019-04 남원</div>`,
    },

    /* ───────────── 5. finale (virtual frame) ───────────── */
    {
      id: 'finale',
      title: '어쩌다 AI — 끝',
      view: 'title',
      minutes: 0.2,
      caption: '',
      notes: '처음 제목으로 돌아와 끝냅니다. “어쩌다 시작해도 괜찮습니다. 계속 만들면 길이 됩니다. 감사합니다.”\n아래쪽 작은 칸들이 오늘 들렀던 마무리 장들입니다. 맨 오른쪽 칸은 출처 모음이라, 인사 뒤에 → 키로 띄워 둘 수 있습니다(압축 모드에서는 건너뜀).',
    },

    /* ───────────── 6. credits (after the goodbye, reference only) ───────────── */
    {
      id: 'credits',
      title: '출처와 사진 저작권',
      minutes: 0.2,
      optional: true,
      notes: '인사 뒤에 띄워 두는 참고 화면입니다(보충: 압축 모드에서는 건너뜀). 오늘 쓴 사진과 자료의 출처이고, 오래 머물 필요는 없습니다.\n위쪽 라이선스 칩(또는 막대)을 누르면 그 라이선스의 사진만 보입니다. 사진 목록은 마우스 휠로 스크롤됩니다. 오른쪽은 숫자와 주장의 대표 출처이고, 전체 조사 노트는 research 폴더에 있습니다.\nIT 동아리라면 알아 둘 것: CC BY는 “출처만 밝히면 써도 된다”, CC BY-SA는 “출처를 밝히고 같은 조건으로 공유하라”는 뜻입니다.\n질문: “여러분이 만든 코드나 그림에는 어떤 라이선스를 붙이고 싶나요?”',
      html: `
        <style>
          #f-credits .cr-grid { flex: 1; min-height: 0; display: grid; grid-template-columns: 760px 1fr; gap: 52px; margin-bottom: 26px; }
          #f-credits .cr-left { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
          #f-credits .cr-chips { display: flex; gap: 10px; flex-wrap: wrap; }
          #f-credits .cr-chips .chip { font-size: 20px; padding: 5px 14px; }
          #f-credits .cr-bar { width: 760px; height: 40px; overflow: visible; cursor: pointer; display: block; }
          #f-credits .cr-bar rect { stroke: var(--ink); stroke-width: 2; transition: opacity 0.2s; }
          #f-credits .cr-bar .bysa { fill: var(--ink); }
          #f-credits .cr-bar .by { fill: var(--pen); }
          #f-credits .cr-bar .pd { fill: var(--hl); }
          #f-credits .cr-bar .other { fill: var(--ink-3); }
          #f-credits .cr-bar text { font-family: var(--font-mono); font-size: 20px; font-weight: 600; pointer-events: none; }
          #f-credits .cr-bar text.on-dark { fill: var(--paper); }
          #f-credits .cr-bar text.on-light { fill: var(--ink); }
          #f-credits .cr-bar text.on-hl { fill: #1b2630; }
          #f-credits .cr-bar rect.dim { opacity: 0.22; }
          #f-credits .cr-legend { font-size: 20px; color: var(--ink-2); }
          #f-credits .cr-legend b { color: var(--ink); font-family: var(--font-mono); font-weight: 600; }
          #f-credits .cr-box { flex: 1; min-height: 0; overflow-y: auto; border: 3px solid var(--ink); border-radius: 14px 5px 12px 4px / 5px 12px 4px 14px; padding: 6px 16px; overscroll-behavior: contain; }
          #f-credits .cr-list { list-style: none; margin: 0; padding: 0; }
          #f-credits .cr-row { display: grid; grid-template-columns: 54px 1fr; gap: 14px; align-items: center; padding: 9px 0; border-bottom: 1.5px dashed var(--ink-3); }
          #f-credits .cr-row:last-child { border-bottom: 0; }
          #f-credits .cr-row[hidden] { display: none; }
          #f-credits .cr-row img { width: 54px; height: 54px; object-fit: cover; object-position: 50% 30%; filter: grayscale(1) contrast(1.05); background: var(--paper-3); display: block; }
          #f-credits .cr-sub { font-size: 22px; font-weight: 600; line-height: 1.3; overflow-wrap: break-word; }
          #f-credits .cr-meta { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); line-height: 1.3; overflow-wrap: break-word; }
          #f-credits .cr-meta .li { color: var(--ink); white-space: nowrap; }
          #f-credits .cr-meta a { color: var(--pen); white-space: nowrap; }
          #f-credits .cr-meta .sep { color: var(--ink-3); margin: 0 8px; }
          #f-credits .cr-empty { padding: 30px 10px; }
          #f-credits .rf-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 10px; }
          #f-credits .rf { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 62px 1fr; column-gap: 12px; row-gap: 3px; font-size: 21px; line-height: 1.3; }
          #f-credits .rf .tg { font-family: var(--font-mono); font-size: 20px; color: var(--pen); font-weight: 600; }
          #f-credits .rf .tg.gap { padding-top: 12px; }
          #f-credits .rf .it { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-bottom: 5px; margin-bottom: -5px; } /* room for the link underline inside the clip, row height unchanged */
          #f-credits .rf .it.gap { padding-top: 12px; }
          #f-credits .rf a { color: var(--ink); text-decoration: none; border-bottom: 1.5px solid var(--ink-3); }
          #f-credits .rf a:hover { border-bottom-color: var(--pen); color: var(--pen); }
          #f-credits .rf .who { font-weight: 600; }
          #f-credits .rf .what { color: var(--ink-2); }
        </style>
        <div class="kicker">마무리 · 고마운 출처</div>
        <h2 class="title md">출처와 사진 저작권</h2>
        <div class="cr-grid">
          <div class="cr-left demo">
            <div class="cr-chips"></div>
            <svg class="cr-bar" viewBox="0 0 760 40" aria-label="라이선스별 사진 수"></svg>
            <div class="cr-legend"></div>
            <div class="cr-box" data-scroll><ul class="cr-list"></ul></div>
          </div>
          <div class="demo" style="min-width:0">
            <div class="rf-head"><span class="subtitle">주요 참고 자료</span><span class="hand" style="font-size:34px">숫자마다 출처가 있어요</span></div>
            <ul class="rf">${REFS.map(([tg, who, what, url], i) => {
              const gap = tg && i > 0 ? ' gap' : '';
              return `<li class="tg${gap}">${tg}</li><li class="it${gap}"><a href="${url}" target="_blank" rel="noopener"><span class="who">${who}</span> <span class="what">· ${what}</span></a></li>`;
            }).join('')}
              <li class="tg gap">강사</li><li class="it gap">${REFS_ME.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener"><span class="who">${t}</span></a>`).join(' <span class="what">·</span> ')}</li>
            </ul>
          </div>
        </div>
        <div class="src">사진: Wikimedia Commons, 각 사진의 라이선스를 따름 (assets/img/credits-*.json) · 모든 숫자의 출처 링크: research/01–05 조사 노트</div>`,
      init(el, K) {
        const list = el.querySelector('.cr-list');
        const chips = el.querySelector('.cr-chips');
        const bar = el.querySelector('.cr-bar');
        const legend = el.querySelector('.cr-legend');
        const C = (Array.isArray(window.CREDITS) ? window.CREDITS : []).filter((c) => c && c.id);
        if (!C.length) {
          chips.remove(); bar.remove(); legend.remove();
          list.innerHTML = `<li class="cr-empty"><div class="hand">사진 크레딧 데이터가 아직 없어요.</div><div class="mono small muted" style="margin-top:12px">python3 tools/build-credits.py 를 실행하면 채워집니다</div></li>`;
          return;
        }
        const order = ['bysa', 'by', 'pd', 'other'];
        const count = { bysa: 0, by: 0, pd: 0, other: 0 };
        C.forEach((c) => { c._fam = fam(c.license); count[c._fam]++; });
        const fams = order.filter((k) => count[k] > 0);

        list.innerHTML = C.map((c) => {
          const src = /^https?:\/\//.test(c.source || '') ? c.source : '';
          const file = c.file || K.img(c.id);
          return `<li class="cr-row" data-fam="${c._fam}">
            <img src="${K.escape(file)}" alt="" loading="lazy" draggable="false">
            <div style="min-width:0">
              <div class="cr-sub" title="${K.escape(c.subject || c.id)}">${K.escape(shortSubject(c.subject || c.id))}</div>
              <div class="cr-meta"><span class="au" title="${K.escape(c.author || '')}">${K.escape(c.author || '작자 미상')}</span><span class="sep">·</span><span class="li">${K.escape(c.license || '')}</span>${src ? `<span class="sep">·</span><a href="${K.escape(src)}" target="_blank" rel="noopener">원본 ↗</a>` : ''}</div>
            </div>
          </li>`;
        }).join('');

        chips.innerHTML = `<button class="chip on" data-f="all">전체 ${C.length}</button>` +
          fams.map((k) => `<button class="chip" data-f="${k}">${FAM[k].name} ${count[k]}</button>`).join('');
        legend.innerHTML = fams.filter((k) => FAM[k].tip).map((k) => `<b>${FAM[k].short}</b> ${FAM[k].tip}`).join(' &nbsp;·&nbsp; ');

        // stacked bar drawn to scale (one unit per photo)
        const W = 760, H = 40;
        let x = 0;
        fams.forEach((k) => {
          const w = (count[k] / C.length) * W;
          const r = K.svg('rect', { x: x.toFixed(1), y: 1, width: Math.max(1, w - 2).toFixed(1), height: H - 2, class: k, 'data-f': k }, bar);
          r.style.cursor = 'pointer';
          if (w > 44) {
            const t = K.svg('text', { x: (x + 12).toFixed(1), y: 27, class: k === 'pd' ? 'on-hl' : 'on-dark' }, bar);
            t.textContent = String(count[k]);
          }
          x += w;
        });

        let cur = 'all';
        const apply = () => {
          chips.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b.dataset.f === cur));
          bar.querySelectorAll('rect').forEach((r) => r.classList.toggle('dim', cur !== 'all' && r.dataset.f !== cur));
          list.querySelectorAll('.cr-row').forEach((row) => { row.hidden = cur !== 'all' && row.dataset.fam !== cur; });
          el.querySelector('.cr-box').scrollTop = 0;
        };
        chips.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (!b) return; cur = b.dataset.f; apply(); });
        bar.addEventListener('click', (e) => { const r = e.target.closest('[data-f]'); if (!r) return; cur = cur === r.dataset.f ? 'all' : r.dataset.f; apply(); });
      },
    },
  ]);
})();
