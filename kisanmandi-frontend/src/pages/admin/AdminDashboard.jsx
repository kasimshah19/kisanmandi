import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);

  const testRBAC = async () => {
    try {
      const res = await axiosInstance.get('/admin/ping');
      setTestResult(res.data.message);
      toast.success('Successfully accessed ADMIN API');
    } catch (error) {
      setTestResult('Error: ' + error.message);
    }
  };

  const testOtherRole = async () => {
    try {
      await axiosInstance.get('/farmer/ping');
    } catch (error) {
       // Interceptor shows 403
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 rounded-xl p-8 border border-red-100">
        <h1 className="text-3xl font-bold text-red-800 mb-2">Welcome, {user.name}!</h1>
        <p className="text-red-700">Role: <span className="font-semibold bg-red-200 px-2 py-1 rounded">{user.role}</span></p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">RBAC Testing</h2>
        <div className="space-x-4 mb-4">
          <button onClick={testRBAC} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            Test RBAC (/admin/ping)
          </button>
          <button onClick={testOtherRole} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
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
