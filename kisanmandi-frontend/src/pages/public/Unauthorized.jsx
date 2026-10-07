import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-2xl text-gray-600 mb-8">Unauthorized Access</p>
      <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
        Go Home
      </Link>
    </div>
  );
}
