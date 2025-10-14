// /src/components/productUI.ts
import type { Producto } from "../types/interfaces.js";

function createProductCard(producto: Producto): string {
  // La clave está en esta primera línea del return:
  // 1. data-product-id: Guarda el ID del juego.
  // 2. class="product-card": Le da la clase que el main.ts necesita para detectar el clic.
  return `
        <div data-product-id="${
          producto.id
        }" class="product-card bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-105">
            <img src="${producto.imagenes[0]}" alt="${
    producto.nombre
  }" class="w-full h-48 object-cover pointer-events-none">
            <div class="p-4 pointer-events-none">
                <h3 class="text-xl font-bold text-white">${producto.nombre}</h3>
                <p class="text-gray-400">${producto.plataformas.join(", ")}</p>
                <div class="text-2xl font-semibold text-white mt-4">$${producto.precio.toFixed(
                  2
                )}</div>
            </div>
        </div>
    `;
}

export function renderProducts(productos: Producto[]): void {
  const productCatalog = document.getElementById(
    "product-catalog"
  ) as HTMLDivElement;
  if (productCatalog) {
    productCatalog.innerHTML = productos.map(createProductCard).join("");
  } else {
    console.error(
      "Error: El contenedor del catálogo de productos no fue encontrado."
    );
  }
}
