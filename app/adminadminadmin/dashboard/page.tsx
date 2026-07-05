import { redirect } from "next/navigation";
import { fetchAllData, isAdminAuthenticated } from "@/app/actions";
import { DashboardClient } from "./DashboardClient";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const data = await fetchAllData();

  return <DashboardClient data={data} />;
}
