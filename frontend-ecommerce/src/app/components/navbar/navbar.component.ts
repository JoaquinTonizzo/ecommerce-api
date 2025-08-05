import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/productos">Productos</a>
      <a routerLink="/carrito">Carrito</a>
    </nav>
  `,
  styles: [`
    nav {
      background-color: #333;
      padding: 1rem;
    }
    nav a {
      color: white;
      text-decoration: none;
      margin-right: 1rem;
    }
    nav a:hover {
      color: #ddd;
    }
  `]
})
export class NavbarComponent {

} 