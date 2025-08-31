import { Injectable } from '@angular/core';
import { AuthService, User } from './auth';

export interface Permission {
  action: string;
  roles: ('admin' | 'employee')[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private permissions: Permission[] = [
    // Gestión de Productos
    { action: 'productos.view', roles: ['admin', 'employee'] },
    { action: 'productos.create', roles: ['admin'] },
    { action: 'productos.edit', roles: ['admin'] },
    { action: 'productos.delete', roles: ['admin'] },
    
    // Gestión de Categorías
    { action: 'categorias.view', roles: ['admin', 'employee'] },
    { action: 'categorias.create', roles: ['admin'] },
    { action: 'categorias.edit', roles: ['admin'] },
    { action: 'categorias.delete', roles: ['admin'] },
    
    // Gestión de Usuarios
    { action: 'usuarios.view', roles: ['admin'] },
    { action: 'usuarios.create', roles: ['admin'] },
    { action: 'usuarios.edit', roles: ['admin'] },
    { action: 'usuarios.delete', roles: ['admin'] },
    
    // Ventas
    { action: 'ventas.view', roles: ['admin', 'employee'] },
    { action: 'ventas.create', roles: ['admin', 'employee'] },
    { action: 'ventas.edit', roles: ['admin'] },
    { action: 'ventas.delete', roles: ['admin'] },
    { action: 'ventas.cancel', roles: ['admin'] },
    
    // Reportes
    { action: 'reportes.view', roles: ['admin'] },
    { action: 'reportes.export', roles: ['admin'] },
    
    // Configuración del Sistema
    { action: 'config.view', roles: ['admin'] },
    { action: 'config.edit', roles: ['admin'] }
  ];

  constructor(private authService: AuthService) {}

  can(action: string): boolean {
    const user = this.authService.currentUser;
    if (!user) return false;

    const permission = this.permissions.find(p => p.action === action);
    if (!permission) return false;

    return permission.roles.includes(user.role);
  }

  canAny(actions: string[]): boolean {
    return actions.some(action => this.can(action));
  }

  canAll(actions: string[]): boolean {
    return actions.every(action => this.can(action));
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser;
    return user?.role === 'admin';
  }

  isEmployee(): boolean {
    const user = this.authService.currentUser;
    return user?.role === 'employee';
  }

  hasRole(role: 'admin' | 'employee'): boolean {
    const user = this.authService.currentUser;
    return user?.role === role;
  }

  hasAnyRole(roles: ('admin' | 'employee')[]): boolean {
    const user = this.authService.currentUser;
    return user ? roles.includes(user.role) : false;
  }

  // Métodos específicos para funcionalidades comunes
  canManageProducts(): boolean {
    return this.can('productos.create') || this.can('productos.edit') || this.can('productos.delete');
  }

  canManageCategories(): boolean {
    return this.can('categorias.create') || this.can('categorias.edit') || this.can('categorias.delete');
  }

  canManageUsers(): boolean {
    return this.can('usuarios.create') || this.can('usuarios.edit') || this.can('usuarios.delete');
  }

  canViewReports(): boolean {
    return this.can('reportes.view');
  }

  canManageSales(): boolean {
    return this.can('ventas.edit') || this.can('ventas.delete') || this.can('ventas.cancel');
  }
}
