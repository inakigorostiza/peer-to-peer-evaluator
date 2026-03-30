"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  email: string;
  displayName: string;
}

interface GroupDetail {
  id: string;
  name: string;
  course: { id: string; name: string };
  members: Member[];
}

interface EvaluationEntry {
  id: string;
  score: number;
  comment: string | null;
  createdAt: string;
  evaluator: { id: string; displayName: string };
  evaluatee: { id: string; displayName: string };
}

export default function ProfessorGroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${groupId}`).then((r) => r.json()),
      fetch(`/api/groups/${groupId}/evaluations`).then((r) => r.json()),
    ])
      .then(([groupData, evalsData]) => {
        setGroup(groupData);
        setEvaluations(evalsData);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center">Loading...</p>;
  }

  if (!group) {
    return <p className="text-muted-foreground py-12 text-center">Group not found.</p>;
  }

  // Calculate average scores received per member
  const memberScores = new Map<string, { total: number; count: number; name: string }>();
  group.members.forEach((m) => {
    memberScores.set(m.id, { total: 0, count: 0, name: m.displayName });
  });
  evaluations.forEach((e) => {
    const entry = memberScores.get(e.evaluatee.id);
    if (entry) {
      entry.total += e.score;
      entry.count++;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/professor/courses/${group.course.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">{group.course.name}</p>
        </div>
      </div>

      {/* Summary: Average scores per member */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Member Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead className="text-center">Evaluations Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(memberScores.entries()).map(([id, stats]) => (
                <TableRow key={id}>
                  <TableCell className="font-medium">{stats.name}</TableCell>
                  <TableCell className="text-center">
                    {stats.count > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        {(stats.total / stats.count).toFixed(1)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats.count}/{group.members.length - 1}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Individual Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            All Evaluations ({evaluations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evaluations submitted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell>{ev.evaluator.displayName}</TableCell>
                    <TableCell>{ev.evaluatee.displayName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={ev.score >= 4 ? "success" : ev.score >= 3 ? "warning" : "destructive"}>
                        {ev.score}/5
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {ev.comment ? (
                        <span className="text-sm">{ev.comment}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
