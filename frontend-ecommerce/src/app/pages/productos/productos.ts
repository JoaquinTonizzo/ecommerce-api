import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos {
  productos: any[] = [];
  loading = true;
  modalVisible = false;
  productoSeleccionado: any = null;

  constructor(public auth: AuthService, private http: HttpClient) {
    this.http.get<any[]>('http://localhost:8080/api/products/')
      .subscribe({
        next: (data) => {
          this.productos = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  agregarAlCarrito(producto: string) {
    if (!this.auth.isLoggedIn()) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      return;
    }
    alert(`Producto "${producto}" agregado al carrito!`);
  }

  verDetalle(producto: any) {
    this.productoSeleccionado = producto;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.productoSeleccionado = null;
  }
}
