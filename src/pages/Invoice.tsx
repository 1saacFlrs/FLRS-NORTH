import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrdersStore } from '../store/useOrdersStore';
import { Button } from '../components/ui/button';
import { Building2, MessageCircle, Mail } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function Invoice() {
  const { id } = useParams<{ id: string }>();
  const { items: orders } = useOrdersStore();
  const order = orders.find(o => o.id === id);

  const [providerInfo, setProviderInfo] = useState<{ email?: string; phone?: string; city?: string } | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const docRef = doc(db, 'provider', 'info');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProviderInfo(docSnap.data() as any);
        }
      } catch (err) {
        console.error('Failed to fetch provider info', err);
      }
    };
    fetchProvider();
  }, []);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-24 text-center mt-20">
        <h2 className="text-2xl font-bold uppercase tracking-[0.2em] mb-4 text-white">Invoice Not Found</h2>
        <Link to="/profile">
          <Button className="rounded-none uppercase tracking-widest text-xs">Return to Profile</Button>
        </Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    if (!providerInfo?.phone) return;
    const itemsList = order.items.map(item => `- ${item.quantity}x ${item.name} (Size: ${item.size}) - $${item.price}`).join('%0A');
    const text = `Hello! I would like to proceed with Order #${order.id}.%0A%0AItems:%0A${itemsList}%0A%0ATotal: $${order.total.toFixed(2)}`;
    const phone = providerInfo.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    if (!providerInfo?.email) return;
    const itemsList = order.items.map(item => `- ${item.quantity}x ${item.name} (Size: ${item.size}) - $${item.price}`).join('\n');
    const subject = encodeURIComponent(`Order Inquiry #${order.id}`);
    const body = encodeURIComponent(`Hello!\n\nI would like to proceed with Order #${order.id}.\n\nItems:\n${itemsList}\n\nTotal: $${order.total.toFixed(2)}\n\nPlease let me know how to proceed with payment and shipping.\n\nThank you!`);
    window.location.href = `mailto:${providerInfo.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 text-white mt-20">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[0.2em]">Purchase Invoice</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2">Order #{order.id.toUpperCase()}</p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <p className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] mb-1">Date</p>
          <p className="font-mono text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 p-8 mb-12">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-zinc-400">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-4">
                <img src={item.imageUrl} alt={item.name} className="w-12 h-16 object-cover bg-zinc-900" />
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-widest leading-none mb-1">{item.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Size: {item.size} | Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <div className="flex justify-between text-xs tracking-widest uppercase mb-2">
              <span className="text-zinc-500">Subtotal</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs tracking-widest uppercase mb-4 border-b border-zinc-800 pb-4">
              <span className="text-zinc-500">Shipping</span>
              <span>TBD</span>
            </div>
            <div className="flex justify-between font-bold text-lg uppercase tracking-widest">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 p-8">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-zinc-500" /> Provider Information
        </h2>
        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-8 leading-relaxed max-w-2xl">
          To finalize your purchase and arrange for shipping, please contact the provider directly using your preferred method below, sharing this invoice details.
        </p>

        {providerInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {providerInfo.city && (
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Located In</p>
                  <p className="text-sm font-medium tracking-widest">{providerInfo.city}</p>
                </div>
              )}
              {providerInfo.phone && (
                <div>
                   <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">WhatsApp / Phone</p>
                   <p className="text-sm font-medium tracking-widest">{providerInfo.phone}</p>
                </div>
              )}
              {providerInfo.email && (
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium tracking-widest">{providerInfo.email}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 justify-end">
               {providerInfo.phone && (
                 <Button onClick={handleWhatsApp} className="w-full rounded-none tracking-widest uppercase bg-[#25D366] text-black hover:bg-[#20b858] h-12 flex items-center justify-center gap-2">
                   <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                 </Button>
               )}
               {providerInfo.email && (
                 <Button onClick={handleEmail} variant="outline" className="w-full rounded-none tracking-widest uppercase border-zinc-800 hover:bg-zinc-900 text-white h-12 flex items-center justify-center gap-2">
                   <Mail className="w-4 h-4" /> Send Email
                 </Button>
               )}
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs uppercase tracking-widest">
            Provider information is not available at the moment. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}
