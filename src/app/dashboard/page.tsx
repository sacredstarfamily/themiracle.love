import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  return (
  <div>
    <Navbar />
    <div className="flex h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <h1>Dashboard</h1>
      <p>Aye! You just got into the stuffs you wasnt supposed to know
        about. But hey, youre here now, so why not take a look around?
      </p>
    </div>
    <Footer />
  </div>
);
}
