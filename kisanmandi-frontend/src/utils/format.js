// Format a number/string to Indian Rupee currency
export function formatINR(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
}

// Format number to Indian grouping, no decimals if whole, max 2 decimals
export function formatPrice(n) {
  const num = Number(n);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
}

// Convert quintal price to per Kg price
export function perKg(quintalPrice) {
  const num = Number(quintalPrice);
  if (isNaN(num)) return '0.00';
  return (num / 100).toFixed(2);
}

// Format ISO date string to readable date (e.g., "08 Oct 2026")
export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Format ISO date string to short date (e.g., "12 Oct")
export function formatShortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// Format ISO date string to date + time (e.g., "08 Oct 2026, 2:30 PM")
export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
}

// Generate a readable order number from an ID (e.g., "KM-00001")
export function orderNumber(id) {
  return 'KM-' + String(id).padStart(5, '0');
}

// Map backend unit enum to lowercase label
export function unitLabel(unit) {
  const map = { KG: 'kg', QUINTAL: 'quintal', DOZEN: 'dozen', PIECE: 'piece', LITRE: 'litre' };
  return map[unit] || unit?.toLowerCase() || '';
}

// Step size for quantity input based on unit type
export function quantityStep(unit) {
  if (unit === 'DOZEN' || unit === 'PIECE') return 1;
  return 0.5; // KG, LITRE, QUINTAL
}

// Minimum allowed quantity based on unit type
export function minQuantity(unit) {
  if (unit === 'DOZEN' || unit === 'PIECE') return 1;
  return 0.5; // KG, LITRE, QUINTAL
}
