import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { id, provider: customProvider, api_key: customKey } = await req.json();

    let provider = customProvider || 'gemini';
    let apiKey = customKey;

    if (id) {
      const { data, error } = await supabase
        .from('admin_ai_keys')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Không tìm thấy key trong database' }, { status: 404 });
      }
      provider = data.provider;
      apiKey = data.api_key;
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa có API Key để test' }, { status: 400 });
    }

    const startTime = Date.now();
    let reply = '';
    let isSuccess = false;
    let errorMessage = '';

    // Test theo từng Provider
    if (provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Trả lời đúng 1 chữ: Pong' }] }],
          generationConfig: { maxOutputTokens: 20 }
        })
      });

      const data = await res.json();
      if (res.ok) {
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
        isSuccess = true;
      } else {
        errorMessage = data.error?.message || 'Lỗi Gemini API';
      }
    } else if (provider === 'openai' || provider === 'groq' || provider === 'deepseek') {
      const baseURLs: Record<string, { url: string; model: string }> = {
        openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
        groq: { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.1-8b-instant' },
        deepseek: { url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' }
      };

      const target = baseURLs[provider] || baseURLs.openai;
      const res = await fetch(target.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: target.model,
          messages: [{ role: 'user', content: 'Say Pong' }],
          max_tokens: 10
        })
      });

      const data = await res.json();
      if (res.ok) {
        reply = data.choices?.[0]?.message?.content?.trim() || 'OK';
        isSuccess = true;
      } else {
        errorMessage = data.error?.message || `Lỗi ${provider} API`;
      }
    } else {
      return NextResponse.json({ error: 'Nhà cung cấp không hỗ trợ' }, { status: 400 });
    }

    const latencyMs = Date.now() - startTime;
    const finalStatus = isSuccess ? 'active' : 'error';

    // Cập nhật lại vào Supabase nếu có id
    if (id) {
      await supabase
        .from('admin_ai_keys')
        .update({
          status: finalStatus,
          latency_ms: latencyMs,
          last_tested_at: new Date().toISOString()
        })
        .eq('id', id);
    }

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        provider,
        latencyMs,
        reply,
        status: finalStatus
      });
    } else {
      return NextResponse.json({
        success: false,
        provider,
        latencyMs,
        error: errorMessage,
        status: finalStatus
      }, { status: 400 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
