import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductosService, Producto, Categoria, PaginatedResponse } from '../../services/productos';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosComponent implements OnInit, OnDestroy {
  private productosService = inject(ProductosService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Datos originales
  allProductos: Producto[] = [];
  categorias: Categoria[] = [];
  productosStockBajo: Producto[] = [];
  
  // Datos filtrados
  productos: Producto[] = [];
  
  // Filtros y búsqueda
  searchTerm = '';
  selectedCategoria = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 20;
  
  // Estados
  isLoading = false;
  isFiltering = false;
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
    this.setupSearchDebounce();
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300), // Esperar 300ms después de que el usuario deje de escribir
      distinctUntilChanged(), // Solo emitir si el valor cambió
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.applyFilters();
      this.isFiltering = false;
    });
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

    // Cargar todos los productos para filtrado local
    this.loadAllProductos();

    // Cargar productos con stock bajo
    this.productosService.getProductosStockBajo().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productosStockBajo = response.data;
        }
      }
    });
  }

  loadAllProductos() {
    this.isLoading = true;
    
    // Cargar todos los productos sin paginación para filtrado local
    this.productosService.getProductos({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const paginatedData = response.data as PaginatedResponse<Producto>;
          this.allProductos = paginatedData.data;
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filteredProductos = [...this.allProductos];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredProductos = filteredProductos.filter(producto => 
        producto.nombre.toLowerCase().includes(searchLower) ||
        producto.codigo.toLowerCase().includes(searchLower) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por categoría
    if (this.selectedCategoria) {
      const categoriaId = parseInt(this.selectedCategoria);
      filteredProductos = filteredProductos.filter(producto => 
        producto.categoriaId === categoriaId
      );
    }

    // Actualizar totales
    this.totalItems = filteredProductos.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Aplicar paginación
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.productos = filteredProductos.slice(startIndex, endIndex);
  }

  onSearchChange() {
    this.isFiltering = true;
    this.searchSubject.next(this.searchTerm);
  }

  onCategoriaChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  buscarProductos() {
    this.currentPage = 1;
    this.applyFilters();
  }

  cambiarPagina(page: number) {
    this.currentPage = page;
    this.applyFilters();
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
          this.loadAllProductos();
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
          this.loadAllProductos();
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
