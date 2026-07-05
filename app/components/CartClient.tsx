"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

type CartItem = {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  quantity: number;
};

export function CartClient({ checkout = false }: { checkout?: boolean }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const load = () => setItems(JSON.parse(localStorage.getItem("guest-cart") || "[]"));
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items]);

  function save(next: CartItem[]) {
    setItems(next);
    localStorage.setItem("guest-cart", JSON.stringify(next));
  }

  if (!items.length) {
    return (
      <section className="empty-state">
        <h1>Your cart is empty</h1>
        <p>Products can be added without creating an account.</p>
        <Link className="primary-link" href="/">Browse products</Link>
      </section>
    );
  }

  return (
    <section className="cart-grid">
      <div className="cart-list">
        {items.map((item) => (
          <article className="cart-row" key={item.id}>
            <img src={item.imageUrl} alt="" />
            <div>
              <h2>{item.name}</h2>
              <p>${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="qty-controls">
              <button type="button" aria-label="Decrease quantity" onClick={() => save(items.flatMap((next) => next.id === item.id ? (next.quantity > 1 ? [{ ...next, quantity: next.quantity - 1 }] : []) : [next]))}><Minus size={16} /></button>
              <span>{item.quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => save(items.map((next) => next.id === item.id ? { ...next, quantity: next.quantity + 1 } : next))}><Plus size={16} /></button>
              <button type="button" aria-label="Remove item" onClick={() => save(items.filter((next) => next.id !== item.id))}><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>
      <aside className="summary-box">
        <h2>Order summary</h2>
        <div className="summary-line"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
        {checkout ? <input type="hidden" name="items" value={JSON.stringify(items)} /> : <Link className="checkout-button" href="/checkout">Checkout as guest</Link>}
        <p>Payment gateway is intentionally not connected. Local payment details are handled after order submission.</p>
      </aside>
    </section>
  );
}
