import { createContext, useContext, useState, type ReactNode } from "react";

// This app has no real authentication (intentionally - see DECISIONS.md).
// Instead, this context is the entire "auth system": which role you're
// viewing as, and - when viewing as a New Employee - which of the demo
// employees you're pretending to be. Plain React state is enough here;
// there's no session to persist across page reloads for a demo tool.

export type Role = "employee" | "hr";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  employeeId: number;
  setEmployeeId: (id: number) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("employee");
  const [employeeId, setEmployeeId] = useState<number>(1);

  return (
    <RoleContext.Provider value={{ role, setRole, employeeId, setEmployeeId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used inside a RoleProvider");
  }
  return context;
}
