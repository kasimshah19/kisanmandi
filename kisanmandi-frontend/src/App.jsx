import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import MandiDashboard from './pages/public/MandiDashboard';
import BrowseProducts from './pages/public/BrowseProducts';
import ProductDetail from './pages/public/ProductDetail';
import FarmerPublicProfile from './pages/public/FarmerPublicProfile';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';
import ProtectedRoute from './routes/ProtectedRoute';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MandiRates from './pages/farmer/MandiRates';
import FarmerProfile from './pages/farmer/FarmerProfile';
import MyProducts from './pages/farmer/MyProducts';
import AddProduct from './pages/farmer/AddProduct';
import EditProduct from './pages/farmer/EditProduct';
import Earnings from './pages/farmer/Earnings';
import Reviews from './pages/farmer/Reviews';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import MandiSyncLogs from './pages/admin/MandiSyncLogs';
import FarmerApproval from './pages/admin/FarmerApproval';
import ManageCategories from './pages/admin/ManageCategories';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';
import AllOrders from './pages/admin/AllOrders';
import ManageReviews from './pages/admin/ManageReviews';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import OrderTracking from './pages/customer/OrderTracking';
import Addresses from './pages/customer/Addresses';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerOrderDetail from './pages/farmer/FarmerOrderDetail';

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
          <Route path="/farmers/:id" element={<FarmerPublicProfile />} />
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

          <Route path="/farmer/mandi" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <MandiRates />
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

          <Route path="/farmer/orders" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <FarmerOrders />
            </ProtectedRoute>
          } />

          <Route path="/farmer/orders/:id" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <FarmerOrderDetail />
            </ProtectedRoute>
          } />

          <Route path="/farmer/earnings" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <Earnings />
            </ProtectedRoute>
          } />

          <Route path="/farmer/reviews" element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <Reviews />
            </ProtectedRoute>
          } />

          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/customer/cart" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Cart />
            </ProtectedRoute>
          } />

          <Route path="/customer/checkout" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Checkout />
            </ProtectedRoute>
          } />

          <Route path="/customer/orders" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MyOrders />
            </ProtectedRoute>
          } />

          <Route path="/customer/orders/:id" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderTracking />
            </ProtectedRoute>
          } />

          <Route path="/customer/addresses" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Addresses />
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

          <Route path="/admin/mandi-sync" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MandiSyncLogs />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageUsers />
            </ProtectedRoute>
          } />

          <Route path="/admin/products" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageProducts />
            </ProtectedRoute>
          } />

          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AllOrders />
            </ProtectedRoute>
          } />

          <Route path="/admin/reviews" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageReviews />
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
