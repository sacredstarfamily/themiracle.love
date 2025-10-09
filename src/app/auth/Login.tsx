'use client';

import { getUser, loginUser, requestPasswordUpdate } from "@/actions/actions";

import { User } from "@/lib/definitions";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import useAuthStore from '../../context/auth-context';

const INITIAL_STATE = {
  data: "",
};
function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {pending ? <p>Signing in</p> : <p>Sign in</p>}
    </button>
  );
}
export default function Login() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const { login } = useAuthStore();
  const [formState, formAction] = useFormState(loginUser, INITIAL_STATE);
  const [requestFormState, requestFormAction] = useFormState(requestPasswordUpdate, INITIAL_STATE);
  const [requestPassword, setRequestPassword] = useState(false);
  useEffect(() => {
    const getandset = async (token: string) => {
      const user = await getUser(token);
      login(user as User);
      console.log(user);
    };
    if (formState?.data && formState?.data !== "fail") {
      getandset(formState?.data);
      redirect("/dashboard?token=" + formState?.data);
    }
  });

  return (
    <>
      <div className="mt-1 sm:mx-auto sm:w-full h-full sm:max-w-sm">
        {requestFormState.data ? <p></p> : <p></p>}
        {requestPassword ? (
          <>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Reset Password Request
            </h2>
            <form action={requestFormAction} className=" space-y-6">

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
                <button
                  type="submit"

                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Reqest Password Reset
                </button>
              </div>
            </form>
          </>) : (
          <>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Log in to your account
            </h2>
            <form action={formAction} className=" space-y-6">

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
                <LoginButton />
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
