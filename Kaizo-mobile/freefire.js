document.addEventListener("DOMContentLoaded", () => {
  const packageCards = document.querySelectorAll(".package-card");
  const selectedPackage = document.getElementById("selected-package");
  const selectedPrice = document.getElementById("selected-price");
  const currentYear = document.getElementById("current-year");
  const orderButton = document.getElementById("order-button");
  const playerIdInput = document.getElementById("player-id");

  const whatsappNumber = "919678491041";

  // Store selected packages and their quantities.
  const cart = new Map();

  // Format prices in Indian Rupees.
  const formatPrice = (price) =>
    "₹" + Number(price).toLocaleString("en-IN");

  // Display the current year.
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Create quantity controls for each package.
  packageCards.forEach((card) => {
    card.setAttribute("aria-pressed", "false");

    // Prevent duplicate quantity controls.
    if (
      card.parentElement.classList.contains("package-item")
    ) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "package-item";

    card.parentNode.insertBefore(wrapper, card);
    wrapper.appendChild(card);

    const controls = document.createElement("div");
    controls.className = "quantity-control";
    controls.hidden = true;

    const minusButton = document.createElement("button");
    minusButton.type = "button";
    minusButton.className = "quantity-btn minus-btn";
    minusButton.textContent = "−";
    minusButton.setAttribute(
      "aria-label",
      "Decrease " + card.dataset.name + " quantity"
    );

    const quantityDisplay = document.createElement("span");
    quantityDisplay.className = "quantity-value";
    quantityDisplay.textContent = "1";

    const plusButton = document.createElement("button");
    plusButton.type = "button";
    plusButton.className = "quantity-btn plus-btn";
    plusButton.textContent = "+";
    plusButton.setAttribute(
      "aria-label",
      "Increase " + card.dataset.name + " quantity"
    );

    controls.appendChild(minusButton);
    controls.appendChild(quantityDisplay);
    controls.appendChild(plusButton);

    wrapper.appendChild(controls);

    // Select or deselect a package.
    card.addEventListener("click", () => {
      const name = card.dataset.name;
      const price = Number(card.dataset.price);

      if (cart.has(name)) {
        cart.delete(name);

        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");

        controls.hidden = true;
      } else {
        cart.set(name, {
          name,
          price,
          quantity: 1,
          card,
          controls,
          quantityDisplay
        });

        card.classList.add("selected");
        card.setAttribute("aria-pressed", "true");

        quantityDisplay.textContent = "1";
        controls.hidden = false;
      }

      updateOrderSummary();
    });

    // Increase quantity.
    plusButton.addEventListener("click", () => {
      const name = card.dataset.name;
      const item = cart.get(name);

      if (!item) return;

      if (item.quantity >= 99) {
        alert("Maximum quantity is 99 per package.");
        return;
      }

      item.quantity++;

      quantityDisplay.textContent = item.quantity;

      updateOrderSummary();
    });

    // Decrease quantity.
    minusButton.addEventListener("click", () => {
      const name = card.dataset.name;
      const item = cart.get(name);

      if (!item) return;

      if (item.quantity > 1) {
        item.quantity--;
        quantityDisplay.textContent = item.quantity;
      } else {
        // Remove the package when its quantity reaches zero.
        cart.delete(name);

        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");

        controls.hidden = true;
      }

      updateOrderSummary();
    });
  });

  // Update the order summary and total.
  function updateOrderSummary() {
    if (cart.size === 0) {
      selectedPackage.textContent = "None selected";
      selectedPrice.textContent = "₹0";
      return;
    }

    let total = 0;
    const packageNames = [];

    cart.forEach((item) => {
      total += item.price * item.quantity;

      packageNames.push(
        item.name +
        (item.quantity > 1 ? " × " + item.quantity : "")
      );
    });

    selectedPackage.textContent = packageNames.join(", ");
    selectedPrice.textContent = formatPrice(total);
  }

  // Handle WhatsApp orders.
  orderButton.addEventListener("click", () => {
    const playerId = playerIdInput.value.trim();

    if (!playerId) {
      alert("Please enter your Free Fire Player ID.");
      playerIdInput.focus();
      return;
    }

    if (!/^\d+$/.test(playerId)) {
      alert("Please enter a numeric Free Fire Player ID.");
      playerIdInput.focus();
      return;
    }

    if (cart.size === 0) {
      alert("Please select at least one package.");
      return;
    }

    if (!/^\d{10,15}$/.test(whatsappNumber)) {
      alert("Please check the store WhatsApp number.");
      return;
    }

    let total = 0;

    let message =
      "Hello KAIZO TOPUPS! I want to place a Free Fire order.\n\n" +
      "GAME: Free Fire\n" +
      "PLAYER ID: " + playerId + "\n\n" +
      "MY ORDER:\n";

    cart.forEach((item) => {
      const subtotal = item.price * item.quantity;

      total += subtotal;

      message +=
        "\nPackage: " + item.name +
        "\nQuantity: " + item.quantity +
        "\nUnit Price: " + formatPrice(item.price) +
        "\nSubtotal: " + formatPrice(subtotal) +
        "\n";
    });

    message +=
      "\nTOTAL AMOUNT: " + formatPrice(total) +
      "\n\nPlease confirm my order and send me the UPI payment details.";

    const whatsappURL =
      "https://wa.me/" +
      whatsappNumber +
      "?text=" +
      encodeURIComponent(message);

    window.open(
      whatsappURL,
      "_blank",
      "noopener,noreferrer"
    );
  });
});