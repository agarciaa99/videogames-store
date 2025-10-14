export interface Producto {
  id: number;
  nombre: string;
  plataformas: string[];
  precio: number;
  imagenes: string[];
  descripcion?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
  plataforma: string;
}
