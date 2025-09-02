// Importamos Express
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import cors from 'cors'; // <--- IMPORTANTE

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

// Habilitar CORS
app.use(cors({ origin: 'http://localhost:5173' }));

// Middleware para JSON
app.use(express.json());

// Puerto desde variables de entorno
const PORT = process.env.PORT || 3000;

// Rutas de la API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/auth', loginRouter);
app.use('/api/admin', adminRoutes);

// === Servir el front construido de Vite ===
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Middleware global de errores
app.use(errorHandler);

// Arrancamos el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
  });
});
