'use client';
import { useState } from "react";
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"


import AdminNavbar from "./try/components/AdminNavbar";
import UsersComponent from "./components/UsersComponent";
import ProductsComponent from "./components/ProductsComponent";
export default function AdminPage() {

    const [viewState, setViewState] = useState('dashboard');

    const viewToggle = (view: string) => {
        setViewState(view)
    }

    return (
        <>
            <Navbar />
            <AdminNavbar toggleView={viewToggle} />

            <div className="mt-12 h-screen overflow-scroll p-1 mx-1 border-2 border-indigo-500 rounded">

                {viewState === "dashboard" && <h1>Dashboard</h1>}


                {viewState === "users" && <UsersComponent />}
                {viewState === "products" && <ProductsComponent />}



            </div>
            <Footer />
        </>
    )
}