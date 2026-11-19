'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { FlowRoadmap } from '../components/FlowRoadmap';
import { LessonDrawer } from '../components/LessonDrawer';
import { DashboardView } from '../components/DashboardView';
import { AuthModal } from '../components/AuthModal';
import { AIGeneratorModal } from '../components/AIGeneratorModal';
import { ROADMAP_ITEMS } from '../lib/roadmap-data';
import { RoadmapItem, UserProgressMap, NodeStatus } from '../lib/types';
import {
  getUserSession,
  loadUserProgress,
  saveUserNodeProgress,
  supabase,
} from '../lib/supabase';

export default function Home() {
  const [roadmaps, setRoadmaps] = useState<Record<string, RoadmapItem>>(ROADMAP_ITEMS);
  const [currentRoadmapId, setCurrentRoadmapId] = useState<string>('system-design');
  const [progress, setProgress] = useState<UserProgressMap>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'flow' | 'dashboard'>('flow');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const currentRoadmap = roadmaps[currentRoadmapId] || roadmaps['system-design'];

  // Khởi tạo session & nạp progress
  useEffect(() => {
    async function init() {
      const sessionUser = await getUserSession();
      setUser(sessionUser);

      // Load progress
      const p = await loadUserProgress(currentRoadmapId);
      setProgress(p);

      // Nạp custom roadmaps nếu có lưu ở localStorage
      try {
        const customStored = localStorage.getItem('roadmap_mvp_custom_roadmaps');
        if (customStored) {
          const parsed = JSON.parse(customStored);
          setRoadmaps((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    }
    init();
  }, [currentRoadmapId]);

  // Cập nhật trạng thái Node
  const handleUpdateStatus = useCallback(
    async (nodeId: string, status: NodeStatus) => {
      const currentNotes = progress[nodeId]?.notes || '';
      setProgress((prev) => ({
        ...prev,
        [nodeId]: { status, notes: currentNotes, updatedAt: Date.now() },
      }));

      await saveUserNodeProgress(currentRoadmapId, nodeId, status, currentNotes);
    },
    [currentRoadmapId, progress]
  );

  // Lưu ghi chú
  const handleSaveNote = useCallback(
    async (nodeId: string, notes: string) => {
      const currentStatus = progress[nodeId]?.status || 'pending';
      setProgress((prev) => ({
        ...prev,
        [nodeId]: { status: currentStatus, notes, updatedAt: Date.now() },
      }));

      await saveUserNodeProgress(currentRoadmapId, nodeId, currentStatus, notes);
    },
    [currentRoadmapId, progress]
  );

  // Nhận Roadmap do AI sinh
  const handleRoadmapGenerated = (newRoadmap: RoadmapItem) => {
    setRoadmaps((prev) => {
      const updated = { ...prev, [newRoadmap.id]: newRoadmap };
      try {
        localStorage.setItem('roadmap_mvp_custom_roadmaps', JSON.stringify({ [newRoadmap.id]: newRoadmap }));
      } catch (e) {}
      return updated;
    });
    setCurrentRoadmapId(newRoadmap.id);
    setActiveView('flow');
  };

  // Đăng xuất
  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('roadmap_mvp_demo_user');
    setUser(null);
  };

  // Thống kê số lượng hoàn thành
  const completedCount = currentRoadmap.nodes.filter(
    (n) => progress[n.id]?.status === 'done'
  ).length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <Navbar
        currentRoadmapId={currentRoadmapId}
        onSelectRoadmap={setCurrentRoadmapId}
        roadmapsList={Object.values(roadmaps).map((r) => ({ id: r.id, title: r.title }))}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        user={user}
        onSignOut={handleSignOut}
        completedCount={completedCount}
        totalCount={currentRoadmap.nodes.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
        {activeView === 'flow' ? (
          <div className="space-y-4">
            {/* Header Description */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  {currentRoadmap.title}
                </h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-1">
                  {currentRoadmap.description}
                </p>
              </div>
              {currentRoadmap.badge && (
                <span className="hidden sm:inline-block text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {currentRoadmap.badge}
                </span>
              )}
            </div>

            {/* React Flow Interactive Canvas */}
            <FlowRoadmap
              roadmap={currentRoadmap}
              progress={progress}
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          </div>
        ) : (
          <DashboardView roadmap={currentRoadmap} progress={progress} />
        )}
      </main>

      {/* Slide-over Lesson Drawer */}
      <LessonDrawer
        nodeId={selectedNodeId}
        roadmap={currentRoadmap}
        currentStatus={selectedNodeId ? progress[selectedNodeId]?.status || 'pending' : 'pending'}
        currentNote={selectedNodeId ? progress[selectedNodeId]?.notes || '' : ''}
        onClose={() => setSelectedNodeId(null)}
        onUpdateStatus={handleUpdateStatus}
        onSaveNote={handleSaveNote}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRoadmapGenerated={handleRoadmapGenerated}
      />
    </div>
  );
}
