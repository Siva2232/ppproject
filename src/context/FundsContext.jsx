import { createContext, useContext, useState, useMemo } from "react";

export const FundsContext = createContext();

export const FundsProvider = ({ children }) => {
  const [funds, setFunds] = useState([]);

  // Add new transaction
  const addFund = (fund) => setFunds((prev) => [...prev, fund]);

  // Calculate totals using useMemo for performance
  const totals = useMemo(() => {
    const total = funds.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    return {
      daily: total / 30,
      weekly: total / 4,
      monthly: total,
      yearly: total * 12,
    };
  }, [funds]);

  const value = {
    funds,
    addFund,
    totals,
  };

  return <FundsContext.Provider value={value}>{children}</FundsContext.Provider>;
};

export const useFunds = () => {
  const context = useContext(FundsContext);
  if (!context) throw new Error("useFunds must be used within a FundsProvider");
  return context;
};
