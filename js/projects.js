let currentPage = 1;
const itemsPerPage = 6;
let totalPages = 0;

function initPagination() {
  const projectCards = document.querySelectorAll(".project-card-large");
  totalPages = Math.ceil(projectCards.length / itemsPerPage);

  const paginationNumbers = document.getElementById("paginationNumbers");
  if (paginationNumbers) {
    paginationNumbers.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const pageNumber = document.createElement("div");
      pageNumber.className = "page-number";
      pageNumber.textContent = i;
      pageNumber.onclick = () => goToPage(i);
      paginationNumbers.appendChild(pageNumber);
    }
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

  if (prevBtn) prevBtn.disabled = page === 1;
  if (nextBtn) nextBtn.disabled = page === totalPages;

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
       title: "전남대학교 병원 의료 통합 지원 시스템",
    description: "적용한 임상시험 데이터와 운영 관리 기능을 표준화된 프로세스 제공으로 업무효율 향상 제공합니다.",
    features: [
      "IRB 심의관리",
      "임상연구관리",
      "전임상 실험관리",
      "생물안전위원회",
      "인체자원관리위원회",
      "연구비 중앙관리",
      "구매/물품 자산관리",
      "통계 및 분석",
      "알림 및 커뮤니케이션",
      "파일 및 문서 관리",
      "지적재산관리",
      "인사급여관리"
    ],
    tech: ["SpringFramework(egov)", "Report Designer", "SmartGwT", "Servlet", "Jsp", "Oracle","MyBatis"]
  },
  project2: {
    title: "서울 보라매병원 의료 통합 지원 시스템",
    description: "적용한 임상시험 데이터와 운영 관리 기능을 표준화된 프로세스 제공으로 업무효율 향상 제공합니다.",
    features: [
      "IRB 심의관리",
      "임상연구관리",
      "전임상 실험관리",
      "생물안전위원회",
      "인체자원관리위원회",
      "연구비 중앙관리",
      "구매/물품 자산관리",
      "통계 및 분석",
      "알림 및 커뮤니케이션",
      "파일 및 문서 관리",
      "지적재산관리",
      "인사급여관리"
    ],
    tech: ["SpringFramework(egov)", "Report Designer", "SmartGwT", "Servlet", "Jsp", "Oracle","MyBatis"]
  },
  project3: {
      title: "부산대학교 IRB시스템",
    description: "IRB(기관생명윤리위원회) 관리 시스템으로, 연구윤리 및 생명윤리 관련 업무를 종합적으로 관리하는 시스템입니다.",
    features: [
      "IRB 심의 관리",
      "연구보고서 관리",
      "데이터 필터링",
      "알림 시스템",
      "데이터 내보내기",
      "시스템 커스터마이징",
      "대시보드 공유",
      "데이터 예측 분석",
      "위반사항 및 품질관리",
      "교육 및 인증"
    ],
    tech: ["SpringFramework(egov)", "AdobeFlex", "SmartGwT", "Servlet", "Jsp", "Oracle","MyBatis"]
  },
  project4: {
    title: "중앙대학교 IRB시스템",
   description: "IRB(기관생명윤리위원회) 관리 시스템으로, 연구윤리 및 생명윤리 관련 업무를 종합적으로 관리하는 시스템입니다.",
    features: [
      "의뢰사관리시스템",
      "결제시스템 관리",
      "IRB 심의 관리",
      "역할 기반 권한 관리",
      "연구보고서 관리",
      "교육 및 인증",
      "로그인 이력 관리",
      "실험실 관리",
      "통계 및 분석",
      "알림 및 커뮤니케이션",
      "파일 및 문서 관리"
    ],
    tech: ["SpringFramework(egov)", "AdobeFlex", "SmartGwT", "Servlet", "Jsp", "Oracle","MyBatis"]
  },
  project5: {
    title: "부산대학교 IRB시스템",
    description: "IRB(기관생명윤리위원회) 관리 시스템으로, 연구윤리 및 생명윤리 관련 업무를 종합적으로 관리하는 시스템입니다.",
    features: [
      "IRB 심의 관리",
      "연구보고서 관리",
      "데이터 필터링",
      "알림 시스템",
      "데이터 내보내기",
      "시스템 커스터마이징",
      "대시보드 공유",
      "데이터 예측 분석",
      "위반사항 및 품질관리",
      "교육 및 인증"
    ],
    tech: ["SpringFramework(egov)", "AdobeFlex", "SmartGwT", "Servlet", "Jsp", "Oracle","MyBatis"]
  },
  project6: {
    title: "한국식품산업클러스터진흥원 통합관리시스템",
    description: "식품산업 클러스터의 다양한 이해관계자 를 위한 통합 플랫폼으로, 기업지원부터 연구과제 관리, 장비 공유까지 포괄적인 업무를 지원합니다.",
    features: [
      "RESTful API 설계",
      "통합 포털 메인화면",
      "캐싱 전략",
      "Excel 데이터 처리",
      "사용자 권한별 맞춤형 대시보드",
      "공지사항 및 모집공고 관리",
      "부하 분산",
      "회원 인증 및 권한 관리",
      "기업지원 시스템",
      "연구과제 시스템",
      "시스템 관리",
      "장비관리 시스템"
    ],
     tech: ["SpringFrameWork(egov)", "MyBatis", "MySQL", "jQuery", "EhCache", "Quartz","JSP"]
  },
  project7: {
    title: "곡성군청 메인 홈페이지",
    description: "곡성군청 홈페이지는 곡성군의 공식 기관 사이트로, 군정 소식 제공, 민원 안내, 지역 정보, 관광 및 문화서비스, 참여 소통 등 다양한 기능을 갖추고 있습니다.",
    features: [
      "군정 안내 및 정보 제공",
      "민원 서비스",
      "주분야별 정보",
      "정보공개 및 참여",
      "특화 서비스",
      "관광섹션",
      "지역 활성화 지원",
      "생활 지원 안내",
      "고객 서비스",
      "실생활 정보 제공"
    ],
    tech: ["SpringFrameWork(egov)", "MyBatis", "MySQL", "jQuery", "EhCache", "Quartz","JSP"]
  },
  project8: {
    title: "고객 상담 센터 관리 시스템",
    description: "대용량 고객 상담 데이터를 실시간으로 처리하고 분석하는 통합 관리 플랫폼입니다. CTI 연동, 캠페인 관리, 상담 기록 관리 등 다양한 기능을 제공합니다.",
    features: [
      "실시간 CTI 연동",
      "캠페인 관리",
      "상담 관리",
      "고객 정보 관리",
      "조직도 관리",
      "통계 및 리포트",
      "메시지 관리",
      "권한 관리",
      "지식 관리",
      "모니터링"
    ],
    tech: ["SpringFrameWork(egov)","MyBatis","Oracle", "JavaScript/jQuery", "JSP", "WebSocket", "Apache POI", "Log4j2"]
  },
  project9: {
    title: "시험분석 의뢰 서비스",
    description: "식품기업의 제품개발과 수출을 위한 시험분석 의뢰 및 관리 시스템입니다. 안전성평가, 기능성 평가, 패키징 설계 분석을 통한 고부가가치 건강기능식품과 수출지향적 포장 개발을 지원합니다.",
    features: [
      "시험분석 의뢰 관리",
      "진행 상태 추적",
      "성적서 관리",
      "회원 및 업체 관리",
      "게시판 및 공지사항",
      "시스템 관리",
      "이모지 지원",
      "메시지 검색",
      "사용자 차단",
      "채팅방 관리"
    ],
    tech: ["Spring Framework(egov)", "WebSocket", "STOMP", "Oracle", "Jsp", "Python","Apache Tiles","AES256/SHA512 암호화"]
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

  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const featureList = document.getElementById('modalFeatureList');
  const techContainer = document.getElementById('modalTechTags');
  const modal = document.getElementById('featureModal');

  if (modalTitle) modalTitle.textContent = project.title;
  if (modalDescription) modalDescription.textContent = project.description;
  
  if (featureList) {
    featureList.innerHTML = '';
    project.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      featureList.appendChild(li);
    });
  }
  
  if (techContainer) {
    techContainer.innerHTML = '';
    project.tech.forEach(tech => {
      const span = document.createElement('span');
      span.className = 'modal-tech-tag';
      span.textContent = tech;
      techContainer.appendChild(span);
    });
  }
  
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 10);
  }
}

function toggleFeatureList(projectId) {
  console.log('toggleFeatureList called with:', projectId);
  
  const project = projectData[projectId];
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }

  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const featureList = document.getElementById('modalFeatureList');
  const techContainer = document.getElementById('modalTechTags');
  const modal = document.getElementById('featureModal');

  if (modalTitle) modalTitle.textContent = project.title + ' - 주요 기능';
  if (modalDescription) modalDescription.textContent = project.description;
  
  if (featureList) {
    featureList.innerHTML = '';
    project.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      featureList.appendChild(li);
    });
  }
  
  if (techContainer) {
    techContainer.innerHTML = '';
    project.tech.forEach(tech => {
      const span = document.createElement('span');
      span.className = 'modal-tech-tag';
      span.textContent = tech;
      techContainer.appendChild(span);
    });
  }
  
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 10);
  }
}

function closeModal() {
  const modal = document.getElementById('featureModal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  }
}

window.onclick = function(event) {
  const modal = document.getElementById('featureModal');
  if (event.target === modal) {
    closeModal();
  }
}


const projectCards = document.querySelectorAll('.project-card-large');
projectCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    if (!isMobile) {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    }
  });
  
  card.addEventListener('mouseleave', () => {
    if (!isMobile) {
      card.style.transform = 'translateY(0) scale(1)';
    }
  });
});

const projectImages = document.querySelectorAll('.project-image-large');
projectImages.forEach(image => {
  image.addEventListener('click', () => {
    image.style.transform = 'scale(1.05)';
    image.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      image.style.transform = 'scale(1)';
    }, 300);
  });
});

const projectTitles = document.querySelectorAll('.project-content-large h3');
projectTitles.forEach(title => {
  title.addEventListener('click', () => {
    title.style.color = '#3498db';
    title.style.transition = 'color 0.3s ease';
    
    setTimeout(() => {
      title.style.color = '#2c3e50';
    }, 1000);
  });
});

const projectDescriptions = document.querySelectorAll('.project-content-large p');
projectDescriptions.forEach(desc => {
  desc.addEventListener('click', () => {
    desc.style.backgroundColor = '#f8f9fa';
    desc.style.padding = '1rem';
    desc.style.borderRadius = '8px';
    desc.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      desc.style.backgroundColor = 'transparent';
      desc.style.padding = '0';
      desc.style.borderRadius = '0';
    }, 2000);
  });
});

const showMoreBtns = document.querySelectorAll('.show-more-btn');
showMoreBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 300);
  });
});

const projectLinks = document.querySelectorAll('.project-link-large');
projectLinks.forEach(link => {
  link.addEventListener('click', () => {
    link.style.transform = 'scale(1.05)';
    link.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      link.style.transform = 'scale(1)';
    }, 300);
  });
});

const paginationBtns = document.querySelectorAll('.pagination-btn');
paginationBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 300);
  });
});

const pageNumbers = document.querySelectorAll('.page-number');
pageNumbers.forEach(number => {
  number.addEventListener('click', () => {
    number.style.transform = 'scale(1.2)';
    number.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      number.style.transform = 'scale(1)';
    }, 300);
  });
});

const statCards = document.querySelectorAll('.stat-card');
statCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    if (!isMobile) {
      card.style.transform = 'translateY(-8px) scale(1.05)';
    }
  });
  
  card.addEventListener('mouseleave', () => {
    if (!isMobile) {
      card.style.transform = 'translateY(0) scale(1)';
    }
  });
});

const projectHeader = document.querySelector('.project-header h1');
if (projectHeader) {
  projectHeader.addEventListener('click', () => {
    projectHeader.style.transform = 'rotate(5deg)';
    projectHeader.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      projectHeader.style.transform = 'rotate(0deg)';
    }, 300);
  });
}

const projectDescription = document.querySelector('.project-header p');
if (projectDescription) {
  projectDescription.addEventListener('click', () => {
    projectDescription.style.backgroundColor = '#f8f9fa';
    projectDescription.style.padding = '1rem';
    projectDescription.style.borderRadius = '8px';
    projectDescription.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      projectDescription.style.backgroundColor = 'transparent';
      projectDescription.style.padding = '0';
      projectDescription.style.borderRadius = '0';
    }, 2000);
  });
}

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
  statsSection.addEventListener('mouseenter', () => {
    if (!isMobile) {
      statsSection.style.transform = 'scale(1.01)';
      statsSection.style.transition = 'transform 0.3s ease';
    }
  });
  
  statsSection.addEventListener('mouseleave', () => {
    if (!isMobile) {
      statsSection.style.transform = 'scale(1)';
    }
  });
}