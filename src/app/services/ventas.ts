import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api';
import { User } from './auth';
import { Producto, PaginatedResponse } from './productos';

export interface DetalleVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  producto?: Producto;
}

export interface Venta {
  id: number;
  numeroTicket: string;
  subtotal: number;
  impuestos: number;
  total: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  clienteNombre: string | null;
  clienteTelefono: string | null;
  usuarioId: number;
  estado: 'completada' | 'cancelada' | 'pendiente';
  createdAt: string;
  updatedAt: string;
  usuario?: User;
  detalles?: DetalleVenta[];
}

export interface NuevaVenta {
  productos: {
    productoId: number;
    cantidad: number;
  }[];
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  clienteNombre?: string;
  clienteTelefono?: string;
  impuestos?: number;
}

export interface EstadisticasVentas {
  totalVentas: number;
  ventasHoy: number;
  ingresosTotales: number;
  ingresosHoy: number;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private api: ApiService) {}

  getVentas(params?: {
    page?: number;
    limit?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<ApiResponse<PaginatedResponse<Venta>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

    const endpoint = `/ventas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<Venta>>(endpoint);
  }

  getVenta(id: number): Observable<ApiResponse<Venta>> {
    return this.api.get<Venta>(`/ventas/${id}`);
  }

  crearVenta(venta: NuevaVenta): Observable<ApiResponse<Venta>> {
    return this.api.post<Venta>('/ventas', venta);
  }

  cancelarVenta(id: number): Observable<ApiResponse<void>> {
    return this.api.patch<void>(`/ventas/${id}/cancelar`, {});
  }

  getEstadisticas(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<ApiResponse<EstadisticasVentas>> {
    const queryParams = new URLSearchParams();
    if (params?.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

    const endpoint = `/ventas/estadisticas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<EstadisticasVentas>(endpoint);
  }
}
