// src/context/WalletContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();
export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  // DEFAULT: ALL WALLETS START AT 0
  const defaultWallets = {
    alhind: 0,
    akbar: 0,
    office: 0,
  };

  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem("wallets");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all keys exist even if saved data is incomplete
      return {
        alhind: parsed.alhind ?? 0,
        akbar: parsed.akbar ?? 0,
        office: parsed.office ?? 0,
      };
    }
    return defaultWallets;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("walletTransactions");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("wallets", JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem("walletTransactions", JSON.stringify(transactions));
  }, [transactions]);

  // Generic update
  const updateWallet = (walletKey, amount, operation = "add") => {
    setWallets((prev) => {
      const current = prev[walletKey] ?? 0;
      const updated = operation === "add" ? current + amount : current - amount;
      return { ...prev, [walletKey]: Math.max(0, updated) };
    });
  };

  // Add with logging
  const addToWallet = (walletKey, amount, user = "System", metadata = {}) => {
    if (!walletKey || amount <= 0) return;
    updateWallet(walletKey, amount, "add");
    logTransaction(walletKey, amount, "credit", user, metadata);
  };

  // Deduct with logging + balance check
  const deductFromWallet = (walletKey, amount, user = "System", metadata = {}) => {
    if (!walletKey || amount <= 0) return;
    const current = wallets[walletKey] ?? 0;
    if (current < amount) {
      throw new Error(
        `Insufficient balance in ${walletKey}. Available: ₹${current.toFixed(2)}, Required: ₹${amount.toFixed(2)}`
      );
    }
    updateWallet(walletKey, amount, "deduct");
    logTransaction(walletKey, amount, "debit", user, metadata);
  };

  // Log transaction with metadata
  const logTransaction = (walletKey, amount, operation, user = "Unknown", metadata = {}) => {
    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        walletKey,
        amount,
        operation, // "credit" or "debit"
        user,
        timestamp: new Date().toISOString(),
        ...metadata, // e.g., bookingId, action
      },
    ]);
  };

  // Reverse a booking's wallet impact (for edits)
  const reverseBookingWallet = (booking, user = "Edit") => {
    if (!booking || !booking.platform || booking.platform === "Direct") return;

    const platformKey = booking.platform === "Alhind" ? "alhind" : 
                       booking.platform === "Akbar" ? "akbar" : null;

    const meta = { bookingId: booking.id, action: "reverse" };

    if (platformKey) {
      if (booking.basePay > 0) {
        addToWallet(platformKey, booking.basePay, user, meta);
      }
      if (booking.commissionAmount > 0) {
        deductFromWallet(platformKey, booking.commissionAmount, user, meta);
      }
    }

    if (booking.basePay + booking.markupAmount > 0) {
      deductFromWallet('office', booking.basePay + booking.markupAmount, user, meta);
    }
  };

  // Apply booking wallet logic (for add/edit)
  const applyBookingWallet = (booking, user = "Add") => {
    if (!booking.platform || booking.platform === "Direct") return;

    const platformKey = booking.platform === "Alhind" ? "alhind" : 
                       booking.platform === "Akbar" ? "akbar" : null;

    const meta = { bookingId: booking.id, action: "apply" };

    if (platformKey) {
      if (booking.basePay > 0) {
        deductFromWallet(platformKey, booking.basePay, user, meta);
      }
      if (booking.commissionAmount > 0) {
        addToWallet(platformKey, booking.commissionAmount, user, meta);
      }
    }

    if (booking.basePay + booking.markupAmount > 0) {
      addToWallet('office', booking.basePay + booking.markupAmount, user, meta);
    }
  };

  // Safe wallet data for UI
  const walletData = [
    { name: "AlHind", amount: wallets.alhind ?? 0, key: "alhind" },
    { name: "Akbar", amount: wallets.akbar ?? 0, key: "akbar" },
    { name: "Office Fund", amount: wallets.office ?? 0, key: "office" },
  ];

  return (
    <WalletContext.Provider value={{ 
      walletData, 
      addToWallet, 
      deductFromWallet, 
      logTransaction,
      reverseBookingWallet,
      applyBookingWallet,
      transactions,
      wallets
    }}>
      {children}
    </WalletContext.Provider>
  );
};