import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { User, MapPin, Package, Phone, CheckCircle2, AlertCircle, Trash2, FileText, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrdersStore } from '../store/useOrdersStore';

export function Profile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'shipping' | 'orders'>('profile');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    exteriorNumber: '',
    neighborhood: '',
    reference: '',
    city: 'Acuña',
    state: 'Coahuila',
    zipCode: '',
    country: 'Mexico'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const { items: orders, removeOrder, updateOrderStatus } = useOrdersStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.phoneNumber) {
            setPhoneNumber(data.phoneNumber);
          }
          if (data.shippingInfo) {
            setShippingInfo({
              ...data.shippingInfo,
              city: 'Acuña',
              state: 'Coahuila',
              country: 'Mexico'
            });
          }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);

  const handleSavePhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');
    
    // Save to Firestore
    if (user) {
      setIsSaving(true);
      try {
         await updateDoc(doc(db, 'users', user.uid), {
           phoneNumber
         });
         setSaveMessage('Phone number saved successfully');
         setTimeout(() => setSaveMessage(''), 3000);
      } catch (err) {
         handleFirestoreError(err, OperationType.UPDATE, 'users');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        shippingInfo
      });
      setSaveMessage('Shipping information saved successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
      setSaveMessage('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-24 w-full text-white min-h-[70vh]">
      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-[0.2em] uppercase mb-2">My Account</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-widest">Manage your profile & orders</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 sidebar-nav">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors font-bold whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <User className="w-4 h-4" /> Account Info
          </button>
          <button 
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors font-bold whitespace-nowrap ${
              activeTab === 'shipping' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <MapPin className="w-4 h-4" /> Shipping Address
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors font-bold whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <Package className="w-4 h-4" /> Order History
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 relative min-h-[400px]">
           {saveMessage && (
              <div className="absolute top-0 left-0 right-0 bg-green-900/50 border-b border-green-500 text-green-200 p-2 text-center text-xs uppercase tracking-widest">
                {saveMessage}
              </div>
           )}

           {activeTab === 'profile' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">Account Information</h2>
                
                <div className="space-y-8 max-w-md">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Email Address</label>
                    <Input type="email" value={user.email || ''} disabled className="bg-black border-zinc-800 text-zinc-400" />
                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Email cannot be changed</p>
                  </div>

                     <div>
                     <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Phone Number</label>
                     {phoneError && <div className="text-red-400 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {phoneError}</div>}
                     <div className="flex flex-col sm:flex-row gap-4">
                        <Input 
                          type="tel" 
                          value={phoneNumber} 
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1 (555) 000-0000" 
                          className="bg-black border-zinc-800 text-white flex-1"
                        />
                        <Button type="button" disabled={isSaving} onClick={handleSavePhone} className="rounded-none tracking-widest uppercase bg-zinc-800 text-white hover:bg-zinc-700 h-10 w-full sm:w-auto px-8">
                             {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                     </div>
                  </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'shipping' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
               <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">Shipping Address</h2>
                <form onSubmit={handleSaveShipping} className="max-w-lg space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Nombre Completo</label>
                    <Input required value={shippingInfo.fullName} onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} className="bg-black border-zinc-800 text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Dirección de Calle</label>
                    <Input required value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} className="bg-black border-zinc-800 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Número Exterior</label>
                      <Input required value={shippingInfo.exteriorNumber} onChange={e => setShippingInfo({...shippingInfo, exteriorNumber: e.target.value})} className="bg-black border-zinc-800 text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Código Postal</label>
                      <Input required value={shippingInfo.zipCode} onChange={e => setShippingInfo({...shippingInfo, zipCode: e.target.value})} className="bg-black border-zinc-800 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Colonia / Fraccionamiento</label>
                    <Input required value={shippingInfo.neighborhood} onChange={e => setShippingInfo({...shippingInfo, neighborhood: e.target.value})} className="bg-black border-zinc-800 text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Referencia de Domicilio (Opcional)</label>
                    <Input value={shippingInfo.reference} onChange={e => setShippingInfo({...shippingInfo, reference: e.target.value})} placeholder="Color, portón, etc." className="bg-black border-zinc-800 text-white" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Ciudad</label>
                      <select required value={shippingInfo.city} onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})} className="w-full bg-black border border-zinc-800 text-white h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700">
                        <option value="Acuña">Acuña</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Estado</label>
                      <select required value={shippingInfo.state} onChange={e => setShippingInfo({...shippingInfo, state: e.target.value})} className="w-full bg-black border border-zinc-800 text-white h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700">
                        <option value="Coahuila">Coahuila</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">País</label>
                      <select required value={shippingInfo.country} onChange={e => setShippingInfo({...shippingInfo, country: e.target.value})} className="w-full bg-black border border-zinc-800 text-white h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700">
                        <option value="Mexico">México</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={isSaving} className="w-full sm:w-auto rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200 h-12 px-8">
                       {isSaving ? 'Saving...' : 'Save Address'}
                    </Button>
                  </div>
               </form>
             </motion.div>
           )}

           {activeTab === 'orders' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
               <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">Order History</h2>
               
               {orders.length === 0 ? (
                 <div className="text-center py-12">
                   <p className="text-zinc-500 text-xs tracking-widest uppercase mb-6">You haven't placed any orders yet.</p>
                   <Button onClick={() => navigate('/shop')} className="rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200">
                     Start Shopping
                   </Button>
                 </div>
               ) : (
                 <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-black border border-zinc-800 p-4 sm:p-6">
                        <div className="flex flex-wrap md:flex-nowrap justify-between md:items-center border-b border-zinc-800 pb-4 mb-4 gap-4">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Order ID</p>
                            <p className="font-mono text-xs">{order.id.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Date</p>
                            <p className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-xs font-bold text-white translate-no" translate="no">
                              ${(order.subtotal ? order.total : ((order.subtotal ?? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)) + (order.shippingCost ?? (order.items.reduce((sum, item) => sum + item.quantity, 0) >= 3 ? 0 : 35)))).toFixed(2)} MXN
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded bg-zinc-800 text-zinc-300">
                              <Package className="w-3 h-3 mr-1" />
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="flex gap-2 w-full md:w-auto md:ml-auto">
                            <Button 
                              onClick={() => navigate(`/invoice/${order.id}`)}
                              className="flex-1 md:flex-none text-[10px] uppercase tracking-widest bg-white text-black hover:bg-zinc-200 h-8 rounded-none border border-transparent"
                            >
                              <FileText className="w-3 h-3 mr-1" /> Visualizar
                            </Button>
                            
                            <Button 
                              onClick={() => {
                                navigate(`/invoice/${order.id}?print=true`);
                              }}
                              className="flex-1 md:flex-none text-[10px] uppercase tracking-widest bg-zinc-800 text-white hover:bg-zinc-700 h-8 rounded-none border border-transparent"
                            >
                              <Printer className="w-3 h-3 md:mr-1" /> <span className="hidden md:inline">Imprimir</span>
                            </Button>

                            {order.status !== 'delivered' && (
                              <>
                                <Button
                                  onClick={() => {
                                    updateOrderStatus(order.id, 'delivered');
                                  }}
                                  className="flex-1 md:flex-none text-[10px] uppercase tracking-widest bg-zinc-900 text-green-500 hover:text-green-400 hover:bg-zinc-800 border border-zinc-800 hover:border-green-900 h-8 rounded-none"
                                >
                                  <CheckCircle2 className="w-3 h-3 md:mr-1" /> <span className="hidden md:inline">Ya Entregado</span>
                                </Button>

                                <Button
                                  onClick={() => {
                                    if (confirm('Una vez ya enviada la factura y haber pagado el pedido ante el proveedor, cancelar esta orden no interferirá con el proceso de compra o entrega. ¿Estás seguro que deseas cancelar esta orden?')) {
                                      removeOrder(order.id);
                                    }
                                  }}
                                  className="flex-1 md:flex-none text-[10px] uppercase tracking-widest bg-black text-red-500 hover:text-red-400 hover:bg-zinc-900 border border-zinc-800 hover:border-red-900 h-8 rounded-none"
                                >
                                  <Trash2 className="w-3 h-3 md:mr-1" /> <span className="hidden md:inline">Cancel</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center min-w-[200px] snap-start shrink-0">
                              <div className="w-12 h-16 bg-zinc-900 flex-shrink-0">
                                 <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-300 mb-1 truncate">{item.name}</p>
                                <p className="text-[9px] uppercase tracking-widest text-zinc-500">Qty: {item.quantity} | Size: {item.size}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
               )}
             </motion.div>
           )}
        </div>
      </div>
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          height: 2px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: #18181b; 
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #3f3f46; 
        }
      `}</style>
    </div>
  );
}
