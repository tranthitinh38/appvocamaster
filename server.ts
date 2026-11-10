import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Server-side initialization of Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION_MENTOR = `
Bạn là **Global Success 8 AI Mentor** – Một chuyên gia giáo dục AI cao cấp, được thiết kế chuyên biệt để hỗ trợ học sinh lớp 8 chinh phục chương trình tiếng Anh theo bộ sách giáo khoa "Global Success" (NXB Giáo dục Việt Nam). Bạn đóng vai trò vừa là người hướng dẫn kiến thức (Tutor), vừa là người bạn đồng hành (Learning Buddy), vận dụng các phương pháp sư phạm tiên tiến như Lặp lại ngắt quãng (Spaced Repetition), Trò chơi hóa (Gamification) và Phân tích dữ liệu cá nhân hóa.

MỤC TIÊU & NHIỆM VỤ:
1. Tối ưu hóa ghi nhớ (SRS): Nhắc nhở và kiểm tra từ vựng/ngữ pháp đúng thời điểm vàng dựa trên đường cong lãng quên của học sinh.
2. Chuẩn hóa kỹ năng nói (AI Speaking Buddy): Luyện hội thoại, chấm phát âm (IPA), trọng âm (word stress) và ngữ điệu (intonation).
3. Bám sát 12 Units của Global Success 8:
   - Unit 1: Leisure time
   - Unit 2: Life in the countryside
   - Unit 3: Teenagers
   - Unit 4: Ethnic groups of Viet Nam
   - Unit 5: Our customs and traditions
   - Unit 6: Lifestyles
   - Unit 7: Environmental protection
   - Unit 8: Shopping
   - Unit 9: Natural disasters
   - Unit 10: Communication in the future
   - Unit 11: Science and technology
   - Unit 12: Life on other planets
4. Cung cấp hệ sinh thái từ vựng đầy đủ: Nghĩa, IPA, Collocations, Synonyms/Antonyms, Word family.
5. Giọng điệu (Tone & Persona):
   - Năng động, hiện đại (Gen Z-friendly), truyền cảm hứng, kiên nhẫn.
   - Song ngữ Anh - Việt linh hoạt: Giải thích khái niệm bằng tiếng Việt dễ hiểu, khuyến khích học sinh phản hồi bằng tiếng Anh.
   - Cốt truyện (Storytelling): Dùng các thuật ngữ như "Explorer", "Nhiệm vụ hôm nay", "Thám hiểm vùng đất Unit X", "Chiến binh từ vựng".
   - Khen ngợi sự nỗ lực (Growth Mindset).

CẤU TRÚC PHẢN HỒI BẮT BUỘC (Trình bày rõ ràng bằng Markdown):
1. **Greeting & Status Update:** Chào hỏi kèm theo thông báo về tiến trình nhiệm vụ (Ví dụ: "Chào Explorer! Bạn còn 3 từ nữa để hoàn thành mục tiêu ngày hôm nay!").
2. **Main Content (Bài học/Giải đáp):**
   - **Vocabulary Card:** [Từ vựng] - [IPA] - [Nghĩa] - [Word Family] - [Collocations].
   - **Context:** [Ví dụ trong SGK] - [Ví dụ mở rộng].
   - **Visual/Audio Prompt:** [Mô tả chi tiết hình ảnh 4K cho từ này để học sinh dễ liên tưởng trực quan].
3. **Practice/Challenge:** Đưa ra 1 câu hỏi tương tác nhanh hoặc thử thách luyện nói "AI Speaking Buddy".
4. **Feedback & Correction:** Nhận xét hoặc lưu ý lỗi hay gặp của học sinh Việt Nam.
5. **Gamification Rewards:** Tổng kết điểm XP (+20 XP), streak và gợi ý thách đấu PvP!
`;

// API 1: Chat with Global Success 8 AI Mentor
app.post('/api/mentor/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, currentUnit, studentContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const conversationContext = `
Thông tin học sinh hiện tại:
- Unit đang học: ${currentUnit || 'Unit 1: Leisure Time'}
- Cấp độ/Tiến độ: ${studentContext?.level || 'Tập sự Explorer'}, Streak: ${studentContext?.streak || 3} ngày, XP: ${studentContext?.xp || 240}
- Từ vựng cần ôn hôm nay (SRS): ${studentContext?.dueWords?.join(', ') || 'nomad, picturesque, terraced field, bargain'}

Lịch sử trò chuyện trước đó:
${
  Array.isArray(history)
    ? history
        .slice(-6)
        .map((h: { role: string; content: string }) => `${h.role === 'user' ? 'Học sinh' : 'AI Mentor'}: ${h.content}`)
        .join('\n')
    : ''
}

Câu hỏi/Phản hồi của học sinh:
"${message}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContext,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MENTOR,
      },
    });

    return res.json({
      reply: response.text || 'Chào Explorer! AI Mentor luôn sẵn sàng đồng hành cùng bạn.',
      xpAwarded: 25,
    });
  } catch (error: any) {
    console.error('Mentor Chat API Error:', error);
    return res.status(500).json({
      error: 'Không thể kết nối đến AI Mentor. Vui lòng thử lại!',
      details: error?.message || 'Unknown error',
    });
  }
});

// API 2: AI Speaking Buddy Pronunciation & Intonation Analyzer
app.post('/api/speaking/analyze', async (req: Request, res: Response) => {
  try {
    const { targetText, spokenText, unitTitle } = req.body;

    if (!targetText) {
      return res.status(400).json({ error: 'Target text is required' });
    }

    const prompt = `
Bạn là AI Speaking Buddy cho học sinh lớp 8 theo SGK Global Success 8 (${unitTitle || 'Grade 8'}).
Nhiệm vụ: Đánh giá câu nói của học sinh dựa trên 3 tiêu chí cốt lõi:
1. Độ chính xác IPA (IPA accuracy)
2. Trọng âm từ (Word stress)
3. Ngữ điệu câu (Sentence intonation)

Câu mẫu SGK: "${targetText}"
Câu học sinh nói/đọc được: "${spokenText || targetText}"

Hãy phân tích chi tiết và trả về JSON chuẩn theo schema. Nhận xét bằng tiếng Việt thân thiện, khích lệ (Growth Mindset), chỉ ra chính xác âm nào người Việt hay quên (như âm đuôi /s/, /z/, /t/, /d/, hoặc trọng âm sai).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Điểm tổng thể từ 0 đến 100' },
            ipaScore: { type: Type.INTEGER, description: 'Điểm IPA từ 0 đến 100' },
            stressScore: { type: Type.INTEGER, description: 'Điểm trọng âm từ 0 đến 100' },
            intonationScore: { type: Type.INTEGER, description: 'Điểm ngữ điệu từ 0 đến 100' },
            targetIpa: { type: Type.STRING, description: 'Phiên âm IPA chuẩn của câu mẫu' },
            phoneticBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  status: { type: Type.STRING, description: 'perfect | warning | need_work' },
                  tip: { type: Type.STRING, description: 'Lưu ý về phát âm hoặc trọng âm từ này' },
                },
              },
            },
            feedbackIpa: { type: Type.STRING, description: 'Nhận xét cụ thể về âm tiết và IPA' },
            feedbackStress: { type: Type.STRING, description: 'Nhận xét về trọng âm các từ 2-3 âm tiết' },
            feedbackIntonation: { type: Type.STRING, description: 'Nhận xét về ngữ điệu lên/xuống ở cuối câu' },
            encouragement: { type: Type.STRING, description: 'Lời khen khích lệ tinh thần Explorer' },
            xpGained: { type: Type.INTEGER, description: 'Số điểm XP thưởng (20-50)' },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Speaking Analyzer Error:', error);
    return res.status(500).json({
      error: 'Lỗi phân tích phát âm AI',
      details: error?.message || 'Unknown error',
    });
  }
});

// API 3: OCR / Textbook Photo Extractor & Flashcard Creator
app.post('/api/ocr/extract', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, textInput } = req.body;

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    const extractionPrompt = `
Bạn là AI chuyên gia bóc tách tài liệu và sách giáo khoa Tiếng Anh 8 Global Success (OCR & Curriculum Extractor).
Nhiệm vụ:
1. Đọc văn bản từ hình ảnh SGK hoặc đoạn văn được cung cấp: "${textInput || ''}".
2. Nhận diện Unit hoặc chủ đề tương ứng trong 12 Units của Tiếng Anh 8 Global Success.
3. Trích xuất các từ vựng mới hoặc trọng tâm quan trọng trong bài.
4. Với mỗi từ, cung cấp:
   - Từ vựng (word)
   - Loại từ (partOfSpeech: noun, verb, adj, etc.)
   - Phiên âm IPA (ipa)
   - Nghĩa tiếng Việt (meaningVi)
   - Cụm từ hay đi kèm (collocation)
   - Gia đình từ (wordFamily: n, v, adj tương ứng)
   - Từ đồng nghĩa/trái nghĩa (synonyms, antonyms)
   - Câu ví dụ trong ngữ cảnh bài học (contextExample)
   - Mô tả hình ảnh trực quan 4K sinh động để làm Flashcard (imagePrompt4k)
   - Độ khó (difficulty: "Easy" | "Medium" | "Challenging")
5. Tạo 2 câu hỏi trắc nghiệm ôn tập nhanh dựa trên các từ vừa bóc tách.

Trả về kết quả dưới định dạng JSON theo schema đã cho.
`;

    parts.push({ text: extractionPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedUnit: { type: Type.STRING, description: 'Unit được nhận diện, vd: Unit 2: Life in the countryside' },
            summary: { type: Type.STRING, description: 'Tóm tắt nội dung trang sách vừa bóc tách' },
            extractedVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  meaningVi: { type: Type.STRING },
                  collocation: { type: Type.STRING },
                  wordFamily: { type: Type.STRING },
                  synonyms: { type: Type.STRING },
                  antonyms: { type: Type.STRING },
                  contextExample: { type: Type.STRING },
                  imagePrompt4k: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
              },
            },
            quickQuiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('OCR Extraction Error:', error);
    return res.status(500).json({
      error: 'Không thể bóc tách ảnh SGK. Vui lòng kiểm tra lại ảnh hoặc nhập văn bản.',
      details: error?.message || 'Unknown error',
    });
  }
});

// API 4: Dynamic Practice Quiz Generator (SRS & PvP Arena)
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { unitId, count = 5, mode = 'practice' } = req.body;

    const prompt = `
Tạo ${count} câu hỏi trắc nghiệm tiếng Anh lớp 8 bám sát Unit ${unitId || '1: Leisure time'} sách Global Success (NXB Giáo dục Việt Nam).
Chế độ: ${mode === 'pvp' ? 'Đấu trường PvP tốc độ cao, câu hỏi kích thích tư duy' : 'Luyện tập củng cố kiến thức'}.
Các dạng câu hỏi:
- Trọng âm / Phát âm nguyên âm
- Nghĩa từ vựng và Collocations
- Cấu trúc ngữ pháp trọng tâm của Unit
- Hoàn thành câu giao tiếp (Communication)

Trả về JSON danh sách câu hỏi.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            unit: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'vocab | grammar | pronunciation | communication' },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Quiz Generator Error:', error);
    return res.status(500).json({
      error: 'Không thể tạo bài tập trắc nghiệm',
      details: error?.message || 'Unknown error',
    });
  }
});

// Vite or Static file middleware
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Global Success 8 AI Mentor running on http://localhost:${port}`);
  });
}

setupVite();
