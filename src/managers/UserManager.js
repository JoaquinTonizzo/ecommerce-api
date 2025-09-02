import User from '../models/User.js';
import bcrypt from 'bcryptjs';

class UserManager {
  // Obtiene todos los usuarios
  async getUsers() {
    return await User.find();
  }

  // Busca usuario por ID
  async getUserById(id) {
    return await User.findById(id);
  }

  // Busca usuario por email
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  // Agrega usuario nuevo
  async addUser(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user',
    });
    await newUser.save();
    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
  }

  // Valida usuario por email y password
  async validateUser(email, plainPassword) {
    const user = await User.findOne({ email });
    if (!user) return null;
    const passwordMatch = await bcrypt.compare(plainPassword, user.password);
    return passwordMatch ? user : null;
  }
}

const userManager = new UserManager();
export default userManager;