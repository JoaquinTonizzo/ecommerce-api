// Importamos Express (framework del servidor)
import express from 'express';

// Importamos los enrutadores (rutas separadas por responsabilidad)
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';

// Importamos el middleware de manejo de errores personalizado
import { errorHandler } from './middlewares/error-handler.js';

// Creamos la app de Express
const app = express();

// Definimos el puerto en el que va a escuchar el servidor
const PORT = 8080;

// Middleware para que Express entienda JSON en el body de las peticiones
app.use(express.json());

// Rutas principales de la API:
// Todo lo que empiece con /api/products va a ser manejado por productsRouter
app.use('/api/products', productsRouter);

// Todo lo que empiece con /api/carts va a ser manejado por cartsRouter
app.use('/api/carts', cartsRouter);

// Middleware de manejo de errores personalizado. SIEMPRE después de las rutas
app.use(errorHandler);

// Iniciamos el servidor y lo ponemos a escuchar en el puerto indicado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
