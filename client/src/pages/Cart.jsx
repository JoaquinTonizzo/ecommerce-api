import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function Cart() {
    const { cart } = useContext(CartContext);

    return (
        <div>
            <h1>Carrito</h1>
            {cart.length === 0 ? (
                <p>El carrito está vacío.</p>
            ) : (
                cart.map((item, i) => (
                    <div key={i}>
                        <p>{item.name} - ${item.price}</p>
                    </div>
                ))
            )}
        </div>
    );
}
