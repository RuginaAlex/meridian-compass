import { apiGet, apiPost } from "./client";
import type { Employee, EmployeeDetail, NewEmployeeInput } from "../types";

export const getEmployees = () => apiGet<Employee[]>("/employees");

export const getEmployee = (id: number) => apiGet<EmployeeDetail>(`/employees/${id}`);

export const createEmployee = (data: NewEmployeeInput) =>
  apiPost<EmployeeDetail>("/employees", data);
