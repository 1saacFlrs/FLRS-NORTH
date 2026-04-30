import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../lib/api';

interface FavoritesStore {
  items: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item.id === product.id);
        if (exists) {
          set({ items: currentItems.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...currentItems, product] });
        }
      },
      isFavorite: (id) => {
        return get().items.some((item) => item.id === id);
      },
    }),
    {
      name: 'flrs-north-favorites',
    }
  )
);
