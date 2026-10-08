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
import FarmerProfile from './pages/farmer/FarmerProfile';
import MyProducts from './pages/farmer/MyProducts';
import AddProduct from './pages/farmer/AddProduct';
import EditProduct from './pages/farmer/EditProduct';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import FarmerApproval from './pages/admin/FarmerApproval';
import ManageCategories from './pages/admin/ManageCategories';

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
          
          <Route path="/farmer/profile" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <FarmerProfile />
            </ProtectedRoute>
          } />

          <Route path="/farmer/products" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <MyProducts />
            </ProtectedRoute>
          } />
          
          <Route path="/farmer/products/add" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <AddProduct />
            </ProtectedRoute>
          } />

          <Route path="/farmer/products/:id/edit" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <EditProduct />
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
          
          <Route path="/admin/farmers" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FarmerApproval />
            </ProtectedRoute>
          } />

          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageCategories />
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
