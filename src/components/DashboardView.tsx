'use client';

import React from 'react';
import { CheckCircle2, Clock, BookOpen, Flame, Award } from 'lucide-react';
import { RoadmapItem, UserProgressMap } from '../lib/types';

interface DashboardViewProps {
  roadmap: RoadmapItem;
  progress: UserProgressMap;
}

export function DashboardView({ roadmap, progress }: DashboardViewProps) {
  const totalNodes = roadmap.nodes.length;
  let doneCount = 0;
  let inProgressCount = 0;

  // Group by category
  const categoriesMap: Record<string, { total: number; done: number }> = {};

  roadmap.nodes.forEach((n) => {
    const status = progress[n.id]?.status;
    if (status === 'done') doneCount++;
    else if (status === 'in_progress') inProgressCount++;

    const cat = n.categoryTitle || 'Khác';
    if (!categoriesMap[cat]) categoriesMap[cat] = { total: 0, done: 0 };
    categoriesMap[cat].total++;
    if (status === 'done') categoriesMap[cat].done++;
  });

  const percent = totalNodes > 0 ? Math.round((doneCount / totalNodes) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Dashboard Cá Nhân</h2>
        <p className="text-sm text-slate-400 mt-1">
          Tổng quan năng lực và tỷ lệ hoàn thành lộ trình <span className="text-blue-400 font-semibold">{roadmap.title}</span>.
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đã hoàn thành</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-1 font-mono">{doneCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang học</p>
            <h3 className="text-3xl font-black text-amber-400 mt-1 font-mono">{inProgressCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng số chủ đề</p>
            <h3 className="text-3xl font-black text-blue-400 mt-1 font-mono">{totalNodes}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chuỗi rèn luyện</p>
            <h3 className="text-3xl font-black text-purple-400 mt-1 font-mono">🔥 5 Ngày</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Progress Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radial Progress Ring */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Tỷ Lệ Nắm Vững
          </h4>

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * percent) / 100}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-3xl font-black text-white font-mono">{percent}%</span>
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            {percent >= 80
              ? 'Xuất sắc! Bạn đã sẵn sàng cho vòng phỏng vấn System Design.'
              : 'Hãy tiếp tục hoàn thiện các chủ đề Cốt lõi và Case Study.'}
          </p>
        </div>

        {/* Categories Breakdown Bars */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
            Tiến độ theo từng Module
          </h4>

          <div className="space-y-4">
            {Object.entries(categoriesMap).map(([catTitle, stat]) => {
              const catPct = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
              return (
                <div key={catTitle} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold text-slate-200">{catTitle}</span>
                    <span className="font-mono text-blue-400 font-bold">
                      {stat.done}/{stat.total} ({catPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
