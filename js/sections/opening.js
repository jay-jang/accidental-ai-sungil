/* Opening: title, today's map, warm-up tally, three questions. */
(function () {
  'use strict';

  /* 正 tally strokes in a 100×100 box (Korean classroom counting) */
  const TALLY = [[10, 12, 90, 12], [50, 12, 50, 90], [50, 50, 84, 50], [24, 42, 24, 90], [6, 90, 94, 90]];
  /* solid strokes for n votes, plus the not-yet-drawn strokes of the next 正 as a faint dashed guide */
  function tallySVG(n) {
    let out = '';
    const full = Math.floor(n / 5), rest = n % 5, groups = Math.min(12, full + 1);
    const line = (s) => `<line x1="${s[0]}" y1="${s[1]}" x2="${s[2]}" y2="${s[3]}"/>`;
    for (let g = 0; g < groups; g++) {
      const k = g < full ? 5 : rest;
      const x = (g % 4) * 62, y = Math.floor(g / 4) * 62;
      out += `<g transform="translate(${x},${y}) scale(0.56)">` + TALLY.slice(0, k).map(line).join('') +
        (k < 5 ? `<g class="w-ghost">${TALLY.slice(k).map(line).join('')}</g>` : '') + '</g>';
    }
    return out;
  }

  Deck.part('opening', 1, [
    {
      id: 'title',
      title: '어쩌다 AI — 성일 정보고 편',
      minutes: 1,
      notes: '인사하고 제목만 읽습니다. 오른쪽 위의 “다음 단어 맞히기”가 사실 오늘 2교시의 핵심(언어 모델은 다음 단어를 확률로 고른다)이라는 것을 살짝 예고만 하고 넘어갑니다.\n아래쪽 작은 프레임들은 오늘 처음과 마지막에 들를 곳입니다.',
      html: `
        <div class="kicker">성일정보고등학교 IT 동아리 특강 · 2026년 11월 · 50분 × 2</div>
        <h1 class="abs display" style="left:86px;top:118px;font-weight:800;font-size:214px;line-height:.9;letter-spacing:-0.035em">어쩌다<br><span class="mark">AI</span></h1>
        <div class="abs hand t-sub" style="left:440px;top:356px;font-size:100px;transform:rotate(-5deg);white-space:nowrap">성일 정보고 편</div>
        <div class="abs row center" style="left:92px;top:556px;gap:18px">
          <span style="font-family:var(--font-display);font-weight:600;font-size:40px">장정식</span>
          <span class="mono muted small">Jungshik Jang · 소프트웨어 엔지니어</span>
        </div>
        <div class="abs demo t-next" style="right:96px;top:150px;width:470px">
          <div class="mono small faint" style="margin-bottom:10px">다음에 올 단어는?</div>
          <div class="mono" style="font-size:40px;margin-bottom:18px">어쩌다 <span class="t-blank" style="border-bottom:4px solid var(--ink);padding:0 10px;display:inline-block;min-width:150px">&nbsp;</span></div>
          <div class="t-bars stack" style="gap:10px"></div>
        </div>
        <div class="abs hand" style="left:96px;top:626px;font-size:38px">↓ 오늘 먼저 들를 곳</div>
        <div class="abs hand" style="left:582px;top:626px;font-size:38px">↓ 마지막에 돌아올 곳</div>
        <div class="abs mono tiny faint t-start" style="right:96px;bottom:40px"><span class="if-mouse">→ 키를 누르면 출발</span><span class="if-touch">아래 ‘다음 ›’을 누르면 출발</span></div>
        <div class="abs hand t-bye" style="right:96px;bottom:26px;font-size:54px">고맙습니다 · 질문은 언제든</div>`,
      init(el, K) {
        /* without Nanum Pen Script (offline Windows PC) the subtitle falls back to a much wider gothic: shrink it so it stays clear of the demo */
        const sub = el.querySelector('.t-sub');
        const fitSub = () => { sub.style.fontSize = '100px'; const w = sub.offsetWidth; if (w > 540) sub.style.fontSize = `${Math.floor((100 * 540) / w)}px`; };
        fitSub();
        if (document.fonts) { document.fonts.ready.then(fitSub); document.fonts.addEventListener('loadingdone', fitSub); }
        const opts = [['AI', 0.61], ['개발자', 0.22], ['여기까지', 0.09], ['보니', 0.05]];
        const bars = el.querySelector('.t-bars');
        bars.innerHTML = opts.map(([w, p]) => `
          <div class="row center" style="gap:14px">
            <span class="mono" style="width:150px;font-size:28px">${w}</span>
            <span style="flex:1;height:22px;background:var(--paper-3);position:relative"><i style="position:absolute;inset:0 auto 0 0;width:${p * 100}%;background:var(--ink)"></i></span>
            <span class="mono num" style="width:70px;text-align:right;font-size:24px">${p.toFixed(2)}</span>
          </div>`).join('');
        const blank = el.querySelector('.t-blank');
        blank.textContent = 'AI';
        let phase = 0, t0 = 0;
        K.loop(el, (t) => {
          if (!t0) t0 = t;
          const dt = t - t0;
          const step = Math.floor(dt / 1.1) % 6;
          if (step !== phase) {
            phase = step;
            const rows = bars.children;
            if (step < 4) {
              for (let i = 0; i < rows.length; i++) rows[i].style.opacity = i === step ? 1 : 0.35;
              blank.textContent = opts[step][0];
            } else {
              for (let i = 0; i < rows.length; i++) rows[i].style.opacity = i === 0 ? 1 : 0.35;
              blank.textContent = 'AI';
            }
          }
        });
      },
      leave(el) { el.querySelectorAll('.t-bars > *').forEach((r) => (r.style.opacity = 1)); el.querySelector('.t-blank').textContent = 'AI'; },
    },
    {
      id: 'map',
      title: '오늘의 지도',
      view: 'world',
      minutes: 1,
      caption: '오늘의 지도<small>왼쪽 고리 1교시, 오른쪽 고리 2교시</small>',
      notes: '전체 지도를 보여줍니다. “이 강의는 슬라이드가 아니라 한 장의 큰 종이입니다. 왼쪽 고리(1교시): 저, AI 개념, AI의 역사. 오른쪽 고리(2교시): ChatGPT의 원리, 폭발적 성장, 회사와 사람, 돈, 그리고 여러분의 미래.”\n마우스 휠로 자유롭게 확대할 수 있다는 것도 보여주면 좋습니다.\n진행 팁: 교시마다 계획 시간이 50분에 꽉 찹니다. 시작 전에 S를 눌러 압축 모드로 둡니다(오른쪽 아래 쪽수 옆에 ‘압축’이 보이면 켜진 것). ‘보충’ 장을 건너뛰어 교시마다 몇 분이 남고, 이 시간은 실습과 Q&A에 씁니다. 각 장의 ‘질문’은 정류장마다 하나만 손을 들게 하고, 나머지는 던지고 바로 넘어갑니다.',
    },
    {
      id: 'warmup',
      title: '어제 하루, AI를 몇 번 썼나요?',
      minutes: 2,
      notes: '손을 들게 하고 사람 수만큼 해당 칸을 클릭합니다(正자로 셉니다. 점선은 다음에 그을 획). 칸을 잘못 눌렀으면 “−”. 가장 많은 칸이 형광펜으로 꽉 차고, 나머지는 그 비율만큼 차오릅니다.\n대부분이 “셀 수 없음”이나 “4–10번”이면: “검색, 번역, 추천, 사진 보정도 다 AI입니다. 우리는 이미 AI 안에서 살고 있어요.”',
      html: `
        <style>
          #f-warmup .w-card > :not(.w-fill) { position: relative; }
          #f-warmup .w-fill { position: absolute; left: 0; right: 0; bottom: 0; height: 0; background: var(--hl-soft); transition: height 0.35s ease; pointer-events: none; }
          #f-warmup .w-ghost { stroke: var(--ink-3); stroke-width: 4; stroke-dasharray: 2 12; }
        </style>
        <div class="kicker">몸풀기 · 손 들어 주세요</div>
        <h2 class="title">어제 하루, AI를 몇 번 썼나요?</h2>
        <div class="demo cols-4 w-cols" style="flex:1;align-items:stretch;gap:24px"></div>
        <div class="row center" style="justify-content:space-between">
          <div class="hand">손 든 사람 수만큼 칸을 클릭! 正 한 글자 = 5명</div>
          <div class="btns demo"><span class="mono small muted w-total" style="align-self:center;margin-right:10px"></span><button class="btn sm ghost w-reset">초기화</button></div>
        </div>`,
      init(el, K) {
        const labels = [['0번', '안 썼다'], ['1–3번', '숙제나 검색'], ['4–10번', '꽤 자주'], ['셀 수 없음', '추천·번역·사진까지']];
        let counts = K.store.get('warmup', [0, 0, 0, 0]);
        const host = el.querySelector('.w-cols');
        host.innerHTML = labels.map(([a, b], i) => `
          <div class="box w-card" data-i="${i}" style="display:flex;flex-direction:column;gap:10px;cursor:pointer;padding:22px 22px 18px;position:relative;overflow:hidden">
            <i class="w-fill"></i>
            <div style="font-family:var(--font-display);font-weight:800;font-size:46px">${a}</div>
            <div class="small muted">${b}</div>
            <svg class="w-tally" viewBox="0 0 248 186" style="width:100%;height:186px;stroke:var(--ink);stroke-width:7;stroke-linecap:round;margin-top:8px"></svg>
            <div class="row center" style="justify-content:space-between;margin-top:auto">
              <b class="mono num w-n" style="font-size:56px"></b>
              <button class="btn sm w-minus" aria-label="${a} 하나 빼기">−</button>
            </div>
          </div>`).join('');
        const render = () => {
          const top = Math.max(1, ...counts);
          host.querySelectorAll('[data-i]').forEach((c) => {
            const i = +c.dataset.i;
            c.querySelector('.w-tally').innerHTML = tallySVG(Math.min(counts[i], 60));
            c.querySelector('.w-n').textContent = counts[i];
            c.querySelector('.w-fill').style.height = `${(counts[i] / top) * 100}%`;
          });
          const tot = counts.reduce((a, b) => a + b, 0);
          el.querySelector('.w-total').textContent = `총 ${tot}명`;
          K.store.set('warmup', counts);
        };
        host.addEventListener('click', (e) => {
          const card = e.target.closest('[data-i]'); if (!card) return;
          const i = +card.dataset.i;
          if (e.target.closest('.w-minus')) counts[i] = Math.max(0, counts[i] - 1); else counts[i]++;
          render();
        });
        el.querySelector('.w-reset').addEventListener('click', () => { counts = [0, 0, 0, 0]; render(); });
        render();
      },
    },
    {
      id: 'questions',
      title: '오늘 끝까지 들고 갈 질문 3개',
      minutes: 1.5,
      notes: '질문 세 개를 읽어주고, 답은 지금 하지 않습니다. “2교시 끝에 이 세 장의 메모로 다시 돌아옵니다.”\n→ 키를 누를 때마다 메모가 한 장씩 붙습니다.',
      html: `
        <style>#f-questions .sticky { word-break: keep-all; }</style>
        <div class="kicker">오늘의 질문</div>
        <h2 class="title">끝까지 들고 갈 질문 3개</h2>
        <div class="row" style="flex:1;align-items:center;justify-content:space-between;gap:40px;padding:0 10px">
          <div class="sticky" data-step="1" style="--tilt:-2.5deg;width:410px;min-height:300px;font-size:60px"><span class="mono" style="font-size:28px">Q1</span><br>AI는 정말<br>‘생각’을 할까?</div>
          <div class="sticky" data-step="2" style="--tilt:1.8deg;width:410px;min-height:300px;margin-top:60px;font-size:60px"><span class="mono" style="font-size:28px">Q2</span><br>왜 하필 <span style="text-decoration:underline">지금</span><br>폭발했을까?</div>
          <div class="sticky" data-step="3" style="--tilt:-1deg;width:410px;min-height:300px;font-size:60px"><span class="mono" style="font-size:28px">Q3</span><br>그럼 나는<br>뭘 준비해야 하지?</div>
        </div>
        <div class="hand" style="align-self:flex-end">답은 2교시 끝에. 지금은 각자 머릿속에 하나씩.</div>`,
    },
  ]);
})();
