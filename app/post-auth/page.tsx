import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";

export default async function PostAuthPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");
  redirect(getDashboardPathForRole(sessionUser.role));
}

