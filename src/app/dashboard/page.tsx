'use client';
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import useAuthStore from "@/context/auth-context";
import { logoutUserAction } from "@/actions/actions";
import DashNav from "./components/DashNav";
import { useEffect, useState } from "react";
import Profile from './components/Profile';
import Settings from './components/Settings';
import { getUser } from "@/actions/actions";
import { useSearchParams } from "next/navigation";
import { User } from "@/lib/definitions";
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
    <button onClick={handleLogout} className="flex w-1/2 justify-center border-2 self-center border-teal-100 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 hover:border-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
      Logout
    </button>
  );
}
export default function DashboardPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const { user, login } = useAuthStore();
  const [viewState, setViewState] = useState('profile');
  const viewToggle = (view: string) => {
    setViewState(view)
  }
  useEffect(() => {
    const p = async (token: string) => {
      const user = await getUser(token);
      login(user as User);
    }
    if (!user) {
      p(token!)
      console.log("from dashboard", user)
    }
  }, [login, token, user]);

  return (
    <div>
      <Navbar />
      <DashNav toggleView={viewToggle} />
      <div className="flex h-screen flex-col justify-center px-5 mt-0 lg:px-5">
        {viewState === "profile" && <Profile {...user!} />}
        {viewState === "settings" && <Settings {...user!} />}
        <LogoutButton />

      </div>

      <Footer />
    </div>
  );
}
