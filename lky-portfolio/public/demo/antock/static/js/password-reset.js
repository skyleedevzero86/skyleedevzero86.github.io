document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("newPassword");
    const icon = this.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    }
  });

document
  .getElementById("toggleConfirmPassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("confirmPassword");
    const icon = this.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    }
  });

document
  .getElementById("newPassword")
  .addEventListener("input", function () {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    updatePasswordStrength(strength);
    checkPasswordMatch();
  });

document
  .getElementById("confirmPassword")
  .addEventListener("input", function () {
    checkPasswordMatch();
  });

function checkPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return {
    score: score,
    percentage: (score / 5) * 100,
    text: score < 2 ? "약함" : score < 4 ? "보통" : "강함",
    color: score < 2 ? "danger" : score < 4 ? "warning" : "success",
  };
}

function updatePasswordStrength(strength) {
  const progressBar = document.getElementById("passwordStrengthBar");
  const strengthText = document.getElementById("passwordStrengthText");

  progressBar.style.width = strength.percentage + "%";
  progressBar.className = `progress-bar bg-${strength.color}`;
  strengthText.textContent = `비밀번호 강도: ${strength.text}`;
  strengthText.className = `text-${strength.color}`;
}

function checkPasswordMatch() {
  const password = document.getElementById("newPassword").value;
  const confirmPassword =
    document.getElementById("confirmPassword").value;
  const matchText = document.getElementById("passwordMatchText");
  const resetButton = document.getElementById("resetButton");

  if (confirmPassword === "") {
    matchText.textContent = "";
    resetButton.disabled = true;
    return;
  }

  if (password === confirmPassword) {
    matchText.textContent = "비밀번호가 일치합니다.";
    matchText.className = "text-success";
    resetButton.disabled = false;
  } else {
    matchText.textContent = "비밀번호가 일치하지 않습니다.";
    matchText.className = "text-danger";
    resetButton.disabled = true;
  }
}

