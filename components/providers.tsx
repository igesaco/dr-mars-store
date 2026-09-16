"use client";

import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WishlistProvider } from "@/components/wishlist/wishlist-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <Toaster position="top-right" richColors closeButton />
      </CartProvider>
    </WishlistProvider>
  );
}
