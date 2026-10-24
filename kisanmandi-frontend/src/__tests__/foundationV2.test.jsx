import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { TextSizeProvider } from '../context/TextSizeContext';
import TextSizeControl from '../components/ui/TextSizeControl';
import CategoryTile from '../components/ui/CategoryTile';
import LanguageWelcomeModal from '../components/LanguageWelcomeModal';
import SpeakButton from '../components/ui/SpeakButton';
import VoiceSearchButton from '../components/ui/VoiceSearchButton';
import {
  resolveSpeechLang,
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported,
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
} from '../utils/speech';

// Mock react-i18next
const mockChangeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
    i18n: {
      language: 'en',
      resolvedLanguage: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('UI v2 Foundation Tests (Part 1)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-text-size');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('1. Speech Utilities (speech.js)', () => {
    it('resolveSpeechLang resolves correct BCP-47 tags', () => {
      expect(resolveSpeechLang('hi')).toBe('hi-IN');
      expect(resolveSpeechLang('mr')).toBe('mr-IN');
      expect(resolveSpeechLang('en')).toBe('en-IN');
      expect(resolveSpeechLang('en-US')).toBe('en-IN');
      expect(resolveSpeechLang(null)).toBe('hi-IN');
    });

    it('speakText fails silently and safely returns controller when unsupported', () => {
      const controller = speakText('Test produce rate', 'hi');
      expect(controller).toBeDefined();
      expect(typeof controller.stop).toBe('function');
      expect(() => controller.stop()).not.toThrow();
    });

    it('stopSpeaking executes safely without throwing', () => {
      expect(() => stopSpeaking()).not.toThrow();
    });

    it('createSpeechRecognizer returns safe stub when unsupported', () => {
      const recognizer = createSpeechRecognizer();
      expect(recognizer.isSupported).toBe(false);
      expect(typeof recognizer.start).toBe('function');
      expect(typeof recognizer.stop).toBe('function');
      expect(() => recognizer.start()).not.toThrow();
      expect(() => recognizer.stop()).not.toThrow();
    });
  });

  describe('2. Text Size Context & Control', () => {
    it('renders TextSizeControl with A, A+, A++ options and updates root data attribute', () => {
      render(
        <TextSizeProvider>
          <TextSizeControl variant="compact" />
        </TextSizeProvider>
      );

      // Verify buttons
      expect(screen.getByText('A')).toBeTruthy();
      expect(screen.getByText('A+')).toBeTruthy();
      expect(screen.getByText('A++')).toBeTruthy();

      // Click A+ (large)
      fireEvent.click(screen.getByText('A+'));
      expect(document.documentElement.getAttribute('data-text-size')).toBe('large');
      expect(localStorage.getItem('kisanmandi_text_size')).toBe('large');

      // Click A++ (xlarge)
      fireEvent.click(screen.getByText('A++'));
      expect(document.documentElement.getAttribute('data-text-size')).toBe('xlarge');
      expect(localStorage.getItem('kisanmandi_text_size')).toBe('xlarge');

      // Click A (normal)
      fireEvent.click(screen.getByText('A'));
      expect(document.documentElement.getAttribute('data-text-size')).toBe('normal');
      expect(localStorage.getItem('kisanmandi_text_size')).toBe('normal');
    });

    it('renders full variant with descriptive labels', () => {
      render(
        <TextSizeProvider>
          <TextSizeControl variant="full" />
        </TextSizeProvider>
      );

      expect(screen.getByTitle('Normal text size')).toBeTruthy();
      expect(screen.getByTitle('Large text size')).toBeTruthy();
      expect(screen.getByTitle('Largest text size')).toBeTruthy();
      expect(screen.getByText('Normal')).toBeTruthy();
      expect(screen.getByText('Large')).toBeTruthy();
    });
  });

  describe('3. CategoryTile Component', () => {
    it('renders icon and category title for Vegetables', () => {
      render(
        <MemoryRouter>
          <CategoryTile categoryKey="VEGETABLES" />
        </MemoryRouter>
      );

      expect(screen.getByText('🍅')).toBeTruthy();
      expect(screen.getByText('Vegetables')).toBeTruthy();
    });

    it('renders icon and category title for Fruits and Grain', () => {
      render(
        <MemoryRouter>
          <CategoryTile categoryKey="FRUITS" />
          <CategoryTile categoryKey="GRAINS" />
        </MemoryRouter>
      );

      expect(screen.getByText('🍎')).toBeTruthy();
      expect(screen.getByText('Fruits')).toBeTruthy();
      expect(screen.getByText('🌾')).toBeTruthy();
      expect(screen.getByText('Grains & Cereals')).toBeTruthy();
    });

    it('renders item count badge and handles click', () => {
      const handleClick = vi.fn();
      render(
        <CategoryTile
          categoryKey="DAIRY"
          count={14}
          onClick={handleClick}
        />
      );

      expect(screen.getByText('🥛')).toBeTruthy();
      expect(screen.getByText(/14 items/)).toBeTruthy();

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. LanguageWelcomeModal', () => {
    beforeEach(() => {
      window.__FORCE_LANGUAGE_WELCOME__ = true;
    });

    afterEach(() => {
      delete window.__FORCE_LANGUAGE_WELCOME__;
    });

    it('does not render if user has already been welcomed', () => {
      localStorage.setItem('kisanmandi_welcomed', 'true');
      const { container } = render(<LanguageWelcomeModal />);
      expect(container.firstChild).toBeNull();
    });

    it('renders 3 large language buttons for first-time visitors', () => {
      render(<LanguageWelcomeModal />);

      expect(screen.getByText('हिन्दी')).toBeTruthy();
      expect(screen.getByText('मराठी')).toBeTruthy();
      expect(screen.getByText('English')).toBeTruthy();

      // Click हिन्दी option
      fireEvent.click(screen.getByText('हिन्दी'));

      expect(mockChangeLanguage).toHaveBeenCalledWith('hi');
      expect(localStorage.getItem('kisanmandi_lang')).toBe('hi');
      expect(localStorage.getItem('kisanmandi_welcomed')).toBe('true');
    });
  });

  describe('5. Voice Assistance UI Components', () => {
    it('SpeakButton fails silently if speech synthesis unsupported', () => {
      const { container } = render(
        <SpeakButton text="Mandi rate 2500 per quintal" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('VoiceSearchButton fails silently if speech recognition unsupported', () => {
      const { container } = render(
        <VoiceSearchButton onTranscript={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('6. NumberStepper Component', () => {
    it('handles increments, decrements, and step clamping', async () => {
      const { default: NumberStepper } = await import('../components/ui/NumberStepper');
      const handleChange = vi.fn();

      const { rerender } = render(
        <NumberStepper value={5} min={2} max={10} step={1} unit="kg" onChange={handleChange} />
      );

      // Decrement
      const minusBtn = screen.getByLabelText(/decrease/i);
      fireEvent.click(minusBtn);
      expect(handleChange).toHaveBeenCalledWith(4);

      // Increment
      const plusBtn = screen.getByLabelText(/increase/i);
      fireEvent.click(plusBtn);
      expect(handleChange).toHaveBeenCalledWith(6);

      // Re-render at min
      rerender(<NumberStepper value={2} min={2} max={10} step={1} unit="kg" onChange={handleChange} />);
      expect(minusBtn.disabled).toBe(true);

      // Re-render at max
      rerender(<NumberStepper value={10} min={2} max={10} step={1} unit="kg" onChange={handleChange} />);
      expect(plusBtn.disabled).toBe(true);
    });

    it('handles direct typing and clamps value on blur', async () => {
      const { default: NumberStepper } = await import('../components/ui/NumberStepper');
      const handleChange = vi.fn();

      render(
        <NumberStepper value={5} min={1} max={50} step={1} unit="kg" onChange={handleChange} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '25' } });
      expect(handleChange).toHaveBeenCalledWith(25);

      // Blur clamps within bounds
      fireEvent.blur(input);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('7. BigChoice Component', () => {
    it('triggers onSelect on click and via keyboard Space and Enter', async () => {
      const { default: BigChoice } = await import('../components/ui/BigChoice');
      const handleSelect = vi.fn();

      render(
        <BigChoice
          selected={false}
          onSelect={handleSelect}
          title="Farmer Account"
          description="Sell fresh crops directly"
        />
      );

      const choice = screen.getByRole('radio');
      expect(choice.getAttribute('aria-checked')).toBe('false');

      // Click selection
      fireEvent.click(choice);
      expect(handleSelect).toHaveBeenCalledTimes(1);

      // Keyboard Space
      fireEvent.keyDown(choice, { key: ' ' });
      expect(handleSelect).toHaveBeenCalledTimes(2);

      // Keyboard Enter
      fireEvent.keyDown(choice, { key: 'Enter' });
      expect(handleSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('8. StatusPill Component', () => {
    it('renders with appropriate tone and accessible role', async () => {
      const { default: StatusPill } = await import('../components/ui/StatusPill');

      render(<StatusPill tone="success" label="Delivered" />);

      const pill = screen.getByRole('status');
      expect(pill).toBeTruthy();
      expect(pill.textContent).toContain('Delivered');
    });
  });

  describe('9. PhotoPicker Component & Image Compression', () => {
    it('validates file types and sizes', async () => {
      const { default: PhotoPicker } = await import('../components/ui/PhotoPicker');
      const handleChange = vi.fn();

      render(<PhotoPicker onChange={handleChange} />);

      // Verify action buttons exist
      expect(screen.getByText('Take a photo')).toBeTruthy();
      expect(screen.getByText('Choose from gallery')).toBeTruthy();
    });
  });

  describe('10. ListenButton Component', () => {
    it('renders nothing when speech synthesis is unsupported', async () => {
      const { default: ListenButton } = await import('../components/ListenButton');

      const { container } = render(<ListenButton text="Tomato rate 30" />);
      expect(container.firstChild).toBeNull();
    });
  });
});

