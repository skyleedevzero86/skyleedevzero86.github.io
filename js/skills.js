const skillObserverOptions = {
  threshold: 0.5,
  rootMargin: "0px 0px -50px 0px",
};

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const progressBars = entry.target.querySelectorAll(".skill-progress");
      progressBars.forEach((bar) => {
        const width = bar.style.width;
        bar.style.width = "0%";
        setTimeout(() => {
          bar.style.width = width;
        }, 200);
      });
    }
  });
}, skillObserverOptions);

document.addEventListener('DOMContentLoaded', () => {
  const skillCategories = document.querySelectorAll(".skill-category");
  skillCategories.forEach((category) => {
    skillObserver.observe(category);
  });
});

if ('ontouchstart' in window) {
  document.body.classList.add('touch-device');
}

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
  document.body.classList.add('mobile-device');
}

window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    document.body.classList.add('mobile-view');
  } else {
    document.body.classList.remove('mobile-view');
  }
});

if (window.innerWidth <= 768) {
  document.body.classList.add('mobile-view');
}

document.addEventListener('touchstart', function() {}, {passive: true});

document.addEventListener('touchmove', function() {}, {passive: true});

const skillCards = document.querySelectorAll('.skill-card');
skillCards.forEach(card => {
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

const certCards = document.querySelectorAll('.cert-card');
certCards.forEach(card => {
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

const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.3,
  rootMargin: '0px 0px -50px 0px'
});

timelineItems.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  timelineObserver.observe(item);
});

const skillIcons = document.querySelectorAll('.skill-icon');
skillIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    icon.style.transform = 'rotate(360deg)';
    icon.style.transition = 'transform 0.5s ease';
    
    setTimeout(() => {
      icon.style.transform = 'rotate(0deg)';
    }, 500);
  });
});

const skillProgressBars = document.querySelectorAll('.skill-progress');
skillProgressBars.forEach(bar => {
  bar.addEventListener('click', () => {
    const currentWidth = bar.style.width;
    bar.style.width = '0%';
    bar.style.transition = 'width 1s ease';
    
    setTimeout(() => {
      bar.style.width = currentWidth;
    }, 100);
  });
});

const skillNames = document.querySelectorAll('.skill-name');
skillNames.forEach(name => {
  name.addEventListener('click', () => {
    name.style.color = '#3498db';
    name.style.transition = 'color 0.3s ease';
    
    setTimeout(() => {
      name.style.color = '#2c3e50';
    }, 1000);
  });
});

const skillDescriptions = document.querySelectorAll('.skill-description');
skillDescriptions.forEach(desc => {
  desc.addEventListener('click', () => {
    desc.style.backgroundColor = '#f8f9fa';
    desc.style.padding = '0.5rem';
    desc.style.borderRadius = '4px';
    desc.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      desc.style.backgroundColor = 'transparent';
      desc.style.padding = '0';
      desc.style.borderRadius = '0';
    }, 2000);
  });
});

const certIcons = document.querySelectorAll('.cert-icon');
certIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    icon.style.transform = 'scale(1.2)';
    icon.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      icon.style.transform = 'scale(1)';
    }, 300);
  });
});

const certNames = document.querySelectorAll('.cert-name');
certNames.forEach(name => {
  name.addEventListener('click', () => {
    name.style.color = '#3498db';
    name.style.transition = 'color 0.3s ease';
    
    setTimeout(() => {
      name.style.color = '#2c3e50';
    }, 1000);
  });
});

const skillCategories = document.querySelectorAll('.skill-category');
skillCategories.forEach(category => {
  const categoryTitle = category.querySelector('h2');
  if (categoryTitle) {
    categoryTitle.addEventListener('click', () => {
      categoryTitle.style.transform = 'scale(1.05)';
      categoryTitle.style.transition = 'transform 0.3s ease';
      
      setTimeout(() => {
        categoryTitle.style.transform = 'scale(1)';
      }, 300);
    });
  }
});

const skillGrids = document.querySelectorAll('.skill-grid');
skillGrids.forEach(grid => {
  grid.addEventListener('mouseenter', () => {
    if (!isMobile) {
      grid.style.transform = 'scale(1.02)';
      grid.style.transition = 'transform 0.3s ease';
    }
  });
  
  grid.addEventListener('mouseleave', () => {
    if (!isMobile) {
      grid.style.transform = 'scale(1)';
    }
  });
});

const certGrids = document.querySelectorAll('.cert-grid');
certGrids.forEach(grid => {
  grid.addEventListener('mouseenter', () => {
    if (!isMobile) {
      grid.style.transform = 'scale(1.02)';
      grid.style.transition = 'transform 0.3s ease';
    }
  });
  
  grid.addEventListener('mouseleave', () => {
    if (!isMobile) {
      grid.style.transform = 'scale(1)';
    }
  });
});

const skillsHeader = document.querySelector('.skills-header h1');
if (skillsHeader) {
  skillsHeader.addEventListener('click', () => {
    skillsHeader.style.transform = 'rotate(5deg)';
    skillsHeader.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      skillsHeader.style.transform = 'rotate(0deg)';
    }, 300);
  });
}

const skillsDescription = document.querySelector('.skills-header p');
if (skillsDescription) {
  skillsDescription.addEventListener('click', () => {
    skillsDescription.style.backgroundColor = '#f8f9fa';
    skillsDescription.style.padding = '1rem';
    skillsDescription.style.borderRadius = '8px';
    skillsDescription.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      skillsDescription.style.backgroundColor = 'transparent';
      skillsDescription.style.padding = '0';
      skillsDescription.style.borderRadius = '0';
    }, 2000);
  });
}

const experienceTimeline = document.querySelector('.experience-timeline');
if (experienceTimeline) {
  experienceTimeline.addEventListener('mouseenter', () => {
    if (!isMobile) {
      experienceTimeline.style.transform = 'scale(1.01)';
      experienceTimeline.style.transition = 'transform 0.3s ease';
    }
  });
  
  experienceTimeline.addEventListener('mouseleave', () => {
    if (!isMobile) {
      experienceTimeline.style.transform = 'scale(1)';
    }
  });
}

const certifications = document.querySelector('.certifications');
if (certifications) {
  certifications.addEventListener('mouseenter', () => {
    if (!isMobile) {
      certifications.style.transform = 'scale(1.01)';
      certifications.style.transition = 'transform 0.3s ease';
    }
  });
  
  certifications.addEventListener('mouseleave', () => {
    if (!isMobile) {
      certifications.style.transform = 'scale(1)';
    }
  });
}