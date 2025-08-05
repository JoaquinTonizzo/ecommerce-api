// Importamos Express
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
