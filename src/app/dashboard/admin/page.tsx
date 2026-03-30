"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, UserCheck, Upload } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, professors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/professors").then((r) => r.json()),
    ])
      .then(([courses, professors]) => {
        setStats({
          courses: Array.isArray(courses) ? courses.length : 0,
          professors: Array.isArray(professors) ? professors.length : 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "Courses",
      value: stats.courses,
      icon: BookOpen,
      href: "/dashboard/admin/courses",
      description: "Manage courses",
    },
    {
      title: "Professors",
      value: stats.professors,
      icon: UserCheck,
      href: "/dashboard/admin/professors",
      description: "Manage authorized professors",
    },
    {
      title: "Import Data",
      value: null,
      icon: Upload,
      href: "/dashboard/admin/import",
      description: "Import groups & students",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {card.value !== null && !loading && (
                  <div className="text-2xl font-bold">{card.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
