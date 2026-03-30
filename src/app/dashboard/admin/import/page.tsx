"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExcelUpload } from "@/components/excel-upload";
import { Label } from "@/components/ui/label";

interface Course {
  id: string;
  name: string;
}

export default function AdminImportPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center">Loading...</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Import Data</h1>

      <div className="space-y-2">
        <Label>Select Course</Label>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No courses found. Please create a course first.
          </p>
        ) : (
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedCourse && (
        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import Groups</CardTitle>
                <CardDescription>
                  Upload a CSV/Excel file with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">Group Code</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">Title</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExcelUpload
                  endpoint="/api/import/groups"
                  courseId={selectedCourse}
                  label="groups"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import Students</CardTitle>
                <CardDescription>
                  Upload a CSV/Excel file with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">Group Code</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">User Name</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">First Name</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">Last Name</code>
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Groups must be imported first. Students will be assigned to groups based on the Group Code.
                </p>
              </CardHeader>
              <CardContent>
                <ExcelUpload
                  endpoint="/api/import/students"
                  courseId={selectedCourse}
                  label="students"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
