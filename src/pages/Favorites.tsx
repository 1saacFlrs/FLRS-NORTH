import { Link } from 'react-router-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { HeartOff } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

export function Favorites() {
  const { items, toggleFavorite } = useFavoritesStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-24 text-center w-full min-h-[60vh] flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-black uppercase tracking-[0.2em] mb-4">No Favorites Yet</h2>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">Save items you love to shop them later.</p>
        <Link to="/shop">
          <Button size="lg" className="rounded-none bg-white text-black hover:bg-zinc-200 uppercase text-xs tracking-widest font-bold px-8">
             Discover Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 w-full mt-20 text-white">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-white mb-2">Favorites</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">{items.length} Items saved</p>
        </div>

        <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {items.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                key={product.id}
              >
                <div className="group flex flex-col gap-3 relative">
                  <button 
                    onClick={(e) => { e.preventDefault(); toggleFavorite(product); }}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors"
                  >
                    <HeartOff className="w-4 h-4" />
                  </button>
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0 bg-zinc-800 animate-pulse hidden group-hover:block opacity-20"></div>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex justify-between items-start text-white mt-3">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">{product.category}</p>
                        <h4 className="text-sm font-medium">{product.name}</h4>
                      </div>
                      <p className="text-sm font-bold text-zinc-300 translate-no" translate="no">${product.price} MXN</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
    </div>
  );
}
