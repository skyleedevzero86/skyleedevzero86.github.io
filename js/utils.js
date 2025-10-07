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
