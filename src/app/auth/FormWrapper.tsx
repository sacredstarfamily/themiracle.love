"use client";
import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import Image from "next/image";
import logo from "./bitmap.png";
export default function FormWrapper() {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          className="mx-auto h-20 w-auto"
          alt=""
          src={logo}
          width={1000}
          height={1000}
        />

        {isLogin ? <Login /> : <Signup />}
        <button onClick={handleToggle}>
          {isLogin ? (
            <>
              <p className="mt-10 text-center text-sm text-gray-500">
                Not a member?{" "}
                <span className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                  Sign Up Here
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="mt-10 text-center text-sm text-gray-500">
                Already a member?{" "}
                <span className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                  Log in here
                </span>
              </p>
            </>
          )}
        </button>
      </div>
    </>
  );
}
