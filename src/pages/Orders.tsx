import { Link } from 'react-router-dom';
import { useOrdersStore } from '../store/useOrdersStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Package } from 'lucide-react';
import { motion } from 'motion/react';

export function Orders() {
  const { items } = useOrdersStore();
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-24 text-center w-full min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black uppercase tracking-[0.2em] mb-4 text-white">Please log in</h2>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">Log in to view your orders.</p>
        <Link to="/login">
          <Button size="lg" className="rounded-none bg-white text-black hover:bg-zinc-200 uppercase text-xs tracking-widest font-bold px-8">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-24 text-center w-full min-h-[60vh] flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-black uppercase tracking-[0.2em] mb-4">No Orders Yet</h2>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">You haven't placed any orders.</p>
        <Link to="/shop">
          <Button size="lg" className="rounded-none bg-white text-black hover:bg-zinc-200 uppercase text-xs tracking-widest font-bold px-8">
             Shop Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 w-full mt-20 text-white">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-white mb-2">Order History</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">{items.length} Orders placed</p>
        </div>

        <div className="space-y-8">
            {items.map((order) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id} 
                className="bg-zinc-900 border border-zinc-800 p-6"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-zinc-800 pb-4 mb-4 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-mono text-sm">{order.id.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-sm font-bold text-white">${order.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                    <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-zinc-800 text-zinc-300">
                      <Package className="w-3 h-3 mr-1" />
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-zinc-800 flex-shrink-0">
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">{item.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">Qty: {item.quantity} | Size: {item.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
    </div>
  );
}
