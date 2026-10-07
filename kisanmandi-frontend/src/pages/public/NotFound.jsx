import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
        Go Home
      </Link>
    </div>
  );
}
