import { useState, useEffect } from 'react';
import { ProductOffer } from '../lib/api';
import { Clock } from 'lucide-react';

export function OfferBadge({ offer }: { offer: ProductOffer | undefined }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!offer?.active || !offer.endDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(offer.endDate).getTime() - new Date().getTime();
      let res = null;

      if (difference > 0) {
        res = {
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60)
        };
      }
      return res;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [offer]);

  if (!offer?.active || !timeLeft) return null;

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col items-center gap-2 pointer-events-none">
      {offer.type === 'color' ? (
        <div 
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center font-black text-xs border border-white/20 uppercase"
          style={{ backgroundColor: offer.value }}
        >
          Sale
        </div>
      ) : (
        <img 
          src={offer.value} 
          alt="Offer" 
          className="w-16 h-16 object-contain drop-shadow-xl"
        />
      )}
      <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded shadow text-center flex items-center gap-1 border border-zinc-800">
        <Clock className="w-3 h-3" />
        {timeLeft.d > 0 ? `${timeLeft.d}d ` : ''}
        {timeLeft.h.toString().padStart(2, '0')}:{timeLeft.m.toString().padStart(2, '0')}:{timeLeft.s.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
