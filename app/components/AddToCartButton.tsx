"use client";

import { ShoppingBag } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
};

export function AddToCartButton({ product }: { product: Product }) {
  return (
    <button
      className="icon-button"
      type="button"
      onClick={() => {
        const current = JSON.parse(localStorage.getItem("guest-cart") || "[]") as Array<Product & { quantity: number }>;
        const existing = current.find((item) => item.id === product.id);
        const next = existing
          ? current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
          : [...current, { ...product, quantity: 1 }];
        localStorage.setItem("guest-cart", JSON.stringify(next));
        window.dispatchEvent(new Event("cart-updated"));
      }}
      aria-label={`Add ${product.name} to cart`}
    >
      <ShoppingBag size={18} />
      Add
    </button>
  );
}
