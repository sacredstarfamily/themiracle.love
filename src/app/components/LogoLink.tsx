import Link from "next/link";
import Image from 'next/image';
import Logo from './rect4.png';
import styles from '../main.module.css';
function LogoLink() {
  return (
    <div className=" mb-1 text-center ml-2 w-30 sm:mb-0">
      <Link href="/">
        <p className="text-6xl font-bold text-rose-500 hover:text-blue-900 font-[family-name:var(--font-walto-graph)]">
          <Image src={Logo} className={styles.Logo} alt="Logo" />
        </p>
      </Link>
    </div>
  );
}
export default LogoLink;
