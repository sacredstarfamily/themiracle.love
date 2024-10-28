"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./learn.module.css";
const LearnPage: React.FC = () => {
  return (
    <div className="h-85 ">
      <Navbar />
      <div className="h-96">
        <h1 className="font-bold text-2xl text-zinc-300">Learn Page</h1>
        <div className="awesome h-72 bg-slate-100">
          <p className={`${styles.awesome} bg-red-700`}>yup</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LearnPage;
