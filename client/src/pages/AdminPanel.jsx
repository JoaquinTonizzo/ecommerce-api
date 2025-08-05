import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import EditProductModal from '../components/EditProductModal';
import CreateProductModal from '../components/CreateProductModal';

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
    const navigate = useNavigate();

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
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Panel de Administración</h1>
            <div className="mb-8">
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                >
                    Crear producto
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
