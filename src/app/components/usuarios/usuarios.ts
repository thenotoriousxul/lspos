import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { PermissionsService } from '../../services/permissions';
import { ApiService, ApiResponse } from '../../services/api';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private permissionsService = inject(PermissionsService);
  private apiService = inject(ApiService);

  usuarios: User[] = [];
  isLoading = false;
  showModal = false;
  editMode = false;

  currentUsuario: Partial<User> = {
    fullName: '',
    email: '',
    role: 'employee',
    password: ''
  };

  ngOnInit() {
    if (!this.permissionsService.canManageUsers()) {
      this.notificationService.error('No tienes permisos para acceder a esta sección');
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.isLoading = true;
    this.apiService.get<User[]>('/usuarios').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.usuarios = response.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.notificationService.error('Error al cargar usuarios');
        this.isLoading = false;
      }
    });
  }

  abrirModal(usuario?: User) {
    this.showModal = true;
    this.editMode = !!usuario;
    
    if (usuario) {
      this.currentUsuario = { ...usuario };
    } else {
      this.currentUsuario = {
        fullName: '',
        email: '',
        role: 'employee',
        password: ''
      };
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.editMode = false;
    this.currentUsuario = {
      fullName: '',
      email: '',
      role: 'employee',
      password: ''
    };
  }

  guardarUsuario() {
    if (!this.currentUsuario.fullName || !this.currentUsuario.email) {
      this.notificationService.warning('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!this.editMode && !this.currentUsuario.password) {
      this.notificationService.warning('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    const operacion = this.editMode 
      ? this.apiService.put<User>(`/usuarios/${this.currentUsuario.id}`, this.currentUsuario)
      : this.apiService.post<User>('/usuarios', this.currentUsuario);

    operacion.subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(
            this.editMode ? 'Usuario actualizado exitosamente' : 'Usuario registrado exitosamente'
          );
          this.cerrarModal();
          this.loadUsuarios();
        }
      },
      error: (err) => {
        this.notificationService.error('Error al guardar usuario: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }

  eliminarUsuario(usuario: User) {
    if (usuario.id === this.authService.currentUser?.id) {
      this.notificationService.error('No puedes eliminar tu propia cuenta');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar a "${usuario.fullName}"?`)) {
      this.apiService.delete<void>(`/usuarios/${usuario.id}`).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Usuario eliminado exitosamente');
            this.loadUsuarios();
          }
        },
        error: (err) => {
          this.notificationService.error('Error al eliminar usuario: ' + (err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  getRoleDisplayName(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Empleado';
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  }

  canManageUsers(): boolean {
    return this.permissionsService.canManageUsers();
  }

  canDeleteUser(usuario: User): boolean {
    return this.permissionsService.can('usuarios.delete') && usuario.id !== this.authService.currentUser?.id;
  }
}
