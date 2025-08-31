import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-token-validator',
  template: '', // Componente invisible
  standalone: true
})
export class TokenValidatorComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private storageSubscription?: Subscription;
  private lastToken = '';

  ngOnInit() {
    this.lastToken = localStorage.getItem('auth_token') || '';
    
    // Detectar cambios en localStorage (solo para cambios desde otras pestañas)
    this.storageSubscription = fromEvent(window, 'storage').subscribe((event: any) => {
      if (event.key === 'auth_token') {
        const newToken = event.newValue;
        if (newToken !== this.lastToken) {
          console.log('Cambio detectado en auth_token desde otra pestaña, validando...');
          this.lastToken = newToken || '';
          this.authService.validateToken().subscribe();
        }
      }
    });

    // Detectar cambios en el mismo contexto (cuando se modifica desde la misma pestaña)
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = (key: string, value: string) => {
      if (key === 'auth_token' && value !== this.lastToken) {
        console.log('Token modificado en localStorage, validando...');
        this.lastToken = value;
        // Solo validar si el token no está vacío
        if (value) {
          setTimeout(() => this.authService.validateToken().subscribe(), 100);
        }
      }
      originalSetItem.call(localStorage, key, value);
    };

    localStorage.removeItem = (key: string) => {
      if (key === 'auth_token') {
        console.log('Token removido de localStorage');
        this.lastToken = '';
        // No hacer nada aquí para evitar bucles
        // El logout se manejará desde el interceptor o validación automática
      }
      originalRemoveItem.call(localStorage, key);
    };
  }

  ngOnDestroy() {
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
  }
}
