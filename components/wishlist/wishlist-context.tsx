"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type WishlistItem = {
  id: string;
  name: string;
  slug: string;
  price: string;
  imageUrl?: string | null;
  shortDescription?: string | null;
};

type WishlistContextType = {
  items: WishlistItem[];
  count: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "dr_mars_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch {
        // sessizce geç
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // kota vb.
    }
  }, [items, mounted]);

  const isFavorite = (id: string) => items.some((item) => item.id === id);

  const toggleFavorite = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isFavorite,
        toggleFavorite,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
