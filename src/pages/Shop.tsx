import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, Product, Category } from '../lib/api';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ProductCard } from '../components/ProductCard';

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Dynamically add categories
        const dynamicCategories = categoriesData.map(c => c.name);
        const allCategories = ['All', 'T-Shirts', 'Hoodies', 'Accessories', ...dynamicCategories];
        // Deduplicate
        setCategories([...new Set(allCategories)]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  return (
    <div className="flex flex-col md:flex-row w-full mt-20">
      {/* Sidebar Categories */}
      <aside className="w-full md:w-64 md:border-r border-zinc-800 p-8 flex flex-col justify-start">
        <div className="space-y-8 sticky top-28">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">Categories</h3>
            <ul className="space-y-3 text-sm font-light">
              {categories.map(category => (
                <li 
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer transition-colors",
                    activeCategory === category ? "text-white font-medium" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <span>{category}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">Filter</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 border border-zinc-800 rounded-full text-[10px] hover:border-zinc-400 cursor-pointer">S</span>
              <span className="px-3 py-1 border border-zinc-800 rounded-full text-[10px] hover:border-zinc-400 cursor-pointer">M</span>
              <span className="px-3 py-1 border border-zinc-800 rounded-full text-[10px] hover:border-zinc-400 cursor-pointer">L</span>
              <span className="px-3 py-1 border border-zinc-800 rounded-full text-[10px] hover:border-zinc-400 cursor-pointer">XL</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 px-8 pb-12 pt-8 w-full">
        <div className="mb-12 hidden md:block">
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-white mb-2">Shop Collection</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">{activeCategory} Items</p>
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
            {filteredProducts.map((product) => (
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
        ) : (
          <div className="text-center py-20 text-zinc-600 uppercase tracking-widest text-xs border border-zinc-800 rounded-lg border-dashed">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
