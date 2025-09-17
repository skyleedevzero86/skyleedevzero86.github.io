let currentPage = 1;
const itemsPerPage = 6;
let totalPages = 0;

function initPagination() {
  const projectCards = document.querySelectorAll(".project-card-large");
  totalPages = Math.ceil(projectCards.length / itemsPerPage);

  const paginationNumbers = document.getElementById("paginationNumbers");
  paginationNumbers.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageNumber = document.createElement("div");
    pageNumber.className = "page-number";
    pageNumber.textContent = i;
    pageNumber.onclick = () => goToPage(i);
    paginationNumbers.appendChild(pageNumber);
  }

  const paginationContainer = document.querySelector(".pagination-container");
  if (paginationContainer) {
    paginationContainer.style.display = "flex";
  }

  showPage(1);
}

function showPage(page) {
  const projectCards = document.querySelectorAll(".project-card-large");
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  projectCards.forEach((card) => {
    card.classList.add("hide");
  });

  for (let i = startIndex; i < endIndex && i < projectCards.length; i++) {
    projectCards[i].classList.remove("hide");
  }

  document.querySelectorAll(".page-number").forEach((btn, index) => {
    btn.classList.toggle("active", index + 1 === page);
  });
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === totalPages;

  currentPage = page;
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages) {
    showPage(page);
  }
}

function changePage(direction) {
  const newPage = currentPage + direction;
  if (newPage >= 1 && newPage <= totalPages) {
    showPage(newPage);
  }
}

document.addEventListener("DOMContentLoaded", initPagination);

const projectData = {
  project1: {
    title: "광주 교육청 통합 예약 시스템",
    description: "전자정부 프레임워크 기반의 대규모 교육 예약 및 관리 시스템입니다. 교육 신청, 강사 관리, 배너 관리 등 다양한 기능을 제공합니다.",
    features: [
      "교육 프로그램 예약 및 관리",
      "강사 정보 관리 시스템", 
      "사용자 권한 관리",
      "통합 검색 기능",
      "배너 관리 시스템",
      "Excel 데이터 내보내기",
      "실시간 알림 시스템",
      "통계 및 리포트 생성",
      "모바일 반응형 지원",
      "다국어 지원",
      "사용자 피드백 시스템",
      "자동 예약 승인 시스템",
      "강의실 시설 관리",
      "교육 과정 추천 시스템"
    ],
    tech: ["Spring Boot", "MyBatis", "MySQL", "JavaScript", "jQuery", "Bootstrap"]
  },
  project2: {
    title: "공간 대여 관리 시스템",
    description: "회의실 및 강의실 대여 예약 및 관리 시스템입니다. 실시간 예약 현황 확인과 장비 관리 기능을 제공합니다.",
    features: [
      "실시간 공간 예약 시스템",
      "장비 관리 및 예약",
      "예약 현황 대시보드",
      "사용자별 예약 내역",
      "시간대별 예약 관리",
      "알림 시스템",
      "QR 코드 예약 확인",
      "예약 충돌 방지 시스템",
      "사용자 평가 시스템",
      "관리자 통계 대시보드",
      "실시간 채팅 지원",
      "예약 취소 및 변경",
      "시설 이용 현황 분석",
      "자동 청소 예약 시스템"
    ],
    tech: ["Spring Boot", "JPA", "Redis", "Vue.js", "WebSocket", "Docker"]
  },
  project3: {
    title: "통합 검색 시스템",
    description: "다양한 데이터 소스를 통합한 검색 엔진입니다. 메뉴, 게시판, 파일 등 모든 콘텐츠를 한 번에 검색할 수 있습니다.",
    features: [
      "통합 검색 인터페이스",
      "실시간 검색 제안",
      "카테고리별 필터링",
      "검색 결과 하이라이팅",
      "검색 통계 및 분석",
      "검색 히스토리 관리",
      "자동완성 기능",
      "검색 결과 정렬",
      "다국어 검색 지원",
      "검색 성능 최적화"
    ],
    tech: ["Elasticsearch", "Spring Boot", "Kafka", "Docker", "Nginx", "Logstash"]
  },
  project4: {
    title: "회원 관리 시스템",
    description: "JWT 기반 인증 및 권한 관리 시스템입니다. OAuth2 연동과 다양한 보안 기능을 제공합니다.",
    features: [
      "JWT 기반 인증",
      "OAuth2 소셜 로그인",
      "역할 기반 권한 관리",
      "비밀번호 암호화",
      "계정 잠금 기능",
      "로그인 이력 관리",
      "2단계 인증",
      "세션 관리",
      "API 키 관리",
      "사용자 프로필 관리"
    ],
    tech: ["Spring Security", "JWT", "OAuth2", "PostgreSQL", "BCrypt", "Redis"]
  },
  project5: {
    title: "데이터 분석 대시보드",
    description: "실시간 데이터 수집 및 분석을 위한 대시보드 시스템입니다. 다양한 차트와 그래프로 데이터를 시각화합니다.",
    features: [
      "실시간 데이터 수집",
      "인터랙티브 차트",
      "데이터 필터링",
      "알림 시스템",
      "데이터 내보내기",
      "사용자 커스터마이징",
      "대시보드 공유",
      "데이터 예측 분석",
      "성능 모니터링",
      "리포트 생성"
    ],
    tech: ["Spring Boot", "WebSocket", "Chart.js", "InfluxDB", "Grafana", "Kafka"]
  },
  project6: {
    title: "모바일 API 서버",
    description: "모바일 애플리케이션을 위한 RESTful API 서버입니다. 높은 성능과 확장성을 고려하여 설계되었습니다.",
    features: [
      "RESTful API 설계",
      "API 문서 자동화",
      "캐싱 전략",
      "API 버전 관리",
      "모니터링 및 로깅",
      "부하 분산",
      "API 게이트웨이",
      "Rate Limiting",
      "API 보안",
      "성능 최적화"
    ],
    tech: ["Spring Boot", "Swagger", "Redis", "Docker", "Kubernetes", "Prometheus"]
  },
  project7: {
    title: "온라인 쇼핑몰 시스템",
    description: "전자상거래 플랫폼으로 상품 관리, 주문 처리, 결제 시스템을 통합한 쇼핑몰입니다.",
    features: [
      "상품 등록 및 관리",
      "장바구니 기능",
      "주문 및 결제 처리",
      "회원 관리",
      "리뷰 시스템",
      "재고 관리",
      "쿠폰 시스템",
      "배송 추적",
      "고객 서비스",
      "매출 분석"
    ],
    tech: ["Spring Boot", "Spring Security", "JPA", "MySQL", "Redis", "React"]
  },
  project8: {
    title: "실시간 분석 플랫폼",
    description: "대용량 데이터를 실시간으로 처리하고 분석하는 플랫폼입니다. 다양한 차트와 대시보드를 제공합니다.",
    features: [
      "실시간 데이터 스트리밍",
      "데이터 시각화",
      "알림 시스템",
      "사용자 대시보드",
      "데이터 내보내기",
      "성능 모니터링",
      "머신러닝 통합",
      "데이터 파이프라인",
      "실시간 알림",
      "분석 리포트"
    ],
    tech: ["Spring Boot", "Kafka", "Elasticsearch", "Apache Flink", "Docker", "Kubernetes", "Grafana"]
  },
  project9: {
    title: "채팅 시스템",
    description: "실시간 채팅과 파일 공유가 가능한 웹 기반 채팅 시스템입니다. WebSocket을 활용한 실시간 통신을 구현했습니다.",
    features: [
      "실시간 채팅",
      "파일 공유",
      "그룹 채팅",
      "메시지 히스토리",
      "사용자 상태 표시",
      "알림 기능",
      "이모지 지원",
      "메시지 검색",
      "사용자 차단",
      "채팅방 관리"
    ],
    tech: ["Spring Boot", "WebSocket", "STOMP", "MongoDB", "Redis", "Vue.js"]
  },
  project10: {
    title: "문서 관리 시스템",
    description: "기업용 문서 관리 및 협업 플랫폼입니다. 버전 관리와 권한 제어를 통한 안전한 문서 공유가 가능합니다.",
    features: [
      "문서 업로드/다운로드",
      "버전 관리",
      "권한 제어",
      "검색 기능",
      "협업 도구",
      "알림 시스템",
      "문서 편집",
      "댓글 시스템",
      "문서 분류",
      "백업 및 복구"
    ],
    tech: ["Spring Boot", "Spring Security", "JPA", "PostgreSQL", "AWS S3", "Angular"]
  },
  project11: {
    title: "일정 관리 시스템",
    description: "개인 및 팀 일정을 효율적으로 관리할 수 있는 캘린더 기반 애플리케이션입니다.",
    features: [
      "일정 등록/수정/삭제",
      "반복 일정 설정",
      "팀 일정 공유",
      "알림 기능",
      "일정 검색",
      "데이터 내보내기",
      "일정 템플릿",
      "참석자 관리",
      "일정 통계",
      "모바일 동기화"
    ],
    tech: ["Spring Boot", "JPA", "MySQL", "Redis", "React", "FullCalendar"]
  },
  project12: {
    title: "게임 랭킹 시스템",
    description: "실시간 게임 점수와 랭킹을 관리하는 시스템입니다. 높은 성능과 확장성을 고려하여 설계되었습니다.",
    features: [
      "실시간 점수 업데이트",
      "랭킹 시스템",
      "리더보드",
      "사용자 프로필",
      "통계 분석",
      "API 제공",
      "시즌 시스템",
      "보상 시스템",
      "실시간 알림",
      "데이터 백업"
    ],
    tech: ["Spring Boot", "Redis", "MongoDB", "Docker", "Kubernetes", "Prometheus"]
  }
};

function showMoreFeatures(projectId) {
  const project = projectData[projectId];
  if (!project) return;

  document.getElementById('modalTitle').textContent = project.title;
  document.getElementById('modalDescription').textContent = project.description;
  
  const featureList = document.getElementById('modalFeatureList');
  featureList.innerHTML = '';
  project.features.forEach(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    featureList.appendChild(li);
  });
  
  const techContainer = document.getElementById('modalTechTags');
  techContainer.innerHTML = '';
  project.tech.forEach(tech => {
    const span = document.createElement('span');
    span.className = 'modal-tech-tag';
    span.textContent = tech;
    techContainer.appendChild(span);
  });
  
  document.getElementById('featureModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('featureModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
  const modal = document.getElementById('featureModal');
  if (event.target === modal) {
    closeModal();
  }
}