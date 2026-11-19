export type NodeStatus = 'done' | 'in_progress' | 'skipped' | 'pending';

export interface RoadmapNodeData {
  id: string;
  label: string;
  level?: 'Cơ bản' | 'Cốt lõi' | 'Nâng cao' | 'Thực chiến';
  categoryTitle?: string;
  estTime?: string;
  summary?: string;
  content?: string;
  prosCons?: {
    pros: string[];
    cons: string[];
  };
  questions?: string[];
  resources?: { title: string; url: string }[];
  status?: NodeStatus;
  note?: string;
  onSelectNode?: (nodeId: string) => void;
}

export interface UserProgressMap {
  [nodeId: string]: {
    status: NodeStatus;
    notes?: string;
    updatedAt: number;
  };
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  nodes: {
    id: string;
    label: string;
    level?: 'Cơ bản' | 'Cốt lõi' | 'Nâng cao' | 'Thực chiến';
    estTime?: string;
    summary: string;
    content: string;
    categoryTitle: string;
    prosCons?: { pros: string[]; cons: string[] };
    questions?: string[];
    resources?: { title: string; url: string }[];
    // Vị trí node trên canvas React Flow
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    label?: string;
  }[];
}
