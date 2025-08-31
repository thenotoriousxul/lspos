import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { PosComponent } from './components/pos/pos';
import { ProductosComponent } from './components/productos/productos';
import { ReportesComponent } from './components/reportes/reportes';
import { UsuariosComponent } from './components/usuarios/usuarios';

// Guard para rutas públicas (login)
const publicGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'pos', 
    component: PosComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'productos', 
    component: ProductosComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'usuarios', 
    component: UsuariosComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'reportes', 
    component: ReportesComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
