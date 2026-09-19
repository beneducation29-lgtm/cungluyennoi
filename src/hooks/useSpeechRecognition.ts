import { useState, useCallback, useEffect, useRef } from "react";
import { speechService } from "../services/speechService";
import { audioWaveformService } from "../services/audioWaveformService";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([0.2, 0.4, 0.6, 0.3, 0.5, 0.7, 0.4, 0.2]);

  const finalCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    setIsSupported(speechService.isSupported());
    return () => {
      // Clean up any active audio stream when unmounted
      audioWaveformService.stopVisualizer();
    };
  }, []);

  const stopListening = useCallback(() => {
    speechService.stopListening();
    audioWaveformService.stopVisualizer();
    setIsListening(false);
  }, []);

  const startListening = useCallback((onFinalText?: (text: string) => void) => {
    setErrorMessage(null);
    setTranscript("");
    setInterimTranscript("");
    if (onFinalText) {
      finalCallbackRef.current = onFinalText;
    }

    // Start live microphone frequency analyzer purely for visual waveform
    audioWaveformService.startVisualizer((_volume, freqs) => {
      if (freqs && freqs.length > 0) {
        setWaveformLevels(freqs);
      }
    });

    const started = speechService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimTranscript("");
          audioWaveformService.stopVisualizer();
          if (finalCallbackRef.current && text.trim()) {
            finalCallbackRef.current(text.trim());
          }
        } else {
          setInterimTranscript(text);
        }
      },
      (error) => {
        setIsListening(false);
        audioWaveformService.stopVisualizer();
        setErrorMessage(error);
      },
      () => {
        setIsListening(false);
        audioWaveformService.stopVisualizer();
      }
    );

    if (started) {
      setIsListening(true);
    } else {
      audioWaveformService.stopVisualizer();
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    errorMessage,
    isSupported,
    waveformLevels,
    startListening,
    stopListening,
    clearTranscript,
    setErrorMessage,
  };
}
