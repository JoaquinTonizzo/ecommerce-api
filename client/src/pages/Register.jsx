import { useState, useEffect } from 'react';

export default function Register() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        setSuccessMsg(null);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error en el registro');

            setSuccessMsg('Registro exitoso, ya puedes iniciar sesión');
            setForm({ email: '', password: '', firstName: '', lastName: '' });
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
                        Para registrar un nuevo usuario, primero cierra sesión.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setIsLoggedIn(false);
                            setSuccessMsg(null);
                            setError(null);
                            setForm({ email: '', password: '', firstName: '', lastName: '' });
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
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Registrarse</h2>

                {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}
                {successMsg && <p className="mb-4 text-green-600 dark:text-green-400">{successMsg}</p>}

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
                        minLength={6}
                        required
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Nombre"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Apellido"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
            </div>
        </div>
    );
}
