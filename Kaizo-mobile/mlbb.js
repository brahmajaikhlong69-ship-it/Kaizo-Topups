document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
  const selectedPackage = document.getElementById("selected-package");
  const selectedPrice = document.getElementById("selected-price");
  const orderButton = document.getElementById("order-button");

  const playerIdInput = document.getElementById("player-id");
  const serverIdInput = document.getElementById("server-id");

  // SHOPPING CART
  const cart = new Map();

  function getKey(name, price) {
    return `${name}::${price}`;
  }

  function formatPrice(price) {
    return "₹" + price.toLocaleString("en-IN");
  }

  // UPDATE ORDER SUMMARY
  function updateOrderSummary() {
    const items = Array.from(cart.values());

    const grandTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (selectedPackage) {
      selectedPackage.textContent =
        items.length === 0
          ? "No package selected"
          : items
              .map((item) => `${item.name} × ${item.quantity}`)
              .join(", ");
    }

    if (selectedPrice) {
      selectedPrice.textContent = formatPrice(grandTotal);
    }
  }

  // CREATE QUANTITY CONTROLS
  function createQuantityControl() {
    const control = document.createElement("div");
    control.className = "quantity-control";

    control.innerHTML = `
      <button
        type="button"
        class="quantity-minus"
        aria-label="Decrease quantity"
      >−</button>

      <span class="quantity-value">1</span>

      <button
        type="button"
        class="quantity-plus"
        aria-label="Increase quantity"
      >+</button>
    `;

    return control;
  }

  // SET UP ANY PACKAGE OR PASS
  function setupProduct(button, type) {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    if (!name || !Number.isFinite(price)) return;

    const key = getKey(name, price);

    let wrapper;

    if (type === "diamond") {
      // Wrap the diamond button so controls are not nested inside it.
      wrapper = document.createElement("div");
      wrapper.className = "package-item";

      button.parentNode.insertBefore(wrapper, button);
      wrapper.appendChild(button);
    } else {
      // Pass controls will be placed separately inside weekly-info.
      wrapper = button.closest(".weekly-card");
    }

    const control = createQuantityControl();

    if (type === "diamond") {
      wrapper.appendChild(control);
    } else {
      button.insertAdjacentElement("afterend", control);
    }

    const quantityValue = control.querySelector(".quantity-value");
    const minusButton = control.querySelector(".quantity-minus");
    const plusButton = control.querySelector(".quantity-plus");

    function updateQuantity(quantity) {
      quantity = Math.max(0, Math.min(99, quantity));

      if (quantity === 0) {
        cart.delete(key);
        wrapper.classList.remove("selected");
        button.setAttribute("aria-pressed", "false");
        control.style.display = "none";
      } else {
        cart.set(key, {
          name,
          price,
          quantity
        });

        wrapper.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
        control.style.display = "flex";
      }

      quantityValue.textContent = quantity;

      updateOrderSummary();
    }

    // Clicking a product selects it.
    button.addEventListener("click", () => {
      const currentQuantity = cart.get(key)?.quantity || 0;

      if (currentQuantity === 0) {
        updateQuantity(1);
      } else {
        // Clicking an already-selected product does not add extras.
        // Use + to increase its quantity.
        updateQuantity(currentQuantity);
      }
    });

    // INCREASE QUANTITY
    plusButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const currentQuantity = cart.get(key)?.quantity || 0;

      updateQuantity(currentQuantity + 1);
    });

    // DECREASE QUANTITY
    minusButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const currentQuantity = cart.get(key)?.quantity || 0;

      updateQuantity(currentQuantity - 1);
    });

    // Start with controls hidden.
    control.style.display = "none";
    button.setAttribute("aria-pressed", "false");
  }

  // DIAMOND PACKAGES
  document.querySelectorAll(".package-card").forEach((button) => {
    setupProduct(button, "diamond");
  });

  // WEEKLY PASS AND TWILIGHT PASS
  document.querySelectorAll(".weekly-select").forEach((button) => {
    setupProduct(button, "pass");
  });

  // WHATSAPP ORDER
  if (orderButton) {
    orderButton.addEventListener("click", () => {
      const playerId = playerIdInput.value.trim();
      const serverId = serverIdInput.value.trim();

      if (!playerId || !serverId) {
        alert("Please enter both your Player ID and Server ID.");
        return;
      }

      if (!/^\d+$/.test(playerId) || !/^\d+$/.test(serverId)) {
        alert("Please enter numeric Player ID and Server ID values.");
        return;
      }

      const items = Array.from(cart.values());

      if (items.length === 0) {
        alert("Please select at least one package.");
        return;
      }

      const whatsappNumber = "919678491041";

      const grandTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderLines = items.map((item) => {
        const subtotal = item.price * item.quantity;

        return (
          `${item.name}\n` +
          `Quantity: ${item.quantity}\n` +
          `Unit price: ${formatPrice(item.price)}\n` +
          `Subtotal: ${formatPrice(subtotal)}`
        );
      });

      const message =
        "Hello KAIZO TOPUPS! I want to place an MLBB order.\n\n" +
        "Game: Mobile Legends: Bang Bang\n" +
        "Player ID: " + playerId + "\n" +
        "Server ID: " + serverId + "\n\n" +
        "ORDER DETAILS\n\n" +
        orderLines.join("\n\n") +
        "\n\nGrand Total: " + formatPrice(grandTotal) +
        "\n\nPlease confirm the final price and send me the UPI payment details.";

      const whatsappURL =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

      window.open(whatsappURL, "_blank", "noopener,noreferrer");
    });
  }

  // CATEGORY NAVIGATION
  const categoryLinks = document.querySelectorAll(".category-tab");

  const categorySections = [
    document.getElementById("diamonds"),
    document.getElementById("double-diamonds"),
    document.getElementById("weekly-pass"),
    document.getElementById("twilight-pass")
  ].filter(Boolean);

  function updateActiveCategory() {
    let currentSection = null;

    categorySections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 150) {
        currentSection = section;
      }
    });

    if (!currentSection && categorySections.length) {
      currentSection = categorySections[0];
    }

    categoryLinks.forEach((link) => {
      const active = currentSection &&
        link.hash === "#" + currentSection.id;

      link.classList.toggle("active", Boolean(active));

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (categorySections.length && categoryLinks.length) {
    window.addEventListener("scroll", updateActiveCategory, {
      passive: true
    });

    categoryLinks.forEach((link) => {
      link.addEventListener("click", () => {
        categoryLinks.forEach((item) => {
          item.classList.remove("active");
        });

        link.classList.add("active");
      });
    });

    updateActiveCategory();
  }

  // MLBB BANNER SLIDESHOW
  const slides = document.querySelectorAll(".mlbb-slide");

  if (slides.length > 1) {
    let currentSlide = 0;

    setInterval(() => {
      slides[currentSlide].classList.remove("active");

      currentSlide = (currentSlide + 1) % slides.length;

      slides[currentSlide].classList.add("active");
    }, 3000);
  }

  // INITIAL SUMMARY
  updateOrderSummary();
});