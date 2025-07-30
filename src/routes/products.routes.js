import express from 'express';
import productManager from '../managers/ProductManager.js';

const router = express.Router();
const manager = productManager;

// Ruta GET '/' -> Lista todos los productos
router.get('/', async (req, res, next) => {
  try {
    const products = await manager.getProducts();
    res.json(products);
  } catch (error) {
    next(error); // En caso de error, pasa al middleware de manejo de errores
  }
});

// Ruta GET '/:pid' -> Obtiene un producto por su ID
router.get('/:pid', async (req, res, next) => {
  try {
    const product = await manager.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Ruta POST '/' -> Crea un nuevo producto
router.post('/', async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío o no es válido' });
    }

    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || price == null || status == null || stock == null || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const newProduct = await manager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// Ruta PUT '/:pid' -> Actualiza un producto existente
router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Ruta DELETE '/:pid' -> Elimina un producto por ID
router.delete('/:pid', async (req, res, next) => {
  try {
    const deleted = await manager.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default router;
// Exportamos el router para usarlo en el servidor principal
