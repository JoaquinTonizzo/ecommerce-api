import { Routes } from '@angular/router';
import { Home} from './pages/home/home';
import { Productos } from './pages/productos/productos';
import { Carrito } from './pages/carrito/carrito';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'productos', component: Productos },
  { path: 'carrito', component: Carrito },
];
