import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

class CartManager {
  // Obtiene todos los carritos
  async getCarts() {
    return await Cart.find().populate('products.productId');
  }

  // Busca un carrito por ID
  async getCartById(id) {
    const cart = await Cart.findById(id).populate('products.productId');
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.status = 404;
      throw error;
    }
    return cart;
  }

  async getCartByUserId(userId) {
    return await Cart.findOne({ userId, status: 'in_progress' }).populate('products.productId');
  }

  async createCart(userId) {
    const newCart = new Cart({ userId, products: [], status: 'in_progress' });
    await newCart.save();
    return newCart;
  }

  async addProductToCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.status = 404;
      throw error;
    }
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }
    if (cart.status !== 'in_progress') {
      const error = new Error('No se puede modificar un carrito que ya fue pagado.');
      error.status = 400;
      throw error;
    }
    const item = cart.products.find(p => p.productId.equals(productId));
    if (item) {
      if (item.quantity + 1 > product.stock) {
        const error = new Error('Cantidad supera stock disponible');
        error.status = 400;
        throw error;
      }
      item.quantity += 1;
    } else {
      if (product.stock < 1) {
        const error = new Error('Producto sin stock disponible');
        error.status = 400;
        throw error;
      }
      cart.products.push({ productId, quantity: 1 });
    }
    await cart.save();
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.status = 404;
      throw error;
    }
    if (cart.status !== 'in_progress') {
      const error = new Error('No se puede modificar un carrito que ya fue pagado.');
      error.status = 400;
      throw error;
    }
    const index = cart.products.findIndex(p => p.productId.equals(productId));
    if (index === -1) {
      const error = new Error('Producto no encontrado en el carrito');
      error.status = 404;
      throw error;
    }
    cart.products.splice(index, 1);
    await cart.save();
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    if (cart.status !== 'in_progress') {
      const error = new Error('No se puede modificar un carrito que ya fue pagado.');
      error.status = 400;
      throw error;
    }
    const item = cart.products.find(p => p.productId.equals(productId));
    if (!item) return null;
    const product = await Product.findById(productId);
    if (!product) throw new Error('Producto no encontrado');
    if (quantity > product.stock) throw new Error('Cantidad supera stock disponible');
    item.quantity = quantity;
    await cart.save();
    return cart;
  }

  async deleteCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.status = 404;
      throw error;
    }
    if (cart.status !== 'in_progress') {
      const error = new Error('No se puede eliminar un carrito que ya fue pagado.');
      error.status = 400;
      throw error;
    }
    await Cart.findByIdAndDelete(cartId);
  }

  async payCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.status = 404;
      throw error;
    }
    if (cart.status !== 'in_progress') {
      throw new Error('El carrito ya fue pagado.');
    }
    if (!cart.products || cart.products.length === 0) {
      throw new Error('El carrito está vacío.');
    }
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Producto con ID ${item.productId} no encontrado.`);
      if (product.stock < item.quantity) throw new Error(`Stock insuficiente para el producto ${product.title}.`);
    }
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }
    cart.status = 'paid';
    cart.paidAt = new Date();
    await cart.save();
  }

  async getPurchaseHistoryByUserId(userId) {
    return await Cart.find({ userId }).populate('products.productId');
  }
}

const cartManager = new CartManager();
export default cartManager;