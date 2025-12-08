"use client";

// Define PageProps type locally for route parameters
type PageProps = {
    params: Promise<{ link: string }>;
};

import { checkLink, updateUserPassword } from "@/actions/actions";
import { redirect } from "next/navigation";
import { useActionState, useCallback, useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";

const INITIAL_STATE = {
    data: "",
};

export default function ResetPasswordPage({ params }: PageProps) {
    const [validLink, setValidLink] = useState(false);
    const [resolvedLink, setResolvedLink] = useState<string>("");

    const [formState, formAction] = useActionState(updateUserPassword, INITIAL_STATE);
    const isValid = useCallback(async (link: string) => {
        return await checkLink(link);
    }, []);
    useEffect(() => {
        const fetchParams = async () => {
            const resolvedParams = await params;
            setResolvedLink(resolvedParams.link);
            isValid(resolvedParams.link).then((data) => {
                setValidLink(data);
            });
            if (formState?.data && formState?.data === "Password updated") {
                alert("Password Reset Successful");
                redirect("/auth");
            }
        };
        fetchParams();
    }, [params, isValid, formState]);
    return (
        <>
            <Navbar />
            <div className="mt-1 sm:mx-auto sm:w-full h-full sm:max-w-sm">
                {validLink ? (
                    <>
                        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                            Reset Password
                        </h2>
                        {formState?.data}
                        <form action={formAction} className="space-y-6">
                            <input type="hidden" name="link" id="link" value={resolvedLink} />
                            <div>
                                <label
                                    htmlFor="resettoken"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Reset Token
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="resettoken"
                                        name="resettoken"
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    New Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        autoComplete="password"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <div>
                            <h1>Checking Link</h1>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}