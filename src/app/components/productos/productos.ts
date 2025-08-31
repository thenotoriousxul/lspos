import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService, Producto, Categoria, PaginatedResponse } from '../../services/productos';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosComponent implements OnInit {
  private productosService = inject(ProductosService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  productosStockBajo: Producto[] = [];
  
  // Filtros y búsqueda
  searchTerm = '';
  selectedCategoria = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  
  // Estados
  isLoading = false;
  showModal = false;
  editMode = false;
  
  // Producto para editar/crear
  currentProducto: Partial<Producto> = {
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    costo: 0,
    stock: 0,
    stockMinimo: 0,
    categoriaId: 0,
    activo: true
  };

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    this.isLoading = true;
    
    // Cargar categorías
    this.productosService.getCategorias().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categorias = response.data;
        }
      }
    });

    // Cargar productos
    this.loadProductos();

    // Cargar productos con stock bajo
    this.productosService.getProductosStockBajo().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productosStockBajo = response.data;
        }
      }
    });
  }

  loadProductos() {
    this.isLoading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: 20
    };
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    
    if (this.selectedCategoria) {
      params.categoria_id = parseInt(this.selectedCategoria);
    }

    this.productosService.getProductos(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const paginatedData = response.data as PaginatedResponse<Producto>;
          this.productos = paginatedData.data;
          this.totalPages = paginatedData.meta.lastPage;
          this.totalItems = paginatedData.meta.total;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false;
      }
    });
  }

  buscarProductos() {
    this.currentPage = 1;
    this.loadProductos();
  }

  cambiarPagina(page: number) {
    this.currentPage = page;
    this.loadProductos();
  }

  abrirModal(producto?: Producto) {
    this.showModal = true;
    this.editMode = !!producto;
    
    if (producto) {
      this.currentProducto = { ...producto };
    } else {
      this.currentProducto = {
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: 0,
        costo: 0,
        stock: 0,
        stockMinimo: 0,
        categoriaId: 0,
        activo: true
      };
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.editMode = false;
    this.currentProducto = {};
  }

  guardarProducto() {
    if (!this.currentProducto.codigo || !this.currentProducto.nombre || !this.currentProducto.categoriaId) {
      this.notificationService.warning('Por favor completa todos los campos obligatorios');
      return;
    }

    const operacion = this.editMode 
      ? this.productosService.updateProducto(this.currentProducto.id!, this.currentProducto)
      : this.productosService.createProducto(this.currentProducto);

    operacion.subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(this.editMode ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
          this.cerrarModal();
          this.loadProductos();
        }
      },
      error: (err) => {
        this.notificationService.error('Error al guardar producto: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }

  eliminarProducto(producto: Producto) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"?`)) {
      this.productosService.deleteProducto(producto.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Producto eliminado exitosamente');
            this.loadProductos();
          }
        },
        error: (err) => {
          this.notificationService.error('Error al eliminar producto: ' + (err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  getNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
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
}
