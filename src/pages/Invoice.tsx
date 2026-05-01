import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrdersStore } from '../store/useOrdersStore';
import { Button } from '../components/ui/button';
import { Download, Building2, MessageCircle, Mail, Printer } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function Invoice() {
  const { id } = useParams<{ id: string }>();
  const { items: orders } = useOrdersStore();
  const order = orders.find(o => o.id === id);

  const [providerInfo, setProviderInfo] = useState<{ name?: string; email?: string; phone?: string; city?: string } | null>(null);

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

  useEffect(() => {
    if (window.location.search.includes('print=true')) {
      setTimeout(() => window.print(), 800);
    }
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
    const itemsList = order.items.map(item => `- ${item.quantity}x ${item.name} (Size: ${item.size}) - $${item.price.toFixed(2)} MXN`).join('%0A');
    const text = `Hello! I would like to proceed with Order #${order.id}.%0A%0AItems:%0A${itemsList}%0A%0ATotal: $${order.total.toFixed(2)} MXN`;
    const phone = providerInfo.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    if (!providerInfo?.email) return;
    const itemsList = order.items.map(item => `- ${item.quantity}x ${item.name} (Size: ${item.size}) - $${item.price.toFixed(2)} MXN`).join('\n');
    const subject = encodeURIComponent(`Order Inquiry #${order.id}`);
    const body = encodeURIComponent(`Hello!\n\nI would like to proceed with Order #${order.id}.\n\nItems:\n${itemsList}\n\nTotal: $${order.total.toFixed(2)} MXN\n\nPlease let me know how to proceed with payment and shipping.\n\nThank you!`);
    window.location.href = `mailto:${providerInfo.email}?subject=${subject}&body=${body}`;
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const itemsHtml = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
          <div>
            <h4 style="margin: 0; font-size: 14px;">${item.name}</h4>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">Size: ${item.size} | Qty: ${item.quantity}</p>
          </div>
          <div style="text-align: right; font-weight: bold; font-size: 14px;">
            $${(item.price * item.quantity).toFixed(2)} MXN
          </div>
        </div>
      `).join('');

      const invoiceHTML = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #000; background: #fff; max-width: 800px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Purchase Invoice</h1>
            <p style="margin: 10px 0 0 0; color: #555; text-transform: uppercase;">Order #<strong>${order.id.toUpperCase()}</strong></p>
            <p style="margin: 5px 0 0 0; color: #777; font-size: 12px;">Date: ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div style="margin-bottom: 40px; display: flex; justify-content: space-between;">
            <div style="width: 48%; background: #f9f9f9; padding: 15px; border: 1px solid #eee;">
              <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; color: #555;">Customer Details</h3>
              ${order.customerData ? `
                <p style="margin: 0; font-weight: bold;">${order.customerData.fullName}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px;">${order.customerData.email}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px;">${order.customerData.phone}</p>
              ` : '<p>N/A</p>'}
            </div>
            <div style="width: 48%; background: #f9f9f9; padding: 15px; border: 1px solid #eee;">
              <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; color: #555;">Shipping Address</h3>
              ${order.customerData && order.customerData.address ? `
                <p style="margin: 0; font-size: 13px;">${order.customerData.address} ${order.customerData.exteriorNumber ? `#${order.customerData.exteriorNumber}` : ''}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #555;">${order.customerData.city}, ${order.customerData.state} ${order.customerData.zipCode}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #555;">${order.customerData.country}</p>
              ` : '<p style="font-size: 12px; color: #888;">No shipping details</p>'}
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <h3 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px;">Order Items</h3>
            ${itemsHtml}
            <div style="text-align: right; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #555;">Subtotal: $${(order.subtotal || order.total).toFixed(2)} MXN</p>
              <p style="margin: 5px 0 10px 0; font-size: 12px; text-transform: uppercase; color: #555; border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping: ${order.shippingCost === 0 ? 'FREE' : (order.shippingCost ? `$${order.shippingCost.toFixed(2)} MXN` : 'FREE')}</p>
              <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">Total: $${order.total.toFixed(2)} MXN</h2>
            </div>
          </div>
          
          <div style="background: #fdfdfd; border: 1px solid #eaeaea; padding: 20px;">
            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase;">Provider Information</h3>
            <p style="margin: 0 0 15px 0; font-size: 11px; color: #666;">Please contact the provider with this invoice to proceed with payment and shipping.</p>
            ${providerInfo ? `
               <p style="margin: 0 0 5px 0; font-size: 13px;"><strong>Name:</strong> ${providerInfo.name || 'N/A'}</p>
               <p style="margin: 0 0 5px 0; font-size: 13px;"><strong>Phone/WA:</strong> ${providerInfo.phone || 'N/A'}</p>
               <p style="margin: 0 0 5px 0; font-size: 13px;"><strong>Email:</strong> ${providerInfo.email || 'N/A'}</p>
            ` : '<p style="font-size: 12px;">Not available</p>'}
          </div>
        </div>
      `;

      const opt = {
        margin:       10, // px or mm depending on unit
        filename:     `Invoice-${order.id}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      const element = document.createElement('div');
      element.innerHTML = invoiceHTML;
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Error generating PDF", err);
      alert("There was an error creating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 text-white mt-12 md:mt-20">
      
      <div className="bg-amber-950/30 border border-amber-900/50 p-4 mb-8 print:hidden text-center">
        <p className="text-amber-500 font-bold uppercase tracking-widest text-xs">
          ⚠️ ESTE DOCUMENTO DEBE SER ENVIADO AL PROVEEDOR PARA PROCEDER CON LA COMPRA Y ENVÍO.
        </p>
      </div>

      <div className="flex justify-end gap-2 mb-8 print:hidden">
         <Button onClick={handleDownloadPDF} disabled={isDownloading} variant="outline" className="rounded-none tracking-widest uppercase border-zinc-800 hover:bg-zinc-900 text-xs">
           <Download className="w-4 h-4 mr-2" /> {isDownloading ? 'Generando...' : 'PDF / Descargar'}
         </Button>
         <Button onClick={() => window.print()} variant="outline" className="rounded-none tracking-widest uppercase border-zinc-800 hover:bg-zinc-900 text-xs text-white">
           <Printer className="w-4 h-4 mr-2" /> Imprimir
         </Button>
      </div>

      <div id="invoice-content" className="bg-black text-white p-2">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[0.2em]">Purchase Invoice</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2">Order #{order.id.toUpperCase()}</p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <p className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] mb-1">Date</p>
          <p className="font-mono text-sm">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {order.customerData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-zinc-950 border border-zinc-900 p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-zinc-500">Customer Details</h2>
            {order.customerData.fullName && <p className="text-sm font-medium tracking-widest uppercase mb-1">{order.customerData.fullName}</p>}
            {order.customerData.email && <p className="text-xs tracking-widest text-zinc-400 mb-1">{order.customerData.email}</p>}
            {order.customerData.phone && <p className="text-xs tracking-widest text-zinc-400">{order.customerData.phone}</p>}
          </div>
          <div className="bg-zinc-950 border border-zinc-900 p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-zinc-500">Shipping Address</h2>
            {order.customerData.address ? (
              <>
                <p className="text-xs tracking-widest text-zinc-300 mb-1">{order.customerData.address} {order.customerData.exteriorNumber ? `#${order.customerData.exteriorNumber}` : ''}</p>
                {order.customerData.reference && <p className="text-xs tracking-widest text-zinc-400 italic mb-1">Ref: {order.customerData.reference}</p>}
                <p className="text-xs tracking-widest text-zinc-400">{order.customerData.city}, {order.customerData.state} {order.customerData.zipCode}</p>
                <p className="text-xs tracking-widest text-zinc-400 mt-1">{order.customerData.country}</p>
              </>
            ) : (
              <p className="text-xs tracking-widest text-zinc-600 italic">No shipping details provided</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-zinc-900/30 border border-zinc-800 p-8 mb-12">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-zinc-400">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
              <div className="flex items-center gap-4">
                <img src={item.imageUrl} alt={item.name} className="w-12 h-16 object-cover bg-zinc-900" />
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-widest leading-none mb-1">{item.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest translate-no" translate="no">Size: {item.size} | Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold translate-no" translate="no">${(item.price * item.quantity).toFixed(2)} MXN</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <div className="flex justify-between text-xs tracking-widest uppercase mb-2">
              <span className="text-zinc-500">Subtotal</span>
              <span className="translate-no" translate="no">${(order.subtotal || order.total).toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between text-xs tracking-widest uppercase mb-4 border-b border-zinc-800 pb-4">
              <span className="text-zinc-500">Shipping</span>
              <span>{order.shippingCost === 0 ? 'FREE' : (order.shippingCost ? `$${order.shippingCost.toFixed(2)} MXN` : 'FREE')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg uppercase tracking-widest">
              <span>Total</span>
              <span className="translate-no" translate="no">${order.total.toFixed(2)} MXN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 p-8">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-zinc-500" /> Provider Information
        </h2>
        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-8 leading-relaxed max-w-2xl print:text-black">
          To finalize your purchase and arrange for shipping, please contact the provider directly using your preferred method below, sharing this invoice details.
        </p>

        {providerInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="space-y-4">
              {providerInfo.name && (
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1 print:text-zinc-500">Provider Name</p>
                  <p className="text-sm font-medium tracking-widest print:text-black">{providerInfo.name}</p>
                </div>
              )}
              {providerInfo.city && (
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1 print:text-zinc-500">Located In</p>
                  <p className="text-sm font-medium tracking-widest print:text-black">{providerInfo.city}</p>
                </div>
              )}
              {providerInfo.phone && (
                <div>
                   <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1 print:text-zinc-500">WhatsApp / Phone</p>
                   <p className="text-sm font-medium tracking-widest print:text-black">{providerInfo.phone}</p>
                </div>
              )}
              {providerInfo.email && (
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1 print:text-zinc-500">Email</p>
                  <p className="text-sm font-medium tracking-widest print:text-black">{providerInfo.email}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 justify-end print:hidden">
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

      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .print\\:text-black { color: black !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:border-black { border-color: black !important; }
          
          /* Override background colors for print */
          .bg-black, .bg-zinc-950, .bg-zinc-900, .bg-zinc-900\\/30 { background-color: white !important; color: black !important; }
          .text-white { color: black !important; }
          .text-zinc-300, .text-zinc-400 { color: #333 !important; }
          .text-zinc-500, .text-zinc-600 { color: #666 !important; }
          .border-zinc-800, .border-zinc-900, .border-zinc-800\\/50 { border-color: #ddd !important; }
        }
      `}</style>
    </div>
  );
}
