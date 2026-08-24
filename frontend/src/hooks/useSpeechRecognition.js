import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps the browser's SpeechRecognition API (webkitSpeechRecognition in
 * Chrome/Edge). Handles language selection, live/final transcripts, and
 * graceful degradation when the API is unavailable or permission is denied.
 *
 * Language is configurable because the product needs to support English,
 * Hindi, and Hinglish. Browsers don't have a native "Hinglish" locale, so
 * we default to Hindi (hi-IN) which most engines transcribe using Latin
 * characters when the speaker mixes English words — the user can still
 * edit the transcript before sending, and can switch to English if needed.
 */

const SpeechRecognitionAPI =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", label: "Hindi / Hinglish" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-US", label: "English (US)" },
];

export function useSpeechRecognition({ defaultLanguage = "hi-IN" } = {}) {
  const isSupported = Boolean(SpeechRecognitionAPI);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return undefined;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) setTranscript((prev) => (prev ? `${prev} ${finalText}`.trim() : finalText.trim()));
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone permission was denied. Enable it in your browser settings to use voice input.",
        "no-speech": "No speech was detected. Please try again.",
        "audio-capture": "No microphone was found. Please connect one and try again.",
        network: "A network error interrupted speech recognition.",
      };
      setError(messages[event.error] || "Speech recognition failed. You can type your message instead.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    };
  }, [isSupported, language]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("Voice input isn't supported in this browser. Try Chrome or Edge, or type your message.");
      return;
    }
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // start() throws if called while already listening/starting — ignore.
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    language,
    setLanguage,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
