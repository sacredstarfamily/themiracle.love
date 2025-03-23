export default async function ShoppingCart() {
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 md:p-8 lg:p-10" role="dialog" aria-modal="true" aria-labelledby="shoppingCartTitle">
            <div className="bg-white p-5 rounded-lg shadow-lg">
                <h2>Shopping Cart</h2>
                {/* Add your shopping cart items here */}
            </div>
        </div>
    )
}