document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
  const packageCards = document.querySelectorAll(".package-card");
  const selectedPackage = document.getElementById("selected-package");
  const selectedPrice = document.getElementById("selected-price");
  const currentYear = document.getElementById("current-year");
  const orderButton = document.getElementById("order-button");
  const playerIdInput = document.getElementById("player-id");

  // SHOPPING CART
  const cart = new Map();

  // CURRENT YEAR
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // FORMAT PRICES
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
          ? "None selected"
          : items
              .map((item) => `${item.name} × ${item.quantity}`)
              .join(", ");
    }

    if (selectedPrice) {
      selectedPrice.textContent = formatPrice(grandTotal);
    }
  }

  // SET UP EACH UC PACKAGE
  packageCards.forEach((card) => {
    const name = card.dataset.name;
    const price = Number(card.dataset.price);

    if (!name || !Number.isFinite(price)) return;

    const key = `${name}::${price}`;

    card.setAttribute("aria-pressed", "false");

    // Create quantity controls OUTSIDE the button.
    const wrapper = document.createElement("div");
    wrapper.className = "package-item";

    card.parentNode.insertBefore(wrapper, card);
    wrapper.appendChild(card);

    const quantityControl = document.createElement("div");
    quantityControl.className = "quantity-control";

    quantityControl.innerHTML = `
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

    wrapper.appendChild(quantityControl);

    const minusButton =
      quantityControl.querySelector(".quantity-minus");

    const plusButton =
      quantityControl.querySelector(".quantity-plus");

    const quantityValue =
      quantityControl.querySelector(".quantity-value");

    // CHANGE QUANTITY
    function updateQuantity(quantity) {
      quantity = Math.max(0, Math.min(99, quantity));

      if (quantity === 0) {
        cart.delete(key);
        wrapper.classList.remove("selected");
        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");
        quantityControl.style.display = "none";
      } else {
        cart.set(key, {
          name,
          price,
          quantity
        });

        wrapper.classList.add("selected");
        card.classList.add("selected");
        card.setAttribute("aria-pressed", "true");
        quantityControl.style.display = "flex";
      }

      quantityValue.textContent = quantity;

      updateOrderSummary();
    }

    // SELECT PACKAGE
    card.addEventListener("click", () => {
      const currentQuantity = cart.get(key)?.quantity || 0;

      if (currentQuantity === 0) {
        updateQuantity(1);
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

    // HIDE CONTROLS INITIALLY
    quantityControl.style.display = "none";
  });

  // WHATSAPP ORDER
  if (orderButton) {
    orderButton.addEventListener("click", () => {
      const playerId = playerIdInput.value.trim();

      if (!playerId) {
        alert("Please enter your BGMI Character ID.");
        playerIdInput.focus();
        return;
      }

      if (!/^\d+$/.test(playerId)) {
        alert("Please enter a numeric BGMI Character ID.");
        playerIdInput.focus();
        return;
      }

      const items = Array.from(cart.values());

      if (items.length === 0) {
        alert("Please select at least one UC package.");
        return;
      }

      const whatsappNumber = "919678491041";

      if (!/^\d{10,15}$/.test(whatsappNumber)) {
        alert("Please check the store WhatsApp number in bgmi.js.");
        return;
      }

      const grandTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderDetails = items.map((item) => {
        const subtotal = item.price * item.quantity;

        return (
          `${item.name}\n` +
          `Quantity: ${item.quantity}\n` +
          `Unit price: ${formatPrice(item.price)}\n` +
          `Subtotal: ${formatPrice(subtotal)}`
        );
      });

      const message =
        "Hello KAIZO TOPUPS! I want to place a BGMI order.\n\n" +
        "Game: BGMI\n" +
        "Character ID: " + playerId + "\n\n" +
        "ORDER DETAILS\n\n" +
        orderDetails.join("\n\n") +
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

  // INITIAL ORDER SUMMARY
  updateOrderSummary();
});