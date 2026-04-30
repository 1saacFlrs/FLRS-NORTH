import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile, updateUserProfileData, createUserProfile, getProductById } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useOrdersStore } from '../store/useOrdersStore';

export function AuthSync() {
  const { setUser, setLoading, user } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const favoriteItems = useFavoritesStore((state) => state.items);
  const orderItems = useOrdersStore((state) => state.items);
  const isInitialLoad = useRef(true);
  const lastSyncState = useRef({ cart: '', favorites: '', orders: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          setUser(firebaseUser);
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            await createUserProfile(firebaseUser.uid, firebaseUser.email || '');
            profile = { email: firebaseUser.email || '', cart: [], favorites: [], orders: [] };
          }
          
          if (profile) {
            if (profile.cart && profile.cart.length > 0) {
              useCartStore.setState({ items: profile.cart });
              lastSyncState.current.cart = JSON.stringify(profile.cart);
            } else {
              useCartStore.setState({ items: [] });
            }
            if (profile.favorites && profile.favorites.length > 0) {
              const favProducts = [];
              for (const id of profile.favorites) {
                const p = await getProductById(id);
                if (p) favProducts.push(p);
              }
              useFavoritesStore.setState({ items: favProducts });
              lastSyncState.current.favorites = JSON.stringify(profile.favorites);
            } else {
              useFavoritesStore.setState({ items: [] });
            }
            if (profile.orders && profile.orders.length > 0) {
              useOrdersStore.getState().setOrders(profile.orders);
              lastSyncState.current.orders = JSON.stringify(profile.orders);
            } else {
              useOrdersStore.getState().setOrders([]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      isInitialLoad.current = false;
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  useEffect(() => {
    if (!user || isInitialLoad.current) return;
    
    const cartStr = JSON.stringify(cartItems);
    const favStr = JSON.stringify(favoriteItems.map(f => f.id));
    const ordStr = JSON.stringify(orderItems);
    
    if (cartStr !== lastSyncState.current.cart || favStr !== lastSyncState.current.favorites || ordStr !== lastSyncState.current.orders) {
      lastSyncState.current = { cart: cartStr, favorites: favStr, orders: ordStr };
      const timeoutId = setTimeout(() => {
        updateUserProfileData(user.uid, {
          cart: cartItems,
          favorites: favoriteItems.map(f => f.id!),
          orders: orderItems
        }).catch(err => console.error("Could not sync to cloud:", err));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, favoriteItems, orderItems, user]);

  return null;
}
