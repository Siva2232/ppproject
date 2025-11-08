import DashboardLayout from "../../components/DashboardLayout";
import FundsCard from "../../components/FundsCard";
import { useFunds } from "../../context/FundsContext";

const DailyFunds = () => {
  const { totals } = useFunds();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-gray-800">Daily Funds</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <FundsCard title="Today’s Revenue" value={totals.daily} />
          <FundsCard title="Weekly Average" value={totals.weekly} />
          <FundsCard title="Monthly Projection" value={totals.monthly} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DailyFunds;
