// /src/components/cartUI.ts
import type { Cart } from "../store/cart.js";
import type { Auth } from "../store/auth.js";
import type { CartItem } from "../types/interfaces.js";

// Todas las constantes que buscan elementos del DOM se eliminan de aquí.

function createCartItemHTML(item: CartItem): string {
  // Esta función no necesita cambios
  return `
        <div class="flex justify-between items-center p-2 bg-gray-800 rounded mb-2">
            <div class="flex items-center">
                <img src="${item.producto.imagenes}" alt="${item.producto.nombre}" class="w-12 h-12 object-cover rounded mr-4">
                <div>
                    <p class="font-bold text-white">${item.producto.nombre}</p>
                    <p class="text-sm text-gray-400">${item.plataforma}</p>
                </div>
            </div>
            <div class="flex items-center">
                <button data-product-id="${item.producto.id}" data-plataforma="${item.plataforma}" class="decrement-btn text-lg font-bold px-2">-</button>
                <span class="px-2 text-white">${item.cantidad}</span>
                <button data-product-id="${item.producto.id}" data-plataforma="${item.plataforma}" class="increment-btn text-lg font-bold px-2">+</button>
                <button data-product-id="${item.producto.id}" data-plataforma="${item.plataforma}" class="remove-btn text-red-500 hover:text-red-700 ml-4">Eliminar</button>
            </div>
        </div>
    `;
}

export function renderCart(cart: Cart, auth: Auth): void {
  // Movemos todas las declaraciones aquí adentro.
  const cartContainer = document.getElementById("cart-items") as HTMLDivElement;
  const cartTotalEl = document.getElementById("cart-total") as HTMLSpanElement;
  const cartCountBadge = document.getElementById(
    "cart-count-badge"
  ) as HTMLSpanElement;
  const checkoutBtn = document.getElementById(
    "checkout-btn"
  ) as HTMLButtonElement;
  const authStatusEl = document.getElementById("auth-status") as HTMLDivElement;
  const userActionsEl = document.getElementById(
    "user-actions"
  ) as HTMLDivElement;
  const mobileAuthStatusEl = document.getElementById(
    "mobile-auth-status"
  ) as HTMLDivElement;
  const mobileUserActionsEl = document.getElementById(
    "mobile-user-actions"
  ) as HTMLDivElement;

  // Es una buena práctica verificar que todos los elementos se encontraron
  if (
    !cartContainer ||
    !cartTotalEl ||
    !cartCountBadge ||
    !checkoutBtn ||
    !authStatusEl ||
    !userActionsEl
  ) {
    console.error(
      "Error crítico: Uno o más elementos de la UI del carrito no se encontraron en el DOM."
    );
    return;
  }

  const items = cart.getCartItems();
  cartContainer.innerHTML =
    items.length > 0
      ? items.map(createCartItemHTML).join("")
      : '<p class="text-gray-400 text-center">Tu carrito está vacío.</p>';

  const total = cart.getTotal();
  cartTotalEl.textContent = total.toFixed(2);

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);
  cartCountBadge.textContent = itemCount.toString();
  cartCountBadge.classList.toggle("hidden", itemCount === 0);

  if (auth.isLoggedIn()) {
    const user = auth.getCurrentUser();
    const welcomeMessage = `<span class="text-green-400">Bienvenido, ${user?.nombre}</span>`;
    const logoutButton = `<button id="logout-btn" class="text-gray-300 hover:text-white">Cerrar Sesión</button>`;

    if (authStatusEl) authStatusEl.innerHTML = welcomeMessage;
    if (userActionsEl) userActionsEl.innerHTML = logoutButton;
    if (mobileAuthStatusEl) mobileAuthStatusEl.innerHTML = welcomeMessage;
    if (mobileUserActionsEl) mobileUserActionsEl.innerHTML = logoutButton; // Se muestra en el menú móvil también

    if (checkoutBtn) {
      checkoutBtn.disabled = items.length === 0;
      checkoutBtn.textContent = "Proceder a la Compra";
      checkoutBtn.classList.toggle("opacity-50", items.length === 0);
      checkoutBtn.classList.toggle("cursor-not-allowed", items.length === 0);
    }
  } else {
    const notLoggedInMessage = `<span class="text-yellow-400">No has iniciado sesión</span>`;
    const loginActions = `
            <button id="login-modal-btn" class="text-gray-300 hover:text-white">Iniciar Sesión</button>
            <span class="mx-2 hidden md:inline">|</span>
            <button id="register-modal-btn" class="text-gray-300 hover:text-white">Registrarse</button>`;

    if (authStatusEl) authStatusEl.innerHTML = notLoggedInMessage;
    if (userActionsEl)
      userActionsEl.innerHTML = loginActions.replace(
        '<span class="mx-2 hidden md:inline">|</span>',
        '<span class="mx-2">|</span>'
      ); // Asegurar que el pipe se vea
    if (mobileAuthStatusEl) mobileAuthStatusEl.innerHTML = notLoggedInMessage;
    if (mobileUserActionsEl) mobileUserActionsEl.innerHTML = loginActions;

    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Inicia sesión para comprar";
      checkoutBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
}
