import { request } from "@/lib/http-client"
import type { Dashboard } from "./types"

export const getDashboard = () => request<Dashboard>("/api/v1/dashboard")
