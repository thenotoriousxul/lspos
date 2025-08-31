import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Verificar si hay token
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return of(false);
    }

    // Validar token con el servidor
    return this.authService.getCurrentUser().pipe(
      map(response => {
        if (response.success && response.data) {
          return true; // Token válido, permitir acceso
        } else {
          // Token inválido
          this.authService.logout();
          return false;
        }
      }),
      catchError(error => {
        console.error('Error validando token en guard:', error);
        
        // Solo hacer logout si es un error de autenticación específico
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          return of(false);
        }
        
        // Para otros errores (red, servidor, etc.), permitir acceso temporalmente
        // El usuario puede seguir usando la aplicación mientras se resuelve el problema
        console.warn('Error de conectividad detectado, permitiendo acceso temporal');
        return of(true);
      })
    );
  }
}
