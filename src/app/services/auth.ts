import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiService, ApiResponse } from './api';

export interface User {
  id: number;
  fullName: string;
  email: string;
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

  constructor(private api: ApiService) {
    // Verificar si hay un usuario logueado al inicializar
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.getCurrentUser().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
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
    this.api.delete('/auth/logout').subscribe();
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
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
}
