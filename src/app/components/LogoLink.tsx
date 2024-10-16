import Link from 'next/link';
function LogoLink() {
  return (
    <div className=" mb-2 text-center ml-2 sm:mb-0">
      <Link href="/">
        <p className="text-6xl font-bold text-rose-500 hover:text-blue-900 font-[family-name:var(--font-walto-graph)]">themiracle.love</p>
      </Link>
    </div>
  );
}
export default LogoLink;