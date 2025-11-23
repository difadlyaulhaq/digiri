// pages/feedback.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, Send, User, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  createdAt: Timestamp;
}

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    message: ''
  });

  // Load feedbacks from Firestore
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const feedbacksQuery = query(
        collection(db, 'feedbacks'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(feedbacksQuery);
      const feedbacksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Feedback[];
      setFeedbacks(feedbacksData);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'feedbacks'), {
        ...formData,
        createdAt: Timestamp.now()
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        rating: 5,
        message: ''
      });
      
      // Reload feedbacks
      await loadFeedbacks();
      alert('Terima kasih! Feedback Anda telah berhasil dikirim.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Maaf, terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.toDate()).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate average rating
  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ulasan & Testimoni
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bagikan pengalaman Anda mengunjungi Desa Wisata Batik Giriloyo dan bantu kami menjadi lebih baik
          </p>
          
          {/* Rating Summary */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm max-w-md mx-auto">
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl font-bold text-amber-600">
                {averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={`${
                        star <= Math.round(averageRating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Berdasarkan {feedbacks.length} ulasan
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Feedback Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Beri Ulasan Anda
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Masukkan nama Anda"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Masukkan email Anda"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none transform hover:scale-110 transition"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= formData.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Ulasan *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                  placeholder="Bagikan pengalaman Anda mengunjungi Desa Wisata Batik Giriloyo..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Kirim Ulasan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Feedback List */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ulasan Pengunjung ({feedbacks.length})
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Star size={48} className="mx-auto" />
                </div>
                <p className="text-gray-600">
                  Belum ada ulasan. Jadilah yang pertama berbagi pengalaman!
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {feedback.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={`${
                                    star <= feedback.rating
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {feedback.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar size={14} />
                        <span>{formatDate(feedback.createdAt)}</span>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-gray-700 leading-relaxed">
                      {feedback.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeedbackPage;