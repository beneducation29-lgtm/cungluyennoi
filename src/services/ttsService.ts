/**
 * Text-to-Speech Service
 * Uses browser SpeechSynthesis for high-quality Mandarin (zh-CN) pronunciation.
 * Supports configurable speeds: 0.75x, 1x, 1.25x, 1.5x.
 */

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedChineseVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const allVoices = this.synth.getVoices();
    this.cachedChineseVoices = allVoices.filter(
      (v) => v.lang.startsWith("zh") || v.lang.includes("cmn") || v.lang.includes("Chinese")
    );
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public getChineseVoices(): SpeechSynthesisVoice[] {
    if (this.cachedChineseVoices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.cachedChineseVoices;
  }

  public speakChinese(
    text: string,
    options: {
      speed?: number;
      voiceGender?: "female" | "male";
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    } = {}
  ) {
    if (!this.synth) {
      if (options.onError) {
        options.onError("Trình duyệt không hỗ trợ phát âm tự động (SpeechSynthesis).");
      }
      return;
    }

    this.stopSpeaking();

    // Clean any pinyin / markdown inside text if mixed
    const cleanText = text.replace(/\[.*?\]/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "zh-CN";
    utterance.rate = options.speed || 1.0;
    utterance.pitch = options.voiceGender === "female" ? 1.05 : 0.95;

    // Pick best Chinese voice if available
    const voices = this.getChineseVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => 
        v.lang === "zh-CN" || v.lang.startsWith("zh-CN") || v.name.toLowerCase().includes("mandarin")
      ) || voices[0];
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (e.error !== "canceled" && options.onError) {
        options.onError("Lỗi phát âm: " + e.error);
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (err) {
        console.warn("TTS cancel error:", err);
      }
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }
}

export const ttsService = new TTSService();
