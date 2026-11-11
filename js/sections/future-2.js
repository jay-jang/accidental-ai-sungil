/* Future · part 2 — 느낌 vs 측정, 제번스의 역설, 빙산, 로드맵, 지켜야 할 선 */
(function () {
  'use strict';

  /* hand-drawn ellipse ("채점 동그라미") as an SVG path in a 100×50 box */
  function handEllipse(seed) {
    const rnd = Kit.rand(seed || 3);
    const pts = [];
    for (let i = 0; i <= 28; i++) {
      const a = -2.5 + (i / 26) * Math.PI * 2.1;
      const k = 1 + (rnd() - 0.5) * 0.07;
      pts.push([50 + Math.cos(a) * 47 * k, 25 + Math.sin(a) * 22 * k]);
    }
    return Kit.sketchPath(pts);
  }

  /* ───────────────────────── 1. METR: 느낌 vs 측정 ───────────────────────── */
  const MP_S = 6, MP_X0 = 566, MP_LX = 262;
  const MP_ROWS = [
    { y: 92, h: 58, v: 24, cls: 'b-feel', lab: '시작 전 예상', start: 0.05, dur: 0.45 },
    { y: 166, h: 58, v: 20, cls: 'b-feel', lab: '끝난 뒤 느낌', start: 0.35, dur: 0.45 },
    { y: 240, h: 58, v: -19, ci: [-39, -2], cls: 'b-meas', lab: '실제 측정', start: 1.0, dur: 0.6, txt: '19% 느려짐', bad: true },
    { y: 382, h: 46, v: 55, cls: 'b-other', lab: 'Copilot 실험', sub: '2022 · 95명 · 서버 새로 짜기', start: 1.75, dur: 0.4 },
    { y: 456, h: 46, v: 18, ci: [-9, 38], cls: 'b-other', lab: 'METR 후속', sub: '2026 · 재참가자 · 오차 큼', start: 1.9, dur: 0.4 },
  ];

  /* ───────────────────────── 3. 빙산 ───────────────────────── */
  // angular, slightly lopsided berg (stage px, clockwise from the peak)
  const BERG = [
    [688, 100], [708, 118], [738, 150], [752, 176], [784, 206], [800, 240], [836, 272], [852, 318], [884, 338],
    [926, 386], [958, 452], [986, 540], [976, 628], [996, 700], [962, 786], [918, 838], [846, 872], [740, 884],
    [640, 878], [560, 866], [500, 830], [458, 764], [448, 690], [424, 610], [452, 520], [470, 446], [512, 380],
    [534, 334], [566, 300], [584, 262], [616, 236], [630, 196], [660, 160], [668, 128],
  ];
  /* horizontal extent of the berg polygon at height y → [xmin, xmax] */
  function bergSpan(y) {
    const xs = [];
    for (let i = 0; i < BERG.length; i++) {
      const a = BERG[i], b = BERG[(i + 1) % BERG.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    return xs.length ? [Math.min.apply(null, xs), Math.max.apply(null, xs)] : [700, 700];
  }
  const LAYERS = [
    { n: '타이핑', who: '타자 속도로 겨루지 않는다. AI에게 맡기고, 나온 결과를 꼼꼼히 읽는 사람', fact: 'Google 신규 코드의 75%: AI가 쓰고 엔지니어가 승인 (2026.4, 회사 발표)' },
    { n: '문법', who: '문법은 AI가 고쳐 줘도, 왜 틀렸는지 설명할 수 있는 사람', fact: '' },
    { n: '반복 코드', who: '반복은 AI에게 넘기고, 남는 시간을 더 어려운 문제에 쓰는 사람', fact: '미국 ‘컴퓨터 프로그래머’ 일자리 −7% 전망. 이유: 반복 코딩 자동화 (BLS)' },
    { n: '문서 초안', who: 'AI 초안을 사람이 읽기 좋게 고치고, 내용에 책임지는 사람', fact: '' },
    { n: '검증 · 테스트', who: '‘돌아간다’가 아니라 ‘맞다’를 증명하는 사람. 테스트부터 쓴다', fact: '개발자 불만 1위(66%): “거의 맞는데 살짝 틀린” AI 답 (Stack Overflow 2025)' },
    { n: '보안', who: 'AI가 짠 코드에서 비밀번호·키 노출부터 찾아내는 사람', fact: 'AI가 함께 쓴 PR(코드 변경 요청)은 보안 이슈가 최대 2.74배 (CodeRabbit, 2025.12)' },
    { n: '시스템 설계', who: '코드보다 먼저 ‘어떻게 나누고 이을지’ 그림을 그리는 사람', fact: '' },
    { n: '도메인 지식', who: '급식·병원·공장처럼 ‘그 일’ 자체를 잘 아는 사람', fact: '고객 현장에 가는 엔지니어(FDE) 공고: 2023년 대비 4,600% 이상 증가' },
    { n: '소통 · 협업', who: '사용자 말을 끝까지 듣고, 팀에게 쉽게 설명하는 사람', fact: '' },
    { n: '문제 정의', who: '“만들 수 있나?”보다 “만들 가치가 있나?”를 먼저 묻는 사람', fact: 'WEF 핵심 역량 1위: 분석적 사고 (기업 69%)' },
    { n: '책임', who: '문제가 생기면 “제가 확인했습니다”라고 말할 수 있는 사람', fact: '' },
  ];
  // band edges (stage px): 4 above the 2023 waterline, 7 below
  const BANDS = [150, 195, 240, 285, 332];
  for (let i = 1; i <= 7; i++) BANDS.push(332 + (i * 550) / 7);
  const W_2023 = 332, W_DROP = 92; // waterline 2023 → 2030 (illustrative)

  /* ───────────────────────── 4. 로드맵 ───────────────────────── */
  const ROAD = [
    {
      when: '지금', sub: '이번 학기', x: 92, y: 392, w: 452,
      items: [
        ['a1', 'GitHub 학생 팩 신청하고, 매주 작은 것 하나 올리기'],
        ['a2', 'AI는 페어 프로그래머로. 내가 설명할 수 있는 코드만 제출'],
        ['a3', '같은 과제를 AI 없이 한 번, AI와 한 번. 시간 재 보기'],
      ],
    },
    {
      when: '졸업 전', sub: '2·3학년', x: 594, y: 282, w: 452,
      items: [
        ['b1', '자료구조&nbsp;· 네트워크&nbsp;· DB&nbsp;· 보안 기초 다지기'],
        ['b2', '기능경기대회&nbsp;· 정보올림피아드&nbsp;· 해커톤 중 하나 도전', '선배들: 경기도 기능경기대회 <span class="nw">게임개발 금·은</span><br>2026 국제기능올림픽: 새 종목 <span class="nw">‘SW 테스팅’</span> 한국 은메달'],
        ['b3', '우리 학교(또는 도제 현장)의 진짜 문제 풀어 보기'],
      ],
    },
    {
      when: '졸업 후', sub: '첫 3년', x: 1096, y: 172, w: 420,
      items: [
        ['c1', '남과 AI가 쓴 코드를 읽고 리뷰하는 사람 되기'],
        ['c2', '테스트·보안은 습관으로. 비밀키는 .env에'],
        ['c3', '코딩 + 다른 분야 하나 <span class="nw">(금융·의료·게임·제조)</span>'],
      ],
      fact: '<b>고졸 취업 길도 열려 있다</b><br>특성화고 취업률 <span class="nw">53.6% (2026, ↑)</span> · 직업계고 300인 이상 기업 취업 비중 <span class="nw">5년 연속↑</span> <span class="nw">(진학·입대자 제외 기준)</span>',
    },
  ];

  /* ───────────────────────── 5. 지켜야 할 선 ───────────────────────── */
  const CHOICES = ['괜찮다', '안 된다', '조건부'];
  const ETHICS = [
    {
      q: '친구 얼굴을 합성한 영상을 만들어 단톡방에 올린다', a: 1,
      why: '동의 없는 합성은 장난이 아니라 폭력. 한 번 퍼지면 <b>완전히 지울 수 없고</b>, 재미로 한 일이 친구에겐 오래 남는다.',
    },
    {
      q: 'AI가 짜 준 코드를 그대로 과제로 낸다', a: 2,
      why: '선생님이 허용했고, AI를 썼다고 밝히고, <b>한 줄씩 설명할 수 있으면</b> OK. 아니면 베끼기와 같다.',
    },
    {
      q: '친구들 이름·전화번호 명단을 챗봇에 넣고 정리를 부탁한다', a: 1,
      why: '입력한 글은 <b>회사 서버로 간다.</b> 남의 개인정보는 빼거나 가짜 이름으로 바꿔서 묻자.',
    },
    {
      q: 'AI로 만든 그림을 굿즈로 만들어 판다', a: 2,
      why: '약관이 판매를 허용하는지, 남의 캐릭터·얼굴을 베끼지 않았는지 확인. <b>저작권을 인정받지 못할 수도</b> 있다.',
    },
  ];

  Deck.part('future', 2, [
    /* ═════════════════════════ 1. metr-paradox ═════════════════════════ */
    {
      id: 'metr-paradox',
      title: '느낌 vs 측정: AI 쓰면 빨라질까?',
      minutes: 1,
      optional: true,
      notes: '2025년 METR이라는 연구소가 숙련 오픈소스 개발자 16명에게 자기 프로젝트의 실제 이슈 246개를 무작위로 “AI 허용/금지”로 나눠 맡겼습니다. 시작 전엔 24% 빨라질 거라 예상했고, 끝나고도 20% 빨라졌다고 느꼈지만, 실제 시간은 19% 더 걸렸습니다.\n반대로 2022년 Copilot 실험(95명, 빈 파일에서 HTTP 서버 새로 짜기)은 55% 빨랐고, 2026년 METR 후속 연구(57명)에서 재참가자는 18% 빨라졌지만 오차 범위가 0을 포함하고, AI 없이 하기 싫다며 과제를 빼는 사람도 있어 METR 스스로 “매우 약한 증거”라고 했습니다. 결론은 “AI는 무조건 좋다/나쁘다”가 아니라 “재 보기 전엔 모른다”입니다.\n클릭: 먼저 슬라이더로 “우리 반 예상”을 학생들에게 물어 맞춘 뒤 [다시 재생]을 눌러 막대가 차례로 자라는 것을 보여 줍니다.\n질문: “여러분이 AI로 숙제할 때 정말 빨라졌는지, 시간을 재 본 적 있나요?”',
      html: `
        <style>
          #f-metr-paradox .stage { word-break: keep-all; }
          #f-metr-paradox .mp-chart text { font-size: 20px; }
          #f-metr-paradox .mp-chart .lab { font-family: var(--font-body); font-size: 30px; font-weight: 600; fill: var(--ink); }
          #f-metr-paradox .mp-chart .lab.sm { font-size: 26px; }
          #f-metr-paradox .mp-chart .sub { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); }
          #f-metr-paradox .mp-chart .grp { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); letter-spacing: .04em; }
          #f-metr-paradox .mp-chart .dir { font-family: var(--font-body); font-size: 24px; font-weight: 600; fill: var(--ink-2); }
          #f-metr-paradox .mp-chart .val { font-family: var(--font-mono); font-size: 32px; font-weight: 600; fill: var(--ink); paint-order: stroke; stroke: var(--paper); stroke-width: 7px; stroke-linejoin: round; }
          #f-metr-paradox .mp-chart .val.bad { fill: var(--bad); }
          #f-metr-paradox .mp-chart .val.pen { fill: var(--pen); }
          #f-metr-paradox .b-feel { fill: var(--pen-soft); stroke: var(--pen); stroke-width: 3; stroke-dasharray: 10 6; }
          #f-metr-paradox .b-meas { fill: var(--ink); }
          #f-metr-paradox .b-other { fill: var(--ink-3); }
          #f-metr-paradox .wh { stroke: var(--ink); stroke-width: 3; fill: none; }
          #f-metr-paradox .zero { stroke: var(--ink); stroke-width: 3; }
          #f-metr-paradox .sep { stroke: var(--ink-3); stroke-width: 2; stroke-dasharray: 3 7; }
          #f-metr-paradox .pred path { fill: none; stroke: var(--pen); stroke-width: 3; stroke-dasharray: 3 7; stroke-linecap: round; }
          #f-metr-paradox .pred text { font-family: var(--font-hand); font-size: 34px; fill: var(--pen); paint-order: stroke; stroke: var(--paper); stroke-width: 6px; }
        </style>
        <div class="kicker">느낌 vs 측정 · METR 무작위 실험 (2025)</div>
        <h2 class="title md">“빨라졌다”고 느꼈는데, 실제로는 <span class="mark">19% 느려졌다</span></h2>
        <div class="row" style="flex:1;gap:34px;align-items:flex-start">
          <div class="demo" style="width:1010px;flex:none"><svg class="chart mp-chart" viewBox="0 0 1010 560" width="1010" height="560" aria-label="AI 사용 효과: 예상, 느낌, 실제 측정 막대그래프"></svg></div>
          <div class="stack demo" style="flex:1;gap:26px;padding-top:8px">
            <div class="sticky" style="--tilt:2.2deg;font-size:60px;padding:20px 24px 24px;line-height:1.05">느낌 ≠ 측정<div style="font-size:36px;margin-top:10px">재 보고, 확인하자</div></div>
            <div class="field" style="margin-top:22px"><label>우리 반 예상은? <output class="mp-out">+30%</output></label><input type="range" class="mp-pred" min="-40" max="60" step="1" value="30" aria-label="우리 반 예상"></div>
            <button class="btn mp-play" style="align-self:flex-start">다시 재생</button>
            <div style="margin-top:14px;border-top:2px dashed var(--ink-3);padding-top:16px">
              <div class="kicker" style="margin-bottom:8px">왜 결과가 다를까?</div>
              <div style="font-size:24px;line-height:1.4"><b>Copilot</b>: 빈 파일에서 짠 작은 서버<br><b>METR</b>: 손에 익은 100만 줄+ 저장소</div>
            </div>
          </div>
        </div>
        <div class="src">출처: METR 무작위 실험 (2025.7.10) · METR 후속 발표 (2026.2.24) · GitHub Copilot 실험 (2022.9) · 막대 끝의 가는 선 = 95% 신뢰구간</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.mp-chart');
        const X = (v) => MP_X0 + v * MP_S;
        const T = (x, y, txt, cls, anchor) => { const t = K.svg('text', { x, y, class: cls || '', 'text-anchor': anchor || 'start' }, svg); t.textContent = txt; return t; };
        // grid + axis
        for (let v = -40; v <= 60; v += 10) K.svg('line', { x1: X(v), y1: 46, x2: X(v), y2: 514, class: 'gridl' }, svg);
        K.svg('line', { x1: X(-45), y1: 514, x2: X(60), y2: 514, class: 'ax' }, svg);
        for (let v = -40; v <= 60; v += 20) T(X(v), 544, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%', '', 'middle');
        T(MP_X0 - 16, 30, '← 느려졌다', 'dir', 'end');
        T(MP_X0 + 16, 30, '빨라졌다 →', 'dir', 'start');
        T(0, 76, '숙련 개발자 16명 · 자기 프로젝트 실제 이슈 246개', 'grp');
        K.svg('line', { x1: 0, y1: 342, x2: 1000, y2: 342, class: 'sep' }, svg);
        T(0, 372, '다른 실험들', 'grp');
        // prediction marker (behind bars)
        const pred = K.svg('g', { class: 'pred' }, svg);
        const pl = K.svg('path', {}, pred);
        // rows
        const rows = MP_ROWS.map((r) => {
          const cy = r.y + r.h / 2;
          if (r.sub) { T(MP_LX, cy - 2, r.lab, 'lab sm', 'end'); T(MP_LX, cy + 24, r.sub, 'sub', 'end'); }
          else T(MP_LX, cy + 10, r.lab, 'lab', 'end');
          const bar = K.svg('rect', { y: r.y, height: r.h, x: MP_X0, width: 0, class: r.cls }, svg);
          let wh = null;
          if (r.ci) {
            wh = K.svg('g', { class: 'wh' }, svg);
            K.svg('line', { x1: X(r.ci[0]), y1: cy, x2: X(r.ci[1]), y2: cy }, wh);
            K.svg('line', { x1: X(r.ci[0]), y1: cy - 12, x2: X(r.ci[0]), y2: cy + 12 }, wh);
            K.svg('line', { x1: X(r.ci[1]), y1: cy - 12, x2: X(r.ci[1]), y2: cy + 12 }, wh);
          }
          const vx = r.v < 0 ? MP_X0 + 16 : X(Math.max(r.v, r.ci ? r.ci[1] : r.v)) + 14;
          const val = T(vx, cy + 11, r.txt || '+' + r.v + '%', 'val' + (r.bad ? ' bad' : r.cls === 'b-feel' ? ' pen' : ''));
          return Object.assign({ bar, wh, val }, r);
        });
        K.svg('line', { x1: MP_X0, y1: 40, x2: MP_X0, y2: 520, class: 'zero' }, svg);
        // prediction label on top of the zero axis (its paper halo keeps it readable)
        const pt = K.svg('text', { y: 334, 'text-anchor': 'middle' }, K.svg('g', { class: 'pred' }, svg));

        const inp = el.querySelector('.mp-pred'), out = el.querySelector('.mp-out');
        // dotted line from y 92 to 304, broken where it would run through a visible value label
        const drawLine = () => {
          const x = X(+inp.value);
          const gaps = rows.filter((r) => r.y < 304 && +r.val.style.opacity > 0.05).map((r) => r.val.getBBox())
            .filter((b) => x > b.x - 6 && x < b.x + b.width + 6).map((b) => [b.y + 4, b.y + b.height - 4]);
          let d = '', y0 = 92;
          gaps.forEach(([a, b]) => { if (a > y0) d += `M${x},${y0}V${a}`; y0 = Math.max(y0, b); });
          if (y0 < 304) d += `M${x},${y0}V304`;
          pl.setAttribute('d', d || `M${x},304V304`);
        };
        const setPred = () => {
          const v = +inp.value;
          const x = X(v);
          drawLine();
          // label sits beside its own line (never across the zero axis); flips left near the right edge
          const right = v >= 0 && x < 850;
          pt.setAttribute('x', right ? x + 12 : x - 12);
          pt.setAttribute('text-anchor', right ? 'start' : 'end');
          pt.textContent = '우리 반 ' + (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%';
          out.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '%';
        };
        inp.addEventListener('input', setPred);
        setPred();

        let anim = 99;
        const draw = () => {
          rows.forEach((r) => {
            const p = K.easeOut(K.clamp((anim - r.start) / r.dur, 0, 1));
            const w = Math.abs(r.v) * MP_S * p;
            r.bar.setAttribute('x', r.v >= 0 ? MP_X0 : MP_X0 - w);
            r.bar.setAttribute('width', Math.max(0.01, w));
            r.val.style.opacity = K.clamp((anim - r.start - r.dur * 0.6) / 0.3, 0, 1);
            if (r.wh) r.wh.style.opacity = K.clamp((anim - r.start - r.dur) / 0.35, 0, 1);
          });
          drawLine();
        };
        K.loop(el, (t, dt) => { if (anim < 3) { anim += dt; draw(); } });
        f._mpPlay = () => { anim = 0; draw(); };
        f._mpDone = () => { anim = 99; draw(); };
        el.querySelector('.mp-play').addEventListener('click', f._mpPlay);
        draw();
      },
      enter(el, K, f) { f._mpPlay && f._mpPlay(); },
      leave(el, K, f) { f._mpDone && f._mpDone(); },
    },

    /* ═════════════════════════ 2. jevons ═════════════════════════ */
    {
      id: 'jevons',
      title: '제번스의 역설: 싸지면 더 많이 쓴다',
      minutes: 1,
      optional: true,
      notes: '1865년 경제학자 제번스는 증기기관이 석탄을 덜 먹게 되자 오히려 석탄 사용량이 늘었다고 지적했습니다. 2025년 1월 나델라(MS CEO)도 “Jevons paradox strikes again!”이라고 썼죠. 코딩 AI로 소프트웨어 하나 만드는 비용이 내려가면, 예전엔 너무 비싸서 안 만들던 소프트웨어까지 만들어지게 됩니다.\n클릭: 위 슬라이더(비용)를 오른쪽 끝 100%로 올렸다가 천천히 내려 보세요. 점이 곡선을 따라 오른쪽으로 가고, 노란 넓이(비용 × 양 = 전체 개발 일거리)가 예전 점선 상자보다 커집니다. 그다음 아래 슬라이더(탄력성)를 1보다 작게 내리면 노란 넓이가 오히려 줄어듭니다. 즉 제번스의 역설은 법칙이 아니라 “사람들이 싸진 만큼 훨씬 더 원할 때”만 성립하는 조건입니다. 탄력성 1.40은 설명용으로 고른 값이라, 실제 데이터를 같이 봐야 합니다.\n실제 데이터(왼쪽 상자): Indeed Hiring Lab(2026.7.8)에 따르면 Claude Code가 나온 2025년 2월 이후 미국 SW 개발 채용 공고는 약 15% 늘었고, 같은 기간 전체 공고는 7% 줄었습니다. 다만 2025.5~2026.5 증가분의 71%가 시니어 자리였고, 지금도 팬데믹 전보다 약 27.5% 낮습니다. 희망도 있고, 신입에겐 아직 좁은 문이라는 것도 함께 말해 주세요.\n덧붙일 비유: 스프레드시트(1979 VisiCalc)가 계산을 대신하자 회계사는 사라지지 않고 “더 가치 있는 사람”이 됐다는 NPR Planet Money(2015.2.27) 이야기.\n질문: “소프트웨어 만드는 게 10배 싸지면, 여러분은 어떤 앱을 만들고 싶나요? 그런 앱이 세상에 몇 개나 더 생길까요?”',
      html: `
        <style>
          #f-jevons .stage { word-break: keep-all; }
          #f-jevons .jv-svg { overflow: visible; display: block; }
          #f-jevons .jv-svg text { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); }
          #f-jevons .jv-ax { stroke: var(--ink); stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; }
          #f-jevons .jv-grid { stroke: var(--grid-line); stroke-width: 1.5; }
          #f-jevons .jv-curve { fill: none; stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
          #f-jevons .jv-old { fill: none; stroke: var(--ink-2); stroke-width: 3; stroke-dasharray: 9 7; }
          #f-jevons .jv-new { fill: var(--hl-soft); stroke: var(--ink); stroke-width: 2.5; }
          #f-jevons .jv-guide { stroke: var(--ink-3); stroke-width: 2; stroke-dasharray: 3 6; }
          #f-jevons .jv-dot { fill: var(--hl); stroke: var(--ink); stroke-width: 3; }
          #f-jevons .jv-odot { fill: var(--paper); stroke: var(--ink-2); stroke-width: 3; }
          #f-jevons .jv-svg .jv-big { font-family: var(--font-body); font-size: 31px; font-weight: 700; fill: var(--ink); font-variant-numeric: tabular-nums; }
          #f-jevons .jv-svg .jv-in { font-family: var(--font-body); font-size: 28px; font-weight: 700; fill: var(--ink); }
          #f-jevons .jv-svg .jv-in.out { paint-order: stroke; stroke: var(--paper); stroke-width: 7px; stroke-linejoin: round; }
          #f-jevons .jv-svg .up { fill: var(--good); }
          #f-jevons .jv-svg .down { fill: var(--bad); }
          #f-jevons .jv-svg .jv-hand { font-family: var(--font-hand); font-size: 34px; fill: var(--pen); }
          #f-jevons .jv-svg .jv-axl { font-family: var(--font-body); font-size: 22px; font-weight: 600; fill: var(--ink); }
          #f-jevons .jv-real { display: grid; grid-template-columns: 170px auto 1fr; align-items: center; column-gap: 12px; row-gap: 8px; font-size: 25px; }
          #f-jevons .jv-real b { font-size: 30px; }
          #f-jevons .jv-bar { display: block; height: 24px; }
        </style>
        <div class="kicker">제번스의 역설 · 1865</div>
        <h2 class="title" style="width:560px">싸지면,<br>더 많이 쓴다</h2>
        <p style="width:540px;font-size:29px;line-height:1.45">1865년 경제학자 제번스: 증기기관이 석탄을 <b>덜</b> 먹게 되자, 영국은 석탄을 <span class="mark">더</span> 많이 썼다.</p>
        <div class="box" style="width:540px;padding:18px 24px;margin-top:6px">
          <div class="kicker" style="margin-bottom:10px">2026년, 실제로는? · 미국 채용 공고</div>
          <div class="jv-real">
            <span>SW 개발 공고</span><i class="jv-bar" style="width:${15 * 9}px;background:var(--good)"></i><b class="mono good">+15%</b>
            <span>전체 공고</span><i class="jv-bar" style="width:${7 * 9}px;background:var(--bad)"></i><b class="mono bad">−7%</b>
          </div>
          <div style="font-size:25px;line-height:1.4;margin-top:10px">단, 늘어난 자리의 <b>71%는 시니어</b>. 신입 문은 아직 좁다.</div>
          <div class="mono muted" style="font-size:20px;margin-top:6px">Indeed Hiring Lab, 2026.7.8 · 2025.2 이후</div>
        </div>
        <div class="hand" style="font-size:38px;transform:rotate(-1.5deg);width:560px;margin-top:4px;white-space:nowrap">단, 싸져도 더 원하지 않으면?<br>일거리는 줄어든다. 역설엔 조건이 있다.</div>
        <div class="abs demo" style="position:absolute;left:700px;top:52px;width:812px">
          <svg class="jv-svg" viewBox="0 0 812 540" width="812" height="540" aria-label="소프트웨어 수요 곡선과 전체 개발 일거리"></svg>
          <div class="stack" style="gap:8px;margin-top:4px;padding-left:20px">
            <div class="field"><label>소프트웨어 하나 만드는 비용 <output class="jv-po"></output></label><input type="range" class="jv-p" min="25" max="100" step="1" value="40" aria-label="소프트웨어 하나 만드는 비용"></div>
            <div class="field"><label>탄력성: 싸진 만큼 얼마나 더 원할까 <output class="jv-eo"></output></label><input type="range" class="jv-e" min="0.3" max="1.6" step="0.05" value="1.4" aria-label="수요 탄력성"></div>
          </div>
        </div>
        <div class="src">출처: Fortune 2025.1.27 (제번스·나델라) · Addy Osmani “The Efficiency Paradox” (2025.12) · Indeed Hiring Lab 2026.7.8 · 그래프: 수요 = 비용^(−탄력성) 단순 모형(설명용)</div>`,
      init(el, K) {
        const svg = el.querySelector('.jv-svg');
        const OX = 96, OY = 466, PW = 690, PH = 410, QM = 10, PM = 1.1;
        const px = (q) => OX + (q / QM) * PW, py = (p) => OY - (p / PM) * PH;
        const T = (x, y, txt, cls, anchor, parent) => { const t = K.svg('text', { x, y, class: cls || '', 'text-anchor': anchor || 'start' }, parent || svg); t.textContent = txt; return t; };
        // clip for plot
        const defs = K.svg('defs', {}, svg);
        const cp = K.svg('clipPath', { id: 'jv-clip' }, defs);
        K.svg('rect', { x: OX, y: OY - PH + 4, width: PW + 14, height: PH - 4 }, cp); // curve stops below the y-axis label
        // grid
        for (let q = 1; q <= 10; q++) K.svg('line', { x1: px(q), y1: OY, x2: px(q), y2: OY - PH, class: 'jv-grid' }, svg);
        for (let p = 0.25; p <= 1.01; p += 0.25) K.svg('line', { x1: OX, y1: py(p), x2: OX + PW, y2: py(p), class: 'jv-grid' }, svg);
        const newR = K.svg('rect', { x: OX, class: 'jv-new' }, svg);
        const oldR = K.svg('path', { class: 'jv-old' }, svg);
        // the old dashed box; its right edge breaks [ga, gb] under a label sitting across it
        const oldBox = (ga, gb) => oldR.setAttribute('d', ga == null ? `M${OX},${OY}V${py(1)}H${px(1)}V${OY}Z` : `M${OX},${OY}V${py(1)}H${px(1)}V${ga}M${px(1)},${gb}V${OY}H${OX}`);
        oldBox();
        const gH = K.svg('line', { class: 'jv-guide' }, svg), gV = K.svg('line', { class: 'jv-guide' }, svg);
        const curve = K.svg('path', { class: 'jv-curve', 'clip-path': 'url(#jv-clip)' }, svg);
        // axes (hand-drawn L with arrowheads)
        K.svg('path', { class: 'jv-ax', d: K.sketchPath([[OX, OY - PH - 20], [OX, OY], [OX + PW + 16, OY]], { tension: 0 }) }, svg);
        K.svg('path', { class: 'jv-ax', d: `M${OX - 9},${OY - PH - 8} L${OX},${OY - PH - 22} L${OX + 9},${OY - PH - 8}` }, svg);
        K.svg('path', { class: 'jv-ax', d: `M${OX + PW + 4},${OY - 9} L${OX + PW + 18},${OY} L${OX + PW + 4},${OY + 9}` }, svg);
        T(OX - 12, py(1) + 7, '100%', '', 'end'); T(OX - 12, py(0.5) + 7, '50%', '', 'end'); T(OX - 12, OY + 7, '0', '', 'end');
        [1, 5, 10].forEach((q) => T(px(q), OY + 30, '×' + q, '', 'middle'));
        const yLab = T(OX + 16, OY - PH - 6, '하나 만드는 비용(사람 시간)', 'jv-axl');
        const xLab = T(OX + PW + 14, OY + 62, '만들어지는 소프트웨어 양 →', 'jv-axl', 'end');
        const oDot = K.svg('circle', { cx: px(1), cy: py(1), r: 8, class: 'jv-odot' }, svg);
        const oLab = T(px(1) + 16, py(1) - 10, '예전 (일거리 1)', 'jv-hand');
        const dot = K.svg('circle', { r: 11, class: 'jv-dot' }, svg);
        const inLab = T(0, 0, '', 'jv-in', 'middle');
        const r1 = T(OX + PW, 150, '', 'jv-big', 'end');
        const r2 = T(OX + PW, 192, '', 'jv-big', 'end');
        // two short lines, so the band beside the dot stays free for the area label
        const note = T(OX + PW, 238, '', 'jv-hand', 'end');
        ['노란 넓이 = 비용 × 양', '= 전체 개발 일거리'].forEach((s, i) => { K.svg('tspan', { x: OX + PW, dy: i ? 38 : 0 }, note).textContent = s; });
        oDot.parentNode.appendChild(oDot);
        const AVOID = [yLab, xLab, oLab, r1, r2, note], OLDX = px(1), OLDY = py(1);
        /* how badly the label box b collides at dot (x,y): 0 = clean */
        function clash(b, yb, e, x, y, where) {
          const l = b.x - 5, r = b.x + b.width + 5, t = yb - 28, bt = yb + 9; // glyph extent around the baseline (28px font)
          if (l < OX + 4 || r > OX + PW + 12 || t < 0 || bt > OY - 3) return 99;
          let n = 0;
          AVOID.forEach((a) => { const k = a.getBBox(); if (l < k.x + k.width + 6 && r > k.x - 6 && t < k.y + k.height && bt > k.y) n += 8; });
          if (l < x + 12 && r > x - 12 && t < y + 12 && bt > y - 12) n += 4; // dot
          if (where === 'out') { if (l < x && bt > y) n += 4; } // must not sit on the yellow area
          else if (l < OX || r > x || t < y || bt > OY) n += 99; // in-area label must fit inside it
          if (where !== 'knock' && l < OLDX + 2 && r > OLDX - 2 && bt > OLDY && t < OY) n += 2; // old box edge
          const ct = Math.max(t, OY - PH + 4); // curve: its x grows monotonically with y
          if (bt > ct) {
            const xa = px(Math.pow(((OY - ct) / PH) * PM, -e)), xb = bt >= OY ? Infinity : px(Math.pow(((OY - bt) / PH) * PM, -e));
            if (xa < r && xb > l) n += 4;
          }
          return n;
        }
        function placeLabel(e, x, y) {
          const mid = (y + OY) / 2 + 10;
          const cands = [
            [(OLDX + x) / 2, mid, 'middle', 'jv-in', 'in'], // inside, right of the old box
            [(OX + x) / 2, mid, 'middle', 'jv-in', 'knock'], // inside, old box line knocked out
            [x + 18, y - 14, 'start', 'jv-in out', 'out'], // above-right of the dot
            [x + 24, y + 10, 'start', 'jv-in out', 'out'], // right of the dot
            [x + 16, OY - 16, 'start', 'jv-in out', 'out'], // right of the area, bottom
            [Math.max(x + 24, px(Math.pow(Math.max(0.01, ((OY - mid - 10) / PH) * PM), -e)) + 16), mid, 'start', 'jv-in out', 'out'], // middle, just right of the curve
          ];
          const put = (c) => { inLab.setAttribute('x', c[0]); inLab.setAttribute('y', c[1]); inLab.setAttribute('text-anchor', c[2]); inLab.setAttribute('class', c[3]); };
          let best = null;
          for (const c of cands) {
            put(c);
            const s = clash(inLab.getBBox(), c[1], e, x, y, c[4]);
            if (!best || s < best.s) best = { c, s };
            if (!s) break;
          }
          put(best.c);
          if (best.c[4] === 'knock') oldBox(best.c[1] - 32, best.c[1] + 12);
          else oldBox();
        }

        const inP = el.querySelector('.jv-p'), inE = el.querySelector('.jv-e');
        const oP = el.querySelector('.jv-po'), oE = el.querySelector('.jv-eo');
        const st = { p: +inP.value / 100, e: +inE.value, tp: +inP.value / 100, te: +inE.value };
        function outputs() {
          const p = +inP.value, e = +inE.value;
          oP.textContent = p + '%' + (p < 100 ? ' · ' + (100 / p).toFixed(1).replace(/\.0$/, '') + '배 싸짐' : '');
          oE.textContent = e.toFixed(2) + ' · ' + (e < 0.9 ? '둔감' : e <= 1.1 ? '보통' : '민감');
        }
        function render() {
          const P = st.p, e = st.e, Q = Math.pow(P, -e), work = P * Q;
          // curve
          const pmin = Math.pow(QM * 1.04, -1 / e);
          let d = '';
          for (let i = 0; i <= 70; i++) {
            const p = Math.exp(Math.log(PM) + (Math.log(pmin) - Math.log(PM)) * (i / 70));
            d += (i ? 'L' : 'M') + px(Math.pow(p, -e)).toFixed(1) + ',' + py(p).toFixed(1);
          }
          curve.setAttribute('d', d);
          const x = px(Math.min(Q, QM)), y = py(P);
          newR.setAttribute('y', y); newR.setAttribute('width', x - OX); newR.setAttribute('height', OY - y);
          dot.setAttribute('cx', x); dot.setAttribute('cy', y);
          gH.setAttribute('x1', OX); gH.setAttribute('x2', x); gH.setAttribute('y1', y); gH.setAttribute('y2', y);
          gV.setAttribute('x1', x); gV.setAttribute('x2', x); gV.setAttribute('y1', y); gV.setAttribute('y2', OY);
          r1.textContent = '만들어지는 소프트웨어 ×' + Q.toFixed(1);
          const up = work > 1.005, down = work < 0.995;
          r2.textContent = '전체 개발 일거리 ×' + work.toFixed(2) + (up ? ' · 늘어남' : down ? ' · 줄어듦' : ' · 그대로');
          r2.setAttribute('class', 'jv-big ' + (up ? 'up' : down ? 'down' : ''));
          inLab.textContent = '일거리 ×' + work.toFixed(2);
          placeLabel(e, x, y);
        }
        inP.addEventListener('input', () => { st.tp = +inP.value / 100; outputs(); });
        inE.addEventListener('input', () => { st.te = +inE.value; outputs(); });
        K.loop(el, (t, dt) => {
          if (Math.abs(st.tp - st.p) < 1e-4 && Math.abs(st.te - st.e) < 1e-4) return;
          const k = 1 - Math.exp(-dt * 14);
          st.p += (st.tp - st.p) * k; st.e += (st.te - st.e) * k;
          if (Math.abs(st.tp - st.p) < 1e-4) st.p = st.tp;
          if (Math.abs(st.te - st.e) < 1e-4) st.e = st.te;
          render();
        });
        // if the loop isn't running (e.g. overview), still respond
        const snap = () => { if (!el.classList.contains('current')) { st.p = st.tp; st.e = st.te; render(); } };
        inP.addEventListener('change', snap); inE.addEventListener('change', snap);
        outputs(); render();
        if (document.fonts) document.fonts.ready.then(render); // label spots depend on measured text widths
      },
    },

    /* ═════════════════════════ 3. swe-stack (빙산) ═════════════════════════ */
    {
      id: 'swe-stack',
      title: '코딩은 빙산의 일각',
      minutes: 1.25,
      notes: '물 위에 보이는 타이핑·문법·반복 코드·문서 초안은 AI가 해마다 더 잘하는 부분입니다. 미국 노동통계국도 반복 코딩 위주의 ‘컴퓨터 프로그래머’는 7% 줄고, 설계·검증까지 하는 ‘소프트웨어 개발자’는 10% 늘 거라고 전망합니다.\n클릭: 오른쪽 연도 슬라이더는 2023년에서 시작합니다. 2026(지금), 2030으로 밀면 수면이 내려가 ‘검증·테스트’까지 물 위로 드러납니다(그림은 비유입니다). 빙산의 층을 하나씩 클릭하면 “이런 사람이 된다” 한 줄이 오른쪽에 뜹니다. 물 아래 깊은 층(문제 정의, 책임)을 꼭 눌러 주세요.\n핵심 메시지: 수면은 계속 내려가니, 우리는 더 깊은 층으로 내려가야 한다.\n질문: “이 중에서 여러분이 지금 가장 자신 있는 층은 어디인가요? 2030년에도 물 아래 있을까요?”',
      html: `
        <style>
          #f-swe-stack .stage { word-break: keep-all; }
          #f-swe-stack .sw-svg { position: absolute; left: 0; top: 0; overflow: visible; }
          #f-swe-stack .sw-berg { fill: var(--paper); }
          #f-swe-stack .sw-outline { fill: none; stroke: var(--ink); stroke-width: 3.5; stroke-linejoin: round; }
          #f-swe-stack .sw-sep { stroke: var(--ink-3); stroke-width: 1.5; stroke-dasharray: 2 6; }
          #f-swe-stack .sw-water { fill: var(--pen-soft); }
          #f-swe-stack .sw-wave { fill: none; stroke: var(--pen); stroke-width: 3.5; stroke-linecap: round; }
          #f-swe-stack .sw-ripple { fill: none; stroke: var(--pen); stroke-width: 2; opacity: .35; stroke-linecap: round; }
          #f-swe-stack .sw-sel { fill: var(--hl-soft); }
          #f-swe-stack .sw-hit { fill: transparent; cursor: pointer; }
          #f-swe-stack .sw-hit:hover { fill: var(--pen-soft); }
          #f-swe-stack .sw-lab { font-family: var(--font-body); font-size: 30px; font-weight: 700; fill: var(--ink); pointer-events: none; }
          #f-swe-stack .sw-lab.halo { paint-order: stroke; stroke: var(--paper); stroke-width: 9px; stroke-linejoin: round; }
          #f-swe-stack .sw-lab.up { font-size: 26px; font-weight: 500; fill: var(--ink-2); }
          #f-swe-stack .sw-tag { font-family: var(--font-mono); font-size: 20px; fill: var(--pen); pointer-events: none; }
          #f-swe-stack .sw-side { font-family: var(--font-display); font-size: 28px; font-weight: 600; fill: var(--ink); }
          #f-swe-stack .sw-side.pen { fill: var(--pen); }
          #f-swe-stack .sw-hand { font-family: var(--font-hand); font-size: 42px; fill: var(--pen); }
          #f-swe-stack .sw-arrow { fill: none; stroke: var(--pen); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
          #f-swe-stack .sw-range { width: 100%; }
          #f-swe-stack .sw-bls .bar { height: 26px; }
        </style>
        <svg class="sw-svg" viewBox="0 0 1600 900" width="1600" height="900" aria-label="소프트웨어 엔지니어 역량 빙산"></svg>
        <div class="abs kicker" style="left:92px;top:64px">소프트웨어 엔지니어의 빙산 · 층을 클릭</div>
        <h2 class="abs title" style="left:92px;top:100px;width:520px">코딩은<br>빙산의 일각</h2>
        <div class="abs demo" style="position:absolute;left:1100px;top:60px;width:410px">
          <div class="kicker">수면 높이 · 연도 (비유)</div>
          <div class="year sw-year" style="font-size:100px;margin:6px 0 2px">2023</div>
          <input type="range" class="sw-range" min="2023" max="2030" step="1" value="2023" aria-label="연도">
          <div class="row mono faint" style="justify-content:space-between;font-size:20px"><span>2023</span><span>2030</span></div>
        </div>
        <div class="abs sw-card" style="left:1100px;top:446px;width:410px">
          <div class="kicker">이런 사람이 된다</div>
          <div class="display sw-name" style="font-size:50px;font-weight:800;line-height:1.15;margin:8px 0 10px"></div>
          <div class="sw-who" style="font-size:30px;line-height:1.38"></div>
          <div class="sw-fact" style="font-size:21px;line-height:1.42;color:var(--ink-2);margin-top:14px;padding-left:14px;border-left:3px solid var(--hl)"></div>
        </div>
        <div class="abs sw-bls" style="left:92px;top:648px;width:330px">
          <div class="kicker" style="margin-bottom:10px">미국 일자리 전망 2025→35</div>
          <div class="stack" style="gap:10px">
            <div><div style="font-size:24px">컴퓨터 프로그래머</div><div class="row center" style="gap:10px"><i class="bar" style="display:block;width:${7 * 9}px;background:var(--bad)"></i><b class="mono bad" style="font-size:30px">−7%</b></div></div>
            <div><div style="font-size:24px">소프트웨어 개발자</div><div class="row center" style="gap:10px"><i class="bar" style="display:block;width:${10 * 9}px;background:var(--good)"></i><b class="mono good" style="font-size:30px">+10%</b></div></div>
          </div>
        </div>
        <div class="src" style="left:1030px;right:60px;bottom:18px">출처: 미국 노동통계국(BLS) 직업전망 2025–35 · Stack Overflow 2025 · CodeRabbit 2025.12 · Google Cloud Next 2026.4 · Fortune 2026.9.3(FDE) · WEF 2025 · 수면 높이는 비유</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.sw-svg');
        const T = (x, y, txt, cls, anchor, parent) => { const t = K.svg('text', { x, y, class: cls || '', 'text-anchor': anchor || 'start' }, parent || svg); t.textContent = txt; return t; };
        const bergD = K.sketchPath(BERG.concat([BERG[0]]), { tension: 0.12 }) + "Z";
        const defs = K.svg('defs', {}, svg);
        const cp = K.svg('clipPath', { id: 'sw-clip' }, defs);
        K.svg('path', { d: bergD }, cp);
        K.svg('path', { d: bergD, class: 'sw-berg' }, svg);
        const sel = K.svg('rect', { x: 400, width: 600, class: 'sw-sel', 'clip-path': 'url(#sw-clip)' }, svg);
        const water = K.svg('rect', { x: 0, width: 1600, height: 900, class: 'sw-water' }, svg);
        water.style.pointerEvents = 'none';
        // ripples in the water (texture)
        const rip = K.svg('g', {}, svg);
        [[1000, 470], [1004, 680], [320, 864], [1010, 590]].forEach(([x, y]) => {
          K.svg('path', { class: 'sw-ripple', d: `M${x},${y} q14,-7 28,0 t28,0 t28,0` }, rip);
        });
        const seps = K.svg('g', { 'clip-path': 'url(#sw-clip)' }, svg);
        BANDS.slice(1, -1).forEach((y) => K.svg('line', { x1: 400, x2: 1000, y1: y, y2: y, class: 'sw-sep' }, seps));
        K.svg('path', { d: bergD, class: 'sw-outline' }, svg);
        const wave = K.svg('path', { class: 'sw-wave' }, svg);
        const labs = LAYERS.map((L, i) => {
          const cy = (BANDS[i] + BANDS[i + 1]) / 2;
          const s = bergSpan(cy);
          return T((s[0] + s[1]) / 2, cy + 10, L.n, "sw-lab", "middle");
        });
        const sideUp = T(92, 0, '물 위: AI가 점점 잘하는 것', 'sw-side pen');
        const sideDn = T(92, 0, '물 아래: 사람의 가치', 'sw-side');
        // hand note + arrow
        const hand = K.svg('g', { transform: 'translate(96,480) rotate(-4)' }, svg);
        T(0, 0, '수면은 해마다', 'sw-hand', 'start', hand);
        T(0, 44, '내려간다', 'sw-hand', 'start', hand);
        K.svg('path', { class: 'sw-arrow', d: 'M190,20 C214,40 218,62 212,86 M200,72 L212,88 L226,74' }, hand);
        // hit areas (on top)
        const hits = K.svg('g', { class: 'demo', 'clip-path': 'url(#sw-clip)' }, svg);
        LAYERS.forEach((L, i) => {
          const r = K.svg('rect', { x: 400, y: BANDS[i], width: 600, height: BANDS[i + 1] - BANDS[i], class: 'sw-hit', 'data-i': i }, hits);
          K.svg('title', {}, r).textContent = L.n;
        });

        const yr = el.querySelector('.sw-range'), yOut = el.querySelector('.sw-year');
        const nm = el.querySelector('.sw-name'), who = el.querySelector('.sw-who'), fact = el.querySelector('.sw-fact');
        const st = { w: 0, tw: 0, phase: 0, pick: 9 };
        const target = () => W_2023 + ((+yr.value - 2023) / 7) * W_DROP;
        st.w = st.tw = target();

        function drawWater() {
          const W = st.w;
          water.setAttribute('y', W);
          water.setAttribute('height', Math.max(0, 900 - W)); // stop at the frame's bottom edge (svg is overflow:visible)
          let d = '';
          for (let x = 0; x <= 1600; x += 20) d += (x ? 'L' : 'M') + x + ',' + (W + Math.sin(x / 34 + st.phase) * 4 + Math.sin(x / 13 - st.phase * 1.7) * 1.2).toFixed(1);
          wave.setAttribute('d', d);
          sideUp.setAttribute('y', W - 22);
          sideDn.setAttribute('y', W + 46);
          hand.setAttribute('transform', `translate(96,${(W + 104).toFixed(1)}) rotate(-4)`);
          labs.forEach((t, i) => {
            const cy = (BANDS[i] + BANDS[i + 1]) / 2;
            t.setAttribute('class', 'sw-lab' + (cy < W ? ' up' : '') + (Math.abs(cy - W) < 26 ? ' halo' : ''));
          });
        }
        function pick(i) {
          st.pick = i;
          const L = LAYERS[i];
          sel.setAttribute('y', BANDS[i]); sel.setAttribute('height', BANDS[i + 1] - BANDS[i]);
          nm.textContent = L.n.replace(/ · /g, '·');
          who.textContent = L.who;
          fact.textContent = L.fact;
          fact.style.display = L.fact ? '' : 'none';
        }
        hits.addEventListener('click', (e) => { const r = e.target.closest('[data-i]'); if (r) pick(+r.dataset.i); });
        yr.addEventListener('input', () => {
          yOut.textContent = yr.value; st.tw = target();
          if (!el.classList.contains('current')) { st.w = st.tw; drawWater(); }
        });
        K.loop(el, (t, dt) => {
          st.phase += dt * 1.6;
          st.w += (st.tw - st.w) * (1 - Math.exp(-dt * 6));
          drawWater();
        });
        pick(st.pick);
        drawWater();
        f._swReset = () => { st.w = st.tw; drawWater(); };
      },
      leave(el, K, f) { f._swReset && f._swReset(); },
    },

    /* ═════════════════════════ 4. roadmap ═════════════════════════ */
    {
      id: 'roadmap',
      title: '졸업까지의 로드맵',
      minutes: 1.25,
      notes: '정보고 학생에게 가장 구체적인 행동 목록입니다. 지금 이번 학기에 할 것, 졸업 전에 할 것, 졸업 후 첫 3년에 할 것으로 나눴습니다. 공통점은 “만들고, 설명하고, 검증하는 사람”이 되는 것입니다.\n클릭: 학생들에게 “이미 하고 있는 것”을 물어 체크해 봅니다. 체크는 이 컴퓨터에 저장됩니다(다음 시간에도 남아 있음). [초기화]로 지울 수 있습니다.\n덧붙일 말: GitHub 학생 팩은 무료이고 Copilot·Codespaces를 쓸 수 있습니다. KOI 정보올림피아드는 특성화고 학생도 일반고부문으로 시상하고, 학교 홈페이지 AI게임콘텐츠과 소개에 따르면 우리 학교 선배들은 경기도기능경기대회 게임개발 종목에서 금(2021)·은(2022·2023)메달을 땄습니다. 2026.9 상하이 국제기능올림픽에서 한국은 웹기술 5회 연속 금, 처음 생긴 ‘SW 테스팅’ 종목 은메달을 땄습니다. 검증이 하나의 직종이 됐다는 뜻입니다. 학교 문제 예시: 급식·시간표·동아리 출석 앱. 도제반이라면 회사 코드를 읽어 보는 경험 자체가 자산입니다. 영어 공식 문서(MDN, Python docs)로 공부하는 습관도 권해 주세요.\n고졸 취업(교육부·KEDI 2026.11.5): 특성화고 취업률 53.6%(전년 52.4%), 직업계고 취업자 중 300인 이상 기업 비중 38.4%로 5년 연속 상승. 단 취업률은 진학자·입대자를 뺀 기준이고, 졸업자의 49.2%는 진학했습니다.\n졸업 후 근거: GitHub Octoverse 2026(2026.10.28) 기준 2026.9 PR의 40% 이상이 AI 에이전트 초안에서 시작했고, WEF는 2030년까지 핵심 기술의 39%가 바뀐다고 봅니다. 그래서 리뷰하는 힘과 계속 배우는 습관이 중요합니다.\n질문: “이 중 이번 주 안에 할 수 있는 것 하나만 고르면 무엇인가요?”',
      html: `
        <style>
          #f-roadmap .stage { word-break: keep-all; }
          #f-roadmap .rm-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
          #f-roadmap .rm-road { fill: none; stroke: var(--hl-soft); stroke-width: 34; stroke-linecap: round; stroke-linejoin: round; }
          #f-roadmap .rm-mid { fill: none; stroke: var(--ink-3); stroke-width: 3; stroke-dasharray: 14 12; stroke-linecap: round; }
          #f-roadmap .rm-pin { fill: var(--paper); stroke: var(--ink); stroke-width: 3.5; }
          #f-roadmap .rm-num { font-family: var(--font-mono); font-size: 28px; font-weight: 600; fill: var(--ink); }
          #f-roadmap .rm-end { font-family: var(--font-hand); font-size: 38px; fill: var(--pen); }
          #f-roadmap .rm-st { position: absolute; padding-left: 62px; }
          #f-roadmap .rm-when { font-family: var(--font-display); font-weight: 800; font-size: 44px; line-height: 1.1; margin-bottom: 14px; }
          #f-roadmap .rm-when small { font-family: var(--font-hand); font-weight: 400; font-size: 36px; color: var(--pen); margin-left: 10px; }
          #f-roadmap .rm-list { display: flex; flex-direction: column; gap: 14px; }
          #f-roadmap .rm-item { display: flex; gap: 14px; align-items: flex-start; font-size: 28px; line-height: 1.32; cursor: pointer; position: relative; }
          #f-roadmap .rm-item input { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
          #f-roadmap .rm-box { flex: none; width: 30px; height: 30px; margin-top: 3px; border: 3px solid var(--ink); border-radius: 4px 7px 5px 6px; background: var(--paper); position: relative; }
          #f-roadmap .rm-box svg { position: absolute; left: -3px; top: -12px; width: 44px; height: 40px; overflow: visible; }
          #f-roadmap .rm-box path { fill: none; stroke: var(--pen); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 70; stroke-dashoffset: 70; transition: stroke-dashoffset .35s ease; }
          #f-roadmap .rm-item input:checked + .rm-box path { stroke-dashoffset: 0; }
          #f-roadmap .rm-item input:focus-visible + .rm-box { outline: 3px solid var(--pen); outline-offset: 3px; }
          #f-roadmap .rm-m { transition: background-size .3s ease; background: linear-gradient(176deg, transparent 52%, var(--hl-soft) 52%, var(--hl-soft) 92%, transparent 92%) no-repeat 0 0 / 0% 100%; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
          #f-roadmap .rm-item input:checked ~ .rm-txt .rm-m { background-size: 100% 100%; }
          #f-roadmap .rm-txt small { display: block; font-family: var(--font-body); font-size: 21px; color: var(--ink-2); line-height: 1.35; margin-top: 3px; }
          #f-roadmap .rm-fact { margin-top: 22px; padding-left: 14px; border-left: 3px solid var(--hl); font-size: 21px; line-height: 1.42; color: var(--ink-2); }
          #f-roadmap .rm-fact b { font-size: 24px; color: var(--ink); }
          #f-roadmap .nw { white-space: nowrap; }
        </style>
        <svg class="rm-svg" viewBox="0 0 1600 900" width="1600" height="900" aria-hidden="true"></svg>
        <div class="kicker">정보고 학생을 위한 로드맵 · 체크하면 저장돼요</div>
        <h2 class="title">졸업까지의 로드맵</h2>
        <div class="rm-stations"></div>
        <div class="abs demo" style="position:absolute;left:1158px;top:672px;width:350px;transform:rotate(-2deg)">
          <div class="hand rm-count" style="font-size:64px;line-height:1"></div>
          <div class="row center" style="gap:16px;margin-top:10px"><span class="hand" style="font-size:36px">이번 주엔 하나만!</span><button class="btn sm ghost rm-reset">초기화</button></div>
        </div>
        
        <div class="src">출처: 성일정보고 홈페이지(AI게임콘텐츠과) · 뉴스1 2026.9(국제기능올림픽) · 교육부·KEDI 직업계고 취업통계(2026.11.5) · KOI 2026 공고문 · GitHub Education 학생 팩 · METR 2025</div>`,
      init(el, K) {
        const svg = el.querySelector('.rm-svg');
        const pins = ROAD.map((s) => [s.x + 22, s.y + 26]);
        const pts = [[-30, 640], [40, 520], [pins[0][0] - 2, pins[0][1]], [138, 336], [330, 300], [540, 286], [pins[1][0], pins[1][1]],
          [640, 222], [840, 206], [1040, 180], [pins[2][0], pins[2][1]], [1150, 116], [1330, 92], [1640, 70]];
        const d = K.sketchPath(pts, { tension: 0.55 });
        K.svg('path', { d, class: 'rm-road' }, svg);
        K.svg('path', { d, class: 'rm-mid' }, svg);
        pins.forEach(([x, y], i) => {
          K.svg('circle', { cx: x, cy: y, r: 25, class: 'rm-pin' }, svg);
          const t = K.svg('text', { x, y: y + 10, class: 'rm-num', 'text-anchor': 'middle' }, svg); t.textContent = i + 1;
        });
        const end = K.svg('text', { x: 1300, y: 150, class: 'rm-end', transform: 'rotate(-6 1300 150)' }, svg); end.textContent = '그 다음은, 여러분이';

        // drop stored ids of items that no longer exist so the counter stays honest
        const valid = new Set(ROAD.flatMap((s) => s.items.map((it) => it[0])));
        const saved = K.store.get('future-roadmap', []);
        let done = new Set((Array.isArray(saved) ? saved : []).filter((id) => valid.has(id)));
        const host = el.querySelector('.rm-stations');
        const tick = '<svg viewBox="0 0 44 40" aria-hidden="true"><path d="M6,22 L17,33 L40,4"/></svg>';
        host.innerHTML = ROAD.map((s) => `
          <div class="rm-st abs" style="left:${s.x}px;top:${s.y}px;width:${s.w}px">
            <div class="rm-when">${s.when}<small>${s.sub}</small></div>
            <div class="rm-list demo">${s.items.map(([id, txt, sub]) => `
              <label class="rm-item"><input type="checkbox" data-id="${id}" ${done.has(id) ? 'checked' : ''}><span class="rm-box">${tick}</span><span class="rm-txt"><span class="rm-m">${txt}</span>${sub ? `<small>${sub}</small>` : ''}</span></label>`).join('')}
            </div>${s.fact ? `
            <div class="rm-fact">${s.fact}</div>` : ''}
          </div>`).join('');
        const total = ROAD.reduce((n, s) => n + s.items.length, 0);
        const count = el.querySelector('.rm-count');
        const render = () => { count.textContent = `체크 ${done.size} / ${total}`; K.store.set('future-roadmap', Array.from(done)); };
        host.addEventListener('change', (e) => {
          const c = e.target.closest('input[data-id]'); if (!c) return;
          if (c.checked) done.add(c.dataset.id); else done.delete(c.dataset.id);
          render();
          setTimeout(() => c.blur(), 0);
        });
        el.querySelector('.rm-reset').addEventListener('click', () => {
          done = new Set();
          host.querySelectorAll('input[data-id]').forEach((c) => (c.checked = false));
          render();
        });
        render();
      },
    },

    /* ═════════════════════════ 5. ethics ═════════════════════════ */
    {
      id: 'ethics',
      title: '지켜야 할 선',
      minutes: 1.2,
      notes: '도구가 강해질수록 “할 수 있다”와 “해도 된다”는 달라집니다. 기준은 세 가지: 동의를 받았나, 출처를 밝혔나, 결과에 내가 책임질 수 있나.\n클릭: 상황마다 학생들에게 손을 들게 해서(괜찮다/안 된다/조건부) 다수 의견을 누릅니다. 정답에는 파란 동그라미, 틀린 선택에는 빨간 빗금이 그어지고 설명이 나옵니다. [모두 공개]로 한 번에 볼 수도 있습니다.\n법 이야기: 한국 AI 기본법은 2026년 1월 22일 시행됐습니다. 생성형 AI 서비스는 AI를 쓴다는 사실을 미리 알리고, 진짜와 구분하기 어려운 결과물에는 AI가 만들었다고 표시해야 합니다(과태료는 최소 1년 계도기간).\n질문: “4번처럼 ‘조건부’인 상황에서, 여러분이 확인해야 할 조건은 무엇일까요?”',
      html: `
        <style>
          #f-ethics .stage { word-break: keep-all; }
          #f-ethics .eq-list { display: grid; grid-template-columns: 1fr 1fr; }
          #f-ethics .eq { display: grid; grid-template-columns: 46px 1fr; column-gap: 12px; row-gap: 12px; align-content: start; padding: 16px 36px 14px 0; }
          #f-ethics .eq:nth-child(2n) { padding: 16px 0 14px 36px; border-left: 2px dashed var(--ink-3); }
          #f-ethics .eq:nth-child(-n+2) { border-bottom: 2px dashed var(--ink-3); }
          #f-ethics .eq-n { font-family: var(--font-mono); font-size: 32px; font-weight: 600; color: var(--pen); line-height: 1.25; }
          #f-ethics .eq-q { font-size: 30px; line-height: 1.3; font-weight: 600; min-height: 78px; }
          #f-ethics .eq-btns { grid-column: 2; display: flex; gap: 14px; }
          #f-ethics .eq-btns .btn { position: relative; min-width: 120px; }
          #f-ethics .eq-mark { position: absolute; left: -16px; top: -14px; width: calc(100% + 32px); height: calc(100% + 28px); overflow: visible; pointer-events: none; }
          #f-ethics .eq-mark path { fill: none; stroke-width: 4; stroke-linecap: round; vector-effect: non-scaling-stroke; stroke-dasharray: 600; stroke-dashoffset: 600; transition: stroke-dashoffset .5s ease; }
          #f-ethics .eq-mark.ok path { stroke: var(--pen); }
          #f-ethics .eq-mark.no path { stroke: var(--bad); }
          #f-ethics .eq-mark.show path { stroke-dashoffset: 0; }
          #f-ethics .eq-a { grid-column: 2; min-height: 96px; font-size: 23px; line-height: 32px; color: var(--ink-2); }
          #f-ethics .eq:not(.done) .eq-a { background: repeating-linear-gradient(to bottom, transparent 0 30px, var(--ink-3) 30px 31.5px) 0 0 / 100% 96px no-repeat; opacity: .45; }
          #f-ethics .eq-a .in { opacity: 0; transition: opacity .4s ease; }
          #f-ethics .eq.done .eq-a .in { opacity: 1; }
          #f-ethics .eq-a b { color: var(--ink); }
          #f-ethics .eq-ans { font-weight: 700; color: var(--pen); margin-right: 10px; }
          #f-ethics .eq.done .btn.on { background: var(--paper-3); color: var(--ink); }
          #f-ethics .eq-stamp { border: 4px solid var(--pen); color: var(--pen); border-radius: 6px; padding: 6px 16px 8px; font-family: var(--font-display); font-weight: 800; font-size: 34px; line-height: 1.05; transform: rotate(-7deg); text-align: center; outline: 2px solid var(--pen); outline-offset: 4px; }
          #f-ethics .eq-stamp small { display: block; font-family: var(--font-mono); font-weight: 600; font-size: 20px; letter-spacing: .06em; white-space: nowrap; }
        </style>
        <div class="kicker">지켜야 할 선 · 상황 퀴즈</div>
        <div class="row center" style="gap:30px"><h2 class="title md">이건 괜찮을까?</h2><div class="btns demo"><button class="btn sm ghost eq-all">모두 공개</button><button class="btn sm ghost eq-reset">다시</button></div></div>
        <div class="abs row" style="right:92px;top:46px;width:720px;gap:30px;align-items:center">
          <div class="eq-stamp">AI 생성<small>AI-GENERATED</small></div>
          <div class="stack" style="gap:4px">
            <div><span class="display" style="font-size:36px;font-weight:800">AI 기본법</span> <span class="mono" style="font-size:28px;font-weight:600;margin-left:8px">2026.1.22 시행</span></div>
            <div style="font-size:24px;line-height:1.35;color:var(--ink-2)">생성형 AI 서비스는 AI를 쓴다고 미리 알리고,<br>진짜 같은 결과물엔 ‘AI 생성’ 표시를 해야 한다.</div>
          </div>
        </div>
        <div class="demo eq-list" style="margin-top:8px"></div>
        <div class="hand" style="font-size:42px;margin-top:-6px">기준 세 가지: <span class="mark" style="color:var(--pen)">동의</span> · <span class="mark" style="color:var(--pen)">출처</span> · <span class="mark" style="color:var(--pen)">책임</span></div>
        <div class="src">출처: 인공지능 기본법 (2026.1.22 시행, 아주경제·세계일보·머니투데이) · 미국 저작권청, AI 생성 그림 저작권 등록 거부 (2023.9)</div>`,
      init(el, K) {
        const list = el.querySelector('.eq-list');
        const ell = handEllipse(11), slash = 'M8,44 C30,30 62,16 94,4';
        list.innerHTML = ETHICS.map((s, i) => `
          <div class="eq" data-i="${i}">
            <div class="eq-n">${i + 1}</div>
            <div class="eq-q">${s.q}</div>
            <div class="eq-btns">${CHOICES.map((c, j) => `<button class="btn" data-j="${j}">${c}<svg class="eq-mark" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><path d="${j === s.a ? ell : slash}"/></svg></button>`).join('')}</div>
            <div class="eq-a"><span class="in"><span class="eq-ans">정답: ${CHOICES[s.a]}</span>${s.why}</span></div>
          </div>`).join('');
        const answer = (row, j) => {
          const i = +row.dataset.i, s = ETHICS[i];
          row.classList.add('done');
          row.querySelectorAll('.btn').forEach((b) => {
            const k = +b.dataset.j, m = b.querySelector('.eq-mark');
            b.classList.toggle('on', k === j);
            m.classList.remove('ok', 'no', 'show');
            if (k === s.a) m.classList.add('ok', 'show');
            else if (k === j) m.classList.add('no', 'show');
          });
        };
        list.addEventListener('click', (e) => {
          const b = e.target.closest('.btn[data-j]'); if (!b) return;
          answer(b.closest('.eq'), +b.dataset.j);
        });
        el.querySelector('.eq-all').addEventListener('click', () => list.querySelectorAll('.eq').forEach((r) => answer(r, -1)));
        el.querySelector('.eq-reset').addEventListener('click', () => list.querySelectorAll('.eq').forEach((r) => {
          r.classList.remove('done');
          r.querySelectorAll('.btn').forEach((b) => { b.classList.remove('on'); b.querySelector('.eq-mark').classList.remove('ok', 'no', 'show'); });
        }));
      },
    },
  ]);
})();
