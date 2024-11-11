import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};
function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <div
      className={`fixed flex flex-col justify-center items-center z-10 top-0 right-0 h-full w-full bg-pink-300 text-rose-950 transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button className="absolute right-7 top-4 p-3" onClick={onClose}>
        <FontAwesomeIcon className="text-5xl" icon={faXmark} />
      </button>
      <ul className="flex flex-col justify-center items-center space-y-4">
        <li className="text-xl hover:text-blue-600 hover:font-semibold font-[family-name:var(--font-cheri)]">
          <Link href="/">Home</Link>
        </li>
        <li className="text-xl hover:text-blue-600 hover:font-semibold font-[family-name:var(--font-cheri)]">
          <Link href="/shop">Shop</Link>
        </li>
        <li className="text-xl hover:text-blue-600 hover:font-semibold font-[family-name:var(--font-cheri)]">
          <Link href="/auth">Signup@Login</Link>
        </li>
      </ul>
    </div>
  );
}
export default MobileDrawer;
