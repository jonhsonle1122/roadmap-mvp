'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Play,
  Sparkles,
  ArrowLeft,
  Loader2,
  Server,
  Zap,
} from 'lucide-react';

interface KeyItem {
  id: string;
  provider: string;
  key_name: string;
  masked_key: string;
  is_active: boolean;
  status: 'active' | 'error' | 'untested';
  latency_ms: number;
  last_tested_at?: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form thêm key
  const [newProvider, setNewProvider] = useState<string>('gemini');
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [newIsActive, setNewIsActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Testing states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Sandbox state
  const [sandboxPrompt, setSandboxPrompt] = useState<string>('Lộ trình học Vue.js 3');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(false);

  // Kiểm tra mã PIN đã lưu trong sessionStorage chưa
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchKeys();
    }
  }, []);

  const handleLoginPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mã PIN mặc định là admin123
    if (pinInput === 'admin123' || pinInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      fetchKeys();
    } else {
      setPinError('Mã PIN không đúng (Mặc định: admin123)');
    }
  };

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/keys');
      const data = await res.json();
      if (res.ok && data.keys) {
        setKeys(data.keys);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim() || !newKeyName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: newProvider,
          key_name: newKeyName.trim(),
          api_key: newApiKey.trim(),
          is_active: newIsActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewKeyName('');
        setNewApiKey('');
        setNewIsActive(false);
        await fetchKeys();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestKey = async (keyItem: KeyItem) => {
    setTestingId(keyItem.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyItem.id }),
      });

      const data = await res.json();
      setTestResult({
        keyId: keyItem.id,
        keyName: keyItem.key_name,
        success: data.success,
        latencyMs: data.latencyMs,
        reply: data.reply,
        error: data.error,
      });

      await fetchKeys();
    } catch (e: any) {
      setTestResult({
        keyId: keyItem.id,
        keyName: keyItem.key_name,
        success: false,
        error: e.message,
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      await fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa key "${name}" không?`)) return;

    try {
      await fetch(`/api/admin/keys?id=${id}`, { method: 'DELETE' });
      await fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunSandbox = async () => {
    if (!sandboxPrompt.trim() || isSandboxRunning) return;
    setIsSandboxRunning(true);
    setSandboxResult(null);

    try {
      const start = Date.now();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_roadmap', topic: sandboxPrompt.trim() }),
      });
      const latency = Date.now() - start;
      const data = await res.json();

      setSandboxResult({
        success: res.ok && data.success,
        latency,
        data: data.roadmap || data.error,
      });
    } catch (e: any) {
      setSandboxResult({ success: false, data: e.message });
    } finally {
      setIsSandboxRunning(false);
    }
  };

  // Màn hình nhập mã PIN nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Quản Trị Viên (Admin)</h2>
            <p className="text-xs text-slate-400 mt-1">Nhập mã PIN để quản lý và kiểm tra các API Key AI</p>
          </div>

          <form onSubmit={handleLoginPin} className="space-y-3 pt-2">
            {pinError && <p className="text-xs text-rose-400 text-center">{pinError}</p>}
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Nhập mã PIN (mặc định: admin123)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono tracking-widest"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-lg shadow-blue-500/20"
            >
              Mở Khóa Admin
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
              ← Quay về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeKey = keys.find((k) => k.is_active);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại Trang chủ Roadmap
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Quản Trị & Test Key AI
                </h1>
                <p className="text-xs text-slate-400">
                  Lưu trữ trên Supabase • Quản lý nhiều Provider • Đo Latency thời gian thực
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchKeys}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              Làm mới danh sách
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng số Key AI</p>
              <h3 className="text-3xl font-black text-white mt-1 font-mono">{keys.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Đang Kích Hoạt</p>
              <h3 className="text-sm font-bold text-emerald-400 mt-1 truncate max-w-[160px]">
                {activeKey ? activeKey.key_name : 'Chưa có key active'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tốc độ phản hồi</p>
              <h3 className="text-2xl font-black text-purple-400 mt-1 font-mono">
                {activeKey?.latency_ms ? `${activeKey.latency_ms} ms` : '--'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Form Thêm Key Mới */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            Thêm API Key Mới
          </h3>

          <form onSubmit={handleAddKey} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nhà cung cấp:</label>
              <select
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="gemini">Google Gemini (Free 15 RPM)</option>
                <option value="openai">OpenAI (GPT-4o Mini)</option>
                <option value="groq">Groq (Siêu tốc Llama 3)</option>
                <option value="deepseek">DeepSeek (V3 / R1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tên gợi nhớ:</label>
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="VD: Gemini Key Chính"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">API Key Secret:</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  required
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="AIzaSy... hoặc sk-..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Lưu Key'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Test Alert Box */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {testResult.success
                    ? `Key "${testResult.keyName}" hoạt động hoàn hảo!`
                    : `Key "${testResult.keyName}" gặp lỗi!`}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  {testResult.success
                    ? `Độ trễ phản hồi: ${testResult.latencyMs} ms • Phản hồi từ mô hình: "${testResult.reply}"`
                    : `Chi tiết lỗi: ${testResult.error}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTestResult(null)}
              className="text-xs opacity-75 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bảng Danh Sách Keys */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Danh Sách Key Đã Cấu Hình
            </h3>
            <span className="text-xs text-slate-500 font-mono">* Tự động đồng bộ lên Database</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span>Đang tải danh sách key từ database...</span>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Chưa có key nào được lưu. Hãy thêm key đầu tiên ở bảng phía trên!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Tên Key</th>
                    <th className="py-3 px-4">Masked Key</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Độ Trễ</th>
                    <th className="py-3 px-4 text-center">Key Chính</th>
                    <th className="py-3 px-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold uppercase text-purple-400">
                        {k.provider}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{k.key_name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{k.masked_key}</td>
                      <td className="py-3.5 px-4 text-center">
                        {k.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            🟢 Live
                          </span>
                        ) : k.status === 'error' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            🔴 Lỗi
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                            Chưa test
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {k.latency_ms ? `${k.latency_ms} ms` : '--'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(k.id, k.is_active)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 inline-block ${
                            k.is_active ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full bg-white block transition-transform ${
                              k.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleTestKey(k)}
                          disabled={testingId === k.id}
                          className="px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        >
                          {testingId === k.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span>Test</span>
                        </button>
                        <button
                          onClick={() => handleDeleteKey(k.id, k.key_name)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors inline-block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sandbox Thử Nghiệm Sinh Roadmap */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Sandbox Thử Nghiệm Sinh Roadmap Trực Tuyến
            </h3>
            <span className="text-xs text-slate-400">
              Đang dùng: <strong className="text-emerald-400">{activeKey ? activeKey.key_name : 'Mặc định'}</strong>
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sandboxPrompt}
              onChange={(e) => setSandboxPrompt(e.target.value)}
              placeholder="Nhập chủ đề test..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleRunSandbox}
              disabled={isSandboxRunning}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
            >
              {isSandboxRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Chạy Thử Nghiệm'}
            </button>
          </div>

          {sandboxResult && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono pb-2 border-b border-slate-800">
                <span className={sandboxResult.success ? 'text-emerald-400' : 'text-rose-400'}>
                  {sandboxResult.success ? '✅ Sinh thành công!' : '❌ Thất bại'}
                </span>
                <span className="text-slate-400">{sandboxResult.latency} ms</span>
              </div>
              <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-60 p-2 bg-slate-900 rounded-xl">
                {typeof sandboxResult.data === 'object'
                  ? JSON.stringify(sandboxResult.data, null, 2)
                  : sandboxResult.data}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
