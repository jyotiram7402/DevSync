import { redirect } from "next/navigation";

/** /dashboard is an alias for the dashboard home. */
export default function DashboardIndexPage() {
  redirect("/dashboard/home");
}
