let currentPage = 1;
const itemsPerPage = 6;
let totalPages = 0;

function initPagination() {
  const projectCards = document.querySelectorAll(".project-card");
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

  const paginationContainer = document.querySelector(
    ".pagination-container"
  );
  if (paginationContainer) {
    paginationContainer.style.display = "flex";
  }

  if (totalPages <= 1) {
    projectCards.forEach((card) => {
      card.classList.remove("hide");
    });
  } else {
    showPage(1);
  }
}

function showPage(page) {
  const projectCards = document.querySelectorAll(".project-card");
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

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}


const projectCards = document.querySelectorAll('.project-card');
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

const projectImages = document.querySelectorAll('.project-image');
projectImages.forEach(image => {
  image.addEventListener('click', () => {
    image.style.transform = 'scale(1.05)';
    image.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      image.style.transform = 'scale(1)';
    }, 300);
  });
});

const projectTitles = document.querySelectorAll('.project-content h3');
projectTitles.forEach(title => {
  title.addEventListener('click', () => {
    title.style.color = '#3498db';
    title.style.transition = 'color 0.3s ease';
    
    setTimeout(() => {
      title.style.color = '#2c3e50';
    }, 1000);
  });
});

const projectDescriptions = document.querySelectorAll('.project-content p');
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

const projectLinks = document.querySelectorAll('.project-link');
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

const skillItems = document.querySelectorAll('.skill-item');
skillItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(-8px) scale(1.05)';
    }
  });
  
  item.addEventListener('mouseleave', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(0) scale(1)';
    }
  });
});

const skillIcons = document.querySelectorAll('.skill-item i');
skillIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    icon.style.transform = 'rotate(360deg)';
    icon.style.transition = 'transform 0.5s ease';
    
    setTimeout(() => {
      icon.style.transform = 'rotate(0deg)';
    }, 500);
  });
});

const skillNames = document.querySelectorAll('.skill-item span');
skillNames.forEach(name => {
  name.addEventListener('click', () => {
    name.style.color = '#3498db';
    name.style.transition = 'color 0.3s ease';
    
    setTimeout(() => {
      name.style.color = '#2c3e50';
    }, 1000);
  });
});

const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(-8px) scale(1.02)';
    }
  });
  
  item.addEventListener('mouseleave', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(0) scale(1)';
    }
  });
});

const timelineDates = document.querySelectorAll('.timeline-date');
timelineDates.forEach(date => {
  date.addEventListener('click', () => {
    date.style.transform = 'scale(1.1)';
    date.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      date.style.transform = 'scale(1)';
    }, 300);
  });
});

const timelineContents = document.querySelectorAll('.timeline-content');
timelineContents.forEach(content => {
  content.addEventListener('click', () => {
    content.style.backgroundColor = '#f8f9fa';
    content.style.padding = '2.5rem';
    content.style.borderRadius = '12px';
    content.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      content.style.backgroundColor = 'white';
      content.style.padding = '2rem';
      content.style.borderRadius = '8px';
    }, 2000);
  });
});

const contactItems = document.querySelectorAll('.contact-item-simple');
contactItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(-8px) scale(1.02)';
    }
  });
  
  item.addEventListener('mouseleave', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(0) scale(1)';
    }
  });
});

const contactIcons = document.querySelectorAll('.contact-item-simple i');
contactIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    icon.style.transform = 'rotate(360deg)';
    icon.style.transition = 'transform 0.5s ease';
    
    setTimeout(() => {
      icon.style.transform = 'rotate(0deg)';
    }, 500);
  });
});

const contactLinks = document.querySelectorAll('.contact-item-simple a');
contactLinks.forEach(link => {
  link.addEventListener('click', () => {
    link.style.transform = 'scale(1.05)';
    link.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      link.style.transform = 'scale(1)';
    }, 300);
  });
});

const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  heroTitle.addEventListener('click', () => {
    heroTitle.style.transform = 'rotate(5deg)';
    heroTitle.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      heroTitle.style.transform = 'rotate(0deg)';
    }, 300);
  });
}

const heroDescription = document.querySelector('.hero-description');
if (heroDescription) {
  heroDescription.addEventListener('click', () => {
    heroDescription.style.backgroundColor = '#f8f9fa';
    heroDescription.style.padding = '1.5rem';
    heroDescription.style.borderRadius = '12px';
    heroDescription.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      heroDescription.style.backgroundColor = 'transparent';
      heroDescription.style.padding = '0';
      heroDescription.style.borderRadius = '0';
    }, 2000);
  });
}

const achievementText = document.querySelector('.achievement-text');
if (achievementText) {
  achievementText.addEventListener('click', () => {
    achievementText.style.backgroundColor = '#f8f9fa';
    achievementText.style.padding = '1.5rem';
    achievementText.style.borderRadius = '12px';
    achievementText.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      achievementText.style.backgroundColor = 'transparent';
      achievementText.style.padding = '0';
      achievementText.style.borderRadius = '0';
    }, 2000);
  });
}

const heroButtons = document.querySelectorAll('.btn');
heroButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 300);
  });
});

const codeLines = document.querySelectorAll('.code-line');
codeLines.forEach(line => {
  line.addEventListener('click', () => {
    line.style.transform = 'scale(1.05)';
    line.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      line.style.transform = 'scale(1)';
    }, 300);
  });
});

const aboutText = document.querySelector('.about-text');
if (aboutText) {
  aboutText.addEventListener('mouseenter', () => {
    if (!isMobile) {
      aboutText.style.transform = 'scale(1.02)';
      aboutText.style.transition = 'transform 0.3s ease';
    }
  });
  
  aboutText.addEventListener('mouseleave', () => {
    if (!isMobile) {
      aboutText.style.transform = 'scale(1)';
    }
  });
}

const aboutImage = document.querySelector('.about-image');
if (aboutImage) {
  aboutImage.addEventListener('click', () => {
    aboutImage.style.transform = 'scale(1.05)';
    aboutImage.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      aboutImage.style.transform = 'scale(1)';
    }, 300);
  });
}

const statItems = document.querySelectorAll('.stat-item');
statItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(-8px) scale(1.05)';
    }
  });
  
  item.addEventListener('mouseleave', () => {
    if (!isMobile) {
      item.style.transform = 'translateY(0) scale(1)';
    }
  });
});

const statNumbers = document.querySelectorAll('.stat-item h4');
statNumbers.forEach(number => {
  number.addEventListener('click', () => {
    number.style.color = '#e74c3c';
    number.style.transition = 'color 0.3s ease';
    
    setTimeout(() => {
      number.style.color = '#3498db';
    }, 1000);
  });
});

const sectionTitles = document.querySelectorAll('.section-title');
sectionTitles.forEach(title => {
  title.addEventListener('click', () => {
    title.style.transform = 'rotate(5deg)';
    title.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      title.style.transform = 'rotate(0deg)';
    }, 300);
  });
});

const skillsCategories = document.querySelectorAll('.skills-category');
skillsCategories.forEach(category => {
  category.addEventListener('mouseenter', () => {
    if (!isMobile) {
      category.style.transform = 'scale(1.02)';
      category.style.transition = 'transform 0.3s ease';
    }
  });
  
  category.addEventListener('mouseleave', () => {
    if (!isMobile) {
      category.style.transform = 'scale(1)';
    }
  });
});

const contactMessage = document.querySelector('.contact-message');
if (contactMessage) {
  contactMessage.addEventListener('click', () => {
    contactMessage.style.backgroundColor = '#e3f2fd';
    contactMessage.style.padding = '2rem';
    contactMessage.style.borderRadius = '15px';
    contactMessage.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      contactMessage.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
      contactMessage.style.padding = '1.5rem';
      contactMessage.style.borderRadius = '10px';
    }, 2000);
  });
}

// 데모 서비스 예정 팝업 모달 기능
function showDemoModal() {
  const modal = document.getElementById('demoModal');
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

function closeDemoModal() {
  const modal = document.getElementById('demoModal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  }
}

// 데모 버튼 클릭 이벤트 추가
document.addEventListener('DOMContentLoaded', () => {
  const demoButtons = document.querySelectorAll('a[href*="github.com"]');
  demoButtons.forEach(button => {
    if (button.textContent.includes('데모') || button.textContent.includes('Demo')) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        showDemoModal();
      });
    }
  });
});

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
  const modal = document.getElementById('demoModal');
  if (event.target === modal) {
    closeDemoModal();
  }
}