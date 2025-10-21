'use client';
import { getUser } from "@/actions/actions";
import useAuthStore from "@/context/auth-context";
import { User } from "@/lib/definitions";
import { useSearchParams } from "next/navigation";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import DashNav from "./components/DashNav";

// Lazy load heavy components
const Profile = lazy(() => import('./components/Profile'));
const Settings = lazy(() => import('./components/Settings'));
const MintComponent = lazy(() => import('./components/MintComponent'));

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
  </div>
);

// LogoutButton removed because it was unused

export default function Dashboard() {
  const params = useSearchParams();
  const token = params.get("token");
  const { user, login } = useAuthStore();
  const [view, setView] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchUser = async (token: string) => {
      if (isLoading) return; // Prevent duplicate requests

      setIsLoading(true);
      try {
        const userData = await getUser(token);
        login(userData as User);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!user && token && !isLoading) {
      fetchUser(token);
    }
  }, [login, token, user, isLoading]);

  // Memoize the rendered content to prevent unnecessary re-renders
  const renderContent = useMemo(() => {
    if (!user) {
      return <LoadingSpinner />;
    }

    switch (view) {
      case "profile":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile {...(user as User)} />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Settings {...(user as User)} />
          </Suspense>
        );
      case "mint":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MintComponent />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile {...(user as User)} />
          </Suspense>
        );
    }
  }, [view, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Add top padding to account for fixed navbar */}
      <div className="pt-16">
        <DashNav toggleView={setView} />

        <main className="container mx-auto px-4 py-8">
          {/* Content with additional spacing */}
          <div className="pt-4">
            {renderContent}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
