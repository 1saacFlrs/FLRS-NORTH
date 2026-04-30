import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 px-8 w-full text-white min-h-[60vh]">
      <div className="bg-zinc-900/50 p-8 border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold uppercase tracking-[0.2em] mb-6 text-center">Reset Password</h2>
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-6 text-xs uppercase tracking-widest">{error}</div>}
        {message && <div className="bg-green-900/50 border border-green-500 text-green-200 p-3 mb-6 text-xs uppercase tracking-widest">{message}</div>}
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-black border-zinc-800 text-white" />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="mt-8 pt-6 border-t border-zinc-800 text-[10px] text-zinc-400 text-center uppercase tracking-widest">
          Remember your password? <Link to="/login" className="text-white hover:text-zinc-300 ml-1">Log In</Link>
        </div>
      </div>
    </div>
  );
}
