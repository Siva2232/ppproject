import { useContext } from "react";
import { FundsContext } from "../context/FundsContext";

export const useFunds = () => {
  const context = useContext(FundsContext);
  if (!context) {
    throw new Error("useFunds must be used within a FundsProvider");
  }
  return context;
};
