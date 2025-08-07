import { FaShieldAlt, FaShippingFast, FaHeadset, FaStar, FaShoppingCart, FaTags } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Home() {
    const navigate = useNavigate();
    useEffect(() => {
        document.title = 'TuTienda - Inicio';
    }, []);

    // Mock productos destacados
    const destacados = [
        {
            title: 'Auriculares Gamer',
            price: 12999,
            img: 'https://placehold.co/300x200?text=Auriculares',
            tag: 'Gaming',
        },
        {
            title: 'Smartwatch Pro',
            price: 24999,
            img: 'https://placehold.co/300x200?text=Smartwatch',
            tag: 'Accesorios',
        },
        {
            title: 'Celulares',
            price: 18999,
            img: 'https://placehold.co/300x200?text=Celulares',
            tag: 'Tecnología',
        },
    ];

    return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center px-2 sm:px-6 py-0 text-center">
            {/* Hero Section */}
            <section className="w-full flex flex-col items-center justify-center py-16 sm:py-20 animate-fadeInDown">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-300 dark:to-pink-300 mb-6 drop-shadow-xl">
                    Bienvenido a <span className="tracking-tight">TuTienda</span>
                </h1>
                <p className="text-base sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mb-8 animate-fadeInUp font-medium">
                    Descubrí la mejor experiencia para comprar tus productos favoritos de forma rápida, segura y con atención personalizada.
                </p>
                <button
                    onClick={() => navigate('/products')}
                    className="animate-bounce bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200"
                >
                    Ver productos
                </button>
            </section>

            {/* Features */}
            <section className="w-full flex flex-wrap justify-center gap-6 sm:gap-10 max-w-5xl mb-12 sm:mb-16 animate-fadeInUp">
                <div className="flex flex-col items-center w-full sm:w-56 p-6 sm:p-7 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-blue-500 dark:border-blue-400 backdrop-blur-md">
                    <FaShieldAlt className="w-14 h-14 mb-4 text-blue-600 dark:text-blue-400 animate-spin-slow" />
                    <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">100% Seguro</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        Tus datos y pagos están protegidos con tecnología de encriptación avanzada.
                    </p>
                </div>
                <div className="flex flex-col items-center w-full sm:w-56 p-6 sm:p-7 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-green-500 dark:border-green-400 backdrop-blur-md">
                    <FaShippingFast className="w-14 h-14 mb-4 text-green-600 dark:text-green-400 animate-float" />
                    <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">Entrega Rápida</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        Recibí tus productos en tiempo récord con nuestro sistema de logística eficiente.
                    </p>
                </div>
                <div className="flex flex-col items-center w-full sm:w-56 p-6 sm:p-7 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-purple-500 dark:border-purple-400 backdrop-blur-md">
                    <FaHeadset className="w-14 h-14 mb-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                    <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">Soporte 24/7</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        Nuestro equipo está siempre disponible para ayudarte cuando lo necesites.
                    </p>
                </div>
            </section>

            {/* Productos destacados mock */}
            <section className="w-full max-w-6xl mb-16 sm:mb-20 animate-fadeInUp">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <FaStar className="text-yellow-400 animate-bounce" /> Productos Destacados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                    {destacados.map((prod, idx) => (
                        <div
                            key={idx}
                            className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 flex flex-col items-center relative border-b-4 border-blue-200 dark:border-blue-700 backdrop-blur-md"
                        >
                            <img
                                src={prod.img}
                                alt={prod.title}
                                className="w-full h-36 sm:h-40 object-cover rounded-md mb-3 sm:mb-4 shadow-md"
                                style={{ maxWidth: '300px' }}
                            />
                            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                                <FaTags className="text-pink-400" /> {prod.title}
                            </h3>
                            <div className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-400 mb-1 sm:mb-2">
                                ${prod.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                            <span className="inline-block bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow">
                                {prod.tag}
                            </span>
                            <button
                                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-md"
                                onClick={() => navigate('/products')}
                            >
                                <FaShoppingCart /> Ver más
                            </button>
                        </div>
                    ))}
                </div>
            </section>

        </main>
    );
}
