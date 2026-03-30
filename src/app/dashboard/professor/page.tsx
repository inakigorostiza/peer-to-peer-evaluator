import { redirect } from "next/navigation";

export default function ProfessorDashboard() {
  redirect("/dashboard/professor/courses");
}
