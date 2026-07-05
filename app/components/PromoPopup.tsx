"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPromo = localStorage.getItem("promo-popup-seen");
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("promo-popup-seen", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-overlay"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="modal-content promo-modal">
        <button
          className="modal-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close promo popup"
          type="button"
        >
          <X size={24} />
        </button>

        <div className="modal-body promo-body">
          <div className="promo-badge">🎉 LIMITED OFFER</div>
          <h2>Get 20% Off Your First Order</h2>
          <p>Shop premium local goods with special guest pricing</p>

          <div className="promo-highlight">
            <span className="promo-code">USE CODE: WELCOME20</span>
            <p className="promo-subtitle">Valid on all orders this week</p>
          </div>

          <button
            className="modal-cta promo-cta"
            onClick={() => {
              setIsOpen(false);
              window.location.href = "#products";
            }}
            type="button"
          >
            Shop Now
          </button>

          <p className="promo-footer">No account required • Free delivery available</p>
        </div>
      </div>
    </>
  );
}
