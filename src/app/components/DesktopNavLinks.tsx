import Link from "next/link";
function DesktopNavLinks() {
  return (
    <ul className="absolute right-3 flex flex-row space-x-4">
      <li className="text-lg hover:text-blue-900 hover:font-semibold">
        <Link href="/">Home</Link>
      </li>
      <li className="text-lg hover:text-blue-900 hover:font-semibold">
        <Link href="/learn">Learn</Link>
      </li>
      <li className="text-lg hover:text-blue-900 hover:font-semibold">
        <Link href="/auth">
        SignUp/Login
        </Link>
      </li>
    </ul>
  );
}
export default DesktopNavLinks;
