// // src/components/FundsCard.jsx
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const FundsCard = ({ title, amount = 0, trend = 0, icon: Icon = null }) => {
  const isPositive = trend >= 0;
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg transition-all duration-300"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />

      <div className="relative flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium opacity-80">{title}</h3>
          <p className="text-2xl font-bold mt-1">{formattedAmount}</p>
        </div>

        {Icon && (
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Trend */}
      {trend !== 0 && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {isPositive ? (
            <TrendingUp size={14} className="text-emerald-300" />
          ) : (
            <TrendingDown size={14} className="text-rose-300" />
          )}
          <span className={isPositive ? "text-emerald-300" : "text-rose-300"}>
            {isPositive ? "+" : ""}{trend}%
          </span>
          <span className="opacity-70">vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

export default FundsCard;