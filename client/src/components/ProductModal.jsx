import React from 'react';

export default function ProductModal({ producto, onClose, onAddToCart }) {
    if (!producto) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div
                className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 relative shadow-lg flex flex-col md:flex-row gap-6"
                onClick={e => e.stopPropagation()} // evita cerrar modal al click dentro
            >
                {/* Imagen */}
                <img
                    src={producto.thumbnails?.[0] || 'https://placehold.co/600x400'}
                    alt={producto.title}
                    className="w-full md:w-1/2 h-64 object-cover rounded-md"
                />

                {/* Contenido */}
                <div className="flex flex-col justify-between md:w-1/2">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                            {producto.title}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{producto.description}</p>

                        <div className="space-y-2 text-gray-800 dark:text-gray-200 mb-4">
                            <p><strong>Código:</strong> {producto.code}</p>
                            <p><strong>Categoría:</strong> {producto.category}</p>
                            <p><strong>Stock:</strong> {producto.stock}</p>
                            <p><strong>Precio:</strong> ${producto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Estado:</strong> {producto.status ? 'Disponible' : 'No disponible'}</p>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
