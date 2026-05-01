import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Instagram } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function Footer() {
  const [socialLinks, setSocialLinks] = useState({ instagram: '', tiktok: '' });

  useEffect(() => {
    const fetchSocial = async () => {
      try {
        const docRef = doc(db, 'settings', 'social');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSocialLinks(docSnap.data() as any);
        }
      } catch (err) {
        console.error("Error fetching social links:", err);
      }
    };
    fetchSocial();
  }, []);

  return (
    <footer className="px-8 border-t border-zinc-900 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto py-12">
        <div className="flex justify-center mb-16">
          <div className="w-48 h-48 md:w-64 md:h-64 opacity-90 relative">
             <img 
                src="/logo.png" 
                alt="FLRS NORTH Logo" 
                className="w-full h-full object-contain animate-spin-3d"
                style={{ mixBlendMode: 'lighten' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                  (e.target as HTMLImageElement).onerror = (errEvent) => {
                    (errEvent.target as HTMLImageElement).style.display = 'none';
                    const parent = (errEvent.target as HTMLImageElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-text w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black italic tracking-tighter uppercase animate-spin-3d text-white/50 text-center leading-[0.8]';
                      fallback.innerHTML = 'FLRS<br/>NORTH';
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-[0.2em] uppercase mb-4 text-white" translate="no">FLRS NORTH</h3>
            <p className="text-zinc-500 text-xs tracking-widest uppercase max-w-xs leading-relaxed" translate="no">
              For Life, Real Style. Minimalist streetwear for the modern individual. Designed for Life.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">Links</h4>
            <ul className="space-y-3 text-xs tracking-widest uppercase text-zinc-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
              {socialLinks.instagram && (
                <li>
                  <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                </li>
              )}
              {socialLinks.tiktok && (
                <li>
                  <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <TikTokIcon className="w-4 h-4" /> TikTok
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">Admin</h4>
            <ul className="space-y-3 text-xs tracking-widest uppercase text-zinc-400">
              <li><Link to="/admin" className="hover:text-white transition-colors text-stone-400">Manage Store</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-600 tracking-widest uppercase" translate="no">
          <p>&copy; {new Date().getFullYear()} FLRS NORTH. Designed for Life.</p>
        </div>
      </div>
    </footer>
  );
}
