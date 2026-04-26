"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface CartItem {
  id?: string;
  name: string;
  category: string;
  price: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  // Load cart from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sammy_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      // localStorage is corrupted — start with an empty cart
      localStorage.removeItem("sammy_cart");
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem("sammy_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    showToast(`${item.name} added to cart! 🛍️`, "success");
    // Removed auto-open to allow continuous shopping
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, isCartOpen, openCart, closeCart, clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
