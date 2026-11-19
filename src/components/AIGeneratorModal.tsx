'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { RoadmapItem } from '../lib/types';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapGenerated: (newRoadmap: RoadmapItem) => void;
}

export function AIGeneratorModal({ isOpen, onClose, onRoadmapGenerated }: AIGeneratorModalProps) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_roadmap',
          topic: topic.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.roadmap) {
        throw new Error(data.error || 'Lỗi khi gọi AI');
      }

      // Format generated roadmap into React Flow coordinates
      const gen = data.roadmap;
      const roadmapId = 'ai-' + Date.now();
      const nodes: RoadmapItem['nodes'] = [];
      const edges: RoadmapItem['edges'] = [];

      let colX = 80;
      let rowY = 60;
      let prevNodeId: string | null = null;

      gen.categories.forEach((cat: any, catIdx: number) => {
        cat.nodes.forEach((node: any, nodeIdx: number) => {
          const nId = `${roadmapId}-n-${catIdx}-${nodeIdx}`;
          nodes.push({
            id: nId,
            label: node.title,
            level: node.level || 'Cốt lõi',
            categoryTitle: cat.title,
            estTime: node.estTime || '30 phút',
            summary: node.summary || '',
            content: node.content || node.summary || '',
            prosCons: node.prosCons,
            questions: node.questions,
            position: { x: colX + (catIdx * 340), y: rowY + (nodeIdx * 140) }
          });

          if (prevNodeId) {
            edges.push({
              id: `edge-${prevNodeId}-${nId}`,
              source: prevNodeId,
              target: nId,
              animated: true
            });
          }
          prevNodeId = nId;
        });
      });

      const newRoadmap: RoadmapItem = {
        id: roadmapId,
        title: gen.title || topic,
        description: gen.description || `Lộ trình do AI tạo cho chủ đề ${topic}`,
        badge: 'AI Generated',
        nodes,
        edges
      };

      onRoadmapGenerated(newRoadmap);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo lộ trình');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sinh Lộ Trình Mới Bằng AI</h3>
              <p className="text-xs text-slate-400">Google Gemini 1.5 Flash • Tự động bố trí Node React Flow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="py-4 space-y-4">
          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nhập chủ đề hoặc vị trí công việc bạn muốn học:
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Lộ trình Golang Microservices, DevOps Kubernetes, AI Agent Developer..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 space-y-1">
            <p className="font-semibold">💡 AI sẽ tự động phân tích và tạo:</p>
            <ul className="list-disc list-inside space-y-0.5 text-purple-300/80">
              <li>Các chuyên mục theo thứ tự từ dễ đến nâng cao</li>
              <li>Tọa độ x, y kết nối đường cong trên Canvas React Flow</li>
              <li>Nội dung giải thích chi tiết, trade-offs và câu hỏi phỏng vấn</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI đang thiết kế lộ trình (5-10s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo Lộ Trình Ngay</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
