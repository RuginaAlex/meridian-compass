import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import { Layout } from "./components/Layout";
import { EmployeeDashboard } from "./pages/EmployeeDashboard";
import { OnboardingJourney } from "./pages/OnboardingJourney";
import { People } from "./pages/People";
import { Resources } from "./pages/Resources";
import { HRDashboard } from "./pages/HRDashboard";
import { EmployeeDetails } from "./pages/EmployeeDetails";
import { AddEmployee } from "./pages/AddEmployee";

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/journey" element={<OnboardingJourney />} />
            <Route path="/people" element={<People />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/hr" element={<HRDashboard />} />
            <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
            <Route path="/hr/add-employee" element={<AddEmployee />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
