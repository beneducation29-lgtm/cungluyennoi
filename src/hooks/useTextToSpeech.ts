import { useState, useCallback, useEffect } from "react";
import { ttsService } from "../services/ttsService";

export function useTextToSpeech(initialSpeed: number = 1.0) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(initialSpeed);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(ttsService.isSupported());
  }, []);

  const speak = useCallback(
    (
      text: string,
      options: {
        speed?: number;
        voiceGender?: "female" | "male";
        onEnd?: () => void;
        onError?: (err: string) => void;
      } = {}
    ) => {
      setIsSpeaking(true);
      ttsService.speakChinese(text, {
        speed: options.speed || speechSpeed,
        voiceGender: options.voiceGender,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          if (options.onEnd) options.onEnd();
        },
        onError: (err) => {
          setIsSpeaking(false);
          if (options.onError) options.onError(err);
        },
      });
    },
    [speechSpeed]
  );

  const stop = useCallback(() => {
    ttsService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    speechSpeed,
    setSpeechSpeed,
    isSupported,
    speak,
    stop,
  };
}
