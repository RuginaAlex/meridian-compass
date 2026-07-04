import { apiGet } from "./client";
import type { Resource } from "../types";

export const getResources = () => apiGet<Resource[]>("/resources");
