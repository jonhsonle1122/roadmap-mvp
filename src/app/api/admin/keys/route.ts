import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Lấy danh sách keys (Masked để bảo mật)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_ai_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mask key trước khi trả về client
    const masked = (data || []).map((k) => ({
      ...k,
      masked_key: maskKey(k.api_key),
    }));

    return NextResponse.json({ success: true, keys: masked });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. Thêm Key mới
export async function POST(req: NextRequest) {
  try {
    const { provider, key_name, api_key, is_active } = await req.json();

    if (!api_key || !key_name) {
      return NextResponse.json({ error: 'Vui lòng nhập tên và API Key' }, { status: 400 });
    }

    // Nếu set is_active = true, tắt active các key khác
    if (is_active) {
      await supabase.from('admin_ai_keys').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await supabase
      .from('admin_ai_keys')
      .insert({
        provider: provider || 'gemini',
        key_name,
        api_key,
        is_active: Boolean(is_active),
        status: 'untested',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, key: { ...data, masked_key: maskKey(data.api_key) } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. Cập nhật (Active / Inactive)
export async function PATCH(req: NextRequest) {
  try {
    const { id, is_active } = await req.json();

    if (is_active) {
      // Tắt active các key khác
      await supabase.from('admin_ai_keys').update({ is_active: false }).neq('id', id);
    }

    const { data, error } = await supabase
      .from('admin_ai_keys')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, key: { ...data, masked_key: maskKey(data.api_key) } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 4. Xóa Key
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Thiếu key id' }, { status: 400 });

    const { error } = await supabase.from('admin_ai_keys').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function maskKey(key: string) {
  if (!key || key.length < 10) return '********';
  return `${key.slice(0, 7)}...${key.slice(-5)}`;
}
