# 궁금하면500원 - 백엔드 개발자 포트폴리오

<img width="1877" height="903" alt="portfolio-preview" src="https://github.com/user-attachments/assets/48c6bfce-17e7-4976-aba9-21de1674911d" />

안녕하세요! 백엔드 개발자 **이경용**의 포트폴리오 사이트입니다.

## 🚀 프로젝트 소개

사용자 중심의 안정적인 백엔드 시스템을 구축하는 엔지니어로서, 다양한 기술 스택을 활용한 프로젝트들을 소개합니다.

## 🛠️ 기술 스택

### Frontend

- **HTML5** - 시맨틱 마크업
- **CSS3** - 반응형 디자인, Flexbox, Grid
- **JavaScript (ES6+),Typescript** - 모던 자바스크립트
- **Font Awesome** - 아이콘 라이브러리

### Backend

- **Java** - 5년 이상의 개발 경험
- **Spring Boot** - RESTful API 및 마이크로서비스 아키텍처
- **JPA/Hibernate** - 객체-관계 매핑
- **MyBatis** - SQL 매핑 및 동적 쿼리
- **Kotlin** - Spring Boot 애플리케이션 개발

### Database & Caching

- **MySQL** - 데이터베이스 설계 및 쿼리 최적화
- **PostgreSQL** - 고급 기능 및 JSON 데이터 타입
- **Redis** - 캐싱 전략 및 세션 관리
- **Oracle** - 대규모 시스템 구축

### Cloud & DevOps

- **AWS** - EC2, RDS, S3, Lambda 등 클라우드 인프라
- **Docker** - 컨테이너화 및 개발 환경 구축
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD 파이프라인
- **Jenkins** - 자동화 및 배포 시스템

### Tools & Others

- **Datadog** - 애플리케이션 모니터링
- **Shell Script** - 자동화 스크립트
- **Spring Batch** - 대용량 데이터 처리
- **DBeaver** - 데이터베이스 관리

## 📁 프로젝트 구조

```
skyleedevzero86.github.io/
├── css/
│   ├── style.css          # 메인 스타일시트
│   ├── index.css          # 홈페이지 스타일
│   ├── projects.css       # 프로젝트 페이지 스타일
│   └── skills.css         # 스킬 페이지 스타일
├── js/
│   ├── script.js          # 공통 JavaScript 기능
│   ├── index.js           # 홈페이지 기능
│   ├── projects.js        # 프로젝트 페이지 기능
│   ├── skills.js          # 스킬 페이지 기능
│   └── utils.js           # 유틸리티 함수
├── images/                # 프로젝트 이미지 리소스
├── index.html             # 메인 페이지
├── projects.html          # 프로젝트 상세 페이지
├── skills.html            # 기술 스택 페이지
├── favicon.ico            # 파비콘
├── .nojekyll              # Jekyll 비활성화
└── README.md              # 프로젝트 설명서
```

## 🎯 주요 프로젝트

메인 페이지에는 아래 10개 프로젝트가 페이지네이션(6개/페이지)으로 노출됩니다. 상세 목록은 [projects.html](https://skyleedevzero86.github.io/projects.html)에서 확인할 수 있습니다.

### 1. skylee.dev

- **기술**: Spring Boot, MyBatis, PostgreSQL, Kotlin, Next.js
- **설명**: 운영 중인 개인 포트폴리오 사이트. 주요 핵심 프로젝트 상세 소개.
- **링크**: [데모](https://skyleedevzero86.github.io/) | [GitHub](https://github.com/skyleedevzero86/)

### 2. 건강 정보 웹어플리케이션

- **기술**: Spring Boot, MyBatis, PostgreSQL, SpringCloud, JSP
- **설명**: 바이오 데이터 기반 건강 상태 분석, ChatGPT API 건강 조언, MSA 헬스케어 시스템.
- **링크**: [GitHub](https://github.com/skyleedevzero86/healthcare_mono)

### 3. Public Data Harvester

- **기술**: Spring Boot, JPA, PostgreSQL, Spring Security, MinIO, Redis, JSP, Spring Batch
- **설명**: 공공데이터 수집·관리, 법인 정보 검색, 회원/파일 관리, 대시보드, Excel 내보내기.
- **링크**: [GitHub](https://github.com/skyleedevzero86/public-data-harvester)

### 4. Kafka 모니터링 관리 플랫폼

- **기술**: Kotlin, Spring Boot, Kafka Client, H2/PostgreSQL, Vue 3, Swagger
- **설명**: 연결/토픽/메시지 관리, 실시간 모니터링, 알림을 통한 Kafka 인프라 운영 솔루션.
- **링크**: [GitHub](https://github.com/skyleedevzero86/KAFKA_KOPANDA)

### 5. Finsight

- **기술**: Spring Boot, MySQL, OAuth2, React 19, AI/ML, PyTorch
- **설명**: 미국 경제 뉴스 크롤링·AI 분석, SPY/QQQ/비트코인/Big7 영향 분석.
- **링크**: [GitHub](https://github.com/skyleedevzero86/FinSight)

### 6. Ko Voice

- **기술**: Kotlin, Spring Boot, Gradle, Thymeleaf, Apache HttpClient, JDK 21
- **설명**: 음성 메모 / STT·TTS 웹 앱. Groq API(Whisper STT, PlayAI TTS)로 음성↔텍스트 변환.
- **링크**: [GitHub](https://github.com/skyleedevzero86/studyKotlin/tree/main/ko_voice)

### 7. voice-stack

- **기술**: Kotlin, Spring Boot, Next.js, MinIO, React
- **설명**: Qwen3-TTS 기반 TTS 웹 앱. CustomVoice·VoiceDesign·VoiceClone, 참조 음성 MinIO 업로드·WAV 스트리밍.
- **링크**: [GitHub](https://github.com/skyleedevzero86/voice-stack)

### 8. SmartCampus

- **기술**: Spring Boot, Next.js, Spring AI, MySQL, Redis, MinIO
- **설명**: AI 기반 상품 설명·벡터 검색, 실시간 AI 채팅, 배치 메일. 우리동네 중고거래 플랫폼 (market-api·market-chat·market-batch MSA).
- **링크**: [GitHub](https://github.com/skyleedevzero86/SmartCampus)

### 9. Health_mr

- **기술**: Java 21, Spring Boot, JPA, JWT, QueryDSL, Gradle
- **설명**: EMR(전자의무기록) 멀티모듈 백엔드. 임상(emr-clinical)·재무(emr-finance)·지원(emr-support), emr-core·emr-domain 공통 인프라.
- **링크**: [GitHub](https://github.com/skyleedevzero86/Health_mr)

### 10. Location Sample (expo-rn-map)

- **기술**: Kotlin, Spring Boot, Vue 3, Expo, React Native, MySQL
- **설명**: 위치 기반 메시지·위치 추적 풀스택 샘플. Backend(Kotlin + Spring Boot), Web(Vue 3 + Vite), Mobile(Expo/React Native). Clean Architecture/DDD, REST API·지도·알림.
- **링크**: [GitHub](https://github.com/skyleedevzero86/expo-rn-map)

## 🌟 포트폴리오 특징

### 디자인 & UX

- **반응형 디자인** - 모든 디바이스에서 최적화된 경험
- **모던 UI/UX** - 깔끔하고 직관적인 인터페이스
- **인터랙티브 요소** - 스크롤 애니메이션 및 호버 효과
- **페이지네이션** - 프로젝트 목록 효율적 관리
- **모달 시스템** - 프로젝트 상세 정보 표시

### 기술적 특징

- **모듈화된 CSS** - 페이지별 스타일 분리
- **JavaScript 모듈** - 기능별 스크립트 분리
- **반응형 그리드** - CSS Grid와 Flexbox 활용
- **애니메이션** - CSS3 애니메이션과 JavaScript 효과
- **접근성** - 웹 접근성 가이드라인 준수

### 기능적 특징

- **프로젝트 필터링** - 기술 스택별 프로젝트 분류
- **상세 정보 모달** - 프로젝트별 상세 정보 표시
- **스킬 레벨 표시** - 기술 숙련도 시각화
- **경력 타임라인** - 경력 사항 시각적 표현
- **연락처 정보** - 다양한 연락 수단 제공

## 🚀 시작하기

### 로컬에서 실행하기

1. 저장소 클론

```bash
git clone https://github.com/skyleedevzero86/skyleedevzero86.github.io.git
cd skyleedevzero86.github.io
```

2. 브라우저에서 `index.html` 파일 열기

```bash
# 간단한 HTTP 서버 실행 (선택사항)
python -m http.server 8000
# 또는
npx serve .
```

3. 브라우저에서 `http://localhost:8000` 접속

### GitHub Pages를 통한 배포

- 자동 배포: `main` 브랜치에 푸시하면 자동으로 GitHub Pages에 배포
- 온라인 확인: https://skyleedevzero86.github.io

## 📱 반응형 지원

- **데스크톱**: 1200px 이상
- **태블릿**: 768px - 1024px
- **모바일**: 320px - 768px
- **초소형 모바일**: 320px 이하

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: #3498db (Blue)
- **Secondary**: #6c757d (Gray)
- **Success**: #27ae60 (Green)
- **Background**: #f8f9fa (Light Gray)
- **Text**: #2c3e50 (Dark Blue)

### 타이포그래피

- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
- **Headings**: 1.8rem - 3.5rem
- **Body**: 1rem - 1.2rem
- **Line Height**: 1.6

## 📞 연락처

- **이메일**: sleekydz86@naver.com
- **기술블로그**: [Velog](https://velog.io/@sleekydevzero86/posts)
- **학습블로그**: [네이버 블로그](https://blog.naver.com/sleekydz86)
- **GitHub**: [skyleedevzero86](https://github.com/skyleedevzero86)

## 📄 라이선스

이 프로젝트는 개인 포트폴리오 목적으로 제작되었습니다.

## 🔄 업데이트 이력

- **v1.0.0** - 초기 포트폴리오 사이트 구축
- **v1.1.0** - 프로젝트 상세 페이지 추가
- **v1.2.0** - 스킬 페이지 및 반응형 디자인 개선
- **v1.3.0** - 모달 시스템 및 인터랙션 개선
- **v1.4.0** - 주요 프로젝트 카드 추가 (Ko Voice, voice-stack, SmartCampus, Health_mr), 페이지네이션 6개/페이지 적용, Font Awesome CDN(cdnjs 6.5.1), README 주요 프로젝트 목록 현행화
- **v1.5.0** - Location Sample(expo-rn-map) 프로젝트 추가, README 주요 프로젝트 10개로 현행화

---

**"IT, 모두들 Information Technology라고 말씀하실 지 모릅니다.  
Inner Thoughtfulness, 유저를 마음으로부터 배려하는 프로그래밍.  
그것이 제가 앞으로 함께 펼쳐나가고 싶은 길입니다."**

_백엔드 개발자 이경용의 포트폴리오 사이트입니다._
