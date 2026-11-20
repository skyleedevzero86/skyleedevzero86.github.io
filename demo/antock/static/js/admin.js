function filterByStatus(status) {
  const url = new URL(window.location);
  if (status) {
    url.searchParams.set('status', status);
  } else {
    url.searchParams.delete('status');
  }
  url.searchParams.delete('page');
  window.location.href = __antockUrl(url.toString());
}

function filterByRole(role) {
  const url = new URL(window.location);
  if (role) {
    url.searchParams.set('role', role);
  } else {
    url.searchParams.delete('role');
  }
  url.searchParams.delete('page');
  window.location.href = __antockUrl(url.toString());
}

function clearFilters() {
  const url = new URL(window.location);
  url.searchParams.delete('status');
  url.searchParams.delete('role');
  url.searchParams.delete('page');
  window.location.href = __antockUrl(url.toString());
}

function confirmAction(action, memberName, actionType) {
  const messages = {
    approve: `이 회원을 승인하시겠습니까?`,
    reject: `이 회원을 거부하시겠습니까?`,
    suspend: `해당 회원의 계정을 정지하시겠습니까?\n\n• 즉시 로그인이 불가능해집니다\n• 관리자가 직접 해제할 때까지 정지됩니다`,
    unlock: `이 회원의 계정 정지를 해제하시겠습니까?\n\n• 로그인 실패 횟수가 초기화됩니다\n• 계정 잠금이 해제됩니다\n• 상태가 승인됨으로 변경됩니다`,
    resetToPending: `이 회원을 승인 대기 상태로 되돌리시겠습니까?\n\n• 상태가 승인 대기로 변경됩니다\n• 다시 승인 과정을 거쳐야 합니다`,
    delete: `정말로 삭제(탈퇴) 처리하시겠습니까?`,
    roleChange: `해당 회원의 권한을 '${actionType}'로 변경하시겠습니까?`
  };

  const message = messages[action] || `이 작업을 수행하시겠습니까?`;
  return confirm(message);
}

function submitFormWithLoading(form, buttonText = '처리 중...') {
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${buttonText}`;

    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }, 5000);
  }
}

function setupAutoRefresh(interval = 30000) {
  const autoRefreshCheckbox = document.getElementById('autoRefresh');
  let refreshInterval;

  if (autoRefreshCheckbox) {
    autoRefreshCheckbox.addEventListener('change', function() {
      if (this.checked) {
        refreshInterval = setInterval(() => {
          window.location.reload();
        }, interval);
      } else {
        clearInterval(refreshInterval);
      }
    });
  }
}

function selectAllMembers(checkbox) {
  const memberCheckboxes = document.querySelectorAll('.member-checkbox');
  memberCheckboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });
  updateBulkActionButtons();
}

function updateBulkActionButtons() {
  const selectedCheckboxes = document.querySelectorAll('.member-checkbox:checked');
  const bulkActionButtons = document.querySelectorAll('.bulk-action-btn');

  bulkActionButtons.forEach(btn => {
    btn.disabled = selectedCheckboxes.length === 0;
  });
}

function performBulkAction(action) {
  const selectedCheckboxes = document.querySelectorAll('.member-checkbox:checked');
  if (selectedCheckboxes.length === 0) {
    alert('선택된 회원이 없습니다.');
    return;
  }

  const memberIds = Array.from(selectedCheckboxes).map(cb => cb.value);
  const actionMessages = {
    approve: '선택된 회원들을 승인하시겠습니까?',
    reject: '선택된 회원들을 거부하시겠습니까?',
    suspend: '선택된 회원들을 정지하시겠습니까?'
  };

  if (!confirm(actionMessages[action] || '이 작업을 수행하시겠습니까?')) {
    return;
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `/members/admin/bulk/${action}`;

  const csrfToken = document.querySelector('meta[name="_csrf"]');
  if (csrfToken) {
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = csrfToken.getAttribute('content');
    csrfInput.value = csrfToken.getAttribute('content');
    form.appendChild(csrfInput);
  }

  memberIds.forEach(id => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'memberIds';
    input.value = id;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

function setupSearch() {
  const searchInput = document.getElementById('memberSearch');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(this.value);
      }, 500);
    });
  }
}

function performSearch(query) {
  const url = new URL(window.location);
  if (query.trim()) {
    url.searchParams.set('search', query.trim());
  } else {
    url.searchParams.delete('search');
  }
  url.searchParams.delete('page');
  window.location.href = __antockUrl(url.toString());
}

function exportMembers(format = 'excel') {
  const url = new URL(window.location);
  url.searchParams.set('export', format);
  window.open(url.toString(), '_blank');
}

document.addEventListener('DOMContentLoaded', function() {
  const statusFilter = document.getElementById('statusFilter');
  const roleFilter = document.getElementById('roleFilter');

  if (statusFilter && statusFilter.value) {
    statusFilter.classList.add('filter-active');
  }

  if (roleFilter && roleFilter.value) {
    roleFilter.classList.add('filter-active');
  }

  const memberCheckboxes = document.querySelectorAll('.member-checkbox');
  memberCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateBulkActionButtons);
  });

  const selectAllCheckbox = document.getElementById('selectAll');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      selectAllMembers(this);
    });
  }

  document.querySelectorAll("tbody tr").forEach((row) => {
    row.addEventListener("click", function (e) {
      if (
          e.target.closest("button") ||
          e.target.closest("a") ||
          e.target.closest("form") ||
          e.target.closest("input")
      ) {
        return;
      }

      document
          .querySelectorAll("tbody tr")
          .forEach((r) => r.classList.remove("table-active"));

      this.classList.add("table-active");
    });
  });

  setupAutoRefresh();
  setupSearch();

  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

  document.querySelectorAll('form[method="post"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitButton = this.querySelector('button[type="submit"]');
      if (submitButton && !submitButton.disabled) {
        submitFormWithLoading(this);
      }
    });
  });

  document.querySelectorAll('form[action*="/delete"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirm('정말로 삭제(탈퇴) 처리하시겠습니까?')) {
        e.preventDefault();
        return false;
      }
    });
  });

  document.querySelectorAll('form[action*="/role"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      const role = this.action.split('role=')[1];
      if (!confirmAction('roleChange', '', role)) {
        e.preventDefault();
        return false;
      }
    });
  });

  document.querySelectorAll('form[action*="/approve"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirmAction('approve')) {
        e.preventDefault();
        return false;
      }
    });
  });

  document.querySelectorAll('form[action*="/reject"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirmAction('reject')) {
        e.preventDefault();
        return false;
      }
    });
  });

  document.querySelectorAll('form[action*="/suspend"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirmAction('suspend')) {
        e.preventDefault();
        return false;
      }
    });
  });

  document.querySelectorAll('form[action*="/unlock"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirmAction('unlock')) {
        e.preventDefault();
        return false;
      }
    });
  });

  document.querySelectorAll('form[action*="/reset-to-pending"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirmAction('resetToPending')) {
        e.preventDefault();
        return false;
      }
    });
  });
});