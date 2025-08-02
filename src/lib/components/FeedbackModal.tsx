import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaThumbsUp, FaThumbsDown, FaComment } from "react-icons/fa";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'like' | 'dislike' | 'correction', comment?: string) => void;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike' | 'correction' | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackType) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(feedbackType, comment);
      handleClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedbackType(null);
    setComment("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0E1014] border border-gray-700 rounded-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-[#F1C4A4] mb-4">
              How was this response?
            </h3>
            
            {/* Feedback Type Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setFeedbackType('like')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                  feedbackType === 'like'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-[#1A1B1E] border-gray-600 text-gray-300 hover:border-green-500'
                }`}
              >
                <FaThumbsUp className="text-sm" />
                <span className="text-sm">Helpful</span>
              </button>
              
              <button
                onClick={() => setFeedbackType('dislike')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                  feedbackType === 'dislike'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-[#1A1B1E] border-gray-600 text-gray-300 hover:border-red-500'
                }`}
              >
                <FaThumbsDown className="text-sm" />
                <span className="text-sm">Not Helpful</span>
              </button>
              
              <button
                onClick={() => setFeedbackType('correction')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                  feedbackType === 'correction'
                    ? 'bg-yellow-600 border-yellow-500 text-white'
                    : 'bg-[#1A1B1E] border-gray-600 text-gray-300 hover:border-yellow-500'
                }`}
              >
                <FaComment className="text-sm" />
                <span className="text-sm">Correction</span>
              </button>
            </div>

            {/* Comment Input */}
            {feedbackType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional comments (optional):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 bg-[#1A1B1E] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F1C4A4] resize-none"
                  rows={3}
                />
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-[#1A1B1E] border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!feedbackType || isSubmitting}
                className="flex-1 py-3 px-4 bg-[#00A79D] text-white rounded-lg hover:bg-[#008F87] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 