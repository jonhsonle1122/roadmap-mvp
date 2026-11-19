'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, Github, Chrome, AlertCircle, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Fallback demo user
      const demoUser = { id: 'demo-' + Date.now(), email, full_name: email.split('@')[0] };
      localStorage.setItem('roadmap_mvp_demo_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
      onClose();
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    if (!isSupabaseConfigured || !supabase) {
      const demoUser = { id: `demo-${provider}`, email: `${provider}_user@demo.com`, full_name: `${provider} Developer` };
      localStorage.setItem('roadmap_mvp_demo_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
      onClose();
      return;
    }

    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              {isSignUp ? 'Đăng ký tài khoản' : 'Đăng nhập'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Lưu đồng bộ tiến độ học tập trên Supabase Cloud</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Notice if not configured */}
        {!isSupabaseConfigured && (
          <div className="my-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Đang ở chế độ Demo (Chưa gắn Supabase Key)</p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                Bạn có thể gõ email bất kỳ để trải nghiệm ngay. Sau khi deploy lên Vercel, hãy cấu hình <code className="bg-amber-900/40 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> để lưu vào PostgreSQL thật.
              </p>
            </div>
          </div>
        )}

        {/* Social Logins */}
        <div className="py-4 space-y-2.5">
          <button
            onClick={() => handleOAuth('github')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Github className="w-4 h-4" />
            Tiếp tục với GitHub
          </button>
          <button
            onClick={() => handleOAuth('google')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Chrome className="w-4 h-4 text-rose-400" />
            Tiếp tục với Google
          </button>
        </div>

        <div className="flex items-center gap-2 my-2">
          <div className="h-px flex-1 bg-slate-800"></div>
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Hoặc email</span>
          <div className="h-px flex-1 bg-slate-800"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 pt-2">
          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Mật khẩu:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all mt-2"
          >
            {loading ? 'Đang xử lý...' : isSignUp ? 'Đăng ký tài khoản' : 'Đăng nhập'}
          </button>
        </form>

        <div className="pt-4 mt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-blue-400 hover:underline"
          >
            {isSignUp ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký miễn phí'}
          </button>
        </div>

      </div>
    </div>
  );
}
