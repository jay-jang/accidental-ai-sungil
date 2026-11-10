# 어쩌다 AI — 성일 정보고 편 · 섹션 작성 가이드

이 문서는 강의 캔버스에 프레임(슬라이드)을 추가하는 사람을 위한 규칙입니다.

## 1. 무엇을 만드는가

- 대상: 성일정보고등학교 IT 동아리 학생(16–18세). 50분 × 2교시.
- 형식: 프레지(Prezi)처럼 **한 장의 거대한 모눈종이 캔버스** 위에 1600×900 프레임들이 놓이고, 카메라가 확대·이동하며 이동합니다. 엔진(`js/engine.js`)과 배치(`js/layout.js`)가 위치와 카메라를 담당하므로 섹션 파일은 **내용만** 정의합니다.
- 원칙: 긴 글 대신 **사진 · 도식 · 직접 만져 보는 예제 · 애니메이션**. 한 프레임에 한 가지 생각.
- 금지: 이모지, 아이콘 폰트, 장식용 아이콘 줄, 빛나는 뇌·로봇·회로 배경 같은 상투적 AI 이미지, 보라-파랑 그라데이션, 모든 블록에 둥근 카드+그림자, 모든 것을 가운데 정렬.
- 지향: 공대 노트(모눈종이) 위의 **흑연 잉크 + 파란 볼펜 손글씨 + 노란 형광펜 + 마스킹테이프로 붙인 흑백 사진**. 도식은 잉크 선으로 그린 것처럼.

## 2. 파일과 API

각 섹션 파일은 아래 형태입니다. 다른 사람의 파일은 수정하지 마세요.

```js
(function () {
  'use strict';
  Deck.part('concepts', 1, [          // (섹션 id, 파트 순서, 프레임 배열)
    {
      id: 'nested',                    // 전역에서 유일한 ascii kebab-case
      title: 'AI ⊃ 머신러닝 ⊃ 딥러닝',  // HUD·노트·지도에 쓰임
      minutes: 1.5,                    // 계획 시간(분)
      optional: false,                 // true면 '보충' — 압축 모드(S)에서 건너뜀
      year: '1956', tag: '1차 겨울',   // road 레이아웃 섹션(history, race)에서만: 프레임 위에 큰 연도/손글씨 태그
      notes: '발표자 노트. 3–6문장. 무엇을 클릭할지, 학생에게 던질 질문 하나 포함.',
      html: `...`,                     // 1600×900 무대 안의 HTML
      init(el, Kit, f) {},             // 1회. DOM 만들기, 캔버스 그리기, 이벤트 연결 (로드 직후 유휴 시간에 모든 프레임이 init됨)
      enter(el, Kit, f) {},            // 이 프레임에 카메라가 도착했을 때
      leave(el, Kit, f) {},            // 떠날 때 (타이머/애니메이션 정리)
      onStep(el, step, Kit, f) {},     // → 키로 단계가 바뀔 때 (data-step 사용 시)
    },
  ]);
})();
```

- `el`은 `<section class="frame">`이고, `html`은 `el.querySelector('.stage')` 안에 들어갑니다. 무대는 1600×900 CSS px, 기본 padding `64px 92px 60px`, `display:flex; flex-direction:column; gap:26px`.
- 절대 위치가 필요하면 `.abs`(position:absolute)를 쓰세요. 기준은 `.stage`(1600×900)입니다.
- **빌드 단계**: 요소에 `data-step="1"`, `"2"`…를 붙이면 → 키를 누를 때마다 차례로 나타납니다(현재 프레임에서만 숨김; 지도에서는 모두 보임). 단계는 프레임당 0–4개 정도.
- 프레임 전용 CSS가 필요하면 `html` 안에 `<style>`을 넣되 **반드시 `#f-<프레임id>`로 범위를 제한**하세요. 예: `<style>#f-nested .ring{...}</style>`.
- 섹션 허브(제목 프레임)는 엔진이 자동으로 만듭니다. 여러분은 자식 프레임만 작성합니다.

## 3. 시각 시스템 (css/deck.css)

색은 반드시 토큰으로: `var(--paper) --paper-2 --paper-3 --ink --ink-2 --ink-3 --pen --pen-soft --hl --hl-soft --good --bad --rel-tension --rel-tech --rel-money --c1..--c5 --sticky --term-bg --term-fg`. 하드코딩한 색은 다크 테마(T 키)에서 깨집니다. 캔버스에 그릴 때는 그리는 함수 안에서 `const C = Kit.colors()`로 읽고 `Kit.onTheme(draw)`로 테마 변경 시 다시 그리세요.

글꼴: `--font-display`(Hahmlet, 제목), `--font-body`(IBM Plex Sans KR), `--font-mono`(IBM Plex Mono, 숫자·연도·라벨), `--font-hand`(나눔펜, 손글씨 주석).

| 클래스 | 용도 |
|---|---|
| `.kicker` | 맨 위 작은 라벨 (예: `1956 · 다트머스`) |
| `.title` (`.xl` `.md`) | 프레임 제목 76px (104 / 54) |
| `.subtitle` `.lede` | 38px 소제목 / 34px 리드 문장 |
| `.hand` (`.lg` `.xl`) | 파란 볼펜 손글씨 주석. 프레임당 1–2개만 |
| `.mark` | 형광펜 밑줄 강조 |
| `.year` (`.sm`) | 큰 mono 연도 |
| `.photo` (+`.sm` `.lg` `.wide` `.tilt-r` `.tilt-0` `.color`) | 테이프로 붙인 흑백 사진. `Kit.photo(id, '캡션', 'sm tilt-r')` |
| `.sticky` | 포스트잇 메모 |
| `.quote` + `<cite>` | 큰 인용문 |
| `.stat` (`<b>`숫자`</b><span>`설명`</span>`) | 큰 숫자 |
| `.box` (`.pen` `.dashed`) / `.panel` | 손으로 그린 테두리 / 옅은 면 |
| `.term` (`.dim` `.hi`) | 터미널·코드·챗 화면 |
| `.btn` (`.sm` `.on` `.ghost`), `.btns`, `.chip` (`.on`) | 버튼·토글 |
| `.field` + `<label>` + `<input type=range>` + `<output>` | 슬라이더 |
| `.row` `.stack` `.cols-2` `.cols-3` `.cols-4` `.cols-2-1` `.cols-1-2` `.grow` `.fill` `.push` | 배치 |
| `ul.dash` / `ol.dash` | 목록 (항목 3–4개까지) |
| `svg.chart` + `.ax .gridl .ln .ln.pen .bar .bar.pen .bar.hl .dot .big .hand` | SVG 차트 |
| `.src` | 프레임 맨 아래 출처 줄 (작은 mono, 절대 위치) |
| `.demo` | **인터랙티브 영역은 반드시 `.demo`로 감싸기** — 드래그/휠이 캔버스 이동으로 새지 않게 함 |

글자 크기: 본문 26–34px, 라벨 최소 20px(출처 줄만 15px 허용). 프레임당 눈에 보이는 문장은 짧게(데모 제외 대략 60단어 이하). 제목은 2줄 이내.

## 4. 인터랙티브 예제 (Kit API, js/kit.js)

- `Kit.canvas(host, w, h)` → `{cv, ctx, w, h}` 고해상도 캔버스(CSS px 좌표로 그림).
- `Kit.pt(evt, el)` → 요소 안의 포인터 좌표(CSS px).
- `Kit.loop(el, (t, dt) => {...})` → **현재 프레임일 때만** 도는 애니메이션 루프. 다른 rAF/setInterval 무한 루프 금지(필요하면 enter에서 시작, leave에서 정리).
- `Kit.colors()`, `Kit.onTheme(fn)`, `Kit.rand(seed)`, `Kit.gauss(rnd)`, `Kit.sketchLine(ctx, …)`, `Kit.sketchRect`, `Kit.sketchPath(points, {wobble})`, `Kit.svg(tag, attrs, parent)`, `Kit.el(html)`, `Kit.countTo(el, to, ms, fmt)`, `Kit.typewrite(el, text, cps)`, `Kit.sleep(ms)`, `Kit.store.get/set`, `Kit.clamp/lerp/ease/easeOut/sigmoid`, `Kit.escape`, `Kit.img(id)`, `Kit.photo(id, caption, cls)`.
- 외부 라이브러리·fetch·XHR 금지(파일을 더블클릭해 `file://`로 열어도 동작해야 함). `alert/confirm/prompt` 금지. 저장은 `Kit.store`만.
- 데모는 **처음 보이는 상태가 이미 완성된 그림**이어야 합니다(빈 캔버스 금지). init에서 초기 상태를 그리세요.
- 데모 컨트롤은 크게(버튼 24px, 슬라이더 넓게). 발표자가 프로젝터 앞에서 마우스로 쉽게 누를 수 있게.
- → / ← 키는 엔진이 씁니다. 데모에서 키보드 입력이 필요하면 `<input type=text>` 안에서만.

## 5. 이미지

- `assets/img/<id>.jpg` 만 사용. 작업 전에 `ls assets/img`로 실제 있는 파일만 쓰세요. 출처는 `assets/img/credits-*.json`(크레딧 페이지가 자동 생성).
- 사람 사진은 `Kit.photo('hinton', '제프리 힌턴')`. 캡션은 손글씨, 짧게(이름만, 필요하면 `<small>연도</small>`).
- 사진이 없는 인물은 사진 대신 이름을 큰 디스플레이 글꼴로 쓰거나, 펜으로 그린 이니셜 원을 사용.
- 회사 로고는 쓰지 않습니다. 회사는 워드마크처럼 글자로 표현(`<span class="display">OpenAI</span>`).

## 6. 내용 규칙

- 모든 사실·숫자·날짜·인용은 `research/*.md`(검증 완료)에서 가져옵니다. `(미확인)` 표시된 것은 쓰지 않거나 “~로 알려짐”처럼 분명히 표현합니다. 새로 필요한 사실은 직접 WebSearch로 확인한 뒤 씁니다. 오늘은 2026-11-09입니다.
- 숫자와 주장에는 프레임 아래 `.src` 줄에 짧은 출처를 적습니다 (예: `출처: Stanford AI Index 2024, Epoch AI`).
- 돈 단위: 한국어 단위 + 원래 달러. `$100B` → `1,000억 달러`, `$1T` → `1조 달러`, `$13B` → `130억 달러`.
- 인물 간 갈등은 **양쪽 주장을 공정하게**. 소송·논쟁은 확인된 사실과 각자의 주장을 구분해 씁니다.
- 고등학생 눈높이: 전문용어는 처음 한 번 쉬운 말로 풀어 쓰기. 겁주기보다 구체적인 데이터와 “그래서 너희는?” 질문.
- `notes`(발표자 노트)는 꼭 채웁니다: 말할 핵심 2–3문장 + 클릭/실습 방법 + 학생에게 던질 질문 1개.

## 7. 확인 방법

처음 한 번: `npm i -D playwright && npx playwright install chromium`

```
node --check js/sections/<파일>.js
node tools/shot.mjs shots <프레임id> <프레임id> ...      # 1600×900 스크린샷, 단계는 모두 펼친 상태
THEME=dark node tools/shot.mjs shots-dark <프레임id>     # 어두운 테마
ALL=1 OVERVIEW=1 node tools/shot.mjs shots-all           # 전체 + 지도
node tools/smoke.mjs                                     # 모든 장의 버튼·칩·슬라이더를 눌러 오류 확인
```
스크린샷을 열어 글자 넘침·겹침·잘림, 빈 캔버스, 다크 테마에서 안 보이는 글자를 고칩니다. 스크립트가 출력하는 콘솔 오류는 0건이어야 합니다.
