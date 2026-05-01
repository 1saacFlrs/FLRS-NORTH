import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Product, getDiscountedPrice } from '../lib/api';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSearchTerm('');
      setResults([]);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setResults(filtered);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimer);
  }, [searchTerm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex flex-col items-center pt-24 px-6 overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-zinc-400">
            <X className="w-8 h-8" />
          </button>
          
          <div className="w-full max-w-2xl relative">
            <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
               autoFocus
               type="text"
               placeholder="Search products, categories..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-transparent border-b-2 border-zinc-700 text-white text-2xl lg:text-4xl py-6 pl-16 pr-4 focus:outline-none focus:border-white placeholder:text-zinc-700 uppercase tracking-widest"
            />
          </div>

          <div className="w-full max-w-4xl mt-12 pb-12">
            {isSearching ? (
               <p className="text-zinc-500 uppercase tracking-widest text-center text-xs text-bold">Searching...</p>
            ) : results.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {results.map((product) => {
                   const finalPrice = getDiscountedPrice(product.price, product.offer);
                   const hasDiscount = finalPrice < product.price;
                   return (
                     <Link key={product.id} to={`/product/${product.id}`} onClick={onClose} className="group block">
                       <div className="aspect-[3/4] bg-zinc-900 overflow-hidden mb-3">
                         <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-all duration-500" />
                       </div>
                       <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{product.category}</p>
                       <p className="text-sm font-medium truncate">{product.name}</p>
                       <div className="flex items-center gap-2">
                         {hasDiscount && (
                           <span className="text-[10px] line-through text-zinc-600 font-bold translate-no" translate="no">${product.price}</span>
                         )}
                         <p className={`text-sm font-bold ${hasDiscount ? 'text-white' : 'text-zinc-400'}`} translate="no">${finalPrice.toFixed(2)} MXN</p>
                       </div>
                     </Link>
                   );
                 })}
               </div>
            ) : searchTerm.trim().length >= 2 ? (
               <p className="text-zinc-500 uppercase tracking-widest text-center text-xs">No products found.</p>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
