import React, { useState, useEffect } from 'react';
import { FiStar, FiTrash2, FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { productAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null); // { productId, reviewId, currentReply }
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAdminAll({ limit: 100 });
      // Only products with reviews
      const withReviews = data.products.filter(p => p.numReviews > 0);
      setProducts(withReviews);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDeleteReview = async (productId, reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await productAPI.deleteReview(productId, reviewId);
      toast.success('Review deleted');
      fetchProducts();
    } catch { toast.error('Failed'); }
  };

  const openReply = (productId, review) => {
    setReplyModal({ productId, reviewId: review._id });
    setReplyText(review.adminReply || '');
  };

  const handleReply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productAPI.replyReview(replyModal.productId, replyModal.reviewId, { reply: replyText });
      toast.success('Reply saved!');
      setReplyModal(null);
      fetchProducts();
    } catch { toast.error('Failed to save reply'); }
    finally { setSubmitting(false); }
  };

  // Flatten all reviews with product info
  const allReviews = products.flatMap(p =>
    (p.reviews || []).map(r => ({ ...r, productName: p.name, productImage: p.images?.[0]?.url, productId: p._id }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <div className="p-6"><LoadingSpinner /></div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-sm text-gray-500">{allReviews.length} total reviews</p>
      </div>

      {allReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center text-gray-400 shadow-sm">
          <FiStar size={40} className="mx-auto mb-3" />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allReviews.map((review, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex gap-4">
                {/* Product */}
                <div className="flex items-center gap-2 w-48 shrink-0">
                  <img src={review.productImage} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-50" />
                  <p className="text-xs text-gray-600 font-medium line-clamp-2">{review.productName}</p>
                </div>

                {/* Review content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{review.name}</p>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <FiStar key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => openReply(review.productId, review)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Reply">
                        <FiMessageSquare size={15} />
                      </button>
                      <button onClick={() => handleDeleteReview(review.productId, review._id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Admin reply */}
                  {review.adminReply && (
                    <div className="bg-primary-50 border-l-3 border-primary-400 rounded-r-xl p-3 mt-2">
                      <p className="text-xs font-semibold text-primary-700 mb-0.5">Your Reply</p>
                      <p className="text-sm text-gray-700">{review.adminReply}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReplyModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Reply to Review</h3>
              <button onClick={() => setReplyModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea rows={5} value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write your reply to the customer..." className="input-field resize-none" required />
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary py-2.5 flex items-center gap-2">
                  <FiSend size={14} />
                  {submitting ? 'Saving...' : 'Save Reply'}
                </button>
                <button type="button" onClick={() => setReplyModal(null)} className="btn-secondary py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
