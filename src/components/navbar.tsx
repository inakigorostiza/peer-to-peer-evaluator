import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 bg-ie-navy">
      <div className="flex h-14 items-center px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white tracking-wide">
          <GraduationCap className="h-5 w-5" />
          <span className="uppercase text-sm">Peer Evaluator</span>
        </Link>
        <div className="ml-auto">
          {session?.user && <UserMenu user={session.user} />}
        </div>
      </div>
    </header>
  );
}
