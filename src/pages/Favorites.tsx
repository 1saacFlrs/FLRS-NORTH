import { Link } from 'react-router-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';

export function Favorites() {
  const { items } = useFavoritesStore();

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
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
    </div>
  );
}
