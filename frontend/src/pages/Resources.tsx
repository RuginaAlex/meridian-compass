import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { getResources } from "../api/resources";
import type { Resource } from "../types";
import { LoadingState, ErrorState, EmptyState } from "../components/StateBlocks";

export function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResources()
      .then(setResources)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load resources."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading resources..." />;
  if (error) return <ErrorState message={error} />;

  if (resources.length === 0) {
    return (
      <div>
        <div className="page-header">
          <span className="page-eyebrow">Resources</span>
          <h1 className="page-title">Resources</h1>
        </div>
        <EmptyState title="No resources yet" description="Check back soon, or ask HR directly." />
      </div>
    );
  }

  const categories = Array.from(new Set(resources.map((r) => r.category)));

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Resources</span>
        <h1 className="page-title">Resources</h1>
        <p className="page-subtitle">Reference material for whenever you need it.</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="resource-category">
          <div className="resource-category-title">{category}</div>
          <div className="card-grid">
            {resources
              .filter((r) => r.category === category)
              .map((r) => (
                <a
                  key={r.id}
                  className="card resource-card"
                  href={r.link ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="resource-card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {r.title}
                    {r.link && <ExternalLink size={13} color="var(--color-ink-faint)" />}
                  </div>
                  {r.description && <div className="resource-card-description">{r.description}</div>}
                </a>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
