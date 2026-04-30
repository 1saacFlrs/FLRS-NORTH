import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useOrdersStore } from '../store/useOrdersStore';

export function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useOrdersStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      alert("Please log in to checkout");
      navigate('/login');
      return;
    }

    const order = {
      id: Math.random().toString(36).substr(2, 9),
      items: [...items],
      total: getCartTotal(),
      status: 'processing' as const,
      createdAt: new Date().toISOString()
    };

    addOrder(order);
    clearCart();
    navigate(`/invoice/${order.id}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-24 text-center w-full min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black uppercase tracking-[0.2em] mb-4 text-white">Your Cart is Empty</h2>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop">
          <Button size="lg" className="rounded-none bg-white text-black hover:bg-zinc-200 uppercase text-xs tracking-widest font-bold px-8">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 w-full text-white mt-12">
      <h1 className="text-3xl font-bold tracking-[0.2em] uppercase mb-12 border-b border-zinc-900 pb-4">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <ul className="divide-y divide-zinc-900">
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="py-6 flex gap-6">
                <div className="w-24 h-32 flex-shrink-0 bg-zinc-900 overflow-hidden border border-zinc-800">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm md:text-base uppercase tracking-widest">{item.name}</h3>
                      <p className="font-bold text-zinc-300">${item.price}</p>
                    </div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Size: {item.size}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-zinc-800">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-zinc-900 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3 text-zinc-400" />
                      </button>
                      <span className="px-4 py-1 text-xs font-medium text-zinc-300">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-zinc-900 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-zinc-600 hover:text-red-500 transition-colors flex items-center text-[10px] uppercase tracking-widest font-bold"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-zinc-900 p-8 border border-zinc-800">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-white">Order Summary</h2>
            <div className="flex justify-between items-center mb-4 text-xs tracking-widest uppercase">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-bold text-white">${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-xs tracking-widest uppercase">
              <span className="text-zinc-500">Shipping</span>
              <span className="text-zinc-400 font-medium">Calculated at checkout</span>
            </div>
            <div className="border-t border-zinc-800 pt-4 mb-8 flex justify-between items-center">
              <span className="font-bold uppercase tracking-[0.2em] text-sm text-white">Total</span>
              <span className="font-bold text-xl text-white">${getCartTotal().toFixed(2)}</span>
            </div>
            <Button 
              onClick={handleCheckout}
              size="lg" 
              className="w-full py-6 rounded-none bg-white text-black hover:bg-zinc-200 uppercase tracking-widest text-xs font-bold"
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
