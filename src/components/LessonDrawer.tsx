'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Sparkles, Send, BookOpen, AlertTriangle, HelpCircle } from 'lucide-react';
import { RoadmapItem } from '../lib/types';

interface LessonDrawerProps {
  nodeId: string | null;
  roadmap: RoadmapItem;
  currentStatus: 'done' | 'in_progress' | 'skipped' | 'pending';
  currentNote: string;
  onClose: () => void;
  onUpdateStatus: (nodeId: string, status: 'done' | 'in_progress' | 'skipped' | 'pending') => void;
  onSaveNote: (nodeId: string, note: string) => void;
}

export function LessonDrawer({
  nodeId,
  roadmap,
  currentStatus,
  currentNote,
  onClose,
  onUpdateStatus,
  onSaveNote,
}: LessonDrawerProps) {
  const node = roadmap.nodes.find(n => n.id === nodeId);
  const [note, setNote] = useState(currentNote);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setNote(currentNote);
    setAiQuestion('');
    setAiAnswer('');
  }, [nodeId, currentNote]);

  if (!nodeId || !node) return null;

  const handleAskAi = async () => {
    if (!aiQuestion.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setAiAnswer('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_tutor',
          prompt: aiQuestion,
          context: `${node.label} (${node.categoryTitle}): ${node.summary}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setAiAnswer(data.reply);
      } else {
        setAiAnswer(`❌ ${data.error || 'Không thể kết nối đến AI'}`);
      }
    } catch (e: any) {
      setAiAnswer(`❌ Lỗi: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0d131f] border-l border-slate-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                {node.level || 'Cốt lõi'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {node.estTime || '30 phút'}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">{node.label}</h3>
            <p className="text-xs text-slate-400 mt-1">{node.categoryTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Switcher Bar */}
        <div className="px-6 py-3 bg-slate-900/80 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1">Trạng thái:</span>
          
          <button
            onClick={() => onUpdateStatus(node.id, 'done')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentStatus === 'done'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Đã hoàn thành
          </button>

          <button
            onClick={() => onUpdateStatus(node.id, 'in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentStatus === 'in_progress'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Đang học
          </button>

          <button
            onClick={() => onUpdateStatus(node.id, 'pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentStatus === 'pending'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Chưa học
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Markdown Content */}
          <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
            {node.content || node.summary}
          </div>

          {/* Trade-offs (Pros & Cons) */}
          {node.prosCons && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Ưu điểm / Khuyến nghị
                </h5>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {node.prosCons.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Trade-offs / Nhược điểm
                </h5>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {node.prosCons.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Interview Questions */}
          {node.questions && node.questions.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
              <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Câu hỏi phỏng vấn tư duy
              </h5>
              <ul className="text-xs text-slate-300 space-y-2">
                {node.questions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-blue-400">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Tutor Assistant */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Hỏi Trợ Giảng AI về chủ đề này
              </span>
              <span className="text-[10px] text-purple-400/80 font-mono">Gemini 1.5</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                placeholder="VD: Cho ví dụ thực tế về trade-off của bài này?"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAskAi}
                disabled={isAiLoading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-1 transition-all"
              >
                {isAiLoading ? '...' : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            {aiAnswer && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {aiAnswer}
              </div>
            )}
          </div>

          {/* Personal Notes */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Ghi chú cá nhân của bạn
              </label>
              <span className="text-[11px] text-slate-500">* Tự động lưu lên Cloud</span>
            </div>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                onSaveNote(node.id, e.target.value);
              }}
              placeholder="Ghi chú tóm tắt hoặc điểm cần nhớ lại sau này..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-all"
            />
          </div>

        </div>
      </aside>
    </>
  );
}
