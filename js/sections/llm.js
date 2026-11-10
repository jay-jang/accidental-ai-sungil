/* 2교시 첫 정류장 · ChatGPT는 어떻게 말할까
   1교시 되짚기 → 트랜스포머 → 토큰 → 다음 단어 예측 → 임베딩 → 어텐션 → 학습 3단계 → 환각.
   모든 데모는 브라우저 안에서만 계산합니다(외부 라이브러리·fetch 없음). */
(function () {
  'use strict';

  const esc = (s) => Kit.escape(s);
  const pctTxt = (p) => (p > 0 && p < 0.005 ? '<1' : String(Math.round(p * 100))) + '%';
  function korNum(n) {
    const f = (v) => (v >= 100 ? Math.round(v).toLocaleString('ko-KR') : String(Math.round(v * 10) / 10));
    if (n >= 1e12) return f(n / 1e12) + '조';
    if (n >= 1e8) return f(n / 1e8) + '억';
    if (n >= 1e4) return f(n / 1e4) + '만';
    return Math.round(n).toLocaleString('ko-KR');
  }

  /* ═════════════ 1. recap-2 ═════════════ */
  const LY = 540; // timeline y on the stage
  const RECAP = [
    { x: 190, yr: '1943', name: '인공 뉴런', sub: '뉴런을 0/1 논리로', ph: Kit.photo('pitts', '월터 피츠', 'sm') },
    { x: 480, yr: '1986', name: '역전파', sub: '틀린 만큼 거꾸로 고치기', ph: Kit.photo('rumelhart', '러멜하트', 'sm tilt-r') },
    { x: 770, yr: '2012', name: '데이터 + GPU', sub: 'AlexNet · 게임용 GPU 2장', ph: Kit.photo('gpu', 'GTX 580', 'sm wide', '--w:236px;--tilt:-1.2deg') },
    { x: 1060, yr: '2016', name: '알파고', sub: '서울 · 4 : 1', ph: Kit.photo('lee-sedol', '이세돌', 'sm tilt-r') },
  ];
  const recapNodes = RECAP.map((n) => `
    <div class="abs rc-node" style="left:${n.x - 160}px">
      <div class="rc-ph">${n.ph}</div>
      <div class="rc-lab"><div class="rc-yr">${n.yr}</div><div class="rc-nm">${n.name}</div><div class="rc-sub">${n.sub}</div></div>
    </div>`).join('');

  /* ═════════════ 2. transformer ═════════════ */
  const TP = { L: 96, T: 234, W: 560, H: 594, rot: -1.5 };
  function paperPt(lx, ly) {
    const cx = TP.W / 2, cy = TP.H / 2, a = (TP.rot * Math.PI) / 180, dx = lx - cx, dy = ly - cy;
    return [TP.L + cx + dx * Math.cos(a) - dy * Math.sin(a), TP.T + cy + dx * Math.sin(a) + dy * Math.cos(a)];
  }
  const AUTH = ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'];
  const ROW0 = 198, ROWH = 40;
  const DESTS = [
    { name: 'Essential AI', who: 'Vaswani (Adept 거쳐)', from: [0] },
    { name: 'Character.AI', who: 'Shazeer · 2024년 구글로 복귀', from: [1] },
    { name: 'Anthropic', who: 'Parmar (Adept·Essential 거쳐)', from: [2] },
    { name: 'Inceptive', who: 'Uszkoreit · 생명공학', from: [3] },
    { name: 'Sakana AI', who: 'Jones', from: [4] },
    { name: 'Cohere', who: 'Gomez', from: [5] },
    { name: 'OpenAI', who: 'Kaiser', from: [6], hot: true },
    { name: 'NEAR Protocol', who: 'Polosukhin · 블록체인', from: [7] },
  ];
  const DX = 1112, DY = (k) => 270 + k * 77;
  const startPts = AUTH.map((_, i) => paperPt(TP.W - 24, ROW0 + i * ROWH + ROWH / 2));
  const flows = [];
  DESTS.forEach((d, k) => d.from.forEach((i) => {
    const [sx, sy] = startPts[i], ex = DX - 20, ey = DY(k);
    const pts = [[sx, sy], [sx + (ex - sx) * 0.3, sy + (ey - sy) * 0.08], [sx + (ex - sx) * 0.7, sy + (ey - sy) * 0.92], [ex, ey]];
    flows.push({ d: Kit.sketchPath(pts, { wobble: 5, seed: 17 + i * 3 }), hot: !!d.hot, ex, ey, n: flows.length });
  }));

  /* ═════════════ 3. tokens (BPE 흉내) ═════════════ */
  const EN_WORDS = new Set(('the a an is are was were be been to of and or in on at for with by from as it its this that these i me my you your he she we our they them their not no yes do does did can will would should could what how why when where who which there here very so just like love hate good bad new old big small more most all one two three hello world ai lunch today school game games code coding python java class club student students teacher important really about make made help please thanks thank lol ok okay chat gpt').split(' '));
  const EN_SUB = new Set(['ization', 'ation', 'tion', 'sion', 'ment', 'ness', 'able', 'ably', 'ible', 'ing', 'ed', 'er', 'est', 'ly', 'ful', 'less', 'ous', 'ive', 'ize', 'ise', 'token', 'believ', 'un', 're', 'pre', 'pro', 'dis', 'in', 'im', 'con', 'com', 'ex', 'gram', 'ming', 'program', 'trans', 'form', 'former', 'atten', 'learn', 'ning', 'net', 'work', 'data', 'comput', 'model', 'lang', 'uage', 'th', 'ch', 'sh', 'st', 'ou', 'an', 'en', 'al', 'ic', 'at', 'or', 'es', 'ent', 'ant', 'is', 'it', 'le', 'ar', 'ow', 'ay', 'ee', 'oo']);
  const KO_WORDS = new Set(['파이썬', '좋아해', '성일', '정보', '동아리', '환영', '합니다', '입니다', '습니다', '하세요', '안녕', '오늘', '내일', '어제', '급식', '시험', '코딩', '게임', '인공', '지능', '학교', '학생', '선생님', '친구', '공부', '수업', '숙제', '맛있', '좋아', '에서', '으로', '하고', '했다', '한다', '있다', '없다', '개발', '컴퓨터', '토큰', '모델', '언어', '다음', '단어', '진짜', '너무', '정말', '메뉴', '오신', '우리', '여러분', '반갑', '사람', '생각', '시간', '문제', '고등', '프로그램', '데이터', '인정', '대박', '뭐야', '먹고', '싶다', '그리고', '하지만', '때문', '이다', '한국', '서울']);
  const KO_COMMON = new Set([...'가각간갈감강개거건걸게겠고공과관교구국권그근글금기길김까나난날남내너넣네년노놀누는늘니다단달담당대더던데도독돌동되된될됩두둘드든들등디따때떡또라락란람랑래러런렇레려력련렬로록론료루류르를름리린림마막만많말맞매맛머먹메며면명모목몰무문물뭐미민바박반받발밤방배백버번법벌베변보복본볼부분불비빠사산살상새생서석선설성세셨소속손송수숙순술스습시식신실심아악안않알암앞애야약양어억언얼엄업없었에여역연열영예오온올와완왔외요용우운울원월위유으은을음응의이인일임입있자작잔잘잠장재저적전절점정제져조좀종좋주준줄중즈즘지직진질집짜째쪽차참창책처천철청체쳐초총최추출충취치친칠카커컴코크키타터텐토통트특티파판퍼편평포표프피필하학한할함합해했행향허현형호화확환활회후휴히']);
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', JONG = 'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
  function koSyl(ch) {
    if (KO_COMMON.has(ch)) return [ch];
    const c = ch.charCodeAt(0) - 0xac00, jong = c % 28, jung = Math.floor(c / 28) % 21, cho = Math.floor(c / 588);
    if (jong) return [String.fromCharCode(0xac00 + (cho * 21 + jung) * 28), JONG[jong - 1]];
    return [CHO[cho], JUNG[jung]];
  }
  function koPieces(run) {
    const out = [];
    let i = 0;
    while (i < run.length) {
      let hit = 0;
      for (let L = Math.min(4, run.length - i); L >= 2; L--) if (KO_WORDS.has(run.slice(i, i + L))) { hit = L; break; }
      if (hit) { out.push(run.slice(i, i + hit)); i += hit; } else { out.push(...koSyl(run[i])); i++; }
    }
    return out;
  }
  function enPieces(word) {
    const low = word.toLowerCase();
    if (EN_WORDS.has(low)) return [word];
    const out = [];
    let i = 0;
    while (i < low.length) {
      let hit = 1;
      for (let L = Math.min(10, low.length - i); L >= 2; L--) if (EN_SUB.has(low.slice(i, i + L))) { hit = L; break; }
      out.push(word.slice(i, i + hit)); i += hit;
    }
    return out;
  }
  function tokenize(text) {
    const out = [];
    const re = /(\s+)|([가-힣]+)|([A-Za-z]+)|([0-9]+)|([ㄱ-ㅣ]+)|([\s\S])/gu;
    let sp = '', m;
    while ((m = re.exec(text))) {
      if (m[1]) { sp = ' '; continue; }
      let p;
      if (m[2]) p = koPieces(m[2]);
      else if (m[3]) p = enPieces(m[3]);
      else if (m[4]) p = m[4].match(/.{1,3}/g);
      else if (m[5]) p = m[5].match(/.{1,2}/gu);
      else p = [m[6]];
      p.forEach((t, i) => out.push({ t, sp: i === 0 ? sp : '' }));
      sp = '';
    }
    return out;
  }
  function tokId(t) {
    let h = 2166136261;
    for (const c of t.sp + t.t) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
    return 100 + ((h >>> 0) % 99800);
  }
  const TK_EX = ['성일정보고 IT 동아리에 오신 걸 환영합니다!', 'Tokenization is unbelievably important.', 'ㅋㅋㅋ 오늘 급식 개꿀맛 인정?'];
  const TK_COLS = ['c2', 'c4', 'c3', 'c5'];

  /* ═════════════ 4. next-token: 직접 쓴 말뭉치(100문장 남짓) ═════════════ */
  const NT_CORPUS = `
오늘 급식은 돈가스라서 다들 뛰어갔다
오늘 급식은 카레라서 줄이 길었다
오늘 급식은 짜장면이라서 기분이 좋다
오늘 급식은 생선이라서 조금 아쉽다
오늘 급식은 진짜 맛있었다
오늘 급식은 진짜 별로였다
오늘 급식 메뉴는 돈가스다
오늘 급식 메뉴는 떡볶이다
내일 급식은 치킨이라서 벌써 기대된다
내일 급식 메뉴는 뭐야
급식 줄이 너무 길어서 매점에 갔다
급식 먹고 운동장에서 축구를 했다
급식 먹고 교실에서 잠을 잤다
매점에서 빵을 사 먹었다
돈가스는 언제 먹어도 맛있다
떡볶이는 언제 먹어도 맛있다
카레는 진짜 맛있었다
내일 시험은 수학이라서 걱정된다
내일 시험은 수학이라서 밤새 공부해야 한다
내일 시험은 수학이라서 너무 떨린다
내일 시험은 영어라서 단어를 외워야 한다
내일 시험은 정보처리라서 자신 있다
내일 시험 범위가 너무 넓다
시험 공부를 하나도 안 했다
시험 공부를 하다가 잠이 들었다
시험 끝나고 노래방에 갔다
시험 끝나고 게임을 했다
시험 끝나면 게임을 할 거다
수학 시험은 진짜 어려웠다
영어 시험은 생각보다 쉬웠다
자격증 시험에 드디어 합격했다
정보처리 자격증 시험을 준비하고 있다
선생님이 시험 범위를 알려 주셨다
선생님이 내일 시험은 쉽다고 하셨다
나는 코딩을 좋아한다
나는 코딩을 잘하고 싶다
나는 코딩을 배우고 싶다
나는 코딩을 매일 연습한다
나는 코딩이 제일 재밌다
나는 게임을 좋아한다
나는 게임을 만들고 싶다
나는 파이썬을 배우고 있다
파이썬으로 게임을 만들었다
파이썬으로 계산기를 만들었다
파이썬은 생각보다 쉽다
자바는 생각보다 어렵다
코딩을 하다가 오류가 났다
코딩을 하다가 밤을 새웠다
오류가 너무 많아서 머리가 아프다
오류를 고치니까 기분이 좋다
코드를 고치니까 드디어 돌아갔다
코드가 드디어 돌아갔다
동아리에서 코딩을 배운다
동아리에서 게임을 만든다
동아리에서 웹사이트를 만들었다
우리 동아리는 코딩을 정말 잘한다
우리 동아리는 매주 프로젝트를 한다
인공지능은 다음 단어를 맞히는 게임을 한다
인공지능은 생각보다 똑똑하다
인공지능이 코드를 대신 써 주었다
인공지능이 숙제를 도와주었다
게임을 하다가 엄마한테 혼났다
게임을 하다가 밤을 새웠다
게임을 너무 많이 해서 눈이 아프다
게임에서 드디어 이겼다
게임에서 또 졌다
친구랑 게임을 했다
친구랑 매점에 갔다
친구랑 노래방에 갔다
주말에 친구랑 게임을 할 거다
주말에 코딩 공부를 할 거다
새로 나온 게임은 진짜 재밌다
이 게임은 진짜 어렵다
오늘 학교에 늦게 갔다
오늘 학교에서 발표를 했다
오늘 수업은 정말 재밌었다
오늘 수업은 너무 길었다
오늘 날씨가 너무 좋다
내일 학교에 일찍 가야 한다
선생님이 숙제를 내 주셨다
선생님이 숙제를 많이 내 주셨다
선생님이 숙제를 검사하셨다
선생님이 칭찬해 주셨다
숙제를 하다가 잠이 들었다
숙제를 하나도 안 했다
숙제는 내일 해야 한다
우리 반은 체육 시간을 제일 좋아한다
우리 반은 진짜 시끄럽다
체육 시간에 축구를 했다
점심시간에 축구를 했다
점심시간에 매점에 갔다
방과 후에 동아리에서 코딩을 했다
방과 후에 친구랑 게임을 했다
수업 시간에 잠이 들었다
쉬는 시간에 매점에 갔다
오늘 정말 피곤하다
나는 오늘 정말 피곤하다
나는 내일 시험이 걱정된다
나는 급식이 제일 좋다
학교 끝나고 학원에 갔다
학교 끝나고 친구랑 게임을 했다
졸업하면 개발자가 되고 싶다
나중에 개발자가 되고 싶다
나중에 게임 회사에 가고 싶다`.trim().split('\n').map((s) => s.trim()).filter(Boolean);

  const NT = (function () {
    const bi = new Map(), tri = new Map();
    let words = 0;
    const inc = (m, k, w) => { let o = m.get(k); if (!o) m.set(k, (o = new Map())); o.set(w, (o.get(w) || 0) + 1); };
    for (const s of NT_CORPUS) {
      const w = ['<s>', '<s>', ...s.split(/\s+/), '</s>'];
      words += w.length - 3;
      for (let i = 2; i < w.length; i++) { inc(bi, w[i - 1], w[i]); inc(tri, w[i - 2] + '|' + w[i - 1], w[i]); }
    }
    let entries = 0;
    bi.forEach((m) => (entries += m.size));
    tri.forEach((m) => (entries += m.size));
    return { bi, tri, words, entries, sentences: NT_CORPUS.length };
  })();
  function ntDist(ctx) {
    const a = ctx[ctx.length - 2], b = ctx[ctx.length - 1];
    const norm = (m) => { const o = new Map(); if (!m) return o; let s = 0; m.forEach((c) => (s += c)); m.forEach((c, w) => o.set(w, c / s)); return o; };
    const pt = norm(NT.tri.get(a + '|' + b)), pb = norm(NT.bi.get(b));
    const lam = pt.size ? 0.65 : 0;
    const out = new Map();
    pt.forEach((p, w) => out.set(w, (out.get(w) || 0) + lam * p));
    pb.forEach((p, w) => out.set(w, (out.get(w) || 0) + (1 - lam) * p));
    return [...out].map(([w, p]) => ({ w, p })).sort((x, y) => y.p - x.p || (x.w < y.w ? -1 : 1));
  }
  function temper(arr, T) {
    const q = arr.map((o) => Math.pow(o.p, 1 / T));
    const s = q.reduce((a, b) => a + b, 0) || 1;
    return arr.map((o, i) => ({ w: o.w, p: q[i] / s }));
  }
  const NT_STARTS = ['오늘 급식은', '내일 시험은', '나는', '게임을 하다가', '선생님이', '동아리에서'];

  /* log ruler: our lab vs DeepSeek-V3 (14.8조 토큰, 6,710억 파라미터) */
  function ntRuler() {
    const W = 432, x = (v) => 12 + ((Math.log10(v) - 2) / 12) * (W - 24);
    const rows = [
      { y: 70, lab: '학습 데이터', a: NT.words, at: `${NT.words}어절`, b: 1.48e13, bt: '14.8조 토큰' },
      { y: 154, lab: '가중치 (외운 숫자)', a: NT.entries, at: `${NT.entries.toLocaleString('ko-KR')}개`, b: 6.71e11, bt: '6,710억 개' },
    ];
    const T = (x, y, txt, st, anchor) => `<text x="${x.toFixed(1)}" y="${y}"${anchor ? ` text-anchor="${anchor}"` : ''} style="font-size:20px;${st || ''}">${txt}</text>`;
    let s = `<svg class="chart nt-rul" viewBox="0 0 ${W} 244" width="${W}" height="244" style="font-family:var(--font-body)">`;
    s += `<circle cx="8" cy="10" r="6" style="fill:var(--paper);stroke:var(--ink);stroke-width:3"/>` + T(20, 17, '이 실험실', 'fill:var(--ink)');
    s += `<circle cx="132" cy="10" r="8" style="fill:var(--pen)"/>` + T(146, 17, '큰 모델 예: DeepSeek-V3', 'fill:var(--pen);font-weight:600');
    rows.forEach((r) => {
      s += T(0, r.y - 18, r.lab, 'fill:var(--ink);font-weight:600') + T(W, r.y - 18, `약 ${korNum(r.b / r.a)} 배`, 'fill:var(--ink)', 'end');
      s += `<line x1="${x(r.a)}" y1="${r.y}" x2="${x(r.b)}" y2="${r.y}" style="stroke:var(--ink-3);stroke-width:2.5;stroke-dasharray:5 6"/>`;
      s += `<circle cx="${x(r.a)}" cy="${r.y}" r="7" style="fill:var(--paper);stroke:var(--ink);stroke-width:3"/>`;
      s += `<circle cx="${x(r.b)}" cy="${r.y}" r="10" style="fill:var(--pen)"/>`;
      s += T(Math.max(0, x(r.a) - 8), r.y + 30, r.at, 'fill:var(--ink-2)');
      s += T(Math.min(W, x(r.b) + 10), r.y + 30, r.bt, 'fill:var(--pen);font-weight:600', 'end');
    });
    s += `<line class="ax" x1="12" y1="214" x2="${W - 12}" y2="214"/>`;
    for (let k = 2; k <= 14; k++) s += `<line class="ax" x1="${x(10 ** k)}" y1="208" x2="${x(10 ** k)}" y2="220"/>`;
    [[2, '100'], [6, '100만'], [10, '100억'], [14, '100조']].forEach(([k, t]) => {
      s += T(x(10 ** k), 242, t, '', k === 2 ? 'start' : k === 14 ? 'end' : 'middle');
    });
    return s + '</svg>';
  }

  /* ═════════════ 5. embedding ═════════════ */
  const EMB = [
    ['사과', 110, 100], ['바나나', 225, 72], ['포도', 92, 196], ['딸기', 205, 172], ['수박', 300, 128],
    ['강아지', 120, 450], ['고양이', 232, 482], ['토끼', 330, 440], ['호랑이', 112, 560], ['사자', 240, 575],
    ['한국', 520, 95], ['서울', 700, 65], ['일본', 540, 185], ['도쿄', 724, 152], ['프랑스', 500, 275], ['파리', 680, 245],
    ['남자', 500, 420], ['여자', 570, 520], ['왕', 680, 390], ['여왕', 756, 486], ['의사', 812, 432], ['개발자', 760, 548], ['선생님', 640, 585],
  ];
  const EMB_POS = {};
  EMB.forEach(([w, x, y]) => (EMB_POS[w] = [x, y]));
  const EMB_CLU = [
    ['과일', 195, 135, 150, 100, 330, 30],
    ['동물', 225, 505, 160, 108, 30, 398],
    ['나라 · 수도', 612, 168, 175, 150, 800, 300],
    ['사람 · 직업', 686, 482, 226, 138, 420, 352],
  ];
  const EMB_EX = [
    { a: '왕', b: '남자', c: '여자' },
    { a: '서울', b: '한국', c: '일본' },
    { a: '파리', b: '프랑스', c: '한국', labL: true }, // 화살표 이름표를 왼쪽에 (오른쪽은 '일본'과 겹침)
  ];
  const coordTxt = (w) => {
    const [x, y] = EMB_POS[w];
    const f = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
    return `[${f((x / 920) * 2 - 1)}, ${f(1 - (y / 640) * 2)}]`;
  };

  /* ═════════════ 6. attention ═════════════ */
  const AT_WORDS = (v) => ['그', '동물은', '길을', '건너지', '않았다.', '왜냐하면', '그것은', '너무', v === 'tired' ? '피곤했기' : '넓었기', '때문이다.'];
  const AT_SPEC = (v) => {
    const t = v === 'tired';
    return [
      { 1: 0.55, 0: 0.2, 3: 0.06 },
      { 0: 0.3, 1: 0.25, 3: 0.2, 4: 0.1 },
      { 3: 0.45, 1: 0.2, 2: 0.2 },
      { 2: 0.4, 1: 0.25, 4: 0.2, 3: 0.08 },
      { 3: 0.45, 1: 0.2, 2: 0.12, 4: 0.1 },
      { 4: 0.35, 9: 0.35, 5: 0.1 },
      t ? { 1: 0.62, 2: 0.07, 8: 0.11, 6: 0.06 } : { 2: 0.62, 1: 0.07, 8: 0.11, 6: 0.06 },
      { 8: 0.6, 6: 0.15, 7: 0.1 },
      t ? { 6: 0.34, 1: 0.3, 7: 0.18, 8: 0.08 } : { 6: 0.3, 2: 0.34, 7: 0.18, 8: 0.08 },
      { 5: 0.5, 8: 0.2, 4: 0.1, 9: 0.06 },
    ];
  };
  function atMatrix(v) {
    return AT_SPEC(v).map((spec) => {
      let s = 0;
      const free = [];
      for (let j = 0; j < 10; j++) { if (j in spec) s += spec[j]; else free.push(j); }
      const rest = Math.max(0, 1 - s) / (free.length || 1);
      return Array.from({ length: 10 }, (_, j) => (j in spec ? spec[j] : rest));
    });
  }

  /* ═════════════ 7. training-stages ═════════════ */
  const TS_PAIRS = [
    { q: '숙제 도와줘', a: [{ t: '숙제는 스스로 하는 거야.', k: 2 }, { t: '좋아! 어떤 과목이야? 문제를 보여 주면 풀이 순서를 같이 볼게.', k: 0 }] },
    { q: '파이썬에서 리스트 길이는 어떻게 구해?', a: [{ t: 'len()을 써. 예: len([1, 2, 3]) → 3', k: 0 }, { t: 'size()를 쓰면 돼. 파이썬은 원래 뱀 이름에서 왔어.', k: 3 }] },
    { q: '성일정보고 1987년 로봇대회 우승자는?', a: [{ t: '김민수 학생이 우승했어요.', k: 3 }, { t: '확인할 자료가 없어서 몰라. 학교 기록을 같이 찾아보자.', k: 1 }] },
    { q: '시험 공부 계획 짜 줘', a: [{ t: '시험이 며칠 남았고 과목이 뭐야? 하루 단위 계획표로 만들어 볼게.', k: 0 }, { t: '열심히 하면 돼.', k: 2 }] },
  ];
  const TS_TRAITS = [['구체적 · 친절', 1], ['모르면 모른다', 1], ['무성의', -1], ['지어냄', -1]];
  const TS_ANS = {
    1: { a: '숙제 도와줘 ㅠㅠ 내일까지인데 하나도 못 함<br><span class="dim">└ 댓글 2: 나도 ㅋㅋ 같이 망하자</span><br>숙제 도와주는 앱 추천 TOP 5 <span class="dim">(조회 1,204)</span>', n: '→ 대답이 아니라, 인터넷 글을 그럴듯하게 이어 쓴다' },
    3: { a: '좋아! 어떤 과목 숙제야?<br>문제를 보여 주면, 답만 알려 주기보다<br>풀이 순서를 <span class="hi">같이 짚어 볼게.</span>', n: '→ 질문에 ‘대답’을 한다. 대신 해 주지 않는 것까지 배운 결과' },
  };

  /* ═════════════ 8. hallucination ═════════════ */
  const HS = [
    { w: '1987년', c: [['1987년', 0.58], ['죄송하지만', 0.24], ['그런', 0.18]] },
    { w: '전국', c: [['전국', 0.71], ['대회', 0.17], ['로봇', 0.12]] },
    { w: '로봇대회', c: [['로봇대회', 0.8], ['대회', 0.12], ['과학', 0.08]] },
    { w: '우승자는', c: [['우승자는', 0.77], ['대상은', 0.15], ['결과는', 0.08]] },
    { w: '3학년', c: [['3학년', 0.41], ['2학년', 0.33], ['성일정보고', 0.26]], fake: true },
    { w: '김민수', c: [['김민수', 0.36], ['이준호', 0.33], ['박지훈', 0.31]], fake: true },
    { w: '학생으로,', c: [['학생으로,', 0.66], ['학생이며', 0.22], ['군으로', 0.12]] },
    { w: '자율주행', c: [['자율주행', 0.39], ['라인트레이서', 0.35], ['축구', 0.26]], fake: true },
    { w: '로봇', c: [['로봇', 0.74], ['자동차', 0.18], ['기술로', 0.08]] },
    { w: '‘성일-1호’로', c: [['‘성일-1호’로', 0.44], ['‘미래-1호’로', 0.31], ['직접', 0.25]], fake: true },
    { w: '대상을', c: [['대상을', 0.57], ['금상을', 0.29], ['1등을', 0.14]], fake: true },
    { w: '받았습니다.', c: [['받았습니다.', 0.78], ['수상했습니다.', 0.15], ['받았다고', 0.07]] },
  ];
  const HL_CHECK = ['출처를 달라고 한다', '원문을 직접 열어 본다', '숫자는 다시 계산한다', '모르면 ‘모른다’고 하는지 본다'];

  /* ═════════════════════════════ frames ═════════════════════════════ */
  Deck.part('llm', 1, [
    /* ───────── 1 ───────── */
    {
      id: 'recap-2',
      title: '1교시 한 줄 요약 → 2017',
      minutes: 0.5,
      notes: '1교시를 한 줄로 되짚습니다: 1943 인공 뉴런 → 1986 역전파 → 2012 데이터와 GPU(AlexNet) → 2016 알파고.\n→ 를 누르면 마지막 물음표 자리에 2017년 ‘트랜스포머’가 찍힙니다. 한 번 더 → 를 누르면 “재료 + 엔진 + ?” 메모가 나옵니다.\nQ2 “왜 하필 지금?”의 절반의 답: 재료(데이터·GPU)는 2012년에, 엔진(트랜스포머)은 2017년에 준비됐다. 물음표는 다음 정류장 ‘폭발’에서 채웁니다.\n질문: “알파고는 바둑은 잘 뒀지만 말을 못 했죠. 말하는 AI에는 무엇이 더 필요했을까요?”',
      html: `
<style>
  #f-recap-2 .stage { word-break:keep-all; }
  #f-recap-2 .rc-node, #f-recap-2 .tf, #f-recap-2 .qm { top:0; width:320px; height:900px; pointer-events:none; }
  #f-recap-2 .rc-ph { position:absolute; left:0; right:0; bottom:${900 - LY + 36}px; display:flex; justify-content:center; }
  #f-recap-2 .rc-lab { position:absolute; left:0; right:0; top:${LY + 30}px; text-align:center; }
  #f-recap-2 .rc-yr { font-family:var(--font-mono); font-weight:600; font-size:54px; line-height:1; letter-spacing:-0.03em; }
  #f-recap-2 .rc-nm { font-size:31px; font-weight:700; margin-top:10px; line-height:1.2; }
  #f-recap-2 .rc-sub { font-size:22px; color:var(--ink-2); line-height:1.35; }
  #f-recap-2 svg.tl { position:absolute; left:0; top:0; width:1600px; height:900px; overflow:visible; pointer-events:none; }
  #f-recap-2 .tl .ln { fill:none; stroke:var(--ink); stroke-width:4.5; stroke-linecap:round; }
  #f-recap-2 .tl .fut { fill:none; stroke:var(--ink-3); stroke-width:4; stroke-linecap:round; stroke-dasharray:3 13; }
  #f-recap-2 .tl .tip { fill:none; stroke:var(--ink-3); stroke-width:4; stroke-linecap:round; stroke-linejoin:round; }
  #f-recap-2 .tl .dot { fill:var(--paper); stroke:var(--ink); stroke-width:4.5; }
  #f-recap-2 .tl .dot.hot { fill:var(--hl); }
  #f-recap-2 .tl .ext { fill:none; stroke:var(--ink); stroke-width:4.5; stroke-linecap:round; stroke-dasharray:1 1; stroke-dashoffset:0; transition:stroke-dashoffset .8s ease; }
  #f-recap-2.current .tl .ext.pending { opacity:1; transform:none; stroke-dashoffset:1; transition:none; }
  #f-recap-2 .tl .arc { fill:none; stroke:var(--pen); stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round; }
  #f-recap-2 .tf-card { position:absolute; left:10px; right:10px; top:258px; height:240px; padding:18px 16px; background:var(--paper); border:4px solid var(--ink); border-radius:18px 6px 16px 5px / 6px 16px 5px 18px; transform:rotate(-3deg); display:flex; flex-direction:column; justify-content:center; align-items:center; gap:10px; text-align:center; box-shadow:var(--shadow); transition:transform .6s cubic-bezier(.2,1.5,.4,1); }
  #f-recap-2.current .tf.pending .tf-card { transform:scale(1.6) rotate(-14deg); }
  #f-recap-2 .qm { transition:opacity .35s ease, transform .35s ease; }
  #f-recap-2 .tf:not(.pending) ~ .qm { opacity:0; transform:scale(.7) rotate(-10deg); }
  #f-recap-2 .qm-c { position:absolute; left:50%; top:282px; width:200px; height:200px; margin-left:-100px; border:4px dashed var(--ink-3); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:150px; color:var(--ink-3); line-height:1; }
</style>
<div class="kicker">2교시 시작 · 1교시 되짚기</div>
<h2 class="title">여기까지 약 75년, 한 줄로</h2>
<svg class="tl" viewBox="0 0 1600 900" aria-hidden="true">
  <path class="ln" d="${Kit.sketchPath([[52, LY + 2], [420, LY - 2], [820, LY + 2], [1222, LY]], { wobble: 2, seed: 11 })}"/>
  <path class="fut" d="M1222,${LY} H1530"/>
  <path class="tip" d="M1514,${LY - 13} L1536,${LY} L1514,${LY + 13}"/>
  <path class="ext" data-step="1" pathLength="1" d="M1222,${LY} L1360,${LY}"/>
  ${RECAP.map((n) => `<circle class="dot" cx="${n.x}" cy="${LY}" r="11"/>`).join('')}
  <circle class="dot hot" data-step="1" cx="1360" cy="${LY}" r="14"/>
</svg>
${recapNodes}
<div class="abs tf" data-step="1" style="left:1200px">
  <div class="tf-card">
    <div class="mono" style="font-size:20px;color:var(--ink-2);line-height:1.3">Attention Is<br>All You Need</div>
    <div class="display" style="font-size:52px;font-weight:800;line-height:1.1"><span class="mark">트랜스포머</span></div>
    <div class="mono" style="font-size:22px">구글 연구원 8명</div>
  </div>
  <div class="rc-lab"><div class="rc-yr" style="color:var(--pen)">2017</div><div class="rc-nm">트랜스포머</div><div class="rc-sub">말하는 AI의 엔진</div></div>
</div>
<div class="abs qm" style="left:1200px">
  <div class="qm-c">?</div>
  <div class="rc-lab"><div class="rc-yr faint">20??</div><div class="hand" style="font-size:40px;margin-top:8px">다음 장면은?</div></div>
</div>
<div class="abs sticky" style="right:92px;top:40px;width:300px;--tilt:2deg;font-size:42px;padding:18px 24px 22px"><span class="mono" style="font-size:22px">Q2</span><br>왜 하필 <u>지금</u><br>폭발했을까?</div>
<div class="abs" data-step="2" style="left:0;top:0;width:1600px;height:900px;pointer-events:none">
  <svg class="tl" viewBox="0 0 1600 900" aria-hidden="true"><path class="arc" d="M770,742 Q1065,800 1356,742"/><path class="arc" d="M1334,734 L1358,742 L1340,760"/></svg>
  <div class="abs hand" style="left:615px;width:900px;top:784px;text-align:center;font-size:44px">재료(데이터·GPU) + 엔진(트랜스포머) + ? = 지금의 AI</div>
</div>
<div class="src">출처: McCulloch·Pitts(1943) · Rumelhart 외, Nature(1986) · AlexNet, NeurIPS 2012 · DeepMind AlphaGo(2016) · Vaswani 외, arXiv 1706.03762(2017)</div>`,
    },

    /* ───────── 2 ───────── */
    {
      id: 'transformer',
      title: '2017 · Attention Is All You Need',
      minutes: 1,
      notes: '2017년 6월, 구글 연구원 8명이 쓴 논문 한 편이 오늘날 모든 챗봇의 엔진이 됐습니다. 제목은 비틀스 ‘All You Need Is Love’를 비튼 것이고, 8명 모두 동등 기여라서 저자 순서는 무작위로 정했습니다.\n→ 를 누르면 8명이 이후 어디로 갔는지 선이 퍼집니다(2023년 4월 정리에 그 뒤 이동 두 건을 반영). 8명 모두 구글을 떠났고, 카이저는 OpenAI로 갔습니다. 샤지어는 Character.AI를 차렸다가 2024년에 구글로 돌아왔고, 파르마르는 Adept·Essential AI를 거쳐 Anthropic에 합류했습니다(2025년 2월 보도).\n한 번 더 → : ChatGPT의 GPT에서 T가 바로 이 Transformer입니다.\n질문: “발명은 구글이 했는데, 왜 ChatGPT는 OpenAI가 먼저 내놓았을까요?” (답은 ‘사람과 회사’ 정류장에서)',
      html: `
<style>
  #f-transformer .stage { word-break:keep-all; }
  #f-transformer .paper { position:absolute; left:${TP.L}px; top:${TP.T}px; width:${TP.W}px; height:${TP.H}px; background:var(--paper); border:2px solid var(--ink-3); box-shadow:var(--shadow); transform:rotate(${TP.rot}deg); }
  #f-transformer .paper::before { content:""; position:absolute; top:-16px; left:50%; width:38%; height:32px; transform:translateX(-50%) rotate(2deg); background:var(--tape); }
  #f-transformer .pp { position:absolute; left:30px; right:30px; }
  #f-transformer .pp.hd { top:20px; display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:20px; color:var(--ink-3); }
  #f-transformer .pp.tt { top:52px; text-align:center; font-family:var(--font-display); font-weight:800; font-size:48px; line-height:1.06; letter-spacing:-0.01em; }
  #f-transformer .pp.af { top:156px; text-align:center; font-size:21px; color:var(--ink-2); }
  #f-transformer .au { position:absolute; left:44px; right:22px; height:${ROWH}px; display:flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:25px; }
  #f-transformer .au i { flex:1; border-bottom:3px dotted var(--ink-3); transform:translateY(5px); margin-right:16px; }
  #f-transformer .pp.fn { top:${ROW0 + 8 * ROWH + 10}px; font-size:21px; color:var(--ink-2); }
  #f-transformer .pp.st { top:${ROW0 + 8 * ROWH + 42}px; font-family:var(--font-mono); font-size:20px; color:var(--ink-2); }
  #f-transformer svg.tr-svg { position:absolute; left:0; top:0; width:1600px; height:900px; overflow:visible; pointer-events:none; }
  #f-transformer .tr-svg .sd { fill:var(--ink); }
  #f-transformer .tr-svg .l { fill:none; stroke:var(--ink-2); stroke-width:2.8; stroke-linecap:round; stroke-dasharray:1 1; stroke-dashoffset:0; transition:stroke-dashoffset 1.1s ease; }
  #f-transformer .tr-svg .l.hot { stroke:var(--pen); stroke-width:5.5; }
  #f-transformer .tr-svg .ah { fill:none; stroke:var(--ink-2); stroke-width:2.8; stroke-linecap:round; stroke-linejoin:round; }
  #f-transformer .tr-svg .ah.hot { stroke:var(--pen); stroke-width:5; }
  #f-transformer.current .tr-svg .flow.pending { opacity:1; transform:none; }
  #f-transformer.current .tr-svg .flow.pending .l { stroke-dashoffset:1; transition:none; }
  @media (prefers-reduced-motion: no-preference) { #f-transformer.current .tr-svg .ahs:not(.pending) { transition:opacity .4s ease 1.1s, transform .4s ease 1.1s; } }
  #f-transformer .tr-d { position:absolute; line-height:1.15; white-space:nowrap; }
  #f-transformer .tr-d b { display:block; font-family:var(--font-display); font-weight:800; font-size:34px; }
  #f-transformer .tr-d span { font-size:21px; color:var(--ink-2); }
</style>
<div class="kicker">2017.6.12 · arXiv · 구글</div>
<h2 class="title">8명이 쓴 논문 한 편</h2>
<div class="paper" aria-label="논문 첫 장">
  <div class="pp hd"><span>arXiv 1706.03762</span><span>NeurIPS 2017</span></div>
  <div class="pp tt">Attention Is All<br>You Need</div>
  <div class="pp af">제목은 비틀스 ‘All You Need Is Love’ 패러디</div>
  ${AUTH.map((a, i) => `<div class="au" style="top:${ROW0 + i * ROWH}px"><span>${a}*</span><i></i></div>`).join('')}
  <div class="pp fn">* 8명 모두 동등 기여 → 저자 순서는 무작위</div>
  <div class="pp st">GPU 8장 × 3.5일 학습 · 인용 15만 회+</div>
</div>
<svg class="tr-svg" viewBox="0 0 1600 900" aria-hidden="true">
  <g class="flow" data-step="1">${flows.map((f) => `<path class="l${f.hot ? ' hot' : ''}" pathLength="1" style="transition-delay:${f.n * 90}ms" d="${f.d}"/>`).join('')}</g>
  <g class="ahs" data-step="1">${flows.map((f) => `<path class="ah${f.hot ? ' hot' : ''}" d="M${f.ex - 15},${f.ey - 10} L${f.ex},${f.ey} L${f.ex - 15},${f.ey + 10}"/>`).join('')}</g>
  ${startPts.map(([x, y]) => `<circle class="sd" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/>`).join('')}
</svg>
<div class="abs" data-step="1" style="left:0;top:0">
  <div class="abs mono" style="left:704px;top:222px;font-size:22px;color:var(--ink-2);white-space:nowrap">이후 8명 모두 구글을 떠났다 →</div>
  ${DESTS.map((d, k) => `<div class="tr-d" style="left:${DX}px;top:${DY(k) - 30}px"><b>${d.hot ? `<span class="mark" style="font-size:inherit;color:inherit">${d.name}</span>` : d.name}</b><span>${d.who}</span></div>`).join('')}
</div>
<div class="abs hand" data-step="2" style="left:1268px;top:${DY(DESTS.findIndex((d) => d.hot)) - 36}px;font-size:38px;white-space:nowrap">← ChatGPT를 만든 회사</div>
<div class="abs" data-step="2" style="right:92px;top:30px;text-align:right">
  <div class="display" style="font-size:88px;font-weight:800;line-height:1;letter-spacing:.08em">GP<span class="mark">T</span></div>
  <div class="mono" style="font-size:22px;margin-top:8px">Generative Pre-trained <b style="color:var(--pen)">Transformer</b></div>
  <div style="font-size:20px;color:var(--ink-2)">생성하는 · 미리 학습한 · <b style="color:var(--pen)">트랜스포머</b></div>
  <div style="font-size:24px;margin-top:2px">발명은 구글, ChatGPT는 OpenAI</div>
</div>
<div class="src">출처: arXiv 1706.03762 · Wikipedia ‘Attention Is All You Need’·‘Noam Shazeer’ · NVIDIA GTC 2024 · CB Insights(2023.4) · Fortune 2025.2.13(Parmar)</div>`,
    },

    /* ───────── 3 ───────── */
    {
      id: 'tokens',
      title: '토큰: AI가 글을 읽는 단위',
      minutes: 0.75,
      notes: 'AI는 글자를 하나씩 읽지 않고, 자주 나오는 조각(토큰) 단위로 잘라서 숫자로 바꿔 읽습니다. 아래 검은 칸의 숫자 목록이 실제로 모델에 들어가는 것입니다.\n예시 버튼 3개를 차례로 눌러 봅니다. 영어 문장은 글자가 많아도 토큰이 적고, 한국어와 줄임말은 글자에 비해 토큰이 많이 나오는 편입니다. 학생에게 입력칸에 자기 이름이나 아무 문장을 쳐 보게 하세요.\n토큰은 돈의 단위이기도 합니다: AI 회사는 토큰 수로 요금을 받습니다.\n(주의) 이 데모는 실제 토크나이저가 아니라 규칙으로 흉내 낸 것입니다.\n질문: “같은 뜻이면 한국어가 더 비쌀 수도 있겠네요? 왜 그럴까요?”',
      html: `
<style>
  #f-tokens .stage { word-break:keep-all; }
  #f-tokens .tk-grid { flex:1; min-height:0; display:grid; grid-template-columns:1fr 360px; grid-template-rows:minmax(0, 1fr); gap:48px; }
  #f-tokens .tk-in { width:100%; font-size:34px; padding:12px 18px; }
  #f-tokens .tk-chips { flex:0 1 auto; min-height:0; overflow:hidden; display:flex; flex-wrap:wrap; gap:14px 6px; align-content:flex-start; }
  #f-tokens .tk-chips.dense { gap:10px 5px; }
  #f-tokens .tk-chips.dense .tok { font-size:29px; padding:3px 7px 2px; }
  #f-tokens .tk-chips.denser .tok .id { display:none; }
  #f-tokens .tk-more { align-self:center; font-family:var(--font-mono); font-size:22px; color:var(--ink-2); padding:0 6px; }
  #f-tokens .tok { display:inline-flex; flex-direction:column; align-items:center; font-size:36px; line-height:1.25; padding:4px 9px 3px; border-radius:7px 3px 8px 3px; background:color-mix(in srgb, var(--k) 18%, transparent); border-bottom:5px solid var(--k); white-space:pre; color:var(--ink); }
  #f-tokens .tok i { font-style:normal; color:var(--ink-3); font-size:.6em; margin-right:3px; }
  #f-tokens .tok .id { font-family:var(--font-mono); font-size:20px; line-height:1.2; color:var(--ink-2); margin-top:2px; }
  #f-tokens .tk-ids { font-size:22px; line-height:1.45; min-height:106px; box-shadow:0 0 0 2px var(--paper-3); }
  #f-tokens .stat b.tk-n { font-size:132px; }
</style>
<div class="kicker">실습 · 토크나이저</div>
<h2 class="title">AI는 글자가 아니라 <span class="mark">토큰</span>을 본다</h2>
<div class="demo tk-grid">
  <div class="stack" style="gap:18px;min-width:0;min-height:0">
    <input type="text" class="tk-in" maxlength="60" spellcheck="false" autocomplete="off" aria-label="토큰으로 나눠 볼 문장">
    <div class="btns tk-ex"><span class="mono muted" style="align-self:center;font-size:22px;margin-right:4px">예시</span><button class="btn sm" data-i="0">한국어</button><button class="btn sm" data-i="1">English</button><button class="btn sm" data-i="2">줄임말</button><span class="faint" style="align-self:center;margin-left:auto;font-size:20px">␣ = 띄어쓰기도 토큰에 붙는다 · 칩 아래 숫자 = 토큰 번호</span></div>
    <div class="tk-chips" aria-live="polite"></div>
    <div class="term tk-ids"></div>
    <div class="faint" style="font-size:20px">※ 간단한 규칙으로 실제 토크나이저의 ‘느낌’만 흉내 낸 데모입니다. 실제 토큰 수는 모델마다 다릅니다.</div>
  </div>
  <div class="stack" style="gap:22px">
    <div class="stat"><b class="tk-n">0</b><span>토큰</span></div>
    <div class="stat"><b class="tk-c" style="font-size:64px;color:var(--ink-2)">0</b><span>글자 (띄어쓰기 포함)</span></div>
    <div class="box" style="padding:18px 22px">
      <div class="mono" style="font-size:20px;color:var(--ink-2);margin-bottom:6px">토큰 = 돈의 단위</div>
      <div style="font-size:24px;line-height:1.4">Claude Opus 5.5 입력 요금<br><b>100만 토큰당 4달러</b></div>
      <div style="font-size:24px;line-height:1.4;margin-top:12px">이 문장을 100만 명이 보내면<br>→ <b class="tk-usd mark" style="font-size:36px">0달러</b></div>
    </div>
  </div>
</div>
<div class="src">출처: 요금 — Anthropic ‘Claude Opus 5.5’ 발표(2026-09-22, 입력 100만 토큰당 4달러). 토큰 분할과 번호는 설명용 흉내(실제 토크나이저 아님)</div>`,
      init(el, K, f) {
        const input = el.querySelector('.tk-in'), chips = el.querySelector('.tk-chips'), ids = el.querySelector('.tk-ids');
        const nEl = el.querySelector('.tk-n'), cEl = el.querySelector('.tk-c'), usd = el.querySelector('.tk-usd');
        /* 두 줄로 넘어가거나 넘치면: 칩을 작게 → 번호 숨김 → 그래도 넘치면 뒤쪽을 '… +N'으로 접기 (아래 칸과 출처 줄을 밀어내지 않게) */
        const over = () => chips.scrollHeight > chips.clientHeight + 2;
        const wraps = () => { const c = chips.children; return c.length > 1 && c[c.length - 1].offsetTop > c[0].offsetTop + 4; };
        function fit() {
          chips.classList.remove('dense', 'denser');
          if (!chips.clientHeight) return;
          if (over() || wraps()) chips.classList.add('dense');
          if (over()) chips.classList.add('denser');
          if (!over()) return;
          chips.insertAdjacentHTML('beforeend', '<span class="tk-more">… +0</span>');
          const more = chips.lastElementChild;
          let hidden = 0;
          while (over() && chips.children.length > 2) { more.previousElementSibling.remove(); more.textContent = `… +${++hidden}`; }
        }
        const render = () => {
          const text = input.value;
          const toks = tokenize(text);
          chips.innerHTML = toks.length
            ? toks.map((t, i) => `<span class="tok" style="--k:var(--${TK_COLS[i % TK_COLS.length]})"><span>${t.sp ? '<i>␣</i>' : ''}${esc(t.t)}</span><span class="id">${tokId(t)}</span></span>`).join('')
            : '<span class="faint" style="font-size:28px">위 칸에 아무 문장이나 써 보세요</span>';
          fit();
          const list = toks.slice(0, 18).map(tokId).join(', ');
          ids.innerHTML = `<span class="dim">AI가 실제로 받는 것:</span><br>[${list}${toks.length > 18 ? ', …' : ''}]`;
          nEl.textContent = toks.length;
          cEl.textContent = [...text].length;
          usd.textContent = (toks.length * 4).toLocaleString('ko-KR') + '달러';
          el.querySelectorAll('.tk-ex .btn').forEach((b) => b.classList.toggle('on', TK_EX[+b.dataset.i] === text));
        };
        input.value = TK_EX[0];
        input.addEventListener('input', render);
        el.querySelector('.tk-ex').addEventListener('click', (e) => {
          const b = e.target.closest('[data-i]');
          if (!b) return;
          input.value = TK_EX[+b.dataset.i];
          render();
        });
        render();
        f._fit = render;
        /* 웹 글꼴은 글자 묶음별로 늦게 도착할 수 있음 → 도착하면 칩 줄바꿈을 다시 맞춤 */
        if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => render());
      },
      enter(el, K, f) { if (f._fit) f._fit(); },
    },

    /* ───────── 4 ───────── */
    {
      id: 'next-token',
      title: '다음 단어 맞히기 실험실',
      minutes: 1.25,
      notes: `첫 화면의 ‘어쩌다 ___’, 쉬는 시간 화면의 힌트가 바로 이 실험실입니다. AI 0.61, 개발자 0.22… 그 숫자가 이렇게 만들어집니다.\n이 화면의 작은 언어 모델은 방금 이 브라우저 안에서 학교·급식·시험·코딩·게임 문장 ${NT.sentences}개를 읽고 “앞의 두 단어 다음에 무엇이 몇 번 왔나”를 세어 만든 것입니다.\n시작 문장을 고르고 [한 단어]를 몇 번 누른 뒤 [자동 생성]을 보여 줍니다. 막대를 직접 클릭해서 단어를 골라도 됩니다.\n온도 슬라이더를 0.1로 내리면 막대가 한 개로 뾰족해지고(늘 같은 문장), 2.0으로 올리면 평평해집니다(엉뚱한 문장).\nChatGPT도 원리는 같습니다. 다만 수조 개 토큰을 읽고, 수천억~조 개 가중치로 훨씬 긴 앞부분 전체를 봅니다.\n질문: “온도를 높이면 창의적일까요, 아니면 그냥 엉뚱할까요?”`,
      html: `
<style>
  #f-next-token .stage { word-break:keep-all; }
  #f-next-token .nt-grid { flex:1; min-height:0; display:grid; grid-template-columns:1fr 432px; gap:52px; }
  #f-next-token .nt-sent { min-height:128px; font-size:46px; line-height:1.3; font-weight:600; padding:20px 28px; display:flex; flex-wrap:wrap; align-content:center; gap:0 .32em; }
  #f-next-token .nt-sent.long { font-size:38px; }
  #f-next-token .nt-sent .gen { color:var(--pen); }
  #f-next-token .nt-sent .end { color:var(--ink-3); font-family:var(--font-mono); font-size:24px; font-weight:400; align-self:center; }
  #f-next-token .nt-ctx { display:flex; align-items:center; gap:10px; font-size:24px; color:var(--ink-2); min-height:44px; }
  #f-next-token .nt-ctx .chip { cursor:default; font-family:var(--font-body); font-size:24px; border-color:var(--pen); color:var(--pen); }
  #f-next-token .nt-row { display:grid; grid-template-columns:240px 1fr 96px; align-items:center; gap:16px; height:50px; cursor:pointer; border-radius:6px; padding:0 8px; }
  #f-next-token .nt-row:hover { background:var(--pen-soft); }
  #f-next-token .nt-row .w { font-size:30px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #f-next-token .nt-row .tr { height:30px; background:var(--paper-2); position:relative; }
  #f-next-token .nt-row .fl { position:absolute; left:0; top:0; bottom:0; width:0; background:var(--ink); transition:width .35s ease; }
  #f-next-token .nt-row.pick { background:var(--hl-soft); }
  #f-next-token .nt-row.pick .fl { background:var(--pen); }
  #f-next-token .nt-row .p { font-family:var(--font-mono); font-size:26px; text-align:right; font-variant-numeric:tabular-nums; }
  #f-next-token .nt-row.other { cursor:default; color:var(--ink-3); }
  #f-next-token .nt-row.other .w { font-weight:400; font-size:24px; }
  #f-next-token .nt-row.other .fl { background:var(--ink-3); }
  #f-next-token .nt-row.other:hover { background:none; }
  #f-next-token .nt-row.empty { visibility:hidden; }
  #f-next-token .nt-bars.done .nt-row:not(.pick) { opacity:.45; }
  #f-next-token .nt-starts .chip { font-family:var(--font-body); font-size:22px; }
  #f-next-token .lab { font-family:var(--font-mono); font-size:20px; color:var(--ink-2); margin-bottom:8px; }
  #f-next-token .nt-scale { font-size:20px; color:var(--ink-2); display:flex; justify-content:space-between; margin-top:-4px; }
</style>
<div class="kicker">실험실 · 이 브라우저 안에서 방금 학습한 작은 언어 모델</div>
<h2 class="title">다음 단어 맞히기</h2>
<div class="demo nt-grid">
  <div class="stack" style="gap:14px;min-width:0">
    <div class="box nt-sent" aria-live="polite"></div>
    <div class="nt-ctx"></div>
    <div class="nt-bars stack" style="gap:2px"></div>
    <div class="hand" style="font-size:40px;margin-top:auto">ChatGPT = 이걸 수조 개 토큰, 수천억~조 개 가중치로 한 것</div>
  </div>
  <div class="stack" style="gap:20px;min-width:0">
    <div><div class="lab">시작 문장</div><div class="btns nt-starts" style="gap:8px 8px">${NT_STARTS.map((s, i) => `<button class="chip${i === 0 ? ' on' : ''}" data-i="${i}">${s}</button>`).join('')}</div></div>
    <div class="btns"><button class="btn nt-one">한 단어</button><button class="btn nt-auto">자동 생성</button><button class="btn ghost nt-reset">처음부터</button></div>
    <div class="field"><label>온도 (temperature) <output class="nt-tv">1.0</output></label><input type="range" class="nt-t" min="0.1" max="2" step="0.1" value="1" aria-label="온도"><div class="nt-scale"><span>0.1 뾰족 · 늘 같은 답</span><span>2.0 평평 · 엉뚱</span></div></div>
    <div>${ntRuler()}</div>
  </div>
</div>
<div class="src">출처: 말뭉치 ${NT.sentences}문장은 강의용으로 직접 작성(3-gram + 2-gram 확률 모델) · DeepSeek-V3 기술 보고서(arXiv 2412.19437): 사전학습 14.8조 토큰, 파라미터 6,710억 개</div>`,
      init(el, K, f) {
        const sentEl = el.querySelector('.nt-sent'), ctxEl = el.querySelector('.nt-ctx'), bars = el.querySelector('.nt-bars');
        const oneBtn = el.querySelector('.nt-one'), autoBtn = el.querySelector('.nt-auto');
        const tIn = el.querySelector('.nt-t'), tOut = el.querySelector('.nt-tv');
        bars.innerHTML = Array.from({ length: 6 }, (_, i) => `<div class="nt-row${i === 5 ? ' other' : ''}" data-r="${i}"><span class="w"></span><span class="tr"><i class="fl"></i></span><span class="p"></span></div>`).join('');
        const rows = Array.from(bars.children);
        let start = 0, words = [], gen = [], T = 1, auto = false, acc = 0, pend = null, shown = [];
        const ended = () => gen[gen.length - 1] === '</s>';
        const ctx = () => ['<s>', '<s>', ...words, ...gen];
        const dist = () => temper(ntDist(ctx()), T);
        function reset(i) {
          if (i != null) start = i;
          words = NT_STARTS[start].split(' ');
          gen = []; pend = null; auto = false; acc = 0;
          el.querySelectorAll('.nt-starts .chip').forEach((c) => c.classList.toggle('on', +c.dataset.i === start));
          render();
        }
        function renderSentence() {
          const g = gen.filter((w) => w !== '</s>');
          sentEl.classList.toggle('long', words.length + g.length > 7);
          sentEl.innerHTML = words.map((w) => `<span>${esc(w)}</span>`).join('') +
            g.map((w, i) => `<span class="gen">${i === g.length - 1 && !ended() ? `<span class="mark">${esc(w)}</span>` : esc(w)}</span>`).join('') +
            (ended() ? '<span class="end">(문장 끝)</span>' : '');
        }
        function renderBars() {
          if (ended()) {
            ctxEl.innerHTML = '문장 끝! → <b style="color:var(--ink)">[처음부터]</b> 또는 다른 시작 문장';
            bars.classList.add('done');
            return;
          }
          bars.classList.remove('done');
          const c = ctx(), a = c[c.length - 2], b = c[c.length - 1];
          const lab = (w) => `<span class="chip">${w === '<s>' ? '(시작)' : esc(w)}</span>`;
          ctxEl.innerHTML = `모델이 보는 것: ${lab(a)}${lab(b)} → ?`;
          const d = dist();
          shown = d.slice(0, 5);
          const rest = d.slice(5), restP = rest.reduce((s, o) => s + o.p, 0);
          rows.forEach((r, i) => {
            r.classList.remove('pick');
            let w = '', p = 0;
            if (i < 5 && shown[i]) { w = shown[i].w === '</s>' ? '(문장 끝)' : shown[i].w; p = shown[i].p; r.dataset.w = shown[i].w; }
            else if (i === 5 && rest.length) { w = `그 외 ${rest.length}개`; p = restP; r.dataset.w = ''; }
            r.classList.toggle('empty', !w);
            r.querySelector('.w').textContent = w;
            r.querySelector('.fl').style.width = (p * 100).toFixed(1) + '%';
            r.querySelector('.p').textContent = w ? pctTxt(p) : '';
          });
        }
        function updBtns() {
          oneBtn.disabled = ended() || gen.length >= 14;
          autoBtn.classList.toggle('on', auto);
          autoBtn.textContent = auto ? '멈춤' : '자동 생성';
        }
        function render() { renderSentence(); renderBars(); updBtns(); }
        function sample() {
          const d = dist();
          let r = Math.random();
          for (const o of d) { r -= o.p; if (r <= 0) return o.w; }
          return d[d.length - 1].w;
        }
        function choose(w) {
          if (pend || ended() || !w) return;
          pend = { w, t: 0 };
          const idx = shown.findIndex((o) => o.w === w);
          rows[idx >= 0 ? idx : 5].classList.add('pick');
        }
        bars.addEventListener('click', (e) => {
          const r = e.target.closest('.nt-row');
          if (r && !r.classList.contains('other') && !r.classList.contains('empty')) { auto = false; updBtns(); choose(r.dataset.w); }
        });
        oneBtn.addEventListener('click', () => { auto = false; updBtns(); choose(sample()); });
        autoBtn.addEventListener('click', () => {
          if (auto) { auto = false; updBtns(); return; }
          if (ended() || gen.length >= 14) reset();
          auto = true; acc = 0.4; updBtns();
        });
        el.querySelector('.nt-reset').addEventListener('click', () => reset());
        el.querySelector('.nt-starts').addEventListener('click', (e) => { const c = e.target.closest('[data-i]'); if (c) reset(+c.dataset.i); });
        tIn.addEventListener('input', () => {
          T = +tIn.value; tOut.textContent = T.toFixed(1);
          if (!pend) renderBars();
        });
        K.loop(el, (t, dt) => {
          if (pend) {
            pend.t += dt;
            if (pend.t > 0.32) { gen.push(pend.w); pend = null; if (ended()) auto = false; render(); }
            return;
          }
          if (auto) {
            acc += dt;
            if (acc > 0.45) {
              acc = 0;
              if (ended() || gen.length >= 14) { auto = false; updBtns(); } else choose(sample());
            }
          }
        });
        reset(0);
        f._reset = () => reset();
      },
      leave(el, K, f) { if (f._reset) f._reset(); },
    },

    /* ───────── 5 ───────── */
    {
      id: 'embedding',
      title: '단어를 좌표로 (임베딩)',
      minutes: 0.5,
      optional: true,
      notes: 'AI 안에서 단어는 숫자 목록, 즉 좌표입니다. 뜻이 비슷한 단어는 가까이 모입니다(과일끼리, 동물끼리).\n오른쪽 예제 버튼을 누르면 화살표가 그려집니다: “남자→여자” 화살표를 ‘왕’에 그대로 옮기면 ‘여왕’ 근처에 떨어집니다. 단어 점에 마우스를 올리면 그 단어의 좌표가 보입니다.\n이 지도는 설명용으로 직접 그린 2차원 그림이고, 실제 모델은 단어 하나에 숫자 수천 개를 씁니다(GPT-3는 12,288개).\n질문: “‘강아지 − 멍멍 + 야옹’을 하면 어디에 떨어질까요?”',
      html: `
<style>
  #f-embedding .stage { word-break:keep-all; }
  #f-embedding .em-grid { flex:1; min-height:0; display:grid; grid-template-columns:920px 1fr; gap:52px; }
  #f-embedding svg.em-map { width:920px; height:640px; overflow:visible; display:block; }
  #f-embedding .em-map .clu { fill:none; stroke:var(--ink-3); stroke-width:2.2; stroke-dasharray:7 9; }
  #f-embedding .em-map .clab { font-family:var(--font-hand); font-size:36px; fill:var(--pen); }
  #f-embedding .em-map .ax { stroke:var(--ink-3); stroke-width:2.5; fill:none; stroke-linecap:round; stroke-linejoin:round; }
  #f-embedding .em-map .axl { font-family:var(--font-mono); font-size:20px; fill:var(--ink-3); }
  #f-embedding .em-map .wd { cursor:pointer; }
  #f-embedding .em-map .wd circle { fill:var(--ink); }
  #f-embedding .em-map .wd text { font-size:27px; font-weight:600; fill:var(--ink); text-anchor:start; }
  #f-embedding .em-map .wd .hit { fill:transparent; }
  #f-embedding .em-map .wd.on circle.d { fill:var(--pen); }
  #f-embedding .em-map .wd.on text { fill:var(--pen); }
  #f-embedding .em-map .v1 { stroke:var(--pen); stroke-width:4; stroke-dasharray:10 8; fill:none; stroke-linecap:round; }
  #f-embedding .em-map .v2 { stroke:var(--pen); stroke-width:6; fill:none; stroke-linecap:round; }
  #f-embedding .em-map .ahd { fill:var(--pen); }
  #f-embedding .em-map .ring { fill:var(--hl-soft); stroke:var(--ink); stroke-width:3; }
  #f-embedding .em-map .vl { font-family:var(--font-mono); font-size:20px; fill:var(--pen); }
  #f-embedding .em-ex .btn { width:100%; text-align:left; font-size:26px; }
  #f-embedding .em-eq { font-family:var(--font-display); font-weight:800; font-size:48px; line-height:1.2; }
  #f-embedding .em-eq .r { transition:opacity .3s; }
</style>
<div class="kicker">단어 = 숫자 목록 = 좌표</div>
<h2 class="title md" style="margin-bottom:-6px">단어를 좌표로 바꾸면, 뜻을 계산할 수 있다</h2>
<div class="demo em-grid">
  <svg class="em-map" viewBox="0 0 920 640" aria-label="단어 지도"></svg>
  <div class="stack" style="gap:22px;min-width:0">
    <div class="mono" style="font-size:20px;color:var(--ink-2)">예제를 눌러 보세요</div>
    <div class="stack em-ex" style="gap:12px">${EMB_EX.map((x, i) => `<button class="btn" data-i="${i}">${x.a} − ${x.b} + ${x.c}</button>`).join('')}</div>
    <div class="em-eq"></div>
    <div class="box dashed" style="padding:16px 20px">
      <div class="mono" style="font-size:20px;color:var(--ink-2)">마우스를 올린 단어의 좌표</div>
      <div class="em-co mono" style="font-size:30px;font-weight:600"></div>
    </div>
    <div style="font-size:22px;line-height:1.45;color:var(--ink-2)">실제 모델은 단어 하나에 숫자가 <b style="color:var(--ink)">수천 개</b> (GPT-3: 12,288개). 이 지도는 2개만 쓴 설명용 그림.</div>
  </div>
</div>
<div class="src">출처: Mikolov 외(2013, word2vec) “king − man + woman ≈ queen” · Brown 외, GPT-3 논문(arXiv 2005.14165) 표 2.1: 임베딩 크기 12,288 · 지도 좌표는 설명용으로 직접 배치</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.em-map'), eq = el.querySelector('.em-eq'), co = el.querySelector('.em-co');
        const S = (tag, a, p) => K.svg(tag, a, p || svg);
        S('path', { class: 'ax', d: 'M4,8 V636 H912' });
        S('path', { class: 'ax', d: 'M-6,22 L4,6 L14,22 M898,626 L914,636 L898,646' });
        S('text', { class: 'axl', x: 20, y: 22 }).textContent = '숫자 2';
        S('text', { class: 'axl', x: 884, y: 622, 'text-anchor': 'end' }).textContent = '숫자 1';
        EMB_CLU.forEach(([name, cx, cy, rx, ry, lx, ly]) => {
          S('ellipse', { class: 'clu', cx, cy, rx, ry });
          S('text', { class: 'clab', x: lx, y: ly }).textContent = name;
        });
        const gVec = S('g', {});
        const ring = S('ellipse', { class: 'ring', rx: 0, ry: 0, cx: 0, cy: 0 }, gVec);
        const v1 = S('path', { class: 'v1' }, gVec), a1 = S('path', { class: 'ahd' }, gVec);
        const v2 = S('path', { class: 'v2' }, gVec), a2 = S('path', { class: 'ahd' }, gVec);
        const vl = S('text', { class: 'vl' }, gVec);
        const nodes = {};
        EMB.forEach(([w, x, y]) => {
          const g = S('g', { class: 'wd', 'data-w': w });
          S('circle', { class: 'hit', cx: x + 26, cy: y, r: 32 }, g);
          S('circle', { class: 'd', cx: x, cy: y, r: 7 }, g);
          S('text', { x: x + 13, y: y + 9 }, g).textContent = w;
          nodes[w] = g;
        });
        let ex = 0, prog = 1, hover = null, res = '';
        const arrowHead = (path, x1, y1, x2, y2, size) => {
          const L = Math.hypot(x2 - x1, y2 - y1);
          if (L < 4) { path.setAttribute('d', ''); return; }
          const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
          path.setAttribute('d', `M${x2},${y2} L${x2 - ux * size - uy * size * 0.6},${y2 - uy * size + ux * size * 0.6} L${x2 - ux * size + uy * size * 0.6},${y2 - uy * size - ux * size * 0.6}Z`);
        };
        function nearest(x, y, skip) {
          let best = null, bd = Infinity;
          EMB.forEach(([w, wx, wy]) => { if (skip.includes(w)) return; const d = Math.hypot(wx - x, wy - y); if (d < bd) { bd = d; best = w; } });
          return best;
        }
        function draw() {
          const E = EMB_EX[ex], [ax, ay] = EMB_POS[E.a], [bx, by] = EMB_POS[E.b], [cx, cy] = EMB_POS[E.c];
          const vx = cx - bx, vy = cy - by;
          res = nearest(ax + vx, ay + vy, [E.a, E.b, E.c]);
          const p1 = K.ease(K.clamp(prog / 0.35, 0, 1)), p2 = K.ease(K.clamp((prog - 0.35) / 0.4, 0, 1)), p3 = K.easeOut(K.clamp((prog - 0.75) / 0.25, 0, 1));
          const VL = Math.hypot(vx, vy) || 1, ux = vx / VL, uy = vy / VL;
          const e1x = bx + (vx - ux * 11) * p1, e1y = by + (vy - uy * 11) * p1, e2x = ax + (vx - ux * 11) * p2, e2y = ay + (vy - uy * 11) * p2;
          v1.setAttribute('d', p1 > 0 ? `M${bx},${by} L${e1x},${e1y}` : '');
          arrowHead(a1, bx, by, e1x, e1y, 16);
          v2.setAttribute('d', p2 > 0 ? `M${ax},${ay} L${e2x},${e2y}` : '');
          arrowHead(a2, ax, ay, e2x, e2y, 20);
          vl.setAttribute('x', (bx + cx) / 2 + (E.labL ? -16 : 16)); vl.setAttribute('y', (by + cy) / 2 + 2);
          vl.setAttribute('text-anchor', E.labL ? 'end' : 'start');
          vl.textContent = p1 > 0.5 ? `−${E.b} +${E.c}` : '';
          const [rx, ry] = EMB_POS[res];
          const lw = 13 + 27 * res.length;
          ring.setAttribute('cx', rx + lw / 2 - 4); ring.setAttribute('cy', ry); ring.setAttribute('rx', ((lw / 2 + 22) * p3).toFixed(1)); ring.setAttribute('ry', (34 * p3).toFixed(1));
          eq.innerHTML = `${E.a} − ${E.b} + ${E.c}<br><span class="r" style="opacity:${p3.toFixed(2)}">≈ <span class="mark">${res}</span></span>`;
          Object.keys(nodes).forEach((w) => nodes[w].classList.toggle('on', w === hover || (p3 > 0.5 && w === res)));
          co.textContent = `${hover || res} = ${coordTxt(hover || res)}`;
          el.querySelectorAll('.em-ex .btn').forEach((b) => b.classList.toggle('on', +b.dataset.i === ex));
        }
        el.querySelector('.em-ex').addEventListener('click', (e) => {
          const b = e.target.closest('[data-i]');
          if (!b) return;
          ex = +b.dataset.i; prog = 0; draw();
        });
        svg.addEventListener('mouseover', (e) => { const g = e.target.closest('.wd'); if (g) { hover = g.dataset.w; draw(); } });
        svg.addEventListener('mouseleave', () => { hover = null; draw(); });
        K.loop(el, (t, dt) => { if (prog < 1) { prog = Math.min(1, prog + dt / 2.2); draw(); } });
        f._finish = () => { prog = 1; hover = null; draw(); };
        draw();
      },
      leave(el, K, f) { if (f._finish) f._finish(); },
    },

    /* ───────── 6 ───────── */
    {
      id: 'attention',
      title: '어텐션: 모든 단어가 모든 단어를 본다',
      minutes: 0.75,
      notes: '“그것은”이 무엇을 가리키는지는 문장 끝까지 봐야 압니다. ‘피곤했기’면 동물, ‘넓었기’면 길이죠.\n아래 [피곤했기]/[넓었기]를 번갈아 누르면 ‘그것은’에서 나가는 선의 굵기가 동물 ↔ 길로 옮겨 갑니다. 다른 단어에 마우스를 올리면 그 단어가 어디를 보는지 보입니다.\n트랜스포머는 이렇게 모든 단어가 모든 단어를 동시에 봅니다(오른쪽 표 = 10×10 = 100개 연결). 선 굵기는 설명을 위해 직접 정한 예시값입니다.\n질문: “문장이 1,000단어면 연결은 몇 개일까요?” (100만 개 → 그래서 GPU가 많이 필요)',
      html: `
<style>
  #f-attention .stage { word-break:keep-all; }
  #f-attention .at-wrap { position:relative; height:384px; flex:none; }
  #f-attention svg.at-svg { position:absolute; left:0; top:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
  #f-attention .at-svg path { fill:none; stroke:var(--pen); stroke-linecap:round; }
  #f-attention .at-svg circle { fill:var(--pen); }
  #f-attention .at-words { position:absolute; left:0; right:0; top:296px; display:flex; justify-content:space-between; }
  #f-attention .at-w { position:relative; font-size:41px; font-weight:600; padding:2px 8px; border:3px solid transparent; border-radius:10px 4px 10px 4px / 4px 10px 4px 10px; cursor:pointer; line-height:1.25; white-space:nowrap; }
  #f-attention .at-w.focus { border-color:var(--pen); color:var(--pen); }
  #f-attention .at-w.top { background:var(--hl-soft); }
  #f-attention .at-w.var { text-decoration:underline dashed var(--ink-3) 3px; text-underline-offset:10px; }
  #f-attention .at-w .pc { position:absolute; left:-10px; right:-10px; top:100%; margin-top:10px; text-align:center; font-family:var(--font-mono); font-size:22px; color:var(--ink-2); font-weight:400; }
  #f-attention .at-v { font-family:var(--font-body); font-size:28px; padding:8px 20px; }
  #f-attention svg.at-mat rect.c { fill:var(--pen); }
  #f-attention svg.at-mat rect.bg { fill:var(--paper-2); }
  #f-attention svg.at-mat rect.rw { fill:none; stroke:var(--ink); stroke-width:3; }
  #f-attention svg.at-mat { cursor:pointer; }
</style>
<div class="kicker">트랜스포머의 핵심 · 어텐션(attention, 주목)</div>
<h2 class="title">모든 단어가 모든 단어를 본다</h2>
<div class="demo at-wrap">
  <svg class="at-svg" aria-hidden="true"></svg>
  <div class="at-words"></div>
</div>
<div class="demo row" style="flex:1;align-items:flex-end;justify-content:space-between;gap:40px;min-height:0">
  <div class="stack" style="gap:12px">
    <div class="row center" style="gap:12px"><span class="muted" style="font-size:24px">마지막 단어 바꾸기</span><button class="chip at-v on" data-v="tired">피곤했기</button><button class="chip at-v" data-v="wide">넓었기</button></div>
    <div class="hand lg at-ans" style="min-height:70px"></div>
    <div class="faint" style="font-size:20px">다른 단어에 마우스를 올려 보세요 · 선 굵기 = 얼마나 주목하는지 (설명용으로 정한 예시값)</div>
  </div>
  <div class="row" style="gap:22px;align-items:flex-end">
    <div class="stack" style="gap:8px;text-align:right"><div class="mono" style="font-size:24px;line-height:1.3">10단어 × 10단어<br>= 연결 <b>100</b>개</div><div class="muted" style="font-size:20px;line-height:1.4">트랜스포머(2017)는 이런 표를<br>한 층에 8개씩, 6층으로 계산</div></div>
    <svg class="at-mat" width="206" height="206" viewBox="0 0 206 206" aria-label="어텐션 표"></svg>
  </div>
</div>
<div class="src">출처: 예문 — 구글 리서치 블로그 ‘Transformer’(2017-08-31)의 예를 한국어로 옮김 · 6층·8개: Vaswani 외, arXiv 1706.03762 · 선 굵기는 설명용 예시값</div>`,
      init(el, K, f) {
        const svg = el.querySelector('.at-svg'), wordsEl = el.querySelector('.at-words'), mat = el.querySelector('.at-mat'), ans = el.querySelector('.at-ans');
        let v = 'tired', focus = 6, M = atMatrix(v), cur = M[focus].slice(), pos = [];
        const words = () => AT_WORDS(v);
        wordsEl.innerHTML = words().map((w, i) => `<span class="at-w${i === 8 ? ' var' : ''}" data-i="${i}"><span class="t">${w}</span><span class="pc"></span></span>`).join('');
        const spans = Array.from(wordsEl.children);
        const CS = 20, CG = 0.6;
        let mh = `<rect class="bg" x="0" y="0" width="${10 * CS + 6}" height="${10 * CS + 6}"/>`;
        for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) mh += `<rect class="c" data-i="${i}" x="${3 + j * CS + CG}" y="${3 + i * CS + CG}" width="${CS - 2 * CG}" height="${CS - 2 * CG}"/>`;
        mat.innerHTML = mh + `<rect class="rw" x="1.5" y="0" width="203" height="${CS + 3}"/>`;
        const cells = Array.from(mat.querySelectorAll('rect.c')), rowRect = mat.querySelector('rect.rw');
        function measure() {
          pos = spans.map((s) => ({ x: wordsEl.offsetLeft + s.offsetLeft + s.offsetWidth / 2, y: wordsEl.offsetTop + s.offsetTop - 2 }));
        }
        function drawArcs() {
          if (!pos.length) return;
          const p0 = pos[focus];
          let h = '';
          const order = cur.map((w, j) => [w, j]).filter(([, j]) => j !== focus).sort((a, b) => a[0] - b[0]);
          order.forEach(([w, j]) => {
            const p1 = pos[j], dx = Math.abs(p1.x - p0.x), hh = Math.min(540, 70 + dx * 0.74);
            h += `<path d="M${p0.x.toFixed(1)},${p0.y} Q${((p0.x + p1.x) / 2).toFixed(1)},${(p0.y - hh).toFixed(1)} ${p1.x.toFixed(1)},${p1.y}" style="stroke-width:${(1.2 + w * 30).toFixed(2)};opacity:${(0.16 + 0.84 * Math.min(1, w * 1.8)).toFixed(2)}"/>`;
            h += `<circle cx="${p1.x.toFixed(1)}" cy="${p1.y}" r="${(3 + w * 11).toFixed(1)}" style="opacity:${(0.3 + 0.7 * Math.min(1, w * 1.8)).toFixed(2)}"/>`;
          });
          svg.innerHTML = h;
        }
        function render() {
          const ws = words(), row = M[focus];
          let top = -1;
          row.forEach((w, j) => { if (j !== focus && (top < 0 || w > row[top])) top = j; });
          spans.forEach((s, j) => {
            s.querySelector('.t').textContent = ws[j];
            s.classList.toggle('focus', j === focus);
            s.classList.toggle('top', j === top);
            s.querySelector('.pc').textContent = j === focus ? '' : pctTxt(row[j]);
          });
          cells.forEach((c, k) => { const i = Math.floor(k / 10), j = k % 10; c.style.fillOpacity = Math.pow(Math.min(1, M[i][j] * 1.6), 0.8).toFixed(3); });
          rowRect.setAttribute('y', (1.5 + focus * CS).toFixed(1));
          ans.innerHTML = `${ws[focus]} → <span class="mark">${ws[top]}</span>`;
          el.querySelectorAll('.at-v').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
        }
        function setFocus(i) { if (i === focus) return; focus = i; cur = cur.map(() => 0); render(); }
        function setVar(nv) { v = nv; M = atMatrix(v); render(); requestLayout(); }
        let needLayout = true;
        const requestLayout = () => { needLayout = true; };
        wordsEl.addEventListener('mouseover', (e) => { const s = e.target.closest('.at-w'); if (s) setFocus(+s.dataset.i); });
        wordsEl.addEventListener('click', (e) => { const s = e.target.closest('.at-w'); if (s && +s.dataset.i === 8) setVar(v === 'tired' ? 'wide' : 'tired'); });
        el.querySelector('.at-wrap').addEventListener('mouseleave', () => setFocus(6));
        el.querySelectorAll('.at-v').forEach((b) => b.addEventListener('click', () => setVar(b.dataset.v)));
        mat.addEventListener('mousemove', (e) => { const p = K.pt(e, mat); setFocus(K.clamp(Math.floor((p.y - 3) / CS), 0, 9)); });
        mat.addEventListener('mouseleave', () => setFocus(6));
        K.loop(el, (t, dt) => {
          if (needLayout) { needLayout = false; measure(); drawArcs(); }
          const tgt = M[focus];
          let moved = false;
          for (let j = 0; j < 10; j++) {
            const d = tgt[j] - cur[j];
            if (Math.abs(d) > 0.0015) { cur[j] += d * Math.min(1, dt * 7); moved = true; } else if (cur[j] !== tgt[j]) { cur[j] = tgt[j]; moved = true; }
          }
          if (moved) drawArcs();
        });
        K.onTheme(() => { measure(); drawArcs(); });
        f._home = () => { v = 'tired'; M = atMatrix(v); focus = 6; cur = M[6].slice(); render(); measure(); drawArcs(); };
        render(); measure(); drawArcs();
      },
      enter(el, K, f) { if (f._home) f._home(); },
      leave(el, K, f) { if (f._home) f._home(); },
    },

    /* ───────── 7 ───────── */
    {
      id: 'training-stages',
      title: 'ChatGPT를 만드는 3단계',
      minutes: 1.5,
      notes: '① 사전학습: 인터넷 글 수조 토큰으로 다음 단어 맞히기(방금 실험실의 거대한 버전). ② 지시 미세조정: 질문과 좋은 답 예시를 보여 주며 따라 하게. ③ 사람 피드백 강화학습(RLHF): 두 답 중 사람이 더 좋다고 고른 쪽에 보상.\n왼쪽 [1단계만]/[3단계까지]를 눌러 “숙제 도와줘”에 대한 답을 비교합니다. 1단계 모델은 대답 대신 인터넷 글을 이어 씁니다.\n오른쪽에서 학생들에게 “A야 B야?” 손을 들게 하고 더 많이 나온 쪽을 클릭하세요. 고를 때마다 보상 막대가 쌓입니다. 투표는 1·2번 질문만 하고 3·4번은 건너뜁니다(시간이 남으면 일부러 나쁜 답을 골라 보기).\n말로만 덧붙일 사실(화면에는 없음): 2022년 InstructGPT 실험에서 3단계를 거친 13억 개 모델의 답을, 사람들은 1단계만 거친 1,750억 개 GPT-3의 답보다 더 좋아했습니다. 100배 넘게 작은데도요.\n질문: “우리가 고른 기준이 곧 AI의 성격이 된다면, 누가 고르는 게 좋을까요?”',
      html: `
<style>
  #f-training-stages .stage { word-break:keep-all; }
  #f-training-stages .ts-pipe { display:grid; grid-template-columns:1fr 64px 1fr 64px 1fr; align-items:stretch; }
  #f-training-stages .ts-pipe .box { padding:12px 20px 14px; display:flex; flex-direction:column; gap:4px; }
  #f-training-stages .ts-pipe .hd { display:flex; align-items:baseline; gap:12px; white-space:nowrap; }
  #f-training-stages .ts-pipe .n { font-family:var(--font-mono); font-size:21px; color:var(--pen); font-weight:600; }
  #f-training-stages .ts-pipe .nm { font-family:var(--font-display); font-weight:800; font-size:31px; line-height:1.15; }
  #f-training-stages .ts-pipe .d { font-size:23px; color:var(--ink-2); line-height:1.35; }
  #f-training-stages .ts-arr { display:flex; align-items:center; justify-content:center; }
  #f-training-stages .ts-arr svg { width:54px; height:30px; overflow:visible; }
  #f-training-stages .ts-arr path { fill:none; stroke:var(--ink); stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round; }
  #f-training-stages .ts-low { flex:1; min-height:0; display:grid; grid-template-columns:640px 1fr; gap:56px; }
  #f-training-stages .ts-q { align-self:flex-end; background:var(--paper-2); border-radius:18px 18px 4px 18px; padding:10px 22px; font-size:30px; font-weight:600; }
  #f-training-stages .ts-a { font-size:25px; line-height:1.55; min-height:164px; padding:20px 24px; border-radius:4px 18px 18px 18px; box-shadow:0 0 0 2px var(--paper-3); }
  #f-training-stages .ts-m { font-family:var(--font-body); font-size:24px; }
  #f-training-stages .ts-opt { font-family:var(--font-body); font-size:24px; line-height:1.4; text-align:left; color:var(--ink); background:var(--paper); border:2.5px solid var(--ink); border-radius:12px 4px 12px 4px / 4px 12px 4px 12px; padding:12px 16px; cursor:pointer; min-height:120px; display:flex; gap:10px; align-items:flex-start; }
  #f-training-stages .ts-opt b { font-family:var(--font-mono); color:var(--pen); }
  #f-training-stages .ts-opt:hover { background:var(--hl-soft); }
  #f-training-stages .ts-rw { display:grid; grid-template-columns:200px 1fr 40px; align-items:center; gap:12px; height:31px; font-size:22px; }
  #f-training-stages .ts-blk { display:flex; gap:4px; align-items:center; height:24px; }
  #f-training-stages .ts-blk i { width:20px; height:20px; display:block; border-radius:2px; animation:ts-pop .35s ease-out both; }
  #f-training-stages .ts-rw.g i { background:var(--good); }
  #f-training-stages .ts-rw.b i { background:var(--bad); }
  #f-training-stages .ts-rw .c { font-family:var(--font-mono); text-align:right; }
  @keyframes ts-pop { from { transform:scale(0.2); opacity:0; } to { transform:none; opacity:1; } }
</style>
<div class="kicker">학습 과정 · 사전학습 → 미세조정 → RLHF</div>
<h2 class="title md">ChatGPT를 만드는 3단계</h2>
<div class="ts-pipe">
  <div class="box"><div class="hd"><span class="n">1단계</span><span class="nm">사전학습</span></div><span class="d">인터넷 글 수조 토큰으로<br>다음 단어 맞히기</span></div>
  <div class="ts-arr"><svg viewBox="0 0 54 30"><path d="M3,15 Q27,11 50,15 M38,5 L51,15 L38,25"/></svg></div>
  <div class="box"><div class="hd"><span class="n">2단계</span><span class="nm">지시 미세조정</span></div><span class="d">“질문 → 좋은 답” 예시를<br>보여 주고 따라 하게</span></div>
  <div class="ts-arr"><svg viewBox="0 0 54 30"><path d="M3,15 Q27,19 50,15 M38,5 L51,15 L38,25"/></svg></div>
  <div class="box pen"><div class="hd"><span class="n">3단계</span><span class="nm">사람 피드백 강화학습</span></div><span class="d">(RLHF) 두 답 중 사람이 고른<br>더 나은 쪽에 ‘보상’</span></div>
</div>
<div class="ts-low demo">
  <div class="stack" style="gap:12px;min-width:0">
    <div class="row center" style="gap:12px"><span class="muted" style="font-size:24px">같은 질문, 다른 모델</span><button class="chip ts-m on" data-m="1">1단계만</button><button class="chip ts-m" data-m="3">3단계까지</button></div>
    <div class="ts-q">숙제 도와줘</div>
    <div class="term ts-a"></div>
    <div class="ts-n pen" style="font-size:26px;font-weight:600"></div>
  </div>
  <div class="stack" style="gap:12px;min-width:0">
    <div class="row center" style="justify-content:space-between"><span class="subtitle" style="font-size:30px">여러분이 3단계 해 보기 <span class="muted" style="font-size:22px;font-family:var(--font-body);font-weight:400">더 나은 답을 클릭</span></span><button class="btn sm ghost ts-reset">초기화</button></div>
    <div style="font-size:24px">질문: <b class="ts-pq"></b> <span class="mono faint ts-pn" style="font-size:20px"></span></div>
    <div class="ts-ab" style="display:grid;grid-template-columns:1fr 1fr;gap:16px"></div>
    <div class="ts-rws stack" style="gap:2px;margin-top:4px"></div>
    <div class="row center" style="justify-content:space-between"><span style="font-size:24px">보상 점수 <b class="ts-sc mono" style="font-size:30px"></b></span><span class="muted" style="font-size:22px">→ 점수 높은 답 쪽으로 모델이 바뀐다</span></div>
  </div>
</div>
<div class="src">출처: Ouyang 외, InstructGPT(arXiv 2203.02155, 2022) · OpenAI ‘Introducing ChatGPT’(2022-11-30, InstructGPT와 같은 RLHF) · 답변 예시는 설명용으로 직접 작성</div>`,
      init(el) {
        const aEl = el.querySelector('.ts-a'), nEl = el.querySelector('.ts-n');
        const setM = (m) => {
          aEl.innerHTML = TS_ANS[m].a; nEl.textContent = TS_ANS[m].n;
          el.querySelectorAll('.ts-m').forEach((b) => b.classList.toggle('on', +b.dataset.m === m));
        };
        el.querySelectorAll('.ts-m').forEach((b) => b.addEventListener('click', () => setM(+b.dataset.m)));
        setM(1);
        const rws = el.querySelector('.ts-rws'), ab = el.querySelector('.ts-ab');
        rws.innerHTML = TS_TRAITS.map(([n, s], i) => `<div class="ts-rw ${s > 0 ? 'g' : 'b'}" data-k="${i}"><span>${n} <span class="mono faint" style="font-size:20px">${s > 0 ? '+1' : '−1'}</span></span><span class="ts-blk"></span><span class="c"></span></div>`).join('');
        let counts = [2, 1, 0, 0], pi = 0;
        function renderRw(animK) {
          Array.from(rws.children).forEach((r, k) => {
            const n = counts[k], blk = r.querySelector('.ts-blk');
            const show = Math.min(n, 13);
            if (blk.children.length !== show || k === animK) blk.innerHTML = Array.from({ length: show }, (_, j) => `<i style="animation-delay:${k === animK && j === show - 1 ? 0 : -1}s"></i>`).join('');
            r.querySelector('.c').textContent = n;
          });
          const sc = counts.reduce((s, c, k) => s + c * TS_TRAITS[k][1], 0);
          el.querySelector('.ts-sc').textContent = (sc > 0 ? '+' : sc < 0 ? '−' : '') + Math.abs(sc);
        }
        function renderPair() {
          const P = TS_PAIRS[pi];
          el.querySelector('.ts-pq').textContent = P.q;
          el.querySelector('.ts-pn').textContent = `(${pi + 1}/${TS_PAIRS.length})`;
          ab.innerHTML = P.a.map((o, i) => `<button class="ts-opt" data-o="${i}"><b>${'AB'[i]}</b><span>${esc(o.t)}</span></button>`).join('');
        }
        ab.addEventListener('click', (e) => {
          const b = e.target.closest('[data-o]');
          if (!b) return;
          const k = TS_PAIRS[pi].a[+b.dataset.o].k;
          counts[k]++;
          pi = (pi + 1) % TS_PAIRS.length;
          renderRw(k); renderPair();
        });
        el.querySelector('.ts-reset').addEventListener('click', () => { counts = [0, 0, 0, 0]; pi = 0; renderRw(); renderPair(); });
        renderRw(); renderPair();
      },
    },

    /* ───────── 8 ───────── */
    {
      id: 'hallucination',
      title: '그럴듯함 ≠ 사실 (환각)',
      minutes: 1,
      notes: '언어 모델은 “사실인가?”가 아니라 “다음에 올 법한가?”로 단어를 고릅니다. 그래서 모르는 질문에도 그럴듯한 답을 지어낼 수 있고, 이것을 환각(hallucination)이라고 부릅니다.\n화면에 들어오면 가짜 질문에 대한 답이 한 단어씩 만들어집니다. 첫 단어 후보에 ‘죄송하지만’도 있었지만 확률이 낮았고, 이름 후보 셋은 확률이 거의 같다는 점(= 아무거나 고른 것)을 짚어 주세요. [다시 재생]으로 반복.\n덤: 1987년에는 학교 이름부터 ‘성일정보고’가 아니었습니다(1987 성일상업고 → 1996 성일정보산업고 → 2002 성일정보고). 질문의 전제가 틀렸는데도 AI는 그대로 답을 지어냅니다.\n오른쪽 체크리스트는 학생과 함께 하나씩 클릭합니다. 실제로 2023년 구글 Bard 광고에서도 이런 오답이 나왔습니다.\n질문: “AI가 숫자를 말하면, 여러분은 어떻게 확인하나요?”',
      html: `
<style>
  #f-hallucination .stage { word-break:keep-all; }
  #f-hallucination .hl-grid { flex:1; min-height:0; display:grid; grid-template-columns:1fr 470px; gap:60px; }
  #f-hallucination .hl-q { align-self:flex-start; position:relative; background:var(--paper-2); border-radius:18px 18px 18px 4px; padding:12px 22px; font-size:30px; font-weight:600; }
  #f-hallucination .stamp { position:absolute; right:-236px; top:-8px; transform:rotate(-6deg); border:3.5px solid var(--bad); color:var(--bad); font-family:var(--font-mono); font-weight:600; font-size:22px; padding:4px 12px; border-radius:6px; white-space:nowrap; letter-spacing:.04em; }
  #f-hallucination .hl-a { min-height:168px; font-size:34px; line-height:1.5; padding:18px 24px; display:flex; flex-wrap:wrap; align-content:flex-start; gap:0 .3em; }
  #f-hallucination .hl-a span { transition:opacity .2s; }
  #f-hallucination .hl-a .last { background:var(--hl-soft); }
  #f-hallucination .hl-a { position:relative; }
  #f-hallucination .hl-a.done .fake { text-decoration:underline wavy var(--bad) 2.5px; text-underline-offset:7px; }
  #f-hallucination .hl-a .who { font-family:var(--font-mono); font-size:22px; color:var(--ink-3); align-self:center; margin-right:.2em; }
  #f-hallucination .hl-a .caret { display:inline-block; width:4px; height:1.05em; align-self:center; background:var(--pen); animation:hl-blink 1s steps(2, start) infinite; }
  #f-hallucination .hl-a.done .caret { display:none; }
  @keyframes hl-blink { to { visibility:hidden; } }
  #f-hallucination .hl-leg { position:absolute; right:18px; bottom:8px; font-size:20px; color:var(--bad); opacity:0; transition:opacity .3s; }
  #f-hallucination .hl-a.done .hl-leg { opacity:1; }
  #f-hallucination .hl-row { display:grid; grid-template-columns:220px 1fr 80px; align-items:center; gap:14px; height:46px; }
  #f-hallucination .hl-row .w { font-size:27px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #f-hallucination .hl-row .tr { height:26px; background:var(--paper-2); position:relative; }
  #f-hallucination .hl-row .fl { position:absolute; left:0; top:0; bottom:0; background:var(--ink-3); transition:width .25s ease; }
  #f-hallucination .hl-row.pick .fl { background:var(--pen); }
  #f-hallucination .hl-row.pick .w { color:var(--pen); }
  #f-hallucination .hl-row .p { font-family:var(--font-mono); font-size:24px; text-align:right; }
  #f-hallucination .hl-ck { display:flex; align-items:center; gap:16px; font-size:28px; cursor:pointer; padding:6px 0; background:none; border:0; color:var(--ink); font-family:var(--font-body); text-align:left; }
  #f-hallucination .hl-ck svg { width:38px; height:38px; flex:none; overflow:visible; }
  #f-hallucination .hl-ck rect { fill:none; stroke:var(--ink); stroke-width:3; }
  #f-hallucination .hl-ck path { fill:none; stroke:var(--pen); stroke-width:5; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:60; stroke-dashoffset:60; transition:stroke-dashoffset .3s ease; }
  #f-hallucination .hl-ck.on path { stroke-dashoffset:0; }
</style>
<div class="kicker">주의 · 환각(hallucination)</div>
<h2 class="title">그럴듯함 ≠ 사실</h2>
<div class="hl-grid">
  <div class="stack demo" style="gap:14px;min-width:0">
    <div class="hl-q">성일정보고 1987년 전국 로봇대회 우승자는?<span class="stamp">가짜 질문 · 설명용</span></div>
    <div class="box hl-a" aria-live="polite"></div>
    <div class="row center" style="justify-content:space-between"><span class="mono" style="font-size:20px;color:var(--ink-2)">이 자리에 올 단어 후보 (예시 확률)</span><button class="btn sm hl-replay">다시 재생</button></div>
    <div class="hl-bars"></div>
    <div class="hand" style="font-size:42px;margin-top:4px">‘사실인가?’가 아니라 ‘다음에 올 법한가?’로 고른다</div>
  </div>
  <div class="stack" style="gap:16px;min-width:0">
    <div class="subtitle">확인 습관 4가지</div>
    <div class="stack demo hl-cks" style="gap:4px">${HL_CHECK.map((t, i) => `<button class="hl-ck" data-i="${i}"><svg viewBox="0 0 38 38"><rect x="2" y="2" width="34" height="34" rx="4"/><path d="M8,20 L16,29 L34,6"/></svg><span>${t}</span></button>`).join('')}</div>
    <div class="box dashed" style="padding:16px 20px;margin-top:6px">
      <div class="mono" style="font-size:20px;color:var(--ink-2)">실제 사례 · 2023년 2월</div>
      <div style="font-size:23px;line-height:1.45;margin-top:4px">구글 Bard 광고 속 답 “제임스웹 망원경이 외계 행성을 처음 찍었다” → <b class="bad">틀림</b> (첫 사진은 2004년 VLT). 알파벳 시가총액 약 <b>1,000억 달러</b> 증발.</div>
    </div>
    <div style="font-size:23px;line-height:1.45;color:var(--ink-2)">요즘 모델은 검색·계산 도구로 확인해서 환각을 줄인다. <b style="color:var(--ink)">그래도 0은 아니다.</b></div>
  </div>
</div>
<div class="src">출처: OpenAI ‘Introducing ChatGPT’(2022-11-30) 한계 항목 · Bard 오답과 시총 하락: The Standard·Fortune 2023-02-08 · 질문·답·확률은 설명용 가짜 예시</div>`,
      init(el, K, f) {
        const aEl = el.querySelector('.hl-a'), bars = el.querySelector('.hl-bars');
        aEl.innerHTML = '<span class="who">AI 답 ›</span>' + HS.map((s) => `<span class="wd${s.fake ? ' fake' : ''}">${esc(s.w)}</span>`).join('') + '<span class="caret"></span><span class="hl-leg">물결 밑줄 = 근거 없이 지어낸 부분</span>';
        const wEls = Array.from(aEl.querySelectorAll('.wd'));
        bars.innerHTML = [0, 1, 2].map(() => '<div class="hl-row"><span class="w"></span><span class="tr"><i class="fl"></i></span><span class="p"></span></div>').join('');
        const rows = Array.from(bars.children);
        let k = HS.length, ph = 1, playing = false, acc = 0, wait = 0;
        function render() {
          wEls.forEach((w, i) => { w.style.display = i < k ? '' : 'none'; w.classList.toggle('last', i === k - 1 && playing); });
          aEl.classList.toggle('done', k >= HS.length && !playing);
          const s = HS[Math.min(k, HS.length - 1)];
          const pick = k >= HS.length || ph >= 1;
          rows.forEach((r, i) => {
            const [w, p] = s.c[i];
            r.querySelector('.w').textContent = w;
            r.querySelector('.fl').style.width = (p * 100).toFixed(0) + '%';
            r.querySelector('.p').textContent = p ? Math.round(p * 100) + '%' : '';
            r.classList.toggle('pick', pick && w === s.w);
          });
        }
        function play() { k = 0; ph = 0; acc = 0; wait = 0; playing = true; render(); }
        el.querySelector('.hl-replay').addEventListener('click', play);
        el.querySelector('.hl-cks').addEventListener('click', (e) => { const b = e.target.closest('.hl-ck'); if (b) b.classList.toggle('on'); });
        K.loop(el, (t, dt) => {
          if (!playing) return;
          if (wait > 0) { wait -= dt; return; }
          acc += dt;
          if (ph === 0 && acc > 0.3) { ph = 1; render(); }
          else if (ph === 1 && acc > 0.55) {
            k++; acc = 0; ph = 0;
            if (k >= HS.length) { playing = false; }
            render();
          }
        });
        f._play = play;
        f._done = () => { k = HS.length; ph = 1; playing = false; render(); };
        render();
      },
      enter(el, K, f) { if (f._play) f._play(); },
      leave(el, K, f) { if (f._done) f._done(); },
    },
  ]);
})();
