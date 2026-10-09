import { Minus, Plus } from 'lucide-react';
import { quantityStep, minQuantity, unitLabel } from '../utils/format';

// Quantity input with +/- buttons, step/min based on product unit
export default function QuantityInput({ value, unit, maxStock, onChange, disabled }) {
  const step = quantityStep(unit);
  const min = minQuantity(unit);
  const max = Number(maxStock) || 9999;

  // Round to 2 decimals
  const round = (n) => Math.round(n * 100) / 100;

  const handleDecrease = () => {
    const next = round(Number(value) - step);
    if (next >= min) onChange(next);
  };

  const handleIncrease = () => {
    const next = round(Number(value) + step);
    if (next <= max) onChange(next);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') return onChange('');
    const num = round(Number(raw));
    if (!isNaN(num) && num >= 0) {
      onChange(Math.min(Math.max(num, min), max));
    }
  };

  const handleBlur = () => {
    const num = Number(value);
    if (isNaN(num) || num < min) onChange(min);
    else if (num > max) onChange(max);
    else onChange(round(num));
  };

  return (
    <div>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={disabled || Number(value) <= min}
          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 transition"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className="w-16 text-center border-x border-gray-300 py-2 text-sm focus:outline-none disabled:bg-gray-100
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={handleIncrease}
          disabled={disabled || Number(value) >= max}
          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 transition"
        >
          <Plus size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Max available: {Number(maxStock)} {unitLabel(unit)}
      </p>
    </div>
  );
}
