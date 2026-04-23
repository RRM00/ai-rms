import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

export const Feedback = () => {
  const [tab, setTab] = useState('submit'); // 'submit' | 'view'
  const [orderId, setOrderId] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // View all reviews state
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    if (location.state?.orderId) {
      setOrderId(location.state.orderId);
    }
  }, [location]);

  useEffect(() => {
    if (tab === 'view') {
      fetchReviews();
    }
  }, [tab]);

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await api.get('/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await api.post('/reviews', { order_id: parseInt(orderId), review_text: reviewText });
      setSuccess(true);
      setOrderId('');
      setReviewText('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review. Check if Order ID exists.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setTab('submit')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                tab === 'submit'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setTab('view')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                tab === 'view'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              View All Feedbacks
            </button>
          </div>
        </div>

        {/* Submit Tab */}
        {tab === 'submit' && (
          <div className="max-w-md mx-auto w-full glass p-8 rounded-2xl shadow-xl border-t-4 border-brand-500">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <h2 className="mt-4 text-3xl font-extrabold text-white">How was your meal?</h2>
              <p className="mt-2 text-sm text-slate-400">
                Tell us about your experience! Your feedback helps us improve.
              </p>
            </div>

            {success ? (
              <div className="mt-8 bg-emerald-900/40 border border-emerald-500/50 rounded-lg p-6 text-center">
                <svg className="h-12 w-12 text-emerald-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-lg font-medium text-emerald-300">Thank you!</h3>
                <p className="text-emerald-100/70 mt-2">Your review has been successfully submitted.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors"
                >
                  Submit another review
                </button>
              </div>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-3 rounded text-sm text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Order ID</label>
                    <input
                      type="number" required min="1"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      placeholder="e.g. 1045"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Your Review</label>
                    <textarea
                      required rows="4"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      placeholder="The food was amazing, but..."
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* View All Feedbacks Tab */}
        {tab === 'view' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-100">All Customer Feedbacks</h2>
              <button
                onClick={fetchReviews}
                className="text-sm text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {isLoadingReviews ? (
              <div className="text-center py-12 text-brand-400 animate-pulse text-lg">Loading feedbacks...</div>
            ) : reviews.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <p className="text-slate-400 text-lg">No feedbacks submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="glass rounded-xl p-5 border-l-4 border-brand-500 hover:border-brand-400 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold bg-slate-700 text-brand-400 px-2.5 py-1 rounded-full">
                        Order #{review.order_id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{review.review_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
