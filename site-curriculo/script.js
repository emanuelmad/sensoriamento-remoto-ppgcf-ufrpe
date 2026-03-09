const revealables = document.querySelectorAll("[data-reveal]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  },
);

revealables.forEach((element) => observer.observe(element));

document.querySelectorAll("[data-tilt]").forEach((card) => {
  const reset = () => {
    card.style.transform = "";
  };

  card.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 860) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 10;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  card.addEventListener("pointerleave", reset);
  card.addEventListener("pointerup", reset);
});

const yearTarget = document.querySelector("#current-year");
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear().toString();
}
