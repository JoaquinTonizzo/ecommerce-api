import fs from "fs";

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  // Obtiene todos los productos desde el archivo JSON
  async getProducts() {
    if (fs.existsSync(this.path)) {
      const products = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(products);
    }
    return [];
  }

  // Busca un producto por ID, lanza error si no lo encuentra
  async getProductById(id) {
    try {
      const products = await this.getProducts();
      const product = products.find((p) => p.id === id);
      if (!product) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  // Agrega un producto nuevo con ID incremental
  async addProduct(data) {
    const products = await this.getProducts();

    // Calcula el próximo ID como el mayor existente + 1
    const newId = products.length > 0
      ? (Math.max(...products.map(p => parseInt(p.id))) + 1).toString()
      : '1';

    const newProduct = {
      id: newId,
      ...data,
    };

    products.push(newProduct);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return newProduct;
  }

  // Actualiza un producto existente, lanza error si no lo encuentra
  async updateProduct(id, updates) {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    // No se actualiza el id, solo los campos dados
    products[index] = { ...products[index], ...updates, id };
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[index];
  }

  // Elimina un producto por ID, lanza error si no lo encuentra
  async deleteProduct(id) {
  const products = await this.getProducts();
  const updated = products.filter((p) => p.id !== id);

    if (products.length === updated.length) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    await fs.promises.writeFile(this.path, JSON.stringify(updated, null, 2));
    return true;
  }
}

const productManager = new ProductManager('src/data/products.json');
export default productManager;