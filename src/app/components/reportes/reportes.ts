import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VentasService, Venta, EstadisticasVentas } from '../../services/ventas';
import { ProductosService, Producto } from '../../services/productos';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {
  private ventasService = inject(VentasService);
  private productosService = inject(ProductosService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Datos
  ventas: Venta[] = [];
  estadisticas: EstadisticasVentas = {
    totalVentas: 0,
    ventasHoy: 0,
    ingresosTotales: 0,
    ingresosHoy: 0
  };
  productosStockBajo: Producto[] = [];
  ventasPorDia: any[] = [];

  // Filtros
  fechaInicio = '';
  fechaFin = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;

  // Estados
  isLoading = false;
  activeTab = 'ventas';

  ngOnInit() {
    this.setDefaultDates();
    this.loadData();
  }

  private setDefaultDates() {
    // Para incluir ventas recientes, usar un rango amplio
    // que incluya desde agosto 2024 hasta diciembre 2025
    const today = new Date();
    const startDate = new Date('2024-08-01'); // Desde agosto 2024
    const endDate = new Date('2025-12-31'); // Hasta diciembre 2025
    
    this.fechaInicio = startDate.toISOString().split('T')[0];
    this.fechaFin = endDate.toISOString().split('T')[0];
  }

  loadData() {
    this.loadEstadisticas();
    this.loadVentas();
    this.loadProductosStockBajo();
    this.loadVentasPorDia();
  }

  loadEstadisticas() {
    const params: any = {};
    if (this.fechaInicio) params.fecha_inicio = this.fechaInicio;
    if (this.fechaFin) params.fecha_fin = this.fechaFin;

    this.ventasService.getEstadisticas(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.estadisticas = response.data;
        }
      }
    });
  }

  loadVentas() {
    this.isLoading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: 20
    };
    
    // Restaurar filtros de fecha
    if (this.fechaInicio) params.fecha_inicio = this.fechaInicio;
    if (this.fechaFin) params.fecha_fin = this.fechaFin;

    this.ventasService.getVentas(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.ventas = response.data.data;
          this.totalPages = response.data.meta.lastPage;
          this.totalItems = response.data.meta.total;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando ventas:', err);
        this.isLoading = false;
      }
    });
  }

  loadProductosStockBajo() {
    this.productosService.getProductosStockBajo().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productosStockBajo = response.data;
        }
      }
    });
  }

  loadVentasPorDia() {
    // Simulamos datos para el gráfico de ventas por día
    // En una implementación real, esto vendría del backend
    const diasEnRango = this.getDaysInRange();
    this.ventasPorDia = diasEnRango.map(dia => ({
      fecha: dia,
      ventas: Math.floor(Math.random() * 20) + 5,
      ingresos: Math.floor(Math.random() * 10000) + 2000
    }));
  }

  private getDaysInRange(): string[] {
    const start = new Date(this.fechaInicio);
    const end = new Date(this.fechaFin);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0]);
    }
    
    return days;
  }

  filtrarReportes() {
    this.currentPage = 1;
    this.loadData();
  }

  cambiarPagina(page: number) {
    this.currentPage = page;
    this.loadVentas();
  }

  cambiarTab(tab: string) {
    this.activeTab = tab;
  }

  exportarExcel() {
    // Implementar exportación a Excel
    this.notificationService.info('Función de exportación a Excel en desarrollo');
  }

  exportarPDF() {
    // Implementar exportación a PDF
    this.notificationService.info('Función de exportación a PDF en desarrollo');
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  get paginasArray(): number[] {
    const pages = [];
    const maxPages = Math.min(this.totalPages, 10);
    const startPage = Math.max(1, this.currentPage - 5);
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getTotalVentasPorDia(): number {
    return this.ventasPorDia.reduce((sum, dia) => sum + dia.ventas, 0);
  }

  getTotalIngresosPorDia(): number {
    return this.ventasPorDia.reduce((sum, dia) => sum + dia.ingresos, 0);
  }
}
