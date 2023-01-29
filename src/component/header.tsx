import Link from "next/link";

const Header = () => {
  return (
    <>
      <header>
        <h1>Header</h1>
        <nav>
          <Link href="/">home</Link>
          <Link href="/page">page</Link>
        </nav>
      </header>
    </>
  );
};

export default Header;
