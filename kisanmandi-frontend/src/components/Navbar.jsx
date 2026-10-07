import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-primary-600 font-bold text-2xl">
          <Leaf className="h-6 w-6" />
          <span>KisanMandi</span>
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link>
          <Link to="/mandi" className="text-gray-600 hover:text-primary-600">Mandi Rates</Link>
          <Link to="/products" className="text-gray-600 hover:text-primary-600">Browse Products</Link>
          <Link to="/login" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
