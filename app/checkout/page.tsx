import Link from "next/link";
import { placeGuestOrder } from "../actions";
import { CartClient } from "../components/CartClient";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  if (params.status === "received") {
    return (
      <main className="subpage">
        <section className="empty-state">
          <h1>Order received</h1>
          <p>Your order was saved. Local payment integration is still a placeholder and can be connected later.</p>
          <Link className="primary-link" href="/">Return to shop</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="subpage">
      <header className="subpage-header">
        <Link href="/">Kestrel Market</Link>
        <h1>Checkout as guest</h1>
      </header>
      <form action={placeGuestOrder} className="checkout-form">
        <div className="guest-fields">
          <label>Name<input name="customerName" required /></label>
          <label>Email<input name="customerEmail" type="email" required /></label>
          <label>Phone<input name="customerPhone" /></label>
          <label>Delivery address<textarea name="deliveryAddress" required rows={5} /></label>
          <div className="payment-placeholder">Payment gateway: placeholder for future local payment integration.</div>
          <button type="submit">Place guest order</button>
        </div>
        <CartClient checkout />
      </form>
    </main>
  );
}
