import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import { VentasService, EstadisticasVentas } from '../../services/ventas';
import { ProductosService } from '../../services/productos';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private ventasService = inject(VentasService);
  private productosService = inject(ProductosService);
  private router = inject(Router);
  private userSubscription?: Subscription;

  currentUser: User | null = null;
  estadisticas: EstadisticasVentas = {
    totalVentas: 0,
    ventasHoy: 0,
    ingresosTotales: 0,
    ingresosHoy: 0
  };
  productosStockBajo: any[] = [];
  isLoading = true;

  ngOnInit() {
    // Suscribirse al observable del usuario para obtener datos actualizados
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadDashboardData();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private loadDashboardData() {
    this.isLoading = true;

    // Cargar estadísticas de ventas
    this.ventasService.getEstadisticas().subscribe({
      next: (response) => {
        console.log('Respuesta de estadísticas:', response);
        if (response.success && response.data) {
          // Convertir valores a números para asegurar el tipo correcto
          this.estadisticas = {
            totalVentas: Number(response.data.totalVentas) || 0,
            ventasHoy: Number(response.data.ventasHoy) || 0,
            ingresosTotales: Number(response.data.ingresosTotales) || 0,
            ingresosHoy: Number(response.data.ingresosHoy) || 0
          };
          console.log('Estadísticas procesadas:', this.estadisticas);
        }
      },
      error: (err) => console.error('Error cargando estadísticas:', err)
    });

    // Cargar productos con stock bajo
    this.productosService.getProductosStockBajo().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productosStockBajo = response.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos stock bajo:', err);
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToPos() {
    this.router.navigate(['/pos']);
  }

  navigateToProductos() {
    this.router.navigate(['/productos']);
  }
}
