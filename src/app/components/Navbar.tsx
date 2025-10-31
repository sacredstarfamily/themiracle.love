"use client";
import { logoutUserAction } from "@/actions/actions";
import useAuthStore from "@/context/auth-context";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConnectButton from "../dashboard/components/ConnectButton";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUserAction();
    logout();
    router.push("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="sticky top-0 left-0 right-0 z-50 shadow-md border-b border-gray-200"
      style={{
        background: "linear-gradient(#fcb6d9, #bc0061)",
        transform: "translateZ(0)", // Force hardware acceleration
        willChange: "transform", // Optimize for position changes
        backfaceVisibility: "hidden", // Optimize rendering
        height: "4rem" // Explicitly set navbar height for consistent spacing
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl pr-5  font-bold text-white hover:text-gray-200 transition-colors">
              themiracle.love
            </Link>
          </div>

          {/* Desktop Navigation - Right Aligned */}
          <div className="hidden md:flex items-center space-x-8 ml-auto">
            <Link
              href="/"
              className="text-white hover:text-gray-200 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-white hover:text-gray-200 transition-colors"
            >
              Shop
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <ConnectButton />
                  <span className="text-white text-sm">
                    Hello, {user?.name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded transition-colors font-medium"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - Larger and Vertically Centered */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 transition-colors p-3"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon
                icon={isMenuOpen ? faTimes : faBars}
                className="w-7 h-7"
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - with proper z-index */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-300 absolute top-16 left-0 right-0" style={{ transform: "translateZ(0)" }}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white bg-opacity-95 backdrop-blur-sm">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded transition-colors"
                onClick={closeMenu}
              >
                Shop
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2 border-t border-gray-200">
                    <div className="space-y-2">
                      <ConnectButton />
                      <div className="text-gray-600 text-sm">
                        Hello, {user?.name || user?.email}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded transition-colors font-medium text-center"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
