// Importamos Express (framework del servidor)
import express from 'express';

// Importamos los enrutadores (rutas separadas por responsabilidad)
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';

// Importamos el middleware de manejo de errores personalizado
import { errorHandler } from './middlewares/error-handler.js';

import { engine } from 'express-handlebars';
import http from 'http';
import { Server } from 'socket.io';
import productManager from './managers/ProductManager.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const manager = productManager;

// Handlebars setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Definimos el puerto en el que va a escuchar el servidor
const PORT = 8080;

// Middleware para que Express entienda JSON en el body de las peticiones
app.use(express.json());

// Rutas principales de la API:
// Todo lo que empiece con /api/products va a ser manejado por productsRouter
app.use('/api/products', productsRouter);

// Todo lo que empiece con /api/carts va a ser manejado por cartsRouter
app.use('/api/carts', cartsRouter);

// Router para vistas
app.use('/', viewsRouter);

// Middleware de manejo de errores personalizado. SIEMPRE después de las rutas
app.use(errorHandler);

// Iniciamos el servidor y lo ponemos a escuchar en el puerto indicado
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

io.on('connection', async (socket) => {
  socket.emit('products', await manager.getProducts());

  socket.on('addProduct', async (data) => {
    await manager.addProduct(data);
    io.emit('products', await manager.getProducts());
  });

  socket.on('deleteProduct', async (id) => {
    try {
      await manager.deleteProduct(id);
      io.emit('products', await manager.getProducts());
    } catch (error) {
      socket.emit('error', { message: error.message, status: error.status || 500 });
    }
  });
});

export { io };
