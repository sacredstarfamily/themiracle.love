"use client";
import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

export default function FormWrapper() {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  return (
    
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex min-h-screen flex-1 flex-col justify-center px-6 py-1 lg:px-8">
        {isLogin ? <Login /> : <Signup />}
        <button className="self-center mx-auto" onClick={handleToggle}>
          {isLogin ? (
            
            <div className="w-auto justify-center align-middle self-center">
              <p className="mt-10 text-center text-sm text-gray-900 self-center">
                Not a member?{" "}
                <span className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                  Sign Up Here
                </span>
              </p>
            </div>
          ) : (
            <>
              <p className="mt-10 text-center text-sm text-gray-900">
                Already a member?{" "}
                <span className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                  Log in here
                </span>
              </p>
            </>
          )}
        </button>
      </div>
    
  );
}
