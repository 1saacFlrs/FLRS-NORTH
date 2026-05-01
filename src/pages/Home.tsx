import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { getFeaturedProducts, Product } from '../lib/api';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeatured(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full flex-col flex gap-8">
      {/* Hero Section */}
      <div className="h-[70vh] bg-zinc-900 mx-8 mt-20 mb-8 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-60 grayscale group-hover:scale-105 transition-transform duration-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

        <div className="absolute bottom-12 left-12 z-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white"
            translate="no"
          >
            For Life, Real Style
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-zinc-300 text-sm md:text-base font-light mt-4 tracking-widest uppercase"
          >
            Minimalist Urban Essentials
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute bottom-12 right-12 hidden md:block"
        >
          <Link to="/shop">
            <Button size="lg" className="px-8 py-6 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-zinc-200 transition-colors rounded-none">
              Shop Collection
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="px-8 md:hidden mb-8">
        <Link to="/shop">
          <Button size="lg" className="w-full py-6 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-zinc-200 transition-colors rounded-none">
            Shop Collection
          </Button>
        </Link>
      </div>

      {/* Featured Products */}
      <section className="px-8 pb-24 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-[0.2em] uppercase text-white">Latest Arrivals</h2>
            <p className="text-zinc-500 mt-2 text-xs uppercase tracking-widest">Curated for the modern individual.</p>
          </div>
          <Link to="/shop" className="hidden md:inline-flex mt-4 md:mt-0 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white pb-1 text-white hover:text-zinc-400 hover:border-zinc-400 transition-colors">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="animate-pulse flex flex-col gap-3">
                 <div className="bg-zinc-900 aspect-[3/4] w-full rounded-lg"></div>
                 <div className="h-4 bg-zinc-900 w-2/3"></div>
                 <div className="h-4 bg-zinc-900 w-1/3"></div>
               </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-600 uppercase tracking-widest text-xs border border-zinc-800 border-dashed rounded-lg">
            No products available yet.
          </div>
        )}
      </section>
    </div>
  );
}
