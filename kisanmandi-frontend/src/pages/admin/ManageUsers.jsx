import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminUserService } from '../../services/phase5Services';
import Pagination from '../../components/Pagination';
import { SkeletonRow } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Phone, 
  UserX, 
  UserCheck, 
  Filter 
} from 'lucide-react';

export default function ManageUsers() {
  useDocumentTitle('Manage Users | KisanMandi');

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toggleUserTarget, setToggleUserTarget] = useState(null);

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

  const handleToggleConfirm = () => {
    if (!toggleUserTarget) return;
    const { id, active, name } = toggleUserTarget;
    adminUserService
      .toggleUserStatus(id, !active)
      .then(() => {
        toast.success(active ? `Account for ${name} deactivated` : `Account for ${name} activated`);
        setToggleUserTarget(null);
        loadUsers();
      })
      .catch(() => {
        toast.error('Failed to change user status');
        setToggleUserTarget(null);
      });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.phone && u.phone.includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      return matchRole && matchQuery;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <PageHeader 
          title="User Accounts"
          subtitle="Manage registered farmers, customers, and administrative security credentials"
          badge={<StatusBadge status="ADMIN" text="Admin Portal" />}
        />

        {/* Toolbar Card */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Role:
            </span>
            {['ALL', 'FARMER', 'CUSTOMER', 'ADMIN'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  roleFilter === role
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <SkeletonRow />
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
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">No users found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery || roleFilter !== 'ALL'
                ? 'No users match your applied search or role filters.'
                : 'There are no registered accounts in the system.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredUsers.map((u) => {
                    const initial = (u.name || 'U').charAt(0).toUpperCase();
                    return (
                      <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {initial}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 text-sm">{u.name}</div>
                              {u.email && <div className="text-neutral-400 text-[11px]">{u.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-neutral-600">
                          {u.phone || 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : u.role === 'FARMER'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              u.active 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {u.active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setToggleUserTarget(u)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              u.active
                                ? 'text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100'
                                : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {u.active ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmDialog 
          isOpen={!!toggleUserTarget}
          title={toggleUserTarget?.active ? 'Deactivate User Account' : 'Activate User Account'}
          message={
            toggleUserTarget?.active 
              ? `Are you sure you want to deactivate ${toggleUserTarget?.name}'s account? They will not be able to log in or manage orders.`
              : `Are you sure you want to reactivate ${toggleUserTarget?.name}'s account? They will regain system access.`
          }
          confirmText={toggleUserTarget?.active ? 'Deactivate Account' : 'Activate Account'}
          onConfirm={handleToggleConfirm}
          onCancel={() => setToggleUserTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}
