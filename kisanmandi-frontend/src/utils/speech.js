/**
 * Speech Assistance Utilities for KisanMandi
 * Provides feature-detected, fail-silent Text-To-Speech (TTS) and Speech-To-Text (STT)
 * tailored for low-literacy farmers and regional languages (Hindi, Marathi, English).
 */

export function isSpeechSynthesisSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
  );
}

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Map short locale codes to speech synthesis BCP-47 tags
export function resolveSpeechLang(langCode = 'hi') {
  const code = (langCode || 'hi').toLowerCase().split('-')[0];
  switch (code) {
    case 'mr':
      return 'mr-IN';
    case 'hi':
      return 'hi-IN';
    case 'en':
      return 'en-IN';
    default:
      return 'hi-IN';
  }
}

/**
 * Speaks a given text using browser SpeechSynthesis with fail-silent error handling
 * @param {string} text - Content to speak out loud
 * @param {string} langCode - 'hi', 'mr', or 'en'
 * @param {object} options - Callbacks { onStart, onEnd, onError, rate, pitch }
 * @returns {object} Controller with stop() method
 */
export function speakText(text, langCode = 'hi', options = {}) {
  if (!isSpeechSynthesisSupported() || !text) {
    options.onError?.(new Error('Speech synthesis is not supported on this device'));
    return { stop: () => {} };
  }

  try {
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const resolvedLang = resolveSpeechLang(langCode);
    utterance.lang = resolvedLang;

    // Slightly measured pace for better rural comprehension
    utterance.rate = options.rate ?? 0.92;
    utterance.pitch = options.pitch ?? 1.0;

    // Pick best matching voice if voices are loaded
    const voices = window.speechSynthesis.getVoices?.() || [];
    if (voices.length > 0) {
      const match =
        voices.find((v) => v.lang === resolvedLang) ||
        voices.find((v) => v.lang.startsWith(resolvedLang.slice(0, 2))) ||
        voices.find((v) => v.lang.includes('IN'));
      if (match) {
        utterance.voice = match;
      }
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    utterance.onerror = (event) => {
      // Browser cancellation (e.g. user stopped speech) is normal, don't throw
      if (event.error !== 'canceled') {
        options.onError?.(event);
      }
    };

    window.speechSynthesis.speak(utterance);

    return {
      stop: () => {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      },
    };
  } catch (err) {
    options.onError?.(err);
    return { stop: () => {} };
  }
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Creates a Speech Recognition instance for voice search
 * @param {object} config - { onResult, onError, onEnd, onStart, lang }
 * @returns {object} { start, stop, isSupported }
 */
export function createSpeechRecognizer({ onResult, onError, onEnd, onStart, lang = 'hi' } = {}) {
  if (!isSpeechRecognitionSupported()) {
    return {
      start: () => {},
      stop: () => {},
      isSupported: false,
    };
  }

  try {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = resolveSpeechLang(lang);

    recognition.onstart = () => {
      onStart?.();
    };

    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        onResult?.(transcript);
      }
    };

    recognition.onerror = (event) => {
      onError?.(event);
    };

    recognition.onend = () => {
      onEnd?.();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch {
          // Already started or busy
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Already stopped
        }
      },
      isSupported: true,
    };
  } catch (err) {
    onError?.(err);
    return {
      start: () => {},
      stop: () => {},
      isSupported: false,
    };
  }
}
