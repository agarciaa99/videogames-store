import type { Usuario } from "../types/interfaces.js";

export class Auth {
  private users: Usuario[] = [];
  private currentUser: Usuario | null = null;

  constructor() {
    // Cargar usuarios y sesión desde localStorage
    const storedUsers = localStorage.getItem("app_users");
    const storedSession = localStorage.getItem("current_user");
    if (storedUsers) this.users = JSON.parse(storedUsers);
    if (storedSession) this.currentUser = JSON.parse(storedSession);
  }

  private saveUsers(): void {
    localStorage.setItem("app_users", JSON.stringify(this.users));
  }

  private saveSession(): void {
    localStorage.setItem("current_user", JSON.stringify(this.currentUser));
  }

  register(nombre: string, email: string): boolean {
    if (this.users.some((user) => user.email === email)) {
      alert("El correo ya está registrado.");
      return false;
    }
    const newUser: Usuario = { id: Date.now(), nombre, email };
    this.users.push(newUser);
    this.saveUsers();
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    return true;
  }

  login(email: string): boolean {
    const user = this.users.find((user) => user.email === email);
    if (user) {
      this.currentUser = user;
      this.saveSession();
      return true;
    }
    alert("Usuario no encontrado.");
    return false;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem("current_user");
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): Usuario | null {
    return this.currentUser;
  }
}
