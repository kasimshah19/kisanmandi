import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminUserService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import { SkeletonRow } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  useDocumentTitle('Manage Users | KisanMandi');

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = () => {
    setLoading(true);
    setError(null);
    adminUserService
      .getUsers(page)
      .then((res) => {
        setUsers(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch((err) => {
        const msg = err.friendlyMessage || err.response?.data?.message || 'Failed to load users';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  const toggleStatus = (id, currentStatus) => {
    adminUserService
      .toggleUserStatus(id, !currentStatus)
      .then(() => {
        toast.success(currentStatus ? 'User deactivated' : 'User activated');
        loadUsers();
      })
      .catch(() => toast.error('Action failed'));
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>

        {loading ? (
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load users"
            message={error}
            onRetry={loadUsers}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleStatus(u.id, u.active)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition min-h-[36px] ${
                            u.active
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-700 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
