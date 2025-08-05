import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Productos } from './pages/productos/productos';
import { Carrito } from './pages/carrito/carrito';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'productos', component: Productos },
  { path: 'carrito', component: Carrito, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
];
