"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Group {
  id: string;
  externalId: string;
  name: string;
  memberCount: number;
  completionPercent: number;
}

export default function AdminGroupsPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [groups, setGroups] = useState<Group[]>([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    if (!courseId) return;
    setLoading(true);

    const [groupsRes, courseRes] = await Promise.all([
      fetch(`/api/courses/${courseId}/groups`),
      fetch(`/api/courses/${courseId}`),
    ]);

    if (groupsRes.ok) setGroups(await groupsRes.json());
    if (courseRes.ok) {
      const course = await courseRes.json();
      setCourseName(course.name);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
  }, [courseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !courseId) return;

    setCreating(true);
    setError(null);

    const res = await fetch(`/api/courses/${courseId}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        externalId: externalId.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create group");
      setCreating(false);
      return;
    }

    setName("");
    setExternalId("");
    setCreating(false);
    setOpen(false);
    loadGroups();
  };

  if (!courseId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Groups</h1>
        <p className="text-muted-foreground">
          Select a course from the{" "}
          <Link href="/dashboard/admin/courses" className="underline">
            Courses page
          </Link>{" "}
          to manage its groups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          {courseName && (
            <p className="text-sm text-muted-foreground">{courseName}</p>
          )}
        </div>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
                <DialogDescription>
                  Add a new group to this course.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Input
                    placeholder="Group name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <Input
                    placeholder="External ID (optional)"
                    value={externalId}
                    onChange={(e) => setExternalId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to auto-generate
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="w-full"
                >
                  {creating ? "Creating..." : "Create Group"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : groups.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No groups yet. Create one or import from a CSV file.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Evaluations</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {group.externalId}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.memberCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.completionPercent}%
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/groups/${group.id}`}
                      >
                        <Button variant="outline" size="sm">
                          Manage Members
                        </Button>
                      </Link>
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
