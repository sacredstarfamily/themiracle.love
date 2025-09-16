'use client';

import { PayPalInterface } from "@/actions/paypalActions";
import ProductCard from "@/components/ui/ProductCard";
import useCartStore from "@/context/cart-context";
import type { PayPalProduct } from "@/lib/definitions";
import { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ShoppingCart from "../components/ShoppingCart";
import ShoppingCartBtn from "../components/ShoppingCartBtn";
import PayButton from "./shop-components/PayButton";
import PaypalCard from "./shop-components/PaypalCard";
export default function ShopPage() {
    const { cart, addToCart } = useCartStore();
    const [products, setProducts] = useState<PayPalProduct[]>([]);
    const [showCart, setShowCart] = useState(false);
    const clientId = process.env.NEXT_PUBLIC_LIVE_PAYPAL_ID as string;
    const initialOptions: PayPalScriptOptions = {
        clientId: clientId,
        currency: 'USD',
    }
    const handleCartToggle = () => {
        setShowCart(!showCart);
    }
    const paypalMemo = useMemo(() => {
        const paypal = new PayPalInterface();

        paypal.getItems().then((res) => {
            console.log(res.products);
            setProducts(res.products);
        }
        ).catch((err) => {
            console.log(err);
        }
        );

    }, []);

    useEffect(() => {
        paypalMemo;
    }, [paypalMemo]);
    return (
        <>
            <Navbar />
            {cart.length !== 0 ? <ShoppingCartBtn onClick={handleCartToggle} /> : null}
            <div className="h-screen flex-1 justify-center text-center z-1 overflow-scroll">
                <div className="border-2 border-black p-0 w-1/2 m-auto rounded-lg">
                    <h1 className="text-4xl">themiracle token</h1>
                    <p>available at <a href="https://pump.fun/coin/DakAndRzPaLjUSZYSapvZFKWuGoZXu84UUopWFfypump"><span className="font-[family-name:var(--font-cheri)] text-blue-500 underline cursor-pointer">pump.fun</span></a></p>
                </div>
                <PayPalScriptProvider options={initialOptions}>
                    <PayButton />
                    {/*  <div className="border-2 border-black p-0 w-1/2 m-auto rounded-lg">
                        <button onClick={() => {
                            const product = { id: '1', image_url: "/uploads/1742664045373pngwing.com.png", name: 'Sample Product', create_time: "", price: 10.0 };
                            addToCart(product);
                        }}>add to cart</button>
                    </div> */}
                    <PaypalCard />
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                title={product.name}
                                id={product.id}
                                description={product.description || ""}
                                price={product.price || 0}
                                imageUrl={product.image_url || ""}
                                addToCart={() => {
                                    const productToAdd = { id: product.id, image_url: product.image_url, name: product.name, create_time: "", price: product.price };
                                    addToCart(productToAdd);
                                }}
                            />
                        ))}


                        <ProductCard
                            id="1"
                            title="Sample Product"
                            description="This is a sample product description."
                            price={10.0}
                            imageUrl="/uploads/1744172636122IMG_0343.jpg"
                            addToCart={() => {
                                const product = { id: '1', image_url: "/uploads/1744172636122IMG_0343.jpg", name: 'Sample Product', create_time: "", price: 10.0 };
                                addToCart(product);
                            }} />
                    </div>
                    <ShoppingCart isOpen={showCart} onClose={handleCartToggle} />
                </PayPalScriptProvider>
            </div >
            <Footer />
        </>
    )
}