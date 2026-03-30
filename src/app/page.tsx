import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Star, Shield } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-ie-navy">
        <div className="flex h-14 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-white tracking-wide">
            <GraduationCap className="h-5 w-5" />
            <span className="uppercase text-sm">Peer Evaluator</span>
          </div>
          <div className="ml-auto">
            <Link href="/auth/signin">
              <Button size="sm" className="bg-ie-blue text-white hover:bg-ie-deep">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="bg-ie-navy text-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Peer-to-Peer Evaluation
            </h1>
            <p className="text-lg text-white/80 max-w-prose mx-auto">
              Evaluate your group members, provide constructive feedback, and help
              improve team collaboration. Sign in with your university Google
              account to get started.
            </p>
            <Link href="/auth/signin">
              <Button size="lg" className="mt-4 bg-ie-blue text-white hover:bg-ie-cyan">
                Get Started
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-3 p-6 bg-ie-light/50 rounded">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-ie-blue">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-ie-navy">Group-Based</h3>
              <p className="text-sm text-ie-deep text-center">
                Evaluate peers within your assigned group
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-ie-light/50 rounded">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-ie-blue">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-ie-navy">Fair Scoring</h3>
              <p className="text-sm text-ie-deep text-center">
                1-5 scale with optional written feedback
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-ie-light/50 rounded">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-ie-blue">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-ie-navy">Secure</h3>
              <p className="text-sm text-ie-deep text-center">
                Google SSO with role-based access control
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
