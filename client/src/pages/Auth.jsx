import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UserContext } from '../context/UserContext';

export default function Auth() {
    const [tab, setTab] = useState('login');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    // Si ya está logueado, redirigir a home
    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    async function handleLogin(e) {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Decodificar el token y actualizar el contexto
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                setUser(payload);
            } catch {
                setUser(null);
            }
            toast.success('Sesión iniciada');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al registrarse');
            toast.success('Registro exitoso, ahora puedes iniciar sesión');
            setRegisterForm({ firstName: '', lastName: '', email: '', password: '' });
            // No redirigir ni cambiar de tab automáticamente
        } catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex mb-8">
                    <button
                        className={`flex-1 py-2 font-bold rounded-l-2xl ${tab === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setTab('login')}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        className={`flex-1 py-2 font-bold rounded-r-2xl ${tab === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setTab('register')}
                    >
                        Registrarse
                    </button>
                </div>
                <div className="relative min-h-[400px]">
                    <div
                        key={tab}
                        className={
                            `absolute inset-0 transition-all duration-400 ease-in-out ` +
                            (tab === 'login' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-4 pointer-events-none z-0')
                        }
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Email</label>
                                <input name="email" type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white" required />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Contraseña</label>
                                <input name="password" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white" required />
                            </div>
                            <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Iniciar sesión</button>
                        </form>
                    </div>
                    <div
                        key={tab + '-register'}
                        className={
                            `absolute inset-0 transition-all duration-400 ease-in-out ` +
                            (tab === 'register' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none z-0')
                        }
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <form onSubmit={handleRegister}>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Nombre</label>
                                <input name="firstName" value={registerForm.firstName} onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Apellido</label>
                                <input name="lastName" value={registerForm.lastName} onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Email</label>
                                <input name="email" type="email" value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white" required />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Contraseña</label>
                                <input name="password" type="password" value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white" required />
                            </div>
                            <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Registrarse</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
