function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function setUrlParameter(name, value) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url);
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(function() {
    if (!button) {
      return;
    }
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check"></i>';
    button.style.color = '#28a745';

    setTimeout(function() {
      button.innerHTML = originalText;
      button.style.color = '';
    }, 1000);
  }).catch(function(err) {
    console.error('복사 실패: ', err);
    alert('복사에 실패했습니다.');
  });
}

function submitCoseller() {
  const city = document.getElementById("city").value;
  const district = document.getElementById("district").value;

  fetch("/coseller/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ city, district }),
    credentials: "include",
  })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw err;
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.data > 0) {
          alert("등록 성공: " + data.data + "건");
        } else {
          alert("등록 실패 또는 중복: " + JSON.stringify(data));
        }
        window.location.reload();
      })
      .catch((err) => {
        alert("에러: " + (err.resultMsg || err.message || JSON.stringify(err)));
        window.location.reload();
      });
}

function setupEnterKeySubmit() {
  document.querySelectorAll(".search-form input").forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const form = document.querySelector(".search-form");
        if (form) {
          form.submit();
        }
      }
    });
  });
}

function setupTableRowClick() {
  document.querySelectorAll("tbody tr").forEach((row) => {
    row.addEventListener("click", function (e) {
      if (
          e.target.closest("button") ||
          e.target.closest("a") ||
          e.target.closest("form")
      ) {
        return;
      }

      document
          .querySelectorAll("tbody tr")
          .forEach((r) => r.classList.remove("table-active"));
      this.classList.add("table-active");
    });
  });
}

function setupCardAnimation() {
  const cards = document.querySelectorAll(".health-card, .metric-card");
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.5s ease";
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 100);
    }, index * 100);
  });
}

function setupAutoRefresh(interval = 300000) {
  setInterval(function () {
    location.reload();
  }, interval);
}

function setupBizNoFormatting() {
  const bizNoInput = document.getElementById("bizNo");
  if (bizNoInput) {
    bizNoInput.addEventListener("input", function (e) {
      formatBizNo(e.target);
    });
  }
}