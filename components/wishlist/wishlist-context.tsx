"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

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
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "dr_mars_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // sessizce geç
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // kota vb.
    }
  }, [items, isInitialized]);

  const isFavorite = (id: string) => items.some((i) => i.id === id);

  const toggleFavorite = (item: WishlistItem) => {
    if (isFavorite(item.id)) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.info(`${item.name} favorilerden çıkarıldı.`);
    } else {
      setItems((prev) => [...prev, item]);
      toast.success(`${item.name} favorilerinize eklendi!`, {
        action: {
          label: "Görüntüle",
          onClick: () => {
            window.location.href = "/favorilerim";
          },
        },
      });
    }
  };

  const removeFromWishlist = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (item) toast.info(`${item.name} favorilerden çıkarıldı.`);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isFavorite,
        toggleFavorite,
        removeFromWishlist,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
