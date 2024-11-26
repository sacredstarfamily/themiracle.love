'use client';
import React, { useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from '@/app/components/Footer';

import { useState } from 'react';
import DashboardComponent from '../components/DashboardComponent';
import UsersComponent from '../components/UsersComponent';
const AdminDashboard: React.FC = () => {
    const [viewState, setViewState] = useState('dashboard');
    useEffect(() => {
        switch (viewState) {
            case 'dashboard':
                // Add your logic here
                console.log('Dashboard');
                break;
            case 'users':
                console.log('Users');
                // Add your logic here
                break;
            default:
                console.log('Default');
                break;
        }
        // Add your side effects here
    }, [viewState]);
    const setView = (view: string) => {
        setViewState(view);
    }
    return (
        <div>
            <Navbar />
            <AdminNavbar toggleView={setView} />

            <main className='h-screen mt-12'>


                {/* Add your dashboard content here */}
                {viewState === 'dashboard' && <DashboardComponent />}
                {viewState === 'users' && <UsersComponent />}
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;