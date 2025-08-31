import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
  productos?: Producto[];
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  categoriaId: number;
  activo: boolean;
  imagen: string | null;
  createdAt: string;
  updatedAt: string;
  categoria?: Categoria;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private api: ApiService) {}

  // Categorías
  getCategorias(): Observable<ApiResponse<Categoria[]>> {
    return this.api.get<Categoria[]>('/categorias');
  }

  getCategoria(id: number): Observable<ApiResponse<Categoria>> {
    return this.api.get<Categoria>(`/categorias/${id}`);
  }

  createCategoria(categoria: Partial<Categoria>): Observable<ApiResponse<Categoria>> {
    return this.api.post<Categoria>('/categorias', categoria);
  }

  updateCategoria(id: number, categoria: Partial<Categoria>): Observable<ApiResponse<Categoria>> {
    return this.api.put<Categoria>(`/categorias/${id}`, categoria);
  }

  deleteCategoria(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/categorias/${id}`);
  }

  // Productos
  getProductos(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoria_id?: number;
  }): Observable<ApiResponse<PaginatedResponse<Producto>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoria_id) queryParams.append('categoria_id', params.categoria_id.toString());

    const endpoint = `/productos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<Producto>>(endpoint);
  }

  getProducto(id: number): Observable<ApiResponse<Producto>> {
    return this.api.get<Producto>(`/productos/${id}`);
  }

  buscarProductoPorCodigo(codigo: string): Observable<ApiResponse<Producto>> {
    return this.api.get<Producto>(`/productos/buscar/${codigo}`);
  }

  createProducto(producto: Partial<Producto>): Observable<ApiResponse<Producto>> {
    return this.api.post<Producto>('/productos', producto);
  }

  updateProducto(id: number, producto: Partial<Producto>): Observable<ApiResponse<Producto>> {
    return this.api.put<Producto>(`/productos/${id}`, producto);
  }

  deleteProducto(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/productos/${id}`);
  }

  getProductosStockBajo(): Observable<ApiResponse<Producto[]>> {
    return this.api.get<Producto[]>('/productos/stock-bajo');
  }
}
