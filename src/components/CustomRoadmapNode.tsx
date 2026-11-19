'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Check, Clock, Sparkles } from 'lucide-react';
import { RoadmapNodeData } from '../lib/types';

interface CustomNodeProps {
  id: string;
  data: RoadmapNodeData;
  selected?: boolean;
}

export const CustomRoadmapNode = memo(({ id, data, selected }: CustomNodeProps) => {
  const status = data.status || 'pending';

  let borderStyle = 'border-slate-800 hover:border-blue-500/60 bg-slate-900/90';
  let badgeStyle = 'bg-slate-800 text-slate-400';
  let statusIcon = null;

  if (status === 'done') {
    borderStyle = 'border-emerald-500/80 bg-gradient-to-br from-emerald-950/40 to-slate-900 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50';
    badgeStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    statusIcon = <Check className="w-3.5 h-3.5 text-emerald-400" />;
  } else if (status === 'in_progress') {
    borderStyle = 'border-amber-500/80 bg-gradient-to-br from-amber-950/40 to-slate-900 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50';
    badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    statusIcon = <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />;
  } else if (status === 'skipped') {
    borderStyle = 'border-slate-800/60 bg-slate-950/60 opacity-60';
  }

  return (
    <div
      onClick={() => data.onSelectNode && data.onSelectNode(id)}
      className={`relative w-64 rounded-2xl p-4 border transition-all duration-300 cursor-pointer select-none backdrop-blur-md group ${borderStyle} ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-slate-900"
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          {data.level || 'Cốt lõi'}
        </span>
        <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeStyle}`}>
          {statusIcon}
          <span>{status === 'done' ? 'Đã học' : status === 'in_progress' ? 'Đang học' : 'Chưa học'}</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
        {data.label}
      </h4>

      {/* Summary */}
      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
        {data.summary || 'Bấm để đọc bài học và ghi chú...'}
      </p>

      {/* Footer info */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          {data.estTime || '30 phút'}
        </span>
        <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5">
          Xem bài →
        </span>
      </div>
    </div>
  );
});

CustomRoadmapNode.displayName = 'CustomRoadmapNode';
