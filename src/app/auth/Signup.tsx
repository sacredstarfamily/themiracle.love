import { createUser, getUser } from "@/actions/actions";
import useAuthStore from "@/context/auth-context";
import { User } from "@/lib/definitions";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
const SIGNUP_INITIAL_STATE = {
  data: "",
};
const SignupButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {pending ? "..." : "Sign Up"}
    </button>
  );
};

export default function Signup() {
  const { login } = useAuthStore();
  const [signupState, signupAction] = useActionState(
    createUser,
    SIGNUP_INITIAL_STATE,
  );
  useEffect(() => {
    const getandset = async (token: string) => {
      console.log("from getandset")
      const user = await getUser(token);
      login(user as User);

    };

    if (signupState?.data && signupState?.data !== "fail") {
      console.log(signupState.data)
      alert("Sign Up Successful");
      getandset(signupState.data)

      redirect("/dashboard?token=" + signupState.data)
    }
  });
  return (
    <>
      <div className="mt-1 sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign Up for an account
        </h2>
        <form action={signupAction} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          {signupState?.data}
          <div>
            <SignupButton />
          </div>
        </form>
      </div>
    </>
  );
}
