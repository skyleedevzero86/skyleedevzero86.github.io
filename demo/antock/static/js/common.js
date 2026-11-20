function resetForm() {
  const form = document.querySelector('.search-form');
  if (form) {
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], select');
    inputs.forEach(input => {
      input.value = '';
    });
  }
}

function formatBizNo(input) {
  let value = input.value.replace(/[^0-9]/g, "");
  if (value.length <= 10) {
    if (value.length > 5) {
      value = value.substring(0, 3) + "-" + value.substring(3, 5) + "-" + value.substring(5);
    } else if (value.length > 3) {
      value = value.substring(0, 3) + "-" + value.substring(3);
    }
    input.value = value;
  }
}

function goToPage(pageNum) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", pageNum);
  if (!params.has("size")) params.set("size", "20");
  if (!params.has("sort")) params.set("sort", "id,desc");
  window.location.search = params.toString();
}

function getCsrfToken() {
  const token = document.querySelector('meta[name="_csrf"]');
  return token ? token.getAttribute("content") : null;
}

function getCsrfHeader() {
  const header = document.querySelector('meta[name="_csrf_header"]');
  return header ? header.getAttribute("content") : null;
}

function confirmDelete(message, callback) {
  if (confirm(message)) {
    callback();
  }
}

function deleteCorp(corpId, bizNm) {
  confirmDelete(`'${bizNm}' 법인을 삭제하시겠습니까?`, function() {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/corp/delete/${corpId}`;
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "_csrf";
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }
    document.body.appendChild(form);
    form.submit();
  });
}

function viewDetail(corpId) {
  window.location.href = __antockUrl("/corp/detail/" + corpId);
}

function editCorp(corpId) {
  window.location.href = __antockUrl("/corp/modify/" + corpId);
}

function searchSimilar() {
  alert("유사 법인 검색 기능을 구현해주세요.");
}

function exportCorpInfo() {
  alert("법인 정보 내보내기 기능을 구현해주세요.");
}

function goBack() {
  history.back();
}

function initializeProgressBars() {
  const progressBars = document.querySelectorAll('.progress-bar[data-width]');
  progressBars.forEach(bar => {
    const width = bar.getAttribute('data-width');
    if (width) {
      bar.style.width = width + '%';
    }
  });
}

function initializeDropdowns() {
  const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
  const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl);
  });
  const dropdownMenus = document.querySelectorAll('.dropdown-menu');
  dropdownMenus.forEach(menu => {
    menu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const dropdownMenu = this.nextElementSibling;
      if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
        const isOpen = dropdownMenu.classList.contains('show');
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          if (menu !== dropdownMenu) {
            menu.classList.remove('show');
          }
        });
        if (isOpen) {
          dropdownMenu.classList.remove('show');
        } else {
          dropdownMenu.classList.add('show');
        }
      }
    });
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initializeProgressBars();
  initializeDropdowns();
});