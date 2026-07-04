import { Hammer } from "lucide-react";

// Temporary placeholder so the "View as HR" role switch has somewhere to
// go without breaking routing. Replaced with the real HR Dashboard
// (progress table + Needs attention) on Day 3.
export function HRDashboardPlaceholder() {
  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">HR</span>
        <h1 className="page-title">HR Dashboard</h1>
      </div>
      <div className="state-block card">
        <Hammer size={28} />
        <p className="state-title">Coming soon</p>
        <p className="state-description">
          The HR dashboard (employee progress, Needs attention, blocker resolution) is built
          on Day 3. The API endpoint already works - try /api/hr/dashboard directly.
        </p>
      </div>
    </div>
  );
}
