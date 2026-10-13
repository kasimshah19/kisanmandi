import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ServerStatusBanner from './components/ServerStatusBanner';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './routes/ProtectedRoute';
import { checkHealth } from './services/healthService';

// Public routes kept in main bundle for instantaneous first paint
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import BrowseProducts from './pages/public/BrowseProducts';
import ProductDetail from './pages/public/ProductDetail';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';

// Heavy & role-specific routes lazy loaded to minimize initial bundle size
const MandiDashboard = lazy(() => import('./pages/public/MandiDashboard'));
const FarmerPublicProfile = lazy(() => import('./pages/public/FarmerPublicProfile'));

// Farmer routes
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const MandiRates = lazy(() => import('./pages/farmer/MandiRates'));
const FarmerProfile = lazy(() => import('./pages/farmer/FarmerProfile'));
const MyProducts = lazy(() => import('./pages/farmer/MyProducts'));
const AddProduct = lazy(() => import('./pages/farmer/AddProduct'));
const EditProduct = lazy(() => import('./pages/farmer/EditProduct'));
const FarmerOrders = lazy(() => import('./pages/farmer/FarmerOrders'));
const FarmerOrderDetail = lazy(() => import('./pages/farmer/FarmerOrderDetail'));
const Earnings = lazy(() => import('./pages/farmer/Earnings'));
const Reviews = lazy(() => import('./pages/farmer/Reviews'));

// Customer routes
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const MyOrders = lazy(() => import('./pages/customer/MyOrders'));
const OrderTracking = lazy(() => import('./pages/customer/OrderTracking'));
const Addresses = lazy(() => import('./pages/customer/Addresses'));

// Admin routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MandiSyncLogs = lazy(() => import('./pages/admin/MandiSyncLogs'));
const FarmerApproval = lazy(() => import('./pages/admin/FarmerApproval'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts'));
const AllOrders = lazy(() => import('./pages/admin/AllOrders'));
const ManageReviews = lazy(() => import('./pages/admin/ManageReviews'));

function App() {
  // Silent health ping on initial load to wake the Render server early
  useEffect(() => {
    checkHealth().catch(() => {
      // Ignored: early wake-up ping failure is caught transparently
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <ServerStatusBanner />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<BrowseProducts />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/mandi" element={<MandiDashboard />} />
            <Route path="/farmers/:id" element={<FarmerPublicProfile />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Farmer Routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/profile"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <FarmerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/mandi"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <MandiRates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <MyProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products/add"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <EditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <FarmerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/orders/:id"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <FarmerOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/earnings"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <Earnings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/reviews"
              element={
                <ProtectedRoute allowedRoles={['FARMER']}>
                  <Reviews />
                </ProtectedRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/cart"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/checkout"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders/:id"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/addresses"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Addresses />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/farmers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <FarmerApproval />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ManageCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/mandi-sync"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MandiSyncLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ManageProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AllOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ManageReviews />
                </ProtectedRoute>
              }
            />

            {/* Global 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
