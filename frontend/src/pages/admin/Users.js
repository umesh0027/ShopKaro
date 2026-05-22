import React, { useState, useEffect } from 'react';
import { FiSearch, FiToggleLeft, FiToggleRight, FiUser } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAdminAll({ search, page, limit: 15 });
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, page]);

  const handleToggle = async (id) => {
    try {
      const { data } = await userAPI.toggleStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(`User ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">{total} registered customers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..." className="input-field pl-9 text-sm py-2.5" />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Verified</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                          {user.avatar?.url
                            ? <img src={user.avatar.url} alt="" className="w-full h-full rounded-xl object-cover" />
                            : <span className="font-bold text-primary-700 text-sm">{user.name[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.isVerified ? '✓ Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(user._id)}
                        className={`text-xl transition-colors ${user.isActive ? 'text-green-500 hover:text-red-400' : 'text-gray-300 hover:text-green-500'}`}
                        title={user.isActive ? 'Block user' : 'Activate user'}>
                        {user.isActive ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FiUser size={32} className="mx-auto mb-3 text-gray-300" />
                <p>No customers found</p>
              </div>
            )}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Prev</button>
            <span className="py-1.5 px-4 text-xs font-medium text-gray-600">{page} / {pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
