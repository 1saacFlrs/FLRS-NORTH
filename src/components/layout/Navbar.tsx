import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Heart, User as UserIcon, LogOut, Search } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { SearchOverlay } from '../SearchOverlay';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const favoriteItems = useFavoritesStore((state) => state.items);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("¿Seguro que deseas cerrar sesión? / Are you sure you want to log out?")) {
      await signOut(auth);
      // Explicitly clear local stores so the next person logging in doesn't see old items
      useCartStore.getState().clearCart();
      useFavoritesStore.setState({ items: [] });
      navigate('/');
    }
  };

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 print:hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold tracking-[0.2em] uppercase text-white" translate="no">
              FLRS NORTH
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest uppercase text-zinc-400 items-center">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="hover:text-white transition-colors">Shop All</Link>
              <Link to="/admin" className="text-stone-400 border-l border-zinc-800 pl-8 hover:text-white transition-colors">Admin</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div id="google_translate_element" className="mt-0 mb-2 hidden md:block"></div>
            <button onClick={() => setIsSearchOpen(true)} className="relative hover:text-zinc-300 transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
            <Link to="/favorites" className="relative hover:text-zinc-300 transition-colors">
              <Heart className="w-5 h-5 text-white" />
              {favoriteItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center">
                  {favoriteItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative hover:text-zinc-300 transition-colors">
              <ShoppingCart className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex gap-6 items-center border-l border-zinc-800 pl-6 ml-2">
                <Link to="/profile" className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest transition-colors font-bold">Profile</Link>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest hidden lg:inline">{user.email}</span>
                  <button onClick={handleLogout} className="text-zinc-500 hover:text-white transition-colors relative group">
                     <LogOut className="w-5 h-5" />
                     <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-zinc-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-zinc-400 hover:text-white transition-colors border-l border-zinc-800 pl-6 ml-2">
                <UserIcon className="w-5 h-5 text-white" />
              </Link>
            )}
            <div className="md:hidden flex items-center text-white">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black border-b border-zinc-800">
          <div className="px-4 pt-2 pb-6 space-y-2 uppercase tracking-widest text-xs text-zinc-400">
            <Link 
              to="/" 
              className="block px-3 py-3 font-medium hover:bg-zinc-900 hover:text-white rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className="block px-3 py-3 font-medium hover:bg-zinc-900 hover:text-white rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Shop All
            </Link>
            {user ? (
               <>
                 <Link 
                  to="/profile" 
                  className="block px-3 py-3 font-medium hover:bg-zinc-900 hover:text-white rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                 <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="block w-full text-left px-3 py-3 font-medium hover:bg-zinc-900 hover:text-white rounded-md"
                 >
                   Log Out
                 </button>
               </>
            ) : (
               <Link 
                to="/login" 
                className="block px-3 py-3 font-medium hover:bg-zinc-900 hover:text-white rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Log In
              </Link>
            )}
            <Link 
              to="/admin" 
              className="block px-3 py-3 font-medium hover:bg-zinc-900 hover:text-white rounded-md text-stone-400"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
