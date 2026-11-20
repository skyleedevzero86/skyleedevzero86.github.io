document.addEventListener("DOMContentLoaded", function () {
  if (typeof bootstrap !== "undefined" && bootstrap.Dropdown) {
    const dropdownElementList = [].slice.call(
      document.querySelectorAll(".dropdown-toggle")
    );
    const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
      return new bootstrap.Dropdown(dropdownToggleEl);
    });
  } else {
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const dropdownMenu = this.nextElementSibling;
        if (
          dropdownMenu &&
          dropdownMenu.classList.contains("dropdown-menu")
        ) {
          const isOpen = dropdownMenu.classList.contains("show");
          document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
            if (menu !== dropdownMenu) {
              menu.classList.remove("show");
            }
          });
          if (isOpen) {
            dropdownMenu.classList.remove("show");
          } else {
            dropdownMenu.classList.add("show");
          }
        }
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".dropdown")) {
        document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
          menu.classList.remove("show");
        });
      }
    });
  }
});

