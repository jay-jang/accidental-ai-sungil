/* Future · part 1 — 업무 분류 실습, ATM의 역사, WEF 2030, 신입 데이터, 소프트웨어 3.0, 코딩 에이전트 시뮬레이션. */
(function () {
  'use strict';

  const esc = (s) => Kit.escape(s);
  const won = (v) => Math.round(v).toLocaleString('ko-KR');

  /* Nanum Pen Script is a narrow face. On an offline classroom PC (Google Fonts blocked, no local copy, e.g. Windows)
     the hand notes fall back to a Korean gothic (Malgun Gothic) about 1.3–1.5× wider and ran into chart lines, the title
     and the next box (sticky over the title, ‘경력자는…’ across the line, a card out of its bin, an ellipsized caption).
     Measure the hand font in use and expose the shrink factor as --hk; the hand sizes below are calc(Npx * var(--hk, 1)),
     so with the pen font nothing changes (same approach as speaker.js). */
  const HAND_SAMPLE = '가나다라마바사아자차', PEN_EM = 6.73; // HAND_SAMPLE's width in Nanum Pen Script, in em
  const handFrames = [];
  const handMeasure = () => {
    const fam = getComputedStyle(document.documentElement).getPropertyValue('--font-hand').trim();
    if (!fam) return;
    const set = () => {
      const c = document.createElement('canvas').getContext('2d');
      c.font = `100px ${fam}`;
      const w = c.measureText(HAND_SAMPLE).width / 100;
      const k = w > 0 && PEN_EM / w < 0.95 ? Kit.clamp(PEN_EM / w, 0.6, 1) : 1;
      handFrames.forEach((f) => f.style.setProperty('--hk', k.toFixed(3)));
    };
    try { document.fonts.load(`100px ${fam}`, HAND_SAMPLE).then(set, set); } catch (e) { set(); }
  };
  function handFit(el) {
    handFrames.push(el);
    if (handFrames.length === 1 && document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(handMeasure);
      document.fonts.addEventListener('loadingdone', handMeasure);
    }
    handMeasure();
  }

  /* ───────────────────── 1. task-sorter data ───────────────────── */
  const BINS = [
    { name: 'AI가 대부분', sub: '사람은 확인만' },
    { name: 'AI와 함께', sub: '나눠서, 같이' },
    { name: '사람이 꼭', sub: '책임 · 몸 · 관계' },
  ];
  const TASKS = [
    { id: 'minutes', t: '회의록 요약', a: 0, why: '말을 글로 줄이기는 언어 모델의 특기' },
    { id: 'complain', t: '고객 불만 전화 응대', a: 1, why: '단순 문의는 AI, 화난 마음은 사람이' },
    { id: 'autocomplete', t: '코드 자동완성', a: 0, why: '‘다음 토큰 맞히기’ 그 자체' },
    { id: 'bug', t: '버그 원인 찾기', a: 1, why: 'AI가 후보를 좁히고, 사람이 재현·확인' },
    { id: 'req', t: '요구사항 정하기', a: 2, why: '무엇을 왜 만들지는 사용자를 만나야 안다' },
    { id: 'test', t: '테스트 코드 작성', a: 1, why: 'AI가 쓰고, 무엇을 검사할지는 사람이' },
    { id: 'drafts', t: '디자인 시안 여러 개 만들기', a: 0, why: '많이, 빨리 뽑기는 AI가 유리' },
    { id: 'final', t: '최종 디자인 결정', a: 2, why: '고르는 일 = 취향과 책임' },
    { id: 'security', t: '보안 사고 책임', a: 2, why: '책임은 AI가 대신 질 수 없다' },
    { id: 'translate', t: '번역 초안', a: 0, why: '초안은 AI, 뉘앙스 확인은 사람' },
    { id: 'child', t: '아이 돌보기', a: 2, why: '몸과 마음, 신뢰가 필요한 일' },
    { id: 'plumb', t: '배관 수리', a: 2, why: '집마다 다른 현장 손일, 로봇은 아직' },
  ];

  /* ───────────────────── 2. Bessen chart (values read off IMF F&D 2015 Chart 1, thousands) ───────────────────── */
  const TELLER_FIT = [[1970, 280], [1972, 302], [1974, 350], [1975, 390], [1976, 422], [1977, 450], [1978, 472], [1980, 497], [1983, 512], [1986, 522], [1990, 532], [1995, 537], [2000, 542], [2003, 549], [2006, 562], [2010, 578]];
  const TELLER_DOT = [[1970.1, 247], [1980.4, 508], [1984.4, 500], [1987.4, 518], [1990.5, 558], [1993.6, 555], [1997.6, 548], [1998.6, 564], [1999.7, 452], [2000.6, 492], [2001.6, 530], [2002.6, 526], [2003.6, 538], [2004.6, 573], [2005.7, 597], [2006.7, 603], [2007.6, 606], [2008.7, 598], [2009.8, 576]];
  const ATM_FIT = [[1970, 0], [1975, 3], [1978, 8], [1980, 15], [1982, 33], [1984, 55], [1987, 73], [1990, 82], [1992, 88], [1994, 103], [1996, 135], [1998, 190], [2000, 265], [2002, 335], [2004, 375], [2006, 395], [2008, 405], [2010, 412]];
  const ATM_DOT = [[1973.3, 1], [1976.3, 3], [1977.4, 4], [1978.3, 6], [1983.4, 45], [1987.4, 76], [1988.5, 79], [1990.6, 79], [1991.6, 82], [1992.6, 86], [1993.6, 92], [1994.6, 109], [1995.6, 121], [1996.6, 136], [1997.6, 167], [1998.6, 186], [1999.7, 230], [2000.6, 277], [2001.7, 324], [2002.6, 353], [2003.7, 371], [2004.7, 382], [2005.7, 394], [2006.7, 397], [2007.7, 409], [2008.7, 409], [2009.8, 429]];

  /* ───────────────────── 4. Canaries Fig. B.3 (software developers, Nov 2022 = 100; month 0 = Jan 2021) ───────────────────── */
  const SW_YOUNG = [[0, 86.3], [1, 86.8], [2, 86.0], [3, 88.6], [4, 84.6], [5, 87.5], [6, 89.9], [7, 88.6], [8, 88.6], [9, 91.1], [11, 90.9], [12, 92.9], [13, 93.4], [14, 92.4], [15, 92.5], [16, 91.8], [17, 95.7], [18, 99.9], [19, 100.8], [20, 101.3], [21, 100.8], [22, 100], [23, 97.8], [24, 95.9], [25, 96.6], [26, 95.9], [27, 92.7], [28, 92.2], [29, 92.8], [30, 93.7], [31, 92.6], [32, 92.9], [33, 91.4], [34, 90.4], [35, 88.3], [36, 88.8], [37, 88.6], [38, 87.5], [39, 87.1], [40, 86.9], [41, 87.4], [42, 88.0], [43, 88.1], [44, 87.4], [45, 86.9], [46, 85.3], [47, 83.9], [48, 83.3], [49, 82.7], [50, 82.0], [51, 80.4], [52, 83.3], [53, 85.0], [54, 85.8], [55, 86.1], [56, 84.7], [57, 84.7], [58, 83.6], [59, 82.0], [60, 82.3], [61, 81.0], [62, 80.6], [63, 79.4], [64, 78.9], [65, 81.3]];
  const SW_MID = [[0, 87.6], [2, 88.3], [3, 89.2], [4, 89.2], [5, 89.8], [6, 90.1], [7, 90.8], [8, 90.6], [9, 91.7], [10, 92.6], [11, 92.9], [12, 95.3], [13, 94.9], [14, 95.5], [15, 95.9], [16, 96.3], [17, 97.4], [18, 98.2], [19, 99.2], [20, 100.6], [21, 100], [22, 100], [24, 101.2], [26, 101.5], [27, 101.4], [28, 103.1], [29, 102.4], [30, 102.3], [31, 102.5], [32, 103.1], [33, 102.7], [34, 103.2], [35, 102.7], [36, 103.9], [37, 103.8], [38, 104.6], [39, 104.6], [40, 104.8], [41, 105.2], [42, 105.2], [43, 105.7], [44, 105.8], [45, 105.9], [46, 105.8], [47, 105.3], [48, 107.3], [49, 107.0], [50, 107.6], [51, 108.9], [52, 111.9], [53, 112.9], [54, 113.3], [55, 114.2], [56, 114.4], [57, 113.8], [58, 113.9], [59, 114.3], [60, 114.5], [61, 114.1], [62, 113.8], [63, 113.6], [64, 113.4], [65, 114.4]];

  /* ───────────────────── 5. software 1.0 / 2.0 / 3.0 ───────────────────── */
  const GOOD = ['좋', '맛있', '최고', '재밌'];
  const BAD = ['싫', '별로', '최악', '노잼'];
  function sentiment1(text) { // exactly what the 1.0 code on screen does
    let score = 0;
    GOOD.forEach((w) => { if (text.includes(w)) score += 1; });
    BAD.forEach((w) => { if (text.includes(w)) score -= 1; });
    return score > 0 ? '긍정' : '부정';
  }
  const SENTS = [['급식 너무 맛있다', '긍정'], ['체육대회 최악이었음', '부정'], ['하나도 안 맛있다', '부정']];
  const SW = [
    {
      tab: '1.0', sub: '사람이 쓴 코드',
      code: [
        ['c', '# 1.0: 사람이 규칙(if)을 하나하나 직접 쓴다'],
        ['k', 'def sentiment(text):'],
        ['k', '    score = 0'],
        ['k', '    for w in [<s>"좋", "맛있", "최고", "재밌"</s>]:'],
        ['k', '        if w in text: score += 1'],
        ['k', '    for w in [<s>"싫", "별로", "최악", "노잼"</s>]:'],
        ['k', '        if w in text: score -= 1'],
        ['k', '    if score > 0: return <s>"긍정"</s>'],
        ['k', '    return <s>"부정"</s>'],
      ],
    },
    {
      tab: '2.0', sub: '학습된 가중치',
      code: [
        ['c', '# 2.0 (2017): 규칙 대신 ‘예시 + 정답’을 잔뜩 모은다'],
        ['k', 'data = [(<s>"급식 너무 맛있다"</s>, <s>"긍정"</s>),'],
        ['k', '        (<s>"체육대회 최악"</s>, <s>"부정"</s>), ...]   <i># 수십만 개</i>'],
        ['k', 'model = train(data)   <i># 규칙은 학습이 찾는다</i>'],
        ['c', '# 결과물 = 사람이 읽을 수 없는 숫자(가중치) 덩어리 ↓'],
      ],
      canvas: true,
    },
    {
      tab: '3.0', sub: '말로 쓴 프롬프트',
      code: [
        ['c', '# 3.0 (2025): 프로그램을 ‘사람 말’로 쓴다 → LLM이 실행'],
        ['p', '너는 문장의 감정을 판별하는 프로그램이야.'],
        ['p', '문장을 읽고 “긍정” 또는 “부정” 한 단어로만 답해.'],
        ['p', '“안 ~다” 같은 부정 표현과 반어법도 생각해.'],
        ['p', ''],
        ['p', '문장: <s>{text}</s>'],
      ],
    },
  ];

  /* ───────────────────── 6. agent scripts ───────────────────── */
  const MENUS = ['제육볶음', '돈가스', '카레라이스', '짜장면', '김치볶음밥', '떡볶이', '치킨마요', '비빔밥'];
  const STUDENTS = ['김하늘', '이도윤', '박서연', '최지호', '정예린', '한유준'];
  const STAGES = ['계획', '작성', '테스트', '수정', '통과'];
  const SCRIPTS = [
    {
      label: '급식 메뉴 랜덤 뽑기',
      lines: [
        [0, 'cmd', '급식 메뉴 랜덤 뽑기 페이지 만들어 줘'],
        [0, 'h', '계획'],
        [0, 'p', '1. index.html     버튼 + 결과 칸'],
        [0, 'p', '2. menu.js        메뉴 목록과 pick() 함수'],
        [0, 'p', '3. menu.test.js   테스트 3개'],
        [1, 'h', '작성  menu.js'],
        [1, 'code', 'const MENUS = ["제육볶음", "돈가스", "카레라이스", ...];'],
        [1, 'code', 'export function pick(prev) {'],
        [1, 'code', '  const i = Math.floor(Math.random() * MENUS.length);'],
        [1, 'code', '  return MENUS[i];'],
        [1, 'code', '}'],
        [2, 'h', '테스트  npm test'],
        [2, 'pass', '목록 안의 메뉴를 고른다'],
        [2, 'pass', 'index.html에 뽑기 버튼이 있다'],
        [2, 'fail', '같은 메뉴가 두 번 연속 나오지 않는다'],
        [2, 'err', '100번 뽑았더니 12번이 직전과 같은 메뉴'],
        [3, 'h', '수정  직전 메뉴는 빼고 고르기'],
        [3, 'del', '  const i = Math.floor(Math.random() * MENUS.length);'],
        [3, 'del', '  return MENUS[i];'],
        [3, 'add', '  const pool = MENUS.filter((m) => m !== prev);'],
        [3, 'add', '  return pool[Math.floor(Math.random() * pool.length)];'],
        [4, 'h', '재테스트  npm test'],
        [4, 'pass', '3개 모두 통과 (0.4초)'],
        [4, 'done', '완료 — 오른쪽에 미리보기를 열었습니다'],
      ],
    },
    {
      label: '출석 체크 앱',
      lines: [
        [0, 'cmd', '동아리 출석 체크 앱 만들어 줘'],
        [0, 'h', '계획'],
        [0, 'p', '1. index.html     학생 목록 + 출석 수'],
        [0, 'p', '2. app.js         누르면 출석/결석 바꾸기'],
        [0, 'p', '3. app.test.js    테스트 3개'],
        [1, 'h', '작성  app.js'],
        [1, 'code', 'let count = 0;'],
        [1, 'code', 'function toggle(s) {'],
        [1, 'code', '  s.here = !s.here;'],
        [1, 'code', '  count += 1;'],
        [1, 'code', '}'],
        [2, 'h', '테스트  npm test'],
        [2, 'pass', '누르면 출석으로 바뀐다'],
        [2, 'pass', '학생 6명이 모두 보인다'],
        [2, 'fail', '두 번 누르면 출석 수가 원래대로 돌아온다'],
        [2, 'err', 'expected 0, received 2'],
        [3, 'h', '수정  숫자를 따로 세지 말고 목록에서 계산'],
        [3, 'del', 'let count = 0;'],
        [3, 'del', '  count += 1;'],
        [3, 'add', 'const count = () => students.filter((s) => s.here).length;'],
        [4, 'h', '재테스트  npm test'],
        [4, 'pass', '3개 모두 통과 (0.3초)'],
        [4, 'done', '완료 — 오른쪽에 미리보기를 열었습니다'],
      ],
    },
    {
      label: '회비 n빵 계산기',
      lines: [
        [0, 'cmd', '동아리 회비 n빵 계산기 만들어 줘'],
        [0, 'h', '계획'],
        [0, 'p', '1. index.html     총액·인원 + 결과'],
        [0, 'p', '2. split.js       1인당 금액 계산'],
        [0, 'p', '3. split.test.js  테스트 3개'],
        [1, 'h', '작성  split.js'],
        [1, 'code', 'export function perPerson(total, n) {'],
        [1, 'code', '  return Math.floor(total / n / 100) * 100;'],
        [1, 'code', '}'],
        [2, 'h', '테스트  npm test'],
        [2, 'pass', '40,000원 ÷ 10명 = 4,000원'],
        [2, 'pass', '결과는 100원 단위다'],
        [2, 'fail', '모은 돈이 총액보다 적으면 안 된다'],
        [2, 'err', '42,500원 ÷ 10명 → 42,000원 모임 (500원 모자람)'],
        [3, 'h', '수정  내림 대신 100원 단위 올림'],
        [3, 'del', '  return Math.floor(total / n / 100) * 100;'],
        [3, 'add', '  return Math.ceil(total / n / 100) * 100;'],
        [4, 'h', '재테스트  npm test'],
        [4, 'pass', '3개 모두 통과 (0.2초)'],
        [4, 'done', '완료 — 오른쪽에 미리보기를 열었습니다'],
      ],
    },
  ];
  const DELAY = { cmd: 0.55, h: 0.3, p: 0.22, pass: 0.4, fail: 0.55, err: 0.7, del: 0.28, done: 0.3 };

  Deck.part('future', 1, [
    /* ═══════════════════════ 1 ═══════════════════════ */
    {
      id: 'task-sorter',
      title: '직업은 ‘업무의 묶음’',
      minutes: 1.6,
      notes: '직업은 한 덩어리가 아니라 여러 업무의 묶음입니다. AI는 ‘직업 전체’가 아니라 ‘업무 하나하나’로 들어옵니다.\n학생 1명만 불러 카드 3장(코드 자동완성 · 요구사항 정하기 · 보안 사고 책임)만 옮기게 하고(끌어 놓거나, 카드를 클릭하면 다음 칸으로 이동), 나머지는 [제안 답 보기]로 한 번에 봅니다. 카드마다 근거 한 줄이 나오고, 우리 배치와 다른 카드에는 “우리: …”가 표시됩니다. [우리 배치로]로 되돌릴 수 있습니다.\n시간이 빠듯하면 압축 모드(S)로 보충 프레임(‘느낌 vs 측정’, ‘제번스의 역설’)을 건너뛰어 이 시간을 확보하세요.\n참고: Anthropic 통계(2025.2)에서 Claude 대화의 57%는 ‘함께 하기’, 43%는 ‘맡기기’였습니다.\n질문: “여러분이 꿈꾸는 직업을 카드 10장으로 쪼개면, 몇 장이 ‘사람이 꼭’ 칸에 남을까요?”',
      html: `
        <style>
          #f-task-sorter .ts-wrap{position:absolute;left:92px;right:92px;top:62px;bottom:66px;display:grid;grid-template-columns:330px 1fr;gap:44px}
          #f-task-sorter .ts-side{display:flex;flex-direction:column;gap:18px}
          #f-task-sorter .ts-side .title{font-size:68px;line-height:1.12;margin:4px 0 10px}
          #f-task-sorter .ts-hand{transform:rotate(-3deg);font-size:calc(42px * var(--hk, 1));margin:6px 0 4px}
          #f-task-sorter .ts-work{display:flex;flex-direction:column;gap:26px;min-height:0}
          #f-task-sorter .ts-pool{position:relative;border:3px dashed var(--ink-3);border-radius:16px 6px 14px 5px/6px 14px 5px 16px;padding:30px 22px 26px;display:flex;flex-wrap:wrap;gap:18px 16px;align-content:flex-start;min-height:120px;transition:box-shadow .2s}
          #f-task-sorter .ts-lab{position:absolute;top:-16px;left:22px;background:var(--paper);padding:0 10px;font-family:var(--font-mono);font-size:20px;color:var(--ink-2);line-height:1.4}
          #f-task-sorter .ts-bins{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;flex:1;min-height:0}
          #f-task-sorter .ts-bin{position:relative;border:3px solid var(--ink);border-radius:18px 6px 16px 5px/6px 16px 5px 18px;padding:14px 14px 16px;display:flex;flex-direction:column;gap:12px;min-height:0;background:var(--paper);background:color-mix(in srgb,var(--paper) 90%,transparent);transition:box-shadow .2s}
          #f-task-sorter .ts-bin.b0{border-style:dashed}
          #f-task-sorter .ts-bin.b1{border-color:var(--pen)}
          #f-task-sorter .ts-bin.b2{border-width:4px}
          #f-task-sorter .ts-bin.over, #f-task-sorter .ts-pool.over{box-shadow:inset 0 0 0 999px var(--hl-soft)}
          #f-task-sorter .ts-bin h3{font-family:var(--font-display);font-weight:800;font-size:38px;line-height:1.05;display:flex;flex-direction:column;gap:4px}
          #f-task-sorter .ts-bin h3 small{font-family:var(--font-mono);font-weight:400;font-size:20px;color:var(--ink-2)}
          #f-task-sorter .ts-drop{display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start;flex:1}
          #f-task-sorter .ts-card{position:relative;display:flex;flex-direction:column;gap:2px;max-width:100%;font-size:26px;font-weight:600;line-height:1.25;padding:11px 17px;background:var(--paper);color:var(--ink);border:2.5px solid var(--ink);border-radius:4px 10px 4px 10px/10px 4px 10px 4px;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;transform:rotate(var(--r,0deg));word-break:keep-all}
          #f-task-sorter .ts-card.anim{transition:transform .45s cubic-bezier(.2,.8,.2,1)}
          #f-task-sorter .ts-card.drag{cursor:grabbing;z-index:30;box-shadow:var(--shadow);transition:none}
          #f-task-sorter .ts-card .ts-t{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:0 10px}
          #f-task-sorter .ts-card .mine{font-family:var(--font-hand);font-weight:400;font-size:calc(28px * var(--hk, 1));color:var(--pen);white-space:nowrap}
          #f-task-sorter .ts-card .why{display:none;font-weight:400;font-size:20px;line-height:1.3;color:var(--ink-2)}
          #f-task-sorter .ts-bin::after{content:"여기에 놓기";position:absolute;left:0;right:0;bottom:14px;text-align:center;font-family:var(--font-hand);font-size:calc(34px * var(--hk, 1));color:var(--ink-3);pointer-events:none}
          #f-task-sorter.ts-on .ts-bin::after, #f-task-sorter .ts-bin:has(.ts-card:nth-child(5))::after{content:none}
          #f-task-sorter.ts-on .ts-pool{display:none}
          #f-task-sorter.ts-on .ts-card{width:100%;cursor:default;--r:0deg !important}
          #f-task-sorter.ts-on .ts-card .why{display:block}
          #f-task-sorter.ts-on .ts-bin.b0 .ts-card{border-style:dashed}
          #f-task-sorter .ts-pool:not(:has(.ts-card)){min-height:56px;padding-top:0;padding-bottom:0}
          #f-task-sorter .ts-bin:has(.ts-card:nth-child(7)) .ts-drop{gap:8px}
          #f-task-sorter .ts-bin:has(.ts-card:nth-child(7)) .ts-card{font-size:23px;padding:6px 13px}
          #f-task-sorter .ts-bin:has(.ts-card:nth-child(10)) .ts-drop{gap:6px}
          #f-task-sorter .ts-bin:has(.ts-card:nth-child(10)) .ts-card{font-size:21px;padding:4px 12px}
        </style>
        <div class="ts-wrap">
          <div class="ts-side">
            <div class="kicker">생각 실험 · 일을 쪼개 보기</div>
            <h2 class="title">직업은<br>‘업무의<br><span class="mark">묶음</span>’</h2>
            <p class="small muted" style="line-height:1.4">업무 카드를 끌어서<br>오른쪽 세 칸에 나눠 보세요.<br><span class="tiny">(세 장은 예시로 넣어 두었어요)</span></p>
            <div class="hand ts-hand">정답은 없다!<br>왜 그렇게 나눴는지가<br>진짜 답</div>
            <div class="btns demo" style="margin-top:auto"><button class="btn ts-reveal">제안 답 보기</button><button class="btn ghost ts-reset">처음으로</button></div>
            <div class="mono tiny faint">카드를 클릭하면 다음 칸으로</div>
          </div>
          <div class="ts-work demo">
            <div class="ts-pool" data-bin="pool"><span class="ts-lab">남은 업무 카드 9장</span></div>
            <div class="ts-bins">${BINS.map((b, i) => `<div class="ts-bin b${i}" data-bin="${i}"><h3>${b.name}<small>${b.sub}</small></h3><div class="ts-drop"></div></div>`).join('')}</div>
          </div>
        </div>
        <div class="src">제안 답은 강사의 의견입니다 · 참고: Anthropic Economic Index(2025.2) — Claude 대화의 57%는 ‘함께 하기’(증강), 43%는 ‘맡기기’(자동화)</div>`,
      init(el, K) {
        handFit(el);
        const stage = el.querySelector('.stage');
        const work = el.querySelector('.ts-work');
        const pool = el.querySelector('.ts-pool');
        const bins = Array.from(el.querySelectorAll('.ts-bin'));
        const btn = el.querySelector('.ts-reveal');
        const lab = el.querySelector('.ts-lab');
        const updateLab = () => { const n = TASKS.filter((t) => place[t.id] === 'pool').length; lab.textContent = n ? `남은 업무 카드 ${n}장` : '카드를 모두 나눴어요'; };
        const box = (key) => (key === 'pool' ? pool : bins[key].querySelector('.ts-drop'));
        const rnd = K.rand(42);
        const START = { minutes: 0, bug: 1, child: 2 }; // worked examples so the board never starts empty
        const place = {}, cards = {};
        let revealed = false;
        TASKS.forEach((t) => {
          const c = K.el(`<div class="ts-card" data-id="${t.id}"><div class="ts-t"><span>${t.t}</span><span class="mine"></span></div><div class="why">${t.why}</div></div>`);
          c.style.setProperty('--r', ((rnd() - 0.5) * 4).toFixed(2) + 'deg');
          cards[t.id] = c; place[t.id] = START[t.id] != null ? START[t.id] : 'pool'; box(place[t.id]).appendChild(c);
        });
        const all = () => TASKS.map((t) => cards[t.id]);
        updateLab();
        function flip(list, mutate) {
          const k = (stage.getBoundingClientRect().width / 1600) || 1;
          const before = new Map(list.map((c) => [c, c.getBoundingClientRect()]));
          mutate();
          list.forEach((c) => {
            const a = before.get(c), b = c.getBoundingClientRect();
            const dx = (a.left - b.left) / k, dy = (a.top - b.top) / k;
            c.classList.remove('anim', 'drag');
            if (Math.abs(dx) + Math.abs(dy) < 1) { c.style.transform = ''; return; }
            c.style.transform = `translate(${dx}px,${dy}px) rotate(var(--r,0deg))`;
            void c.offsetWidth;
            c.classList.add('anim');
            c.style.transform = '';
          });
        }
        function move(c, key) {
          place[c.dataset.id] = key;
          flip([c], () => { c.style.transform = ''; box(key).appendChild(c); });
          updateLab();
        }
        function binAt(x, y) {
          const inR = (n) => { const r = n.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
          for (let i = 0; i < bins.length; i++) if (inR(bins[i])) return i;
          return inR(pool) ? 'pool' : null;
        }
        function hover(key) {
          bins.forEach((b, i) => b.classList.toggle('over', key === i));
          pool.classList.toggle('over', key === 'pool');
        }
        function setReveal(on) {
          revealed = on;
          flip(all(), () => {
            el.classList.toggle('ts-on', on);
            TASKS.forEach((t) => {
              const c = cards[t.id], mine = place[t.id];
              box(on ? t.a : mine).appendChild(c);
              c.querySelector('.mine').textContent = on && mine !== 'pool' && mine !== t.a ? '우리: ' + BINS[mine].name : '';
            });
          });
          btn.textContent = on ? '우리 배치로' : '제안 답 보기';
          btn.classList.toggle('on', on);
        }
        btn.addEventListener('click', () => setReveal(!revealed));
        el.querySelector('.ts-reset').addEventListener('click', () => {
          TASKS.forEach((t) => { place[t.id] = START[t.id] != null ? START[t.id] : 'pool'; });
          updateLab();
          if (revealed) setReveal(false);
          else flip(all(), () => TASKS.forEach((t) => box(place[t.id]).appendChild(cards[t.id])));
        });

        let drag = null;
        work.addEventListener('pointerdown', (e) => {
          const c = e.target.closest('.ts-card');
          if (!c || revealed || e.button !== 0) return;
          e.preventDefault();
          try { c.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          drag = { c, p0: K.pt(e, stage), moved: false };
        });
        work.addEventListener('pointermove', (e) => {
          if (!drag) return;
          const p = K.pt(e, stage), dx = p.x - drag.p0.x, dy = p.y - drag.p0.y;
          if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; drag.c.classList.remove('anim'); drag.c.classList.add('drag'); }
          if (drag.moved) {
            drag.c.style.transform = `translate(${dx}px,${dy}px) rotate(-3deg) scale(1.04)`;
            hover(binAt(e.clientX, e.clientY));
          }
        });
        const end = (e) => {
          if (!drag) return;
          const d = drag; drag = null; hover(null);
          const c = d.c, cur = place[c.dataset.id];
          if (!d.moved) { if (e.type === 'pointerup') move(c, cur === 'pool' ? 0 : (cur + 1) % 3); return; }
          const target = e.type === 'pointerup' ? binAt(e.clientX, e.clientY) : null;
          if (target == null) { c.classList.remove('drag'); c.classList.add('anim'); c.style.transform = ''; return; }
          move(c, target);
        };
        work.addEventListener('pointerup', end);
        work.addEventListener('pointercancel', end);
      },
    },

    /* ═══════════════════════ 2 ═══════════════════════ */
    {
      id: 'jobs-history',
      title: '기술은 일을 없애기보다 바꾼다',
      minutes: 0.8,
      notes: 'ATM은 창구 직원이 하던 현금 업무를 가져갔지만, 미국 은행 창구 직원 수는 줄지 않았습니다. 지점 하나를 운영하는 비용이 싸지니 은행이 지점을 더 열었고(도시 지점 +43%), 직원의 일은 현금 세기에서 상담으로 바뀌었습니다.\n→ 키 ① 창구 직원 선 ② 이유 세 가지 ③ 그 뒤의 반전(모바일 뱅킹 시대: 2025년 33.9만 명, 10년간 −13% 전망)과 정말로 사라진 직업들(엘리베이터 운전원, 전화교환원).\n질문: “ATM은 창구 직원의 일을 바꿨고, 스마트폰 뱅킹은 그 일을 줄이고 있어요. 두 기술은 무엇이 달랐을까요?”',
      html: `
        <style>
          #f-jobs-history .jh-body{position:absolute;left:92px;right:92px;top:212px;display:grid;grid-template-columns:930px 1fr;gap:40px}
          #f-jobs-history .jh-chart text{font-size:20px}
          #f-jobs-history .jh-chart .lab{font-family:var(--font-body);font-size:24px;font-weight:600;fill:var(--ink)}
          #f-jobs-history .jh-chart .lab.pen{fill:var(--pen)}
          #f-jobs-history .jh-chart .hnote{font-family:var(--font-hand);font-size:calc(36px * var(--hk, 1));fill:var(--pen)}
          #f-jobs-history .jh-q{display:none}
          #f-jobs-history.current.q0 .jh-q{display:inline}
          #f-jobs-history.current.q0 .jh-a{display:none}
          #f-jobs-history .jh-why{display:flex;flex-direction:column;gap:16px;font-size:25px;line-height:1.35;word-break:keep-all}
          #f-jobs-history .jh-item{display:grid;grid-template-columns:38px 1fr;gap:10px}
          #f-jobs-history .jh-n{font-family:var(--font-mono);font-weight:600;color:var(--pen);font-size:26px}
          #f-jobs-history .jh-ic{display:block;margin:8px 0 2px;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round;fill:none}
          #f-jobs-history .jh-ic .gone{stroke:var(--ink-3);stroke-dasharray:3 4}
          #f-jobs-history .jh-ic .new{stroke:var(--pen)}
          #f-jobs-history .jh-ic text{stroke:none;fill:var(--ink-2);font-family:var(--font-mono);font-size:20px}
          #f-jobs-history .jh-gone{left:92px;right:92px;top:770px;font-size:25px;display:flex;gap:16px;align-items:baseline;border-top:2.5px solid var(--ink);padding:12px 0 8px;background:var(--paper)}
        </style>
        <div class="kicker">역사에서 배우기 · 미국의 ATM과 은행 창구 직원</div>
        <h2 class="title">기술은 일을 없애기보다 <span class="mark">바꾼다</span></h2>
        <div class="jh-body">
          <svg class="chart jh-chart" viewBox="0 0 930 550" width="930" height="550" aria-label="미국 ATM 설치 대수와 은행 창구 직원 수, 1970–2010"></svg>
          <div class="jh-why" data-step="2">
            <div class="subtitle">왜 줄지 않았을까?</div>
            <div class="jh-item"><div class="jh-n">1</div><div>지점 하나에 필요한 직원이 줄었다<svg class="jh-ic jh-people" width="420" height="104" viewBox="0 0 420 104"></svg></div></div>
            <div class="jh-item"><div class="jh-n">2</div><div>운영비가 싸지자 <b>지점을 더</b> 열었다<svg class="jh-ic jh-houses" width="420" height="58" viewBox="0 0 420 58"></svg><span class="mono tiny muted">도시 지점 수 +43%</span></div></div>
            <div class="jh-item"><div class="jh-n">3</div><div>창구 직원의 일이 바뀌었다<br><span class="strike">현금 세기</span> → <span class="mark">상담 · 관계</span></div></div>
          </div>
        </div>
        <div class="abs jh-gone" data-step="3"><span class="mono tiny muted" style="white-space:nowrap">대비</span><span>물론 정말로 사라진 일도 있다 — <b>엘리베이터 운전원</b> <span class="muted">(1950년대 자동 엘리베이터)</span> · <b>전화교환원</b> <span class="muted">(자동 교환기 → 대신 접수원이 늘었다)</span></span></div>
        <div class="src">출처: J. Bessen, “Toil and Technology”, IMF F&amp;D 2015.3 (Chart 1을 다시 그림, 그래프 판독 근삿값) · 2025년 수치·전망: 미국 노동통계국 OOH · 엘리베이터: Wikipedia</div>`,
      init(el, K) {
        handFit(el);
        const svg = el.querySelector('.jh-chart');
        const X0 = 96, X1 = 905, Y0 = 500, Y1 = 26, yr0 = 1970, yr1 = 2025, vmax = 700;
        const X = (y) => X0 + ((y - yr0) / (yr1 - yr0)) * (X1 - X0);
        const Y = (v) => Y0 - (v / vmax) * (Y0 - Y1);
        const P = (pts) => pts.map(([a, b]) => [X(a), Y(b)]);
        const S = K.svg;
        // grid + axes
        for (let v = 0; v <= vmax; v += 100) {
          S('line', { class: 'gridl', x1: X0, x2: X1, y1: Y(v), y2: Y(v) }, svg);
          S('text', { x: X0 - 12, y: Y(v) + 7, 'text-anchor': 'end' }, svg).textContent = v === 0 ? '0' : v / 10 + '만';
        }
        [1970, 1980, 1990, 2000, 2010, 2020].forEach((y) => {
          S('line', { class: 'ax', x1: X(y), x2: X(y), y1: Y0, y2: Y0 + 8 }, svg);
          S('text', { x: X(y), y: Y0 + 34, 'text-anchor': 'middle' }, svg).textContent = y;
        });
        S('line', { class: 'ax', x1: X0, x2: X1, y1: Y0, y2: Y0 }, svg);
        S('line', { class: 'ax', x1: X0, x2: X0, y1: Y1, y2: Y0 }, svg);
        // step 3 backdrop: after Bessen's data
        const g3 = S('g', { 'data-step': '3' }, svg);
        S('rect', { x: X(2010.5), y: Y1, width: X(2025) - X(2010.5) + 10, height: Y0 - Y1, fill: 'var(--paper-2)', opacity: 0.75 }, g3);
        // ATMs (always visible)
        const gA = S('g', {}, svg);
        S('path', { class: 'ln pen', d: K.sketchPath(P(ATM_FIT), { tension: 0.5 }), 'stroke-width': 5 }, gA);
        ATM_DOT.forEach(([a, b]) => S('rect', { x: X(a) - 4, y: Y(b) - 4, width: 8, height: 8, fill: 'var(--pen)', opacity: 0.55 }, gA));
        S('text', { class: 'lab pen', x: X(1984), y: Y(140) }, gA).textContent = 'ATM 설치 대수';
        // question (step 0 only) / answer
        const qa = S('text', { class: 'hnote', x: X(1972), y: Y(655) }, svg);
        qa.innerHTML = '<tspan class="jh-q">ATM이 늘면, 창구 직원은?</tspan><tspan class="jh-a">ATM이 늘어도 창구 직원은 줄지 않았다</tspan>';
        // tellers (step 1)
        const gT = S('g', { 'data-step': '1' }, svg);
        S('path', { class: 'ln', d: K.sketchPath(P(TELLER_FIT), { tension: 0.5 }), 'stroke-width': 5.5 }, gT);
        TELLER_DOT.forEach(([a, b]) => S('path', { d: `M${X(a)},${Y(b) - 6}l6,6l-6,6l-6,-6z`, fill: 'var(--ink-2)', opacity: 0.6 }, gT));
        S('text', { class: 'lab', x: X(1979), y: Y(580) }, gT).textContent = '은행 창구 직원 수';
        // reversal (step 3)
        const yB = 339.2;
        S('path', { class: 'ln', d: `M${X(2010)},${Y(578)} L${X(2025)},${Y(yB)}`, 'stroke-dasharray': '2 11', 'stroke-width': 4 }, g3);
        S('circle', { class: 'dot', cx: X(2025), cy: Y(yB), r: 8 }, g3);
        S('text', { x: X(2025) - 16, y: Y(yB) + 38, 'text-anchor': 'end', style: 'fill:var(--ink);font-weight:600' }, g3).textContent = '2025년 33.9만 명';
        const rv = S('text', { class: 'hnote', x: X(2011), y: Y(232), style: 'font-size:calc(32px * var(--hk, 1))' }, g3);
        rv.innerHTML = `<tspan x="${X(2011)}">그 뒤 반전:</tspan><tspan x="${X(2011)}" dy="36">모바일 뱅킹 시대</tspan><tspan x="${X(2011)}" dy="36">→ 10년간 −13% 전망</tspan>`;
        S('text', { x: X(2017.75), y: Y1 + 26, 'text-anchor': 'middle', style: 'font-size:20px' }, g3).textContent = '다른 통계(BLS)';

        // why-panel ink diagrams
        const pp = el.querySelector('.jh-people');
        const person = (x, y, cls) => {
          const g = S('g', cls ? { class: cls } : {}, pp);
          S('circle', { cx: x, cy: y + 5, r: 5 }, g);
          S('path', { d: `M${x},${y + 11}V${y + 27}M${x - 6},${y + 17}H${x + 6}M${x},${y + 27}L${x - 5},${y + 37}M${x},${y + 27}L${x + 5},${y + 37}` }, g);
        };
        S('text', { x: 0, y: 30 }, pp).textContent = '1988';
        S('text', { x: 0, y: 82 }, pp).textContent = '2004';
        for (let i = 0; i < 20; i++) person(66 + i * 17.5, 6, null);
        for (let i = 0; i < 20; i++) person(66 + i * 17.5, 58, i < 13 ? null : 'gone');
        const lbl = el.querySelector('.jh-people');
        lbl.insertAdjacentHTML('afterend', '<span class="mono tiny muted">지점당 창구 직원 20명 → 13명 (도시 평균)</span>');
        const hh = el.querySelector('.jh-houses');
        const house = (x, cls) => {
          const g = S('g', cls ? { class: cls } : {}, hh);
          S('path', { d: `M${x},22L${x + 13},8L${x + 26},22V50H${x}Z M${x + 9},50V38H${x + 17}V50` }, g);
        };
        for (let i = 0; i < 10; i++) house(4 + i * 36, i < 7 ? null : 'new');
      },
      onStep(el, step) { el.classList.toggle('q0', step === 0); },
      leave(el) { el.classList.remove('q0'); },
    },

    /* ═══════════════════════ 3 ═══════════════════════ */
    {
      id: 'wef-2030',
      title: 'WEF: 2030년의 일자리',
      minutes: 0.9,
      notes: '세계경제포럼(WEF)이 55개국 1,000개 넘는 기업에 물었습니다. 2030년까지 1억 7천만 개의 일자리가 생기고 9,200만 개가 사라져, 7,800만 개가 늘어난다는 전망입니다.\n가장 빨리 느는 직업 1–4위는 데이터·AI·소프트웨어 직군이고(4위가 소프트웨어·앱 개발자), 5위 보안 관리 전문가는 지정학적 긴장의 영향이 큽니다. 가장 빨리 주는 직업은 반복 사무직이고 2위가 방금 본 은행 창구 직원입니다. 막대는 프레임에 들어오면 자라고, [다시 보기]로 다시 재생됩니다.\n기업이 꼽은 핵심 역량 1위는 분석적 사고(69%), 프로그래밍은 26개 중 23위(17%)라는 점도 짚어 주세요. 단, 생기는 자리와 사라지는 자리는 서로 다른 자리입니다(근로자 100명 중 59명은 2030년까지 재교육 필요).\n질문: “코딩을 배우는 진짜 이유가 ‘프로그래밍 기술’ 하나가 아니라면, 무엇일까요?”',
      html: `
        <style>
          #f-wef-2030 .wf-body{position:absolute;left:92px;right:92px;top:236px;display:grid;grid-template-columns:600px 1fr;gap:56px}
          #f-wef-2030 .wf-chart .num{font-family:var(--font-mono);font-weight:600;font-size:34px;fill:var(--ink)}
          #f-wef-2030 .wf-chart .num.bad{fill:var(--bad)}
          #f-wef-2030 .wf-chart .cat{font-family:var(--font-body);font-size:24px;font-weight:600;fill:var(--ink)}
          #f-wef-2030 .wf-chart .bar.out{fill:url(#wf-hatch);stroke:var(--bad);stroke-width:3}
          #f-wef-2030 .wf-lists{display:grid;grid-template-columns:1fr 1fr;gap:34px}
          #f-wef-2030 h3{font-family:var(--font-display);font-weight:800;font-size:30px;line-height:1.2;margin-bottom:10px}
          #f-wef-2030 ol{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;font-size:25px;line-height:1.3}
          #f-wef-2030 ol li{display:grid;grid-template-columns:30px 1fr;gap:8px}
          #f-wef-2030 ol li b{font-family:var(--font-mono);font-weight:600;color:var(--ink-3)}
          #f-wef-2030 .up b{color:var(--good)}
          #f-wef-2030 .down b{color:var(--bad)}
          #f-wef-2030 .wf-skills{margin-top:26px}
          #f-wef-2030 .sk{display:grid;grid-template-columns:38px 250px 1fr;align-items:center;gap:8px;font-size:22px;line-height:1.5}
          #f-wef-2030 .sk .r{font-family:var(--font-mono);color:var(--ink-3)}
          #f-wef-2030 .sk .bw{display:flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:20px;color:var(--ink-2)}
          #f-wef-2030 .sk .bw i{display:block;height:16px;background:var(--ink)}
          #f-wef-2030 .sk.prog .bw i{background:var(--pen)}
          #f-wef-2030 .sk.gap{height:10px}
        </style>
        <div class="kicker">세계경제포럼(WEF) 「일자리의 미래」 2025 · 55개국 1,000여 개 기업 설문</div>
        <h2 class="title">2030년까지, 생기는 일이 <span class="mark">더 많다</span></h2>
        <div class="wf-body">
          <div class="demo">
            <svg class="chart wf-chart" viewBox="0 0 600 500" width="600" height="500" aria-label="2025–2030 일자리 생성 1억 7천만, 소멸 9천2백만, 순증 7천8백만"></svg>
            <div class="row center" style="justify-content:space-between;margin-top:-6px">
              <span class="small muted">지금 일자리의 22%가 뒤바뀌는 셈</span>
              <button class="btn sm ghost wf-replay">다시 보기</button>
            </div>
          </div>
          <div>
            <div class="wf-lists">
              <div class="up"><h3>가장 빨리 <span class="good">느는</span> 직업</h3><ol>
                <li><b>1</b>빅데이터 전문가</li><li><b>2</b>핀테크(금융+IT) 엔지니어</li><li><b>3</b>AI·머신러닝 전문가</li><li><b>4</b><span><span class="mark">소프트웨어·앱 개발자</span></span></li><li><b>5</b>보안 관리 전문가</li></ol></div>
              <div class="down"><h3>가장 빨리 <span class="bad">주는</span> 직업</h3><ol>
                <li><b>1</b>우편 사무원</li><li><b>2</b><span>은행 창구 직원 <span class="hand" style="font-size:calc(30px * var(--hk, 1))">← 방금 그 직업</span></span></li><li><b>3</b>데이터 입력원</li><li><b>4</b>계산원·매표원</li><li><b>5</b>행정 비서</li></ol></div>
            </div>
            <div class="wf-skills">
              <h3>기업이 꼽은 핵심 역량 <span class="mono tiny muted" style="font-weight:400">(26개 중 순위 · 꼽은 기업 비율)</span></h3>
              <div class="wf-sk"></div>
            </div>
          </div>
        </div>
        <div class="src">출처: World Economic Forum, Future of Jobs Report 2025 (2025.1) — 2025→2030 기업 설문 전망, Figure 2.2(빨리 느는·주는 직업)·Figure 3.3(핵심 역량)</div>`,
      init(el, K, f) {
        handFit(el);
        const svg = el.querySelector('.wf-chart');
        const S = K.svg;
        const defs = S('defs', {}, svg);
        const pat = S('pattern', { id: 'wf-hatch', width: 12, height: 12, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
        S('line', { x1: 0, y1: 0, x2: 0, y2: 12, style: 'stroke:var(--bad);stroke-width:3' }, pat);
        const base = 436, k = 340 / 170, bw = 150, xs = [30, 225, 420];
        const yTop = base - 170 * k, yMid = yTop + 92 * k;
        S('line', { class: 'ax', x1: 0, x2: 600, y1: base, y2: base }, svg);
        S('line', { x1: xs[0] + bw, x2: xs[1], y1: yTop, y2: yTop, style: 'stroke:var(--ink-3);stroke-width:2;stroke-dasharray:5 6' }, svg);
        S('line', { x1: xs[1] + bw, x2: xs[2], y1: yMid, y2: yMid, style: 'stroke:var(--ink-3);stroke-width:2;stroke-dasharray:5 6' }, svg);
        const b1 = S('rect', { class: 'bar', x: xs[0], width: bw }, svg);
        const b2 = S('rect', { class: 'bar out', x: xs[1], width: bw }, svg);
        const b3 = S('rect', { class: 'bar hl', x: xs[2], width: bw }, svg);
        const t1 = S('text', { class: 'num', x: xs[0] + bw / 2, 'text-anchor': 'middle' }, svg);
        const t2 = S('text', { class: 'num bad', x: xs[1] + bw / 2, 'text-anchor': 'middle' }, svg);
        const t3 = S('text', { class: 'num', x: xs[2] + bw / 2, 'text-anchor': 'middle' }, svg);
        [['새로 생김', 0], ['사라짐', 1], ['순증', 2]].forEach(([s, i]) => { S('text', { class: 'cat', x: xs[i] + bw / 2, y: base + 38, 'text-anchor': 'middle' }, svg).textContent = s; });
        const fmt = (v) => { if (v < 100) return `${won(v * 100)}만`; const r = Math.round((v - 100) * 100); return r ? `1억 ${won(r)}만` : '1억'; }; // v: 백만 개
        function draw(p1, p2, p3) {
          const h1 = 170 * k * p1, h2 = 92 * k * p2, h3 = 78 * k * p3;
          b1.setAttribute('y', base - h1); b1.setAttribute('height', h1);
          b2.setAttribute('y', yTop); b2.setAttribute('height', h2);
          b3.setAttribute('y', base - h3); b3.setAttribute('height', h3);
          t1.setAttribute('y', base - h1 - 16); t1.textContent = '+' + fmt(170 * p1);
          t2.setAttribute('y', yTop + h2 + 42); t2.textContent = '−' + fmt(92 * p2);
          t3.setAttribute('y', base - h3 - 16); t3.textContent = '+' + fmt(78 * p3);
          t1.style.opacity = p1 > 0.02 ? 1 : 0; t2.style.opacity = p2 > 0.02 ? 1 : 0; t3.style.opacity = p3 > 0.02 ? 1 : 0;
        }
        draw(1, 1, 1);
        const anim = { t0: null, on: false };
        f._wfStart = () => { anim.t0 = null; anim.on = true; draw(0, 0, 0); };
        K.loop(el, (t) => {
          if (!anim.on) return;
          if (anim.t0 == null) anim.t0 = t;
          const e = t - anim.t0, c = (a, d) => K.easeOut(K.clamp((e - a) / d, 0, 1));
          const p1 = c(0.05, 0.6), p2 = c(0.7, 0.45), p3 = c(1.2, 0.45);
          draw(p1, p2, p3);
          if (p3 >= 1) anim.on = false;
        });
        f._wfEnd = () => { anim.on = false; draw(1, 1, 1); };
        el.querySelector('.wf-replay').addEventListener('click', () => f._wfStart());
        // skills list
        const SK = [[1, '분석적 사고', 69], [2, '회복탄력성·유연성', 67], [3, '리더십·사회적 영향력', 61], [4, '창의적 사고', 57], [0], [11, 'AI·빅데이터', 45], [23, '프로그래밍', 17]];
        el.querySelector('.wf-sk').innerHTML = SK.map(([r, n, v]) => (r === 0 ? '<div class="sk gap"></div>' :
          `<div class="sk${r === 23 ? ' prog' : ''}"><span class="r">${r}</span><span>${n}</span><span class="bw"><i style="width:${v * 3.3}px"></i>${v}%${r === 23 ? '<span class="hand" style="font-size:calc(30px * var(--hk, 1));margin-left:6px">생각보다 낮다?</span>' : ''}</span></div>`)).join('');
      },
      enter(el, K, f) { f._wfStart && f._wfStart(); },
      leave(el, K, f) { f._wfEnd && f._wfEnd(); },
    },

    /* ═══════════════════════ 4 ═══════════════════════ */
    {
      id: 'entry-level',
      title: '솔직한 데이터: 신입 자리부터',
      minutes: 0.9,
      notes: '스탠퍼드 연구진(‘탄광 속 카나리아’)이 미국 급여 데이터(ADP, 수백만 명)를 봤더니, AI 노출도가 높은 직업(AI가 할 수 있는 업무가 많은 직업)에서 22–25세 고용이 유독 꺾였습니다. 소프트웨어 개발자 22–25세는 2022년 11월보다 약 20% 줄었고, 35–40세는 오히려 14%쯤 늘었습니다. 해고보다는 ‘덜 뽑는’ 방식이고, 저자들도 원인을 AI로 단정하지 않습니다(카나리아 = 광부에게 먼저 위험을 알려 주던 새, 즉 ‘초기 신호’).\n→ 키 ① 한국도? — 한국은행(2026.8): 2022.6→2026.6 청년 취업자 28.5만 명 감소 중 94%(26.8만)가 AI 고노출 업종, 컴퓨터 프로그래밍·SI 청년 고용 −16.6%. 한국노동연구원(2025.12): 2024년 SW 개발자 중 3년 미만은 9천 명 줄고 3년 이상은 4.2만 명 늘었습니다. 한은도 AI를 단독 원인으로 보지 않고(팬데믹 때 과잉 채용의 정상화, 경력직 선호 등), 청년 인구 감소도 함께 작용합니다 ② 결론.\n덧붙일 수 있는 말: 다리오 아모데이(Anthropic CEO)는 2025년 5월 “1~5년 안에 신입 사무직 일자리의 절반이 사라질 수 있다”고 경고했습니다(Axios·Fortune 2025.5.28). 예측일 뿐 사실이 아님을 꼭 강조하세요.\n질문: “회사가 신입에게 맡기던 일을 AI가 한다면, 여러분은 첫 직장에 무엇을 들고 가야 할까요?”',
      html: `
        <style>
          #f-entry-level .el-grid{position:absolute;left:92px;right:92px;top:62px;display:grid;grid-template-columns:450px 1fr;gap:46px}
          #f-entry-level .el-left{display:flex;flex-direction:column;gap:18px}
          #f-entry-level .stat b{color:var(--bad);font-size:96px}
          #f-entry-level .stat span{font-size:22px;line-height:1.4}
          #f-entry-level .stat .el-x{font-family:var(--font-body);font-size:22px;font-weight:700;letter-spacing:0;color:var(--ink)}
          #f-entry-level .stat .el-def{display:inline-block;margin-top:6px;font-family:var(--font-mono);font-size:20px;color:var(--ink-2)}
          #f-entry-level .el-kr{position:relative;margin-top:8px;padding:18px 16px 8px;display:flex;flex-direction:column;gap:3px;word-break:keep-all}
          #f-entry-level .el-kr-h{position:absolute;top:-21px;left:16px;background:var(--paper);padding:0 10px;font-family:var(--font-display);font-weight:800;font-size:28px;line-height:1.3}
          #f-entry-level .el-kr-r{display:grid;grid-template-columns:106px 1fr;gap:10px;align-items:baseline;font-size:22px;line-height:1.28}
          #f-entry-level .el-kr-r > b{font-family:var(--font-mono);font-weight:600;font-size:24px;color:var(--bad);text-align:right;white-space:nowrap}
          #f-entry-level .el-kr-r.up > b{color:var(--ink)}
          #f-entry-level .el-kr-r small{font-family:var(--font-mono);font-size:20px;color:var(--ink-2)}
          #f-entry-level .el-kr-n{font-size:20px;color:var(--ink-2);line-height:1.3;margin-top:3px;text-align:right}
          #f-entry-level .el-ct{font-family:var(--font-display);font-weight:600;font-size:30px;margin:8px 0 0 54px}
          #f-entry-level .el-chart text{font-size:20px}
          #f-entry-level .el-chart .end{font-family:var(--font-body);font-weight:700;font-size:26px}
          #f-entry-level .el-chart .end2{font-family:var(--font-mono);font-weight:600;font-size:30px}
          #f-entry-level .el-chart .young{stroke:var(--bad);stroke-width:5.5}
          #f-entry-level .el-concl{left:92px;right:92px;top:736px;display:flex;align-items:baseline;gap:22px;font-family:var(--font-display);font-weight:800;font-size:44px}
          #f-entry-level .el-concl .hand{font-size:calc(52px * var(--hk, 1));font-weight:400}
        </style>
        <div class="el-grid">
          <div class="el-left">
            <div class="kicker">솔직한 데이터 · 스탠퍼드 연구</div>
            <h2 class="title md">신입 자리부터<br>줄고 있다</h2>
            <div class="stat"><b>−19%</b><span><b class="el-x">AI 노출도 높은 직업</b>의 22–25세 고용은<br>노출 낮은 직업의 또래와 비교하면<br>19% 적다 <span class="mono" style="font-size:20px">(미국, 2026.6)</span><br><span class="el-def">노출도 높음 = AI가 할 수 있는 업무가 많음</span></span></div>
            <div class="box el-kr" data-step="1">
              <span class="el-kr-h">한국도?</span>
              <div class="el-kr-r"><b>−28.5만</b><span>청년 취업자 4년간 감소,<br>그중 <b>94%</b>가 AI 고노출 업종</span></div>
              <div class="el-kr-r"><b>−16.6%</b><span>컴퓨터 프로그래밍·SI 청년 고용</span></div>
              <div class="el-kr-r"><b>−9천</b><span>SW 개발자 3년 미만 <small>(2024년)</small></span></div>
              <div class="el-kr-r up"><b>+4.2만</b><span>SW 개발자 3년 이상 <small>(2024년)</small></span></div>
              <div class="el-kr-n">청년 인구 감소 등 다른 원인도 함께 작용</div>
            </div>
          </div>
          <div>
            <div class="el-ct">미국 소프트웨어 개발자 고용 <span class="mono tiny muted" style="font-weight:400">2022년 11월 = 100</span></div>
            <svg class="chart el-chart" viewBox="0 0 920 600" width="920" height="600" aria-label="소프트웨어 개발자 고용, 22–25세는 약 20% 감소, 35–40세는 약 14% 증가"></svg>
          </div>
        </div>
        <div class="abs el-concl" data-step="2">결론: <span class="mark">신입의 기준이 올라간다</span><span class="hand">→ 그럼 지금부터 무엇을?</span></div>
        <div class="src">출처: Brynjolfsson 외, “Canaries in the Coal Mine?” Stanford DEL(2025.8 첫판·2026.8 개정판), ADP 급여 데이터 — 그래프는 Fig. B.3을 다시 그림(판독 근삿값), 인과 증명 아님 · 한국: 한국은행 BOK 이슈노트(2026.8.18, 청년 = 15–29세, 2022.6→2026.6) · 한국노동연구원 「최근 소프트웨어 개발자 취업자 수 및 직무 변화」(2025.12)</div>`,
      init(el, K, f) {
        handFit(el);
        const svg = el.querySelector('.el-chart');
        const S = K.svg;
        const X0 = 64, X1 = 760, Y0 = 520, Y1 = 30, m1 = 65, vmin = 75, vmax = 120;
        const X = (m) => X0 + (m / m1) * (X1 - X0);
        const Y = (v) => Y0 - ((v - vmin) / (vmax - vmin)) * (Y0 - Y1);
        for (let v = 80; v <= 120; v += 10) {
          S('line', { class: 'gridl', x1: X0, x2: X1, y1: Y(v), y2: Y(v) }, svg);
          S('text', { x: X0 - 10, y: Y(v) + 7, 'text-anchor': 'end', style: v === 100 ? 'fill:var(--ink);font-weight:600' : '' }, svg).textContent = v;
        }
        S('line', { x1: X0, x2: X1, y1: Y(100), y2: Y(100), style: 'stroke:var(--ink-3);stroke-width:2' }, svg);
        S('line', { class: 'ax', x1: X0, x2: X1, y1: Y0, y2: Y0 }, svg);
        for (let yr = 0; yr <= 5; yr++) {
          S('line', { class: 'ax', x1: X(yr * 12), x2: X(yr * 12), y1: Y0, y2: Y0 + 8 }, svg);
          S('text', { x: X(yr * 12), y: Y0 + 34, 'text-anchor': 'middle' }, svg).textContent = 2021 + yr;
        }
        // ChatGPT marker
        S('line', { x1: X(22), x2: X(22), y1: Y1 - 4, y2: Y0, style: 'stroke:var(--ink-2);stroke-width:2.5;stroke-dasharray:7 7' }, svg);
        S('text', { x: X(22) + 10, y: Y1 + 16, style: 'fill:var(--ink);font-size:20px' }, svg).textContent = 'ChatGPT 출시 (2022.11)';
        // clip for draw-in animation
        const defs = S('defs', {}, svg);
        const cp = S('clipPath', { id: 'el-clip' }, defs);
        const cr = S('rect', { x: 0, y: 0, width: 920, height: 600 }, cp);
        const g = S('g', { 'clip-path': 'url(#el-clip)' }, svg);
        const line = (pts) => 'M' + pts.map(([m, v]) => `${X(m).toFixed(1)},${Y(v).toFixed(1)}`).join('L');
        S('path', { class: 'ln', d: line(SW_MID), 'stroke-width': 4.5 }, g);
        S('path', { class: 'ln young', d: line(SW_YOUNG) }, g);
        S('circle', { class: 'dot', cx: X(65), cy: Y(114.4), r: 7 }, g);
        S('circle', { class: 'dot', cx: X(65), cy: Y(81.3), r: 7, style: 'stroke:var(--bad)' }, g);
        const lab = S('g', {}, g);
        S('text', { class: 'end', x: X(65) + 18, y: Y(114.4) - 8, style: 'fill:var(--ink)' }, lab).textContent = '35–40세';
        S('text', { class: 'end2', x: X(65) + 18, y: Y(114.4) + 28, style: 'fill:var(--ink)' }, lab).textContent = '+14%';
        S('text', { class: 'end', x: X(65) + 18, y: Y(81.3) - 8, style: 'fill:var(--bad)' }, lab).textContent = '22–25세';
        S('text', { class: 'end2', x: X(65) + 18, y: Y(81.3) + 28, style: 'fill:var(--bad)' }, lab).textContent = '약 −20%';
        S('text', { class: 'hand', x: X(24), y: Y(77.2), style: 'font-size:calc(36px * var(--hk, 1))' }, g).textContent = '꺾인 건 신입(22–25세)';
        S('text', { class: 'hand', x: X(28), y: Y(111.5), style: 'font-size:calc(32px * var(--hk, 1))' }, g).textContent = '경력자는 오히려 늘었다';
        const anim = { t0: null, on: false };
        const setP = (p) => cr.setAttribute('width', 920 * p);
        f._elStart = () => { anim.t0 = null; anim.on = true; setP(0.08); };
        f._elEnd = () => { anim.on = false; setP(1); };
        K.loop(el, (t) => {
          if (!anim.on) return;
          if (anim.t0 == null) anim.t0 = t;
          const p = K.ease(K.clamp((t - anim.t0) / 1.5, 0, 1));
          setP(0.08 + 0.92 * p);
          if (p >= 1) anim.on = false;
        });
      },
      enter(el, K, f) { f._elStart && f._elStart(); },
      leave(el, K, f) { f._elEnd && f._elEnd(); },
    },

    /* ═══════════════════════ 5 ═══════════════════════ */
    {
      id: 'software-30',
      title: '소프트웨어 1.0 · 2.0 · 3.0',
      minutes: 0.8,
      notes: '안드레이 카르파시는 소프트웨어를 셋으로 나눕니다. 1.0은 사람이 규칙을 직접 쓰는 코드, 2.0(2017년 글)은 데이터로 학습한 신경망의 가중치, 3.0(2025년 6월 강연)은 자연어 프롬프트로 LLM을 프로그래밍하는 것입니다.\n탭 [1.0] [2.0] [3.0]을 눌러 같은 과제(문장의 감정 판별)가 어떻게 달라지는지 보여 주세요. 1.0에서 “하나도 안 맛있다”가 긍정으로 나오는 버그가 포인트입니다. 규칙은 끝없이 늘려야 합니다(2.0·3.0 결과는 예시).\n2025년 2월 그가 만든 ‘바이브 코딩’이라는 말은 그해 Collins 사전 올해의 단어가 됐습니다.\n질문: “프로그램을 사람 말로 쓰는 시대라면, 문법 대신 무엇을 잘해야 할까요?”',
      html: `
        <style>
          #f-software-30 .sw-grid{position:absolute;left:92px;right:92px;top:234px;display:grid;grid-template-columns:330px 1fr;gap:48px}
          #f-software-30 .sw-left{display:flex;flex-direction:column;gap:10px;padding-top:14px}
          #f-software-30 .sw-left .photo{--w:250px;margin-left:24px}
          #f-software-30 .photo figcaption{font-size:calc(38px * var(--hk, 1))}
          #f-software-30 .sw-q{font-size:calc(40px * var(--hk, 1));line-height:1.15;margin-top:18px;word-break:keep-all}
          #f-software-30 .sw-right{display:flex;flex-direction:column;gap:12px;min-width:0}
          #f-software-30 .sw-tabs{display:flex;gap:14px}
          #f-software-30 .sw-tab{display:flex;align-items:baseline;gap:12px;padding:8px 18px}
          #f-software-30 .sw-tab b{font-family:var(--font-mono);font-size:32px}
          #f-software-30 .sw-tab span{font-size:21px;font-weight:500}
          #f-software-30 .sw-task{font-size:25px}
          #f-software-30 .sw-term{font-size:21px;line-height:1.45;height:312px;padding:16px 24px;white-space:pre;position:relative}
          #f-software-30 .sw-term s{text-decoration:none;color:var(--term-hi)}
          #f-software-30 .sw-term i{font-style:normal;color:var(--term-dim)}
          #f-software-30 .sw-term .c{color:var(--term-dim)}
          #f-software-30 .sw-term .p{font-family:var(--font-body)}
          #f-software-30 .sw-term canvas{margin-top:8px}
          #f-software-30 .sw-tests{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;background:var(--paper);margin-top:-12px;padding:12px 0 40px}
          #f-software-30 .sw-t{border-left:4px solid var(--ink-3);padding:2px 0 2px 14px;font-size:22px;line-height:1.35;background:var(--paper)}
          #f-software-30 .sw-t b{font-size:26px}
          #f-software-30 .sw-t.ok{border-color:var(--good)}
          #f-software-30 .sw-t.no{border-color:var(--bad);background:var(--paper);box-shadow:inset 0 0 0 999px var(--hl-soft)}
          #f-software-30 .sw-vibe{left:92px;right:92px;top:792px;font-size:23px;display:flex;gap:14px;align-items:baseline;border-top:2.5px solid var(--ink);padding:10px 0 6px;background:var(--paper)}
          #f-software-30 .src{background:var(--paper)}
        </style>
        <div class="kicker">안드레이 카르파시의 세 가지 소프트웨어</div>
        <h2 class="title">소프트웨어 1.0 → 2.0 → <span class="mark">3.0</span></h2>
        <div class="sw-grid">
          <div class="sw-left">
            ${Kit.photo('karpathy', '안드레이 카르파시', 'tilt-r')}
            <div class="hand sw-q">“요즘 가장 뜨는 새 프로그래밍 언어는 <span class="mark">영어</span>다”</div>
            <div class="mono tiny faint">카르파시의 X 게시물, 2023.1.24</div>
          </div>
          <div class="sw-right demo">
            <div class="sw-tabs">${SW.map((v, i) => `<button class="btn sw-tab" data-v="${i}"><b>${v.tab}</b><span>${v.sub}</span></button>`).join('')}</div>
            <div class="sw-task">같은 과제: <b>문장의 감정 판별</b> — 긍정일까, 부정일까?</div>
            <div class="term sw-term"></div>
            <div class="sw-tests"></div>
          </div>
        </div>
        <div class="abs sw-vibe"><b class="mono" style="white-space:nowrap">2025.2</b><span>카르파시가 ‘<b>바이브 코딩</b>’이라는 말을 만들었다: “분위기에 몸을 맡기고, 코드가 있다는 것조차 잊어라” → Collins 사전 2025 올해의 단어</span></div>
        <div class="src">출처: Karpathy “Software 2.0”(2017.11) · YC 강연(2025.6.17) · X 게시물(2023.1.24, Quote Investigator 확인 / 2025.2.2) · Collins(2025.11.6) · 2.0·3.0 결과는 예시</div>`,
      init(el, K) {
        handFit(el);
        const term = el.querySelector('.sw-term');
        const tests = el.querySelector('.sw-tests');
        const tabs = Array.from(el.querySelectorAll('.sw-tab'));
        let cur = 0, wcv = null;
        function drawWeights() {
          if (!wcv) return;
          const C = K.colors(), ctx = wcv.ctx, rnd = K.rand(2017);
          ctx.clearRect(0, 0, wcv.w, wcv.h);
          const cols = 34, rows = 4, cw = wcv.w / cols, ch = wcv.h / rows;
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const w = K.gauss(rnd) * 0.6;
            ctx.globalAlpha = K.clamp(Math.abs(w), 0.08, 1);
            ctx.fillStyle = w > 0 ? C.termHi : C.termFg;
            ctx.fillRect(c * cw + 1.5, r * ch + 1.5, cw - 3, ch - 3);
          }
          ctx.globalAlpha = 1;
        }
        function show(i) {
          cur = i;
          tabs.forEach((b, j) => b.classList.toggle('on', j === i));
          const v = SW[i];
          term.innerHTML = v.code.map(([k, s]) => `<div class="${k}">${s || ' '}</div>`).join('');
          if (v.canvas) {
            term.insertAdjacentHTML('beforeend', '<div class="c">W = [ 0.21, −1.08, 0.44, … ]  <i># 이런 숫자가 수백만 개 이상</i></div><div class="wh"></div>');
            wcv = K.canvas(term.querySelector('.wh'), 900, 64);
            drawWeights();
          } else wcv = null;
          tests.innerHTML = SENTS.map(([s, truth]) => {
            const out = i === 0 ? sentiment1(s) : truth;
            const ok = out === truth;
            return `<div class="sw-t ${ok ? 'ok' : 'no'}">“${s}”<br>→ <b>${out}</b> <span class="${ok ? 'good' : 'bad'}" style="font-weight:600">${ok ? '맞음' : '틀림!'}</span>${i > 0 ? ' <span class="mono tiny faint">예시</span>' : ''}</div>`;
          }).join('');
        }
        tabs.forEach((b) => b.addEventListener('click', () => show(+b.dataset.v)));
        K.onTheme(drawWeights);
        show(0);
      },
    },

    /* ═══════════════════════ 6 ═══════════════════════ */
    {
      id: 'vibe-coding',
      title: '코딩 에이전트에게 맡기면',
      minutes: 1.2,
      notes: '요즘 코딩 에이전트는 계획 → 파일 작성 → 테스트 → 수정을 스스로 반복합니다. 2026년 9월 GitHub에서 열린 PR(코드 변경 요청, pull request)의 40% 이상이 에이전트의 초안으로 시작했을 정도입니다.\n위의 요청 버튼(급식 메뉴 / 출석 체크 / 회비 n빵)을 누르면 로그가 흐르고, 테스트 하나가 실패했다가 고쳐진 뒤 오른쪽에 실제로 동작하는 미니 앱이 나타납니다. 미니 앱을 직접 눌러 보세요. 미리 짠 각본을 재생하는 시뮬레이션이며 실제 AI를 부르지 않습니다.\n포스트잇은 진짜 사례입니다: 강사도 2026년 6–10월에 AI 코딩 도구로 공개 프로젝트 11개(100대 명산 지도, 타자 연습 앱, AI 사용량 모니터 등)를 만들었습니다(GitHub jay-jang).\n핵심: 테스트가 왜 실패했는지, 고친 방법이 맞는지를 읽고 판단하는 사람이 결과를 책임집니다.\n질문: “에이전트가 ‘다 고쳤어요’라고 할 때, 여러분은 무엇을 확인해야 할까요?”',
      html: `
        <style>
          #f-vibe-coding .vc-top{position:absolute;left:92px;right:92px;top:58px;display:flex;justify-content:space-between;align-items:flex-start}
          #f-vibe-coding .vc-hand{transform:rotate(-3deg);text-align:right;font-size:calc(50px * var(--hk, 1));margin-top:6px}
          #f-vibe-coding .vc-real{left:704px;top:44px;width:500px;padding:12px 20px 14px;font-family:var(--font-body);font-size:20px;line-height:1.3;--tilt:-1.5deg}
          #f-vibe-coding .vc-real .mono{font-size:20px}
          #f-vibe-coding .vc-real b{display:block;font-family:var(--font-hand);font-weight:400;font-size:calc(36px * var(--hk, 1));line-height:1.15;margin:2px 0 4px}
          #f-vibe-coding .vc-bar{position:absolute;left:92px;right:92px;top:196px;display:flex;align-items:center;gap:12px}
          #f-vibe-coding .vc-req{font-size:22px;padding:8px 16px}
          #f-vibe-coding .vc-stages{margin-left:auto;display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:20px;color:var(--ink-3)}
          #f-vibe-coding .vc-stages .chip{font-size:20px;padding:4px 12px;color:var(--ink-3);border-color:var(--ink-3);cursor:default}
          #f-vibe-coding .vc-stages .chip.done{color:var(--ink);border-color:var(--ink)}
          #f-vibe-coding .vc-stages .chip.on{background:var(--hl);color:var(--sticky-ink);border-color:var(--ink)}
          #f-vibe-coding .vc-main{position:absolute;left:92px;right:92px;top:266px;height:552px;display:grid;grid-template-columns:850px 1fr;gap:30px}
          #f-vibe-coding .vc-term{font-size:20px;line-height:1.48;padding:18px 22px;height:552px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:thin;scrollbar-color:var(--term-dim) transparent;white-space:pre}
          #f-vibe-coding .vc-tw{position:relative;min-width:0}
          #f-vibe-coding .vc-fade{position:absolute;left:0;right:0;top:0;height:64px;border-radius:10px 10px 0 0;background:linear-gradient(var(--term-bg) 35%,transparent);pointer-events:none;opacity:0;transition:opacity .2s}
          #f-vibe-coding .vc-tw.sc .vc-fade{opacity:1}
          #f-vibe-coding .vl.k-cmd{color:var(--term-fg);font-weight:600}
          #f-vibe-coding .vl.k-h{margin-top:6px;color:var(--term-fg)}
          #f-vibe-coding .vl.k-p, #f-vibe-coding .vl.k-err{color:var(--term-dim)}
          #f-vibe-coding .vl.k-code{color:var(--term-fg)}
          #f-vibe-coding .vl.k-del .tx{color:var(--term-dim);text-decoration:line-through}
          #f-vibe-coding .vl.k-add .tx{color:var(--term-hi)}
          #f-vibe-coding .vl.k-done{color:var(--term-hi);font-weight:600;margin-top:6px}
          #f-vibe-coding .vl .bd{display:inline-block;font-weight:700;padding:0 6px;border-radius:3px;margin-right:10px}
          #f-vibe-coding .vl .bd.pass{border:1.5px solid var(--term-dim);color:var(--term-fg)}
          #f-vibe-coding .vl .bd.fail{background:var(--term-hi);color:var(--term-bg)}
          #f-vibe-coding .vl .cur{display:inline-block;width:.6em;height:1.05em;vertical-align:-.15em;background:var(--term-hi);margin-left:2px}
          #f-vibe-coding .vc-prev{position:relative;background:var(--paper);border:3px solid var(--ink);border-radius:14px 5px 12px 5px/5px 12px 5px 14px;display:flex;flex-direction:column;min-height:0;overflow:hidden}
          #f-vibe-coding .vc-url{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid var(--ink);padding:8px 14px;font-family:var(--font-mono);font-size:20px;color:var(--ink-2)}
          #f-vibe-coding .vc-url .tag{font-size:20px;border:1.5px dashed var(--ink-3);padding:0 8px;border-radius:4px}
          #f-vibe-coding .vc-app{flex:1;padding:20px 22px;display:flex;flex-direction:column;gap:14px;min-height:0}
          #f-vibe-coding .vc-wait{flex:1;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:var(--ink-3);font-family:var(--font-hand);font-size:calc(40px * var(--hk, 1))}
          #f-vibe-coding .vc-wait i{display:block;height:14px;background:var(--paper-3);border-radius:3px}
          #f-vibe-coding.vc-run .vc-app{display:none}
          #f-vibe-coding.vc-run .vc-wait{display:flex}
          #f-vibe-coding .am-plate{align-self:center;width:400px;height:190px;border:4px solid var(--ink);border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;margin:4px 0}
          #f-vibe-coding .am-plate::after{content:"";position:absolute;inset:16px;border:2px dashed var(--ink-3);border-radius:50%}
          #f-vibe-coding .am-name{font-family:var(--font-display);font-weight:800;font-size:52px}
          #f-vibe-coding .am-plate.roll .am-name{color:var(--ink-3)}
          #f-vibe-coding .aa-row{display:grid;grid-template-columns:44px 1fr 92px;align-items:center;width:100%;text-align:left;font-family:var(--font-body);font-size:24px;color:var(--ink);background:transparent;border:0;border-bottom:1.5px dashed var(--ink-3);padding:5px 4px;cursor:pointer}
          #f-vibe-coding .aa-row:hover{background:var(--hl-soft)}
          #f-vibe-coding .aa-st{font-family:var(--font-mono);font-size:20px;text-align:center;border:2px solid var(--ink-3);border-radius:999px;color:var(--ink-3);padding:1px 0}
          #f-vibe-coding .aa-row.here .aa-st{border-color:var(--good);color:var(--good);font-weight:600}
          #f-vibe-coding .as-row{display:grid;grid-template-columns:70px 52px 1fr 52px;align-items:center;gap:12px;font-size:24px}
          #f-vibe-coding .as-row .btn{padding:4px 0;font-size:26px;width:52px}
          #f-vibe-coding .as-row b{font-family:var(--font-mono);font-size:32px;text-align:center}
          #f-vibe-coding .as-out{border-top:2.5px solid var(--ink);padding-top:12px;margin-top:4px}
          #f-vibe-coding .as-pp{font-family:var(--font-display);font-weight:800;font-size:60px;line-height:1.1}
        </style>
        <div class="vc-top">
          <div><div class="kicker">실습 · 코딩 에이전트 시뮬레이션</div><h2 class="title md" style="margin-top:12px">에이전트에게 일을 맡기면</h2></div>
          <div class="hand vc-hand">이해 못 한 코드는<br><span class="mark">내 코드가 아니다</span></div>
        </div>
        <div class="abs sticky vc-real"><span class="mono">진짜 사례 · 강사의 2026</span><b>AI 코딩 도구로 공개 프로젝트 11개</b>100대 명산 지도 · 타자 연습 앱 · AI 사용량 모니터</div>
        <div class="vc-bar demo">
          <span class="mono tiny muted">요청 →</span>
          ${SCRIPTS.map((s, i) => `<button class="btn vc-req" data-r="${i}">${s.label}</button>`).join('')}
          <div class="vc-stages">${STAGES.map((s, i) => `${i ? '<span>→</span>' : ''}<span class="chip" data-s="${i}">${s}</span>`).join('')}</div>
        </div>
        <div class="vc-main demo">
          <div class="vc-tw"><div class="term vc-term" data-scroll></div><div class="vc-fade"></div></div>
          <div class="vc-prev">
            <div class="vc-url"><span>미리보기 · index.html</span><span class="tag">시뮬레이션</span></div>
            <div class="vc-app"></div>
            <div class="vc-wait"><span class="vc-dots">에이전트가 만드는 중</span><div style="width:300px;display:flex;flex-direction:column;gap:12px"><i style="width:70%"></i><i></i><i style="width:85%"></i><i style="width:45%"></i></div></div>
          </div>
        </div>
        <div class="src">※ 시뮬레이션: 실제 AI를 부르지 않고 미리 짠 각본을 재생합니다(미니 앱은 진짜로 동작) · 참고: GitHub Octoverse 2026(2026.10.28) — 2026년 9월 PR(코드 변경 요청)의 40% 이상이 AI 에이전트 초안으로 시작 · 진짜 사례: GitHub jay-jang(2026.6–10 공개 레포 11개)</div>`,
      init(el, K, f) {
        handFit(el);
        const term = el.querySelector('.vc-term');
        const appBox = el.querySelector('.vc-app');
        const chips = Array.from(el.querySelectorAll('.vc-stages .chip'));
        const reqs = Array.from(el.querySelectorAll('.vc-req'));
        const dots = el.querySelector('.vc-dots');

        /* ── mini apps (real, working) ── */
        const apps = [];
        // A. menu picker
        (function () {
          const n = K.el(`<div style="display:flex;flex-direction:column;gap:14px;align-items:center;flex:1">
            <div class="mono tiny muted" style="align-self:flex-start">오늘 급식 뭐 먹지?</div>
            <div class="am-plate"><span class="am-name">제육볶음</span></div>
            <button class="btn am-go" style="font-size:26px;padding:10px 34px">뽑기!</button>
            <div class="mono tiny muted am-hist" style="align-self:flex-start">지난 결과 —</div></div>`);
          const name = n.querySelector('.am-name'), plate = n.querySelector('.am-plate'), hist = n.querySelector('.am-hist');
          const rnd = K.rand(7);
          let prev = '제육볶음', roll = 0, tick = 0;
          const past = [];
          const pick = (p) => { const pool = MENUS.filter((m) => m !== p); return pool[Math.floor(rnd() * pool.length)]; };
          n.querySelector('.am-go').addEventListener('click', () => { if (roll <= 0) { roll = 0.9; plate.classList.add('roll'); } });
          apps.push({
            node: n,
            tick(dt) {
              if (roll <= 0) return;
              roll -= dt; tick -= dt;
              if (tick <= 0) { name.textContent = MENUS[Math.floor(rnd() * MENUS.length)]; tick = 0.07; }
              if (roll <= 0) {
                const m = pick(prev);
                past.unshift(prev); if (past.length > 3) past.pop();
                prev = m; name.textContent = m; plate.classList.remove('roll');
                hist.textContent = '지난 결과 — ' + past.join(' · ');
              }
            },
            settle() { if (roll > 0) { roll = 0.0001; this.tick(0.001); } },
          });
        })();
        // B. attendance
        (function () {
          const st = STUDENTS.map((s, i) => ({ s, here: i !== 2 && i !== 4 }));
          const n = K.el(`<div style="display:flex;flex-direction:column;gap:8px;flex:1">
            <div class="row center" style="justify-content:space-between"><span class="display" style="font-weight:800;font-size:30px">IT 동아리 출석부</span><b class="mono aa-n" style="font-size:28px"></b></div>
            <div class="aa-list">${st.map((x, i) => `<button class="aa-row" data-i="${i}"><span class="mono" style="color:var(--ink-3)">0${i + 1}</span><span>${x.s}</span><span class="aa-st"></span></button>`).join('')}</div>
            <button class="btn sm ghost aa-reset" style="align-self:flex-start;margin-top:6px">모두 결석으로</button></div>`);
          const count = () => st.filter((x) => x.here).length; // the fixed version
          const render = () => {
            n.querySelectorAll('.aa-row').forEach((r) => { const x = st[+r.dataset.i]; r.classList.toggle('here', x.here); r.querySelector('.aa-st').textContent = x.here ? '출석' : '결석'; });
            n.querySelector('.aa-n').textContent = `출석 ${count()} / ${st.length}`;
          };
          n.addEventListener('click', (e) => {
            const r = e.target.closest('.aa-row');
            if (r) { const x = st[+r.dataset.i]; x.here = !x.here; render(); }
            if (e.target.closest('.aa-reset')) { st.forEach((x) => { x.here = false; }); render(); }
          });
          render();
          apps.push({ node: n, tick() {}, settle() {} });
        })();
        // C. split the club fee
        (function () {
          let total = 42500, ppl = 10;
          const n = K.el(`<div style="display:flex;flex-direction:column;gap:16px;flex:1">
            <div class="display" style="font-weight:800;font-size:30px">회비 n빵 계산기</div>
            <div class="as-row"><span>총액</span><button class="btn" data-a="t" data-d="-500" aria-label="총액 500원 줄이기">−</button><b class="as-t"></b><button class="btn" data-a="t" data-d="500" aria-label="총액 500원 늘리기">+</button></div>
            <div class="as-row"><span>인원</span><button class="btn" data-a="n" data-d="-1" aria-label="한 명 줄이기">−</button><b class="as-n"></b><button class="btn" data-a="n" data-d="1" aria-label="한 명 늘리기">+</button></div>
            <div class="as-out"><div class="mono tiny muted">1인당 (100원 단위 올림)</div><div class="as-pp"></div><div class="small muted as-note"></div></div></div>`);
          const per = () => Math.ceil(total / ppl / 100) * 100; // the fixed version
          const render = () => {
            n.querySelector('.as-t').textContent = won(total) + '원';
            n.querySelector('.as-n').textContent = ppl + '명';
            n.querySelector('.as-pp').textContent = won(per()) + '원';
            const sum = per() * ppl;
            n.querySelector('.as-note').textContent = `모이는 돈 ${won(sum)}원 · 남는 돈 ${won(sum - total)}원`;
          };
          n.addEventListener('click', (e) => {
            const b = e.target.closest('[data-a]'); if (!b) return;
            if (b.dataset.a === 't') total = K.clamp(total + +b.dataset.d, 1000, 500000);
            else ppl = K.clamp(ppl + +b.dataset.d, 1, 40);
            render();
          });
          render();
          apps.push({ node: n, tick() {}, settle() {} });
        })();

        /* ── terminal runner ── */
        const R = { s: 0, i: 0, wait: 0, typing: null, running: false };
        function lineHTML(L, text) {
          const k = L[1], t = `<span class="tx">${esc(text)}</span>`;
          if (k === 'cmd') return `<span style="color:var(--term-hi)">$</span> agent “${t}”`;
          if (k === 'h') { const sp = text.indexOf(' '); return `<span style="color:var(--term-hi)">●</span> <b>${esc(sp < 0 ? text : text.slice(0, sp))}</b><span class="tx" style="color:var(--term-dim)">${esc(sp < 0 ? '' : text.slice(sp))}</span>`; }
          if (k === 'pass') return `   <span class="bd pass">PASS</span>${t}`;
          if (k === 'fail') return `   <span class="bd fail">FAIL</span>${t}`;
          if (k === 'err') return `         ${t}`;
          if (k === 'del') return `   <span style="color:var(--term-dim)">-</span> ${t}`;
          if (k === 'add') return `   <span style="color:var(--term-hi)">+</span> ${t}`;
          if (k === 'done') return `<span>●</span> ${t}`;
          return `   ${t}`;
        }
        function scrollEnd() { term.scrollTop = term.scrollHeight; term.parentNode.classList.toggle('sc', term.scrollTop > 2); }
        term.addEventListener('scroll', () => term.parentNode.classList.toggle('sc', term.scrollTop > 2)); // wheel/swipe up to read the lines that scrolled off
        function addLine(L, text) {
          const d = document.createElement('div');
          d.className = 'vl k-' + L[1];
          d.innerHTML = lineHTML(L, text);
          term.appendChild(d);
          scrollEnd();
          return d;
        }
        function setStage(k, finished) {
          chips.forEach((c, i) => {
            c.classList.toggle('on', i === k);
            c.classList.toggle('done', i < k || (finished && i <= k));
          });
        }
        function showApp(i) {
          appBox.innerHTML = '';
          if (i == null) { el.classList.add('vc-run'); return; }
          el.classList.remove('vc-run');
          appBox.appendChild(apps[i].node);
        }
        function markReq(i) { reqs.forEach((b, j) => b.classList.toggle('on', j === i)); }
        function renderAll(i) {
          term.innerHTML = '';
          SCRIPTS[i].lines.forEach((L) => addLine(L, L[2]));
          setStage(4, true); showApp(i); markReq(i);
          R.s = i; R.running = false; R.typing = null;
        }
        function start(i) {
          R.s = i; R.i = 0; R.wait = 0.25; R.typing = null; R.running = true;
          term.innerHTML = ''; setStage(-1); showApp(null); markReq(i);
        }
        reqs.forEach((b) => b.addEventListener('click', () => start(+b.dataset.r)));
        f._vcFinish = () => { if (R.running) renderAll(R.s); apps.forEach((a) => a.settle()); };
        // the title must end before the sticky note (left:704px): a wider fallback serif (Batang/AppleMyungjo on an
        // offline PC) ran its last letter under the note. Shrinks only then; with Hahmlet it ends near x=665.
        const ttl = el.querySelector('.vc-top .title'), TTL_MAX = 688;
        f._vcFit = () => {
          ttl.style.fontSize = '';
          const sr = el.querySelector('.stage').getBoundingClientRect(), k = sr.width / 1600;
          if (!k) return;
          const rg = document.createRange(); rg.selectNodeContents(ttl);
          const rr = rg.getBoundingClientRect(), l = (rr.left - sr.left) / k, r = (rr.right - sr.left) / k;
          if (r > TTL_MAX && r > l) ttl.style.fontSize = (parseFloat(getComputedStyle(ttl).fontSize) * (TTL_MAX - l) / (r - l)).toFixed(1) + 'px';
        };
        f._vcFit();
        if (document.fonts) { if (document.fonts.ready) document.fonts.ready.then(f._vcFit); document.fonts.addEventListener('loadingdone', f._vcFit); }

        K.loop(el, (t, dt) => {
          apps.forEach((a) => a.tick(dt));
          if (!R.running) return;
          dots.textContent = '에이전트가 만드는 중' + '...'.slice(0, 1 + (Math.floor(t * 3) % 3));
          R.wait -= dt;
          if (R.wait > 0) return;
          const L = SCRIPTS[R.s].lines[R.i];
          if (!L) { R.running = false; setStage(4, true); showApp(R.s); return; }
          setStage(L[0]);
          if (L[1] === 'code' || L[1] === 'add') {
            if (!R.typing) { R.typing = { node: addLine(L, ''), n: 0 }; R.typing.node.insertAdjacentHTML('beforeend', '<span class="cur"></span>'); }
            R.typing.n += dt * 58;
            const n = Math.min(L[2].length, Math.floor(R.typing.n));
            R.typing.node.querySelector('.tx').textContent = L[2].slice(0, n);
            if (n >= L[2].length) { R.typing.node.querySelector('.cur').remove(); R.typing = null; R.i++; R.wait = 0.06; }
          } else {
            addLine(L, L[2]); R.i++;
            const nx = SCRIPTS[R.s].lines[R.i];
            R.wait = (DELAY[L[1]] || 0.25) + (nx && nx[1] === 'h' ? 0.35 : 0);
          }
          scrollEnd();
        });
        renderAll(0);
      },
      enter(el, K, f) { f._vcFit && f._vcFit(); },
      leave(el, K, f) { f._vcFinish && f._vcFinish(); },
    },
  ]);
})();
