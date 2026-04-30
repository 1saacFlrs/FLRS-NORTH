import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadImageResumable, Product } from '../lib/api';
import { useProcessStore } from '../store/useProcessStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Eye, EyeOff, Tag, Loader2, Calendar, LockKeyhole } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const PREDEFINED_CATEGORIES = ['T-Shirts', 'Hoodies', 'Sweaters', 'Jackets', 'Pants', 'Shorts', 'Accessories', 'Hats', 'Shoes', 'Bags', 'Socks'];
const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Process Store
  const { processes, addProcess, updateProcess, removeProcess, clearCompleted } = useProcessStore();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [stockBySize, setStockBySize] = useState<Record<string, string | number>>({});
  const [publishMode, setPublishMode] = useState<'now' | 'later'>('now');
  const [publishDate, setPublishDate] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [images, setImages] = useState<string[]>([]);
  
  const [offerActive, setOfferActive] = useState(false);
  const [offerType, setOfferType] = useState<'color' | 'image'>('color');
  const [offerValue, setOfferValue] = useState('#ff0000');
  const [offerEndDate, setOfferEndDate] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'products' | 'provider' | 'social'>('products');

  // Provider Info state
  const [providerInfo, setProviderInfo] = useState({ name: '', email: '', phone: '', city: '' });
  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [providerSaveMessage, setProviderSaveMessage] = useState('');

  // Social Links state
  const [socialLinks, setSocialLinks] = useState({ instagram: '', tiktok: '' });
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  const [socialSaveMessage, setSocialSaveMessage] = useState('');

  // Revoke state
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeConfirmText, setRevokeConfirmText] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          const isAdminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          if (isAdminDoc.exists() || currentUser.email === 'isaacjaredmorenoflores@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      fetchProducts();
      fetchProviderInfo();
    }
  }, [user, isAdmin]);

  const fetchProviderInfo = async () => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const docSnap = await getDoc(doc(db, 'provider', 'info'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProviderInfo({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || ''
        });
      }
      
      const socialSnap = await getDoc(doc(db, 'settings', 'social'));
      if (socialSnap.exists()) {
        const data = socialSnap.data();
        setSocialLinks({
          instagram: data.instagram || '',
          tiktok: data.tiktok || ''
        });
      }
    } catch (err) {
      console.error('Error fetching provider/social info', err);
    }
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSocial(true);
    setSocialSaveMessage('');
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db, handleFirestoreError, OperationType } = await import('../lib/firebase');
      try {
        await setDoc(doc(db, 'settings', 'social'), socialLinks);
        setSocialSaveMessage('Social links saved successfully!');
        setTimeout(() => setSocialSaveMessage(''), 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'settings');
      }
    } catch (err: any) {
      setSocialSaveMessage('Error saving social links: ' + err.message);
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProvider(true);
    setProviderSaveMessage('');
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db, handleFirestoreError, OperationType } = await import('../lib/firebase');
      try {
        await setDoc(doc(db, 'provider', 'info'), providerInfo);
        setProviderSaveMessage('Provider info saved successfully!');
        setTimeout(() => setProviderSaveMessage(''), 3000);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'provider');
      }
    } catch (err) {
      console.error(err);
      setProviderSaveMessage('Error saving provider info.');
    } finally {
      setIsSavingProvider(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching products. Make sure your user is added to the admins collection or matches the bootstrapped email.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("¿Seguro que deseas cerrar sesión del panel de administrador?")) {
      await signOut(auth);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategory(PREDEFINED_CATEGORIES[0]);
    
    // Default available stock map
    const defaultStock: Record<string, number> = {};
    ['S', 'M', 'L', 'XL'].forEach(s => defaultStock[s] = 10);
    setStockBySize(defaultStock);
    
    setPublishMode('now');
    setPublishDate('');
    setImageUrl('');
    setImageFile(null);
    setImages([]);
    setOfferActive(false);
    setOfferType('color');
    setOfferValue('#ffffff');
    setOfferEndDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id!);
    setName(p.name);
    setPrice(p.price.toString());
    setDescription(p.description);
    setCategory(p.category);
    
    // Load Stock
    if (p.stockBySize && Object.keys(p.stockBySize).length > 0) {
       setStockBySize(p.stockBySize);
    } else if (p.sizes && p.sizes.length > 0) {
       // Migrate from old format
       const oldStockMap: Record<string, number> = {};
       const perSize = Math.floor((p.stock || 0) / p.sizes.length);
       p.sizes.forEach(s => oldStockMap[s] = perSize);
       setStockBySize(oldStockMap);
    } else {
       setStockBySize({});
    }

    if (p.publishDate) {
      setPublishMode('later');
      setPublishDate(p.publishDate);
    } else {
      setPublishMode('now');
      setPublishDate('');
    }
    setImageUrl(p.imageUrl);
    setImageFile(null);
    setImages(p.images || []);
    
    if (p.offer) {
      setOfferActive(p.offer.active);
      setOfferType(p.offer.type === 'none' ? 'color' : p.offer.type);
      setOfferValue(p.offer.value || '#ffffff');
      setOfferEndDate(p.offer.endDate || '');
    } else {
      setOfferActive(false);
      setOfferType('color');
      setOfferValue('#ffffff');
      setOfferEndDate('');
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (p: Product) => {
    if (confirm(`Are you sure you want to delete ${p.name}?`)) {
      const processId = Date.now().toString();
      addProcess({
        id: processId,
        name: `Deleting Product: ${p.name}`,
        status: 'running',
        createdAt: Date.now(),
      });
      try {
        await deleteProduct(p.id!);
        setProducts(products.filter(prod => prod.id !== p.id));
        updateProcess(processId, { status: 'completed', message: 'Product deleted' });
      } catch (err: any) {
        updateProcess(processId, { status: 'error', message: err.message });
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleRevokeAccess = async () => {
    if (!user) return;
    setIsRevoking(true);
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db, handleFirestoreError, OperationType } = await import('../lib/firebase');
      try {
        await deleteDoc(doc(db, 'admins', user.uid));
        setIsAdmin(false);
        setIsRevokeModalOpen(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'admins');
      }
    } catch (err) {
      console.error(err);
      alert('Error revoking access. Make sure you are an authorized admin.');
    } finally {
      setIsRevoking(false);
      setRevokeConfirmText('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations First
    if (imageFile && imageFile.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB for optimal performance.");
      return;
    }

    if (offerActive && offerEndDate) {
      const parsedOfferEndDate = new Date(offerEndDate);
      if (isNaN(parsedOfferEndDate.getTime()) || parsedOfferEndDate <= new Date()) {
        alert("Please enter a valid, future end date for the offer.");
        return;
      }
    }

    if (publishMode === 'later' && publishDate) {
      const parsedPubDate = new Date(publishDate);
      if (isNaN(parsedPubDate.getTime())) {
        alert("Please enter a valid date for publishing.");
        return;
      }
    }

    // Compute total stock and sizes
    const activeSizes = Object.keys(stockBySize).filter(size => stockBySize[size] !== undefined && stockBySize[size] !== '');
    const cleanStockBySize: Record<string, number> = {};
    activeSizes.forEach(size => cleanStockBySize[size] = typeof stockBySize[size] === 'string' ? parseInt(stockBySize[size] as string) || 0 : stockBySize[size] as number);
    const totalStock = Object.values(cleanStockBySize).reduce((sum, val) => sum + val, 0);

    // Capture state to pass into async closure
    const filteredImages = images.filter(img => img.trim() !== '');
    const dataToSave = {
      name,
      price: parseFloat(price),
      description,
      category,
      images: filteredImages,
      sizes: activeSizes,
      stock: totalStock,
      stockBySize: cleanStockBySize,
      publishDate: publishMode === 'now' ? '' : publishDate,
      offer: {
        active: offerActive,
        type: (offerActive ? offerType : 'none') as 'color' | 'image' | 'none',
        value: offerActive ? offerValue : '',
        endDate: offerActive ? offerEndDate : ''
      }
    };
    
    const passedImageUrl = imageUrl;
    const passedImageFile = imageFile;
    const isEdit = !!editingId;
    const currentEditingId = editingId;

    let isCanceled = false;
    let cancelUpload: (() => void) | undefined;
    const processId = Date.now().toString();

    addProcess({
      id: processId,
      name: isEdit ? `Updating Product: ${dataToSave.name}` : `Creating Product: ${dataToSave.name}`,
      status: 'running',
      createdAt: Date.now(),
      cancel: () => {
        isCanceled = true;
        if (cancelUpload) cancelUpload();
        updateProcess(processId, { status: 'canceled', message: 'Action canceled by admin.' });
      }
    });

    // Close Modal Immediately so admin can continue working
    setIsModalOpen(false);

    try {
      let finalImageUrl = passedImageUrl;
      
      if (passedImageFile) {
        updateProcess(processId, { message: 'Uploading image...', progress: 0 });
        try {
          const { uploadTask, getUrl } = uploadImageResumable(passedImageFile);
          
          cancelUpload = () => {
            uploadTask.cancel();
          };

          uploadTask.on('state_changed', (snapshot) => {
             const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
             if (!isCanceled) updateProcess(processId, { progress, message: `Uploading (${progress}%)` });
          });

          finalImageUrl = await getUrl();
        } catch (uploadError: any) {
          if (uploadError.code === 'storage/canceled' || isCanceled) {
             return; // Stop flow
          }
          console.error("Storage upload failed, please ensure Firebase Storage is configured:", uploadError);
          updateProcess(processId, { status: 'error', message: 'Image upload failed. Ensure rule exists.' });
          return;
        }
      }

      if (isCanceled) return;

      if (!finalImageUrl) {
        updateProcess(processId, { status: 'error', message: 'Missing final image URL' });
        return;
      }

      updateProcess(processId, { message: 'Saving product data...', progress: undefined });

      const finalProductData = {
        ...dataToSave,
        imageUrl: finalImageUrl,
      };

      if (isEdit) {
        await updateProduct(currentEditingId!, finalProductData);
      } else {
        await addProduct(finalProductData);
      }
      
      if (isCanceled) return;

      updateProcess(processId, { status: 'completed', message: 'Success!' });
      fetchProducts();
    } catch (err: any) {
      if (isCanceled) return;
      updateProcess(processId, { status: 'error', message: err.message });
    }
  };

  if (authChecking) {
    return (
      <div className="max-w-md mx-auto mt-24 px-8 w-full text-white text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-500 mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400">Verifying access...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-24 px-8 w-full text-white">
        <div className="bg-zinc-900/50 p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl font-bold uppercase tracking-[0.2em] mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-black border-zinc-800 text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required className="bg-black border-zinc-800 text-white pr-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200 mt-4">Login</Button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2 border-t border-zinc-800 pt-6">Not an admin?</p>
            <button type="button" onClick={() => navigate('/apply-admin')} className="text-xs text-zinc-400 hover:text-white uppercase tracking-widest border-b border-zinc-600 hover:border-white transition-colors pb-0.5">Apply for Access</button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
     return (
      <div className="max-w-md mx-auto mt-24 px-8 w-full text-white">
        <div className="bg-zinc-900/50 p-8 border border-zinc-800 shadow-xl relative overflow-hidden text-center">
           <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
              <LockKeyhole className="w-6 h-6 text-zinc-400" />
           </div>
           <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-2">Access Denied</h2>
           <p className="text-xs text-zinc-400 uppercase tracking-[0.1em] mb-8 leading-relaxed">
             This section is restricted to authorized personnel. If you have an admin code, you can upgrade your account.
           </p>
           <div className="space-y-4">
             <Button onClick={() => navigate('/apply-admin')} className="w-full h-12 rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200">
               Enter Access Code
             </Button>
             <Button variant="outline" onClick={() => navigate('/')} className="w-full h-12 rounded-none tracking-widest uppercase border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 relative z-10">
               Return to Home
             </Button>
             <Button variant="ghost" onClick={handleLogout} className="w-full h-12 rounded-none tracking-widest uppercase text-zinc-500 hover:text-white hover:bg-transparent relative z-10">
               Sign Out
             </Button>
           </div>
        </div>
      </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 w-full text-white mt-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black tracking-[0.2em] uppercase">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2 py-1 bg-zinc-800 text-[10px] text-white font-bold uppercase tracking-widest rounded">Admin</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.email}</span>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-none border-zinc-800 text-zinc-400 hover:text-white uppercase tracking-widest text-[10px]">Logout</Button>
        </div>
      </div>

      {/* Running Processes */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Background Tasks</h2>
           <Button variant="outline" size="sm" onClick={clearCompleted} disabled={processes.length === 0} className="rounded-none border-zinc-800 text-zinc-400 hover:text-white uppercase tracking-widest text-[10px] disabled:opacity-50">Clear Completed</Button>
        </div>
        
        {processes.length === 0 ? (
           <div className="text-zinc-600 text-xs uppercase tracking-widest p-6 text-center border border-zinc-800 border-dashed bg-zinc-900/10">
              No active or recent tasks.
           </div>
        ) : (
          <div className="space-y-4">
             {processes.map((proc) => (
                <div key={proc.id} className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="font-medium text-sm tracking-widest uppercase">{proc.name}</span>
                         {proc.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
                         {proc.status === 'completed' && <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Done</span>}
                         {proc.status === 'error' && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Error</span>}
                         {proc.status === 'canceled' && <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">Canceled</span>}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                         {proc.message || 'Processing...'}
                      </div>
                      {proc.progress !== undefined && proc.status === 'running' && (
                         <div className="w-full bg-zinc-950 h-1 mt-3">
                            <div className="bg-white h-1 transition-all duration-300" style={{ width: `${Math.max(2, proc.progress)}%` }}></div>
                         </div>
                      )}
                   </div>
                   {proc.status === 'running' && proc.cancel && (
                      <Button variant="destructive" size="sm" onClick={proc.cancel} className="rounded-none uppercase tracking-widest text-[10px] max-w-[100px]">
                         Cancel
                      </Button>
                   )}
                </div>
             ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-start space-x-8 mb-8 border-b border-zinc-800">
        <button
          onClick={() => setActiveAdminTab('products')}
          className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border-b-2 ${
            activeAdminTab === 'products' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-300'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveAdminTab('provider')}
          className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border-b-2 ${
            activeAdminTab === 'provider' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-300'
          }`}
        >
          Provider Info
        </button>
        <button
          onClick={() => setActiveAdminTab('social')}
          className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border-b-2 ${
            activeAdminTab === 'social' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-300'
          }`}
        >
          Social Links
        </button>
      </div>

      {activeAdminTab === 'social' && (
        <div className="max-w-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-2">Social Links</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">
              Manage the links for the social media icons in the footer.
            </p>
          </div>

          {socialSaveMessage && (
            <div className={`mb-6 p-4 text-xs font-bold uppercase tracking-widest border ${socialSaveMessage.includes('Error') ? 'bg-red-950/20 border-red-900/50 text-red-400' : 'bg-green-950/20 border-green-900/50 text-green-400'}`}>
              {socialSaveMessage}
            </div>
          )}

          <form onSubmit={handleSaveSocial} className="space-y-6 bg-zinc-900/30 border border-zinc-800 p-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Instagram URL</label>
              <Input 
                type="url" 
                value={socialLinks.instagram} 
                onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} 
                placeholder="https://instagram.com/..."
                className="bg-black border-zinc-800 text-white" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">TikTok URL</label>
              <Input 
                type="url" 
                value={socialLinks.tiktok} 
                onChange={e => setSocialLinks({...socialLinks, tiktok: e.target.value})} 
                placeholder="https://tiktok.com/@..."
                className="bg-black border-zinc-800 text-white" 
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSavingSocial}
              className="w-full h-12 rounded-none bg-white text-black hover:bg-zinc-200 tracking-widest uppercase text-xs font-bold mt-4"
            >
              {isSavingSocial ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </div>
      )}

      {activeAdminTab === 'products' && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Products</h2>
            <Button onClick={openAddModal} className="rounded-none tracking-widest text-[10px] uppercase bg-white text-black hover:bg-zinc-200">
              <Plus className="w-3 h-3 mr-2" /> Add Product
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500 text-xs uppercase tracking-widest">Loading products...</div>
          ) : (
            <div className="bg-black border border-zinc-900 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-900 border-b border-zinc-800 uppercase tracking-widest text-[10px] text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex-shrink-0 bg-zinc-900 mr-4 border border-zinc-800">
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover grayscale" />
                          </div>
                          <div className="font-medium text-sm tracking-wider uppercase">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-widest">{p.category}</td>
                      <td className="px-6 py-4 font-bold text-zinc-300 text-sm">${p.price}</td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-400">{p.stock || 0} left</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button onClick={() => openEditModal(p)} variant="outline" size="icon" className="h-8 w-8 border-zinc-800 text-zinc-400 hover:text-white">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDelete(p)} variant="outline" size="icon" className="h-8 w-8 border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-900">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="p-8 text-center text-zinc-600 text-xs uppercase tracking-widest">No products found. Add one to get started.</div>
              )}
            </div>
          )}
        </>
      )}

      {activeAdminTab === 'provider' && (
        <div className="max-w-xl">
          <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-6">Provider Information</h2>
          <p className="text-xs text-zinc-400 uppercase tracking-widest mb-8 leading-relaxed">
            Update your business contact details. This information will be shared with customers on their invoices so they can contact you to proceed with their purchase.
          </p>

          {providerSaveMessage && (
            <div className={`mb-6 p-4 text-xs font-bold uppercase tracking-widest border ${providerSaveMessage.includes('Error') ? 'bg-red-950/20 border-red-900/50 text-red-400' : 'bg-green-950/20 border-green-900/50 text-green-400'}`}>
              {providerSaveMessage}
            </div>
          )}

          <form onSubmit={handleSaveProvider} className="space-y-6 bg-zinc-900/30 border border-zinc-800 p-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Provider Name</label>
              <Input 
                type="text" 
                required 
                value={providerInfo.name} 
                onChange={e => setProviderInfo({...providerInfo, name: e.target.value})} 
                placeholder="Business Name"
                className="bg-black border-zinc-800 text-white" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Email Address</label>
              <Input 
                type="email" 
                required 
                value={providerInfo.email} 
                onChange={e => setProviderInfo({...providerInfo, email: e.target.value})} 
                placeholder="store@example.com"
                className="bg-black border-zinc-800 text-white" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">WhatsApp / Phone Number</label>
              <Input 
                type="tel" 
                required 
                value={providerInfo.phone} 
                onChange={e => setProviderInfo({...providerInfo, phone: e.target.value})} 
                placeholder="+1 555 123 4567"
                className="bg-black border-zinc-800 text-white" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">City & Country</label>
              <Input 
                type="text" 
                required 
                value={providerInfo.city} 
                onChange={e => setProviderInfo({...providerInfo, city: e.target.value})} 
                placeholder="New York, USA"
                className="bg-black border-zinc-800 text-white" 
              />
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={isSavingProvider} className="w-full h-12 rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200">
                {isSavingProvider ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isSavingProvider ? 'Saving...' : 'Save Provider Info'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Account Privileges */}
      <div className="mt-12 mb-6 flex justify-between items-center bg-black">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-red-500">Danger Zone</h2>
      </div>
      <div className="bg-red-950/10 border border-red-900/30 p-6 md:p-8 flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-2">Revoke Admin Access</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest max-w-md leading-relaxed">
            Lower your account privileges back to a standard client role. You will immediately lose access to this dashboard and all administrative tools.
          </p>
        </div>
        <Button onClick={() => setIsRevokeModalOpen(true)} variant="outline" className="rounded-none uppercase tracking-widest text-[10px] text-red-500 border-red-900 hover:bg-red-950 hover:text-red-400 w-full md:w-auto">
          Revoke Privileges
        </Button>
      </div>

      {/* Revoke Modal */}
      {isRevokeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black border border-red-900/50 w-full max-w-md text-white shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-red-500 mb-4">Confirm Action</h3>
            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-6 leading-relaxed">
              To confirm that you want to lower your account level, please type <strong className="text-white">REVOKE</strong> below.
            </p>
            <div className="mb-6">
              <Input 
                value={revokeConfirmText}
                onChange={e => setRevokeConfirmText(e.target.value)}
                placeholder="Type REVOKE" 
                className="bg-zinc-900 border-zinc-800 text-white text-center tracking-widest uppercase font-bold focus-visible:ring-red-900"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => setIsRevokeModalOpen(false)} variant="outline" className="flex-1 rounded-none uppercase text-[10px] tracking-widest border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white h-12">
                Cancel
              </Button>
              <Button 
                onClick={handleRevokeAccess} 
                disabled={revokeConfirmText !== 'REVOKE' || isRevoking}
                className="flex-1 rounded-none uppercase tracking-widest text-[10px] bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 h-12"
              >
                {isRevoking ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
              <h3 className="text-xl font-bold uppercase tracking-[0.2em]">{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Heavyweight Hoodie" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Price ($)</label>
                    <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="85.00" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Category</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 text-white"
                    >
                      {PREDEFINED_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Inventory by Size</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-zinc-800 bg-zinc-900/50">
                      {PREDEFINED_SIZES.map(size => {
                        const isEnabled = stockBySize[size] !== undefined;
                        return (
                          <div key={size} className="flex flex-col gap-2 p-2 border border-zinc-800 bg-black">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isEnabled}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setStockBySize(prev => ({ ...prev, [size]: 0 }));
                                  } else {
                                    const newStock = { ...stockBySize };
                                    delete newStock[size];
                                    setStockBySize(newStock);
                                  }
                                }}
                                className="rounded border-zinc-800 bg-zinc-900"
                              />
                              <span className="text-xs font-bold text-white">{size}</span>
                            </label>
                            {isEnabled && (
                              <Input 
                                type="number" 
                                min="0" 
                                value={stockBySize[size] !== undefined ? stockBySize[size] : ''} 
                                onChange={e => {
                                  const val = e.target.value;
                                  setStockBySize(prev => ({ ...prev, [size]: val }));
                                }} 
                                placeholder="Qty" 
                                className="h-8 text-xs bg-zinc-900 border-zinc-800" 
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Publish Settings</label>
                    <div className="flex gap-4 mb-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="radio" value="now" checked={publishMode === 'now'} onChange={(e) => setPublishMode(e.target.value as 'now' | 'later')} className="accent-white" />
                         <span className="text-xs text-white">Publish Now</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="radio" value="later" checked={publishMode === 'later'} onChange={(e) => setPublishMode(e.target.value as 'now' | 'later')} className="accent-white" />
                         <span className="text-xs text-white">Set Date</span>
                       </label>
                    </div>
                    {publishMode === 'later' && (
                      <div className="relative mt-2">
                        <Input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={publishDate} onChange={e => setPublishDate(e.target.value)} required className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-300 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded-sm" />
                        <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Product will be hidden until this date</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Description</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      required
                      rows={5}
                      className="flex w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 resize-none font-mono text-zinc-300"
                      placeholder="Product description..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Image</label>
                    <div className="border border-dashed border-zinc-800 bg-zinc-900/50 p-4 text-center">
                      <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-4">Max 2MB. Recommended: 800x800 PNG/JPG</div>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        className="mb-2 bg-black border-zinc-800 text-zinc-400 file:text-white file:bg-zinc-800 file:border-0 file:px-3 file:py-1 file:mr-3 cursor-pointer"
                      />
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-bold">OR provide an external URL</div>
                      <Input 
                        type="url" 
                        value={imageUrl} 
                        onChange={e => setImageUrl(e.target.value)} 
                        placeholder="https://..." 
                        className="bg-black border-zinc-800 text-zinc-300 text-xs mb-4"
                      />
                      
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-bold mt-4 border-t border-zinc-800 pt-4">Extra Images/Videos (Slices - Max 6)</div>
                      <div className="space-y-2 mt-2">
                       {[0, 1, 2, 3, 4, 5].map((index) => (
                         <Input 
                           key={index}
                           type="text" 
                           value={images[index] || ''} 
                           onChange={(e) => {
                             const newImages = [...images];
                             newImages[index] = e.target.value;
                             setImages(newImages);
                           }}
                           placeholder={`Slice ${index + 1} URL (Image or MP4)`}
                           className="bg-black border-zinc-800 text-zinc-300 text-xs" 
                         />
                       ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Section */}
              <div className="border border-zinc-800 bg-zinc-900/30 p-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-zinc-400" />
                    <h4 className="text-xs uppercase font-bold tracking-widest">Temporal Offer</h4>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={offerActive} onChange={e => setOfferActive(e.target.checked)} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${offerActive ? 'bg-white' : 'bg-zinc-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-black w-4 h-4 rounded-full transition-transform ${offerActive ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
                
                {offerActive && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Badge Type</label>
                      <select 
                        value={offerType} 
                        onChange={e => setOfferType(e.target.value as 'color' | 'image')}
                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 text-white"
                      >
                        <option value="color">Color Overlay</option>
                        <option value="image">PNG Image Overlay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">
                        {offerType === 'color' ? 'Color (Hex)' : 'Image URL (Recommend 200x200)'}
                      </label>
                      {offerType === 'color' ? (
                        <div className="flex gap-2">
                           <input type="color" value={offerValue} onChange={e => setOfferValue(e.target.value)} className="w-10 h-10 rounded border border-zinc-800 cursor-pointer bg-zinc-900" />
                           <Input value={offerValue} onChange={e => setOfferValue(e.target.value)} placeholder="#ff0000" className="bg-zinc-900 border-zinc-800" />
                        </div>
                      ) : (
                        <Input value={offerValue} onChange={e => setOfferValue(e.target.value)} placeholder="https://..." className="bg-zinc-900 border-zinc-800 text-white" />
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">End Date</label>
                      <Input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={offerEndDate} onChange={e => setOfferEndDate(e.target.value)} required={offerActive} className="bg-zinc-900 border-zinc-800 text-white [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded-sm" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-zinc-900 flex flex-col-reverse sm:flex-row justify-end sm:space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="mt-4 sm:mt-0 rounded-none uppercase text-[10px] tracking-widest border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white">Cancel</Button>
                <Button type="submit" className="rounded-none uppercase tracking-widest text-[10px] bg-white text-black hover:bg-zinc-200">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
