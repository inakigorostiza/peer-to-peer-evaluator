"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { evaluationSchema, type EvaluationInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";

interface EvaluationFormProps {
  evaluateeId: string;
  evaluateeName: string;
  groupId: string;
  initialScore?: number;
  initialComment?: string;
  isEdit?: boolean;
}

export function EvaluationForm({
  evaluateeId,
  evaluateeName,
  groupId,
  initialScore,
  initialComment,
  isEdit = false,
}: EvaluationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EvaluationInput>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      evaluateeId,
      groupId,
      score: initialScore,
      comment: initialComment || "",
    },
  });

  const selectedScore = watch("score");

  const onSubmit = async (data: EvaluationInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluations", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 409) {
        setError("You have already evaluated this peer.");
        return;
      }

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Something went wrong.");
        return;
      }

      router.push(`/dashboard/student?success=1`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label className="text-base">
          Score for <span className="font-semibold">{evaluateeName}</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-3">Rate from 1 (poor) to 5 (excellent)</p>
        <RadioGroup
          value={selectedScore?.toString()}
          onValueChange={(val) => setValue("score", parseInt(val), { shouldValidate: true })}
          className="flex gap-4"
        >
          {[1, 2, 3, 4, 5].map((score) => (
            <div key={score} className="flex flex-col items-center gap-1.5">
              <RadioGroupItem value={score.toString()} id={`score-${score}`} />
              <Label htmlFor={`score-${score}`} className="text-sm cursor-pointer">
                {score}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.score && <p className="text-sm text-destructive mt-1">{errors.score.message}</p>}
      </div>

      <div>
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your feedback about this team member..."
          className="mt-1.5"
          rows={4}
          {...register("comment")}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Saving..." : isEdit ? "Update Evaluation" : "Submit Evaluation"}
      </Button>
    </form>
  );
}
