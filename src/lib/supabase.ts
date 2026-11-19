import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProgressMap } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage Fallback Keys
const LOCAL_STORAGE_PROGRESS = 'roadmap_mvp_user_progress';
const LOCAL_STORAGE_USER = 'roadmap_mvp_demo_user';

export async function getUserSession() {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
  // Fallback demo user
  const stored = localStorage.getItem(LOCAL_STORAGE_USER);
  return stored ? JSON.parse(stored) : null;
}

export async function loadUserProgress(roadmapId: string): Promise<UserProgressMap> {
  const user = await getUserSession();
  
  if (supabase && user) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('node_id, status, notes, updated_at')
        .eq('user_id', user.id)
        .eq('roadmap_id', roadmapId);

      if (!error && data) {
        const progressMap: UserProgressMap = {};
        data.forEach(item => {
          progressMap[item.node_id] = {
            status: item.status,
            notes: item.notes || '',
            updatedAt: new Date(item.updated_at).getTime()
          };
        });
        return progressMap;
      }
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu từ Supabase, chuyển sang LocalStorage:', e);
    }
  }

  // Local storage fallback
  try {
    const local = localStorage.getItem(`${LOCAL_STORAGE_PROGRESS}_${roadmapId}`);
    return local ? JSON.parse(local) : {};
  } catch (e) {
    return {};
  }
}

export async function saveUserNodeProgress(
  roadmapId: string, 
  nodeId: string, 
  status: 'done' | 'in_progress' | 'skipped' | 'pending', 
  notes: string = ''
) {
  const user = await getUserSession();
  const timestamp = Date.now();

  // Luôn cập nhật local storage để phản hồi tức thì
  try {
    const local = localStorage.getItem(`${LOCAL_STORAGE_PROGRESS}_${roadmapId}`);
    const map: UserProgressMap = local ? JSON.parse(local) : {};
    map[nodeId] = { status, notes, updatedAt: timestamp };
    localStorage.setItem(`${LOCAL_STORAGE_PROGRESS}_${roadmapId}`, JSON.stringify(map));
  } catch (e) {
    console.error(e);
  }

  // Nếu đã đăng nhập Supabase, đồng bộ lên PostgreSQL Cloud
  if (supabase && user) {
    try {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        roadmap_id: roadmapId,
        node_id: nodeId,
        status: status,
        notes: notes,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,roadmap_id,node_id' });
    } catch (e) {
      console.warn('Lỗi đồng bộ lên Supabase:', e);
    }
  }
}
