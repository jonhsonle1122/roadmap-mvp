'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Sparkles, User, LogOut, CheckCircle2, LayoutDashboard, Map, Shield } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentRoadmapId: string;
  onSelectRoadmap: (id: string) => void;
  roadmapsList: { id: string; title: string }[];
  activeView: 'flow' | 'dashboard';
  onChangeView: (view: 'flow' | 'dashboard') => void;
  onOpenAiModal: () => void;
  onOpenAuthModal: () => void;
  user: any;
  onSignOut: () => void;
  completedCount: number;
  totalCount: number;
}

export function Navbar({
  currentRoadmapId,
  onSelectRoadmap,
  roadmapsList,
  activeView,
  onChangeView,
  onOpenAiModal,
  onOpenAuthModal,
  user,
  onSignOut,
  completedCount,
  totalCount,
}: NavbarProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0d131f]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                roadmap.sh
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                MVP Phase 1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Next.js • Supabase • React Flow</p>
          </div>
        </div>

        {/* Center: Roadmap Selector & View Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <select
            value={currentRoadmapId}
            onChange={(e) => onSelectRoadmap(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
          >
            {roadmapsList.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                {r.title}
              </option>
            ))}
          </select>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={() => onChangeView('flow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'flow'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sơ đồ Flow</span>
          </button>

          <button
            onClick={() => onChangeView('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Progress pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-mono font-bold">
              {completedCount}/{totalCount} ({percent}%)
            </span>
          </div>

          {/* AI Generator Button */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Generator</span>
          </button>

          {/* Admin Link Button */}
          <Link
            href="/admin"
            title="Trang quản trị & Test Key AI"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin</span>
          </Link>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <span className="text-xs text-slate-300 font-medium hidden md:inline max-w-[120px] truncate">
                {user.email || 'Học viên'}
              </span>
              <button
                onClick={onSignOut}
                title="Đăng xuất"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{isSupabaseConfigured ? 'Đăng nhập' : 'Demo Mode'}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
