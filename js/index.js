let currentPage = 1;
const itemsPerPage = 6;
let totalPages = 0;

function initPagination() {
  const projectCards = document.querySelectorAll(".project-card");
  totalPages = Math.ceil(projectCards.length / itemsPerPage);

  const paginationNumbers = document.getElementById("paginationNumbers");
  paginationNumbers.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageNumber = document.createElement("div");
    pageNumber.className = "page-number";
    pageNumber.textContent = i;
    pageNumber.onclick = () => goToPage(i);
    paginationNumbers.appendChild(pageNumber);
  }

  const paginationContainer = document.querySelector(
    ".pagination-container"
  );
  if (paginationContainer) {
    paginationContainer.style.display = "flex";
  }

  if (totalPages <= 1) {
    projectCards.forEach((card) => {
      card.classList.remove("hide");
    });
  } else {
    showPage(1);
  }
}

function showPage(page) {
  const projectCards = document.querySelectorAll(".project-card");
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  projectCards.forEach((card) => {
    card.classList.add("hide");
  });

  for (let i = startIndex; i < endIndex && i < projectCards.length; i++) {
    projectCards[i].classList.remove("hide");
  }

  document.querySelectorAll(".page-number").forEach((btn, index) => {
    btn.classList.toggle("active", index + 1 === page);
  });
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === totalPages;

  currentPage = page;
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages) {
    showPage(page);
  }
}

function changePage(direction) {
  const newPage = currentPage + direction;
  if (newPage >= 1 && newPage <= totalPages) {
    showPage(newPage);
  }
}

document.addEventListener("DOMContentLoaded", initPagination);

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
