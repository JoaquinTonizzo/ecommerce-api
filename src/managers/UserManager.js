import fs from "fs";
import bcrypt from "bcryptjs";

class UserManager {
  constructor(path) {
    this.path = path;
    this.users = [];
  }

  async loadUsers() {
    if (fs.existsSync(this.path)) {
      const data = await fs.promises.readFile(this.path, "utf-8");
      this.users = JSON.parse(data);
    } else {
      this.users = [];
    }
  }

  async saveUsers() {
    await fs.promises.writeFile(this.path, JSON.stringify(this.users, null, 2));
  }

  async getUsers() {
    await this.loadUsers();
    return this.users;
  }

  async getUserById(id) {
    await this.loadUsers();
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email) {
    await this.loadUsers();
    return this.users.find(user => user.email === email);
  }

  async addUser(userData) {
    await this.loadUsers();

    // Obtener último ID numérico para incrementar
    const lastId = this.users.length > 0
      ? Math.max(...this.users.map(u => parseInt(u.id)))
      : 0;
    const newId = (lastId + 1).toString();

    const existingUser = this.users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
      id: newId,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    await this.saveUsers();

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async validateUser(email, plainPassword) {
    await this.loadUsers();

    const user = this.users.find(u => u.email === email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(plainPassword, user.password);
    return passwordMatch ? user : null;
  }
}

const userManager = new UserManager('./src/data/users.json');
export default userManager;