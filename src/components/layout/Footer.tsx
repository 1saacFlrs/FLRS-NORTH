import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
                <li><a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
              )}
              {socialLinks.tiktok && (
                <li><a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">TikTok</a></li>
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
