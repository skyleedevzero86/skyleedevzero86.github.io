export const HOME_PAGE_SIZE = 6

export const featuredProjects = [
  {
    image: '/images/idolglow.png',
    alt: 'IdolGlow 공연 메타데이터 통합 및 예약·결제 플랫폼',
    title: 'IdolGlow',
    description:
      '공공 공연·축제 API 5종(KOPIS 공연·축제, 세종문화회관, 문화정보, 한국관광공사 Tour API)의 외부 ID를 내부 기준 ID 하나로 통합하고, 충돌 후보는 자동 병합하지 않고 검토로 보류합니다. 슬롯 예약과 토스페이먼츠 결제·정기결제에서 잠금 순서 고정, 외부 호출과 트랜잭션 분리, 타임아웃 결과의 대기 처리 후 조회 확정으로 정합성을 다룹니다. 테스트 304개 통과.',
    tech: ['Kotlin', 'Spring Boot 4', 'JPA', 'PostgreSQL', 'Querydsl', 'GraphQL', '토스페이먼츠', 'Testcontainers'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/IdolGlow' },
  },
  {
    image: '/images/news.png',
    alt: '미국경제 뉴스 시스템',
    title: 'Finsight',
    description:
      '경제·시장 뉴스를 수집해 AI 감성 분석과 함께 제공하는 서비스입니다. web·core·batch 멀티모듈 백엔드에서 제공처별 실패 격리, URL 정규화와 유니크제약으로 중복 저장을 막고, AI 장애 시 대체 모델과 서킷 브레이커로 대응합니다. Elasticsearch(nori)로 통합 검색을 제공합니다.',
    tech: ['Java 21', 'Spring Boot 3.5', 'Spring Batch', 'MySQL', 'Elasticsearch', 'Redis', 'PyTorch(DJL)', 'Next.js 15'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/FinSight' },
  },
  {
    image: '/images/통신판매사업자관리시스템.png',
    alt: 'Public Data Harvester 공공데이터 수집 관리 시스템',
    title: 'Public Data Harvester',
    description:
      '공공데이터 수집 및 관리 시스템으로, 법인 정보 검색, 회원 관리, 파일 관리, 대시보드, 법인정보 수집 및 Excel 내보내기 등의 핵심 기능을 제공',
    tech: [
      'Spring Boot',
      'JPA',
      'PostgreSQL',
      'Spring Security',
      'MinIO',
      'Redis',
      'JSP',
      'Spring Batch',
    ],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/public-data-harvester' },
  },
  {
    image: '/images/kafkakopanda.png',
    alt: 'Kafka Panda(kotlin 버전)',
    title: 'Kafka 모니터링 관리 플랫폼',
    description:
      '연결 관리, 토픽 관리, 메시지 처리, 실시간 모니터링, 알림 시스템을 통해 Kafka 인프라를 효율적으로 운영할 수 있는 웹 기반 솔루션',
    tech: ['Kotlin', 'Spring Boot', 'Kafka Client', 'H2/PostgreSQL', 'Vue 3', 'Swagger'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/KAFKA_KOPANDA' },
  },
]

export const otherProjects = [
  {
    image: '/images/sleekydz86Intro.png',
    alt: '포트폴리오 사이트',
    title: 'skylee.dev',
    description: '이 포트폴리오 사이트입니다. 주요 프로젝트와 경력 프로젝트를 소개합니다.',
    tech: ['React 19', 'Vite', 'React Router'],
    demo: null,
    code: null,
  },
  {
    image: '/images/의료.png',
    alt: '건강관리 시스템',
    title: '건강 정보 웹어플리케이션',
    description:
      '바이오 데이터를 활용하여 사용자의 건강 상태를 분석하고 ChatGPT API를 통한 건강 조언을 제공하는 MSA 기반 헬스케어 시스템',
    tech: ['Spring Boot', 'MyBatis', 'PostgreSQL', 'SpringCloud', 'JSP'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/healthcare_mono' },
  },
  {
    image: '/images/ko_voice.png',
    alt: 'Ko Voice 웹 애플리케이션',
    title: 'Ko Voice',
    description:
      'Kotlin + Spring Boot 기반 음성 메모 / STT·TTS 웹 애플리케이션으로, Groq API(Whisper STT, PlayAI TTS)를 활용해 음성-텍스트 변환 및 텍스트-음성 생성을 제공합니다.',
    tech: ['Kotlin', 'Spring Boot', 'Gradle', 'Thymeleaf', 'Apache HttpClient', 'JDK 21'],
    demo: { type: 'modal' },
    code: {
      type: 'link',
      href: 'https://github.com/skyleedevzero86/studyKotlin/tree/main/ko_voice',
    },
  },
  {
    image: '/images/voice_stack.png',
    alt: 'Voice Stack Qwen3-TTS 웹 애플리케이션',
    title: 'voice-stack',
    description:
      'Qwen3-TTS 기반 텍스트-음성 합성(TTS) 웹 애플리케이션입니다. CustomVoice·VoiceDesign·VoiceClone을 지원하며, Kotlin Spring Boot 백엔드와 Next.js 프론트엔드로 구성됩니다. 참조 음성 MinIO 업로드 및 WAV 스트리밍을 제공합니다.',
    tech: ['Kotlin', 'Spring Boot', 'Next.js', 'MinIO', 'React'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/voice-stack' },
  },
  {
    image: '/images/smartcampus.png',
    alt: 'SmartCampus 우리동네 중고거래 플랫폼',
    title: 'SmartCampus',
    description:
      'AI 기반 상품 설명·벡터 검색과 실시간 AI 채팅, 배치 메일을 지원하는 우리동네 중고거래 플랫폼입니다. market-api·market-chat·market-batch 마이크로서비스와 Next.js로 구성되며, Spring AI(GLM-4.7), MySQL, Redis, MinIO/S3를 활용합니다.',
    tech: ['Spring Boot', 'Next.js', 'Spring AI', 'MySQL', 'Redis', 'MinIO'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/SmartCampus' },
  },
  {
    image: '/images/health_mr.png',
    alt: 'Health_mr EMR 전자의무기록 시스템',
    title: 'Health_mr',
    description:
      'EMR(전자의무기록) 시스템 — Java/Spring Boot 기반 멀티모듈 백엔드. 임상(emr-clinical)·재무(emr-finance)·지원(emr-support) 도메인 분리, emr-core·emr-domain 공통 인프라로 구성되며, 예약·진료·처방·입원, 수가/결제·의료급여 연동, 게시판·근태·장비 연동 등을 지원합니다.',
    tech: ['Java 21', 'Spring Boot', 'JPA', 'JWT', 'QueryDSL', 'Gradle'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/Health_mr' },
  },
  {
    image: '/images/location_sample.png',
    alt: 'Location Sample 풀스택 위치 기반 서비스',
    title: 'Location Sample (expo-rn-map)',
    description:
      '위치 기반 메시지·위치 추적 풀스택 샘플. Backend(Kotlin + Spring Boot), Web(Vue 3 + Vite), Mobile(Expo/React Native) 구성. Clean Architecture/DDD 스타일, MySQL·REST API·지도·알림 지원.',
    tech: ['Kotlin', 'Spring Boot', 'Vue 3', 'Expo', 'React Native', 'MySQL'],
    demo: { type: 'modal' },
    code: { type: 'link', href: 'https://github.com/skyleedevzero86/expo-rn-map' },
  },
]
