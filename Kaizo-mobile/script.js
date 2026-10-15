document.addEventListener("DOMContentLoaded", () => {
  // Homepage banner slider
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsContainer = document.getElementById("slider-dots");
  const previousButton = document.getElementById("prev-slide");
  const nextButton = document.getElementById("next-slide");

  let currentSlide = 0;
  let autoSlide;

  if (slides.length && dotsContainer) {
    // Create one dot for each banner
    slides.forEach((slide, index) => {
      const dot = document.createElement("button");

      dot.className = "slider-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Show banner ${index + 1}`);

      dot.addEventListener("click", () => {
        showSlide(index);
        restartAutoSlide();
      });

      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(
      dotsContainer.querySelectorAll(".slider-dot")
    );

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === currentSlide);

        slide.setAttribute(
          "aria-hidden",
          i === currentSlide ? "false" : "true"
        );
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentSlide);

        dot.setAttribute(
          "aria-current",
          i === currentSlide ? "true" : "false"
        );
      });
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function previousSlide() {
      showSlide(currentSlide - 1);
    }

    function restartAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(nextSlide, 3000);
    }

    nextButton?.addEventListener("click", () => {
      nextSlide();
      restartAutoSlide();
    });

    previousButton?.addEventListener("click", () => {
      previousSlide();
      restartAutoSlide();
    });

    // Show the first banner and start automatic rotation
    showSlide(0);
    restartAutoSlide();

    // Pause automatic movement when the page is hidden
    document.addEventListener("visibilitychange", () => {
      clearInterval(autoSlide);

      if (!document.hidden) {
        restartAutoSlide();
      }
    });
  }

  // Update the footer year automatically
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Leave the hamburger menu behavior unchanged for now
  const menuButton = document.getElementById("menu-button");

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const isExpanded =
        menuButton.getAttribute("aria-expanded") === "true";

      menuButton.setAttribute(
        "aria-expanded",
        String(!isExpanded)
      );
    });
  }
});