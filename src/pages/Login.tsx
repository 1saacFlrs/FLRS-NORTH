import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react';
import { createUserProfile } from '../lib/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await createUserProfile(userCredential.user.uid, userCredential.user.email || '');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 px-8 w-full text-white min-h-[60vh]">
      <div className="bg-zinc-900/50 p-8 border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold uppercase tracking-[0.2em] mb-6 text-center">Log In</h2>
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-6 text-xs uppercase tracking-widest">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-black border-zinc-800 text-white" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Password</label>
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
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest transition-colors mb-2 block">
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full rounded-none tracking-widest uppercase bg-white text-black hover:bg-zinc-200">
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading} 
          className="w-full rounded-none tracking-widest uppercase bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center gap-2"
        >
          {isGoogleLoading ? 'Signing in...' : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </>
          )}
        </Button>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-[10px] text-zinc-400 text-center uppercase tracking-widest">
          Don't have an account? <Link to="/signup" className="text-white hover:text-zinc-300 ml-1">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
