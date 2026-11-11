/* Players, part 2: Anthropic, Tesla, Musk vs OpenAI, the three godfathers, the river of talent. */
(function () {
  'use strict';

  /* ───────── Anthropic: Constitutional AI demo data ─────────
     원칙 3개는 Anthropic 'Claude's Constitution'(2023.5.9)의 실제 원칙을 한국어로 옮긴 것.
     질문·초안·비판·수정 문장은 수업용으로 직접 작성한 예시. */
  const CAI = {
    q: '나 험담한 친구, SNS 계정 찾아서 망신 주는 법 알려 줘.',
    draft: ['이름이랑 학교로 검색하면 계정을 찾을 수 있어요. ', '찾은 계정을 반 친구들에게 알려 망신을 주세요. ', '먼저 험담한 쪽이 잘못이니까요.'],
    rules: [
      {
        tag: '개인정보', from: '애플 이용약관에서',
        rule: '남의 개인·비밀 정보가 가장 적게 담긴 답을 고르라.', seg: 0,
        crit: '친구 동의 없이 계정을 캐내는 법을 알려 줬다. 개인정보 침해다.',
        fix: '친구 계정을 몰래 찾는 건 도와줄 수 없어요. 험담이 정말인지 믿을 만한 친구에게 먼저 확인해 봐요.',
      },
      {
        tag: '괴롭힘 금지', from: '딥마인드 Sparrow 규칙에서',
        rule: '모욕·괴롭힘·혐오가 가장 적은 답을 고르라.', seg: 1,
        crit: '계정을 퍼뜨려 망신 주라는 건 괴롭힘을 부추기는 말이다.',
        fix: '망신 주기는 학교폭력이 될 수 있어요. 속상한 마음은 직접 말하거나 선생님께 도움을 청해 봐요.',
      },
      {
        tag: '존중', from: 'UN 세계인권선언에서',
        rule: '자유·평등·형제애를 가장 북돋는 답을 고르라.', seg: 2,
        crit: '상대를 ‘잘못한 사람’으로만 몰았다. 서로 존중하는 길은 안 보여 줬다.',
        fix: '화나는 게 당연해요. “그 말 들었는데 무슨 뜻이었어?” 하고 직접 물어보면 오해가 풀리기도 해요.',
      },
    ],
  };

  /* ───────── Tesla: data engine ───────── */
  const ENGINE = [
    ['달리기', '고객 차들이 매일 달리며 카메라로 도로를 본다.'],
    ['어려운 장면', 'AI가 헷갈렸거나 사람이 핸들을 잡은 순간만 골라 올린다.'],
    ['정답 달기', '사람과 더 큰 AI가 그 장면에 정답(차선·물체·경로)을 표시한다.'],
    ['다시 학습', '정답이 붙은 장면을 보태 신경망을 다시 훈련한다.'],
    ['업데이트', '새 신경망을 무선 업데이트로 모든 차에 보낸다. 그리고 다시 1번으로.'],
  ];
  const CASES = ['공사 구간 고깔', '역광 터널 출구', '손에 든 정지판', '자전거 실은 차', '비 오는 밤 차선', '신호등 실은 트럭'];

  /* ───────── Talent river ─────────
     x = 시간(2010 → 2026.8, 대략), y = 소속 칸. 칸 안 줄 순서는 교차가 가장 적게 되도록 고름. */
  const TF = { x0: 196, x1: 994 };
  // piecewise time axis: recent years get more room (2024–26 is crowded)
  const TB = [[2010, 0], [2013, 0.12], [2016, 0.28], [2019, 0.43], [2022, 0.6], [2024, 0.765], [2026.8, 1]];
  const TX = (yr) => {
    let k = 1; while (k < TB.length - 1 && yr > TB[k][0]) k++;
    const [ya, fa] = TB[k - 1], [yb, fb] = TB[k];
    return TF.x0 + (fa + ((yr - ya) / (yb - ya)) * (fb - fa)) * (TF.x1 - TF.x0);
  };
  const STREAMS = [
    { id: 'shazeer', name: '샤지어', to: '구글 복귀 (약 27억 달러)', photo: null,
      pts: [[2010.0, 186], [2021.1, 186], [2021.9, 496], [2024.2, 496], [2025.0, 196], [2026.8, 196]],
      cap: '<b>노엄 샤지어</b> — 트랜스포머 논문 저자(2017) → Character.AI 창업(2021) → 구글 복귀(2024.8). 구글이 Character.AI에 약 27억 달러를 냈어요.' },
    { id: 'suleyman', name: '술레이만', to: 'Inflection → MS AI', photo: 'mustafa-suleyman',
      pts: [[2010.8, 166], [2021.6, 166], [2022.4, 470], [2023.8, 470], [2024.6, 400], [2026.8, 400]],
      cap: '<b>무스타파 술레이만</b> — 딥마인드 공동창업(2010) → Inflection 창업(2022) → Microsoft AI CEO(2024.3). MS는 Inflection에 약 6.5억 달러를 냈어요.' },
    { id: 'lecun', name: '르쿤', to: '메타 → AMI Labs', photo: 'lecun',
      pts: [[2010.0, 92], [2013.5, 92], [2014.3, 378], [2025.5, 378], [2026.2, 444], [2026.8, 444]],
      cap: '<b>얀 르쿤</b> — 힌턴의 박사후연구원(1987–88) → 메타 FAIR 초대 디렉터(2013) → 메타 퇴사, ‘월드모델’ 회사 AMI Labs 창업(2025).' },
    { id: 'murati', name: '무라티', to: 'Thinking Machines', photo: 'mira-murati',
      pts: [[2018.0, 256], [2024.6, 256], [2025.4, 470], [2026.8, 470]],
      cap: '<b>미라 무라티</b> — OpenAI CTO → 퇴사(2024.9) → Thinking Machines Lab 창업(2025.2).' },
    { id: 'sutskever', name: '수츠케버', to: 'SSI', photo: 'sutskever',
      pts: [[2010.0, 112], [2012.6, 112], [2013.4, 206], [2015.5, 206], [2016.3, 274], [2024.1, 274], [2024.9, 522], [2026.8, 522]],
      cap: '<b>일리야 수츠케버</b> — 힌턴의 제자(AlexNet, 2012) → 구글(2013, 힌턴의 회사 인수) → OpenAI 공동창업(2015) → SSI 창업(2024).' },
    { id: 'karpathy', name: '카르파시', to: 'Eureka → Anthropic', photo: 'karpathy',
      pts: [[2010.0, 70], [2015.5, 70], [2016.3, 292], [2017.1, 292], [2017.9, 356], [2022.6, 356], [2023.4, 292], [2024.1, 292], [2024.9, 548], [2026.8, 548]],
      cap: '<b>안드레이 카르파시</b> — 페이페이 리의 제자 → OpenAI 창립 멤버(2015) → 테슬라 AI 총괄(2017–22) → OpenAI(2023) → Eureka Labs(2024) → Anthropic(2026.5).' },
    { id: 'amodei', name: '아모데이 남매', to: 'Anthropic', photo: 'dario-amodei',
      pts: [[2016.6, 310], [2020.6, 310], [2021.4, 574], [2026.8, 574]],
      cap: '<b>다리오·다니엘라 아모데이</b> — OpenAI에서 일하다 동료들과 나와 Anthropic 창업(2021).' },
    { id: 'transformer', name: '트랜스포머 저자들', to: 'Cohere·Sakana 등', photo: null,
      pts: [[2017.2, 186], [2017.7, 196], [2018.5, 196], [2019.4, 600], [2026.8, 600]],
      cap: '<b>트랜스포머 논문 8인</b>(2017, 구글) — 8명 모두 한때 구글을 떠났어요. 고메즈는 Cohere, 존스는 Sakana AI, 파르마르는 Anthropic. 샤지어는 Character.AI를 세웠다가 2024년 구글로 돌아왔어요.' },
  ];
  function riverPath(pts) {
    let d = `M${TX(pts[0][0]).toFixed(1)},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const xa = TX(pts[i - 1][0]), ya = pts[i - 1][1], xb = TX(pts[i][0]), yb = pts[i][1];
      if (ya === yb) d += ` L${xb.toFixed(1)},${yb}`;
      else { const m = (xb - xa) * 0.55; d += ` C${(xa + m).toFixed(1)},${ya} ${(xb - m).toFixed(1)},${yb} ${xb.toFixed(1)},${yb}`; }
    }
    return d;
  }

  Deck.part('players', 2, [
    /* ═════════════════════════ 1. Anthropic ═════════════════════════ */
    {
      id: 'anthropic',
      title: 'Anthropic — ‘안전 먼저’를 내건 회사',
      minutes: 1.3,
      notes: 'Anthropic은 OpenAI에서 GPT-2·GPT-3를 만든 팀이 나와 세운 회사입니다. 다리오 아모데이는 OpenAI 연구 부사장이었고, 캐플런은 “모델·데이터·계산을 키우면 성능이 예측 가능하게 좋아진다”는 스케일링 법칙 논문(2020)의 제1저자입니다. 2020년 12월–2021년 1월 11명이 함께 나왔고(다리오·다니엘라 남매 등), 겉으로는 “AI를 키우는 것과 안전을 같이 다뤄야 한다”를 내걸었지만, 다리오는 2026년 6월 블룸버그 인터뷰에서 “비전이 같지 않고 믿지 못하는 사람과 왜 다투겠나”라며 신뢰 문제였다고 말했습니다. 대표 기술이 Constitutional AI(헌법 AI): 사람이 답을 일일이 고치는 대신, AI가 원칙 목록(헌법)을 보고 자기 답을 비판하고 고칩니다.\n클릭: 오른쪽 ②에서 원칙 버튼을 하나씩 눌러 보세요. 같은 초안이라도 어떤 원칙을 고르느냐에 따라 ①에서 걸리는 문장(노란 표시)과 ③ 비판, ④ 고친 답이 달라집니다. 원칙 3개는 실제 Claude 헌법(2023)의 원칙을 옮긴 것이고, 대화 예시는 수업용으로 만든 것입니다.\n아래 숫자: 2023–25년 아마존 80억·구글 30억 달러, 2026년 4월 아마존 50억·구글 100억 달러 추가(확정분 합계 260억 달러, 조건부로 최대 500억 더), 2026년 5월 기업가치 9,650억 달러(당시 OpenAI의 8,520억 달러를 넘음. OpenAI는 11월 약 1조 2,500억 달러로 새 투자를 받았다는 보도), 7월 연환산 매출 650억 달러. 10월에 상장 서류(S-1)를 공개했고, 11월 초 기준 공모가도 정해지지 않은 상장 전 상태입니다(발표 당일 상장 여부를 한 번 확인하세요).\n질문: “여러분이 AI의 헌법을 쓴다면 첫 번째 원칙으로 뭘 넣겠어요?”',
      html: `
        <style>
          #f-anthropic .an-q { left: 98px; top: 264px; width: 440px; font-size: 30px; line-height: 1.12; color: var(--rel-tension); transform: rotate(-1deg); word-break: keep-all; }
          #f-anthropic .an-q small { display: block; font-size: 24px; margin-top: 2px; }
          #f-anthropic .an-ppl { left: 92px; top: 346px; width: 440px; height: 250px; }
          #f-anthropic .an-ppl .photo { position: absolute; }
          #f-anthropic .an-story { left: 96px; top: 612px; width: 440px; font-size: 23px; line-height: 1.36; word-break: keep-all; }
          #f-anthropic .an-story .cc { margin-top: 8px; padding-top: 6px; border-top: 1.5px dashed var(--ink-3); }
          #f-anthropic .cai { position: absolute; left: 572px; top: 56px; width: 936px; }
          #f-anthropic .cai-q { margin: 12px 0 20px; padding: 10px 18px; border-left: 6px solid var(--pen); background: var(--pen-soft); font-size: 26px; line-height: 1.35; }
          #f-anthropic .cai-q .mono { font-size: 20px; color: var(--ink-2); margin-right: 10px; }
          #f-anthropic .cai-grid { position: relative; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 248px 222px; column-gap: 60px; row-gap: 40px; }
          #f-anthropic .cell { position: relative; display: flex; flex-direction: column; min-height: 0; }
          #f-anthropic .cell h4 { margin: 0 0 8px; font-family: var(--font-body); font-weight: 700; font-size: 24px; display: flex; align-items: center; gap: 10px; }
          #f-anthropic .cell h4 i { font-style: normal; display: inline-grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--ink); color: var(--paper); font-family: var(--font-mono); font-size: 19px; }
          #f-anthropic .cell h4 small { font-weight: 400; font-size: 20px; color: var(--ink-2); }
          #f-anthropic .term { flex: 1; font-family: var(--font-body); font-size: 24px; line-height: 1.5; padding: 14px 20px; word-break: keep-all; }
          #f-anthropic .term .who { display: block; font-family: var(--font-mono); font-size: 20px; color: var(--term-dim); margin-bottom: 4px; }
          #f-anthropic .seg { border-radius: 3px; transition: background-color .35s, color .35s; }
          #f-anthropic .seg.hit { background: var(--hl); color: var(--sticky-ink); box-shadow: 0 0 0 3px var(--hl); }
          #f-anthropic .cai-rules { display: flex; flex-direction: column; gap: 10px; }
          #f-anthropic .rule-btn { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; text-align: left; padding: 10px 18px; width: 100%; }
          #f-anthropic .rule-btn span { font-family: var(--font-mono); font-size: 20px; font-weight: 400; opacity: .8; }
          #f-anthropic .cai-crit { flex: 1; padding: 12px 20px 10px; display: flex; flex-direction: column; gap: 4px; word-break: keep-all; }
          #f-anthropic .cai-rule { font-size: 21px; color: var(--ink-2); line-height: 1.35; }
          #f-anthropic .cai-ctext { font-size: 38px; line-height: 1.12; }
          #f-anthropic .cai-fix .tag { color: var(--term-hi); }
          #f-anthropic .cai-arrows { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
          #f-anthropic .cai-arrows path { fill: none; stroke: var(--ink); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
          #f-anthropic .an-ledger { left: 572px; right: 92px; top: 708px; display: grid; grid-template-columns: 1.06fr 0.94fr 1fr; gap: 0; border-top: 3px solid var(--ink); }
          #f-anthropic .an-ledger > div { padding: 10px 18px 0; border-left: 2px dashed var(--ink-3); display: flex; flex-direction: column; gap: 2px; word-break: keep-all; }
          #f-anthropic .an-ledger > div:first-child { border-left: 0; padding-left: 0; }
          #f-anthropic .an-ledger b { font-family: var(--font-mono); font-weight: 600; font-size: 40px; line-height: 1.1; letter-spacing: -0.02em; }
          #f-anthropic .an-ledger span { font-size: 20px; color: var(--ink-2); line-height: 1.3; }
        </style>
        <div class="kicker">2021 · OpenAI를 나온 사람들</div>
        <h2 class="title" style="font-size:84px;margin-top:-4px">Anthropic</h2>
        <div class="abs hand" style="left:100px;top:204px;transform:rotate(-2deg)">‘안전 먼저’를 간판으로</div>
        <div class="abs hand an-q">“비전이 다르고 믿지 못하는 사람과 왜 다투나”<small>— 다리오 아모데이 (2026.6)</small></div>
        <div class="abs an-ppl">
          ${Kit.photo('dario-amodei', '다리오 아모데이', 'sm', 'left:0;top:6px;--w:180px;--tilt:-3deg')}
          ${Kit.photo('jared-kaplan', '재러드 캐플런', 'sm tilt-r', 'left:198px;top:0;--w:134px')}
          ${Kit.photo('jack-clark', '잭 클라크', 'sm', 'left:326px;top:22px;--w:116px;--tilt:-1.5deg')}
        </div>
        <div class="abs an-story"><b>GPT-2·GPT-3</b>를 만든 팀이 나왔다<br>다리오 = OpenAI 연구 부사장<br>캐플런 = 스케일링 법칙(2020)<br>2020.12–2021.1 <b>11명</b> 함께 퇴사<br>→ 아모데이 남매 등이 창업<div class="cc">2023.3 Claude → 2025.2 <b>Claude Code</b></div></div>

        <div class="abs demo cai">
          <div class="kicker">직접 해 보기 · Constitutional AI(헌법 AI) · 2022</div>
          <div class="cai-q"><span class="mono">사용자</span>${CAI.q}</div>
          <div class="cai-grid">
            <div class="cell"><h4><i>1</i>AI의 첫 답(초안)</h4><div class="term cai-draft"></div></div>
            <div class="cell"><h4><i>2</i>원칙 하나 고르기 <small>‘헌법’ 중에서</small></h4><div class="cai-rules"></div></div>
            <div class="cell"><h4><i>4</i>스스로 고친 답</h4><div class="term cai-fix"></div></div>
            <div class="cell"><h4><i>3</i>스스로 비판하기</h4><div class="box pen dashed cai-crit"><div class="cai-rule"></div><div class="hand cai-ctext"></div></div></div>
            <svg class="cai-arrows" viewBox="0 0 936 510" preserveAspectRatio="none" aria-hidden="true">
              <path d="M444,136 L490,136 M480,126 L491,136 L480,146"/>
              <path d="M880,250 C882,262 878,274 880,288 M870,278 L880,289 L890,278"/>
              <path d="M492,404 L446,404 M456,394 L445,404 L456,414"/>
            </svg>
          </div>
        </div>

        <div class="abs an-ledger">
          <div><b>260억 달러</b><span>2023–26.4 확정 투자 · 아마존+구글</span></div>
          <div><b>9,650억 달러</b><span>기업가치 (2026.5 투자 때)</span></div>
          <div><b>650억 달러</b><span>연환산 매출 (2026.7) · 상장 신청</span></div>
        </div>
        <div class="src">출처: 위키백과 Anthropic · Anthropic 회사 소개 · Kaplan 외 arXiv 2001.08361 · Business Today 2026.6.23(블룸버그 인터뷰) · Amazon 2026.4.20 · Axios 2026.4.24 · Anthropic Series H(2026.5.28) · CNBC 2026.8.17 · 「Constitutional AI」 arXiv 2212.08073 · 「Claude's Constitution」(2023.5.9) — 원칙은 실제 번역, 대화는 수업용 예시</div>`,
      init(el, K) {
        const draft = el.querySelector('.cai-draft');
        draft.innerHTML = '<span class="who">AI</span>' + CAI.draft.map((s, i) => `<span class="seg" data-s="${i}">${K.escape(s)}</span>`).join('');
        const rulesHost = el.querySelector('.cai-rules');
        rulesHost.innerHTML = CAI.rules.map((r, i) => `<button class="btn rule-btn" data-r="${i}">${r.tag}<span>${r.from}</span></button>`).join('');
        const ruleEl = el.querySelector('.cai-rule'), critEl = el.querySelector('.cai-ctext'), fixEl = el.querySelector('.cai-fix');
        let cur = 0;
        const anim = { on: false, t: 0 };
        const fixHead = '<span class="who">AI · <span class="tag">고친 답</span></span>';

        function paint(k, critN, fixN) {
          const r = CAI.rules[k];
          rulesHost.querySelectorAll('.rule-btn').forEach((b) => b.classList.toggle('on', +b.dataset.r === k));
          draft.querySelectorAll('.seg').forEach((s) => s.classList.toggle('hit', +s.dataset.s === r.seg));
          ruleEl.textContent = `원칙: “${r.rule}”`;
          critEl.textContent = critN == null ? r.crit : r.crit.slice(0, critN);
          fixEl.innerHTML = fixHead + K.escape(fixN == null ? r.fix : r.fix.slice(0, fixN));
        }
        paint(cur);

        rulesHost.addEventListener('click', (e) => {
          const b = e.target.closest('.rule-btn'); if (!b) return;
          cur = +b.dataset.r;
          paint(cur);            // final state first: correct even if the loop is not running
          anim.on = true; anim.t = 0;
        });
        const CPS1 = 26, CPS2 = 34;
        K.loop(el, (t, dt) => {
          if (!anim.on) return;
          anim.t += dt;
          const r = CAI.rules[cur];
          const t1 = anim.t - 0.35, n1 = Math.max(0, Math.floor(t1 * CPS1));
          const t2 = t1 - r.crit.length / CPS1 - 0.35, n2 = Math.max(0, Math.floor(t2 * CPS2));
          if (n2 >= r.fix.length) { anim.on = false; paint(cur); return; }
          paint(cur, Math.min(n1, r.crit.length), n2);
        });
        el.__caiFinish = () => { anim.on = false; paint(cur); };
      },
      leave(el) { el.__caiFinish && el.__caiFinish(); },
    },

    /* ═════════════════════════ 2. Tesla ═════════════════════════ */
    {
      id: 'tesla',
      title: '테슬라의 AI — 도로 위의 데이터 엔진',
      minutes: 1.1,
      notes: '테슬라는 2016년 사망사고 뒤 모빌아이와 갈라서고, 2017년 OpenAI 창립 멤버였던 카르파시를 AI 총괄로 데려와 “카메라 + 신경망 + 엄청난 주행 데이터”에 걸었습니다. 이듬해 머스크는 “테슬라가 AI에 집중하면서 생길 이해충돌”을 공개 이유로 OpenAI 이사회를 떠났습니다(다음 장의 소송으로 이어짐). 2021년엔 레이더까지 떼고 카메라만 쓰고, FSD v12에서는 사람이 짠 규칙 코드 30만 줄을 신경망 하나로 바꿨습니다(테슬라 릴리스 노트 표현).\n클릭: 왼쪽 원의 “다음 단계”를 눌러 데이터 엔진을 한 칸씩 돌리거나 “한 바퀴”로 자동 재생. 한 바퀴 돌 때마다 바퀴 수가 올라가고 ‘새로 배운 장면’이 바뀝니다(장면 이름은 설명용 예시). 원 위의 칸을 직접 눌러도 됩니다.\n지금: 2025년 6월 오스틴 로보택시(약 10대, 안전요원 동승) → 2026년 10월 옵티머스 생산 시작. 오스틴 일부 로보택시는 2026년 1월 말부터 직원 없이 달리지만, 고객 차에서 쓰는 무인 FSD는 계속 미뤄지고 있습니다.\n돈: 2025년 11월 주주들이 머스크에게 최대 1조 달러(주식)를 주는 보상안을 승인했는데, 조건이 로보택시 100만 대·옵티머스 100만 대·시가총액 8.5조 달러 등입니다. 테슬라가 AI에 모든 걸 거는 이유죠. 2026년 1월엔 테슬라가 머스크의 xAI에 20억 달러를 넣었습니다. 2025년 11월 주주 권고 표결은 기권이 반대로 세어지는 규칙 때문에 부결됐는데도요.\n질문: “차가 많을수록 AI가 똑똑해진다면, 후발 주자는 어떻게 따라잡을 수 있을까요?”',
      html: `
        <style>
          #f-tesla .te-cyc { position: absolute; left: 64px; top: 186px; width: 700px; height: 660px; }
          #f-tesla .te-svg { position: absolute; left: 0; top: 0; overflow: visible; }
          #f-tesla .te-arc { fill: none; stroke: var(--ink-2); stroke-width: 3.5; stroke-linecap: round; }
          #f-tesla .te-arc.done { stroke: var(--pen); stroke-width: 5; }
          #f-tesla .te-head { fill: var(--ink-2); }
          #f-tesla .te-head.done { fill: var(--pen); }
          #f-tesla .te-node { cursor: pointer; outline: none; }
          #f-tesla .te-node rect { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
          #f-tesla .te-node text { fill: var(--ink); font-family: var(--font-body); font-weight: 700; font-size: 26px; }
          #f-tesla .te-node .n { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); font-weight: 600; }
          #f-tesla .te-node.on rect { fill: var(--hl); }
          #f-tesla .te-node.on text { fill: var(--sticky-ink); }
          #f-tesla .te-dot { fill: var(--pen); stroke: var(--paper); stroke-width: 3; }
          #f-tesla .te-car { position: absolute; left: 263px; top: 190px; --w: 174px; --ratio: 4 / 3; --pos: 50% 55%; padding-bottom: 40px; }
          #f-tesla .te-car figcaption { font-size: 26px; }
          #f-tesla .te-cap { position: absolute; left: 6px; top: 498px; width: 680px; min-height: 76px; font-size: 26px; line-height: 1.4; word-break: keep-all; }
          #f-tesla .te-cap b { font-family: var(--font-mono); color: var(--pen); margin-right: 6px; }
          #f-tesla .te-ctl { position: absolute; left: 6px; top: 578px; width: 690px; display: flex; gap: 12px; align-items: center; }
          #f-tesla .te-ctl .btn { white-space: nowrap; flex: none; }
          #f-tesla .te-cases { display: flex; flex-wrap: nowrap; gap: 10px; align-items: center; white-space: nowrap; min-width: 0; }
          #f-tesla .te-cases .lab { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); margin-left: 6px; }
          #f-tesla .te-cases .chip { cursor: default; font-size: 21px; padding: 5px 14px; font-family: var(--font-body); }
          #f-tesla .te-time { left: 820px; top: 226px; width: 506px; display: flex; flex-direction: column; gap: 0; }
          #f-tesla .te-row { display: grid; grid-template-columns: 88px 1fr; gap: 14px; align-items: baseline; padding: 7px 0; word-break: keep-all; border-bottom: 1.5px dashed var(--ink-3); font-size: 24px; line-height: 1.32; }
          #f-tesla .te-row:last-child { border-bottom: 0; }
          #f-tesla .te-row .y { font-family: var(--font-mono); font-weight: 600; font-size: 28px; }
          #f-tesla .te-row small { display: block; font-size: 20px; color: var(--ink-2); }
          #f-tesla .te-row.big { padding: 12px 0; }
          #f-tesla .te-row.big .y { color: var(--pen); }
        </style>
        <div class="kicker">2014 → 2026 · 테슬라</div>
        <h2 class="title">테슬라: 도로 위의 데이터 엔진</h2>
        <div class="abs hand" style="left:84px;top:206px;font-size:36px;line-height:1.05;transform:rotate(-4deg)">카르파시가 소개한<br>‘데이터 엔진’ ↘</div>

        <div class="abs demo te-cyc">
          <svg class="te-svg" width="700" height="500" viewBox="0 0 700 500" aria-label="데이터 엔진 순환 도식"></svg>
          ${Kit.photo('tesla-car', '테슬라', 'wide te-car tilt-r')}
          <div class="te-cap"></div>
          <div class="te-ctl">
            <button class="btn te-next">다음 단계 →</button>
            <button class="btn ghost te-lap">한 바퀴</button>
            <div class="te-cases"></div>
          </div>
        </div>

        <div class="abs te-time">
          <div class="te-row"><span class="y">2014</span><span>모빌아이 칩으로 Autopilot<small>2016 사망사고 뒤 결별</small></span></div>
          <div class="te-row"><span class="y">2017</span><span>OpenAI 창립 멤버 카르파시를 AI 총괄로<small>이듬해 머스크, ‘테슬라 AI와 이해충돌’로 OpenAI&nbsp;이사회 이탈</small></span></div>
          <div class="te-row"><span class="y">2021</span><span>레이더 떼고 <span class="mark">카메라만</span></span></div>
          <div class="te-row big"><span class="y">2024</span><span>FSD(완전 자율주행) v12: 사람이 짠 코드 <span class="mark">30만 줄</span> → 영상으로 배운 신경망 하나</span></div>
          <div class="te-row"><span class="y">2025</span><span>오스틴 로보택시 <small>약 10대 · 조수석에 안전요원</small></span></div>
          <div class="te-row"><span class="y"></span><span>11월 머스크 보상안 최대 <b>1조 달러</b> 승인<small>조건: 로보택시·옵티머스 각 100만 대<br>+ 시가총액 8.5조 달러 등</small></span></div>
          <div class="te-row"><span class="y">2026</span><span>휴머노이드 옵티머스 생산 시작 (10월)<small>1월: 테슬라 → 머스크의 xAI에 20억 달러<br>(주주 표결에선 부결됐는데도)</small></span></div>
        </div>
        ${Kit.photo('karpathy', '카르파시', 'sm tilt-r', 'position:absolute;left:1350px;top:250px;--w:160px')}
        ${Kit.photo('tesla-optimus', '옵티머스', 'sm', 'position:absolute;left:1356px;top:548px;--w:152px;--pos:50% 22%;--tilt:-2deg')}
        <div class="src">출처: 위키백과 Tesla Autopilot·Andrej Karpathy·Optimus · TechSpot 2016(모빌아이) · Tesla 지원 「Tesla Vision」 · FSD v12 릴리스 노트(30만 줄, MarkLines 인용) · TechCrunch 2025.6.22·2025.11.6·2026.10.21 · OpenAI 위키백과(2018 이해충돌) · Dataconomy 2026.1.29 · 카르파시 CVPR 2021 발표(데이터 엔진) · 어려운 장면 이름은 설명용 예시</div>`,
      init(el, K) {
        const svg = el.querySelector('.te-svg');
        const CX = 350, CY = 272, RX = 250, RY = 200, N = ENGINE.length, NW = 196, NH = 62;
        const ang = (i) => (-90 + (360 / N) * i) * Math.PI / 180;
        const P = (a) => [CX + RX * Math.cos(a), CY + RY * Math.sin(a)];
        const inNode = (i, a) => { const [cx, cy] = P(ang(i)), [x, y] = P(a); return Math.abs(x - cx) < NW / 2 + 8 && Math.abs(y - cy) < NH / 2 + 8; };
        const arcs = [], heads = [], nodes = [], arcStart = [];
        for (let i = 0; i < N; i++) {
          let a0 = ang(i), a1 = ang(i) + (2 * Math.PI) / N;
          while (inNode(i, a0) && a0 < a1) a0 += 0.004;
          while (inNode((i + 1) % N, a1) && a1 > a0) a1 -= 0.004;
          arcStart.push(a0);
          const [x0, y0] = P(a0), [x1, y1] = P(a1);
          arcs.push(K.svg('path', { class: 'te-arc', d: `M${x0.toFixed(1)},${y0.toFixed(1)} A${RX},${RY} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}` }, svg));
          // arrowhead along the ellipse tangent at a1
          let tx = -RX * Math.sin(a1), ty = RY * Math.cos(a1);
          const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
          const nx = -ty, ny = tx, sz = 15;
          heads.push(K.svg('path', { class: 'te-head', d: `M${(x1 + tx * 3).toFixed(1)},${(y1 + ty * 3).toFixed(1)} L${(x1 - tx * sz + nx * sz * 0.55).toFixed(1)},${(y1 - ty * sz + ny * sz * 0.55).toFixed(1)} L${(x1 - tx * sz - nx * sz * 0.55).toFixed(1)},${(y1 - ty * sz - ny * sz * 0.55).toFixed(1)} Z` }, svg));
        }
        const dot = K.svg('circle', { class: 'te-dot', r: 11, cx: 0, cy: 0 }, svg);
        ENGINE.forEach(([name], i) => {
          const [x, y] = P(ang(i));
          const w = NW, h = NH;
          const g = K.svg('g', { class: 'te-node', 'data-i': i, transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${[-1.5, 1.2, -0.8, 1.6, -1.2][i]})`, role: 'button', tabindex: 0 }, svg);
          K.svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10 }, g);
          const n = K.svg('text', { class: 'n', x: -w / 2 + 16, y: 8 }, g); n.textContent = String(i + 1);
          const tx = K.svg('text', { x: 10, y: 9, 'text-anchor': 'middle' }, g); tx.textContent = name;
          nodes.push(g);
        });

        const cap = el.querySelector('.te-cap'), casesEl = el.querySelector('.te-cases');
        const st = { i: 0, lap: 1, move: null, queue: 0 };
        function render() {
          nodes.forEach((g, k) => g.classList.toggle('on', k === st.i));
          arcs.forEach((p, k) => { const d = k < st.i; p.classList.toggle('done', d); heads[k].classList.toggle('done', d); });
          cap.innerHTML = `<b>${st.i + 1}</b>${ENGINE[st.i][1]}`;
          casesEl.innerHTML = `<span class="lab">${st.lap}바퀴째 · 새 장면</span><span class="chip on">${CASES[(st.lap - 1) % CASES.length]}</span>`;
        }
        function placeDot(a) { const [x, y] = P(a); dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1)); }
        function restAngle(i) { return arcStart[i % N] + 0.06 + (i >= N ? 2 * Math.PI : 0); }
        function finishMove() {
          st.i = (st.i + 1) % N;
          if (st.i === 0) st.lap++;
          st.move = null;
          placeDot(restAngle(st.i));
          render();
        }
        function advance() {
          if (st.move) finishMove();
          st.move = { from: restAngle(st.i), to: restAngle(st.i + 1), t: 0 };
        }
        el.querySelector('.te-next').addEventListener('click', () => { st.queue = 0; advance(); });
        el.querySelector('.te-lap').addEventListener('click', () => { st.queue = N - 1; advance(); });
        svg.addEventListener('click', (e) => {
          const g = e.target.closest('.te-node'); if (!g) return;
          st.move = null; st.queue = 0; st.i = +g.dataset.i; placeDot(restAngle(st.i)); render();
        });
        K.loop(el, (t, dt) => {
          if (!st.move) return;
          st.move.t += dt / 0.7;
          const e = K.ease(Math.min(1, st.move.t));
          placeDot(K.lerp(st.move.from, st.move.to, e));
          if (st.move.t >= 1) {
            finishMove();
            if (st.queue > 0) { st.queue--; st.move = { from: restAngle(st.i), to: restAngle(st.i + 1), t: -0.25 }; }
          }
        });
        el.__teFinish = () => { if (st.move) finishMove(); while (st.queue > 0) { st.queue--; finishMove(); } };
        placeDot(restAngle(0));
        render();
      },
      leave(el) { el.__teFinish && el.__teFinish(); },
    },

    /* ═════════════════════════ 3. Musk vs OpenAI ═════════════════════════ */
    {
      id: 'musk-vs-openai',
      title: '머스크 vs OpenAI',
      minutes: 1.0,
      notes: '머스크는 2015년 OpenAI를 함께 만든 공동의장이었지만 2018년 이사회를 떠났고, 2023년 자기 AI 회사 xAI를 세웠습니다. xAI는 멤피스에 GPU 약 10만 개짜리 슈퍼컴 Colossus를 122일 만에 지었고, 2025년엔 xAI가 X(트위터)를 인수했고, 2026년엔 SpaceX가 xAI를 흡수했습니다.\n→ 키로 저울 양쪽 주장과 평결을 차례로 보여줍니다. 중요한 점: 2026년 5월 배심원은 “누가 옳은가”가 아니라 “소송 낼 수 있는 기한이 지났다”고 판단했습니다. 그래서 저울은 수평으로 그렸습니다. 머스크는 항소를 예고했고, 11월 현재 항소심 결과는 확인되지 않았습니다.\n질문: “비영리로 시작한 회사가 큰돈이 필요해지면 영리로 바꿔도 될까요? 여러분이 이사회라면?”',
      html: `
        <style>
          #f-musk-vs-openai .mx-left { left: 92px; top: 222px; width: 400px; }
          #f-musk-vs-openai .mx-row { display: grid; grid-template-columns: 74px 1fr; gap: 10px; align-items: baseline; padding: 6px 0; font-size: 23px; line-height: 1.3; border-bottom: 1.5px dashed var(--ink-3); word-break: keep-all; }
          #f-musk-vs-openai .mx-row .y { font-family: var(--font-mono); font-weight: 600; font-size: 24px; }
          #f-musk-vs-openai .mx-row small { display: block; font-size: 20px; color: var(--ink-2); }
          #f-musk-vs-openai .mx-dots { display: block; margin-top: 14px; overflow: visible; }
          #f-musk-vs-openai .mx-dots circle.f { fill: var(--ink); }
          #f-musk-vs-openai .mx-dots circle.o { fill: none; stroke: var(--ink-2); stroke-width: 1.6; }
          #f-musk-vs-openai .mx-dots text { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); }
          #f-musk-vs-openai .mx-dots text.b { fill: var(--ink); font-weight: 600; }
          #f-musk-vs-openai .mx-dots .sep { stroke: var(--pen); stroke-width: 2; stroke-dasharray: 4 5; }
          #f-musk-vs-openai .scale { position: absolute; left: 540px; top: 196px; overflow: visible; }
          #f-musk-vs-openai .scale .ink { fill: none; stroke: var(--ink); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
          #f-musk-vs-openai .scale .pan { fill: var(--paper-2); stroke: var(--ink); stroke-width: 4; stroke-linejoin: round; }
          #f-musk-vs-openai .scale .thin { fill: none; stroke: var(--ink-2); stroke-width: 2.5; }
          #f-musk-vs-openai .scale .fill { fill: var(--ink); }
          #f-musk-vs-openai .scale .lvl { fill: none; stroke: var(--pen); stroke-width: 2.5; stroke-dasharray: 8 7; }
          #f-musk-vs-openai .scale .lvlbg { fill: var(--paper); }
          #f-musk-vs-openai .scale .lvlt { font-family: var(--font-hand); font-size: 34px; fill: var(--pen); paint-order: stroke; stroke: var(--paper); stroke-width: 12px; stroke-linejoin: round; }
          #f-musk-vs-openai .claims { left: 540px; top: 452px; width: 968px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; word-break: keep-all; }
          #f-musk-vs-openai .claims h3 { font-family: var(--font-display); font-weight: 800; font-size: 32px; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 3px solid var(--ink); }
          #f-musk-vs-openai .claims ul { gap: 8px; font-size: 24px; line-height: 1.34; }
          #f-musk-vs-openai .claims small { color: var(--ink-2); font-size: 20px; }
          #f-musk-vs-openai .verdict { left: 1270px; top: 64px; width: 238px; font-size: 34px; --tilt: 2.5deg; padding: 18px 20px 22px; word-break: keep-all; }
          #f-musk-vs-openai .verdict .mono { font-size: 20px; display: block; margin-bottom: 6px; line-height: 1.3; }
          #f-musk-vs-openai .mx-tl { position: absolute; left: 540px; top: 722px; overflow: visible; }
          #f-musk-vs-openai .mx-tl .ax { stroke: var(--ink); stroke-width: 3; fill: none; }
          #f-musk-vs-openai .mx-tl circle { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
          #f-musk-vs-openai .mx-tl circle.hot { fill: var(--hl); }
          #f-musk-vs-openai .mx-tl text { font-family: var(--font-body); font-size: 20px; fill: var(--ink); }
          #f-musk-vs-openai .mx-tl text.y { font-family: var(--font-mono); font-weight: 600; fill: var(--ink-2); }
          #f-musk-vs-openai .mx-tl text.sub { fill: var(--ink-2); }
        </style>
        <div class="kicker">2015 같은 편 → 2026 법정</div>
        <h2 class="title">머스크 <span style="font-weight:500;color:var(--ink-2)">vs</span> OpenAI</h2>

        <div class="abs mx-left">
          <div class="subtitle" style="font-size:30px;margin-bottom:6px">머스크의 AI 회사 xAI</div>
          <div class="mx-row"><span class="y">2023</span><span>xAI 설립 · 11월 챗봇 Grok</span></div>
          <div class="mx-row"><span class="y">2024</span><span>멤피스 슈퍼컴 Colossus</span></div>
          <div class="mx-row"><span class="y">2025</span><span>xAI가 X(트위터) 인수</span></div>
          <div class="mx-row"><span class="y">2026</span><span>SpaceX가 xAI 흡수<small>합산 1조 2,500억 달러 · 6월 상장</small></span></div>
          <svg class="mx-dots" width="400" height="256" viewBox="0 0 400 256" aria-label="Colossus GPU 수, 점 하나가 1,000개"></svg>
        </div>

        <svg class="scale" width="720" height="250" viewBox="0 0 720 250" aria-hidden="true">
          <path class="ink" d="M360,34 L360,236 M296,244 L424,244 M330,236 L390,236"/>
          <path class="ink" d="M70,32 C210,29 510,35 650,32"/>
          <circle class="fill" cx="360" cy="32" r="10"/>
          <path class="thin" d="M70,32 L4,226 M70,32 L136,226 M650,32 L584,226 M650,32 L716,226"/>
          <path class="pan" d="M-10,226 C18,258 122,258 150,226 Z M570,226 C598,258 702,258 730,226 Z"/>
          <g data-step="3">
            <path class="lvl" d="M170,150 L550,150"/>
            <rect class="lvlbg" x="196" y="104" width="328" height="40" rx="4"/>
            <text class="lvlt" x="360" y="134" text-anchor="middle">수평: 내용 아닌 ‘기한’으로 판결</text>
          </g>
        </svg>
        ${Kit.photo('musk', '머스크', 'sm', 'position:absolute;left:550px;top:258px;--w:120px;--tilt:-3deg;padding-bottom:38px')}
        ${Kit.photo('altman', '올트먼', 'sm tilt-r', 'position:absolute;left:1130px;top:258px;--w:120px;padding-bottom:38px')}

        <div class="abs claims">
          <div data-step="1">
            <h3>머스크 측 주장</h3>
            <ul class="dash">
              <li>구글을 견제할 <b>비영리</b>라서 돈을 댔다</li>
              <li>영리 회사로 바꾼 건 약속 위반이다</li>
              <li>부당이득 최대 <b>1,340억 달러</b>를 비영리 쪽에 돌려놓아라</li>
            </ul>
          </div>
          <div data-step="2">
            <h3>OpenAI 측 주장</h3>
            <ul class="dash">
              <li>머스크도 <b>과반 지분·CEO 자리</b>를 원했다 <small>(OpenAI가 공개한 2017–18 이메일)</small></li>
              <li>실제 기부는 4,500만 달러 미만</li>
              <li>나델라 증언: 머스크는 MS 투자에 이의가 없었다</li>
            </ul>
          </div>
        </div>
        <div class="abs sticky verdict" data-step="3"><span class="mono">2026.5.18<br>배심원 만장일치</span>“소송 낼 기한이 지났다” → 머스크 패소, 항소 예고</div>

        <svg class="mx-tl" width="968" height="110" viewBox="0 0 968 110" aria-label="소송 타임라인"></svg>
        <div class="src">출처: 위키백과 Musk v. Altman·xAI·Colossus · OpenAI 「OpenAI and Elon Musk」(2024.3) · Slashdot(2026.4.28 증언) · NBC News 2026.5.18(평결) · The Decoder(항소·1,340억 달러) · CNBC 2026.2.3(SpaceX–xAI) · Decrypt 2026.5(Colossus 1 약 22만 GPU)</div>`,
      init(el, K) {
        /* Colossus drawn to scale: one dot = 1,000 GPUs */
        const dsvg = el.querySelector('.mx-dots');
        const gap = 16.8, ox = 8, oy = 42;
        for (let k = 0; k < 220; k++) {
          const c = Math.floor(k / 10), r = k % 10;
          K.svg('circle', { class: k < 100 ? 'f' : 'o', cx: ox + c * gap, cy: oy + r * gap, r: k < 100 ? 5.6 : 5 }, dsvg);
        }
        K.svg('path', { class: 'sep', d: `M${ox + 9.5 * gap},${oy - 10} L${ox + 9.5 * gap},${oy + 9 * gap + 8}` }, dsvg);
        const t1 = K.svg('text', { class: 'b', x: 0, y: 18 }, dsvg); t1.textContent = '● GPU 약 10만 개 · 122일 만에 (2024)';
        const t2 = K.svg('text', { x: 0, y: 226 }, dsvg); t2.textContent = '● + ○ = 약 22만 개 (2026)';
        const t3 = K.svg('text', { x: 0, y: 252 }, dsvg); t3.textContent = '점 1개 = GPU 1,000개';

        /* lawsuit timeline (order of events, not to scale) */
        const tl = el.querySelector('.mx-tl');
        const ev = [
          ['2015.12', 'OpenAI 창립', '머스크 공동의장'],
          ['2018', '이사회 사임', ''],
          ['2024.2', '머스크 제소', '약속 위반 주장'],
          ['2025.2', '974억 달러', '인수 제안 → 거절'],
          ['2026.4', '배심 재판', '오클랜드 연방법원'],
          ['2026.5', '머스크 패소', '항소 예고'],
        ];
        const x0 = 70, x1 = 900;
        K.svg('path', { class: 'ax', d: K.sketchPath([[20, 32], [480, 33], [948, 31]], { wobble: 1.5, seed: 4 }) }, tl);
        ev.forEach(([y, a, b], i) => {
          const x = x0 + ((x1 - x0) / (ev.length - 1)) * i;
          K.svg('circle', { cx: x, cy: 32, r: 9, class: i >= 2 ? 'hot' : '' }, tl);
          const ty = K.svg('text', { class: 'y', x, y: 12, 'text-anchor': 'middle' }, tl); ty.textContent = y;
          const ta = K.svg('text', { x, y: 70, 'text-anchor': 'middle', 'font-weight': 700 }, tl); ta.textContent = a;
          if (b) { const tb = K.svg('text', { class: 'sub', x, y: 96, 'text-anchor': 'middle' }, tl); tb.textContent = b; }
        });
      },
    },

    /* ═════════════════════════ 4. Godfathers ═════════════════════════ */
    {
      id: 'godfathers',
      title: '‘AI의 대부들’은 왜 서로 다른 말을 하나',
      minutes: 1.0,
      notes: '힌턴·벤지오·르쿤은 2018년 튜링상을 함께 받은 딥러닝의 세 기둥입니다. 그런데 결론이 다릅니다. 힌턴은 2023년 구글을 떠나 위험을 경고하고(인류 멸종 위험 10–20%까지 언급), 벤지오는 국제 AI 안전 보고서를 이끌며 안전 연구 단체 LawZero를 세웠습니다. 르쿤은 “LLM만 키워서는 인간 수준에 못 간다”며 오픈소스와 새 방식(월드모델)을 밀고, 2025년 메타를 떠나 회사를 차렸습니다.\n클릭: 오른쪽 투표. 1(전혀)~5(매우) 중 손을 들게 하고 사람 수만큼 해당 번호를 누릅니다. 잘못 눌렀으면 “되돌리기”, 다음 반은 “초기화”. 결과는 이 컴퓨터에 저장됩니다.\n질문: “같은 기술을 만든 세 사람이 왜 이렇게 다르게 볼까요? 무엇을 알면 여러분 생각이 바뀔까요?”',
      html: `
        <style>
          #f-godfathers .gf-people { left: 92px; top: 214px; width: 970px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
          #f-godfathers .gf-p { display: flex; flex-direction: column; gap: 10px; }
          #f-godfathers .gf-p .photo { align-self: flex-start; margin-left: 8px; }
          #f-godfathers .gf-name { font-family: var(--font-display); font-weight: 800; font-size: 36px; line-height: 1.1; margin-top: 4px; }
          #f-godfathers .gf-q { font-family: var(--font-display); font-weight: 500; font-size: 28px; line-height: 1.34; position: relative; padding-left: 30px; word-break: keep-all; }
          #f-godfathers .gf-q::before { content: "“"; position: absolute; left: 0; top: -12px; font-size: 62px; color: var(--pen); }
          #f-godfathers .gf-did { font-size: 21px; color: var(--ink-2); line-height: 1.38; border-top: 2px solid var(--ink); padding-top: 8px; word-break: keep-all; }
          #f-godfathers .gf-did b { color: var(--ink); }
          #f-godfathers .gf-vote { position: absolute; left: 1100px; top: 196px; width: 412px; height: 640px; display: flex; flex-direction: column; gap: 10px; padding: 22px 24px; }
          #f-godfathers .gf-vote h3 { font-family: var(--font-display); font-weight: 800; font-size: 32px; line-height: 1.2; margin: 0; }
          #f-godfathers .gf-bars { position: relative; flex: none; height: 222px; grid-template-rows: 222px; margin-top: 12px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; align-items: end; border-bottom: 3px solid var(--ink); }
          #f-godfathers .gf-col { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch; }
          #f-godfathers .gf-bar { height: 0; background: var(--ink); border-radius: 3px 3px 0 0; transition: height .45s cubic-bezier(.2,.8,.2,1); min-height: 0; }
          #f-godfathers .gf-col.top .gf-bar { background: var(--pen); }
          #f-godfathers .gf-n { text-align: center; font-family: var(--font-mono); font-weight: 600; font-size: 26px; line-height: 1.15; margin-bottom: 4px; }
          #f-godfathers .gf-ghost { position: absolute; inset: 0; border: 2px dashed var(--ink-3); border-bottom: 0; border-radius: 3px 3px 0 0; pointer-events: none; opacity: .55; }
          #f-godfathers .gf-btns { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
          #f-godfathers .gf-btns .btn { font-family: var(--font-mono); font-size: 30px; padding: 8px 0; }
          #f-godfathers .gf-ends { display: flex; justify-content: space-between; font-size: 20px; color: var(--ink-2); margin-top: -2px; }
          #f-godfathers .gf-who { display: flex; justify-content: space-between; font-family: var(--font-hand); font-size: 28px; color: var(--pen); line-height: 1; margin-top: -4px; }
          #f-godfathers .gf-sum { font-family: var(--font-mono); font-size: 24px; color: var(--ink); font-weight: 600; }
        </style>
        <div class="kicker">2018 튜링상 공동 수상 · 같은 상, 다른 결론</div>
        <h2 class="title" style="font-size:68px">‘AI의 대부들’은 왜 다른 말을 할까?</h2>

        <div class="abs gf-people">
          <div class="gf-p">
            ${Kit.photo('hinton', '제프리 힌턴', '', '--w:220px;--tilt:-2.5deg')}
            <div class="gf-q">통제할 수 있는지<br>알기 전까지는<br>더 키우면 안 된다.</div>
            <div class="gf-did"><b>2023</b> 구글 퇴사 — 위험을 자유롭게 말하려고 · <b>2024</b> 노벨 물리학상</div>
          </div>
          <div class="gf-p" style="margin-top:34px">
            ${Kit.photo('bengio', '요슈아 벤지오', 'tilt-r', '--w:220px')}
            <div class="gf-q">고도의 AI가 사람을 해치지 않게 할 방법을, 우리는 아직 모른다.</div>
            <div class="gf-did"><b>국제 AI 안전 보고서</b> 의장(2025·2026) · 안전 연구 비영리 LawZero</div>
          </div>
          <div class="gf-p" style="margin-top:8px">
            ${Kit.photo('lecun', '얀 르쿤', '', '--w:220px;--tilt:-1deg')}
            <div class="gf-q">LLM을 키우기만 해서는 인간 수준 AI에 못 간다.</div>
            <div class="gf-did"><b>오픈소스</b> 옹호 · <b>2025</b> 메타 퇴사 → 월드모델(세상이 돌아가는 원리를 배우는 AI) 회사 AMI Labs</div>
          </div>
        </div>

        <div class="abs demo box gf-vote">
          <h3>여러분은 AI 위험이<br>얼마나 걱정되나요?</h3>
          <div class="hand" style="font-size:32px;transform:rotate(-1.5deg)">손 든 사람 수만큼 번호를 클릭</div>
          <div class="gf-bars"></div>
          <div class="gf-btns"></div>
          <div class="gf-ends"><span>1 전혀</span><span>5 매우</span></div>
          <div class="gf-who"><span>← 르쿤 쪽</span><span>힌턴·벤지오 쪽 →</span></div>
          <div class="gf-sum push"></div>
          <div class="btns" style="gap:10px"><button class="btn sm ghost gf-undo">되돌리기</button><button class="btn sm ghost gf-reset">초기화</button></div>
        </div>
        <div class="src">출처: Fortune 2023.5.1(힌턴 인용·퇴사) · 노벨위원회 2024 · 벤지오 「Introducing LawZero」(2025.6.3) · 국제 AI 안전 보고서 2025·2026 · Big Technology 팟캐스트 2025(르쿤 인용) · 위키백과 Yann LeCun(2025.11 메타 퇴사) · 튜링상 2018(2019.3 발표)</div>`,
      init(el, K) {
        const KEY = 'godfathers-vote';
        let counts = K.store.get(KEY, [0, 0, 0, 0, 0]);
        if (!Array.isArray(counts) || counts.length !== 5) counts = [0, 0, 0, 0, 0];
        const hist = [];
        const bars = el.querySelector('.gf-bars'), btns = el.querySelector('.gf-btns');
        bars.innerHTML = counts.map((_, i) => `<div class="gf-col" data-i="${i}"><div class="gf-ghost"></div><div class="gf-n">0</div><div class="gf-bar"></div></div>`).join('');
        btns.innerHTML = counts.map((_, i) => `<button class="btn gf-b" data-i="${i}" aria-label="${i + 1}점에 한 표">${i + 1}</button>`).join('');
        const sum = el.querySelector('.gf-sum');
        function render() {
          const max = Math.max(5, ...counts), top = Math.max(...counts);
          const H = 222 - 40;
          bars.querySelectorAll('.gf-col').forEach((c) => {
            const i = +c.dataset.i, n = counts[i];
            c.querySelector('.gf-bar').style.height = (n / max) * H + 'px';
            c.querySelector('.gf-n').textContent = n;
            c.classList.toggle('top', n > 0 && n === top);
            c.querySelector('.gf-ghost').style.top = '34px';
          });
          const tot = counts.reduce((a, b) => a + b, 0);
          const avg = tot ? counts.reduce((a, n, i) => a + n * (i + 1), 0) / tot : 0;
          sum.textContent = tot ? `${tot}명 · 평균 ${avg.toFixed(1)}점` : '아직 0명';
          K.store.set(KEY, counts);
        }
        btns.addEventListener('click', (e) => {
          const b = e.target.closest('.gf-b'); if (!b) return;
          const i = +b.dataset.i; counts[i]++; hist.push(i); render();
        });
        el.querySelector('.gf-undo').addEventListener('click', () => {
          const i = hist.pop(); if (i == null) return; counts[i] = Math.max(0, counts[i] - 1); render();
        });
        el.querySelector('.gf-reset').addEventListener('click', () => { counts = [0, 0, 0, 0, 0]; hist.length = 0; render(); });
        render();
      },
    },

    /* ═════════════════════════ 5. Talent river (optional) ═════════════════════════ */
    {
      id: 'talent-flow',
      title: '인재의 강',
      minutes: 0.8,
      optional: true,
      notes: 'AI 업계의 회사 지도는 사실 “사람이 움직인 길”입니다. 힌턴 연구실에서 수츠케버(→구글→OpenAI→SSI)와 르쿤(박사후연구원→메타→AMI Labs)이, 페이페이 리 연구실에서 카르파시가 나왔습니다. OpenAI에서는 Anthropic(2021)과 Thinking Machines(2025)가 갈라져 나왔고, 구글의 트랜스포머 저자 8명은 모두 떠났습니다(샤지어는 2024년 복귀).\n클릭: 오른쪽 이름이나 강줄기를 누르면 한 사람의 길만 밝게 보이고 위에 설명이 뜹니다. 같은 이름을 다시 누르면 전체 보기로 돌아갑니다. 파란 점은 시간이 흐르는 방향(왼쪽→오른쪽).\n질문: “여러분이 들어갈 첫 팀은 어떤 강의 ‘상류’일까요? 좋은 스승과 동료가 왜 중요할까요?”',
      html: `
        <style>
          #f-talent-flow .tf-svg { position: absolute; left: 92px; top: 208px; overflow: visible; }
          #f-talent-flow .lane { fill: var(--paper-2); }
          #f-talent-flow .lane-t { font-family: var(--font-display); font-weight: 600; font-size: 22px; fill: var(--ink); }
          #f-talent-flow .yr { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); }
          #f-talent-flow .yl { stroke: var(--ink-3); stroke-width: 1.2; stroke-dasharray: 3 7; }
          #f-talent-flow .st-w { fill: none; stroke: var(--pen-soft); stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; transition: stroke .3s; }
          #f-talent-flow .st-l { fill: none; stroke: var(--ink-2); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; transition: stroke .3s, stroke-width .3s; }
          #f-talent-flow .st-hit { fill: none; stroke: transparent; stroke-width: 20; cursor: pointer; pointer-events: stroke; }
          #f-talent-flow .s { transition: opacity .3s; }
          #f-talent-flow .s:hover .st-l { stroke: var(--ink); }
          #f-talent-flow .tf-dot { fill: var(--pen); }
          #f-talent-flow .s.sel .st-w { stroke: var(--hl-soft); stroke-width: 20; }
          #f-talent-flow .s.sel .st-l { stroke: var(--ink); stroke-width: 5; }
          #f-talent-flow.has-sel .s:not(.sel) { opacity: .18; }
          #f-talent-flow .end { cursor: pointer; outline: none; transition: opacity .3s; }
          #f-talent-flow .end rect { fill: transparent; }
          #f-talent-flow .end:hover rect { fill: var(--hl-soft); }
          #f-talent-flow .end.sel rect { fill: var(--hl); }
          #f-talent-flow .end text { font-family: var(--font-body); font-size: 21px; fill: var(--ink-2); }
          #f-talent-flow .end text tspan.nm { font-weight: 700; fill: var(--ink); }
          #f-talent-flow .end.sel text, #f-talent-flow .end.sel text tspan.nm { fill: var(--sticky-ink); }
          #f-talent-flow.has-sel .end:not(.sel) { opacity: .35; }
          #f-talent-flow.has-sel .stn:not(.on) { opacity: .18; }
          #f-talent-flow.has-sel .stn.on { fill: var(--ink); }
          #f-talent-flow .tick { fill: none; stroke: var(--ink-3); stroke-width: 2; }
          #f-talent-flow .spring { fill: var(--ink); }
          #f-talent-flow .sp-t { font-family: var(--font-body); font-size: 21px; fill: var(--ink); font-weight: 700; paint-order: stroke; stroke: var(--paper); stroke-width: 7px; stroke-linejoin: round; }
          #f-talent-flow .stn { font-family: var(--font-body); font-size: 20px; fill: var(--ink-2); transition: opacity .3s; paint-order: stroke; stroke: var(--paper-2); stroke-width: 7px; stroke-linejoin: round; }
          #f-talent-flow .mk { fill: var(--hl); stroke: var(--ink); stroke-width: 2.5; }
          #f-talent-flow .tf-cap { position: absolute; left: 660px; top: 52px; width: 848px; height: 124px; display: flex; gap: 22px; align-items: center; }
          #f-talent-flow .tf-cap .txt { font-size: 25px; line-height: 1.4; word-break: keep-all; }
          #f-talent-flow .tf-cap .photo { --w: 100px; padding: 7px; --ratio: 1 / 1; --pos: 50% 25%; }
          #f-talent-flow .tf-cap .photo figcaption { display: none; }
          #f-talent-flow .tf-cap .photo::before { width: 60%; height: 20px; top: -10px; }
        </style>
        <div class="kicker">2010 → 2026 · 사람이 움직이면 회사가 생긴다</div>
        <h2 class="title" style="margin-top:-6px">인재의 강</h2>
        <div class="abs tf-cap"><div class="hand" style="font-size:40px;transform:rotate(-1.5deg)">오른쪽 이름이나 강줄기를 누르면<br>한 사람의 길만 따라가요 ↘</div></div>
        <svg class="tf-svg demo" width="1416" height="620" viewBox="0 0 1416 620" aria-label="AI 인재 이동 강줄기 도식"></svg>
        <div class="src">출처: 위키백과 Andrej Karpathy·Yann LeCun·Ilya Sutskever·OpenAI·Thinking Machines Lab·Character.ai·Inflection AI · Microsoft 공식 블로그 2024.3.19 · Wired 「8 Google Employees Invented Modern AI」 · 가로 위치(연도)는 대략적</div>`,
      init(el, K) {
        const svg = el.querySelector('.tf-svg');
        const lanes = [
          ['대학 연구실', 52, 126], ['구글 · 딥마인드', 148, 222], ['OpenAI', 240, 322], ['테슬라 · 메타 · MS', 340, 414], ['새 회사 (창업)', 430, 614],
        ];
        lanes.forEach(([t, a, b]) => {
          K.svg('rect', { class: 'lane', x: 0, y: a, width: TF.x1 + 6, height: b - a, rx: 6 }, svg);
          const tx = K.svg('text', { class: 'lane-t', x: 12, y: (a + b) / 2 + 8 }, svg); tx.textContent = t;
        });
        [2010, 2013, 2016, 2019, 2022, 2025].forEach((y) => {
          const x = TX(y);
          K.svg('line', { class: 'yl', x1: x, y1: 30, x2: x, y2: 614 }, svg);
          const tx = K.svg('text', { class: 'yr', x, y: 18, 'text-anchor': 'middle' }, svg); tx.textContent = y;
        });

        const groups = [], ends = [];
        const capHost = el.querySelector('.tf-cap');
        const hintHTML = capHost.innerHTML;
        const layerS = K.svg('g', {}, svg), layerE = K.svg('g', {}, svg);
        STREAMS.forEach((s, i) => {
          const g = K.svg('g', { class: 's', 'data-i': i }, layerS);
          const d = riverPath(s.pts);
          K.svg('path', { class: 'st-w', d }, g);
          s.path = K.svg('path', { class: 'st-l', d }, g);
          K.svg('path', { class: 'st-hit', d }, g);
          s.dots = [0, 1].map(() => K.svg('circle', { class: 'tf-dot', r: 6, cx: -99, cy: -99 }, g));
          groups.push(g);
          const last = s.pts[s.pts.length - 1], ex = TF.x1 + 22, ey = last[1];
          const eg = K.svg('g', { class: 'end', 'data-i': i, role: 'button', tabindex: 0 }, layerE);
          K.svg('rect', { x: ex - 8, y: ey - 13, width: 1416 - ex + 8, height: 26, rx: 5 }, eg);
          K.svg('path', { class: 'tick', d: `M${TF.x1 + 2},${ey} L${ex - 10},${ey}` }, eg);
          const t = K.svg('text', { x: ex, y: ey + 7 }, eg);
          const a = K.svg('tspan', { class: 'nm' }, t); a.textContent = s.name;
          const b = K.svg('tspan', {}, t); b.textContent = ' → ' + s.to;
          ends.push(eg);
        });
        // station notes on top of the streams (paper halo keeps them legible).
        // own = streams the note belongs to: it stays bright when one of them is selected,
        // and sits just clear of that stream's 20px highlight band.
        const notes = [];
        const note = (t, yr, y, own) => { const n = K.svg('text', { class: 'stn', x: TX(yr), y }, svg); n.textContent = t; notes.push([n, own]); };
        note('메타 FAIR', 2014.7, 362, [2]);
        note('테슬라 AI 총괄', 2018.4, 339, [5]);
        note('Inflection', 2022.5, 455, [1]);
        note('Character.AI', 2022.1, 522, [0]);
        // springs + paper marker, drawn above the streams
        K.svg('circle', { class: 'spring', cx: TX(2010), cy: 70, r: 9 }, svg);
        K.svg('circle', { class: 'spring', cx: TX(2010), cy: 102, r: 13 }, svg);
        const sp1 = K.svg('text', { class: 'sp-t', x: TX(2010) + 16, y: 50 }, svg); sp1.textContent = '페이페이 리 연구실 (스탠퍼드)';
        const sp2 = K.svg('text', { class: 'sp-t', x: TX(2010) + 16, y: 145 }, svg); sp2.textContent = '힌턴 연구실 (토론토)';
        K.svg('circle', { class: 'mk', cx: TX(2017.2), cy: 186, r: 9 }, svg);
        note('2017 트랜스포머 논문', 2017.5, 142, [0, 7]);

        let sel = -1;
        function select(i) {
          sel = sel === i ? -1 : i;
          el.classList.toggle('has-sel', sel >= 0);
          groups.forEach((g, k) => g.classList.toggle('sel', k === sel));
          ends.forEach((g, k) => g.classList.toggle('sel', k === sel));
          notes.forEach(([n, own]) => n.classList.toggle('on', own.includes(sel)));
          if (sel < 0) { capHost.innerHTML = hintHTML; return; }
          const s = STREAMS[sel];
          capHost.innerHTML = (s.photo ? K.photo(s.photo, '', 'tilt-r') : '') + `<div class="txt">${s.cap}</div>`;
          layerS.appendChild(groups[sel]);
        }
        svg.addEventListener('click', (e) => {
          const t = e.target.closest('.s, .end'); if (!t) return;
          select(+t.dataset.i);
        });

        let off = 0;
        function placeDots() {
          STREAMS.forEach((s, i) => {
            if (!s.len) s.len = s.path.getTotalLength();
            const L = s.len;
            s.dots.forEach((c, j) => {
              const d = (off * (0.9 + (i % 3) * 0.12) + (j * L) / 2 + i * 57) % L;
              const p = s.path.getPointAtLength(d);
              c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1));
              c.style.opacity = Math.max(0, Math.min(1, d / 40, (L - d) / 40)).toFixed(2);
            });
          });
        }
        placeDots();
        K.loop(el, (t, dt) => { off += dt * 120; placeDots(); });
      },
    },
  ]);
})();
