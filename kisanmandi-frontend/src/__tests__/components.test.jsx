import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import QuantityInput from '../components/QuantityInput';
import StarRating from '../components/StarRating';
import * as AuthContextModule from '../context/AuthContext';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to /login', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <div>Protected Secret Page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeTruthy();
    expect(screen.queryByText('Protected Secret Page')).toBeNull();
  });

  it('redirects users with wrong role to /unauthorized', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'CUSTOMER', name: 'Ravi' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/farmer/dashboard']}>
        <Routes>
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <div>Farmer Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<div>Access Denied Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied Page')).toBeTruthy();
    expect(screen.queryByText('Farmer Secret Dashboard')).toBeNull();
  });

  it('renders children when authenticated with authorized role', () => {
    AuthContextModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'FARMER', name: 'Kishan Kumar' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/farmer/dashboard']}>
        <Routes>
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <div>Farmer Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Farmer Secret Dashboard')).toBeTruthy();
  });
});

describe('QuantityInput Component', () => {
  it('increments quantity by unit step size', () => {
    const handleChange = vi.fn();
    render(
      <QuantityInput
        value={1}
        unit="KG"
        maxStock={10}
        onChange={handleChange}
      />
    );

    const increaseBtn = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseBtn);

    expect(handleChange).toHaveBeenCalledWith(1.5);
  });

  it('decrements quantity by unit step size', () => {
    const handleChange = vi.fn();
    render(
      <QuantityInput
        value={2}
        unit="KG"
        maxStock={10}
        onChange={handleChange}
      />
    );

    const decreaseBtn = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseBtn);

    expect(handleChange).toHaveBeenCalledWith(1.5);
  });

  it('disables decrease button when value is at min quantity', () => {
    const handleChange = vi.fn();
    render(
      <QuantityInput
        value={0.5}
        unit="KG"
        maxStock={10}
        onChange={handleChange}
      />
    );

    const decreaseBtn = screen.getByLabelText('Decrease quantity');
    expect(decreaseBtn.disabled).toBe(true);

    fireEvent.click(decreaseBtn);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('clamps input to maxStock when blurred with higher number', () => {
    const handleChange = vi.fn();
    render(
      <QuantityInput
        value={25}
        unit="KG"
        maxStock={10}
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Quantity');
    fireEvent.blur(input);

    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('uses step 1 for DOZEN units', () => {
    const handleChange = vi.fn();
    render(
      <QuantityInput
        value={1}
        unit="DOZEN"
        maxStock={12}
        onChange={handleChange}
      />
    );

    const increaseBtn = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseBtn);

    expect(handleChange).toHaveBeenCalledWith(2);
  });
});

describe('StarRating Component', () => {
  it('renders 5 star buttons', () => {
    render(<StarRating value={4} readOnly={true} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('triggers onChange with selected star rating when clicked in interactive mode', () => {
    const handleRating = vi.fn();
    render(<StarRating value={3} readOnly={false} onChange={handleRating} />);

    const star5 = screen.getByLabelText('Rate 5 stars');
    fireEvent.click(star5);

    expect(handleRating).toHaveBeenCalledWith(5);
  });

  it('does not trigger onChange when readOnly is true', () => {
    const handleRating = vi.fn();
    render(<StarRating value={3} readOnly={true} onChange={handleRating} />);

    const star4 = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(star4);

    expect(handleRating).not.toHaveBeenCalled();
  });
});
