import ProductCard from '../components/ProductCard';

export default function Home() {
    // Esto después lo vas a reemplazar por productos reales
    const dummyProducts = [
        { id: 1, name: 'Producto 1', price: 100 },
        { id: 2, name: 'Producto 2', price: 200 },
    ];

    return (
        <div>
            <h1>Productos</h1>
            {dummyProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
