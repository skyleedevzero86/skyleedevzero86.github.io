function openFileUploadModal() {
  const modal = document.getElementById('fileUploadModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeFileUploadModal() {
  const modal = document.getElementById('fileUploadModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function setupModalCloseOnOutsideClick() {
  const modal = document.getElementById('fileUploadModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeFileUploadModal();
      }
    });
  }
}

function setupModalCloseOnEscape() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeFileUploadModal();
    }
  });
}