import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);

  const testRBAC = async () => {
    try {
      const res = await axiosInstance.get('/farmer/ping');
      setTestResult(res.data.message);
      toast.success('Successfully accessed FARMER API');
    } catch (error) {
      setTestResult('Error: ' + error.message);
    }
  };

  const testOtherRole = async () => {
    try {
      await axiosInstance.get('/customer/ping');
    } catch (error) {
      // Axios interceptor will show the 403 toast automatically
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-8 border border-green-100">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome, {user.name}!</h1>
        <p className="text-green-700">Role: <span className="font-semibold bg-green-200 px-2 py-1 rounded">{user.role}</span></p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">RBAC Testing</h2>
        <div className="space-x-4 mb-4">
          <button onClick={testRBAC} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            Test RBAC (/farmer/ping)
          </button>
          <button onClick={testOtherRole} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            Try other role's API
          </button>
        </div>
        {testResult && (
          <div className="p-4 bg-gray-50 border rounded-md">
            <span className="font-semibold">Response:</span> {testResult}
          </div>
        )}
      </div>
    </div>
  );
}
