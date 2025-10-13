import type { CartItem, Producto } from "../types/interfaces.js";

export class Cart {
  private items: CartItem[] = [];

  constructor() {
    // Cargar carrito desde localStorage si existe
    const storedCart = localStorage.getItem("shopping_cart");
    if (storedCart) {
      this.items = JSON.parse(storedCart);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem("shopping_cart", JSON.stringify(this.items));
  }

  addItem(producto: Producto, plataforma: string, cantidad: number): void {
    const existingItem = this.items.find(
      (item) =>
        item.producto.id === producto.id && item.plataforma === plataforma
    );

    if (existingItem) {
      existingItem.cantidad += cantidad;
    } else {
      this.items.push({ producto, plataforma, cantidad });
    }
    this.saveToLocalStorage();
  }

  updateQuantity(productId: number, plataforma: string, change: 1 | -1): void {
    const item = this.items.find(
      (item) => item.producto.id === productId && item.plataforma === plataforma
    );
    if (item) {
      item.cantidad += change;
      if (item.cantidad <= 0) {
        this.removeItem(productId, plataforma);
      } else {
        this.saveToLocalStorage();
      }
    }
  }

  removeItem(productId: number, plataforma: string): void {
    this.items = this.items.filter(
      (item) =>
        !(item.producto.id === productId && item.plataforma === plataforma)
    );
    this.saveToLocalStorage();
  }

  getTotal(): number {
    return this.items.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
  }

  getCartItems(): CartItem[] {
    return this.items;
  }

  clearCart(): void {
    this.items = [];
    this.saveToLocalStorage();
  }
}
