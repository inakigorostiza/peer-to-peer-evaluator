"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
}

interface GroupDetail {
  id: string;
  name: string;
  externalId: string;
  course: { id: string; name: string };
  members: Member[];
}

export default function AdminGroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Add student form
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadGroup = async () => {
    const res = await fetch(`/api/groups/${groupId}`);
    if (res.ok) {
      setGroup(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return;

    setAdding(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to add student");
      setAdding(false);
      return;
    }

    setEmail("");
    setFirstName("");
    setLastName("");
    setAdding(false);
    setSuccess(`Added ${data.user.firstName} ${data.user.lastName}`);
    loadGroup();
  };

  const handleRemoveStudent = async (userId: string, displayName: string) => {
    if (!confirm(`Remove ${displayName} from this group?`)) return;

    const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSuccess(`Removed ${displayName}`);
      loadGroup();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to remove student");
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!group) {
    return <p className="text-sm text-destructive">Group not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/admin/groups?courseId=${group.course.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm text-muted-foreground">{group.course.name}</p>
        </div>
      </div>

      {/* Add Student Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="firstName" className="sr-only">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="lastName" className="sr-only">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={adding || !email.trim() || !firstName.trim() || !lastName.trim()}
            >
              {adding ? "Adding..." : "Add"}
            </Button>
          </form>

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 mt-2">{success}</p>
          )}
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Members ({group.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {group.members.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No members yet. Add students using the form above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.displayName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          handleRemoveStudent(member.id, member.displayName)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
