import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import cors from 'cors';

import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import loginRouter from './routes/login.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middlewares/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/auth', loginRouter);
app.use('/api/admin', adminRoutes);

// Servir front
const clientBuildPath = path.join(__dirname, '../client/dist');
// Servir archivos estáticos
app.use(express.static(clientBuildPath));

// Catch-all para cualquier otra ruta que no sea API
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});



// Error handler
app.use(errorHandler);

// Arrancar servidor
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
});
