import { FaShieldAlt, FaShippingFast, FaHeadset } from 'react-icons/fa';

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-6 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 animate-fadeInDown">
                Bienvenido a TuTienda
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl mb-10 animate-fadeInUp">
                La mejor experiencia para comprar tus productos favoritos de forma rápida y segura.
            </p>

            <div className="flex flex-wrap justify-center gap-10 max-w-4xl animate-fadeInDown delay-200">
                {/* Seguridad */}
                <div className="flex flex-col items-center w-48 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <FaShieldAlt className="w-12 h-12 mb-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">100% Seguro</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Tus datos y pagos están protegidos con tecnología de encriptación avanzada.
                    </p>
                </div>

                {/* Entrega rápida */}
                <div className="flex flex-col items-center w-48 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <FaShippingFast className="w-12 h-12 mb-4 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Entrega Rápida</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Recibe tus productos en tiempo récord con nuestro sistema de logística eficiente.
                    </p>
                </div>

                {/* Soporte */}
                <div className="flex flex-col items-center w-48 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <FaHeadset className="w-12 h-12 mb-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Soporte 24/7</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Nuestro equipo está siempre disponible para ayudarte cuando lo necesites.
                    </p>
                </div>
            </div>
        </main>
    );
}
