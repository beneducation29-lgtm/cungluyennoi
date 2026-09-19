/**
 * Speech Recognition Service
 * Uses browser Web Speech API (zh-CN) with microphone state management
 * Never stores audio recordings by default.
 */

// Define Web Speech API interface for TypeScript
interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognitionLike;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognitionLike;
    };
  }
}

class SpeechService {
  private recognition: SpeechRecognitionLike | null = null;
  private isListeningState = false;
  private currentTranscript = "";

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const rec = new SpeechRecognitionClass();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "zh-CN"; // Mandarin Chinese
        this.recognition = rec;
      } catch (e) {
        console.warn("SpeechRecognition init warning:", e);
      }
    }
  }

  public async checkMicrophonePermission(): Promise<"granted" | "denied" | "prompt" | "unsupported"> {
    if (typeof window === "undefined" || !navigator.permissions || !navigator.permissions.query) {
      return "unsupported";
    }
    try {
      // Query microphone permission if supported
      const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });
      return permissionStatus.state;
    } catch {
      return "unsupported";
    }
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (errorMsg: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onError("Trình duyệt không hỗ trợ nhận diện giọng nói Web Speech. Bạn có thể sử dụng khung gõ chữ tiếng Trung bên dưới.");
      return false;
    }

    this.currentTranscript = "";
    this.isListeningState = true;

    this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      const text = finalTranscript || interim;
      this.currentTranscript = text;
      onResult(text, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      this.isListeningState = false;
      let vietnameseError = "Đã xảy ra lỗi khi thu âm tiếng Trung.";
      
      switch (event.error) {
        case "not-allowed":
          vietnameseError = "Quyền micro bị từ chối. Vui lòng nhấn vào biểu tượng ổ khóa 🔒 trên thanh địa chỉ trình duyệt để 'Cho phép' dùng micro, hoặc dùng khung gõ chữ bên dưới.";
          break;
        case "service-not-allowed":
          vietnameseError = "Hệ thống hoặc trình duyệt không cho phép dịch vụ giọng nói. Bạn hãy sử dụng khung nhập chữ dự phòng bên dưới.";
          break;
        case "audio-capture":
          vietnameseError = "Không tìm thấy thiết bị thu âm (micro). Vui lòng kiểm tra jack cắm tai nghe hoặc thiết bị micro của máy tính.";
          break;
        case "no-speech":
          vietnameseError = "Chưa nhận thấy âm thanh tiếng Trung. Vui lòng nhấn micro và thử nói lại.";
          break;
        case "network":
          vietnameseError = "Mạng yếu hoặc không thể kết nối dịch vụ nhận dạng tiếng Trung. Bạn có thể gõ câu tiếng Trung vào khung bên dưới.";
          break;
        case "aborted":
          // User or system intentionally cancelled
          return;
        default:
          vietnameseError = `Lỗi nhận diện (${event.error}). Bạn có thể sử dụng khung gõ chữ bên dưới.`;
      }
      onError(vietnameseError);
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
      onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Recognition start error:", err);
      this.isListeningState = false;
      onError("Không thể khởi động micro. Vui lòng thử lại hoặc gõ chữ.");
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListeningState) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
      this.isListeningState = false;
    }
  }

  public abortListening() {
    if (this.recognition && this.isListeningState) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn("Error aborting recognition:", e);
      }
      this.isListeningState = false;
    }
  }

  public getTranscript(): string {
    return this.currentTranscript;
  }

  public isListening(): boolean {
    return this.isListeningState;
  }
}

export const speechService = new SpeechService();
