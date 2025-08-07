import { useEffect, useState, useRef, useContext } from 'react';
import ProductModal from './../components/ProductModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../context/UserContext';

export default function Products() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cartInfo, setCartInfo] = useState({ cartId: null, items: {} }); // { cartId, items: { [productId]: quantity } }
    const API_URL = import.meta.env.VITE_API_URL;
    const modalRef = useRef();
    const { user } = useContext(UserContext);
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        async function fetchProductos() {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/products/`);
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
        async function fetchCart() {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                // Obtener historial
                const historyRes = await fetch(`${API_URL}/api/carts/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const history = await historyRes.json();
                if (!historyRes.ok) throw new Error(history.error || 'Error al obtener historial de carritos');

                // Buscar carrito en progreso o crear uno
                let carritoEnProgreso = history.find(c => c.status !== 'paid');
                if (!carritoEnProgreso) {
                    const createRes = await fetch(`${API_URL}/api/carts`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const nuevoCarrito = await createRes.json();
                    if (!createRes.ok) throw new Error(nuevoCarrito.error || 'Error al crear carrito');
                    carritoEnProgreso = nuevoCarrito;
                }

                // Obtener productos del carrito
                const cartRes = await fetch(`${API_URL}/api/carts/${carritoEnProgreso._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const cartProducts = await cartRes.json();
                if (!cartRes.ok) throw new Error(cartProducts.error || 'Error al obtener productos del carrito');

                // Mapear cantidades
                const items = {};
                for (const p of cartProducts) {
                    let prodId = p.productId;
                    if (typeof prodId === 'object' && prodId !== null) {
                        prodId = prodId._id || prodId.id || prodId.toString();
                    }
                    if (!prodId) prodId = p._id;
                    items[prodId] = p.quantity;
                }
                setCartInfo({ cartId: carritoEnProgreso._id, items });
            } catch (err) {
                // No mostrar error si no hay carrito
            }
        }
        fetchCart();
    }, [productos]);

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

    async function handleAddToCart(producto) {
        if (isAdmin) {
            toast.error('Los administradores no pueden agregar productos al carrito');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Debes iniciar sesión para agregar productos al carrito');
            return;
        }
    try {
        let cartId = cartInfo.cartId;
        // Si no hay carrito, crear uno
        if (!cartId) {
            const createRes = await fetch(`${API_URL}/api/carts`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const nuevoCarrito = await createRes.json();
            if (!createRes.ok) throw new Error(nuevoCarrito.error || 'Error al crear carrito');
            cartId = nuevoCarrito._id;
        }
        // Agregar producto
        const addRes = await fetch(`${API_URL}/api/carts/${cartId}/product/${producto._id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const addData = await addRes.json();
        if (!addRes.ok) throw new Error(addData.error || 'Error al agregar producto al carrito');
        // Sincronizar cantidades con backend
        const cartRes = await fetch(`${API_URL}/api/carts/${cartId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const cartProducts = await cartRes.json();
        if (!cartRes.ok) throw new Error(cartProducts.error || 'Error al obtener productos del carrito');
        const items = {};
        for (const p of cartProducts) {
            let prodId = p.productId;
            if (typeof prodId === 'object' && prodId !== null) {
                prodId = prodId._id || prodId.id || prodId.toString();
            }
            if (!prodId) prodId = p._id;
            items[prodId] = p.quantity;
        }
        setCartInfo({ cartId, items });
        toast.success('Producto agregado al carrito');
    } catch (err) {
        toast.error(err.message);
    }
    }

    async function handleRemoveFromCart(producto) {
        if (isAdmin) {
            toast.error('Los administradores no pueden quitar productos del carrito');
            return;
        }
        const token = localStorage.getItem('token');
        const cantidadActual = cartInfo.items[producto._id] || 0;
        if (!token || !cartInfo.cartId || cantidadActual < 1) return;
    try {
        if (cantidadActual === 1) {
            // Eliminar producto del carrito
            const res = await fetch(`${API_URL}/api/carts/${cartInfo.cartId}/product/${producto._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al quitar producto');
        } else {
            const nuevaCantidad = cantidadActual - 1;
            const res = await fetch(`${API_URL}/api/carts/${cartInfo.cartId}/product/${producto._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: nuevaCantidad }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al actualizar cantidad');
        }
        // Sincronizar cantidades con backend
        const cartRes = await fetch(`${API_URL}/api/carts/${cartInfo.cartId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const cartProducts = await cartRes.json();
        if (!cartRes.ok) throw new Error(cartProducts.error || 'Error al obtener productos del carrito');
        const items = {};
        for (const p of cartProducts) {
            let prodId = p.productId;
            if (typeof prodId === 'object' && prodId !== null) {
                prodId = prodId._id || prodId.id || prodId.toString();
            }
            if (!prodId) prodId = p._id;
            items[prodId] = p.quantity;
        }
        setCartInfo({ cartId: cartInfo.cartId, items });
        toast.success('Cantidad actualizada');
    } catch (err) {
        toast.error(err.message);
    }
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12">
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 text-center animate-fadeInDown">
                Nuestros Productos
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto animate-fadeInUp">
                {productos.filter(producto => producto.status).map((producto) => {
                    const cantidad = cartInfo.items[producto._id] || 0;
                    const sinStock = !producto.stock || Number(producto.stock) <= 0;
                    const disableCartActions = isAdmin || sinStock;
                    return (
                        <div
                            key={producto._id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-300 relative"
                            onClick={() => setProductoSeleccionado(producto)}
                        >
                            {sinStock && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded font-bold text-xs shadow">SIN STOCK</div>
                            )}
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
                            <div className="flex items-center gap-2 mt-auto">
                                {!(sinStock) && (
                                    <>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (isAdmin) {
                                                    toast.error('Los administradores no pueden generar pedidos');
                                                    return;
                                                }
                                                if (cantidad < 1) {
                                                    toast.error('No puedes quitar productos si la cantidad es 0');
                                                    return;
                                                }
                                                handleRemoveFromCart(producto);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                            title={isAdmin ? "Los administradores no pueden generar pedidos" : cantidad < 1 ? "No puedes quitar productos si la cantidad es 0" : "Quitar uno"}
                                        >
                                            –
                                        </button>
                                        <span className="font-semibold text-gray-900 dark:text-white min-w-[2ch] text-center">{cantidad}</span>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (isAdmin) {
                                                    toast.error('Los administradores no pueden generar pedidos');
                                                    return;
                                                }
                                                handleAddToCart(producto);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                            title={isAdmin ? "Los administradores no pueden generar pedidos" : "Agregar uno"}
                                        >
                                            +
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
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
