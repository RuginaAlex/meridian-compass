import { Mail, Hash } from "lucide-react";
import type { Person } from "../types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PersonCard({ person, roleLabel }: { person: Person; roleLabel?: string }) {
  return (
    <div className="card person-card">
      <div className="person-avatar">{initials(person.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="person-name">{person.name}</div>
        <div className="person-title">
          {person.job_title}
          {person.department ? ` · ${person.department}` : ""}
        </div>
        {roleLabel && (
          <span className="badge badge-in-progress" style={{ marginTop: 6 }}>
            {roleLabel}
          </span>
        )}
        <div className="person-meta">
          <span>
            <Mail size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />
            {person.email}
          </span>
          {person.slack_username && (
            <span>
              <Hash size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />
              {person.slack_username}
            </span>
          )}
        </div>
        {person.ask_me_about && (
          <div className="person-ask-about">
            <strong>Ask me about:</strong> {person.ask_me_about}
          </div>
        )}
      </div>
    </div>
  );
}
