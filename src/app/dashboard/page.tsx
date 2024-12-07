'use client';
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import useAuthStore from "@/context/auth-context";
import { logoutUserAction } from "@/actions/actions";
import DashNav from "./components/DashNav";
import { useState } from "react";

function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      logout()
      await logoutUserAction();

    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/auth");
    }
  };

  return (
    <button onClick={handleLogout} className="flex w-1/2 justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
      Logout
    </button>
  );
}
export default function DashboardPage() {
  const [viewState, setViewState] = useState('profile');
  const viewToggle = (view: string) => {
    setViewState(view)
  }


  return (
    <div>
      <Navbar />
      <DashNav toggleView={viewToggle} />
      <div className="flex h-screen flex-1 flex-col justify-center self-center px-5 mt-0 lg:px-5">

        {viewState === "profile" && <h1>Profile</h1>}
        {viewState === "settings" && <h1>Settings</h1>}
        <LogoutButton />
      </div>

      <Footer />
    </div>
  );
}
