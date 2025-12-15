'use client';

import { loginUser, requestPasswordUpdate } from "@/actions/actions";
import { User } from "@/lib/definitions";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from 'react-dom';
import useAuthStore from '../../context/auth-context';

const INITIAL_STATE = {
  data: "",
};
function LoginButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ backgroundColor: pending ? '#6366f1' : '#4f46e5' }}
      className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
    >
      {pending ? <p>Signing in</p> : <p>Sign in</p>}
    </button>
  );
}
function RequestPasswordButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ backgroundColor: pending ? '#6366f1' : '#4f46e5' }}
      className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
    >
      {pending ? <p>Sending...</p> : <p>Send Reset Link</p>}
    </button>
  );
}
export default function Login() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const { login } = useAuthStore();
  const [loginState, loginAction] = useFormState(loginUser, { data: "" });
  const [requestState, requestAction] = useFormState(requestPasswordUpdate, { data: "" });
  const [requestPassword, setRequestPassword] = useState(false);

  useEffect(() => {
    const getandset = async (token: string) => {
      try {
        const response = await fetch(`/api/user?token=${token}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const user = await response.json();
        login(user as User);
        console.log(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        // Handle error, maybe set some state
      }
    };
    if (loginState?.data && loginState?.data !== "fail") {
      getandset(loginState?.data);
      redirect("/dashboard?token=" + loginState?.data);
    }
  }, [loginState, login]);

  return (
    <>
      <div className="mt-1 sm:mx-auto sm:w-full h-full sm:max-w-sm">
        {requestPassword ? (
          <>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Reset Password Request
            </h2>
            <form action={requestAction} className=" space-y-6">

              <div>
                <p>{isLoggedIn && "hello"}</p>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-medium placeholder:font-normal"
                  />
                </div>
              </div>



              <div>
                {requestState?.data}
                <RequestPasswordButton pending={false} />
              </div>
            </form>
          </>) : (
          <>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Log in to your account
            </h2>
            <form action={loginAction} className=" space-y-6">

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-medium placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>

                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-medium placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                {loginState?.data}
                <LoginButton pending={false} />
                <div className="text-sm">
                  <button
                    onClick={() => setRequestPassword(true)}
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

      </div>
    </>
  );
}
