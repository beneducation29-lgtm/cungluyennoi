import {
  AITeacher,
  ChineseLevel,
  ConversationMode,
  FollowUpQuestion,
  Message,
  SentenceCorrection,
  SuggestedReply,
  Topic,
  VocabularyItem,
} from "../types";
import { DEMO_SCENARIO_DATA, GENERAL_DEMO_RESPONSES } from "../data/demoConversations";

export interface AIResponsePayload {
  reply: string;
  pinyin: string;
  translation: string;
  question?: string;
  correction?: SentenceCorrection;
  vocabulary: VocabularyItem[];
  followUpQuestion?: FollowUpQuestion;
  suggestions?: SuggestedReply[];
  difficultyFeedback?: string;
  difficulty?: string;
  isDemo: boolean;
  statusNotice?: string;
}

class GeminiService {
  private turnCounter = 0;

  /**
   * Check if Gemini API is configured and accessible on the server
   */
  public async checkApiStatus(): Promise<{ available: boolean; hasKey: boolean; model?: string }> {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        return {
          available: true,
          hasKey: Boolean(data.hasGeminiKey),
          model: data.model || "gemini-3.8-flash",
        };
      }
    } catch {
      // Dev server starting or network offline
    }
    return { available: false, hasKey: false };
  }

  /**
   * Validate raw response data before using it in the application
   */
  private isValidResponseData(data: any): boolean {
    if (!data || typeof data !== "object") return false;
    if (typeof data.reply !== "string" || !data.reply.trim()) return false;
    if (typeof data.pinyin !== "string" || !data.pinyin.trim()) return false;
    if (typeof data.translation !== "string" || !data.translation.trim()) return false;
    return true;
  }

  /**
   * Request teacher's response from Gemini backend with seamless Demo fallback
   */
  public async generateTeacherReply(params: {
    studentMessage: string;
    messages: Message[];
    teacher: AITeacher;
    topic: Topic;
    level: ChineseLevel;
    mode: ConversationMode;
    forceDemo?: boolean;
  }): Promise<AIResponsePayload> {
    const { studentMessage, messages, teacher, topic, level, mode, forceDemo } = params;

    // If Demo Mode forced by user, return local deterministic scenario simulation immediately
    if (forceDemo) {
      return this.simulateDemoReply(studentMessage, topic, teacher, level);
    }

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentMessage,
          messages,
          teacher,
          topic,
          level,
          mode,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && this.isValidResponseData(json.data)) {
          const d = json.data;

          // Parse and sanitize grammar correction
          let correctionItem: SentenceCorrection | undefined = undefined;
          if (
            d.hasCorrection &&
            d.correction &&
            typeof d.correction === "object" &&
            d.correction.corrected &&
            typeof d.correction.corrected === "string" &&
            d.correction.corrected.trim() !== ""
          ) {
            correctionItem = {
              id: "corr-" + Date.now(),
              original:
                d.correction.original && typeof d.correction.original === "string" && d.correction.original.trim()
                  ? d.correction.original.trim()
                  : studentMessage,
              corrected: d.correction.corrected.trim(),
              pinyin: d.correction.pinyin ? String(d.correction.pinyin).trim() : "",
              explanation: d.correction.explanation
                ? String(d.correction.explanation).trim()
                : "Cách diễn đạt tự nhiên và chuẩn ngữ pháp hơn.",
              errorType: d.correction.errorType ? String(d.correction.errorType).trim() : "Ngữ pháp (Grammar)",
              timestamp: Date.now(),
            };
          }

          // Parse and sanitize vocabulary items with HSK level tags and flashcard metadata
          const vocabItems: VocabularyItem[] = [];
          if (Array.isArray(d.vocabulary)) {
            d.vocabulary.forEach((v: any, idx: number) => {
              if (v && typeof v.word === "string" && v.word.trim()) {
                const word = v.word.trim();
                vocabItems.push({
                  id: `vocab-${Date.now()}-${idx}`,
                  word,
                  pinyin: v.pinyin ? String(v.pinyin).trim() : "",
                  meaning: v.meaning ? String(v.meaning).trim() : "",
                  meaningVi: v.meaning ? String(v.meaning).trim() : "",
                  saved: false,
                  hskLevel: v.hskLevel ? String(v.hskLevel).trim() : level,
                  exampleSentence: v.exampleSentence ? String(v.exampleSentence).trim() : undefined,
                  exampleZh: v.exampleSentence ? String(v.exampleSentence).trim() : undefined,
                  examplePy: v.examplePinyin ? String(v.examplePinyin).trim() : undefined,
                  exampleVi: v.exampleTranslation ? String(v.exampleTranslation).trim() : undefined,
                  topic: topic.chineseTitle || topic.vietnameseTitle,
                  ...(v.partOfSpeech ? { partOfSpeech: v.partOfSpeech } : {}),
                  ...(v.reason ? { reason: v.reason } : {}),
                  ...(v.priority ? { priority: v.priority } : {}),
                } as any);
              }
            });
          }

          // Extract single question if provided inside or with reply
          let singleQuestion: string | undefined = undefined;
          if (d.question && typeof d.question === "string" && d.question.trim()) {
            singleQuestion = d.question.trim();
          }

          // Parse suggestions for next student turn (conversation recovery)
          const suggestionsList: SuggestedReply[] = [];
          if (Array.isArray(d.suggestions)) {
            d.suggestions.forEach((s: any) => {
              if (s && typeof s.zh === "string" && s.zh.trim()) {
                suggestionsList.push({
                  zh: s.zh.trim(),
                  py: s.py ? String(s.py).trim() : "",
                  vi: s.vi ? String(s.vi).trim() : "",
                  type: s.type || "simple",
                });
              }
            });
          }

          return {
            reply: d.reply.trim(),
            pinyin: d.pinyin.trim(),
            translation: d.translation.trim(),
            question: singleQuestion,
            correction: correctionItem,
            vocabulary: vocabItems,
            followUpQuestion: undefined,
            suggestions: suggestionsList.length > 0 ? suggestionsList : undefined,
            difficultyFeedback: d.difficultyFeedback ? String(d.difficultyFeedback).trim() : undefined,
            difficulty: d.difficulty || level,
            isDemo: false,
          };
        } else if (json.isDemo && json.error) {
          console.warn("Server indicated fallback to Demo Mode:", json.error);
        }
      }
    } catch (err) {
      console.warn("Backend Gemini chat failed, falling back to Demo Mode:", err);
    }

    // Fallback to rich Demo Mode simulation
    const fallback = this.simulateDemoReply(studentMessage, topic, teacher, level);
    fallback.statusNotice = "Đang dùng phản hồi mẫu (Demo) do mạng hoặc quá tải tạm thời.";
    return fallback;
  }

  /**
   * High-quality deterministic/contextual demo response simulator
   */
  public simulateDemoReply(
    studentMessage: string,
    topic: Topic,
    _teacher: AITeacher,
    level: ChineseLevel
  ): AIResponsePayload {
    this.turnCounter++;

    // Check if student expressed being stuck
    const lowerInput = studentMessage.toLowerCase();
    const isStuck =
      lowerInput.includes("không biết") ||
      lowerInput.includes("bí từ") ||
      lowerInput.includes("help") ||
      lowerInput.includes("bù zhīdào") ||
      lowerInput.includes("不知道") ||
      lowerInput.includes("不懂");

    if (isStuck) {
      return {
        reply: "没关系，慢慢来！不用紧张。你可以试着说：“我想喝茶” 或者问我：“有什么推荐吗？”。你选哪一个？",
        pinyin: "Méi guānxi, mànman lái! Bú yòng jǐnzhāng. Nǐ kěyǐ shì zhe shuō: 'Wǒ xiǎng hē chá' huòzhě wèn wǒ: 'Yǒu shénme tuījiàn ma?'. Nǐ xuǎn nǎ yí gè?",
        translation: "Không sao cả, từ từ nhé! Đừng căng thẳng. Bạn có thể thử nói: 'Tôi muốn uống trà' hoặc hỏi tôi: 'Có món gì gợi ý không?'. Bạn chọn câu nào?",
        question: "你选哪一个？",
        suggestions: [
          {
            zh: "我想喝茶。",
            py: "Wǒ xiǎng hē chá.",
            vi: "Tôi muốn uống trà.",
            type: "simple",
          },
          {
            zh: "请问有什么好喝的推荐吗？",
            py: "Qǐngwèn yǒu shénme hǎohē de tuījiàn ma?",
            vi: "Cho hỏi có món gì ngon để gợi ý không?",
            type: "detailed",
          },
          {
            zh: "老师，这句话用中文怎么说？",
            py: "Lǎoshī, zhè jù huà yòng Zhōngwén zěnme shuō?",
            vi: "Thưa cô, câu này tiếng Trung nói thế nào?",
            type: "question",
          },
        ],
        vocabulary: [
          {
            id: "v_stuck1",
            word: "没关系",
            pinyin: "méi guānxi",
            meaning: "không sao, không hề gì",
            saved: false,
            hskLevel: "HSK 1",
            partOfSpeech: "Thành ngữ/Cụm từ",
            reason: "Mẫu câu an ủi, hồi đáp lịch sự rất phổ biến",
            priority: "high",
          } as any,
          {
            id: "v_stuck2",
            word: "慢慢来",
            pinyin: "mànman lái",
            meaning: "từ từ, chầm chậm thôi",
            saved: false,
            hskLevel: "HSK 2",
            partOfSpeech: "Cụm động từ",
            reason: "Khẩu ngữ động viên thân mật",
            priority: "medium",
          } as any,
          {
            id: "v_stuck3",
            word: "推荐",
            pinyin: "tuījiàn",
            meaning: "đề xuất, giới thiệu",
            saved: false,
            hskLevel: "HSK 3",
            partOfSpeech: "Động từ",
            reason: "Từ vựng thông dụng khi hỏi ý kiến hoặc yêu cầu gợi ý",
            priority: "high",
          } as any,
        ],
        difficultyFeedback: "Giáo viên luôn hỗ trợ gợi mở khi bạn chưa biết cách diễn đạt. Cứ tự nhiên nhé!",
        difficulty: level,
        isDemo: true,
      };
    }

    // Contextual Demo: Weekend activities / Friends / Movies (Core scenario in specification)
    if (
      lowerInput.includes("电影") ||
      lowerInput.includes("看电影") ||
      lowerInput.includes("朋友") ||
      lowerInput.includes("一起") ||
      lowerInput.includes("phim")
    ) {
      return {
        reply: "太棒了！和朋友一起看电影是一种很舒适的放松方式。你平时喜欢看什么类型的电影？喜剧片还是动作片？",
        pinyin: "Tài bàng le! Hé péngyou yìqǐ kàn diànyǐng shì yì zhǒng hěn shūshi de fàngsōng fāngshì. Nǐ píngshí xǐhuan kàn shénme lèixíng de diànyǐng? Xǐjùpiàn háishi dòngzuòpiàn?",
        translation: "Tuyệt quá! Cùng bạn bè đi xem phim là một cách thư giãn rất thoải mái. Thường ngày bạn thích xem thể loại phim nào? Phim hài hay phim hành động?",
        question: "你平时喜欢看什么类型的电影？喜剧片还是动作片？",
        suggestions: [
          {
            zh: "我比较喜欢看喜剧片，很搞笑。",
            py: "Wǒ bǐjiào xǐhuan kàn xǐjùpiàn, hěn gǎoxiào.",
            vi: "Tôi thích xem phim hài kịch hơn, rất buồn cười.",
            type: "simple",
          },
          {
            zh: "我和朋友经常去市中心的电影院。",
            py: "Wǒ hé péngyou jīngcháng qù shìzhōngxīn de diànyǐngyuàn.",
            vi: "Tôi và bạn bè thường đến rạp chiếu phim ở trung tâm thành phố.",
            type: "detailed",
          },
          {
            zh: "老师，你有什么好看的中国电影推荐吗？",
            py: "Lǎoshī, nǐ yǒu shénme hǎokàn de Zhōngguó diànyǐng tuījiàn ma?",
            vi: "Cô ơi, cô có phim Trung Quốc nào hay để giới thiệu không?",
            type: "question",
          },
        ],
        vocabulary: [
          {
            id: "v_demo_friend",
            word: "朋友",
            pinyin: "péngyou",
            meaning: "bạn bè",
            saved: false,
            hskLevel: "HSK 1",
            exampleSentence: "我喜欢和朋友一起看电影。",
            examplePy: "Wǒ xǐhuan hé péngyou yìqǐ kàn diànyǐng.",
            exampleVi: "Tôi thích cùng bạn bè đi xem phim.",
            partOfSpeech: "Danh từ",
            reason: "Từ vựng cốt lõi thường dùng nhất về các mối quan hệ hàng ngày",
            priority: "high",
          } as any,
          {
            id: "v_demo_together",
            word: "一起",
            pinyin: "yìqǐ",
            meaning: "cùng nhau",
            saved: false,
            hskLevel: "HSK 2",
            exampleSentence: "我们一起去吃晚饭吧。",
            examplePy: "Wǒmen yìqǐ qù chī wǎnfàn ba.",
            exampleVi: "Chúng mình cùng đi ăn tối nhé.",
            partOfSpeech: "Phó từ",
            reason: "Phó từ chỉ sự đồng hành kết hợp hành động cực kỳ quan trọng",
            priority: "high",
          } as any,
          {
            id: "v_demo_movie",
            word: "电影",
            pinyin: "diànyǐng",
            meaning: "phim, điện ảnh",
            saved: false,
            hskLevel: "HSK 1",
            exampleSentence: "这部中国电影很有意思。",
            examplePy: "Zhè bù Zhōngguó diànyǐng hěn yǒu yìsi.",
            exampleVi: "Bộ phim Trung Quốc này rất thú vị.",
            partOfSpeech: "Danh từ",
            reason: "Từ vựng thiết yếu về giải trí và hoạt động thư giãn",
            priority: "high",
          } as any,
        ],
        difficultyFeedback: "Cách diễn đạt của bạn rất tự nhiên! Tiếp tục phát huy nhé.",
        difficulty: level,
        isDemo: true,
      };
    }

    // Contextual Demo: Coffee / Cafe
    if (lowerInput.includes("咖啡") || lowerInput.includes("cà phê") || lowerInput.includes("coffee")) {
      return {
        reply: "我也很喜欢喝咖啡！一杯浓郁的咖啡能让人精神充沛。你喜欢美式咖啡还是拿铁咖啡？",
        pinyin: "Wǒ yě hěn xǐhuan hē kāfēi! Yì bēi nóngyù de kāfēi néng ràng rén jīngshén chōngpèi. Nǐ xǐhuan Měishì kāfēi háishi Nátiě kāfēi?",
        translation: "Tôi cũng rất thích uống cà phê! Một ly cà phê đậm đà giúp tinh thần sảng khoái. Bạn thích cà phê Americano hay Latte?",
        question: "你喜欢美式咖啡还是拿铁咖啡？",
        suggestions: [
          {
            zh: "我更喜欢喝冰拿铁。",
            py: "Wǒ gèng xǐhuan hē bīng nátiě.",
            vi: "Tôi thích uống latte đá hơn.",
            type: "simple",
          },
          {
            zh: "每天早上我都要喝一杯黑咖啡。",
            py: "Měitiān zǎoshang wǒ dōu yào hē yì bēi hēi kāfēi.",
            vi: "Mỗi buổi sáng tôi đều phải uống một ly cà phê đen.",
            type: "detailed",
          },
          {
            zh: "请问中国年轻人平时常喝什么咖啡？",
            py: "Qǐngwèn Zhōngguó niánqīngrén píngshí cháng hē shénme kāfēi?",
            vi: "Cho hỏi giới trẻ Trung Quốc thường hay uống cà phê gì?",
            type: "question",
          },
        ],
        vocabulary: [
          {
            id: "v_demo_coffee",
            word: "咖啡",
            pinyin: "kāfēi",
            meaning: "cà phê",
            saved: false,
            hskLevel: "HSK 2",
            exampleSentence: "你想喝冰咖啡还是热咖啡？",
            examplePy: "Nǐ xiǎng hē bīng kāfēi háishi rè kāfēi?",
            exampleVi: "Bạn muốn uống cà phê đá hay cà phê nóng?",
            partOfSpeech: "Danh từ",
            reason: "Từ vựng đồ uống thông dụng nhất trong sinh hoạt và gặp gỡ",
            priority: "high",
          } as any,
        ],
        difficultyFeedback: "Chủ đề thức uống rất thiết thực cho giao tiếp đời thường.",
        difficulty: level,
        isDemo: true,
      };
    }

    const topicSteps = DEMO_SCENARIO_DATA[topic.id];

    if (topicSteps && topicSteps.length > 0) {
      const stepIndex = (this.turnCounter - 1) % topicSteps.length;
      const step = topicSteps[stepIndex];
      return {
        reply: step.reply,
        pinyin: step.pinyin,
        translation: step.translation,
        correction: step.correction,
        vocabulary: step.vocabulary,
        followUpQuestion: undefined,
        suggestions: step.suggestions,
        difficultyFeedback: step.difficultyFeedback,
        difficulty: level,
        isDemo: true,
      };
    }

    // General fallback response
    const genIndex = (this.turnCounter - 1) % GENERAL_DEMO_RESPONSES.length;
    const gen = GENERAL_DEMO_RESPONSES[genIndex];
    return {
      reply: gen.reply,
      pinyin: gen.pinyin,
      translation: gen.translation,
      vocabulary: gen.vocabulary,
      followUpQuestion: undefined,
      suggestions: gen.suggestions,
      difficulty: level,
      isDemo: true,
    };
  }

  public resetTurnCounter() {
    this.turnCounter = 0;
  }
}

export const geminiService = new GeminiService();
