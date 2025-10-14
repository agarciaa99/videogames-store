// /src/main.ts
import { fetchProducts } from "./api/productService.js";
import { renderProducts } from "./components/productUI.js";
import { renderCart } from "./components/cartUI.js";
import { Cart } from "./store/cart.js";
import { Auth } from "./store/auth.js";
import type { Producto } from "./types/interfaces.js";

// --- Inicialización ---
const cart = new Cart();
const auth = new Auth();
let productCatalog: Producto[] = [];

// --- Funciones del App ---
async function initApp() {
  productCatalog = await fetchProducts();
  renderProducts(productCatalog);
  updateUI();
}

function updateUI() {
  renderCart(cart, auth);
}

// /src/main.ts

function showProductDetailModal(product: Producto) {
  // Búsqueda de elementos justo cuando se necesitan
  const productModal = document.getElementById(
    "product-detail-modal"
  ) as HTMLDivElement;
  // Buscamos el nuevo contenedor de imágenes en lugar de la imagen única
  const imagesContainer = document.getElementById(
    "modal-product-images-container"
  ) as HTMLDivElement;
  const modalTitle = document.getElementById(
    "modal-product-title"
  ) as HTMLElement;
  const modalDesc = document.getElementById(
    "modal-product-desc"
  ) as HTMLElement;
  const modalPrice = document.getElementById(
    "modal-product-price"
  ) as HTMLElement;
  const platformSelect = document.getElementById(
    "modal-platform-select"
  ) as HTMLSelectElement;
  const addToCartBtn = document.getElementById(
    "modal-add-to-cart-btn"
  ) as HTMLButtonElement;

  // Verificación para seguridad
  if (
    !productModal ||
    !imagesContainer || // Verificamos el nuevo contenedor
    !modalTitle ||
    !modalDesc ||
    !modalPrice ||
    !platformSelect ||
    !addToCartBtn
  ) {
    console.error("Faltan elementos en el modal de detalle de producto.");
    return;
  }

  // --- LÓGICA ACTUALIZADA PARA LAS IMÁGENES ---
  // 1. Limpiamos el contenedor por si tenía imágenes de un producto anterior
  imagesContainer.innerHTML = "";
  // 2. Creamos el HTML para cada imagen en el array
  const imagesHTML = product.imagenes
    .map(
      (url) => `
    <img src="${url}" alt="Imagen de ${product.nombre}" class="w-full h-auto object-cover rounded-lg">
  `
    )
    .join("");
  // 3. Insertamos el HTML generado en el contenedor
  imagesContainer.innerHTML = imagesHTML;
  // --- FIN DE LA LÓGICA ACTUALIZADA ---

  modalTitle.textContent = product.nombre;
  modalDesc.textContent =
    product.descripcion || "No hay descripción disponible.";
  modalPrice.textContent = `$${product.precio.toFixed(2)}`;

  platformSelect.innerHTML = product.plataformas
    .map((p) => `<option value="${p}">${p}</option>`)
    .join("");
  addToCartBtn.dataset.productId = product.id.toString();

  productModal.classList.remove("hidden");
}

// --- Lógica de Eventos ---
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  // --- Lógica para abrir/cerrar el carrito lateral ---
  const cartAside = document.getElementById("shopping-cart-aside");
  const cartOverlay = document.getElementById("cart-overlay");
  const openCart = () => {
    if (cartAside && cartOverlay) {
      cartOverlay.classList.remove("hidden");
      cartAside.classList.remove("translate-x-full");
    }
  };
  const closeCart = () => {
    if (cartAside && cartOverlay) {
      cartOverlay.classList.add("hidden");
      cartAside.classList.add("translate-x-full");
    }
  };

  if (target.closest("#cart-toggle-btn")) {
    if (cartAside?.classList.contains("translate-x-full")) {
      openCart();
    } else {
      closeCart();
    }
  }
  if (target.matches("#close-cart-btn") || target.matches("#cart-overlay")) {
    closeCart();
  }

  // --- Lógica para los Modales ---
  if (target.closest(".product-card")) {
    const productId = parseInt(
      (target.closest(".product-card") as HTMLElement).dataset.productId!
    );
    const product = productCatalog.find((p) => p.id === productId);
    if (product) showProductDetailModal(product);
  }
  if (target.matches("#modal-add-to-cart-btn")) {
    const productId = parseInt(target.dataset.productId!);
    const product = productCatalog.find((p) => p.id === productId);
    const plataforma = (
      document.getElementById("modal-platform-select") as HTMLSelectElement
    ).value;
    const cantidad = parseInt(
      (document.getElementById("modal-quantity-input") as HTMLInputElement)
        .value
    );
    if (product && plataforma && cantidad > 0) {
      cart.addItem(product, plataforma, cantidad);
      updateUI();
      document.getElementById("product-detail-modal")?.classList.add("hidden");
    }
  }

  // --- Lógica para modificar items del carrito ---
  if (target.matches(".increment-btn")) {
    const { productId, plataforma } = target.dataset;
    if (productId && plataforma)
      cart.updateQuantity(parseInt(productId), plataforma, 1);
    updateUI();
  }
  if (target.matches(".decrement-btn")) {
    const { productId, plataforma } = target.dataset;
    if (productId && plataforma)
      cart.updateQuantity(parseInt(productId), plataforma, -1);
    updateUI();
  }
  if (target.matches(".remove-btn")) {
    const { productId, plataforma } = target.dataset;
    if (productId && plataforma)
      cart.removeItem(parseInt(productId), plataforma);
    updateUI();
  }

  const paymentMethod = target.closest(".payment-method");
  if (paymentMethod) {
    document.querySelectorAll(".payment-method").forEach((el) => {
      el.classList.remove("bg-gray-700", "border-blue-500");
      el.classList.add("border-gray-600");
    });

    paymentMethod.classList.remove("border-gray-600");
    paymentMethod.classList.add("bg-gray-700", "border-blue-500");
  }

  // --- Lógica del Flujo de Compra ---
  if (target.matches("#checkout-btn") && !target.hasAttribute("disabled")) {
    const paymentModal = document.getElementById("payment-modal");
    const paymentTotalEl = document.getElementById("payment-total");
    if (paymentModal && paymentTotalEl) {
      paymentTotalEl.textContent = `$${cart.getTotal().toFixed(2)}`;
      paymentModal.classList.remove("hidden");
    }
  }
  if (target.matches("#pay-now-btn")) {
    const paymentModal = document.getElementById("payment-modal");
    const confirmationModal = document.getElementById("confirmation-modal");
    const userNameEl = document.getElementById("confirmation-user-name");
    if (paymentModal && confirmationModal && userNameEl) {
      paymentModal.classList.add("hidden");
      setTimeout(() => {
        const user = auth.getCurrentUser();
        userNameEl.textContent = user ? user.nombre : "invitado";
        confirmationModal.classList.remove("hidden");
        cart.clearCart();
        updateUI();
      }, 500);
    }
  }

  // --- Lógica de Autenticación y Cierre de Modales ---
  if (target.matches("#login-modal-btn"))
    document.getElementById("login-modal")?.classList.remove("hidden");
  if (target.matches("#register-modal-btn"))
    document.getElementById("register-modal")?.classList.remove("hidden");
  if (target.matches(".close-modal-btn")) {
    target.closest(".modal")?.classList.add("hidden");
  }
  if (target.matches("#logout-btn")) {
    auth.logout();
    updateUI();
  }
});

// Los listeners de formularios de login/registro no cambian, pero es mejor buscar los elementos aquí
const loginForm = document.getElementById("login-form") as HTMLFormElement;
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (document.getElementById("login-email") as HTMLInputElement)
      .value;
    if (auth.login(email)) {
      document.getElementById("login-modal")?.classList.add("hidden");
      loginForm.reset();
      updateUI();
    }
  });
}

const registerForm = document.getElementById(
  "register-form"
) as HTMLFormElement;
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = (
      document.getElementById("register-name") as HTMLInputElement
    ).value;
    const email = (
      document.getElementById("register-email") as HTMLInputElement
    ).value;
    if (auth.register(nombre, email)) {
      document.getElementById("register-modal")?.classList.add("hidden");
      registerForm.reset();
    }
  });
}

// --- Iniciar la Aplicación ---
document.addEventListener("DOMContentLoaded", initApp);
