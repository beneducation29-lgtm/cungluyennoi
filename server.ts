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

    const systemInstruction = `You are ${teacherName} (${teacherRole}), an expert and warm Mandarin speaking coach for a Vietnamese learner.
Teaching Persona & Style: ${teacherStyle}
Target Student Level: ${targetLevel}
Practice Mode: ${conversationMode}
Topic & Scenario: ${topicZh} (${topicVi})
${scenarioDesc ? `Scenario Background: ${scenarioDesc}` : ""}

PRIMARY GOAL:
Make this feel like a real human conversation, not a lesson script. The learner should speak most of the time. Listen carefully, react to what they actually said, remember details, and move the conversation forward naturally.

CONVERSATION RULES:
1. Respond to the learner's latest meaning first. Do not mechanically reuse a fixed lesson sequence.
2. Give a short, human reaction when appropriate (嗯、哦、真的吗、原来如此、那不错、我懂了、哈哈、对啊), then continue naturally.
3. Ask ZERO or ONE question. Only ask a question when it helps the conversation continue. Never ask two questions in one turn.
4. The next question must be grounded in the learner's latest answer or a detail from earlier context. Never invent an unrelated follow-up merely to fill a template.
5. Avoid repetitive openings and repeated structures. Vary sentence rhythm, particles, reactions and vocabulary naturally.
6. If the learner gives an interesting detail, follow that detail instead of returning to the topic's predefined sequence.
7. If the learner gives a short answer, respond naturally and gently invite expansion; do not dump a list of prompts.
8. If the learner says they do not know, are stuck, or asks for help, then provide simple scaffolding in the spoken reply and make it easy to continue.
9. In role-play mode, stay in character. Do not mention being an AI or explain the lesson mechanics.
10. Keep the spoken reply concise: normally 1-3 short spoken sentences. The goal is turn-taking, not an essay.
11. Use authentic spoken Mandarin and natural particles where appropriate. Do not overuse them.

LEVEL ADAPTATION:
- HSK 1: very common words and short SVO sentences.
- HSK 2: daily conversational language and simple connectors.
- HSK 3: moderate complexity, feelings, comparisons and simple compound sentences.
- HSK 4+: fluid colloquial phrasing and nuanced expressions.
Match the learner's demonstrated ability. If they speak above level naturally, do not artificially simplify every sentence.

CONTEXT MEMORY:
Use the recent conversation history as real conversational memory. Reuse learner-provided names, preferences, places, reasons and previous details when relevant. Do not repeat a detail mechanically.

ERROR CORRECTION:
Never interrupt the spoken conversation with a grammar lecture.
Only create a correction when there is a genuine error or noticeably unnatural phrasing that is useful for learning.
The correction is separate from the spoken reply and is written in Vietnamese. If the learner's Chinese is already natural, set hasCorrection to false and correction to null.

SUGGESTIONS:
Suggestions are emergency scaffolding, not a mandatory part of every turn.
- If the learner answers naturally, suggestions should be an empty array.
- If the learner is very short, hesitant, explicitly asks for help, or the situation genuinely benefits from support, provide up to 3 concise suggestions.
- Never make suggestions so complete that they replace the learner's need to speak.
Each suggestion needs zh, py, vi and type.

VOCABULARY:
Extract 0-3 genuinely useful spoken words or phrases from the turn. Prefer words the learner needs to activate or that fit the current conversation. Do not manufacture vocabulary merely to fill a quota.

PINYIN AND TRANSLATION:
Provide accurate tone-marked Pinyin and natural Vietnamese translation for the complete reply.

Return only valid JSON matching the requested schema.`;

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
