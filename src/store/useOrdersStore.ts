import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '../lib/api';

interface OrdersStore {
  items: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: 'processing' | 'shipped' | 'delivered') => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      items: [],
      setOrders: (orders) => set({ items: orders }),
      addOrder: (order) => set((state) => ({ items: [...state.items, order] })),
      removeOrder: (id) => set((state) => ({ items: state.items.filter(order => order.id !== id) })),
      updateOrderStatus: (id, status) => set((state) => ({ 
        items: state.items.map(order => order.id === id ? { ...order, status } : order) 
      })),
    }),
    {
      name: 'orders-storage',
    }
  )
);

