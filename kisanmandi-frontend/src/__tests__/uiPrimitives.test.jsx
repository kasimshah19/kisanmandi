import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import Tabs from '../components/ui/Tabs';

describe('UI Primitives Unit Tests', () => {
  describe('Button Component', () => {
    it('disables button and displays loading spinner when loading is true', () => {
      const handleClick = vi.fn();
      render(
        <Button loading={true} onClick={handleClick}>
          Submit Order
        </Button>
      );

      const button = screen.getByRole('button', { name: /submit order/i });
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('aria-busy')).toBe('true');

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('triggers click handler when enabled', () => {
      const handleClick = vi.fn();
      render(
        <Button loading={false} onClick={handleClick}>
          Click Me
        </Button>
      );

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button.disabled).toBe(false);
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accordion Component', () => {
    const items = [
      { id: '1', question: 'What is KisanMandi?', answer: 'A direct farmer marketplace.' },
      { id: '2', question: 'How is payment done?', answer: 'Cash on delivery.' },
    ];

    it('toggles item and updates aria-expanded attribute on click', () => {
      render(<Accordion items={items} />);

      // First item is open by default
      const firstBtn = screen.getByRole('button', { name: /what is kisanmandi/i });
      const secondBtn = screen.getByRole('button', { name: /how is payment done/i });

      expect(firstBtn.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByText('A direct farmer marketplace.')).toBeTruthy();

      expect(secondBtn.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByText('Cash on delivery.')).toBeNull();

      // Click second item
      fireEvent.click(secondBtn);
      expect(secondBtn.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByText('Cash on delivery.')).toBeTruthy();

      // First item closes when single-mode is default
      expect(firstBtn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Tabs Component', () => {
    const tabs = [
      { label: 'Customers', content: <div>Customer Guide Content</div> },
      { label: 'Farmers', content: <div>Farmer Guide Content</div> },
    ];

    it('switches tabs and navigates using arrow keys', () => {
      render(<Tabs tabs={tabs} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeTruthy();

      const customerTab = screen.getByRole('tab', { name: 'Customers' });
      const farmerTab = screen.getByRole('tab', { name: 'Farmers' });

      expect(customerTab.getAttribute('aria-selected')).toBe('true');
      expect(farmerTab.getAttribute('aria-selected')).toBe('false');
      expect(screen.getByText('Customer Guide Content')).toBeTruthy();

      // ArrowRight on customer tab moves to farmer tab
      fireEvent.keyDown(customerTab, { key: 'ArrowRight' });
      expect(farmerTab.getAttribute('aria-selected')).toBe('true');
      expect(customerTab.getAttribute('aria-selected')).toBe('false');
      expect(screen.getByText('Farmer Guide Content')).toBeTruthy();

      // ArrowLeft moves back to customer tab
      fireEvent.keyDown(farmerTab, { key: 'ArrowLeft' });
      expect(customerTab.getAttribute('aria-selected')).toBe('true');
    });
  });
});
