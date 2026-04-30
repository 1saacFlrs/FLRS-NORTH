import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ShieldCheck, LockKeyhole } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebase';

export function ApplyAdmin() {
  const [user, setUser] = useState<any>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
         try {
           const isAdminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
           if (isAdminDoc.exists() || currentUser.email === 'isaacjaredmorenoflores@gmail.com') {
             setSuccess(true);
           }
         } catch (e) {
           // Ignore
         }
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        accessCode: code
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err: any) {
      if (err.message.includes('missing or insufficient permissions') || err.message.includes('Missing or insufficient permissions')) {
         setError('Invalid access code. Please try again.');
      } else {
         setError(err.message || 'Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="max-w-md mx-auto mt-24 px-8 w-full text-white min-h-[60vh]">
      <div className="bg-zinc-900/50 p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        {success ? (
          <div className="text-center py-12">
            <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-green-500" />
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-2 text-white">Access Granted</h2>
            <p className="text-xs text-zinc-400 uppercase tracking-widest leading-relaxed">Your account has been upgraded to Administrator. Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <LockKeyhole className="w-6 h-6 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-2">Admin Portal</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Authorized personnel only</p>
            </div>

            {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-6 text-xs uppercase tracking-widest text-center">{error}</div>}
            
            {!user ? (
               <div className="text-center py-6">
                 <p className="text-xs text-zinc-400 uppercase tracking-widest mb-6">You must be logged in to apply for admin access.</p>
                 <Button onClick={() => navigate('/login')} className="w-full rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200">
                   Log In
                 </Button>
               </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 text-center">Enter Verification Code</label>
                  <Input 
                    type="password" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    required 
                    placeholder="••••••••••••"
                    className="bg-black border-zinc-800 text-white text-center tracking-[0.3em] font-mono focus-visible:ring-zinc-700" 
                  />
                </div>
                
                <Button type="submit" disabled={isLoading} className="w-full rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200 h-12">
                  {isLoading ? 'Verifying...' : 'Unlock Access'}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
      {!success && (
        <div className="mt-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
           Warning: Unauthorized access attempts are logged.
        </div>
      )}
    </div>
  );
}
