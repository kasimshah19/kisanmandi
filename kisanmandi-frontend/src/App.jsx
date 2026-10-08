import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import MandiDashboard from './pages/public/MandiDashboard';
import BrowseProducts from './pages/public/BrowseProducts';
import ProductDetail from './pages/public/ProductDetail';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';
import ProtectedRoute from './routes/ProtectedRoute';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mandi" element={<MandiDashboard />} />
          <Route path="/products" element={<BrowseProducts />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/farmer/dashboard" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <FarmerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
