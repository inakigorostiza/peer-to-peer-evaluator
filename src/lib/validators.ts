import { z } from "zod";

export const evaluationSchema = z.object({
  evaluateeId: z.string().min(1, "Evaluatee is required"),
  groupId: z.string().min(1, "Group is required"),
  score: z.number().int().min(1, "Score must be at least 1").max(5, "Score must be at most 5"),
  comment: z.string().optional(),
});

export const authorizedProfessorSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(200, "Course name too long"),
});

export const groupsExcelRowSchema = z.object({
  "Group Code": z.string().min(1, "Group Code is required"),
  Title: z.string().min(1, "Title is required"),
});

export const studentsExcelRowSchema = z.object({
  "Group Code": z.string().min(1, "Group Code is required"),
  "User Name": z.string().email("User Name must be a valid email"),
  "First Name": z.string().min(1, "First Name is required"),
  "Last Name": z.string().min(1, "Last Name is required"),
});

export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(200, "Group name too long"),
  externalId: z.string().optional(),
});

export const addStudentSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type EvaluationInput = z.infer<typeof evaluationSchema>;
export type AuthorizedProfessorInput = z.infer<typeof authorizedProfessorSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type GroupsExcelRow = z.infer<typeof groupsExcelRowSchema>;
export type StudentsExcelRow = z.infer<typeof studentsExcelRowSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type AddStudentInput = z.infer<typeof addStudentSchema>;
