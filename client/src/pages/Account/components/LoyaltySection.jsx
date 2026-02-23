import PointsCard from "./PointsCard";
import PointsHistoryTable from "./PointsHistoryTable";

export default function LoyaltySection() {
  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <PointsCard />

      {/* Points History Table */}
      <PointsHistoryTable />
    </div>
  );
}
