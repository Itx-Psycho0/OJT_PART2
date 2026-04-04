import Link from "next/link";
import Image from "next/image";
import SearchInput from "./search-input";

export const Navbar = () => {
  return (
    <nav className="flex items-center mt-1 justify-between h-full w-full ">
      <div className="flex gap-3 items-center shrink-0 pr-6">
        <Link href="/">
          <Image src="/logo2.svg" alt="logo" width={180} height={180} />
        </Link>
      </div>
      <SearchInput />
      <div />
    </nav>
  );
};
