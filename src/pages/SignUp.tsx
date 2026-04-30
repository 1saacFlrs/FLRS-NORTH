import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '../lib/api';
import { Eye, EyeOff } from 'lucide-react';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, email);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 px-8 w-full text-white min-h-[60vh]">
      <div className="bg-zinc-900/50 p-8 border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold uppercase tracking-[0.2em] mb-6 text-center">Sign Up</h2>
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-6 text-xs uppercase tracking-widest">{error}</div>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-black border-zinc-800 text-white" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Password</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="bg-black border-zinc-800 text-white pr-10" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2 block">Must be at least 6 characters</p>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200 mt-6">
            {isLoading ? 'Signing up...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-8 pt-6 border-t border-zinc-800 text-[10px] text-zinc-400 text-center uppercase tracking-widest">
          Already have an account? <Link to="/login" className="text-white hover:text-zinc-300 ml-1">Log In</Link>
        </div>
      </div>
    </div>
  );
}
