import { apiGet } from "./client";
import type { Person } from "../types";

export const getPeople = () => apiGet<Person[]>("/people");
