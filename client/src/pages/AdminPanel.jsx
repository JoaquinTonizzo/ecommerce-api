import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from '../components/ConfirmModal';
import EditProductModal from '../components/EditProductModal';
import CreateProductModal from '../components/CreateProductModal';
import CreateAdminModal from '../components/CreateAdminModal';

export default function AdminPanel() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const navigate = useNavigate();

    async function handleShowHistory() {
        setShowHistory(true);
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            // Si tienes un endpoint global, cámbialo aquí. Si no, usa el de usuario actual.
            const res = await fetch('http://localhost:8080/api/carts/paid', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener historial');
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message || 'Error al obtener historial');
        } finally {
            setLoadingHistory(false);
        }
    }

    async function handleCreateAdmin(form) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8080/api/admin/create-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...form, role: 'admin' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear admin');
            toast.success('Admin creado correctamente');
            setShowCreateAdmin(false);
        } catch (err) {
            toast.error(err.message || 'Error al crear admin');
        }
    }

    useEffect(() => {
        // Obtener usuario desde el token (ejemplo simple)
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        // Decodificar el token para obtener el rol (puedes usar jwt-decode)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser(payload);
            if (payload.role !== 'admin') {
                navigate('/');
            }
        } catch {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:8080/api/products/');
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                setError('Error al cargar productos');
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    function handleDelete(id) {
        setDeleteId(id);
        setShowConfirm(true);
    }

    async function confirmDelete() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/products/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Error al eliminar');
            setProducts(products.filter(p => p.id !== deleteId));
        } catch {
            alert('No se pudo eliminar el producto');
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    }

    function handleEdit(product) {
        setEditProduct(product);
        setShowEdit(true);
    }

    async function saveEdit(form) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/products/${editProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...form, id: undefined }),
            });
            if (!res.ok) throw new Error('Error al editar producto');
            const updated = await res.json();
            setProducts(products.map(p => p.id === editProduct.id ? updated : p));
            setShowEdit(false);
            setEditProduct(null);
        } catch {
            alert('No se pudo editar el producto');
        }
    }

    async function saveCreate(form) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8080/api/products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Error al crear producto');
            const created = await res.json();
            setProducts([...products, created]);
            setShowCreate(false);
        } catch {
            alert('No se pudo crear el producto');
        }
    }

    if (loading) return <div className="p-6 text-center">Cargando...</div>;
    if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

    return (
        <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6 py-12">
            <ToastContainer position="top-right" autoClose={2500} />
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Panel de Administración</h1>
            <div className="mb-8 flex flex-wrap gap-4">
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                >
                    Crear producto
                </button>
                <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                >
                    Crear admin
                </button>
                <button
                    onClick={handleShowHistory}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-semibold"
                >
                    Ver historial de compras
                </button>
            </div>
            <ul className="space-y-4 max-w-3xl mx-auto">
                {products.map((p) => (
                    <li key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{p.title}</h2>
                            <p className="text-gray-700 dark:text-gray-300">${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(p)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(p.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                            >
                                Eliminar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <CreateAdminModal
                open={showCreateAdmin}
                onSave={handleCreateAdmin}
                onCancel={() => setShowCreateAdmin(false)}
            />

            {/* Modal para historial de compras */}
            {showHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-lg w-full max-w-2xl relative max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Historial de compras</h2>
                        {loadingHistory ? (
                            <div className="text-center">Cargando...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center text-gray-500">No hay compras registradas.</div>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {history.map((h, i) => (
                                    <li key={h.id || i} className="py-2">
                                        <div className="font-semibold text-gray-900 dark:text-white">Carrito: {h.id || 'N/A'} - Estado: {h.status || 'N/A'}</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">Usuario: {h.userId || 'N/A'}</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">Productos: {Array.isArray(h.products) ? h.products.map(p => `${p.title || p.productId} x${p.quantity}`).join(', ') : 'N/A'}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex justify-end mt-4">
                            <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setShowHistory(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <CreateProductModal
                open={showCreate}
                onSave={saveCreate}
                onCancel={() => setShowCreate(false)}
            />
            <EditProductModal
                open={showEdit}
                product={editProduct}
                onSave={saveEdit}
                onCancel={() => { setShowEdit(false); setEditProduct(null); }}
            />
            <ConfirmModal
                open={showConfirm}
                title="Confirmar eliminación"
                message="¿Seguro que quieres eliminar este producto?"
                onConfirm={confirmDelete}
                onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
            />
        </main>
    );
}