document.addEventListener('DOMContentLoaded', function() {
  if (typeof initializeDropdowns === 'function') {
    initializeDropdowns();
  }

  if (typeof setupEnterKeySubmit === 'function') {
    setupEnterKeySubmit();
  }

  if (typeof setupTableRowClick === 'function') {
    setupTableRowClick();
  }

  if (typeof setupCardAnimation === 'function') {
    setupCardAnimation();
  }

  if (typeof setupModalCloseOnOutsideClick === 'function') {
    setupModalCloseOnOutsideClick();
  }

  if (typeof setupModalCloseOnEscape === 'function') {
    setupModalCloseOnEscape();
  }

  if (typeof setupBizNoFormatting === 'function') {
    setupBizNoFormatting();
  }
});