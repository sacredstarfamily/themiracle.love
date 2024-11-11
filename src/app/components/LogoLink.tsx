import Link from "next/link";
import Image from "next/image";
import Logo from "./wordlogo.png";
import styles from "../main.module.css";
function LogoLink() {
  return (
    <div className=" mb-1 text-center ml-2 w-30 sm:mb-0">
      <Link href="/">
             <Image src={Logo} className={styles.Logo} alt="Logo" />
      </Link>
    </div>
  );
}
export default LogoLink;
