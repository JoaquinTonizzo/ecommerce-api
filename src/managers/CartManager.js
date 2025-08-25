import fs from "fs";
import productManager from './ProductManager.js';

class CartManager {
  constructor(path) {
    this.path = path;
  }

  // Obtiene todos los carritos del archivo JSON
  async getCarts() {
    if (fs.existsSync(this.path)) {
      const carts = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(carts);
    }
    return [];
  }

  // Busca un carrito por ID, lanza error si no lo encuentra
  async getCartById(id) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find((cart) => cart.id === id);
      if (!cart) {
        const error = new Error("Carrito no encontrado");
        error.status = 404;
        throw error;
      }
      return cart;
    } catch (error) {
      throw error;
    }
  }

  // Crea un carrito nuevo con ID incremental y lista vacía de productos
  async createCart() {
    const carts = await this.getCarts();

    // Determina el ID más alto actual y suma 1
    const newId = carts.length > 0
      ? (parseInt(carts[carts.length - 1].id) + 1).toString()
      : '1';

    const newCart = {
      id: newId,
      products: [],
    };

    carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  // Agrega un producto a un carrito existente
  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex((cart) => cart.id === cartId);

    // Si no existe el carrito, lanza un error con código 404
    if (cartIndex === -1) {
      const error = new Error("Carrito no encontrado");
      error.status = 404;
      throw error;
    }

    // Si no existe el producto, lanza un error con código 404
    const product = await productManager.getProductById(productId);
    if (!product) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(
      (p) => p.product === productId
    );

    // Si el producto ya está en el carrito, aumenta la cantidad
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      // Si no está, lo agrega con cantidad 1
      cart.products.push({ product: productId, quantity: 1 });
    }

    // Actualiza el carrito en la lista y escribe el archivo
    carts[cartIndex] = cart;
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }

  // Quitar un producto a un carrito existente
  async removeProductFromCart(cartId, productId) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex((cart) => cart.id === cartId);

    // Si no existe el carrito, lanza un error con código 404
    if (cartIndex === -1) {
      const error = new Error("Carrito no encontrado");
      error.status = 404;
      throw error;
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(
      (p) => p.product === productId
    );

    if (productIndex === -1) {
      // Si el producto no está en el carrito, lanzamos error
      const error = new Error("Producto no encontrado en el carrito");
      error.status = 404;
      throw error;
    }

    // Reducimos la cantidad del producto en 1
    cart.products[productIndex].quantity -= 1;

    // Si la cantidad llega a cero o menos, eliminamos el producto del carrito
    if (cart.products[productIndex].quantity <= 0) {
      cart.products.splice(productIndex, 1);
    }

    // Actualizamos el carrito en la lista y escribimos en el archivo
    carts[cartIndex] = cart;
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));

    return cart;
  }
}

const cartManager = new CartManager('src/data/carts.json');
export default cartManager;