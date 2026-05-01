import React from 'react';
import { Link } from 'react-router-dom';
import { Product, getDiscountedPrice } from '../lib/api';
import { Heart, HeartOff } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { OfferBadge } from './OfferBadge';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const isFav = isFavorite(product.id!);
  const finalPrice = getDiscountedPrice(product.price, product.offer);
  const hasDiscount = finalPrice < product.price;

  return (
    <div className="group flex flex-col gap-3 relative">
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product); }}
        className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors"
      >
        {isFav ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
      </button>
      <Link to={`/product/${product.id}`} className="block relative">
        <OfferBadge offer={product.offer} />
        <div className="aspect-[3/4] bg-zinc-900 overflow-hidden relative">
          <div className="absolute inset-0 bg-zinc-800 animate-pulse hidden group-hover:block opacity-20 transition-all"></div>
          <img 
            src={product.imageUrl} 
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex justify-between items-start text-white mt-3">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">{product.category}</p>
            <h4 className="text-sm font-medium">{product.name}</h4>
          </div>
          <div className="text-right">
            {hasDiscount && (
              <p className="text-[10px] line-through text-zinc-600 font-bold translate-no" translate="no">${product.price}</p>
            )}
            <p className={`text-sm font-bold translate-no ${hasDiscount ? 'text-white' : 'text-zinc-300'}`} translate="no">
              ${finalPrice.toFixed(2)} MXN
            </p>
          </div>
        </div>
        {(product.stock !== undefined) && (
           <div className={`mt-1 text-[10px] uppercase tracking-widest font-bold ${product.stock > 0 ? (product.stock < 5 ? 'text-red-500' : 'text-zinc-500') : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
           </div>
        )}
      </Link>
    </div>
  );
}
