"use client";
import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import styles from "./learn.module.css";
const LearnPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Add proper spacing from navbar */}
      <div className="pt-20 px-4">
        <h1 className="font-bold text-2xl text-zinc-300">Learn Page</h1>
        <div className="awesome">
          <p className={`${styles.awesome}`}>yup</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LearnPage;
