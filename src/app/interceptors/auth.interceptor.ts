import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  
  // Agregar el token a todas las peticiones (excepto login/register)
  const token = localStorage.getItem('auth_token');
  
  if (token && !request.url.includes('/auth/login') && !request.url.includes('/auth/register')) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Unauthorized) o 403 (Forbidden), el token es inválido
      if (error.status === 401 || error.status === 403) {
        console.error('Token inválido detectado en interceptor:', error);
        authService.logout();
      }
      return throwError(() => error);
    })
  );
}
