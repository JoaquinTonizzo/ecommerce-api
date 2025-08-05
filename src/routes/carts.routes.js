import express from 'express';
import cartManager from '../managers/CartManager.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const manager = cartManager;

// POST /api/carts/ => Crear nuevo carrito
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // viene del token JWT
    const existing = await manager.getCartByUserId(userId);
    if (existing) return res.status(409).json({ error: 'El usuario ya tiene un carrito' });

    const newCart = await manager.createCart(userId);
    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/history => Obtener historial de pedidos pagados del usuario
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await manager.getPurchaseHistoryByUserId(userId);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/:cid => Obtener productos del carrito
router.get('/:cid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Solo el dueño o admin
    if (req.user.id !== cart.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver este carrito' });
    }

    res.json(cart.products);
  } catch (error) {
    next(error);
  }
});

// POST /api/carts/:cid/product/:pid => Agregar producto al carrito
router.post('/:cid/product/:pid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Validar que el carrito pertenezca al usuario autenticado
    if (cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await manager.addProductToCart(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (error) {
    if (
      error.message === 'Producto no encontrado' ||
      error.message === 'Cantidad supera stock disponible' ||
      error.message === 'Producto sin stock disponible'
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/carts/:cid/product/:pid => Quitar producto del carrito
router.delete('/:cid/product/:pid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    if (cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await manager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (error) {
    if (error.message === 'Carrito no encontrado' || error.message === 'Producto no encontrado en el carrito') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// PUT /api/carts/:cid/product/:pid => Actualizar cantidad de producto en carrito
router.put('/:cid/product/:pid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    if (cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para modificar este carrito' });
    }

    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Cantidad inválida. Debe ser un número entero mayor o igual a 1.' });
    }

    const updatedCart = await manager.updateProductQuantity(req.params.cid, req.params.pid, quantity);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.json(updatedCart);
  } catch (error) {
    if (
      error.message === 'Producto no encontrado' ||
      error.message === 'Cantidad supera stock disponible'
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/carts/:cid => Eliminar carrito (sólo dueño)
router.delete('/:cid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Validar que el carrito pertenezca al usuario autenticado
    if (cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para eliminar este carrito' });
    }

    await manager.deleteCart(req.params.cid);

    res.json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

// POST /api/carts/:cid/pay => Pagar el carrito
router.post('/:cid/pay', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);

    // Validar que el carrito pertenezca al usuario autenticado o sea admin
    if (cart.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para pagar este carrito' });
    }

    const result = await manager.payCart(req.params.cid);
    res.json({ message: 'Carrito pagado correctamente', cart: result });
  } catch (error) {
    if (error.status) {
      // Si el error tiene status, lo usás para responder
      res.status(error.status).json({ error: error.message });
    } else {
      // Si es otro error inesperado, lo pasás al middleware de manejo de errores
      next(error);
    }
  }
});

export default router;
