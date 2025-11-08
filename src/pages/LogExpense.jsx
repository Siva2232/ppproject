// src/pages/LogExpense.jsx
import { useState, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useExpense } from "../context/ExpenseContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Tag, Calendar, DollarSign, Clock, Receipt, AlertCircle,
  CheckCircle, Edit3, Repeat, Plus, Save, FileText, MapPin, Phone, User,
  CreditCard, AlertTriangle, Filter, Search, ChevronDown, ChevronUp, Eye, X,
  TrendingDown, BarChart3, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isValid } from "date-fns";

const CATEGORIES = ["Fuel", "Salary", "Rent", "Marketing", "Maintenance", "Other"];
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: "💰" },
  { value: "card", label: "Credit/Debit Card", icon: "💳" },
  { value: "upi", label: "UPI", icon: "📱" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
];
const TAGS = ["Urgent", "Recurring", "Tax-deductible", "One-time"];

const LogExpense = () => {
  const { addExpense, expenses } = useExpense();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    time: format(new Date(), "HH:mm"),
    paymentMethod: "cash",
    location: "",
    vendor: "",
    notes: "",
    isRecurring: false,
    tags: [],
    attachment: null, // For receipt upload
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For recent search

  // Compute totals for stats
  const recentExpenses = useMemo(() => {
    let filtered = expenses ? expenses.slice(-10).reverse() : []; // Last 10
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [expenses, searchTerm]);

  const totalSpent = useMemo(() => recentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0), [recentExpenses]);
  const avgExpense = useMemo(() => recentExpenses.length > 0 ? (totalSpent / recentExpenses.length).toFixed(2) : 0, [recentExpenses, totalSpent]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (type === "file" ? files[0] : value)
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = "Valid amount is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.date) newErrors.date = "Date is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const dateObj = new Date(`${formData.date}T${formData.time}:00`);
      if (!isValid(dateObj)) throw new Error("Invalid date/time");

      const expenseData = {
        description: formData.description,
        amount: Number(formData.amount),
        category: formData.category,
        date: dateObj.toISOString(),
        paymentMethod: formData.paymentMethod,
        location: formData.location,
        vendor: formData.vendor,
        notes: formData.notes,
        isRecurring: formData.isRecurring,
        tags: [...selectedTags],
        attachment: formData.attachment ? URL.createObjectURL(formData.attachment) : null,
        status: "logged",
        createdAt: new Date().toISOString(),
      };

      addExpense(expenseData);

      setSubmitStatus('success');

      // Reset form
      setFormData({
        description: "",
        amount: "",
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        time: format(new Date(), "HH:mm"),
        paymentMethod: "cash",
        location: "",
        vendor: "",
        notes: "",
        isRecurring: false,
        tags: [],
        attachment: null,
      });
      setSelectedTags([]);
      setErrors({});

    } catch (error) {
      console.error("Error logging expense:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate('/funds');
  const handleViewExpense = (expense) => navigate(`/view/${expense.id}`);

  // Safe format function
  const safeFormat = (dateStr, fmt) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, fmt) : 'Invalid Date';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-100 transition">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Receipt className="text-red-600" />
              Log New Expense
            </h1>
          </motion.div>

          {/* Form Card */}
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 space-y-6 border border-red-100 overflow-hidden">
            
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 border-b border-red-200 pb-2">
                <FileText className="text-red-500" />
                Basic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input type="text" name="description" value={formData.description} onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-all ${
                      errors.description ? 'border-red-500 ring-red-200' : 'border-gray-300'
                    }`} placeholder="What was the expense for?" />
                  {errors.description && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0.01" step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-all text-red-600 font-medium ${
                      errors.amount ? 'border-red-500 ring-red-200' : 'border-gray-300'
                    }`} placeholder="0.00" />
                  {errors.amount && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-all ${
                      errors.category ? 'border-red-500 ring-red-200' : 'border-gray-300'
                    }`}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 transition-all ${
                      errors.date ? 'border-red-500 ring-red-200' : 'border-gray-300'
                    }`} />
                  {errors.date && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.date}</p>}
                </div>
              </div>
            </div>

            {/* Timing Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 border-b border-red-200 pb-2">
                <Clock className="text-red-500" />
                Timing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange}
                    className="rounded border-red-300 text-red-500 focus:ring-red-500" id="recurring" />
                  <label htmlFor="recurring" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <Repeat className="text-red-500" size={16} />
                    Mark as Recurring Expense
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ChevronDown className={`text-red-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} size={20} />
                Advanced Options
              </h2>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-100 transition">
                {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {/* Advanced Section */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all">
                        {PAYMENT_METHODS.map(method => (
                          <option key={method.value} value={method.value}>{method.icon} {method.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Supplier</label>
                      <input type="text" name="vendor" value={formData.vendor} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all"
                        placeholder="Who was paid?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all"
                        placeholder="Where was it incurred?" />
                    </div>
                  </div>
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(tag => (
                        <button key={tag} type="button" onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            selectedTags.includes(tag) ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700'
                          }`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                    {selectedTags.length > 0 && <p className="text-sm text-gray-500 mt-1">Selected: {selectedTags.join(', ')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="Additional details or receipts info" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2 cursor-pointer">
                      <Upload size={16} />
                      Attach Receipt (optional)
                    </label>
                    <input type="file" name="attachment" onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all"
                      accept="image/*,application/pdf" />
                    {formData.attachment && <p className="text-sm text-red-600 mt-1">Selected: {formData.attachment.name}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <button type="button" onClick={handleBack}
                className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition flex-1 sm:flex-none">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-xl transition shadow-md ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
                } flex-1 sm:flex-none`}>
                {isSubmitting ? <><Clock className="animate-spin" size={20} /> Logging...</> : <><Save size={20} /> Log Expense</>}
              </button>
            </div>
          </motion.form>

          {/* Recent Expenses Section with Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <TrendingDown className="text-red-500" />
                Recent Expenses
              </h3>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 flex-1 max-w-xs" />
                <button className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  <Filter size={16} />
                </button>
              </div>
            </div>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-red-50 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">-₹{totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Recent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">-₹{avgExpense}</p>
                <p className="text-sm text-gray-600">Avg per Expense</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{recentExpenses.length}</p>
                <p className="text-sm text-gray-600">Entries</p>
              </div>
              <div className="text-center">
                <BarChart3 className="mx-auto mb-1 text-red-500" size={20} />
                <p className="text-sm text-gray-600">Analytics</p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
                <motion.div key={expense.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border-l-4 border-red-500">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{expense.description}</p>
                      <Tag className="text-red-500 w-4 h-4" />
                      {expense.category && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">{expense.category}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{safeFormat(expense.date, 'MMM d, h:mm a')}</span>
                      <span className="text-red-600 font-medium">-₹{expense.amount.toLocaleString()}</span>
                      {expense.paymentMethod && <span className="capitalize">{PAYMENT_METHODS.find(m => m.value === expense.paymentMethod)?.label}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleViewExpense(expense)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-1">
                    <Eye size={14} /> View
                  </button>
                </motion.div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-8">No recent expenses. Log your first one above!</p>
              )}
            </div>
          </motion.div>

          {/* Submit Status */}
          <AnimatePresence mode="wait">
            {submitStatus === 'success' && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-3 shadow-lg">
                <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-green-800 text-lg">Expense logged successfully!</p>
                  <p className="text-green-600 text-sm">Check recent expenses below or add another.</p>
                </div>
              </motion.div>
            )}
            {submitStatus === 'error' && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3 shadow-lg">
                <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-red-800 text-lg">Error logging expense.</p>
                  <p className="text-red-600 text-sm">Please check the form and try again.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LogExpense;