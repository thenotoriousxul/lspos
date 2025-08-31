import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos';
import { VentasService, ItemCarrito, NuevaVenta } from '../../services/ventas';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-pos',
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.html',
  styleUrl: './pos.css'
})
export class PosComponent implements OnInit {
  private productosService = inject(ProductosService);
  private ventasService = inject(VentasService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  productos: Producto[] = [];
  carrito: ItemCarrito[] = [];
  searchTerm = '';
  codigoBarras = '';
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' = 'efectivo';
  clienteNombre = '';
  clienteTelefono = '';
  
  isLoading = false;
  isProcessingVenta = false;
  
  get subtotal(): number {
    return this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get total(): number {
    return this.subtotal;
  }

  ngOnInit() {
    this.loadProductos();
  }

  private loadProductos() {
    this.isLoading = true;
    this.productosService.getProductos({ limit: 50 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productos = response.data.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false;
      }
    });
  }

  buscarProducto() {
    if (this.searchTerm.length >= 2) {
      this.productosService.getProductos({ search: this.searchTerm, limit: 20 }).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.productos = response.data.data;
          }
        }
      });
    } else if (this.searchTerm.length === 0) {
      this.loadProductos();
    }
  }

  buscarPorCodigo() {
    if (this.codigoBarras) {
      this.productosService.buscarProductoPorCodigo(this.codigoBarras).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.agregarAlCarrito(response.data);
            this.codigoBarras = '';
          }
        },
        error: () => {
          this.notificationService.warning('Producto no encontrado');
          this.codigoBarras = '';
        }
      });
    }
  }

  agregarAlCarrito(producto: Producto, cantidad: number = 1) {
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
    } else {
      this.carrito.push({
        producto,
        cantidad,
        subtotal: cantidad * producto.precio
      });
    }
  }

  actualizarCantidad(index: number, cantidad: number) {
    if (cantidad <= 0) {
      this.carrito.splice(index, 1);
    } else {
      this.carrito[index].cantidad = cantidad;
      this.carrito[index].subtotal = cantidad * this.carrito[index].producto.precio;
    }
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }

  limpiarCarrito() {
    this.carrito = [];
    this.clienteNombre = '';
    this.clienteTelefono = '';
  }

  procesarVenta() {
    if (this.carrito.length === 0) {
      this.notificationService.warning('El carrito está vacío');
      return;
    }

    if (!this.metodoPago) {
      this.notificationService.warning('Selecciona un método de pago');
      return;
    }

    this.isProcessingVenta = true;

    const nuevaVenta: NuevaVenta = {
      productos: this.carrito.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      })),
      metodoPago: this.metodoPago,
      clienteNombre: this.clienteNombre || undefined,
      clienteTelefono: this.clienteTelefono || undefined
    };

    this.ventasService.crearVenta(nuevaVenta).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(`¡Venta procesada exitosamente! Ticket: ${response.data?.numeroTicket}`);
          this.limpiarCarrito();
        }
        this.isProcessingVenta = false;
      },
      error: (err) => {
        this.notificationService.error('Error al procesar la venta: ' + (err.error?.message || 'Error desconocido'));
        this.isProcessingVenta = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
