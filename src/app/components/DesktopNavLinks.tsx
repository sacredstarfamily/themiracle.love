import Link from "next/link";
import useAuthStore from "@/context/auth-context";
function DesktopNavLinks() {
  const { isLoggedIn } = useAuthStore();

  return (
    <ul className="absolute right-3 flex flex-row space-x-4 font-[family-name:var(--font-cheri)]">
      <li className="text-lg hover:text-blue-900 hover:font-semibold">
        <Link href="/">Home</Link>
      </li>
      <li className="text-lg hover:text-blue-900 hover:font-semibold font-[family-name:var(--font-cheri)]">
        <Link href="/shop">Shop</Link>
      </li>
      {isLoggedIn ? <li className="text-lg hover:text-blue-900 hover:font-semibold font-[family-name:var(--font-cheri)]">
        <Link href="/dashboard">Dashboard</Link>
      </li> : <li className="text-lg hover:text-blue-900 hover:font-semibold font-[family-name:var(--font-cheri)]">
        <Link href="/auth">SignUp@Login</Link>
      </li>}

    </ul>
  );
}
export default DesktopNavLinks;
