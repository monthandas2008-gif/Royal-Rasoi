import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  bookingData: any;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateCartQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  setBookingData: (data: any) => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      bookingData: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find((i) => i.id === item.id);
        if (existing) {
          set({
            cart: cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }] });
        }
      },
      removeFromCart: (id) =>
        set({ cart: get().cart.filter((i) => i.id !== id) }),
      updateCartQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter((i) => i.id !== id) });
        } else {
          set({
            cart: get().cart.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      setBookingData: (data) => set({ bookingData: data }),
      cartTotal: () =>
        get().cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      cartCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'royal-rasoi-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        cart: state.cart,
      }),
    }
  )
);
