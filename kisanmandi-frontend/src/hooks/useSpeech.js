import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isSpeechSynthesisSupported, speakText, stopSpeaking, resolveSpeechLang } from '../utils/speech';

/**
 * useSpeech Hook for KisanMandi low-literacy voice assistance
 * Stops speech automatically on unmount or navigation.
 */
export function useSpeech() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const activeControllerRef = useRef(null);

  const langCode = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

  useEffect(() => {
    const supported = isSpeechSynthesisSupported();
    setIsSupported(supported);

    if (supported && typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices() || [];
          setVoices(v);
        } catch {
          // ignore
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Stop speech whenever the page/route changes
  useEffect(() => {
    stop();
  }, [location.pathname]);

  // Stop on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const stop = useCallback(() => {
    if (activeControllerRef.current) {
      activeControllerRef.current.stop();
      activeControllerRef.current = null;
    }
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text) => {
      if (!isSupported || !text) return;

      if (isSpeaking) {
        stop();
        return;
      }

      setIsSpeaking(true);
      activeControllerRef.current = speakText(text, langCode, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    },
    [isSupported, isSpeaking, langCode, stop]
  );

  // Check if voice for current language exists
  const hasVoice = useCallback(() => {
    if (!isSupported) return false;
    if (voices.length === 0) return true; // Voices may be loading or default system voice exists
    const resolvedLang = resolveSpeechLang(langCode);
    return voices.some(
      (v) =>
        v.lang === resolvedLang ||
        v.lang.startsWith(resolvedLang.slice(0, 2)) ||
        v.lang.includes('IN')
    );
  }, [isSupported, voices, langCode]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: isSupported && hasVoice(),
  };
}

export default useSpeech;
