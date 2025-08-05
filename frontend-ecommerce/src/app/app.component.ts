import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav style="background-color: #333; padding: 1rem;">
      <a routerLink="/" style="color: white; text-decoration: none; margin-right: 1rem;">Home</a>
      <a routerLink="/productos" style="color: white; text-decoration: none; margin-right: 1rem;">Productos</a>
      <a routerLink="/carrito" style="color: white; text-decoration: none; margin-right: 1rem;">Carrito</a>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    nav a:hover {
      color: #ddd !important;
    }
  `]
})
export class AppComponent {
  protected readonly title = signal('frontend-ecommerce');
} 