import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  switch (session.user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "PROFESSOR":
      redirect("/dashboard/professor");
    case "STUDENT":
    default:
      redirect("/dashboard/student");
  }
}
