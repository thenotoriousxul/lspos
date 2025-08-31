import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  loginData: LoginCredentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  error = '';

  async onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      this.notificationService.warning('Por favor completa todos los campos');
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('¡Bienvenido a Lubricantes Sánchez!');
          this.router.navigate(['/dashboard']);
        } else {
          this.notificationService.error(response.message || 'Error al iniciar sesión');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.error('Credenciales inválidas');
        this.isLoading = false;
      }
    });
  }
}
