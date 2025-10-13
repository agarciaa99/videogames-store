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

function showProductDetailModal(product: Producto) {
  // Búsqueda de elementos justo cuando se necesitan
  const productModal = document.getElementById(
    "product-detail-modal"
  ) as HTMLDivElement;
  const modalImage = document.getElementById(
    "modal-product-image"
  ) as HTMLImageElement;
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
    !modalImage ||
    !modalTitle ||
    !modalDesc ||
    !modalPrice ||
    !platformSelect ||
    !addToCartBtn
  ) {
    console.error("Faltan elementos en el modal de detalle de producto.");
    return;
  }

  modalImage.src = product.imagen;
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

// Eventos
document.addEventListener("click", (event) => {
  console.log("Clic detectado. El elemento clickeado fue:", event.target);
  const target = event.target as HTMLElement;

  const productCard = target.closest(".product-card");
  if (productCard) {
    const productId = parseInt((productCard as HTMLElement).dataset.productId!);
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

  if (target.matches("#checkout-btn") && !target.hasAttribute("disabled")) {
    alert(
      `¡Gracias por tu compra, ${auth.getCurrentUser()?.nombre}!\nTotal: $${cart
        .getTotal()
        .toFixed(2)}`
    );
    cart.clearCart();
    updateUI();
  }

  if (target.matches(".increment-btn")) {
    const { productId, plataforma } = target.dataset;
    cart.updateQuantity(parseInt(productId!), plataforma!, 1);
    updateUI();
  }
  if (target.matches(".decrement-btn")) {
    const { productId, plataforma } = target.dataset;
    cart.updateQuantity(parseInt(productId!), plataforma!, -1);
    updateUI();
  }
  if (target.matches(".remove-btn")) {
    const { productId, plataforma } = target.dataset;
    cart.removeItem(parseInt(productId!), plataforma!);
    updateUI();
  }

  if (target.closest("#hamburger-btn")) {
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
      mobileMenu.classList.toggle("hidden");
    }
  }

  // Lógica para mostrar/ocultar modales de login/registro
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
    // Si el carrito está oculto (movido), ábrelo. Si no, ciérralo.
    if (cartAside?.classList.contains("translate-x-full")) {
      openCart();
    } else {
      closeCart();
    }
  }

  // Lógica para cerrar el carrito con el botón X o el fondo
  if (target.matches("#close-cart-btn") || target.matches("#cart-overlay")) {
    closeCart();
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
