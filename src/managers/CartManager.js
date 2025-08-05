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

  async getCartByUserId(userId) {
    const carts = await this.getCarts();
    return carts.find(c => c.userId === userId);
  }

  async createCart(userId) {
    const carts = await this.getCarts();

    // Determina el ID más alto actual y suma 1
    const newId = carts.length > 0
      ? (parseInt(carts[carts.length - 1].id) + 1).toString()
      : '1';

    const newCart = {
      id: newId,
      userId: userId,
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

    // Validar stock al agregar o incrementar cantidad
    if (productIndex !== -1) {
      if (cart.products[productIndex].quantity + 1 > product.stock) {
        const error = new Error('Cantidad supera stock disponible');
        error.status = 400;
        throw error;
      }
      cart.products[productIndex].quantity += 1;
    } else {
      if (product.stock < 1) {
        const error = new Error('Producto sin stock disponible');
        error.status = 400;
        throw error;
      }
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

  // Quitar un producto a un carrito existente
  async updateProductQuantity(cartId, productId, quantity) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);
    if (cartIndex === -1) return null;

    const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId);
    if (productIndex === -1) return null;

    // Validar stock con productManager
    const product = await productManager.getProductById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (quantity > product.stock) {
      throw new Error('Cantidad supera stock disponible');
    }

    carts[cartIndex].products[productIndex].quantity = quantity;

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return carts[cartIndex];
  }

  async deleteCart(cartId) {
    const carts = await this.getCarts();
    const index = carts.findIndex(c => c.id === cartId);
    if (index === -1) {
      const error = new Error('Carrito no encontrado');
      error.status = 404;
      throw error;
    }
    carts.splice(index, 1);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
  }
}

const cartManager = new CartManager('./src/data/carts.json');
export default cartManager;