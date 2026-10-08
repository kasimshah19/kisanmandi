import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut } from 'lucide-react';
import { useAuth, getDashboardPath } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  // Role badge colors
  const roleBadge = {
    FARMER:   'bg-green-100 text-green-800',
    CUSTOMER: 'bg-blue-100 text-blue-800',
    ADMIN:    'bg-red-100 text-red-800',
  };

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-green-700 font-bold text-2xl">
          <Leaf className="h-6 w-6" />
          <span>KisanMandi</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-green-700 transition">Home</Link>
          <Link to="/mandi" className="text-gray-600 hover:text-green-700 transition">Mandi Rates</Link>
          <Link to="/products" className="text-gray-600 hover:text-green-700 transition">Browse Products</Link>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath(user.role)}
                className="text-gray-600 hover:text-green-700 transition">
                Dashboard
              </Link>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleBadge[user.role] || ''}`}>
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-green-700 transition">Login</Link>
              <Link to="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700">Home</Link>
          <Link to="/mandi" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700">Mandi Rates</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700">Browse Products</Link>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath(user.role)} onClick={() => setMenuOpen(false)}
                className="block text-gray-600 hover:text-green-700">Dashboard</Link>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${roleBadge[user.role] || ''}`}>
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout}
                className="block text-red-600 hover:text-red-700">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-green-700">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="block bg-green-600 text-white text-center px-4 py-2 rounded-lg hover:bg-green-700">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
