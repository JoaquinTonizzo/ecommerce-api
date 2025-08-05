import { useEffect, useState, useRef } from 'react';
import ProductModal from './../components/ProductModal';

export default function Products() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const modalRef = useRef();

    useEffect(() => {
        async function fetchProductos() {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:8080/api/products/');
                if (!res.ok) throw new Error('Error al cargar productos');
                const data = await res.json();
                setProductos(data);
            } catch (err) {
                setError(err.message || 'Error desconocido');
            } finally {
                setLoading(false);
            }
        }

        fetchProductos();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setProductoSeleccionado(null);
            }
        }

        if (productoSeleccionado) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [productoSeleccionado]);

    function handleAddToCart(producto) {
        // Por ahora sin acción
        alert(`Agregar al carrito: ${producto.title}`);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-700 dark:text-gray-300">
                Cargando productos...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600 dark:text-red-400">
                {error}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 text-center animate-fadeInDown">
                Nuestros Productos
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto animate-fadeInUp">
                {productos.map((producto) => (
                    <div
                        key={producto.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-300"
                        onClick={() => setProductoSeleccionado(producto)}
                    >
                        <img
                            src={producto.thumbnails?.[0] || 'https://placehold.co/600x400'}
                            alt={producto.title}
                            className="w-full h-48 object-cover rounded-md mb-4"
                        />
                        <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                            {producto.title}
                        </h2>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-3">
                            ${producto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
                        >
                            Agregar al carrito
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {productoSeleccionado && (
                <ProductModal
                    producto={productoSeleccionado}
                    onClose={() => setProductoSeleccionado(null)}
                    onAddToCart={handleAddToCart}
                    ref={modalRef}
                />
            )}
        </main>
    );
}
