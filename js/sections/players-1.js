/* Players · part 1 — the relationship map, Google's roller coaster, Hassabis,
   OpenAI's founding, the split & the money, and the five-day board crisis. */
(function () {
  'use strict';

  /* ───────── face crops: [imgW, imgH, faceX, faceY, headWidth] (fractions of the image) ───────── */
  const FACE = {
    'hinton': [643, 900, 0.48, 0.29, 0.30],
    'lecun': [711, 900, 0.50, 0.30, 0.48],
    'sutskever': [192, 287, 0.47, 0.245, 0.13],
    'karpathy': [490, 665, 0.475, 0.175, 0.15],
    'hassabis': [675, 900, 0.50, 0.27, 0.44],
    'mustafa-suleyman': [720, 900, 0.47, 0.27, 0.33],
    'jeff-dean': [643, 900, 0.56, 0.20, 0.22],
    'altman': [390, 520, 0.50, 0.26, 0.45],
    'musk': [675, 900, 0.50, 0.26, 0.44],
    'dario-amodei': [695, 900, 0.43, 0.29, 0.42],
    'larry-page': [675, 900, 0.48, 0.25, 0.38],
    'satya-nadella': [704, 900, 0.49, 0.30, 0.44],
    'mira-murati': [459, 675, 0.43, 0.17, 0.22],
    'brockman': [723, 900, 0.50, 0.27, 0.42],
  };
  /** where to put a portrait so the face fills a D×D square (px, relative to the square) */
  function faceFit(id, D) {
    const [W, H, fx, fy, hw] = FACE[id];
    let s = (0.66 * D) / (hw * W);
    s = Math.max(s, D / W, D / H);
    const w = W * s, h = H * s;
    let x = D / 2 - fx * w, y = D / 2 - fy * h + D * 0.04;
    x = Math.min(0, Math.max(D - w, x));
    y = Math.min(0, Math.max(D - h, y));
    return { x, y, w, h };
  }
  /** round B&W face as HTML */
  function faceHTML(id, D) {
    const p = faceFit(id, D);
    return `<span class="pl1-face" style="width:${D}px;height:${D}px"><img src="${Kit.img(id)}" alt="" draggable="false" style="width:${p.w.toFixed(1)}px;height:${p.h.toFixed(1)}px;left:${p.x.toFixed(1)}px;top:${p.y.toFixed(1)}px"></span>`;
  }
  /** taped B&W photo, zoomed so the face reads even when the source is a wide shot */
  function tapedFace(id, caption, cls, extra, w, pad, head) {
    const [W, H, fx, fy, hw] = FACE[id];
    const iw = w - pad * 2, ih = iw * 1.25;
    let s = Math.max(((head || 0.5) * iw) / (hw * W), iw / W, ih / H);
    const dw = W * s, dh = H * s;
    let x = iw / 2 - fx * dw, y = ih * 0.4 - fy * dh;
    x = Math.min(0, Math.max(iw - dw, x)); y = Math.min(0, Math.max(ih - dh, y));
    return `<figure class="photo ${cls || ''}" style="--w:${w}px;${extra || ''}"><span class="pl1-zf" style="height:${ih.toFixed(1)}px"><img src="${Kit.img(id)}" alt="${Kit.escape(caption.replace(/<[^>]+>/g, ''))}" draggable="false" style="width:${dw.toFixed(1)}px;height:${dh.toFixed(1)}px;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px"></span><figcaption>${caption}</figcaption></figure>`;
  }
  const SHARED_CSS = `<style>
    .pl1-zf { display: block; position: relative; overflow: hidden; background: #c9ccc4; }
    .pl1-zf img { position: absolute; max-width: none; aspect-ratio: auto !important; object-fit: fill !important; }
    .pl1-face { position: relative; display: inline-block; flex: none; border-radius: 50%; overflow: hidden; border: 3px solid var(--ink); background: #c9ccc4; }
    .pl1-face img { position: absolute; max-width: none; filter: grayscale(1) contrast(1.06); }
  </style>`;

  /* ═════════════════════════ 1. relationship network data ═════════════════════════ */
  // kind p = person (photo), o = organisation (wordmark). x,y in the 1080×660 map.
  const NODES = {
    hinton: { k: 'p', x: 255, y: 150, img: 'hinton', short: '힌턴', name: '제프리 힌턴', en: 'Geoffrey Hinton', one: '딥러닝의 대부. 2023년 “AI 위험을 마음껏 말하려고” 구글을 떠났다. 2024 노벨 물리학상.' },
    lecun: { k: 'p', x: 100, y: 105, img: 'lecun', short: '르쿤', name: '얀 르쿤', en: 'Yann LeCun', one: '힌턴의 박사후연구원 출신. 메타 AI 연구소를 이끌다 2025년 독립.' },
    sutskever: { k: 'p', x: 480, y: 228, img: 'sutskever', short: '수츠케버', name: '일리야 수츠케버', en: 'Ilya Sutskever', one: '힌턴의 제자 → 구글 → OpenAI 공동창업·수석과학자 → 2024년 SSI 창업.' },
    karpathy: { k: 'p', x: 742, y: 252, img: 'karpathy', short: '카르파시', name: '안드레이 카르파시', en: 'Andrej Karpathy', one: 'OpenAI 창립 멤버 → 테슬라 AI 총괄 → 2026년 Anthropic. ‘바이브 코딩’이란 말을 만들었다.' },
    hassabis: { k: 'p', x: 118, y: 562, img: 'hassabis', short: '허사비스', name: '데미스 허사비스', en: 'Demis Hassabis', one: '게임 개발자 출신 신경과학자. DeepMind를 세웠고 2024 노벨 화학상.' },
    suleyman: { k: 'p', x: 412, y: 572, img: 'mustafa-suleyman', short: '술레이만', name: '무스타파 술레이만', en: 'Mustafa Suleyman', one: 'DeepMind 공동창업자 → 2024년 마이크로소프트 AI CEO.' },
    jeffdean: { k: 'p', x: 112, y: 398, img: 'jeff-dean', short: '제프 딘', name: '제프 딘', en: 'Jeff Dean', one: '구글 브레인을 함께 시작한 전설의 엔지니어. 2026년 8월, 27년 만에 구글을 떠나 창업.' },
    altman: { k: 'p', x: 598, y: 168, img: 'altman', short: '올트먼', name: '샘 올트먼', en: 'Sam Altman', one: 'OpenAI 공동창업자·CEO. 2023년 이사회에 해임됐다가 5일 만에 복귀.' },
    musk: { k: 'p', x: 778, y: 98, img: 'musk', short: '머스크', name: '일론 머스크', en: 'Elon Musk', one: 'OpenAI 공동의장으로 시작해 2018년 이탈. 지금은 테슬라와 xAI(SpaceX에 합병).' },
    dario: { k: 'p', x: 590, y: 578, img: 'dario-amodei', short: '아모데이', name: '다리오 아모데이', en: 'Dario Amodei', one: 'OpenAI 출신. 2021년 동생 다니엘라 등과 Anthropic을 세운 CEO.' },
    page: { k: 'p', x: 400, y: 62, img: 'larry-page', short: '페이지', name: '래리 페이지', en: 'Larry Page', one: '구글 공동창업자. AI의 미래를 두고 머스크와 부딪쳤다는 이야기가 있다.' },
    nadella: { k: 'p', x: 985, y: 262, img: 'satya-nadella', short: '나델라', name: '사티아 나델라', en: 'Satya Nadella', one: '2014년부터 마이크로소프트 CEO. 2019년부터 OpenAI에 돈을 댄 회사의 수장.' },
    murati: { k: 'p', x: 440, y: 455, img: 'mira-murati', short: '무라티', name: '미라 무라티', en: 'Mira Murati', one: 'OpenAI CTO. 2023년 해임 사태 때 임시 CEO → 2025년 Thinking Machines Lab 창업.' },
    google: { k: 'o', x: 270, y: 345, w: 136, name: 'Google', one: '검색 회사이자 AI 연구의 원조 강자. 트랜스포머를 발명했다.' },
    deepmind: { k: 'o', x: 270, y: 482, w: 168, name: 'DeepMind', one: '2010 런던에서 창업 → 2014 구글이 인수 → 2023 구글 브레인과 합쳐 Google DeepMind.' },
    openai: { k: 'o', x: 572, y: 345, w: 158, big: true, name: 'OpenAI', one: '2015년 비영리 연구소로 출발 → ChatGPT. 이 지도에서 선이 가장 많이 모이는 곳.' },
    anthropic: { k: 'o', x: 760, y: 508, w: 168, name: 'Anthropic', one: '2021년 OpenAI 출신들이 세운 회사. Claude를 만든다.' },
    microsoft: { k: 'o', x: 880, y: 372, w: 168, name: 'Microsoft', one: '2019년부터 OpenAI의 큰 후원자(2025.10 지분 27%). 그러면서 Anthropic에도 투자한다.' },
    tesla: { k: 'o', x: 965, y: 160, w: 110, name: 'Tesla', one: '머스크의 전기차 회사. 자율주행 AI를 직접 만든다.' },
    xai: { k: 'o', x: 905, y: 62, w: 76, name: 'xAI', one: '머스크가 2023년 세운 AI 회사(Grok). 2026년 SpaceX에 합병됐다.' },
    meta: { k: 'o', x: 100, y: 255, w: 100, name: 'Meta', one: '페이스북의 회사. 르쿤이 이끌던 연구소 FAIR, 공개 모델 LLaMA.' },
    nvidia: { k: 'o', x: 905, y: 470, w: 126, name: 'NVIDIA', one: 'AI 칩(GPU)의 강자. 2025년 10월 세계 첫 시가총액 5조 달러.' },
    amazon: { k: 'o', x: 958, y: 590, w: 136, name: 'Amazon', one: '클라우드(AWS) 회사. Anthropic에 크게 투자하고, OpenAI와도 계약.' },
    ssi: { k: 'o', x: 352, y: 262, w: 76, name: 'SSI', one: 'Safe Superintelligence. 수츠케버가 2024년 세운 회사. 제품 없이 기업가치 320억 달러(2025.4).' },
  };
  // [a, b, type, date, one line]  t = tension · k = tech / teacher / move · m = money / investment / cloud
  const EDGES = [
    ['musk', 'page', 't', '2015', '페이지가 자신을 ‘종 차별주의자’라 불렀다 — 그 자리에 있던 테그마크의 책 『라이프 3.0』(2017)과 머스크의 법정 증언(2026.4). 페이지 쪽 입장은 없음', -46],
    ['musk', 'openai', 't', '2017–18', 'OpenAI가 공개한 이메일: 머스크가 과반 지분·CEO 자리 또는 테슬라 합병을 요구 → 거절 후 이사회 사임'],
    ['dario', 'openai', 't', '2020.12', '비전과 신뢰가 달라 11명이 함께 퇴사 → Anthropic 창업(공동창업자 7명)'],
    ['google', 'openai', 't', '2022.12', 'ChatGPT가 검색을 위협하자 구글 경영진이 ‘코드 레드’ 선언'],
    ['hinton', 'lecun', 't', '2023.5~', '힌턴은 AI 위험을 경고, 르쿤은 “AI가 인류를 구할 수도” — 옛 스승과 정반대'],
    ['sutskever', 'altman', 't', '2023.11', '이사회가 올트먼 해임(수츠케버 참여) → 5일 만에 복귀, 수츠케버는 “깊이 후회”'],
    ['hinton', 'altman', 't', '2024.10', '힌턴: “제자(수츠케버)가 올트먼을 해고한 게 자랑스럽다”'],
    ['musk', 'altman', 't', '2024.2', '머스크 소송 → 2026.5 배심원 “제기 시한이 지났다”, 머스크 패소(항소 예고)'],
    ['meta', 'openai', 't', '2025.6', '메타 초지능 연구소의 인재 빼오기 — 최대 1억 달러 제안 보도'],
    ['deepmind', 'openai', 't', '2025.12', 'Gemini 3에 밀린 올트먼이 사내 ‘코드 레드’ — 3년 만의 역전'],
    ['anthropic', 'openai', 't', '2026.2', '슈퍼볼 광고 “Claude엔 광고 없다” vs 올트먼 “명백히 부정직하다”'],
    ['anthropic', 'openai', 't', '2026.2', '감시·자율무기 제한을 지킨 Anthropic에 트럼프 행정부가 사용 중단 지시 → 다음 날 OpenAI가 국방부 기밀망 계약 발표', 15],

    ['hinton', 'lecun', 'k', '1987', '토론토에서 힌턴의 박사후연구원'],
    ['hinton', 'sutskever', 'k', '2012', '박사과정 제자. 함께 AlexNet으로 ImageNet 우승'],
    ['hinton', 'google', 'k', '2013–23', '구글에서 10년 → 2023.5 AI 위험을 말하려고 퇴사'],
    ['sutskever', 'openai', 'k', '2015', '공동창업·수석과학자 → 2024.5 퇴사'],
    ['sutskever', 'ssi', 'k', '2024.6', 'Safe Superintelligence 창업'],
    ['karpathy', 'openai', 'k', '2015', '창립 멤버 (2023년에 잠시 복귀)'],
    ['karpathy', 'tesla', 'k', '2017–22', '테슬라 AI 디렉터, 머스크에게 직접 보고'],
    ['karpathy', 'anthropic', 'k', '2026.5', 'Anthropic 사전학습팀 합류(팀장은 닉 조셉) — Claude로 사전학습 연구를 앞당기는 새 팀을 꾸림'],
    ['hassabis', 'deepmind', 'k', '2010.11', '공동창업·CEO → 2026.8부터 의장 겸 알파벳 수석과학자'],
    ['suleyman', 'deepmind', 'k', '2010.11', '공동창업'],
    ['suleyman', 'microsoft', 'k', '2024.3', 'Microsoft AI CEO로 이직 (MS는 그의 회사 Inflection에 약 6.5억 달러 지불)'],
    ['google', 'deepmind', 'k', '2023.4', '구글 브레인과 합쳐 Google DeepMind 출범, CEO 허사비스'],
    ['jeffdean', 'google', 'k', '2011', '구글 브레인을 함께 시작 → 2026.8 퇴사·창업'],
    ['dario', 'anthropic', 'k', '2021', '남매가 함께 창업, CEO'],
    ['openai', 'anthropic', 'k', '2024', '레이케(5월)·슐먼(8월)이 OpenAI → Anthropic'],
    ['murati', 'openai', 'k', '2024.9', 'CTO로 일하다 퇴사 → 2025.2 Thinking Machines Lab 창업'],
    ['lecun', 'meta', 'k', '2013.12', 'FAIR 초대 디렉터 → 2025.11 퇴사 발표, AMI Labs 창업'],
    ['deepmind', 'anthropic', 'k', '2026.6', '노벨상 수상자 존 점퍼가 약 9년 만에 DeepMind를 떠나 Anthropic으로', -40],
    ['altman', 'openai', 'k', '2015', '공동창업, 지금은 CEO'],
    ['musk', 'openai', 'k', '2015.12', '공동의장으로 OpenAI를 함께 세움'],
    ['musk', 'tesla', 'k', '2008~', 'CEO'],
    ['musk', 'xai', 'k', '2023.3', 'xAI 설립 (챗봇 Grok)'],
    ['page', 'google', 'k', '1998', '세르게이 브린과 공동창업'],
    ['nadella', 'microsoft', 'k', '2014.2', 'CEO 취임'],

    ['google', 'hinton', 'm', '2013.3', '힌턴과 제자 2명의 회사 DNNresearch를 4,400만 달러에 인수'],
    ['google', 'deepmind', 'm', '2014.1', '4억 파운드(보도: 약 4억~6.5억 달러)에 인수'],
    ['microsoft', 'openai', 'm', '2019–23', '10억 → 20억 → 약 100억 = 누적 약 130억 달러, Azure 클라우드 독점(2026.4 재계약으로 종료)'],
    ['amazon', 'anthropic', 'm', '2023–26', '총 80억 달러(2023–24) + 2026.4 즉시 50억·조건부 최대 200억 달러'],
    ['google', 'anthropic', 'm', '2023–26', '투자 약 30억 달러(2023–25) + 2026.4 즉시 100억·조건부 최대 300억 달러. TPU 칩도 최대 100만 개(2025.10) → 2027년부터 5GW 분량(2026.4)', 22],
    ['nvidia', 'openai', 'm', '2025.9', '최대 1,000억 달러 의향서 → 2026.2 300억 달러 지분 투자로 바뀜'],
    ['microsoft', 'anthropic', 'm', '2025.11', '최대 50억 달러 투자, Anthropic은 Azure 300억 달러 구매 약정'],
    ['nvidia', 'anthropic', 'm', '2025.11', '최대 100억 달러 투자'],
    ['tesla', 'xai', 'm', '2026.1', '약 20억 달러 투자 — 주주 표결이 부결됐는데도'],
    ['amazon', 'openai', 'm', '2025.11', 'AWS 380억 달러 클라우드 계약, 2026년 투자 라운드에 최대 500억 달러'],
    ['xai', 'anthropic', 'm', '2026.5', '경쟁사 Anthropic이 머스크 쪽 슈퍼컴 Colossus 1을 빌려 씀', 18],
  ];
  const TYPE_NAME = { t: '긴장', k: '기술·이직', m: '돈' };

  /* ═════════════════════════ 2. Google roller coaster data ═════════════════════════ */
  // lv = mood (0 low … 1 high), not a measured quantity
  const GOOG = [
    { d: '2011', h: '브레인 출범', lv: 0.36, pos: 'a', ph: ['jeff-dean', '제프 딘'], b: '구글 X 안에서 앤드루 응·제프 딘 등이 딥러닝 팀 ‘구글 브레인’을 시작.' },
    { d: '2012.6', h: '고양이 논문', lv: 0.5, pos: 'a', stat: ['16,000', '개의 CPU 코어로 학습'], b: '유튜브 이미지 1천만 장을 보여 줬더니, 아무도 안 가르쳐 준 ‘고양이’를 스스로 알아봤다.' },
    { d: '2013.3', h: '힌턴 영입', lv: 0.6, pos: 'b', ph: ['hinton', '제프리 힌턴'], b: '힌턴과 제자 2명의 3인 회사 DNNresearch를 4,400만 달러에 인수. 사실상 사람을 산 것.' },
    { d: '2014.1', h: 'DeepMind 인수', lv: 0.72, pos: 'a', ph: ['larry-page', '래리 페이지'], b: '런던의 DeepMind를 4억 파운드(보도)에 인수. 당시 CEO는 래리 페이지.' },
    { d: '2016.5', h: 'TPU 공개', lv: 0.83, pos: 'b', ph: ['tpu', 'TPU'], wide: true, b: 'AI 전용 칩 TPU 공개. 사실은 이미 1년 넘게 데이터센터에서 몰래 쓰고 있었다.' },
    { d: '2017.6', h: '트랜스포머', lv: 0.97, pos: 'a', stat: ['15만+', '번 인용된 논문'], b: '구글 연구원 8명의 논문이 GPT·Claude·Gemini의 ‘T’가 됐다. 그런데 8명 모두 구글을 떠났다. 2024년 구글은 약 27억 달러를 내고 샤지어를 다시 데려왔다.' },
    { d: '2022.12', h: '코드 레드', lv: 0.42, pos: 'b', ph: ['sundar-pichai', '순다르 피차이'], b: 'ChatGPT가 검색을 위협하자 ‘코드 레드’. 구글에도 대화 AI LaMDA가 있었지만, 틀린 답이 신뢰를 깎는 ‘평판 위험’ 때문에 미뤄 왔다. 잃을 게 많은 1등은 조심했다.' },
    { d: '2023.2', h: 'Bard 망신', lv: 0.08, pos: 'b', ph: ['satya-nadella', '사티아 나델라'], b: '나델라 “우리가 그들을 춤추게 했다” 다음 날, Bard 광고 속 오답 → 알파벳 시가총액 1,000억 달러 증발.' },
    { d: '2023.4', h: '두 연구소 통합', lv: 0.26, pos: 'b', ph: ['hassabis', '데미스 허사비스'], b: '라이벌이던 구글 브레인과 DeepMind를 합쳐 Google DeepMind 출범. CEO는 허사비스.' },
    { d: '2023.12', h: 'Gemini 1.0', lv: 0.46, pos: 'b', stat: ['Gemini', '구글의 대답'], b: '구글의 새 대표 모델 Gemini 공개. 반격의 시작.' },
    { d: '2025.11', h: 'Gemini 3', lv: 0.9, pos: 'a', ph: ['altman', '샘 올트먼'], b: 'Gemini 3 Pro 출시. 다음 달, 이번엔 OpenAI의 올트먼이 사내에 ‘코드 레드’를 선언했다.' },
    { d: '2026.10', h: '10억 명, 그리고…', lv: 0.66, pos: 'b', ph: ['sundar-pichai', '순다르 피차이'], b: 'Gemini 앱 사용자 10억 명 돌파(10.28 실적 발표). 다음 날엔 검색 성장 둔화·AI 투자 부담 우려로 알파벳 시가총액이 하루 약 5,000억 달러 줄었다.' },
  ];

  /* ═════════════════════════ 5. OpenAI valuation (USD, 억) ═════════════════════════ */
  const OAI_VAL = [['2024.10', '1,570억', 1570], ['2025.3', '3,000억', 3000], ['2025.10', '5,000억', 5000], ['2026.3', '8,520억', 8520], ['2026.11', '약 1조 2,500억 (보도)', 12500]];

  /* ═════════════════════════ 6. board crisis data ═════════════════════════ */
  const CRISIS = [
    {
      days: [17], tag: '해임', wd: '금', head: '11월 17일 금요일',
      photos: [['altman', '샘 올트먼', 'tilt-0'], ['sutskever', '수츠케버 <small>이사</small>', 'tilt-r']],
      items: ['이사회: “올트먼이 이사회에 늘 솔직하지는 않았다” → CEO 해임', '올트먼은 발표 직전 화상회의로 통보받음', '미라 무라티 CTO가 임시 CEO, 브록먼은 의장에서 밀려나자 사임'],
      sign: 0,
    },
    {
      days: [18, 19], tag: '협상 · 결렬', wd: '토 · 일', head: '11월 18–19일 주말',
      photos: [['mira-murati', '미라 무라티', 'tilt-0']],
      items: ['주말 내내 올트먼 복귀 협상 → 결렬', '일요일 밤, 이사회가 임시 CEO를 다시 교체: 무라티 → 에밋 시어'],
      extra: ['에밋 시어', '트위치 공동창업자'],
      sign: 0,
    },
    {
      days: [20], tag: '집단 서명', wd: '월', head: '11월 20일 월요일',
      photos: [['satya-nadella', '사티아 나델라', 'tilt-0'], ['sutskever', '수츠케버', 'tilt-r']],
      items: ['MS 나델라: 올트먼·브록먼을 영입한다고 발표', '직원 770명 중 700명 넘게 서명: “이사회가 물러나지 않으면 MS로 가겠다”', '해임에 참여했던 수츠케버도 서명 — “깊이 후회한다”'],
      sign: 700,
    },
    {
      days: [21, 22], tag: '복귀', wd: '화 · 수', head: '11월 21–22일',
      photos: [['altman', '샘 올트먼', 'tilt-r']],
      extra: ['브렛 테일러', '새 이사회 의장', 'left:176px;top:150px'],
      items: ['21일 밤, 올트먼 CEO 복귀 합의 발표', '새 이사회: 의장 브렛 테일러, 래리 서머스, 애덤 디앤젤로(기존 이사 중 혼자 남음)', '2년 뒤 공개된 증언: 수츠케버는 “최소 1년” 해임을 검토했고 52쪽 메모를 썼다'],
      sign: 700,
    },
  ];

  Deck.part('players', 1, [
    /* ═════════════════════════ 1. NETWORK ═════════════════════════ */
    {
      id: 'network',
      title: '누가 누구와 엮여 있나 — 관계 지도',
      minutes: 1.4,
      notes: 'AI 업계는 생각보다 좁습니다. 스승과 제자, 함께 창업했다가 갈라선 사람들, 경쟁사에 동시에 돈을 대는 빅테크가 한 장의 지도에 다 들어갑니다.\n처음엔 전체 지도와 오른쪽 ‘선 읽는 법’이 보입니다. 먼저 수츠케버 사진을 눌러 보세요: 힌턴의 제자 → OpenAI 공동창업 → 올트먼 해임 사태 → SSI. 오른쪽 목록의 항목을 누르면 그 사람/회사로 건너갑니다. 위의 [긴장] [기술] [돈] 칩을 누르면 선택이 풀리고 그 종류의 선만 남으며, 오른쪽에 그 목록이 날짜순으로 나옵니다(그 상태에서 노드를 누르면 그 노드의 그 종류 선만). 특히 [돈]을 누르면 MS·아마존·엔비디아가 OpenAI와 Anthropic 양쪽에 다 돈을 넣은 게 보입니다. 빈 곳을 누르면 선택이 풀리고, 목록이 길면 마우스 휠로 굴립니다.\n질문: “선이 가장 많이 모이는 곳은 어디인가요? 왜 그럴까요?”',
      html: `${SHARED_CSS}
        <style>
          #f-network .nw-title { position: absolute; left: 92px; top: 56px; }
          #f-network .nw-title .title { font-size: 54px; }
          #f-network .nw-chips { position: absolute; left: 660px; top: 92px; display: flex; gap: 10px; }
          #f-network .nw-chips .chip { font-family: var(--font-body); font-weight: 600; font-size: 22px; padding: 7px 16px; }
          #f-network .nw-chips .chip svg { display: block; overflow: visible; }
          #f-network .nw-chips .chip.on svg line { stroke: var(--paper) !important; }
          #f-network .nw-svg { position: absolute; left: 40px; top: 186px; overflow: visible; }
          #f-network .e { fill: none; stroke-linecap: round; transition: opacity .25s, stroke-width .2s; }
          #f-network .e.t { stroke: var(--rel-tension); stroke-width: 3; stroke-dasharray: 9 7; }
          #f-network .e.k { stroke: var(--rel-tech); stroke-width: 2.5; }
          #f-network .e.m { stroke: var(--rel-money); stroke-width: 4.5; }
          #f-network .e.off { display: none; }
          #f-network svg.sel .e { opacity: 0.25; }
          #f-network svg.sel .e.hot { opacity: 1; stroke-width: 4.5; }
          #f-network svg.sel .e.m.hot { stroke-width: 6.5; }
          #f-network svg .e.pick { opacity: 1 !important; stroke-width: 8 !important; }
          #f-network .nd { cursor: pointer; transition: opacity .25s; }
          #f-network .nd .halo { fill: var(--hl-soft); opacity: 0; }
          #f-network .nd.on .halo { opacity: 1; }
          #f-network .nd .ring { fill: none; stroke: var(--ink); stroke-width: 3; }
          #f-network .nd image { filter: grayscale(1) contrast(1.06); }
          #f-network .nd .bg { fill: #c9ccc4; }
          #f-network .nd .nm { font-family: var(--font-body); font-weight: 600; font-size: 21px; fill: var(--ink); text-anchor: middle; paint-order: stroke; stroke: var(--paper); stroke-width: 6px; stroke-linejoin: round; }
          #f-network .nd .box { fill: var(--paper); stroke: var(--ink); stroke-width: 2.5; }
          #f-network .nd.on .box { fill: var(--hl); }
          #f-network .nd .wm { font-family: var(--font-display); font-weight: 800; font-size: 25px; fill: var(--ink); text-anchor: middle; dominant-baseline: central; }
          #f-network .nd.on .wm { fill: #1b2630; }
          #f-network .nd.big .wm { font-size: 30px; }
          #f-network .nd:hover .ring, #f-network .nd:hover .box { stroke: var(--pen); stroke-width: 4; }
          #f-network svg.sel .nd.dim { opacity: 0.6; }
          #f-network .src { right: 470px; }
          #f-network svg .nd.faint { opacity: 0.35; }
          #f-network .nw-panel { position: absolute; left: 1150px; top: 50px; width: 418px; height: 804px; padding: 22px 22px 18px 26px; background: var(--paper-2); border-left: 4px solid var(--ink); display: flex; flex-direction: column; gap: 12px; }
          #f-network .nw-head { display: flex; align-items: center; gap: 16px; min-height: 96px; }
          #f-network .nw-name { font-family: var(--font-display); font-weight: 800; font-size: 34px; line-height: 1.1; word-break: keep-all; }
          #f-network .nw-en { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); margin-top: 4px; }
          #f-network .nw-wm { font-family: var(--font-display); font-weight: 800; font-size: 46px; line-height: 1; border: 3px solid var(--ink); padding: 10px 16px 12px; background: var(--paper); transform: rotate(-1.5deg); }
          #f-network .nw-one { font-size: 23px; line-height: 1.4; word-break: keep-all; }
          #f-network .nw-meta { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); border-top: 2px solid var(--ink); padding-top: 10px; }
          #f-network .nw-rels { list-style: none; margin: 0; padding: 0 6px 0 0; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; flex: 1; min-height: 0; }
          #f-network .nw-rels li { display: grid; grid-template-columns: 30px 1fr; column-gap: 8px; padding: 7px 6px; border-radius: 4px; cursor: pointer; }
          #f-network .nw-rels li:hover { background: var(--hl-soft); }
          #f-network .nw-rels li svg { margin-top: 12px; overflow: visible; }
          #f-network .nw-rels .r1 { font-size: 20px; line-height: 1.3; }
          #f-network .nw-rels .r1 b { font-weight: 700; }
          #f-network .nw-rels .r1 .mono { color: var(--ink-2); margin-right: 8px; }
          #f-network .nw-rels .r2 { font-size: 20px; line-height: 1.32; color: var(--ink-2); word-break: keep-all; }
          #f-network .nw-legend { display: flex; flex-direction: column; gap: 16px; font-size: 23px; line-height: 1.35; }
          #f-network .nw-legend div { display: grid; grid-template-columns: 56px 1fr; gap: 12px; align-items: center; }
          #f-network .nw-more { font-family: var(--font-mono); font-size: 20px; color: var(--pen); text-align: right; margin-top: -4px; }
          #f-network .nw-more[hidden] { display: none; }
          #f-network .nw-sub { font-size: 22px; line-height: 1.35; color: var(--ink-2); word-break: keep-all; }
          #f-network .nw-hint { font-family: var(--font-hand); font-size: 36px; color: var(--pen); line-height: 1.1; }
        </style>
        <div class="nw-title">
          <div class="kicker">관계 지도 · 1987 → 2026</div>
          <h2 class="title">누가 누구와 엮여 있나</h2>
        </div>
        <div class="demo" style="position:absolute;inset:0">
          <div class="nw-chips">
            <button class="chip" data-f="t"><svg width="36" height="10"><line x1="2" y1="5" x2="34" y2="5" style="stroke:var(--rel-tension);stroke-width:4;stroke-dasharray:7 5"/></svg>긴장</button>
            <button class="chip" data-f="k"><svg width="36" height="10"><line x1="2" y1="5" x2="34" y2="5" style="stroke:var(--rel-tech);stroke-width:4"/></svg>기술</button>
            <button class="chip" data-f="m"><svg width="36" height="10"><line x1="2" y1="5" x2="34" y2="5" style="stroke:var(--rel-money);stroke-width:6"/></svg>돈</button>
            <button class="chip on" data-f="all">모두</button>
          </div>
          <svg class="nw-svg" width="1080" height="660" viewBox="0 0 1080 660">
            <defs class="nw-defs"></defs>
            <rect class="nw-bgclick" x="-40" y="-20" width="1120" height="700" fill="transparent"/>
            <g class="nw-edges"></g>
            <g class="nw-nodes"></g>
          </svg>
          <aside class="nw-panel"></aside>
        </div>
        <div class="src">출처: 각 사 발표, OpenAI·Anthropic·Google DeepMind·인물별 위키백과, NYT·CNBC·Fortune·NPR·TechCrunch 보도, Musk v. Altman 법정 기록 (2026.11.9 기준). 페이지–머스크 일화는 테그마크(2017)·머스크 증언 기준, 페이지 쪽 입장은 없음.</div>`,
      init(el, K) {
        const svg = el.querySelector('.nw-svg');
        const defs = svg.querySelector('.nw-defs');
        const gE = svg.querySelector('.nw-edges'), gN = svg.querySelector('.nw-nodes');
        const panel = el.querySelector('.nw-panel');
        const R = 33;
        const ns = (tag, attrs, parent) => K.svg(tag, attrs, parent);

        // org half-sizes
        const half = (id) => { const n = NODES[id]; return n.k === 'p' ? null : [n.w / 2, n.big ? 30 : 26]; };
        // point on a node's border, heading from its centre toward (tx,ty)
        function rim(id, tx, ty) {
          const n = NODES[id];
          const dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy) || 1;
          if (n.k === 'p') return [n.x + (dx / d) * (R + 5), n.y + (dy / d) * (R + 5)];
          const [hw, hh] = half(id);
          const s = Math.min((hw + 5) / Math.abs(dx || 1e-6), (hh + 5) / Math.abs(dy || 1e-6));
          return [n.x + dx * s, n.y + dy * s];
        }

        // edges (parallel pairs bow apart)
        const pairCount = {}, pairSeen = {};
        EDGES.forEach((e) => { const key = [e[0], e[1]].sort().join('|'); pairCount[key] = (pairCount[key] || 0) + 1; });
        const edgeEls = EDGES.map((e, i) => {
          const [a, b, t] = e;
          const A = NODES[a], B = NODES[b];
          const key = [a, b].sort().join('|');
          const idx = (pairSeen[key] = (pairSeen[key] || 0) + 1) - 1;
          let bend = e[5] || 0;
          if (pairCount[key] > 1) bend += idx === 0 ? -15 : 15;
          // normal is computed in the canonical (sorted) direction so parallel edges separate
          const [p, q] = a < b ? [A, B] : [B, A];
          const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
          const L = Math.hypot(q.x - p.x, q.y - p.y) || 1;
          const nx = -(q.y - p.y) / L, ny = (q.x - p.x) / L;
          const cx = mx + nx * bend * 2, cy = my + ny * bend * 2;
          const s = rim(a, cx, cy), f = rim(b, cx, cy);
          const path = ns('path', { d: `M${s[0].toFixed(1)},${s[1].toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${f[0].toFixed(1)},${f[1].toFixed(1)}`, class: 'e ' + t }, gE);
          path.dataset.i = i;
          return path;
        });

        // nodes
        const nodeEls = {};
        Object.keys(NODES).forEach((id) => {
          const n = NODES[id];
          const g = ns('g', { class: 'nd ' + n.k + (n.big ? ' big' : ''), transform: `translate(${n.x},${n.y})`, tabindex: '0', role: 'button', 'aria-label': n.name }, gN);
          g.dataset.id = id;
          if (n.k === 'p') {
            ns('circle', { class: 'halo', r: R + 15 }, g);
            const cp = ns('clipPath', { id: 'pl1nw-' + id }, defs);
            ns('circle', { r: R, cx: 0, cy: 0 }, cp);
            ns('circle', { class: 'bg', r: R }, g);
            const D = R * 2, fit = faceFit(n.img, D);
            ns('image', { href: K.img(n.img), x: (fit.x - R).toFixed(1), y: (fit.y - R).toFixed(1), width: fit.w.toFixed(1), height: fit.h.toFixed(1), preserveAspectRatio: 'none', 'clip-path': `url(#pl1nw-${id})` }, g);
            ns('circle', { class: 'ring', r: R }, g);
            const tx = ns('text', { class: 'nm', y: R + 25 }, g);
            tx.textContent = n.short;
          } else {
            const [hw, hh] = half(id);
            ns('rect', { class: 'halo', x: -hw - 12, y: -hh - 12, width: hw * 2 + 24, height: hh * 2 + 24, rx: 10 }, g);
            ns('rect', { class: 'box', x: -hw, y: -hh, width: hw * 2, height: hh * 2, rx: 3, transform: `rotate(${((id.length % 3) - 1) * 1.2})` }, g);
            const tx = ns('text', { class: 'wm', y: 1 }, g);
            tx.textContent = n.name;
          }
          nodeEls[id] = g;
        });

        let sel = null, filter = 'all';
        const sortKey = (d) => { const m = /(\d{4})(?:\.(\d{1,2}))?/.exec(d); return m ? +m[1] + (m[2] ? +m[2] / 100 : 0) : 0; };
        const sw = (t) => `<svg width="30" height="8"><line x1="1" y1="4" x2="29" y2="4" style="stroke:var(${t === 't' ? '--rel-tension' : t === 'k' ? '--rel-tech' : '--rel-money'});stroke-width:${t === 'm' ? 6 : 4}${t === 't' ? ';stroke-dasharray:6 4' : ''}"/></svg>`;
        const visible = (e) => filter === 'all' || e[2] === filter;

        const label = (id) => (NODES[id].k === 'p' ? NODES[id].short : NODES[id].name);
        const TYPE_DESC = { t: '갈등·소송·경쟁', k: '스승과 제자, 창업, 이직', m: '인수, 투자, 클라우드 계약' };
        function updateMore() {
          const ol = panel.querySelector('.nw-rels'), more = panel.querySelector('.nw-more');
          if (!ol || !more) return;
          more.hidden = ol.scrollHeight <= ol.clientHeight + 4 || ol.scrollTop + ol.clientHeight >= ol.scrollHeight - 4;
        }
        function renderPanel() {
          if (!sel && filter !== 'all') {
            const list = EDGES.map((e, i) => ({ e, i })).filter(({ e }) => e[2] === filter);
            list.sort((x, y) => sortKey(x.e[3]) - sortKey(y.e[3]));
            panel.innerHTML = `
              <div class="nw-name">‘${TYPE_NAME[filter]}’ 선 ${list.length}개</div>
              <div class="nw-sub">${TYPE_DESC[filter]} · 사진이나 회사를 누르면 그 노드의 선만</div>
              <div class="nw-meta"></div>
              <ol class="nw-rels" data-scroll>${list.map(({ e, i }) => `<li data-o="${e[0]}" data-i="${i}">${sw(e[2])}<div><div class="r1"><span class="mono">${e[3]}</span><b>${label(e[0])} – ${label(e[1])}</b></div><div class="r2">${e[4]}</div></div></li>`).join('')}</ol>
              <div class="nw-more" hidden>↓ 굴리면 더 있어요</div>`;
            requestAnimationFrame(updateMore);
            return;
          }
          if (!sel) {
            const cnt = { t: 0, k: 0, m: 0 };
            EDGES.forEach((e) => cnt[e[2]]++);
            panel.innerHTML = `
              <div class="nw-name">선 읽는 법</div>
              <div class="nw-legend">
                <div>${sw('t').replace('width="30"', 'width="52"').replace('x2="29"', 'x2="51"')}<span><b>긴장</b> — 갈등·소송·경쟁 (${cnt.t})</span></div>
                <div>${sw('k').replace('width="30"', 'width="52"').replace('x2="29"', 'x2="51"')}<span><b>기술</b> — 스승과 제자, 창업, 이직 (${cnt.k})</span></div>
                <div>${sw('m').replace('width="30"', 'width="52"').replace('x2="29"', 'x2="51"')}<span><b>돈</b> — 인수, 투자, 클라우드 계약 (${cnt.m})</span></div>
              </div>
              <div class="nw-meta">사람 ${Object.values(NODES).filter((n) => n.k === 'p').length} · 회사 ${Object.values(NODES).filter((n) => n.k === 'o').length} · 관계 ${EDGES.length}</div>
              <div class="nw-hint" style="margin-top:auto">사진이나 회사 이름을<br>눌러 보세요</div>`;
            return;
          }
          const n = NODES[sel];
          const rel = EDGES.map((e, i) => ({ e, i })).filter(({ e }) => (e[0] === sel || e[1] === sel) && visible(e));
          rel.sort((x, y) => sortKey(x.e[3]) - sortKey(y.e[3]));
          const all = EDGES.filter((e) => e[0] === sel || e[1] === sel);
          const c = { t: 0, k: 0, m: 0 };
          all.forEach((e) => c[e[2]]++);
          const head = n.k === 'p'
            ? `${faceHTML(n.img, 92)}<div><div class="nw-name">${n.name}</div><div class="nw-en">${n.en}</div></div>`
            : `<div class="nw-wm">${n.name}</div>`;
          panel.innerHTML = `
            <div class="nw-head">${head}</div>
            <p class="nw-one">${n.one}</p>
            <div class="nw-meta">연결 ${all.length} — 긴장 ${c.t} · 기술 ${c.k} · 돈 ${c.m}${filter !== 'all' ? `<br><b style="color:var(--ink)">지금은 ‘${TYPE_NAME[filter]}’ 선만 보는 중</b>` : ''}</div>
            <ol class="nw-rels" data-scroll>${rel.length ? rel.map(({ e, i }) => {
              const other = e[0] === sel ? e[1] : e[0];
              return `<li data-o="${other}" data-i="${i}">${sw(e[2])}<div><div class="r1"><span class="mono">${e[3]}</span><b>${NODES[other].name}</b></div><div class="r2">${e[4]}</div></div></li>`;
            }).join('') : '<li style="cursor:default"><span></span><div class="r2">이 종류의 선은 없어요.</div></li>'}</ol>
            <div class="nw-more" hidden>↓ 굴리면 더 있어요</div>`;
          requestAnimationFrame(updateMore);
        }

        function apply() {
          const hot = new Set();
          if (sel) hot.add(sel);
          EDGES.forEach((e, i) => {
            const p = edgeEls[i];
            const vis = visible(e);
            p.classList.toggle('off', !vis);
            const inc = sel && vis && (e[0] === sel || e[1] === sel);
            p.classList.toggle('hot', !!inc);
            if (inc) { hot.add(e[0]); hot.add(e[1]); }
          });
          svg.classList.toggle('sel', !!sel);
          const deg = {};
          EDGES.forEach((e) => { if (visible(e)) { deg[e[0]] = 1; deg[e[1]] = 1; } });
          Object.keys(nodeEls).forEach((id) => {
            const g = nodeEls[id];
            g.classList.toggle('on', id === sel);
            g.classList.toggle('dim', !!sel && !hot.has(id));
            g.classList.toggle('faint', !sel && !deg[id]);
          });
          if (sel) gN.appendChild(nodeEls[sel]);
          el.querySelectorAll('.nw-chips .chip').forEach((c) => c.classList.toggle('on', c.dataset.f === filter));
          renderPanel();
        }

        gN.addEventListener('click', (ev) => {
          const g = ev.target.closest('.nd'); if (!g) return;
          ev.stopPropagation();
          sel = sel === g.dataset.id ? null : g.dataset.id;
          apply();
        });
        gN.addEventListener('keydown', (ev) => {
          if (ev.key !== 'Enter' && ev.key !== ' ') return;
          const g = ev.target.closest('.nd'); if (!g) return;
          ev.preventDefault(); sel = g.dataset.id; apply();
        });
        svg.querySelector('.nw-bgclick').addEventListener('click', () => { sel = null; apply(); });
        el.querySelector('.nw-chips').addEventListener('click', (ev) => {
          const c = ev.target.closest('.chip'); if (!c) return;
          // a chip asks for the whole picture of that kind of line, so drop the current focus
          filter = c.dataset.f; sel = null; apply();
        });
        panel.addEventListener('scroll', updateMore, true);
        el._nwMore = updateMore;
        panel.addEventListener('click', (ev) => {
          const li = ev.target.closest('li[data-o]'); if (!li) return;
          sel = li.dataset.o; apply();
        });
        panel.addEventListener('mouseover', (ev) => {
          const li = ev.target.closest('li[data-i]');
          edgeEls.forEach((p) => p.classList.remove('pick'));
          if (li) edgeEls[+li.dataset.i].classList.add('pick');
        });
        panel.addEventListener('mouseleave', () => edgeEls.forEach((p) => p.classList.remove('pick')));
        apply();
      },
      enter(el) { if (el._nwMore) requestAnimationFrame(el._nwMore); },
    },

    /* ═════════════════════════ 2. GOOGLE ROLLER COASTER ═════════════════════════ */
    {
      id: 'google-deepmind',
      title: '구글의 롤러코스터',
      minutes: 1.2,
      notes: '구글은 AI의 핵심 재료를 거의 다 먼저 가졌습니다: 딥러닝 팀(2011), 힌턴(2013), DeepMind(2014), 전용 칩 TPU(2016), 그리고 트랜스포머(2017). 그런데 정작 ChatGPT는 OpenAI가 내놓았고, 구글은 ‘코드 레드’에 이어 Bard 광고 오답으로 하루 만에 시가총액 1,000억 달러를 잃었습니다. 그 뒤 두 연구소를 합치고 Gemini로 반격해, 2025년 말엔 거꾸로 OpenAI가 코드 레드를 선언했죠.\n곡선 위 점을 누르면 수레가 그 사건으로 달려가고 오른쪽 위 카드가 바뀝니다. [다음 →] 버튼으로 차례로 넘겨도 됩니다. 곡선 높이는 ‘분위기’를 그린 것이지 숫자가 아니라는 점을 말해 주세요.\n질문: “트랜스포머 장에서 던진 질문이에요. 제일 먼저 발명한 회사가 왜 제일 먼저 내놓지 못했을까요?” 답을 들은 뒤 7번 ‘코드 레드’ 카드를 띄우고 30초로 정리합니다: ① 구글에도 대화형 AI LaMDA(2021 I/O 공개)가 있었지만, 틀린 답이나 편향이 나오면 회사 신뢰가 깎이는 ‘평판 위험’ 때문에 공개를 미뤘습니다(2022.12 구글 전체 회의, 제프 딘 — CNBC 보도). ② 검색 광고로 돈을 버는 회사가 ‘링크 대신 답을 주는’ 제품을 내면 자기 광고 매출을 갉아먹을 수 있었습니다(NYT 2022.12 분석). ③ 그래서 잃을 것이 적은 작은 회사 OpenAI가 먼저 내놓았습니다. 1등이 새 기술 앞에서 머뭇거리는 이런 상황을 ‘혁신가의 딜레마’라고 부릅니다.',
      html: `${SHARED_CSS}
        <style>
          #f-google-deepmind .gd-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
          #f-google-deepmind .gd-svg .hit { pointer-events: all; cursor: pointer; fill: transparent; }
          #f-google-deepmind .rail { fill: none; stroke: var(--ink); stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; }
          #f-google-deepmind .rail2 { fill: none; stroke: var(--ink-2); stroke-width: 2.2; }
          #f-google-deepmind .tie { stroke: var(--ink-2); stroke-width: 2; }
          #f-google-deepmind .post { stroke: var(--ink-3); stroke-width: 1.6; }
          #f-google-deepmind .ground { stroke: var(--ink-3); stroke-width: 2.5; fill: none; }
          #f-google-deepmind .ev circle.d { fill: var(--paper); stroke: var(--ink); stroke-width: 3.5; transition: r .2s; }
          #f-google-deepmind .ev.on circle.d { fill: var(--hl); r: 17; }
          #f-google-deepmind .ev circle.ring { fill: none; stroke: var(--hl-soft); stroke-width: 14; opacity: 0; }
          #f-google-deepmind .ev.on circle.ring { opacity: 1; }
          #f-google-deepmind .ev .lead { stroke: var(--ink-3); stroke-width: 2; stroke-dasharray: 3 5; }
          #f-google-deepmind .ev.on .lead { stroke: var(--pen); }
          #f-google-deepmind .ev text { text-anchor: middle; paint-order: stroke; stroke: var(--paper); stroke-width: 6px; stroke-linejoin: round; }
          #f-google-deepmind .ev .dt { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); }
          #f-google-deepmind .ev .hd { font-family: var(--font-body); font-weight: 700; font-size: 22px; fill: var(--ink); }
          #f-google-deepmind .ev.on .hd { fill: var(--pen); }
          #f-google-deepmind .cart rect { fill: var(--pen); stroke: var(--ink); stroke-width: 2.5; }
          #f-google-deepmind .cart circle { fill: var(--ink); }
          #f-google-deepmind .ax { font-family: var(--font-hand); font-size: 34px; fill: var(--pen); }
          #f-google-deepmind .gd-card { position: absolute; left: 858px; top: 50px; width: 652px; height: 320px; display: grid; grid-template-columns: 196px 1fr; gap: 26px; align-items: start; }
          #f-google-deepmind .gd-card .photo { --w: 186px; margin-top: 14px; }
          #f-google-deepmind .gd-card .photo.wide img { --ratio: 4 / 3; }
          #f-google-deepmind .gd-stat { margin-top: 18px; border: 3px solid var(--ink); padding: 18px 14px 16px; transform: rotate(-1.5deg); background: var(--paper); text-align: center; }
          #f-google-deepmind .gd-stat b { display: block; font-family: var(--font-mono); font-weight: 600; font-size: 44px; line-height: 1.05; letter-spacing: -0.02em; }
          #f-google-deepmind .gd-stat span { display: block; font-size: 20px; color: var(--ink-2); margin-top: 6px; word-break: keep-all; }
          #f-google-deepmind .gd-date { font-family: var(--font-mono); font-weight: 600; font-size: 30px; color: var(--ink-2); }
          #f-google-deepmind .gd-h { font-family: var(--font-display); font-weight: 800; font-size: 42px; line-height: 1.12; margin: 2px 0 10px; }
          #f-google-deepmind .gd-b { font-size: 25px; line-height: 1.42; word-break: keep-all; min-height: 108px; }
          #f-google-deepmind .gd-nav { margin-top: 14px; display: flex; gap: 12px; align-items: center; }
          #f-google-deepmind .gd-nav .mono { font-size: 20px; color: var(--ink-2); margin-left: 6px; }
        </style>
        <div class="abs" style="left:92px;top:64px;width:720px">
          <div class="kicker">Google · Google DeepMind · 2011 → 2026</div>
          <h2 class="title" style="margin-top:8px">구글의 롤러코스터</h2>
          <p class="lede" style="margin-top:14px;font-size:30px">재료는 가장 먼저 다 가졌다.<br>그런데 왜 <span class="mark">허를 찔렸을까?</span></p>
        </div>
        <svg class="gd-svg" width="1600" height="900" viewBox="0 0 1600 900">
          <g class="g-posts"></g>
          <path class="ground" d="M40,812 L1560,812"/>
          <g class="g-ties"></g>
          <path class="rail2"/>
          <path class="rail"/>
          <g class="cart"><rect x="-24" y="-24" width="48" height="20" rx="5"/><circle cx="-13" cy="-3" r="5.5"/><circle cx="13" cy="-3" r="5.5"/></g>
          <g class="g-ev"></g>
          <text class="ax" x="54" y="420">기세 ↑</text>
          <text class="ax" x="54" y="456" style="font-size:26px;fill:var(--ink-2)">(분위기 그림 · 숫자 아님)</text>
        </svg>
        <div class="demo gd-card">
          <div class="gd-ph"></div>
          <div>
            <div class="gd-date"></div>
            <div class="gd-h"></div>
            <p class="gd-b"></p>
            <div class="gd-nav"><button class="btn sm gd-prev">← 이전</button><button class="btn sm gd-next">다음 →</button><span class="mono gd-n"></span></div>
          </div>
        </div>
        <div class="demo gd-hitlayer" style="position:absolute;left:0;top:290px;width:1600px;height:560px;pointer-events:none"></div>
        <div class="src">출처: Google Brain·Google DeepMind 위키백과, NYT(2012.6, 2022.12), CNBC(2022.12.13 사내 회의), Google Cloud 블로그(2016.5), arXiv 1706.03762·Attention Is All You Need 위키백과(인용 수), The Standard(2023.2), Fortune(2025.12), 알파벳 3분기 실적(2026.10.28), Entrepreneur(2026.10). 곡선의 높이는 분위기를 그린 것으로 측정값이 아님.</div>`,
      init(el, K) {
        const svg = el.querySelector('.gd-svg');
        const n = GOOG.length;
        const X0 = 128, X1 = 1478;
        const GROUND = 812;
        const pts = GOOG.map((e, i) => [X0 + (i * (X1 - X0)) / (n - 1), 784 - e.lv * 318]);
        const all = [[40, 768]].concat(pts, [[1560, 640]]);
        const d = K.sketchPath(all, { tension: 0.55 });
        svg.querySelector('.rail').setAttribute('d', d);
        const rail2 = svg.querySelector('.rail2');
        rail2.setAttribute('d', d);
        rail2.setAttribute('transform', 'translate(0,11)');
        const path = svg.querySelector('.rail');
        const total = path.getTotalLength();
        // lookup: x → length (path is monotonic in x)
        const table = [];
        for (let s = 0; s <= total; s += 2) { const p = path.getPointAtLength(s); table.push([p.x, p.y, s]); }
        const atX = (x) => { let best = table[0]; for (const r of table) if (Math.abs(r[0] - x) < Math.abs(best[0] - x)) best = r; return best; };
        // ties & posts
        const gT = svg.querySelector('.g-ties'), gP = svg.querySelector('.g-posts');
        for (let s = 6; s < total; s += 20) {
          const p = path.getPointAtLength(s);
          K.svg('line', { class: 'tie', x1: p.x, y1: p.y, x2: p.x, y2: p.y + 11 }, gT);
        }
        for (let x = 64; x < 1560; x += 46) {
          const r = atX(x);
          K.svg('line', { class: 'post', x1: r[0], y1: r[1] + 12, x2: r[0], y2: GROUND }, gP);
          if (Math.round(x / 46) % 2 === 0) {
            const r2 = atX(x + 46);
            if (r2[1] + 12 < GROUND) K.svg('line', { class: 'post', x1: r[0], y1: Math.min(GROUND, r[1] + 12 + (GROUND - r[1]) * 0.45), x2: r2[0], y2: Math.min(GROUND, r2[1] + 12 + (GROUND - r2[1]) * 0.15) }, gP);
          }
        }
        // labels: placed so they never sit on the rail, a dot, or another label
        const rangeY = (x0, x1) => {
          let lo = 1e9, hi = -1e9;
          for (const r of table) if (r[0] >= x0 && r[0] <= x1) { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[1]); }
          return [lo, hi];
        };
        const textW = (s, px) => [...s].reduce((a, ch) => a + (/[ㄱ-힝]/.test(ch) ? px * 1.02 : ch === ' ' ? px * 0.32 : px * 0.62), 0);
        const LH = 52, placed = [];
        const hits = (b) => placed.some((q) => !(b[2] + 12 < q[0] || b[0] - 12 > q[2] || b[3] + 6 < q[1] || b[1] - 6 > q[3])) ||
          pts.some((p) => p[0] > b[0] - 16 && p[0] < b[2] + 16 && p[1] > b[1] - 16 && p[1] < b[3] + 16);
        const spots = GOOG.map((e, i) => {
          const [px, py] = pts[i];
          const w = Math.max(textW(e.d, 20), textW(e.h, 22)) + 10;
          const sides = e.pos === 'a' ? ['a', 'b'] : ['b', 'a'];
          let best = null;
          for (const sd of sides) {
            for (const dx of [0, -26, 26, -52, 52, -78, 78]) {
              const cx = Math.max(44 + w / 2, Math.min(1572 - w / 2, px + dx));
              const [lo, hi] = rangeY(cx - w / 2 - 4, cx + w / 2 + 4);
              const top = sd === 'a' ? Math.min(lo - 12, py - 30) - LH : Math.max(hi + 24, py + 30);
              const minTop = cx + w / 2 > 846 ? 394 : 296;
              if (top < minTop || top + LH > GROUND - 8) continue;
              const box = [cx - w / 2, top, cx + w / 2, top + LH];
              if (hits(box)) continue;
              best = { cx, top, sd, box }; break;
            }
            if (best) break;
          }
          if (!best) { const top = e.pos === 'a' ? py - 30 - LH : py + 30; best = { cx: px, top, sd: e.pos, box: [px - w / 2, top, px + w / 2, top + LH] }; }
          placed.push(best.box);
          return best;
        });
        // events
        const gE = svg.querySelector('.g-ev');
        const lens = pts.map((p) => Math.max(0, atX(p[0])[2] - 40));
        const evEls = GOOG.map((e, i) => {
          const [x, y] = pts[i];
          const s = spots[i];
          const g = K.svg('g', { class: 'ev' }, gE);
          const y1 = s.sd === 'a' ? y - 16 : y + 16, y2 = s.sd === 'a' ? s.top + LH + 2 : s.top - 4;
          if (Math.abs(y2 - y1) > 14) K.svg('line', { class: 'lead', x1: x, y1, x2: s.cx, y2 }, g);
          K.svg('circle', { class: 'ring', cx: x, cy: y, r: 24 }, g);
          K.svg('circle', { class: 'd', cx: x, cy: y, r: 12 }, g);
          const t1 = K.svg('text', { class: 'dt', x: s.cx, y: s.top + 18 }, g); t1.textContent = e.d;
          const t2 = K.svg('text', { class: 'hd', x: s.cx, y: s.top + 45 }, g); t2.textContent = e.h;
          return g;
        });
        // the svg sits outside .demo, so give its hit targets their own interactive wrapper
        const hitLayer = el.querySelector('.gd-hitlayer');
        const hsvg = K.svg('svg', { width: 1600, height: 560, viewBox: '0 290 1600 560', style: 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none' }, hitLayer);
        GOOG.forEach((e, i) => {
          const [x, y] = pts[i]; const b = spots[i].box;
          const hov = (on) => evEls[i].querySelector('.d').setAttribute('r', on ? 15 : 12);
          [K.svg('circle', { cx: x, cy: y, r: 30, fill: 'transparent', style: 'pointer-events:all;cursor:pointer' }, hsvg),
            K.svg('rect', { x: b[0] - 4, y: b[1] - 4, width: b[2] - b[0] + 8, height: b[3] - b[1] + 8, fill: 'transparent', style: 'pointer-events:all;cursor:pointer' }, hsvg)].forEach((h) => {
            h.addEventListener('click', () => pick(i));
            h.addEventListener('mouseenter', () => hov(true));
            h.addEventListener('mouseleave', () => hov(false));
          });
        });

        const cart = svg.querySelector('.cart');
        let cur = 5, pos = lens[cur], target = pos;
        function placeCart(s) {
          const p = path.getPointAtLength(Math.max(0, Math.min(total, s)));
          const q = path.getPointAtLength(Math.max(0, Math.min(total, s + 3)));
          const a = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
          cart.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${a.toFixed(1)})`);
        }
        const ph = el.querySelector('.gd-ph');
        function card() {
          const e = GOOG[cur];
          el.querySelector('.gd-date').textContent = e.d;
          el.querySelector('.gd-h').textContent = e.h;
          el.querySelector('.gd-b').textContent = e.b;
          el.querySelector('.gd-n').textContent = `${cur + 1} / ${n}`;
          ph.innerHTML = e.ph ? K.photo(e.ph[0], e.ph[1], (cur % 2 ? 'tilt-r' : '') + (e.wide ? ' wide' : '')) : `<div class="gd-stat"><b>${e.stat[0]}</b><span>${e.stat[1]}</span></div>`;
          evEls.forEach((g, i) => g.classList.toggle('on', i === cur));
          el.querySelector('.gd-prev').disabled = cur === 0;
          el.querySelector('.gd-next').disabled = cur === n - 1;
        }
        function pick(i) { cur = Math.max(0, Math.min(n - 1, i)); target = lens[cur]; card(); }
        el.querySelector('.gd-prev').addEventListener('click', () => pick(cur - 1));
        el.querySelector('.gd-next').addEventListener('click', () => pick(cur + 1));
        K.loop(el, (t, dt) => {
          if (Math.abs(target - pos) < 0.5) { if (pos !== target) { pos = target; placeCart(pos); } return; }
          const dir = Math.sign(target - pos);
          const v = Math.min(900, 160 + Math.abs(target - pos) * 2.2);
          pos += dir * Math.min(Math.abs(target - pos), v * dt);
          placeCart(pos);
        });
        placeCart(pos);
        card();
      },
    },

    /* ═════════════════════════ 3. HASSABIS ═════════════════════════ */
    {
      id: 'hassabis',
      title: '데미스 허사비스 — 게임 → 뇌 → AI',
      minutes: 0.8,
      notes: '허사비스는 4살에 체스를 시작해 13살에 마스터급이 됐고, 체스 상금으로 산 컴퓨터로 코딩을 독학했습니다. 17살엔 영국 게임사 불프로그(Bullfrog)에서 ‘테마파크’를 공동 기획하고 프로그래밍을 이끌었죠. 게임 회사를 차렸다가, 지능을 이해하려고 뇌과학 박사를 하고, 2010년 DeepMind를 세워 알파고와 AlphaFold(노벨 화학상)까지 갔습니다.\n→ 키를 누르면 ‘뇌’ 줄, 한 번 더 누르면 ‘AI’ 줄이 나타납니다. 게임판처럼 칸을 따라가며 이야기하세요.\n질문: “게임을 좋아하는 게 시간 낭비일까요? 허사비스에게 게임은 무엇이었을까요?”',
      html: `<style>
          #f-hassabis .hs-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
          #f-hassabis .trail { fill: none; stroke: var(--ink); stroke-width: 4; stroke-dasharray: 2 14; stroke-linecap: round; }
          #f-hassabis .trail-bg { fill: none; stroke-width: 34; stroke-linecap: round; stroke-linejoin: round; }
          #f-hassabis .tile { position: absolute; width: 240px; word-break: keep-all; }
          #f-hassabis .tile .no { position: absolute; left: -2px; top: -2px; width: 58px; height: 58px; border: 3px solid var(--ink); background: var(--paper); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-weight: 600; font-size: 28px; transform: rotate(-3deg); }
          #f-hassabis .tile.star .no { background: var(--hl); color: #1b2630; }
          #f-hassabis .tile .tx { padding-left: 72px; }
          #f-hassabis .tile .y { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); }
          #f-hassabis .tile .h { font-family: var(--font-display); font-weight: 800; font-size: 27px; line-height: 1.15; }
          #f-hassabis .tile .s { font-size: 21px; line-height: 1.3; color: var(--ink-2); margin-top: 3px; }
          #f-hassabis .lane { position: absolute; font-family: var(--font-display); font-weight: 800; font-size: 36px; line-height: 1; white-space: nowrap; }
          #f-hassabis .lane small { font-family: var(--font-mono); font-weight: 400; font-size: 20px; color: var(--ink-2); margin-left: 8px; letter-spacing: .04em; }
          #f-hassabis .photo.mini { --w: 96px; padding: 7px 7px 34px; }
          #f-hassabis .photo.mini figcaption { font-size: 24px; left: 8px; bottom: 3px; }
        </style>
        <div class="abs" style="left:92px;top:60px;width:1400px">
          <div class="kicker">Google DeepMind · 데미스 허사비스 (1976–)</div>
          <h2 class="title" style="margin-top:6px;font-size:66px">게임 만들던 소년, 노벨상을 받다</h2>
        </div>
        <div class="abs" style="left:92px;top:214px">${Kit.photo('hassabis', '데미스 허사비스', '', '--w:262px')}</div>
        <div class="abs" style="left:92px;top:642px;width:300px">
          <div class="hand" style="font-size:46px;line-height:1.1">게임 → 뇌 → AI</div>
          <div style="font-size:22px;line-height:1.4;color:var(--ink-2);margin-top:8px;word-break:keep-all">좋아하던 게임이<br><span class="mark">지능 연구</span>의 출발점이 됐다</div>
        </div>
        <svg class="hs-svg" width="1600" height="900" viewBox="0 0 1600 900">
          <path class="trail-bg" style="stroke:var(--hl-soft)" d="M470,246 L1450,246"/>
          <path class="trail-bg" data-step="1" style="stroke:var(--pen-soft)" d="M1450,246 C1556,246 1556,452 1450,452 L900,452"/>
          <path class="trail-bg" data-step="2" style="stroke:var(--rel-money);stroke-opacity:.16" d="M900,452 L470,452 C364,452 364,658 470,658 L1520,658"/>
          <path class="trail" d="M470,246 L1450,246"/>
          <path class="trail" data-step="1" d="M1450,246 C1556,246 1556,452 1450,452 L900,452"/>
          <path class="trail" data-step="2" d="M900,452 L470,452 C364,452 364,658 470,658 L1520,658"/>
          <path d="M1504,644 L1526,658 L1504,672" style="fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round;stroke-linejoin:round" data-step="2"/>
          <path d="M1206,438 L1184,452 L1206,466" style="fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round;stroke-linejoin:round" data-step="1"/>
        </svg>
        <div class="lane" style="left:470px;top:186px">게임 <small>1980 → 2005</small></div>
        <div class="lane" data-step="1" style="left:1162px;top:392px;width:300px;text-align:right">뇌 → AI <small>2005 → 2010</small></div>
        <div class="lane" data-step="2" style="left:470px;top:598px">AI <small>2014 →</small></div>

        <div class="tile" style="left:470px;top:270px"><div class="no">1</div><div class="tx"><div class="y">4세 · 13세</div><div class="h">체스 신동</div><div class="s">13세에 마스터급 (Elo 2300)</div></div></div>
        <div class="tile" style="left:715px;top:270px"><div class="no">2</div><div class="tx"><div class="y">10대</div><div class="h">독학 코딩</div><div class="s">체스 상금으로 산 컴퓨터로</div></div></div>
        <div class="tile star" style="left:960px;top:270px"><div class="no">3</div><div class="tx"><div class="y">17세 · 1994</div><div class="h">‘테마파크’</div><div class="s">Bullfrog에서 공동 기획, 프로그래밍 책임</div></div></div>
        <div class="tile" style="left:1205px;top:270px;width:250px"><div class="no">4</div><div class="tx"><div class="y">1998–2005</div><div class="h">게임 회사 창업</div><div class="s">케임브리지 졸업 후 Elixir Studios</div></div></div>

        <div class="tile" data-step="1" style="left:1190px;top:476px;width:260px"><div class="no">5</div><div class="tx"><div class="y">2009 · UCL</div><div class="h">뇌과학 박사</div><div class="s">사람은 어떻게 기억할까 (해마)</div></div></div>
        <div class="tile star" data-step="1" style="left:888px;top:476px;width:290px"><div class="no">6</div><div class="tx"><div class="y">2010.11 · 런던</div><div class="h">DeepMind 창업</div><div class="s">“지능의 비밀을 풀고, 그&nbsp;힘으로 다른 모든 문제를 푼다”</div></div></div>
        <div class="abs" data-step="1" style="left:618px;top:474px;display:flex;gap:14px">${Kit.photo('shane-legg', '셰인 레그', 'mini tilt-r')}${Kit.photo('mustafa-suleyman', '술레이만', 'mini')}</div>

        <div class="tile" data-step="2" style="left:470px;top:682px"><div class="no">7</div><div class="tx"><div class="y">2014.1</div><div class="h">구글이 인수</div><div class="s">4억 파운드 (보도)</div></div></div>
        <div class="tile" data-step="2" style="left:715px;top:682px"><div class="no">8</div><div class="tx"><div class="y">2016.3 · 서울</div><div class="h">알파고 4 : 1</div><div class="s">이세돌 9단과의 다섯 판</div></div></div>
        <div class="tile star" data-step="2" style="left:960px;top:682px;width:280px"><div class="no">9</div><div class="tx"><div class="y">2024</div><div class="h">노벨 화학상</div><div class="s">AlphaFold, 존 점퍼와 공동 수상</div></div></div>
        <div class="abs" data-step="2" style="left:1262px;top:690px;width:250px">
          <div class="mono" style="font-size:20px;color:var(--ink-2)">2026.8 · 지금</div>
          <div class="hand" style="font-size:34px;line-height:1.08;margin-top:2px">DeepMind 의장 겸<br>알파벳 수석과학자</div>
        </div>
        <div class="src">출처: Demis Hassabis·Google DeepMind 위키백과, nobelprize.org(2024 화학상), DeepMind AlphaGo 페이지, The Next Web(2026.8)</div>`,
    },

    /* ═════════════════════════ 4. OPENAI FOUNDING ═════════════════════════ */
    {
      id: 'openai-founding',
      title: '2015년, OpenAI는 왜 생겼나',
      minutes: 1,
      notes: '2015년 무렵 최고의 AI 연구자들이 구글로 모였습니다. 브레인, 힌턴 영입, DeepMind 인수까지. “AI를 한 회사가 독점하면 위험하다”는 생각으로 2015년 12월 OpenAI가 비영리 연구소로 출발했고, 머스크와 올트먼이 공동의장이었습니다. 머스크는 법정에서 페이지와 AI를 두고 다퉜던 일을 이유로 들었습니다. 그 생일 파티 자리에 있던 물리학자 테그마크도 책(『라이프 3.0』, 2017)에 같은 장면을 적었지만, 페이지 본인은 입장을 밝힌 적이 없다는 점을 짚어 주세요. 오른쪽 사진 아래 한 줄은 올트먼의 길입니다: 대학을 그만두고 창업, 스타트업 육성 회사 대표를 거쳐 OpenAI로.\n아래 막대를 보여 주며: 약속은 10억 달러였지만, 2021년까지 실제로 들어온 돈은 1억 3,300만 달러(약 13%)였습니다. 이 ‘돈 부족’이 다음 장의 갈라짐으로 이어집니다.\n질문: “좋은 목표만으로 연구소를 계속 굴릴 수 있을까요?”',
      html: `${SHARED_CSS}<style>
          #f-openai-founding .of-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
          #f-openai-founding .ring { fill: none; stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
          #f-openai-founding .ppl { fill: var(--ink-2); }
          #f-openai-founding .pull { stroke: var(--ink-2); stroke-width: 2; fill: none; }
          #f-openai-founding .ten { stroke: var(--rel-tension); stroke-width: 5; stroke-dasharray: 14 10; fill: none; stroke-linecap: round; }
          #f-openai-founding .tenh { fill: var(--rel-tension); }
          #f-openai-founding .g-in { position: absolute; left: 196px; top: 372px; width: 300px; }
          #f-openai-founding .g-in .row1 { display: grid; grid-template-columns: 76px 1fr; gap: 6px; font-size: 25px; line-height: 1.5; }
          #f-openai-founding .g-in .row1 span:first-child { font-family: var(--font-mono); font-weight: 600; color: var(--ink-2); }
          #f-openai-founding .oa { position: absolute; left: 930px; top: 200px; width: 590px; }
          #f-openai-founding .oa ul { font-size: 25px; gap: 8px; margin-top: 12px; }
          #f-openai-founding .team { position: absolute; left: 920px; top: 420px; display: flex; }
          #f-openai-founding .team .photo { --w: 124px; padding: 8px 8px 40px; margin-right: -6px; }
          #f-openai-founding .team .photo figcaption { font-size: 27px; left: 10px; bottom: 5px; }
          #f-openai-founding .money { position: absolute; left: 930px; top: 690px; width: 590px; }
          #f-openai-founding .money .lab { font-size: 22px; display: flex; justify-content: space-between; margin-bottom: 4px; }
          #f-openai-founding .money .lab b { font-family: var(--font-mono); font-weight: 600; font-size: 24px; }
          #f-openai-founding .bar { height: 28px; border: 2.5px solid var(--ink); }
        </style>
        <div class="abs" style="left:92px;top:60px">
          <div class="kicker">OpenAI 창립 · 2015년 12월 11일</div>
          <h2 class="title" style="margin-top:6px;font-size:64px">구글 혼자 AI를 갖게 둘 순 없다?</h2>
        </div>
        <svg class="of-svg" width="1600" height="900" viewBox="0 0 1600 900">
          <path class="ring" d="M330,252 C450,250 532,340 530,470 C528,598 440,680 318,676 C196,672 118,584 120,462 C122,340 214,254 336,250"/>
          <g class="g-pull"></g>
          <path class="ten" d="M900,500 C800,470 690,470 560,488"/>
          <path class="tenh" d="M540,490 L568,474 L566,504 Z"/>
          <text x="676" y="548" style="font-family:var(--font-hand);font-size:44px;fill:var(--rel-tension)">견제</text>
        </svg>
        <div class="abs" style="left:214px;top:296px;font-family:var(--font-display);font-weight:800;font-size:56px">Google</div>
        <div class="g-in">
          <div class="row1"><span>2011</span><span>구글 브레인</span></div>
          <div class="row1"><span>2013</span><span>힌턴 영입</span></div>
          <div class="row1"><span>2014</span><span>DeepMind 인수</span></div>
        </div>
        <div class="abs hand" style="left:150px;top:548px;font-size:34px;width:350px;line-height:1.15;text-align:center">최고의 AI 연구자들이<br>한 회사로</div>
        <div class="abs" style="left:430px;top:196px">${Kit.photo('larry-page', '래리 페이지', 'sm tilt-r', '--w:140px')}</div>
        <div class="abs sticky" style="left:582px;top:214px;width:318px;font-size:30px;line-height:1.18;--tilt:-2deg;padding:16px 20px 18px">“페이지는 나를<br>‘종 차별주의자’라<br>불렀다”<div style="font-family:var(--font-body);font-size:20px;margin-top:8px;line-height:1.3;word-break:keep-all">= AI보다 인간 편만 든다는 뜻.<br>테그마크의 책(2017)·머스크 증언 — 페이지 쪽 입장은 없음</div></div>
        <div class="oa">
          <div style="font-family:var(--font-display);font-weight:800;font-size:68px;line-height:1">OpenAI</div>
          <ul class="dash">
            <li><span class="mark">비영리</span> 연구소 — 주주가 아니라 인류 전체를 위해</li>
            <li>공동의장 머스크·올트먼, 10억 달러 약정</li>
          </ul>
        </div>
        <div class="team">
          ${Kit.photo('altman', '올트먼', 'tilt-0', '--tilt:-2deg')}
          ${Kit.photo('musk', '머스크', 'tilt-r')}
          ${Kit.photo('brockman', '브록먼', '', '--tilt:-1deg')}
          ${tapedFace('sutskever', '수츠케버', 'tilt-r', '', 124, 8, 0.36)}
          ${tapedFace('karpathy', '카르파시', '', '--tilt:-2.5deg', 124, 8, 0.42)}
        </div>
        <div class="abs" style="left:930px;top:614px;width:590px;font-size:21px;line-height:1.35;color:var(--ink-2);word-break:keep-all"><b style="color:var(--ink)">올트먼은?</b> 스탠퍼드 중퇴 → 19살에 첫 창업(Loopt) → 2014 스타트업 육성 회사 Y Combinator 대표 → 2015 OpenAI</div>
        <div class="money">
          <div class="lab"><span>약속한 돈</span><b>10억 달러</b></div>
          <div class="bar" style="width:590px;background:repeating-linear-gradient(-45deg,transparent 0 7px,var(--ink-3) 7px 9px)"></div>
          <div class="lab" style="margin-top:12px"><span>2021년까지 실제로 들어온 돈</span><b>1억 3,300만 달러</b></div>
          <div class="row center" style="gap:14px"><div class="bar" style="width:${(590 * 133 / 1000).toFixed(0)}px;background:var(--hl)"></div><span class="hand" style="font-size:34px">약속의 13%</span></div>
        </div>
        <div class="abs" style="left:92px;top:712px;width:740px">
          <div class="quote" style="font-size:31px;line-height:1.35">영리 회사로 시작할 수도 있었지만,<br>그러지 않기로 했다.<cite>일론 머스크 · 법정 증언 (2026.4.28)</cite></div>
        </div>
        <div class="src">출처: “Introducing OpenAI”(2015.12.11), OpenAI 위키백과(실제 납입액), Google Brain·DeepMind·Sam Altman 위키백과, Tegmark 『Life 3.0』(2017), 머스크 법정 증언(2026.4.28)</div>`,
      init(el, K) {
        // researcher dots drawn into the Google circle
        const g = el.querySelector('.g-pull');
        const rnd = K.rand(42);
        for (let i = 0; i < 12; i++) {
          const a = -2.6 + (i / 11) * 4.0 + (rnd() - 0.5) * 0.2;
          const r0 = 262 + rnd() * 26, r1 = 222;
          const cx = 325, cy = 464;
          const x0 = cx + Math.cos(a) * r0, y0 = cy + Math.sin(a) * r0;
          const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
          if (x0 > 560 || y0 > 680 || y0 < 190) continue;
          K.svg('circle', { class: 'ppl', cx: x0.toFixed(1), cy: y0.toFixed(1), r: 7 }, g);
          K.svg('path', { class: 'pull', d: `M${((x0 * 0.82 + x1 * 0.18)).toFixed(1)},${((y0 * 0.82 + y1 * 0.18)).toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)}`, 'marker-end': '' }, g);
          const ang = Math.atan2(y1 - y0, x1 - x0);
          const hx = x1, hy = y1;
          K.svg('path', { class: 'pull', d: `M${(hx - Math.cos(ang - 0.5) * 10).toFixed(1)},${(hy - Math.sin(ang - 0.5) * 10).toFixed(1)} L${hx.toFixed(1)},${hy.toFixed(1)} L${(hx - Math.cos(ang + 0.5) * 10).toFixed(1)},${(hy - Math.sin(ang + 0.5) * 10).toFixed(1)}` }, g);
        }
      },
    },

    /* ═════════════════════════ 5. OPENAI SPLIT & MONEY ═════════════════════════ */
    {
      id: 'openai-split',
      title: '갈라짐, 그리고 돈',
      minutes: 0.8,
      notes: '연구에 돈이 점점 더 들자 OpenAI는 구조를 바꿉니다. 2018년 머스크가 이사회를 떠났는데, 왜 떠났는지는 양쪽 말이 다릅니다. 이 싸움은 뒤의 ‘머스크 vs OpenAI’ 저울에서 자세히 봅니다. 2019년엔 ‘이익 상한’ 회사를 만들어 마이크로소프트 돈을 받기 시작했고 누적 약 130억 달러가 됐습니다. 대신 OpenAI는 MS의 클라우드 Azure만 쓰기로 했죠(2026.4 독점 종료). 2025년 10월엔 공익도 함께 추구하는 영리기업(PBC)으로 재편하며 MS가 27%를 갖게 됐습니다.\n왼쪽 아래 계단은 OpenAI 기업가치(회사 전체를 산다면 얼마인가)입니다: 2024년 10월 1,570억 달러 → 2026년 3월 8,520억 달러, 11월엔 약 1조 2,500억 달러로 투자를 받았다는 보도까지 — 2년 사이 약 8배. 계단과 오른쪽 MS 막대 모두 실제 비율대로 그렸습니다(MS: 10억 : 20억 : 100억). 빨간 점선 = 긴장, 초록 화살표 = 돈.\n질문: “돈을 댄 회사(MS)는 OpenAI에 무엇을 요구할 수 있을까요? 비영리 이사회는 무엇을 지켜야 할까요?”',
      html: `<style>
          #f-openai-split .os-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
          #f-openai-split .ten { stroke: var(--rel-tension); stroke-width: 5; stroke-dasharray: 14 10; fill: none; stroke-linecap: round; }
          #f-openai-split .tenh { fill: var(--rel-tension); }
          #f-openai-split .mon { stroke: var(--rel-money); stroke-width: 9; fill: none; stroke-linecap: round; }
          #f-openai-split .mon2 { stroke: var(--rel-money); stroke-width: 3.5; fill: none; stroke-dasharray: 3 8; stroke-linecap: round; }
          #f-openai-split .monh { fill: var(--rel-money); }
          #f-openai-split .ink { stroke: var(--ink); stroke-width: 3.5; fill: none; stroke-linecap: round; }
          #f-openai-split .inkh { fill: var(--ink); }
          #f-openai-split .tag { font-family: var(--font-mono); font-size: 20px; fill: var(--ink-2); }
          #f-openai-split .os-val .vh { font-family: var(--font-display); font-weight: 800; font-size: 30px; line-height: 1.1; }
          #f-openai-split .os-val .vh small { font-family: var(--font-body); font-weight: 400; font-size: 20px; color: var(--ink-2); margin-left: 8px; }
          #f-openai-split .os-val svg { display: block; margin-top: 6px; }
          #f-openai-split .os-val text { font-size: 20px; }
          #f-openai-split .os-val text.v { fill: var(--ink); font-weight: 600; }
          #f-openai-split .os-val .ax { stroke: var(--ink); stroke-width: 3; }
          #f-openai-split .st { position: absolute; left: 600px; width: 392px; border: 3px solid var(--ink); background: var(--paper); padding: 12px 18px 14px; word-break: keep-all; }
          #f-openai-split .st .k { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); }
          #f-openai-split .st .h { font-family: var(--font-display); font-weight: 800; font-size: 32px; line-height: 1.15; margin-top: 2px; }
          #f-openai-split .st .s { font-size: 21px; line-height: 1.35; margin-top: 4px; color: var(--ink-2); }
          #f-openai-split .ms-row { position: absolute; left: 1104px; height: 30px; display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); }
          #f-openai-split .ms-row .y { width: 58px; font-size: 20px; color: var(--ink-2); }
          #f-openai-split .ms-row i { display: block; height: 28px; background: var(--rel-money); }
          #f-openai-split .ms-row b { font-size: 21px; font-weight: 600; }
          #f-openai-split .pbc { display: flex; height: 50px; border: 3px solid var(--ink); }
          #f-openai-split .pbc div { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 22px; border-right: 3px solid var(--ink); white-space: nowrap; }
          #f-openai-split .pbc div:last-child { border-right: 0; }
        </style>
        <div class="abs" style="left:92px;top:60px">
          <div class="kicker">OpenAI · 2018 → 2026</div>
          <h2 class="title" style="margin-top:6px">갈라짐, 그리고 돈</h2>
        </div>
        <svg class="os-svg" width="1600" height="900" viewBox="0 0 1600 900">
          <path class="ten" d="M514,318 C540,312 556,306 574,300"/>
          <path class="tenh" d="M596,294 L568,286 L574,312 Z"/>
          <path class="ink" d="M796,368 L796,410"/><path class="inkh" d="M796,424 L784,404 L808,404 Z"/>
          <text class="tag" x="812" y="402">통제</text>
          <path class="mon" d="M1092,506 C1062,500 1040,494 1018,492"/>
          <path class="monh" d="M996,491 L1022,476 L1022,506 Z"/>
          <text x="1018" y="466" style="font-family:var(--font-hand);font-size:36px;fill:var(--rel-money)">투자</text>
          <path class="mon2" d="M1000,544 C1040,566 1066,588 1086,606"/>
          <path class="monh" d="M1098,618 L1076,610 L1092,592 Z"/>
          <path class="ink" d="M796,560 L796,600" style="stroke-dasharray:4 7"/><path class="inkh" d="M796,614 L784,594 L808,594 Z"/>
          <text class="tag" x="812" y="592">2025.10.28 재편</text>
        </svg>

        <div class="abs" style="left:96px;top:212px">${Kit.photo('musk', '머스크', 'sm', '--w:132px')}</div>
        <div class="abs" style="left:252px;top:236px;width:262px;word-break:keep-all">
          <div class="hand" style="font-size:38px;color:var(--rel-tension);line-height:1.05">2018 · 이사회 이탈</div>
          <div style="font-size:21px;line-height:1.35;color:var(--ink-2);margin-top:10px">공개된 이유:<br><b style="color:var(--ink);font-size:23px">테슬라 AI와의 이해충돌</b></div>
          <div style="font-size:21px;line-height:1.35;color:var(--ink-2);margin-top:12px;width:330px">왜 떠났나? 양쪽 말이 다르다<br>→ 뒤의 ‘머스크 vs OpenAI’에서</div>
        </div>
        <div class="abs os-val" style="left:92px;top:458px;width:468px">
          <div class="vh">OpenAI 기업가치 <small>회사 전체의 값 · 달러</small></div>
          <svg class="chart" width="468" height="292" viewBox="0 0 468 292">
            ${OAI_VAL.map((v, i) => {
              const cw = 468 / OAI_VAL.length, h = (v[2] / 12500) * 196, x = i * cw + (cw - 58) / 2, last = i === OAI_VAL.length - 1;
              return `<rect class="bar${last ? ' hl' : ''}" x="${x.toFixed(1)}" y="${(252 - h).toFixed(1)}" width="58" height="${h.toFixed(1)}"/>` +
                `<text class="v" x="${last ? 466 : (x + 29).toFixed(1)}" y="${(240 - h).toFixed(1)}" style="text-anchor:${last ? 'end' : 'middle'}">${v[1]}</text>` +
                `<text x="${(x + 29).toFixed(1)}" y="282" style="text-anchor:middle">${v[0]}</text>`;
            }).join('')}
            <path class="ax" d="M0,252 L468,252"/>
          </svg>
        </div>

        <div class="st" style="top:236px">
          <div class="k">2015 · 비영리 재단</div>
          <div class="h">OpenAI 이사회</div>
          <div class="s">사명: 범용 AI(AGI)가 모두에게 이롭게</div>
        </div>
        <div class="st" style="top:428px;border-style:dashed">
          <div class="k">2019.3 · ‘이익 상한’ 회사</div>
          <div class="h">투자 수익은 최대 100배</div>
          <div class="s">투자는 받되, 넘는 이익은 재단 몫</div>
        </div>
        <div class="st" style="top:618px;background:var(--paper-2)">
          <div class="k">2025.10 · 공익 추구 영리기업(PBC)</div>
          <div class="h">OpenAI Group PBC</div>
        </div>

        <div class="abs" style="left:1104px;top:212px;display:flex;gap:18px;align-items:flex-end">
          ${Kit.photo('satya-nadella', '나델라', 'sm tilt-r', '--w:132px')}
          <div style="font-family:var(--font-display);font-weight:800;font-size:46px;line-height:1;margin-bottom:62px">Microsoft</div>
        </div>
        <div class="abs" style="left:1104px;top:420px;width:410px;display:flex;justify-content:space-between;align-items:baseline">
          <span style="font-size:22px">MS 투자 누적</span><b class="mono" style="font-size:34px;color:var(--rel-money);white-space:nowrap">약 130억 달러</b>
        </div>
        <div class="ms-row" style="top:472px"><span class="y">2019</span><i style="width:${(240 * 10 / 100).toFixed(0)}px"></i><b>10억</b></div>
        <div class="ms-row" style="top:510px"><span class="y">2021</span><i style="width:${(240 * 20 / 100).toFixed(0)}px"></i><b>20억</b></div>
        <div class="ms-row" style="top:548px"><span class="y">2023</span><i style="width:240px"></i><b>약 100억</b></div>
        <div class="abs" style="left:1104px;top:604px;width:410px;font-size:22px;line-height:1.35;word-break:keep-all">대신 OpenAI는 MS 클라우드 <b>Azure만</b> 쓰기로 (독점)</div>
        <div class="abs mono" style="left:1104px;top:672px;width:410px;font-size:20px;color:var(--ink-2)">2026.4 계약 개정 → Azure 독점 종료</div>

        <div class="abs" style="left:600px;top:722px;width:914px">
          <div class="pbc">
            <div style="width:26%;background:var(--paper-2)">재단 26%</div>
            <div style="width:27%;background:var(--rel-money);color:var(--paper)">MS 27%</div>
            <div style="width:47%">직원·투자자 47%</div>
          </div>
          <div class="mono" style="font-size:20px;color:var(--ink-2);margin-top:6px">2025.10 재편 당시 지분 · MS 몫은 약 1,350억 달러어치</div>
        </div>
        <div class="src">출처: OpenAI 위키백과(기업가치 2024.10–2026.3), openai.com(2019.3 OpenAI LP), Microsoft 발표(2019.7, 2023.1, 2025.10.28), The Decoder(2026.4.27), CNBC(2026.10.31)·Bloomberg(2026.11.6 보도, 약 1조 2,500억 달러)</div>`,
    },
    /* ═════════════════════════ 6. BOARD CRISIS ═════════════════════════ */
    {
      id: 'board-crisis',
      title: '5일간의 혼란 — 2023년 11월',
      minutes: 1.2,
      notes: '2023년 11월 17일 금요일, OpenAI 이사회가 CEO 올트먼을 갑자기 해임합니다. 비영리 이사회는 ‘사명’을 지키라고 만든 장치였고, 130억 달러를 약속한 MS조차 이사회 자리가 없었습니다. 하지만 주말 협상이 깨지고, 월요일 MS가 올트먼 영입을 발표하고, 직원 770명 중 700명 넘게 “이사회가 물러나라”고 서명하자, 화요일 밤 올트먼 복귀가 합의되고, 해임에 찬성한 이사 넷 중 셋(수츠케버·토너·매콜리)이 물러나 이사회가 바뀝니다.\n날짜 칸을 차례로 누르세요(또는 [다음 날 →]). 위의 ‘CEO 의자’ 막대는 날짜 비율대로 그렸고, 오른쪽 점 770개는 직원 한 명씩입니다.\n질문: “회사의 ‘사명’과 ‘돈’이 부딪치면, 누가 이겨야 할까요?”',
      html: `${SHARED_CSS}<style>
          #f-board-crisis .bc-days { position: absolute; left: 92px; top: 196px; width: 1416px; display: flex; gap: 0; }
          #f-board-crisis .bc-day { position: relative; border: 3px solid var(--ink); margin-right: -3px; background: var(--paper); cursor: pointer; text-align: left; padding: 0; font: inherit; color: var(--ink); display: flex; flex-direction: column; }
          #f-board-crisis .bc-day .wd { background: var(--ink); color: var(--paper); font-family: var(--font-mono); font-size: 20px; padding: 4px 14px; letter-spacing: .06em; }
          #f-board-crisis .bc-day .dn { font-family: var(--font-mono); font-weight: 600; font-size: 48px; line-height: 1; padding: 10px 14px 0; letter-spacing: -0.03em; }
          #f-board-crisis .bc-day .tg { font-family: var(--font-display); font-weight: 800; font-size: 28px; padding: 4px 14px 12px; }
          #f-board-crisis .bc-day:hover { background: var(--hl-soft); }
          #f-board-crisis .bc-day.on { background: var(--hl); color: #1b2630; z-index: 1; }
          #f-board-crisis .bc-day.on .wd { background: #1b2630; color: #fff; }
          #f-board-crisis .ceo { position: absolute; left: 92px; top: 368px; width: 1416px; }
          #f-board-crisis .ceo-bar { position: relative; height: 40px; }
          #f-board-crisis .ceo-bar span { position: absolute; top: 0; height: 40px; display: flex; align-items: center; padding-left: 12px; font-size: 21px; font-weight: 600; white-space: nowrap; overflow: hidden; border-right: 3px solid var(--paper); }
          #f-board-crisis .ceo-lab { font-family: var(--font-mono); font-size: 20px; color: var(--ink-2); margin-bottom: 4px; }
          #f-board-crisis .bc-ph { position: absolute; left: 92px; top: 460px; width: 400px; height: 380px; }
          #f-board-crisis .bc-ph .photo { position: absolute; --w: 190px; }
          #f-board-crisis .bc-txt { position: absolute; left: 500px; top: 468px; width: 560px; word-break: keep-all; }
          #f-board-crisis .bc-txt h3 { font-family: var(--font-display); font-weight: 800; font-size: 38px; margin: 0 0 14px; }
          #f-board-crisis .bc-txt ul { font-size: 25px; line-height: 1.38; gap: 12px; }
          #f-board-crisis .bc-gauge { position: absolute; left: 1110px; top: 468px; width: 398px; }
          #f-board-crisis .bc-gauge svg circle { fill: none; stroke: var(--ink-3); stroke-width: 1.4; }
          #f-board-crisis .bc-gauge svg circle.f { fill: var(--rel-tension); stroke: var(--rel-tension); }
          #f-board-crisis .bc-name { position: absolute; white-space: nowrap; border: 3px dashed var(--ink-2); padding: 18px 20px; font-family: var(--font-display); font-weight: 800; font-size: 32px; transform: rotate(2deg); background: var(--paper); }
          #f-board-crisis .bc-name small { display: block; font-family: var(--font-body); font-weight: 400; font-size: 20px; color: var(--ink-2); }
        </style>
        <div class="abs" style="left:92px;top:60px">
          <div class="kicker">OpenAI · 2023년 11월 17일 → 22일</div>
          <h2 class="title" style="margin-top:6px">5일간의 혼란</h2>
        </div>
        <div class="abs hand" style="left:640px;top:96px;font-size:40px;transform:rotate(-2deg)">이사회가 CEO를 해고했다. 그리고…</div>
        <div class="demo" style="position:absolute;inset:0">
          <div class="bc-days"></div>
          <div class="ceo">
            <div class="ceo-lab">CEO 의자 (날짜 비율대로)</div>
            <div class="ceo-bar">
              <span style="left:0;width:${(0.5 / 6 * 100).toFixed(2)}%;background:var(--paper-3)">올트먼</span>
              <span style="left:${(0.5 / 6 * 100).toFixed(2)}%;width:${(2.5 / 6 * 100).toFixed(2)}%;background:var(--paper-2);box-shadow:inset 0 0 0 2px var(--ink-3)">무라티 (임시)</span>
              <span style="left:${(3 / 6 * 100).toFixed(2)}%;width:${(1.9 / 6 * 100).toFixed(2)}%;background:var(--paper-2);box-shadow:inset 0 0 0 2px var(--ink-3)">에밋 시어 (임시)</span>
              <span style="left:${(4.9 / 6 * 100).toFixed(2)}%;width:${(1.1 / 6 * 100).toFixed(2)}%;background:var(--hl);color:#1b2630">올트먼 복귀</span>
            </div>
          </div>
          <div class="bc-ph"></div>
          <div class="bc-txt"><h3></h3><ul class="dash"></ul>
            <div class="btns" style="margin-top:20px"><button class="btn sm bc-next">다음 날 →</button></div>
          </div>
          <div class="bc-gauge">
            <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:22px">직원 서명 (770명)</span><b class="mono bc-cnt" style="font-size:40px;color:var(--rel-tension)">0</b></div>
            <svg class="bc-dots" width="398" height="180" viewBox="0 0 398 180" style="margin-top:6px;display:block"></svg>
            <div class="mono bc-cap" style="font-size:20px;color:var(--ink-2);margin-top:6px">점 1개 = 직원 1명</div>
          </div>
        </div>
        <div class="abs sticky" style="left:1112px;top:752px;width:396px;font-size:29px;line-height:1.12;--tilt:-1.5deg;padding:12px 20px 14px">‘사명’과 ‘돈’이 부딪치면,<br>누가 이겨야 할까?</div>
        <div class="src" style="right:520px">출처: “Removal of Sam Altman from OpenAI”·OpenAI 위키백과, OpenAI 발표(2023.11.22), Axios(2023.11.18), Bloomberg·NPR(2023.11.20), TechCrunch·The Decoder(2023.11), Decrypt(2025.11.4 증언록 보도)</div>`,
      init(el, K) {
        const days = el.querySelector('.bc-days');
        const unit = 1416 / 6;
        days.innerHTML = CRISIS.map((c, i) => `
          <button class="bc-day" data-i="${i}" style="width:${(unit * c.days.length + 3).toFixed(1)}px">
            <span class="wd">${c.wd}</span>
            <span class="dn">${c.days.length > 1 ? c.days[0] + '–' + c.days[c.days.length - 1] : c.days[0]}</span>
            <span class="tg">${c.tag}</span>
          </button>`).join('');
        // 770 dots, 35 × 22
        const dots = el.querySelector('.bc-dots');
        const dEls = [];
        for (let i = 0; i < 770; i++) {
          const c = i % 35, r = Math.floor(i / 35);
          dEls.push(K.svg('circle', { cx: 6 + c * 11.2, cy: 6 + r * 8, r: 3.3 }, dots));
        }
        let cur = 0, shown = 0, target = 0;
        const cnt = el.querySelector('.bc-cnt');
        function paint(v) {
          const k = Math.round(v);
          for (let i = 0; i < dEls.length; i++) dEls[i].classList.toggle('f', i < k);
          cnt.textContent = k === 0 ? '0' : k >= 700 ? '700+' : String(k);
        }
        function show(i) {
          cur = i;
          const c = CRISIS[i];
          days.querySelectorAll('.bc-day').forEach((b, j) => b.classList.toggle('on', j === i));
          el.querySelector('.bc-txt h3').textContent = c.head;
          el.querySelector('.bc-txt ul').innerHTML = c.items.map((t) => `<li>${t}</li>`).join('');
          const ph = el.querySelector('.bc-ph');
          const spots = [['left:6px;top:4px', '--tilt:-3deg'], ['left:196px;top:70px', '']];
          ph.innerHTML = c.photos.map((p, j) => `<div class="abs" style="${spots[j][0]}">${p[0] === 'sutskever' ? tapedFace(p[0], p[1], p[2] + ' sm', spots[j][1] + ';margin:22px 0 0 24px', 140, 10, 0.34) : K.photo(p[0], p[1], p[2], spots[j][1])}</div>`).join('') +
            (c.extra ? `<div class="bc-name" style="${c.extra[2] || 'left:206px;top:120px'}">${c.extra[0]}<small>${c.extra[1]}</small></div>` : '');
          el.querySelector('.bc-next').textContent = i === CRISIS.length - 1 ? '처음으로 ↺' : '다음 날 →';
          el.querySelector('.bc-cap').textContent = i === CRISIS.length - 1 ? '서명 700여 명 → 이사 3명 물러남' : '점 1개 = 직원 1명';
          target = c.sign;
        }
        days.addEventListener('click', (e) => { const b = e.target.closest('.bc-day'); if (b) show(+b.dataset.i); });
        el.querySelector('.bc-next').addEventListener('click', () => show((cur + 1) % CRISIS.length));
        K.loop(el, (t, dt) => {
          if (shown === target) return;
          const step = Math.max(4, Math.abs(target - shown) * 4 * dt);
          shown = target > shown ? Math.min(target, shown + step) : Math.max(target, shown - step);
          paint(shown);
        });
        show(0);
        shown = target; paint(shown);
      },
    },
  ]);
})();
