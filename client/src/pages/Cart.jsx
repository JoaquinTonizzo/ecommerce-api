import { useEffect, useState } from 'react';

export default function Cart() {
    const [cartId, setCartId] = useState(null);
    const [products, setProducts] = useState([]);
    const [historialCarritos, setHistorialCarritos] = useState([]);
    const [historialVisible, setHistorialVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            setError('Debes iniciar sesión para ver el carrito');
            setLoading(false);
            return;
        }

        async function initCart() {
            try {
                setLoading(true);

                const historyRes = await fetch('http://localhost:8080/api/carts/history', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const history = await historyRes.json();
                if (!historyRes.ok) throw new Error(history.error || 'Error al obtener historial');

                const carritoEnProgreso = history.find((c) => c.status !== 'paid');

                let carritoId;
                if (carritoEnProgreso) {
                    carritoId = carritoEnProgreso.id;
                } else {
                    const createRes = await fetch('http://localhost:8080/api/carts/', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const nuevoCarrito = await createRes.json();
                    if (!createRes.ok) throw new Error(nuevoCarrito.error || 'Error al crear carrito');
                    carritoId = nuevoCarrito.id;
                }

                setCartId(carritoId);

                const productosRes = await fetch(`http://localhost:8080/api/carts/${carritoId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const productos = await productosRes.json();
                if (!productosRes.ok) throw new Error(productos.error || 'Error al cargar carrito');

                setProducts(productos || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        initCart();
    }, [token]);

    const total = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

    async function cargarHistorial() {
        try {
            const res = await fetch('http://localhost:8080/api/carts/history', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener historial');
            const pagos = data.filter(c => c.status === 'paid' || c.paid); // adaptar según backend
            setHistorialCarritos(pagos);
            setHistorialVisible(true);
        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) return <div className="p-6 text-center">Cargando carrito...</div>;
    if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

    return (
        <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Tu Carrito</h1>

            {products.length ? (
                <>
                    <ul className="space-y-6">
                        {products.map((p) => (
                            <li
                                key={p.id}
                                className="bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center justify-between"
                            >
                                <div>
                                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{p.title}</h2>
                                    <p className="text-gray-700 dark:text-gray-300">Precio: ${p.price.toFixed(2)}</p>
                                </div>
                                <span className="px-2 text-sm">{p.quantity}u</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex justify-between items-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">Total: ${total.toFixed(2)}</p>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(`http://localhost:8080/api/carts/${cartId}/pay`, {
                                        method: 'POST',
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || 'Error al pagar carrito');
                                    alert('Compra realizada con éxito');
                                    setProducts([]);
                                    setCartId(null);
                                } catch (err) {
                                    alert(err.message);
                                }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                        >
                            Pagar
                        </button>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-600 dark:text-gray-300">Tu carrito está vacío.</p>
            )}

            <div className="mt-10 text-center">
                {!historialVisible ? (
                    <button
                        onClick={cargarHistorial}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Ver historial de compras
                    </button>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Historial de Compras</h2>
                        {historialCarritos.length ? (
                            <ul className="space-y-4">
                                {historialCarritos.map((carrito) => (
                                    <li
                                        key={carrito.id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded shadow"
                                    >
                                        <p className="text-gray-800 dark:text-gray-200">ID Pedido: {carrito.id}</p>
                                        <p className="text-sm text-gray-500">Productos: {carrito.products.length}</p>
                                    </li>
                                ))}
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
