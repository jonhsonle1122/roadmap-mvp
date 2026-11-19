import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, prompt, topic, context } = await req.json();
    const apiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Chưa có GEMINI_API_KEY. Vui lòng cấu hình biến môi trường GEMINI_API_KEY trong file .env.local hoặc trên Vercel.',
        },
        { status: 400 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
          "content": "Nội dung chi tiết bằng Markdown có đề mục, giải thích kỹ",
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
      userPrompt = `Hãy tạo lộ trình học hoàn chỉnh cho chủ đề: "${topic || prompt}". Tạo 3-4 chuyên mục, mỗi chuyên mục 2-3 bài học thực chiến.`;
    } else if (action === 'ask_tutor') {
      systemInstruction = `Bạn là trợ giảng AI thông minh, hỗ trợ giải đáp thắc mắc về kỹ thuật lập trình và thiết kế hệ thống theo ngữ cảnh bài học.
Hãy giải thích ngắn gọn, dễ hiểu bằng tiếng Việt, có ví dụ minh họa và nêu rõ các đánh đổi (trade-offs).`;
      userPrompt = `Ngữ cảnh bài học: "${context || 'Chung'}"\nCâu hỏi của học viên: "${prompt}"`;
    } else {
      return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Lỗi khi gọi Gemini API' },
        { status: response.status }
      );
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (action === 'generate_roadmap') {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedRoadmap = JSON.parse(cleaned);
      return NextResponse.json({ success: true, roadmap: parsedRoadmap });
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
