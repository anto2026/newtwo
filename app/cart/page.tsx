import Link from "next/link";
import { CartClient } from "../components/CartClient";

export default function CartPage() {
  return (
    <main className="subpage">
      <header className="subpage-header">
        <Link href="/">Kestrel Market</Link>
        <h1>Guest cart</h1>
      </header>
      <CartClient />
    </main>
  );
}
