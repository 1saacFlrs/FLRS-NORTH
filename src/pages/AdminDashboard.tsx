import { useEffect, useState } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadImage, Product } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('T-Shirts');
  const [sizes, setSizes] = useState<string>('S, M, L, XL');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

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
    await signOut(auth);
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategory('T-Shirts');
    setSizes('S, M, L, XL');
    setImageUrl('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id!);
    setName(p.name);
    setPrice(p.price.toString());
    setDescription(p.description);
    setCategory(p.category);
    setSizes(p.sizes.join(', '));
    setImageUrl(p.imageUrl);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err: any) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let finalImageUrl = imageUrl;
      
      if (imageFile) {
        try {
          finalImageUrl = await uploadImage(imageFile);
        } catch (uploadError) {
          console.error("Storage upload failed, please ensure Firebase Storage is configured:", uploadError);
          alert("Failed to upload image to Storage. Please provide a direct URL instead.");
          setIsSaving(false);
          return;
        }
      }

      if (!finalImageUrl) {
        alert("Please provide an image URL or upload an image.");
        setIsSaving(false); return;
      }

      const productData = {
        name,
        price: parseFloat(price),
        description,
        category,
        imageUrl: finalImageUrl,
        sizes: sizes.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await addProduct(productData);
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-24 px-8 w-full text-white">
        <div className="bg-zinc-900/50 p-8 border border-zinc-800 shadow-xl">
          <h2 className="text-2xl font-bold uppercase tracking-[0.2em] mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-black border-zinc-800 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-black border-zinc-800 text-white" />
            </div>
            <Button type="submit" className="w-full rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200">Login</Button>
          </form>
          <div className="mt-6 text-[10px] text-zinc-600 text-center uppercase tracking-widest">
            You must be an authorized admin to login.
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
          <span className="text-[10px] text-zinc-500 hidden sm:inline-block uppercase tracking-widest">{user.email}</span>
          <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-none border-zinc-800 text-zinc-400 hover:text-white uppercase tracking-widest text-[10px]">Logout</Button>
        </div>
      </div>

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
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button onClick={() => openEditModal(p)} variant="outline" size="icon" className="h-8 w-8 border-zinc-800 text-zinc-400 hover:text-white">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(p.id!)} variant="outline" size="icon" className="h-8 w-8 border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-900">
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
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Hoodies">Hoodies</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-zinc-500">Sizes (Comma separated)</label>
                    <Input value={sizes} onChange={e => setSizes(e.target.value)} required placeholder="S, M, L, XL" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700" />
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
                        className="bg-black border-zinc-800 text-zinc-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-zinc-900 flex flex-col-reverse sm:flex-row justify-end sm:space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="mt-4 sm:mt-0 rounded-none uppercase text-[10px] tracking-widest border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="rounded-none uppercase tracking-widest text-[10px] bg-white text-black hover:bg-zinc-200">
                  {isSaving ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
