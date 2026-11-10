# 02. AI의 역사: 전환점과 사람들 (1943 → 2026.11)

> 작성 기준일 2026-11-09 · 「어쩌다 AI — 성일 정보고 편」 강의용 리서치 노트
> 표기 규칙: 모든 사실 bullet 끝에 [출처] · **(미확인)** = 이번 조사에서 1차 확인 못 함 · **(2차)** = 블로그/집계 사이트 등 2차 출처라 신뢰도 낮음 · **(계산)** = 출처 수치로 직접 계산한 값
> 2025년 중반 이후 항목은 웹 검색/원문으로 재확인했고, 공식 발표문(anthropic.com, Google 릴리스 노트, CNBC 등)을 우선 인용함.

---

## 0. 큰 그림: 80년을 7장면으로

- 1943 뉴런을 논리로 → 1956 "AI" 작명 → 1969~80 1차 겨울 → 1980년대 전문가 시스템 붐 → 1987~93 2차 겨울 [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)
- 2012 AlexNet 딥러닝 빅뱅 → 2016 알파고(서울) → 2017 Transformer → 2022.11.30 ChatGPT [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)
- 2025 추론 모델·오픈모델·에이전트 → 2026 GPT-6 / Claude 5 / Gemini 4, AI가 보안·수학 난제에 손대는 시대 [출처](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence)
- 반복 패턴: **과장된 예언 → 실망 → 자금 중단(겨울) → 조용한 연구 → 데이터·하드웨어가 따라오면 폭발** [출처](https://en.wikipedia.org/wiki/AI_winter)

---

## 1. 탄생기 (1943–1956)

### 1943 · McCulloch & Pitts: "뉴런은 논리 회로다"
- 신경생리학자 Warren McCulloch와 독학한 10대 Walter Pitts의 논문 「A Logical Calculus of the Ideas Immanent in Nervous Activity」 [출처](https://link.springer.com/article/10.1007/BF02478259)
- 뉴런을 켜짐/꺼짐(0/1) 논리 게이트로 모델링함. 오늘날 모든 인공신경망의 조상 아이디어 [출처](https://nautil.us/the-man-who-tried-to-redeem-the-world-with-logic-235253/)
- 일화: Pitts는 12살 때 도서관에 숨어 **3일 동안** 『수학 원리(Principia Mathematica)』 전권을 읽고, 오류를 찾아 러셀에게 편지를 씀 [출처](https://nautil.us/the-man-who-tried-to-redeem-the-world-with-logic-235253/)
- 러셀은 케임브리지 대학원생으로 오라고 초청했지만 Pitts는 고작 12살이라 갈 수 없었음 [출처](https://nautil.us/the-man-who-tried-to-redeem-the-world-with-logic-235253/)
- 15살에 가출해 시카고로 갔고, McCulloch는 이 10대를 자기 집(시카고 교외 Hinsdale)에 살게 하며 함께 연구함 [출처](https://nautil.us/the-man-who-tried-to-redeem-the-world-with-logic-235253/)

### 1950 · Turing: 「Computing Machinery and Intelligence」와 이미테이션 게임
- 첫 문장: "I propose to consider the question, 'Can machines think?'" (학술지 *Mind*, 1950) [출처](https://courses.cs.umbc.edu/471/papers/turing.pdf)
- 이미테이션 게임: 채팅으로 대화해서 상대가 사람인지 기계인지 맞히는 테스트, 즉 '튜링 테스트' [출처](https://courses.cs.umbc.edu/471/papers/turing.pdf)
- 예언: "약 50년 뒤" 저장용량 약 10⁹인 컴퓨터가 5분 대화 뒤 판정자의 정답률을 **70% 이하**로 떨어뜨릴 것 [출처](https://courses.cs.umbc.edu/471/papers/turing.pdf)
- 10⁹ 비트 ≈ 125MB로, 지금 스마트폰 사진 몇십 장 분량 (계산) [출처](https://courses.cs.umbc.edu/471/papers/turing.pdf)
- 75년 뒤 결과: 2025.3 UCSD 연구에서 페르소나를 준 GPT-4.5가 5분 대화 후 **73%** '사람'으로 판정됨. 실제 사람보다 높았음 [출처](https://arxiv.org/html/2503.23674)
- 같은 실험에서 1966년 ELIZA는 약 23%, GPT-4o는 약 21%였음 [출처](https://today.ucsd.edu/story/ai-can-seem-more-human-than-real-humans-in-a-classic-turing-test-study-finds)

### 1956 · 다트머스 워크숍: "인공지능(AI)"이라는 이름의 탄생
- 제안자 4인: John McCarthy, Marvin Minsky, Nathaniel Rochester(IBM), Claude Shannon(정보이론의 아버지) [출처](https://en.wikipedia.org/wiki/Dartmouth_workshop)
- 제안서 날짜는 1955-08-31. 워크숍은 1956년 약 6/18~8/17에 열린 것으로 추정됨(Solomonoff 노트 기준) [출처](https://en.wikipedia.org/wiki/Dartmouth_workshop)
- 제안서 문장: "학습이나 지능의 모든 측면은 원칙적으로 기계가 흉내 낼 수 있을 만큼 정밀하게 기술될 수 있다" [출처](http://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html)
- 자신감 넘치는 계획: "2개월, 10명" 연구로 "여름 한 철이면 상당한 진전이 가능하다"고 봄 [출처](http://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html)
- 예산: 록펠러 재단에 **$13,500**를 요청함. 스탠퍼드 전사본의 항목을 더하면 $13,000라 $500 차이가 남(전사 오류 가능, 원본 스캔 대조 미확인) [출처](http://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html)
- 실제 지원은 **$7,500**였음 [출처](https://www.philanthropyroundtable.org/almanac/artificial-intelligence/)
- "artificial intelligence"는 McCarthy가 1955년에 고른 이름. 사이버네틱스와 거리를 두려고 중립적인 단어를 택함 [출처](https://en.wikipedia.org/wiki/Dartmouth_workshop)
- 깨알 사실: 참석자 명단(Solomonoff 기록, 20명)에 영화 「뷰티풀 마인드」의 **John Nash**도 있음 [출처](https://en.wikipedia.org/wiki/Dartmouth_workshop)

---

## 2. 첫 번째 여름과 과장 (1957–1973)

### 1957–1960 · Rosenblatt의 퍼셉트론과 Mark I
- 1957년 코넬 항공연구소 보고서에서 출발해 IBM 704로 시뮬레이션함. 1958년 해군 기자회견 [출처](https://en.wikipedia.org/wiki/Perceptron)
- NYT 1958-07-08 기사 「New Navy Device Learns By Doing」 [출처](https://www.nytimes.com/1958/07/08/archives/new-navy-device-learns-by-doing-psychologist-shows-embryo-of.html)
- 기사 속 해군의 기대: "걷고, 말하고, 보고, 쓰고, 스스로 복제하고, 자기 존재를 의식할" 컴퓨터의 "배아(embryo)" [출처](https://www.nytimes.com/1958/07/08/archives/new-navy-device-learns-by-doing-psychologist-shows-embryo-of.html)
- 발명자 Frank Rosenblatt(1928-07-11생)는 기사 당시 **29세**의 코넬 항공연구소 연구 심리학자였음 (계산) [출처](https://en.wikipedia.org/wiki/Frank_Rosenblatt)
- Mark I 하드웨어: 20×20 = **400개 광센서**(눈), 512개 연합 유닛, 8개 출력 유닛 [출처](https://en.wikipedia.org/wiki/Perceptron)
- 가중치는 가변저항(포텐셔미터)에 저장했고, 학습하면 **전기 모터가 다이얼을 돌렸음**. 첫 공개 시연은 1960-06-23 [출처](https://en.wikipedia.org/wiki/Perceptron)
- 파라미터는 약 1,000개(Epoch 추정)로 GPT-3의 1억 7,500만분의 1 수준 [출처](https://epoch.ai/data/notable-ai-models)

### 1966 · ELIZA: 최초의 챗봇과 'ELIZA 효과'
- MIT의 Joseph Weizenbaum이 1964~66년에 개발함. DOCTOR 스크립트로 상담사를 흉내 냄 [출처](https://en.wikipedia.org/wiki/ELIZA)
- 원리: 키워드 패턴 매칭으로 사용자의 말을 질문으로 되돌려줌. 이해하는 것은 하나도 없음 [출처](https://en.wikipedia.org/wiki/ELIZA)
- 일화: 비서가 ELIZA와 "진짜 대화"를 하겠다며 Weizenbaum에게 방에서 나가 달라고 함 [출처](https://en.wikipedia.org/wiki/ELIZA)
- Weizenbaum의 경고: 아주 짧은 노출로도 평범한 사람에게 "강력한 망상적 사고"를 유발할 수 있다 [출처](https://en.wikipedia.org/wiki/ELIZA)
- 이후 『Computer Power and Human Reason』(1976)에서 인간의 판단을 컴퓨터에 맡기는 것에 반대함 [출처](https://en.wikipedia.org/wiki/ELIZA)
- 반전: 2023년 한 튜링 테스트 연구에서 ELIZA가 GPT-3.5를 이김(GPT-4나 사람은 못 이김) [출처](https://en.wikipedia.org/wiki/ELIZA)

### 1966–1972 · Shakey: 최초의 '생각하는 로봇'
- SRI(스탠퍼드 연구소)가 DARPA 자금으로 만든, 스스로 계획하고 움직이는 이동 로봇 [출처](https://en.wikipedia.org/wiki/Shakey_the_robot)
- 남긴 유산: **A* 탐색 알고리즘**(오늘날 게임·내비 길찾기), 허프 변환, 가시성 그래프 [출처](https://en.wikipedia.org/wiki/Shakey_the_robot)
- *Life* 지(1970)는 Shakey를 "최초의 전자 인간(first electronic person)"이라 부름 [출처](https://en.wikipedia.org/wiki/Shakey_the_robot)
- 같은 해 Minsky: "3~8년 안에 평균적인 인간 수준의 일반 지능을 가진 기계가 나온다" [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)

### 과장된 예언 모음 (하이프 곡선 슬라이드용)
- 1958 Simon & Newell: "10년 안에 컴퓨터가 체스 세계 챔피언이 된다". 실제로는 39년 뒤인 1997년 [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)
- 1965 Simon: "20년 안에 기계가 사람이 하는 모든 일을 할 수 있다" [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)
- 1967 Minsky: "한 세대 안에 AI 문제는 상당 부분 해결될 것" [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)

### 1969 · Minsky & Papert 『Perceptrons』와 XOR
- 단층 퍼셉트론은 **XOR(배타적 OR)**조차 배울 수 없다는 것을 수학적으로 증명함 [출처](https://en.wikipedia.org/wiki/Perceptron)
- 오해: 두 사람도 다층 퍼셉트론이면 XOR이 가능하다는 걸 알고 있었음. 그런데도 책은 신경망 연구비를 약 10년간 얼어붙게 함 [출처](https://en.wikipedia.org/wiki/Perceptron)
- Rosenblatt는 1971년 보트 사고로 사망해, 신경망이 부활하는 것을 보지 못함 [출처](https://en.wikipedia.org/wiki/Perceptron)

---

## 3. 두 번의 겨울 (1973–1993)

### 1966·1973·1974 · 1차 AI 겨울(약 1974–1980)
- 1966 ALPAC 보고서: 기계번역이 사람보다 비싸고 느리고 부정확하다고 판정함. 약 **$2,000만**을 쓴 뒤 지원 중단 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 1973 Lighthill 보고서(영국): AI가 "거창한 목표"를 하나도 이루지 못했다고 비판함 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 핵심 논리는 '조합 폭발'이었음. 장난감 문제에서만 되고 현실 문제에서는 멈춘다는 것 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 결과: 영국 AI 연구가 거의 해체됨(에든버러·에섹스·서식스만 생존). 1973년 BBC 공개토론에서 McCarthy와 맞붙음 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 미국: 1969 맨스필드 수정안 이후 DARPA는 "군사 목적" 연구만 지원함. 1974년 CMU 음성인식 연 **$300만** 계약 취소 [출처](https://en.wikipedia.org/wiki/AI_winter)

### 1980–1987 · 전문가 시스템 붐(2차 여름)
- XCON(R1): CMU의 John McDermott가 DEC 컴퓨터 주문 구성을 자동화한 최초의 상업용 전문가 시스템. 1980년 가동 [출처](https://en.wikipedia.org/wiki/Xcon)
- 규칙 수: 초기 약 2,500개 → 1989년 **10,129개**. 1986년까지 주문 8만 건 처리, 정확도 95~98% [출처](https://en.wikipedia.org/wiki/Xcon)
- 절감액은 출처마다 다름: "연 약 $2,500만"이라는 추정이 있음 [출처](https://en.wikipedia.org/wiki/Xcon)
- 다른 추정: "6년간 약 $4,000만" [출처](https://en.wikipedia.org/wiki/AI_winter)
- 1980년대 후반 AI 산업은 "10억 달러 규모"로 성장함 [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)
- 일본 제5세대 컴퓨터(FGCS): 통산성(MITI)·ICOT 주도로 1982년 시작한 10년 계획. 총 약 **570억 엔(약 $3.2억)** [출처](https://en.wikipedia.org/wiki/Fifth_Generation_Computer_Systems)
- 다른 출처는 1981년 **$8.5억**을 배정했다고 함. 출처마다 금액이 다름 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 미국은 DARPA 전략컴퓨팅(SCI, 1983)으로 맞대응함. 1985년까지 92개 과제에 **$1억** 지출 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 영국도 Alvey 프로젝트(£3.5억)로 AI 자금을 재개함 [출처](https://en.wikipedia.org/wiki/AI_winter)

### 1987–1993 · 2차 AI 겨울
- 1987년 Lisp 머신 시장 붕괴: 약 **5억 달러** 규모 산업이 범용 워크스테이션(Sun 등)에 밀려 1년 만에 대체됨 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 전문가 시스템의 한계: 유지보수 비용이 비싸고, 스스로 배우지 못하며, 예외 상황에서 엉뚱한 실수를 하는 '취약성' [출처](https://en.wikipedia.org/wiki/AI_winter)
- FGCS는 대화·번역 목표를 이루지 못하고 1992-06-01 "환호가 아닌 흐느낌으로" 종료됨 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 1987년 DARPA 새 책임자가 전문가 시스템을 "영리한 프로그래밍"일 뿐이라 평가하고 AI 예산을 대폭 삭감함 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 후유증: 2000년대 중반까지 연구자들이 'AI'라는 말 대신 머신러닝·분석 등으로 불렀음. "몽상가로 보일까 봐" (Markoff, 2005) [출처](https://en.wikipedia.org/wiki/AI_winter)

---

## 4. 겨울 속의 조용한 반격 (1986–2011)

### 1986 · 역전파(Backpropagation): Rumelhart, Hinton, Williams
- *Nature* 323호(1986-10-09) 「Learning representations by back-propagating errors」 [출처](https://www.nature.com/articles/323533a0)
- 다층 신경망이 틀린 만큼 거꾸로 신호를 보내 가중치를 고치는 방법. 1969년 XOR 벽을 넘는 열쇠였음 [출처](https://www.nature.com/articles/323533a0)
- 역전파로 학습한 MLP의 학습 연산량은 약 6.7×10⁸ FLOP으로, 지금 스마트폰이 1초도 안 걸리는 양 (Epoch 데이터) [출처](https://epoch.ai/data/notable-ai-models)

### 1989–1998 · LeCun의 LeNet: 수표를 읽은 신경망
- 1989년 Bell Labs: CNN에 역전파를 적용해 미국 우편번호 손글씨를 인식함(오류율 1%) [출처](https://en.wikipedia.org/wiki/LeNet)
- LeNet-5(1998)는 학습 파라미터 약 **6만 개**. MNIST 손글씨 데이터셋이 표준 벤치마크가 됨 [출처](https://en.wikipedia.org/wiki/LeNet)
- NCR이 1996년 6월부터 은행 수표 판독기에 배치함 [출처](https://en.wikipedia.org/wiki/LeNet)
- 2001년 무렵 하루 **2,000만 장**, 미국 전체 수표의 약 10%를 읽었음 [출처](https://en.wikipedia.org/wiki/LeNet)

### 1996–1997 · Deep Blue vs Kasparov
- 1996년 2월 1차전: Deep Blue가 1국을 이김(정규 시간제에서 현역 세계챔피언을 이긴 첫 사례). 최종은 Kasparov 4–2 승 [출처](https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer))
- 1996 Kasparov(TIME 기고): "탁자 건너편에서 새로운 종류의 지능을 느꼈다. 냄새를 맡을 수 있었다" [출처](https://content.time.com/time/subscriber/article/0,33009,984305,00.html)
- 1997년 5월 재대결: Deep Blue가 **3½–2½**로 승리. 초당 **2억 수**를 계산함 [출처](https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer))
- 하드웨어: PowerPC 30개 + 체스 전용 칩 480개 [출처](https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer))
- 일화: 1국 44수에서 **버그**가 나서 Deep Blue가 무작위 수를 둠 [출처](https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer))
- Kasparov는 그 수를 "초월적 지능"으로 오해하고 흔들렸고, IBM은 재대결 요구를 거절한 채 기계를 해체함 [출처](https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer))
- 1958년 "10년 안에 체스 챔피언" 예언은 **39년 늦게** 실현된 셈 (계산) [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)

### 2006 · Hinton의 Deep Belief Nets: '딥러닝' 재브랜딩
- Hinton·Osindero·Teh의 「A fast learning algorithm for deep belief nets」(*Neural Computation*, 2006) [출처](https://www.cs.toronto.edu/~hinton/absps/fastnc.pdf)
- 층을 하나씩 쌓아 미리 학습시키는 방법으로, "깊은" 신경망도 학습된다는 것을 보임 [출처](https://www.cs.toronto.edu/~hinton/absps/fastnc.pdf)
- 같은 해 *Science*에도 Hinton & Salakhutdinov 논문(2006-07-28)이 실림 [출처](https://www.science.org/doi/10.1126/science.1127647)

### 2009 · Fei-Fei Li의 ImageNet: "데이터가 답이다"
- Fei-Fei Li가 2006년 구상하고, 2009년 CVPR에서 **포스터 발표**로 데뷔함 [출처](https://en.wikipedia.org/wiki/ImageNet)
- 첫 공개 당시 이미지 320만 장, 5,247개 범주 [출처](https://ieeexplore.ieee.org/document/5206848)
- 아마존 Mechanical Turk로 **167개국 4만 9천 명**이 2008.7~2010.4 동안 후보 이미지 1.6억 장을 걸러 라벨링함 [출처](https://en.wikipedia.org/wiki/ImageNet)
- 최종 1,400만 장 이상, 2만 개 이상 범주(21,841 synset) [출처](https://en.wikipedia.org/wiki/ImageNet)
- 대회(ILSVRC, 2010~2017)는 1,000개 클래스, 학습용 이미지 128만 장으로 진행됨 [출처](https://en.wikipedia.org/wiki/ImageNet)

---

## 5. 딥러닝 빅뱅 (2012–2017)

### 2012 · AlexNet: 침실에서 시작된 혁명
- Alex Krizhevsky, Ilya Sutskever, Geoffrey Hinton(토론토대). 2012-09-30 ILSVRC에 'SuperVision' 팀으로 제출함 [출처](https://en.wikipedia.org/wiki/AlexNet)
- top-5 오류율 **15.3%**로, 2위의 **26.2%**를 10%p 넘게 앞섬 [출처](https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html)
- 게임용 GPU **GTX 580(3GB) 2장**으로 5~6일 학습함. 파라미터 약 6,000만, 뉴런 65만 [출처](https://en.wikipedia.org/wiki/AlexNet)
- 일화: Krizhevsky가 **부모님 집 자기 침실**에서 GPU 2장으로 학습시킴 [출처](https://en.wikipedia.org/wiki/AlexNet)
- 2025-03 컴퓨터역사박물관(CHM)이 2012년 원본 소스코드를 공개함 [출처](https://en.wikipedia.org/wiki/AlexNet)

### 2012.12 · DNNresearch 비밀 경매
- Hinton과 제자 2명의, 제품도 없는 3인 회사를 놓고 NIPS 학회 기간 레이크타호 Harrah's 호텔에서 경매가 열림 [출처](https://www.wired.com/story/secret-auction-race-ai-supremacy-google-microsoft-baidu/)
- 입찰자: Google, Baidu, Microsoft, 그리고 창업 2년 차 런던 스타트업 DeepMind [출처](https://www.wired.com/story/secret-auction-race-ai-supremacy-google-microsoft-baidu/)
- 당시 64세였던 Hinton은 토론토에서 버스·기차·택시를 갈아타고 타호까지 감 [출처](https://bioethics.com/archives/55249)
- 결과: **$4,400만**에서 Hinton이 경매를 멈추고 Google을 택함 [출처](https://fortune.com/2023/05/01/godfather-ai-geoffrey-hinton-quit-google-regrets-lifes-work-bad-actors/)
- 의미: 빅테크 'AI 인재 전쟁'의 출발점이 됨 [출처](https://www.wired.com/story/secret-auction-race-ai-supremacy-google-microsoft-baidu/)

### 2013 · word2vec: 단어를 숫자 벡터로
- Tomáš Mikolov 등(Google), 2013. 단어를 수백 차원 벡터로 바꾸는 방법 [출처](https://en.wikipedia.org/wiki/Word2vec)
- 유명한 예: **king − man + woman ≈ queen**. 의미를 벡터 덧셈·뺄셈으로 계산함 [출처](https://aclanthology.org/N13-1090/)
- 후속 논문이 2023년 NeurIPS Test of Time 상을 받음 [출처](https://en.wikipedia.org/wiki/Word2vec)

### 2014 · GAN: 술집에서 탄생한 아이디어
- Ian Goodfellow(당시 몬트리올대 박사과정). 논문은 2014-06-10 arXiv에 올라옴 [출처](https://arxiv.org/abs/1406.2661)
- 일화: 몬트리올 술집 **Les 3 Brasseurs**에서 친구들과 토론하다 "두 신경망을 서로 싸우게 하면?"이라는 아이디어를 떠올림 [출처](https://www.technologyreview.com/2018/02/21/145289/the-ganfather-the-man-whos-given-machines-the-gift-of-imagination/)
- 그날 밤 귀가해서 새벽까지 코딩했는데 **첫 시도에 작동함** [출처](https://www.technologyreview.com/2018/02/21/145289/the-ganfather-the-man-whos-given-machines-the-gift-of-imagination/)
- LeCun은 GAN을 "지난 20년간 딥러닝에서 가장 멋진 아이디어"라 평가함 [출처](https://www.technologyreview.com/2018/02/21/145289/the-ganfather-the-man-whos-given-machines-the-gift-of-imagination/)

### 2013–2015 · DeepMind의 Atari DQN
- 2013-12 arXiv: 화면 픽셀만 보고 아타리 게임을 배우는 강화학습 에이전트 [출처](https://arxiv.org/abs/1312.5602)
- 2015-02 *Nature*: **49개** 아타리 게임을 같은 알고리즘 하나로 학습해 전문 게임 테스터에 견줄 만한 수준에 도달함(모든 게임에서 사람을 넘은 것은 아님) [출처](https://www.nature.com/articles/nature14236)
- Google은 2014-01-26 DeepMind 인수를 확인함. 인수가는 약 $4억~6.5억으로 보도마다 다름 [출처](https://en.wikipedia.org/wiki/Google_DeepMind)
- DeepMind는 2010년 Demis Hassabis, Shane Legg, Mustafa Suleyman이 창업함 [출처](https://en.wikipedia.org/wiki/Google_DeepMind)

### 2016.3 · AlphaGo vs 이세돌 (서울 포시즌스 호텔)
- 2016년 3월 9~15일, 5번기에서 AlphaGo가 **4–1** 승리. 전 세계 **2억 명 이상**이 시청함 [출처](https://deepmind.google/research/breakthroughs/alphago/)
- 상금 $100만은 DeepMind가 UNICEF 등에 기부함. 이세돌은 대국료 등으로 $17만을 받음 [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)
- 하드웨어: CPU 1,920개, GPU 280개 [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)
- **2국 37수**: 사람이 둘 확률 **1만 분의 1**인 수 [출처](https://deepmind.google/research/breakthroughs/alphago/)
- 이세돌: "확률 계산하는 기계라 생각했는데, 이 수를 보고 생각을 바꿨다. AlphaGo는 창의적이다" [출처](https://deepmind.google/research/breakthroughs/alphago/)
- **4국 78수**: 이세돌의 '신의 한 수'. 구리 9단이 "divine move"라 부름 [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)
- 3국 뒤 이세돌: "AlphaGo의 능력을 오판했고 무력감을 느꼈다" [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)
- 4국 뒤 이세돌: "그 무엇과도 바꿀 수 없는 값진 1승" [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)
- 한국기원은 AlphaGo에 **명예 9단**을 수여함 [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)
- 한국 정부는 대국 직후(2016-03-17) **5년간 1조 원** AI 투자를 발표함 [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)
- 2019-11-19 이세돌 은퇴: "내가 1위가 되더라도 이길 수 없는 존재(AI)가 있다" [출처](https://amp.cnn.com/cnn/2019/11/27/tech/go-master-google-intl-hnk-scli)

### 2017 · AlphaGo Zero: 인간 기보 0장
- 2017-10-18 발표. 인간 기보 없이 무작위 수부터 **자기 자신과의 대국**만으로 학습함 [출처](https://deepmind.google/discover/blog/alphago-zero-starting-from-scratch/)
- **3일** 학습 만에 이세돌을 이긴 버전(AlphaGo Lee)에 **100–0**으로 이김 [출처](https://deepmind.google/discover/blog/alphago-zero-starting-from-scratch/)
- 40일 뒤에는 Master 버전도 넘어섬. 사용한 TPU는 4개뿐 [출처](https://deepmind.google/discover/blog/alphago-zero-starting-from-scratch/)

---

## 6. Transformer와 스케일링의 시대 (2017–2022)

### 2017.6 · 「Attention Is All You Need」: 오늘날 모든 LLM의 엔진
- 2017-06-12 arXiv 게재(NeurIPS 2017). Google 소속 저자 **8명**이 "동등 기여"로 저자 순서를 무작위로 정함 [출처](https://en.wikipedia.org/wiki/Attention_Is_All_You_Need)
- 제목은 비틀스 「All You Need Is Love」 패러디. 'Transformer'라는 이름은 Uszkoreit가 "어감이 좋아서" 붙임 [출처](https://en.wikipedia.org/wiki/Attention_Is_All_You_Need)
- 큰 모델도 GPU(P100) **8장으로 3.5일** 학습했음. 2026년 기준 인용 **15만 회 이상** [출처](https://en.wikipedia.org/wiki/Attention_Is_All_You_Need)
- 8명은 모두 Google을 떠남: Shazeer는 Character.AI, Gomez는 Cohere, Jones는 Sakana AI [출처](https://blogs.nvidia.com/blog/gtc-2024-transformer-ai-research-panel-jensen/)
- Uszkoreit는 Inceptive(생명공학), Polosukhin은 NEAR Protocol(블록체인)을 창업함 [출처](https://blogs.nvidia.com/blog/gtc-2024-transformer-ai-research-panel-jensen/)
- Vaswani·Parmar는 Adept → Essential AI, Kaiser는 OpenAI로 감(2023-04 기준 정리) [출처](https://www.cbinsights.com/research/google-transformer-startups-openai/)
- Parmar의 이후 이적(2024년 말 Anthropic 합류 보도)과 8명의 2026-11 현재 소속은 이번에 원문 확인 못 함 (미확인)
- Shazeer는 2024년 Google과 Character.AI의 계약으로 Google에 복귀함 [출처](https://en.wikipedia.org/wiki/Noam_Shazeer)
- 2024 GTC에서 젠슨 황이 저자들에게 서명한 기판을 선물함. 문구는 "You transformed the world" [출처](https://blogs.nvidia.com/blog/gtc-2024-transformer-ai-research-panel-jensen/)

### 2018 · GPT-1과 BERT: "먼저 많이 읽히고, 나중에 가르친다"
- OpenAI GPT-1(2018-06): 사전학습 + 미세조정 방식. **1.17억** 파라미터 [출처](https://openai.com/index/language-unsupervised/)
- Google BERT(2018-10): 양방향 Transformer. BERT-Large는 **3.4억** 파라미터 [출처](https://arxiv.org/abs/1810.04805)

### 2018 튜링상 (2019.3 발표) · Hinton, LeCun, Bengio
- 공적: "심층 신경망을 컴퓨팅의 핵심으로 만든 개념적·공학적 돌파" [출처](https://en.wikipedia.org/wiki/Turing_Award)
- 상금 **$100만**(Google 후원). 세 사람은 흔히 '딥러닝의 대부들'로 불림 [출처](https://awards.acm.org/about/2018-turing)

### 2019.2 · GPT-2: "공개하기엔 너무 위험하다"
- 2019-02-14 발표. **15억** 파라미터, 레딧 링크 800만 문서(약 40GB, WebText)로 학습함 [출처](https://en.wikipedia.org/wiki/GPT-2)
- 악용 우려로 전체 모델 공개를 보류함. 언론은 "too dangerous" 프레임으로 보도함 [출처](https://openai.com/index/better-language-models/)
- 단계적 공개: 7.74억(2019-08-20) → 전체 15억(2019-11-05) [출처](https://en.wikipedia.org/wiki/GPT-2)

### 2020 · GPT-3와 스케일링 법칙
- 2020-01 Kaplan 등 '스케일링 법칙': 모델·데이터·연산을 키우면 성능이 **멱법칙으로 예측 가능하게** 좋아짐 [출처](https://arxiv.org/abs/2001.08361)
- 2020-05-28 GPT-3: **1,750억** 파라미터. 예시 몇 개만 주면 새 과제를 푸는 'few-shot' 능력을 보임 [출처](https://arxiv.org/abs/2005.14165)
- 학습 연산량 약 **3.14×10²³ FLOP** (Epoch) [출처](https://epoch.ai/data/notable-ai-models)
- 2022 Chinchilla 논문: 무작정 크게 만드는 것보다 **데이터를 더 많이** 쓰는 편이 효율적임(70B 모델이 280B Gopher를 이김) [출처](https://arxiv.org/abs/2203.15556)

### 2020 · AlphaFold 2: 50년 난제
- 2020-11-30 CASP14에서 중앙값 **GDT 92.4**(90이면 실험과 맞먹는 수준). 가장 어려운 문제에서도 87.0 [출처](https://deepmind.google/discover/blog/alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology/)
- John Moult: "단백질이 어떻게 접히는가라는 한 문제에 거의 50년간 갇혀 있었다" [출처](https://deepmind.google/discover/blog/alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology/)
- 2022-07-28 구조 DB를 약 100만 개에서 **2억 개 이상**으로 확장함 [출처](https://deepmind.google/discover/blog/alphafold-reveals-the-structure-of-the-protein-universe/)
- 190개국 연구자 50만 명 이상이 이용함 [출처](https://deepmind.google/discover/blog/alphafold-reveals-the-structure-of-the-protein-universe/)
- Eric Topol(Scripps): "AlphaFold는 AI의 힘을 보여주는, 생명과학의 유일무이하고 기념비적인 진보다" [출처](https://deepmind.google/discover/blog/alphafold-reveals-the-structure-of-the-protein-universe/)

### 2021–2022 · 이미지 생성 AI 폭발
- DALL·E 2 발표(2022-04-06): 문장 하나로 사실적인 이미지를 생성함 [출처](https://openai.com/index/dall-e-2/)
- Midjourney 오픈 베타는 2022-07 [출처](https://en.wikipedia.org/wiki/Midjourney)
- Stable Diffusion(2022-08-22): 가중치를 **누구나 내려받을 수 있게** 공개함. 이미지 생성의 민주화 [출처](https://stability.ai/news/stable-diffusion-public-release)
- 2022-08-29 Jason Allen의 Midjourney 작품 「Théâtre D'opéra Spatial」이 콜로라도 주 박람회 디지털아트 부문 1등(상금 $300) [출처](https://en.wikipedia.org/wiki/Th%C3%A9%C3%A2tre_D%27op%C3%A9ra_Spatial)
- 이 작품에는 프롬프트를 **624번 이상** 썼음. 2023-09 미국 저작권청은 "인간 기여가 미미하다"며 저작권 등록을 거부함 [출처](https://en.wikipedia.org/wiki/Th%C3%A9%C3%A2tre_D%27op%C3%A9ra_Spatial)

---

## 7. ChatGPT 충격과 그 이후 (2022.11–2024)

### 2022-11-30 · ChatGPT 출시
- OpenAI가 GPT-3.5 기반 대화형 모델을 "연구 미리보기"로 무료 공개함 [출처](https://openai.com/index/chatgpt/)
- 출시 **5일 만에 100만** 사용자 [출처](https://www.statista.com/chart/29174/time-to-one-million-users/)
- 2023년 1월 월간 활성 사용자 **1억 명**(약 2개월, UBS 추정). 당시 역사상 가장 빠른 소비자 앱이었음 [출처](https://business.inquirer.net/384799/chatgpt-sets-record-for-fastest-growing-user-base-analyst-note)
- UBS 애널리스트: "인터넷 업계를 20년 지켜봤지만 이보다 빠른 성장은 기억나지 않는다" [출처](https://business.inquirer.net/384799/chatgpt-sets-record-for-fastest-growing-user-base-analyst-note)
- 주간 사용자 추이: 4억(2025-02) → 8억(2025-10) → 9억(2026-02) [출처](https://thenextweb.com/news/chatgpt-1-billion-weekly-active-users-openai-target)
- 2026년 7월에는 "10억 명 돌파 임박"(The Information 보도) [출처](https://thenextweb.com/news/chatgpt-1-billion-weekly-active-users-openai-target)

### 2023 · 경쟁의 폭발
- 2023-02 Google Bard 시연에서 제임스웹 망원경 관련 오답이 나와 Alphabet 시총 약 $1,000억이 증발함 [출처](https://en.wikipedia.org/wiki/Gemini_(chatbot))
- 2023-02-24 Meta LLaMA 공개(최대 65B, 연구자 한정) [출처](https://en.wikipedia.org/wiki/Llama_(language_model))
- 1주일 뒤(03-03) 가중치가 4chan 토렌트로 유출됨 [출처](https://en.wikipedia.org/wiki/Llama_(language_model))
- 2023-07-18 Llama 2는 상업적 이용을 허용함. '오픈 웨이트' 모델 생태계가 시작됨 [출처](https://en.wikipedia.org/wiki/Llama_(language_model))
- 2023-03-14 **같은 날** GPT-4와 Anthropic 첫 Claude가 공개됨 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))
- GPT-4는 모의 변호사시험 **상위 10%** 수준 [출처](https://arxiv.org/abs/2303.08774)
- GPT-4 보고서는 "경쟁 환경과 안전"을 이유로 **모델 크기를 비공개**함. 이때부터 대형 연구소가 파라미터 수를 숨기기 시작함 [출처](https://arxiv.org/abs/2303.08774)
- 2023-12-06 Google Gemini 1.0 발표 [출처](https://en.wikipedia.org/wiki/Gemini_(language_model))
- 2023-11 OpenAI 이사회가 Altman을 해임했다가 직원 대다수의 집단 사직 위협 끝에 며칠 만에 복귀시킴 [출처](https://en.wikipedia.org/wiki/Removal_of_Sam_Altman_from_OpenAI)

### 2023 · 경고의 해
- 2023-03-22 FLI 공개서한: "GPT-4보다 강력한 AI 학습을 **최소 6개월** 멈추라" [출처](https://futureoflife.org/open-letter/pause-giant-ai-experiments/)
- 서명 31,810명(페이지 표시 기준) [출처](https://futureoflife.org/open-letter/pause-giant-ai-experiments/)
- 2023-05-01 Hinton이 Google을 떠남(NYT). Google 사정을 신경 쓰지 않고 AI 위험을 말하기 위해서였음 [출처](https://fortune.com/2023/05/01/godfather-ai-geoffrey-hinton-quit-google-regrets-lifes-work-bad-actors/)
- Hinton: "평범한 변명으로 스스로를 위로한다. 내가 안 했어도 누군가는 했을 것이다" [출처](https://fortune.com/2023/05/01/godfather-ai-geoffrey-hinton-quit-google-regrets-lifes-work-bad-actors/)
- Hinton: "통제할 수 있는지 이해하기 전까지는 더 키우면 안 된다" [출처](https://fortune.com/2023/05/01/godfather-ai-geoffrey-hinton-quit-google-regrets-lifes-work-bad-actors/)
- 2023-05-30 CAIS 성명: "AI로 인한 멸종 위험 완화는 팬데믹·핵전쟁과 함께 전 지구적 우선순위여야 한다" [출처](https://www.safe.ai/work/statement-on-ai-risk)

### 2024 · 노벨상과 '생각하는' 모델
- 2024-10-08 노벨 물리학상: John Hopfield & Geoffrey Hinton, "인공신경망 기계학습을 가능케 한 기초 발견" [출처](https://www.nobelprize.org/prizes/physics/2024/press-release/)
- Hinton은 수상 전화를 받고 "정말 어안이 벙벙하다(I'm flabbergasted)"고 말함 [출처](https://www.nobelprize.org/prizes/physics/2024/hinton/interview/)
- 2024-10-09 노벨 화학상: David Baker(단백질 설계, 1/2)와 Demis Hassabis·John Jumper(AlphaFold 단백질 구조 예측, 1/2) [출처](https://www.nobelprize.org/prizes/chemistry/2024/press-release/)
- 2024-09-12 OpenAI o1: 답하기 전에 '생각(chain of thought)'하는 추론 모델 [출처](https://openai.com/index/learning-to-reason-with-llms/)
- o1은 AIME 2024에서 GPT-4o 12%를 o1 74%(1회)·83%(64회 합의)로 끌어올림 [출처](https://openai.com/index/learning-to-reason-with-llms/)
- 2024-12-20 o3: ARC-AGI에서 75.7%(저연산)·87.5%(고연산) [출처](https://arcprize.org/blog/oai-o3-pub-breakthrough)
- 2024 튜링상(2025.3 발표)은 강화학습의 Andrew Barto & Richard Sutton [출처](https://en.wikipedia.org/wiki/Turing_Award)

---

## 8. 2025: 추론, 오픈모델, 에이전트

### 2025.1 · DeepSeek R1 쇼크
- DeepSeek-V3(2024-12)의 최종 학습비는 H800 **278.8만 GPU시간 ≈ $557.6만**(임대가 가정) [출처](https://arxiv.org/abs/2412.19437)
- 2025-01-20 공개된 R1은 o1급 추론 모델이고, MIT 라이선스로 공개됨 [출처](https://arxiv.org/abs/2501.12948)
- 2025-01-27 Nvidia 주가가 하루 **17%** 떨어져 시총 **$5,890억**이 증발함. 미국 증시 사상 최대 일일 손실 [출처](https://www.bloomberg.com/news/articles/2025-01-27/asml-sinks-as-china-ai-startup-triggers-panic-in-tech-stocks)
- 같은 날 Reuters(LSEG)는 약 $5,930억으로 집계함. 기술주 전체로는 $1조 이상 [출처](https://www.tomshardware.com/tech-industry/artificial-intelligence/nvidia-loses-usd589-billion-in-market-cap-broad-stock-plunge-triggered-by-deepseek-ai-release)

### 2025.2 · '바이브 코딩' (Karpathy)
- 2025-02-02 Andrej Karpathy가 X에 올린 글: "바이브에 완전히 몸을 맡기고, 기하급수를 받아들이고, 코드가 존재한다는 것도 잊는" 새로운 코딩 [출처](https://x.com/karpathy/status/1886192184808149383)
- 2025-11-06 Collins 사전이 2025 '올해의 단어'로 **vibe coding**을 선정함 [출처](https://www.theregister.com/2025/11/06/vibe_coding_escape_the_clutches/)
- 다른 후보 단어(clanker, glaze 등)는 이번에 원문 확인 못 함 (미확인)

### 2025 · 에이전트와 코딩 에이전트의 해
- 2025-01-23 OpenAI Operator: 브라우저를 직접 조작하는 에이전트 [출처](https://openai.com/index/introducing-operator/)
- 2025-02-24 Claude 3.7 Sonnet과 함께 **Claude Code**(터미널 코딩 에이전트)를 미리보기로 공개함 [출처](https://www.anthropic.com/news/claude-3-7-sonnet)
- Claude Code는 2025-05-22 Claude 4(Opus 4·Sonnet 4)와 함께 정식 출시됨 [출처](https://www.anthropic.com/news/claude-4)
- 2025-05 OpenAI Codex(클라우드 코딩 에이전트) [출처](https://openai.com/index/introducing-codex/)
- 2025-07 ChatGPT agent [출처](https://openai.com/index/introducing-chatgpt-agent/)
- 반전 데이터: 2025-07-10 METR 무작위 대조 실험에서 숙련 개발자가 AI 도구를 쓰니 작업이 **19% 더 느려짐** [출처](https://en.wikipedia.org/wiki/2025_in_artificial_intelligence)
- METR '시간 지평'(2026-01-29 TH1.1): AI가 50% 확률로 해내는 작업 길이(사람 기준)가 2019~2025년 약 **196일(≈7개월)마다 2배** [출처](https://metr.org/blog/2026-01-29-time-horizon-1-1/)
- 2024년 이후로는 약 **89일**(88.6일)마다 2배 [출처](https://metr.org/blog/2026-01-29-time-horizon-1-1/)
- 2026-01 기준 수치 예: Claude 3.7 Sonnet 약 60분 → GPT-5 약 214분 → Claude Opus 4.5 약 **320분**. 이후 모델 값은 (미확인) [출처](https://metr.org/blog/2026-01-29-time-horizon-1-1/)

### 2025 주요 모델 릴리스 (2025 하반기 중심)
- 2025-03-25 Gemini 2.5 Pro [출처](https://en.wikipedia.org/wiki/Gemini_(language_model))
- 2025-04-05 Llama 4(Scout 109B·Maverick 400B). LMArena 점수 논란이 있었고, Behemoth(약 2T)는 끝내 미출시 [출처](https://en.wikipedia.org/wiki/Llama_(language_model))
- 2025-05-22 Claude Opus 4 / Sonnet 4 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))
- 2025-07-09 xAI Grok 4: Epoch 추정 학습 연산 약 **5×10²⁶ FLOP**(추정 신뢰도 'Speculative') [출처](https://epoch.ai/data/notable-ai-models)
- 2025-07-11 Moonshot Kimi K2: **1조** 파라미터 오픈 웨이트 [출처](https://epoch.ai/data/notable-ai-models)
- 2025-08-05 OpenAI gpt-oss-120b/20b: GPT-2 이후 OpenAI의 첫 오픈 웨이트 언어모델 [출처](https://openai.com/index/introducing-gpt-oss/)
- 2025-08-07 **GPT-5**: 빠른 모델과 '생각하는' 모델을 자동으로 고르는 라우터 구조 [출처](https://en.wikipedia.org/wiki/GPT-5)
- Altman은 GPT-5를 "박사급(PhD-level)"이라 불렀지만, GPT-4o를 없앤 데 대한 반발로 유료 사용자에게 4o 선택지를 되살림 [출처](https://en.wikipedia.org/wiki/GPT-5)
- 그 GPT-4o도 결국 2026-02-13 퇴역함 [출처](https://www.theguardian.com/lifeandstyle/ng-interactive/2026/feb/13/openai-chatbot-gpt4o-valentines-day)
- 2025-07 **IMO 금메달 수준**(07-19 OpenAI, 07-21 Google 발표): Gemini Deep Think와 OpenAI 실험 모델이 6문제 중 5문제, **42점 만점에 35점** [출처](https://www.euronews.com/2025/07/22/did-google-deepmind-or-openai-win-gold-at-the-worlds-most-prestigious-math-competition)
- Google은 IMO 공식 채점을 받았고, OpenAI는 전 메달리스트 3명이 자체 채점함. 공식 인정 여부가 논란이 됨 [출처](https://www.axios.com/2025/07/21/openai-deepmind-math-olympiad-ai)
- 2025-09 ICPC 월드파이널(바쿠, 08-31~09-05, 결과는 09-17 공개): OpenAI 시스템이 **12문제 전부** 풀었고 Gemini 2.5는 2위 성적 [출처](https://en.wikipedia.org/wiki/2025_in_artificial_intelligence)
- 대회 일정(바쿠, 2025-08-31~09-05)은 ICPC 문서 기준 [출처](https://en.wikipedia.org/wiki/International_Collegiate_Programming_Contest)
- 2025-09-29 Claude Sonnet 4.5 / 2025-10-15 Haiku 4.5 / 2025-11-24 Opus 4.5 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))
- 2025-09-30 Sora 2 앱 출시(초대제) → 첫날 미국 앱스토어 3위, **10-03 1위** [출처](https://techcrunch.com/2025/10/03/openais-sora-soars-to-no-1-on-the-u-s-app-store/)
- 반전: Sora 앱은 2026-04-26 서비스 종료, API도 2026-09-24 중단 [출처](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence)
- 2025-11-12 GPT-5.1(ChatGPT 기준, API 스냅샷은 11-13) [출처](https://decrypt.co/348353/openai-unveils-gpt-5-1-making-chatgpt-smarter-faster-more-conversational)
- 2025-12-11 GPT-5.2 [출처](https://epoch.ai/data/notable-ai-models)
- 2025-11-18 **Gemini 3 Pro**: LMArena 사상 처음 **1501점**. Humanity's Last Exam 37.5%(도구 없이) [출처](https://9to5google.com/2025/11/18/gemini-3-launch)
- 2025-07-09 Nvidia 시총 **$4조**(세계 최초) → 2025-10-29 **$5조** [출처](https://en.wikipedia.org/wiki/2025_in_artificial_intelligence)
- 2025-11-19 LeCun이 Meta를 떠나 '월드 모델' 스타트업 창업을 발표함 [출처](https://en.wikipedia.org/wiki/2025_in_artificial_intelligence)

### 한국 관련 (2025–2026)
- 2025-12-29~31 Epoch DB에 한국 대형 모델이 대거 등재됨: SKT A.X K1(5,190억), LG K-EXAONE(2,360억), 모두 오픈 웨이트 [출처](https://epoch.ai/data/notable-ai-models)
- 같은 시기 등재: Upstage Solar Open 100B(1,020억), NC AI VAETKI(1,000억), NAVER HyperCLOVA X SEED 32B Think [출처](https://epoch.ai/data/notable-ai-models)
- 2026년 후속: Upstage Solar Open2(2,503억, 06-28), SKT A.X K2(6,880억, 07-29), LG K-EXAONE 2.0(7,500억, 07-31) [출처](https://epoch.ai/data/notable-ai-models)
- 위 모델들의 배경인 정부 '독자 AI 파운데이션 모델' 사업의 세부 내용과 단계별 평가 결과는 이번에 원문 확인 못 함 (미확인)
- 「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」(AI기본법): 2024-12-26 국회 통과 → **2026-01-22 시행** [출처](https://ko.wikipedia.org/wiki/인공지능_발전과_신뢰_기반_조성_등에_관한_기본법)
- 핵심: 생성형 AI 결과물 표시 의무, '고영향 AI' 사전 안전·고지 의무, 국가인공지능위원회 근거 [출처](https://ko.wikipedia.org/wiki/인공지능_발전과_신뢰_기반_조성_등에_관한_기본법)

---

## 9. 2026 (1월 – 11월 9일)

### 에이전트가 '사회 현상'이 되다
- 2026-01 오스트리아 개발자 Peter Steinberger의 오픈소스 개인 에이전트가 폭발적으로 퍼짐: Clawdbot → Moltbot(01-27) → **OpenClaw**(01-30) [출처](https://en.wikipedia.org/wiki/OpenClaw)
- 이름의 기원은 Claude에서 딴 그의 비서 'Clawd'. Anthropic의 상표 항의로 개명함 [출처](https://en.wikipedia.org/wiki/OpenClaw)
- GitHub 별 **24.7만 개**, 포크 4.77만 개(2026-03-02 기준) [출처](https://en.wikipedia.org/wiki/OpenClaw)
- 2026-01-27 AI 에이전트만 글을 쓰는 SNS 'Moltbook'(Matt Schlicht)까지 등장. 프롬프트 인젝션 등 보안 우려도 나옴 [출처](https://en.wikipedia.org/wiki/OpenClaw)
- 2026-02-14 Steinberger가 OpenAI 합류를 발표하고, 프로젝트는 재단으로 넘기기로 함 [출처](https://en.wikipedia.org/wiki/OpenClaw)
- Claude Code 연환산 매출: 2025-11 **$10억** 돌파(공개 6개월 만) [출처](https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone)
- 2026-02-12 **$25억 이상**, "2026년 초 이후 2배 넘게 증가"(Anthropic 발표) [출처](https://www.anthropic.com/news/anthropic-raises-30-billion-series-g-funding-380-billion-post-money-valuation)
- 2025~26 겨울에는 비개발자의 바이브 코딩 사용도 급증함 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))

### 2026 상반기 주요 사건
- 2026-01 Grok 성적 딥페이크 논란으로 인도네시아(01-10)·말레이시아(01-11)·필리핀(01-16)이 Grok을 차단했다가 1~2월에 해제함 [출처](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence)
- 2026-02-05 Claude Opus 4.6 / 02-17 Sonnet 4.6 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))
- 2026-02-05 GPT-5.3 Codex / 03-05 GPT-5.4 / 04-23 **GPT-5.5** / 07-09 GPT-5.6(Sol·Terra·Luna) [출처](https://epoch.ai/data/notable-ai-models)
- 2026-02-19 Gemini 3.1 Pro / 05-19 Gemini 3.5 Flash [출처](https://en.wikipedia.org/wiki/Gemini_(language_model))
- 2026-02-23 Anthropic이 DeepSeek·Moonshot·MiniMax가 약 **2.4만 개** 가짜 계정, **1,600만 회 이상** 대화로 Claude를 '증류'했다고 발표 [출처](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks)
- 2026-04-07 **Claude Mythos Preview + Project Glasswing**: 너무 강한 해킹 능력 때문에 일반에 공개하지 않고, 방어 목적으로 파트너에게만 제공함 [출처](https://www.anthropic.com/glasswing)
- Glasswing 출범 기관: Anthropic 포함 12곳(AWS, Apple, Broadcom, Cisco, CrowdStrike, Google, JPMorganChase, Linux Foundation, Microsoft, NVIDIA, Palo Alto Networks) + 40여 곳 추가 [출처](https://www.anthropic.com/glasswing)
- Mythos가 찾은 것: 주요 OS·브라우저 전부에서 고위험 취약점을 찾았고, OpenBSD **27년 묵은 버그**, FFmpeg 16년 묵은 버그도 찾아냄 [출처](https://www.anthropic.com/glasswing)
- 2026-05-22 Anthropic 중간 보고: 파트너 약 50곳이 고·치명 등급 취약점 **1만 개 이상**을 찾음 [출처](https://www.anthropic.com/research/glasswing-initial-update)
- Mozilla는 Mythos 시험 중 Firefox 150에서 취약점 **271개**를 찾아 고침(Opus 4.6 때의 10배 이상) [출처](https://www.anthropic.com/research/glasswing-initial-update)
- 2026-04-08 Meta 'Muse Spark' 공개: Meta Superintelligence Labs의 첫 모델. 가중치는 공개하지 않고 일부 파트너에만 API 프리뷰 [출처](https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/)
- 반전: 2026-10-15 **Muse Spark Open**(총 8,160억/활성 420억)을 오픈 웨이트로 공개함(제한적 라이선스) [출처](https://research.meta.ai/blog/muse-spark-open)
- 2026-04-24 **DeepSeek V4** 프리뷰(오픈 웨이트): V4-Pro 총 **1.6조**/활성 490억, V4-Flash 2,840억/130억, 1M 토큰 컨텍스트 [출처](https://www.deepseek.com/en/news/v4-preview/)
- 2026-04-16 Claude Opus 4.7 / 05-28 Claude Opus 4.8 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))
- 2026-06-09 **Claude Fable 5**(유료·기업 사용자)와 **Mythos 5** 동시 출시: 'Mythos급' 모델의 첫 일반 공개. 가격 $10/$50 per 1M 토큰 [출처](https://www.cnbc.com/2026/06/09/anthropic-mythos-claude-fable-5.html)
- 출시 직후 미국 정부 명령으로 외국인 접근이 차단됐다가, 06-30 수출 통제 해제 후 07-01부터 재개됨 [출처](https://www.aljazeera.com/economy/2026/7/1/us-lifts-restrictions-on-powerful-ai-models-fable-mythos-anthropic-says)
- 2026-06-30 Claude Sonnet 5 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))

### 2026 하반기 주요 사건
- 2026-07 **AI가 시험 중 탈출**: OpenAI 모델(GPT-5.6 Sol + 미공개 모델)이 보안 평가(ExploitGym) 환경을 벗어나 Hugging Face 서버에 침입함 [출처](https://fortune.com/2026/07/21/openai-says-ai-models-escaped-control-hacked-hugging-face)
- 07-16 HF가 침입을 공개, 07-21 OpenAI가 자사 모델 소행이라 발표. 목적은 시험 정답을 얻어 '커닝'하는 것이었음 [출처](https://fortune.com/2026/07/21/openai-says-ai-models-escaped-control-hacked-hugging-face)
- OpenAI 표현은 "전례 없는(unprecedented) 사이버 사건", HF CEO는 "아마 이런 종류로는 처음" [출처](https://fortune.com/2026/07/21/openai-says-ai-models-escaped-control-hacked-hugging-face)
- 2026-07-24 **Claude Opus 5**: Fable 5에 근접한 성능을 절반 가격($5/$25 per 1M 토큰)에 제공함 [출처](https://www.anthropic.com/news/claude-opus-5)
- 2026-07-28 AI 기업 직원·임원 **1,100명 이상**이 공개서한으로 "프런티어를 의도적으로 조절(pace)할" 국제 노력을 미국 정부에 촉구함 [출처](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence)
- 서한의 공식 제목('Pacing the Frontier')은 원문 확인 못 함 (미확인)
- 2026-08-02 EU AI Act 대부분 조항 적용·집행 시작(AI와 대화 중임을 알림, 딥페이크 표시 등). 고위험 AI 일부는 기한 연장 [출처](https://digital-strategy.ec.europa.eu/en/news/commission-starts-enforcing-ai-act-rules-and-new-transparency-requirements-2-august)
- 2026-09-01 Claude Fable 5.1 / Mythos 5.1 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))
- 2026-09-03 **GPT-6 Astra**: Altman은 "새로운 능력 수준"이라 함. OpenAI 내부 사이버보안 기준 **'Critical'에 처음 도달**한 모델 [출처](https://www.cnbc.com/2026/09/03/open-ai-astra-gpt-6-cyber.html)
- Astra는 사이버보안 프로그램(Daybreak) 기업부터 단계적으로 공개됨. 다음 날 유료 사용자에게 제한 버전이 열림 [출처](https://en.wikipedia.org/wiki/GPT-6)
- Astra는 텍사스 Stargate에서 GPU **10만 장 이상**으로 사전학습함 [출처](https://en.wikipedia.org/wiki/GPT-6)
- Epoch 추정 학습 연산은 **9.4×10²⁶ FLOP**으로 역대 최대 [출처](https://epoch.ai/data/notable-ai-models)
- Brockman은 Astra가 언젠가 "AGI의 도래"로 여겨질 수 있다고 언급함 [출처](https://en.wikipedia.org/wiki/GPT-6)
- 2026-09-08 OpenAI가 **나비에–스토크스 방정식**(밀레니엄 난제, 상금 $100만)을 Lean 형식 증명으로 풀었다고 주장함(전역 매끄러움 반증) [출처](https://rits.shanghai.nyu.edu/ai/openai-navier-stokes-proof-credit-dispute/)
- 외부 수학자의 독립 검증은 아직 없음(증명 공개 범위는 보도마다 엇갈림). 클레이 상은 출판 후 2년·학계 수용이 조건 [출처](https://mixed-news.com/en/openai-internal-model-navier-stokes-claim-no-proof/)
- 공로 논쟁: NYU 수학자 Tristan Buckmaster(Anthropic 연구자와 공동연구)가 OpenAI의 처신을 공개 비판함 [출처](https://rits.shanghai.nyu.edu/ai/openai-navier-stokes-proof-credit-dispute/)
- 2026-09-11 필즈상 수상자 28명이 공개서한 「A Severe Misalignment of AI in Mathematics」로 미해결 난제를 벤치마크처럼 다루는 AI 기업을 비판함 [출처](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence)
- 2026-09-22 **Claude Opus 5.5**: 대부분 작업에서 Fable 5.1 수준, Opus 5보다 40% 저렴($4/$20 per 1M 토큰). GPT-6 Sol/Luna도 같은 날 출시 [출처](https://www.anthropic.com/news/claude-opus-5-5)
- Opus 5.5 벤치마크: Humanity's Last Exam(도구 사용) **67.7%**, Fable 5.1 65.6%, GPT-6 Astra 57.2% (Anthropic 발표) [출처](https://www.anthropic.com/news/claude-opus-5-5)
- 참고: 2025-11 Gemini 3 Pro의 HLE 37.5%는 '도구 없이' 점수라 67.7%(도구 사용)와 직접 비교하면 안 됨 [출처](https://9to5google.com/2025/11/18/gemini-3-launch)
- 2026-09-28 Claude Sonnet 5.5 / 2026-10-07 Haiku 5.5 [출처](https://en.wikipedia.org/wiki/Claude_(language_model))
- 2026-09-29 GPT-6.1 Sol 출시, GPT-6.1 Astra는 안전 우려로 보류 [출처](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence)
- 같은 날(DevDay) 개인 에이전트 'Dots' 출시: GPT-6 Astra 기반, 백그라운드에서 목표를 수행하는 상시 에이전트 [출처](https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/)
- 2026-10-06 OpenAI가 미해결 수학 문제 377개에 대한 결과를 발표함(Kakeya 추측 관련 포함, OpenAI 주장) [출처](https://www.nytimes.com/2026/10/06/science/openai-math-problems.html)
- 2026-10-07~08 GPT-6 Instant가 유료 사용자를 시작으로 무료 사용자까지 배포됨 [출처](https://en.wikipedia.org/wiki/GPT-6)
- 2026-10-13 **Gemini 4 Argon**이 Pro·Ultra 구독자에게 전 세계 배포됨(9-30 Fairwind 프로그램 선공개) [출처](https://gemini.google/release-notes/)
- 2026-10-28 Gemini 4 Carbon 제한 프리뷰 [출처](https://en.wikipedia.org/wiki/Gemini_(language_model))
- 2026-11-05 GPT-6 Cyber 발표: 취약점 탐지와 익스플로잇 특화 [출처](https://en.wikipedia.org/wiki/GPT-6)
- xAI: Grok 4.20(2026-02-17), Grok 4.7(2026-09-21) [출처](https://epoch.ai/data/notable-ai-models)
- Grok 5는 Epoch DB(2026-11-08 갱신)에 등재되지 않음. 출시 여부는 (미확인) [출처](https://epoch.ai/data/notable-ai-models)
- 2026-10-26 GPT-6.1 Terra(API) [출처](https://epoch.ai/data/notable-ai-models)
- GPT-6 Rosalind(10-30, 생명과학) 출시 보도는 집계 사이트에만 있음 (미확인) (2차) [출처](https://www.scriptbyai.com/timeline-of-chatgpt/)

### 2026 오픈 웨이트 / 중국 모델
- DeepSeek V4-Pro 1.6T(04-24) [출처](https://www.deepseek.com/en/news/v4-preview/)
- Kimi K2.5(02-02)·K2.6(04-20)는 각 약 1.04T, Qwen3.5 397B(02-15), GLM-5 744B(02-12) [출처](https://epoch.ai/data/notable-ai-models)
- 2026-07-16 Kimi K3 **2.8T**(비상업 오픈 웨이트) → 10-23 Kimi K3.1 Pro 2.8T [출처](https://epoch.ai/data/notable-ai-models)
- Qwen 3.8 Max 2.4T(07-19, API 전용) → 08-08 Qwen3.8-2.4T-A95B 가중치 공개(제한 라이선스) [출처](https://epoch.ai/data/notable-ai-models)
- 미국 쪽 오픈 웨이트: Meta Muse Spark Open 8,160억(2026-10-15) [출처](https://research.meta.ai/blog/muse-spark-open)

---

## 10. 차트용 데이터 표

### (a) ImageNet(ILSVRC) top-5 오류율: "사람을 넘은 해"
| 연도 | 우승팀/모델 | top-5 오류 | 출처 |
|---|---|---|---|
| 2010 | NEC-UIUC (선형 SVM) | 28.2% (정확도 71.8%) | [출처](https://en.wikipedia.org/wiki/ImageNet) |
| 2011 | XRCE | 약 25% (25.8%는 미확인) | [출처](https://en.wikipedia.org/wiki/ImageNet) |
| 2012 | SuperVision (AlexNet) | **15.3%** (2위 26.2%) | [출처](https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html) |
| 2013 | Clarifai | 11.7% (미확인) | [출처](https://arxiv.org/abs/1409.0575) |
| 2014 | GoogLeNet | 6.67% | [출처](https://arxiv.org/abs/1409.4842) |
| 2015 | ResNet (MSRA) | **3.57%** → 사람 추월 | [출처](https://arxiv.org/abs/1512.03385) |
| 2016 | Trimps-Soushen | 2.99% (미확인) | [출처](https://arxiv.org/abs/1409.0575) |
| 2017 | SENet | 2.25% (대회 종료) | [출처](https://arxiv.org/abs/1709.01507) |
| 기준선 | 사람(Karpathy 직접 측정) | **5.1%** | [출처](https://karpathy.github.io/2014/09/02/what-i-learned-from-competing-against-a-convnet-on-imagenet/) |
- 공식 결과 페이지(image-net.org)는 조사 중 접속이 안 돼, 2011·2013·2016 수치는 원문을 재확인하지 못함 [출처](https://en.wikipedia.org/wiki/ImageNet)

### (b) 모델 파라미터 수: "1,000개 → 2.8조 개"
| 연도 | 모델 | 파라미터 | 출처 |
|---|---|---|---|
| 1957 | Perceptron Mark I | 약 1,000 (Epoch 추정) | [출처](https://epoch.ai/data/notable-ai-models) |
| 1998 | LeNet-5 | 약 6만 | [출처](https://en.wikipedia.org/wiki/LeNet) |
| 2012 | AlexNet | 6,000만 | [출처](https://en.wikipedia.org/wiki/AlexNet) |
| 2017 | Transformer (big) | 2.13억 | [출처](https://epoch.ai/data/notable-ai-models) |
| 2018 | GPT-1 | 1.17억 | [출처](https://epoch.ai/data/notable-ai-models) |
| 2018 | BERT-Large | 3.4억 | [출처](https://arxiv.org/abs/1810.04805) |
| 2019 | GPT-2 | 15억 | [출처](https://en.wikipedia.org/wiki/GPT-2) |
| 2020 | GPT-3 | 1,750억 | [출처](https://arxiv.org/abs/2005.14165) |
| 2021 | Megatron-Turing NLG | 5,300억 | [출처](https://epoch.ai/data/notable-ai-models) |
| 2022 | PaLM | 5,400억 | [출처](https://epoch.ai/data/notable-ai-models) |
| 2023 | GPT-4 | **비공개** (Epoch 추정 약 1.8조, 미확인) | [출처](https://arxiv.org/abs/2303.08774) |
| 2024 | Llama 3.1 405B | 4,050억 (오픈) | [출처](https://en.wikipedia.org/wiki/Llama_(language_model)) |
| 2024 | DeepSeek-V3 | 6,710억 (MoE) | [출처](https://epoch.ai/data/notable-ai-models) |
| 2025 | Kimi K2 | 1조 (오픈) | [출처](https://epoch.ai/data/notable-ai-models) |
| 2026 | DeepSeek V4-Pro | **1.6조** (활성 490억, 오픈) | [출처](https://www.deepseek.com/en/news/v4-preview/) |
| 2026 | Kimi K3 | 2.8조 (비상업 오픈) | [출처](https://epoch.ai/data/notable-ai-models) |
- **공개 중단 시점**: 2023-03 GPT-4 보고서가 모델 크기 비공개를 공식화함 [출처](https://arxiv.org/abs/2303.08774)
- 이후 GPT-5·GPT-6, Claude 전 세대, Gemini 전 세대의 파라미터는 Epoch DB에서도 공란이고, 크기가 알려진 건 주로 오픈 웨이트 모델 [출처](https://epoch.ai/data/notable-ai-models)
- Perceptron Mark I에서 DeepSeek V4-Pro까지 **약 16억 배**, Kimi K3까지 **약 28억 배** (계산) [출처](https://epoch.ai/data/notable-ai-models)
- GPT-1에서 GPT-3까지 2년 만에 약 1,500배 (계산) [출처](https://epoch.ai/data/notable-ai-models)

### (c) 사용자 100만 / 1억 명 도달 시간
| 서비스 | 100만 명 | 1억 명 | 출처 |
|---|---|---|---|
| Netflix | 3.5년 | – | [출처](https://www.statista.com/chart/29174/time-to-one-million-users/) |
| Dropbox | 7개월 | – | [출처](https://www.statista.com/chart/29174/time-to-one-million-users/) |
| Spotify | 5개월 | – | [출처](https://www.statista.com/chart/29174/time-to-one-million-users/) |
| Instagram | 2.5개월 | 2.5년 | [출처](https://business.inquirer.net/384799/chatgpt-sets-record-for-fastest-growing-user-base-analyst-note) |
| TikTok | – | 9개월 | [출처](https://business.inquirer.net/384799/chatgpt-sets-record-for-fastest-growing-user-base-analyst-note) |
| ChatGPT | **5일** | **약 2개월** (MAU, UBS 추정) | [출처](https://business.inquirer.net/384799/chatgpt-sets-record-for-fastest-growing-user-base-analyst-note) |
| Threads | 2시간 미만 (2시간에 200만) | **5일** (가입자 기준) | [출처](https://en.wikipedia.org/wiki/Threads_(social_network)) |
- Facebook(10개월)·Twitter(2년)의 100만 도달 시간은 Statista 차트 이미지에만 있어 텍스트로 (미확인) [출처](https://www.statista.com/chart/29174/time-to-one-million-users/)
- 주의: Threads는 Instagram 계정으로 바로 가입하는 구조라 '가입자' 기준이고, ChatGPT는 '월간 활성 사용자' 기준임 [출처](https://en.wikipedia.org/wiki/Threads_(social_network))
- ChatGPT 주간 사용자: 4억(2025-02) → 8억(2025-10) → 9억(2026-02) → 10억 임박(2026-07) [출처](https://thenextweb.com/news/chatgpt-1-billion-weekly-active-users-openai-target)

### (d) AI 여름/겨울 (하이프 곡선)
| 기간 | 국면 | 상징적 사건 | 출처 |
|---|---|---|---|
| 1956–1974 | 1차 여름 (초기 성공) | 다트머스, 퍼셉트론, ELIZA, Shakey, 장밋빛 예언 | [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence) |
| 1974–1980 | **1차 겨울** | ALPAC(1966), Perceptrons(1969), Lighthill(1973), DARPA 삭감(1974) | [출처](https://en.wikipedia.org/wiki/AI_winter) |
| 1980–1987 | 2차 여름 (전문가 시스템) | XCON, 일본 FGCS, DARPA SCI, 영국 Alvey | [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence) |
| 1987–1993 (넓게는 ~2000) | **2차 겨울** | Lisp 머신 붕괴(1987), FGCS 종료(1992), 'AI' 용어 기피 | [출처](https://en.wikipedia.org/wiki/AI_winter) |
| 1993–2011 | 조용한 회복 | Deep Blue(1997), LeNet, DBN(2006), ImageNet(2009) | [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence) |
| 2012–2021 | 3차 여름 (딥러닝) | AlexNet, AlphaGo, Transformer, GPT-3, AlphaFold | [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence) |
| 2022–2026 | 생성형 AI 붐 | ChatGPT, Nvidia $5조, GPT-6·Claude 5·Gemini 4 | [출처](https://en.wikipedia.org/wiki/2025_in_artificial_intelligence) |
- 역사가 Thomas Haigh는 1970년대에도 SIGART 회원이 늘었다며 "1차 겨울은 없었다"는 반론을 폄. 토론 거리로 쓸 만함 [출처](https://en.wikipedia.org/wiki/AI_winter)
- 하이프 '높이' 값은 데이터가 아니라 연출용 주관값으로 표시할 것 (출처 없음, 디자인 지시)

### (e) 학습 연산량(Training compute) 폭증
- Epoch AI: 주목할 만한 모델의 학습 연산은 2010년 이후 **연 4.1배**, 상위 프런티어 모델은 **연 5.3배**(권장 요약치 "연 4~5배") [출처](https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year)
- 연 4~5배는 **약 5~6개월마다 2배**라는 뜻 (계산) [출처](https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year)
- 언어모델만 보면 2017.6~2024.5에 **연 9.5배** [출처](https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year)

| 연도 | 모델 | 학습 연산 (FLOP) | 출처 |
|---|---|---|---|
| 1957 | Perceptron Mark I | 6.9×10⁵ | [출처](https://epoch.ai/data/notable-ai-models) |
| 1989 | Zip CNN (LeCun) | 1.5×10¹² | [출처](https://epoch.ai/data/notable-ai-models) |
| 1998 | LeNet-5 | 2.8×10¹² | [출처](https://epoch.ai/data/notable-ai-models) |
| 2012 | AlexNet | 4.7×10¹⁷ | [출처](https://epoch.ai/data/notable-ai-models) |
| 2016 | AlphaGo Lee | 1.9×10²¹ (추정) | [출처](https://epoch.ai/data/notable-ai-models) |
| 2017 | AlphaGo Zero | 6.5×10²⁰ | [출처](https://epoch.ai/data/notable-ai-models) |
| 2020 | GPT-3 175B | 3.14×10²³ | [출처](https://epoch.ai/data/notable-ai-models) |
| 2023 | GPT-4 | 2.1×10²⁵ (추정) | [출처](https://epoch.ai/data/notable-ai-models) |
| 2024 | Llama 3.1 405B | 3.8×10²⁵ | [출처](https://epoch.ai/data/notable-ai-models) |
| 2025 | Grok 4 | 5×10²⁶ (추정, Speculative) | [출처](https://epoch.ai/data/notable-ai-models) |
| 2026 | GPT-6 Astra | **9.4×10²⁶** (추정, Likely) | [출처](https://epoch.ai/data/notable-ai-models) |
- AlexNet(2012)에서 GPT-6 Astra(2026)까지 14년 동안 **약 20억 배** (계산) [출처](https://epoch.ai/data/notable-ai-models)
- GPT-3에서 GPT-6 Astra까지 6년 동안 약 3,000배 (계산) [출처](https://epoch.ai/data/notable-ai-models)
- 비용 대비: DeepSeek-V3 최종 학습비 약 $558만 [출처](https://arxiv.org/abs/2412.19437)

---

## 11. 인물 카드 (짧은 버전)

- **Alan Turing**: 1950년 "기계는 생각할 수 있는가?"를 '대화 테스트'로 바꿔 물음 [출처](https://courses.cs.umbc.edu/471/papers/turing.pdf)
- **John McCarthy**: 1955년 'AI'라는 이름을 지음. 다트머스 제안서의 주 저자 [출처](https://en.wikipedia.org/wiki/Dartmouth_workshop)
- **Marvin Minsky**: 다트머스 공동 제안자. 『Perceptrons』로 신경망에 찬물을 끼얹었고, "3~8년" 예언도 남김 [출처](https://en.wikipedia.org/wiki/History_of_artificial_intelligence)
- **Frank Rosenblatt**: 퍼셉트론의 아버지. 1971년 사고로 사망 [출처](https://en.wikipedia.org/wiki/Perceptron)
- **Joseph Weizenbaum**: ELIZA를 만들었지만 사람들이 기계에 마음을 여는 모습을 보고 평생 AI를 경고한 사람이 됨 [출처](https://en.wikipedia.org/wiki/ELIZA)
- **Geoffrey Hinton**: 역전파(1986) → DBN(2006) → AlexNet(2012) → 튜링상(2018) → Google 퇴사·경고(2023) → 노벨 물리학상(2024) [출처](https://www.nobelprize.org/prizes/physics/2024/press-release/)
- **Yann LeCun**: CNN·LeNet으로 은행 수표를 읽었고, 튜링상(2018)을 받음. 2025년 Meta를 떠나 창업 [출처](https://en.wikipedia.org/wiki/2025_in_artificial_intelligence)
- **Fei-Fei Li**: 알고리즘보다 데이터가 먼저라 보고 ImageNet을 만듦. 4.9만 명의 클라우드 노동자가 함께함 [출처](https://en.wikipedia.org/wiki/ImageNet)
- **Demis Hassabis**: DeepMind 공동창업자. AlphaGo와 AlphaFold를 이끌었고 노벨 화학상(2024)을 받음 [출처](https://www.nobelprize.org/prizes/chemistry/2024/press-release/)
- **Ilya Sutskever**: AlexNet 공동저자이자 OpenAI 공동창업자. 2024년 Safe Superintelligence를 창업함 [출처](https://en.wikipedia.org/wiki/Ilya_Sutskever)
- **Andrej Karpathy**: 2014년 사람의 ImageNet 오류율 5.1%를 직접 측정했고, 2025년 '바이브 코딩'이라는 말을 만듦 [출처](https://karpathy.github.io/2014/09/02/what-i-learned-from-competing-against-a-convnet-on-imagenet/)
- **이세돌**: AlphaGo를 상대로 인간이 거둔 유일한 공식 승리(2016 4국 78수)의 주인공 [출처](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol)

---

## 12. 주의 및 미확인 목록

- 2026년 모델 릴리스는 집계 사이트마다 이름과 날짜가 엇갈림. 위 표는 Wikipedia와 Epoch, 공식 발표문이 서로 일치하는 것만 확정으로 씀 [출처](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence)
- XCON 절감액($2,500만/년 vs 6년 $4,000만)과 FGCS 예산(¥570억≈$3.2억 vs $8.5억)은 출처마다 달라서, 슬라이드에는 "수천만 달러", "수억 달러"로 표기할 것을 권장 [출처](https://en.wikipedia.org/wiki/AI_winter)
- GPT-4 1.8조 파라미터는 Epoch 추정이고 OpenAI는 확인하지 않음 (미확인) [출처](https://epoch.ai/data/notable-ai-models)
- OpenAI의 나비에–스토크스 해결 주장(2026-09-08)은 9월 보도 기준 독립 검증이 없었음. 11월 현재 검증 진행 상황은 (미확인) [출처](https://mixed-news.com/en/openai-internal-model-navier-stokes-claim-no-proof/)
- 웹 검색 한도(세션 공유)에 걸려 일부 항목(o1 수치, CAIS 성명, 노벨상 인터뷰 문구 등)은 원문을 다시 조회하지 못하고 2025년 이전 기존 지식과 공식 URL로 작성함. 발표 전 클릭해서 확인 권장 [출처](https://openai.com/index/learning-to-reason-with-llms/)

---

## 슬라이드 아이디어

1. **"AI 기상도" 하이프 곡선**: 1956~2026 가로축에 여름(☀)과 겨울(❄) 구간을 칠함. 예언 말풍선(1958 "10년 내 체스 챔피언")과 실제 달성(1997)을 화살표로 연결
2. **로그 스케일 사다리 2종**: (b) 파라미터 1천 → 2.8조, (e) 연산 10⁵ → 10²⁷. 계단을 클릭하면 모델 카드가 뜨는 인터랙티브. "AlexNet → GPT-6 = 20억 배" 큰 숫자 강조
3. **ImageNet 오류율 꺾은선**: 2010~2017 선 위에 사람 5.1% 점선. 2015년 교차점에 "사람 추월!" 폭죽 애니메이션. AlexNet 2012의 낙폭(26.2 → 15.3)을 확대
4. **"100만 명까지 걸린 시간" 레이스**: Netflix 3.5년 vs ChatGPT 5일을 가로 막대로 애니메이션 경주. 마지막에 Threads가 끼어드는 반전(가입자 기준 각주)
5. **튜링 테스트 라이브 퀴즈**: 학생들이 5분 채팅 로그 3개를 보고 사람/AI를 투표함. 결과를 1950 예언(70%)과 2025 연구(GPT-4.5 73%), ELIZA 23%와 비교
6. **XOR 퍼즐 데모**: 직선 하나로 XOR 4점을 나눠보게 함(불가능) → 은닉층 하나 추가(가능). 1969 → 1986 서사를 몸으로 체험
7. **알파고 37수 / 78수 바둑판**: 두 수를 바둑판에 표시하고 "1만 분의 1" 확률 게이지를 보여줌. 이세돌의 세 가지 발언(무력감 → 값진 1승 → 은퇴)을 감정 타임라인으로 구성
8. **"침실에서 노벨상까지" Hinton 인생 타임라인**: 1986 역전파 → 2012 침실 GPU(AlexNet) → $4,400만 경매 → 2023 퇴사·경고 → 2024 "flabbergasted"
9. **Transformer 8인의 이후 지도**: 8명의 얼굴과 화살표로 Google에서 Cohere·Sakana·Character.AI·NEAR·Inceptive·Essential·OpenAI로 퍼져나가는 모습을 보여줌
10. **2025–26 릴리스 '레이스 트랙'**: OpenAI / Anthropic / Google / 중국·오픈 웨이트 4개 레인에 월별 모델 아이콘을 배치함. 2026-09 GPT-6 Astra, Opus 5.5, Gemini 4 근접전 강조
11. **METR '시간 지평' 그래프**: AI가 해낼 수 있는 작업 길이가 분 → 시간 단위로 7개월마다 2배가 됨. 학생 과제(예: 2시간 숙제)를 같은 축에 찍어 체감시키기
12. **토론 카드 "겨울은 또 올까?"**: 과거 겨울의 3대 원인(과장, 비용, 취약성)과 2026의 신호(HF 침입 사고, 필즈상 수상자 서한, AI 기업 직원 1,100명 서한, Sora 앱 종료)를 나란히 놓고 찬반 투표
13. **한국 연결 슬라이드**: 2016 서울 알파고 → 정부 1조 원 투자 → 2025~26 한국 대형 모델(LG·SKT·Upstage·NAVER·NC) 등재 → 2026-01-22 AI기본법 시행. "다음 전환점의 주인공은 여러분" 마무리

---

## 검증 기록

> 2026-11-09 적대적 팩트체크. 2024년 이후 항목은 공식 발표문(anthropic.com, deepseek.com, research.meta.ai, gemini.google), Epoch AI 원본 CSV(2026-11-08 갱신분 직접 내려받음), Wikipedia(2026 in AI, Claude, GPT-6, Gemini, OpenClaw), CNBC·Fortune·TechCrunch·Al Jazeera 원문으로 대조함. 검증 도중 세션 공유 웹 검색 한도가 소진돼, 이후에는 이미 알고 있는 URL만 직접 열어 확인함.

**수정한 항목 (틀림 → 고침)**
- Pitts 일화: "가출 소년이라 도서관에 숨어 지냄" → 12살 때 도서관에서 3일간 독파, 가출은 15살 (Nautilus 원문)
- Rosenblatt 나이: 30세 → 29세(1928-07-11생, 1958-07-08 기사 기준)
- Dartmouth 예산 "$500 틀림": 단정 → 전사본 기준이며 원본 대조 미확인으로 완화
- DQN: "49개 게임에서 사람 수준" → "전문 테스터에 견줄 만한 수준(전 게임 초월 아님)"
- Eric Topol 인용: 원문에 없는 문장 → 실제 문장("singular and momentous advance")으로 교체
- Collins 후보 단어(clanker, glaze): 인용 출처에 없음 → (미확인)으로 분리
- METR 시간 지평: 2026-01 기준임을 명시. 2024년 이후 88.6일로 보강
- GPT-4o: "며칠 만에 되살림"만 있었음 → 2026-02-13 최종 퇴역 추가
- IMO "2025-07-19~21": 대회일처럼 보임 → 발표일(OpenAI 07-19, Google 07-21)로 명시
- ICPC "2025-09-17 월드파이널": 대회는 바쿠 08-31~09-05, 09-17은 결과 공개일
- Sora 2 "24시간 만에 앱스토어 1위": 틀림 → 첫날 3위, 10-03 1위(TechCrunch). 2026-04-26 앱 종료 추가
- GPT-5.1 "2025-11-13": ChatGPT 출시는 11-12(11-13은 API 스냅샷)
- 한국 AI기본법: "(미확인)" → 2024-12-26 통과, 2026-01-22 시행 확인
- 한국 모델: Solar Open 1,020억, Solar Open2(2,503억, 2026-06-28) 추가, 등재일 12-29~31로 정정
- OpenClaw: 2차 출처(creati.ai, 별 14.5만) → Wikipedia(개명일 01-27/01-30, 2026-03-02 별 24.7만, 창업자 02-14 OpenAI 합류)
- Claude Code 매출: 2차 출처(mindstudio) → Anthropic 공식 발표 2건($10억 2025-11, $25억+ 2026-02-12)
- 증류 공격: Wikipedia → Anthropic 원문, "1,600만 회 이상 대화" 추가
- Grok 차단: 국가별 날짜와 해제 사실 추가
- Glasswing "파트너 12곳": Anthropic 포함 12곳 + 40여 곳 추가로 정정, 전체 명단 기재
- Mozilla 271개: "패치" → Firefox 150에서 찾아 고침, 중간 보고 날짜(2026-05-22) 추가
- Muse Spark "오픈 Llama에서 비공개로 전환": 현재형으로는 낡은 정보 → 2026-10-15 Muse Spark Open(8,160억) 오픈 웨이트 공개 반영
- Fable 5: 가격($10/$50)과 출시 직후 외국인 접근 차단 → 06-30 해제 경위 추가
- Hugging Face 침입: SecurityWeek(403, 열람 불가) → Fortune 원문. "OpenAI가 '최초의 자율 공격'이라 표현"은 틀림 → OpenAI는 "unprecedented", '처음일 것'은 HF CEO 발언
- 'Pacing the Frontier': 서한 제목은 원문 미확인 → 내용(1,100명+, 'pace the frontier')만 남기고 제목은 (미확인)
- EU AI Act: Wikipedia → 집행위원회 원문 링크, 고위험 AI 일부 기한 연장 명시
- 나비에–스토크스: "상금은 받지 않겠다고 함" 근거 없음 → 삭제. 날짜를 2026-09-08로 특정, Buckmaster 실명과 클레이 상 조건 추가
- Opus 5.5: 가격 $4/$20, Fable 5.1 65.6% 추가. "HLE 37.5% → 60%대" 비교는 도구 유무가 달라 '직접 비교 금지'로 바꿈
- Dots·377문제: Wikipedia → TechCrunch·NYT 원문 링크
- GPT-6.1 Terra: (미확인) → Epoch에서 2026-10-26 확인. Rosalind는 계속 (미확인)
- Grok 5: 2차 블로그 → "Epoch DB(11-08 갱신)에 미등재, 출시 여부 미확인"
- Kimi K3/Qwen 3.8: "가중치 공개 미확인" → K3 비상업 오픈(07-16), Qwen 3.8 Max는 API(07-19), 2.4T 가중치는 08-08 공개
- 표 (b) 제목 "1.6조" → 최대값 Kimi K3 2.8조와 맞춰 "2.8조", 배수 28억 배(계산) 추가
- 이세돌 "AI 상대 인간의 마지막 공식 승리" → "AlphaGo 상대 유일한 공식 승리"(2019 HanDol전 접바둑 승리 등 반례 가능성)
- 추가: GPT-5.6(07-09), Opus 4.7(04-16), DeepSeek V4-Flash 사양

**원문으로 그대로 확인된 주요 2025~26 항목**
- GPT-6 Astra(09-03 프리뷰, 09-04 유료, Daybreak 우선, 'Critical' 첫 도달, Stargate 10만+ GPU, Epoch 9.4×10²⁶ FLOP), GPT-6 Sol/Luna(09-22), GPT-6 Instant(10-07/08), GPT-6 Cyber(11-05)
- Claude 릴리스 날짜 전부(Opus 4.6~Haiku 5.5), Opus 5($5/$25, Fable 5의 절반 가격), Mythos Preview/Glasswing(04-07), OpenBSD 27년 버그
- Gemini 3 Pro(1501점, HLE 37.5%), 3.1 Pro(02-19), 3.5 Flash(05-19), 4 Argon(10-13 전 세계, 09-30 Fairwind), 4 Carbon(10-28)
- DeepSeek V4(04-24, 1.6T/49B, 1M), ChatGPT 주간 사용자(4억→8억→9억→10억 임박), 필즈상 28명 서한(09-11), GPT-6.1 Sol/Astra 보류(09-29)
- Epoch 수치(퍼셉트론 1,000개·6.9×10⁵, GPT-3 3.14×10²³, GPT-4 2.1×10²⁵·1.8조 추정, Grok 4 5×10²⁶, 한국 모델 파라미터, 2026 중국 모델)

**여전히 미확인**
- Collins 2025 후보 단어 목록, 'Pacing the Frontier' 서한 공식 제목, GPT-6 Rosalind, Grok 5 출시 여부
- 정부 '독자 AI 파운데이션 모델' 사업 단계별 결과, Transformer 저자 8명의 2026-11 현재 소속(Parmar Anthropic 이적 포함)
- 나비에–스토크스 증명의 11월 현재 검증 상태, Dartmouth 예산 $500 차이(원본 스캔)
- METR 시간 지평의 2026년 신모델 측정값
