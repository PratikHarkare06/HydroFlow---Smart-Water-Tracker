import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Droplet, ArrowRight, Info } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onLogin: (user: any) => void;
  onGuest: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type?: 'confirmation' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            setError({ 
              message: 'Please check your inbox and confirm your email address before logging in.',
              type: 'confirmation' 
            });
            return;
          }
          throw signInError;
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            }
          }
        });
        if (signUpError) throw signUpError;
        
        setError({ 
          message: 'Account created! Please check your email for a confirmation link.',
          type: 'confirmation' 
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.message === 'Failed to fetch') {
        setError({ message: 'Database currently offline. Use Guest Mode below.' });
      } else {
        setError({ message: err.message || 'An error occurred during authentication' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#fafafa] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[120px] opacity-60 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center px-6 pt-12 pb-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-200 mb-6 active:scale-95 transition-transform">
              <Droplet size={40} className="text-white fill-current" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">HydroFlow</h1>
            <p className="text-gray-500 font-medium text-center px-4">
              {isLogin ? 'Welcome back! Your body missed the hydration.' : 'Start your journey to a better hydration habit today.'}
            </p>
          </div>

          <div className="w-full bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className={`${error.type === 'confirmation' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'} p-4 rounded-2xl text-[11px] font-bold text-center border animate-fade-in flex flex-col items-center gap-2`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold flex items-center gap-1"><Info size={14} /> {error.message}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Email Address</label>
                  <div className="bg-gray-50/50 p-4 rounded-2xl flex items-center border border-transparent focus-within:border-purple-300 focus-within:bg-white transition-all shadow-sm">
                    <Mail className="text-gray-400 mr-3 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="hello@example.com" 
                      className="flex-1 outline-none text-gray-800 bg-transparent text-sm font-medium placeholder:text-gray-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Password</label>
                  <div className="bg-gray-50/50 p-4 rounded-2xl flex items-center border border-transparent focus-within:border-purple-300 focus-within:bg-white transition-all shadow-sm">
                    <Lock className="text-gray-400 mr-3 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="flex-1 outline-none text-gray-800 bg-transparent text-sm font-medium placeholder:text-gray-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-purple-500">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 active:scale-95 hover:bg-black transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center group"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                className="text-xs font-bold text-purple-600 hover:text-purple-700 active:scale-95 transition-transform"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
              
              <div className="w-full flex items-center gap-4 my-6">
                <div className="h-[1px] flex-1 bg-gray-100"></div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
                <div className="h-[1px] flex-1 bg-gray-100"></div>
              </div>

              <button 
                type="button" 
                onClick={onGuest}
                className="group flex items-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="mr-1">Continue as</span>
                <span className="text-gray-600 underline decoration-gray-200 underline-offset-4 decoration-2 group-hover:decoration-purple-200">Guest Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Portfolio Credit Footer */}
      <div className="shrink-0 py-6 px-6 relative z-20 text-center bg-transparent">
        <p className="text-[10px] text-gray-400 font-medium tracking-wide">
          &copy; 2025 HYDROFLOW &bull; Made with love by Pratik ❤️
        </p>
      </div>
    </div>
  );
};

export default Auth;