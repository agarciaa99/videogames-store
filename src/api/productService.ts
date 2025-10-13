import type { Producto } from "../types/interfaces.js";

export async function fetchProducts(): Promise<Producto[]> {
  try {
    const response = await fetch("./data/products.json");
    if (!response.ok) {
      throw new Error("No se pudo cargar el catálogo de productos.");
    }
    const products: Producto[] = await response.json();
    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}
