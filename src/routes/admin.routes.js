import express from 'express';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();
const USERS_FILE = './src/data/users.json';

router.post('/create-admin', authenticateToken, isAdmin, async (req, res) => {
  const { email, password, firstName, lastName, role = 'user' } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const VALID_ROLES = ['user', 'admin'];
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });
  }

  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);

    if (users.some(u => u.email === email)) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.status(201).json({
      message: `Usuario ${role} creado correctamente`,
      user: { ...newUser, password: undefined } // ocultamos el hash por seguridad
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

export default router;
