/* Speaker: 어쩌다 엔지니어 — career subway map, Google years (HDMI-CEC), Yanolja (AI before/after),
   planned vs. actual path, notes to a 17-year-old self.
   Facts: research/01-profile.md · GFSA 2025 'AI 퍼스트' mentor: Google Korea blog 2025-06-24 ·
   '어쩌다(가)' = 뜻밖에 우연히: 표준국어대사전. */
(function () {
  'use strict';

  /* ───────── helpers ───────── */
  const f1 = (n) => n.toFixed(1);
  /** hand-drawn rectangle as an SVG path "d" (slight wobble, corners overshoot) */
  function boxD(x, y, w, h, seed, j) {
    const r = Kit.rand(seed || 3);
    j = j == null ? 1.6 : j;
    const J = () => (r() - 0.5) * j * 2;
    const c = [[x + J(), y + J()], [x + w + J(), y + J()], [x + w + J(), y + h + J()], [x + J(), y + h + J()]];
    let d = '';
    for (let i = 0; i < 4; i++) {
      const a = c[i], b = c[(i + 1) % 4];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
      const o1 = 2 + r() * 4, o2 = 2 + r() * 4;
      const mx = (a[0] + b[0]) / 2 + J() * 0.7, my = (a[1] + b[1]) / 2 + J() * 0.7;
      d += `M${f1(a[0] - ux * o1)},${f1(a[1] - uy * o1)} Q${f1(mx)},${f1(my)} ${f1(b[0] + ux * o2)},${f1(b[1] + uy * o2)} `;
    }
    return d;
  }
  /** hand-drawn arrow (shaft + open head) */
  function arrowD(x1, y1, x2, y2, seed, head) {
    head = head || 13;
    const a = Math.atan2(y2 - y1, x2 - x1);
    const r = Kit.rand(seed || 5);
    const mx = (x1 + x2) / 2 + (r() - 0.5) * 3, my = (y1 + y2) / 2 + (r() - 0.5) * 3;
    const h1 = [x2 - head * Math.cos(a - 0.5), y2 - head * Math.sin(a - 0.5)];
    const h2 = [x2 - head * Math.cos(a + 0.5), y2 - head * Math.sin(a + 0.5)];
    return `M${f1(x1)},${f1(y1)} Q${f1(mx)},${f1(my)} ${f1(x2)},${f1(y2)} M${f1(h1[0])},${f1(h1[1])} L${f1(x2)},${f1(y2)} L${f1(h2[0])},${f1(h2[1])}`;
  }
  /** length (a multiple of 2, at most L) along a path closest to (x, y); at(len) → {x, y} is the point at that length.
      at() is computed in JS (polyAt/cubicAt below): getPointAtLength costs up to ~0.1 ms per call and forces
      style/layout, and this search samples the path hundreds of times per point (≈0.75 s for accidental-path). */
  function lenAt(at, L, x, y) {
    let best = 0, bd = Infinity;
    for (let s = 0; s <= L; s += 2) {
      const p = at(s), d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bd) { bd = d; best = s; }
    }
    return best;
  }
  /** getPointAtLength for a straight-segment polyline [[x, y], ...]; .total = its length */
  function polyAt(P) {
    const cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const at = (s) => {
      let i = 1;
      while (i < P.length - 1 && cum[i] < s) i++;
      const f = Kit.clamp((s - cum[i - 1]) / (cum[i] - cum[i - 1]), 0, 1);
      return { x: Kit.lerp(P[i - 1][0], P[i][0], f), y: Kit.lerp(P[i - 1][1], P[i][1], f) };
    };
    at.total = cum[cum.length - 1];
    return at;
  }
  /** getPointAtLength for a path "d" of cubic segments only (Kit.sketchPath output): an arc-length table of
      `n` chords per segment, then the exact Bézier point. With n = 1024 it agrees with Chrome's own result to
      Chrome's float precision (a 0.1 rounding step in ~1% of points). */
  function cubicAt(d, n) {
    const v = d.match(/-?\d+(?:\.\d+)?/g).map(Number), S = [];
    for (let i = 2; i + 5 < v.length; i += 6) S.push(v.slice(i - 2, i + 6)); // [x0, y0, c1x, c1y, c2x, c2y, x1, y1]
    const ev = (s, t) => {
      const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
      return { x: a * s[0] + b * s[2] + c * s[4] + e * s[6], y: a * s[1] + b * s[3] + c * s[5] + e * s[7] };
    };
    const last = S.length * n, len = new Float64Array(last + 1); // len[k * n + j] = length at t = j / n of segment k
    let acc = 0;
    S.forEach((s, k) => {
      let px = s[0], py = s[1];
      for (let j = 1; j <= n; j++) {
        const t = j / n, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
        const x = a * s[0] + b * s[2] + c * s[4] + e * s[6], y = a * s[1] + b * s[3] + c * s[5] + e * s[7];
        acc += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py)); len[k * n + j] = acc; px = x; py = y;
      }
    });
    const at = (x) => {
      if (!(x > 0)) return ev(S[0], 0);
      if (x >= len[last]) return ev(S[S.length - 1], 1);
      let lo = 1, hi = last;
      while (lo < hi) { const m = (lo + hi) >> 1; if (len[m] < x) lo = m + 1; else hi = m; }
      const k = Math.floor((lo - 1) / n), j = lo - k * n;
      return ev(S[k], (j - 1 + (x - len[lo - 1]) / (len[lo] - len[lo - 1])) / n);
    };
    at.segs = S; at.ends = S.map((s, k) => len[(k + 1) * n]); // the segments and the length at each one's end
    return at;
  }
  const esc = (s) => Kit.escape(s);
  const isCurrent = (el) => el.classList.contains('current');
  /* Nanum Pen Script is a narrow face. Without it (offline Windows PC: Google Fonts blocked, no local copy) the
     handwritten notes fall back to a Korean gothic about 1.5× wider and overrun their spots (episode text running
     off the frame, labels into stamps, notes into the TV drawing). Measure the hand font actually in use and expose
     the shrink factor as --hk; the hand-font sizes below are calc(Npx * var(--hk, 1)), so with the pen font: no change. */
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

  /* ═════════ 1. career-line — subway map ═════════ */
  const MAIN = [[50, 330], [330, 330], [390, 270], [740, 270], [800, 210], [880, 210], [940, 150], [1370, 150], [1410, 190], [1410, 400]];
  const MENT = [[610, 270], [740, 400], [1410, 400]];
  // chronological order = prev/next order
  const ST = [
    { line: 'main', x: 50, y: 330, pos: 'below', nm: '고려대', yr: '1999', big: '1999', name: '고려대 컴퓨터학과',
      one: '컴퓨터학 전공. 졸업까지 8년이 걸렸어요.', did: '1999 입학 → 2007 졸업 (컴퓨터학 학사)',
      ep: '학교에 다니는 동안 이미 회사에서 일했어요. 졸업장보다 실무가 먼저.', src: 'LinkedIn 학력 · AmCham 연사 약력' },
    { line: 'main', x: 170, y: 330, pos: 'above', nm: '보안 스타트업', yr: '재학 중', big: '재학 중', name: '보안 SW 스타트업',
      one: '병역특례로 보안 소프트웨어 회사에서 첫 실무.', did: '보안 소프트웨어 엔지니어',
      ep: '병역특례: 군 복무 대신 회사에서 일하는 제도. 제 커리어는 여기서 시작됐어요.', src: 'AmCham 연사 약력 (회사 이름·기간은 공개 자료 없음)' },
    { line: 'main', x: 290, y: 330, pos: 'below', nm: '넥슨', yr: '2003', big: '2003', name: '넥슨',
      one: '온라인 게임을 만드는 개발자.', did: '약 2년 반, 온라인 게임 개발',
      ep: '두 번째 회사는 게임 회사. AI게임콘텐츠과 여러분이 배우는 바로 그 분야예요.', src: '비즈워치 2024-01-22 · AmCham 연사 약력' },
    { line: 'main', x: 430, y: 270, pos: 'above', nm: '구글 서울', yr: '2007', big: '2007', name: '구글 서울 R&D센터',
      one: '졸업한 해, 구글 소프트웨어 엔지니어로.', did: '검색, 구글 TV 등을 개발 · 14년 넘게 근무',
      ep: '입사 첫 가을, 동료들과 청계천 청소 봉사. 블로그 후기: “생각보다 너무나 깨끗한(?) 청계천”', src: 'AmCham 연사 약력 · 구글코리아 블로그 2007-10-19 · 구글 개발자 블로그 2014-06-12' },
    { line: 'main', x: 550, y: 270, pos: 'below', nm: 'Android TV', yr: '2014', big: '2014', name: 'Android TV · HDMI-CEC',
      one: 'TV·셋톱박스·사운드바가 서로 말하게 하는 코드.', did: '2014년 4–11월 커밋 129건 (Android 공개 저장소)',
      ep: '첫 커밋: “Implement skeleton of new HDMI Control Service.” 12년 지난 지금도 Android 안에 있어요.', src: 'AOSP gitiles 커밋 기록 (jayjang@google.com, 저장소 4곳, 머지 제외 계산)' },
    { line: 'ment', x: 800, y: 400, pos: 'below', nm: '청소년 멘토단', yr: '2015', big: '2015', name: '구글 청소년 멘토단',
      one: '구글러들이 고등학생을 만나는 자원봉사 모임.', did: '호스트·멘토 · 저녁 2시간, 고교생 20여 명과 대화',
      ep: '내가 멘토링을 해 줄 만한 사람인지 망설였는데, 아이들과 이야기하는 법을 배우러 오면 된다는 동료의 한마디에 시작했어요.', src: 'LinkedIn · 구글코리아 블로그 2016-06-29' },
    { line: 'ment', x: 960, y: 400, pos: 'below', nm: '멘토반장', yr: '2018', big: '2018', name: '길나장이단 ‘멘토반장’',
      one: '전국 고등학교로 원정 멘토링.', did: '2015–2018, 학교·기관 120여 곳의 학생을 만남',
      ep: '2016 울산 원정: 다른 멘토들은 KTX, 저는 새벽 5시 40분에 자동차로 출발.', src: '구글코리아 블로그 2016-10-27 · 2018-12-28' },
    { line: 'main', x: 700, y: 270, pos: 'above', nm: 'TensorFlow', yr: '2021', big: '2021', name: 'TensorFlow Serving',
      one: 'AI 모델을 실제 서비스로 돌리는 시스템.', did: 'ML 엔지니어 · 구글에서의 마지막 공개 커밋 (2021.02)',
      ep: '2014년에도 2021년에도 남긴 커밋이 ‘로그 도배 줄이기’. 플랫폼은 바뀌어도 습관은 그대로.', src: 'GitHub tensorflow/serving 커밋 2021-02-17 · AmCham 연사 약력' },
    { line: 'main', x: 840, y: 210, pos: 'below', nm: '몰로코', yr: '약 1년', big: '약 1년', name: '몰로코 (광고 AI)',
      one: '14년 만에 처음 회사를 옮겼어요.', did: 'Staff Engineer · 클라우드 광고 시스템',
      ep: '검색, TV, AI 서빙 다음은 광고. 어떤 광고를 누구에게 보여 줄지도 AI가 고르는 세계.', src: 'AmCham 연사 약력 · 아시아경제 2024-01-22 (정확한 재직 기간은 공개 자료 없음)' },
    { line: 'main', x: 1010, y: 150, pos: 'above', nm: '야놀자 인프라', yr: '2022', big: '2022', name: '야놀자 인프라 유닛장',
      one: '여행 회사로. 이제는 조직을 이끄는 리더.', did: '글로벌 B2B 솔루션 고도화, 여행 데이터·서비스 플랫폼화 총괄',
      ep: '직접 코드를 짜던 사람이, 코드를 짜는 사람들을 이끄는 사람으로.', src: '야놀자 보도자료 2025-01-13 · 비즈워치 2024-01-22 (입사 연도는 2022년 보도 기준)' },
    { line: 'main', x: 1120, y: 150, pos: 'below', nm: '야놀자 CTO', yr: '2024.01', big: '2024.01', name: '야놀자 → 야놀자클라우드 CTO',
      one: '회사 기술 전체를 책임지는 자리(최고기술책임자).', did: '2024 데이터 플랫폼 · AI/ML · 업무 자동화 → 2025 야놀자클라우드에서 버티컬 AI',
      ep: '2025년 2월, 구글클라우드와의 AI 파트너십 체결식에 참석. 14년 다닌 회사를 파트너로 다시 만났어요.', src: '아시아경제 2024-01-22 · 야놀자 보도자료 2025-01-13 · kpinews 2025-02-18' },
    { line: 'ment', x: 1180, y: 400, pos: 'below', nm: '스타트업 멘토', yr: '2024', big: '2024', name: 'Google for Startups Accelerator',
      one: '스타트업에 기술을 조언하는 멘토.', did: '아키텍처 · 클라우드 · AI 서빙',
      ep: '2025년 ‘AI 퍼스트’ 기수에도 멘토로 참여.', src: 'LinkedIn (2024-02~) · 구글코리아 블로그 2025-06-24' },
    { line: 'main', x: 1230, y: 150, pos: 'above', nm: '야놀자넥스트', yr: '2024.12', big: '2024.12', name: '야놀자넥스트 초대 대표',
      one: '여행 AI를 연구·개발하는 회사(처음 이름은 와이넥스트)의 첫 대표(CEO).', did: 'AI 가격 최적화 · 개인화 추천 · 팀은 서울·인도·인도네시아·베트남',
      ep: '목표는 하나였어요. “여행을 10배 더 쉽게.”', src: '전자신문 2026-08-18 · 야놀자 블로그 2025-09-15 · 비즈워치 2025-09-22' },
    { line: 'main', x: 1340, y: 150, pos: 'below', nm: '다시 코딩', yr: '2026', big: '2026', name: '퇴임, 그리고 다시 만드는 사람',
      one: '7월에 야놀자를 떠나 잠시 쉬는 중. 그런데 다시 코딩해요.', did: 'AI 코딩 도구로 공개 프로젝트 11개 (6–10월): 100대 명산 지도, 타자 연습 앱…',
      ep: '퇴임 글에서: “AI라는 큰 흐름 덕분에… 개발로 다시 가볍게 뛰어들 수 있는”', src: 'LinkedIn 게시물 2026-07-31 · GitHub jay-jang' },
    { line: 'both', x: 1410, y: 400, pos: 'below', nm: '성일정보고', yr: '오늘', big: '오늘', name: '성일정보고 IT 동아리',
      one: '두 노선이 만나는 환승역: 일 + 멘토링.', did: '2026년 11월, 성남 중원구 성일정보고',
      ep: '한솔고·태원고에 이어 ‘어쩌다 AI’ 고교 강의. 여러분 노선의 다음 역은?', src: 'GitHub jay-jang (accidental-ai-hansol · accidental-ai-taewon)' },
  ];

  const careerLine = {
    id: 'career-line',
    title: '경력 노선도: 1999 → 오늘',
    minutes: 1,
    notes: '제 경력을 지하철 노선도로 그렸습니다. 검은 선은 일, 파란 선은 2015년부터 이어 온 멘토링이고, 두 선이 만나는 환승역이 바로 오늘 이 교실입니다.\n' +
      '클릭: 정거장은 1999 → 2003 넥슨 → 2014 Android TV → 오늘, 4개만 직접 누릅니다. 노란 표시가 선을 따라 움직이고 아래 카드가 바뀝니다. 나머지 꺾임은 세 장 뒤 “계획한 길 vs 실제로 걸어온 길”에서.\n' +
      '포인트: 직함보다 “무엇을 만들었나”를 말하기. 회사가 바뀌어도 하는 일(만들기)은 이어졌다는 것.\n' +
      '질문: “여러분 노선도의 첫 정거장은 어디일까요? 이미 지나온 역이 있나요?”',
    html: `
<style>
#f-career-line .abs{position:absolute}
#f-career-line .cl-map{left:72px;top:170px;width:1456px;height:440px}
#f-career-line .cl-card{word-break:keep-all}
#f-career-line .cl-svg{display:block;width:1456px;height:440px;overflow:visible}
#f-career-line .ln{fill:none;stroke-linecap:round;stroke-linejoin:round}
#f-career-line .ln.main{stroke:var(--ink);stroke-width:12}
#f-career-line .ln.ment{stroke:var(--pen);stroke-width:9}
#f-career-line .st{cursor:pointer}
#f-career-line .st .dot{fill:var(--paper);stroke:var(--ink);stroke-width:5}
#f-career-line .st.m .dot{stroke:var(--pen)}
#f-career-line .st .hit{fill:transparent}
#f-career-line .st:hover .dot{fill:var(--hl-soft)}
#f-career-line .st.on .dot{fill:var(--hl);stroke-width:6}
#f-career-line .st text{paint-order:stroke;stroke:var(--paper);stroke-width:7px;stroke-linejoin:round}
#f-career-line .st .nm{font-family:var(--font-body);font-weight:600;font-size:23px;fill:var(--ink)}
#f-career-line .st .yr{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
#f-career-line .st.on .nm{fill:var(--sticky-ink);stroke:var(--hl);stroke-width:16px}
#f-career-line .marker{fill:var(--hl);stroke:var(--ink);stroke-width:2.5}
#f-career-line .lg{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
#f-career-line .cl-card{display:grid;grid-template-columns:290px 1fr 470px;gap:44px;align-items:start;padding-top:20px}
#f-career-line .cl-card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--ink);transform:rotate(-0.25deg)}
#f-career-line .cl-yr{font-family:var(--font-mono);font-weight:600;font-size:66px;line-height:1;letter-spacing:-0.03em}
#f-career-line .cl-nm{font-family:var(--font-display);font-weight:700;font-size:28px;line-height:1.2;margin-top:12px}
#f-career-line .cl-one{font-size:32px;line-height:1.3;font-weight:600}
#f-career-line .cl-did{font-size:24px;color:var(--ink-2);margin-top:12px;line-height:1.4}
#f-career-line .cl-did b{font-family:var(--font-mono);font-weight:600;font-size:20px;color:var(--ink-3);margin-right:10px}
#f-career-line .cl-ep .hand{font-size:calc(36px * var(--hk, 1));line-height:1.15}
#f-career-line .cl-fade{transition:opacity .25s}
</style>
<div class="kicker">어쩌다 엔지니어 · 경력 노선도</div>
<h2 class="title md">1999 → 오늘, 제가 지나온 정거장</h2>
<div class="abs demo btns" style="right:92px;top:74px;align-items:center">
  <span class="mono tiny faint" style="margin-right:4px">정거장을 클릭하거나</span>
  <button class="btn cl-prev">← 이전 역</button><button class="btn cl-next">다음 역 →</button>
</div>
<div class="abs demo cl-map"><svg class="cl-svg" viewBox="0 60 1456 440" aria-label="경력 노선도"></svg></div>
<div class="abs demo cl-card cl-fade" style="left:92px;right:92px;top:640px">
  <div><div class="cl-yr"></div><div class="cl-nm"></div></div>
  <div><div class="cl-one"></div><div class="cl-did"><b>한 일</b><span></span></div></div>
  <div class="cl-ep"><div class="mono tiny faint" style="margin-bottom:6px">에피소드</div><div class="hand"></div></div>
</div>
<div class="src cl-src"></div>`,
    init(el, K) {
      handFit(el);
      const svg = el.querySelector('.cl-svg');
      const pd = (P) => 'M' + P.map((p) => p.join(',')).join(' L');
      let s = `
        <g aria-hidden="true">
          <path class="ln main" d="M30,470 L90,470"/><text class="lg" x="102" y="477">일</text>
          <path class="ln ment" d="M160,470 L220,470"/><text class="lg" x="232" y="477">멘토링</text>
          <circle cx="330" cy="470" r="14" style="fill:var(--paper);stroke:var(--ink);stroke-width:4"/><circle cx="330" cy="470" r="5.5" style="fill:var(--pen)"/>
          <text class="lg" x="356" y="477">환승역 = 오늘</text>
        </g>
        <path class="ln main cl-main" d="${pd(MAIN)}"/>
        <path class="ln ment cl-ment" d="${pd(MENT)}"/>
        <circle class="marker" r="23" cx="-200" cy="-200"/>`;
      ST.forEach((t, i) => {
        const ny = t.pos === 'above' ? t.y - 54 : t.y + 52, yy = t.pos === 'above' ? t.y - 28 : t.y + 76;
        const dot = t.line === 'both'
          ? `<circle class="dot" cx="${t.x}" cy="${t.y}" r="19"/><circle cx="${t.x}" cy="${t.y}" r="7" style="fill:var(--pen)"/>`
          : `<circle class="dot" cx="${t.x}" cy="${t.y}" r="12"/>`;
        s += `<g class="st${t.line === 'ment' ? ' m' : ''}" data-i="${i}" role="button" aria-label="${esc(t.yr + ' ' + t.name)}">
          <rect class="hit" x="${t.x - 64}" y="${Math.min(ny - 26, t.y - 26)}" width="128" height="${Math.abs(yy - t.y) + 58}"/>
          ${dot}
          <text class="nm" x="${t.x}" y="${ny}" text-anchor="middle">${esc(t.nm)}</text>
          <text class="yr" x="${t.x}" y="${yy}" text-anchor="middle">${esc(t.yr)}</text>
        </g>`;
      });
      svg.innerHTML = s;
      const mk = svg.querySelector('.marker');
      // both lines are the MAIN / MENT polylines drawn above, measured in JS instead of asking the DOM
      const paths = { main: polyAt(MAIN), ment: polyAt(MENT) };
      const J_MAIN = lenAt(paths.main, paths.main.total, 610, 270);
      ST.forEach((t) => {
        t.lenMain = t.line === 'ment' ? null : lenAt(paths.main, paths.main.total, t.x, t.y);
        t.lenMent = t.line === 'main' ? null : lenAt(paths.ment, paths.ment.total, t.x, t.y);
      });
      const card = el.querySelector('.cl-card');
      const C = {
        yr: el.querySelector('.cl-yr'), nm: el.querySelector('.cl-nm'), one: el.querySelector('.cl-one'),
        did: el.querySelector('.cl-did span'), ep: el.querySelector('.cl-ep .hand'), src: el.querySelector('.cl-src'),
      };
      const st = { path: 'main', len: 0, target: 0, cur: 0, lastTick: 0 };
      const place = () => {
        const p = paths[st.path](st.len);
        mk.setAttribute('cx', f1(p.x)); mk.setAttribute('cy', f1(p.y));
      };
      const fill = (t) => {
        C.yr.textContent = t.big; C.nm.textContent = t.name; C.one.textContent = t.one;
        C.did.textContent = t.did; C.ep.textContent = t.ep; C.src.textContent = '출처: ' + t.src;
      };
      const select = (i, instant) => {
        i = (i + ST.length) % ST.length;
        st.cur = i;
        const t = ST[i];
        svg.querySelectorAll('.st').forEach((g) => g.classList.toggle('on', +g.dataset.i === i));
        // pick the line to ride; a transfer starts at the junction
        let path = t.line === 'both' ? st.path : t.line;
        if (path !== st.path) {
          if (path === 'ment') { st.len = 0; } else { st.len = J_MAIN; }
          st.path = path;
        }
        st.target = path === 'main' ? t.lenMain : t.lenMent;
        const live = performance.now() - st.lastTick < 200;
        if (instant || !live) { st.len = st.target; place(); fill(t); return; }
        card.style.opacity = 0.15;
        setTimeout(() => { fill(t); card.style.opacity = 1; }, 160);
      };
      svg.addEventListener('click', (e) => { const g = e.target.closest('.st'); if (g) select(+g.dataset.i); });
      el.querySelector('.cl-prev').addEventListener('click', () => select(st.cur - 1));
      el.querySelector('.cl-next').addEventListener('click', () => select(st.cur + 1));
      K.loop(el, (t, dt) => {
        st.lastTick = performance.now();
        if (Math.abs(st.target - st.len) > 0.4) { st.len += (st.target - st.len) * Math.min(1, dt * 4.5); place(); }
      });
      select(0, true);
    },
  };

  /* ═════════ 2. google-years — HDMI-CEC "one remote" demo + 2014 commits ═════════ */
  const COMMITS = [['4월', 4], ['5월', 15], ['6월', 26], ['7월', 37], ['8월', 29], ['9월', 15], ['10월', 1], ['11월', 2]];
  const LOG = {
    ivo: '<span class="dim">4 → 0   </span>&lt;Image View On&gt;  <span class="hi">TV야, 화면 켜!</span>',
    as: '<span class="dim">4 → 모두</span> &lt;Active Source&gt;  <span class="hi">지금 화면은 나야!</span>',
    sam: '<span class="dim">0 → 5   </span>&lt;System Audio Mode Request&gt;  <span class="hi">소리는 사운드바로!</span>',
    sb: '<span class="dim">0 → 모두</span> &lt;Standby&gt;  <span class="hi">다 같이 끄자!</span>',
  };

  const googleYears = {
    id: 'google-years',
    title: '구글 14년: 리모컨 하나면 되는 이유',
    minutes: 1.2,
    notes: '구글에서 14년 넘게 검색, Blogger, Android, Chrome, Cloud, TensorFlow 팀을 거쳤습니다. 그중 코드가 공개돼 있어 직접 보여 줄 수 있는 게 2014년 Android TV의 HDMI-CEC입니다. 셋톱박스를 켜면 TV가 저절로 켜지고 입력까지 바뀌는 기능이죠.\n' +
      '클릭: “셋톱박스 켜기”를 누르면 기기끼리 주고받는 메시지가 케이블을 따라 흐르고 아래 기록에 쌓입니다. “TV 끄기”는 한 번에 모두 끄는 메시지입니다. 기기마다 붙은 “주소”를 정하는 로직(2014-04-30 커밋)도 제가 짰습니다.\n' +
      '오른쪽 그래프: 6월 I/O에서 Android TV가 공개되기 두 달 전부터 만들고 있었고, 7월이 가장 바빴습니다(4–11월 합계 129건). 그 파일은 12년이 지난 지금도 Android 안에 ©2014 그대로 있습니다.\n' +
      '큰 회사에서 일한다는 것: 그 플랫폼(Google TV·Android TV)은 지금 매달 3억 대 넘게 켜집니다. 작은 버그 하나도 수억 대의 거실에 닿을 수 있어서, 큰 서비스 회사일수록 테스트와 코드 리뷰가 엄격합니다.\n' +
      '질문: “여러분이 오늘 만든 코드 중에, 10년 뒤에도 누군가 쓰고 있을 코드는 뭘까요?”',
    html: `
<style>
#f-google-years .abs{position:absolute}
#f-google-years .gy-svg{display:block;width:860px;height:410px;overflow:visible}
#f-google-years .ink{fill:none;stroke:var(--ink);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}
#f-google-years .cable{fill:none;stroke:var(--ink-2);stroke-width:7;stroke-linecap:round}
#f-google-years .screen{fill:var(--term-bg)}
#f-google-years svg text{font-family:var(--font-body);fill:var(--ink)}
#f-google-years .t-b{font-size:24px;font-weight:700}
#f-google-years .t-m{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
#f-google-years .t-chip{font-family:var(--font-mono);font-size:20px;fill:var(--sticky-ink)}
#f-google-years .chipbg{fill:var(--hl)}
#f-google-years .t-hand{font-family:var(--font-hand);font-size:calc(34px * var(--hk, 1));fill:var(--pen)}
#f-google-years .pen-ln{fill:none;stroke:var(--pen);stroke-width:2.5;stroke-linecap:round}
#f-google-years .led{stroke:var(--ink);stroke-width:2;fill:var(--bad);transition:fill .2s}
#f-google-years .led.on{fill:var(--good)}
#f-google-years .scr-on{transition:opacity .35s}
#f-google-years .scr-on text{fill:var(--term-fg);font-family:var(--font-mono)}
#f-google-years .scr-off text{fill:var(--term-dim);font-family:var(--font-mono)}
#f-google-years .scr-card{fill:var(--term-fg);opacity:.16}
#f-google-years .scr-card.sel{opacity:.5}
#f-google-years .pkt rect{fill:var(--pen)}
#f-google-years .pkt text{font-family:var(--font-mono);font-size:20px;fill:var(--paper)}
#f-google-years .gy-log{font-size:20px;line-height:1.5;padding:12px 22px;min-height:114px;white-space:pre}
#f-google-years .gy-log .old{opacity:.5}
#f-google-years .chip{cursor:default}
#f-google-years svg.chart text{font-size:20px}
#f-google-years .stat b{font-size:64px}
#f-google-years .stat b small{font-size:34px;margin-left:4px}
</style>
<div class="kicker">2007 → 약 2021 · 구글 서울 R&D센터 · 14년+</div>
<h2 class="title">리모컨 하나면 되는 이유</h2>
<div class="abs row center" style="left:92px;top:222px;gap:10px">
  <span class="mono tiny muted" style="margin-right:6px">거쳐 간 팀</span>
  <span class="chip">검색</span><span class="chip">Blogger</span><span class="chip on">Android TV</span><span class="chip">Chrome</span><span class="chip">Cloud</span><span class="chip">TensorFlow</span>
</div>
<div class="abs hand" style="right:92px;top:92px;transform:rotate(-2deg)">2014 · HDMI-CEC</div>
<div class="abs demo" style="left:92px;top:282px;width:860px;height:410px"><svg class="gy-svg" viewBox="0 0 860 410" aria-label="TV, 셋톱박스, 사운드바가 HDMI로 연결된 그림"></svg></div>
<div class="abs demo stack" style="left:762px;top:300px;width:200px;gap:14px">
  <button class="btn gy-on">셋톱박스 켜기</button>
  <button class="btn ghost gy-off">TV 끄기</button>
</div>
<div class="abs demo term gy-log" style="left:92px;top:706px;width:872px"></div>
<div class="abs" style="left:1010px;top:278px;width:498px">
  <div class="mono tiny muted">2014 월별 커밋 수 · 합계 129건 (최소치)</div>
  <svg class="chart gy-chart" viewBox="0 0 498 250" style="width:498px;height:250px;margin-top:8px"></svg>
</div>
<div class="abs stack" style="left:1010px;top:578px;width:498px;gap:16px">
  <div class="stat"><b class="num">3억<small>대 이상</small></b><span>지금 매달 켜지는 Google TV·Android TV 기기</span></div>
  <div class="stat"><b class="num">5,284<small>줄</small></b><span>뼈대를 만든 그 파일, 지금 길이 (©2014 그대로)</span></div>
</div>
<div class="src">출처: AOSP gitiles 커밋 기록(jayjang@google.com, 저장소 4곳 계산) · HdmiControlService.java(AOSP main) · source.android.com HDMI-CEC · Android Developers 블로그 2026-05-19(월간 활성 기기 3억 대+) · AmCham 약력</div>`,
    init(el, K) {
      handFit(el);
      /* chart (to scale) */
      const ch = el.querySelector('.gy-chart');
      const base = 210, k = 150 / 37, slot = 58, bx = (i) => 24 + i * slot;
      let c = `<line class="ax" x1="8" y1="${base}" x2="490" y2="${base}"/>`;
      const mark = (x, label, y2) => `<line x1="${x}" y1="24" x2="${x}" y2="${y2 == null ? base : y2}" style="stroke:var(--ink-3);stroke-width:2;stroke-dasharray:5 6"/><text x="${x}" y="14" text-anchor="middle" style="fill:var(--ink)">${label}</text>`;
      c += mark(bx(3) - 9, 'I/O · Android TV 공개');
      // October's bar sits right under this marker: stop the dashes above its value label so the "1" stays readable
      c += mark(bx(6) + 20, 'Nexus Player', f1(base - COMMITS[6][1] * k - 30));
      COMMITS.forEach(([m, v], i) => {
        const h = v * k;
        c += `<rect class="bar${i === 3 ? ' hl' : ''}" x="${bx(i)}" y="${f1(base - h)}" width="40" height="${f1(h)}"/>`;
        c += `<text x="${bx(i) + 20}" y="${f1(base - h - 8)}" text-anchor="middle" class="${i === 3 ? 'big' : ''}">${v}</text>`;
        c += `<text x="${bx(i) + 20}" y="${base + 28}" text-anchor="middle">${m}</text>`;
      });
      ch.innerHTML = c;

      /* living room */
      const svg = el.querySelector('.gy-svg');
      svg.innerHTML = `
        <path class="cable c1" d="M210,300 C210,262 300,272 300,230"/>
        <path class="cable c2" d="M690,330 C690,276 560,276 560,230"/>
        <path class="ink" d="${boxD(230, 4, 400, 224, 11)}"/>
        <rect class="screen" x="246" y="20" width="368" height="192" rx="4"/>
        <g class="scr-off"><text x="430" y="124" text-anchor="middle" font-size="22">대기 중</text></g>
        <g class="scr-on">
          <text class="scr-in" x="262" y="48" font-size="20" style="fill:var(--term-hi)">HDMI 1 · 셋톱박스</text>
          <rect class="scr-card sel" x="262" y="64" width="104" height="62" rx="4"/>
          <rect class="scr-card" x="378" y="64" width="104" height="62" rx="4"/>
          <rect class="scr-card" x="494" y="64" width="104" height="62" rx="4"/>
          <rect class="scr-card" x="262" y="138" width="104" height="58" rx="4"/>
          <rect class="scr-card" x="378" y="138" width="104" height="58" rx="4"/>
          <rect class="scr-card" x="494" y="138" width="104" height="58" rx="4"/>
        </g>
        <path class="ink" d="M400,230 L384,262 M460,230 L476,262 M346,264 L514,264"/>
        <text class="t-b" x="646" y="176">TV</text><text class="t-m" x="646" y="204">주소 0</text>
        <circle class="led led-tv" cx="612" cy="220" r="5"/>
        <path class="ink" d="${boxD(20, 300, 330, 104, 23)}"/>
        <text class="t-b" x="40" y="338">Android TV 셋톱박스</text>
        <rect class="chipbg" x="36" y="354" width="232" height="34" rx="3"/>
        <text class="t-chip" x="46" y="378">HdmiControlService</text>
        <text class="t-m" x="336" y="394" text-anchor="end">주소 4</text>
        <circle class="led led-stb" cx="326" cy="322" r="8"/>
        <path class="ink" d="${boxD(540, 330, 300, 64, 37)}"/>
        <text class="t-b" x="560" y="370">사운드바</text>
        <text class="t-m" x="790" y="370" text-anchor="end">주소 5</text>
        <circle class="led led-sb" cx="816" cy="362" r="8"/>
        <text class="t-hand" x="0" y="112">2014.4.23 첫 커밋</text>
        <text class="t-hand" x="0" y="150">이 서비스의 ‘뼈대’</text>
        <path class="pen-ln" d="M60,168 C4,200 -14,300 24,362 M10,354 L25,364 L24,346"/>
        <g class="pkts"></g>`;
      const c1 = svg.querySelector('.c1'), c2 = svg.querySelector('.c2');
      const L1 = c1.getTotalLength(), L2 = c2.getTotalLength();
      const routes = {
        'stb-tv': (u) => c1.getPointAtLength(u * L1),
        'tv-stb': (u) => c1.getPointAtLength((1 - u) * L1),
        'tv-sb': (u) => c2.getPointAtLength((1 - u) * L2),
        'stb-sb': (u) => (u < 0.5 ? c1.getPointAtLength(u * 2 * L1) : c2.getPointAtLength((1 - (u - 0.5) * 2) * L2)),
      };
      const pkts = svg.querySelector('.pkts');
      const log = el.querySelector('.gy-log');
      const led = (n, on) => svg.querySelector('.led-' + n).classList.toggle('on', on);
      const tv = (mode) => { // 'off' | 'on' | 'hdmi'
        svg.querySelector('.scr-on').style.opacity = mode === 'off' ? 0 : 1;
        svg.querySelector('.scr-off').style.opacity = mode === 'off' ? 1 : 0;
        svg.querySelector('.scr-in').style.opacity = mode === 'hdmi' ? 1 : 0;
        led('tv', mode !== 'off');
      };
      const logSet = (keys) => { log.innerHTML = keys.map((k2, i) => `<div class="${i < keys.length - 1 ? 'old' : ''}">${LOG[k2]}</div>`).join(''); };
      const mkPkt = (label) => {
        const w = Math.round(label.length * 12.2 + 22);
        const g = Kit.svg('g', { class: 'pkt' }, pkts);
        Kit.svg('rect', { x: -w / 2, y: -17, width: w, height: 34, rx: 17 }, g);
        const t = Kit.svg('text', { x: 0, y: 7, 'text-anchor': 'middle' }, g);
        t.textContent = label;
        return g;
      };
      const SEQ = {
        on: [
          { t: 0, fn: () => { led('stb', true); logSet([]); } },
          { t: 0.35, msg: ['stb-tv', 'Image View On'], log: ['ivo'] },
          { t: 1.45, fn: () => tv('on') },
          { t: 1.8, msg: ['stb-tv', 'Active Source'], also: ['stb-sb', 'Active Source'], log: ['ivo', 'as'] },
          { t: 2.95, fn: () => tv('hdmi') },
          { t: 3.25, msg: ['tv-sb', 'System Audio Mode Request'], log: ['ivo', 'as', 'sam'] },
          { t: 4.4, fn: () => led('sb', true) },
        ],
        off: [
          { t: 0, fn: () => logSet([]) },
          { t: 0.2, msg: ['tv-stb', 'Standby'], also: ['tv-sb', 'Standby'], log: ['sb'] },
          { t: 0.5, fn: () => tv('off') },
          { t: 1.35, fn: () => { led('stb', false); led('sb', false); } },
        ],
      };
      const final = {
        on: () => { led('stb', true); led('sb', true); tv('hdmi'); logSet(['ivo', 'as', 'sam']); },
        off: () => { led('stb', false); led('sb', false); tv('off'); logSet(['sb']); },
      };
      let run = null, lastTick = 0;
      const finish = () => { if (!run) return; pkts.innerHTML = ''; final[run.kind](); run = null; };
      const start = (kind) => {
        finish();
        if (kind === 'on') { tv('off'); led('sb', false); led('stb', false); }
        if (performance.now() - lastTick > 200) { final[kind](); return; } // not on screen: jump to the end
        run = { kind, t0: performance.now(), i: 0, live: [] };
      };
      el.querySelector('.gy-on').addEventListener('click', () => start('on'));
      el.querySelector('.gy-off').addEventListener('click', () => start('off'));
      K.loop(el, () => {
        lastTick = performance.now();
        if (!run) return;
        const tt = (performance.now() - run.t0) / 1000, seq = SEQ[run.kind];
        while (run.i < seq.length && seq[run.i].t <= tt) {
          const ev = seq[run.i++];
          if (ev.fn) ev.fn();
          if (ev.log) logSet(ev.log);
          // stb → sb rides the same cable as stb → tv first: keep it hidden there (no stacked pills) and let it emerge at the TV
          [ev.msg, ev.also].forEach((m) => { if (m) run.live.push({ route: m[0], g: mkPkt(m[1]), t0: ev.t, dur: m[0] === 'stb-sb' ? 2.1 : 1.05 }); });
        }
        run.live = run.live.filter((p) => {
          const u = (tt - p.t0) / p.dur;
          if (u >= 1) { p.g.remove(); return false; }
          const e = Kit.ease(Kit.clamp(u, 0, 1)), pt = routes[p.route](e);
          p.g.setAttribute('transform', `translate(${f1(pt.x)},${f1(pt.y)})`);
          p.g.style.opacity = p.route === 'stb-sb' && e < 0.5 ? 0 : 1;
          return true;
        });
        if (run.i >= seq.length && !run.live.length) run = null;
      });
      final.on();
      this._finish = finish;
    },
    leave() { if (this._finish) this._finish(); },
  };

  /* ═════════ 3. yanolja-ai — before / after AI workflow ═════════ */
  const yanoljaAI = {
    id: 'yanolja-ai',
    title: '야놀자 4년: AI를 일하는 방식으로',
    minutes: 1.2,
    notes: '야놀자에서 4년 동안 인프라 유닛장, CTO, 그리고 R&D 법인 야놀자넥스트의 초대 대표를 맡았습니다. 올해 7월에 퇴임했고 지금은 잠시 쉬어 가는 중입니다.\n' +
      '아래 그림은 “호텔 객실 가격 정하기”를 예로 든 가상의 흐름입니다. AI 이전엔 사람이 하루 한 번, 감으로 정했다면 AI 이후엔 실시간 수요·경쟁사 요금·예약 패턴을 보고 가격이 계속 조정되고, 사람은 목표와 규칙을 정하고 이상한 값을 점검합니다. 이게 제가 기고에 쓴 “AI를 기능이 아니라 운영 방식으로”의 뜻입니다.\n' +
      '클릭: 오른쪽 위 “AI 이전 / AI 이후 / 둘 다” 버튼으로 한 줄씩 비교합니다. 가상의 하루가 12초에 지나가며 “오늘 수정” 횟수가 쌓입니다.\n' +
      '(같은 시기 팀이 공개한 것: 번역 AI “이브 로제타”, AI 전화응대 “텔라” — 조직의 성과로만 소개하세요.)\n' +
      '질문: “여러분이 ‘하루 한 번, 감으로’ 하고 있는 일 중에 AI 이후처럼 바뀔 수 있는 건 뭘까요?”',
    html: `
<style>
#f-yanolja-ai .abs{position:absolute}
#f-yanolja-ai svg text{font-family:var(--font-body);fill:var(--ink)}
#f-yanolja-ai .ink{fill:none;stroke:var(--ink);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
#f-yanolja-ai .ink.dash{stroke-dasharray:3 10;stroke-width:3.5}
#f-yanolja-ai .thin{fill:none;stroke:var(--ink-2);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
#f-yanolja-ai .stairs{fill:none;stroke:var(--ink);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
#f-yanolja-ai .s-yr{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
#f-yanolja-ai .s-role{font-size:27px;font-weight:700}
#f-yanolja-ai .s-desc{font-size:20px;fill:var(--ink-2)}
#f-yanolja-ai .lane-l{font-family:var(--font-display);font-size:42px;font-weight:800}
#f-yanolja-ai .lane-s{font-family:var(--font-mono);font-size:20px;fill:var(--ink-3)}
#f-yanolja-ai .bx{font-size:24px;font-weight:500}
#f-yanolja-ai .ai-fill{fill:var(--hl-soft)}
#f-yanolja-ai .ai-t{font-family:var(--font-display);font-size:32px;font-weight:800}
#f-yanolja-ai .mono20{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
#f-yanolja-ai .price{font-family:var(--font-mono);font-size:30px;font-weight:600}
#f-yanolja-ai .tagbg{fill:var(--paper);stroke:var(--ink);stroke-width:3;stroke-linejoin:round}
#f-yanolja-ai .tok{fill:var(--pen)}
#f-yanolja-ai .tok1{fill:var(--ink)}
#f-yanolja-ai .lane{transition:opacity .35s}
#f-yanolja-ai .lane.dim{opacity:.18}
#f-yanolja-ai .flash{transition:fill .5s}
#f-yanolja-ai .flash.hot{fill:var(--hl)}
#f-yanolja-ai .price{transition:fill .5s}
#f-yanolja-ai .price.hot{fill:var(--sticky-ink)}
</style>
<div class="kicker">2022 → 2026 · 야놀자 · 장정식 기고(2026.04)에서</div>
<h2 class="title md">“AI를 ‘기능’이 아니라<br>‘운영 방식’으로”</h2>
<div class="abs demo btns ya-btns" style="right:92px;top:92px">
  <button class="btn on" data-f="both">둘 다</button><button class="btn" data-f="1">AI 이전</button><button class="btn" data-f="2">AI 이후</button>
</div>
<svg class="abs ya-stairs" viewBox="0 -26 1416 176" style="left:92px;top:214px;width:1416px;height:176px;overflow:visible"></svg>
<div class="abs demo" style="left:92px;top:404px;width:1416px;height:440px"><svg class="ya-flow" viewBox="0 0 1416 440" style="width:1416px;height:440px;overflow:visible"></svg></div>
<div class="src">출처: 비즈워치 2024-01-22·2025-09-22·2026-04-27(기고) · 아시아경제 2024-01-22 · 야놀자 PR 2025-01-13 · 전자신문 2026-08-18 · LinkedIn · 흐름도·가격은 가상의 예</div>`,
    init(el, K) {
      /* career stairs */
      const S = [
        { x0: 0, x1: 330, y: 118, yr: '2022', role: '인프라 유닛장(서버 조직)', desc: '여행 서비스들이 함께 쓰는 기반 만들기' },
        { x0: 330, x1: 680, y: 88, yr: '2024.01', role: '야놀자 CTO(최고기술책임자)', desc: '데이터 기반 · AI · 업무 자동화' },
        { x0: 680, x1: 1040, y: 58, yr: '2024.12', role: '야놀자넥스트 초대 대표', desc: '+ 야놀자클라우드 CTO 겸임(2025.01~)' },
      ];
      let s = `<path class="stairs" d="M0,118 L330,118 L330,88 L680,88 L680,58 L1040,58"/>`;
      s += `<path class="ink dash" d="M1060,58 L1416,58"/>`;
      S.forEach((p) => {
        s += `<text class="s-yr" x="${p.x0 + 16}" y="${p.y - 42}">${p.yr}</text><text class="s-role" x="${p.x0 + 16}" y="${p.y - 12}">${p.role}</text>`;
        s += `<text class="s-desc" x="${p.x0 + 16}" y="${p.y + 30}">${p.desc}</text>`;
      });
      s += `<text class="s-yr" x="1076" y="16">2026.07</text><text class="s-role" x="1076" y="46">퇴임</text>`;
      s += `<text class="s-desc" x="1076" y="88">지금은 잠시 쉬어 가는 중</text>`;
      el.querySelector('.ya-stairs').innerHTML = s;

      /* workflow lanes */
      const fl = el.querySelector('.ya-flow');
      const B1 = [{ x: 320, w: 220, t: ['경쟁 호텔', '가격 확인'] }, { x: 590, w: 220, t: ['예약 현황', '엑셀 정리'] }, { x: 860, w: 200, t: ['감으로', '가격 결정'] }];
      const tag = (x, y) => `M${x},${y + 42} L${x + 30},${y} L${x + 200},${y} L${x + 200},${y + 84} L${x + 30},${y + 84} Z`;
      let g1 = `<g class="lane lane1">
        <text class="lane-l" x="0" y="96">AI 이전</text><text class="lane-s" x="2" y="130">예시</text>
        <circle class="ink" cx="262" cy="66" r="14"/><path class="ink" d="M262,80 L262,122 M242,98 L282,98 M262,122 L248,150 M262,122 L276,150"/>
        <text class="mono20" x="262" y="182" text-anchor="middle">사람이 다</text>
        <path class="ink" d="${arrowD(290, 100, 312, 100, 3, 10)}"/>`;
      B1.forEach((b, i) => {
        g1 += `<path class="ink" d="${boxD(b.x, 52, b.w, 96, 40 + i)}"/>`;
        g1 += `<text class="bx" x="${b.x + b.w / 2}" y="92" text-anchor="middle">${b.t[0]}</text><text class="bx" x="${b.x + b.w / 2}" y="124" text-anchor="middle">${b.t[1]}</text>`;
        const nx = i < 2 ? B1[i + 1].x : 1104;
        g1 += `<path class="ink" d="${arrowD(b.x + b.w + 6, 100, nx - 6, 100, 50 + i, 11)}"/>`;
      });
      g1 += `<path class="tagbg flash fl1" d="${tag(1110, 58)}"/><text class="price pr1" x="1220" y="111" text-anchor="middle">12.0만</text>
        <text class="mono20 ct1" x="1210" y="176" text-anchor="middle">오늘 수정 1번</text>
        <circle class="tok1 tk1" r="9" cx="-50" cy="-50"/></g>`;
      const IN = [['실시간 수요', 252], ['경쟁사 요금', 310], ['예약 패턴', 368]];
      let g2 = `<g class="lane lane2">
        <text class="lane-l" x="0" y="330">AI 이후</text><text class="lane-s" x="2" y="364">예시</text>`;
      IN.forEach(([t, y], i) => {
        g2 += `<path class="thin" d="${boxD(250, y, 200, 46, 60 + i, 1.2)}"/><text class="bx" x="350" y="${y + 32}" text-anchor="middle">${t}</text>`;
        g2 += `<path class="thin" d="${arrowD(456, y + 23, 552, 318 + i * 17, 70 + i, 10)}"/>`;
      });
      g2 += `<rect class="ai-fill" x="560" y="282" width="200" height="104" rx="4"/><path class="ink" d="${boxD(560, 282, 200, 104, 81)}"/>
        <text class="ai-t" x="660" y="330" text-anchor="middle">AI 모델</text><text class="mono20" x="660" y="364" text-anchor="middle">가격 예측</text>
        <path class="ink" d="${arrowD(766, 334, 812, 334, 82, 11)}"/>
        <path class="ink" d="${boxD(820, 294, 220, 80, 83)}"/>
        <text class="bx" x="930" y="328" text-anchor="middle">가격</text><text class="bx" x="930" y="358" text-anchor="middle">자동 조정</text>
        <path class="ink" d="${arrowD(1046, 334, 1104, 334, 84, 11)}"/>
        <path class="tagbg flash fl2" d="${tag(1110, 292)}"/><text class="price pr2" x="1220" y="345" text-anchor="middle">12.0만</text>
        <text class="mono20 ct2" x="1210" y="410" text-anchor="middle">오늘 수정 0번</text>
        <path class="thin" d="M620,424 L620,394 M612,404 L620,392 L628,404" style="stroke-dasharray:4 5"/>
        <text class="mono20" x="640" y="430" style="fill:var(--ink)">사람: 목표·규칙 정하기 · 이상한 값 점검</text>
        <g class="tks"></g></g>`;
      fl.innerHTML = `<text class="mono20 clock" x="1416" y="18" text-anchor="end">가상의 하루 · 14:00</text>
        <path d="M0,214 L1416,214" style="stroke:var(--ink-3);stroke-width:2;stroke-dasharray:2 10"/>` + g1 + g2;

      const q = (c) => fl.querySelector(c);
      const tks = q('.tks'), tk1 = q('.tk1');
      const toks = [];
      for (let i = 0; i < 9; i++) toks.push({ el: Kit.svg('circle', { class: 'tok', r: 7, cx: -50, cy: -50 }, tks), k: i % 3, ph: i / 9 });
      const route2 = (k, u) => { // input k → AI → adjust → tag
        const P = [[456, IN[k][1] + 23], [560, 318 + k * 17], [660, 334], [820, 334], [1040, 334], [1108, 334]];
        const seg = u * (P.length - 1), i = Math.min(P.length - 2, Math.floor(seg)), f = seg - i;
        return [Kit.lerp(P[i][0], P[i + 1][0], f), Kit.lerp(P[i][1], P[i + 1][1], f)];
      };
      const demand = (h) => 0.5 + 0.28 * Math.sin(((h - 9) / 24) * Math.PI * 2) + 0.12 * Math.sin(h * 1.7) + 0.06 * Math.sin(h * 4.3);
      const priceAt = (h) => (10 + 4 * demand(h)).toFixed(1);
      const S2 = { h: 14, last: -1, n1: 1, n2: 14, p1: priceAt(9), p2: priceAt(14) };
      const hh = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 6) * 10).padStart(2, '0')}`;
      // the tag turns yellow; its price switches to the dark "on yellow" ink so it stays readable in the dark theme too
      const flash = (k) => { const ns = [q('.fl' + k), q('.pr' + k)]; ns.forEach((n) => n.classList.add('hot')); setTimeout(() => ns.forEach((n) => n.classList.remove('hot')), 380); };
      // render() runs every frame, but the texts change a few times a second at most (the clock ~12×/s):
      // setting textContent re-lays the SVG <text> out even when the string is the same, so write only changes
      const clock = q('.clock'), pr1 = q('.pr1'), pr2 = q('.pr2'), ct1 = q('.ct1'), ct2 = q('.ct2');
      const text = (n, s) => { if (n.textContent !== s) n.textContent = s; };
      const opa = (n, v) => { if (n.style.opacity !== String(v)) n.style.opacity = v; };
      const render = (animate) => {
        const h = S2.h;
        text(clock, `가상의 하루 · ${hh(h)}`);
        text(pr1, S2.p1 + '만');
        text(pr2, S2.p2 + '만');
        text(ct1, `오늘 수정 ${S2.n1}번`);
        text(ct2, `오늘 수정 ${S2.n2}번`);
        // lane 1: one worker token crosses the boxes between 06:00 and 09:00
        if (h >= 6 && h < 9) { // only visible on the arrows, hidden while "inside" a box
          const x = Kit.lerp(290, 1104, (h - 6) / 3);
          tk1.setAttribute('cx', f1(x)); tk1.setAttribute('cy', 100);
          opa(tk1, B1.some((b) => x > b.x + 4 && x < b.x + b.w - 4) ? 0 : 1);
        } else opa(tk1, 0);
        // lane 2: a steady stream
        const tt = animate ? performance.now() / 1000 : 0.37;
        toks.forEach((t) => {
          const u = (tt * 0.8 + t.ph) % 1, p = route2(t.k, u), x = p[0];
          t.el.setAttribute('cx', f1(x)); t.el.setAttribute('cy', f1(p[1]));
          opa(t.el, (x > 566 && x < 754) || (x > 826 && x < 1034) ? 0 : 1);
        });
      };
      K.loop(el, (t, dt) => {
        if (!(dt > 0)) return; // the first tick can report a negative dt; that must not look like midnight
        const prev = S2.h;
        S2.h = (S2.h + dt * 2) % 24; // 12 s per simulated day
        if (S2.h < prev) { S2.n1 = 0; S2.n2 = 0; } // midnight
        if (prev < 9 && S2.h >= 9) { S2.p1 = priceAt(9); S2.n1++; flash(1); }
        const hr = Math.floor(S2.h);
        if (hr !== S2.last) { S2.last = hr; const np = priceAt(S2.h); if (np !== S2.p2) { S2.p2 = np; S2.n2++; flash(2); } }
        render(true);
      });
      const btns = el.querySelectorAll('.ya-btns .btn');
      el.querySelector('.ya-btns').addEventListener('click', (e) => {
        const b = e.target.closest('.btn'); if (!b) return;
        btns.forEach((x) => x.classList.toggle('on', x === b));
        const f = b.dataset.f;
        q('.lane1').classList.toggle('dim', f === '2');
        q('.lane2').classList.toggle('dim', f === '1');
      });
      render(false);
    },
  };

  /* ═════════ 4. accidental-path — planned vs actual ═════════ */
  const KN = [ // knots of the real path (right panel coords) + labels [dx, dy, anchor]
    { p: [50, 570] },
    // sp = stamp anchor; each stamp is tilted -5°, so it clears its own label, the next label and the slider row below
    { p: [160, 500], lab: '학교 + 첫 일', yr: '1999–', at: [22, 8, 'start'], sp: [182, 576, 'start'] },
    { p: [100, 390], lab: '보안 → 게임', yr: '2003 넥슨', at: [-20, 0, 'end'], sp: [84, 450, 'end'] },
    { p: [270, 330], lab: '게임 → 검색', yr: '2007 구글', at: [0, -44, 'middle'], sp: [176, 290, 'end'] },
    { p: [460, 470], lab: '검색 → TV', yr: '2014 Android TV', at: [0, 48, 'middle'], sp: [544, 510, 'start'] },
    { p: [560, 360], lab: '망설이다 멘토링', yr: '2015', at: [22, 10, 'start'], sp: [582, 440, 'start'] },
    { p: [470, 220], lab: '14년 만의 이직', yr: '약 2021 광고 AI', at: [-22, 4, 'end'], sp: [448, 166, 'end'] },
    { p: [650, 250], lab: '엔지니어 → 대표', yr: '2022–2024', at: [22, 24, 'start'], sp: [780, 340, 'start'] },
    { p: [670, 130], lab: '멈춤, 다시 코딩', yr: '2026', at: [-22, 4, 'end'], sp: [648, 76, 'end'] },
    { p: [790, 70] },
  ];
  const accidentalPath = {
    id: 'accidental-path',
    title: '계획한 길 vs 실제로 걸어온 길',
    minutes: 1.1,
    notes: '강의 제목의 “어쩌다”는 사전에서 “뜻밖에 우연히”입니다. 왼쪽처럼 곧게 계획했던 사람은 거의 없습니다. 오른쪽이 실제로 제가 걸어온 길이고, 꺾일 때마다 분야나 역할이 바뀌었습니다.\n' +
      '도착하면 길이 저절로 그려집니다. 아래 슬라이더로 17살부터 오늘까지 직접 따라가거나 “다시 그리기”를 누르세요.\n' +
      '도장: 꺾임(동그라미나 글씨)을 누를 때마다 “우연히 맡은 일 → 실패 → 새 기회 → 없음” 순서로 바뀌고 이 브라우저에 저장됩니다(“도장 지우기”로 초기화). 화면에는 확인된 사실만 적었으니 어느 꺾임이 무엇이었는지는 직접 고르세요. 도장은 강의 전에 모두 찍어 두고, 학생에게는 ‘14년 만의 이직’ 하나만 맞혀 보게 합니다(그 꺾임만 비워 두었다가 답을 듣고 찍기).\n' +
      '마무리 문장(태원고 편 자료에 직접 쓴 문장): “직업은 한 번 고르는 정답이 아니라, 내가 잘 풀고 싶은 문제가 바뀌며 만들어지는 경로였다.”\n' +
      '질문: “여러분의 다음 꺾임은? 동아리, 대회, 현장실습… 1년 안에 올 꺾임 하나를 떠올려 보세요.”',
    html: `
<style>
#f-accidental-path .abs{position:absolute}
#f-accidental-path svg text{font-family:var(--font-body);fill:var(--ink)}
#f-accidental-path .plan{fill:none;stroke:var(--ink-2);stroke-width:5;stroke-linecap:round}
#f-accidental-path .plan-t{font-size:26px;fill:var(--ink-2)}
#f-accidental-path .real{fill:none;stroke:var(--ink);stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
#f-accidental-path .next{fill:none;stroke:var(--ink-3);stroke-width:5;stroke-linecap:round;stroke-dasharray:2 14}
#f-accidental-path .kn{fill:var(--paper);stroke:var(--ink);stroke-width:4}
#f-accidental-path .lab{font-family:var(--font-hand);font-size:calc(36px * var(--hk, 1));fill:var(--ink)}
#f-accidental-path .lyr{font-family:var(--font-mono);font-size:20px;fill:var(--ink-3)}
#f-accidental-path .lab,#f-accidental-path .lyr{paint-order:stroke;stroke:var(--paper);stroke-width:7px;stroke-linejoin:round}
#f-accidental-path .k{transition:opacity .35s, transform .35s}
#f-accidental-path .k.hide{opacity:0}
#f-accidental-path .head{fill:var(--pen)}
#f-accidental-path .big{font-family:var(--font-mono);font-size:24px;font-weight:600}
#f-accidental-path .qm{font-family:var(--font-display);font-size:72px;font-weight:800;fill:var(--ink-3)}
#f-accidental-path .ap-def b{font-family:var(--font-display);font-weight:800;font-size:34px}
#f-accidental-path .ap-q{transition:opacity .4s;font-size:calc(62px * var(--hk, 1))}
#f-accidental-path .k:not(.end){cursor:pointer}
#f-accidental-path .k .hit{fill:transparent;stroke:none}
#f-accidental-path .k:not(.end):hover .kn{fill:var(--hl-soft)}
#f-accidental-path .stp rect{fill:var(--paper);stroke-width:3}
#f-accidental-path .stp text{font-family:var(--font-display);font-weight:800;font-size:21px;stroke:none}
#f-accidental-path .s1 rect{stroke:var(--pen)} #f-accidental-path .stp.s1 text{fill:var(--pen)}
#f-accidental-path .s2 rect{stroke:var(--bad)} #f-accidental-path .stp.s2 text{fill:var(--bad)}
#f-accidental-path .s3 rect{stroke:var(--good)} #f-accidental-path .stp.s3 text{fill:var(--good)}
#f-accidental-path .ap-st{display:inline-block;font-family:var(--font-display);font-weight:800;font-size:21px;line-height:1.25;padding:1px 9px;border:3px solid currentColor;border-radius:3px;transform:rotate(-4deg)}
#f-accidental-path .ap-st.s1{color:var(--pen)} #f-accidental-path .ap-st.s2{color:var(--bad)} #f-accidental-path .ap-st.s3{color:var(--good)}
#f-accidental-path .ap-q.hide{opacity:0}
</style>
<div class="kicker">왜 ‘어쩌다’인가</div>
<h2 class="title md">계획한 길 vs 실제로 걸어온 길</h2>
<div class="abs box dashed ap-def" style="right:92px;top:44px;width:390px;padding:8px 20px 10px">
  <b class="mark">어쩌다(가)</b> <span class="mono tiny muted">[부사]</span>
  <div style="font-size:28px;margin-top:2px">뜻밖에 우연히.</div>
</div>
<div class="abs mono tiny muted" style="left:92px;top:196px">보통 그리는 계획</div>
<svg class="abs ap-plan" viewBox="0 0 400 430" style="left:92px;top:226px;width:400px;height:430px;overflow:visible"></svg>
<div class="abs mono tiny muted" style="left:600px;top:196px">실제로 걸어온 길</div>
<div class="abs row center" style="left:800px;top:192px;gap:12px" aria-hidden="true">
  <span class="mono tiny muted">꺾임을 누르면 도장 →</span>
  <span class="ap-st s1">우연히 맡은 일</span><span class="ap-st s2">실패</span><span class="ap-st s3">새 기회</span>
</div>
<div class="abs demo" style="left:560px;top:214px;width:948px;height:600px"><svg class="ap-real" viewBox="0 0 948 600" style="width:948px;height:600px;overflow:visible"></svg></div>
<div class="abs hand lg ap-q" style="right:92px;top:652px;text-align:right;transform:rotate(-3deg)">여러분의<br>다음 꺾임은?</div>
<div class="abs quote" style="left:92px;top:690px;width:430px;font-size:28px;line-height:1.4;word-break:keep-all">직업은 한 번 고르는 정답이 아니라, 내가 잘 풀고 싶은 문제가 바뀌며 만들어지는 경로였다.</div>
<div class="abs demo row center" style="left:600px;top:800px;width:908px;gap:18px">
  <span class="mono small">17살</span>
  <input type="range" class="grow ap-range" min="0" max="1000" value="1000" aria-label="17살부터 오늘까지 따라가기">
  <span class="mono small">오늘</span>
  <button class="btn ap-play">다시 그리기</button>
  <button class="btn ghost ap-clear">도장 지우기</button>
</div>
<div class="src">출처: 표준국어대사전 ‘어쩌다가’ · AmCham 약력 · 구글코리아 블로그 2016-06-29 · LinkedIn 2026-07-31 · 인용: ‘어쩌다 AI’ 태원고 편 강의 자료</div>`,
    init(el, K) {
      handFit(el);
      /* planned: one ruler-straight arrow */
      const plan = el.querySelector('.ap-plan');
      const A = [60, 400], B = [340, 40];
      const at = (t) => [Kit.lerp(A[0], B[0], t), Kit.lerp(A[1], B[1], t)];
      const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
      const head = [[B[0] - 26 * Math.cos(ang - 0.42), B[1] - 26 * Math.sin(ang - 0.42)], [B[0] - 26 * Math.cos(ang + 0.42), B[1] - 26 * Math.sin(ang + 0.42)]];
      let p = `<path class="plan" d="M${A} L${B} M${head[0].map(f1)} L${B} L${head[1].map(f1)}"/>`;
      [[0.36, '대학'], [0.68, '좋은 회사']].forEach(([t, lab]) => {
        const q = at(t);
        p += `<path class="plan" d="M${f1(q[0] - 10)},${f1(q[1] - 8)} L${f1(q[0] + 10)},${f1(q[1] + 8)}" style="stroke-width:4"/>`;
        p += `<text class="plan-t" x="${f1(q[0] + 22)}" y="${f1(q[1] + 18)}">${lab}</text>`;
      });
      p += `<text class="plan-t" x="${B[0] - 12}" y="${B[1] - 2}" text-anchor="end">꿈의 직업</text>`;
      p += `<circle class="kn" cx="${A[0]}" cy="${A[1]}" r="9"/><text class="big" x="${A[0]}" y="${A[1] + 40}" text-anchor="middle">17살</text>`;
      plan.innerHTML = p;

      /* real: a winding path */
      const svg = el.querySelector('.ap-real');
      const pts = KN.map((k) => k.p);
      let s = `<path class="next" d="M790,70 Q860,64 890,64"/><text class="qm" x="902" y="92">?</text>`;
      s += `<path class="real" d="${Kit.sketchPath(pts, { seed: 17, tension: 0.55 })}"/>`;
      KN.forEach((k, i) => {
        if (!k.lab) return;
        const [dx, dy, anc] = k.at, x = k.p[0] + dx, y = k.p[1] + dy;
        s += `<g class="k" data-i="${i}" role="button" aria-label="${esc(k.lab + ' ' + k.yr + ' 도장 바꾸기')}"><circle class="hit" cx="${k.p[0]}" cy="${k.p[1]}" r="28"/><circle class="kn" cx="${k.p[0]}" cy="${k.p[1]}" r="8"/>
          <text class="lab" x="${x}" y="${y}" text-anchor="${anc}">${esc(k.lab)}</text>
          <text class="lyr" x="${x}" y="${y + 26}" text-anchor="${anc}">${esc(k.yr)}</text></g>`;
      });
      s += `<g class="k end" data-i="${KN.length - 1}"><circle cx="790" cy="70" r="13" style="fill:var(--hl);stroke:var(--ink);stroke-width:4"/>
        <text class="big" x="766" y="48" text-anchor="end" style="paint-order:stroke;stroke:var(--paper);stroke-width:7px">오늘</text></g>`;
      s += `<circle class="kn" cx="50" cy="570" r="9"/>`;
      s += `<circle class="head" r="9" cx="-40" cy="-40"/>`;
      svg.innerHTML = s;
      const real = svg.querySelector('.real'), headDot = svg.querySelector('.head');
      const L = real.getTotalLength();
      real.style.strokeDasharray = `${f1(L)} ${f1(L + 20)}`;
      const realAt = cubicAt(real.getAttribute('d'), 1024); // also used every frame by draw(): no layout reads there
      const kl = KN.map((k) => lenAt(realAt, L, k.p[0], k.p[1]));
      const kEls = Array.from(svg.querySelectorAll('.k'));
      const extra = [svg.querySelector('.next'), svg.querySelector('.qm'), el.querySelector('.ap-q')];
      const range = el.querySelector('.ap-range');
      /* While the replay plays, the curve is drawn as its 9 knot-to-knot pieces instead of one dashed path: then only
         the piece being drawn changes each frame and only its box is repainted, not the whole curve's (most of the
         replay's raster work). Pieces join at the knots, under the opaque knot circles, and the growing end sits under
         the head dot, so it looks the same. At rest and while the slider is dragged the single path is shown. */
      const pcs = Kit.svg('g', { 'aria-hidden': 'true' });
      pcs.style.display = 'none';
      real.parentNode.insertBefore(pcs, real.nextSibling);
      const pieces = realAt.segs.map((g, k) => {
        const a = k ? realAt.ends[k - 1] : 0, dl = +f1(realAt.ends[k] - a + 1); // dash longer than the piece
        const p = Kit.svg('path', { class: 'real', d: `M${g[0]},${g[1]} C${g[2]},${g[3]} ${g[4]},${g[5]} ${g[6]},${g[7]}` }, pcs);
        p.style.strokeDasharray = `${dl} ${f1(dl + 20)}`;
        p.style.visibility = 'hidden';
        return { p, a, b: realAt.ends[k], dl, v: 'hidden' };
      });
      const st = { p: 1, playing: false, pieces: false };
      const draw = (pr) => {
        st.p = pr;
        const len = L * pr;
        const usePieces = st.playing && pr < 1;
        if (usePieces !== st.pieces) { st.pieces = usePieces; pcs.style.display = usePieces ? '' : 'none'; real.style.visibility = usePieces ? 'hidden' : ''; }
        if (usePieces) {
          pieces.forEach((q) => {
            const v = len <= q.a ? 'hidden' : f1(len >= q.b ? 0 : q.dl - (len - q.a));
            if (v === q.v) return;
            if (v === 'hidden' || q.v === 'hidden') q.p.style.visibility = v === 'hidden' ? 'hidden' : '';
            if (v !== 'hidden') q.p.style.strokeDashoffset = v;
            q.v = v;
          });
        } else real.style.strokeDashoffset = f1(L - len);
        kEls.forEach((g) => g.classList.toggle('hide', kl[+g.dataset.i] > len + 3));
        const done = pr >= 0.995;
        extra.forEach((n) => { n.style.opacity = done ? 1 : 0; });
        if (!done && pr > 0.002) { const q = realAt(len); headDot.setAttribute('cx', f1(q.x)); headDot.setAttribute('cy', f1(q.y)); headDot.style.opacity = 1; }
        else headDot.style.opacity = 0;
        range.value = Math.round(pr * 1000);
      };
      range.addEventListener('input', () => { st.playing = false; draw(range.value / 1000); });
      el.querySelector('.ap-play').addEventListener('click', () => { st.playing = true; draw(0); });
      K.loop(el, (t, dt) => {
        if (!st.playing) return;
        const np = Math.min(1, st.p + dt / 5);
        draw(np);
        if (np >= 1) st.playing = false;
      });
      /* stamps: 우연히 맡은 일 / 실패 / 새 기회 — chosen by the presenter, kept in Kit.store */
      const STAMP = ['', '우연히 맡은 일', '실패', '새 기회'];
      let marks = K.store.get('speaker-turns', {});
      if (!marks || typeof marks !== 'object') marks = {};
      /* a stamp is built in two halves so paintAll() can build every stamp, then measure them all (one layout),
         then size them all, instead of a forced layout per stamp on every arrival */
      const build = (g) => {
        const i = +g.dataset.i, v = marks[i] || 0, sp = KN[i].sp;
        const old = g.querySelector('.stp'); if (old) old.remove();
        if (!v || !sp) return null;
        const sg = Kit.svg('g', { class: 'stp s' + v, transform: `rotate(-5 ${sp[0]} ${sp[1]})` }, g);
        const r = Kit.svg('rect', { rx: 3 }, sg);
        const t = Kit.svg('text', { x: sp[0], y: sp[1], 'text-anchor': sp[2] }, sg);
        t.textContent = STAMP[v];
        return { r, t, sp };
      };
      const measure = (s) => {
        const sp = s.sp;
        let b; try { b = s.t.getBBox(); } catch (e) { b = null; }
        if (!b || !b.width) b = { x: sp[0] - (sp[2] === 'end' ? 130 : sp[2] === 'middle' ? 65 : 0), y: sp[1] - 20, width: 130, height: 26 };
        return b;
      };
      const size = (s, b) => {
        s.r.setAttribute('x', f1(b.x - 9)); s.r.setAttribute('y', f1(b.y - 3));
        s.r.setAttribute('width', f1(b.width + 18)); s.r.setAttribute('height', f1(b.height + 6));
      };
      const paint = (g) => { const s = build(g); if (s) size(s, measure(s)); };
      const paintAll = () => {
        const ss = kEls.filter((g) => !g.classList.contains('end')).map(build).filter(Boolean);
        const bs = ss.map(measure);
        ss.forEach((s, k) => size(s, bs[k]));
      };
      svg.addEventListener('click', (e) => {
        const g = e.target.closest('.k');
        if (!g || g.classList.contains('end')) return;
        const i = +g.dataset.i;
        marks[i] = ((marks[i] || 0) + 1) % STAMP.length;
        if (!marks[i]) delete marks[i];
        K.store.set('speaker-turns', marks);
        paint(g);
      });
      el.querySelector('.ap-clear').addEventListener('click', () => { marks = {}; K.store.set('speaker-turns', marks); paintAll(); });
      paintAll();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintAll);
      draw(1);
      this._draw = draw; this._st = st; this._paint = paintAll;
    },
    enter() { if (this._draw) { this._paint(); this._st.playing = true; this._draw(0); } },
    leave() { if (this._draw) { this._st.playing = false; this._draw(1); } },
  };

  /* ═════════ 5. mentor-note — mentoring pins + notes to 17-year-old me ═════════ */
  const COAST = [[37.75, 126.15], [37.95, 126.65], [38.05, 127.1], [38.3, 127.5], [38.33, 128.0], [38.6, 128.35], // DMZ (dashed)
    [38.2, 128.6], [37.75, 128.92], [37.5, 129.12], [37.05, 129.42], [36.55, 129.42], [36.08, 129.57], [35.95, 129.45],
    [35.5, 129.42], [35.15, 129.15], [35.05, 128.95], [34.88, 128.62], [34.83, 128.4], [34.82, 127.95], [34.72, 127.72],
    [34.5, 127.35], [34.6, 127.0], [34.3, 126.75], [34.3, 126.52], [34.6, 126.3], [34.8, 126.4], [35.15, 126.35],
    [35.45, 126.45], [35.75, 126.6], [35.98, 126.7], [36.33, 126.55], [36.6, 126.3], [36.9, 126.2], [36.95, 126.65],
    [37.0, 126.85], [37.2, 126.65], [37.45, 126.6], [37.62, 126.52], [37.75, 126.15]];
  const proj = (lat, lon) => [(lon - 125.9) * 81 + 10, (38.75 - lat) * 100 + 10];
  const PINS = [
    { n: '서울', ll: [37.57, 126.98], yr: '2015~', lab: [-14, 4, 'end'], hit: [-9, -9, 15], when: '2015 · 시작', txt: '구글러 6~8명과 고교생 20여 명. 저녁 2시간의 대화로 시작했어요.' },
    { n: '제주', ll: [33.5, 126.53], yr: '2016 · 2019', lab: [44, 10, 'start'], when: '2016.06 · 2019.06', txt: '학생들에게 준 이메일로 언제든 연락하라며 후기에 쓴 말. “어렵게 생각말고. Just Do It.”' },
    { n: '강릉', ll: [37.75, 128.85], yr: '2016.08', lab: [14, 34, 'start'], when: '2016.08', txt: '“재밌게 살아요.” 멘토링 마지막에 항상 같이 했던 말.' },
    { n: '울산', ll: [35.54, 129.31], yr: '2016.10', lab: [14, 8, 'start'], when: '2016.10', txt: '다른 멘토들은 KTX. 저는 새벽 5시 40분에 자동차로 출발했어요.' },
    { n: '광주', ll: [35.16, 126.85], yr: '2017.04', lab: [-14, 4, 'end'], when: '2017.04', txt: '블로그에 기록이 남은 원정 7번 중 네 번째.' },
    { n: '대구', ll: [35.87, 128.6], yr: '2018.12', lab: [-14, 4, 'end'], when: '2018.12', txt: '‘멘토반장’으로 쓴 후기. 4년 동안 학교·기관 120여 곳.' },
    { n: '남원', ll: [35.42, 127.39], yr: '2019.04', lab: [14, 30, 'start'], when: '2019.04', txt: '짓궂은 질문만 하던 학생들이 결국 물었어요. “일을 하면서 언제 행복하신가요?”' },
    { n: '성일정보고', ll: [37.43, 127.14], yr: '오늘', lab: [16, 22, 'start'], hit: [9, 9, 17], when: '2026.11 · 오늘', txt: '성남 중원구. 지도에 새로 꽂는 핀. 여러분은 무엇을 물어볼 건가요?', me: true },
  ];
  const mentorNote = {
    id: 'mentor-note',
    title: '17살의 나에게',
    minutes: 1.0,
    notes: '2015년부터 구글 청소년 멘토단으로 전국 고등학교를 찾아다녔고 2018년엔 “멘토반장”이었습니다. 2015–2018년에만 120여 곳. 지금은 스타트업 멘토도 합니다.\n' +
      '클릭: 지도의 핀을 누르면 그 원정의 한 장면이 나옵니다(울산의 “새벽 5시 40분” 추천. 남원 핀은 누르지 않고 남겨 둡니다. 그 질문은 마지막 Q&A에서 답합니다). → 키로 포스트잇 3장을 한 장씩 붙입니다. 1번(2016 제주 후기)과 3번(2016 강릉 후기)은 실제로 학생들에게 했던 말이고, 2번은 경력을 돌아보며 하는 일반적인 조언입니다. 1번 “Just Do It.”은 마지막 Q&A 화면에 다시 나옵니다.\n' +
      '성일정보고 핀을 마지막으로 누르며 “오늘 여기서 받을 질문이 제일 궁금하다”고 말해 주세요. 성남과의 인연을 덧붙여도 좋습니다: LinkedIn에 적어 둔 대로 2022년부터 성남시와 함께 청소년 멘토링(NexterZ)을 이어 왔습니다(독립 출처 없음, 화면에는 넣지 않음).\n' +
      '질문: “10년 뒤의 여러분이 지금의 여러분에게 포스트잇 한 장을 붙인다면, 뭐라고 쓸까요?”',
    html: `
<style>
#f-mentor-note .abs{position:absolute}
#f-mentor-note .mn-map text{font-family:var(--font-body);fill:var(--ink);paint-order:stroke;stroke:var(--paper);stroke-width:6px;stroke-linejoin:round}
#f-mentor-note .coast{fill:none;stroke:var(--ink-2);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
#f-mentor-note .dmz{fill:none;stroke:var(--ink-3);stroke-width:2.5;stroke-dasharray:4 7}
#f-mentor-note .pin{cursor:pointer}
#f-mentor-note .pin .hit{fill:transparent;stroke:none}
#f-mentor-note .pin .pd{fill:var(--paper);stroke:var(--ink);stroke-width:3.5}
#f-mentor-note .pin.me .pd{fill:var(--hl)}
#f-mentor-note .pin:hover .pd{fill:var(--hl-soft)}
#f-mentor-note .pin.on .pd{fill:var(--hl);stroke-width:4.5}
#f-mentor-note .pin .pn{font-size:22px;font-weight:700}
#f-mentor-note .pin .py{font-family:var(--font-mono);font-size:20px;fill:var(--ink-2)}
#f-mentor-note .ring{fill:none;stroke:var(--pen);stroke-width:3}
#f-mentor-note .grid-t{font-family:var(--font-mono);font-size:20px;fill:var(--ink-3)}
#f-mentor-note .stat b{font-size:76px}
#f-mentor-note .stat b small{font-size:36px;margin-left:4px}
#f-mentor-note .sticky{font-size:calc(46px * var(--hk, 1));line-height:1.15}
#f-mentor-note .sticky small{display:block;font-family:var(--font-mono);font-size:20px;line-height:1.35;margin-top:16px;opacity:.75}
#f-mentor-note .mn-cap{transition:opacity .2s}
#f-mentor-note .mn-col,#f-mentor-note .mn-cap,#f-mentor-note .sticky{word-break:keep-all}
</style>
<div class="kicker">멘토링 · 2015 → 오늘</div>
<h2 class="title">17살의 나에게</h2>
<div class="abs demo" style="left:92px;top:236px;width:350px;height:600px"><svg class="mn-map" viewBox="0 0 330 590" style="width:330px;height:590px;overflow:visible" aria-label="멘토링 원정 지도"></svg></div>
<div class="abs mn-col" style="left:500px;top:236px;width:330px">
  <div class="mono tiny muted">구글 청소년 멘토단 · 호스트·멘토</div>
  <div class="stat" style="margin-top:4px"><b class="num">120<small>여 곳</small></b><span>2015–2018, 함께한 학교·기관</span></div>
  <div class="small" style="margin-top:16px;line-height:1.35">2018 ‘멘토반장’<br>2024~ 스타트업 멘토</div>
  <div class="mono tiny faint" style="line-height:1.3">Google for Startups Accelerator</div>
</div>
<div class="abs demo mn-cap" style="left:500px;top:572px;width:320px">
  <div class="mono tiny faint mn-when"></div>
  <div class="display mn-where" style="font-size:34px;font-weight:800;line-height:1.2"></div>
  <div class="mn-txt" style="font-size:25px;line-height:1.4;margin-top:8px"></div>
</div>
<div class="abs sticky" data-step="1" style="left:856px;top:84px;width:330px;--tilt:-2.5deg">어렵게 생각말고.<br>Just Do It.<small>2016 제주 멘토링 후기,<br>학생들에게 쓴 말</small></div>
<div class="abs sticky" data-step="2" style="left:1190px;top:212px;width:322px;--tilt:2.2deg">도구는 계속 바뀐다.<br>배우는 습관이<br>남는다.<small>게임 → 검색 → TV → AI</small></div>
<div class="abs sticky" data-step="3" style="left:910px;top:470px;width:330px;--tilt:-1deg">재밌게 살아요.<small>멘토링 끝에 늘 하던 말</small></div>
<div class="abs hand" style="left:856px;top:730px;width:652px;font-size:calc(38px * var(--hk, 1));transform:rotate(-1deg)">소프트웨어개발과 · AI게임콘텐츠과 여러분,<br>저도 게임 회사(넥슨) 개발자였어요.</div>
<div class="src">출처: 구글코리아 블로그(2016-06·08·10, 2017-05, 2018-12, 2019-04·07) · LinkedIn · 구글코리아 블로그 2025-06-24(‘AI 퍼스트’ 멘토) · 성일정보고 홈페이지(학과) · 지도는 대략적인 해안선</div>`,
    init(el, K) {
      handFit(el);
      const svg = el.querySelector('.mn-map');
      const P = COAST.map(([a, b]) => proj(a, b));
      const coastD = Kit.sketchPath(P.slice(5), { seed: 9, wobble: 2, tension: 0.35 });
      const dmzD = 'M' + P.slice(0, 6).map((q) => q.map(f1).join(',')).join(' L');
      const [jx, jy] = proj(33.38, 126.55);
      let s = '';
      // graph-paper lat/lon ticks
      [34, 36, 38].forEach((lat) => { const y = proj(lat, 126)[1]; s += `<text class="grid-t" x="-6" y="${f1(y + 6)}" text-anchor="end">${lat}°</text>`; });
      s += `<path class="coast" d="${coastD}"/><path class="dmz" d="${dmzD}"/>`;
      s += `<ellipse class="coast" cx="${f1(jx)}" cy="${f1(jy)}" rx="33" ry="17" transform="rotate(-4 ${f1(jx)} ${f1(jy)})"/>`;
      s += `<circle class="ring" r="16" cx="-50" cy="-50"/>`;
      PINS.forEach((p, i) => {
        const [x, y] = proj(p.ll[0], p.ll[1]);
        const [dx, dy, anc] = p.lab;
        s += `<g class="pin${p.me ? ' me' : ''}" data-i="${i}" role="button" aria-label="${esc(p.n + ' ' + p.yr)}">
          <circle class="hit" cx="${f1(x + (p.hit ? p.hit[0] : 0))}" cy="${f1(y + (p.hit ? p.hit[1] : 0))}" r="${p.hit ? p.hit[2] : 22}"/>
          <circle class="pd" cx="${f1(x)}" cy="${f1(y)}" r="${p.me ? 11 : 8}"/>
          <text class="pn" x="${f1(x + dx)}" y="${f1(y + dy)}" text-anchor="${anc}">${esc(p.n)}</text>
          <text class="py" x="${f1(x + dx)}" y="${f1(y + dy + 24)}" text-anchor="${anc}">${esc(p.yr)}</text></g>`;
      });
      svg.innerHTML = s;
      const ring = svg.querySelector('.ring');
      const cap = el.querySelector('.mn-cap');
      let cur = PINS.length - 1;
      const sel = (i) => {
        cur = i;
        const p = PINS[i], [x, y] = proj(p.ll[0], p.ll[1]);
        svg.querySelectorAll('.pin').forEach((g) => g.classList.toggle('on', +g.dataset.i === i));
        ring.setAttribute('cx', f1(x)); ring.setAttribute('cy', f1(y));
        cap.style.opacity = 0.2;
        setTimeout(() => {
          el.querySelector('.mn-when').textContent = p.when;
          el.querySelector('.mn-where').textContent = p.n;
          el.querySelector('.mn-txt').textContent = p.txt;
          cap.style.opacity = 1;
        }, 120);
      };
      svg.addEventListener('click', (e) => { const g = e.target.closest('.pin'); if (g) sel(+g.dataset.i); });
      K.loop(el, (t) => {
        const r = 16 + 7 * ((t * 0.9) % 1);
        ring.setAttribute('r', f1(r));
        // stroke-opacity rather than style.opacity: the ring is a lone stroke (fill:none), so it looks the same,
        // but a changing element opacity makes Chrome re-layerize the page on every frame
        ring.setAttribute('stroke-opacity', f1(1 - ((t * 0.9) % 1)));
      });
      sel(cur);
      ring.setAttribute('r', 18);
    },
  };

  Deck.part('speaker', 1, [careerLine, googleYears, yanoljaAI, accidentalPath, mentorNote]);
})();
