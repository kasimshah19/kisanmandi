import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Map } from 'lucide-react';
import { publicFarmerService, reviewService } from '../../services/phase5Services';
import RatingSummary from '../../components/RatingSummary';
import ReviewList from '../../components/ReviewList';
import { SkeletonCard } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function FarmerPublicProfile() {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmer();
  }, [id]);

  useEffect(() => {
    loadReviews();
  }, [id, page]);

  const loadFarmer = async () => {
    try {
      const res = await publicFarmerService.getFarmer(id);
      setFarmer(res);
    } catch (error) {
      toast.error('Failed to load farmer profile');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await reviewService.getPublicReviews(id, page, 10);
      setReviews(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      // It's ok if this fails or is empty
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!farmer) {
    return <div className="text-center py-20">Farmer not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={-1} className="flex items-center gap-1 text-gray-600 hover:text-green-700 mb-6 text-sm w-fit">
        <ArrowLeft size={16} /> Back
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-green-200 overflow-hidden shadow-sm mb-8">
        <div className="h-32 bg-green-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md absolute -top-12 flex items-center justify-center text-3xl font-bold text-green-700 uppercase">
            {farmer.name?.charAt(0)}
          </div>
          <div className="mt-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{farmer.name}</h1>
              <p className="text-green-700 font-medium">{farmer.farmName || 'Independent Farmer'}</p>
            </div>
            
            <div className="flex flex-col text-sm text-gray-600 gap-1">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-600" />
                <span>{farmer.village ? `${farmer.village}, ` : ''}{farmer.district}</span>
              </div>
              <div className="flex items-center gap-2">
                <Map size={16} className="text-green-600" />
                <span>{farmer.state}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings and Reviews */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews & Ratings</h2>
        {farmer.reviewCount > 0 ? (
          <RatingSummary 
            average={farmer.rating} 
            count={farmer.reviewCount} 
            distribution={farmer.ratingDistribution || {}} 
          />
        ) : (
          <div className="bg-gray-50 text-gray-500 p-4 rounded-lg border border-gray-100 text-center">
            No ratings yet for this farmer.
          </div>
        )}

        <ReviewList reviews={reviews} page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
}
