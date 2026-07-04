import { apiGet } from "./client";
import type { Employee, EmployeeDetail } from "../types";

export const getEmployees = () => apiGet<Employee[]>("/employees");

export const getEmployee = (id: number) => apiGet<EmployeeDetail>(`/employees/${id}`);
