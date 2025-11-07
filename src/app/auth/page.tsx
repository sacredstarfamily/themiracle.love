"use client";
import { facebookGetUser, facebookLogin, loadFacebookSDK } from "@/lib/facebook";
import Image from "next/image";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FormWrapper from "./FormWrapper";

type FBUser = { id?: string; name?: string; email?: string; picture?: string };
type FBPictureResponse = { data?: { url?: string } };

export default function AuthPage() {
  const [fbUser, setFbUser] = useState<FBUser | null>(null);

  useEffect(() => {
    loadFacebookSDK().then(() => {
      if (typeof window !== "undefined" && window.FB) {
        window.FB.getLoginStatus(function (response) {
          if (response.authResponse) {
            facebookGetUser("id,name,email,picture").then((userInfo) => {
              if (userInfo.id && window.FB) {
                window.FB.api(
                  `/${userInfo.id}/picture?type=large&redirect=false`,
                  {},
                  (picRes: unknown) => {
                    let url: string | undefined;
                    if (
                      typeof picRes === "object" &&
                      picRes !== null &&
                      "data" in picRes
                    ) {
                      const pic = picRes as FBPictureResponse;
                      if (typeof pic.data?.url === "string") {
                        url = pic.data.url;
                      }
                    }
                    setFbUser({
                      ...userInfo,
                      picture: url,
                    });
                  }
                );
              } else {
                setFbUser(userInfo);
              }
            });
          }
        });
      }
    });
  }, []);

  const handleFacebookLogin = async () => {
    try {
      await loadFacebookSDK();
      const loginResponse = await facebookLogin("instagram_basic, instagram_content_publish, public_profile, email");
      if (loginResponse.authResponse) {
        const userInfo = await facebookGetUser("id,name,email,picture");
        if (userInfo.id && typeof window !== "undefined" && window.FB) {
          window.FB.api(
            `/${userInfo.id}/picture?type=large&redirect=false`,
            {},
            (picRes: unknown) => {
              let url: string | undefined;
              if (
                typeof picRes === "object" &&
                picRes !== null &&
                "data" in picRes
              ) {
                const pic = picRes as FBPictureResponse;
                if (typeof pic.data?.url === "string") {
                  url = pic.data.url;
                }
              }
              setFbUser({
                ...userInfo,
                picture: url,
              });
            }
          );
        } else {
          setFbUser(userInfo);
        }
        /* // const formData = new FormData();
         // formData.append("name", userInfo.name || "");
         // formData.append("email", userInfo.email || "");
         // formData.append("password", "facebook_oauth");
         // await createUser(undefined, formData);
         // window.location.href = "/dashboard"; */
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Facebook login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <FormWrapper />
          <div className="mt-8 flex flex-col items-center space-y-4">
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="w-full max-w-xs py-2 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="24" height="24" fill="currentColor" className="mr-2">
                <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
              </svg>
              Continue with Facebook
            </button>

            {/* Facebook Like Button */}
            <div className="mt-4">
              <div
                className="fb-like"
                data-href="https://themiracle.love"
                data-width=""
                data-layout="button"
                data-action="like"
                data-size="large"
                data-share="true"
              ></div>
            </div>

            {/* Facebook Profile Indicator */}
            {fbUser && fbUser.picture && (
              <div className="flex flex-col items-center mt-4">
                <Image
                  src={fbUser.picture}
                  alt="Facebook Profile"
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-blue-500 shadow"
                  unoptimized
                />
                <span className="mt-2 text-blue-700 font-semibold">
                  {fbUser.name}
                </span>
                <span className="text-xs text-gray-500">{fbUser.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
