"use client";
import { facebookGetUser, facebookLogin, loadFacebookSDK } from "@/lib/facebook";
import Image from "next/image";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FormWrapper from "./FormWrapper";

type FBUser = { id?: string; name?: string; email?: string; picture?: string };
type FBPictureResponse = { data?: { url?: string } };

// Extend FBStatic to include the 'ui' method for sharing
declare global {
  interface FBStatic {
    ui?: (params: Record<string, unknown>, callback?: (response: unknown) => void) => void;
  }
}

export default function AuthPage() {
  const [fbUser, setFbUser] = useState<FBUser | null>(null);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);

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

        // Fix: Use FB.api with correct callback signature for like count
        window.FB.api(
          '/themiracle.love',
          { fields: 'fan_count' },
          function (response: unknown) {
            if (
              typeof response === "object" &&
              response !== null &&
              "fan_count" in response &&
              typeof (response as { fan_count?: number }).fan_count === "number"
            ) {
              setLikeCount((response as { fan_count: number }).fan_count);
            }
          }
        );
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

  // Custom Like handler (simulate like by opening the page in a new tab)
  const handleCustomLike = () => {
    setHasLiked(true);
    window.open("https://www.facebook.com/themiracle.love", "_blank", "noopener,noreferrer");
  };

  // Custom Share handler using FB.ui
  const handleCustomShare = () => {
    if (typeof window !== "undefined" && window.FB && typeof window.FB.ui === "function") {
      window.FB.ui(
        {
          method: "share",
          href: "https://themiracle.love",
        },
        () => {
          // No-op, response not used
        }
      );
    } else {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=https://themiracle.love`,
        "_blank",
        "noopener,noreferrer"
      );
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

            {/* Custom Facebook Like & Share Buttons */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleCustomLike}
                className={`px-4 py-2 rounded-lg font-bold transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 ${hasLiked ? "opacity-70" : ""}`}
                disabled={hasLiked}
              >
                <svg width="20" height="20" fill="currentColor" className="mr-1">
                  <path d="M9 18V8H5.5A1.5 1.5 0 0 0 4 9.5v7A1.5 1.5 0 0 0 5.5 18H9zm2-10V18h5.5A1.5 1.5 0 0 0 18 16.5v-7A1.5 1.5 0 0 0 16.5 8H11zm-1-6a2 2 0 0 1 2 2v2H8V4a2 2 0 0 1 2-2z" />
                </svg>
                {hasLiked ? "Liked!" : "Like"}
                {likeCount !== null && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{likeCount} fans</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleCustomShare}
                className="px-4 py-2 rounded-lg font-bold transition-colors bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
              >
                <svg width="20" height="20" fill="currentColor" className="mr-1">
                  <path d="M15 8a3 3 0 0 0-2.83 2H7a3 3 0 0 0 0 6h5.17A3 3 0 1 0 15 8zm-6 7a1 1 0 1 1 0-2h6a1 1 0 1 1 0 2H9zm6-7a1 1 0 1 1 0 2h-6a1 1 0 1 1 0-2h6z" />
                </svg>
                Share
              </button>
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
