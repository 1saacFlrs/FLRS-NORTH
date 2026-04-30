import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, Product } from '../lib/api';
import { useCartStore } from '../store/useCartStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { ChevronLeft, Heart, HeartOff } from 'lucide-react';
import { OfferBadge } from '../components/OfferBadge';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const addItem = useCartStore(state => state.addItem);
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const getSizeStock = (size: string) => {
    if (!product) return 0;
    if (product.stockBySize && product.stockBySize[size] !== undefined) {
      return product.stockBySize[size];
    }
    return product.stock !== undefined ? product.stock : 0;
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize || getSizeStock(selectedSize) <= 0) return;
    
    addItem({
      id: product.id!,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: selectedSize
    });
    
    alert("Added to cart!");
  };

  const isFav = product ? isFavorite(product.id!) : false;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12 w-full animate-pulse flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 aspect-[3/4] bg-zinc-900 rounded-lg"></div>
        <div className="w-full md:w-1/2 space-y-6 pt-8">
          <div className="h-8 bg-zinc-900 w-2/3"></div>
          <div className="h-6 bg-zinc-900 w-1/4"></div>
          <div className="h-24 bg-zinc-900 w-full mt-8"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Product not found</h2>
        <Button onClick={() => navigate('/shop')} variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">Back to Shop</Button>
      </div>
    );
  }

  const isGlobalOutOfStock = product.stock !== undefined && product.stock <= 0;
  
  const currentSizeStock = selectedSize ? getSizeStock(selectedSize) : product.stock;
  const isCurrentSelectionOutOfStock = currentSizeStock !== undefined && currentSizeStock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 w-full text-white">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        <div className="w-full md:w-1/2 relative">
          <button 
            onClick={() => toggleFavorite(product)}
            className="absolute top-4 right-4 z-20 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors"
          >
            {isFav ? <HeartOff className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
          </button>
          <OfferBadge offer={product.offer} />
          <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 relative">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col pt-8">
          <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">{product.category}</p>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[0.2em] mb-4 text-white">{product.name}</h1>
          <div className="flex items-center gap-4 mb-8">
            <p className="text-2xl font-medium text-zinc-300">${product.price}</p>
            {currentSizeStock !== undefined && (
               <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 border rounded ${isCurrentSelectionOutOfStock ? 'border-red-900 text-red-500 bg-red-950/30' : (currentSizeStock < 5 ? 'border-amber-900 text-amber-500 bg-amber-950/30' : 'border-zinc-800 text-zinc-400')}`}>
                 {isCurrentSelectionOutOfStock ? 'Sold Out' : `${currentSizeStock} in stock`}
               </span>
            )}
          </div>

          <div className="mb-8 font-mono text-sm leading-relaxed text-zinc-400">
            {product.description}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Size</span>
              <span className="text-[10px] text-zinc-500 underline cursor-pointer hover:text-white transition-colors">Size Guide</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const sizeOutOfStock = getSizeStock(size) <= 0;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={sizeOutOfStock}
                    className={cn(
                      "px-4 py-2 border rounded-full text-[10px] uppercase font-medium transition-colors",
                      selectedSize === size
                        ? "border-zinc-400 bg-white text-black"
                        : "border-zinc-800 text-white hover:border-zinc-400",
                      sizeOutOfStock && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={handleAddToCart}
            size="lg" 
            className="w-full py-6 text-xs uppercase tracking-widest font-bold rounded-none bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
            disabled={!selectedSize || isCurrentSelectionOutOfStock}
          >
            {isCurrentSelectionOutOfStock ? 'Sold Out' : (selectedSize ? 'Add to Cart' : 'Select a Size')}
          </Button>

          <div className="mt-12 border-t border-zinc-800 divide-y divide-zinc-800 text-sm">
            <div className="py-4">
              <h4 className="font-bold uppercase tracking-[0.2em] mb-2 text-white">Shipping & Returns</h4>
              <p className="text-zinc-500 font-light text-xs">Free shipping on orders over $150. Returns accepted within 14 days of delivery.</p>
            </div>
            <div className="py-4">
              <h4 className="font-bold uppercase tracking-[0.2em] mb-2 text-white">Materials & Care</h4>
              <p className="text-zinc-500 font-light text-xs">100% Premium Heavyweight Cotton. Wash cold, lay flat to dry to prevent shrinkage.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
