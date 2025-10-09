'use client';
import { getUser, logoutUserAction } from "@/actions/actions";
import useAuthStore from "@/context/auth-context";
import { User } from "@/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useState } from "react";
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

// Memoized logout button component
const LogoutButton = memo(function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      logout()
      await logoutUserAction();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/auth");
    }
  }, [logout, router]);

  return (
    <button
      onClick={handleLogout}
      className="flex w-1/2 justify-center border-2 self-center border-teal-100 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 hover:border-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors duration-150"
    >
      Logout
    </button>
  );
});

export default function DashboardPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const { user, login } = useAuthStore();
  const [viewState, setViewState] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const viewToggle = useCallback((view: string) => {
    setViewState(view);
  }, []);

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

    switch (viewState) {
      case "profile":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile {...user} />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Settings {...user} />
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
            <Profile {...user} />
          </Suspense>
        );
    }
  }, [viewState, user]);

  return (
    <div>
      <Navbar />
      <DashNav toggleView={viewToggle} />
      <div className="flex flex-col px-5 mt-4 lg:px-8 min-h-screen">
        {renderContent}
        <div className="mt-8">
          <LogoutButton />
        </div>
      </div>
      <Footer />
    </div>
  );
}
