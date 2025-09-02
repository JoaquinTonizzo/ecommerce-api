import { useEffect, useState, useRef, useContext } from 'react';
import { FaFilter, FaSearch, FaTag, FaPlus, FaMinus, FaSortAmountDownAlt } from 'react-icons/fa';
import ProductModal from './../components/ProductModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../context/UserContext';

export default function Products() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroStock, setFiltroStock] = useState('all');
    const [ordenPrecio, setOrdenPrecio] = useState('');
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
    let productosFiltrados = productos
        .filter(producto => producto.status)
        .filter(producto =>
            producto.title.toLowerCase().includes(busqueda.toLowerCase())
        )
        .filter(producto =>
            filtroCategoria ? producto.category === filtroCategoria : true
        )
        .filter(producto =>
            filtroStock === 'all' ? true : filtroStock === 'in' ? Number(producto.stock) > 0 : Number(producto.stock) <= 0
        );

    if (ordenPrecio === 'asc') {
        productosFiltrados = productosFiltrados.slice().sort((a, b) => a.price - b.price);
    } else if (ordenPrecio === 'desc') {
        productosFiltrados = productosFiltrados.slice().sort((a, b) => b.price - a.price);
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-0 py-0 relative overflow-hidden">
            {/* Fondo animado */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 opacity-20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl animate-float2" />
            </div>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <div className="relative z-10 px-6 py-12">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-300 dark:to-pink-300 mb-10 text-center animate-fadeInDown drop-shadow-lg">
                    Nuestros Productos
                </h1>

                {/* Barra de búsqueda y filtros */}
                <section className="max-w-7xl mx-auto mb-10 animate-fadeInUp">
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-md p-5 mb-4 backdrop-blur-lg border border-blue-50 dark:border-blue-950">
                        <div className="flex items-center gap-2 w-full sm:w-64">
                            <FaSearch className="text-blue-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:bg-gray-950 dark:text-white transition text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-48">
                            <FaTag className="text-purple-400 text-lg" />
                            <select
                                value={filtroCategoria}
                                onChange={e => setFiltroCategoria(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800 focus:outline-none focus:ring-1 focus:ring-purple-200 dark:bg-gray-950 dark:text-white transition text-xs"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-40">
                            <FaFilter className="text-green-400 text-lg" />
                            <select
                                value={filtroStock}
                                onChange={e => setFiltroStock(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-green-100 dark:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-200 dark:bg-gray-950 dark:text-white transition text-xs"
                            >
                                <option value="all">Todos</option>
                                <option value="in">Con stock</option>
                                <option value="out">Sin stock</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-48">
                            <FaSortAmountDownAlt className="text-blue-400 text-lg" />
                            <select
                                value={ordenPrecio}
                                onChange={e => setOrdenPrecio(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:bg-gray-950 dark:text-white transition text-xs"
                            >
                                <option value="">Sin orden</option>
                                <option value="asc">Precio menor a mayor</option>
                                <option value="desc">Precio mayor a menor</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {productosFiltrados.length} producto{productosFiltrados.length === 1 ? '' : 's'} encontrados
                    </div>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-5 max-w-7xl mx-auto animate-fadeInUp">
                    {productosFiltrados.map((producto) => {
                        const cantidad = cartInfo.items[producto._id] || 0;
                        const sinStock = !producto.stock || Number(producto.stock) <= 0;
                        return (
                            <div
                                key={producto._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-200 relative border border-blue-100 dark:border-blue-900 min-h-[120px] group flex flex-col sm:grid sm:grid-cols-1"
                                onClick={() => setProductoSeleccionado(producto)}
                            >
                                {sinStock && (
                                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded font-bold text-[10px] shadow-sm z-20 pointer-events-none">SIN STOCK</span>
                                )}
                                <div className="flex flex-col sm:flex-col gap-3 items-center h-full w-full">
                                    <img
                                        src={producto.thumbnails?.[0] || 'https://placehold.co/250x250'}
                                        alt={producto.title}
                                        className="w-[180px] h-[180px] sm:w-[250px] sm:h-[250px] object-cover rounded-md shadow-md group-hover:scale-105 transition-all duration-200 flex-shrink-0 mx-auto"
                                    />
                                    <div className="flex flex-col justify-between flex-1 h-full w-full items-center sm:items-start">
                                        <h2 className="text-base font-bold mb-0.5 text-blue-700 dark:text-blue-300 truncate drop-shadow transition-all duration-200 text-center sm:text-left w-full">
                                            {producto.title}
                                        </h2>
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 text-center sm:text-left w-full">
                                            ${producto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start w-full">
                                            {!sinStock && (
                                                <div className="flex w-full gap-2">
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
                                                        className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white h-10 sm:h-8 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 flex-1 min-w-0 text-base"
                                                        title={isAdmin ? "Los administradores no pueden generar pedidos" : cantidad < 1 ? "No puedes quitar productos si la cantidad es 0" : "Quitar uno"}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-full px-3 py-2 sm:py-1 text-base sm:text-xs shadow-sm text-center min-w-[40px]">
                                                        {cantidad}
                                                    </span>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            if (isAdmin) {
                                                                toast.error('Los administradores no pueden generar pedidos');
                                                                return;
                                                            }
                                                            handleAddToCart(producto);
                                                        }}
                                                        className="rounded-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white h-10 sm:h-8 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 min-w-0 text-base"
                                                        title={isAdmin ? "Los administradores no pueden generar pedidos" : "Agregar uno"}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
            </div>
        </main>
    );
}
