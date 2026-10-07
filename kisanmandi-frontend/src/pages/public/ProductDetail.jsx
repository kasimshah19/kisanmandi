import { useParams } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Product Detail (ID: {id})</h2>
      <p className="text-gray-600">Phase 1 Implementation</p>
    </div>
  );
}
