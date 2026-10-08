import { Link } from 'react-router-dom';
import { useAuth, getDashboardPath } from '../../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <div className="space-x-4">
        <Link to="/" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
          Go Home
        </Link>
        {isAuthenticated && (
          <Link to={getDashboardPath(user.role)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            Go to my dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
