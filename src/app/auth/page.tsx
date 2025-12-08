"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FormWrapper from "./FormWrapper";





export default function AuthPage() {


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <FormWrapper />

        </div>
      </div>
      <Footer />
    </div>
  );
}
