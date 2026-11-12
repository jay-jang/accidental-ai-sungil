/* History, part 1 (1943 → 1986): the hype curve, the artificial neuron, Turing's game,
   Dartmouth, the perceptron, ELIZA, XOR and the first winter, expert systems and the
   second winter, and backpropagation. Road layout: each frame carries year/tag. */
(function () {
  'use strict';
  const K = window.Kit;

  /* ───────── shared helpers ───────── */
  // Chrome replaces the text node even when the new text is identical (style recalc + layout), so skip such writes.
  const setText = (n, s) => { s = String(s); if (n.textContent !== s) n.textContent = s; };
  /** hand-drawn ring as an SVG path d (slight overshoot like a pen loop) */
  function ring(cx, cy, r, seed) {
    const rnd = K.rand(seed), pts = [], n = 18, a0 = -1.2 + rnd() * 0.5;
    for (let i = 0; i <= n + 2; i++) {
      const a = a0 + (i / n) * Math.PI * 2;
      const rr = r * (1 + (rnd() - 0.5) * 0.05) + (i > n ? 4 : 0);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return K.sketchPath(pts, { seed, wobble: 1.2 });
  }
  /** taped, ruled index card with the name handwritten: stands in for someone we have no photo of */
  function nameCard(name, sub, style) {
    return `<figure style="margin:0;position:absolute;width:224px;height:150px;background:var(--paper-2);border:2px solid var(--ink-3);box-shadow:var(--shadow);transform:rotate(var(--tilt,2deg));${style || ''}">
      <div style="position:absolute;left:0;right:0;top:50px;bottom:0;background:repeating-linear-gradient(to bottom,transparent 0 46px,var(--pen-soft) 46px 48px)"></div>
      <div style="position:absolute;left:0;right:0;top:48px;border-top:2px solid var(--bad);opacity:.45"></div>
      <div style="position:absolute;top:-15px;left:50%;width:100px;height:30px;margin-left:-50px;background:var(--tape);transform:rotate(-4deg)"></div>
      ${sub ? `<div class="mono" style="position:absolute;left:16px;top:14px;font-size:20px;color:var(--ink-2);white-space:nowrap">${sub}</div>` : ''}
      <figcaption class="hand" style="position:absolute;left:16px;right:8px;top:58px;font-size:40px;line-height:48px;white-space:nowrap">${name}</figcaption>
    </figure>`;
  }

  /* ═════════ 1. hype curve ═════════ */
  const HC = { X0: 64, X1: 1392, Y0: 430, YT: 60 };
  const hx = (y) => HC.X0 + ((y - 1950) * (HC.X1 - HC.X0)) / 76.9;
  const hy = (v) => HC.Y0 - v * (HC.Y0 - HC.YT);
  const HC_CURVE = [[1950, 0.05], [1953, 0.1], [1956, 0.3], [1960, 0.45], [1965, 0.56], [1969, 0.55], [1972, 0.42], [1974, 0.24], [1977, 0.13],
    [1980, 0.2], [1983, 0.42], [1985, 0.6], [1987, 0.47], [1989, 0.25], [1991, 0.13], [1993, 0.12], [1997, 0.21], [2002, 0.16], [2007, 0.22],
    [2012, 0.4], [2016, 0.58], [2019, 0.62], [2021, 0.67], [2022.9, 0.84], [2024.6, 0.93], [2026.85, 0.98]];
  const HC_PHASES = [
    [1950, 1956, '탄생', '튜링의 질문(1950) → 다트머스에서 ‘AI’라는 이름이 생김(1956)'],
    [1956, 1974, '1차 여름', '퍼셉트론·ELIZA, 그리고 “20년 안에 기계가 사람의 모든 일을” 같은 예언'],
    [1974, 1980, '1차 겨울', '약속을 못 지키자 돈이 끊김: 라이트힐 보고서(1973), 미국 국방부(DARPA) 연구비 삭감(1974)'],
    [1980, 1987, '2차 여름', '규칙을 잔뜩 적은 ‘전문가 시스템’ 붐. 1980년대 후반 10억 달러 산업'],
    [1987, 1993, '2차 겨울', 'AI 전용 컴퓨터(리스프 머신) 시장 붕괴(1987), 일본 5세대 컴퓨터 조용히 종료(1992)'],
    [1993, 2012, '조용한 회복', '딥블루(1997), 수표 읽는 신경망, ImageNet(2009). ‘AI’라는 말은 피함'],
    [2012, 2022, '3차 여름', 'AlexNet(2012) → 알파고(2016, 서울) → Transformer(2017)'],
    [2022, 2026.9, '지금', 'ChatGPT(2022.11.30) 이후 생성형 AI 붐. 지금 우리가 서 있는 곳'],
  ];
  const HC_PEAKS = [
    [1956, '다트머스', '1956', -14, -44, 'end'],
    [1985, '전문가 시스템', '1980s', 0, -40, 'middle'],
    [2012, '딥러닝', '2012', 14, 42, 'start'],
    [2022.9, 'ChatGPT', '2022', -16, -14, 'end'],
  ];
  function hypeSVG() {
    const { X0, X1, Y0, YT } = HC;
    const val = (yr) => { for (let i = 0; i < HC_CURVE.length - 1; i++) { const a = HC_CURVE[i], b = HC_CURVE[i + 1]; if (yr >= a[0] && yr <= b[0]) return a[1] + ((b[1] - a[1]) * (yr - a[0])) / (b[0] - a[0]); } return 0; };
    let h = `<defs><pattern id="h1-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" style="stroke:var(--pen);stroke-width:2.5;opacity:.32"/></pattern></defs>`;
    for (let y = 1960; y <= 2020; y += 10) h += `<line class="gridl" x1="${hx(y)}" y1="${YT - 24}" x2="${hx(y)}" y2="${Y0}"/>`;
    h += `<rect class="hc-act" x="0" y="${YT - 24}" width="0" height="${Y0 - YT + 24}" style="fill:var(--hl-soft);opacity:0;transition:opacity .25s"/>`;
    [[1974, 1980, '1차 겨울'], [1987, 1993, '2차 겨울']].forEach(([a, b, t]) => {
      h += `<rect x="${hx(a)}" y="${YT - 24}" width="${hx(b) - hx(a)}" height="${Y0 - YT + 24}" style="fill:var(--pen-soft)"/>`;
      h += `<rect x="${hx(a)}" y="${YT - 24}" width="${hx(b) - hx(a)}" height="${Y0 - YT + 24}" style="fill:url(#h1-hatch)"/>`;
      h += `<text class="hand" x="${(hx(a) + hx(b)) / 2}" y="${YT - 34}" text-anchor="middle" style="font-size:34px">${t}</text>`;
    });
    h += `<path class="ax" d="M${X0},${YT - 30} V${Y0} H${X1 + 10}"/>`;
    for (let y = 1950; y <= 2020; y += 10) {
      h += `<line class="ax" x1="${hx(y)}" y1="${Y0}" x2="${hx(y)}" y2="${Y0 + 8}"/>`;
      h += `<text x="${hx(y)}" y="${Y0 + 32}" text-anchor="middle" style="font-size:20px">${y}</text>`;
    }
    h += `<text x="${X0 + 12}" y="${YT - 6}" style="font-size:20px;fill:var(--ink-2)">기대·돈 ↑</text>`;
    h += `<text x="${X0 + 12}" y="${YT + 20}" style="font-size:20px;fill:var(--ink-3)">(높이는 분위기, 실제 수치 아님)</text>`;
    const pts = HC_CURVE.map(([y, v]) => [hx(y), hy(v)]);
    h += `<path d="${K.sketchPath(pts, { seed: 31, wobble: 3 })}" style="fill:none;stroke:var(--ink-3);stroke-width:2;opacity:.7"/>`;
    h += `<path class="ln" d="${K.sketchPath(pts, { seed: 5, wobble: 1 })}"/>`;
    HC_PEAKS.forEach(([yr, name, yl, dx, dy, anc]) => {
      const x = hx(yr), y = hy(val(yr));
      h += `<circle cx="${x}" cy="${y}" r="8" style="fill:var(--hl);stroke:var(--ink);stroke-width:3"/>`;
      h += `<text x="${x + dx}" y="${y + dy}" text-anchor="${anc}" style="font-family:var(--font-display);font-weight:700;font-size:26px;fill:var(--ink)">${name}</text>`;
      h += `<text x="${x + dx}" y="${y + dy + 24}" text-anchor="${anc}" style="font-size:20px;fill:var(--ink-2)">${yl}</text>`;
    });
    const nx = hx(2026.85), ny = hy(0.98);
    h += `<circle cx="${nx}" cy="${ny}" r="9" style="fill:var(--pen)"/>`;
    h += `<text class="hand" x="${nx - 4}" y="${ny - 22}" text-anchor="end" style="font-size:34px">지금 여기</text>`;
    // phase ribbon + hit areas
    HC_PHASES.forEach(([a, b, name], i) => {
      const x = hx(a), w = Math.min(hx(b), X1 + 10) - x, win = /겨울/.test(name);
      h += `<g class="hc-seg" data-i="${i}" style="cursor:pointer">
        <rect class="hc-hit" x="${x}" y="${YT - 24}" width="${w}" height="${Y0 - YT + 24}" style="fill:transparent"/>
        <rect class="hc-rib" x="${x + 1.5}" y="${Y0 + 50}" width="${w - 3}" height="40" rx="4" style="fill:${win ? 'var(--pen-soft)' : 'var(--paper-2)'};stroke:var(--ink-3);stroke-width:1.5"/>
        <text x="${x + w / 2}" y="${Y0 + 77}" text-anchor="middle" style="font-family:var(--font-body);font-weight:600;font-size:20px;fill:${win ? 'var(--pen)' : 'var(--ink)'}">${name}</text>
      </g>`;
    });
    return h;
  }

  /* ═════════ 2. 1943 neuron ═════════ */
  function neuronSVG() {
    let h = '';
    [['A', 40], ['B', 190]].forEach(([n, y], i) => {
      h += `<g class="sw" data-k="${i}" style="cursor:pointer">
        <text x="24" y="${y}" style="font-family:var(--font-mono);font-size:22px;fill:var(--ink-2)">입력 ${n}</text>
        <rect class="sw-body" x="24" y="${y + 14}" width="140" height="64" rx="32" style="stroke:var(--ink);stroke-width:3"/>
        <circle class="sw-knob" cx="58" cy="${y + 46}" r="23" style="fill:var(--paper);stroke:var(--ink);stroke-width:3;transition:cx .18s"/>
        <text class="sw-val" x="190" y="${y + 64}" style="font-family:var(--font-mono);font-weight:600;font-size:50px;fill:var(--ink)">0</text>
      </g>`;
    });
    h += `<path class="wire w0" d="M240,86 C320,86 330,146 398,150" style="fill:none;stroke-linecap:round"/>`;
    h += `<path class="wire w1" d="M240,236 C320,236 330,184 398,180" style="fill:none;stroke-linecap:round"/>`;
    h += `<text x="306" y="92" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">×1</text>`;
    h += `<text x="306" y="252" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">×1</text>`;
    h += `<path d="${ring(490, 165, 92, 4)}" style="fill:var(--paper);stroke:var(--ink);stroke-width:4"/>`;
    h += `<path d="${ring(490, 165, 85, 12)}" style="fill:none;stroke:var(--ink-3);stroke-width:1.5"/>`;
    h += `<text x="490" y="152" text-anchor="middle" style="font-family:var(--font-display);font-weight:700;font-size:30px;fill:var(--ink)">합 ≥ θ ?</text>`;
    h += `<text class="n-sum" x="490" y="192" text-anchor="middle" style="font-family:var(--font-mono);font-weight:600;font-size:26px;fill:var(--ink)">합 = 0</text>`;
    h += `<text class="n-th" x="490" y="222" text-anchor="middle" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">θ = 0</text>`;
    h += `<text class="hand" x="490" y="56" text-anchor="middle" style="font-family:var(--font-hand);font-size:40px;fill:var(--pen)">인공 뉴런</text>`;
    h += `<path class="wire wo" d="M584,165 L692,160" style="fill:none;stroke-linecap:round"/>`;
    let rays = '';
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + ((i - 4) * Math.PI) / 7;
      rays += `<line x1="${754 + Math.cos(a) * 64}" y1="${150 + Math.sin(a) * 64}" x2="${754 + Math.cos(a) * 86}" y2="${150 + Math.sin(a) * 86}"/>`;
    }
    h += `<g class="rays" style="stroke:var(--ink);stroke-width:4;stroke-linecap:round">${rays}</g>`;
    h += `<path class="bulb" d="${ring(754, 150, 50, 21)}" style="stroke:var(--ink);stroke-width:4;transition:fill .2s"/>`;
    h += `<rect x="730" y="198" width="48" height="34" rx="4" style="fill:var(--paper-3);stroke:var(--ink);stroke-width:3"/>`;
    h += `<line x1="730" y1="210" x2="778" y2="210" style="stroke:var(--ink);stroke-width:2"/><line x1="730" y1="221" x2="778" y2="221" style="stroke:var(--ink);stroke-width:2"/>`;
    h += `<text class="o-val" x="754" y="290" text-anchor="middle" style="font-family:var(--font-mono);font-weight:600;font-size:28px;fill:var(--ink)">출력 0</text>`;
    return h;
  }

  /* ═════════ 3. 1950 imitation game ═════════ */
  const QZ = [
    { q: '어제 저녁 뭐 먹었어?', a: ['8초 뒤', '편의점 삼각김밥 두 개. 늦게 들어가서 엄마한테 혼남'], b: ['1초 뒤', '저는 음식을 먹지 않습니다. 한국 학생들은 저녁으로 라면을 즐겨 먹습니다.'], m: 1, why: '사람 흉내를 아예 안 내는 옛날 챗봇 말투.' },
    { q: '3874 × 29는?', a: ['0.4초 뒤', '112,346'], b: ['12초 뒤', '아 잠깐… 폰 계산기 써도 돼? 대충 11만쯤?'], m: 0, why: '눈 깜짝할 새 나온 정확한 답이 오히려 수상하다.' },
    { q: '시험 망치면 기분 어때?', a: ['6초 뒤', '속상하지만 다음 시험을 위한 좋은 경험이라고 생각해요. 힘내세요!'], b: ['5초 뒤', 'ㅋㅋ 그냥 누워서 폰 봄. 근데 너 시험 잘 봤어?'], m: 1, why: '반전! 요즘 AI는 말투까지 흉내 낸다. A는 모범생 사람.' },
  ];

  /* ═════════ 6. ELIZA (Korean) ═════════ */
  const PARTS = ['', '는', '도', '를', '의', '랑', '한테', '만', '보다', '에게', '하고', '처럼', '까지', '부터', '조차', '와', '과'];
  function swapTok(tok) {
    const m = tok.match(/^(.*?)([.,!?~]*)$/);
    const w = m[1], p = m[2];
    const map = (stem, to) => (w.startsWith(stem) && PARTS.includes(w.slice(stem.length)) ? to + w.slice(stem.length) : null);
    let r = null;
    if (w === '내가' || w === '제가') r = '네가';
    else if (w === '네가' || w === '니가') r = '내가';
    else if (w === '내' || w === '제') r = '네';
    else if (w === '난') r = '넌';
    else if (w === '넌') r = '난';
    else if (w === '우리') r = '너희';
    else r = map('나', '너') || map('저', '너') || map('너', '나');
    return (r || w) + p;
  }
  const swapAll = (s) => s.split(/\s+/).filter(Boolean).map(swapTok).join(' ');
  const ELIZA_RULES = [
    { k: '미안', re: /미안|죄송/, r: ['사과하지 않아도 괜찮아.', '사과할 필요 없어. 그때 기분이 어땠니?'] },
    { k: 'AI', re: /(?:^|[^a-z])ai(?:[^a-z]|$)|인공지능|gpt|챗지피티|챗봇|클로드|제미나이/i, r: ['기계 이야기가 나오니 걱정되니?', '왜 AI 이야기를 꺼냈니?', '내가 기계라서 그런 말을 하는 거니?'] },
    { k: '컴퓨터', re: /컴퓨터|기계|로봇/, r: ['컴퓨터가 걱정되니?', '기계가 너와 무슨 상관이 있다고 생각하니?'] },
    { k: '엄마', re: /엄마|어머니/, r: ['어머니 이야기를 좀 더 해 줄래?', '어머니와는 요즘 어떠니?', '어머니가 그렇게 말하면 어떤 기분이 드니?'], mem: '어머니' },
    { k: '아빠', re: /아빠|아버지/, r: ['아버지는 어떤 분이니?', '아버지 이야기를 하니 무엇이 떠오르니?'], mem: '아버지' },
    { k: '형제', re: /(?:^|\s)(?:형|누나|언니|오빠|동생)/, r: ['형제 이야기가 나왔구나. 사이는 어떠니?', '그 사람이 너에게 어떤 존재니?'], mem: '형제' },
    { k: '가족', re: /가족|부모|집안/, r: ['가족 이야기를 해 보자. 누가 가장 먼저 떠오르니?'], mem: '가족' },
    { k: '친구', re: /친구|애들|단짝|친한/, r: ['친구들이 너에게 중요하구나.', '그 친구는 너를 어떻게 대하니?', '친구 이야기를 좀 더 해 줄래?'], mem: '친구' },
    { k: '선생님', re: /선생님|쌤|담임/, r: ['선생님이 너를 어떻게 생각한다고 느끼니?', '그 선생님 이야기를 좀 더 해 줄래?'] },
    { k: '시험', re: /시험|성적|점수|중간고사|기말|수능|등급/, r: ['시험이 너에게 어떤 의미니?', '시험 생각을 하면 몸이 어떻게 반응하니?', '결과가 나쁘면 무슨 일이 일어날 것 같니?'], mem: '시험' },
    { k: '공부', re: /공부|숙제|과제|수행/, r: ['공부할 때 가장 힘든 건 뭐니?', '그 과제가 왜 그렇게 마음에 걸리니?'] },
    { k: '학교', re: /학교|교실|등교/, r: ['학교에서 무슨 일이 있었니?', '학교 이야기를 할 때 어떤 기분이 드니?', '학교에서 가장 편한 곳은 어디니?'], mem: '학교' },
    { k: '슬퍼', re: /슬퍼|슬프|우울|눈물|울었|울고/, r: ['슬프다니 마음이 쓰이는구나. 언제부터 그랬니?', '무엇이 너를 가장 슬프게 하니?'] },
    { k: '화나', re: /화나|화가|짜증|열받|빡치|빡쳐/, r: ['무엇이 너를 화나게 했니?', '화가 날 때 너는 보통 어떻게 하니?'] },
    { k: '걱정', re: /무서|두려|걱정|불안|떨려/, r: ['무엇이 가장 걱정되니?', '그 걱정이 진짜가 되면 어떻게 될 것 같니?'] },
    { k: '피곤', re: /피곤|졸려|졸리|힘들|지쳐|지친/, r: ['요즘 많이 지쳤구나. 무엇 때문일까?', '마지막으로 푹 쉰 게 언제였니?'] },
    { k: '게임', re: /게임|롤|배그|마크|마인크래프트|발로란트|피파/, r: ['게임을 할 때 어떤 기분이 드니?', '게임 속에서는 무엇이 달라지니?', '게임 이야기를 하니 즐거워 보이는구나.'] },
    { k: '코딩', re: /코딩|코드|프로그래밍|개발|파이썬|자바/, r: ['코드를 짤 때 어떤 기분이 드니?', '무엇을 만들어 보고 싶니?'] },
    { k: '꿈', re: /꿈|미래|진로|대학|취업|직업/, r: ['미래를 생각하면 어떤 기분이 드니?', '어떤 사람이 되고 싶니?'] },
    { k: '사랑', re: /사랑|짝사랑|여친|남친|고백|썸/, r: ['그 사람 이야기를 좀 더 해 줄래?', '그 마음을 누군가에게 말해 본 적 있니?'] },
    { k: '밥', re: /배고|밥|급식|라면|간식|치킨/, r: ['먹는 이야기를 하니 기분이 좀 어떠니?', '오늘 급식은 어땠니?'] },
    { k: '돈', re: /돈|용돈|알바/, r: ['돈이 너에게 어떤 의미니?', '돈이 충분하다면 무엇이 달라질까?'] },
    { k: '너(ELIZA)', re: /(?:^|\s)(?:너는|넌|너도|네가|니가|너)(?:\s|$|\?)/, r: ['지금은 내 이야기 말고 네 이야기를 하자.', '왜 갑자기 내 이야기가 나왔을까?', '나보다 네가 더 궁금해. 너는 어때?'] },
    { k: '항상', re: /항상|맨날|언제나|매일/, r: ['구체적인 예를 하나 들어 줄래?', '정말 항상 그렇니?'] },
    { k: '아무도', re: /아무도|다들|모두|전부/, r: ['정말 아무도 그렇니?', '누군가 한 명을 떠올려 볼래?'] },
    { k: '몰라', re: /몰라|모르겠/, r: ['만약 안다면 뭐라고 할 것 같니?', '모르겠다고 하면 마음이 편해지니?'] },
    { k: '~싶어', re: /^(.*?)\s*(?:싶어|싶다|싶음|싶네)/, r: ['왜 {1} 싶니?', '{1} 싶다면, 무엇이 막고 있니?', '정말로 {1} 싶은 거니?'] },
    { k: '~싫어', re: /^(.*?)\s*(?:싫어|싫다|싫음|싫은)/, r: ['왜 {1} 싫다고 느끼니?', '{1} 싫어진 건 언제부터였니?', '싫다는 마음을 조금 더 이야기해 줄래?'] },
    { k: '~좋아', re: /^(.*?)\s*(?:좋아|좋다|좋음)/, r: ['{1} 좋은 이유가 뭐니?', '그게 좋을 때 어떤 기분이 드니?'] },
    { k: '왜', re: /왜/, r: ['왜 그게 궁금하니?', '너는 왜라고 생각하니?'] },
    { k: '안녕', re: /안녕|하이|ㅎㅇ|hello|^hi$/i, r: ['안녕. 오늘은 무슨 이야기를 하고 싶니?', '반가워. 요즘 마음에 걸리는 게 있니?'] },
    { k: '고마워', re: /고마|감사|ㄱㅅ/, r: ['천만에. 다른 이야기도 해 볼까?'] },
    { k: '응', re: /^(?:응|어|네|예|ㅇㅇ|그래|맞아)$/, r: ['꽤 확실한 것 같구나.', '조금 더 말해 줄래?'] },
    { k: '아니', re: /^(?:아니|아냐|아니요|ㄴㄴ)$/, r: ['왜 아니라고 생각하니?', '조금 부정적인 것 같구나.'] },
    { k: '나는 ~', re: /^(?:나는|난|저는)\s+(.+)$/, r: ['{1}… 그렇게 말하니 어떤 기분이 드니?', '네가 그렇게 생각하게 된 이유가 있니?'] },
  ];
  const ELIZA_DEFAULT = ['조금 더 자세히 말해 줄래?', '그렇구나. 그래서 어떤 기분이 들었니?', '그게 너에게 어떤 의미니?', '계속 이야기해 봐.', '흥미롭구나. 왜 그렇게 생각하니?'];

  /* ═════════ 9. backprop network ═════════ */
  const NN = { inX: 80, hX: 330, oX: 560, inY: [130, 330], hY: [70, 230, 390], oY: 230, r: 34 };

  Deck.part('history', 1, [
    /* ─────────────────────────── 1 ─────────────────────────── */
    {
      id: 'hype-curve',
      title: 'AI의 여름과 겨울',
      tag: '한눈에 보기',
      minutes: 1,
      notes: 'AI의 역사는 한 번에 쭉 올라간 게 아니라, 기대가 부풀었다 꺼지기를 되풀이했습니다. 약속한 만큼 결과가 안 나오면 돈이 끊기는데, 그 시기를 ‘AI 겨울’이라고 부릅니다. 곡선의 높이는 실제 수치가 아니라 분위기를 그린 그림이라는 것도 말해 주세요.\n클릭: 아래 띠(탄생 → 1차 여름 → 1차 겨울 …)를 왼쪽부터 하나씩 눌러 한 줄 설명을 읽고, 마지막 ‘지금’을 가리킵니다.\n참고: 1차 겨울은 없었다는 반론(역사가 토머스 헤이그)도 있습니다.\n질문: “지금은 여름일까요? 다음 겨울이 온다면 무엇 때문일까요?”',
      html: `
        <style>
          #f-hype-curve .stage, #f-y1943 .stage, #f-y1950 .stage, #f-y1956 .stage, #f-y1958 .stage,
          #f-y1966 .stage, #f-y1969 .stage, #f-y1980s .stage, #f-y1986 .stage { word-break: keep-all; }
        </style>
        <div class="row" style="justify-content:space-between;align-items:flex-end">
          <div class="stack" style="gap:6px">
            <div class="kicker">1950 → 2026 · 기대와 돈의 날씨</div>
            <h2 class="title">AI의 여름과 겨울</h2>
          </div>
          <div class="hand" style="transform:rotate(-2deg);margin-bottom:10px">부풀면, 꺼진다. 그리고 다시.</div>
        </div>
        <div class="demo" style="height:540px">
          <svg class="chart hc" viewBox="0 0 1416 530" width="1416" height="530" style="margin-top:14px">${hypeSVG()}</svg>
        </div>
        <div class="hc-say" style="font-size:29px;line-height:1.3;display:flex;gap:18px;align-items:baseline;min-height:42px"></div>
        <div class="src">출처: Wikipedia ‘AI winter’, ‘History of artificial intelligence’ (구간 연도) · 곡선 높이는 연출용 주관값</div>`,
      init(el) {
        const say = el.querySelector('.hc-say');
        const act = el.querySelector('.hc-act');
        const segs = Array.from(el.querySelectorAll('.hc-seg'));
        const idle = () => { say.innerHTML = '<span class="mono small muted">되풀이되는 패턴</span><span>과장된 예언 → 실망 → 돈이 끊김(<b class="pen">겨울</b>) → 조용한 연구 → 다시 폭발</span>'; };
        const pick = (i) => {
          const [a, b, name, line] = HC_PHASES[i];
          act.setAttribute('x', hx(a)); act.setAttribute('width', Math.min(hx(b), HC.X1 + 10) - hx(a)); act.style.opacity = 1;
          segs.forEach((s, j) => {
            const win = /겨울/.test(HC_PHASES[j][2]);
            s.querySelector('.hc-rib').style.fill = j === i ? 'var(--hl)' : (win ? 'var(--pen-soft)' : 'var(--paper-2)');
            s.querySelector('text').style.fill = j === i ? 'var(--sticky-ink)' : (win ? 'var(--pen)' : 'var(--ink)');
          });
          const yrs = `${a}–${b > 2026 ? '' : b}`;
          say.innerHTML = `<b class="mono" style="font-size:26px;white-space:nowrap">${yrs}</b><b style="white-space:nowrap">${name}</b><span>${line}</span>`;
        };
        segs.forEach((s, i) => { s.addEventListener('mouseenter', () => pick(i)); s.addEventListener('click', () => pick(i)); });
        idle();
      },
    },

    /* ─────────────────────────── 2 ─────────────────────────── */
    {
      id: 'y1943',
      title: '1943 · 뉴런을 논리 회로로',
      year: '1943',
      minutes: 0.8,
      notes: '1943년, 신경생리학자 매컬럭과 독학으로 논리학을 익힌 젊은 피츠가 “뇌의 뉴런은 켜짐/꺼짐으로 동작하는 논리 회로처럼 볼 수 있다”는 논문을 냈습니다. 오늘날 모든 인공신경망의 조상 아이디어입니다.\n클릭: 입력 A·B 스위치를 눌러 켜고, 임계값 θ 슬라이더를 움직입니다. θ=2이면 둘 다 켜져야 불이 켜지는 AND, θ=1이면 하나만 켜져도 켜지는 OR가 됩니다. 오른쪽 표가 그 θ에서의 전체 동작입니다.\n피츠 이야기: 12살 때 도서관에서 3일 동안 『수학 원리』를 읽고 저자 러셀에게 틀린 곳을 편지로 보냈습니다. 15살에 집을 나와 시카고로 갔고, 18살 때 만난 매컬럭이 그를 자기 집에 살게 하며 함께 연구했습니다.\n질문: “아까 개념 정류장에서 XOR은 직선 하나로 안 된다는 걸 봤죠? θ 하나로도 마찬가지예요.” 그 벽에 진짜로 부딪힌 게 1969년입니다.',
      html: `
        <style>
          #f-y1943 .tt { border-collapse: collapse; font-family: var(--font-mono); font-size: 24px; }
          #f-y1943 .tt th { font-weight: 600; color: var(--ink-2); font-size: 20px; padding: 2px 14px 6px; border-bottom: 3px solid var(--ink); }
          #f-y1943 .tt td { padding: 4px 14px; text-align: center; border-bottom: 1.5px dashed var(--ink-3); }
          #f-y1943 .tt tr.cur td { background: var(--hl-soft); }
          #f-y1943 .tt td.on { font-weight: 700; }
          #f-y1943 .sw:hover .sw-body { stroke-width: 5; }
        </style>
        <div class="kicker">1943 · 워런 매컬럭 &amp; 월터 피츠</div>
        <h2 class="title">뉴런을 <span class="mark">논리 회로</span>로</h2>
        <div class="row" style="flex:1;gap:44px;align-items:stretch">
          <div style="width:440px;flex:none;position:relative">
            ${K.photo('pitts', '월터 피츠', '', 'position:absolute;left:4px;top:18px;--w:236px;--tilt:-2.5deg')}
            ${nameCard('워런 매컬럭', '신경생리학자', 'left:244px;top:118px;--tilt:2.5deg')}
            <p class="small" style="position:absolute;left:0;top:432px;width:440px;line-height:1.45">피츠는 <b>12살</b>에 도서관에서 3일 동안 <span style="white-space:nowrap">『수학 원리』</span>를 읽고, 공저자 러셀에게 <span class="mark">틀린 곳을 편지로</span> 보낸 독학 소년이었다.</p>
          </div>
          <div class="demo grow stack" style="gap:14px">
            <svg class="n43" viewBox="0 0 880 310" width="920" height="324" style="overflow:visible">${neuronSVG()}</svg>
            <div class="row" style="gap:36px;align-items:flex-start">
              <div class="stack" style="width:330px;gap:10px">
                <div class="field"><label>임계값 θ <output class="th-out">2.5</output></label>
                  <input class="th" type="range" min="0" max="3" step="0.5" value="2.5"></div>
                <div class="small muted" style="line-height:1.35">스위치를 누르고 θ를 움직여 <b>AND</b>와 <b>OR</b>를 찾아보세요.</div>
              </div>
              <table class="tt"><thead><tr><th>A</th><th>B</th><th>출력</th></tr></thead><tbody></tbody></table>
              <div class="stack" style="gap:8px">
                <div class="mono muted" style="font-size:20px">지금 이 뉴런은</div>
                <div class="gate" style="font-family:var(--font-display);font-weight:800;font-size:50px;line-height:1.05;white-space:nowrap">-</div>
                <div class="row" style="gap:10px"><span class="chip f-and">AND 찾기</span><span class="chip f-or">OR 찾기</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="src">출처: McCulloch &amp; Pitts (1943) “A Logical Calculus of the Ideas Immanent in Nervous Activity” · Nautilus, “The Man Who Tried to Redeem the World with Logic”</div>`,
      init(el) {
        const st = { x: [1, 1], th: 2.5, found: { AND: false, OR: false } };
        const svg = el.querySelector('.n43');
        const sws = Array.from(svg.querySelectorAll('.sw'));
        const wires = [svg.querySelector('.w0'), svg.querySelector('.w1')], wo = svg.querySelector('.wo');
        const tb = el.querySelector('.tt tbody'), gate = el.querySelector('.gate');
        const out = (a, b) => (a + b >= st.th ? 1 : 0);
        const wireStyle = (p, on) => { p.style.stroke = on ? 'var(--ink)' : 'var(--ink-3)'; p.style.strokeWidth = on ? 6 : 3; p.style.strokeDasharray = on ? 'none' : '8 9'; };
        const draw = () => {
          sws.forEach((g, i) => {
            const on = st.x[i] === 1, y = i ? 190 : 40;
            g.querySelector('.sw-body').style.fill = on ? 'var(--hl)' : 'var(--paper-2)';
            g.querySelector('.sw-knob').setAttribute('cx', on ? 130 : 58);
            g.querySelector('.sw-val').textContent = st.x[i];
            void y;
            wireStyle(wires[i], on);
          });
          const s = st.x[0] + st.x[1], o = out(st.x[0], st.x[1]);
          svg.querySelector('.n-sum').textContent = `합 = ${s}`;
          svg.querySelector('.n-th').textContent = `θ = ${st.th}`;
          wireStyle(wo, !!o);
          svg.querySelector('.bulb').style.fill = o ? 'var(--hl)' : 'var(--paper)';
          svg.querySelector('.rays').style.opacity = o ? 1 : 0;
          svg.querySelector('.o-val').textContent = `출력 ${o}`;
          const rows = [[0, 0], [0, 1], [1, 0], [1, 1]];
          const v = rows.map(([a, b]) => out(a, b));
          tb.innerHTML = rows.map(([a, b], i) => `<tr class="${a === st.x[0] && b === st.x[1] ? 'cur' : ''}"><td>${a}</td><td>${b}</td><td class="${v[i] ? 'on' : ''}">${v[i]}</td></tr>`).join('');
          const key = v.join('');
          const name = key === '0001' ? 'AND' : key === '0111' ? 'OR' : key === '1111' ? '항상 켜짐' : key === '0000' ? '항상 꺼짐' : '?';
          gate.textContent = name;
          gate.style.color = name.length <= 3 ? 'var(--ink)' : 'var(--ink-3)';
          if (name === 'AND' || name === 'OR') st.found[name] = true;
          el.querySelector('.f-and').classList.toggle('on', st.found.AND);
          el.querySelector('.f-and').textContent = st.found.AND ? 'AND 찾음' : 'AND 찾기';
          el.querySelector('.f-or').classList.toggle('on', st.found.OR);
          el.querySelector('.f-or').textContent = st.found.OR ? 'OR 찾음' : 'OR 찾기';
          el.querySelector('.th-out').textContent = st.th;
        };
        sws.forEach((g, i) => g.addEventListener('click', () => { st.x[i] = 1 - st.x[i]; draw(); }));
        el.querySelector('.th').addEventListener('input', (e) => { st.th = +e.target.value; draw(); });
        draw();
      },
    },

    /* ─────────────────────────── 3 ─────────────────────────── */
    {
      id: 'y1950',
      title: '1950 · 튜링: 기계는 생각할 수 있는가?',
      year: '1950',
      minutes: 1.3,
      notes: '튜링은 “기계가 생각할 수 있는가?”라는 막연한 질문을 시험 하나로 바꿨습니다. 칸막이 너머 사람과 기계에게 글자로만 질문하고, 심판이 어느 쪽이 기계인지 맞히는 ‘흉내 게임’, 즉 튜링 테스트입니다.\n클릭: 학생들에게 손을 들게 해서 A/B 중 기계라고 생각하는 방을 누릅니다. 공개된 단서를 읽고 [다음 질문]. 3번째 질문에서 반전이 있습니다. (답은 강의용으로 지어낸 예시)\n→ 키로 아래 숫자 3개를 띄웁니다: 튜링은 50년쯤 뒤엔 5분 대화 후 심판 정답률이 70% 이하로 떨어질 거라 예측했고, 2025년 UC샌디에이고 실험에서 사람 흉내(페르소나)를 지시받은 GPT-4.5는 심판의 73%가 ‘사람’으로 골랐습니다(진짜 사람보다 높음). 같은 실험에서 1966년 ELIZA는 23%.\n왼쪽 아래 봄브는 튜링이 설계에 참여해 2차 대전 때 독일군 암호 에니그마를 푸는 데 쓴 기계(복원품)입니다.\n질문: “여러분이 심판이라면 어떤 질문으로 기계를 잡아내겠어요?”',
      html: `
        <style>
          #f-y1950 .ig { position: relative; width: 1000px; height: 352px; }
          #f-y1950 .ig-judge { position: absolute; left: 0; top: 0; width: 300px; height: 352px; }
          #f-y1950 .ig-q { position: absolute; left: 0; top: 168px; width: 300px; border: 3px solid var(--ink); border-radius: 18px 6px 16px 5px / 6px 16px 5px 18px; padding: 14px 18px; font-size: 28px; font-weight: 600; line-height: 1.3; background: var(--paper); }
          #f-y1950 .ig-wall { position: absolute; left: 326px; top: -6px; width: 30px; height: 364px; border-left: 3px solid var(--ink); border-right: 3px solid var(--ink); background: repeating-linear-gradient(45deg, var(--ink-3) 0 2.5px, transparent 2.5px 11px); }
          #f-y1950 .ig-room { position: absolute; left: 384px; width: 616px; height: 164px; text-align: left; font: inherit; color: var(--ink); background: var(--paper); border: 3px solid var(--ink); border-radius: 16px 6px 14px 5px / 6px 14px 5px 16px; padding: 12px 20px 12px 96px; cursor: pointer; }
          #f-y1950 .ig-room:hover { background: var(--hl-soft); }
          #f-y1950 .ig-room .lab { position: absolute; left: 22px; top: 14px; font-family: var(--font-mono); font-weight: 600; font-size: 54px; line-height: 1; }
          #f-y1950 .ig-room .who { position: absolute; left: 16px; bottom: 12px; font-family: var(--font-hand); font-size: 38px; color: var(--pen); }
          #f-y1950 .ig-room .t { display: block; font-family: var(--font-mono); font-size: 20px; color: var(--ink-3); }
          #f-y1950 .ig-room .ans { display: block; font-size: 28px; line-height: 1.32; }
          #f-y1950 .ig-room.right { box-shadow: inset 0 0 0 4px var(--good); }
          #f-y1950 .ig-room.wrong { box-shadow: inset 0 0 0 4px var(--bad); }
          #f-y1950 .ig-room.done { cursor: default; }
          #f-y1950 .ig-room.done:hover { background: var(--paper); }
          #f-y1950 .stat b { font-size: 64px; }
          #f-y1950 .stat span { font-size: 22px; line-height: 1.35; }
        </style>
        ${K.photo('turing', '앨런 튜링', '', 'position:absolute;left:96px;top:70px;--w:330px;--tilt:-2deg')}
        ${K.photo('bombe', '튜링의 봄브 <small>복원품</small>', 'sm wide tilt-r', 'position:absolute;left:178px;top:560px;--w:270px')}
        <div class="abs stack" style="left:500px;top:64px;width:1008px;gap:6px">
          <div class="kicker">1950 · 앨런 튜링 · 학술지 Mind</div>
          <h2 class="title" style="white-space:nowrap">“기계는 생각할 수 있는가?”</h2>
          <div class="mono muted" style="font-size:22px">“I propose to consider the question, ‘Can machines think?’”</div>
        </div>
        <div class="abs demo" style="position:absolute;left:500px;top:258px;width:1008px">
          <div class="ig">
            <svg width="1000" height="352" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">
              <path d="${ring(70, 66, 34, 3)}" style="fill:none;stroke:var(--ink);stroke-width:3.5"/>
              <path d="M20,150 C24,112 116,112 120,150" style="fill:none;stroke:var(--ink);stroke-width:3.5;stroke-linecap:round"/>
              <text x="140" y="80" style="font-family:var(--font-display);font-weight:700;font-size:30px;fill:var(--ink)">심판 C</text>
              <text x="140" y="112" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">글자로만 묻는다</text>
              <path d="M300,232 C340,232 350,90 384,84" style="fill:none;stroke:var(--ink-2);stroke-width:2.5;stroke-dasharray:7 7"/>
              <path d="M300,250 C340,250 350,268 384,272" style="fill:none;stroke:var(--ink-2);stroke-width:2.5;stroke-dasharray:7 7"/>
            </svg>
            <div class="ig-q"></div>
            <div class="ig-wall" title="칸막이"></div>
            <button class="ig-room" data-k="0" style="top:0"><span class="lab">A</span><span class="who"></span><span class="t"></span><span class="ans"></span></button>
            <button class="ig-room" data-k="1" style="top:188px"><span class="lab">B</span><span class="who"></span><span class="t"></span><span class="ans"></span></button>
            <div class="mono faint" style="position:absolute;left:0;bottom:0;width:300px;font-size:20px;line-height:1.3">* 답은 강의용으로 지어낸 예시</div>
          </div>
          <div class="row center" style="margin-top:14px;gap:20px;min-height:52px">
            <div class="ig-msg grow" style="font-size:25px;line-height:1.25"></div>
            <span class="mono ig-score" style="font-size:22px;white-space:nowrap"></span>
            <button class="btn ig-next">다음 질문 →</button>
          </div>
        </div>
        <div class="abs cols-3" data-step="1" style="left:500px;top:712px;width:1008px;gap:30px">
          <div class="stat"><b>≤70%</b><span>튜링의 예언: 50년쯤 뒤, 5분 대화 후 심판의 정답률</span></div>
          <div class="stat"><b class="pen">73%</b><span>2025년 실험: GPT-4.5를 ‘사람’으로 고른 비율 (진짜 사람보다 높음)</span></div>
          <div class="stat"><b style="color:var(--ink-3)">23%</b><span>같은 실험, 1966년 ELIZA</span></div>
        </div>
        <div class="src">출처: A. M. Turing, “Computing Machinery and Intelligence”, Mind (1950) · Jones &amp; Bergen, UC San Diego (2025, arXiv:2503.23674)</div>`,
      init(el) {
        const st = { qi: 0, picked: null, score: 0 };
        const rooms = Array.from(el.querySelectorAll('.ig-room'));
        const msg = el.querySelector('.ig-msg'), next = el.querySelector('.ig-next'), score = el.querySelector('.ig-score');
        const render = () => {
          const Q = QZ[st.qi];
          el.querySelector('.ig-q').textContent = Q.q;
          [Q.a, Q.b].forEach((ans, i) => {
            const r = rooms[i];
            r.querySelector('.t').textContent = ans[0];
            r.querySelector('.ans').textContent = ans[1];
            const shown = st.picked != null;
            r.querySelector('.who').textContent = shown ? (i === Q.m ? '기계' : '사람') : '';
            r.classList.toggle('done', shown);
            r.classList.toggle('right', shown && st.picked === i && i === Q.m);
            r.classList.toggle('wrong', shown && st.picked === i && i !== Q.m);
          });
          if (st.picked == null) msg.innerHTML = '<span class="hand" style="font-size:38px">어느 방이 기계일까? 방을 클릭!</span>';
          else msg.innerHTML = `<b class="${st.picked === Q.m ? 'good' : 'bad'}">${st.picked === Q.m ? '정답!' : '땡!'}</b> ${'AB'[Q.m]}가 기계. ${Q.why}`;
          score.textContent = `${st.qi + 1}/3 · 맞힘 ${st.score}`;
          next.textContent = st.qi === QZ.length - 1 && st.picked != null ? '다시 하기' : '다음 질문 →';
          next.disabled = st.picked == null;
        };
        rooms.forEach((r, i) => r.addEventListener('click', () => {
          if (st.picked != null) return;
          st.picked = i;
          if (i === QZ[st.qi].m) st.score++;
          render();
        }));
        next.addEventListener('click', () => {
          if (st.picked == null) return;
          if (st.qi === QZ.length - 1) { st.qi = 0; st.score = 0; } else st.qi++;
          st.picked = null;
          render();
        });
        render();
      },
    },

    /* ─────────────────────────── 4 ─────────────────────────── */
    {
      id: 'y1956',
      title: '1956 · 다트머스: ‘인공지능’이라는 이름',
      year: '1956',
      minutes: 0.8,
      notes: '1956년 여름, 미국 다트머스 대학에 모인 사람들이 이 분야에 ‘Artificial Intelligence’라는 이름을 붙였습니다. 이름은 존 매카시가 1955년에 고른 것입니다.\n제안서의 자신감을 보세요: “2개월 동안 10명이 연구하면, 여름 한 철에 상당한 진전을 이룰 수 있다.” 록펠러 재단에 1만 3,500달러를 요청했지만 실제로 받은 돈은 7,500달러였습니다.\n깨알 사실: 참석자 명단에는 영화 「뷰티풀 마인드」의 주인공 존 내시도 있었습니다.\n질문: “여름 두 달이면 될 줄 알았던 일이 왜 70년째 진행 중일까요?”',
      html: `
        <style>
          #f-y1956 .doc { background: var(--paper-2); border: 2px solid var(--ink-3); padding: 24px 28px 22px; position: relative; transform: rotate(0.6deg); }
          #f-y1956 .doc .en { font-family: var(--font-mono); font-size: 21px; line-height: 1.5; color: var(--ink); }
          #f-y1956 .doc::before { content: ""; position: absolute; top: -15px; left: 40px; width: 120px; height: 30px; background: var(--tape); transform: rotate(-4deg); }
        </style>
        ${K.photo('mccarthy', '존 매카시', '', 'position:absolute;left:100px;top:96px;--w:250px;--tilt:-3deg;--pos:50% 25%')}
        ${K.photo('minsky', '마빈 민스키', 'tilt-r', 'position:absolute;left:392px;top:132px;--w:220px')}
        ${K.photo('shannon', '클로드 섀넌', '', 'position:absolute;left:128px;top:500px;--w:214px;--tilt:1.6deg')}
        ${nameCard('너새니얼<br>로체스터', 'IBM 연구원', 'left:398px;top:566px;height:190px;--tilt:-1.8deg')}
        <div class="abs hand" style="left:96px;top:30px;font-size:40px;transform:rotate(-2deg)">제안자 4인 ↓</div>
        <div class="abs stack" style="left:770px;top:64px;width:738px;gap:20px">
          <div class="kicker">1956 · 다트머스 여름 워크숍</div>
          <h2 class="title md">‘인공지능’이라는 이름이<br>태어난 여름</h2>
          <div class="doc">
            <div class="mono faint" style="font-size:20px;margin-bottom:10px">제안서 · 1955. 8. 31.</div>
            <div class="en" style="font-weight:600">A PROPOSAL FOR THE DARTMOUTH SUMMER RESEARCH PROJECT ON <span class="mark">ARTIFICIAL INTELLIGENCE</span></div>
            <div class="en" style="margin-top:12px">“We propose that a <span class="mark">2 month, 10 man study</span> of artificial intelligence be carried out during the summer of 1956 …”</div>
            <div style="margin-top:14px;font-size:27px;line-height:1.4">“<b>2개월 동안 10명</b>이 연구하면 … <b>여름 한 철</b>에 상당한 진전을 이룰 수 있다.”</div>
          </div>
          <div class="row" style="gap:34px;align-items:flex-end;margin-top:6px">
            <div class="stat"><b style="font-size:58px;color:var(--ink-3)" class="strike">$13,500</b><span>요청한 돈 (1만 3,500달러)</span></div>
            <div class="hand" style="font-size:52px;align-self:center">→</div>
            <div class="stat"><b style="font-size:58px">$7,500</b><span>실제로 받은 돈 (록펠러 재단)</span></div>
          </div>
          <div class="hand" style="font-size:44px;transform:rotate(-1.5deg)">그 ‘여름 한 철’이 70년째 이어지는 중</div>
        </div>
        <div class="src">출처: McCarthy, Minsky, Rochester, Shannon, “A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence” (1955, Stanford 전사본) · Wikipedia ‘Dartmouth workshop’ · Philanthropy Roundtable</div>`,
    },

    /* ─────────────────────────── 5 ─────────────────────────── */
    {
      id: 'y1958',
      title: '1958 · 퍼셉트론: 스스로 배우는 뉴런',
      year: '1958',
      minutes: 0.8,
      notes: '1943년 인공 뉴런은 사람이 임계값을 손으로 맞춰야 했습니다. 1957년 보고서로 제안되고 1958년 7월 29세의 심리학자 로젠블랫이 공개한 퍼셉트론은 틀릴 때마다 스스로 가중치를 고칩니다. 1958년 발표 때는 IBM 704 컴퓨터로 흉내 냈고, 1960년에 공개된 실제 기계 마크 I에서는 가중치가 다이얼(가변저항)이어서 학습하면 전기 모터가 다이얼을 돌렸습니다.\n클릭: [예제 하나 넣기]를 몇 번 눌러 틀릴 때 다이얼이 돌아가는 걸 보여 주고, [다 맞을 때까지]로 AND를 끝까지 배우게 합니다.\n뉴욕타임스는 해군이 이것을 “걷고, 말하고, 보고, 쓰고, 스스로 복제하고, 자기 존재를 의식할” 것으로 기대하는 컴퓨터의 배아라고 보도했습니다. 과장의 시작입니다.\n질문: “지금 AI 뉴스 중에도 이런 과장이 있을까요?”',
      html: `
        <style>
          #f-y1958 .clip { background: var(--paper-2); border: 2px solid var(--ink-3); padding: 18px 26px 20px; position: absolute; transform: rotate(-0.5deg); }
          #f-y1958 .ex { border-collapse: collapse; font-family: var(--font-mono); font-size: 22px; }
          #f-y1958 .ex th { font-weight: 600; color: var(--ink-2); font-size: 20px; padding: 0 10px 6px; border-bottom: 3px solid var(--ink); font-family: var(--font-body); }
          #f-y1958 .ex td { padding: 3px 10px; text-align: center; border-bottom: 1.5px dashed var(--ink-3); }
          #f-y1958 .ex tr.cur td { background: var(--hl-soft); }
          #f-y1958 .ex td.ok { color: var(--good); font-weight: 700; }
          #f-y1958 .ex td.no { color: var(--bad); font-weight: 700; }
        </style>
        <div class="abs stack" style="left:92px;top:64px;width:820px;gap:8px">
          <div class="kicker">1957–58 · 프랭크 로젠블랫 · 코넬 항공연구소</div>
          <h2 class="title md">퍼셉트론: <span class="mark">스스로 배우는</span> 뉴런</h2>
        </div>
        <div class="abs clip" style="left:92px;top:196px;width:820px">
          <div class="mono faint" style="font-size:19px">The New York Times · 1958년 7월 8일</div>
          <div style="font-family:var(--font-display);font-weight:800;font-size:33px;line-height:1.15;margin:4px 0 8px;white-space:nowrap">NEW NAVY DEVICE LEARNS BY DOING</div>
          <div style="font-size:26px;line-height:1.42">해군은 걷고, 말하고, 보고, 쓰고, 스스로 복제하고, <span class="mark">자기 존재를 의식할</span> 것으로 기대하는 전자 컴퓨터의 ‘배아’를 공개했다.</div>
          <div class="hand abs" style="right:18px;top:-30px;font-size:42px;transform:rotate(6deg)">과장 주의!</div>
        </div>
        <div class="abs demo" style="position:absolute;left:92px;top:446px;width:820px">
          <div style="font-size:25px;line-height:1.35;margin-bottom:6px;white-space:nowrap">1943년엔 사람이 θ를 맞췄다 → 이제 <b>틀릴 때마다 기계가 다이얼을 돌린다</b></div>
          <div class="row" style="gap:22px;align-items:center">
            <svg class="dials" viewBox="0 0 480 214" width="480" height="214" style="overflow:visible"></svg>
            <div class="stack" style="gap:6px"><div class="mono" style="font-size:20px;color:var(--ink-2)">목표: <b style="color:var(--ink)">AND</b> 배우기</div>
            <table class="ex"><thead><tr><th>A</th><th>B</th><th>정답</th><th>퍼셉트론</th></tr></thead><tbody></tbody></table></div>
          </div>
          <div class="row center" style="gap:12px;margin-top:8px">
            <button class="btn sm p-step">예제 하나 넣기</button>
            <button class="btn sm p-run">다 맞을 때까지</button>
            <button class="btn sm ghost p-reset">처음으로</button>
            <div class="p-msg grow" style="font-size:22px;line-height:1.25;color:var(--pen)"></div>
          </div>
        </div>
        ${K.photo('mark1-perceptron', '마크 I 퍼셉트론 <small>1960 공개</small>', 'wide', 'position:absolute;left:968px;top:78px;--w:520px;--tilt:1.8deg;--pos:50% 50%')}
        ${K.photo('rosenblatt', '로젠블랫', 'sm', 'position:absolute;left:952px;top:528px;--w:176px;--tilt:-4deg')}
        <div class="abs hand" style="left:1160px;top:590px;width:350px;font-size:36px;line-height:1.25">
          눈: 광센서 400개 (20×20)<br>가중치 = 모터가 돌리는 다이얼<br><span style="font-size:32px">그런 다이얼이 약 1,000개</span>
        </div>
        <div class="src">출처: NYT 1958-07-08 “New Navy Device Learns By Doing” · Wikipedia ‘Perceptron’, ‘Frank Rosenblatt’ · Epoch AI ‘Notable AI Models’(파라미터 추정)</div>`,
      init(el, K, f) {
        const X = [[0, 0], [0, 1], [1, 0], [1, 1]], T = [0, 0, 0, 1], ETA = 0.5;
        const START = { w: [-0.5, 1], th: 0 };
        const st = { w: START.w.slice(), th: START.th, k: 0, cur: -1, run: false, wait: 0, shown: [START.w[0], START.w[1], START.th] };
        const svg = el.querySelector('.dials'), tb = el.querySelector('.ex tbody'), msg = el.querySelector('.p-msg');
        const D = [[80, 'A의 가중치'], [240, 'B의 가중치'], [400, '임계값 θ']];
        const ang = (v) => ((-135 + ((K.clamp(v, -3, 3) + 3) / 6) * 270) * Math.PI) / 180;
        let h = '';
        D.forEach(([cx, lab], i) => {
          h += `<text x="${cx}" y="20" text-anchor="middle" style="font-family:var(--font-body);font-weight:600;font-size:20px;fill:var(--ink-2)">${lab}</text>`;
          for (let v = -3; v <= 3.01; v += 0.5) {
            const a = ang(v), big = Math.abs(v % 1) < 0.01;
            h += `<line x1="${cx + Math.sin(a) * 60}" y1="${104 - Math.cos(a) * 60}" x2="${cx + Math.sin(a) * (big ? 72 : 67)}" y2="${104 - Math.cos(a) * (big ? 72 : 67)}" style="stroke:var(--ink-2);stroke-width:${big ? 3 : 1.5}"/>`;
          }
          h += `<path d="${ring(cx, 104, 52, 40 + i * 3)}" style="fill:var(--paper);stroke:var(--ink);stroke-width:3.5"/>`;
          h += `<line class="ptr" data-i="${i}" x1="${cx}" y1="104" x2="${cx}" y2="60" style="stroke:var(--ink);stroke-width:6;stroke-linecap:round"/>`;
          h += `<circle cx="${cx}" cy="104" r="12" style="fill:var(--hl);stroke:var(--ink);stroke-width:3"/>`;
          h += `<text x="${cx - 72}" y="196" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-3)">-3</text><text x="${cx + 72}" y="196" text-anchor="end" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-3)">+3</text>`;
          h += `<text class="dv" data-i="${i}" x="${cx}" y="200" text-anchor="middle" style="font-family:var(--font-mono);font-weight:600;font-size:26px;fill:var(--ink)">0</text>`;
        });
        svg.innerHTML = h;
        const ptrs = Array.from(svg.querySelectorAll('.ptr')), dvs = Array.from(svg.querySelectorAll('.dv'));
        const target = () => [st.w[0], st.w[1], st.th];
        const fmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
        const predict = (x) => (st.w[0] * x[0] + st.w[1] * x[1] >= st.th ? 1 : 0);
        const drawDials = () => {
          const tg = target();
          st.shown.forEach((v, i) => {
            const a = ang(v), cx = D[i][0];
            // runs every frame while any dial turns: leave the dials and values that did not change untouched
            const x2 = String(cx + Math.sin(a) * 44), y2 = String(104 - Math.cos(a) * 44);
            if (ptrs[i].getAttribute('x2') !== x2) ptrs[i].setAttribute('x2', x2);
            if (ptrs[i].getAttribute('y2') !== y2) ptrs[i].setAttribute('y2', y2);
            setText(dvs[i], fmt(tg[i]));
          });
        };
        const drawTable = () => {
          tb.innerHTML = X.map((x, i) => { const p = predict(x), ok = p === T[i]; return `<tr class="${i === st.cur ? 'cur' : ''}"><td>${x[0]}</td><td>${x[1]}</td><td>${T[i]}</td><td class="${ok ? 'ok' : 'no'}">${p} ${ok ? '맞음' : '틀림'}</td></tr>`; }).join('');
        };
        const correct = () => X.filter((x, i) => predict(x) === T[i]).length;
        const idleMsg = () => { msg.textContent = `지금 4개 중 ${correct()}개 맞힘. 예제를 넣어 가르쳐 보세요.`; };
        const step = () => {
          const i = st.k % 4; st.k++; st.cur = i;
          const x = X[i], p = predict(x), e = T[i] - p;
          if (e) {
            const d = [ETA * e * x[0], ETA * e * x[1], -ETA * e];
            st.w[0] += d[0]; st.w[1] += d[1]; st.th += d[2];
            const parts = [['A', d[0]], ['B', d[1]], ['θ', d[2]]].filter((q) => q[1]).map((q) => `<span style="white-space:nowrap">${q[0]} ${fmt(q[1])}</span>`);
            msg.innerHTML = `(${x[0]},${x[1]}) 틀림 → 다이얼 돌림: ${parts.join(', ')}`;
          } else msg.innerHTML = `(${x[0]},${x[1]}) 맞음 → 그대로`;
          if (correct() === 4) { msg.innerHTML = '<b>4개 모두 맞힘. AND를 스스로 배웠다!</b>'; st.run = false; }
          drawTable(); drawDials();
        };
        const reset = () => { st.w = START.w.slice(); st.th = START.th; st.k = 0; st.cur = -1; st.run = false; st.shown = target(); drawTable(); drawDials(); idleMsg(); };
        el.querySelector('.p-step').addEventListener('click', () => { st.run = false; if (correct() === 4) reset(); step(); });
        el.querySelector('.p-run').addEventListener('click', () => { if (correct() === 4) reset(); st.run = true; st.wait = 0; });
        el.querySelector('.p-reset').addEventListener('click', reset);
        K.loop(el, (t, dt) => {
          const tg = target();
          let moving = false;
          st.shown = st.shown.map((v, i) => { const nv = v + (tg[i] - v) * Math.min(1, dt * 7); if (Math.abs(tg[i] - nv) > 0.002) moving = true; return Math.abs(tg[i] - nv) < 0.002 ? tg[i] : nv; });
          if (moving) drawDials();
          if (st.run) { st.wait -= dt; if (st.wait <= 0) { step(); st.wait = 0.7; } }
        });
        f.leave = () => { st.run = false; st.shown = target(); drawDials(); };
        reset();
      },
    },

    /* ─────────────────────────── 6 ─────────────────────────── */
    {
      id: 'y1966',
      title: '1966 · ELIZA: 최초의 챗봇',
      year: '1966',
      minutes: 1.4,
      notes: 'MIT의 와이젠바움이 만든 ELIZA는 상담사를 흉내 낸 최초의 챗봇입니다. 원리는 단순합니다. 문장에서 ‘엄마’, ‘시험’ 같은 키워드를 찾아, 미리 적어 둔 질문으로 되돌려줄 뿐 아무것도 이해하지 못합니다.\n실습: 학생 한 명에게 터미널에 직접 입력하게 하거나 아래 예시 버튼을 누릅니다. 각 답 밑의 회색 줄이 ‘어떤 규칙이 걸렸는지’입니다. 규칙에 없는 말을 하면 기본 반응이 돌아가며 나옵니다.\n일화: 와이젠바움의 비서가 ELIZA와 ‘진짜 대화’를 하겠다며 그에게 방에서 나가 달라고 했습니다. 단순한 프로그램인데도 사람이 이해받는다고 느끼는 것, 이것이 ELIZA 효과입니다. 와이젠바움은 이후 평생 AI를 경고하는 사람이 됐습니다.\n안전: ‘죽고 싶어’ 같은 말은 되돌리지 않고 상담 번호(청소년상담 1388, 자살예방 상담 109)를 안내하도록 해 두었습니다.\n질문: “ELIZA가 ‘나를 이해한다’고 느낀 적이 있다면, 그건 기계 쪽 능력일까요, 우리 쪽 습관일까요?”',
      html: `
        <style>
          #f-y1966 .term { position: relative; display: flex; flex-direction: column; padding: 18px 24px 16px; }
          #f-y1966 .e-log { flex: 1; overflow-y: auto; scrollbar-width: thin; display: flex; flex-direction: column; gap: 4px; padding-right: 6px; }
          #f-y1966 .e-log { --ft: #000; --fb: #000; -webkit-mask-image: linear-gradient(to bottom, var(--ft) 0, #000 30px, #000 calc(100% - 30px), var(--fb) 100%); mask-image: linear-gradient(to bottom, var(--ft) 0, #000 30px, #000 calc(100% - 30px), var(--fb) 100%); }
          #f-y1966 .e-log.above { --ft: transparent; }
          #f-y1966 .e-log.below { --fb: transparent; }
          #f-y1966 .e-line { font-size: 25px; line-height: 1.4; animation: h1fade .35s ease; overflow-wrap: anywhere; }
          #f-y1966 .e-why { font-size: 20px; line-height: 1.3; color: var(--term-dim); margin: -2px 0 6px 92px; overflow-wrap: anywhere; }
          #f-y1966 .e-in { display: flex; gap: 12px; align-items: center; border-top: 1.5px dashed var(--term-dim); padding-top: 10px; margin-top: 8px; font-size: 25px; }
          #f-y1966 .e-in > span { flex: none; white-space: nowrap; }
          #f-y1966 .e-in > input { flex: 1; min-width: 0; width: auto; }
          #f-y1966 .term input[type="text"] { background: transparent; border: 0; outline: 0; padding: 0; color: var(--term-fg); font-family: var(--font-mono); font-size: 25px; border-radius: 0; }
          #f-y1966 .term input::placeholder { color: var(--term-dim); }
          @keyframes h1fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        </style>
        <div class="kicker">1966 · MIT · 조지프 와이젠바움</div>
        <h2 class="title">ELIZA: <span class="mark">최초의 챗봇</span></h2>
        <div class="row" style="flex:1;gap:40px;align-items:stretch">
          <div class="demo stack" style="width:880px;flex:none;gap:12px">
            <div class="term" style="height:520px">
              <div class="dim" style="font-size:20px;margin-bottom:8px">ELIZA · 한국어 흉내판 · 키워드 규칙 ${ELIZA_RULES.length}개 · 이해하는 것: 0</div>
              <div class="e-log" data-scroll></div>
              <div class="e-in"><span class="hi">너 ›</span><input class="e-input" type="text" placeholder="여기에 입력하고 Enter" autocomplete="off" spellcheck="false"></div>
            </div>
            <div class="row center" style="gap:10px;flex-wrap:wrap">
              <span class="mono muted" style="font-size:20px">예시:</span>
              <button class="chip e-ex">시험 망쳤어</button>
              <button class="chip e-ex">친구랑 싸웠어</button>
              <button class="chip e-ex">나는 AI가 좀 무서워</button>
              <button class="chip e-ex">너는 누구야?</button>
            </div>
          </div>
          <div class="grow" style="position:relative">
            ${K.photo('weizenbaum', '와이젠바움', 'tilt-r', 'position:absolute;left:10px;top:-6px;--w:210px')}
            <div class="sticky" style="position:absolute;left:236px;top:40px;width:250px;font-size:34px;line-height:1.2;--tilt:3deg;padding:18px 20px 22px">비서가 ELIZA와 ‘진짜 대화’를 하겠다며 그에게 방에서 나가 달라고 했다</div>
            <div style="position:absolute;left:0;top:370px;width:488px">
              <div class="subtitle" style="font-size:34px"><span class="mark">ELIZA 효과</span></div>
              <p style="font-size:26px;line-height:1.42;margin-top:8px">키워드 맞추기일 뿐인데도, 사람은 ‘이 기계가 나를 이해한다’고 느낀다.</p>
              <p class="muted" style="font-size:22px;line-height:1.4;margin-top:12px">이걸 본 와이젠바움은 평생 AI를 경고했다.</p>
            </div>
          </div>
        </div>
        <div class="src">출처: Wikipedia ‘ELIZA’ (Weizenbaum 1966, DOCTOR 스크립트, 비서 일화) · 규칙은 원래 ELIZA를 본뜬 한국어 예시</div>`,
      init(el, K, f) {
        const log = el.querySelector('.e-log'), input = el.querySelector('.e-input');
        const mem = [];
        let dflt = 0;
        ELIZA_RULES.forEach((r) => { r.n = 0; });
        // fade an edge only while lines are scrolled past it, so a half-hidden line reads as "scroll here", not as clipped text
        const fade = () => {
          log.classList.toggle('above', log.scrollTop > 2);
          log.classList.toggle('below', log.scrollTop + log.clientHeight < log.scrollHeight - 2);
        };
        log.addEventListener('scroll', fade);
        f.enter = fade; // layout may differ from init time (fonts)
        let seeding = true; // the opening lines: scroll and fade once at the end, not once per line (each forces a layout)
        const add = (who, text, why) => {
          const d = document.createElement('div');
          d.className = 'e-line';
          d.innerHTML = who === 'E' ? `<span class="hi">ELIZA ›</span> ${K.escape(text)}` : `<span class="dim">너 ›</span> ${K.escape(text)}`;
          log.appendChild(d);
          if (why) { const w = document.createElement('div'); w.className = 'e-why'; w.textContent = '└ ' + why; log.appendChild(w); }
          while (log.children.length > 60) log.removeChild(log.firstChild);
          if (seeding) return;
          log.scrollTop = log.scrollHeight;
          fade();
        };
        const respond = (raw) => {
          const s = raw.trim().replace(/[.!?~ㅠㅜ]+$/, '').trim();
          if (!s) return { text: '말이 없구나. 무엇이든 괜찮아.', why: '빈 입력' };
          // safety first (kept outside ELIZA_RULES so the rule numbers in the log stay the same)
          if (/죽고\s*싶|죽을래|죽어\s*버리|뒤지고\s*싶|자살|자해|살기\s*싫|살고\s*싶지\s*않|사라지고\s*싶|없어지고\s*싶/.test(s)) return { text: '그렇게 힘들다면 꼭 사람에게 말해 줘. 선생님이나 청소년상담 1388, 자살예방 상담 109에 언제든 전화할 수 있어.', why: '안전 규칙 · 이런 말은 흉내 내지 않고 도움을 안내' };
          for (let i = 0; i < ELIZA_RULES.length; i++) {
            const R = ELIZA_RULES[i], m = s.match(R.re);
            if (!m) continue;
            const frag = m[1] != null ? swapAll(m[1].trim()) : '';
            const opts = R.r.filter((t) => frag || !t.includes('{1}'));
            if (!opts.length) continue;
            const t = opts[R.n++ % opts.length].replace('{1}', frag);
            if (R.mem && !mem.includes(R.mem)) mem.push(R.mem);
            return { text: t, why: `규칙 #${i + 1} ‘${R.k}’${frag ? ' · 나↔너 바꿔서 되돌림' : ' → 질문으로 되돌리기'}` };
          }
          dflt++;
          if (mem.length && dflt % 3 === 0) return { text: `아까 ${mem[(dflt / 3 - 1) % mem.length]} 이야기를 했지? 그 이야기를 더 해 줄래?`, why: '맞는 규칙 없음 → 기억해 둔 주제 꺼내기' };
          return { text: ELIZA_DEFAULT[(dflt - 1) % ELIZA_DEFAULT.length], why: `맞는 규칙 없음 → 기본 반응 ${((dflt - 1) % ELIZA_DEFAULT.length) + 1}/${ELIZA_DEFAULT.length}` };
        };
        const send = (text) => {
          if (!text.trim()) return;
          add('U', text);
          const r = respond(text);
          add('E', r.text, r.why);
        };
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); const v = input.value; input.value = ''; send(v); }
        });
        el.querySelectorAll('.e-ex').forEach((b) => b.addEventListener('click', () => send(b.textContent)));
        add('E', '안녕. 나는 ELIZA야. 요즘 무슨 고민이 있니?');
        ['엄마가 맨날 공부하래', '나는 게임이 더 좋은데', '내 방이 너무 싫어'].forEach(send);
        seeding = false;
        log.scrollTop = log.scrollHeight;
        fade();
      },
    },

    /* ─────────────────────────── 7 ─────────────────────────── */
    {
      id: 'y1969',
      title: '1969 · XOR의 벽과 1차 AI 겨울',
      year: '1969',
      tag: '1차 AI 겨울',
      minutes: 1.3,
      notes: '1969년 민스키와 페퍼트는 책 『퍼셉트론』에서, 뉴런 한 층짜리 퍼셉트론은 XOR(둘 중 하나만 켜졌을 때만 1)조차 배울 수 없다는 것을 수학으로 증명했습니다.\n실습: 노란 점 두 개를 끌어 직선으로 검은 점(1)과 빈 점(0)을 나눠 보게 합니다. 어떻게 해도 최소 1개는 틀립니다. 그다음 [직선 하나 더]를 누르고 두 번째 직선의 손잡이를 끌어 오른쪽 위 점을 따로 떼어 내면 틀린 점이 0개가 됩니다. 사실 두 저자도 층을 쌓으면 된다는 걸 알았지만, 그 가운데 층을 학습시킬 좋은 방법이 아직 없었습니다.\n→ 키로 오른쪽 사건들을 띄웁니다: 로젠블랫 사망(1971), 영국 라이트힐 보고서(1973), 미국 DARPA 삭감(1974) → 1차 AI 겨울.\n질문: “한 권의 책과 보고서 하나가 분야 전체를 얼릴 수 있었던 이유는 뭘까요?”',
      html: `
        <style>
          #f-y1969 .ch { display: grid; grid-template-columns: 92px 1fr; gap: 4px 16px; align-items: baseline; }
          #f-y1969 .ch .y { font-family: var(--font-mono); font-weight: 600; font-size: 26px; }
          #f-y1969 .ch .d { font-size: 24px; line-height: 1.35; }
        </style>
        <div class="kicker">1969 · 마빈 민스키 &amp; 시모어 페퍼트, 『퍼셉트론』</div>
        <h2 class="title">직선 하나로는 XOR을 <span class="mark">못 나눈다</span></h2>
        <div class="demo abs" style="position:absolute;left:92px;top:232px;width:640px">
          <div class="x-host" style="width:640px;height:470px;background:var(--paper);position:relative"></div>
          <div class="row center" style="gap:16px;margin-top:14px">
            <div class="x-err mono" style="font-size:34px;font-weight:600;white-space:nowrap"></div>
            <div class="x-best mono muted grow" style="font-size:20px;line-height:1.3"></div>
          </div>
          <div class="row center" style="gap:12px;margin-top:8px">
            <button class="btn sm x-two">직선 하나 더 (= 층 추가)</button>
            <button class="btn sm ghost x-reset">처음으로</button>
            <span class="mono muted" style="font-size:20px;margin-left:8px;white-space:nowrap">● = 1 &nbsp; ○ = 0</span>
          </div>
        </div>
        ${K.photo('minsky', '민스키', 'sm', 'position:absolute;left:790px;top:226px;--tilt:-3deg')}
        ${K.photo('papert', '페퍼트', 'sm tilt-r', 'position:absolute;left:990px;top:246px;--pos:50% 20%')}
        <div class="abs" style="left:1206px;top:236px;width:300px;font-size:25px;line-height:1.4">
          뉴런 <b>한 층</b>짜리 퍼셉트론은 XOR조차 배울 수 없다는 <span class="mark">수학적 증명</span>.
          <div class="muted" style="font-size:22px;margin-top:10px">신경망 연구비가 약 10년간 얼어붙었다.</div>
        </div>
        <div class="abs" data-step="1" style="left:790px;top:560px;width:718px">
          <div class="ch">
            <span class="y">1971</span><span class="d">로젠블랫, 보트 사고로 사망</span>
            <span class="y">1973</span><span class="d">영국 라이트힐 보고서: AI는 ‘거창한 목표’를 하나도 못 이뤘다</span>
            <span class="y">1974</span><span class="d">미국 국방부 연구기관(DARPA), 카네기멜런대 음성인식 연구비 연 300만 달러 취소</span>
          </div>
          <div class="row center" style="gap:16px;margin-top:14px">
            <span class="hand" style="font-size:52px;white-space:nowrap">→ 1차 AI 겨울</span>
            <span class="mono" style="font-size:26px;background:var(--pen-soft);color:var(--pen);padding:4px 12px;font-weight:600">1974–1980</span>
          </div>
        </div>
        <div class="src">출처: Minsky &amp; Papert, Perceptrons (1969) · Wikipedia ‘Perceptron’, ‘AI winter’ (Lighthill 1973, DARPA 1974)</div>`,
      init(el, K) {
        const host = el.querySelector('.x-host');
        const W = 640, Hh = 470;
        const { ctx } = K.canvas(host, W, Hh);
        const cv = host.querySelector('canvas');
        cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
        const PX = (a) => 150 + a * 340, PY = (b) => 380 - b * 300;
        const PTS = [[0, 0, 0], [1, 0, 1], [0, 1, 1], [1, 1, 0]].map(([a, b, c]) => ({ x: PX(a), y: PY(b), c, a, b }));
        // 2nd line starts right of every point and leaves the canvas above '입력 A →' (a vertical x=600 line sat on its arrow)
        const L0 = [[{ x: 60, y: 250 }, { x: 330, y: 440 }], [{ x: 556, y: 40 }, { x: 622, y: 330 }]];
        const st = { lines: [L0[0].map((p) => ({ ...p }))], drag: null, tries: 0, best: Infinity };
        const side = (L, p) => Math.sign((L[1].x - L[0].x) * (p.y - L[0].y) - (L[1].y - L[0].y) * (p.x - L[0].x)) || 1;
        const sig = (p) => st.lines.map((L) => side(L, p)).join(',');
        function evaluate() {
          const groups = {};
          PTS.forEach((p) => { const k = sig(p); (groups[k] || (groups[k] = [0, 0]))[p.c]++; });
          const lab = {};
          let err = 0;
          for (const k in groups) { const [n0, n1] = groups[k]; lab[k] = n1 >= n0 ? 1 : 0; err += Math.min(n0, n1); }
          return { lab, err };
        }
        function halfPlane(L, s) {
          const dx = L[1].x - L[0].x, dy = L[1].y - L[0].y, n = Math.hypot(dx, dy) || 1;
          const ux = dx / n, uy = dy / n, nx = -uy * s, ny = ux * s, B = 3000;
          ctx.beginPath();
          ctx.moveTo(L[0].x - ux * B, L[0].y - uy * B);
          ctx.lineTo(L[0].x + ux * B, L[0].y + uy * B);
          ctx.lineTo(L[0].x + ux * B + nx * B, L[0].y + uy * B + ny * B);
          ctx.lineTo(L[0].x - ux * B + nx * B, L[0].y - uy * B + ny * B);
          ctx.closePath();
        }
        function draw() {
          const C = K.colors();
          ctx.clearRect(0, 0, W, Hh);
          const ev = evaluate();
          // shade regions labelled 1
          const combos = st.lines.length === 1 ? [[1], [-1]] : [[1, 1], [1, -1], [-1, 1], [-1, -1]];
          combos.forEach((cmb) => {
            if (ev.lab[cmb.join(',')] !== 1) return;
            ctx.save();
            for (let i = 0; i < cmb.length - 1; i++) { halfPlane(st.lines[i], cmb[i]); ctx.clip(); }
            halfPlane(st.lines[cmb.length - 1], cmb[cmb.length - 1]);
            ctx.globalAlpha = 0.38; ctx.fillStyle = C.hl; ctx.fill();
            ctx.restore();
          });
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 2.5; K.sketchRect(ctx, 2, 2, W - 4, Hh - 4, { seed: 9, wobble: 1.2 });
          // axes
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 2;
          K.sketchLine(ctx, PX(0) - 50, PY(0) + 50, PX(1) + 60, PY(0) + 50, { seed: 3 });
          K.sketchLine(ctx, PX(0) - 50, PY(0) + 50, PX(0) - 50, PY(1) - 50, { seed: 4 });
          ctx.fillStyle = C.ink2; ctx.font = `20px ${C.fontMono}`; ctx.textAlign = 'center';
          ctx.fillText('0', PX(0), PY(0) + 76); ctx.fillText('1', PX(1), PY(0) + 76);
          ctx.textAlign = 'left'; ctx.fillText('입력 A →', PX(1) + 30, PY(0) + 76);
          ctx.textAlign = 'right'; ctx.fillText('0', PX(0) - 64, PY(0) + 7); ctx.fillText('1', PX(0) - 64, PY(1) + 7);
          ctx.textAlign = 'left'; ctx.fillText('↑ 입력 B', PX(0) - 60, 30);
          // lines
          st.lines.forEach((L, li) => {
            const dx = L[1].x - L[0].x, dy = L[1].y - L[0].y, n = Math.hypot(dx, dy) || 1;
            ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(L[0].x - (dx / n) * 2000, L[0].y - (dy / n) * 2000); ctx.lineTo(L[0].x + (dx / n) * 2000, L[0].y + (dy / n) * 2000); ctx.stroke();
            L.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.fillStyle = C.hl; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); });
            void li;
          });
          // points
          PTS.forEach((p) => {
            const wrong = ev.lab[sig(p)] !== p.c;
            ctx.beginPath(); ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
            ctx.fillStyle = p.c ? C.ink : C.paper; ctx.fill();
            ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
            ctx.fillStyle = p.c ? C.paper : C.ink; ctx.font = `600 24px ${C.fontMono}`; ctx.textAlign = 'center'; ctx.fillText(p.c, p.x, p.y + 8);
            if (wrong) {
              ctx.strokeStyle = C.bad; ctx.lineWidth = 4;
              ctx.beginPath(); ctx.arc(p.x, p.y, 36, 0, Math.PI * 2); ctx.stroke();
              // top-row points get the label underneath so it never lands on the '↑ 입력 B' axis label
              ctx.fillStyle = C.bad; ctx.font = `600 22px ${C.fontBody}`; ctx.fillText('틀림', p.x, p.b ? p.y + 62 : p.y - 46);
            }
          });
          // status (draw() runs on every drag move; rewrite the lines only when they change)
          const eh = `틀린 점 <span style="color:${ev.err ? 'var(--bad)' : 'var(--good)'}">${ev.err}개</span>`;
          if (eh !== errHtml) { el.querySelector('.x-err').innerHTML = eh; errHtml = eh; }
          let bh;
          if (st.lines.length === 1) bh = K.escape(st.tries ? `시도 ${st.tries}번 · 최고 기록 ${st.best}개. 직선 하나로는 0개가 안 된다.` : '손잡이를 끌어 보세요 · 노란 쪽 = ‘1’ 구역');
          else bh = ev.err ? '두 번째 직선도 끌어 보세요.' : '<b class="good">두 직선이면 된다 = 층을 쌓으면 된다.</b> 문제는 그 층을 어떻게 학습시키나 → 1986';
          if (bh !== bestHtml) { el.querySelector('.x-best').innerHTML = bh; bestHtml = bh; }
          return ev;
        }
        let errHtml = null, bestHtml = null;
        const handleAt = (p) => { let hit = null, bd = 34; st.lines.forEach((L, li) => L.forEach((q, qi) => { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; hit = [li, qi]; } })); return hit; };
        cv.addEventListener('pointerdown', (e) => { const p = K.pt(e, cv); const h = handleAt(p); if (!h) return; st.drag = h; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.preventDefault(); });
        cv.addEventListener('pointermove', (e) => {
          const p = K.pt(e, cv);
          if (!st.drag) { cv.style.cursor = handleAt(p) ? 'grab' : 'default'; return; }
          const q = st.lines[st.drag[0]][st.drag[1]];
          q.x = K.clamp(p.x, 12, W - 12); q.y = K.clamp(p.y, 12, Hh - 12);
          const o = st.lines[st.drag[0]][1 - st.drag[1]];
          if (Math.hypot(q.x - o.x, q.y - o.y) < 30) { q.x = o.x + 30; }
          draw();
        });
        const up = () => { if (!st.drag) return; st.drag = null; cv.style.cursor = 'grab'; if (st.lines.length === 1) { st.tries++; st.best = Math.min(st.best, evaluate().err); } draw(); };
        cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
        const two = el.querySelector('.x-two');
        two.addEventListener('click', () => {
          if (st.lines.length === 1) { st.lines.push(L0[1].map((p) => ({ ...p }))); two.classList.add('on'); two.textContent = '직선 하나로 돌아가기'; }
          else { st.lines.length = 1; two.classList.remove('on'); two.textContent = '직선 하나 더 (= 층 추가)'; }
          draw();
        });
        el.querySelector('.x-reset').addEventListener('click', () => { st.lines = [L0[0].map((p) => ({ ...p }))]; st.tries = 0; st.best = Infinity; two.classList.remove('on'); two.textContent = '직선 하나 더 (= 층 추가)'; draw(); });
        K.onTheme(draw);
        draw();
      },
    },

    /* ─────────────────────────── 8 ─────────────────────────── */
    {
      id: 'y1980s',
      title: '1980s · 전문가 시스템 붐과 2차 AI 겨울',
      year: '1980s',
      tag: '2차 AI 겨울',
      minutes: 1,
      notes: '1980년대 AI는 ‘전문가 시스템’으로 다시 붐을 맞습니다. 전문가의 지식을 “만약 ~이면 ~하라”는 규칙으로 잔뜩 적어 넣는 방식입니다. 대표가 컴퓨터 회사 DEC에서 고객 주문에 맞춰 컴퓨터 부품 구성을 자동으로 짜 준 XCON(1980년 가동)으로, 1986년까지 주문 8만 건을 처리했고 규칙은 1989년 1만 129개까지 늘었습니다.\n실습: [규칙 추가]를 계속 눌러 보세요. 규칙이 늘수록 예외(빨간 점선)와 서로 얽힌 곳이 생기고, 유지보수 비용 게이지가 빠르게 올라갑니다. 스스로 배우지 못하니 사람이 계속 고쳐야 했습니다.\n그리고 1987년 AI 전용 컴퓨터인 리스프 머신 시장(약 5억 달러)이 1년 만에 무너지고, 일본 5세대 컴퓨터 프로젝트도 1992년 조용히 끝나면서 2차 겨울(1987–1993)이 옵니다.\n질문: “규칙을 사람이 다 적는 대신, 기계가 예시를 보고 스스로 규칙을 찾게 하려면?” (→ 머신러닝)',
      html: `
        <style>
          #f-y1980s .tl { display: grid; grid-template-columns: 76px 1fr; gap: 12px 14px; align-items: baseline; }
          #f-y1980s .tl .y { font-family: var(--font-mono); font-weight: 600; font-size: 24px; }
          #f-y1980s .tl .d { font-size: 23px; line-height: 1.35; }
          #f-y1980s .rb { font-size: 20px; line-height: 1.45; padding: 12px 18px; height: 170px; }
          #f-y1980s .rb > div { padding-left: 24px; text-indent: -24px; overflow-wrap: anywhere; }
          #f-y1980s .rb .x { color: var(--term-hi); }
        </style>
        <div class="kicker">1980년대 · 전문가 시스템 붐 → 2차 겨울</div>
        <h2 class="title">규칙을 <span class="mark">사람이 다 적으면?</span></h2>
        <div class="row" style="flex:1;gap:40px;align-items:stretch">
          <div class="demo stack" style="width:830px;flex:none;gap:10px">
            <svg class="rt" viewBox="0 0 880 300" width="830" height="283" style="overflow:visible"></svg>
            <div class="row center" style="gap:14px">
              <button class="btn r-add">규칙 추가</button>
              <button class="btn sm ghost r-reset">처음으로</button>
              <div class="r-count mono" style="font-size:22px"></div>
            </div>
            <div class="row center" style="gap:14px">
              <span style="font-size:22px;font-weight:600;white-space:nowrap">유지보수 비용</span>
              <svg class="gauge" viewBox="0 0 700 40" width="652" height="37" style="overflow:visible"></svg>
            </div>
            <div class="term rb"></div>
          </div>
          <div class="grow" style="position:relative">
            ${K.photo('lisp-machine', '리스프 머신', 'sm tilt-r', 'position:absolute;left:350px;top:-150px;--w:180px;--pos:50% 40%')}
            <div class="tl" style="position:absolute;left:0;top:130px;width:546px">
              <span class="y">1980</span><span class="d"><b>XCON</b> 가동: 주문에 맞춰 컴퓨터 부품을 골라 주는 규칙 시스템. 1989년엔 규칙 <b>1만 129개</b></span>
              <span class="y">1982</span><span class="d">일본 5세대 컴퓨터 시작 (10년, 수억 달러)</span>
              <span class="y">1987</span><span class="d">AI 전용 컴퓨터(리스프 머신) 시장(약 5억 달러) <span class="mark">1년 만에 붕괴</span></span>
              <span class="y">1992</span><span class="d">5세대 컴퓨터, 목표 못 이루고 조용히 종료</span>
            </div>
            <div style="position:absolute;left:0;top:390px;width:546px;font-size:23px;line-height:1.4">
              <span class="muted">왜 무너졌나:</span> 고치는 데 돈이 많이 들고, <b>스스로 배우지 못하고</b>, 규칙 밖의 상황에서 엉뚱하게 틀린다.
            </div>
            <div class="row center" style="position:absolute;left:0;top:486px;gap:14px">
              <span class="hand" style="font-size:50px;white-space:nowrap">→ 2차 AI 겨울</span>
              <span class="mono" style="font-size:26px;background:var(--pen-soft);color:var(--pen);padding:4px 12px;font-weight:600">1987–1993</span>
            </div>
          </div>
        </div>
        <div class="src">출처: Wikipedia ‘Xcon’, ‘AI winter’, ‘Fifth Generation Computer Systems’ · 데모의 규칙 문장은 XCON을 흉내 낸 예시</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.rt'), gauge = el.querySelector('.gauge'), rb = el.querySelector('.rb'), cnt = el.querySelector('.r-count'), addBtn = el.querySelector('.r-add');
        const CONDS = ['디스크 2대', '메모리 많음', '프린터 있음', '해외 주문', '캐비닛 꽉 참', '테이프 드라이브', '전원 부족', '신형 디스크', '구형 CPU', '케이블 10m 넘음', '단말기 8대 이상', '확장 박스'];
        const ACTS = ['컨트롤러 추가', '확장 박스 추가', '케이블 B 사용', '220V 전원으로', '새 캐비닛', '설치 순서 바꾸기', '전원 장치 추가', '슬롯 옮기기', '버스 연장'];
        const MAXR = 160;
        let st;
        const reset = () => {
          st = { rnd: K.rand(1980), nodes: [{ x: 440, y: 26, d: 0, p: -1, exc: false, born: -9 }], links: [], R: 0, E: 0, log: [], t: 0, shown: 0 };
          for (let i = 0; i < 11; i++) addRule(true);
          st.shown = cost();
          render(true);
        };
        const cost = () => Math.min(1, (st.R + 3 * st.E + 3 * st.links.length) / 400);
        function ruleText(n, exc) {
          const r = st.rnd, nc = 1 + Math.floor(n / 18);
          const cs = []; for (let i = 0; i < 12 && cs.length < Math.min(nc, 4); i++) { const c = CONDS[Math.floor(r() * CONDS.length)]; if (!cs.includes(c)) cs.push(c); }
          const act = ACTS[Math.floor(r() * ACTS.length)];
          if (exc) return `R${n}: R${1 + Math.floor(r() * Math.max(1, n - 1))}의 예외 · IF ${cs[0]} THEN ${act}`;
          return `R${n}: IF ${cs.join(' AND ')} THEN ${act}`;
        }
        function addRule(quiet) {
          const r = st.rnd, n = st.R + 1;
          const maxD = n < 10 ? 3 : 4;
          const cand = st.nodes.filter((q) => q.d < maxD && (q.d > 0 || st.nodes.filter((c) => c.p === 0).length < 5));
          const par = cand[Math.floor(r() * cand.length)];
          const d = par.d + 1, spread = d === 1 ? 800 : 560 / Math.pow(d, 1.1);
          const same = st.nodes.filter((q) => q.d === d);
          let x = par.x, bestGap = -1;
          for (let c = 0; c < 9; c++) {
            const cx = K.clamp(par.x + (r() - 0.5) * spread, 16, 864);
            const gap = same.reduce((m, q) => Math.min(m, Math.abs(q.x - cx)), 999);
            if (gap > bestGap) { bestGap = gap; x = cx; }
          }
          const y = 26 + d * 64 + (r() - 0.5) * 16;
          const exc = n > 3 && (n % 3 === 0 || r() < 0.18);
          st.nodes.push({ x, y, d, p: st.nodes.indexOf(par), exc, born: quiet ? -9 : st.t });
          st.R++;
          if (exc) {
            st.E++;
            const other = st.nodes[1 + Math.floor(r() * (st.nodes.length - 2))];
            if (other && other !== par) st.links.push({ a: st.nodes.length - 1, b: st.nodes.indexOf(other), born: quiet ? -9 : st.t });
          }
          st.log.push({ t: ruleText(n, exc), exc });
          if (st.log.length > 4) st.log.shift();
        }
        // render() runs every frame for about a second after each click. Re-parsing the whole tree (up to ~400 nodes)
        // each frame was most of that cost, so the markup is rebuilt only when the element list changes (new rules,
        // a link starting to grow, the gauge label appearing); otherwise only the attributes that changed are set.
        // Same markup, same attribute strings, so the resulting DOM is the same either way.
        const LEGEND = `<rect x="370" y="6" width="140" height="40" rx="6" style="fill:var(--ink)"/><text x="440" y="34" text-anchor="middle" style="font-family:var(--font-body);font-weight:600;font-size:21px;fill:var(--paper)">주문서 입력</text>` +
          `<g transform="translate(598,32)"><circle cx="0" cy="-6" r="7" style="fill:var(--paper);stroke:var(--ink);stroke-width:2.5"/><text x="14" y="0" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">규칙</text><circle cx="92" cy="-6" r="7" style="fill:var(--paper);stroke:var(--bad);stroke-width:2.5;stroke-dasharray:3 2"/><text x="106" y="0" style="font-family:var(--font-mono);font-size:20px;fill:var(--bad)">예외</text><path d="M170,-6 h34" style="stroke:var(--bad);stroke-width:2;stroke-dasharray:6 6"/><text x="210" y="0" style="font-family:var(--font-mono);font-size:20px;fill:var(--bad)">얽힘</text></g>`;
        // items: [tag, [[attr, value], ...], text?] in document order (text is constant); `tail` is constant markup after them
        function patch(host, items, tail) {
          const sig = items.map((it) => it[0] + (it[2] || '')).join() + '|' + tail;
          if (host.__sig !== sig) {
            host.innerHTML = items.map(([tag, at, tx]) => `<${tag} ${at.map(([k, v]) => `${k}="${v}"`).join(' ')}${tx ? `>${tx}</${tag}>` : '/>'}`).join('') + tail;
            host.__sig = sig;
            return;
          }
          const kids = host.children;
          items.forEach(([, at], i) => { const n = kids[i]; at.forEach(([k, v]) => { if (n.getAttribute(k) !== v) n.setAttribute(k, v); }); });
        }
        function render(full) {
          const grow = (b) => K.clamp((st.t - b) / 0.45, 0, 1);
          const items = [];
          st.nodes.forEach((q) => {
            if (q.p < 0) return;
            const P = st.nodes[q.p], g = K.easeOut(grow(q.born));
            const x2 = P.x + (q.x - P.x) * g, y2 = P.y + (q.y - P.y) * g;
            items.push(['path', [['d', `M${P.x.toFixed(1)},${P.y.toFixed(1)} Q${((P.x + x2) / 2 + 6).toFixed(1)},${((P.y + y2) / 2).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`], ['style', `fill:none;stroke:var(--ink-2);stroke-width:${st.R > 60 ? 1.6 : 2.4}`]]]);
          });
          st.links.forEach((l) => {
            const A = st.nodes[l.a], B = st.nodes[l.b], g = grow(l.born);
            if (g <= 0) return;
            const mx = (A.x + B.x) / 2, my = Math.min(A.y, B.y) - 40;
            items.push(['path', [['d', `M${A.x.toFixed(1)},${A.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${B.x.toFixed(1)},${B.y.toFixed(1)}`], ['style', `fill:none;stroke:var(--bad);stroke-width:2;stroke-dasharray:6 6;opacity:${(0.75 * g).toFixed(2)}`]]]);
          });
          const rr = st.R > 60 ? 5 : st.R > 25 ? 7 : 9;
          st.nodes.forEach((q, i) => {
            if (i === 0) return;
            const g = grow(q.born), r = rr * (0.3 + 0.7 * K.easeOut(g)) * (g < 1 ? 1 + 0.5 * Math.sin(g * Math.PI) : 1);
            items.push(['circle', [['cx', q.x.toFixed(1)], ['cy', q.y.toFixed(1)], ['r', r.toFixed(1)], ['style', q.exc ? 'fill:var(--paper);stroke:var(--bad);stroke-width:2.5;stroke-dasharray:3 2' : 'fill:var(--paper);stroke:var(--ink);stroke-width:2.5']]]);
          });
          patch(svg, items, LEGEND);
          // gauge
          const c = st.shown, col = c > 0.7 ? 'var(--bad)' : c > 0.4 ? 'var(--c4)' : 'var(--good)';
          const gi = [['rect', [['x', '0'], ['y', '1'], ['width', '700'], ['height', '36'], ['style', 'fill:var(--paper-2);stroke:var(--ink);stroke-width:2.5']]]];
          gi.push(['rect', [['x', '2'], ['y', '3'], ['width', (696 * c).toFixed(1)], ['height', '32'], ['style', `fill:${col}`]]]);
          for (let i = 1; i < 10; i++) gi.push(['line', [['x1', String(i * 70)], ['y1', '1'], ['x2', String(i * 70)], ['y2', String(i % 5 ? 7 : 12)], ['style', 'stroke:var(--ink);stroke-width:2']]]);
          if (c > 0.82) gi.push(['text', [['x', String(Math.min(690, 696 * c) - 8)], ['y', '29'], ['text-anchor', 'end'], ['style', 'font-family:var(--font-hand);font-size:28px;fill:var(--paper)']], '아무도 전체를 모른다']);
          patch(gauge, gi, '');
          if (full !== false) {
            cnt.innerHTML = `규칙 <b>${st.R}</b>개 · 예외 <b class="bad">${st.E}</b>개 · 얽힘 <b class="bad">${st.links.length}</b>곳`;
            // long rules wrap (hanging indent); older lines drop off the top until the newest ones fit whole
            rb.innerHTML = st.log.map((l) => `<div class="${l.exc ? 'x' : ''}">${K.escape(l.t)}</div>`).join('');
            while (rb.children.length > 1 && rb.scrollHeight > rb.clientHeight + 1) rb.removeChild(rb.firstElementChild);
            addBtn.disabled = st.R >= MAXR;
            addBtn.textContent = st.R >= MAXR ? '더는 못 고침' : `규칙 추가 (+${1 + Math.floor(st.R / 6)})`;
          }
        }
        let anim = 0;
        addBtn.addEventListener('click', () => {
          const k = 1 + Math.floor(st.R / 6);
          for (let i = 0; i < k && st.R < MAXR; i++) addRule(false);
          anim = 0.8;
          render(true);
        });
        el.querySelector('.r-reset').addEventListener('click', reset);
        K.loop(el, (t, dt) => {
          st.t += dt;
          const target = cost();
          const moving = Math.abs(target - st.shown) > 0.001;
          if (moving) st.shown += (target - st.shown) * Math.min(1, dt * 5);
          if (anim > 0 || moving) { anim -= dt; render(false); }
        });
        f.leave = () => { st.t += 5; st.shown = cost(); render(true); };
        reset();
      },
    },

    /* ─────────────────────────── 9 ─────────────────────────── */
    {
      id: 'y1986',
      title: '1986 · 역전파: 틀린 만큼 거꾸로 고친다',
      year: '1986',
      minutes: 0.6,
      notes: '1969년의 벽은 “층을 쌓으면 되는데, 가운데 층을 어떻게 학습시키나?”였습니다. 1986년 러멜하트, 힌턴, 윌리엄스가 Nature에 답을 냈습니다. 출력에서 생긴 오차를 거꾸로 흘려보내, 각 연결이 오차에 얼마나 책임이 있는지 계산해 고치는 방법, 역전파입니다.\n클릭: [250번 연습]만 두 번 눌러 오른쪽 XOR 표가 0,1,1,0이 되는 걸 보여 주고, ‘개념 정류장에서 나선을 풀었던 바로 그 방법이 1986년의 이 논문’이라고 연결한 뒤 힌턴 이야기로 넘어갑니다. ([앞으로]/[뒤로] 한 단계씩 보기는 시간이 남을 때만.)\n힌턴은 신경망이 인기 없던 시절에도 이 연구를 붙들었고, 2012년 AlexNet을 거쳐 2024년 노벨 물리학상을 받았습니다.\n질문: “틀린 만큼 거꾸로 고친다, 여러분이 공부할 때 오답노트와 뭐가 닮았나요?”',
      html: `
        <style>
          #f-y1986 .xt { border-collapse: collapse; font-family: var(--font-mono); font-size: 22px; }
          #f-y1986 .xt th { font-weight: 600; color: var(--ink-2); font-size: 20px; padding: 0 8px 6px; border-bottom: 3px solid var(--ink); font-family: var(--font-body); }
          #f-y1986 .xt td { padding: 4px 8px; text-align: center; border-bottom: 1.5px dashed var(--ink-3); }
          #f-y1986 .xt tr.cur td { background: var(--hl-soft); }
          #f-y1986 .xt .bar { display: inline-block; width: 90px; height: 16px; background: var(--paper-3); position: relative; vertical-align: middle; margin-right: 8px; }
          #f-y1986 .xt .bar i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--ink); }
        </style>
        <div class="abs stack" style="left:92px;top:64px;width:1000px;gap:8px">
          <div class="kicker">1986 · Nature 323권 · 러멜하트, 힌턴, 윌리엄스</div>
          <h2 class="title md">역전파: 틀린 만큼 <span class="mark">거꾸로</span> 고친다</h2>
        </div>
        <div class="abs demo" style="position:absolute;left:92px;top:200px;width:1010px">
          <div class="row" style="gap:26px;align-items:flex-start">
            <svg class="nn" viewBox="0 0 700 470" width="680" height="457" style="overflow:visible"></svg>
            <div class="stack" style="gap:12px;width:320px">
              <div style="font-size:22px;font-weight:600">XOR, 지금 얼마나 맞히나</div>
              <table class="xt"><thead><tr><th>A</th><th>B</th><th>정답</th><th>출력</th></tr></thead><tbody></tbody></table>
              <div class="mono muted" style="font-size:20px">평균 오차 · 연습 <span class="b-ep">0</span>회</div>
              <svg class="spark" viewBox="0 0 340 80" width="340" height="80" style="overflow:visible"></svg>
            </div>
          </div>
          <div class="row center" style="gap:12px;margin-top:6px">
            <button class="btn b-fwd">앞으로 →</button>
            <button class="btn b-bwd" style="border-color:var(--pen);color:var(--pen)">← 뒤로</button>
            <button class="btn sm b-train">250번 연습</button>
            <button class="btn sm ghost b-reset">처음으로</button>
          </div>
          <div class="b-msg" style="font-size:23px;margin-top:10px;min-height:34px"></div>
        </div>
        ${K.photo('hinton', '제프리 힌턴', '', 'position:absolute;left:1150px;top:64px;--w:280px;--tilt:-2deg')}
        ${K.photo('rumelhart', '러멜하트', 'sm', 'position:absolute;left:1340px;top:404px;--w:150px;--tilt:4deg;--pos:50% 20%')}
        <div class="abs mono" style="left:92px;top:806px;font-size:20px;color:var(--ink-2)">1986년 논문 속 신경망 학습: 곱셈·덧셈 약 6.7억 번 (Epoch 추정) · 지금 스마트폰이면 1초도 안 걸린다</div>
        <div class="abs" style="left:1130px;bottom:68px;width:380px">
          <div class="hand" style="font-size:40px;line-height:1.15">신경망이 인기 없던 겨울에도 붙들고 있던 사람</div>
          <div class="mono" style="font-size:20px;color:var(--ink-2);margin-top:8px;line-height:1.4">1986 역전파 → 2012 AlexNet<br>→ 2024 노벨 물리학상</div>
        </div>
        <div class="src">출처: Rumelhart, Hinton &amp; Williams, “Learning representations by back-propagating errors”, Nature 323 (1986-10-09) · Epoch AI · nobelprize.org (2024)</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.nn'), tb = el.querySelector('.xt tbody'), spark = el.querySelector('.spark'), msg = el.querySelector('.b-msg');
        const X = [[0, 0], [0, 1], [1, 0], [1, 1]], T = [0, 1, 1, 0], LR = 1.0, SEED = 21;
        const sig = (x) => 1 / (1 + Math.exp(-x));
        let net, hist, ep, ex, act, anim;
        const init = () => {
          const r = K.rand(SEED);
          const W1 = [0, 1, 2].map(() => [r() * 2 - 1, r() * 2 - 1].map((v) => v * 1.5));
          const b1 = [0, 1, 2].map(() => r() * 2 - 1);
          const W2 = [0, 1, 2].map(() => (r() * 2 - 1) * 1.5);
          const b2 = r() * 2 - 1;
          net = { W1, b1, W2, b2 };
          ep = 0; ex = 2; anim = null; hist = [loss()];
          act = fwd(X[ex]);
        };
        const fwd = (x) => { const h = net.W1.map((w, j) => sig(w[0] * x[0] + w[1] * x[1] + net.b1[j])); const o = sig(h.reduce((s, v, j) => s + v * net.W2[j], net.b2)); return { x, h, o }; };
        const loss = () => X.reduce((s, x, i) => s + Math.abs(T[i] - fwd(x).o), 0) / 4;
        const update = (i) => {
          const x = X[i], { h, o } = fwd(x), d = (o - T[i]) * o * (1 - o);
          for (let j = 0; j < 3; j++) {
            const dh = d * net.W2[j] * h[j] * (1 - h[j]);
            net.W2[j] -= LR * d * h[j]; net.W1[j][0] -= LR * dh * x[0]; net.W1[j][1] -= LR * dh * x[1]; net.b1[j] -= LR * dh;
          }
          net.b2 -= LR * d;
        };
        const P = { i: NN.inY.map((y) => [NN.inX, y]), h: NN.hY.map((y) => [NN.hX, y]), o: [[NN.oX, NN.oY]] };
        const edges1 = [], edges2 = [];
        for (let a = 0; a < 2; a++) for (let j = 0; j < 3; j++) edges1.push([a, j]);
        for (let j = 0; j < 3; j++) edges2.push([j, 0]);
        // static skeleton
        let h = '';
        h += `<text x="${NN.inX}" y="24" text-anchor="middle" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">입력</text>`;
        h += `<text x="${NN.hX}" y="24" text-anchor="middle" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">은닉층</text>`;
        h += `<text x="${NN.oX}" y="24" text-anchor="middle" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)">출력</text>`;
        edges1.forEach(([a, j], k) => { h += `<line class="e1" data-k="${k}" x1="${P.i[a][0]}" y1="${P.i[a][1]}" x2="${P.h[j][0]}" y2="${P.h[j][1]}" style="stroke-linecap:round"/>`; });
        edges2.forEach(([j], k) => { h += `<line class="e2" data-k="${k}" x1="${P.h[j][0]}" y1="${P.h[j][1]}" x2="${P.o[0][0]}" y2="${P.o[0][1]}" style="stroke-linecap:round"/>`; });
        const node = (cls, x, y) => `<g class="${cls}"><circle cx="${x}" cy="${y}" r="${NN.r}" style="stroke:var(--ink);stroke-width:3.5"/><text x="${x}" y="${y + 8}" text-anchor="middle" style="font-family:var(--font-mono);font-weight:600;font-size:22px"></text></g>`;
        P.i.forEach(([x, y], a) => { h += node('ni n' + a, x, y); h += `<text x="${x - 48}" y="${y + 8}" text-anchor="end" style="font-family:var(--font-mono);font-size:24px;fill:var(--ink-2)">${'AB'[a]}</text>`; });
        P.h.forEach(([x, y], j) => { h += node('nh n' + j, x, y); });
        h += node('no', NN.oX, NN.oY);
        h += `<g class="pulses"></g>`;
        h += `<text class="o-t" x="${NN.oX}" y="${NN.oY + 70}" text-anchor="middle" style="font-family:var(--font-mono);font-size:21px;fill:var(--ink-2)"></text>`;
        h += `<text class="o-e" x="${NN.oX}" y="${NN.oY + 98}" text-anchor="middle" style="font-family:var(--font-mono);font-weight:600;font-size:21px;fill:var(--pen)"></text>`;
        h += `<g transform="translate(0,456)"><line x1="0" y1="0" x2="40" y2="0" style="stroke:var(--ink);stroke-width:5"/><text x="50" y="7" style="font-family:var(--font-body);font-size:20px;fill:var(--ink-2)">앞으로: 계산</text><line x1="210" y1="0" x2="250" y2="0" style="stroke:var(--pen);stroke-width:5"/><text x="260" y="7" style="font-family:var(--font-body);font-size:20px;fill:var(--ink-2)">뒤로: 오차 신호</text><text x="450" y="7" style="font-family:var(--font-body);font-size:20px;fill:var(--ink-3)">굵기 = 가중치 · 점선 = 음수</text></g>`;
        svg.innerHTML = h;
        const e1 = Array.from(svg.querySelectorAll('.e1')), e2 = Array.from(svg.querySelectorAll('.e2')), pulses = svg.querySelector('.pulses');
        const styleEdge = (ln, w, blue) => {
          ln.style.stroke = blue ? 'var(--pen)' : w >= 0 ? 'var(--ink)' : 'var(--ink-2)';
          ln.style.strokeWidth = (2 + Math.min(Math.abs(w), 6) * 2).toFixed(2);
          ln.style.strokeDasharray = w < 0 ? '10 7' : 'none';
          ln.style.opacity = blue ? 1 : 0.85;
        };
        let reveal = 2, advance = false;
        const drawNet = (blue) => {
          edges1.forEach(([a, j], k) => styleEdge(e1[k], net.W1[j][a], blue === 'all'));
          edges2.forEach(([j], k) => styleEdge(e2[k], net.W2[j], blue === 'all' || blue === 'out'));
          const setN = (g, v, txt) => { g.querySelector('circle').style.fill = v == null ? 'var(--paper-2)' : v > 0.5 ? 'var(--hl)' : 'var(--paper)'; const tx = g.querySelector('text'); tx.textContent = txt; tx.style.fill = v == null ? 'var(--ink-3)' : v > 0.5 ? 'var(--sticky-ink)' : 'var(--ink)'; };
          setN(svg.querySelector('.n0.ni'), act.x[0], act.x[0]);
          setN(svg.querySelector('.n1.ni'), act.x[1], act.x[1]);
          [0, 1, 2].forEach((j) => setN(svg.querySelector('.nh.n' + j), reveal >= 1 ? act.h[j] : null, reveal >= 1 ? act.h[j].toFixed(2) : '?'));
          setN(svg.querySelector('.no'), reveal >= 2 ? act.o : null, reveal >= 2 ? act.o.toFixed(2) : '?');
          const err = T[ex] - act.o;
          svg.querySelector('.o-t').textContent = `정답 ${T[ex]}`;
          svg.querySelector('.o-e').textContent = reveal >= 2 ? `오차 ${err >= 0 ? '+' : '−'}${Math.abs(err).toFixed(2)}` : '';
        };
        const drawTable = () => {
          tb.innerHTML = X.map((x, i) => { const o = fwd(x).o; return `<tr class="${i === ex ? 'cur' : ''}"><td>${x[0]}</td><td>${x[1]}</td><td>${T[i]}</td><td style="text-align:left"><span class="bar"><i style="width:${(o * 100).toFixed(0)}%"></i></span>${o.toFixed(2)}</td></tr>`; }).join('');
          el.querySelector('.b-ep').textContent = ep;
          const n = hist.length, mx = 0.55;
          const pts = hist.map((v, i) => [n === 1 ? 6 : 6 + (i / (n - 1)) * 300, 72 - (Math.min(v, mx) / mx) * 46]);
          let s = `<line x1="0" y1="72" x2="320" y2="72" style="stroke:var(--ink-3);stroke-width:2;stroke-dasharray:6 6"/><text x="0" y="96" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink-3)">- - 목표 0</text>`;
          if (pts.length > 1) s += `<path d="M${pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L')}" style="fill:none;stroke:var(--pen);stroke-width:3.5;stroke-linejoin:round"/>`;
          else s += `<path d="M24,30 C110,32 170,52 300,66" style="fill:none;stroke:var(--ink-3);stroke-width:2.5;stroke-dasharray:3 8;stroke-linecap:round"/><text x="320" y="22" text-anchor="end" style="font-family:var(--font-body);font-size:20px;fill:var(--ink-3)">연습하면 0 쪽으로 ↘</text>`;
          const L = pts[pts.length - 1];
          s += `<circle cx="${L[0].toFixed(1)}" cy="${L[1].toFixed(1)}" r="6" style="fill:var(--pen)"/><text x="${Math.min(L[0] + 10, 290).toFixed(1)}" y="${(L[1] - 12).toFixed(1)}" style="font-family:var(--font-mono);font-size:20px;fill:var(--ink)">${hist[hist.length - 1].toFixed(2)}</text>`;
          spark.innerHTML = s;
        };
        const PAIRS = {
          fwd: [edges1.map(([a, j]) => [P.i[a], P.h[j]]), edges2.map(([j]) => [P.h[j], P.o[0]])],
          bwd: [edges2.map(([j]) => [P.o[0], P.h[j]]), edges1.map(([a, j]) => [P.h[j], P.i[a]])],
        };
        // runs every frame of a pulse: move the existing dots instead of re-parsing them (same markup when rebuilt)
        let pulseKey = '';
        const drawPulses = () => {
          if (!anim) { pulses.innerHTML = ''; pulseKey = ''; return; }
          const t = K.ease(K.clamp(anim.t, 0, 1)), col = anim.kind === 'bwd' ? 'var(--pen)' : 'var(--ink)';
          const pairs = PAIRS[anim.kind][anim.ph], key = col + pairs.length;
          if (key !== pulseKey || pulses.children.length !== pairs.length) {
            pulses.innerHTML = pairs.map(([A, B]) => `<circle cx="${(A[0] + (B[0] - A[0]) * t).toFixed(1)}" cy="${(A[1] + (B[1] - A[1]) * t).toFixed(1)}" r="10" style="fill:${col};stroke:var(--paper);stroke-width:3"/>`).join('');
            pulseKey = key;
            return;
          }
          pairs.forEach(([A, B], i) => {
            const n = pulses.children[i], x = (A[0] + (B[0] - A[0]) * t).toFixed(1), y = (A[1] + (B[1] - A[1]) * t).toFixed(1);
            if (n.getAttribute('cx') !== x) n.setAttribute('cx', x);
            if (n.getAttribute('cy') !== y) n.setAttribute('cy', y);
          });
        };
        const finish = () => {
          if (!anim) return;
          if (anim.kind === 'bwd') {
            const before = fwd(X[ex]).o;
            update(ex); hist.push(loss());
            act = fwd(X[ex]); reveal = 2; advance = true;
            const better = Math.abs(T[ex] - act.o) < Math.abs(T[ex] - before);
            msg.innerHTML = `<span class="pen">가중치를 고쳤다:</span> 같은 입력의 출력 ${before.toFixed(2)} → <b>${act.o.toFixed(2)}</b> ${better ? '(정답 쪽으로)' : ''} · 다음 예제는 [앞으로]`;
          } else {
            act = fwd(X[ex]); reveal = 2;
            msg.innerHTML = `(${X[ex][0]},${X[ex][1]}) 계산 끝: 출력 ${act.o.toFixed(2)}, 정답 ${T[ex]}. 이제 [← 뒤로]로 고쳐 보자`;
          }
          anim = null; drawNet(0); drawTable(); drawPulses();
        };
        const start = (kind) => {
          if (anim) finish();
          if (kind === 'fwd') {
            if (advance) { ex = (ex + 1) % 4; advance = false; }
            act = fwd(X[ex]); reveal = 0;
            msg.innerHTML = `(${X[ex][0]},${X[ex][1]}) 입력 → 은닉층 → 출력으로 계산 중…`;
          } else {
            reveal = 2;
            msg.innerHTML = '<span class="pen">출력의 오차가 거꾸로 흘러가며 각 선의 책임을 계산하는 중…</span>';
          }
          anim = { kind, ph: 0, t: 0 };
          drawNet(kind === 'bwd' ? 'out' : 0); drawTable(); drawPulses();
        };
        el.querySelector('.b-fwd').addEventListener('click', () => start('fwd'));
        el.querySelector('.b-bwd').addEventListener('click', () => start('bwd'));
        el.querySelector('.b-train').addEventListener('click', () => {
          if (anim) finish();
          for (let e = 0; e < 250; e++) { for (let i = 0; i < 4; i++) update(i); ep++; if (e % 25 === 24) hist.push(loss()); }
          act = fwd(X[ex]); reveal = 2; drawNet(0); drawTable();
          const L = loss();
          msg.innerHTML = L < 0.15 ? '<b>XOR을 배웠다!</b> 1969년의 벽을 ‘층 + 역전파’로 넘었다.' : `연습 ${ep}회 · 평균 오차 ${L.toFixed(2)}. 한 번 더!`;
        });
        el.querySelector('.b-reset').addEventListener('click', () => { init(); reveal = 2; advance = false; drawNet(0); drawTable(); drawPulses(); msg.textContent = '[앞으로]를 눌러 보세요.'; });
        K.loop(el, (t, dt) => {
          if (!anim) return;
          anim.t += dt / 0.7;
          if (anim.t >= 1) {
            if (anim.ph === 0) {
              anim.ph = 1; anim.t = 0;
              if (anim.kind === 'fwd') { reveal = 1; drawNet(0); } else drawNet('all');
            } else { finish(); return; }
          }
          drawPulses();
        });
        f.leave = () => { if (anim) finish(); };
        init(); drawNet(0); drawTable();
        msg.textContent = '[앞으로]를 눌러 보세요.';
      },
    },
  ]);
})();
