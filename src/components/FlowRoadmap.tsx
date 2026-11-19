'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomRoadmapNode } from './CustomRoadmapNode';
import { RoadmapItem, UserProgressMap } from '../lib/types';

interface FlowRoadmapProps {
  roadmap: RoadmapItem;
  progress: UserProgressMap;
  onSelectNode: (nodeId: string) => void;
}

export function FlowRoadmap({ roadmap, progress, onSelectNode }: FlowRoadmapProps) {
  const nodeTypes = useMemo(() => ({
    customNode: CustomRoadmapNode,
  }), []);

  // Map nodes with live status from progress
  const flowNodes: Node[] = useMemo(() => {
    return roadmap.nodes.map(n => {
      const userNodeProgress = progress[n.id];
      return {
        id: n.id,
        type: 'customNode',
        position: n.position,
        data: {
          ...n,
          status: userNodeProgress?.status || 'pending',
          note: userNodeProgress?.notes || '',
          onSelectNode
        }
      };
    });
  }, [roadmap.nodes, progress, onSelectNode]);

  const flowEdges: Edge[] = useMemo(() => {
    return roadmap.edges.map(e => ({
      ...e,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
    }));
  }, [roadmap.edges]);

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-slate-800 bg-[#0a0e17] relative shadow-2xl">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#1f293d" />
        <Controls className="!bg-slate-900 !border-slate-800 !rounded-xl !shadow-lg [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!fill-slate-300" />
        <MiniMap
          nodeColor={(n) => {
            const status = (n.data as any)?.status;
            if (status === 'done') return '#10b981';
            if (status === 'in_progress') return '#f59e0b';
            return '#1e293b';
          }}
          maskColor="rgba(10, 14, 23, 0.85)"
          className="!bg-slate-950 !border-slate-800 !rounded-xl"
        />
      </ReactFlow>

      {/* Floating Canvas Hint */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800 text-xs text-slate-400 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        <span>Canvas tương tác: Cuộn chuột để phóng to/thu nhỏ, giữ chuột để kéo di chuyển</span>
      </div>
    </div>
  );
}
