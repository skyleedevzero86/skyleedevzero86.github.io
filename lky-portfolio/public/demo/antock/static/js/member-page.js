function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'Icon');

  if (input.disabled) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('bi-eye');
    icon.classList.add('bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('bi-eye-slash');
    icon.classList.add('bi-eye');
  }
}

function checkPasswordStrength(password) {
  let strength = 0;
  let message = '';
  let requirements = [];

  if (password.length >= 8) {
    strength++;
  } else {
    requirements.push('8자 이상');
  }

  if (password.match(/[a-z]/)) {
    strength++;
  } else {
    requirements.push('영문 소문자');
  }

  if (password.match(/[A-Z]/)) {
    strength++;
  } else {
    requirements.push('영문 대문자');
  }

  if (password.match(/[0-9]/)) {
    strength++;
  } else {
    requirements.push('숫자');
  }

  if (password.match(/[!@#$%^&*(),.?":{}|<>_+=\[\]\\;'`~-]/)) {
    strength++;
  } else {
    requirements.push('특수문자');
  }

  return {
    strength: strength,
    message: getStrengthMessage(strength, requirements),
    requirements: requirements
  };
}

function getStrengthMessage(strength, requirements) {
  let message = '';
  let className = '';

  switch(strength) {
    case 0:
    case 1:
      message = '매우 약함';
      className = 'password-strength-weak';
      break;
    case 2:
      message = '약함';
      className = 'password-strength-fair';
      break;
    case 3:
      message = '보통';
      className = 'password-strength-good';
      break;
    case 4:
      message = '강함';
      className = 'password-strength-strong';
      break;
    case 5:
      message = '매우 강함';
      className = 'password-strength-very-strong';
      break;
  }

  if (requirements.length > 0) {
    message += ' (필요: ' + requirements.join(', ') + ')';
  }

  return { message, className };
}

function copyApiKey() {
  const apiKeyInput = document.getElementById('apiKey');
  if (!apiKeyInput) return;

  apiKeyInput.select();
  apiKeyInput.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(apiKeyInput.value).then(function() {
    const button = event.target.closest('button');
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check"></i>';
    button.classList.add('btn-success');
    button.classList.remove('btn-outline-secondary');

    setTimeout(() => {
      button.innerHTML = originalHtml;
      button.classList.remove('btn-success');
      button.classList.add('btn-outline-secondary');
    }, 1000);
  }).catch(function() {
    alert('API Key가 클립보드에 복사되었습니다.');
  });
}

function confirmWithdraw() {
  if (confirm('정말로 탈퇴하시겠습니까?\n\n탈퇴 시:\n- 계정 복구가 불가능합니다\n- 즉시 로그아웃됩니다')) {
    document.getElementById('withdrawForm').submit();
  }
}

function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('is-invalid');
      isValid = false;
    } else {
      field.classList.remove('is-invalid');
    }
  });

  return isValid;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePasswordConfirmation(newPasswordId, confirmPasswordId) {
  const newPassword = document.getElementById(newPasswordId);
  const confirmPassword = document.getElementById(confirmPasswordId);

  if (!newPassword || !confirmPassword) return;

  if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    confirmPassword.classList.add('is-invalid');
  } else {
    confirmPassword.classList.remove('is-invalid');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const newPasswordInput = document.getElementById('newPassword');
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', function() {
      if (this.disabled) return;

      const password = this.value;
      const strengthBar = document.getElementById('passwordStrength');
      const strengthText = document.getElementById('passwordStrengthText');

      if (strengthBar && strengthText) {
        const result = checkPasswordStrength(password);
        strengthBar.className = 'progress-bar ' + result.className;
        strengthText.textContent = result.message;
        strengthText.className = result.strength === 5 ? 'form-text text-success' : 'form-text text-warning';
      }
    });
  }

  const newPasswordConfirmInput = document.getElementById('newPasswordConfirm');
  if (newPasswordConfirmInput) {
    newPasswordConfirmInput.addEventListener('input', function() {
      if (this.disabled) return;
      validatePasswordConfirmation('newPassword', 'newPasswordConfirm');
    });
  }

  const passwordChangeForm = document.getElementById('passwordChangeForm');
  if (passwordChangeForm) {
    passwordChangeForm.addEventListener('submit', function(e) {
      const todayChangeCountValue = parseInt(document.querySelector('[data-today-change-count]')?.dataset.todayChangeCount || '0');

      if (todayChangeCountValue >= 3) {
        e.preventDefault();
        alert('오늘은 더 이상 비밀번호를 변경할 수 없습니다. (일일 3회 제한)');
        return false;
      }

      const newPassword = document.getElementById('newPassword');
      const confirmPassword = document.getElementById('newPasswordConfirm');

      if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
        e.preventDefault();
        alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        return false;
      }

      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+=\[\]\\;'`~-])[A-Za-z\d!@#$%^&*(),.?":{}|<>_+=\[\]\\;'`~-]{8,20}$/;
      if (newPassword && !passwordPattern.test(newPassword.value)) {
        e.preventDefault();
        alert('비밀번호는 8-20자이며, 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.');
        return false;
      }

      const submitButton = document.getElementById('submitButton');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>변경 중...';
      }
    });
  }

  const passwordFindForm = document.querySelector('form[action*="password/find"]');
  if (passwordFindForm) {
    passwordFindForm.addEventListener('submit', function(e) {
      const username = document.getElementById('username');
      const email = document.getElementById('email');

      if (username && username.value.trim() === '') {
        e.preventDefault();
        alert('사용자명을 입력해주세요.');
        username.focus();
        return false;
      }

      if (email && email.value.trim() === '') {
        e.preventDefault();
        alert('이메일 주소를 입력해주세요.');
        email.focus();
        return false;
      }

      if (email && !validateEmail(email.value)) {
        e.preventDefault();
        alert('올바른 이메일 형식을 입력해주세요.');
        email.focus();
        return false;
      }
    });

    const usernameInput = document.getElementById('username');
    if (usernameInput) {
      usernameInput.addEventListener('input', function() {
        this.value = this.value.trim();
      });
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.addEventListener('input', function() {
        this.value = this.value.trim().toLowerCase();
      });
    }
  }

  const joinForm = document.querySelector('form[action*="join"]');
  if (joinForm) {
    joinForm.addEventListener('submit', function(e) {
      console.log('Form submitted');
      const username = document.getElementById('username');
      const nickname = document.getElementById('nickname');
      const email = document.getElementById('email');

      if (username) console.log('Username:', username.value);
      if (nickname) console.log('Nickname:', nickname.value);
      if (email) console.log('Email:', email.value);
    });
  }

  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
});