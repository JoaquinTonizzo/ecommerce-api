# Ecommerce API

Este proyecto es el **Entregable Nº1** del curso **Backend 1** de **Coderhouse**.

## Descripción

API RESTful desarrollada con Node.js y Express que gestiona un sistema básico de ecommerce. Permite manejar productos y carritos de compra a través de archivos JSON como sistema de persistencia.

## Tecnologías utilizadas

- Node.js
- Express
- JavaScript

## Endpoints principales

### Productos (`/api/products`)
- `GET /api/products`: Listar todos los productos.
- `GET /api/products/:pid`: Obtener un producto por su ID.
- `POST /api/products`: Agregar un nuevo producto.
- `PUT /api/products/:pid`: Actualizar un producto existente.
- `DELETE /api/products/:pid`: Eliminar un producto.

### Carritos (`/api/carts`)
- `GET /api/carts/:cid`: Obtener los productos de un carrito por ID.
- `POST /api/carts`: Crear un nuevo carrito.
- `POST /api/carts/:cid/product/:pid`: Agregar un producto a un carrito.

## Autor

Joaquín Gabriel Tonizzo
