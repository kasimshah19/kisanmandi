import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isSpeechSynthesisSupported, speakText, stopSpeaking } from '../../utils/speech';

export default function SpeakButton({
  text,
  label,
  lang,
  className = '',
  size = 'md',
  variant = 'secondary',
}) {
  const { i18n, t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSynthesisSupported());
    return () => {
      stopSpeaking();
    };
  }, []);

  // Graceful fail-silent: hide button completely if device lacks speech synthesis
  if (!supported || !text) {
    return null;
  }

  const currentLang = lang || (i18n.resolvedLanguage || i18n.language || 'hi').split('-')[0];

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText(text, currentLang, {
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const defaultPlayLabel = t('speech.listen', 'Listen');
  const defaultStopLabel = t('speech.stop', 'Stop');
  const buttonLabel = isPlaying ? defaultStopLabel : (label || defaultPlayLabel);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 min-h-[38px] rounded-lg gap-1.5',
    md: 'text-sm px-3.5 py-2 min-h-[44px] rounded-xl gap-2 font-medium',
    lg: 'text-base px-4 py-2.5 min-h-[48px] rounded-xl gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary: isPlaying
      ? 'bg-amber-600 text-white hover:bg-amber-700'
      : 'bg-green-700 text-white hover:bg-green-800',
    secondary: isPlaying
      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
      : 'bg-green-50 text-green-900 border border-green-200 hover:bg-green-100',
    ghost: isPlaying
      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
      : 'text-green-700 hover:bg-green-50',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isPlaying}
      aria-label={`${buttonLabel}: ${text.slice(0, 50)}...`}
      className={`
        inline-flex items-center justify-center transition-all duration-150 cursor-pointer
        select-none outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1
        ${variantClasses[variant] || variantClasses.secondary}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `.trim()}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 shrink-0 animate-pulse text-amber-700" aria-hidden="true" />
          <span className="font-semibold">{buttonLabel}</span>
          <span className="inline-flex items-center gap-0.5 ml-0.5" aria-hidden="true">
            <span className="w-1 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-4 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-2 bg-amber-600 rounded-full animate-bounce"></span>
          </span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 shrink-0 text-green-700" aria-hidden="true" />
          <span>{buttonLabel}</span>
        </>
      )}
    </button>
  );
}
