import { useEffect, useState } from "react";
import { useRole } from "../context/RoleContext";
import { getPeople } from "../api/people";
import { getEmployee } from "../api/employees";
import type { EmployeeDetail, Person } from "../types";
import { LoadingState, ErrorState } from "../components/StateBlocks";
import { PersonCard } from "../components/PersonCard";

export function People() {
  const { employeeId } = useRole();
  const [people, setPeople] = useState<Person[]>([]);
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getPeople(), getEmployee(employeeId)])
      .then(([peopleData, employeeData]) => {
        setPeople(peopleData);
        setEmployee(employeeData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load people."))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <LoadingState label="Loading people..." />;
  if (error) return <ErrorState message={error} />;

  // Your own manager and buddy matter more than the general directory, so
  // they get pulled out and shown first with a label, instead of being
  // buried alphabetically among IT support and colleagues.
  const myManagerId = employee?.manager?.id;
  const myBuddyId = employee?.buddy?.id;

  const highlighted = people.filter((p) => p.id === myManagerId || p.id === myBuddyId);
  const rest = people.filter((p) => p.id !== myManagerId && p.id !== myBuddyId);

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">People</span>
        <h1 className="page-title">People</h1>
        <p className="page-subtitle">The people worth knowing in your first month.</p>
      </div>

      {highlighted.length > 0 && (
        <div className="card-grid mb-24">
          {highlighted.map((p) => (
            <PersonCard
              key={p.id}
              person={p}
              roleLabel={p.id === myManagerId ? "Your manager" : "Your buddy"}
            />
          ))}
        </div>
      )}

      <h3 className="section-title">Everyone else</h3>
      <div className="card-grid">
        {rest.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </div>
    </div>
  );
}
