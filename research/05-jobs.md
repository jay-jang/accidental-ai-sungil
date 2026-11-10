# 05. AI 시대의 일자리와 소프트웨어 엔지니어의 미래 — 리서치 노트

- 기준일: 2026-11-09 · 용도: 「어쩌다 AI — 성일 정보고 편」(2교시 x 50분), 16~18세 IT 동아리
- 규칙: 사실 bullet마다 끝에 [출처]를 달았고, 확인하지 못한 내용은 (미확인)으로 표시함. 서로 다른 지표는 직접 비교하지 말 것(§15 참고)

---

## 0. 한눈에 보는 핵심 숫자 (슬라이드용 Top 12)

- 2030년까지 일자리 **1억 7,000만 개 생성, 9,200만 개 소멸 → 순증 7,800만 개** (WEF, 2025.1) [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 미국 22~25세의 AI 고노출 직업 고용은 노출이 적은 또래만큼 늘었을 경우보다 **19% 낮음** (2026.6 데이터, 2026.8.12 발표) [출처](https://digitaleconomy.stanford.edu/news/canariesaug26/)
- 미국 22~25세 소프트웨어 개발자 고용은 **2024년 대비 약 20% 감소** (Stanford AI Index 2026) [출처](https://hai.stanford.edu/ai-index/2026-ai-index-report/economy)
- METR(2025.7): 숙련 개발자가 AI를 쓰면 **19% 더 느렸는데**, 본인들은 **20% 빨라졌다고 믿음** [출처](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- GitHub Copilot 실험(2022): 같은 과제를 **55% 더 빨리** 끝냄(1시간 11분 vs 2시간 41분) [출처](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/)
- Google 신규 코드 중 AI 생성 비율: **25% 이상(2024.10) → 50%(2025 가을) → 75%(2026.4.22)** (회사 자체 발표) [출처](https://fortune.com/2024/10/30/googles-code-ai-sundar-pichai) [출처2](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai/)
- GitHub: 2026년 9월 PR의 **40% 이상이 AI 에이전트의 초안으로 시작**(3월에는 17%) [출처](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/)
- 개발자 **84%가 AI를 쓰거나 쓸 계획**인데, 정확성을 "매우 신뢰"하는 비율은 **3.1%** (SO 2025) [출처](https://survey.stackoverflow.co/2025/ai)
- AI가 해낼 수 있는 과제의 길이는 **약 7개월마다 2배**로 늘었음 (METR, 2025.3) [출처](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- 미국 '컴퓨터 프로그래머'는 **-7%**, '소프트웨어 개발자'는 **+10%** 전망 (BLS, 2025~35) [출처](https://www.bls.gov/ooh/computer-and-information-technology/computer-programmers.htm) [출처2](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm)
- 현장 배치 엔지니어(FDE) 채용 공고 **1,000% 이상 증가** (2026.1~8, 전년 같은 기간 대비) [출처](https://fortune.com/2026/09/03/forward-deployed-engineers-fast-growing-six-figure-silicon-valley-job-integrate-ai-with-customers-tech-careers-palantir/)
- 한국: 2022.6~2026.6 청년(15~29세) 취업자 **28.5만 명 감소**, 감소분의 **94%가 AI 고노출 업종** (한은, 2026.8.18) [출처](https://etoday.co.kr/news/view/2615429)

---

## 1. WEF Future of Jobs Report 2025 (2025.1 발표)

- 조사 대상: 1,000개 이상 기업(근로자 1,400만 명 이상, 22개 산업, 55개국) [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 2025~2030년 구조 변화는 현재 일자리의 22%: 생성 14%(1.7억), 소멸 8%(9,200만), 순증 7%(7,800만) [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 기업의 86%가 "AI·정보처리 기술이 2030년까지 우리 사업을 바꾼다"고 답함 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 증가율 상위 1~5위: 빅데이터 전문가, 핀테크 엔지니어, AI·ML 전문가, SW·앱 개발자, 보안관리 전문가 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 6~15위: 데이터웨어하우징, 자율·전기차, UI/UX, 배송기사, IoT, 데이터 분석가, 환경공학, 정보보안 분석가, DevOps, 재생에너지 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 감소율 상위 15개 직업: 데이터 입력원, 은행 창구직원, 우편 사무원, 계산원, 행정비서, 경리, 텔레마케터, **그래픽 디자이너** 등 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 절대 수로 가장 많이 느는 직업은 현장직(농업 노동자, 배달기사, 건설 노동자, 판매원, 식품가공) [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 근로자 핵심 기술의 **39%가 2030년까지 바뀜**(2023년 조사 44%, 2020년 57%) [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 2025년 핵심 기술(꼽은 기업 비율): 분석적 사고 69%, 회복탄력성·유연성 67%, 리더십 61%, 창의적 사고 57% [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 같은 표에서 '프로그래밍'은 26개 중 23위(17%). 기술 리터러시는 51%, AI·빅데이터는 45% [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 가장 빠르게 뜨는 기술 1~3위: AI·빅데이터, 네트워크·사이버보안, 기술 리터러시 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 순증가 응답 비율에서 '프로그래밍'은 26개 중 17위(+27). AI·빅데이터는 +87로 1위 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 근로자 100명 중 59명은 2030년까지 재교육이 필요하고, 그중 11명은 받지 못할 전망 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 기업 2/3는 AI 역량 인재 채용을 계획하고, 40%는 AI로 자동화되는 곳의 인력 감축을 예상 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- 한국 내 기업: 71%가 지정학 긴장을 핵심 변수로 꼽음(세계 평균의 2배 이상). 92%는 신기술 인재 채용 계획 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)

## 2. Stanford Digital Economy Lab "Canaries in the Coal Mine" (탄광 속 카나리아)

- 저자는 Erik Brynjolfsson·Bharat Chandar·Ruyu Chen, 데이터는 ADP 급여 기록(미국 근로자 수백만 명) [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 이전 판의 13%(2025.7 데이터)·16%(2025.9 데이터)는 기업 충격을 통제한 **회귀 추정치**라 19%와 계산 방식이 다름 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 2026.8.12 개정판: 노출이 적은 또래만큼 늘었을 경우보다 **19% 낮음**(2026.6 데이터). 같은 방식으로 2025.7엔 15%였음 [출처](https://digitaleconomy.stanford.edu/news/canariesaug26/)
- 절대 수준(2022.11~2026.6): 고노출 직업의 22~25세 고용 **약 11% 감소**, 저노출 직업은 **약 10% 증가** [출처](https://digitaleconomy.stanford.edu/news/canariesaug26/)
- 22~25세 전체 고용은 같은 기간 거의 제자리(-1.9%). 저노출 직업 증가가 고노출 감소를 대부분 메움 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 22~25세 소프트웨어 개발자 고용은 **2024년 대비 약 20% 감소** (Stanford AI Index 2026) [출처](https://hai.stanford.edu/ai-index/2026-ai-index-report/economy)
- 6가지 사실 ①: 경제 전체로 보면 대량 실직의 증거는 없음 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 6가지 사실 ②~④: 격차는 청년층에만 있고 계속 커지고 있음. 해고가 늘기보다 **'안 뽑는'** 방식으로 나타남 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 6가지 사실 ⑤: AI가 사람을 **대신하는** 직업에서는 고용 감소, **돕는** 직업에서는 유지·증가 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 6가지 사실 ⑥: 임금은 그대로이고 고용 수가 조정됨 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 암묵지(tacit knowledge)가 필요한 직업에서는 경력자 고용이 더 빨리 늘었음 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 기술기업·컴퓨터 직업을 빼거나 금리·재택근무를 통제해도 패턴이 유지됨 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 2026.2.9 후속 노트: 감소가 통계적으로 뚜렷해진 시점은 2024년이고, 금리로는 잘 설명되지 않음 [출처](https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers)
- 한계: 인과 추정이 아니라 기술(記述)적 사실. 교육수준을 통제하면 약해지고, 일부 추세는 ChatGPT 이전부터 있었음 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- 배경: SW 엔지니어링 벤치마크(SWE-bench) 점수가 4.4%(2023)에서 71.7%(2024)로 급등(AI Index 2025 인용) [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)

## 3. Anthropic Economic Index (Claude 사용 데이터)

- 2025.2.10 첫 보고서: 대화의 **37.2%가 컴퓨터·수학(주로 코딩)**으로 1위 [출처](https://www.anthropic.com/news/the-anthropic-economic-index)
- 같은 보고서: 증강(협업) 57% vs 자동화(위임) 43%. 업무의 25% 이상에 AI를 쓰는 직업은 약 36% [출처](https://www.anthropic.com/news/the-anthropic-economic-index)
- 2025.4.28 코딩 보고서(50만 건 분석): 자동화 비율 **Claude Code 79% vs Claude.ai 49%** [출처](https://www.anthropic.com/research/impact-software-development)
- 언어별 비중은 JS+TS 31%, HTML+CSS 28%, Python 14%, SQL 6%로 웹 프런트엔드가 가장 많음 [출처](https://www.anthropic.com/research/impact-software-development)
- Claude Code 대화 중 스타트업 업무 32.9%, 대기업 업무 23.8% [출처](https://www.anthropic.com/research/impact-software-development)
- 2025.9.15: '지시형' 대화가 27%(2024.12)에서 39%로 늘어, **자동화(49.1%)가 증강(47%)을 처음으로 앞섬** [출처](https://www.anthropic.com/research/economic-index-geography)
- 기업 API 트래픽은 77%가 자동화 패턴, 증강은 12% [출처](https://www.anthropic.com/research/economic-index-geography)
- 2025.9 기준 한국은 인구 대비 Claude 사용지수(AUI) 세계 Top 5(이스라엘·싱가포르·호주·뉴질랜드·한국) [출처](https://www.anthropic.com/research/economic-index-geography)
- 2026.1.15: Claude.ai에서 다시 증강 52% vs 자동화 45%. 코딩 비중 34%(2025.11, 정점은 2025.3의 40%) [출처](https://www.anthropic.com/research/anthropic-economic-index-january-2026-report)
- 2026.3.24: 직업의 49%가 업무의 1/4 이상을 Claude로 처리한 기록이 있음 [출처](https://www.anthropic.com/research/economic-index-march-2026-report)
- 2026.6.26 설문(사용 데이터와 연결된 약 9,700명): "AI가 할 수 있는 내 업무 비율"을 15년 이상 경력자는 1년 차보다 약 10%p 낮게 봄 [출처](https://www.anthropic.com/research/economic-index-june-2026-report)
- 같은 설문: 실직 걱정은 경력 초기 응답자가 가장 큼 [출처](https://www.anthropic.com/research/economic-index-june-2026-report)
- 같은 설문: 57%는 "AI 덕분에 내 기술의 가치가 올랐다", 68%는 "AI로 더 많이 배운다"고 답함(자기평가) [출처](https://www.anthropic.com/research/economic-index-june-2026-report)
- 응답자의 1/3 이상이 "주니어 동료가 내년에 실직할 확률이 60%를 넘는다"고 봄 [출처](https://www.anthropic.com/research/economic-index-june-2026-report)
- Anthropic 내부 조사(2025.12.2, 엔지니어·연구자 132명 설문+53명 인터뷰): 업무 중 Claude 사용 28%→59%, 생산성(자기보고) +20%→+50%(1년 사이) [출처](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)
- 그래도 절반 이상은 "완전히 맡길 수 있는 일"이 0~20%라고 답함. AI가 도운 작업의 27%는 AI 없이는 안 했을 일 [출처](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)
- 엔지니어 인용: "결과물 만들기가 너무 쉬워지면, 시간을 들여 진짜 배우기가 점점 어려워진다" [출처](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)
- '감독의 역설': AI를 감독하려면 코딩 실력이 필요한데, 그 실력이 AI 때문에 녹슬 수 있음 [출처](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)

## 4. 생산성: AI를 쓰면 빨라질까, 느려질까?

- GitHub Copilot 실험(2022.9): 개발자 95명이 JS로 HTTP 서버 작성. 55% 빨랐고 완료율은 78% vs 70% [출처](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/)
- METR RCT(2025.7.10): 숙련 오픈소스 개발자 16명, 실제 이슈 246개, Cursor와 Claude 3.5/3.7 Sonnet 사용 [출처](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- 결과: AI를 허용하면 **19% 더 오래 걸림**(95% 신뢰구간 +2%~+39%) [출처](https://metr.org/blog/2026-02-24-uplift-update/)
- 착각: 시작 전에는 24% 빨라질 거라 예상했고, 끝난 뒤에도 20% 빨라졌다고 믿음 [출처](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- 맥락: 평균 스타 22k 이상, 100만 줄 이상인 '익숙하고 거대한' 저장소에서 진행한 실험 [출처](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- 후속 연구(2026.2.24 발표, 57명·143개 저장소·800개 이상 과제): 기존 참가자 18% 빨라짐(CI -38%~+9%), 신규 참가자 4% 빨라짐(CI -15%~+9%). 두 구간 모두 0 포함 [출처](https://metr.org/blog/2026-02-24-uplift-update/)
- 단, 개발자의 30~50%가 "AI 없이 하기 싫다"며 일부 과제를 내지 않음. METR은 "신뢰하기 어려운 신호"라고 직접 밝힘 [출처](https://metr.org/blog/2026-02-24-uplift-update/)
- METR의 결론: 지금은 아마 더 빨라졌겠지만, 이 데이터는 그 크기를 보여주는 "매우 약한 증거" [출처](https://metr.org/blog/2026-02-24-uplift-update/)

## 5. AI가 혼자 해낼 수 있는 일의 길이 (METR 시간지평)

- 정의: 사람이 X분 걸리는 과제를 AI가 50% 확률로 성공하면 'X분 시간지평' [출처](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- 2019~2025년 동안 **약 7개월마다 2배**로 늘었음(2025.3.19 발표). Claude 3.7 Sonnet은 약 1시간 [출처](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- 개정판 TH1.1(2026.1.29): GPT-4(2023) 약 3.5분, GPT-5 214분(약 3.6시간), Claude Opus 4.5 320분(약 5.3시간) [출처](https://metr.org/blog/2026-01-29-time-horizon-1-1/)
- 2배가 되는 데 걸린 시간: 2023년 이후 약 131일(약 4.3개월), 2024년 이후 약 89일 [출처](https://metr.org/blog/2026-01-29-time-horizon-1-1/)
- 외삽: 추세가 이어지면 2020년대 말에는 '한 달짜리 프로젝트'를 AI가 자율로 수행할 수 있음 [출처](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- 최신 측정: Claude Mythos Preview(초기 버전, 2026.3 평가)는 50% 시간지평 **최소 16시간**(95% CI 8.5~55시간). METR은 "지금 과제 세트로 잴 수 있는 상한"이라고 밝힘 [출처](https://the-decoder.com/metr-says-it-can-barely-measure-claude-mythos-palo-alto-networks-warns-of-autonomous-ai-attackers/)
- METR 시간지평 페이지는 2026.9.8부터 "더 이상 적극적으로 업데이트하지 않음" 상태 [출처](https://metr.org/time-horizons/)

## 6. "회사 코드의 몇 %를 AI가 쓰나" (회사가 스스로 밝힌 수치)

- Google: 신규 코드의 25% 이상이 AI 생성(2024.10.29 3분기 실적 발표) [출처](https://fortune.com/2024/10/30/googles-code-ai-sundar-pichai)
- Google: 2025년 가을 50%, 2026.4.22(Cloud Next) **75%**. "AI가 생성하고 엔지니어가 승인한" 신규 코드 기준 [출처](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai/)
- Microsoft Nadella: 저장소 코드의 "20%, 30%"를 소프트웨어가 작성(2025.4.29 LlamaCon) [출처](https://www.cnbc.com/2025/04/29/satya-nadella-says-as-much-as-30percent-of-microsoft-code-is-written-by-ai.html)
- Meta Zuckerberg: 1년쯤 뒤엔 "개발의 절반 정도를 사람 대신 AI가" 할 것이라고 예측(2025.4.29) [출처](https://www.cnbc.com/2025/04/29/satya-nadella-says-as-much-as-30percent-of-microsoft-code-is-written-by-ai.html)
- Amodei: "3~6개월 안에 AI가 코드의 90%를 쓰고, 12개월 후엔 사실상 전부"(2025.3.10, CFR) [출처](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic)
- 주의: 기준이 다름. Google은 "AI가 생성하고 엔지니어가 승인한 신규 코드", Microsoft는 "저장소 코드 중 소프트웨어가 쓴 몫". 외부 검증 수단 없음 [출처](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai/) [출처2](https://www.cnbc.com/2025/04/29/satya-nadella-says-as-much-as-30percent-of-microsoft-code-is-written-by-ai.html)
- GitHub Octoverse 2026(2026.10.28): 2026.9 한 달 PR의 40% 이상(1.1억 건, 3월의 약 6배)이 에이전트 초안으로 시작 [출처](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/)
- 에이전트 PR의 2주 내 병합률은 83%(2026.2)→90%(2026.9), 에이전트 없는 PR은 약 86% 유지 [출처](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/)

## 7. 개발자 설문: 쓰긴 쓰는데, 믿지는 않는다

- Stack Overflow 2025: 84%가 AI를 쓰거나 쓸 계획(2024년 76%). 매일 쓰는 비율은 전체 47.1%, 전문 개발자 50.6% [출처](https://survey.stackoverflow.co/2025/ai)
- AI 정확성에 대한 신뢰: 매우 신뢰 3.1%, 다소 신뢰 29.6%, 불신 45.7%(다소 26.1% + 매우 19.6%) [출처](https://survey.stackoverflow.co/2025/ai)
- AI에 대한 호감도는 약 60%(22.9%+36.8%)로 하락(2024년 72%, 2023년 77%) [출처](https://survey.stackoverflow.co/2025/ai) [출처2](https://survey.stackoverflow.co/2024/ai)
- 가장 큰 불만(66%)은 "거의 맞는데 살짝 틀린 AI 답" [출처](https://survey.stackoverflow.co/2025/ai)
- Stack Overflow 2026(2026.10.6, 3만 명 이상, 169개국): AI를 쓰지 않는 사람은 17.2% [출처](https://stackoverflow.co/company/press/archive/stack-overflow-annual-developer-survey-ai-trust-conditional)
- AI 사용자 중 코딩 에이전트 66%, 챗봇 63%. 코딩 도구 사용자의 73%는 매일 씀 [출처](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)
- 가장 많이 쓰는 에이전트: **Claude Code 66%, GitHub Copilot 59%** [출처](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)
- 중요한 결정까지 AI를 믿는 비율은 **6.6%**. 78.7%는 AI 답의 출처 표시가 중요하다고 봄 [출처](https://stackoverflow.co/company/press/archive/stack-overflow-annual-developer-survey-ai-trust-conditional)
- 79%는 AI 역량을 키우고 싶어 하고, 52%는 새 코딩 기술을 배우는 중 [출처](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)
- 많이 쓰는 언어: JavaScript 62%, SQL·HTML/CSS·Python 각 58% [출처](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)

## 8. 인용 모음 (짧은 버전)

- Karpathy "Software 2.0"(Medium, 2017.11.11): 신경망 가중치가 새로운 형태의 '코드'라는 주장 [출처](https://karpathy.medium.com/software-2-0-a64152b37c35)
- 1.0은 사람이 쓴 코드, 2.0은 데이터로 학습한 가중치, 3.0은 자연어 프롬프트로 LLM을 프로그래밍(2025.6.17 YC AI Startup School 강연) [출처](https://www.latent.space/p/s3)
- 3.0의 요지: 프롬프트가 LLM을 프로그래밍하는 '프로그램'이고, 그 프로그램은 영어로 쓰인다 [출처](https://www.ycombinator.com/library/MW-andrej-karpathy-software-is-changing-again)
- 바이브 코딩(2025.2.2): "fully give in to the vibes… forget that the code even exists" [출처](https://en.wikipedia.org/wiki/Vibe_coding)
- 'vibe coding'은 Collins 사전의 2025년 올해의 단어(2025.11.6 발표) [출처](https://en.wikipedia.org/wiki/Vibe_coding)
- YC 2025 겨울 배치 스타트업의 25%는 코드베이스의 95%가 AI 생성(2025.3 YC 발표) [출처](https://en.wikipedia.org/wiki/Vibe_coding)
- 1년 뒤(2026.2.4) Karpathy가 'agentic engineering'을 제안: 에이전트의 힘을 쓰되 "소프트웨어 품질은 타협 없이" (2차 인용) [출처](https://gu-log.vercel.app/en/posts/en-clawd-picks-20260206-karpathy-agentic-engineering) [원문](https://x.com/karpathy/status/2019137879310836075)
- Jensen Huang(2024.2, 두바이 World Government Summit): "...the programming language is human. Everybody in the world is now a programmer." [출처](https://80.lv/articles/nvidia-s-ceo-thinks-that-our-kids-shouldn-t-learn-how-to-code-as-ai-can-do-it-for-them)
- Jensen Huang(2025.6.9, 런던 테크위크): "새 프로그래밍 언어가 생겼다. 이름은 'human'" [출처](https://www.nbcsandiego.com/news/business/money-report/the-way-you-program-an-ai-is-like-the-way-you-program-a-person-says-nvidias-huang/3843284/?amp=1)
- Amodei(2025.5.28, Axios 인터뷰): 1~5년 안에 신입 화이트칼라 일자리의 절반이 사라지고 실업률이 10~20%가 될 수 있다고 경고 [출처](https://www.axios.com/2025/05/28/ai-jobs-white-collar-unemployment-anthropic) [출처2](https://fortune.com/2025/05/28/anthropic-ceo-warning-ai-job-loss/)
- Amodei: "이 기술을 만드는 우리에게는 다가올 일을 정직하게 말할 의무가 있다" [출처](https://fortune.com/2025/05/28/anthropic-ceo-warning-ai-job-loss/)
- Nadella(2025.1.26): "Jevons paradox strikes again! AI가 효율적이고 쉬워질수록 사용량이 치솟는다" [출처](https://arxiv.org/html/2503.05816v1)

## 9. 반론과 균형 ("그래도 개발자는 더 필요하다"는 쪽)

- 제번스 역설: 무언가를 만드는 비용이 낮아지면 수요가 오히려 늘어남. 소프트웨어도 마찬가지라는 주장 [출처](https://addyosmani.com/blog/the-efficiency-paradox/)
- Addy Osmani(2025.12.29): "소프트웨어를 쓰기 쉽게 만들 때마다 우리는 결국 기하급수적으로 더 많이 쓰게 됐다" [출처](https://addyosmani.com/blog/the-efficiency-paradox/)
- 병목이 "만들 수 있나?"에서 **"만들 가치가 있나?"**로 옮겨감 [출처](https://addyosmani.com/blog/the-efficiency-paradox/)
- Aaron Levie(Box CEO, O'Reilly 대담 2026.4.7 게재): "Jevons paradox happening in real time". 에이전트로 엔지니어 생산성 2~10배(오라일리 요약) [출처](https://www.oreilly.com/radar/the-world-needs-more-software-engineers/)
- 대담 요지(직접 인용 아님): SW 수요가 경제 전체로 퍼지고, 엔지니어가 마케팅·법무·회계 업무 자동화로 진출 [출처](https://www.oreilly.com/radar/the-world-needs-more-software-engineers/)
- Indeed(2026.7.8): 미국 SW 개발 공고는 2025.2.24(Claude Code 출시일 기준) 이후 약 15% 증가, 같은 기간 전체 공고는 7% 감소 [출처](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/)
- 그래도 팬데믹 전보다 약 27.5% 낮음. 2025.5~2026.5 증가분의 71%는 시니어, 37%는 직함에 AI가 들어간 자리 [출처](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/)
- BLS: SW 개발자는 171.78만 명(2025), 2025~35년 +10%(+17.47만). 중위 연봉 $135,980(2025.5) [출처](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm)
- 대조: '컴퓨터 프로그래머'는 11.08만 명(2025), 2025~35년 -7% 전망. 이유는 AI 등으로 "반복적인 프로그래밍 작업 자동화" [출처](https://www.bls.gov/ooh/computer-and-information-technology/computer-programmers.htm)
- 새 직무 FDE(현장 배치 엔지니어): 2023년 대비 공고가 4,600% 이상 증가(Lightcast 데이터, Fortune 2026.9.3) [출처](https://fortune.com/2026/09/03/forward-deployed-engineers-fast-growing-six-figure-silicon-valley-job-integrate-ai-with-customers-tech-careers-palantir/)
- FDE는 고객 현장에 가서 AI를 실제 업무에 연결하는 사람. 공고상 중위 연봉 $188k 이상(일반 SWE 약 $145k) [출처](https://fortune.com/2026/09/03/forward-deployed-engineers-fast-growing-six-figure-silicon-valley-job-integrate-ai-with-customers-tech-careers-palantir/)
- McKinsey 북미 회장 Eric Kutcher(CNBC): "가장 큰 대체가 일어날 거라 생각한 곳에서 오히려 훨씬 큰 성장이 보인다" [출처](https://www.cnbc.com/2026/10/11/ai-software-developer-jobs.html)
- Indeed Hiring Lab 이코노미스트 Sneha Puri: "오늘의 신입이 내일의 시니어 전문가가 된다" [출처](https://www.cnbc.com/2026/10/11/ai-software-developer-jobs.html)

## 10. 역사에서 찾은 비유 (숫자 포함)

**ATM과 은행 창구직원 (James Bessen)**
- 미국 ATM은 1990년 약 10만 대에서 2015년 약 40만 대로 늘었음 [출처](https://conversableeconomist.com/2015/03/03/atms-and-a-rising-number-of-bank-tellers/)
- 지점 하나에 필요한 창구직원이 20명에서 13명으로 줄었음(1988~2004, 도시 평균) [출처](https://www.imf.org/external/pubs/ft/fandd/2015/03/bessen.htm)
- 지점 운영비가 싸지자 도시 지점 수가 43% 늘었고, 결과적으로 창구직원 일자리는 줄지 않았음 [출처](https://www.imf.org/external/pubs/ft/fandd/2015/03/bessen.htm)
- 창구직원 수는 약 30만 명(1970)에서 약 60만 명(2010)으로 늘었음(사례연구 요약 수치, 원문 접속 차단) (미확인) [출처](https://stpp.fordschool.umich.edu/tap-case-study-library/automated-teller-machine-atm)
- 반전: 2025년 33.92만 명, 2025~35년 -13% 전망. 이번 원인은 모바일 뱅킹·지점 축소·키오스크 [출처](https://www.bls.gov/ooh/office-and-administrative-support/tellers.htm)

**스프레드시트와 회계**
- VisiCalc 이후 35년간 미국에서 부기·회계 사무원 약 40만 개 감소, 회계사 약 60만 개 증가(2차 인용, NPR 기사엔 수치 없음) (미확인) [출처](https://memex.naughtons.org/?p=25836)
- NPR Planet Money: "회계사는 더 가치 있는 사람이 됐다", "스프레드시트는 금융의 언어가 됐다" [출처](https://www.wuwm.com/economy-business/2015-02-27/how-the-electronic-spreadsheet-revolutionized-business)

**엘리베이터 운전원**
- 1945.9 뉴욕 엘리베이터 파업에 약 1만 5천 명이 피켓 라인에 섰고 도시가 멈춤. 연방 세수가 하루 800만 달러 줄었음 [출처](https://en.wikipedia.org/wiki/Elevator_Strikes)
- 보도에 따르면 뉴요커 약 150만 명이 피켓 라인을 넘지도, 계단을 오르지도 않았음 [출처](https://en.wikipedia.org/wiki/Elevator_Strikes)
- 1950년대 Otis의 자동 엘리베이터가 퍼지면서 운전원은 사실상 사라진 직업이 됨 [출처](https://en.wikipedia.org/wiki/Elevator_Strikes) [출처2](https://en.wikipedia.org/wiki/Elevator_operator)
- 그래도 2017년 뉴욕 50개 이상 건물(주로 맨해튼 아파트)이 운전원을 두고 있었음 [출처](https://en.wikipedia.org/wiki/Elevator_operator)

**그 밖의 사례 (Bessen)**
- 19세기 역직기는 천 1야드를 짜는 노동의 98%를 자동화했지만, 공장 직조공 일자리는 오히려 늘었음 [출처](https://www.imf.org/external/pubs/ft/fandd/2015/03/bessen.htm)
- 전자출판이 나오며 식자공은 줄고 그래픽 디자이너는 늘었음. 회사 자동 전화 시스템 이후 교환원은 줄고 접수원은 늘었음 [출처](https://www.imf.org/external/pubs/ft/fandd/2015/03/bessen.htm)

## 11. 한국 데이터

- 한국은행(2023.11.16): AI 노출 상위 20% 일자리 약 **341만 개(전체의 12%)**. 상위 25%로 넓히면 398만 개(14%) [출처](https://www.segye.com/newsView/20231116521119)
- 고노출 직업은 의사·회계사·자산운용가·변호사, 저노출 직업은 기자·성직자·대학교수·가수 [출처](https://www.segye.com/newsView/20231116521119)
- 로봇 때와 달리 이번에는 "고학력·고소득일수록 AI에 더 많이 노출"됨 [출처](https://www.segye.com/newsView/20231116521119)
- 한국은행(2025.10, 국민연금 가입자 자료): 2022.7~2025.7 청년 일자리 21.1만 개 감소, 감소분의 98.6%(20.8만)가 AI 노출 상위 50% 업종 [출처](https://www.nocutnews.co.kr/news/6582845)
- 같은 기간 50대 일자리는 20.9만 개 증가. 한은은 이를 '연공편향 기술변화'로 해석(경력자는 유리, 신입은 불리) [출처](https://www.nocutnews.co.kr/news/6582845)
- 한국은행 BOK 이슈노트(2026.8.18) "청년고용 위축, AI 탓인가?": 2022.6~2026.6 청년 취업자 28.5만 명 감소, 감소분의 94%(26.8만)가 고노출 업종 [출처](https://etoday.co.kr/news/view/2615429)
- 업종별 청년고용 변화: 정보서비스 -31.4%, 출판 -27.4%, **컴퓨터 프로그래밍·SI -16.6%** [출처](https://etoday.co.kr/news/view/2615429)
- 신규채용 중 청년 비중은 36.9%(2014~19)에서 29.3%(2024~26)로 7.6%p 하락. 2022.6~2026.6 50대 취업자는 23만 명 증가 [출처](https://etoday.co.kr/news/view/2615429)
- 한국고용정보원 「고용이슈」 2026 여름호(2026.8.31): 2025년 고용보험 가입자 1,527.5만 명 중 19.1%(291.6만)가 AI 고노출 [출처](https://www.heraldk.com/article/2026083018083457759)
- 30대의 53.1%가 중·고노출 직종에서 일함. 노출도 1위 변호사, 2위 법률사무원, 3위 변리사 [출처](https://www.heraldk.com/article/2026083018083457759)
- 가입자 증감을 분해하면 청년 인구 감소·경제활동 참가율 하락 같은 공급 요인의 영향이 더 컸음. 노출 점수가 높다고 대체 가능성이 높은 건 아님 [출처](https://www.heraldk.com/article/2026083018083457759)
- 30세 미만 고용지수(2022=100): 2025년 고노출군 86.6 vs 저노출군 92.5. 고노출군 감소는 ChatGPT 이전부터 시작 [출처](https://www.youthdaily.co.kr/news/article.html?no=226016)
- 같은 호 사업체 조사(2,297곳): AI 도입률 28.6%, 도입 기업의 75.6%가 생성형 AI 활용 [출처](https://www.youthdaily.co.kr/news/article.html?no=226016)
- 국회예산정책처 「생성형 AI의 노동시장 영향」: "생성형 AI가 노동수요를 감소시켰다는 뚜렷한 증거는 확인되지 않았다" (2026.9 보도) [출처](https://www.nocutnews.co.kr/news/6582845)
- 같은 기사: 코로나 때 비대면 특수 산업의 둔화 시점이 ChatGPT 확산 시기와 겹쳤다는 해석도 있음 [출처](https://www.nocutnews.co.kr/news/6582845)
- KDI 「AI의 거시경제 영향 분석」(2026.7.22): 10년 뒤 일자리가 연간 약 25.6만 개(2025년 취업자의 2.1%) 줄 것으로 추산 [출처](https://v.daum.net/v/20260722111813863)
- 같은 KDI 보고서: AI 도입 기업은 상용근로자 1인당 매출이 약 20% 증가(추정), 10년간 총요소생산성 +1.5~3.5% 전망 [출처](https://v.daum.net/v/20260722111813863)
- 한국노동연구원(2025.12): 2024년 SW 개발자 구인 인원 전년 대비 9천 명 감소. 3년 미만 신입은 9천 명 줄고 3년 이상 경력자는 4.2만 명 늘었음 [출처](https://v.daum.net/v/20260127054103877)
- 채용 플랫폼 캐치: IT·통신 대기업·중견기업 신입 공고가 2026.3에 전년 같은 시기보다 **73% 감소** [출처](https://v.daum.net/v/PPvRLmmjh7)
- 신규채용(2022 → 2024, 각 사 ESG 보고서): 네이버 599→258명, 카카오 870→314명, 엔씨 646→311명, 넷마블 224→46명 [출처](https://v.daum.net/v/PPvRLmmjh7)
- 원티드 공고 72,793건(2025.1~2026.4) 분석: 뚜렷하게 줄어든 6개 직군 중 5개가 개발자. 'AI 네이티브' 공고 비중은 8배 [출처](https://v.daum.net/v/PPvRLmmjh7)
- 컴공과 취업률(2023 → 2025, 진학·입대자 제외 기준): 서울대 83.8→72.6%, 한양대 81.4→70.3%, KAIST 77.9→69.8% [출처](https://v.daum.net/v/PPvRLmmjh7)
- 반대 신호: 한국은 Claude.ai 전체 사용량 선두 5개국(미국·인도·일본·영국·한국, 2026.1)이고, 1인당 AI 특허는 세계 1위(AI Index 2026) [출처](https://www.anthropic.com/research/anthropic-economic-index-january-2026-report) [출처2](https://hai.stanford.edu/ai-index/2026-ai-index-report)

## 12. 직업계고(특성화고·마이스터고)와 대회

- 2026 직업계고 졸업자 취업통계(2026.11.5, 교육부·KEDI): 573개교 졸업 63,038명, 취업 16,209명, 진학 31,017명(49.2%) [출처](https://hangyo.com/news/article.html?no=109963)
- 취업률 55.8%(+0.6%p): **마이스터고 71.8%**(전년 73.1%), 특성화고 53.6%(전년 52.4%), 일반고 직업반 37.8% [출처](https://hangyo.com/news/article.html?no=109963)
- 300인 이상 기업 취업 비중 38.4%로 5년 연속 상승. 유지취업률(18개월, 2024 졸업자)은 62.2% [출처](https://hangyo.com/news/article.html?no=109963)
- 주의: 취업률은 진학자·입대자를 뺀 기준이고, 전체 졸업자 대비 취업자 비율은 25.7% [출처](https://hangyo.com/news/article.html?no=109963)
- 제48회 국제기능올림픽(상하이, 2026.9.22~27, 65개국): 한국 종합 2위(정부 자체 점수 253점; 금4·은14·동6·우수상16), 1위 중국 [출처](https://www.news1.kr/economy/employment-labor/6303555)
- ICT 분야 메달 6개(금1·은4·동1): 웹기술, IT 네트워크, 클라우드, 모바일앱, SW 테스팅, 정보통신망 [출처](https://www.news1.kr/economy/employment-labor/6303555)
- 웹기술 손현빈(삼성전자) 금메달로 이 직종 5회 연속 금(2017 아부다비부터). 신설 'SW 테스팅'은 이주원 은메달 [출처](https://www.news1.kr/economy/employment-labor/6303555)
- KOI 2026(제43회): 1차 접수 4.13~4.29, 1차 5.10(온라인), 2차 7.18. 1차는 사고력 20~25문항+실기 3문항(C11·C++20·PyPy3·Java 17) [출처](https://assets.koi.or.kr/koi/2026/koi2026_announcement.pdf)
- KOI 고등부: **특성화고 재학생도 '일반고부문' 시상 대상**(영재학교·과학고 제외 부문) [출처](https://assets.koi.or.kr/koi/2026/koi2026_announcement.pdf)
- 제38회 IOI 2026 타슈켄트(8.9~16, 92개국 375명): 한국 대표 4명 전원 메달(금2·은1·동1) [출처](https://m.go.seoul.co.kr/news/peoples/2026/08/20/20260820023004)
- GitHub Student Developer Pack: 인증된 학생에게 GitHub Pro·Codespaces(Pro급) 무료, GitHub Copilot Student 제공 [출처](https://education.github.com/pack)
- 같은 팩의 Microsoft Azure는 18세 이상용과 13~17세용이 따로 있음(13~17세는 App Service 등 일부) [출처](https://education.github.com/pack)

## 13. 앞으로 SW 엔지니어에게 필요한 역량 (근거와 함께)

- **문제 정의**: 병목이 "만들 수 있나"에서 "만들 가치가 있나"로 이동. WEF 핵심 기술 1위는 분석적 사고(69%) [출처](https://addyosmani.com/blog/the-efficiency-paradox/) [출처2](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- **시스템 설계**: 구현은 AI가 맡고 사람은 품질을 책임짐(agentic engineering). 반복 코딩은 자동화되는 중 [출처](https://gu-log.vercel.app/en/posts/en-clawd-picks-20260206-karpathy-agentic-engineering) [출처2](https://www.bls.gov/ooh/computer-and-information-technology/computer-programmers.htm)
- **검증·테스트**: 개발자의 최대 불만(66%)이 "거의 맞는 답". 2026 신설 기능올림픽 직종도 SW 테스팅 [출처](https://survey.stackoverflow.co/2025/ai) [출처2](https://www.news1.kr/economy/employment-labor/6303555)
- **보안**: AI가 같이 쓴 PR은 이슈 약 1.7배, 보안 이슈는 최대 2.74배(CodeRabbit, 2025.12.17, PR 470개). WEF 상승 기술 2위가 사이버보안 [출처](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report) [출처2](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)
- **보안 사례**: Lovable로 만든 웹앱 1,645개 중 170개에서 개인정보가 노출될 수 있었음(2025.5) [출처](https://en.wikipedia.org/wiki/Vibe_coding)
- **도메인 지식과 소통**: FDE는 고객 현장의 문제를 이해하는 사람. 암묵지가 필요한 직업은 경력자 고용이 늘었음 [출처](https://fortune.com/2026/09/03/forward-deployed-engineers-fast-growing-six-figure-silicon-valley-job-integrate-ai-with-customers-tech-careers-palantir/) [출처2](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- **AI 도구 활용**: 미국 SW 공고 증가분의 37%가 AI 직함. 개발자 중 AI를 쓰지 않는 사람은 17.2%뿐 [출처](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/) [출처2](https://stackoverflow.co/company/press/archive/stack-overflow-annual-developer-survey-ai-trust-conditional)
- **기초 체력**: '감독의 역설' 때문에 일부 엔지니어는 일부러 AI 없이 연습함 [출처](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)
- **배우는 능력**: 핵심 기술의 39%가 5년 안에 바뀜. 호기심·평생학습은 상승 기술 6위 [출처](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)

## 14. 16~18세에게 주는 구체적 조언 (강의 마무리용)

- **"AI 없이 한 번, AI와 한 번"**: 같은 과제를 두 번 풀고 시간을 재 보기. 느낌과 측정은 다름(METR) [출처](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- **포트폴리오는 결과보다 과정**: README에 문제 정의·설계·테스트·AI 사용 기록 남기기. 시장은 시니어급 판단력을 원함 [출처](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/)
- **실제 사용자가 있는 프로젝트**: 급식·시간표·동아리 출석 앱처럼 교내 문제 해결하기. FDE식 '현장 문제 풀기' 연습 [출처](https://fortune.com/2026/09/03/forward-deployed-engineers-fast-growing-six-figure-silicon-valley-job-integrate-ai-with-customers-tech-careers-palantir/)
- **테스트와 보안을 습관으로**: 모든 프로젝트에 테스트 코드 작성, 비밀키는 `.env`로 분리. AI 코드는 보안 이슈가 더 많음 [출처](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- **코드 리뷰어 되기**: PR의 40% 이상이 에이전트 초안으로 시작하는 시대에는 '읽고 판단하는 사람'의 가치가 커짐 [출처](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/)
- **대회**: KOI(봄 1차, 알고리즘, 특성화고는 일반고부문 시상), 지방·전국기능경기대회, 국제기능올림픽(웹기술 5연속 금) [출처](https://assets.koi.or.kr/koi/2026/koi2026_announcement.pdf) [출처2](https://www.news1.kr/economy/employment-labor/6303555)
- **무료 도구 챙기기**: GitHub Student Developer Pack(Pro·Codespaces·Copilot Student) [출처](https://education.github.com/pack)
- **"신입 같지 않은 신입"이 되기**: 신입 공고가 줄었으니 운영·협업·배포 경험을 미리 쌓아 두기 [출처](https://v.daum.net/v/20260127054103877)
- **코딩 + 다른 분야 하나**: 의료·금융·제조·게임 중 하나를 코딩과 묶기. 대체하기 어려운 조합을 만드는 것 [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf)
- **고졸 취업 경로도 살아 있음**: 특성화고 취업률 53.6%(상승), 마이스터고 71.8%. 300인 이상 기업 취업 비중은 5년 연속 상승 [출처](https://hangyo.com/news/article.html?no=109963)
- 해커톤과 오픈소스: 짧은 시간에 '문제 정의 → 데모'를 경험하고, 문서 수정이나 이슈 재현부터 기여해 보기 (일반 조언)

## 15. 숫자를 읽을 때 주의할 점 ('팩트체크' 코너용)

- Stanford 13%·16%는 기업 충격 통제 '회귀 추정', 15%·19%는 단순 '상대 격차', 11%는 '절대 감소', AI Index 20%는 SW 개발자 '2024년 대비' [출처](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf) [출처2](https://hai.stanford.edu/ai-index/2026-ai-index-report/economy)
- "코드의 X%를 AI가 작성"은 회사가 스스로 밝힌 수치이고, 회사마다 기준이 다르며 외부 검증이 안 됨 [출처](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai/) [출처2](https://www.cnbc.com/2025/04/29/satya-nadella-says-as-much-as-30percent-of-microsoft-code-is-written-by-ai.html)
- METR의 -19%는 2025년 초 도구 기준이고, 2026 후속 연구는 선택 편향 때문에 신뢰도가 낮음 [출처](https://metr.org/blog/2026-02-24-uplift-update/)
- 한국 청년 일자리 감소에는 청년 인구 감소, 코로나 비대면 특수 산업의 둔화 같은 요인도 섞여 있음 [출처](https://www.heraldk.com/article/2026083018083457759) [출처2](https://www.nocutnews.co.kr/news/6582845)
- 노출(exposure)은 대체(replacement)가 아님: 변호사는 한국 지표로 1위지만 ILO 기준으로는 '최소 노출' 직업 [출처](https://www.heraldk.com/article/2026083018083457759)

## 16. 확인하지 못한 항목 (미확인, 강의에 쓰기 전 재확인 필요)

- Google "신규 코드 30% 이상 AI 생성"(2025.4 실적 발표 발언) (미확인)
- Karpathy "The hottest new programming language is English" 트윗(2023.1 추정) (미확인)
- METR 시간지평: Claude Opus 4.6 값(자료마다 약 6시간~12시간으로 엇갈림) (미확인). Mythos Preview는 §5로 옮김(최소 16시간)
- 고용정보원: 30세 미만 고노출 취업자 119.7만(2022)→103.7만(2025) 인원 수치는 기사에 없음 (미확인). 지수(86.6)는 §11로 옮김
- Indeed: SW 공고 중 신입 비중 4.5% / LinkedIn 2026 'AI 엔지니어' 최고 성장 직무 (미확인)
- 넥슨이 코딩테스트 대신 'AI 활용 역량평가' 도입 / IBM이 2026년 신입 채용을 3배로 확대 (미확인)
- 2026·2027 전국기능경기대회 일정과 IT 직종 목록 (미확인)
- KOI 2026 2차 대회 접수 기간과 2차 출제 형식(1차 공고문에는 2차 날짜 7.18만 있음) (미확인)
- 참고: 검색 한도에 걸려 위 항목들은 원문을 대조하지 못함

---

## 슬라이드 아이디어

1. **WEF 워터폴 차트**: +170M → -92M → 순증 +78M. 막대가 떨어지고 올라가는 애니메이션
2. **직업 카드 뒤집기 퀴즈**: "그래픽 디자이너는 늘까, 줄까?"(감소 Top 15), "배송기사는?"(증가). 학생 투표 후 공개
3. **카나리아 라인 차트**: 2022.11=1.0 기준 연령대별 6개 선. 22~25세 선만 꺾이는 모습을 강조하고 카나리아 아이콘 넣기
4. **"느낌 vs 측정" 인터랙티브 데모**: 학생들이 AI 효과를 먼저 예측한 뒤 공개(예상 +24%, 체감 +20%, 실제 -19%)
5. **시간지평 로그 그래프 + 슬라이더**: GPT-4 3.5분, GPT-5 3.6시간, Opus 4.5 5.3시간, Mythos Preview 16시간 이상(측정 상한). "7개월마다 2배"를 적용해 졸업 연도(2027~2029)까지 외삽
6. **AI 코드 비율 게이지**: Google 25% → 50% → 75%, GitHub 에이전트 PR 17% → 40%
7. **신뢰 온도계**: 84% 사용 vs 3.1% 매우 신뢰 vs 6.6% 중요 결정 신뢰. "쓰지만 믿지 않는다"
8. **Software 1.0 / 2.0 / 3.0 다이어그램**: C 코드 → 신경망 가중치 → 영어 프롬프트. 바이브 코딩(2025)에서 에이전틱 엔지니어링(2026)으로
9. **역사 타임라인**: 역직기(19세기) → 엘리베이터 파업(1945) → ATM(1970~) → 스프레드시트(1979~) → 생성형 AI(2022~). 각 시기에 '줄어든 일'과 '생긴 일' 표시
10. **ATM 반전 그래프**: ATM이 늘어도 창구직원이 늘다가, 스마트폰 시대에 -13%. "다음 기술이 진짜 충격일 수도"
11. **한국 업종별 막대**: 정보서비스 -31.4%, 출판 -27.4%, 프로그래밍·SI -16.6%, 50대 +23만 명과 대비
12. **"프로그래머 -7% vs 개발자 +10%" 대비 카드**: '타이핑하는 사람'에서 '설계·검증하는 사람'으로
13. **FDE 로켓 그래프와 직무 소개 카드**: 공고 +4,600%(2023 대비), 연봉 $188k
14. **역량 레이더 차트(자가진단 인터랙티브)**: 문제 정의·설계·검증·보안·도메인·소통·AI 활용 7축. 학생이 직접 체크
15. **성일정보고 진로 플로우차트**: 동아리 → 기능경기대회 → 국가대표 → 국제기능올림픽 / KOI → IOI / 취업(마이스터고 71.8%) / 진학
16. **팩트체크 게임**: "13%·15%·16%·19%·11%·20%가 왜 다를까?" 지표(회귀 추정/상대 격차/절대 감소/2024년 대비) 짝 맞추기
17. **바이브 코딩 vs 에이전틱 엔지니어링 비교표**: "일단 돌아가면 OK" vs "AI가 구현하고 사람이 품질 책임". 학생 코드 리뷰 실습으로 연결

---

## 검증 기록

- 검증일: 2026-11-09 · 방식: 인용 링크의 글귀를 믿지 않고 원문(PDF·공식 블로그·보고서)을 직접 열어 대조함
- **수정 (사실 오류)**
  - SW 개발자 22~25세 "2022년 말 정점 대비 약 20% 감소" → AI Index 2026 원문은 "**2024년 대비** 약 20%" (§0, §2, §15)
  - "AI 노출 분야 22~25세 16% 감소(AI Index 인용)" 삭제: AI Index 원문에 없음. 16%는 Stanford 2025.11판의 회귀 추정치
  - Stanford 13%·16%와 19%를 같은 '상대 격차'로 묶은 것 → 13%·16%는 회귀 추정, 같은 단순 지표로는 2025.7에 15%였음 (§2, §15)
  - 한은 2026.8 "같은 기간 50대 23만 명 증가": 기간을 2014~19/2024~26으로 잘못 연결 → 2022.6~2026.6으로 수정
  - 고용정보원 "도입 기업 75.6%가 직무 재구성 목적" → 실제로는 "도입 기업의 75.6%가 생성형 AI 활용". 수정 후 §11로 옮김
  - 고용정보원 "청년 119.7만→103.7만 명" 수치는 원문 기사에 없음 → 고용지수(고노출 86.6 vs 저노출 92.5)로 교체
  - KOI 2026 "2차 접수 6.26~7.12, 2차는 프로그래밍만" → 공고문에는 2차 날짜(7.18)만 있음. 2차 접수 기간과 출제 형식은 §16 (미확인)으로 옮김
  - GitHub Pack "Copilot … 13~17세 혜택" → 13~17세용은 Copilot이 아니라 Azure 혜택임
  - CodeRabbit "보안 취약점 2.74배" → "보안 이슈 **최대** 2.74배(전체 이슈 약 1.7배)". 출처를 위키에서 CodeRabbit 원문으로 교체
  - Levie "수요는 줄지 않는다…" 직접 인용 → 오라일리의 요약이라 직접 인용 표시를 뺌
  - §15 "팬데믹 때 과잉채용의 정상화": 인용한 두 기사 어디에도 없음 → 노컷 기사에 나온 "코로나 비대면 특수 산업의 둔화"로 교체
  - "AI 생성 정의가 회사마다 다름" 출처로 Semafor를 썼지만 Semafor엔 그런 내용이 없음 → Google·Microsoft 원문 기준 차이를 직접 제시
- **출처 교체 (더 권위 있는 원문으로)**
  - Google 75%: Semafor → Google 공식 블로그(2026.4.22 Cloud Next, "AI가 생성하고 엔지니어가 승인한")
  - GitHub Octoverse: Visual Studio Magazine(403 차단) → GitHub 공식 블로그(2026.10.28). §0·§6·§14 모두 교체
  - Nadella·Zuckerberg: TechRepublic(403 차단) → CNBC 2025.4.29
  - Stanford 19%: Stanford 2026.8.12 발표 페이지 추가. 참고로 `..._Nov25.pdf` 주소의 파일은 지금 2026.8판으로 바뀌어 있음
  - SO 호감도 2024·2023 수치: TechRepublic → SO 2024 설문 원문
- **§16에서 확인 완료로 옮김**: 국회예산정책처 "뚜렷한 증거 없음"(노컷 2026.9.25 보도), 고용정보원 AI 도입률 28.6%
- **보강 (확인 후 추가)**: Mythos Preview 시간지평(최소 16시간, the-decoder 보도 기준), 22~25세 전체 고용 -1.9%, KOI '특성화고는 일반고부문 시상', 마이스터고 취업률 하락(73.1→71.8%), 기능올림픽 '정부 자체 점수 기준' 2위
- **(미확인)으로 표시**: ATM 창구직원 30만→60만(원문 접속 차단), VisiCalc 이후 40만/60만(NPR 원문에 수치 없음)
- **원문 대조로 확인됨**: WEF 2025 수치(1.7억/9,200만/7,800만, 39%, 59/11, 기술 순위·비율, 한국 71%·92%), METR 3건(2025.3, 2025.7, 2026.2) 및 TH1.1, SO 2025·2026, Anthropic Economic Index 5건과 내부 조사, BLS 3개 직업, Indeed, Fortune FDE, 한은 3건, KDI, 노동연구원, 중앙(캐치·원티드), 직업계고 취업통계, 기능올림픽, IOI, Amodei CFR·Fortune, Huang 2건, Nadella Jevons, Osmani, Bessen(IMF), 엘리베이터 위키
- **2차 출처만 확인**: Karpathy 'agentic engineering'(2026.2.4)은 블로그 인용으로만 확인했고 X 원문은 열리지 않음(402). Software 3.0 정의는 강연 날짜만 확인했고 트랜스크립트는 유료라 보지 못함. Amodei "1~5년"은 Axios 원문이 막혀(403) Fortune("5년 안에")으로 대조함
- **현재성 점검**: 직함(Pichai·Nadella·Huang·Amodei·Levie·Kutcher)은 인용 시점 기준이고 2026.11 기준 변동 정보는 찾지 못함. METR 시간지평 페이지는 2026.9.8부터 업데이트 중단이라 더 최신 모델 값은 없음
- 한계: 작업 중 웹 검색 한도가 소진돼 §16의 나머지 항목(Indeed 4.5%, LinkedIn, 넥슨, IBM, Google 30%, Opus 4.6 값)은 추가로 대조하지 못함
