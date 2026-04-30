import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVisibleProducts, Product } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ProductCard } from '../components/ProductCard';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getVisibleProducts();
        setProducts(productsData);
        
        // Dynamically add categories based on existing products
        const dynamicCategories = productsData.map(p => p.category);
        const allCategories = ['All', ...dynamicCategories];
        setCategories([...new Set(allCategories)]);

        // Dynamically extract all available sizes
        const sizeSet = new Set<string>();
        productsData.forEach(p => {
          if (p.sizes) {
            p.sizes.forEach(s => sizeSet.add(s));
          }
        });
        // Sort predefined sizes if possible, but for simplicity let's just use alphabetically or naturally order them
        setAvailableSizes(Array.from(sizeSet).sort());
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery));
    }

    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (activeSizes.length > 0) {
      filtered = filtered.filter(p => 
        p.sizes && p.sizes.some(size => activeSizes.includes(size))
      );
    }

    setFilteredProducts(filtered);
  }, [activeCategory, activeSizes, products]);

  const toggleSize = (size: string) => {
    setActiveSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-full mt-20">
      {/* Sidebar Categories */}
      <aside className="w-full md:w-64 md:border-r border-zinc-800 p-8 flex flex-col justify-start">
        <div className="space-y-8 sticky top-28">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-zinc-900/50 border-zinc-800 text-sm text-white placeholder:text-zinc-500 rounded-none h-10 tracking-widest"
            />
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">Categories</h3>
            <ul className="space-y-3 text-sm font-light">
              {categories.map(category => (
                <li 
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer transition-colors",
                    activeCategory === category ? "text-white font-bold" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <span>{category}</span>
                </li>
              ))}
            </ul>
          </div>
          {availableSizes.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">Filter by Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    translate="no"
                    className={cn(
                      "px-3 py-1 border rounded-full text-[10px] cursor-pointer transition-colors font-bold tracking-widest",
                      activeSizes.includes(size) 
                        ? "border-white bg-white text-black" 
                        : "border-zinc-800 bg-black text-zinc-400 hover:border-zinc-500"
                    )}
                  >
                    {size}
                  </button>
                ))}
            </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 px-8 pb-12 pt-8 w-full">
        <div className="mb-12 hidden md:block">
          <h1 className="text-3xl font-black tracking-[0.2em] uppercase text-white mb-2">Shop Collection</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">{activeCategory} Items {activeSizes.length > 0 && `| Sizes: ${activeSizes.join(', ')}`}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
               <div key={i} className="animate-pulse flex flex-col gap-3">
                 <div className="bg-zinc-900 aspect-[3/4] w-full rounded-lg"></div>
                 <div className="h-4 bg-zinc-900 w-2/3"></div>
                 <div className="h-4 bg-zinc-900 w-1/3"></div>
               </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={product.id}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-zinc-600 uppercase tracking-widest text-xs border border-zinc-800 rounded-lg border-dashed">
            No products found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
