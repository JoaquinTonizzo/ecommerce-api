import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error en el login');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setIsLoggedIn(true);
            navigate('/products'); // o donde quieras redirigir
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded shadow text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        Ya has iniciado sesión
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Para continuar, ve a la página de productos o cierra sesión.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setIsLoggedIn(false);
                            setForm({ email: '', password: '' });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded shadow">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Iniciar Sesión</h2>

                {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
