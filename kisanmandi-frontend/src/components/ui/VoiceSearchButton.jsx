import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isSpeechRecognitionSupported, createSpeechRecognizer } from '../../utils/speech';

/**
 * VoiceSearchButton Component
 * Uses Web Speech Recognition for voice search in rural regional languages.
 * Note: SpeechRecognition works only on HTTPS or localhost origins.
 */
export default function VoiceSearchButton({
  onTranscript,
  onResult,
  className = '',
  size = 'md',
  lang,
}) {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognizerRef = useRef(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
    return () => {
      recognizerRef.current?.stop();
    };
  }, []);

  // Gracefully hide if browser has no speech recognition support
  if (!supported) {
    return null;
  }

  const currentLang = lang || (i18n.resolvedLanguage || i18n.language || 'hi').split('-')[0];

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      lang: currentLang,
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript) {
          if (onResult) onResult(transcript);
          else if (onTranscript) onTranscript(transcript);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    recognizerRef.current = recognizer;
    recognizer.start();
  };

  const buttonTitle = isListening
    ? t('speech.listening', 'Listening... speak now')
    : t('speech.voice_search', 'Search by voice');

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isListening}
      aria-label={buttonTitle}
      title={buttonTitle}
      className={`
        inline-flex items-center justify-center transition-all duration-150 cursor-pointer
        select-none outline-none focus-visible:ring-2 focus-visible:ring-green-600 shrink-0
        ${sizeClasses[size] || sizeClasses.md}
        ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-300'
            : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
        }
        ${className}
      `.trim()}
    >
      {isListening ? (
        <MicOff className="w-4 h-4 text-white" aria-hidden="true" />
      ) : (
        <Mic className="w-4 h-4 text-green-700" aria-hidden="true" />
      )}
    </button>
  );
}
