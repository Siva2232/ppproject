// src/pages/Investment.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Trash2,
  Edit3,
  X,
  Check,
  IndianRupee,
  Sparkles,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const STORAGE_KEY = "investment-tracker-v2";

export default function Investment() {
  const [partners, setPartners] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [];
  });

  const [name, setName] = useState("");
  const [modal, setModal] = useState({ open: false, partner: null, type: "" });
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
  }, [partners]);

  const addPartner = () => {
    if (!name.trim()) return;
    const newPartner = {
      id: Date.now(),
      name: name.trim(),
      balance: 0,
      history: [],
    };
    setPartners([...partners, newPartner]);
    setName("");
  };

  const startEdit = (id, current) => {
    setEditingId(id);
    setTempName(current);
  };

  const saveEdit = () => {
    if (!tempName.trim()) return;
    setPartners(partners.map(p =>
      p.id === editingId ? { ...p, name: tempName.trim() } : p
    ));
    setEditingId(null);
  };

  const openModal = (partner, type) => {
    setModal({ open: true, partner, type });
    setAmount("");
  };

  const closeModal = () => {
    setModal({ open: false, partner: null, type: "" });
    setAmount("");
  };

  const execute = () => {
    const value = Number(amount);
    if ((modal.type === "add" || modal.type === "withdraw") && (!amount || value <= 0)) return;

    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const transaction = {
      id: Date.now(),
      type: modal.type,
      amount: value,
      timestamp,
    };

    setPartners(partners.map(p => {
      if (p.id === modal.partner.id) {
        const newBalance = modal.type === "add"
          ? p.balance + value
          : p.balance - value;

        return {
          ...p,
          balance: newBalance,
          history: [transaction, ...p.history],
        };
      }
      return p;
    }));

    closeModal();
  };

  const deletePartner = (id) => {
    setPartners(partners.filter(p => p.id !== id));
    if (selectedPartner?.id === id) setSelectedPartner(null);
  };

  const totalInvested = partners.reduce((sum, p) => sum + p.balance, 0);
  const totalPartners = partners.length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl">
                <IndianRupee className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Investment Compass
              </h1>
              <Sparkles className="w-9 h-9 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-lg text-gray-600 ml-16">Track every rupee with elegance and precision</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Partners</p>
                  <p className="text-3xl font-bold text-indigo-600">{totalPartners}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invested</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ₹{totalInvested.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent Activity</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {partners.flatMap(p => p.history).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
                  <History className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add Partner */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/50 mb-10"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Plus className="w-7 h-7 text-indigo-600" />
              Add New Partner
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addPartner()}
                placeholder="Enter partner name..."
                className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all font-medium text-lg"
              />
              <button
                onClick={addPartner}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-3 font-bold"
              >
                <Plus className="w-6 h-6" />
                Add Partner
              </button>
            </div>
          </motion.div>

          {/* Partners Grid */}
          {partners.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6 shadow-inner">
                <IndianRupee className="w-16 h-16 text-indigo-600" />
              </div>
              <p className="text-xl text-gray-500 font-medium">No partners yet</p>
              <p className="text-gray-400 mt-1">Add your first partner to begin tracking</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Partners List */}
              <div className="lg:col-span-2 space-y-6">
                {partners.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                      
                      {/* Edit/Delete Buttons */}
                      <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingId === p.id ? (
                          <>
                            <button onClick={saveEdit} className="p-2 bg-emerald-100 rounded-xl hover:bg-emerald-200">
                              <Check className="w-4 h-4 text-emerald-600" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200">
                              <X className="w-4 h-4 text-gray-600" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(p.id, p.name)}
                              className="p-2 bg-indigo-100 rounded-xl hover:bg-indigo-200"
                            >
                              <Edit3 className="w-4 h-4 text-indigo-600" />
                            </button>
                            <button
                              onClick={() => deletePartner(p.id)}
                              className="p-2 bg-rose-100 rounded-xl hover:bg-rose-200"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Partner Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          {editingId === p.id ? (
                            <input
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                              className="text-2xl font-bold bg-transparent border-b-2 border-indigo-400 focus:border-purple-500 outline-none w-full"
                              autoFocus
                            />
                          ) : (
                            <h3 className="text-2xl font-bold text-gray-800">{p.name}</h3>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {p.history.length} transaction{p.history.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedPartner(p)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedPartner?.id === p.id
                              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          View History
                        </button>
                      </div>

                      {/* Balance */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <IndianRupee className="w-7 h-7 text-indigo-600" />
                          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {p.balance.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((p.balance / 500000) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => openModal(p, "add")}
                          className="py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-md font-medium flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Invest
                        </button>
                        <button
                          onClick={() => openModal(p, "withdraw")}
                          disabled={p.balance === 0}
                          className={`py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-md ${
                            p.balance === 0
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700"
                          }`}
                        >
                          <Minus className="w-5 h-5" />
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* History Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full min-h-96">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedPartner ? `${selectedPartner.name}'s History` : "Select a Partner"}
                    </h3>
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedPartner ? (
                      selectedPartner.history.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3 max-h-96 overflow-y-auto pr-2"
                        >
                          {selectedPartner.history.map((tx) => (
                            <motion.div
                              key={tx.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={`flex items-center justify-between p-3 rounded-2xl border ${
                                tx.type === "add"
                                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                                  : "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {tx.type === "add" ? (
                                  <div className="p-2 bg-emerald-100 rounded-xl">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                  </div>
                                ) : (
                                  <div className="p-2 bg-rose-100 rounded-xl">
                                    <TrendingDown className="w-4 h-4 text-rose-600" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {tx.type === "add" ? "Invested" : "Withdrew"}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {tx.timestamp}
                                  </p>
                                </div>
                              </div>
                              <p className={`font-bold text-lg ${
                                tx.type === "add" ? "text-emerald-600" : "text-rose-600"
                              }`}>
                                {tx.type === "add" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                              </p>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center text-gray-500 py-10"
                        >
                          No transactions yet
                        </motion.p>
                      )
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-400 py-10"
                      >
                        Click "View History" on a partner to see transactions
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Modal */}
          <AnimatePresence>
            {modal.open && modal.partner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {modal.type === "add" && "Add Investment"}
                      {modal.type === "withdraw" && "Withdraw Amount"}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-xl transition"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-gray-600">Partner</p>
                    <p className="text-xl font-bold text-gray-800">{modal.partner.name}</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount in Rupees
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:bg-white transition-all font-semibold text-lg"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={execute}
                      disabled={!amount || Number(amount) <= 0}
                      className={`flex-1 py-3 rounded-2xl text-white font-medium shadow-lg transition-all transform hover:scale-105 ${
                        modal.type === "add"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
                          : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-50"
                      }`}
                    >
                      {modal.type === "add" ? "Add Amount" : "Withdraw"}
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
}