const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px 0px -50px 0px",
};

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const progressBars = entry.target.querySelectorAll(".skill-progress");
      progressBars.forEach((bar) => {
        const width = bar.style.width;
        bar.style.width = "0%";
        setTimeout(() => {
          bar.style.width = width;
        }, 200);
      });
    }
  });
}, observerOptions);

document.querySelectorAll(".skill-category").forEach((category) => {
  skillObserver.observe(category);
});
