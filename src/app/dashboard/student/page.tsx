"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, CheckCircle2, Clock, Pencil, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface GroupMember {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  evaluatedByMe: boolean;
}

interface GroupData {
  group: { id: string; name: string; externalId: string };
  course: { id: string; name: string };
  members: GroupMember[];
}

export default function StudentDashboard() {
  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "1";

  useEffect(() => {
    fetch("/api/me/group")
      .then(async (res) => {
        if (res.status === 404) {
          setError("You have not been assigned to a group yet. Please contact your administrator.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load group data");
        setData(await res.json());
      })
      .catch(() => setError("Failed to load group data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading your group...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Group Assigned</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const evaluatedCount = data.members.filter((m) => m.evaluatedByMe).length;
  const totalMembers = data.members.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Evaluation submitted successfully!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">{data.group.name}</h1>
        <p className="text-muted-foreground">{data.course.name}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Progress</CardTitle>
            <Badge variant={evaluatedCount === totalMembers ? "success" : "secondary"}>
              {evaluatedCount}/{totalMembers} evaluated
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: totalMembers > 0 ? `${(evaluatedCount / totalMembers) * 100}%` : "0%",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded bg-ie-light/60 border border-ie-blue/20 p-4 text-sm text-ie-deep">
        <ShieldCheck className="h-5 w-5 shrink-0 text-ie-blue mt-0.5" />
        <p>
          <span className="font-semibold">Your evaluations are completely anonymous.</span>{" "}
          Your name will never be shown to the students you evaluate. Only your professor has access to the evaluation results.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Group Members</h2>
        {data.members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar>
                <AvatarFallback>
                  {member.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{member.displayName}</p>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              </div>
              {member.evaluatedByMe ? (
                <Link href={`/dashboard/student/evaluate/${member.id}?groupId=${data.group.id}&name=${encodeURIComponent(member.displayName)}&edit=1`}>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                </Link>
              ) : (
                <Link href={`/dashboard/student/evaluate/${member.id}?groupId=${data.group.id}&name=${encodeURIComponent(member.displayName)}`}>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Evaluate
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
