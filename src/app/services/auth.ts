import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, interval, fromEvent, catchError, of } from 'rxjs';
import { ApiService, ApiResponse } from './api';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: {
    type: string;
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenValidationInterval: any;
  private lastTokenValidation = 0;
  private isLoggingOut = false; 

  constructor(private api: ApiService) {
    // Verificar si hay un usuario logueado al inicializar
    this.checkAuthStatus();
    
    // Configurar validación automática del token
    this.setupTokenValidation();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Al recargar la página, confiar en el token del localStorage
      // La validación real se hará de forma silenciosa en el background
      console.log('Token encontrado en localStorage, validando en background...');
      
      // No hacer logout inmediatamente si hay problemas de red
      // En su lugar, hacer una validación silenciosa que no afecte la experiencia del usuario
      setTimeout(() => {
        this.validateTokenSilently();
      }, 1000); // Esperar 1 segundo antes de validar
    }
  }

  private setupTokenValidation(): void {
    // Validar token cada 30 segundos
    this.tokenValidationInterval = setInterval(() => {
      this.validateTokenSilently();
    }, 30000);

    // Validar token cuando la ventana recupera el foco
    fromEvent(window, 'focus').subscribe(() => {
      this.validateTokenSilently();
    });

    // Validar token cuando el usuario regresa a la pestaña
    fromEvent(document, 'visibilitychange').subscribe(() => {
      if (!document.hidden) {
        this.validateTokenSilently();
      }
    });
  }

  private validateTokenSilently(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Evitar validaciones muy frecuentes (mínimo 10 segundos entre validaciones)
    const now = Date.now();
    if (now - this.lastTokenValidation < 10000) return;
    
    this.lastTokenValidation = now;

    this.validateTokenRobust().subscribe(isValid => {
      if (!isValid) {
        console.log('Token inválido detectado en validación automática');
        this.logout();
      }
    });
  }

  private validateTokenRobust(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(response => {
        if (response.success && response.data) {
          // Token válido, actualizar usuario si no está establecido
          if (!this.currentUserSubject.value) {
            this.currentUserSubject.next(response.data);
          }
          return true;
        } else {
          console.log('Token inválido detectado');
          return false;
        }
      }),
      catchError(error => {
        console.log('Error validando token:', error);
        // Solo considerar inválido si es un error de autenticación específico
        if (error.status === 401 || error.status === 403) {
          return of(false);
        }
        // Para otros errores (red, servidor, etc.), considerar válido temporalmente
        return of(true);
      })
    );
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      map((response) => {
        if (response.success && response.data) {
          localStorage.setItem('auth_token', response.data.token.token);
          this.currentUserSubject.next(response.data.user);
        }
        return response;
      })
    );
  }

  register(userData: RegisterData): Observable<ApiResponse<AuthResponse>> {
    return this.api.post<AuthResponse>('/auth/register', userData).pipe(
      map((response) => {
        if (response.success && response.data) {
          localStorage.setItem('auth_token', response.data.token.token);
          this.currentUserSubject.next(response.data.user);
        }
        return response;
      })
    );
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }
    
    this.isLoggingOut = true;

    if (this.tokenValidationInterval) {
      clearInterval(this.tokenValidationInterval);
      this.tokenValidationInterval = null;
    }

    // Intentar hacer logout en el servidor (opcional, puede fallar si el token es inválido)
    this.api.delete('/auth/logout').subscribe({
      error: () => {
        // Ignorar errores del logout del servidor si el token es inválido
      }
    });
    
    // Limpiar localStorage completamente
    localStorage.removeItem('auth_token');
    localStorage.clear(); // Limpiar cualquier otro dato de sesión
    
    // Limpiar el usuario actual
    this.currentUserSubject.next(null);
    
    // Redirigir al login
    window.location.href = '/login';
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.api.get<User>('/auth/me');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Método público para validar token manualmente
  validateToken(): Observable<boolean> {
    return this.validateTokenRobust().pipe(
      map(isValid => {
        if (!isValid) {
          this.logout();
        }
        return isValid;
      })
    );
  }
}
