import { useEffect, useState, useRef, useContext } from 'react';
import ProductModal from './../components/ProductModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../context/UserContext';

export default function Products() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroStock, setFiltroStock] = useState('all');
    const [filtroPrecio, setFiltroPrecio] = useState([0, 999999]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cartInfo, setCartInfo] = useState({ cartId: null, items: {} }); // { cartId, items: { [productId]: quantity } }
    const API_URL = import.meta.env.VITE_API_URL;
    const modalRef = useRef();
    const cartCreatedRef = useRef(false); // Ref para controlar creación de carrito
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

    // Obtener categorías únicas
    const categorias = Array.from(new Set(productos.map(p => p.category).filter(Boolean)));

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
                if (!carritoEnProgreso && !cartCreatedRef.current) {
                    const createRes = await fetch(`${API_URL}/api/carts`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const nuevoCarrito = await createRes.json();
                    if (!createRes.ok) throw new Error(nuevoCarrito.error || 'Error al crear carrito');
                    carritoEnProgreso = nuevoCarrito;
                    cartCreatedRef.current = true; // Marcar que ya se creó el carrito
                }

                // Obtener productos del carrito
                if (carritoEnProgreso) {
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
                }
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

    // Filtro y búsqueda
    const productosFiltrados = productos
        .filter(producto => producto.status)
        .filter(producto =>
            producto.title.toLowerCase().includes(busqueda.toLowerCase())
        )
        .filter(producto =>
            filtroCategoria ? producto.category === filtroCategoria : true
        )
        .filter(producto =>
            filtroStock === 'all' ? true : filtroStock === 'in' ? Number(producto.stock) > 0 : Number(producto.stock) <= 0
        )
        .filter(producto =>
            producto.price >= filtroPrecio[0] && producto.price <= filtroPrecio[1]
        );

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-12">
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 text-center animate-fadeInDown">
                Nuestros Productos
            </h1>

            {/* Barra de búsqueda y filtros */}
            <section className="max-w-7xl mx-auto mb-10 animate-fadeInUp">
                <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white transition"
                    />
                    <select
                        value={filtroCategoria}
                        onChange={e => setFiltroCategoria(e.target.value)}
                        className="w-full sm:w-48 px-4 py-2 rounded-lg border border-purple-300 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-900 dark:text-white transition"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={filtroStock}
                        onChange={e => setFiltroStock(e.target.value)}
                        className="w-full sm:w-40 px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-900 dark:text-white transition"
                    >
                        <option value="all">Todos</option>
                        <option value="in">Con stock</option>
                        <option value="out">Sin stock</option>
                    </select>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <label className="text-sm text-gray-700 dark:text-gray-300">Precio:</label>
                        <input
                            type="number"
                            min={0}
                            max={filtroPrecio[1]}
                            value={filtroPrecio[0]}
                            onChange={e => setFiltroPrecio([Number(e.target.value), filtroPrecio[1]])}
                            className="w-20 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 focus:outline-none dark:bg-gray-900 dark:text-white"
                        />
                        <span className="mx-1 text-gray-500 dark:text-gray-400">-</span>
                        <input
                            type="number"
                            min={filtroPrecio[0]}
                            value={filtroPrecio[1]}
                            onChange={e => setFiltroPrecio([filtroPrecio[0], Number(e.target.value)])}
                            className="w-20 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 focus:outline-none dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {productosFiltrados.length} producto{productosFiltrados.length === 1 ? '' : 's'} encontrados
                </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto animate-fadeInUp">
                {productosFiltrados.map((producto) => {
                    const cantidad = cartInfo.items[producto._id] || 0;
                    const sinStock = !producto.stock || Number(producto.stock) <= 0;
                    const disableCartActions = isAdmin || sinStock;
                    return (
                        <div
                            key={producto._id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 relative border-b-4 border-blue-200 dark:border-blue-700"
                            onClick={() => setProductoSeleccionado(producto)}
                        >
                            {sinStock && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded font-bold text-xs shadow">SIN STOCK</div>
                            )}
                            <img
                                src={producto.thumbnails?.[0] || 'https://placehold.co/600x400'}
                                alt={producto.title}
                                className="w-full h-48 object-cover rounded-md mb-4 shadow-md"
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
