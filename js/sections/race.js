/* 폭발 (2018 → 2026): scale, the ChatGPT moment, the arms race, Nobel 2024,
   reasoning + agents, and the board as of 2026-11-09.
   Facts: research/02-history.md, 03-companies.md, 04-economics.md, 05-jobs.md,
   release dates cross-checked against Epoch AI's model database (2026-11-08). */
(function () {
  'use strict';

  /** decimal year from y/m/d (good enough for drawing timelines) */
  const dec = (y, m, d) => y + (m - 1) / 12 + ((d || 15) - 1) / 365;

  /* ───────────────────────── 1. scaling ───────────────────────── */
  const SC = [
    { name: 'GPT-1', when: '2018.6', v: 1.17e8, label: '1.17억' },
    { name: 'GPT-2', when: '2019.2', v: 1.5e9, label: '15억' },
    { name: 'GPT-3', when: '2020.5', v: 1.75e11, label: '1,750억' },
  ];
  const SC_GEO = { left: 120, right: 930, top: 64, base: 456 };
  const scColX = (i) => SC_GEO.left + ((SC_GEO.right - SC_GEO.left) / 4) * (i + 0.5);
  const SC_TICKS = {
    log: [[1e7, '1천만'], [1e8, '1억'], [1e9, '10억'], [1e10, '100억'], [1e11, '1,000억'], [1e12, '1조']],
    lin: [[0, '0'], [5e10, '500억'], [1e11, '1,000억'], [1.5e11, '1,500억'], [2e11, '2,000억']],
  };
  function scFrac(mode, v) {
    if (mode === 'log') return Kit.clamp((Math.log10(v) - 7) / 5, 0, 1);
    return Kit.clamp(v / 2e11, 0, 1);
  }

  /* ───────────────────────── 2. ChatGPT race ───────────────────────── */
  const RACE = {
    big: {
      max: 30, goal: '1억 명',
      lanes: [
        { n: 'ChatGPT', s: '2022', m: 2, txt: '약 2개월', hi: true },
        { n: 'TikTok', s: '', m: 9, txt: '9개월' },
        { n: 'Instagram', s: '', m: 30, txt: '2.5년' },
        { n: 'Threads*', s: '가입자 기준', m: 5 / 30.44, txt: '5일*', star: true },
      ],
    },
    small: {
      max: 42, goal: '100만 명',
      lanes: [
        { n: 'ChatGPT', s: '2022', m: 5 / 30.44, txt: '5일', hi: true },
        { n: 'Instagram', s: '', m: 2.5, txt: '2.5개월' },
        { n: 'Spotify', s: '', m: 5, txt: '5개월' },
        { n: 'Dropbox', s: '', m: 7, txt: '7개월' },
        { n: 'Netflix', s: '', m: 42, txt: '3.5년' },
      ],
    },
  };
  const RACE_SECONDS = 7;
  function fmtElapsed(m) {
    const days = Math.round(m * 30.44);
    if (days < 58) return days + '일';
    if (m < 24) return Math.floor(m + 0.02) + '개월';
    const y = Math.floor(m / 12), mo = Math.floor(m % 12);
    return y + '년' + (mo ? ' ' + mo + '개월' : '');
  }

  /* ───────────────────────── 3. arms race ───────────────────────── */
  const AR_LANES = ['OpenAI', 'Google', 'Anthropic', 'Meta', 'xAI', 'DeepSeek'];
  const AR_SUB = ['', '', '', '', '머스크', '중국'];
  // [lane, y, m, d, label, kind m=model e=event, label pos u/d, anchor, date text, description]
  const AR = [
    [0, 2022, 11, 30, 'ChatGPT', 'm', 'u', 'middle', '2022.11.30', '출발 총성. 5일 만에 100만 명이 몰렸다.'],
    [0, 2023, 3, 14, 'GPT-4', 'm', 'u', 'middle', '2023.3.14', '모의 변호사시험 상위 10% 수준. 이때부터 모델 크기를 비공개로 돌렸다.'],
    [0, 2023, 11, 17, '이사회 사태', 'e', 'u', 'middle', '2023.11.17', '이사회가 올트먼 CEO를 해임 → 직원 700명 이상이 반발 → 며칠 만에 복귀.'],
    [0, 2024, 5, 13, 'GPT-4o', 'm', 'u', 'middle', '2024.5.13', '글·그림·목소리를 한 모델로 다룬 ‘옴니’. GPT-5 때 뺐다가 반발로 되살렸고, 2026.2 퇴역.'],
    [0, 2024, 9, 12, 'o1', 'm', 'u', 'middle', '2024.9.12', '답하기 전에 ‘생각’하는 추론 모델. 미국 고교 수학경시대회(AIME): GPT-4o 12% → o1 74%.'],
    [0, 2024, 12, 20, 'o3 발표', 'm', 'u', 'middle', '2024.12.20', '퍼즐 테스트 ARC-AGI 75.7%, 계산을 크게 늘리면 87.5%라고 발표.'],
    [1, 2023, 2, 8, 'Bard 시연', 'e', 'u', 'end', '2023.2.8', '광고 속 답 하나가 틀려 알파벳 시가총액 약 1,000억 달러가 증발.'],
    [1, 2023, 4, 20, '딥마인드 합병', 'e', 'u', 'start', '2023.4', '라이벌이던 Google Brain과 DeepMind를 합침. CEO는 허사비스.'],
    [1, 2023, 12, 6, 'Gemini 1.0', 'm', 'u', 'end', '2023.12.6', '구글의 반격. 챗봇 이름도 결국 Bard에서 Gemini로 바뀐다.'],
    [1, 2024, 2, 15, 'Gemini 1.5', 'm', 'u', 'start', '2024.2.15', 'Gemini 1.0 공개 두 달여 만에 다음 버전.'],
    [2, 2023, 3, 14, 'Claude', 'm', 'u', 'right', '2023.3.14', 'GPT-4와 같은 날 나온 Anthropic의 첫 Claude.'],
    [2, 2023, 7, 11, 'Claude 2', 'm', 'u', 'middle', '2023.7.11', 'claude.ai 웹사이트로 일반 사용자에게 공개.'],
    [2, 2024, 3, 4, 'Claude 3', 'm', 'u', 'middle', '2024.3.4', 'Haiku · Sonnet · Opus 3단 구성. 가장 큰 모델이 Opus.'],
    [2, 2024, 6, 20, 'Claude 3.5', 'm', 'u', 'middle', '2024.6.20', 'Claude 3 석 달 반 만에 다음 세대(3.5 Sonnet).'],
    [3, 2023, 2, 24, 'LLaMA', 'm', 'u', 'middle', '2023.2.24', '연구자에게만 나눠 줬는데 1주일 만에 가중치가 인터넷에 유출.'],
    [3, 2023, 7, 18, 'Llama 2', 'm', 'u', 'middle', '2023.7.18', '상업적 이용 허용 → 누구나 내려받아 고쳐 쓰는 ‘오픈 웨이트’ 시대.'],
    [3, 2024, 4, 18, 'Llama 3', 'm', 'u', 'middle', '2024.4.18', '80억 · 700억 파라미터 버전을 공개.'],
    [3, 2024, 7, 23, 'Llama 3.1', 'm', 'u', 'middle', '2024.7.23', '4,050억 파라미터 모델까지 가중치째 공개.'],
    [4, 2023, 7, 12, 'xAI 출범', 'e', 'u', 'middle', '2023.7.12', '머스크가 연구자 11명과 세운 AI 회사를 공개(3월 설립).'],
    [4, 2023, 11, 4, 'Grok', 'm', 'u', 'middle', '2023.11.4', 'X(옛 트위터)에 들어간 챗봇. Grok-1은 3,140억 파라미터.'],
    [4, 2024, 8, 13, 'Grok-2', 'm', 'u', 'middle', '2024.8.13', '같은 해 멤피스에 GPU 약 10만 개짜리 ‘Colossus’를 122일 만에 구축.'],
    [5, 2024, 12, 26, 'DeepSeek-V3', 'm', 'u', 'end', '2024.12', '6,710억 파라미터 오픈 모델, 최종 학습비 약 558만 달러 → 한 달 뒤 R1 충격.'],
  ];
  const AR_T0 = dec(2022, 11, 1), AR_T1 = dec(2025, 1, 20);
  const AR_X0 = 214, AR_X1 = 1400;
  const arX = (t) => AR_X0 + ((t - AR_T0) / (AR_T1 - AR_T0)) * (AR_X1 - AR_X0);
  const arY = (lane) => 72 + lane * 66;

  /* ───────────────────────── 5. METR time horizon ───────────────────────── */
  const MT = [
    { n: 'GPT-4', t: dec(2023, 3, 14), m: 3.5, lab: 'GPT-4 · 3.5분', dx: 14, dy: 30, a: 'start' },
    { n: 'Claude 3.7 Sonnet', t: dec(2025, 2, 24), m: 60, lab: 'Claude 3.7 Sonnet · 1시간', dx: -14, dy: -12, a: 'end' },
    { n: 'GPT-5', t: dec(2025, 8, 7), m: 214, lab: 'GPT-5 · 3.6시간', dx: -14, dy: -8, a: 'end' },
    // Opus 4.5 sits right next to GPT-5, so its label goes to the RIGHT (two lines, short leader)
    { n: 'Claude Opus 4.5', t: dec(2025, 11, 24), m: 320, lab: 'Opus 4.5', lab2: '5.3시간', dx: 22, dy: -1, a: 'start' },
  ];
  const MT_MYTHOS = { t: dec(2026, 3, 15), m: 960 };
  const MG = { w: 718, h: 404, l: 96, r: 22, t: 34, b: 74, x0: 2023, x1: 2026.5, ymax: 1440 };
  const mtX = (t) => MG.l + ((t - MG.x0) / (MG.x1 - MG.x0)) * (MG.w - MG.l - MG.r);
  const mtY = (m) => MG.t + (1 - Math.log(m) / Math.log(MG.ymax)) * (MG.h - MG.t - MG.b);
  function fmtMin(m) {
    if (m < 59.5) return Math.round(m) + '분';
    const h = m / 60;
    if (h < 10) return (Math.round(h * 2) / 2).toString().replace(/\.0$/, '') + '시간';
    return Math.round(h) + '시간';
  }
  function mtWhen(m) {
    if (m <= 3.5) return { at: null, txt: '2023년 GPT-4 때 이미' };
    if (m > MT_MYTHOS.m) return { at: null, txt: '아직 잴 수 없음 (METR 과제로 재는 한계 너머)' };
    // range: mark it at its start (the Opus 4.5 date); further right the marker would sit under the 'Opus 4.5' label
    if (m > 320) return { at: MT[MT.length - 1].t, txt: '2025.11 ~ 2026.3 사이', range: true };
    for (let i = 0; i < MT.length - 1; i++) {
      const a = MT[i], b = MT[i + 1];
      if (m <= b.m) {
        const k = Math.log(m / a.m) / Math.log(b.m / a.m);
        const t = a.t + k * (b.t - a.t);
        const y = Math.floor(t), mo = Math.min(12, Math.floor((t - y) * 12) + 1);
        return { at: t, txt: `약 ${y}년 ${mo}월` };
      }
    }
    return { at: null, txt: '' };
  }

  Deck.part('race', 1, [
    /* ═════════════════════ 1. 더 크게 ═════════════════════ */
    {
      id: 'scaling',
      title: '더 크게 만들면, 더 똑똑해진다?',
      year: '2018–2020', tag: '더 크게',
      minutes: 1,
      notes: '2018년 GPT-1은 1.17억 개의 숫자(파라미터)로 시작했습니다. 1년 뒤 GPT-2는 15억, 다시 1년 뒤 GPT-3는 1,750억. 2년 만에 약 1,500배입니다. 2020년 1월 캐플런(나중에 Anthropic 공동창업자) 등이 “모델·데이터·계산을 키우면 성능이 예측 가능하게 좋아진다”는 스케일링 법칙을 내놓았고, 그 뒤로 회사들은 크기 경쟁에 돈을 걸었습니다. 1교시 끝의 Q2 메모 ‘왜 하필 지금?’의 물음표가 여기서 채워집니다: 키우면 예측대로 좋아진다는 걸 알자 돈이 몰렸습니다. 재료(데이터) + 엔진(GPU·트랜스포머) + 돈.\n→ 키를 누를 때마다 막대가 하나씩 자랍니다. GPT-2의 ‘공개 보류’ 도장: 2019년 2월 OpenAI는 악용 우려로 전체 모델 공개를 미뤘다가 그해 11월에 전부 공개했습니다. 마지막 물음표는 2023년 GPT-4부터 큰 회사들이 모델 크기를 아예 숨기기 시작했다는 뜻입니다.\n아래 [보통] 버튼을 누르면 GPT-1·2가 바닥에 붙어 안 보입니다. 그래서 한 칸이 10배인 ‘로그 눈금’을 씁니다.\n질문: “계속 키우면 무조건 좋아질까? 데이터, 전기, 돈 중 무엇이 먼저 바닥날까?”',
      html: `
        <style>
          #f-scaling .sc-demo { position:absolute; }
          #f-scaling .sc-gl { position:absolute; left:${SC_GEO.left}px; right:0; height:0; border-top:2px dashed var(--grid-line); transition: top .6s ease; }
          #f-scaling .sc-gl span { position:absolute; right:calc(100% + 14px); top:-15px; font-family:var(--font-mono); font-size:22px; color:var(--ink-2); white-space:nowrap; }
          #f-scaling .sc-base { position:absolute; left:${SC_GEO.left - 8}px; right:0; top:${SC_GEO.base}px; height:3px; background:var(--ink); border-radius:2px; transform:rotate(-.2deg); }
          #f-scaling .sc-col { position:absolute; top:${SC_GEO.top}px; height:${SC_GEO.base - SC_GEO.top}px; width:120px; }
          #f-scaling .sc-bar { position:absolute; left:0; right:0; bottom:0; height:0; min-height:2px; background:var(--ink); transition:height .9s cubic-bezier(.2,.8,.2,1); }
          #f-scaling .sc-col.hi .sc-bar { background:var(--hl); box-shadow: inset 0 0 0 3px var(--ink); }
          #f-scaling.current .sc-col.pending .sc-bar { height:0 !important; }
          #f-scaling .sc-val { position:absolute; left:-40px; right:-40px; bottom:calc(100% + 8px); text-align:center; font-family:var(--font-mono); font-weight:600; font-size:32px; white-space:nowrap; }
          #f-scaling .sc-name { position:absolute; left:-30px; right:-30px; top:calc(100% + 12px); text-align:center; font-family:var(--font-display); font-weight:800; font-size:32px; line-height:1; }
          #f-scaling .sc-when { position:absolute; left:-40px; right:-40px; top:calc(100% + 52px); text-align:center; font-family:var(--font-mono); font-size:21px; color:var(--ink-2); white-space:nowrap; }
          #f-scaling .sc-stamp { position:absolute; left:50%; bottom:calc(100% + 58px); transform:translateX(-50%) rotate(-7deg); border:3px solid var(--bad); color:var(--bad); padding:4px 12px 6px; border-radius:4px; text-align:center; white-space:nowrap; background:var(--paper); }
          #f-scaling .sc-stamp b { display:block; font-family:var(--font-display); font-weight:800; font-size:28px; line-height:1.1; }
          #f-scaling .sc-stamp small { font-family:var(--font-mono); font-size:20px; }
          #f-scaling .sc-q { position:absolute; top:${SC_GEO.top}px; height:${SC_GEO.base - SC_GEO.top}px; width:120px; border:3px dashed var(--ink-3); border-bottom:0; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:120px; color:var(--ink-3); }
          #f-scaling .sc-q .sc-name, #f-scaling .sc-q .sc-when { color:var(--ink); }
          #f-scaling .sc-q .sc-when { color:var(--ink-2); font-weight:400; }
          #f-scaling .sc-note { position:absolute; transition:opacity .4s; white-space:nowrap; }
          #f-scaling .sc-demo[data-mode="log"] .sc-note.lin, #f-scaling .sc-demo[data-mode="lin"] .sc-note.log { opacity:0; }
          #f-scaling .sc-toggle { position:absolute; left:0; bottom:0; align-items:center; }
          #f-scaling .sc-side p { font-size:29px; line-height:1.35; margin:22px 0 18px; }
          #f-scaling .sc-side .stat b { font-size:80px; }
          #f-scaling .sc-law .ax { stroke-width:2.5; }
          #f-scaling .sc-law text { font-size:20px; }
        </style>
        <div class="kicker">2018 → 2020 · GPT-1, 2, 3</div>
        <h2 class="title">더 크게 만들면, 더 똑똑해진다?</h2>
        <div class="demo sc-demo" data-mode="log" style="left:92px;top:232px;width:930px;height:600px">
          <div class="sc-grid"></div>
          <div class="sc-base"></div>
          ${SC.map((c, i) => `
            <div class="sc-col${i === 2 ? ' hi' : ''}" data-i="${i}" ${i ? `data-step="${i}"` : ''} style="left:${scColX(i) - 60}px">
              <div class="sc-bar">
                <div class="sc-val">${c.label}</div>
                ${i === 1 ? '<div class="sc-stamp"><b>공개 보류</b><small>악용 우려 · 2019.2</small></div>' : ''}
              </div>
              <div class="sc-name">${c.name}</div>
              <div class="sc-when">${c.when}</div>
            </div>`).join('')}
          <div class="sc-q" data-step="3" style="left:${scColX(3) - 60}px">?
            <div class="sc-name">GPT-4</div>
            <div class="sc-when">2023.3 · 비공개</div>
          </div>
          <div class="sc-note log hand" data-step="2" style="left:150px;top:78px;font-size:42px">2년 만에 약 1,500배 →</div>
          <div class="sc-note lin hand" style="left:150px;top:150px;font-size:40px">보통 눈금이면 GPT-1·2는<br>바닥에 붙어 안 보여요 ↓</div>
          <div class="sc-toggle btns">
            <span class="mono tiny muted" style="margin-right:4px">눈금</span>
            <button class="btn sm on" data-m="log">로그 (한 칸 = 10배)</button>
            <button class="btn sm" data-m="lin">보통</button>
          </div>
        </div>
        <div class="abs sc-side" data-step="2" style="left:1066px;top:230px;width:446px">
          <div class="row" style="gap:20px;align-items:flex-start">
            ${Kit.photo('jared-kaplan', '재러드 캐플런', 'sm tilt-r', '--w:170px')}
            <div class="stack" style="gap:4px;padding-top:2px">
              <div class="subtitle">스케일링 법칙</div>
              <div class="mono tiny muted">2020.1 · 캐플런 외</div>
              <svg class="chart sc-law" viewBox="0 0 240 176" width="240" height="176" aria-label="스케일링 법칙 개념도"></svg>
            </div>
          </div>
          <p>모델 · 데이터 · 계산을 키우면<br>성능이 <span class="mark">예측한 대로</span> 좋아진다</p>
          <div class="stat"><b>연 4–5배</b><span>2010년 이후 AI 학습에 쓰는 계산량이 해마다 커진 속도</span></div>
        </div>
        <div class="src">출처: OpenAI(GPT-1 2018, GPT-2 2019·단계적 공개), Brown 외 2020(GPT-3), Kaplan 외 2020 「Scaling Laws for Neural Language Models」, Epoch AI(학습 계산량 연 4–5배), OpenAI GPT-4 기술 보고서 2023(크기 비공개) · 오른쪽 작은 그래프는 개념도</div>`,
      init(el, K, f) {
        const demo = el.querySelector('.sc-demo');
        const grid = demo.querySelector('.sc-grid');
        const cols = Array.from(demo.querySelectorAll('.sc-col'));
        const H = SC_GEO.base - SC_GEO.top;
        const render = (mode) => {
          demo.dataset.mode = mode;
          grid.innerHTML = SC_TICKS[mode].map(([v, lab]) =>
            `<div class="sc-gl" style="top:${(SC_GEO.base - (v ? scFrac(mode, v) : 0) * H).toFixed(1)}px"><span>${lab}</span></div>`).join('');
          cols.forEach((c, i) => { c.querySelector('.sc-bar').style.height = (scFrac(mode, SC[i].v) * H).toFixed(1) + 'px'; });
          demo.querySelectorAll('.sc-toggle .btn').forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
        };
        render('log');
        demo.querySelector('.sc-toggle').addEventListener('click', (e) => {
          const b = e.target.closest('[data-m]'); if (b) render(b.dataset.m);
        });
        f._render = render;

        // scaling-law sketch: error falls on a straight line when both axes are logarithmic
        const svg = el.querySelector('.sc-law');
        K.svg('path', { class: 'ax', d: 'M24,8 V146 H234' }, svg);
        const rnd = K.rand(11);
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const x = 44 + i * 26, y = 44 + i * 13 + (rnd() - 0.5) * 7;
          pts.push([x, y]);
        }
        K.svg('path', { class: 'ln pen', d: K.sketchPath([[36, 38], [230, 138]], { wobble: 2, seed: 4 }), 'stroke-dasharray': '2 9', 'stroke-width': 3 }, svg);
        pts.forEach(([x, y]) => K.svg('circle', { class: 'dot', cx: x, cy: y, r: 6 }, svg));
        const t1 = K.svg('text', { x: 30, y: 4, 'dominant-baseline': 'hanging' }, svg); t1.textContent = '틀리는 정도';
        const t2 = K.svg('text', { x: 236, y: 172, 'text-anchor': 'end' }, svg); t2.textContent = '크기·데이터·계산 →';
      },
      leave(el, K, f) { if (f._render) f._render('log'); },
    },

    /* ═════════════════════ 2. ChatGPT moment ═════════════════════ */
    {
      id: 'chatgpt-moment',
      title: 'ChatGPT, 그때까지 가장 빨리 퍼진 앱',
      year: '2022', tag: '1억 명',
      minutes: 1,
      notes: '2022년 11월 30일, OpenAI가 ChatGPT를 ‘연구 미리보기’로 무료 공개했습니다. 5일 만에 100만 명, 약 두 달 만에 월 1억 명. 그때까지 역사상 가장 빠른 소비자 앱이었습니다. 구글 경영진은 ‘코드 레드’(비상사태)를 선언했습니다. 검색 사업이 위험하다고 본 거죠.\n프레임에 들어오면 경주가 자동으로 한 번 달립니다. [다시 달리기]로 반복, [100만 명까지]를 누르면 넷플릭스(3.5년)·드롭박스·스포티파이와 겨룹니다. 맨 아래 Threads는 인스타그램 계정으로 바로 가입하는 구조라 ‘가입자’ 기준이어서 별표를 달았습니다. → 키 한 번: 구글 ‘코드 레드’ 도장이 찍힙니다. 피차이 사진을 가리키며 검색 사업 비상을 말합니다.\n질문: “ChatGPT를 처음 써 본 게 언제였나요? 왜 이렇게 빨리 퍼졌을까요?”',
      html: `
        <style>
          #f-chatgpt-moment .cm-head { display:flex; align-items:center; gap:14px; height:58px; }
          #f-chatgpt-moment .cm-clock { margin-left:auto; display:flex; align-items:baseline; gap:12px; font-family:var(--font-mono); font-size:22px; color:var(--ink-2); }
          #f-chatgpt-moment .cm-clock b { font-size:40px; color:var(--ink); min-width:6.4em; text-align:left; font-variant-numeric:tabular-nums; }
          #f-chatgpt-moment .cm-lanes { margin-top:8px; }
          #f-chatgpt-moment .cm-lane { display:grid; grid-template-columns:230px 1fr 210px; align-items:center; height:62px; }
          #f-chatgpt-moment .cm-name { display:flex; flex-direction:column; line-height:1.05; }
          #f-chatgpt-moment .cm-name b { font-family:var(--font-display); font-weight:800; font-size:31px; }
          #f-chatgpt-moment .cm-name small { font-family:var(--font-mono); font-size:20px; color:var(--ink-2); }
          #f-chatgpt-moment .cm-track { position:relative; height:100%; border-right:4px dashed var(--ink); }
          #f-chatgpt-moment .cm-track::before { content:""; position:absolute; left:0; right:0; top:50%; border-top:2px dotted var(--ink-3); }
          #f-chatgpt-moment .cm-bar { position:absolute; left:0; top:calc(50% - 15px); height:30px; width:0; background:var(--ink); }
          #f-chatgpt-moment .cm-lane.hi .cm-bar { background:var(--hl); box-shadow: inset 0 0 0 3px var(--ink); }
          #f-chatgpt-moment .cm-lane.star .cm-bar { background:transparent; border:3px dashed var(--ink-3); }
          #f-chatgpt-moment .cm-lane.star .cm-name b { color:var(--ink-2); }
          #f-chatgpt-moment .cm-res { padding-left:22px; font-family:var(--font-mono); font-size:28px; font-weight:600; white-space:nowrap; transition:opacity .3s; }
          #f-chatgpt-moment .cm-res i { font-style:normal; color:var(--pen); font-size:22px; margin-right:8px; }
          #f-chatgpt-moment .cm-lane.star .cm-res { color:var(--ink-2); }
          #f-chatgpt-moment .cm-stamp { position:absolute; transform:rotate(-9deg); border:5px solid var(--bad); color:var(--bad); padding:6px 18px 10px; border-radius:6px; background:var(--paper); text-align:center; box-shadow: 0 0 0 3px var(--paper); }
          #f-chatgpt-moment .cm-stamp b { display:block; font-family:var(--font-display); font-weight:800; font-size:58px; line-height:1.05; letter-spacing:.04em; }
          #f-chatgpt-moment .cm-stamp span { font-family:var(--font-mono); font-size:21px; }
          #f-chatgpt-moment .stat b { font-size:96px; }
          #f-chatgpt-moment .stat span { font-size:24px; }
        </style>
        <div class="kicker">2022.11.30 · OpenAI, ChatGPT 무료 공개</div>
        <h2 class="title">그때까지 가장 빨리 퍼진 앱</h2>
        <div class="row" style="gap:70px;margin-top:4px">
          <div class="stat"><b>5일</b><span>100만 명까지</span></div>
          <div class="stat"><b>약 2개월</b><span>1억 명까지 (월간 사용자, UBS 추정)</span></div>
        </div>
        <div class="abs" style="left:1300px;top:44px">${Kit.photo('sundar-pichai', '순다르 피차이 <small>구글</small>', 'sm tilt-r', '--w:200px')}</div>
        <div class="cm-stamp" data-step="1" style="left:814px;top:270px">
          <b>코드 레드</b>
          <span>구글 경영진 · 2022.12 · 검색 사업 비상</span>
        </div>
        <div class="demo cm-race" style="position:absolute;left:92px;right:92px;top:452px">
          <div class="cm-head">
            <button class="chip on" data-r="big">1억 명까지</button>
            <button class="chip" data-r="small">100만 명까지</button>
            <button class="btn sm cm-go" style="margin-left:10px">다시 달리기</button>
            <div class="cm-clock"><span>경과</span><b class="cm-t">0일</b><span class="cm-goal">결승선 = 1억 명</span></div>
          </div>
          <div class="cm-lanes"></div>
        </div>
        <div class="src">출처: OpenAI(2022.11.30), UBS 분석(2023.2, 1억 명 = 월간 사용자 추정), Statista(100만 명 도달 시간), Threads는 Wikipedia(가입자 기준·인스타그램 계정 연동), NYT 2022.12.21(구글 ‘코드 레드’)</div>`,
      init(el, K, f) {
        const host = el.querySelector('.cm-lanes');
        const clock = el.querySelector('.cm-t');
        const goal = el.querySelector('.cm-goal');
        const st = { key: 'big', t: RACE_SECONDS, running: false };
        // per lane: bar and result elements plus what was last written to them. draw() runs every
        // frame of the race; rewriting an unchanged result's innerHTML replaced its nodes (relayout + repaint).
        let rows = [];
        const build = () => {
          const R = RACE[st.key];
          host.innerHTML = R.lanes.map((l) => `
            <div class="cm-lane${l.hi ? ' hi' : ''}${l.star ? ' star' : ''}">
              <div class="cm-name"><b>${l.n}</b>${l.s ? `<small>${l.s}</small>` : ''}</div>
              <div class="cm-track"><i class="cm-bar"></i></div>
              <div class="cm-res"></div>
            </div>`).join('');
          rows = Array.from(host.children, (row) => ({ bar: row.querySelector('.cm-bar'), res: row.querySelector('.cm-res'), w: null, done: null }));
          goal.textContent = '결승선 = ' + R.goal;
          el.querySelectorAll('[data-r]').forEach((c) => c.classList.toggle('on', c.dataset.r === st.key));
          // finishing order (starred lanes are counted differently, so they get no rank)
          const order = R.lanes.filter((l) => !l.star).slice().sort((a, b) => a.m - b.m);
          R.lanes.forEach((l) => { l.rank = l.star ? 0 : order.indexOf(l) + 1; });
        };
        let clockTxt = null;
        const draw = () => {
          const R = RACE[st.key];
          const months = (R.max * st.t) / RACE_SECONDS;
          const ct = fmtElapsed(Math.min(months, R.max));
          if (ct !== clockTxt) { clockTxt = ct; clock.textContent = ct; }
          R.lanes.forEach((l, i) => {
            const p = Math.min(1, months / l.m);
            const row = rows[i];
            const w = (p * 100).toFixed(2) + '%';
            if (w !== row.w) { row.w = w; row.bar.style.width = w; }
            const done = p >= 1;
            if (done === row.done) return;
            row.done = done;
            row.res.style.opacity = done ? 1 : 0;
            row.res.innerHTML = done ? (l.rank ? `<i>${l.rank}위</i>` : '<i>기준 다름</i>') + l.txt : '';
          });
        };
        const run = () => { st.t = 0; st.running = true; draw(); };
        const finish = () => { st.t = RACE_SECONDS; st.running = false; draw(); };
        build(); finish();
        el.querySelector('.cm-race').addEventListener('click', (e) => {
          const c = e.target.closest('[data-r]');
          if (c) { st.key = c.dataset.r; build(); run(); return; }
          if (e.target.closest('.cm-go')) run();
        });
        K.loop(el, (t, dt) => {
          if (!st.running) return;
          st.t = Math.min(RACE_SECONDS, st.t + dt);
          draw();
          if (st.t >= RACE_SECONDS) st.running = false;
        });
        f._run = run; f._finish = finish;
      },
      enter(el, K, f) { if (f._run) f._run(); },
      leave(el, K, f) { if (f._finish) f._finish(); },
    },

    /* ═════════════════════ 3. arms race ═════════════════════ */
    {
      id: 'arms-race',
      optional: true,
      title: '군비 경쟁: 모두가 뛰어들었다',
      year: '2023–2024', tag: '군비 경쟁',
      minutes: 1,
      notes: 'ChatGPT라는 출발 총성 이후 2년 동안 빅테크가 전부 뛰어들었습니다. 2023년 3월 14일에는 GPT-4와 Anthropic의 첫 Claude가 같은 날 나왔고, 구글은 Bard 시연 오답으로 망신당한 뒤 Gemini로 반격했고, Meta는 가중치를 통째로 공개하는 ‘오픈’ 전략으로 판을 흔들었습니다. 2024년 말에는 중국 DeepSeek가 아주 싼 비용으로 큰 모델을 내놓으며 뒤의 ‘생각하는 AI’ 장면(R1 충격)을 예고합니다.\n점을 클릭하면 아래에 한 줄 설명이 나옵니다. 추천 순서: GPT-4 → Claude(같은 날) → LLaMA → 이사회 사태 → o1 → DeepSeek-V3 (Bard 오답은 환각 장에서 봤습니다). 속이 빈 마름모는 모델이 아닌 ‘사건’입니다.\n질문: “레인 하나만 응원한다면 어느 회사? 왜?”',
      html: `
        <style>
          #f-arms-race .ar-svg { position:absolute; left:92px; top:212px; overflow:visible; }
          #f-arms-race .ar-svg text { font-family:var(--font-mono); fill:var(--ink-2); font-size:20px; }
          #f-arms-race .ar-svg .lane-name { font-family:var(--font-display); font-weight:800; font-size:30px; fill:var(--ink); }
          #f-arms-race .ar-svg .lane-sub { font-family:var(--font-mono); font-size:20px; fill:var(--ink-2); }
          #f-arms-race .ar-svg .yr { font-weight:600; font-size:24px; fill:var(--ink); }
          #f-arms-race .ar-svg .lane { stroke:var(--ink-3); stroke-width:2.5; fill:none; }
          #f-arms-race .ar-svg .yl { stroke:var(--ink-3); stroke-width:1.5; stroke-dasharray:3 7; }
          #f-arms-race .ar-svg .start { stroke:var(--pen); stroke-width:3; stroke-dasharray:10 8; }
          #f-arms-race .ar-svg .same { fill:var(--hl-soft); }
          #f-arms-race .ar-svg .hnd { font-family:var(--font-hand); font-size:36px; fill:var(--pen); }
          #f-arms-race .ar-svg .it { cursor:pointer; }
          #f-arms-race .ar-svg .it:focus { outline:none; }
          #f-arms-race .ar-svg .it:focus-visible .mk { stroke:var(--pen); stroke-width:5; }
          #f-arms-race .ar-svg .it .hit { fill:transparent; }
          /* paper halo: the dotted year lines (2023, 2025) run through 'Bard 시연', 'o3 발표', 'DeepSeek-V3' */
          #f-arms-race .ar-svg .it text { paint-order:stroke; stroke:var(--paper); stroke-width:6px; stroke-linejoin:round; }
          #f-arms-race .ar-svg .it .mk { fill:var(--ink); stroke:var(--ink); stroke-width:3; transition: r .2s; }
          #f-arms-race .ar-svg .it.ev .mk { fill:var(--paper); }
          #f-arms-race .ar-svg .it:hover .mk { fill:var(--hl-soft); }
          #f-arms-race .ar-svg .it.on .mk { fill:var(--hl); stroke-width:4; }
          #f-arms-race .ar-svg .it.on text { fill:var(--ink); font-weight:600; }
          #f-arms-race .ar-info { position:absolute; left:92px; right:92px; top:682px; display:grid; grid-template-columns:250px 1fr; gap:28px; align-items:start; border-top:3px solid var(--ink); padding-top:20px; }
          #f-arms-race .ar-date { font-family:var(--font-mono); font-weight:600; font-size:34px; color:var(--pen); }
          #f-arms-race .ar-name { font-family:var(--font-display); font-weight:800; font-size:40px; line-height:1.1; }
          #f-arms-race .ar-name small { font-family:var(--font-mono); font-weight:400; font-size:22px; color:var(--ink-2); margin-left:12px; }
          #f-arms-race .ar-desc { font-size:30px; margin-top:6px; word-break:keep-all; }
        </style>
        <div class="kicker">2023 → 2024 · 출시 경쟁</div>
        <h2 class="title">군비 경쟁: 모두가 뛰어들었다</h2>
        <div class="abs hand" style="right:96px;top:84px;font-size:40px;transform:rotate(-2deg)">점을 눌러 보세요 ↓</div>
        <div class="abs mono tiny muted" style="right:96px;top:140px">● 모델 출시 &nbsp; ◇ 사건</div>
        <svg class="demo ar-svg" width="1416" height="470" viewBox="0 0 1416 470" aria-label="회사별 모델 출시 타임라인"></svg>
        <div class="ar-info demo" aria-live="polite">
          <div class="ar-date"></div>
          <div><div class="ar-name"></div><div class="ar-desc"></div></div>
        </div>
        <div class="src">출처: 출시일은 Epoch AI 주요 모델 DB(2026.11.8 갱신)와 각 회사 발표, GPT-4 기술 보고서, Wikipedia(LLaMA 유출·Bard 오답·OpenAI 이사회 사태·Colossus), DeepSeek-V3 논문(학습비), OpenAI(o1), ARC Prize(o3)</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.ar-svg');
        const g0 = K.svg('g', {}, svg);
        // years
        [2023, 2024, 2025].forEach((y) => {
          const x = arX(y);
          // the svg sits 12px lower than the title's line box so the year labels never touch the title;
          // the tick lines stop above the start-gun note, which moved up by the same amount
          K.svg('line', { class: 'yl', x1: x, y1: 34, x2: x, y2: arY(5) + 20 }, g0);
          const t = K.svg('text', { class: 'yr', x: x + 8, y: 22 }, g0); t.textContent = y;
        });
        // start gun
        const xs = arX(dec(2022, 11, 30));
        K.svg('line', { class: 'start', x1: xs, y1: arY(0) + 14, x2: xs, y2: arY(5) + 22 }, g0);
        const ts = K.svg('text', { class: 'hnd', x: xs + 10, y: arY(5) + 52 }, g0); ts.textContent = '↑ 출발 총성';
        // same day band (GPT-4 & Claude, 2023-03-14)
        const xd = arX(dec(2023, 3, 14));
        K.svg('rect', { class: 'same', x: xd - 9, y: arY(0) - 4, width: 18, height: arY(2) - arY(0) + 8, rx: 6 }, g0);
        const td = K.svg('text', { class: 'hnd', x: xd + 46, y: arY(0) - 18 }, g0); td.textContent = '← 같은 날!';
        // lanes
        AR_LANES.forEach((name, i) => {
          const y = arY(i);
          K.svg('path', { class: 'lane', d: K.sketchPath([[AR_X0 - 14, y], [(AR_X0 + AR_X1) / 2, y + 1.5], [AR_X1 + 10, y]], { wobble: 2.5, seed: 30 + i }) }, g0);
          const t = K.svg('text', { class: 'lane-name', x: 0, y: y + (AR_SUB[i] ? 2 : 10) }, g0); t.textContent = name;
          if (AR_SUB[i]) { const s = K.svg('text', { class: 'lane-sub', x: 0, y: y + 26 }, g0); s.textContent = AR_SUB[i]; }
        });
        // items
        const info = { date: el.querySelector('.ar-date'), name: el.querySelector('.ar-name'), desc: el.querySelector('.ar-desc') };
        const nodes = AR.map((a, idx) => {
          const [lane, y, m, d, label, kind, pos, anchor] = a;
          const x = arX(dec(y, m, d)), cy = arY(lane);
          const g = K.svg('g', { class: 'it' + (kind === 'e' ? ' ev' : ''), 'data-i': idx, tabindex: 0, role: 'button', 'aria-label': label }, svg);
          K.svg('circle', { class: 'hit', cx: x, cy, r: 26 }, g);
          if (kind === 'e') K.svg('rect', { class: 'mk', x: x - 10, y: cy - 10, width: 20, height: 20, transform: `rotate(45 ${x} ${cy})` }, g);
          else K.svg('circle', { class: 'mk', cx: x, cy, r: 11 }, g);
          const tx = anchor === 'end' ? x + 14 : anchor === 'start' ? x - 14 : anchor === 'right' ? x + 20 : x;
          const t = K.svg('text', { x: tx, y: pos === 'u' ? cy - 22 : cy + 37, 'text-anchor': anchor === 'right' ? 'start' : anchor }, g);
          t.textContent = label;
          return g;
        });
        const select = (i) => {
          nodes.forEach((n, j) => n.classList.toggle('on', j === i));
          const a = AR[i];
          info.date.textContent = a[8];
          info.name.innerHTML = `${K.escape(a[4])}<small>${AR_LANES[a[0]]}</small>`;
          info.desc.textContent = a[9];
          f._sel = i;
        };
        svg.addEventListener('click', (e) => { const g = e.target.closest('.it'); if (g) select(+g.dataset.i); });
        svg.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const g = e.target.closest('.it'); if (g) select(+g.dataset.i); } });
        f._select = select;
        select(1); // GPT-4
      },
      leave(el, K, f) { if (f._select) f._select(1); },
    },

    /* ═════════════════════ 4. Nobel 2024 (optional) ═════════════════════ */
    {
      id: 'nobel-2024',
      title: 'AI가 노벨상을 받은 해',
      year: '2024', tag: '노벨상',
      optional: true,
      minutes: 0.5,
      notes: '2024년 노벨 물리학상은 인공신경망의 기초를 놓은 홉필드와 힌턴, 다음 날 화학상은 AlphaFold로 단백질 구조를 예측한 허사비스·점퍼와 단백질을 설계한 베이커가 받았습니다. AI 연구가 이틀 연속 과학의 최고상을 받은 셈입니다. 힌턴은 수상 전화를 받고 “정말 어안이 벙벙하다”고 했습니다.\n아래 칸 하나가 단백질 구조 100만 개입니다. 프레임에 들어오면 한 칸(확장 전)에서 200칸(2022년 7월 확장 후, 2억 개 이상)으로 채워집니다.\n질문: “AI로 큰 발견을 했다면 상은 누가 받아야 할까요? 만든 사람, AI, 아니면 그걸 써서 발견한 과학자?”',
      html: `
        <style>
          #f-nobel-2024 .nb-head { display:flex; align-items:baseline; gap:16px; }
          #f-nobel-2024 .nb-head .mono { font-size:26px; color:var(--pen); font-weight:600; }
          #f-nobel-2024 .nb-head .subtitle { font-size:40px; }
          #f-nobel-2024 .nb-why { font-size:27px; line-height:1.35; color:var(--ink); }
          #f-nobel-2024 .nb-photos { display:flex; gap:26px; align-items:flex-start; margin:30px 0 22px 10px; }
          #f-nobel-2024 .nb-init { width:150px; display:flex; flex-direction:column; align-items:center; gap:4px; margin-top:34px; }
          #f-nobel-2024 .nb-init svg circle { fill:none; stroke:var(--ink); stroke-width:3.5; }
          /* initials are HTML, not SVG <text>: SVG text first laid out while the canvas is zoomed far out
             can stay invisible when the web font never arrives (offline classroom PC) */
          #f-nobel-2024 .nb-ring { position:relative; width:120px; height:120px; }
          #f-nobel-2024 .nb-ring svg { position:absolute; left:0; top:0; }
          #f-nobel-2024 .nb-ring b { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding-top:4px; font-family:var(--font-display); font-weight:800; font-size:48px; line-height:1; color:var(--ink); }
          #f-nobel-2024 .nb-init span { font-family:var(--font-hand); font-size:32px; color:var(--ink); white-space:nowrap; }
          #f-nobel-2024 .nb-div { position:absolute; left:772px; top:228px; width:3px; height:410px; background:var(--ink-3); border-radius:2px; transform:rotate(.6deg); }
          #f-nobel-2024 .nb-grid rect { fill:none; stroke:var(--ink-3); stroke-width:1.5; }
          #f-nobel-2024 .nb-grid rect.on { fill:var(--ink); stroke:var(--ink); }
          #f-nobel-2024 .nb-grid rect.first { fill:var(--pen); stroke:var(--pen); }
          #f-nobel-2024 .nb-count b { font-family:var(--font-mono); font-weight:600; font-size:72px; line-height:1; font-variant-numeric:tabular-nums; }
        </style>
        <div class="kicker">2024.10.8 – 10.9 · 스톡홀름</div>
        <h2 class="title">AI가 노벨상을 받은 해</h2>
        <div class="abs" style="left:92px;top:228px;width:650px">
          <div class="nb-head"><span class="mono">10.8</span><span class="subtitle">물리학상</span></div>
          <div class="nb-photos">
            ${Kit.photo('hopfield', '존 홉필드', 'sm', '--w:186px;--tilt:-3deg')}
            ${Kit.photo('hinton', '제프리 힌턴', 'sm tilt-r', '--w:186px')}
            <div class="hand" style="font-size:38px;align-self:center;transform:rotate(-4deg);margin-left:4px">“정말<br>어안이<br>벙벙하다”<br><span class="mono tiny muted" style="font-family:var(--font-mono)">— 힌턴</span></div>
          </div>
          <div class="nb-why">인공신경망으로 기계가 배우게 만든<br><span class="mark">기초 발견</span></div>
        </div>
        <div class="nb-div"></div>
        <div class="abs" style="left:818px;top:228px;width:700px">
          <div class="nb-head"><span class="mono">10.9</span><span class="subtitle">화학상</span></div>
          <div class="nb-photos">
            ${Kit.photo('hassabis', '데미스 허사비스', 'sm', '--w:186px;--tilt:-1.5deg')}
            ${Kit.photo('jumper', '존 점퍼', 'sm tilt-r', '--w:186px')}
            <div class="nb-init">
              <div class="nb-ring"><svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true"><circle class="nb-c" cx="60" cy="60" r="52"/></svg><b>DB</b></div>
              <span>데이비드 베이커</span>
            </div>
          </div>
          <div class="nb-why"><span class="mark">AlphaFold</span> 단백질 구조 예측 ½<br>+ 단백질 설계(베이커) ½</div>
        </div>
        <div class="abs row" style="left:92px;top:680px;gap:40px;align-items:center">
          <div class="stack nb-count" style="gap:6px;width:440px">
            <div class="mono tiny muted">AlphaFold가 예측한 단백질 구조</div>
            <b class="nb-n" style="white-space:nowrap">2억+</b>
            <div class="tiny muted">2022.7 · 190개국 50만 명 이상이 사용</div>
          </div>
          <div class="stack" style="gap:8px">
            <svg class="nb-grid" width="840" height="104" viewBox="0 0 840 104" aria-label="한 칸에 100만 개, 200칸"></svg>
            <div class="mono tiny muted"><span class="pen">■</span> 확장 전 약 100만 개 &nbsp;&nbsp; ■ 한 칸 = 100만 개 · 200칸 = 2억 개</div>
          </div>
        </div>
        <div class="src">출처: nobelprize.org 2024 물리학상·화학상 발표문과 힌턴 인터뷰, Google DeepMind 블로그(2022.7.28 AlphaFold 구조 DB 확장: 약 100만 → 2억 개 이상, 190개국 50만 명 이상)</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.nb-grid');
        const cells = [];
        for (let i = 0; i < 200; i++) {
          const c = i % 40, r = Math.floor(i / 40);
          cells.push(K.svg('rect', { x: 2 + c * 21, y: 2 + r * 21, width: 16, height: 16, rx: 2, class: i === 0 ? 'first' : 'on' }, svg));
        }
        // the initials circle, a little hand-drawn
        const circ = el.querySelector('.nb-c');
        K.svg('path', { d: K.sketchPath([[60, 8], [108, 40], [104, 92], [58, 112], [14, 88], [10, 36], [56, 9], [66, 10]], { tension: 0.9, wobble: 3, seed: 5 }), style: 'fill:none;stroke:var(--ink);stroke-width:3.5;stroke-linecap:round' }, circ.parentNode);
        circ.remove();
        const num = el.querySelector('.nb-n');
        const st = { t: 1, run: false };
        let shownN = 200;   // the cells are built filled, as for n = 200; repaint only the cells that change
        const paint = () => {
          const n = Math.max(1, Math.round(Kit.easeOut(Kit.clamp(st.t, 0, 1)) * 200));
          if (n === shownN) return;
          for (let i = Math.min(n, shownN); i < Math.max(n, shownN); i++) cells[i].setAttribute('class', i < n ? 'on' : '');
          shownN = n;
          num.textContent = n >= 200 ? '2억+' : n >= 100 ? `${Math.floor(n / 100)}억${n % 100 ? ' ' + ((n % 100) * 100).toLocaleString('ko-KR') + '만' : ''}` : (n * 100).toLocaleString('ko-KR') + '만';
        };
        K.loop(el, (t, dt) => {
          if (!st.run) return;
          st.t += dt / 2.4;
          if (st.t >= 1) { st.t = 1; st.run = false; }
          paint();
        });
        f._play = () => { st.t = -0.25; st.run = true; paint(); };
        f._full = () => { st.t = 1; st.run = false; paint(); };
      },
      enter(el, K, f) { if (f._play) f._play(); },
      leave(el, K, f) { if (f._full) f._full(); },
    },

    /* ═════════════════════ 5. reasoning + agents ═════════════════════ */
    {
      id: 'reasoning-agents',
      title: '생각하는 AI, 일하는 AI',
      year: '2025', tag: '생각하고 일한다',
      minutes: 1.3,
      notes: '2024년 9월 o1부터 AI는 답하기 전에 풀이 과정을 토큰으로 길게 먼저 써 보기 시작했습니다(회사들은 이걸 ‘생각’이라고 부릅니다. 정말 생각인지는 마지막 Q1에서). 같은 미국 고교 수학경시대회(AIME 2024)에서 바로 답하는 GPT-4o는 12%, 풀이를 먼저 쓰고 답하는 o1은 74%, o1이 64번 풀어 다수결하면 83%. 2025년 1월 중국 DeepSeek가 비슷한 추론 모델 R1을 누구나 쓰게 공개하자, 엔비디아 시가총액이 하루에 5,890억 달러 빠졌습니다. 그리고 2025년은 에이전트(스스로 계획하고 도구를 써서 일을 끝내는 AI)가 ‘일’을 시작한 해입니다. 화면에는 없으니 말로 짚습니다: 2.2 ‘바이브 코딩’이란 말이 생김, 2.24 Claude Code 공개(5월 정식), 5월 OpenAI Codex, 7월 국제수학올림피아드(IMO) 금메달 수준(42점 중 35점), 9월 세계 대학생 프로그래밍 대회(ICPC) 12문제 전부 정답.\n→ 키로 R1 메모, METR 차트가 차례로 나옵니다. 차트 아래 슬라이더로 ‘내 과제 길이’를 바꾸면, 사람이 그만큼 걸리는 일을 AI가 50% 확률로 혼자 끝내게 된 대략의 시점을 보여 줍니다(측정값 사이를 이은 추정). 점선은 2019–2025년 평균(약 7개월마다 2배)이고, 2024년 이후로는 약 3개월마다 2배로 더 빨라져 실선이 점선 위로 올라갑니다. Mythos Preview(2026.3 평가)는 ‘최소 16시간’으로, METR 과제로 잴 수 있는 한계에 닿았습니다. (느낌과 측정이 다르다는 METR 실험은 ‘AI 시대의 일’ 정류장에서)\n질문: “AI가 혼자 하루 종일 일할 수 있게 되면, 여러분이 맡을 일은 뭘까요?”',
      html: `
        <style>
          #f-reasoning-agents .ra-sub { font-family:var(--font-display); font-weight:600; font-size:36px; line-height:1.15; }
          #f-reasoning-agents .ra-svg text { font-family:var(--font-mono); font-size:21px; fill:var(--ink-2); }
          #f-reasoning-agents .ra-svg .nm { font-size:24px; font-weight:600; fill:var(--ink); }
          #f-reasoning-agents .ra-svg .val { font-size:30px; font-weight:600; fill:var(--ink); }
          #f-reasoning-agents .ra-svg .qa { fill:var(--paper); stroke:var(--ink); stroke-width:3; }
          #f-reasoning-agents .ra-svg .qa-t { font-family:var(--font-display); font-weight:800; font-size:20px; fill:var(--ink); }
          #f-reasoning-agents .ra-svg .th { fill:var(--pen); }
          #f-reasoning-agents .ra-svg .ar { stroke:var(--ink); stroke-width:2.5; fill:none; }
          #f-reasoning-agents .ra-svg .arp { stroke:var(--pen); stroke-width:2; fill:none; opacity:.8; }
          #f-reasoning-agents .ra-svg .trk { fill:none; stroke:var(--ink-3); stroke-width:2; stroke-dasharray:4 6; }
          #f-reasoning-agents .ra-svg .b { fill:var(--ink); }
          #f-reasoning-agents .ra-svg .b.hi { fill:var(--hl); stroke:var(--ink); stroke-width:3; }
          #f-reasoning-agents .mt text { font-size:20px; }
          #f-reasoning-agents .mt .lab { fill:var(--ink); font-size:20px; paint-order:stroke; stroke:var(--paper); stroke-width:10px; stroke-linejoin:round; }
          #f-reasoning-agents .mt .ref { fill:none; stroke:var(--ink-3); stroke-width:3; stroke-dasharray:9 8; }
          #f-reasoning-agents .mt .meas { fill:none; stroke:var(--ink); stroke-width:4.5; stroke-linejoin:round; }
          #f-reasoning-agents .mt .myth { fill:var(--paper); stroke:var(--ink); stroke-width:3; stroke-dasharray:4 4; }
          #f-reasoning-agents .mt .task { stroke:var(--pen); stroke-width:3; }
          #f-reasoning-agents .mt .drop { stroke:var(--pen); stroke-width:2; stroke-dasharray:4 5; }
          #f-reasoning-agents .mt .hit { fill:var(--hl); stroke:var(--ink); stroke-width:3; }
          #f-reasoning-agents .mt .legend { font-size:20px; fill:var(--ink-2); }
          #f-reasoning-agents .ra-slider { display:grid; grid-template-columns:auto 1fr; gap:6px 18px; align-items:center; margin-top:6px; }
          #f-reasoning-agents .ra-slider label { font-family:var(--font-mono); font-size:21px; color:var(--ink-2); white-space:nowrap; }
          #f-reasoning-agents .ra-slider output { font-family:var(--font-mono); font-weight:600; color:var(--ink); font-size:24px; }
          #f-reasoning-agents .ra-when { grid-column:1 / -1; font-size:25px; }
          #f-reasoning-agents .ra-when b { background:var(--hl-soft); padding:0 .2em; }
          #f-reasoning-agents .sticky { font-size:31px; line-height:1.22; padding:16px 24px 18px; }
        </style>
        <div class="kicker">2024.9 → 2025 · 추론 모델과 에이전트(스스로 계획하고 도구를 써서 일을 끝내는 AI)</div>
        <h2 class="title">생각하는 AI, 일하는 AI</h2>
        <div class="abs" style="left:92px;top:212px;width:660px">
          <div class="ra-sub">답하기 전에 오래 생각하면</div>
          <div class="mono tiny muted" style="margin-top:4px">미국 고교 수학경시대회(AIME 2024) 정답률 · OpenAI 2024.9</div>
          <svg class="ra-svg" width="660" height="270" viewBox="0 0 660 270" style="margin-top:14px;overflow:visible"></svg>
        </div>
        <div class="abs sticky" data-step="1" style="left:104px;top:604px;width:620px;--tilt:-1.2deg">
          <b>2025.1.20 DeepSeek R1</b> — <span style="font-family:var(--font-mono);font-size:26px">o1</span>급 추론 모델을 누구나 쓰게 공개<br>→ 1.27 엔비디아 하루 −17%, 시총 5,890억 달러 증발
        </div>
        <div class="demo ra-metr" data-step="2" style="position:absolute;left:800px;top:212px;width:718px">
          <div class="ra-sub">혼자 끝낼 수 있는 일의 길이</div>
          <div class="mono tiny muted" style="margin-top:4px">사람이 하면 걸리는 시간 · AI 성공률 50% 기준 · AI 평가 연구소 METR</div>
          <svg class="chart mt" width="${MG.w}" height="${MG.h}" viewBox="0 0 ${MG.w} ${MG.h}" style="margin-top:8px"></svg>
          <div class="ra-slider">
            <label for="ra-task">내 과제 길이 <output class="ra-out">30분</output></label>
            <input id="ra-task" type="range" min="0" max="1000" step="1">
            <div class="ra-when">AI가 이만큼 해낸 때: <b class="ra-res"></b> <span class="faint tiny ra-cave">측정값 사이를 이은 대략값</span></div>
          </div>
        </div>
        <div class="src">출처: OpenAI 「Learning to reason with LLMs」(2024.9), DeepSeek-R1 논문(2025.1), Bloomberg(2025.1.27), METR 시간 지평 TH1.1(2026.1.29)·Mythos Preview 평가(The Decoder 보도, 2026)</div>`,
      init(el, K, f) {
        /* — left: think longer, score higher — */
        const s = el.querySelector('.ra-svg');
        const rows = [
          { nm: 'GPT-4o', sub: '바로 답', v: 12, chain: 0 },
          { nm: 'o1', sub: '생각한 뒤 답', v: 74, chain: 1 },
          { nm: 'o1', sub: '64번 풀고 다수결', v: 83, chain: 2, hi: true },
        ];
        const BX = 372, BW = 230;
        rows.forEach((r, i) => {
          const y = 40 + i * 92;
          const n = K.svg('text', { class: 'nm', x: 0, y: y - 2 }, s); n.textContent = r.nm;
          const sb = K.svg('text', { x: 0, y: y + 26 }, s); sb.textContent = r.sub;
          // glyph: Q → (thinking) → A
          const qx = 196, ax = 330;
          if (r.chain === 0) {
            K.svg('path', { class: 'ar', d: `M${qx + 16},${y} H${ax - 22} M${ax - 30},${y - 6} L${ax - 20},${y} L${ax - 30},${y + 6}` }, s);
          } else if (r.chain === 1) {
            for (let k = 0; k < 6; k++) K.svg('circle', { class: 'th', cx: qx + 30 + k * 16, cy: y + Math.sin(k * 1.4) * 5, r: 4.5 }, s);
            K.svg('path', { class: 'ar', d: `M${ax - 30},${y - 6} L${ax - 20},${y} L${ax - 30},${y + 6}` }, s);
          } else {
            for (let c = -2; c <= 2; c++) {
              K.svg('path', { class: 'arp', d: K.sketchPath([[qx + 16, y], [qx + 52, y + c * 9], [ax - 52, y + c * 9], [ax - 18, y]], { tension: 0.6 }) }, s);
            }
            const m = K.svg('text', { x: (qx + ax) / 2, y: y - 28, 'text-anchor': 'middle', style: 'fill:var(--pen);font-weight:600' }, s); m.textContent = '×64';
          }
          [[qx, 'Q'], [ax, 'A']].forEach(([cx, ch]) => {
            K.svg('circle', { class: 'qa', cx, cy: y, r: 16 }, s);
            const t = K.svg('text', { class: 'qa-t', x: cx, y: y + 7, 'text-anchor': 'middle' }, s); t.textContent = ch;
          });
          // bar drawn to scale (0–100%)
          K.svg('rect', { class: 'trk', x: BX, y: y - 15, width: BW, height: 30 }, s);
          K.svg('rect', { class: 'b' + (r.hi ? ' hi' : ''), x: BX, y: y - 15, width: (BW * r.v) / 100, height: 30 }, s);
          const v = K.svg('text', { class: 'val', x: BX + BW + 12, y: y + 10 }, s); v.textContent = r.v + '%';
        });
        const sc = K.svg('text', { x: BX, y: 262 }, s); sc.textContent = '0 ─────── 100%';
        sc.setAttribute('style', 'font-size:20px;fill:var(--ink-2)');

        /* — right: METR time horizon, log y — */
        const mt = el.querySelector('.mt');
        const gy = [[1, '1분'], [10, '10분'], [60, '1시간'], [480, '8시간'], [1440, '24시간']];
        gy.forEach(([m, lab]) => {
          const y = mtY(m);
          K.svg('line', { class: 'gridl', x1: MG.l, x2: MG.w - MG.r, y1: y, y2: y }, mt);
          const t = K.svg('text', { x: MG.l - 12, y: y + 7, 'text-anchor': 'end' }, mt); t.textContent = lab;
        });
        [2023, 2024, 2025, 2026].forEach((yr) => {
          const x = mtX(yr);
          K.svg('line', { class: 'gridl', x1: x, x2: x, y1: MG.t, y2: MG.h - MG.b }, mt);
          const t = K.svg('text', { x: x + 6, y: MG.h - MG.b + 30 }, mt); t.textContent = yr;
        });
        K.svg('path', { class: 'ax', d: `M${MG.l},${MG.t} V${MG.h - MG.b} H${MG.w - MG.r}` }, mt);
        // reference: doubling every 7 months from GPT-4 (2019–2025 average pace)
        const a = MT[0], tEnd = MG.x1;
        const mEnd = a.m * Math.pow(2, ((tEnd - a.t) * 12) / 7);
        K.svg('line', { class: 'ref', x1: mtX(a.t), y1: mtY(a.m), x2: mtX(tEnd), y2: mtY(mEnd) }, mt);
        // measured
        K.svg('path', { class: 'meas', d: 'M' + MT.map((p) => `${mtX(p.t).toFixed(1)},${mtY(p.m).toFixed(1)}`).join(' L') }, mt);
        // Mythos Preview: lower bound only
        const mx = mtX(MT_MYTHOS.t), my = mtY(MT_MYTHOS.m);
        const last = MT[MT.length - 1];
        K.svg('line', { class: 'ref', x1: mtX(last.t), y1: mtY(last.m), x2: mx, y2: my, style: 'stroke:var(--ink);stroke-width:3' }, mt);
        K.svg('path', { class: 'ar', d: `M${mx},${my - 10} V${my - 34} M${mx - 7},${my - 26} L${mx},${my - 34} L${mx + 7},${my - 26}`, style: 'stroke:var(--ink);stroke-width:3;fill:none' }, mt);
        K.svg('circle', { class: 'myth', cx: mx, cy: my, r: 8 }, mt);
        const ml = K.svg('text', { class: 'lab', x: mx - 16, y: my - 18, 'text-anchor': 'end' }, mt); ml.textContent = 'Mythos Preview ≥16시간';
        MT.forEach((p) => {
          K.svg('circle', { class: 'dot', cx: mtX(p.t), cy: mtY(p.m), r: 7 }, mt);
          const t = K.svg('text', { class: 'lab', x: mtX(p.t) + p.dx, y: mtY(p.m) + p.dy, 'text-anchor': p.a }, mt);
          if (!p.lab2) { t.textContent = p.lab; return; }
          K.svg('tspan', { x: mtX(p.t) + p.dx }, t).textContent = p.lab;
          K.svg('tspan', { x: mtX(p.t) + p.dx, dy: 20 }, t).textContent = p.lab2;
        });
        // legend: one row under the year labels, with real line samples
        const ly = MG.h - 12;
        [['meas', '측정값 (METR)', MG.l], ['ref', '7개월마다 2배 (평균)', MG.l + 236]].forEach(([cls, txt, x]) => {
          K.svg('line', { class: cls, x1: x, x2: x + 40, y1: ly - 7, y2: ly - 7 }, mt);
          K.svg('text', { class: 'legend', x: x + 52, y: ly }, mt).textContent = txt;
        });
        // interactive task line
        const gTask = K.svg('g', {}, mt);
        const tl = K.svg('line', { class: 'task', x1: MG.l, x2: MG.w - MG.r }, gTask);
        const dl = K.svg('line', { class: 'drop' }, gTask);
        const hc = K.svg('circle', { class: 'hit', r: 9 }, gTask);
        // point labels go back on top: their paper halo keeps them readable when the task line crosses them
        mt.querySelectorAll('text.lab').forEach((t) => mt.appendChild(t));
        const range = el.querySelector('#ra-task'), out = el.querySelector('.ra-out'), res = el.querySelector('.ra-res');
        const cave = el.querySelector('.ra-cave');
        const toMin = (v) => Math.exp((v / 1000) * Math.log(MG.ymax));
        const update = () => {
          const m = toMin(+range.value);
          const y = mtY(m);
          tl.setAttribute('y1', y); tl.setAttribute('y2', y);
          out.textContent = fmtMin(m);
          const w = mtWhen(m);
          res.textContent = w.txt;
          cave.style.visibility = w.at && !w.range ? 'visible' : 'hidden';
          if (w.at) {
            const x = mtX(w.at);
            hc.setAttribute('cx', x); hc.setAttribute('cy', y); hc.style.display = '';
            dl.setAttribute('x1', x); dl.setAttribute('x2', x); dl.setAttribute('y1', y); dl.setAttribute('y2', MG.h - MG.b); dl.style.display = '';
          } else { hc.style.display = 'none'; dl.style.display = 'none'; }
        };
        const setMin = (m) => { range.value = String(Math.round((Math.log(m) / Math.log(MG.ymax)) * 1000)); update(); };
        range.addEventListener('input', update);
        setMin(30);
        f._reset = () => setMin(30);
      },
      leave(el, K, f) { if (f._reset) f._reset(); },
    },

    /* ═════════════════════ 6. now ═════════════════════ */
    {
      id: 'now-2026',
      title: '2026년 11월, 지금의 판도',
      year: '2026', tag: '지금',
      minutes: 1,
      notes: '2026년 11월 지금, 미국에서는 OpenAI·구글·Anthropic이 몇 주 간격으로 새 모델을 내고 있고, ChatGPT와 Gemini 앱은 각각 사용자 10억 명을 넘었다고 발표했습니다(2023년 1월 ChatGPT 1억 명의 10배). 중국은 파라미터가 1조 개가 넘는 모델을 가중치째 공개하고, 한국도 LG·SKT·업스테이지가 수천억 규모 모델을 내놓았습니다. 그리고 가장 강한 모델은 해킹 같은 위험 때문에 일부에게만 열리기 시작했습니다. OpenAI는 GPT-6.1 Astra 출시를 안전 우려로 미뤘고, Anthropic은 같은 모델을 안전장치만 다른 두 버전으로 나눠, ‘Fable’은 유료 사용자에게, ‘Mythos’는 제한된 그룹에만 줍니다.\n→ 키로 아시아 쪽 지도, 오른쪽 위 메모가 차례로 붙습니다. 원의 넓이가 사용자 수(회사 발표)인데, 회사마다 세는 방식이 달라 직접 비교는 조심해야 합니다. 이 지도는 다음 달이면 또 바뀝니다.\n질문: “1년 뒤 이 지도에서 사라지거나 새로 생길 이름은 뭘까요?”',
      html: `
        <style>
          #f-now-2026 .nw-map { position:absolute; left:0; top:0; overflow:visible; pointer-events:none; }
          #f-now-2026 .nw-map .land { fill:var(--paper-2); stroke:none; }
          #f-now-2026 .nw-map .coast { fill:none; stroke:var(--ink); stroke-width:7; stroke-linejoin:round; }
          #f-now-2026 .nw-map .border { fill:none; stroke:var(--ink-3); stroke-width:2.5; stroke-dasharray:10 8; }
          #f-now-2026 .nw-map .u { fill:var(--hl-soft); stroke:var(--ink); stroke-width:3; }
          #f-now-2026 .nw-map .u0 { fill:var(--paper); stroke:var(--ink); stroke-width:2.5; stroke-dasharray:4 4; }
          #f-now-2026 .nw-r { position:absolute; display:flex; flex-direction:column; gap:2px; }
          #f-now-2026 .nw-r .wm { font-family:var(--font-display); font-weight:800; font-size:40px; line-height:1.05; margin-bottom:6px; white-space:nowrap; }
          #f-now-2026 .nw-r .wm small { font-family:var(--font-mono); font-weight:400; font-size:20px; color:var(--ink-2); margin-left:8px; }
          #f-now-2026 .nw-r .md { font-size:24px; font-weight:600; line-height:1.25; white-space:nowrap; }
          #f-now-2026 .nw-r .md .mono { font-weight:400; font-size:20px; color:var(--pen); margin-left:6px; }
          #f-now-2026 .nw-r .fx { font-size:21px; color:var(--ink-2); line-height:1.3; white-space:nowrap; }
          #f-now-2026 .nw-u { position:absolute; font-family:var(--font-mono); font-size:20px; line-height:1.3; color:var(--ink-2); text-align:right; }
          #f-now-2026 .nw-u b { display:block; font-family:var(--font-body); font-size:24px; font-weight:700; color:var(--ink); }
          #f-now-2026 .nw-u em { display:block; font-style:normal; font-weight:600; font-size:24px; color:var(--ink); }
          #f-now-2026 .nw-kt { display:grid; grid-template-columns:auto auto; gap:2px 18px; font-size:22px; font-weight:600; line-height:1.3; }
          #f-now-2026 .nw-kt b { font-family:var(--font-mono); font-size:21px; text-align:right; }
          #f-now-2026 .sticky { font-size:34px; line-height:1.15; padding:16px 22px 18px; }
          #f-now-2026 .sticky small { display:block; font-family:var(--font-body); font-size:21px; line-height:1.4; margin-top:6px; word-break:keep-all; }
        </style>
        <div class="kicker">2026.11.09 기준 · 확인된 발표만 · <span class="pen">파란 숫자 = 날짜(월.일)</span></div>
        <h2 class="title">2026년 11월, 지금의 판도</h2>
        <svg class="nw-map" width="1600" height="900" viewBox="0 0 1600 900" aria-hidden="true">
          <g class="nw-us"></g>
          <g class="nw-asia" data-step="1"></g>
        </svg>
        <div class="nw-r" style="left:134px;top:244px">
          <div class="wm">OpenAI</div>
          <div class="md">GPT-6 Astra <span class="mono">9.3</span></div>
          <div class="md">GPT-6.1 Sol <span class="mono">9.29</span></div>
        </div>
        <div class="nw-u" style="left:120px;top:372px;width:144px"><b>ChatGPT</b><em>10억 명+</em>2026.9</div>
        <div class="nw-r" style="left:434px;top:244px">
          <div class="wm">Google</div>
          <div class="md">Gemini 4 Argon</div>
          <div class="fx"><span class="mono" style="color:var(--pen)">10.13</span> 유료 구독자부터</div>
        </div>
        <div class="nw-u" style="left:416px;top:372px;width:144px"><b>Gemini 앱</b><em>10억 명+</em>2026.10</div>
        <div class="nw-r" style="left:732px;top:244px">
          <div class="wm">Anthropic</div>
          <div class="md">Claude Fable 5.1 <span class="mono">9.1</span></div>
          <div class="md">Claude Opus 5.5 <span class="mono">9.22</span></div>
          <div class="fx">Sonnet · Haiku 5.5 <span class="mono">9–10월</span></div>
          <div class="fx">상장 서류 공개 <span class="mono">10.26</span></div>
        </div>
        <div class="nw-r" style="left:134px;top:504px">
          <div class="wm">Meta</div>
          <div class="md">Muse Spark Open <span class="mono">10.15</span></div>
          <div class="fx">8,160억 파라미터 · 가중치 공개</div>
        </div>
        <div class="nw-r" style="left:548px;top:504px">
          <div class="wm">xAI <small>→ SpaceX</small></div>
          <div class="md">Grok 4.7 <span class="mono">9.21</span></div>
          <div class="fx"><span class="mono" style="color:var(--pen)">2.2</span> SpaceX가 xAI를 흡수</div>
          <div class="fx">(합쳐서 1조 2,500억 달러 가치)</div>
        </div>
        <div class="nw-r" data-step="1" style="left:1080px;top:244px">
          <div class="wm">중국 <small>가중치를 공개한 초대형 모델</small></div>
          <div class="md">Kimi K3 · 2.8조 <span class="mono">7.16</span></div>
          <div class="md">Qwen 3.8 · 2.4조 <span class="mono">8.8</span></div>
          <div class="md">DeepSeek V4-Pro · 1.6조 <span class="mono">4.24</span></div>
          <div class="fx">조·억 = 가중치 개수 · 공개(일부 제한)</div>
        </div>
        <div class="nw-r" data-step="1" style="left:1064px;top:522px">
          <div class="wm">한국 <small>2026.6–7 공개</small></div>
          <div class="nw-kt"><span>LG K-EXAONE 2.0</span><b>7,500억</b><span>SKT A.X K2</span><b>6,880억</b><span>Upstage Solar Open2</span><b>2,503억</b></div>
        </div>
        <div class="abs sticky" data-step="2" style="left:1104px;top:30px;width:404px;--tilt:2deg">가장 센 모델은 잠가 둔다<small>GPT-6.1 Astra: 출시 보류 (9월 말)<br>Claude Mythos 5.1: 제한된 그룹에만<br>(Fable 5.1과 같은 모델)</small></div>
        <div class="abs row" style="left:92px;top:770px;gap:16px;align-items:center">
          <svg width="74" height="60" viewBox="0 0 74 60" aria-hidden="true"><circle cx="30" cy="30" r="27" style="fill:var(--hl-soft);stroke:var(--ink);stroke-width:2.5"/><circle cx="30" cy="48.5" r="8.5" style="fill:var(--paper);stroke:var(--ink);stroke-width:2;stroke-dasharray:3 3"/></svg>
          <div class="tiny muted" style="line-height:1.4">원 넓이 = 사용자 수(회사 발표, 세는 방식이 서로 달라 직접 비교 주의)<br>안쪽 점선 원 = 2023년 1월 ChatGPT 1억 명</div>
        </div>
        <div class="abs hand" style="right:96px;top:780px;font-size:38px;transform:rotate(-1.5deg)">몇 주마다 새 모델: 이 지도는 다음 달이면 또 바뀐다</div>
        <div class="src">출처: Epoch AI 주요 모델 DB(2026.11.8 갱신), OpenAI 블로그(2026.9.11 ‘ChatGPT 사용자 10억 명 이상’), Alphabet 2026년 3분기 실적(Gemini 앱 10억 명), Google Gemini 릴리스 노트, Anthropic(Claude·S-1), Meta AI 블로그, CNBC(2026.2.3 SpaceX–xAI), Wikipedia(GPT-6·OpenAI·2026 in AI: GPT-6.1 Astra 보류), UBS(2023 ChatGPT 1억 명)</div>`,
      init(el, K) {
        const us = el.querySelector('.nw-us'), asia = el.querySelector('.nw-asia');
        const closed = (pts) => K.sketchPath(pts.concat(pts.slice(0, 3)), { tension: 0.5 });
        /* an irregular coastline around a box: points every ~46px, pushed in/out by layered sines */
        const coast = (x0, y0, x1, y1, seed, amp) => {
          const rnd = K.rand(seed), ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
          const W = x1 - x0, H = y1 - y0, P = 2 * (W + H), n = Math.round(P / 46), pts = [];
          const corners = [0, W, W + H, 2 * W + H, P];
          for (let i = 0; i < n; i++) {
            const sp = (i / n) * P;
            if (corners.some((c) => Math.abs(sp - c) < 22)) continue;
            let x, y, nx = 0, ny = 0;
            if (sp < W) { x = x0 + sp; y = y0; ny = -1; }
            else if (sp < W + H) { x = x1; y = y0 + sp - W; nx = 1; }
            else if (sp < 2 * W + H) { x = x1 - (sp - W - H); y = y1; ny = 1; }
            else { x = x0; y = y1 - (sp - 2 * W - H); nx = -1; }
            const w = amp * (0.55 * Math.sin(sp / 85 + ph[0]) + 0.3 * Math.sin(sp / 31 + ph[1]) + 0.15 * Math.sin(sp / 13 + ph[2]));
            pts.push([x + nx * w, y + ny * w]);
          }
          return pts;
        };
        /* several overlapping shapes read as one landmass: thick ink outline → fill on top */
        const drawLand = (g, shapes, clipId) => {
          const ds = shapes.map(closed);
          ds.forEach((d) => K.svg('path', { class: 'coast', d }, g));
          ds.forEach((d) => K.svg('path', { class: 'land', d }, g));
          const cp = K.svg('clipPath', { id: clipId }, g);
          ds.forEach((d) => K.svg('path', { d }, cp));
        };
        drawLand(us, [coast(102, 228, 1004, 738, 3, 14)], 'race-now-clip-us');
        // China and Korea: two separate landmasses with sea between, each holding its own text
        drawLand(asia, [coast(1048, 228, 1508, 452, 8, 12)], 'race-now-clip-cn');
        drawLand(asia, [coast(1034, 502, 1398, 690, 5, 10)], 'race-now-clip-kr');
        const border = (g, pts, seed, clipId) => K.svg('path', { class: 'border', d: K.sketchPath(pts, { wobble: 3, seed }), 'clip-path': `url(#${clipId})` }, g);
        border(us, [[80, 478], [260, 484], [420, 470], [600, 482], [780, 474], [1030, 478]], 21, 'race-now-clip-us');
        border(us, [[410, 200], [398, 320], [414, 400], [404, 478]], 22, 'race-now-clip-us');
        border(us, [[700, 200], [710, 320], [694, 400], [704, 476]], 23, 'race-now-clip-us');
        border(us, [[516, 480], [528, 560], [510, 640], [522, 760]], 24, 'race-now-clip-us');
        // users, area-proportional: 10억 → r=46, 1억 → r=46/√10
        const R = 46, r = R / Math.sqrt(10);
        [[318, 414, true], [612, 414, false]].forEach(([cx, cy, inner]) => {
          K.svg('circle', { class: 'u', cx, cy, r: R }, us);
          if (inner) K.svg('circle', { class: 'u0', cx, cy: cy + R - r, r }, us);
        });
      },
    },
  ]);
})();
