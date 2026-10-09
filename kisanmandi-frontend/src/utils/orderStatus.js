// Metadata for every order status: label, Tailwind color classes, icon name
export const STATUS_META = {
  PLACED:           { label: 'Placed',           bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  ACCEPTED:         { label: 'Accepted',         bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  PACKED:           { label: 'Packed',           bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
  DELIVERED:        { label: 'Delivered',        bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200',  dot: 'bg-green-500'  },
  REJECTED:         { label: 'Rejected',         bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200',    dot: 'bg-red-500'    },
  CANCELLED:        { label: 'Cancelled',        bg: 'bg-gray-100',   text: 'text-gray-800',   border: 'border-gray-200',   dot: 'bg-gray-500'   },
};

// Check if order is still in progress (not terminal)
export function isActiveStatus(s) {
  return ['PLACED', 'ACCEPTED', 'PACKED', 'OUT_FOR_DELIVERY'].includes(s);
}

// Check if order has reached a final state
export function isTerminalStatus(s) {
  return ['DELIVERED', 'REJECTED', 'CANCELLED'].includes(s);
}

// The happy-path sequence of statuses
export const HAPPY_PATH = ['PLACED', 'ACCEPTED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
