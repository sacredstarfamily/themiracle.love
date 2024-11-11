import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function ShopPage() {
    return (
        <>
        <Navbar/>
        <div className="h-screen flex flex-col justify-center font-[family-name:var(--font-cheri)]">
            <h1 className="self-center font-[family-name:var(--font-cheri)] text-4xl">Coming Soon </h1>
        </div>
        <Footer/>
        </>
    )
}