"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, UserCheck } from "lucide-react";

interface AuthorizedProfessor {
  id: string;
  email: string;
  createdAt: string;
  addedBy: { name: string | null; email: string };
}

export default function AdminProfessorsPage() {
  const [professors, setProfessors] = useState<AuthorizedProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfessors = () => {
    fetch("/api/professors")
      .then((r) => r.json())
      .then(setProfessors)
      .finally(() => setLoading(false));
  };

  useEffect(loadProfessors, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setAdding(true);
    setError(null);

    const res = await fetch("/api/professors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add professor");
      setAdding(false);
      return;
    }

    setEmail("");
    setAdding(false);
    loadProfessors();
  };

  const handleDelete = async (emailToDelete: string) => {
    const res = await fetch("/api/professors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToDelete }),
    });

    if (res.ok) {
      loadProfessors();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Authorized Professors</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Professor Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              type="email"
              placeholder="professor@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={adding || !email.trim()} className="gap-1">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Authorized Emails ({professors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : professors.length === 0 ? (
            <div className="text-center py-6">
              <UserCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No professor emails authorized yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professors.map((prof) => (
                  <TableRow key={prof.id}>
                    <TableCell className="font-medium">{prof.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(prof.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(prof.email)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
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
