// Importamos Express
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lee el .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Importamos los enrutadores
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import loginRouter from './routes/login.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Middleware de manejo de errores
import { errorHandler } from './middlewares/error-handler.js';

// Creamos la app
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const manager = productManager;

// Handlebars setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Habilitar CORS para permitir peticiones desde el frontend Angular
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:5173' }));

// Puerto desde variables de entorno
const PORT = process.env.PORT;

// Middleware para que Express entienda JSON
app.use(express.json());

// Rutas de la API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/auth', loginRouter);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente 🚀');
});

// Middleware global de errores (debe ir al final del flujo)
app.use(errorHandler);

// Arrancamos el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
  });
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
