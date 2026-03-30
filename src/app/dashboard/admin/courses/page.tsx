"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, BookOpen, Users } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  createdAt: string;
  _count: { groups: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = () => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then(setCourses)
      .finally(() => setLoading(false));
  };

  useEffect(loadCourses, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create course");
      setCreating(false);
      return;
    }

    setName("");
    setCreating(false);
    setOpen(false);
    loadCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Course</DialogTitle>
              <DialogDescription>
                Enter a name for the new course.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                placeholder="Course name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={creating || !name.trim()} className="w-full">
                {creating ? "Creating..." : "Create Course"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : courses.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No courses yet. Create one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead className="text-center">Groups</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {course._count.groups}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/admin/groups?courseId=${course.id}`}>
                          <Button variant="outline" size="sm">
                            Manage Groups
                          </Button>
                        </Link>
                        <Link href={`/dashboard/professor/courses/${course.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
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
