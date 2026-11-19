import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { action, prompt, topic, context } = await req.json();
    let apiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;

    // Nếu không có trong header/env, tìm key đang Active trong admin_ai_keys
    if (!apiKey) {
      try {
        const { data } = await supabase
          .from('admin_ai_keys')
          .select('api_key')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (data?.api_key) {
          apiKey = data.api_key;
        }
      } catch (e) {}
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Chưa cấu hình AI Key. Hãy vào trang Quản trị /admin để thêm và kích hoạt key AI, hoặc cấu hình GEMINI_API_KEY trên Vercel.',
        },
        { status: 400 }
      );
    }

    let systemInstruction = '';
    let userPrompt = '';

    if (action === 'generate_roadmap') {
      systemInstruction = `Bạn là chuyên gia thiết kế lộ trình học tập CNTT (giống roadmap.sh).
Tạo một lộ trình học chi tiết bằng tiếng Việt theo định dạng JSON hợp lệ duy nhất, KHÔNG kèm markdown giải thích thừa bên ngoài JSON.
Cấu trúc JSON bắt buộc:
{
  "title": "Tên lộ trình",
  "description": "Mô tả mục tiêu lộ trình trong 2 câu",
  "categories": [
    {
      "id": "cat-1",
      "title": "Tên chuyên mục (vd: 1. Nền tảng)",
      "desc": "Mô tả ngắn chuyên mục",
      "nodes": [
        {
          "id": "node-1",
          "title": "Tên bài học",
          "level": "Cơ bản / Cốt lõi / Nâng cao",
          "estTime": "30 phút",
          "summary": "Tóm tắt 1-2 câu",
          "content": "Nội dung trọng tâm 1-2 đoạn Markdown súc tích. Tuyệt đối không dùng dấu ngoặc kép đôi bên trong giá trị chuỗi, hãy dùng ngoặc đơn ' từ khóa ' hoặc backticks \`code\` để JSON luôn hợp lệ.",
          "prosCons": {
            "pros": ["Ưu điểm 1", "Ưu điểm 2"],
            "cons": ["Nhược điểm / Trade-off 1"]
          },
          "questions": ["Câu hỏi phỏng vấn tư duy 1", "Câu hỏi 2"]
        }
      ]
    }
  ]
}`;
      userPrompt = `Hãy tạo lộ trình học hoàn chỉnh cho chủ đề: "${topic || prompt}". Tạo 3 chuyên mục, mỗi chuyên mục 2-3 bài học thực chiến, súc tích và đúng trọng tâm.`;
    } else if (action === 'ask_tutor') {
      systemInstruction = `Bạn là trợ giảng AI thông minh, hỗ trợ giải đáp thắc mắc về kỹ thuật lập trình và thiết kế hệ thống theo ngữ cảnh bài học.
Hãy giải thích ngắn gọn, dễ hiểu bằng tiếng Việt, có ví dụ minh họa và nêu rõ các đánh đổi (trade-offs).`;
      userPrompt = `Ngữ cảnh bài học: "${context || 'Chung'}"\nCâu hỏi của học viên: "${prompt}"`;
    } else {
      return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
    }

    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];

    let lastError = 'Không thể kết nối đến Gemini API';
    let rawText = '';

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 6000,
              ...(action === 'generate_roadmap' ? { responseMimeType: 'application/json' } : {})
            },
          }),
        });

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawText = data.candidates[0].content.parts[0].text;
          break;
        } else {
          lastError = data.error?.message || `Lỗi model ${model}`;
        }
      } catch (err: any) {
        lastError = err.message || `Lỗi kết nối model ${model}`;
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { error: lastError },
        { status: 500 }
      );
    }

    if (action === 'generate_roadmap') {
      try {
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : cleaned;
        
        let parsedRoadmap;
        try {
          parsedRoadmap = JSON.parse(jsonString);
        } catch (initialErr) {
          // Cố gắng tự sửa lỗi unescaped control characters hoặc newlines trong chuỗi
          const sanitized = jsonString
            .replace(/[\x00-\x1F\x7F-\x9F]/g, (c) => (c === '\n' || c === '\r' || c === '\t' ? c : ''))
            .replace(/\r?\n/g, '\\n');
          parsedRoadmap = JSON.parse(sanitized);
        }
        
        return NextResponse.json({ success: true, roadmap: parsedRoadmap });
      } catch (parseErr: any) {
        return NextResponse.json(
          { error: `Không thể đọc cấu trúc JSON do AI trả về: ${parseErr.message}`, raw: rawText },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ success: true, reply: rawText });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi nội bộ server' },
      { status: 500 }
    );
  }
}
