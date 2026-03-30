"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

interface GroupData {
  group: { id: string; name: string };
  course: { id: string; name: string };
  members: {
    id: string;
    displayName: string;
    evaluatedByMe: boolean;
  }[];
}

export default function StudentEvaluationsPage() {
  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/group")
      .then(async (res) => {
        if (res.ok) setData(await res.json());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center">Loading...</p>;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No group assigned yet.</p>
      </div>
    );
  }

  const evaluated = data.members.filter((m) => m.evaluatedByMe);
  const pending = data.members.filter((m) => !m.evaluatedByMe);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Evaluations</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completed ({evaluated.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {evaluated.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evaluations submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {evaluated.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1">
                  <span className="text-sm">{m.displayName}</span>
                  <Badge variant="success">Submitted</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pending.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1">
                  <span className="text-sm">{m.displayName}</span>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
