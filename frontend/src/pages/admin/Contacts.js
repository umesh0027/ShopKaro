import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { contactAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-700',
  resolved: 'bg-purple-100 text-purple-700',
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await contactAPI.getAdmin({ status: statusFilter, page, limit: 15 });
      setContacts(data.contacts);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, [statusFilter, page]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReplying(true);
    try {
      await contactAPI.reply(selected._id, { reply });
      toast.success('Reply sent via email!');
      setSelected(null);
      setReply('');
      fetchContacts();
    } catch { toast.error('Failed to send reply'); }
    finally { setReplying(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await contactAPI.updateStatus(id, { status });
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this query?')) return;
    try {
      await contactAPI.delete(id);
      toast.success('Deleted');
      fetchContacts();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Contact Queries</h1>
        <p className="text-sm text-gray-500">{total} total queries</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'new', 'read', 'replied', 'resolved'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? <LoadingSpinner /> : contacts.map(contact => (
            <div key={contact._id}
              onClick={() => { setSelected(contact); setReply(contact.adminReply || ''); }}
              className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-hover transition-all border-2 ${selected?._id === contact._id ? 'border-primary-300' : 'border-transparent'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.email}</p>
                </div>
                <span className={`badge text-xs ${statusColors[contact.status]}`}>{contact.status}</span>
              </div>
              <p className="font-medium text-sm text-gray-700 mb-1">{contact.subject}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{contact.message}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(contact.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
          {!loading && contacts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FiMessageSquare size={32} className="mx-auto mb-3" />
              <p>No queries found</p>
            </div>
          )}
          {pages > 1 && (
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Next</button>
            </div>
          )}
        </div>

        {/* Detail / Reply Panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-6 animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{selected.subject}</h2>
                  <p className="text-sm text-gray-500">{selected.name} · {selected.email}</p>
                  {selected.phone && <p className="text-xs text-gray-400">📞 {selected.phone}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <FiX size={16} />
                </button>
              </div>

              {/* Original message */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
              </div>

              {/* Previous reply */}
              {selected.adminReply && (
                <div className="bg-primary-50 border-l-4 border-primary-400 rounded-r-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-primary-700 mb-1">Previous Reply</p>
                  <p className="text-sm text-gray-700">{selected.adminReply}</p>
                </div>
              )}

              {/* Status actions */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['read', 'resolved'].map(s => (
                  <button key={s} onClick={() => handleStatusUpdate(selected._id, s)}
                    className={`btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 ${selected.status === s ? 'bg-primary-50 text-primary-700 border-primary-200' : ''}`}>
                    <FiCheck size={12} /> Mark {s}
                  </button>
                ))}
                <button onClick={() => handleDelete(selected._id)}
                  className="btn-secondary py-1.5 px-3 text-xs text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-1.5 ml-auto">
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>

              {/* Reply form */}
              <form onSubmit={handleReply}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selected.adminReply ? 'Update Reply' : 'Send Reply'}
                </label>
                <textarea rows={4} value={reply} onChange={e => setReply(e.target.value)}
                  placeholder="Type your response here... (will be sent via email)"
                  className="input-field resize-none mb-3" required />
                <button type="submit" disabled={replying} className="btn-primary py-2.5 flex items-center gap-2">
                  <FiSend size={15} />
                  {replying ? 'Sending...' : 'Send Reply via Email'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-400">
              <FiMessageSquare size={40} className="mx-auto mb-3" />
              <p>Select a query to view & reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
