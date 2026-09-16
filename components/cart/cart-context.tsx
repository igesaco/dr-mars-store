"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantName: string;
  sku: string;
  price: number;
  image?: string;
  volumeMl?: number;
  quantity: number;
};

export type AppliedCoupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  freeShippingThreshold: number;
  shippingDiff: number;
  discountAmount: number;
  total: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "dr_mars_cart_v1";
const COUPON_STORAGE_KEY = "dr_mars_coupon_v1";
const FREE_SHIPPING_THRESHOLD = 1500;
const STANDARD_SHIPPING = 59;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEY);
      if (savedItems) setItems(JSON.parse(savedItems));
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch {
      // sessizce geç
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // LocalStorage'a kaydet
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage kotası vb.
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // sessizce geç
    }
  }, [coupon, isInitialized]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingCost = items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const shippingDiff = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  let discountAmount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.type === "percent") {
      discountAmount = Math.round(((subtotal * coupon.value) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(subtotal, coupon.value);
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const applyCoupon = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: "Kupon kodu boş olamaz." };

    try {
      const res = await fetch(`/api/coupon/validate?code=${encodeURIComponent(clean)}&subtotal=${subtotal}`);
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        coupon?: AppliedCoupon;
      };
      if (!res.ok || !data.success) {
        return { success: false, message: data.message ?? "Kupon kodu geçersiz." };
      }
      if (data.coupon) {
        setCoupon(data.coupon);
      }
      return { success: true, message: "Kupon kodu başarıyla uygulandı!" };
    } catch {
      return { success: false, message: "Kupon doğrulanırken bir hata oluştu." };
    }
  };

  const removeCoupon = () => setCoupon(null);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingCost,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        shippingDiff,
        discountAmount,
        total,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        coupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
