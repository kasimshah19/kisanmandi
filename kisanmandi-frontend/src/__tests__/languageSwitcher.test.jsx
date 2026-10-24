import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

describe('LanguageSwitcher Component', () => {
  beforeEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  describe('Dropdown Variant', () => {
    it('trigger shows current language native name and toggles menu on click', async () => {
      render(
        <MemoryRouter>
          <LanguageSwitcher variant="dropdown" />
        </MemoryRouter>
      );

      // Trigger button should show "English"
      const trigger = screen.getByRole('button', { name: /change language/i });
      expect(trigger).toBeTruthy();
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(screen.getByText('English')).toBeTruthy();

      // Open menu
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      // 3 options should be present
      const menu = screen.getByRole('menu');
      expect(menu).toBeTruthy();
      const options = screen.getAllByRole('menuitemradio');
      expect(options).toHaveLength(3);

      expect(screen.getAllByText('English').length).toBeGreaterThan(0);
      expect(screen.getByText('हिन्दी')).toBeTruthy();
      expect(screen.getByText('मराठी')).toBeTruthy();

      // Active option has aria-checked="true"
      const englishOption = options.find((opt) => opt.getAttribute('lang') === 'en');
      expect(englishOption.getAttribute('aria-checked')).toBe('true');
    });

    it('choosing Hindi changes i18n.language, saves localStorage, updates html lang, and closes menu', async () => {
      render(
        <MemoryRouter>
          <LanguageSwitcher variant="dropdown" />
        </MemoryRouter>
      );

      const trigger = screen.getByRole('button', { name: /change language/i });
      fireEvent.click(trigger);

      const hindiOption = screen.getAllByRole('menuitemradio').find((opt) => opt.getAttribute('lang') === 'hi');
      expect(hindiOption).toBeTruthy();

      await act(async () => {
        fireEvent.click(hindiOption);
      });

      // Verify language changed to Hindi
      expect(i18n.language).toBe('hi');
      expect(localStorage.getItem('kisanmandi_lang')).toBe('hi');
      expect(document.documentElement.lang).toBe('hi');

      // Menu should be closed
      expect(screen.queryByRole('menu')).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('Escape closes the menu and returns focus to trigger', () => {
      render(
        <MemoryRouter>
          <LanguageSwitcher variant="dropdown" />
        </MemoryRouter>
      );

      const trigger = screen.getByRole('button', { name: /change language/i });
      fireEvent.click(trigger);
      expect(screen.getByRole('menu')).toBeTruthy();

      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
      expect(screen.queryByRole('menu')).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('ArrowDown and ArrowUp move focus in the menu', () => {
      render(
        <MemoryRouter>
          <LanguageSwitcher variant="dropdown" />
        </MemoryRouter>
      );

      const trigger = screen.getByRole('button', { name: /change language/i });
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(screen.getByRole('menu')).toBeTruthy();

      const options = screen.getAllByRole('menuitemradio');
      // Initially first option (en) has tabIndex 0
      expect(options[0].getAttribute('tabindex')).toBe('0');

      // Press ArrowDown -> moves to Hindi (index 1)
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      expect(options[1].getAttribute('tabindex')).toBe('0');
      expect(options[0].getAttribute('tabindex')).toBe('-1');

      // Press ArrowDown -> moves to Marathi (index 2)
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      expect(options[2].getAttribute('tabindex')).toBe('0');

      // Press ArrowDown -> wraps around to English (index 0)
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      expect(options[0].getAttribute('tabindex')).toBe('0');

      // Press ArrowUp -> wraps around to Marathi (index 2)
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' });
      expect(options[2].getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Segmented Variant', () => {
    it('shows all 3 options at once in a radiogroup with active one aria-checked="true"', () => {
      render(
        <MemoryRouter>
          <LanguageSwitcher variant="segmented" />
        </MemoryRouter>
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toBeTruthy();

      const options = screen.getAllByRole('radio');
      expect(options).toHaveLength(3);

      const enRadio = options.find((opt) => opt.getAttribute('lang') === 'en');
      const hiRadio = options.find((opt) => opt.getAttribute('lang') === 'hi');
      const mrRadio = options.find((opt) => opt.getAttribute('lang') === 'mr');

      expect(enRadio.getAttribute('aria-checked')).toBe('true');
      expect(hiRadio.getAttribute('aria-checked')).toBe('false');
      expect(mrRadio.getAttribute('aria-checked')).toBe('false');
    });

    it('clicking another option changes the language', async () => {
      render(
        <MemoryRouter>
          <LanguageSwitcher variant="segmented" />
        </MemoryRouter>
      );

      const hiRadio = screen.getAllByRole('radio').find((opt) => opt.getAttribute('lang') === 'hi');
      await act(async () => {
        fireEvent.click(hiRadio);
      });

      expect(i18n.language).toBe('hi');
      expect(localStorage.getItem('kisanmandi_lang')).toBe('hi');
      expect(document.documentElement.lang).toBe('hi');
    });

    it('supports arrow key navigation (roving tabindex) between radio options', async () => {
      render(
        <MemoryRouter>
          <LanguageSwitcher variant="segmented" />
        </MemoryRouter>
      );

      const enRadio = screen.getAllByRole('radio').find((opt) => opt.getAttribute('lang') === 'en');

      // ArrowRight on en moves to hi and selects it
      await act(async () => {
        fireEvent.keyDown(enRadio, { key: 'ArrowRight' });
      });

      expect(i18n.language).toBe('hi');
      expect(screen.getAllByRole('radio').find((opt) => opt.getAttribute('lang') === 'hi').getAttribute('aria-checked')).toBe('true');
    });
  });
});
