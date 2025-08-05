import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function ProductCard({ product }) {
    const { addToCart } = useContext(CartContext);

    return (
        <div style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
            <h3>{product.name}</h3>
            <p>Precio: ${product.price}</p>
            <button onClick={() => addToCart(product)}>Agregar al carrito</button>
        </div>
    );
}
