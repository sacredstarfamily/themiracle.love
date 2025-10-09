import { PayPalInterface } from '@/actions/paypalActions';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
interface ProductCardProps {
    id: string; // Unique identifier for the product
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    addToCart: () => void; // Optional function to add the product to the cart
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, description, price, imageUrl, addToCart }: ProductCardProps) => {
    const paypal = useMemo(() => new PayPalInterface(), []);
    useEffect(() => {
        const getItemDetails = async (pid: string) => {
            try {
                const itemDetails = await paypal.getProduct(pid);
                console.log(itemDetails);
                // Handle the item details as needed
            } catch (error) {
                console.error('Error fetching item details:', error);
            }
        };
        getItemDetails(id);
    }, [id, paypal]);
    return (
        <div className="p-4">
            <div className="relative w-full h-48 p-4 bg-gray-200 rounded-lg overflow-hidden">
                <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" className="rounded-t-lg" unoptimized />
            </div>
            <div className="mt-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-gray-600 text-sm mt-2">{description}</p>
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-bold">${price.toFixed(2)}</span>
                    <button onClick={addToCart} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;