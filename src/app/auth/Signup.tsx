import useAuthStore from "@/context/auth-context";
import { User } from "@/lib/definitions";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const SignupButton = ({ pending }: { pending: boolean }) => {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ backgroundColor: pending ? '#6366f1' : '#4f46e5' }}
      className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
    >
      {pending ? "..." : "Sign Up"}
    </button>
  );
};

export default function Signup() {
  const { login } = useAuthStore();
  const [signupState, setSignupState] = useState({ data: "" });
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setSignupState(result);
    } catch (error) {
      setSignupState({ data: `Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const getandset = async (token: string) => {
      console.log("from getandset")
      try {
        const response = await fetch(`/api/user?token=${token}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const user = await response.json();
        login(user as User);
      } catch (error) {
        console.error('Error fetching user:', error);
        // Handle error
      }
    };

    if (signupState?.data && signupState?.data !== "fail") {
      console.log(signupState.data)
      alert("Sign Up Successful");
      getandset(signupState.data)

      redirect("/dashboard?token=" + signupState.data)
    }
  }, [signupState, login]);
  return (
    <>
      <div className="mt-1 sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign Up for an account
        </h2>
        <form action={handleSubmit} className="space-y-6">
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
            <SignupButton pending={pending} />
          </div>
        </form>
      </div>
    </>
  );
}
