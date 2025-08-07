import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { UserContext } from '../context/UserContext.jsx';
import 'react-toastify/dist/ReactToastify.css';

export default function Cart() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [cartId, setCartId] = useState(null);
    const [products, setProducts] = useState([]);
    const [historialCarritos, setHistorialCarritos] = useState([]);
    const [historialVisible, setHistorialVisible] = useState(false);
    const [expandedHistorial, setExpandedHistorial] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Redirigir si no hay usuario o si es admin
        if (!user || user.role === 'admin') {
            navigate('/');
            return;
        }

        if (!token) {
            setError('Debes iniciar sesión para ver el carrito');
            setLoading(false);
            return;
        }

        async function fetchProductDetails(productsInCart) {
            // Obtener detalles de cada producto con su productId
            const detalles = await Promise.all(
                productsInCart.map(async ({ productId, quantity }) => {
                    const res = await fetch(`http://localhost:8080/api/products/${productId}`);
                    if (!res.ok) throw new Error('Error al cargar producto ' + productId);
                    const product = await res.json();
                    return { ...product, quantity };
                })
            );
            return detalles;
        }

        async function initCart() {
            try {
                setLoading(true);
                setError(null);

                // Obtener historial para buscar carrito in_progress
                const historyRes = await fetch('http://localhost:8080/api/carts/history', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const history = await historyRes.json();
                if (!historyRes.ok) throw new Error(history.error || 'Error al obtener historial');

                const carritoEnProgreso = history.find((c) => c.status === 'in_progress');

                let carritoId;

                if (carritoEnProgreso) {
                    carritoId = carritoEnProgreso.id;
                } else {
                    // Crear nuevo carrito
                    const createRes = await fetch('http://localhost:8080/api/carts/', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const nuevoCarrito = await createRes.json();
                    if (!createRes.ok) throw new Error(nuevoCarrito.error || 'Error al crear carrito');
                    carritoId = nuevoCarrito.id;
                }

                setCartId(carritoId);

                // Obtener productos (ids y cantidades) del carrito
                const productosRes = await fetch(`http://localhost:8080/api/carts/${carritoId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const productosInCart = await productosRes.json();
                if (!productosRes.ok) throw new Error(productosInCart.error || 'Error al cargar carrito');

                // Obtener detalles completos de productos y añadir cantidades
                const productosConDetalles = await fetchProductDetails(productosInCart);

                setProducts(productosConDetalles);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        initCart();
    }, [token, user, navigate]);

    const total = products.reduce((acc, p) => acc + (p.price || 0) * p.quantity, 0);

    async function handleAddToCart(product) {
        if (!token || !cartId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/carts/${cartId}/product/${product.id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al agregar producto');
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
            toast.success('Producto agregado al carrito');
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function handleRemoveFromCart(product) {
        if (!token || !cartId || product.quantity === 0) return;
        try {
            if (product.quantity > 1) {
                // PUT para actualizar cantidad
                const res = await fetch(`http://localhost:8080/api/carts/${cartId}/product/${product.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ quantity: product.quantity - 1 })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al descontar producto');
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p));
                toast.success('Cantidad actualizada');
            } else {
                // DELETE para eliminar producto
                const res = await fetch(`http://localhost:8080/api/carts/${cartId}/product/${product.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al quitar producto');
                setProducts(prev => prev.filter(p => p.id !== product.id));
                toast.success('Producto quitado del carrito');
            }
        } catch (err) {
            toast.error(err.message);
        }
    }

    // Nueva función para productos inactivos o sin stock
    async function handleRemoveInactiveOrNoStock(product) {
        if (!token || !cartId || product.quantity === 0) return;
        try {
            // DELETE para eliminar producto
            const res = await fetch(`http://localhost:8080/api/carts/${cartId}/product/${product.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al quitar producto');
            setProducts(prev => prev.filter(p => p.id !== product.id));
            toast.success('Producto quitado del carrito');
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function cargarHistorial() {
        try {
            setError(null);
            const res = await fetch('http://localhost:8080/api/carts/history', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener historial');
            const pagos = data.filter(c => c.status === 'paid');
            // Para cada carrito pagado, obtener detalles de productos
            const pagosConDetalles = await Promise.all(
                pagos.map(async (carrito) => {
                    // carrito.products: [{ productId, quantity }]
                    const productos = await Promise.all(
                        (carrito.products || []).map(async ({ productId, quantity }) => {
                            const res = await fetch(`http://localhost:8080/api/products/${productId}`);
                            if (!res.ok) return { title: 'Producto eliminado', price: 0, quantity };
                            const prod = await res.json();
                            return { ...prod, quantity };
                        })
                    );
                    return { ...carrito, productos };
                })
            );
            setHistorialCarritos(pagosConDetalles);
            setHistorialVisible(true);
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) return <div className="p-6 text-center">Cargando carrito...</div>;
    if (error) {
        return (
            <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6 py-12">
                <div className="animate-fadeInDown bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto text-center shadow">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </main>
        );
    }


    return (
        <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6 py-12">
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <h1 className="animate-fadeInDown text-3xl font-bold mb-8 text-gray-900 dark:text-white">Tu Carrito</h1>

            {products.length ? (
                <>
                    <ul className="space-y-6 max-w-3xl mx-auto">
                        {products.map((p) => (
                            <li
                                key={p.id}
                                className="animate-fadeInDown bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center justify-between"
                            >
                                <div>
                                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{p.title}</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Precio: ${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}
                                    </p>
                                    {(p.stock === 0 || p.status === false) && (
                                        <div className="mt-2 flex gap-2 items-center">
                                            {p.stock === 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-red-400 to-red-600 text-white text-xs font-bold shadow">
                                                    Sin stock
                                                </span>
                                            )}
                                            {p.status === false && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold shadow">
                                                    Producto inactivo
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {(p.stock === 0 || p.status === false) ? (
                                        <button
                                            onClick={() => handleRemoveInactiveOrNoStock(p)}
                                            className="bg-gray-300 hover:bg-red-600 text-gray-700 hover:text-white px-3 py-1 rounded"
                                            title="Eliminar producto"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    ) : p.quantity > 1 ? (
                                        <button
                                            onClick={() => handleRemoveFromCart(p)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                            title="Quitar uno"
                                        >
                                            –
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRemoveFromCart(p)}
                                            className="bg-gray-300 hover:bg-red-600 text-gray-700 hover:text-white px-3 py-1 rounded"
                                            title="Eliminar producto"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                    <span className="px-2 text-sm font-semibold text-gray-900 dark:text-white min-w-[2ch] text-center">{p.quantity}u</span>
                                    {(p.stock > 0 && p.status !== false) && (
                                        <button
                                            onClick={() => handleAddToCart(p)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                            title="Agregar uno"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                                <span className="px-2 font-semibold text-gray-900 dark:text-white">
                                    ${(p.price * p.quantity).toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="animate-fadeInDown mt-8 flex justify-between items-center max-w-3xl mx-auto">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">Total: ${total.toFixed(2)}</p>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(`http://localhost:8080/api/carts/${cartId}/pay`, {
                                        method: 'POST',
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || 'Error al pagar carrito. Por Favor, refresca la página e intenta nuevamente.');
                                    toast.success('Compra realizada con éxito');
                                    setProducts([]);
                                    setCartId(null);
                                } catch (err) {
                                    toast.error(err.message);
                                }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                        >
                            Pagar
                        </button>
                    </div>
                </>
            ) : (
                <p className="animate-fadeInDown text-center text-gray-600 dark:text-gray-300">Tu carrito actual está vacío.</p>
            )}

            <div className="animate-fadeInDown mt-10 text-center max-w-3xl mx-auto">
                {!historialVisible ? (
                    <button
                        onClick={cargarHistorial}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Ver historial de compras
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => setHistorialVisible(false)}
                            className="animate-fadeInDown text-red-600 hover:underline font-medium mb-4"
                        >
                            Ocultar historial
                        </button>
                        <h2 className="animate-fadeInDown text-xl font-semibold mt-4 mb-4 text-gray-900 dark:text-white">Historial de Compras</h2>
                        {historialCarritos.length ? (
                            <ul className="animate-fadeInDown space-y-4">
                                {historialCarritos.map((carrito) => {
                                    const expanded = expandedHistorial[carrito.id];
                                    return (
                                        <li
                                            key={carrito.id}
                                            className="bg-white dark:bg-gray-800 p-4 rounded shadow"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-gray-800 dark:text-gray-200 font-semibold">ID Pedido: {carrito.id}</p>
                                                    <p className="text-sm text-gray-500">Productos: {carrito.products.length}</p>
                                                    <p className="text-sm text-gray-500">Estado: {carrito.status}</p>
                                                    {carrito.paidAt && (
                                                        <p className="text-sm text-gray-500">Pagado: {new Date(carrito.paidAt).toLocaleString()}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setExpandedHistorial(e => ({ ...e, [carrito.id]: !expanded }))}
                                                    className="ml-4 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium"
                                                >
                                                    {expanded ? 'Cerrar' : 'Ver productos'}
                                                </button>
                                            </div>
                                            {expanded && (
                                                <ul className="mt-4 space-y-2">
                                                    {carrito.productos.map((p, idx) => (
                                                        <li key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                                                            <span className="font-semibold text-gray-900 dark:text-white">{p.title}</span>
                                                            <span className="ml-2 text-gray-700 dark:text-gray-300">x{p.quantity}</span>
                                                            <span className="ml-2 text-gray-700 dark:text-gray-300">${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No hay compras anteriores.</p>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
