"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EvaluationForm } from "@/components/evaluation-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ExistingEvaluation {
  score: number;
  comment: string | null;
}

export default function EvaluatePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const userId = params.userId as string;
  const groupId = searchParams.get("groupId") || "";
  const name = searchParams.get("name") || "Team Member";
  const isEdit = searchParams.get("edit") === "1";

  const [existing, setExisting] = useState<ExistingEvaluation | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;

    fetch("/api/me/group")
      .then((r) => r.json())
      .then((data) => {
        const member = data.members?.find((m: { id: string }) => m.id === userId);
        if (member?.myEvaluation) {
          setExisting(member.myEvaluation);
        }
      })
      .finally(() => setLoading(false));
  }, [isEdit, userId]);

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center">Loading...</p>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Link href="/dashboard/student">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to group
        </Button>
      </Link>

      <div className="flex items-start gap-3 rounded bg-ie-light/60 border border-ie-blue/20 p-3 text-xs text-ie-deep">
        <ShieldCheck className="h-4 w-4 shrink-0 text-ie-blue mt-0.5" />
        <p>This evaluation is <span className="font-semibold">completely anonymous</span>. Only your professor can see the results.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Evaluation" : "Evaluate Peer"}</CardTitle>
          <CardDescription>
            {isEdit ? `Update your evaluation for ${name}` : `Provide your evaluation for ${name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvaluationForm
            evaluateeId={userId}
            evaluateeName={name}
            groupId={groupId}
            initialScore={existing?.score}
            initialComment={existing?.comment || undefined}
            isEdit={isEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
