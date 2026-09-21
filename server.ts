import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Check API status & capabilities
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    appName: "中文AI口语室 - Chinese AI Speaking Room",
    hasGeminiKey: hasKey,
    model: "gemini-3.8-flash",
  });
});

// Gemini Chat endpoint for AI speaking practice
app.post("/api/gemini/chat", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(200).json({
      success: false,
      isDemo: true,
      error: "GEMINI_API_KEY chưa được cấu hình. Hệ thống sẽ tự động dùng Chế độ Demo.",
    });
  }

  try {
    const { teacher, level, mode, topic, messages, studentMessage } = req.body;

    if (!studentMessage || typeof studentMessage !== "string") {
      return res.status(400).json({
        success: false,
        error: "studentMessage is required",
      });
    }

    const teacherName = teacher?.name || "林老师";
    const teacherRole = teacher?.role || "Friendly Mandarin Teacher";
    const teacherStyle = teacher?.teachingStyle || "Kiên nhẫn, nhiệt tình, sửa lỗi tự nhiên, khuyến khích học viên nói.";
    const targetLevel = level || "HSK 2";
    const topicZh = topic?.chineseTitle || "日常生活";
    const topicVi = topic?.vietnameseTitle || "Cuộc sống hàng ngày";
    const scenarioDesc = topic?.scenarioDescription || topic?.description || "";
    const conversationMode = mode === "roleplay" ? "情景角色扮演 (Situational Role Play)" : mode === "hsk" ? "HSK考级口语训练 (HSK Speaking Prep)" : "自由口语交流 (Free Talk)";

    const systemInstruction = `You are ${teacherName} (${teacherRole}), an expert, highly encouraging Mandarin Chinese speaking coach for a Vietnamese learner.
Teaching Persona & Style: ${teacherStyle}
Target Student Level: ${targetLevel}
Practice Mode: ${conversationMode}
Topic & Scenario: ${topicZh} (${topicVi})
${scenarioDesc ? `Scenario Background: ${scenarioDesc}` : ""}

CORE PEDAGOGICAL PHILOSOPHY:
You are not a dry informational chatbot. You are an authentic Mandarin speaking teacher and situational role-play partner whose #1 goal is maximizing LEARNER PARTICIPATION (student speaks 70-80% of the time).

CRITICAL RULES:
1. STRICT TURN-BY-TURN SINGLE-QUESTION CONVERSATION FLOW:
   - In each turn, provide your response in "reply".
   - The conversation flow MUST be strictly turn-by-turn:
     Step a: Understand what the student said in their message ("${studentMessage}").
     Step b: Give a brief, natural reaction or acknowledgment to the student's answer (1 short sentence).
     Step c: Ask at most ONE natural question directly based on what the student just answered to continue the dialogue.
   - MANDATORY: Each AI turn has at most ONE question in total.
   - The question MUST be part of "reply" at the end.
   - "question": The exact single question string inside "reply" (or empty if no question).
   - STRICTLY FORBIDDEN: Do NOT create any second or pre-generated follow-up question outside "reply".
   - AI MUST wait for the user to answer before creating the next question.
   - The next question must be based on the student's answer, not an unrelated pre-set list.
   - Speak natural, authentic spoken Mandarin Chinese (口语).
   - Use common spoken particles naturally (好的、嗯、对、呢、吧、呀、哦、哎).
   - If in Role Play mode (${conversationMode}), STAY COMPLETELY IN CHARACTER inside "reply" (e.g. barista, hotel front desk, doctor, friend, shop owner). Do NOT break character.

2. HSK-AWARE DIFFICULTY ADAPTATION:
   - Calibrate vocabulary and grammar strictly to ${targetLevel}:
     * HSK 1: Very simple SVO patterns (4-10 words). Use high-frequency words (你, 我, 他, 吃, 喝, 喜欢, 去, 多少, 什么, 很好, 太...了).
     * HSK 2: Daily conversational phrases (8-14 words). Basic connectors (因为...所以, 虽然...但是, 想, 可以, 会, 已经, 正在).
     * HSK 3: Moderate complexity, feelings, simple compound sentences (如果...就, 只要...就), directional verbs (走进去, 拿出来), comparisons (A比B...).
     * HSK 4+: Fluid colloquial phrasing, nuanced expressions, conjunctions (不仅...而且, 无论...都), idiomatic collocations.
   - If the student gives very short or hesitant 1-2 word answers, gently simplify (scaffolding). If the student demonstrates strong fluency, elevate your phrasing slightly.

3. CONTEXT MEMORY:
   - Remember details the student mentioned earlier in the conversation (their name, preferences, tastes, profession, previous answers).
   - Naturally weave these details back into the conversation to build authentic continuity and rapport.

4. NON-INTRUSIVE ERROR CORRECTION (DO NOT INTERRUPT):
   - The spoken "reply" MUST NOT interrupt the conversation with a lecture on grammar! The spoken "reply" responds to the student's meaning warmly and naturally, continuing the scenario.
   - If the student made a genuine grammatical mistake, word order error (e.g., placing time/place after verb), wrong measure word (个 vs 杯/件/张), or unnatural phrasing in their Chinese utterance ("${studentMessage}"):
     * Provide constructive pedagogical feedback in the "correction" object.
     * "original": student's exact phrase.
     * "corrected": natural, native Chinese sentence.
     * "pinyin": accurate Pinyin with tone marks for the corrected sentence.
     * "explanation": clear, warm explanation written in VIETNAMESE explaining WHY it was corrected and the grammar rule to remember.
     * "errorType": one of "Trật tự từ (Word Order)", "Lượng từ (Measure Word)", "Ngữ pháp (Grammar)", "Dùng từ (Vocabulary)", "Khẩu ngữ (Spoken Nuance)".
   - If the student spoke well or the phrasing is acceptable in colloquial spoken Chinese:
     * Set "hasCorrection" to false and set "correction" to null. NEVER make trivial or unnecessary corrections.

5. CONVERSATION RECOVERY & QUICK-REPLY SUGGESTIONS:
   - If the student indicates they don't know what to say (e.g., "我不知道", "不懂", "bù zhīdào", "bí từ", "help", silence, or hesitation):
     * In your spoken "reply", be warm and reassuring: "没关系，慢慢来！你可以这样回答... (Không sao đâu, từ từ nhé!)".
     * Offer 2 simple choices to guide them back into the conversation.
   - In EVERY turn, provide 3 practical "suggestions" for what the student could say next to answer the question:
     * Option 1 ("simple"): An easy, short response strictly within ${targetLevel}.
     * Option 2 ("detailed"): A slightly longer, more expressive response.
     * Option 3 ("question"): A natural follow-up question or clarification back to the teacher (e.g., "请问...是什么意思？", "你觉得呢？").
     * Each suggestion MUST have "zh" (Chinese characters), "py" (Pinyin with tones), and "vi" (Vietnamese meaning).

6. USEFUL VOCABULARY EXTRACTION FOR AUTOMATIC FLASHCARDS:
   - Extract 1 to 3 high-value, practical vocabulary words or phrases from this conversational turn.
   - PRIORITIZE:
     * High-frequency, authentic spoken vocabulary relevant to "${topicZh}".
     * Words appropriate to ${targetLevel} that expand the learner's active spoken vocabulary.
     * Words the student struggled with (e.g., hesitated, asked for, or misused).
   - AVOID automatically adding:
     * Obvious beginner words (e.g., 我, 你, 他, 是, 的, 好, 了, 不).
     * Single digits, names of specific people, pure punctuation.
   - For each extracted word, provide:
     * "word": Simplified Chinese characters (Hanzi).
     * "pinyin": Accurate Pinyin with tone marks.
     * "meaning": Concise Vietnamese translation.
     * "exampleSentence": Authentic short example sentence in Chinese using the word.
     * "examplePinyin": Pinyin with tone marks for the example sentence.
     * "exampleTranslation": Vietnamese translation of the example sentence.
     * "hskLevel": HSK level (e.g., HSK 1, HSK 2, HSK 3).
     * "partOfSpeech": Part of speech in Vietnamese (e.g., Danh từ, Động từ, Tính từ, Lượng từ, Phó từ).
     * "reason": Pedagogical reason why this word is useful (e.g., "Từ vựng thông dụng trong giao tiếp hàng ngày về chủ đề ${topicVi}").
     * "priority": "high" (essential topic/struggle word), "medium" (good conversational word), or "low" (optional).

7. ACCURATE PINYIN & NATURAL VIETNAMESE:
   - Provide accurate tone-marked Pinyin for your entire "reply".
   - Provide natural, idiomatic Vietnamese translation for your entire "reply".

You MUST respond strictly with a valid JSON object matching the requested schema.`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Build context contents from recent conversation turns (up to 12 turns for rich context memory)
    const conversationHistory = Array.isArray(messages) ? messages : [];
    const contextPrompt = conversationHistory.slice(-12).map((m: { role: string; chinese: string }) => 
      `${m.role === "user" ? "Student" : teacherName}: ${m.chinese}`
    ).join("\n");

    const prompt = `Topic & Scenario: ${topicZh} (${topicVi})
Student Target Level: ${targetLevel}
Practice Mode: ${conversationMode}

Recent Conversation History:
${contextPrompt ? contextPrompt : "(Start of conversation)"}

Student says: "${studentMessage}"

Respond as ${teacherName} in valid JSON matching the schema:`;

    let response;
    let lastError: unknown;
    // Use gemini-3.8-flash for high quality reasoning, fast conversational speed and strict JSON adherence
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING, description: "Authentic Chinese response in simplified characters. A short reaction followed by at most ONE question based directly on student's answer." },
                pinyin: { type: Type.STRING, description: "Accurate Pinyin with tone marks for the full reply" },
                translation: { type: Type.STRING, description: "Natural Vietnamese translation of the full reply" },
                question: { type: Type.STRING, description: "The single question asked in reply (must be part of reply), or empty string if no question" },
                hasCorrection: { type: Type.BOOLEAN, description: "True only if student made a real mistake that was corrected" },
                correction: {
                  type: Type.OBJECT,
                  description: "Pedagogical correction object if hasCorrection is true, else empty or null",
                  properties: {
                    original: { type: Type.STRING, description: "Original student sentence" },
                    corrected: { type: Type.STRING, description: "More natural or corrected Chinese sentence" },
                    pinyin: { type: Type.STRING, description: "Pinyin for corrected sentence" },
                    explanation: { type: Type.STRING, description: "Explanation in friendly Vietnamese" },
                    errorType: { type: Type.STRING, description: "Category of error in Vietnamese, e.g. Trật tự từ, Lượng từ, Ngữ pháp, Dùng từ" },
                  },
                },
                suggestions: {
                  type: Type.ARRAY,
                  description: "3 smart suggestions for what the student could say next to answer the question",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      zh: { type: Type.STRING, description: "Suggested response in Chinese" },
                      py: { type: Type.STRING, description: "Pinyin with tone marks" },
                      vi: { type: Type.STRING, description: "Vietnamese meaning" },
                      type: { type: Type.STRING, description: "simple, detailed, or question" },
                    },
                    required: ["zh", "py", "vi"],
                  },
                },
                vocabulary: {
                  type: Type.ARRAY,
                  description: "1-3 key vocabulary words or phrases extracted from this exchange for automatic flashcards",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING, description: "Chinese word or phrase (Hanzi)" },
                      pinyin: { type: Type.STRING, description: "Accurate Pinyin with tones" },
                      meaning: { type: Type.STRING, description: "Vietnamese meaning" },
                      exampleSentence: { type: Type.STRING, description: "Natural example sentence in Chinese" },
                      examplePinyin: { type: Type.STRING, description: "Pinyin for example sentence" },
                      exampleTranslation: { type: Type.STRING, description: "Vietnamese translation of example sentence" },
                      hskLevel: { type: Type.STRING, description: "HSK level tag, e.g. HSK 1, HSK 2, HSK 3" },
                      partOfSpeech: { type: Type.STRING, description: "Part of speech (Danh từ, Động từ, Tính từ, v.v.)" },
                      reason: { type: Type.STRING, description: "Why this word was selected for the learner" },
                      priority: { type: Type.STRING, description: "high, medium, or low" },
                    },
                    required: ["word", "pinyin", "meaning"],
                  },
                },
                difficultyFeedback: { type: Type.STRING, description: "Short encouragement or adaptive feedback in Vietnamese" },
                difficulty: { type: Type.STRING, description: "Target level, e.g. HSK 2" },
              },
              required: ["reply", "pinyin", "translation", "vocabulary", "suggestions"],
            },
          },
        });
        if (response && response.text) break;
      } catch (e) {
        lastError = e;
        console.warn(`Model ${modelName} call failed, trying next candidate:`, e);
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to generate content after retry");
    }

    const text = response.text;
    if (!text) {
      throw new Error("Empty response returned from Gemini API");
    }

    const parsedData = JSON.parse(text);

    // Validate essential fields
    if (!parsedData.reply || !parsedData.pinyin || !parsedData.translation) {
      throw new Error("Missing essential fields in Gemini response");
    }

    return res.json({
      success: true,
      data: parsedData,
      isDemo: false,
    });
  } catch (err: unknown) {
    console.error("Gemini API error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    return res.status(200).json({
      success: false,
      isDemo: true,
      error: `Lỗi kết nối Gemini: ${errorMessage}. Hệ thống tự động chuyển sang chế độ Demo.`,
    });
  }
});

// Setup Vite or Static File Serving
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`中文AI口语室 server running at http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
