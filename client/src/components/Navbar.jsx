import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

function Navbar() {
    const { user, setUser } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser(payload);
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Logo" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        TuTienda
                    </span>
                </Link>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-default"
                    aria-expanded={isOpen}
                    aria-label="Toggle menu"
                >
                    <span className="sr-only">Open main menu</span>
                    <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 17 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 1h15M1 7h15M1 13h15"
                        />
                    </svg>
                </button>

                <div
                    className={`w-full md:block md:w-auto ${isOpen ? 'block' : 'hidden'}`}
                    id="navbar-default"
                >
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <li>
                            <Link
                                to="/"
                                className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"
                                aria-current="page"
                                onClick={() => setIsOpen(false)}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/products"
                                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                                onClick={() => setIsOpen(false)}
                            >
                                Products
                            </Link>
                        </li>
                        {!user && (
                            <>
                                <li>
                                    <Link
                                        to="/login"
                                        className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/register"
                                        className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Registrarse
                                    </Link>
                                </li>
                            </>
                        )}
                        {user && (
                            <>
                                <li>
                                    <Link
                                        to="/cart"
                                        className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cart
                                    </Link>
                                </li>
                                <li className="relative">
                                    <button
                                        className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent font-semibold"
                                        onClick={() => setProfileOpen((open) => !open)}
                                    >
                                        Perfil
                                    </button>
                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                                            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Email: {user.email}</div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Rol: {user.role}</div>
                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem('token');
                                                    window.location.reload();
                                                }}
                                                className="mt-3 w-full px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    )}
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
