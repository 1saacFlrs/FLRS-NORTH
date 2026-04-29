import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold tracking-[0.2em] uppercase text-white">
              FLRS NORTH
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest uppercase text-zinc-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="hover:text-white transition-colors">Shop All</Link>
              <Link to="/admin" className="text-stone-400 border-l border-zinc-800 pl-8 hover:text-white transition-colors">Admin</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/cart" className="relative hover:text-zinc-300 transition-colors">
              <ShoppingCart className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
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
  );
}
