'use client';
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { logoutUserAction } from "@/actions/actions";
function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logoutUserAction();
      
    }catch (error) {
      console.error("Logout failed:", error);
    }finally {
      router.push("/auth");
    }
  };

  return (
    <button onClick={handleLogout} className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
      Logout
    </button>
  );
}
export default function DashboardPage() {
  return (
  <div>
    <Navbar />
    <div className="flex h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <h1>Dashboard</h1>
      <p>Aye! You just got into the stuffs you wasnt supposed to know
        about. But hey, youre here now, so why not take a look around?
      </p>
      <LogoutButton />
    </div>
    <Footer />
  </div>
);
}
