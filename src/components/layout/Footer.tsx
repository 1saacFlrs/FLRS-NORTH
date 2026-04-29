import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="px-8 border-t border-zinc-900 mt-auto">
      <div className="max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-[0.2em] uppercase mb-4 text-white">FLRS NORTH</h3>
            <p className="text-zinc-500 text-xs tracking-widest uppercase max-w-xs leading-relaxed">
              For Life, Real Style. Minimalist streetwear for the modern individual. Designed for Life.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">Links</h4>
            <ul className="space-y-3 text-xs tracking-widest uppercase text-zinc-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Instagram</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">TikTok</Link></li>
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
        <div className="pt-8 mt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-600 tracking-widest uppercase">
          <p>&copy; {new Date().getFullYear()} FLRS NORTH. Designed for Life.</p>
        </div>
      </div>
    </footer>
  );
}
