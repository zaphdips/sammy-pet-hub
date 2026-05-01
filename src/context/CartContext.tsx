"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface CartItem {
  id?: string;
  name: string;
  category: string;
  price: number;
  quantity?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
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

  const addToCart = (item: CartItem, quantity: number = 1) => {
    setCart((prev) => {
      // If item has an ID, check if it already exists
      if (item.id) {
        const existingIndex = prev.findIndex((p) => p.id === item.id);
        if (existingIndex >= 0) {
          const newCart = [...prev];
          const currentQty = newCart[existingIndex].quantity || 1;
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: currentQty + quantity
          };
          return newCart;
        }
      }
      
      // Check by name as fallback for items without IDs
      const existingNameIndex = prev.findIndex((p) => p.name === item.name);
      if (existingNameIndex >= 0 && !item.id) {
         const newCart = [...prev];
         const currentQty = newCart[existingNameIndex].quantity || 1;
         newCart[existingNameIndex] = {
           ...newCart[existingNameIndex],
           quantity: currentQty + quantity
         };
         return newCart;
      }

      // Add new item
      return [...prev, { ...item, quantity }];
    });
    showToast(`${quantity > 1 ? quantity + 'x ' : ''}${item.name} added to cart! 🛍️`, "success");
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], quantity };
      return newCart;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, isCartOpen, openCart, closeCart, clearCart 
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
