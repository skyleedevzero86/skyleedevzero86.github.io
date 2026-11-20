document.addEventListener('DOMContentLoaded', function() {
    initMemberPage();
});

function initMemberPage() {
    initLoginForm();
    initRegisterForm();
    initPasswordChangeForm();
    initPasswordFindForm();
    initProfileForm();
    initAdminPage();
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        if (!validateLoginForm()) {
            e.preventDefault();
        }
    });

    const inputs = loginForm.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateLoginForm() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');

    let isValid = true;

    if (!username || !username.value.trim()) {
        showFieldError(username, '아이디를 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError(username);
    }

    if (!password || !password.value.trim()) {
        showFieldError(password, '비밀번호를 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError(password);
    }

    return isValid;
}

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', function(e) {
        if (!validateRegisterForm()) {
            e.preventDefault();
        }
    });

    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            checkUsernameAvailability(this.value);
        });
    }

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch(passwordInput.value, this.value);
        });
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this.value);
        });
    }
}

function validateRegisterForm() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const email = document.getElementById('email');
    const name = document.getElementById('name');

    let isValid = true;

    if (!username || !username.value.trim()) {
        showFieldError(username, '아이디를 입력해주세요.');
        isValid = false;
    } else if (username.value.length < 4) {
        showFieldError(username, '아이디는 4자 이상이어야 합니다.');
        isValid = false;
    } else {
        clearFieldError(username);
    }

    if (!password || !password.value.trim()) {
        showFieldError(password, '비밀번호를 입력해주세요.');
        isValid = false;
    } else if (password.value.length < 8) {
        showFieldError(password, '비밀번호는 8자 이상이어야 합니다.');
        isValid = false;
    } else {
        clearFieldError(password);
    }

    if (!confirmPassword || !confirmPassword.value.trim()) {
        showFieldError(confirmPassword, '비밀번호 확인을 입력해주세요.');
        isValid = false;
    } else if (password && password.value !== confirmPassword.value) {
        showFieldError(confirmPassword, '비밀번호가 일치하지 않습니다.');
        isValid = false;
    } else {
        clearFieldError(confirmPassword);
    }

    if (!email || !email.value.trim()) {
        showFieldError(email, '이메일을 입력해주세요.');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError(email, '올바른 이메일 형식이 아닙니다.');
        isValid = false;
    } else {
        clearFieldError(email);
    }

    if (!name || !name.value.trim()) {
        showFieldError(name, '이름을 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError(name);
    }

    return isValid;
}

function checkUsernameAvailability(username) {
    if (!username || username.length < 4) return;

    fetch(`/members/check-username?username=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(data => {
            const usernameInput = document.getElementById('username');
            if (data.available) {
                clearFieldError(usernameInput);
                showFieldSuccess(usernameInput, '사용 가능한 아이디입니다.');
            } else {
                showFieldError(usernameInput, '이미 사용 중인 아이디입니다.');
            }
        })
        .catch(error => {
            console.error('아이디 중복 확인 실패:', error);
        });
}

function validatePasswordMatch(password, confirmPassword) {
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (confirmPassword && password !== confirmPassword) {
        showFieldError(confirmPasswordInput, '비밀번호가 일치하지 않습니다.');
        return false;
    } else {
        clearFieldError(confirmPasswordInput);
        return true;
    }
}

function validateEmail(email) {
    const emailInput = document.getElementById('email');

    if (!isValidEmail(email)) {
        showFieldError(emailInput, '올바른 이메일 형식이 아닙니다.');
        return false;
    } else {
        clearFieldError(emailInput);
        return true;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initPasswordChangeForm() {
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (!passwordChangeForm) return;

    passwordChangeForm.addEventListener('submit', function(e) {
        if (!validatePasswordChangeForm()) {
            e.preventDefault();
        }
    });

    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = (document.getElementById('confirmNewPassword') || document.getElementById('newPasswordConfirm'));

    if (newPasswordInput && confirmNewPasswordInput) {
        confirmNewPasswordInput.addEventListener('input', function() {
            validatePasswordMatch(newPasswordInput.value, this.value);
        });
    }
}

function validatePasswordChangeForm() {
    const currentPassword = (document.getElementById('currentPassword') || document.getElementById('oldPassword'));
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = (document.getElementById('confirmNewPassword') || document.getElementById('newPasswordConfirm'));

    let isValid = true;

    if (!currentPassword || !currentPassword.value.trim()) {
        showFieldError(currentPassword, '현재 비밀번호를 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError(currentPassword);
    }

    if (!newPassword || !newPassword.value.trim()) {
        showFieldError(newPassword, '새 비밀번호를 입력해주세요.');
        isValid = false;
    } else if (newPassword.value.length < 8) {
        showFieldError(newPassword, '비밀번호는 8자 이상이어야 합니다.');
        isValid = false;
    } else {
        clearFieldError(newPassword);
    }

    if (!confirmNewPassword || !confirmNewPassword.value.trim()) {
        showFieldError(confirmNewPassword, '새 비밀번호 확인을 입력해주세요.');
        isValid = false;
    } else if (newPassword && newPassword.value !== confirmNewPassword.value) {
        showFieldError(confirmNewPassword, '비밀번호가 일치하지 않습니다.');
        isValid = false;
    } else {
        clearFieldError(confirmNewPassword);
    }

    return isValid;
}

function initPasswordFindForm() {
    const passwordFindForm = document.getElementById('passwordFindForm');
    if (!passwordFindForm) return;

    passwordFindForm.addEventListener('submit', function(e) {
        if (!validatePasswordFindForm()) {
            e.preventDefault();
        }
    });
}

function validatePasswordFindForm() {
    const email = document.getElementById('email');

    let isValid = true;

    if (!email || !email.value.trim()) {
        showFieldError(email, '이메일을 입력해주세요.');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError(email, '올바른 이메일 형식이 아닙니다.');
        isValid = false;
    } else {
        clearFieldError(email);
    }

    return isValid;
}

function initProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    profileForm.addEventListener('submit', function(e) {
        if (!validateProfileForm()) {
            e.preventDefault();
        }
    });

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this.value);
        });
    }
}

function validateProfileForm() {
    const email = document.getElementById('email');
    const name = document.getElementById('name');

    let isValid = true;

    if (!email || !email.value.trim()) {
        showFieldError(email, '이메일을 입력해주세요.');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError(email, '올바른 이메일 형식이 아닙니다.');
        isValid = false;
    } else {
        clearFieldError(email);
    }

    if (!name || !name.value.trim()) {
        showFieldError(name, '이름을 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError(name);
    }

    return isValid;
}

function initAdminPage() {
    initMemberApproval();
    initMemberSearch();
    initMemberFilter();
}

function initMemberApproval() {
    const approveButtons = document.querySelectorAll('.approve-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');

    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            approveMember(memberId);
        });
    });

    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            rejectMember(memberId);
        });
    });
}

function approveMember(memberId) {
    if (confirm('이 회원을 승인하시겠습니까?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/members/admin/approve/${memberId}`;

        const csrfToken = getCsrfToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        document.body.appendChild(form);
        form.submit();
    }
}

function rejectMember(memberId) {
    const reason = prompt('거부 사유를 입력해주세요:');
    if (reason) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/members/admin/reject/${memberId}`;

        const csrfToken = getCsrfToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        const reasonInput = document.createElement('input');
        reasonInput.type = 'hidden';
        reasonInput.name = 'reason';
        reasonInput.value = reason;
        form.appendChild(reasonInput);

        document.body.appendChild(form);
        form.submit();
    }
}

function initMemberSearch() {
    const searchInput = document.getElementById('memberSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            searchMembers(this.value);
        }, 300));
    }
}

function searchMembers(query) {
    if (query.length < 2) return;

    fetch(`/members/admin/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            updateMemberList(data);
        })
        .catch(error => {
            console.error('회원 검색 실패:', error);
        });
}

function updateMemberList(members) {
    const memberList = document.getElementById('memberList');
    if (!memberList) return;

    memberList.innerHTML = '';

    members.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div class="member-info">
                <h6>${member.name}</h6>
                <p>${member.email}</p>
            </div>
            <div class="member-actions">
                <button class="btn btn-sm btn-success approve-btn" data-member-id="${member.id}">
                    승인
                </button>
                <button class="btn btn-sm btn-danger reject-btn" data-member-id="${member.id}">
                    거부
                </button>
            </div>
        `;
        memberList.appendChild(memberItem);
    });
}

function initMemberFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            filterMembers(filterType);
        });
    });
}

function filterMembers(filterType) {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    const activeButton = document.querySelector(`[data-filter="${filterType}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    const memberItems = document.querySelectorAll('.member-item');
    memberItems.forEach(item => {
        const status = item.getAttribute('data-status');

        if (filterType === 'all' || status === filterType) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function showFieldError(field, message) {
    if (!field) return;

    clearFieldError(field);

    field.classList.add('is-invalid');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    if (!field) return;

    field.classList.remove('is-invalid');

    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showFieldSuccess(field, message) {
    if (!field) return;

    clearFieldError(field);

    field.classList.add('is-valid');

    const successDiv = document.createElement('div');
    successDiv.className = 'valid-feedback';
    successDiv.textContent = message;

    field.parentNode.appendChild(successDiv);
}

function validateField(field) {
    if (!field) return true;

    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');

    if (isRequired && !value) {
        showFieldError(field, '필수 입력 항목입니다.');
        return false;
    }

    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, '올바른 이메일 형식이 아닙니다.');
        return false;
    }

    if (field.type === 'password' && value && value.length < 8) {
        showFieldError(field, '비밀번호는 8자 이상이어야 합니다.');
        return false;
    }

    clearFieldError(field);
    return true;
}