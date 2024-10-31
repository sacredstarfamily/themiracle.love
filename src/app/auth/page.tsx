import FormWrapper from "./FormWrapper";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function AuthPage() {
  return (
    <>
      <Navbar />
      <div className="flex h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <FormWrapper />
      </div>
      <Footer />
    </>
  );
}
