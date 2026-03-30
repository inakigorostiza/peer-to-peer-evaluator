"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface GroupStats {
  id: string;
  externalId: string;
  name: string;
  memberCount: number;
  completedEvaluations: number;
  totalPossibleEvaluations: number;
  completionPercent: number;
}

interface CourseDetail {
  id: string;
  name: string;
  studentCount: number;
  _count: { groups: number };
}

export default function ProfessorCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [groups, setGroups] = useState<GroupStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/courses/${courseId}/groups`).then((r) => r.json()),
    ])
      .then(([courseData, groupsData]) => {
        setCourse(courseData);
        setGroups(groupsData);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center">Loading...</p>;
  }

  if (!course) {
    return <p className="text-muted-foreground py-12 text-center">Course not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/professor/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-muted-foreground">
            {course._count.groups} groups &middot; {course.studentCount} students
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="text-center">Members</TableHead>
                <TableHead className="text-center">Evaluations</TableHead>
                <TableHead className="text-center">Completion</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-center">{group.memberCount}</TableCell>
                  <TableCell className="text-center">
                    {group.completedEvaluations}/{group.totalPossibleEvaluations}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        group.completionPercent === 100
                          ? "success"
                          : group.completionPercent > 0
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {group.completionPercent}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/professor/groups/${group.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
