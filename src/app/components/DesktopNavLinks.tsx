import Link from "next/link";
function DesktopNavLinks() {
  return (
    <ul className="absolute right-5 flex flex-row space-x-6">
      <li className="text-xl hover:text-blue-900 hover:font-semibold">
        <Link href="/">Home</Link>
      </li>
      <li className="text-xl hover:text-blue-900 hover:font-semibold">
        <Link href="/learn">Learn</Link>
      </li>
    </ul>
  );
}
export default DesktopNavLinks;
