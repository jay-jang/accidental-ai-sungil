# 04. 경제적 관점 — AI 붐의 돈 이야기 (조사 노트)

> 기준일: **2026-11-09** · 대상: 성일정보고 IT 동아리(16~18세) · 용도: "어쩌다 AI" 경제 파트 슬라이드 원재료
> 표기 규칙: `(계산)` = 출처 수치로 직접 계산한 값 · `(미확인)` = 1차 출처로 확인 못 함 · `(2차)` = 언론/블로그 재인용
> 주의: 2026-11-09 팩트체크를 거쳤다(맨 끝 "검증 기록" 참고). 검색 한도 때문에 일부 항목은 출처 원문 대조만 했다. 11장에 따로 정리했다.

---

## 0. 슬라이드용 핵심 숫자 Top 12

- NVIDIA는 2025-10-29 세계 최초로 시가총액 **$5조**를 돌파했다(종가 기준 $5.03조). [출처](https://finance.yahoo.com/news/nvidia-started-5-trillion-club-172246928.html)
- NVIDIA 데이터센터 매출: FY2024 **$475억** → FY2026 **$1,937억**(약 4배, 계산). [출처](https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Fourth-Quarter-and-Fiscal-2026)
- DeepSeek 쇼크(2025-01-27) 때 NVIDIA는 하루 만에 **$5,890억**이 증발했다. 당시 미국 증시 사상 최대 하루 손실이다. [출처](https://www.bloomberg.com/news/articles/2025-01-27/asml-sinks-as-china-ai-startup-triggers-panic-in-tech-stocks)
- GPT-3.5급 AI 사용료는 100만 토큰당 **$20 → $0.07**로 내렸다(2022.11→2024.10, **280배** 하락). [출처](https://hai.stanford.edu/ai-index/2025-ai-index-report)
- Google이 처리한 토큰은 월 **9.7조 개**(2024)에서 **3,200조 개 이상**(2026-05)으로 늘었다(약 330배, 계산). [출처](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)
- 빅테크 4사(아마존·MS·구글·메타) capex는 2025년 **약 $4,160억**, 2026년 가이던스는 **약 $7,250억~7,450억**(계산)이다. [출처](https://platformonomics.com/?p=34926) [출처](https://mlq.ai/news/big-techs-2026-capex-range-reaches-720-billion-to-745-billion/)
- 2024년 전 세계 데이터센터 전력은 **415TWh**(세계 전력의 약 1.5%)였고, 2030년 **945TWh**로 예상된다. [출처](https://www.iea.org/reports/energy-and-ai/executive-summary)
- 삼성전자 2026년 3분기 영업이익은 **107.4조 원**(잠정)이다. 국내 기업으로는 처음으로 분기 100조 원을 넘었다. [출처](https://ceoscoredaily.com/page/view/2026100813501605512)
- SK하이닉스 2026년 3분기: 매출 **104.6조 원**, 영업이익 **83.3조 원**, 영업이익률 약 **80%**. [출처](https://www.cnbc.com/2026/10/28/sk-hynix-third-quarter-profit.html)
- 한국 2026년 10월 반도체 수출은 **$564.4억**(전년 대비 +259.4%)이다. 연간 수출 1조 달러 달성이 눈앞이다. [출처](https://newsis.com/view/NISX20261101_0003849625)
- ChatGPT 사용자: 주간 **8억 명**(2025.10) → **9억 명**(2026.02). 2026-09 OpenAI는 "10억 명 이상"이라고 썼다. [출처](https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users) [출처](https://openai.com/index/scaling-storage-one-billion-users-part-one)
- 2026-11-05 "AI 공포" 급락: 나스닥 -5.5%, M7 시총 **$1조 이상** 증발, NVIDIA는 -9% 이상. [출처](https://www.cnbc.com/2026/11/05/stock-market-selloff-ai-fears.html)

---

## 1. 개념 설명 (j): 왜 GPU이고, 토큰은 얼마이며, 왜 컴퓨트가 곧 돈인가

### 1-1. 왜 GPU인가 (병렬 행렬 계산)
- CPU는 캐시가 큰 소수의 강한 코어로 이루어져 있고, GPU는 수천 개 스레드를 동시에 처리하는 수백~수천 개 코어로 이루어져 있다. [출처](https://blogs.nvidia.com/blog/whats-the-difference-between-a-cpu-and-a-gpu/)
- GPU는 복잡한 문제를 수천~수백만 개의 작은 작업으로 쪼개 한꺼번에 푼다. AI 학습은 대부분 거대한 행렬 곱셈이라 이 방식이 잘 맞는다. [출처](https://blogs.nvidia.com/blog/whats-the-difference-between-a-cpu-and-a-gpu/)
- 비유: CPU는 수학 천재 몇 명, GPU는 구구단을 할 줄 아는 학생 수천 명이다. 곱셈 100만 개라면 학생 수천 명이 이긴다(설명용 비유).

### 1-2. 토큰이란, 토큰 값은 얼마인가
- 토큰은 AI가 글을 자르는 단위다. 영어 기준 1토큰은 약 4글자, 약 0.75단어다(원문 열람 실패, 경험칙). [출처](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
- GPT-4 출시가(2023.03)는 100만 토큰당 입력 **$30**, 출력 **$60**였다(2차). [출처](https://changemon.pages.dev/blog/openai-pricing-history)
- GPT-4o mini(2024.07)는 입력 **$0.15**, 출력 **$0.60**이다. 입력 단가는 GPT-4 출시가의 **1/200**이다(계산, 2차). [출처](https://cloudprice.net/models/gpt-4o-mini)
- GPT-5(2025.08 출시가)는 입력 **$1.25**, 출력 **$10**이다(2차, OpenAI 원문 접근 차단). [출처](https://www.developersdigest.tech/models/gpt-5)
- 주의: 2026-11 현재 ChatGPT 최신 모델은 GPT-5.6 Sol/Luna 계열이다. GPT-5 단가는 "2025년 기준"으로 표기한다. [출처](https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt)
- 예시(계산): GPT-5로 1,000토큰짜리 답변을 받으면 출력 비용은 약 $0.01(약 14원)이다. 100만 명이 하루 1번씩 쓰면 하루 약 $1만이다. [출처](https://www.developersdigest.tech/models/gpt-5)

### 1-3. 왜 "컴퓨트 = 돈"인가
- 공식: 학습비 ≈ GPU 개수 × 사용 시간 × 시간당 임대료. DeepSeek는 H800 임대료를 **$2/GPU시간**으로 가정했다. [출처](https://arxiv.org/html/2412.19437v1)
- Grok 4 학습에 쓰인 H100 사용 시간은 약 **2.46억 시간**으로 추정된다. 시간당 $1.90~2.20을 곱하면 중앙값 **약 $4.9억**이다(Epoch AI). [출처](https://epoch.ai/data-insights/grok-4-training-resources)
- 젠슨 황(NVIDIA CEO)이 "compute equals revenues(컴퓨트가 곧 매출)"라고 말했다는 보도가 있다(2026.02, 2차, 원문 접근 차단, 미확인). [출처](https://yourstory.com/ai-story/nvidia-jensen-huang-compute-equals-revenues-ai-drives-strong-fiscal)
- 올트먼은 OpenAI 인프라 약정이 **$1.4조**, 약 **30GW**라고 밝혔다(2025-10-28). 1GW당 약 $470억이다(계산). [출처](https://www.streetinsider.com/Reuters/Altman+touts+trillion-dollar+AI+vision+as+OpenAI+restructures+to+chase+scale/25515962.html)

---

## 2. NVIDIA (a)

### 2-1. 시가총액 마일스톤

| 기준 | 날짜 | 메모 | 출처 |
|---|---|---|---|
| $1조 | 2023년 5월(30일 장중) | 미국 기업 중 7번째 | [출처](https://finance.yahoo.com/news/nvidia-reaches-4-trillion-mark-183356312.html) |
| $2조 | 2024-02-23 장중 / 2024-03-01 첫 종가 | 전날 하루 +$2,770억(당시 사상 최대 상승) | [출처](https://fortune.com/2024/02/23/forget-beating-amazon-and-google-now-nvidia-is-part-of-the-2-trillion-club-magnificent-7/) |
| $3조 | 2024-06-05 | 2024-06-18 세계 시총 1위 | [출처](https://finance.yahoo.com/news/nvidia-reaches-4-trillion-mark-183356312.html) |
| $4조 | 2025-07-09 장중 / 07-10 첫 종가 | 세계 최초 $4조 | [출처](https://en.wikipedia.org/wiki/Nvidia) |
| $5조 | 2025-10-29 | 종가 $207.04, $5.03조 · $4조→$5조에 79거래일 | [출처](https://finance.yahoo.com/news/nvidia-started-5-trillion-club-172246928.html) |
| 약 $5.3조 | 2026-04-27 | 당시 사상 최고(Forbes 기사 제목 기준, 원문 접근 차단) | [출처](https://www.forbes.com/sites/antoniopequenoiv/2026/04/27/nvidia-sets-new-record-with-nearly-53-trillion-value-after-ai-darling-surges-4/) |
| $5.5조 | 2026-05-13 | 상장사 최초(Forbes 기사 제목 기준, 원문 접근 차단) | [출처](https://www.forbes.com/sites/antoniopequenoiv/2026/05/13/nvidia-hits-record-55-trillion-value-first-company-to-ever-reach-mark/) |
| 약 $5.8조 | 2026-10-05 종가 | 사상 최고 종가 $238.90, 연초 대비 +28%, $6조 문턱 | [출처](https://www.fool.com/investing/2026/10/06/nvidia-is-about-4-from-becoming-the-first-usd6-trillion-company-history-says-the-milestone-itself-tells-you-little/) |
| $6조 | — | **돌파 확인 못 함(미확인)** | [출처](https://www.fool.com/investing/2026/10/06/nvidia-is-about-4-from-becoming-the-first-usd6-trillion-company-history-says-the-milestone-itself-tells-you-little/) |

- 2026-10 초 보도: 자사주 매입 **$1,500억** 추가 승인("사상 최대", 승인일 미확인, 2차). [출처](https://www.deccanchronicle.com/business/companies/nvidia-on-verge-of-becoming-first-company-with-6-trillion-market-value-1993591)
- 그보다 앞선 2026-05-18에도 이사회가 자사주 매입 **$800억**을 추가 승인했다(10-Q). [출처](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000075/nvda-20260726.htm)
- 2026-11-05: 하루에 -9% 이상, **$4,400억 이상** 증발. 연초 대비 수익률이 **-2.6%**로 돌아섰다. [출처](https://www.cnbc.com/2026/11/05/stock-market-selloff-ai-fears.html)
- 급락 뒤 시총은 약 **$4.5조**(2026-11-06, 주가 $186.64 기준, 2차)로, 10월 고점보다 약 $1.3조 낮다(계산). [출처](https://www.fool.com/investing/2026/10/06/nvidia-is-about-4-from-becoming-the-first-usd6-trillion-company-history-says-the-milestone-itself-tells-you-little/)
- 비교: $5조를 찍은 날 NVIDIA 시총은 일본 GDP($4.28조, IMF)보다 컸다. [출처](https://finance.yahoo.com/news/nvidia-started-5-trillion-club-172246928.html)

### 2-2. 데이터센터 매출 (회계연도는 매년 1월 말 종료)

| 회계연도 | 데이터센터 매출 | 성장률 | 전체 매출 | 출처 |
|---|---|---|---|---|
| FY2023 (~2023.01) | 약 $150억 (역산, 계산) | — | — | [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2024) |
| FY2024 (~2024.01) | **$475억** | +217% | $609억 | [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2024) |
| FY2025 (~2025.01) | **$1,152억** | +142% | $1,305억 | [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2025) |
| FY2026 (~2026.01) | **$1,937억** | +68% | $2,159억 (+65%) | [출처](https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Fourth-Quarter-and-Fiscal-2026) |
| FY2027 2분기 (1개 분기, ~2026.07) | **$890억** | 전년 대비 +117% | $962억 (+106%) | [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027) |

- FY2027 3분기 매출 가이던스는 **$1,080억 ±2%**(중국 데이터센터 매출 제외)다. 실적 발표는 11월 중순 예정(정확한 날짜 미확인). [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027)
- 2분기(FY27) GAAP 매출총이익률은 **75.0%**다. 100원어치를 팔면 원가는 25원이라는 뜻이다. [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027)
- FY2026 "소버린 AI"(국가 AI 인프라) 매출은 3배 이상 늘어 **$300억 이상**이다. 상위 5개 고객이 데이터센터 매출의 50% 남짓이다(실적 콜 발언, 2차). [출처](https://vectorshift.ai/research/companies/nvidia/earnings/2026-q4)

---

## 3. DeepSeek 쇼크 (b)

- 2025-01-27: NVIDIA 주가 **-17%**, 시총 **$5,890억** 증발. 미국 증시 사상 최대 하루 손실이다. [출처](https://www.bloomberg.com/news/articles/2025-01-27/asml-sinks-as-china-ai-startup-triggers-panic-in-tech-stocks)
- Reuters는 같은 날 손실을 **$5,930억**으로 집계했다. 직전 기록은 2024년 9월의 약 $2,790억이다. [출처](https://finance.yahoo.com/news/chinas-deepseek-sets-off-ai-071458375.html)
- 계기는 OpenAI o1급 성능에 오픈소스인 DeepSeek-R1이었다. 같은 날 나스닥은 약 -3%, S&P500은 -1.5%였다. [출처](https://www.tomshardware.com/tech-industry/artificial-intelligence/nvidia-loses-usd589-billion-in-market-cap-broad-stock-plunge-triggered-by-deepseek-ai-release)
- "**$5.6M**"의 출처는 V3 논문이다. H800 **278.8만 GPU시간 × $2 = $557.6만**으로, 실제 지출이 아니라 임대료 환산 추정치다. [출처](https://arxiv.org/html/2412.19437v1)
- 논문은 이 금액이 "공식 학습 1회분만 포함하고 사전 연구·실험 비용은 제외"라고 직접 밝혔다. [출처](https://arxiv.org/html/2412.19437v1)
- 비교: Llama 3 405B는 3,080만 GPU시간, DeepSeek-V3는 280만 GPU시간으로 약 11배 적다. [출처](https://simonwillison.net/2024/Dec/26/deepseek-v3)
- SemiAnalysis는 서버 투자비 **약 $16억**, 운영비 약 $9.44억, GPU 구매 누적 $5억 이상으로 추정했다(2차, 원문 미열람). [출처](https://newsletter.semianalysis.com/p/deepseek-debates)
- 보유 GPU가 약 5만~6만 개라는 보도가 있으나 확인되지 않았다(미확인). [출처](https://heise.de/-10267795)
- DeepSeek은 2025-09 Nature 논문에서 R1 추가 학습비를 **$29.4만**으로 공개했다(베이스 모델 비용 별도). [출처](https://www.techspot.com/news/109542-rare-disclosure-deepseek-claims-r1-model-training-cost.html)
- 결말: 6개월 뒤(2025-07) NVIDIA는 $4조를 돌파했다. "효율이 좋아지면 수요가 줄까?"라는 질문은 10장 제번스 역설로 이어진다. [출처](https://en.wikipedia.org/wiki/Nvidia)

---

## 4. 학습 비용과 토큰 가격 하락 (c)

### 4-1. 프런티어 모델 학습비 (최종 학습 1회 컴퓨트 기준 추정치)

| 모델 | 연도 | 추정 학습비 | 출처 |
|---|---|---|---|
| Transformer(원조) | 2017 | 약 $930 | [출처](https://hai.stanford.edu/ai-index/2024-ai-index-report) |
| GPT-4 | 2023 | 약 **$7,800만** | [출처](https://hai.stanford.edu/ai-index/2024-ai-index-report) |
| Gemini Ultra | 2023 | 약 **$1.91억** | [출처](https://hai.stanford.edu/ai-index/2024-ai-index-report) |
| DeepSeek-V3 | 2024 | $560만 (임대료 환산, 범위 제한적) | [출처](https://arxiv.org/html/2412.19437v1) |
| Grok 4 | 2025 | 약 **$4.9억** (Epoch 중앙값) | [출처](https://epoch.ai/data-insights/grok-4-training-resources) |

- AI Index 수치는 Epoch AI와 함께 추정한 **컴퓨트 비용**이다. 인건비와 연구비는 들어가지 않는다. [출처](https://hai.stanford.edu/ai-index/2024-ai-index-report)
- Epoch AI에 따르면 프런티어 모델 학습비는 2016년 이후 매년 **2.4배**씩 늘었다(95% 구간 2.0~3.1배). [출처](https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models)
- Epoch의 2024년 전망: 추세가 이어지면 최대 모델 학습비는 2027년까지 **$10억 이상**이 된다. [출처](https://arxiv.org/abs/2405.21015)
- Grok 4 학습에 든 전력은 약 **310GWh**로 추정된다(Epoch, 2025-09-12). [출처](https://epoch.ai/data-insights/grok-4-training-resources)
- AI Index 2026: OpenAI·Anthropic·Google의 일부 대형 모델은 파라미터 수, 데이터 크기, 학습 기간을 더 이상 공개하지 않는다(2차). [출처](https://c3.unu.edu/blog/2026-stanford-ai-index-report-takeaways)

### 4-2. 토큰 가격은 얼마나 떨어졌나
- Stanford AI Index 2025: GPT-3.5 수준(MMLU 64.8%) 사용료가 **$20 → $0.07**/100만 토큰으로 떨어졌다(280배). [출처](https://www.tomshardware.com/tech-industry/artificial-intelligence/ai-costs-drop-280-fold-but-harmful-incidents-rise-56-percent-in-last-year-stanford-2025-ai-report-highlights-china-us-competition)
- Epoch AI: 같은 성능을 내는 가격이 과제에 따라 연 **9~900배** 떨어진다. 중앙값은 연 50배, 2024년 이후 데이터만 보면 200배다. [출처](https://epoch.ai/data-insights/llm-inference-price-trends)
- 박사급 과학 문제(GPQA)에서 GPT-4 수준에 도달하는 가격은 연 **40배**씩 하락했다. [출처](https://epoch.ai/data-insights/llm-inference-price-trends)
- 반론: 다른 연구는 프런티어급 하락 속도를 연 5~10배로 더 보수적으로 추정한다(arXiv 2511.23455). [출처](https://arxiv.org/html/2511.23455v1)
- Google은 Gemini 3.5 Flash(2026-05)가 "비슷한 프런티어 모델 가격의 절반 이하"라고 주장한다. [출처](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)

---

## 5. 빅테크 AI 투자(capex)와 Stargate (d)

### 5-1. 4사 capex 추이 (회사마다 capex 정의가 달라 근사치임)

| 연도 | 아마존 | MS | 알파벳 | 메타 | 합계 | 출처 |
|---|---|---|---|---|---|---|
| 2023 | — | — | — | — | 약 $1,510억 (미확인) | [출처](https://www.spglobal.com/market-intelligence/en/news-insights/articles/2024/11/big-tech-ramps-up-capex-as-first-signs-of-ai-returns-emerge-86140639) |
| 2024 | ~$837억 | ~$756억 | ~$526억 | ~$392억 | **약 $2,510억** | [출처](https://platformonomics.com/?p=34926) |
| 2025 | $1,347억 | $1,180억 | $915억 | $722억 | **약 $4,160억** (+66%) | [출처](https://platformonomics.com/?p=34926) |
| 2026(가이던스) | 약 $2,200억 | 약 $1,750억 (2차) | $1,950~2,050억 | $1,350~1,450억 | **약 $7,250~7,450억** (계산) | [출처](https://mlq.ai/news/big-techs-2026-capex-range-reaches-720-billion-to-745-billion/) |

- 2024년 개별 수치는 2025년 금액과 성장률로 역산한 값이다(계산). [출처](https://platformonomics.com/?p=34926)
- 2026-02 Bloomberg 집계로 4사의 2026 계획은 **약 $6,500억**이었고, 이후 상향됐다. 같은 해 미국 비테크 대기업 21곳의 합계는 $1,800억이다. [출처](https://www.datacenterknowledge.com/hyperscalers/big-tech-to-spend-650b-this-year-as-ai-race-intensifies)
- 알파벳은 2026 capex 가이던스 **$1,950~2,050억**을 유지했고, 2027년에는 $3,000억을 넘길 전망이다. 3분기 capex만 $514억이다. [출처](https://www.cnbc.com/2026/10/28/alphabet-googl-earnings-q3-2026.html)
- 아마존은 2026년 capex를 약 **$2,200억**으로 유지했다. 3분기 AWS 매출은 +39%인 **$460억**이다. [출처](https://aboutamazon.com/news/company-news/amazon-earnings-q3-2026-report)
- 메타의 2026 capex는 $1,350~1,450억이다. 3분기 capex $349억(리스 포함)이 현금흐름을 넘어 FCF가 **-$21.2억**이 됐다. [출처](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Third-Quarter-2026-Results/default.aspx)
- MS의 3분기(FY27 1분기) Azure 성장률은 **+48%**, 설비 현금 지출은 **$394억**(금융리스 제외)이다. [출처](https://www.microsoft.com/en-us/investor/earnings/fy-2027-q1/press-release-webcast)
- MS 리스 포함 capex $452억, 데이터센터 리스 회계기간 변경(15→25년)은 보도 수치다(2차, 미확인). [출처](https://redmondmag.com/articles/2026/10/30/microsoft-revenue-jumps-as-azure-and-ai-demand--fuel-growth.aspx)
- Epoch AI(오라클 포함 5사 기준): GPT-4 출시 이후 capex가 연 약 70%씩 늘어 2025년 약 $5,000억에 근접했다. [출처](https://epochai.substack.com/p/hyperscaler-capex-has-quadrupled)

### 5-2. Stargate
- 2025-01 발표: OpenAI·소프트뱅크·오라클이 미국에 4년간 **$5,000억**, **10GW** AI 인프라를 짓기로 했다. [출처](https://www.edtechinnovationhub.com/news/openais-stargate-adds-five-us-ai-data-center-sites-as-nvidia-partnership-targets-10gw-from-2026)
- 2025-09: 부지 5곳을 추가해 계획 용량 **약 7GW**, 향후 3년 투자 **$4,000억 이상**으로 늘었다. [출처](https://www.edtechinnovationhub.com/news/openais-stargate-adds-five-us-ai-data-center-sites-as-nvidia-partnership-targets-10gw-from-2026)
- 2026-04 기준 텍사스 애빌린 본진의 실가동은 **약 0.3GW**로 추정된다(Epoch). 다른 부지 5곳은 2028년 4분기 완공 목표다. [출처](https://epoch.ai/blog/openai-stargate-where-the-us-sites-stand)
- OpenAI–오라클은 4.5GW 추가 계약을 맺었고, 계약 규모는 **$3,000억**으로 보도됐다(2차, 출처 접속 실패). [출처](https://money.usnews.com/investing/articles/will-circular-financing-pop-the-ai-bubble)

---

## 6. 에너지 (e)

- IEA(2025.04): 2024년 데이터센터 전력은 **415TWh**로 세계 전력의 **약 1.5%**이며, 최근 5년간 연 12%씩 늘었다. [출처](https://www.spglobal.com/commodity-insights/en/news-research/latest-news/electric-power/041025-global-data-center-power-demand-to-double-by-2030-on-ai-surge-iea)
- IEA 기준 시나리오: 2030년 **945TWh**(세계의 3% 약간 미만), 2035년 **약 1,200TWh**. [출처](https://www.iea.org/reports/energy-and-ai/executive-summary)
- 2024년 국가별 비중은 미국 **45%**, 중국 25%, 유럽 15%다. [출처](https://www.iea.org/reports/energy-and-ai/executive-summary)
- 균형 잡힌 사실: 2030년까지 늘어나는 세계 전력 수요 중 데이터센터 몫은 약 1/10이다. 에어컨, 전기차, 산업용 모터가 더 크다. [출처](https://www.iea.org/news/ai-is-set-to-drive-surging-electricity-demand-from-data-centres-while-offering-the-potential-to-transform-how-the-energy-sector-works)
- IEA(2026.04): 2025년 데이터센터 전력 수요는 **+17%**로, 세계 전체 증가율(+3%)의 5배가 넘는다. AI 전용 센터는 이보다 더 빨랐다. [출처](https://www.rigzone.com/news/data_center_electricity_use_surges-20-apr-2026-183486-article/)
- AI 전용 데이터센터 전력이 2025년 약 +50%였다는 보도가 있다(2차, 미확인). [출처](https://techjacksolutions.com/ai-brief/iea-ai-data-center-energy-demand-jumped-50-in-2025-projected/)
- IEA: "**there is no AI without energy**"(에너지 없이 AI도 없다). [출처](https://www.rigzone.com/news/data_center_electricity_use_surges-20-apr-2026-183486-article/)
- 마이크로소프트–컨스텔레이션(2024-09): 스리마일섬 1호기를 재가동해 20년간 전력을 사는 계약이다. 설비 약 **835MW**(819MW 표기도 있음). [출처](https://www.utilitydive.com/news/constellation-three-mile-island-nuclear-power-plant-microsoft-data-center-ppa/727652/)
- 재가동 목표는 2028년에서 **2027년**으로 당겨졌다. 재가동 비용 약 $16억, 미국 에너지부 대출 $10억(2025-11). [출처](https://www.nucnet.org/news/constellation-secures-usd1-billion-federal-loann-for-three-mile-island-restart-11-3-2025)
- 메타는 Vistra·TerraPower·Oklo와 손잡고 2035년까지 최대 **6.6GW**의 원자력을 확보한다(2026-01, 2차). [출처](https://techinformed.com/meta-lines-up-up-to-6-6-gw-of-nuclear-power-with-vistra-terrapower-and-oklo-for-ohio-ai-buildout/)
- 아마존–X-energy SMR 5GW 이상(2039년 목표), 구글–Kairos Power SMR 최대 500MW(2차). [출처](https://techcrunch.com/2025/05/26/here-are-the-nuclear-fission-startups-backed-by-big-tech)

---

## 7. 한국 관점 (f)

### 7-1. 메모리 슈퍼사이클: SK하이닉스와 삼성
- SK하이닉스 2025년 실적: 매출 **97.1조 원**, 영업이익 **47.2조 원**(이익률 49%). 모두 사상 최대다. [출처](https://news.skhynix.co.kr/2025-business-results/)
- 2025년 SK하이닉스 영업이익은 처음으로 삼성전자 전체 영업이익(43.5조 원)을 넘었다. HBM 매출은 2배 이상 늘었다. [출처](https://www.heraldk.com/article/2026012800224312362)
- SK하이닉스 2026년 3분기(10-28 발표): 매출 **104.6조 원**(분기 첫 100조), 영업이익 **83.3조 원**(+632%). [출처](https://www.cnbc.com/2026/10/28/sk-hynix-third-quarter-profit.html)
- 3분기 영업이익률은 약 80%(79.7%, 계산)다. "D램·HBM은 사실상 **2029년까지 완판**"이며 장기계약 고객은 14곳이다. [출처](https://www.trendforce.com/news/2026/10/28/news-sk-hynix-3q26-opm-hits-record-80-says-dram-hbm-effectively-sold-out-to-2029-14-lta-customers-signed/)
- 삼성전자 2026년 3분기 잠정실적: 매출 약 **195조 원**(+126.6%), 영업이익 **107.4조 원**(+782.5%). [출처](https://ceoscoredaily.com/page/view/2026100813501605512)
- 삼성은 2026년 2월 "세계 최초 HBM4 양산 출하"를 했다(회사 발표). NVIDIA '베라 루빈' 공급망에도 들어갔다. [출처](https://ceoscoredaily.com/page/view/2026100813501605512)

| HBM 매출 점유율 (Counterpoint) | SK하이닉스 | 삼성 | 마이크론 | 출처 |
|---|---|---|---|---|
| 2025년 2분기 | 64% | 15% | 21% | [출처](https://counterpointresearch.com/insights/global-dram-and-hbm-market-share) |
| 2026년 1분기 | 58% | 21% | 21% | [출처](https://counterpointresearch.com/insights/global-dram-and-hbm-market-share) |
| 2026년 2분기 | 50% | 33% | 18% | [출처](https://www.koreajoongangdaily.com/business/samsung-narrows-gap-with-no-1-sk-hynix-in-hbm-market-revenue-in-q2/12859060) |

### 7-2. 반도체 수출
- 2025년 반도체 수출은 **$1,734억**(+22.2%)으로 연간 사상 최대다. 전체 수출 $7,097억으로 처음 7천억 달러를 넘었다. [출처](https://www.newsis.com/view/NISX20260101_0003462013)
- 2025년 반도체 수출은 4월부터 12월까지 9개월 연속 해당 월 기준 최대 기록을 갈아치웠다. [출처](https://www.mt.co.kr/economy/2026/01/01/2026010109121092166)
- 2026년 9월 반도체 수출은 **$603억**(+262.8%)으로 처음 월 $600억을 넘었다. 전체 수출($1,209.4억)의 49.9%다. [출처](https://news.mtn.co.kr/news-detail/2026100111035751735)
- 2026년 10월: 반도체 **$564.4억**(+259.4%), 이 중 메모리 **$501.4억**(+360.5%). 전체 수출은 $1,152.8억(+93.7%)이다. [출처](https://newsis.com/view/NISX20261101_0003849625)
- 2026년 1~10월 누적 수출은 **$9,300억**(+60.6%)이다. 정부는 "11월 중 연 수출 **1조 달러** 달성이 확실시된다"고 밝혔다. [출처](https://newsis.com/view/NISX20261101_0003849625)

### 7-3. 독자 AI 파운데이션 모델("국가대표 AI") 프로젝트
- 2025-08-04: 15개 컨소시엄 중 **네이버클라우드·업스테이지·SK텔레콤·NC AI·LG AI연구원** 5팀이 선정됐다. 카카오와 KT는 탈락했다. [출처](https://www.newsis.com/view/NISX20250804_0003277811)
- 총 예산은 **2,136억 원**이다. 정부에 GPU를 빌려줄 공급사로는 SKT와 네이버클라우드가 선정됐다. [출처](https://byline.network/2025/08/8042/)
- 2026-01-15 1차 평가: LG AI연구원이 **90.2점**으로 1위(5팀 평균 79.7점)였고, **네이버·NC AI가 탈락**했다. [출처](https://mobile.newsis.com/view/NISX20260115_0003478743)
- 네이버 탈락 사유: 외부(중국) 오픈소스 모델의 인코더 가중치를 '동결(frozen)' 상태로 그대로 써서 "독자성" 기준에 못 미쳤다. [출처](https://mobile.newsis.com/view/NISX20260115_0003478743)
- 2026-02-20 패자부활전: **모티프테크놀로지스**가 추가로 선정됐다(트릴리온랩스와 경쟁). [출처](https://www.newsis.com/view/NISX20260220_0003520469)
- 2026-08-18 2차 평가: **업스테이지·SKT·LG AI연구원** 진출, 모티프 탈락. 배점은 벤치마크 40, 전문가 35, 사용자 25점이다. [출처](https://www.fnnews.com/news/202608181111487214)
- 정부는 4팀 모델 모두 AAII **31점 이상**으로 유럽·캐나다 주요 모델보다 높다고 밝혔다. 진출 3팀에는 B200 GPU 지원을 늘린다. [출처](https://www.korea.kr/news/policyNewsView.do?newsId=148970236)

### 7-4. AI 기본법
- **2026-01-22 시행.** 정식 명칭은 「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」이다. "세계 첫 전면 시행"이라는 정부 홍보 문구는 미확인이다. [출처](https://www.ajunews.com/view/20260121110211455)
- 고영향 AI·생성형 AI 제품은 AI 기반임을 사전에 알려야 하고, 진짜와 구분이 어려운 생성물은 AI 생성임을 밝혀야 한다. [출처](https://www.segye.com/newsView/20251112513535)
- 위반 시 과태료 상한은 **3,000만 원**으로 알려져 있다(인용 기사에 없음, 미확인). [출처](https://www.segye.com/newsView/20251112513535)
- 과태료는 **최소 1년 계도기간** 동안 부과를 미룬다. [출처](https://www.mt.co.kr/tech/2025/12/31/2025123009504430416)
- 시행 100일(2026-05): 두 달간 문의 513건, "우리도 적용 대상인가" 혼선. 채용·대출 심사·의료 등이 고영향 AI 논의 대상이다. [출처](https://news.mtn.co.kr/news-detail/2026043020162964698)

### 7-5. APEC 전후의 대형 딜 (2025년 10~11월)
- 2025-10-01: OpenAI가 삼성·SK와 Stargate 협력 LOI를 맺었다. 메모리 수요는 **최대 월 90만 장** D램 웨이퍼로 제시됐다(구속력 없음). [출처](https://techcrunch.com/2025/10/01/openai-ropes-in-samsung-sk-hynix-to-source-memory-chips-for-stargate)
- 참고: 당시 삼성 D램 생산능력은 월 60~65만 장, SK하이닉스는 약 50만 장으로 추정됐다(2차). [출처](https://www.digitimes.com/news/a20251003PD218/openai-samsung-sk-hynix-supply-chain-nvidia.html)
- SKT는 OpenAI와 전남 AI 데이터센터 MOU를 맺었다("Stargate Korea"). [출처](https://www.koreatimes.co.kr/amp/business/tech-science/20251001/samsung-sk-form-ai-infrastructure-partnership-with-openai)
- 2025-10-31(APEC 경주): NVIDIA가 한국에 GPU **26만 개 이상**을 공급하기로 했다. [출처](https://www.koreatimes.co.kr/amp/business/tech-science/20251031/nvidia-to-supply-260000-chips-to-korea-for-ai-factories-with-samsung-sk-hyundai)
- 배분: 정부 5만, 삼성 5만, SK 5만, 현대차 5만, 네이버클라우드 6만 개(계획 성격). [출처](https://analyticsindiamag.com/ai-news-updates/nvidias-260000-gpus-to-supercharge-south-koreas-ai-ambitions/)

---

## 8. AI 기업 매출·기업가치·사용자 (g)

### 8-1. OpenAI
- 기업가치: 2025-03 **$3,000억** → 2025-10 **$5,000억**(직원 지분 약 $66억 매각, 세컨더리). [출처](https://the-decoder.com/openai-hits-500-billion-valuation-after-secondary-share-sale/)
- 2026-03-31: **$1,220억**을 조달하며 투자 후 기업가치 **$8,520억**을 인정받았다. [출처](https://www.cnbc.com/2026/05/28/anthropic-open-ai-startup-value.html)
- 이 라운드에서 아마존 $500억, NVIDIA $300억, 소프트뱅크 $300억을 투자했다고 보도됐다(2차). [출처](https://www.investing.com/analysis/nvidia-and-openais-100-billion-deal-is-dead-what-replaced-it-matters-more-200680620)
- 2026-10-31(FT 보도): 기업가치 **$1.25조**에 최대 $200억을 모으는 중이다(당초 $300억에서 축소, 아직 마감 전). [출처](https://www.cnbc.com/2026/10/31/openai-fundraising-20-billion-valuation.html)
- 매출: 2025년 **$130.7억**, 2025년 순손실 **$385억**(감사받은 재무자료, Quartz 보도). [출처](https://finance.yahoo.com/markets/stocks/articles/openai-q3-2026-revenue-run-171727199.html)
- 연환산 매출(2026-09 말): 약 **$500억**(Bloomberg) 또는 약 $700억(Axios). 파트너 경유 매출을 순액·총액 중 어느 쪽으로 세느냐의 차이다. [출처](https://cryptobriefing.com/openai-revenue-run-rate-nears-50-billion/)
- 2025년 말 연환산 약 $200억, "2026년 말 $700억 이상 기대(Bloomberg)"는 원문 확인 실패(미확인). [출처](https://finance.yahoo.com/markets/stocks/articles/openai-q3-2026-revenue-run-171727199.html)
- ChatGPT 주간 사용자: 4억(2025.02) → **8억**(2025.10) → **9억**(2026.02). [출처](https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users)
- 2026-09-11 OpenAI 공식 블로그 제목은 "10억 명 이상의 ChatGPT 사용자"다. DevDay(2026-09-29)의 "주간 12억"은 원문 차단으로 미확인. [출처](https://openai.com/index/scaling-storage-one-billion-users-part-one)

### 8-2. Anthropic (Claude 개발사)
- 연환산 매출: 2025년 초 **약 $10억** → 2025-08 **$50억 이상**(회사 발표). [출처](https://www.anthropic.com/news/anthropic-raises-series-f-at-usd183b-post-money-valuation)
- 이후 2025년 말 약 $90억 → 2026-04 $300억 이상 → 2026-05 $470억 → 2026-07 말 **$650억 이상**(2차). [출처](https://finance.yahoo.com/technology/ai/articles/anthropic-revenue-run-rate-hits-111710007.html)
- 기업가치: $615억(2025-03) → $1,830억(2025-09) → $3,800억(2026-02) → **$9,650억**(2026-05-28, 시리즈 H $650억). [출처](https://www.cnbc.com/2026/05/28/anthropic-open-ai-startup-value.html)
- 2025-03의 $615억은 시리즈 E($35억) 기준이다(2차). [출처](https://intellizence.com/insights/startup-funding/anthropic-funding-rounds-2026-latest-30b-round-previous-raises/)
- S-1 기준 2025년 매출 **$46억**(전년 대비 약 12배), 순손실 **$420억**(전환사채 등 공정가치 변동 약 $343억 포함), 영업손실 약 $81억. [출처](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm)
- 2026-10-26 S-1을 공개 제출했다. 나스닥 티커는 **ANT**이고, 공모가와 상장일은 미정이다(S-1 공란). [출처](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm)
- S-1: 2026년 2분기 매출 **$116억**, 영업이익 $10억(영업이익률 8%)으로 흑자 전환. 같은 분기 OpenAI 매출은 약 $67억으로 보도됐다(2차). [출처](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm)
- 주의: 두 회사의 매출 집계 방식(총액 vs 순액)이 달라 직접 비교는 조심해야 한다. [출처](https://cryptobriefing.com/openai-revenue-run-rate-nears-50-billion/)
- 향후 클라우드·인프라 지출 계획은 약 **$5,180억**이며, 약 80%는 취소할 수 없다(Reuters가 본 초안, 2차). [출처](https://decrypt.co/379605/anthropic-lost-42-billion-last-year-wants-ipo-2-trillion)

### 8-3. xAI · Google Gemini
- xAI는 2026-01 시리즈 E에서 $200억을 조달했다. 기업가치 $2,300억은 회사 발표가 아닌 보도치다(2차). [출처](https://valueaddvc.com/blog/xai-valuation-2026-230b-series-e-1-25t-combined-with-spacex-explained)
- 2026-02-02: SpaceX가 xAI를 주식 교환으로 인수한다고 발표했다(xAI $2,500억, 합산 **$1.25조**). 사상 최대 합병이다. [출처](https://www.cnbc.com/2026/02/03/musk-xai-spacex-biggest-merger-ever.html)
- Grok 단독 매출은 공개되지 않았다. 연환산 약 $5억이라는 추정이 있다(미확인). [출처](https://valueaddvc.com/blog/xai-revenue-how-grok-and-the-api-actually-make-money)
- Gemini 앱 월간 사용자: 4억(2025.05) → 6.5억(2025.10) → 7.5억(2026.02) → 9.5억(2026.07, 2차). [출처](https://www.techrepublic.com/article/news-google-gemini-950-million-monthly-users-alphabet-earnings/)
- 2026-10 실적 발표: "Gemini 앱 사용자 **10억 명** 돌파"(월간 여부는 명시 안 됨). [출처](https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000080/googexhibit991q32026.htm)
- 피차이 CEO: "Gemini 앱은 구글 역사상 가장 빨리 성장한 제품"이다. 3분기 API 처리량은 **분당 약 320억 토큰**이다. [출처](https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000080/googexhibit991q32026.htm)
- 구글 클라우드 3분기 매출은 **$307억**으로 2배 이상(+103%) 늘었다. [출처](https://www.cnbc.com/2026/10/28/alphabet-googl-earnings-q3-2026.html)

### 8-4. 학생 눈높이 통계 (Stanford AI Index 2026)
- 생성형 AI는 등장 3년 만에 인구 보급률 **53%**에 도달했다. PC나 인터넷보다 빠르다. 미국은 28.3%로 24위다. [출처](https://hai.stanford.edu/ai-index/2026-ai-index-report)
- 미국 고교생과 대학생의 **80% 이상**이 학업에 AI를 쓴다. 미국 중·고교 중 AI 정책이 있는 곳은 절반뿐이다. [출처](https://hai.stanford.edu/ai-index/2026-ai-index-report)
- 2025년 민간 AI 투자: 미국 **$2,859억**, 중국 $124억(23배 차이). [출처](https://hai.stanford.edu/ai-index/2026-ai-index-report)

---

## 9. "AI 버블인가?" 논쟁과 순환 거래 (h)

### 9-1. 순환 거래(Circular deals)의 구조
- 2025-09: NVIDIA가 OpenAI에 최대 $1,000억을 투자하기로 발표했다(1GW 완성마다 투입). OpenAI는 그 돈으로 NVIDIA 칩을 산다. [출처](https://www.cnbc.com/2026/02/03/nvidia-openai-stalled-on-their-mega-deal-ai-giants-need-each-other.html)
- 2026-01-30 이 협상이 멈췄다는 보도가 나왔다(WSJ). 젠슨 황은 "**애초에 확정 약속이 아니었다(never a commitment)**"고 말했다. [출처](https://fortune.com/2026/02/02/jensen-huang-nvidia-ceo-on-openai-investment-never-a-commitment/)
- 대신 NVIDIA는 2026-02 OpenAI에 **$300억** 지분 투자를 결정했다(3-31 라운드 마감). [출처](https://phys.org/news/2026-10-paying-circular-money-machine-ai.html)
- 2026-08: NVIDIA는 OpenAI 계열사의 오하이오 데이터센터(약 4.25GW) 임대료에 최대 **$1,050억** 보증을 섰다. [출처](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000075/nvda-20260726.htm)
- NVIDIA 10-Q(2026-07-26 기준): 보유 지분투자 약 **$990억**, 추가 투자 약정 $250억. [출처](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000075/nvda-20260726.htm)
- NVIDIA는 CoreWeave에 $20억을 투자했다. 2032년까지 CoreWeave의 팔리지 않은 용량을 사주기로 해 고객을 떠받친다(2차, 출처 접속 실패). [출처](https://money.usnews.com/investing/articles/will-circular-financing-pop-the-ai-bubble)
- 한 중앙은행 계열 분석: AI 기업에 들어간 투자의 **55.2%**가 다른 AI 기업에서 나왔다(BIS라는 기관명은 미확인). [출처](https://phys.org/news/2026-10-paying-circular-money-machine-ai.html)
- 1990년대에도 시스코 같은 장비업체가 고객사에 돈을 대 자사 장비를 사게 했다. 닷컴 버블과 닮은 점이다. [출처](https://phys.org/news/2026-10-paying-circular-money-machine-ai.html)

### 9-2. 버블이라는 쪽 (경고)
- 올트먼(2025-08): 투자자들이 AI에 과열돼 있느냐는 질문에 "**My opinion is yes.**"라고 답했다. [출처](https://www.entrepreneur.com/business-news/openai-ceo-warns-that-investors-are-overexcited-about-ai/496081)
- 올트먼: "똑똑한 사람들이 **진실의 알맹이 하나(a kernel of truth)**에 과하게 흥분한다." [출처](https://www.entrepreneur.com/business-news/openai-ceo-warns-that-investors-are-overexcited-about-ai/496081)
- MIT NANDA(2025.07~08): 기업 생성형 AI 파일럿의 **95%**가 손익에 측정 가능한 효과가 없었다. 예비 연구라는 한계가 있다. [출처](https://virtualizationreview.com/articles/2025/08/19/mit-report-finds-most-ai-business-investments-fail-reveals-genai-divide)
- 영란은행과 IMF(2025-10): AI 주식 밸류에이션이 2000년 닷컴 정점에 비견된다며 급격한 조정 위험을 경고했다. [출처](https://www.tomshardware.com/tech-industry/bank-of-england-imf-warn-ai-bubble-risk-has-shades-of-2000-dotcom-crash-goldman-sachs-cautions-were-not-there-yet)
- 2026년 3분기 메타(-$21.2억)와 알파벳(-$90.7억)의 FCF가 마이너스가 됐다. 투자가 현금 창출을 앞질렀다는 신호다. [출처](https://www.cnbc.com/2026/10/28/alphabet-googl-earnings-q3-2026.html) [출처](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Third-Quarter-2026-Results/default.aspx)
- AI 칩의 수명은 몇 년이지만 1990년대 광섬유는 수십 년을 갔다. 빨리 낡는 자산이라는 위험이 있다. [출처](https://phys.org/news/2026-10-paying-circular-money-machine-ai.html)
- 2026-11-05 급락: 나스닥 -5.5%(조정 국면 진입), S&P500 약 -4.4%, M7 시총 $1조 이상 증발. 중간선거 뒤 데이터센터 건설 둔화 우려가 원인이다. [출처](https://www.cnbc.com/2026/11/05/stock-market-selloff-ai-fears.html)

### 9-3. 버블이 아니라는 쪽 (반론)
- 수요는 실제로 있다: 2026년 3분기 Azure **+48%**, AWS **+39%**, 구글 클라우드 매출 2배 이상. [출처](https://www.microsoft.com/en-us/investor/earnings/fy-2027-q1/press-release-webcast)
- NVIDIA는 FY27 2분기에 GAAP 순이익 **$597억**을 냈고 주주에게 약 $260억을 돌려줬다. 장부상 이익은 실재한다. [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027)
- 젠슨 황이 '순환 금융' 비판을 "말도 안 된다(ridiculous)"고 일축했다는 보도가 있다(2차, 원문 접근 차단, 미확인). [출처](https://www.vantagemarkets.com/en/market-analysis/ai-financing-bubble-nvidia-openai-circular-deals-explained/)
- 메모리는 2029년까지 완판이고, AI 기업 매출은 수배씩 늘고 있다(7장, 8장). 실물 수요가 받쳐 준다는 근거다. [출처](https://www.trendforce.com/news/2026/10/28/news-sk-hynix-3q26-opm-hits-record-80-says-dram-hbm-effectively-sold-out-to-2029-14-lta-customers-signed/)
- The Conversation의 정리: "**AI 붐이 가짜라는 뜻은 아니다. 문제는 타이밍이다.**"(phys.org 재게재, 2026-10-18) [출처](https://phys.org/news/2026-10-paying-circular-money-machine-ai.html)

### 9-4. 거시경제 영향 (양쪽 견해)
- 퍼먼(하버드): 2025년 상반기 IT 장비·소프트웨어 투자는 GDP의 약 4%인데, GDP 성장의 약 **92%**를 차지했다. [출처](https://fortune.com/2025/10/07/data-centers-gdp-growth-zero-first-half-2025-jason-furman-harvard-economist/)
- 반론(이탈리아은행 연구진): 칩 수입분을 빼면 기여도는 2025년 분기당 약 0.2~0.6%p, 1~3분기 성장의 약 20%다. [출처](https://arxiv.org/html/2601.11196v1)

---

## 10. 제번스 역설 (i)

- 개념: 1865년 경제학자 제번스는 증기기관 효율이 오르자 석탄 사용량이 오히려 늘었다고 지적했다. 효율이 좋아지면 총사용량이 늘 수 있다는 것이다. [출처](https://fortune.com/2025/01/27/microsoft-ceo-satya-nadella-deepseek-optimism-jevons-paradox/)
- 나델라(MS CEO, DeepSeek 쇼크 직후): "**Jevons paradox strikes again!**" AI가 효율적이 될수록 사용이 폭증한다고 말했다. [출처](https://www.geekwire.com/2025/microsoft-ceo-says-ai-use-will-skyrocket-with-more-efficiency-amid-craze-over-deepseek/)
- 데이터로 보면, 단가는 약 280배 떨어졌는데(2022→2024) 구글 월 토큰은 약 330배 늘었다(2024→2026). 기간이 달라 단순 비교는 주의해야 한다(계산). [출처](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)
- 구글 API 처리량: 분당 약 190억 토큰(2026-05) → 약 320억 토큰(2026-10). 5개월 만에 약 1.7배다(계산). [출처](https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000080/googexhibit991q32026.htm)
- 효율 충격(DeepSeek) 이후에도 빅테크 capex는 2024년 약 $2,510억에서 2026년 $7,000억대로 오히려 늘었다. [출처](https://platformonomics.com/?p=34926)
- 소프트웨어에 적용하면: 코딩 AI로 코드 작성 비용이 내려가면 만들어지는 소프트웨어 양이 늘 수 있다. Claude Code만으로 연환산 $5억 이상(2025-08)이다. [출처](https://www.anthropic.com/news/anthropic-raises-series-f-at-usd183b-post-money-valuation)
- 주의: 제번스 역설이 항상 성립하지는 않는다. 원래 제번스의 논지는 "효율이 좋아지면 자원이 더 빨리 고갈된다"는 경고였다. [출처](https://fortune.com/2025/01/27/microsoft-ceo-satya-nadella-deepseek-optimism-jevons-paradox/)

---

## 11. 미확인 및 주의 목록 (발표 전 재확인 권장)

- NVIDIA **$6조 돌파 여부**: 2026-10-05 종가 약 $5.8조까지 확인했다. 11-05 급락 뒤에는 약 $4.5조다(미확인). [출처](https://www.cnbc.com/2026/11/05/stock-market-selloff-ai-fears.html)
- NVIDIA FY2027 3분기 실적은 11월 중순 발표 예정이다. 슬라이드 확정 전 최신 수치로 교체하는 것이 좋다(미확인). [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027)
- Anthropic 상장일, 공모가, "$2조 목표 기업가치"는 모두 보도 단계다. S-1의 2026-10-31 연환산 매출도 공란이다(미확인). [출처](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm)
- Anthropic 연환산 매출 $800억~$1,000억설(2026 가을)은 1차 출처를 찾지 못했다(미확인). [출처](https://explodingtopics.com/blog/anthropic-revenue)
- OpenAI $1.25조 라운드의 "1차 마감 $110억"설은 CNBC(10-31)가 "아직 마감 전"이라고 써서 삭제했다. [출처](https://www.cnbc.com/2026/10/31/openai-fundraising-20-billion-valuation.html)
- ChatGPT "주간 12억 명"(DevDay 2026)은 OpenAI 원문이 차단돼 확인하지 못했다(미확인). [출처](https://openai.com/index/devday-2026-recap/)
- AMD–OpenAI 6GW 계약과 신주인수권(2025-10)은 이번에도 1차 출처 접속에 실패했다(미확인). [출처](https://money.usnews.com/investing/articles/will-circular-financing-pop-the-ai-bubble)
- MS의 2026년(달력 기준) capex는 약 $1,750억 보도가 있으나 회사 공식 가이던스가 아니다. 리스 회계 변경 영향도 있다(미확인). [출처](https://mlq.ai/news/big-techs-2026-capex-range-reaches-720-billion-to-745-billion/)
- 2023년 빅테크 4사 capex 합계 약 $1,510억은 출처마다 정의가 달라 단정할 수 없다(미확인). [출처](https://www.spglobal.com/market-intelligence/en/news-insights/articles/2024/11/big-tech-ramps-up-capex-as-first-signs-of-ai-returns-emerge-86140639)
- 국가대표 AI 2차 평가 팀별 점수(SKT 70.6 등)는 인용 기사에 없어 본문에서 뺐다(미확인). [출처](https://www.fnnews.com/news/202608181111487214)
- 11-05 급락 여파로 코스피가 6% 넘게 빠졌다는 보도가 있으나 원문을 확인하지 못했다(미확인). [출처](https://www.cnbc.com/2026/11/05/stock-market-selloff-ai-fears.html)
- OpenAI와 Anthropic의 "연환산 매출"은 회사마다 계산 방식이 달라 직접 비교하면 오해가 생길 수 있다. [출처](https://cryptobriefing.com/openai-revenue-run-rate-nears-50-billion/)

---

## 슬라이드 아이디어

1. **"$1조 → $5조" 계단 차트**: NVIDIA 시총 마일스톤을 계단식으로 그리고, DeepSeek(-$5,890억)와 2026-11-05(-$4,400억) 급락을 빨간 화살표로 표시한다.
2. **데이터센터 매출 막대그래프**: FY2023 $150억부터 FY2026 $1,937억까지. 마지막에 "FY27 2분기 한 분기만 $890억" 막대를 덧붙여 체감시킨다.
3. **인터랙티브 "토큰 계산기"**: 학생이 글을 입력하면 토큰 수를 세고, GPT-4(2023) / GPT-4o mini / GPT-5(2025) 단가로 비용을 비교해 원화로 보여준다.
4. **로그 스케일 이중 차트(제번스 역설)**: 토큰 단가(↓280배)와 구글 월 토큰 처리량(9.7조→3,200조, ↑330배)을 겹친다. "싸지면 더 쓴다"를 시각화.
5. **"GPU 시간 = 돈" 퀴즈**: "H800 2,048장으로 3.7일이면 1조 토큰 학습. 그럼 14.8조 토큰은?" 같은 문제로 $560만을 직접 계산하게 한다.
6. **학습비 버블 차트**: Transformer $930 → GPT-4 $7,800만 → Gemini Ultra $1.91억 → Grok 4 $4.9억(로그 축). Epoch의 "연 2.4배" 추세선을 함께 그린다.
7. **빅테크 capex 누적 막대**: 2024 $2,510억 → 2025 $4,160억 → 2026 약 $7,300억, 회사별 색 구분. 비교 막대로 "미국 비테크 대기업 21곳 합계 $1,800억"을 넣는다.
8. **순환 거래 화살표 다이어그램**: NVIDIA → OpenAI($300억 지분) → 오라클/클라우드(칩 구매) → NVIDIA, 그리고 NVIDIA → 오하이오 데이터센터($1,050억 보증). "돈이 원을 그리며 돈다"는 메시지.
9. **버블 찬반 토론 카드**: 왼쪽은 경고(올트먼 "My opinion is yes", MIT 95%, 11-05 급락), 오른쪽은 반론(Azure +48%, HBM 2029년까지 완판). 학생들이 직접 투표한다.
10. **전력 비교 인포그래픽**: 데이터센터 415TWh(2024) → 945TWh(2030)를 국가 전력 사용량과 비교하고, Grok 4 학습 1회 310GWh도 표시한다. 스리마일섬 원전 재가동 사진을 곁들인다.
11. **한국 메모리 대시보드**: 삼성 분기 영업이익 107.4조, SK하이닉스 83.3조, HBM 점유율 파이(50/33/18), 월 반도체 수출 $603억(9월)·$564억(10월)을 한 장에 담는다.
12. **"국가대표 AI 서바이벌" 대진표**: 2025-08 5팀 → 2026-01 3팀(+모티프 부활 = 4팀) → 2026-08 3팀 토너먼트. 네이버 탈락 사유("독자성")를 퀴즈로 낸다.
13. **사용자 레이스 라인차트**: ChatGPT 주간 사용자(4억→9억→"10억+")와 Gemini 월간 사용자(4억→9.5억)를 비교한다. 주간과 월간 지표가 다르다는 점을 각주로 짚는다.
14. **"AI 회사 매출 vs 투자" 저울 그림**: OpenAI 인프라 약정 $1.4조 vs 2025년 매출 $130.7억(약 107배, 계산). "이 차이를 누가 메울까?"를 토론 질문으로 던진다.
15. **Anthropic vs OpenAI 분기 매출 카드**: 2026년 2분기 $116억 vs 약 $67억. "매출을 세는 방법이 다르면 순위도 달라진다"는 통계 리터러시 퀴즈로 쓴다.

---

## 검증 기록

> 2026-11-09 적대적 팩트체크. 각 출처 원문(WebFetch, SEC 원문 다운로드)과 대조했다. 웹 검색 한도가 일찍 소진돼, 1차 출처에 직접 접속하는 방식으로 확인했다.

**수정한 항목**
- 구글 월 토큰 "3.2경 개" → **"3,200조 개"**: 3.2 quadrillion = 3.2×10¹⁵ = 3,200조다(1경 = 10¹⁶). 단위 오류. [출처](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)
- Top 12 capex 항목에 mlq.ai 출처를 추가했다. 2026 가이던스($7,200억대)는 platformonomics(2025년 회고)에 없는 수치였다. [출처](https://mlq.ai/news/big-techs-2026-capex-range-reaches-720-billion-to-745-billion/)
- 2026 capex 합계 $7,200~7,450억 → **$7,250~7,450억**: 메타 하단이 10월 실적에서 $1,300억→$1,350억으로 좁혀졌다(계산). [출처](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Third-Quarter-2026-Results/default.aspx)
- ChatGPT "주간 12억(2026.09)"을 Top 12와 8-1에서 확정 수치로 쓰지 않았다. OpenAI 원문은 403으로 막혔다. 대신 OpenAI 블로그(2026-09-11) 제목의 "10억 명 이상"으로 바꿨다. [출처](https://openai.com/index/scaling-storage-one-billion-users-part-one)
- OpenAI 2025년 순손실 $385억의 출처 "Axios" → "감사받은 재무자료(Quartz 보도)". Axios는 비용을 확인하지 못했다고 돼 있다. [출처](https://finance.yahoo.com/markets/stocks/articles/openai-q3-2026-revenue-run-171727199.html)
- OpenAI 연환산 $500억의 출처 "FT" → "Bloomberg". 차이의 원인은 파트너 매출을 순액·총액 중 무엇으로 세느냐다. [출처](https://cryptobriefing.com/openai-revenue-run-rate-nears-50-billion/)
- NVIDIA 2026-10 시총 행: 날짜를 10-05 종가로 바꾸고 사상 최고 종가 $238.90을 넣었다. [출처](https://www.fool.com/investing/2026/10/06/nvidia-is-about-4-from-becoming-the-first-usd6-trillion-company-history-says-the-milestone-itself-tells-you-little/)
- NVIDIA 2026-04-27 "$5.26조" → "약 $5.3조". Forbes 원문이 차단돼 기사 제목("nearly $5.3 trillion")만 확인했다. [출처](https://www.forbes.com/sites/antoniopequenoiv/2026/04/27/nvidia-sets-new-record-with-nearly-53-trillion-value-after-ai-darling-surges-4/)
- $1,500억 자사주 매입: 승인일을 확인하지 못해 "2026-10 초 보도"로 고쳤다. 10-Q로 확인한 2026-05-18 $800억 추가 승인을 넣었다. [출처](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000075/nvda-20260726.htm)
- NVIDIA $1,050억 보증: "OpenAI 전용 데이터센터" → "OpenAI 계열사의 오하이오 데이터센터(약 4.25GW) 임대료 보증"(10-Q 원문). [출처](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000075/nvda-20260726.htm)
- 매출총이익률 75% 출처를 2차(outlookbusiness)에서 NVIDIA 보도자료(75.0%)로 바꿨다. [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027)
- "NVIDIA 한 분기 FCF 약 $480억"은 1차 출처와 맞지 않았다. FY27 2분기 FCF는 $213억이다. 그래서 GAAP 순이익 $597억, 주주환원 $260억으로 바꿨다. [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027)
- Stargate 애빌린 "0.3~0.6GW(추정치 불일치)" → Epoch 추정 "약 0.3GW". 다른 부지 5곳은 2028년 4분기 완공 목표다. [출처](https://epoch.ai/blog/openai-stargate-where-the-us-sites-stand)
- Stargate 2025-01 발표의 "(목표 2029)"를 "4년간"으로 바꿨다. [출처](https://www.edtechinnovationhub.com/news/openais-stargate-adds-five-us-ai-data-center-sites-as-nvidia-partnership-targets-10gw-from-2026)
- 메타 3분기 capex/FCF의 출처를 news4jax(해당 수치 없음)에서 메타 IR 보도자료로 바꿨다(-$21.2억). [출처](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Third-Quarter-2026-Results/default.aspx)
- MS: Azure +48%는 MS 보도자료로 확인했다. 리스 포함 capex $452억과 리스 회계 15→25년 변경은 원문(redmondmag 403)으로 확인하지 못해 (미확인)으로 표시했다. [출처](https://www.microsoft.com/en-us/investor/earnings/fy-2027-q1/press-release-webcast)
- 알파벳 "2022년 capex $310억"은 인용한 CNBC 기사에 없어 뺐다. 대신 기사에 있는 가이던스 유지와 3분기 capex $514억을 넣었다. [출처](https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000080/googexhibit991q32026.htm)
- Gemini "월간 사용자 10억(2026.10)" → "사용자 10억 명(월간 여부 명시 안 됨)". 실적 보도자료 원문 표현대로 고쳤다. [출처](https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000080/googexhibit991q32026.htm)
- Anthropic 2025 매출·손실과 2026년 2분기 매출을 2차 보도에서 S-1 원문으로 바꿨다. 2분기 영업이익 $10억(흑자 전환)을 추가했다. [출처](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm)
- xAI 기업가치 $2,300억은 회사가 밝힌 수치가 아님을 명시했다. 합병 발표일을 2026-02-02로 고쳤다. [출처](https://www.cnbc.com/2026/02/03/musk-xai-spacex-biggest-merger-ever.html)
- HBM 점유율 2025년 2분기 62/17/21 → **64/15/21**(Counterpoint 현행 표). [출처](https://counterpointresearch.com/insights/global-dram-and-hbm-market-share)
- SK하이닉스 "국내 상장사 1위" → "처음으로 삼성전자 전체 영업이익을 넘었다"(원문 표현). [출처](https://www.heraldk.com/article/2026012800224312362)
- 2026년 9월 반도체 수출 "$600억 초과(원문 미열람)" → **$603억(+262.8%)**, 원문으로 확인했다. [출처](https://news.mtn.co.kr/news-detail/2026100111035751735)
- 2025년 12월 반도체 수출 "$208억"은 인용 기사에 없어 뺐다. 대신 "9개월 연속 월별 최대"로 바꿨다. [출처](https://www.mt.co.kr/economy/2026/01/01/2026010109121092166)
- 국가대표 AI 정부 지원 "약 2,000억 원" → **총 예산 2,136억 원**. "B200·H100 각 1,024장"은 인용 기사에 없어 뺐다. [출처](https://byline.network/2025/08/8042/)
- 1차 평가 출처를 smarttoday(평균 점수 없음)에서 뉴시스로 바꿨다. 네이버 탈락 사유 "알리바바 Qwen"은 원문에 없어 "외부(중국) 오픈소스 인코더"로 고쳤다. [출처](https://mobile.newsis.com/view/NISX20260115_0003478743)
- 2차 평가: 팀별 점수(SKT 70.6 등)는 출처에 없어 뺐다. AAII "31점을 넘어" → "31점 이상". [출처](https://www.korea.kr/news/policyNewsView.do?newsId=148970236)
- AI 기본법: "세계 첫 시행", "과태료 3,000만 원"은 인용 기사에서 확인하지 못해 (미확인)으로 표시했다. "자율주행 레벨4 대표 사례"는 출처에 없어 뺐다. [출처](https://www.mt.co.kr/tech/2025/12/31/2025123009504430416)
- AI 기본법 100일 기사 날짜를 2026-05-01로 확인하고 문의 513건을 추가했다. [출처](https://news.mtn.co.kr/news-detail/2026043020162964698)
- 비롤 인용: 원문은 IEA 보도 속 문장("the IEA was early in recognizing that there is no AI without energy")이라 IEA 발언으로 고쳤다. [출처](https://www.rigzone.com/news/data_center_electricity_use_surges-20-apr-2026-183486-article/)
- "BIS 55.2%" → "한 중앙은행 계열 분석". 원문에 기관명이 없다. [출처](https://phys.org/news/2026-10-paying-circular-money-machine-ai.html)
- 퍼먼 반론 논문: "0.3~0.6%p" → "0.2~0.6%p"(3분기 0.2%p 포함), 기간은 2025년 1~3분기로 명시했다. [출처](https://arxiv.org/html/2601.11196v1)
- Transformer 학습비 "약 $900(미확인)" → "약 $930"(AI Index 2024). [출처](https://hai.stanford.edu/ai-index/2024-ai-index-report)
- 스리마일섬 설비용량은 835MW(회사 발표)와 819MW(NucNet) 표기가 섞여 있어 둘 다 적었다. [출처](https://www.nucnet.org/news/constellation-secures-usd1-billion-federal-loann-for-three-mile-island-restart-11-3-2025)
- 최신 모델명: GPT-5 단가를 "2025년 기준"으로 못박고, 2026-11 현재 GPT-5.6 Sol/Luna 계열이 최신이라고 덧붙였다. [출처](https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt)
- 11-05 급락 뒤 NVIDIA 시총 약 $4.5조(11-06)를 추가해, "$5조대"가 현재처럼 읽히지 않게 했다(2차). [출처](https://www.fool.com/investing/2026/10/06/nvidia-is-about-4-from-becoming-the-first-usd6-trillion-company-history-says-the-milestone-itself-tells-you-little/)

**삭제한 항목**
- "같은 주 CoreWeave 고점 대비 -76%, 오라클 CDS 305bp": 인용한 Motley Fool 기사에 둘 다 없다. [출처](https://www.fool.com/investing/2026/11/05/the-ai-selloff-is-getting-worse-nvidia-dell-and-data-center-stocks-are-plunging-hard-is-it-time-to-buy-the-dip/)
- "OpenAI $1.25조 라운드 1차 마감 $110억": CNBC는 "아직 마감 전"이라고 썼다. [출처](https://www.cnbc.com/2026/10/31/openai-fundraising-20-billion-valuation.html)
- "OpenAI 2026년 말 연환산 $700억 이상 기대(Bloomberg)": 인용 링크가 404다(11장에 미확인으로 남김).

**원문으로 확인한 핵심 수치(변경 없음)**
- NVIDIA FY2026 매출 $2,159억, 데이터센터 $1,937억 / FY27 2분기 $962억·$890억, 3분기 가이던스 $1,080억(중국 제외). [출처](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027)
- 11-05: 나스닥 -5.5%, S&P -4.4%, NVIDIA -9% 이상·$4,400억 이상, 연초 대비 -2.6%, M7 $1조 이상. [출처](https://www.cnbc.com/2026/11/05/stock-market-selloff-ai-fears.html)
- 삼성 107.4조, SK하이닉스 104.6조·83.3조, 10월 수출 $564.4억·누적 $9,300억, Anthropic $9,650억, OpenAI $8,520억·$1.25조, AWS $460억, 구글 클라우드 $307억.

**확인하지 못한 채 남긴 항목**: 2-1의 Forbes 원문 수치, 젠슨 황 "compute equals revenues"와 "ridiculous" 발언, Gemini 9.5억(TechRepublic 403), CoreWeave $20억 투자, 오라클 $3,000억 계약, AMD–OpenAI 6GW, MS 리스 회계 변경. 모두 본문에 (2차)나 (미확인)으로 표시했다.
