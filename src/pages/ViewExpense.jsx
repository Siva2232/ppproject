// src/pages/View.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useExpense } from "../context/ExpenseContext";
import { useWallet } from "../context/WalletContext"; // ADD THIS
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Tag, Calendar, DollarSign, Clock, Receipt, CheckCircle,
  FileText, MapPin, CreditCard, Repeat, ChevronDown, ChevronUp, Eye, Edit3,
  Trash2, Share, Printer, AlertTriangle, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isValid } from "date-fns";
import { toast } from "react-hot-toast"; // ADD THIS

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: "Money" },
  { value: "card", label: "Credit/Debit Card", icon: "Credit Card" },
  { value: "upi", label: "UPI", icon: "Smartphone" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "Bank" },
];
const TAGS = ["Urgent", "Recurring", "Tax-deductible", "One-time"];

const View = () => {
  const { id } = useParams();
  const { expenses, removeExpense } = useExpense();
  const { refundExpenseToOffice } = useWallet(); // ADD THIS
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (expenses) {
      const foundExpense = expenses.find(exp => exp.id === id);
      setExpense(foundExpense || null);
      setLoading(false);
    }
  }, [id, expenses]);

  const handleBack = () => navigate('/log-expense');
  const handleEdit = () => navigate(`/edit-expense/${id}`);
  
  const handleDelete = () => {
    if (!expense) return;

    // 1. Remove from ExpenseContext
    removeExpense(expense.id);

    // 2. REFUND TO OFFICE FUND
    try {
      refundExpenseToOffice(expense);
      toast.success(`₹${expense.amount.toLocaleString()} refunded to Office Fund`);
    } catch (err) {
      toast.error("Failed to refund. Try again.");
    }

    // 3. Navigate back
    navigate('/log-expense');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Expense Details',
        text: `Expense: ${expense.description} - ₹${expense.amount}`,
      });
    } else {
      navigator.clipboard.writeText(`Expense: ${expense.description} - ₹${expense.amount}`);
      toast.success('Copied to clipboard!');
    }
  };

  const safeFormat = (dateStr, fmt) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, fmt) : 'Invalid Date';
  };

  const relatedExpenses = expenses?.filter(e => e.category === expense?.category && e.id !== id).slice(0, 3) || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 flex items-center justify-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center space-y-4">
            <Clock className="animate-spin mx-auto text-red-500" size={48} />
            <p className="text-xl font-medium text-gray-600">Loading expense details...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (!expense) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 max-w-md">
            <Receipt className="mx-auto text-red-400" size={64} />
            <h1 className="text-3xl font-bold text-gray-900">Expense Not Found</h1>
            <p className="text-gray-500">The expense you're looking for doesn't exist.</p>
            <button onClick={handleBack} className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-lg">
              Back to Log Expense
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBack} className="p-3 text-red-600 hover:text-red-800 rounded-xl hover:bg-red-100 transition shadow-sm">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Receipt className="text-red-600" />
                  {expense.description}
                </h1>
                <p className="text-red-600 text-lg font-medium">-₹{expense.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setShowActions(!showActions)} className="p-3 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition">
                <ChevronDown size={20} />
              </button>

              <AnimatePresence>
                {showActions && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-10">
                    <button onClick={handleEdit} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition">
                      <Edit3 size={16} className="text-indigo-600" /> Edit Expense
                    </button>
                    <button onClick={handleShare} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition">
                      <Share size={16} className="text-green-600" /> Share
                    </button>
                    <button onClick={() => window.print()} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition">
                      <Printer size={16} className="text-blue-600" /> Print
                    </button>
                    <div className="border-t border-gray-100">
                      <button onClick={() => setConfirmDelete(true)} className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Hero Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 opacity-90">Total Spent</p>
                <p className="text-4xl font-bold">-₹{expense.amount.toLocaleString()}</p>
                <p className="text-sm opacity-90">{expense.category}</p>
              </div>
              <DollarSign size={48} className="opacity-75" />
            </div>
          </motion.div>

          {/* Main Details */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
            {/* Basic Info */}
            <div className="p-6 border-b border-red-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-red-500" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <span className="text-xs text-gray-500 uppercase">Description</span>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Category</span>
                  <div className="flex items-center gap-2">
                    <Tag className="text-red-500" size={16} />
                    <span className="font-medium text-gray-900">{expense.category}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={12} className="mr-1" /> {expense.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Amount</span>
                  <p className="text-2xl font-bold text-red-600">-₹{expense.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 border-b border-red-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="text-red-500" /> Timeline
              </h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-red-200"></div>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="absolute left-3.5 bg-red-500 rounded-full w-3 h-3 mt-1"></div>
                    <div className="ml-8">
                      <p className="text-sm font-medium text-gray-900">Logged</p>
                      <p className="text-xs text-gray-500">{safeFormat(expense.createdAt, 'MMM d, yyyy, h:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="absolute left-3.5 bg-red-500 rounded-full w-3 h-3 mt-1"></div>
                    <div className="ml-8">
                      <p className="text-sm font-medium text-gray-900">Occurred</p>
                      <p className="text-xs text-gray-500">{safeFormat(expense.date, 'MMM d, yyyy, h:mm a')}</p>
                    </div>
                  </div>
                  {expense.isRecurring && (
                    <div className="flex items-start">
                      <div className="absolute left-3.5 bg-red-500 rounded-full w-3 h-3 mt-1"></div>
                      <div className="ml-8">
                        <p className="text-sm font-medium text-gray-900">Next Recurrence</p>
                        <p className="text-xs text-gray-500">Monthly</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Details */}
            <div className="p-6">
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ChevronDown className={`text-red-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} size={20} />
                  Advanced Details
                </h3>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-xs text-gray-500 uppercase">Payment Method</span>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="p-2 bg-red-100 rounded-lg">
                            {PAYMENT_METHODS.find(m => m.value === expense.paymentMethod)?.icon || 'Credit Card'}
                          </div>
                          <span className="font-medium text-gray-900">
                            {PAYMENT_METHODS.find(m => m.value === expense.paymentMethod)?.label || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase">Vendor</span>
                        <p className="font-medium text-gray-900 mt-1">{expense.vendor || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs text-gray-500 uppercase">Location</span>
                        <div className="flex items-center gap-3 mt-1">
                          <MapPin className="text-red-500" size={16} />
                          <p className="font-medium text-gray-900">{expense.location || 'N/A'}</p>
                        </div>
                      </div>

                      {expense.tags?.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="text-xs text-gray-500 uppercase">Tags</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {expense.tags.map(tag => (
                              <span key={tag} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {expense.notes && (
                        <div className="md:col-span-2">
                          <span className="text-xs text-gray-500 uppercase">Notes</span>
                          <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">
                            {expense.notes}
                          </p>
                        </div>
                      )}

                      {expense.attachment && (
                        <div className="md:col-span-2">
                          <span className="text-xs text-gray-500 uppercase">Receipt</span>
                          <div className="flex items-center gap-3 mt-1">
                            <Upload className="text-red-500" size={16} />
                            <a href={expense.attachment} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">
                              View Attachment
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Related Expenses */}
          {relatedExpenses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Tag className="text-red-500" /> Related Expenses ({expense.category})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedExpenses.map(rel => (
                  <div key={rel.id} className="bg-red-50 rounded-xl p-4 border border-red-200 hover:shadow-md transition cursor-pointer"
                       onClick={() => navigate(`/view/${rel.id}`)}>
                    <p className="text-sm font-medium text-gray-900 mb-1">{rel.description}</p>
                    <p className="text-red-600 font-semibold">-₹{rel.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{safeFormat(rel.date, 'MMM d')}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="text-center mb-6">
                    <AlertTriangle className="mx-auto text-red-500" size={48} />
                    <h3 className="text-2xl font-bold text-gray-900 mt-4">Delete Expense?</h3>
                    <p className="text-gray-600 mt-2">
                      ₹{expense.amount.toLocaleString()} will be <strong>refunded</strong> to Office Fund.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setConfirmDelete(false)}
                      className="px-5 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                      Cancel
                    </button>
                    <button onClick={handleDelete}
                      className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium">
                      Delete & Refund
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default View;